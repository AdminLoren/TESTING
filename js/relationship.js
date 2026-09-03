// relationship.js
// Handles the "pick two characters, see their relationship" flow.

window.COTA = window.COTA || {};

COTA.relationship = (function () {
  let allCharacters = [];
  let allRelationships = [];
  let pickedIds = [];
  let initialized = false;

  function rosterCardTemplate(c) {
    return `
      <button class="rel-roster-card" data-id="${c.id}" style="--char-color:${c.color}">
        <img src="assets/images/render_${c.code}.png" alt="${c.name}" class="rel-roster-img" />
        <span class="rel-roster-name">${c.name}</span>
      </button>
    `;
  }

  function renderRoster() {
    const wrap = document.getElementById("relationship-roster");
    wrap.innerHTML = allCharacters.map(rosterCardTemplate).join("");
    wrap.querySelectorAll(".rel-roster-card").forEach((el) => {
      el.addEventListener("click", () => onRosterPick(el.dataset.id));
    });
    refreshRosterHighlight();
  }

  function refreshRosterHighlight() {
    document.querySelectorAll(".rel-roster-card").forEach((el) => {
      el.classList.toggle("is-picked", pickedIds.includes(el.dataset.id));
    });
  }

  function onRosterPick(id) {
    if (pickedIds.includes(id)) return; // already picked this round
    pickedIds.push(id);
    refreshRosterHighlight();

    const statusEl = document.getElementById("rel-pick-status");
    if (pickedIds.length === 1) {
      statusEl.textContent = "Choose your second character";
    } else if (pickedIds.length === 2) {
      COTA.audio.playSfx("char_pair.mp3");
      showRelationship(pickedIds[0], pickedIds[1]);
    }
  }

  function showRelationship(idA, idB) {
    const charA = COTA.data.findCharacter(allCharacters, idA);
    const charB = COTA.data.findCharacter(allCharacters, idB);
    const rel = COTA.data.findRelationship(allRelationships, idA, idB);

    document.getElementById("rel-char-a-render").src = `assets/images/render_${charA.code}.png`;
    document.getElementById("rel-char-a-render").alt = charA.name;
    document.getElementById("rel-char-a-name").textContent = charA.name;

    document.getElementById("rel-char-b-render").src = `assets/images/render_${charB.code}.png`;
    document.getElementById("rel-char-b-render").alt = charB.name;
    document.getElementById("rel-char-b-name").textContent = charB.name;

    const type = rel ? rel.type : "N/A";
    const title = rel ? rel.title : "NOT REGISTERED YET";
    const specificTitle = rel ? rel.specificTitle : "";
    const bio = rel ? rel.bio : "This pairing hasn't been registered yet.";

    document.getElementById("rel-title").textContent = title;
    document.getElementById("rel-specific-title").textContent = specificTitle;
    document.getElementById("rel-bio").textContent = bio;

    const overlay = document.getElementById("rel-color-overlay");
    overlay.style.backgroundColor = COTA.data.RELATIONSHIP_COLORS[type] || COTA.data.RELATIONSHIP_COLORS["N/A"];

    document.getElementById("relationship-select-screen").classList.remove("active");
    const display = document.getElementById("relationship-display-screen");
    display.classList.add("active", "fade-in");
    window.setTimeout(() => display.classList.remove("fade-in"), 400);
  }

  function resetToSelect() {
    pickedIds = [];
    document.getElementById("rel-pick-status").textContent = "Choose your first character";
    refreshRosterHighlight();
    document.getElementById("relationship-display-screen").classList.remove("active");
    document.getElementById("relationship-select-screen").classList.add("active");
  }

  async function init() {
    if (initialized) return;
    initialized = true;
    allCharacters = await COTA.data.getCharacters();
    allRelationships = await COTA.data.getRelationships();
    renderRoster();
    document.getElementById("rel-link-another-btn").addEventListener("click", resetToSelect);
    document.getElementById("relationship-select-screen").classList.add("active");
  }

  return { init };
})();
