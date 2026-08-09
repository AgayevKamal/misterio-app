/**
 * GET /api/shops?cat=restoran  — çarx üçün məkan siyahısı
 * Parol və daxili sahələr yoxdur. Yalnız aktiv şirkətlər.
 */
const L = require("./_lib");

module.exports = async (req, res) => {
  if (!L.only("GET", req, res)) return;
  const cat = L.clean((req.query && req.query.cat) || "", 40);
  try {
    const q = cat
      ? L.q({ cat: `eq.${cat}`, active: "eq.true", select: "id,name,disc", order: "name.asc" })
      : L.q({ active: "eq.true", select: "id,name,cat,disc", order: "name.asc" });
    const rows = await L.sb(`companies?${q}`);
    return L.ok(res, { shops: rows });
  } catch (e) {
    console.error("shops:", e.message);
    return L.fail(res, 500, "Server xətası");
  }
};
