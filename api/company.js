/**
 * POST /api/company — şirkət admin girişi və qeydiyyatı
 * Şirkət əlavə etmə (add-company) bəzi sahələri API-yə ötürür.
 * Admin daxil olduqda `mist_admin` HttpOnly cookie verilir.
 */
const L = require("./_lib");

module.exports = async (req, res) => {
  if (!L.only("POST", req, res)) return;
  const b = L.body(req);
  const action = L.clean(b.action, 24);

  try {
    if (action === "login")   return await companyLogin(req, res, b);
    if (action === "register")return await companyRegister(req, res, b);
    if (action === "me")      return await companyMe(req, res);
    if (action === "logout")  { L.clearAuthCookie(res, "mist_admin"); return L.ok(res); }
    return L.fail(res, 400, "Naməlum əməliyyat");
  } catch (e) {
    console.error("company:", e.message);
    return L.fail(res, 500, "Server xətası");
  }
};

async function companyLogin(req, res, b) {
  if (!await L.rateLimit(req, "company_login", 10, 900))
    return L.fail(res, 429, "Çox cəhd. 15 dəqiqə sonra yoxlayın.");

  const email = L.clean(b.email, 120).toLowerCase();
  const pass  = String(b.password || "");
  const rows = await L.sb(`companies?${L.q({ email: `eq.${email}`, select: "*" })}`);
  const co = rows[0];

  if (!co || !co.active)
    return L.fail(res, 401, "Email və ya şifrə yanlışdır");

  if (co.locked_until && new Date(co.locked_until) > new Date())
    return L.fail(res, 423, "Hesab müvəqqəti bloklanıb");

  if (!L.verifyPassword(pass, co.pass_hash)) {
    const f = (co.failed_logins || 0) + 1;
    const patch = { failed_logins: f };
    if (f >= 5) { patch.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString(); patch.failed_logins = 0; }
    await L.sb(`companies?${L.q({ id: `eq.${co.id}` })}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify(patch) });
    return L.fail(res, 401, "Email və ya şifrə yanlışdır");
  }
  if (co.failed_logins)
    await L.sb(`companies?${L.q({ id: `eq.${co.id}` })}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ failed_logins: 0, locked_until: null }) });

  L.setAuthCookie(res, L.signToken({ cid: co.id, email: co.email }), "mist_admin");
  return L.ok(res, { company: pubCompany(co) });
}

async function companyRegister(req, res, b) {
  if (!await L.rateLimit(req, "company_register", 5, 3600))
    return L.fail(res, 429, "Çox cəhd. 1 saat sonra yoxlayın.");

  const name  = L.clean(b.name, 80);
  const email = L.clean(b.email, 120).toLowerCase();
  const cat   = L.clean(b.cat, 40);
  const pass  = String(b.password || "");
  const disc  = parseInt(b.disc, 10);
  const phone = L.clean(b.phone, 30);
  const address = L.clean(b.address, 160);

  if (name.length < 2)       return L.fail(res, 400, "Məkan adı qeyd edilməyib");
  if (!L.isEmail(email))      return L.fail(res, 400, "Email düzgün deyil");
  if (!/^[a-z_]+$/i.test(cat)) return L.fail(res, 400, "Kateqoriya etibarsızdır");
  if (pass.length < 8)       return L.fail(res, 400, "Şifrə ən azı 8 simvol olmalıdır");
  if (!Number.isInteger(disc) || disc < 1 || disc > 90)
    return L.fail(res, 400, "Endirim 1-90 arasında olmalıdır");

  const exists = await L.sb(`companies?${L.q({ email: `eq.${email}`, select: "id" })}`);
  if (exists.length) return L.fail(res, 409, "Bu email artıq qeydiyyatdadır");

  const created = await L.sb("companies", {
    method: "POST",
    body: JSON.stringify({
      name, email, cat, pass_hash: L.hashPassword(pass),
      disc, phone, address, active: true,
    }),
  });
  const co = created[0];
  L.setAuthCookie(res, L.signToken({ cid: co.id, email: co.email }), "mist_admin");
  return L.ok(res, { company: pubCompany(co) });
}

async function companyMe(req, res) {
  const c = L.getCompany(req);
  if (!c) return L.ok(res, { company: null });
  const rows = await L.sb(`companies?${L.q({ id: `eq.${c.cid}`, select: "*" })}`);
  if (!rows.length) { L.clearAuthCookie(res, "mist_admin"); return L.ok(res, { company: null }); }
  return L.ok(res, { company: pubCompany(rows[0]) });
}

function pubCompany(co) {
  return {
    id: co.id, name: co.name, email: co.email, cat: co.cat,
    disc: co.disc, phone: co.phone, address: co.address,
    active: co.active, created_at: co.created_at,
  };
}
