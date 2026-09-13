window.COTA = window.COTA || {};

COTA.app = (function () {
  let currentTab = "home";

  function goToTab(tabName, opts = {}) {
    const resetView = opts.resetView !== false;
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

      if (tabName === "home") {
        COTA.audio.playMusic("home_bgm.mp3", "Home Theme");
      }
      if (tabName === "lore") {
        resetView ? COTA.lore.enter() : COTA.lore.init();
      }
      if (tabName === "relationship") {
        resetView ? COTA.relationship.enter() : COTA.relationship.init();
        COTA.audio.playMusic("relationship_bgm.mp3", "Relationship Chart Theme");
      }

      window.setTimeout(() => overlay.classList.remove("active"), 250);
    }, 250);
  }

  function init() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        COTA.audio.playSfx("ui_click.mp3");
        goToTab(btn.dataset.tab);
      });
    });
    document.querySelectorAll("[data-goto-tab]").forEach((btn) => {
      btn.addEventListener("click", () => goToTab(btn.dataset.gotoTab));
    });

    COTA.audio.init();
    COTA.home.render();
    COTA.audio.playMusic("home_bgm.mp3", "Home Theme");
  }

  return { init, goToTab };
})();

document.addEventListener("DOMContentLoaded", COTA.app.init);
