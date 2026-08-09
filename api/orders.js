/**
 * GET /api/orders — cari şirkət adminin sifarişləri
 */
const L = require("./_lib");

module.exports = async (req, res) => {
  if (!L.only("GET", req, res)) return;
  const c = L.getCompany(req);
  if (!c) return L.fail(res, 401, "Şirkət admini giriş etməyib");
  try {
    const rows = await L.sb(`orders?${L.q({ company_id: `eq.${c.cid}`, order: "created_at.desc", select: "*" })}`);
    return L.ok(res, { orders: rows });
  } catch (e) {
    console.error("orders:", e.message);
    return L.fail(res, 500, "Server xətası");
  }
};
