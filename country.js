/* MISTERIO — Ölkə seçimi məntiqi
 * 1. Sayt açılan kimi AZ default (2s)
 * 2. 2s sonra modal aç (əgər seçim yoxdursa)
 * 3. Seçim localStorage + cookie
 * 4. Footer-də "Dəyiş" düyməsi
 */
(function () {
  "use strict";
  const I18N = window.I18N;

  function buildDropdown() {
    if (document.getElementById("countryDD")) return;
    const d = document.createElement("div");
    d.id = "countryDD";
    d.className = "country-dd";
    d.innerHTML = `
      <button class="country-dd-btn" id="countryBtn">
        <span id="countryFlag">🇦🇿</span> <span id="countryName">Azerbaijan</span> ▾
      </button>
      <div class="country-dd-menu" id="countryMenu">
        <button class="country-dd-item" data-c="AZ"><span>🇦🇿</span> Azerbaijan</button>
        <button class="country-dd-item" data-c="DE"><span>🇩🇪</span> Germany</button>
        <button class="country-dd-item" data-c="UZ"><span>🇺🇿</span> Uzbekistan</button>
      </div>`;
    document.body.appendChild(d);
    // toggle
    d.querySelector("#countryBtn").onclick = (e) => {
      e.stopPropagation();
      d.querySelector("#countryMenu").classList.toggle("show");
    };
    // seçim
    d.querySelectorAll(".country-dd-item").forEach((b) => {
      b.onclick = () => {
        I18N.setCountry(b.getAttribute("data-c"));
        d.querySelector("#countryMenu").classList.remove("show");
        updateDD();
      };
    });
    // xaricə kliklə bağla
    document.addEventListener("click", () => d.querySelector("#countryMenu").classList.remove("show"));
  }

  function updateDD() {
    const c = I18N.getCountry();
    const flag = document.getElementById("countryFlag");
    const name = document.getElementById("countryName");
    if (flag) flag.textContent = c.flag;
    if (name) name.textContent = c.name;
  }

  function init() {
    I18N.apply();
    buildDropdown();
    updateDD();
    // hər dəfə dil dəyişəndə dropdown yenilə
    const origSet = I18N.setCountry;
    I18N.setCountry = (code) => { origSet(code); updateDD(); };
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
