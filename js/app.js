// app.js
// Wires up the header tab nav and the universal transition overlay that
// plays between every tab switch. Also boots each tab's own module.

window.COTA = window.COTA || {};

COTA.app = (function () {
  let currentTab = "home";

  function goToTab(tabName) {
    if (tabName === currentTab) return;
    const overlay = document.getElementById("transition-overlay");
    overlay.classList.add("active");

    window.setTimeout(() => {
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.id === `tab-${tabName}`);
      });
      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === tabName);
      });
      currentTab = tabName;

      // Lazily boot the tab's module the first time it's opened.
      if (tabName === "lore") COTA.lore.init();
      if (tabName === "relationship") COTA.relationship.init();

      window.setTimeout(() => overlay.classList.remove("active"), 250);
    }, 250);
  }

  function init() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => goToTab(btn.dataset.tab));
    });
    document.querySelectorAll("[data-goto-tab]").forEach((btn) => {
      btn.addEventListener("click", () => goToTab(btn.dataset.gotoTab));
    });

    COTA.audio.init();
    COTA.home.render();
  }

  return { init, goToTab };
})();

document.addEventListener("DOMContentLoaded", COTA.app.init);
