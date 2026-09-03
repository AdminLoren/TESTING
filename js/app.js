// app.js
// Wires up the header tab nav and the universal transition overlay that
// plays between every tab switch. Also boots each tab's own module.

window.COTA = window.COTA || {};

COTA.app = (function () {
  let currentTab = "home";

  function goToTab(tabName, opts = {}) {
    const resetView = opts.resetView !== false; // defaults to true
    if (tabName === currentTab && !opts.force) return;
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

      // Lore/Relationship always land back on their picker/select screen
      // when the tab is (re-)entered — never resume a previous pick.
      // The one exception is jumping straight to a character from the
      // Home tab, which passes resetView: false and drives the view itself.
      if (tabName === "lore") {
        resetView ? COTA.lore.enter() : COTA.lore.init();
      }
      if (tabName === "relationship") {
        resetView ? COTA.relationship.enter() : COTA.relationship.init();
      }

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
