/** POST /api/auth — qeydiyyat, doğrulama, giriş, çıxış, sessiya */
const L = require("./_lib");

module.exports = async (req, res) => {
  if (!L.only("POST", req, res)) return;
  const b = L.body(req);
  const action = L.clean(b.action, 24);

  try {
    switch (action) {
      case "register":  return await register(req, res, b);
      case "verify":    return await verify(req, res, b);
      case "login":     return await login(req, res, b);
      case "logout":    L.clearAuthCookie(res); return L.ok(res);
      case "me":        return await me(req, res);
      case "resend":    return await resend(req, res, b);
      default:          return L.fail(res, 400, "Naməlum əməliyyat");
    }
  } catch (e) {
    console.error("auth:", e.message);
    return L.fail(res, 500, "Server xətası baş verdi");
  }
};

/* ───────── qeydiyyat ───────── */
async function register(req, res, b) {
  if (!await L.rateLimit(req, "register", 5, 3600))
    return L.fail(res, 429, "Çox cəhd. 1 saat sonra yenidən yoxlayın.");

  const name  = L.clean(b.name, 80);
  const email = L.clean(b.email, 120).toLowerCase();
  const phone = L.clean(b.phone, 30);
  const city  = L.clean(b.city, 60);
  const pass  = String(b.password || "");

  if (name.length < 2)         return L.fail(res, 400, "Ad ən azı 2 hərf olmalıdır");
  if (!L.isEmail(email))       return L.fail(res, 400, "Email düzgün deyil");
  if (pass.length < 8)         return L.fail(res, 400, "Şifrə ən azı 8 simvol olmalıdır");
  if (!/[A-Za-zƏÜÖĞŞÇI]/.test(pass) || !/[0-9]/.test(pass))
    return L.fail(res, 400, "Şifrədə ən azı bir hərf və bir rəqəm olmalıdır");

  const exists = await L.sb(`users?${L.q({ email: `eq.${email}`, select: "id" })}`);
  if (exists.length) return L.fail(res, 409, "Bu email artıq qeydiyyatdadır");

  const code = String(L.randInt(900000) + 100000);
  const rows = await L.sb("users", {
    method: "POST",
    body: JSON.stringify({
      name, email, phone, city,
      pass_hash: L.hashPassword(pass),
      verified: false,
      verify_code: code,
      verify_expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      sub: {}, payments: [],
    }),
  });
  const u = rows[0];
  // MVP: kod cavabda qaytarılır (email xidməti qoşulanda silinəcək)
  return L.ok(res, { userId: u.id, email, demoCode: code });
}

/* ───────── email doğrulama ───────── */
async function verify(req, res, b) {
  if (!await L.rateLimit(req, "verify", 10, 900))
    return L.fail(res, 429, "Çox cəhd. Bir az sonra yoxlayın.");

  const email = L.clean(b.email, 120).toLowerCase();
  const code  = L.clean(b.code, 8);
  const rows = await L.sb(`users?${L.q({ email: `eq.${email}`, select: "*" })}`);
  const u = rows[0];
  if (!u) return L.fail(res, 404, "İstifadəçi tapılmadı");
  if (u.verified) { issue(res, u); return L.ok(res, { user: await pub(u) }); }
  if (u.verify_code && u.verify_code !== code)
    return L.fail(res, 400, "Kod yanlışdır");
  if (u.verify_expires && new Date(u.verify_expires) < new Date())
    return L.fail(res, 400, "Kodun vaxtı bitib. Yenisini istəyin.");

  // Abunəlik yalnız ödənişdən (Epoint callback) aktivləşir.
  // Trial/məqsədli aktivləşdirmə YOXDUR — 0-dan heç kim abunə olmur.
  const upd = await L.sb(`users?${L.q({ id: `eq.${u.id}` })}`, {
    method: "PATCH",
    body: JSON.stringify({ verified: true, verify_code: null, verify_expires: null, updated_at: new Date() }),
  });
  issue(res, upd[0]);
  return L.ok(res, { user: await pub(upd[0]) });
}

