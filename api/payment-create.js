/**
 * POST /api/payment-create
 * Abunəlik və ya əlavə fırlatma üçün ödəniş yaradır.
 *
 * MVP / DEMO REJİM:
 *   Epoint açarları hələ yoxdur. Bu endpoint REAL ödəniş yaratmır,
 *   amma abunəni serverdə AKTİV edir ki, istifadəçi axını tamamilə işləsin
 *   (redirect loop olmasın). Epoint açarları gələndə bu fayl əvəzlənəcək:
 *   - order yaradılacaq, Epoint-ə yönləndirmə URL-i qaytarılacaq
 *   - /api/payment-callback imza yoxlayıb abunəni aktiv edəcək
 *
 * Təhlükəsizlik: yalnız giriş etmiş, təsdiqlənmiş istifadəçi.
 */
const L = require("./_lib");

module.exports = async (req, res) => {
  if (!L.only("POST", req, res)) return;

  const s = L.getUser(req);
  if (!s) return L.fail(res, 401, "Giriş etməlisiniz");

  if (!await L.rateLimit(req, "payment", 10, 900))
    return L.fail(res, 429, "Çox cəhd. Bir az sonra yoxlayın.");

  const b = L.body(req);
  const mode = b.mode === "extra" ? "extra" : "sub";
  // Ölkəyə görə valyuta (frontend-dən gəlir, təhlükəsizlik üçün yenidən hesablanır)
  const COUNTRY_PRICES = {
    AZ: { sub: 9.90, extra: 4.90, cur: "AZN" },
    DE: { sub: 29.99, extra: 13.99, cur: "EUR" },
    UZ: { sub: 250000, extra: 100000, cur: "UZS" },
  };
  const ccode = (b.country && COUNTRY_PRICES[b.country]) ? b.country : "AZ";
  const cp = COUNTRY_PRICES[ccode];
  const amount = mode === "extra" ? cp.extra : cp.sub;

  try {
    const rows = await L.sb(`users?${L.q({ id: `eq.${s.uid}`, select: "*" })}`);
    const u = rows[0];
    if (!u) return L.fail(res, 401, "İstifadəçi tapılmadı");
    if (!u.verified) return L.fail(res, 403, "Email təsdiqlənməyib");

    if (mode === "sub") {
      // Abunəliyi serverdə aktiv et (demo — Epoint gələnə qədər)
      const expires = new Date(Date.now() + 30 * 86400 * 1000).toISOString();
      const newSub = {
        active: true, plan: "Misterio Aylıq", amount: amount,
        spinsLeft: 3, totalSpins: 0,
        expires, startedAt: new Date().toISOString(),
        method: "demo", currency: cp.cur,
      };
      await L.sb(`users?${L.q({ id: `eq.${u.id}` })}`, {
        method: "PATCH", prefer: "return=minimal",
        body: JSON.stringify({ sub: newSub, updated_at: new Date() }),
      });
      // ödəniş tarixçəsinə demo qeyd
      try {
        await L.sb("orders", {
          method: "POST",
          body: JSON.stringify({
            user_id: u.id, company_id: null, shop: "Misterio Aylıq abunə",
            cat: "abunelik", amount, status: "paid", is_demo: true,
          }),
        });
      } catch {}
      return L.ok(res, { ok: true, mode, demo: true });
    } else {
      // Əlavə fırlatma: +1 spinsLeft
      const sub = u.sub || {};
      const left = Number(sub.spinsLeft || 0) + 1;
      const newSub = { ...sub, spinsLeft: left, active: sub.active || true };
      if (!newSub.expires) newSub.expires = new Date(Date.now() + 30 * 86400 * 1000).toISOString();
      await L.sb(`users?${L.q({ id: `eq.${u.id}` })}`, {
        method: "PATCH", prefer: "return=minimal",
        body: JSON.stringify({ sub: newSub, updated_at: new Date() }),
      });
      try {
        await L.sb("orders", {
          method: "POST",
          body: JSON.stringify({
            user_id: u.id, company_id: null, shop: "Əlavə fırlatma",
            cat: "elave", amount, status: "paid", is_demo: true,
          }),
        });
      } catch {}
      return L.ok(res, { ok: true, mode, demo: true, spinsLeft: left });
    }
  } catch (e) {
    console.error("payment-create:", e.message);
    return L.fail(res, 500, "Server xətası");
  }
};
