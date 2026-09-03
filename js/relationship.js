// relationship.js
// Handles the "pick two characters, see their relationship" flow.
// The picker now shows two "slot" boxes for the characters you've
// picked so far (each removable via an X), and the roster below is
// split into 2nd/1st Generation like the Lore tab's select screen.

window.COTA = window.COTA || {};

COTA.relationship = (function () {
  let allCharacters = [];
  let allRelationships = [];
  let slots = [null, null]; // character ids picked so far, by slot index
  let initialized = false;

  function rosterCardTemplate(c) {
    return `
      <button class="rel-roster-card" data-id="${c.id}" style="--char-color:${c.color}">
        <span class="rel-roster-clip">
          <img src="assets/images/render_${c.code}.png" alt="${c.name}" class="rel-roster-img" />
          <span class="rel-roster-nameplate">${c.name}</span>
        </span>
      </button>
    `;
  }

  function renderRoster() {
    const gen2Wrap = document.getElementById("rel-roster-gen2");
    const gen1Wrap = document.getElementById("rel-roster-gen1");
    gen2Wrap.innerHTML = allCharacters.filter((c) => c.gen === 2).map(rosterCardTemplate).join("");
    gen1Wrap.innerHTML = allCharacters.filter((c) => c.gen === 1).map(rosterCardTemplate).join("");

    document.querySelectorAll(".rel-roster-card").forEach((el) => {
      el.addEventListener("click", () => onRosterPick(el.dataset.id));
    });
    refreshRosterHighlight();
  }

  function refreshRosterHighlight() {
    document.querySelectorAll(".rel-roster-card").forEach((el) => {
      el.classList.toggle("is-picked", slots.includes(el.dataset.id));
    });
  }

  function slotTemplate(index) {
    const id = slots[index];
    const slotEl = document.getElementById(`rel-slot-${index}`);
    if (!id) {
      slotEl.innerHTML = `<span class="rel-slot-placeholder">Player ${index + 1}</span>`;
      slotEl.classList.remove("is-filled");
      return;
    }
    const character = COTA.data.findCharacter(allCharacters, id);
    slotEl.classList.add("is-filled");
    slotEl.innerHTML = `
      <button class="rel-slot-remove" data-slot="${index}" aria-label="Remove ${character.name}">&times;</button>
      <img src="assets/images/render_${character.code}.png" alt="${character.name}" class="rel-slot-img" />
      <span class="rel-slot-name">${character.name}</span>
    `;
  }

  function renderSlots() {
    slotTemplate(0);
    slotTemplate(1);
    document.querySelectorAll(".rel-slot-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeSlot(Number(btn.dataset.slot));
      });
    });
  }

  function updateStatusText() {
    const statusEl = document.getElementById("rel-pick-status");
    const filledCount = slots.filter(Boolean).length;
    if (filledCount === 0) statusEl.textContent = "Choose your first character";
    else if (filledCount === 1) statusEl.textContent = "Choose your second character";
  }

  function removeSlot(index) {
    slots[index] = null;
    renderSlots();
    refreshRosterHighlight();
    updateStatusText();
  }

  function onRosterPick(id) {
    if (slots.includes(id)) return; // already picked this round
    const emptyIndex = slots.findIndex((s) => s === null);
    if (emptyIndex === -1) return; // both slots already full (shouldn't happen — we transition away)
    slots[emptyIndex] = id;
    renderSlots();
    refreshRosterHighlight();

    if (slots[0] && slots[1]) {
      COTA.audio.playSfx("char_pair.mp3");
      showRelationship(slots[0], slots[1]);
    } else {
      updateStatusText();
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

  // Resets the whole picker (both slots) and shows the select screen.
  // Called on "Link another pair!" AND every time the tab is (re-)entered.
  function resetToSelect() {
    slots = [null, null];
    renderSlots();
    refreshRosterHighlight();
    updateStatusText();
    document.getElementById("relationship-display-screen").classList.remove("active");
    document.getElementById("relationship-select-screen").classList.add("active");
  }

  async function init() {
    if (initialized) return;
    initialized = true;
    allCharacters = await COTA.data.getCharacters();
    allRelationships = await COTA.data.getRelationships();
    renderRoster();
    renderSlots();
    document.getElementById("rel-link-another-btn").addEventListener("click", resetToSelect);
  }

  // Called every time the Relationship tab is opened — always resets to
  // the picker, never resumes a previously-shown pairing.
  async function enter() {
    await init();
    resetToSelect();
  }

  return { init, enter };
})();
