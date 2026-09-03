// home.js
// Renders the "Meet the Cast" preview strip on the Home tab.
// Each card is a tiny snippet that links over to the Lore tab.

window.COTA = window.COTA || {};

COTA.home = (function () {
  async function render() {
    const strip = document.getElementById("home-character-strip");
    if (!strip) return;

    const characters = await COTA.data.getCharacters();
    strip.innerHTML = "";

    characters.forEach((c) => {
      const card = document.createElement("button");
      card.className = "home-char-card";
      card.style.setProperty("--char-color", c.color);
      card.innerHTML = `
        <img src="assets/images/render_${c.code}.png" alt="${c.name}" class="home-char-thumb" />
        <span class="home-char-name">${c.name}</span>
        <span class="home-char-gen">${c.gen === 2 ? "2nd Gen" : "1st Gen"}</span>
      `;
      card.addEventListener("click", () => {
        // Jump straight to this character's index page in the Lore tab.
        COTA.app.goToTab("lore");
        COTA.lore.openCharacterById(c.id);
      });
      strip.appendChild(card);
    });
  }

  return { render };
})();
