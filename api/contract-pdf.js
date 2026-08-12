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
    const wrap = (t) => doc.fontSize(10.5).width(t, W) ? doc.text(t, { width: W, align: "left" }) : doc.text(t);
    const today = new Date().toLocaleDateString("az-AZ");

    doc.fontSize(16).text("Misterio — Tərəfdaşlıq və Endirim Təminatı Müqaviləsi", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10.5);
    wrap(`Müqavilə nömrəsi: ${rec.id}   ·   Versiya: ${rec.version}   ·   Bağlanma tarixi: ${today}`);
    doc.moveDown(0.5);

    doc.fontSize(12).text("TƏRƏFLƏR");
    doc.fontSize(10.5);
    wrap("1. Misterio platformasının təmsilçisi Kamal Ağayev (Şəxs1): Fiziki şəxsin adı: Kamal Ağayev · VÖEN / şəxsiyyət vəsiqəsi №: 1203626292 · Vəzifəsi: Təsisçi.");
    wrap(`2. Tərəfdaş müəssisə: Müəssisənin adı: ${rec.companyName} · Fəaliyyət kateqoriyası: ${catName(rec.cat)} · Ünvan: ${rec.address || "—"} · Əlaqə: ${rec.phone} / ${rec.email}.`);
    doc.moveDown(0.3);

    doc.fontSize(12).text("1. Müqavilənin predmeti");
    doc.fontSize(10.5);
    wrap("1. Şəxs1 öz rəqəmsal tətbiqi (Misterio) vasitəsilə istifadəçilərə (Müştəri) Tərəfdaşın müəyyən etdiyi endirim faizini təqdim edən elektron kupon kodları təqdim edir.");
    wrap("2. Tərəfdaş bu Müqaviləni imzalamaqla, aşağıdakı 2-ci bənddə göstərilən endirim şərtlərini Şəxs1 vasitəsilə gələn hər bir Müştəriyə tətbiq etməyi öhdəsinə götürür.");
    wrap("3. Bu Müqavilə Tərəfdaşın Şəxs1-in platformasında qeydiyyatının rəsmi təsdiqi hesab olunur və Misterio çarxında (spin) iştirakı üçün əsasdır.");
    doc.moveDown(0.3);

    doc.fontSize(12).text("2. Razılaşdırılmış endirim şərtləri");
    doc.fontSize(10.5);
    wrap(`Təklif edilən endirim faizi (%): ${rec.disc}%. Tərəfdaş bu faizi, Müştəri tərəfindən etibarlı Misterio kupon kodu təqdim edildiyi hər halda heç bir istisna qoymadan tətbiq edir. Endirimin məbləği tamamilə Tərəfdaşın öz hesabına aiddir.`);
    doc.moveDown(0.3);

    doc.fontSize(12).text("3. Tərəfdaşın öhdəlikləri");
    doc.fontSize(10.5);
    wrap("1. Kupon təqdim edən hər Müştəriyə kodun etibarlılığını yoxladıqdan sonra razılaşdırılmış faiz həcmində endirim tətbiq etmək. 2. Kodu əsassız rədd etməmək. 3. Hər sifarişi admin panel vasitəsilə qeydə almaq. 4. Dəyişiklik etməzdən ən azı 7 gün əvvəl yazılı bildirmək.");
    doc.moveDown(0.3);

    doc.fontSize(12).text("4. Öhdəliyin pozulması və məsuliyyət");
    doc.fontSize(10.5);
    wrap("1. Endirimin əsassız tətbiq edilməməsi Müqavilənin pozulması sayılır. 2. Müştəriyə dəyən zərər Tərəfdaşın məsuliyyətindədir. 4. 3 və ya daha çox təsdiqlənmiş pozuntu Şəxs1-ə Tərəfdaşı birtərəfli çıxarmaq hüququ verir.");
    doc.moveDown(0.3);

    doc.fontSize(12).text("5. Müqavilənin qüvvədə olma müddəti və ləğvi");
    doc.fontSize(10.5);
    wrap("1. İmzalandığı tarixdən qüvvəyə minir, müddətsizdir. 2. Hər Tərəf 14 gün əvvəl bildirişlə birtərəfli ləğv edə bilər. 3. Ləğv artıq verilmiş kuponlara təsir etmir.");
    doc.moveDown(0.3);

    doc.fontSize(12).text("6. Digər şərtlər");
    doc.fontSize(10.5);
    wrap("Azərbaycan Respublikası qanunvericiliyinə uyğundur. Mübahisələr danışıqlarla həll olunur, olmasa məhkəməyə göndərilir. 2 əsl nüsxədə, bərabər hüquqludur. Əlavələr yalnız yazılı və hər iki tərəfin imzası ilə qüvvəyə minir.");
    doc.moveDown(0.3);

    doc.fontSize(12).text("7. Tərəflərin imzaları");
    doc.fontSize(10.5);
    wrap(`ŞƏXS1: Kamal Ağayev, Təsisçi — Tarix: ${today}.`);
    wrap(`TƏRƏFDAŞ: ${rec.sign || "________________"} — Tarix: ${today}.`);
    doc.moveDown(0.3);
    wrap(`İmzalanma: ${(new Date(rec.signedAt)).toLocaleString("az-AZ")} · IP: ${rec.ip} · Status: ${rec.status}`);

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
    console.error("contract-pdf:", e.message);
    return L.fail(res, 500, "PDF yaradıla bilmədi");
  }
};
