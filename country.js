/* MISTERIO — Ölkə seçimi məntiqi
 * 1. Sayt açılan kimi AZ default (2s)
 * 2. 2s sonra modal aç (əgər seçim yoxdursa)
 * 3. Seçim localStorage + cookie
 * 4. Footer-də "Dəyiş" düyməsi
 */
(function () {
  "use strict";
  const I18N = window.I18N;

  function buildModal() {
    if (document.getElementById("countryModal")) return;
    const m = document.createElement("div");
    m.id = "countryModal";
    m.className = "country-modal";
    m.innerHTML = `
      <div class="country-box">
        <h2 data-i18n="country.choose">Ölkənizi seçin</h2>
        <p data-i18n="country.chooseSub">Dil və valyuta üçün ölkə seçin</p>
        <div class="country-opts">
          <button class="country-opt" data-c="AZ"><span>🇦🇿</span> <b data-i18n="country.az">Azərbaycan</b></button>
          <button class="country-opt" data-c="DE"><span>🇩🇪</span> <b data-i18n="country.de">Almaniya</b></button>
          <button class="country-opt" data-c="UZ"><span>🇺🇿</span> <b data-i18n="country.uz">Özbəkistan</b></button>
        </div>
      </div>`;
    document.body.appendChild(m);
    m.querySelectorAll(".country-opt").forEach((b) => {
      b.onclick = () => {
        I18N.setCountry(b.getAttribute("data-c"));
        m.classList.remove("show");
        setTimeout(() => m.remove(), 300);
      };
    });
  }

  function showModal() {
    buildModal();
    const m = document.getElementById("countryModal");
    if (m) m.classList.add("show");
  }

  function init() {
    // Dərhal mövcud ölkəni tətbiq et (refresh-dən sonra bərpa)
    I18N.apply();
    const saved = localStorage.getItem("mist_country");
    if (!saved) {
      // 2 saniyə sonra modal
      setTimeout(showModal, 2000);
    }
    // Footer "Dəyiş" düyməsi
    document.addEventListener("click", (e) => {
      if (e.target.closest("#countryChange")) showModal();
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();

  window.showCountryModal = showModal;
})();
