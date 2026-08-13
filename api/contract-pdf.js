/**
 * POST /api/contract-pdf — Misterio tərəfdaşlıq müqaviləsinin PDF-ni yaradır
 * (serverdə, pdfkit + DejaVuSans ilə Azərbaycan hərfləri)
 * Cavab: { ok:true, pdf:"<base64>" }
 */
const L = require("./_lib");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const FONT = path.join(__dirname, "DejaVuSans.ttf");

function catName(k) {
  const list = { restoran: "Restoran", coffeeshop: "Coffeeshop", kurs: "Kurslar",
    kitab: "Kitab mağazaları", anticafe: "Anticafe", coworking: "Co-working" };
  return list[k] || k;
}

function buildPdf(rec) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    doc.on("error", reject);

    try { doc.registerFont("dejavu", FONT); doc.font("dejavu"); }
    catch (e) { doc.font("Helvetica"); }

    const W = 495;
    const wrap = (t) => { doc.fontSize(10.5); doc.text(t, { width: W, align: "left" }); };
    const head = (t) => { doc.fontSize(12).text(t); doc.fontSize(10.5); };
    const today = new Date().toLocaleDateString("az-AZ");

    doc.fontSize(16).text("Misterio — Tərəfdaşlıq və Endirim Təminatı Müqaviləsi", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10.5);
    wrap(`Bağlanma tarixi: ${today}`);
    doc.moveDown(0.5);

    head("Maddə 1. Tərəflər");
    wrap("1.1. Misterio platformasının təmsilçisi Kamal Ağayev (Şəxs1): Fiziki şəxsin adı: Kamal Ağayev · VÖEN / şəxsiyyət vəsiqəsi №: 1203626292 · Vəzifəsi: Təsisçi.");
    wrap(`1.2. Tərəfdaş müəssisə: Müəssisənin adı: ${rec.companyName} · Fəaliyyət kateqoriyası: ${catName(rec.cat)} · Ünvan: ${rec.address || "—"} · Əlaqə: ${rec.phone} / ${rec.email}.`);
    doc.moveDown(0.3);

    head("Maddə 2. Müqavilənin predmeti");
    wrap("2.1. Şəxs1 öz rəqəmsal tətbiqi (Misterio) vasitəsilə istifadəçilərə (Müştəri) Tərəfdaşın müəyyən etdiyi endirim faizini təqdim edən elektron kupon kodları təqdim edir.");
    wrap("2.2. Tərəfdaş bu Müqaviləni imzalamaqla, aşağıdakı 3-cü Maddədə göstərilən endirim şərtlərini Şəxs1 vasitəsilə gələn hər bir Müştəriyə tətbiq etməyi öhdəsinə götürür.");
    wrap("2.3. Bu Müqavilə Tərəfdaşın Şəxs1-in platformasında qeydiyyatının rəsmi təsdiqi hesab olunur və Misterio çarxında (spin) iştirakı üçün əsasdır.");
    doc.moveDown(0.3);

    head("Maddə 3. Razılaşdırılmış endirim şərtləri");
    wrap(`Təklif edilən endirim faizi (%): ${rec.disc}%. Tərəfdaş bu faizi, Müştəri tərəfindən etibarlı Misterio kupon kodu təqdim edildiyi hər halda heç bir istisna qoymadan tətbiq edir. Endirimin məbləği tamamilə Tərəfdaşın öz hesabına aiddir.`);
    doc.moveDown(0.3);

    head("Maddə 4. Tərəfdaşın öhdəlikləri");
    wrap("4.1. Kupon təqdim edən hər Müştəriyə kodun etibarlılığını yoxladıqdan sonra razılaşdırılmış faiz həcmində endirim tətbiq etmək.");
    wrap("4.2. Kodu əsassız rədd etməmək və ya süni maneələr yaratmamaq.");
    wrap("4.3. Hər sifarişi admin panel vasitəsilə qeydə almaq.");
    wrap("4.4. Dəyişiklik etməzdən ən azı 7 gün əvvəl yazılı bildirmək.");
    doc.moveDown(0.3);

    head("Maddə 5. Öhdəliyin pozulması və məsuliyyət");
    wrap("5.1. Endirimin əsassız tətbiq edilməməsi Müqavilənin pozulması sayılır.");
    wrap("5.2. Müştəriyə dəyən zərər Tərəfdaşın məsuliyyətindədir.");
    wrap("5.3. Şəxs1 birbaşa zərərə görə məsuliyyət daşımır, amma sübutları təqdim edə bilər.");
    wrap("5.4. 3 və ya daha çox təsdiqlənmiş pozuntu Şəxs1-ə Tərəfdaşı birtərəfli çıxarmaq hüququ verir.");
    doc.moveDown(0.3);

    head("Maddə 6. Müqavilənin qüvvədə olma müddəti və ləğvi");
    wrap("6.1. İmzalandığı tarixdən qüvvəyə minir, müddətsizdir.");
    wrap("6.2. Hər Tərəf 14 gün əvvəl bildirişlə birtərəfli ləğv edə bilər.");
    wrap("6.3. Ləğv artıq verilmiş kuponlara təsir etmir.");
    doc.moveDown(0.3);

    head("Maddə 7. Digər şərtlər");
    wrap("7.1. Azərbaycan Respublikası qanunvericiliyinə uyğundur.");
    wrap("7.2. Mübahisələr danışıqlarla həll olunur, olmasa məhkəməyə göndərilir.");
    wrap("7.3. 2 əsl nüsxədə, bərabər hüquqludur.");
    wrap("7.4. Əlavələr yalnız yazılı və hər iki tərəfin imzası ilə qüvvəyə minir.");
    doc.moveDown(0.3);

    head("Maddə 8. Tərəflərin imzaları");
    wrap(`ŞƏXS1: Kamal Ağayev, Təsisçi — Tarix: ${today}.`);
    wrap(`TƏRƏFDAŞ: ${rec.sign || "________________"} — Tarix: ${today}.`);
    doc.moveDown(0.3);
    wrap(`İmzalanma: ${(new Date(rec.signedAt)).toLocaleString("az-AZ")} · Status: ${rec.status}`);

    doc.end();
  });
}

module.exports = async (req, res) => {
  if (!L.only("POST", req, res)) return;
  const b = L.body(req);
  const rec = {
    id: L.clean(b.id, 40),
    version: L.clean(b.version, 20) || "v1.0",
    companyName: L.clean(b.companyName, 80),
    cat: L.clean(b.cat, 40),
    disc: parseInt(b.disc, 10) || 0,
    phone: L.clean(b.phone, 30),
    email: L.clean(b.email, 120),
    address: L.clean(b.address, 160),
    sign: L.clean(b.sign, 80),
    ip: (req.headers["x-forwarded-for"] || "—").split(",")[0].trim(),
    signedAt: b.signedAt ? new Date(b.signedAt).toISOString() : new Date().toISOString(),
    status: "aktiv",
  };
  try {
    const pdf = await buildPdf(rec);
    return L.ok(res, { pdf: "data:application/pdf;base64," + pdf });
  } catch (e) {
    console.error("contract-pdf:", e.message, e.stack);
    return L.fail(res, 500, "PDF xətası: " + e.message);
  }
};
