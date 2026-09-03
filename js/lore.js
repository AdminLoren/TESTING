// lore.js
// Handles the Street-Fighter-style character select screen and the
// per-character "index" page. Per the simplification rules: no WASD/
// keydown listeners (mouse clicks only) and no hover sound effects —
// every sound effect fires strictly from onClick handlers.

window.COTA = window.COTA || {};

COTA.lore = (function () {
  let allCharacters = [];
  let selectedCode = null; // id of the card currently highlighted in the grid (not yet confirmed)
  let openCharacterId = null; // id of the character whose index page is (or was last) open
  let initialized = false;

  const BG_BY_GEN = {
    2: "assets/images/nijigasaki_bg.png",
    1: "assets/images/irregular_hunter_base_bg.png",
  };

  function cardTemplate(c, isGreyedOut) {
    // Note: intentionally no character code (A1, B3, etc.) shown anywhere
    // in this markup — just the render and the name, fighting-game style.
    return `
      <button class="select-card ${isGreyedOut ? "greyed-out" : ""}" data-id="${c.id}" style="--char-color:${c.color}">
        <span class="select-card-clip">
          <img src="assets/images/render_${c.code}.png" alt="${c.name}" class="select-card-img" />
          <span class="select-card-nameplate">${c.name}</span>
        </span>
      </button>
    `;
  }

  function renderGrids() {
    const gen2Wrap = document.getElementById("lore-select-gen2");
    const gen1Wrap = document.getElementById("lore-select-gen1");
    gen2Wrap.innerHTML = allCharacters
      .filter((c) => c.gen === 2)
      .map((c) => cardTemplate(c, c.id === openCharacterId))
      .join("");
    gen1Wrap.innerHTML = allCharacters
      .filter((c) => c.gen === 1)
      .map((c) => cardTemplate(c, c.id === openCharacterId))
      .join("");

    document.querySelectorAll(".select-card").forEach((cardEl) => {
      cardEl.addEventListener("click", () => onCardClick(cardEl.dataset.id));
    });
    highlightSelectedCard();
  }

  function highlightSelectedCard() {
    document.querySelectorAll(".select-card").forEach((el) => {
      el.classList.toggle("is-highlighted", el.dataset.id === selectedCode);
    });
  }

  function onCardClick(id) {
    const character = COTA.data.findCharacter(allCharacters, id);
    if (id === openCharacterId) {
      // Clicking the already-open/active character in the greyed-out state.
      COTA.audio.playSfx("char_picked.mp3");
      return;
    }
    if (id === selectedCode) {
      // Clicking the already-highlighted card again confirms the pick.
      confirmSelection(character);
      return;
    }
    // Otherwise, move the "currently selecting" highlight to this card.
    selectedCode = id;
    highlightSelectedCard();
    COTA.audio.playSfx("char_switch.mp3");
  }

  function confirmSelection(character) {
    COTA.audio.playSfx("char_confirm.mp3");
    COTA.audio.playSfx(`char_announce_${character.code}.mp3`);
    openCharacterId = character.id;
    COTA.audio.playMusic(character.bgm.file, character.bgm.title);
    showIndexScreen(character);
  }

  function showSelectScreen() {
    document.getElementById("lore-index-screen").classList.remove("active");
    const selectScreen = document.getElementById("lore-select-screen");
    selectScreen.classList.add("active", "slide-in-bottom");
    // Reset the "currently selecting" cursor to whatever is open right now.
    selectedCode = openCharacterId || selectedCode;
    renderGrids();
    // Character select theme plays while browsing; only if not already open.
    COTA.audio.playMusic("char_select.mp3", "Character Select Theme");
    window.setTimeout(() => selectScreen.classList.remove("slide-in-bottom"), 500);
  }

  function showIndexScreen(character) {
    const selectScreen = document.getElementById("lore-select-screen");
    const indexScreen = document.getElementById("lore-index-screen");
    selectScreen.classList.remove("active");
    indexScreen.classList.add("active", "fade-in");
    window.setTimeout(() => indexScreen.classList.remove("fade-in"), 400);
    renderIndexContent(character);
  }

  function renderIndexContent(character) {
    document.getElementById("lore-index-render").src = `assets/images/render_${character.code}.png`;
    document.getElementById("lore-index-render").alt = character.name;
    // The graffiti art is the actual name treatment now — a real image
    // per character (graffiti_[code].png) instead of generated CSS text,
    // so you can hand-typeset each name however you like.
    const graffitiImg = document.getElementById("lore-index-graffiti-name");
    graffitiImg.src = `assets/images/graffiti_${character.code}.png`;
    graffitiImg.alt = character.name;
    document.getElementById("lore-index-fullname").textContent =
      character.nickname && character.nickname !== "NOT REGISTERED YET"
        ? `${character.name} "${character.nickname}"`
        : character.name;
    document.getElementById("lore-index-bio").textContent = character.bio;
    document.getElementById("lore-index-birthdate").textContent = character.birthdate;
    document.getElementById("lore-index-occupation").textContent = character.occupation;
    document.getElementById("lore-index-cherishes").textContent = character.cherishes.join(", ");
    document.getElementById("lore-index-dislikes").textContent = character.dislikes.join(", ");

    const abilitiesList = document.getElementById("lore-index-abilities");
    abilitiesList.innerHTML = character.abilities
      .map((a) => `<li><strong>${a.name}</strong> — ${a.desc}</li>`)
      .join("");

    // Background: Nijigasaki for 2nd gen, Irregular Hunter Base for 1st gen,
    // blurred, with the character's main color overlaid transparently.
    const bg = document.getElementById("lore-index-bg");
    bg.style.backgroundImage = `url('${BG_BY_GEN[character.gen]}')`;
    // The character's color becomes a looming, semi-transparent shadow
    // that sits above the background image but behind the render/text
    // (see .index-color-overlay in style.css for the layered gradient).
    const overlay = document.getElementById("lore-index-color-overlay");
    overlay.style.setProperty("--overlay-color", character.color);
  }

  function step(delta) {
    const idx = allCharacters.findIndex((c) => c.id === openCharacterId);
    const nextIdx = (idx + delta + allCharacters.length) % allCharacters.length;
    const nextChar = allCharacters[nextIdx];

    // Simple crossfade so it's clear a new character just swapped in.
    const content = document.getElementById("lore-index-content");
    content.classList.add("index-swap-out");
    window.setTimeout(() => {
      openCharacterId = nextChar.id;
      selectedCode = nextChar.id;
      COTA.audio.playMusic(nextChar.bgm.file, nextChar.bgm.title);
      renderIndexContent(nextChar);
      content.classList.remove("index-swap-out");
    }, 180);
  }

  async function init() {
    if (initialized) return;
    initialized = true;
    allCharacters = await COTA.data.getCharacters();
    const defaultChar = allCharacters.find((c) => c.isDefault) || allCharacters[0];
    selectedCode = defaultChar.id;
    renderGrids();

    document.getElementById("lore-prev-btn").addEventListener("click", () => step(-1));
    document.getElementById("lore-next-btn").addEventListener("click", () => step(1));
    document.getElementById("lore-back-to-select-btn").addEventListener("click", showSelectScreen);
  }

  // Called every time the Lore tab is opened — always lands on the
  // character select screen, never resumes a previously-open index page.
  async function enter() {
    await init();
    showSelectScreen();
  }

  // Called from Home tab "meet the cast" cards — jumps straight to a
  // character's index page, skipping the select screen.
  async function openCharacterById(id) {
    await init();
    const character = COTA.data.findCharacter(allCharacters, id);
    if (!character) return;
    openCharacterId = character.id;
    selectedCode = character.id;
    COTA.audio.playMusic(character.bgm.file, character.bgm.title);
    showIndexScreen(character);
  }

  return { init, enter, openCharacterById, showSelectScreen };
})();
