// lore.js
// Handles the Street-Fighter-style character select screen and the
// per-character "index" page. Per the simplification rules: no WASD/
// keydown listeners (mouse clicks only) and no hover sound effects —
// every sound effect fires strictly from onClick handlers.

window.COTA = window.COTA || {};

COTA.lore = (function () {
  let allCharacters = [];
  let comingSoonCharacters = [];
  let selectedCode = null; // id of the card currently highlighted in the grid (not yet confirmed)
  let openCharacterId = null; // id of the character whose index page is (or was last) open
  let initialized = false;

  const BG_BY_GEN = {
    2: "assets/images/nijigasaki_bg.png",
    1: "assets/images/irregular_hunter_base_bg.png",
  };

  function cardTemplate(c) {
    // Note: intentionally no character code (A1, B3, etc.) shown anywhere
    // in this markup — just the render and the name, fighting-game style.
    return `
      <button class="select-card" data-id="${c.id}" style="--char-color:${c.color}">
        <span class="select-card-clip">
          <img src="assets/images/boxart_${c.code}.png" alt="${c.name}" class="select-card-img" />
          <span class="select-card-nameplate">${c.name}</span>
        </span>
      </button>
    `;
  }

  // Coming-soon cards look similar but are NOT a <button> — they're not
  // clickable at all, no event listener ever gets attached to them, and
  // a "COMING SOON" ribbon makes it clear why nothing happens when you
  // click one.
  function comingSoonCardTemplate(c) {
    return `
      <div class="select-card coming-soon-card" style="--char-color:${c.color}">
        <span class="select-card-clip">
          <img src="assets/images/boxart_${c.code}.png" alt="${c.name}" class="select-card-img" />
          <span class="coming-soon-ribbon">Coming Soon</span>
          <span class="select-card-nameplate">${c.name}</span>
        </span>
      </div>
    `;
  }

  function renderComingSoonGrids() {
    const gen2Wrap = document.getElementById("lore-select-comingsoon-2nd");
    const seniorsWrap = document.getElementById("lore-select-comingsoon-seniors");
    if (!gen2Wrap || !seniorsWrap) return;
    gen2Wrap.innerHTML = comingSoonCharacters
      .filter((c) => c.comingSoonGroup === "2nd Gen")
      .map(comingSoonCardTemplate)
      .join("");
    seniorsWrap.innerHTML = comingSoonCharacters
      .filter((c) => c.comingSoonGroup === "Seniors")
      .map(comingSoonCardTemplate)
      .join("");
  }

  function renderGrids() {
    const gen2Wrap = document.getElementById("lore-select-gen2");
    const gen1Wrap = document.getElementById("lore-select-gen1");
    gen2Wrap.innerHTML = allCharacters.filter((c) => c.gen === 2).map(cardTemplate).join("");
    gen1Wrap.innerHTML = allCharacters.filter((c) => c.gen === 1).map(cardTemplate).join("");

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
    if (id === selectedCode) {
      // Clicking the already-highlighted card again confirms the pick —
      // this includes re-picking whatever character is currently open,
      // which just re-opens the same index page.
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
    // NOTE: does NOT touch the music here anymore — see enter() below for
    // why. Pressing "Character Select" from an index page should just
    // keep whatever character bgm was already playing.
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
    const indexBadge = document.getElementById("lore-index-franchise-badge");
    if (character.franchiseLogo) {
      indexBadge.src = `assets/images/${character.franchiseLogo}`;
      indexBadge.style.display = "";
    } else {
      indexBadge.style.display = "none";
    }
    // The graffiti art is the actual name treatment now — a real image
    // per character (graffiti_[code].png) instead of generated CSS text,
    // so you can hand-typeset each name however you like.
    const graffitiImg = document.getElementById("lore-index-graffiti-name");
    graffitiImg.src = `assets/images/graffiti_${character.code}.png`;
    graffitiImg.alt = character.name;
    document.getElementById("lore-index-fullname").textContent =
      character.nickname && character.nickname !== "NOT REGISTERED YET"
        ? character.nickname
        : character.name;
    document.getElementById("lore-index-bio").textContent = character.bio;
    document.getElementById("lore-index-birthdate-label").textContent = character.birthdateLabel || "Birthdate";
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
    COTA.audio.playSfx("switch.mp3");
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
    const fetched = await COTA.data.getCharacters();
    // Coming-soon characters are shown (disabled) on the select screen
    // only — they're kept completely out of `allCharacters`, which is
    // what drives selecting, confirming, and prev/next stepping. That
    // way they can never accidentally become "openable".
    allCharacters = fetched.filter((c) => !c.comingSoon);
    comingSoonCharacters = fetched.filter((c) => c.comingSoon);
    const defaultChar = allCharacters.find((c) => c.isDefault) || allCharacters[0];
    selectedCode = defaultChar.id;
    renderGrids();
    renderComingSoonGrids();

    document.getElementById("lore-prev-btn").addEventListener("click", () => step(-1));
    document.getElementById("lore-next-btn").addEventListener("click", () => step(1));
    document.getElementById("lore-back-to-select-btn").addEventListener("click", () => {
      COTA.audio.playSfx("ui_click.mp3");
      showSelectScreen();
    });
  }

  // Called every time the Lore tab is opened — always lands on the
  // character select screen, never resumes a previously-open index page.
  // This is the ONLY place the select theme starts playing — pressing
  // "Character Select" from an index page uses showSelectScreen()
  // directly (see the back-button listener above) and does NOT touch
  // the music, so whatever character's bgm was playing keeps playing.
  async function enter() {
    await init();
    showSelectScreen();
    COTA.audio.playMusic("char_select.mp3", "Character Select Theme");
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
