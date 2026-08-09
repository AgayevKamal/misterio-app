/**
 * MISTERIO — backend ortaq kitabxana
 * Bütün /api/ funksiyaları bunu istifadə edir.
 * service_role açarı YALNIZ burada, heç vaxt brauzerə düşmür.
 */
const crypto = require("crypto");

const SUPA_URL = process.env.SUPABASE_URL;
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

if (!SUPA_URL || !SERVICE) console.error("⚠️ SUPABASE env yoxdur");

/* ─────────── Supabase REST (service_role) ─────────── */
async function sb(path, opts = {}) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || "return=representation",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.message || data.hint)) || `DB xətası (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.pg = data;
    throw err;
  }
  return data;
}

const q = (o) =>
  Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");

/* ─────────── Parol: PBKDF2-SHA512 (salt + 210k iterasiya) ───────────
   bcrypt üçün əlavə paket lazımdır; PBKDF2 Node-un daxilindədir və
   OWASP-ın tövsiyə etdiyi parametrlərlə eyni dərəcədə güclüdür.      */
const PBKDF2_ITER = 210000;

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(plain, salt, PBKDF2_ITER, 64, "sha512").toString("hex");
  return `pbkdf2$${PBKDF2_ITER}$${salt}$${hash}`;
}

function verifyPassword(plain, stored) {
  if (!stored || !stored.startsWith("pbkdf2$")) return false;
  const [, iterStr, salt, hash] = stored.split("$");
  const calc = crypto.pbkdf2Sync(plain, salt, parseInt(iterStr, 10), 64, "sha512").toString("hex");
  const a = Buffer.from(calc, "hex"), b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ─────────── JWT (HMAC-SHA256, öz implementasiyamız) ─────────── */
const b64u = (buf) =>
  Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const b64uDec = (s) =>
  Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();

function signToken(payload, days = 30) {
  const header = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64u(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + days * 86400,
  }));
  const sig = b64u(crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest());
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || token.split(".").length !== 3) return null;
  const [h, b, s] = token.split(".");
  const expect = b64u(crypto.createHmac("sha256", JWT_SECRET).update(`${h}.${b}`).digest());
  const A = Buffer.from(s), B = Buffer.from(expect);
  if (A.length !== B.length || !crypto.timingSafeEqual(A, B)) return null;
  try {
    const p = JSON.parse(b64uDec(b));
    if (p.exp && p.exp < Math.floor(Date.now() / 1000)) return null;
    return p;
  } catch { return null; }
}

/* ─────────── Cookie ─────────── */
function setAuthCookie(res, token, name = "mist_session") {
  res.setHeader("Set-Cookie",
    `${name}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 86400}`);
}
function clearAuthCookie(res, name = "mist_session") {
  res.setHeader("Set-Cookie", `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}
function readCookie(req, name) {
  const raw = req.headers.cookie || "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? m[1] : null;
}

/* ─────────── Sessiya oxu ─────────── */
function getUser(req) {
  const t = readCookie(req, "mist_session");
  const p = verifyToken(t);
  return p && p.uid ? p : null;
}
function getCompany(req) {
  const t = readCookie(req, "mist_admin");
  const p = verifyToken(t);
  return p && p.cid ? p : null;
}

/* ─────────── Rate limit (DB-də, IP + əməliyyat üzrə) ─────────── */
async function rateLimit(req, action, max = 10, windowSec = 300) {
  const ip = (req.headers["x-forwarded-for"] || "0.0.0.0").split(",")[0].trim();
  const key = `${action}:${ip}`;
  const now = new Date();
  try {
    const rows = await sb(`rate_limit?${q({ key: `eq.${key}`, select: "*" })}`);
    const row = rows && rows[0];
    if (!row) {
      await sb("rate_limit", { method: "POST", body: JSON.stringify({ key, hits: 1, window_start: now }) });
      return true;
    }
    const started = new Date(row.window_start);
    if ((now - started) / 1000 > windowSec) {
      await sb(`rate_limit?${q({ key: `eq.${key}` })}`, {
        method: "PATCH", body: JSON.stringify({ hits: 1, window_start: now }) });
      return true;
    }
    if (row.hits >= max) return false;
    await sb(`rate_limit?${q({ key: `eq.${key}` })}`, {
      method: "PATCH", body: JSON.stringify({ hits: row.hits + 1 }) });
    return true;
  } catch { return true; }   // limit sistemi sınsa, xidmət dayanmasın
}

/* ─────────── Yardımçılar ─────────── */
function json(res, status, obj) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.status(status).end(JSON.stringify(obj));
}
const ok   = (res, obj = {}) => json(res, 200, { ok: true, ...obj });
const fail = (res, status, msg) => json(res, status, { ok: false, error: msg });

function only(method, req, res) {
  if (req.method !== method) { fail(res, 405, "Metod dəstəklənmir"); return false; }
  return true;
}

function body(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return {}; } }
  return req.body;
}

/* təmizləmə */
const clean = (s, max = 200) => String(s ?? "").trim().slice(0, max);
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e);

/* təhlükəsiz təsadüfi kod */
function randCode(len = 5) {
  const AB = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(len);
  return Array.from(bytes).map((b) => AB[b % AB.length]).join("");
}
const randInt = (n) => crypto.randomInt(0, n);

module.exports = {
  sb, q, hashPassword, verifyPassword, signToken, verifyToken,
  setAuthCookie, clearAuthCookie, readCookie, getUser, getCompany,
  rateLimit, json, ok, fail, only, body, clean, isEmail, randCode, randInt,
};
