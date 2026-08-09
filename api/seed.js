/**
 * GET /api/seed — yalnız bir dəfə: demo şirkətləri yaradır.
 * İlkin qurulum üçündür (parollara bcrypt tətbiq edilir).
 * Təkrar çağırıldıqda mövcudları yenidən yaratmır.
 */
const L = require("./_lib");

const DEMO = [
  { name: "Loft 21",        email: "info@misterio.az",  cat: "restoran",  disc: 20, pw: "misterio1104" },
  { name: "Chinar",         email: "dolma@restoran.az", cat: "restoran",  disc: 15, pw: "dolma1104" },
  { name: "Brew & Co",      email: "brew@coffee.az",    cat: "coffeeshop",disc: 18, pw: "brew1104" },
  { name: "Kafe 145",       email: "kafe@coffee.az",    cat: "coffeeshop",disc: 12, pw: "kafe1104" },
  { name: "Smart Academy",  email: "info@kurs.az",      cat: "kurs",      disc: 25, pw: "kurs1104" },
  { name: "Kitab Evi",      email: "kitab@book.az",     cat: "kitab",     disc: 10, pw: "kitab1104" },
];

module.exports = async (req, res) => {
  if (!L.only("POST", req, res)) return;
  // sadə mühafizə: secret sorğu parametri (məs: /api/seed?key=...)
  const key = req.query && req.query.key;
  if (key !== process.env.SEED_KEY) return L.fail(res, 403, "icazə yoxdur");

  try {
    const created = [];
    for (const d of DEMO) {
      const exists = await L.sb(`companies?${L.q({ email: `eq.${d.email}`, select: "id" })}`);
      if (exists.length) { created.push({ email: d.email, status: "mövcud" }); continue; }
      const r = await L.sb("companies", {
        method: "POST",
        body: JSON.stringify({
          name: d.name, email: d.email, cat: d.cat, disc: d.disc,
          pass_hash: L.hashPassword(d.pw), phone: "", address: "", active: true,
        }),
      });
      created.push({ email: d.email, id: r[0].id, status: "yaradıldı" });
    }
    return L.ok(res, { created });
  } catch (e) {
    console.error("seed:", e.message);
    return L.fail(res, 500, "Seed xətası: " + e.message);
  }
};
