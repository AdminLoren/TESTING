// home.js
// Renders the Home tab's "The World So Far" stats and "The Generations"
// teaser cards. Deliberately does NOT show any character names, art, or
// bios here — that's what makes the Lore tab's character select screen
// feel like a reveal instead of something you've already seen.

window.COTA = window.COTA || {};

COTA.home = (function () {
  async function render() {
    const [characters, relationships] = await Promise.all([
      COTA.data.getCharacters(),
      COTA.data.getRelationships(),
    ]);

    // "Coming soon" characters count toward the teaser numbers, but never
    // toward anything that could accidentally reveal who they are.
    const revealed = characters.filter((c) => !c.comingSoon);
    const comingSoon = characters.filter((c) => c.comingSoon);
    const gen2Count = revealed.filter((c) => c.gen === 2).length;
    const gen1Count = revealed.filter((c) => c.gen === 1).length;

    renderStats(revealed.length, relationships.length, comingSoon.length);
    renderGenerations(gen2Count, gen1Count);
  }

  function renderStats(charCount, relCount, comingSoonCount) {
    const grid = document.getElementById("home-stats-grid");
    if (!grid) return;
    grid.innerHTML = `
      <div class="home-stat-card">
        <span class="home-stat-number">${charCount}</span>
        <span class="home-stat-label">Characters Registered</span>
      </div>
      <div class="home-stat-card">
        <span class="home-stat-number">2</span>
        <span class="home-stat-label">Generations</span>
      </div>
      <div class="home-stat-card">
        <span class="home-stat-number">${relCount}</span>
        <span class="home-stat-label">Relationships Mapped</span>
      </div>
      <div class="home-stat-card">
        <span class="home-stat-number">${comingSoonCount}</span>
        <span class="home-stat-label">Coming Soon</span>
      </div>
    `;
  }

  function renderGenerations(gen2Count, gen1Count) {
    const grid = document.getElementById("home-generations-grid");
    if (!grid) return;
    grid.innerHTML = `
      <button class="home-gen-card" data-goto-tab="lore">
        <span class="home-gen-title">2nd Generation</span>
        <span class="home-gen-count">${gen2Count} members</span>
        <span class="home-gen-hint">Children of the Authors</span>
      </button>
      <button class="home-gen-card" data-goto-tab="lore">
        <span class="home-gen-title">1st Generation</span>
        <span class="home-gen-count">${gen1Count} members</span>
        <span class="home-gen-hint">The Originals</span>
      </button>
    `;
    // Clicking either card just opens the Lore select screen generally —
    // it doesn't jump to any specific character, so nothing is spoiled.
    grid.querySelectorAll(".home-gen-card").forEach((card) => {
      card.addEventListener("click", () => COTA.app.goToTab(card.dataset.gotoTab));
    });
  }

  return { render };
})();
