/* MISTERIO — Dil seçicisi (dropdown)
 * Yuxarıda sağda bayraq + dil adı, kliklə açılan menyu.
 */
(function () {
  "use strict";
  const I18N = window.I18N;

  function build() {
    if (document.getElementById("langDD")) return;
    const d = document.createElement("div");
    d.id = "langDD";
    d.className = "lang-dd";
    const cur = I18N.getLangObj();
    d.innerHTML = `
      <button class="lang-dd-btn" id="langBtn">
        <span id="langFlag">${cur.flag}</span> <span id="langName">${cur.name}</span> ▾
      </button>
      <div class="lang-dd-menu" id="langMenu">
        ${(() => Object.values(I18N.LANGS).map(l =>
          `<button class="lang-dd-item" data-l="${l.code}"><span>${l.flag}</span> ${l.name}</button>`
        ).join(""))()}
      </div>`;
    document.body.appendChild(d);

    d.querySelector("#langBtn").onclick = (e) => {
      e.stopPropagation();
      d.querySelector("#langMenu").classList.toggle("show");
    };
    d.querySelectorAll(".lang-dd-item").forEach((b) => {
      b.onclick = () => {
        I18N.setLang(b.getAttribute("data-l"));
        d.querySelector("#langMenu").classList.remove("show");
        update();
      };
    });
    document.addEventListener("click", () => d.querySelector("#langMenu").classList.remove("show"));
  }

  function update() {
    const c = I18N.getLangObj();
    const f = document.getElementById("langFlag");
    const n = document.getElementById("langName");
    if (f) f.textContent = c.flag;
    if (n) n.textContent = c.name;
  }

  function init() {
    I18N.apply();
    build();
    update();
    const orig = I18N.setLang;
    I18N.setLang = (code) => { orig(code); update(); };
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
