/* MISTERIO — Dil seçicisi (i18n)
 * AZ / DE / UZ / EN dəstəklənir.
 * Region/ölkə anlayışı yoxdur — sadəcə dil.
 */
(function () {
  "use strict";

  // Dil siyahısı (bayraq + ad)
  const LANGS = {
    az: { code: "az", flag: "🇦🇿", name: "Azərbaycan" },
    de: { code: "de", flag: "🇩🇪", name: "Deutsch" },
    uz: { code: "uz", flag: "🇺🇿", name: "O'zbek" },
    en: { code: "en", flag: "🇬🇧", name: "English" },
  };

  // ───────── Tərcümələr ─────────
  const T = {
    az: {
      "app.name": "Misterio",
      "nav.home": "Ana səhifə", "nav.spin": "Çarx", "nav.pricing": "Qiymətlər",
      "nav.profile": "Profil", "nav.addCompany": "Şirkət əlavə et",
      "nav.login": "Daxil ol", "nav.logout": "Çıxış",
      "hero.cta": "İndi başla", "hero.cta2": "Çarxı fırlat",
      "spin.title": "Çarxı fırlat", "spin.btn": "🔮 Çarxı fırlat",
      "spin.cat": "Kateqoriya seç",
      "pricing.title": "Qiymətlər", "pricing.perMonth": "/ay",
      "pricing.subscribe": "Abunə ol", "pricing.extra": "Əlavə fırlatma",
      "pricing.buy": "Al",
      "profile.title": "Profil", "profile.sub": "Abunəlik",
      "profile.active": "Aktiv", "profile.inactive": "Deaktiv",
      "profile.coupons": "Kuponların", "profile.noCoupons": "Hələ kupon yoxdur",
      "auth.login": "Daxil ol", "auth.signup": "Qeydiyyatdan keç",
      "auth.email": "Email", "auth.password": "Şifrə", "auth.name": "Ad",
      "auth.verify": "Email təsdiqi",
      "addCompany.title": "Şirkətini çarxa əlavə et",
      "lang.label": "Dil",
    },
    de: {
      "app.name": "Misterio",
      "nav.home": "Startseite", "nav.spin": "Rad", "nav.pricing": "Preise",
      "nav.profile": "Profil", "nav.addCompany": "Unternehmen hinzufügen",
      "nav.login": "Anmelden", "nav.logout": "Abmelden",
      "hero.cta": "Jetzt starten", "hero.cta2": "Rad drehen",
      "spin.title": "Dreh das Rad", "spin.btn": "🔮 Rad drehen",
      "spin.cat": "Kategorie wählen",
      "pricing.title": "Preise", "pricing.perMonth": "/Monat",
      "pricing.subscribe": "Abonnieren", "pricing.extra": "Zusätzlicher Dreh",
      "pricing.buy": "Kaufen",
      "profile.title": "Profil", "profile.sub": "Abonnement",
      "profile.active": "Aktiv", "profile.inactive": "Inaktiv",
      "profile.coupons": "Deine Gutscheine", "profile.noCoupons": "Noch keine Gutscheine",
      "auth.login": "Anmelden", "auth.signup": "Registrieren",
      "auth.email": "E-Mail", "auth.password": "Passwort", "auth.name": "Name",
      "auth.verify": "E-Mail bestätigen",
      "addCompany.title": "Füge dein Unternehmen zum Rad hinzu",
      "lang.label": "Sprache",
    },
    uz: {
      "app.name": "Misterio",
      "nav.home": "Bosh sahifa", "nav.spin": "G'ildirak", "nav.pricing": "Narxlar",
      "nav.profile": "Profil", "nav.addCompany": "Kompaniya qo'shish",
      "nav.login": "Kirish", "nav.logout": "Chiqish",
      "hero.cta": "Hozir boshlash", "hero.cta2": "G'ildirakni aylantir",
      "spin.title": "G'ildirakni aylantir", "spin.btn": "🔮 G'ildirakni aylantir",
      "spin.cat": "Kategoriya tanlash",
      "pricing.title": "Narxlar", "pricing.perMonth": "/oy",
      "pricing.subscribe": "Obuna bo'lish", "pricing.extra": "Qo'shimcha aylanish",
      "pricing.buy": "Sotib olish",
      "profile.title": "Profil", "profile.sub": "Obuna",
      "profile.active": "Faol", "profile.inactive": "Faol emas",
      "profile.coupons": "Sizning kuponlaringiz", "profile.noCoupons": "Hali kupon yo'q",
      "auth.login": "Kirish", "auth.signup": "Ro'yxatdan o'tish",
      "auth.email": "Email", "auth.password": "Parol", "auth.name": "Ism",
      "auth.verify": "Email tasdiqlash",
      "addCompany.title": "Kompaniyangizni g'ildirakka qo'shing",
      "lang.label": "Til",
    },
    en: {
      "app.name": "Misterio",
      "nav.home": "Home", "nav.spin": "Wheel", "nav.pricing": "Pricing",
      "nav.profile": "Profile", "nav.addCompany": "Add company",
      "nav.login": "Log in", "nav.logout": "Log out",
      "hero.cta": "Get started", "hero.cta2": "Spin the wheel",
      "spin.title": "Spin the wheel", "spin.btn": "🔮 Spin the wheel",
      "spin.cat": "Choose category",
      "pricing.title": "Pricing", "pricing.perMonth": "/mo",
      "pricing.subscribe": "Subscribe", "pricing.extra": "Extra spin",
      "pricing.buy": "Buy",
      "profile.title": "Profile", "profile.sub": "Subscription",
      "profile.active": "Active", "profile.inactive": "Inactive",
      "profile.coupons": "Your coupons", "profile.noCoupons": "No coupons yet",
      "auth.login": "Log in", "auth.signup": "Sign up",
      "auth.email": "Email", "auth.password": "Password", "auth.name": "Name",
      "auth.verify": "Email verification",
      "addCompany.title": "Add your company to the wheel",
      "lang.label": "Language",
    },
  };

  // ───────── Statik mətnlər (data-i18n yoxdursa) ─────────
  const STATIC = {
    de: {
      "Bu gün səni nə gözləyir?": "Was erwartet dich heute?",
      "Çarxın arxasında nə gizlənir — bilmirsən. Bakının onlarla məkanından biri, gözlənilməz bir endirim.\n       Ayda 3 fırlatma — cəmi 9.90 AZN.": "Hinter dem Rad verbirgt sich Überraschung — du weißt es nicht. Einer von Bakus zahlreichen Orten, ein unerwarteter Rabatt.\n      3 Drehs pro Monat — nur 9,90 AZN.",
      "Çarxı fırlatmaq üçün hesab və aktiv abunəlik tələb olunur.": "Zum Drehen brauchst du ein Konto und aktives Abo.",
      "Hesab yarat": "Konto erstellen",
      "🔮 Sürpriz endirim platforması": "🔮 Überraschungsrabatt-Plattform",
      "Ayda 3 fırlatma": "3 Drehs pro Monat",
      "Hər ay 3 dəfə çarxı fırlada bilərsən. Nə çıxacağını əvvəlcədən heç kim bilmir.": "Du kannst jeden Monat 3 Mal drehen. Niemand weiß vorher, was kommt.",
      "💳 9.90 AZN / ay": "💳 9,90 AZN / Monat",
      "Aylıq təkrarlanan abunəlik. Free trial yoxdur — qoşulduğun gün ilk fırlatmanı edə bilərsən.": "Monatlich wiederkehrendes Abo. Kein Free Trial — am Tag der Anmeldung kannst du drehen.",
      "✨ Avtomatik yenilənmə": "✨ Automatische Verlängerung",
      "3 fırlatma bitəndə növbəti ay hesabın avtomatik yenilənir. İstədiyin vaxt ləğv edə bilərsən.": "Wenn 3 Drehs aufgebraucht sind, verlängert sich dein Konto automatisch. Du kannst jederzeit kündigen.",
      "Necə işləyir?": "Wie funktioniert es?",
      "Email ilə qeydiyyatdan keç və poçtuna gələn 6 rəqəmli kodla hesabını təsdiqlə.": "Registriere dich mit E-Mail und bestätige mit dem 6-stelligen Code.",
      "Abunə ol": "Abonnieren",
      "9.90 AZN/ay ödə və ayda 3 fırlatma hüququ qazan.": "Zahle 9,90 AZN/Monat und erhalte 3 Drehs pro Monat.",
      "Çarxı fırlat": "Dreh das Rad",
      "Kateqoriya seç (və ya \"Hamısı\") — çarx təsadüfi dayanır. Nəticəni əvvəlcədən heç kim bilmir.": "Kategorie wählen (oder \"Alle\") — das Rad stoppt zufällig. Niemand weiß das Ergebnis.",
      "Kuponu istifadə et": "Gutschein einlösen",
      "Kateqoriyalar": "Kategorien",
      "Çarx yalnız hesaba daxil olduqdan sonra açılır.": "Das Rad öffnet sich erst nach dem Login.",
      "Sənə nə qismət olacaq?": "Was wird dir bestimmt?",
      "İndi başla 🔮": "Jetzt starten 🔮",
      "Hər ay 3 sürpriz şans": "Jeden Monat 3 Überraschungschancen",
      "Əlavə fırlatma lazımdır?": "Brauchst du einen extra Dreh?",
      "Tək fırlatma": "Einzelner Dreh",
      "Bu ayki 3 fırlatman bitibsə, növbəti ayı gözləmədən əlavə şans ala bilərsən.": "Wenn deine 3 Drehs diesen Monat aufgebraucht sind, bekommst du ohne Wartezeit eine extra Chance.",
      "Əlavə fırlatma al": "Extra-Dreh kaufen",
      "Tez-tez verilən suallar": "Häufig gestellte Fragen",
      "🔮 Niyə Misterio?": "🔮 Warum Misterio?",
      "İndi qoşul və qazanmağa başla 🔮": "Jetzt beitreten und gewinnen 🔮",
      "1. Kateqoriya seç": "1. Kategorie wählen",
      "2. Çarxı fırlat": "2. Dreh das Rad",
    },
    uz: {
      "Bu gün səni nə gözləyir?": "Bugun seni nima kutyapti?",
      "Çarxın arxasında nə gizlənir — bilmirsən. Bakının onlarla məkanından biri, gözlənilməz bir endirim.\n       Ayda 3 fırlatma — cəmi 9.90 AZN.": "G'ildirak ortida nima yashiringan — bilmaysan. Bokuning o'nta joyidan biri, kutilmagan chegirma.\n       Oyda 3 aylanish — faqat 9.90 AZN.",
      "Çarxı fırlatmaq üçün hesab və aktiv abunəlik tələb olunur.": "G'ildirakni aylantirish uchun hisob va faol obuna kerak.",
      "Hesab yarat": "Hisob yaratish",
      "🔮 Sürpriz endirim platforması": "🔮 Kutilmagan chegirma platformasi",
      "Ayda 3 fırlatma": "Oyda 3 ta aylanish",
      "Hər ay 3 dəfə çarxı fırlada bilərsən. Nə çıxacağını əvvəlcədən heç kim bilmir.": "Har oyda 3 marta aylantirishing mumkin. Nima chiqishini hech kim oldindan bilmaydi.",
      "💳 9.90 AZN / ay": "💳 9.90 AZN / oy",
      "Aylıq təkrarlanan abunəlik. Free trial yoxdur — qoşulduğun gün ilk fırlatmanı edə bilərsən.": "Oylik takrorlanuvchi obuna. Bepul sinov yo'q — ulangan kuni birinchi aylanishni qila olasan.",
      "✨ Avtomatik yenilənmə": "✨ Avtomatik yangilanish",
      "3 fırlatma bitəndə növbəti ay hesabın avtomatik yenilənir. İstədiyin vaxt ləğv edə bilərsən.": "3 ta aylanish tugaganda keyingi oy hisobing avtomatik yangilanadi. Istagan vaqtda bekor qilishing mumkin.",
      "Necə işləyir?": "Qanday ishlaydi?",
      "Email ilə qeydiyyatdan keç və poçtuna gələn 6 rəqəmli kodla hesabını təsdiqlə.": "Email orqali ro'yxatdan o't va pochtangga kelgan 6 xonali kod bilan hisobingni tasdiqla.",
      "Abunə ol": "Obuna bo'lish",
      "9.90 AZN/ay ödə və ayda 3 fırlatma hüququ qazan.": "9.90 AZN/oy to'la va oyda 3 ta aylanish huquqini qozon.",
      "Çarxı fırlat": "G'ildirakni aylantir",
      "Kateqoriya seç (və ya \"Hamısı\") — çarx təsadüfi dayanır. Nəticəni əvvəlcədən heç kim bilmir.": "Kategoriya tanla (yoki \"Hammasi\") — g'ildirak tasodifiy to'xtaydi. Natijani hech kim oldindan bilmaydi.",
      "Kuponu istifadə et": "Kupondan foydalanish",
      "Kateqoriyalar": "Kategoriyalar",
      "Çarx yalnız hesaba daxil olduqdan sonra açılır.": "G'ildirak faqat hisobga kirgandan keyin ochiladi.",
      "Sənə nə qismət olacaq?": "Senga nima nasib bo'ladi?",
      "İndi başla 🔮": "Hozir boshlash 🔮",
      "Hər ay 3 sürpriz şans": "Oyda 3 ta kutilmagan aylanish",
      "Əlavə fırlatma lazımdır?": "Qo'shimcha aylanish kerakmi?",
      "Tək fırlatma": "Bitta aylanish",
      "Bu ayki 3 fırlatman bitibsə, növbəti ayı gözləmədən əlavə şans ala bilərsən.": "Bu oydagi 3 ta aylanish tugasa, keyingi oyni kutmagan holda qo'shimcha imkoniyat olasan.",
      "Əlavə fırlatma al": "Qo'shimcha aylanish sotib olish",
      "Tez-tez verilən suallar": "Tez-tez beriladigan savollar",
      "🔮 Niyə Misterio?": "🔮 Nima uchun Misterio?",
      "İndi qoşul və qazanmağa başla 🔮": "Hozir qo'shil va yutib olishga boshla 🔮",
      "1. Kateqoriya seç": "1. Kategoriya tanlash",
      "2. Çarxı fırlat": "2. G'ildirakni aylantir",
    },
    en: {
      "Bu gün səni nə gözləyir?": "What awaits you today?",
      "Çarxın arxasında nə gizlənir — bilmirsən. Bakının onlarla məkanından biri, gözlənilməz bir endirim.\n       Ayda 3 fırlatma — cəmi 9.90 AZN.": "Behind the wheel hides a surprise — you never know. One of Baku's dozens of spots, an unexpected discount.\n      3 spins per month — just 9.90 AZN.",
      "Çarxı fırlatmaq üçün hesab və aktiv abunəlik tələb olunur.": "To spin you need an account and active subscription.",
      "Hesab yarat": "Create account",
      "🔮 Sürpriz endirim platforması": "🔮 Surprise discount platform",
      "Ayda 3 fırlatma": "3 spins per month",
      "Hər ay 3 dəfə çarxı fırlada bilərsən. Nə çıxacağını əvvəlcədən heç kim bilmir.": "You can spin 3 times every month. No one knows the result in advance.",
      "💳 9.90 AZN / ay": "💳 9.90 AZN / month",
      "Aylıq təkrarlanan abunəlik. Free trial yoxdur — qoşulduğun gün ilk fırlatmanı edə bilərsən.": "Recurring monthly subscription. No free trial — spin the day you join.",
      "✨ Avtomatik yenilənmə": "✨ Automatic renewal",
      "3 fırlatma bitəndə növbəti ay hesabın avtomatik yenilənir. İstədiyin vaxt ləğv edə bilərsən.": "When 3 spins run out, your account renews automatically next month. Cancel anytime.",
      "Necə işləyir?": "How it works",
      "Email ilə qeydiyyatdan keç və poçtuna gələn 6 rəqəmli kodla hesabını təsdiqlə.": "Sign up with email and confirm with the 6-digit code sent to your inbox.",
      "Abunə ol": "Subscribe",
      "9.90 AZN/ay ödə və ayda 3 fırlatma hüququ qazan.": "Pay 9.90 AZN/month and get 3 spins per month.",
      "Çarxı fırlat": "Spin the wheel",
      "Kateqoriya seç (və ya \"Hamısı\") — çarx təsadüfi dayanır. Nəticəni əvvəlcədən heç kim bilmir.": "Choose a category (or \"All\") — the wheel stops randomly. No one knows the result.",
      "Kuponu istifadə et": "Use coupon",
      "Kateqoriyalar": "Categories",
      "Çarx yalnız hesaba daxil olduqdan sonra açılır.": "The wheel opens only after login.",
      "Sənə nə qismət olacaq?": "What will you get?",
      "İndi başla 🔮": "Get started 🔮",
      "Hər ay 3 sürpriz şans": "3 surprise chances every month",
      "Əlavə fırlatma lazımdır?": "Need an extra spin?",
      "Tək fırlatma": "Single spin",
      "Bu ayki 3 fırlatman bitibsə, növbəti ayı gözləmədən əlavə şans ala bilərsən.": "If your 3 spins this month are used up, get an extra chance without waiting.",
      "Əlavə fırlatma al": "Buy extra spin",
      "Tez-tez verilən suallar": "FAQ",
      "🔮 Niyə Misterio?": "🔮 Why Misterio?",
      "İndi qoşul və qazanmağa başla 🔮": "Join now and start winning 🔮",
      "1. Kateqoriya seç": "1. Choose category",
      "2. Çarxı fırlat": "2. Spin the wheel",
    },
  };

  // ───────── API ─────────
  const I18N = {
    LANGS, T, STATIC,
    getLang: () => localStorage.getItem("mist_lang") || "az",
    getLangObj: () => LANGS[localStorage.getItem("mist_lang") || "az"] || LANGS.az,
    t: (key) => {
      const lang = I18N.getLang();
      return (T[lang] && T[lang][key]) || (T.az[key]) || key;
    },
    apply: () => {
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const txt = I18N.t(key);
        if (txt) el.textContent = txt;
      });
      const lang = I18N.getLang();
      if (lang === "az") { document.documentElement.lang = "az"; return; }
      const map = I18N.STATIC[lang] || {};
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      while (walker.nextNode()) {
        const n = walker.currentNode;
        const txt = n.textContent.trim();
        if (txt.length > 1 && map[txt]) nodes.push([n, map[txt]]);
      }
      nodes.forEach(([n, tr]) => { n.textContent = tr; });
      document.documentElement.lang = lang;
    },
    setLang: (code) => {
      localStorage.setItem("mist_lang", code);
      I18N.apply();
      if (window.onLangChange) window.onLangChange(I18N.getLangObj());
    },
  };

  window.I18N = I18N;
})();
