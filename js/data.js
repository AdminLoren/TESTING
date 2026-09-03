// data.js
// Talks to the tiny Express API and caches the results so every tab
// can just call COTA.data.getCharacters() without re-fetching.

window.COTA = window.COTA || {};

COTA.data = (function () {
  let charactersCache = null;
  let relationshipsCache = null;

  // Fetch + cache the full character roster.
  // Reads a plain static JSON file, so this works under Apache/nginx/any
  // static host with zero backend — no Express route required.
  async function getCharacters() {
    if (charactersCache) return charactersCache;
    const res = await fetch("data/characters.json");
    charactersCache = await res.json();
    return charactersCache;
  }

  // Fetch + cache the full relationship list. Same static-file approach.
  async function getRelationships() {
    if (relationshipsCache) return relationshipsCache;
    const res = await fetch("data/relationships.json");
    relationshipsCache = await res.json();
    return relationshipsCache;
  }

  // Find one character by its code (e.g. "A1").
  function findCharacter(list, id) {
    return list.find((c) => c.id === id);
  }

  // Look up a relationship entry for a given pair of character ids,
  // regardless of the order the pair was picked in.
  function findRelationship(list, idA, idB) {
    return list.find(
      (r) =>
        (r.pair[0] === idA && r.pair[1] === idB) ||
        (r.pair[0] === idB && r.pair[1] === idA)
    );
  }

  // Default color for each relationship "type" — placeholders until
  // the user assigns final hex codes in ASSETS_REQUIRED.txt.
  const RELATIONSHIP_COLORS = {
    Lovers: "#FF6FA5",
    Friends: "#4A90D9",
    Family: "#E74C3C",
    Acquaintances: "#95A5A6",
    "N/A": "#333333",
    Special: "#9B59B6",
  };

  return {
    getCharacters,
    getRelationships,
    findCharacter,
    findRelationship,
    RELATIONSHIP_COLORS,
  };
})();
