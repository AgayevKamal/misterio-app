/**
 * POST /api/spin — çarx fırlatma
 * KRİTİK: qalib SERVERDƏ seçilir. Brauzer yalnız kateqoriya göndərir,
 * nəticəni server qaytarır. Fırlatma haqqı serverdə yoxlanılır və silinir.
 */
const L = require("./_lib");

module.exports = async (req, res) => {
  if (!L.only("POST", req, res)) return;

  const s = L.getUser(req);
  if (!s) return L.fail(res, 401, "Giriş etməlisiniz");

  if (!await L.rateLimit(req, "spin", 30, 3600))
    return L.fail(res, 429, "Çox sayda cəhd. Bir saat sonra yoxlayın.");

  const cat = L.clean(L.body(req).cat, 40);
  if (!cat) return L.fail(res, 400, "Kateqoriya seçilməyib");

  try {
    /* 1 — istifadəçini oxu, abunəliyi və fırlatma haqqını YOXLA */
    const rows = await L.sb(`users?${L.q({ id: `eq.${s.uid}`, select: "*" })}`);
    const u = rows[0];
    if (!u) return L.fail(res, 401, "İstifadəçi tapılmadı");
    if (!u.verified) return L.fail(res, 403, "Email təsdiqlənməyib");

    const sub = u.sub || {};
    if (!sub.active)  return L.fail(res, 402, "Aktiv abunəliyiniz yoxdur");
    if (sub.expires && new Date(sub.expires) < new Date())
      return L.fail(res, 402, "Abunəliyinizin vaxtı bitib");
    const left = Number(sub.spinsLeft || 0);
    if (left <= 0)    return L.fail(res, 402, "Bu ay üçün fırlatma haqqınız bitib");

    /* 2 — kateqoriyanın şirkətlərini bazadan götür (brauzerdən gələnə etibar yox) */
    const shops = await L.sb(`companies?${L.q({
      cat: `eq.${cat}`, active: "eq.true", select: "id,name,disc",
    })}`);
    if (!shops.length) return L.fail(res, 400, "Bu kateqoriyada məkan yoxdur");

    /* 3 — QALİBİ SERVER SEÇİR (kriptoqrafik təsadüf) */
    const win = shops[L.randInt(shops.length)];

    /* 4 — fırlatma haqqını sil (əvvəlcə, ki paralel sorğu sui-istifadə etməsin) */
    const newSub = { ...sub, spinsLeft: left - 1, lastSpin: new Date().toISOString() };
    await L.sb(`users?${L.q({ id: `eq.${u.id}` })}`, {
      method: "PATCH", prefer: "return=minimal",
      body: JSON.stringify({ sub: newSub, updated_at: new Date() }),
    });

    /* 5 — kuponu server yaradır (kod da serverdə) */
    let coupon = null, lastErr = null;
    for (let i = 0; i < 5; i++) {
      const code = `MIST-${L.randCode(5)}-${win.disc}`;
      try {
        const c = await L.sb("coupons", {
          method: "POST",
          body: JSON.stringify({
            user_id: u.id, company_id: win.id, shop: win.name,
            cat, disc: win.disc, code, status: "active",
          }),
        });
        coupon = c[0]; break;
      } catch (e) { lastErr = e; }     // kod təkrarlanıbsa yenidən cəhd
    }
    if (!coupon) {
      // kupon yaradıla bilmədi → fırlatma haqqını geri qaytar
      await L.sb(`users?${L.q({ id: `eq.${u.id}` })}`, {
        method: "PATCH", prefer: "return=minimal",
        body: JSON.stringify({ sub }),
      });
      console.error("spin coupon:", lastErr && lastErr.message);
      return L.fail(res, 500, "Kupon yaradıla bilmədi, fırlatma haqqınız geri qaytarıldı");
    }

    return L.ok(res, {
      coupon: {
        id: coupon.id, shop: coupon.shop, disc: coupon.disc,
        code: coupon.code, cat: coupon.cat,
        created_at: coupon.created_at, expires_at: coupon.expires_at,
      },
      winnerId: win.id,
      spinsLeft: left - 1,
    });
  } catch (e) {
    console.error("spin:", e.message);
    return L.fail(res, 500, "Server xətası");
  }
};
