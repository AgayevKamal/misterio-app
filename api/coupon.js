/**
 * /api/coupon  — POST: kuponu istifadə et (kassada)
 * /api/coupon?peek=CODE — GET: yalnız oxuma (admin paneli üçün)
 */
const L = require("./_lib");

module.exports = async (req, res) => {
  // ── GET: peek ──
  if (req.method === "GET") {
    const c = L.getCompany(req);
    if (!c) return L.fail(res, 401, "Şirkət admini giriş etməyib");
    const code = L.clean((req.query && req.query.peek) || "", 20).toUpperCase();
    if (!code) return L.ok(res, { coupon: null });
    try {
      const rows = await L.sb(`coupons?${L.q({ code: `eq.${code}`, select: "*" })}`);
      const cp = rows[0];
      if (!cp || cp.status !== "active" || new Date(cp.expires_at) < new Date())
        return L.ok(res, { coupon: null });
      if (cp.company_id !== c.cid)
        return L.ok(res, { coupon: null });
      return L.ok(res, { coupon: { id: cp.id, code: cp.code, shop: cp.shop, cat: cp.cat, disc: cp.disc } });
    } catch (e) {
      console.error("coupon peek:", e.message);
      return L.fail(res, 500, "Server xətası");
    }
  }

  // ── POST: istifadə et ──
  if (!L.only("POST", req, res)) return;
  const c = L.getCompany(req);
  if (!c) return L.fail(res, 401, "Şirkət admini giriş etməyib");

  if (!await L.rateLimit(req, "coupon_use", 60, 3600))
    return L.fail(res, 429, "Çox cəhd");

  const code = L.clean(L.body(req).code, 20).toUpperCase();
  if (!code) return L.fail(res, 400, "Kod daxil edilməyib");

  try {
    const rows = await L.sb(`coupons?${L.q({ code: `eq.${code}`, select: "*" })}`);
    const cp = rows[0];
    if (!cp) return L.fail(res, 404, "Kupon tapılmadı");
    if (cp.status !== "active") return L.fail(res, 400, "Kupon artıq istifadə olunub");
    if (new Date(cp.expires_at) < new Date()) return L.fail(res, 400, "Kuponun vaxtı bitib");
    if (cp.company_id !== c.cid) return L.fail(res, 403, "Bu kupon sizin məkan üçün deyil");

    await L.sb(`coupons?${L.q({ id: `eq.${cp.id}` })}`, {
      method: "PATCH", prefer: "return=minimal",
      body: JSON.stringify({ status: "used", used_at: new Date() }),
    });
    await L.sb("orders", {
      method: "POST",
      body: JSON.stringify({
        company_id: cp.company_id, coupon_id: cp.id, code: cp.code,
        total: 0, disc: cp.disc, final: 0,
      }),
    });
    return L.ok(res, { shop: cp.shop, disc: cp.disc, used: true });
  } catch (e) {
    if (e.pg && /bərpa oluna bilməz/.test(e.pg.message || ""))
      return L.fail(res, 400, "Kupon artıq istifadə olunub");
    console.error("coupon:", e.message);
    return L.fail(res, 500, "Server xətası");
  }
};
