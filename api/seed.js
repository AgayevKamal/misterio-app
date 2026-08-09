/**
 * GET /api/seed — yalnız bir dəfə: demo şirkətləri yaradır.
 * İlkin qurulum üçündür (parollara bcrypt tətbiq edilir).
 * Hər kateqoriyada 6 şirkət — çarx dolu və gözəl görünsün deyə.
 * Təkrar çağırıldıqda mövcudları yenidən yaratmır.
 */
const L = require("./_lib");

const DEMO = [
  // RESTORAN (6)
  { name: "Loft 21",        email: "info@misterio.az",   cat: "restoran",  disc: 20, pw: "misterio1104" },
  { name: "Chinar",         email: "dolma@restoran.az",  cat: "restoran",  disc: 15, pw: "dolma1104" },
  { name: "Şirvanşah",      email: "sirvansah@restoran.az", cat: "restoran", disc: 25, pw: "sirvan1104" },
  { name: "Nar & Bar",      email: "nar@restoran.az",    cat: "restoran",  disc: 18, pw: "nar1104" },
  { name: "Zeytun",         email: "zeytun@restoran.az", cat: "restoran",  disc: 12, pw: "zeytun1104" },
  { name: "Dolma House",    email: "dolmahouse@restoran.az", cat: "restoran", disc: 30, pw: "dolmahouse1104" },

  // COFFEESHOP (6)
  { name: "Brew & Co",      email: "brew@coffee.az",     cat: "coffeeshop",disc: 18, pw: "brew1104" },
  { name: "Kafe 145",       email: "kafe@coffee.az",     cat: "coffeeshop",disc: 12, pw: "kafe1104" },
  { name: "Coffee Moffie",  email: "moffie@coffee.az",   cat: "coffeeshop",disc: 15, pw: "moffie1104" },
  { name: "Espresso Lab",   email: "espresso@coffee.az", cat: "coffeeshop",disc: 22, pw: "espresso1104" },
  { name: "Bean Street",    email: "bean@coffee.az",     cat: "coffeeshop",disc: 10, pw: "bean1104" },
  { name: "Latte Land",     email: "latte@coffee.az",    cat: "coffeeshop",disc: 25, pw: "latte1104" },

  // KURS (6)
  { name: "Smart Academy",  email: "info@kurs.az",       cat: "kurs",      disc: 25, pw: "kurs1104" },
  { name: "Code Academy",   email: "code@kurs.az",       cat: "kurs",      disc: 20, pw: "code1104" },
  { name: "Lingua Pro",     email: "lingua@kurs.az",     cat: "kurs",      disc: 15, pw: "lingua1104" },
  { name: "Design Lab",     email: "design@kurs.az",     cat: "kurs",      disc: 30, pw: "design1104" },
  { name: "IELTS Center",   email: "ielts@kurs.az",      cat: "kurs",      disc: 18, pw: "ielts1104" },
  { name: "Robotech",       email: "robo@kurs.az",       cat: "kurs",      disc: 22, pw: "robo1104" },

  // KITAB (6)
  { name: "Kitab Evi",      email: "kitab@book.az",      cat: "kitab",     disc: 10, pw: "kitab1104" },
  { name: "Libraff",        email: "libraff@book.az",    cat: "kitab",     disc: 15, pw: "libraff1104" },
  { name: "Ali & Nino",     email: "alinino@book.az",    cat: "kitab",     disc: 20, pw: "alinino1104" },
  { name: "Akademkitab",    email: "akadem@book.az",    cat: "kitab",     disc: 12, pw: "akadem1104" },
  { name: "Qanun Nəşr",     email: "qanun@book.az",     cat: "kitab",     disc: 25, pw: "qanun1104" },
  { name: "Book Point",     email: "bookpoint@book.az",  cat: "kitab",     disc: 18, pw: "bookpoint1104" },

  // ANTICAFE (6)
  { name: "Time Out",       email: "timeout@anticafe.az",cat: "anticafe",  disc: 20, pw: "timeout1104" },
  { name: "Cube Anticafe",  email: "cube@anticafe.az",   cat: "anticafe",  disc: 15, pw: "cube1104" },
  { name: "Play Room",      email: "play@anticafe.az",   cat: "anticafe",  disc: 10, pw: "play1104" },
  { name: "Chill Zone",     email: "chill@anticafe.az",  cat: "anticafe",  disc: 35, pw: "chill1104" },
  { name: "Board Bay",      email: "board@anticafe.az",  cat: "anticafe",  disc: 18, pw: "board1104" },
  { name: "Loft Games",     email: "loftgames@anticafe.az", cat: "anticafe", disc: 22, pw: "loftgames1104" },

  // COWORKING (6)
  { name: "Innoland",       email: "innoland@cowork.az", cat: "coworking", disc: 20, pw: "innoland1104" },
  { name: "The Space",      email: "space@cowork.az",    cat: "coworking", disc: 15, pw: "space1104" },
  { name: "Hub Baku",       email: "hub@cowork.az",      cat: "coworking", disc: 25, pw: "hub1104" },
  { name: "Nest Co",        email: "nest@cowork.az",     cat: "coworking", disc: 12, pw: "nest1104" },
  { name: "Focus Point",    email: "focus@cowork.az",    cat: "coworking", disc: 30, pw: "focus1104" },
  { name: "Desk&Co",        email: "desk@cowork.az",     cat: "coworking", disc: 10, pw: "desk1104" },
];

module.exports = async (req, res) => {
  if (!L.only("POST", req, res)) return;
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
    return L.ok(res, { created, total: created.length });
  } catch (e) {
    console.error("seed:", e.message);
    return L.fail(res, 500, "Seed xətası: " + e.message);
  }
};
