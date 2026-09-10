// home.js
// The Home tab is currently just static HTML (title, synopsis) — nothing
// here needs JS-generated content right now. This file is kept as a
// no-op module (rather than deleted) since app.js calls
// COTA.home.render() on load; it's ready to fill in again once more
// story/synopsis-style sections are added.

window.COTA = window.COTA || {};

COTA.home = (function () {
  function render() {
    // Nothing to do right now — Home is plain static content.
  }

  return { render };
})();