/* ───────── kodu yenidən göndər ───────── */
async function resend(req, res, b) {
  if (!await L.rateLimit(req, "resend", 3, 900))
    return L.fail(res, 429, "Çox cəhd. 15 dəqiqə sonra yoxlayın.");
  const email = L.clean(b.email, 120).toLowerCase();
  const rows = await L.sb(`users?${L.q({ email: `eq.${email}`, select: "id,verified" })}`);
  const u = rows[0];
  if (!u || u.verified) return L.ok(res, {});      // məlumat sızdırma
  const code = String(L.randInt(900000) + 100000);
  await L.sb(`users?${L.q({ id: `eq.${u.id}` })}`, {
    method: "PATCH", prefer: "return=minimal",
    body: JSON.stringify({ verify_code: code, verify_expires: new Date(Date.now() + 15 * 60 * 1000).toISOString() }),
  });
  return L.ok(res, { demoCode: code });
}

/* ───────── giriş ───────── */
async function login(req, res, b) {
  if (!await L.rateLimit(req, "login", 10, 900))
    return L.fail(res, 429, "Çox cəhd. 15 dəqiqə sonra yenidən yoxlayın.");

  const email = L.clean(b.email, 120).toLowerCase();
  const pass  = String(b.password || "");
  const rows = await L.sb(`users?${L.q({ email: `eq.${email}`, select: "*" })}`);
  const u = rows[0];

  // vaxt hücumuna qarşı: istifadəçi yoxdursa da hash hesabla
  if (!u) { L.verifyPassword(pass, "pbkdf2$210000$00$00"); return L.fail(res, 401, "Email və ya şifrə yanlışdır"); }

  if (u.locked_until && new Date(u.locked_until) > new Date())
    return L.fail(res, 423, "Hesab müvəqqəti bloklanıb. 15 dəqiqə sonra yoxlayın.");

  if (!L.verifyPassword(pass, u.pass_hash)) {
    const fails = (u.failed_logins || 0) + 1;
    const patch = { failed_logins: fails };
    if (fails >= 5) { patch.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString(); patch.failed_logins = 0; }
    await L.sb(`users?${L.q({ id: `eq.${u.id}` })}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify(patch) });
    return L.fail(res, 401, "Email və ya şifrə yanlışdır");
  }

  if (u.failed_logins) {
    await L.sb(`users?${L.q({ id: `eq.${u.id}` })}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ failed_logins: 0, locked_until: null }) });
  }
  if (!u.verified) return L.fail(res, 403, "Email təsdiqlənməyib");

  issue(res, u);
  return L.ok(res, { user: await pub(u) });
}

/* ───────── cari sessiya ───────── */
async function me(req, res) {
  const s = L.getUser(req);
  if (!s) return L.ok(res, { user: null });
  const rows = await L.sb(`users?${L.q({ id: `eq.${s.uid}`, select: "*" })}`);
  if (!rows.length) { L.clearAuthCookie(res); return L.ok(res, { user: null }); }
  return L.ok(res, { user: await pub(rows[0]) });
}

/* ───────── köməkçilər ───────── */
function issue(res, u) {
  L.setAuthCookie(res, L.signToken({ uid: u.id, email: u.email }));
}
/** brauzerə göndərilən təhlükəsiz sahələr — pass_hash HEÇ VAXT */
async function pub(u) {
  let coupons = [];
  try {
    coupons = await L.sb(`coupons?${L.q({ user_id: `eq.${u.id}`, status: `eq.active`, order: "created_at.desc", select: "id,shop,cat,disc,code,created_at,expires_at" })}`);
  } catch { coupons = []; }
  return {
    id: u.id, name: u.name, email: u.email, phone: u.phone, city: u.city,
    verified: u.verified, sub: u.sub || {}, payments: u.payments || [],
    coupons, created_at: u.created_at,
  };
}
