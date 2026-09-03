// audio.js
// Simple HTML5-Audio-only sound manager. No Web Audio API, no AudioContext.
// Rule: only ONE music track plays at a time. SFX play on click only
// (never on hover, per the simplification rules).
// All play() calls are wrapped in try/catch + .catch() so a missing
// audio file (until real assets are dropped in) never breaks the UI.

window.COTA = window.COTA || {};

COTA.audio = (function () {
  let currentMusic = null; // the <audio> element currently looping
  let currentMusicTitle = "";
  let muted = false;

  const nowPlayingText = () => document.getElementById("now-playing-text");
  const soundToggleBtn = () => document.getElementById("sound-toggle");

  function updateHeaderText() {
    const label = nowPlayingText();
    if (!label) return;
    if (muted) {
      label.textContent = "Sound Off";
    } else if (currentMusic && currentMusicTitle) {
      label.textContent = `Now Playing: ${currentMusicTitle}`;
    } else {
      label.textContent = "Sound On";
    }
  }

  // Play a looping background track. Stops whatever was playing first,
  // so only one song is ever audible at once.
  function playMusic(fileName, title) {
    currentMusicTitle = title || fileName;
    if (currentMusic) {
      currentMusic.pause();
      currentMusic = null;
    }
    if (muted) {
      updateHeaderText();
      return;
    }
    try {
      const audio = new Audio(`assets/audio/${fileName}`);
      audio.loop = true;
      audio.volume = 0.6;
      audio.play().catch(() => {
        /* asset not added yet — fail silently, header text still updates */
      });
      currentMusic = audio;
    } catch (err) {
      currentMusic = null;
    }
    updateHeaderText();
  }

  function stopMusic() {
    if (currentMusic) {
      currentMusic.pause();
      currentMusic = null;
    }
    currentMusicTitle = "";
    updateHeaderText();
  }

  // One-shot sound effect, fired only from onClick handlers.
  function playSfx(fileName) {
    if (muted) return;
    try {
      const sfx = new Audio(`assets/audio/${fileName}`);
      sfx.volume = 0.8;
      sfx.play().catch(() => {});
    } catch (err) {
      /* ignore missing sfx */
    }
  }

  function toggleMute() {
    muted = !muted;
    const btn = soundToggleBtn();
    if (btn) btn.setAttribute("aria-pressed", String(muted));
    if (muted && currentMusic) {
      currentMusic.pause();
    } else if (!muted && currentMusic) {
      currentMusic.play().catch(() => {});
    } else if (!muted && !currentMusic && currentMusicTitle) {
      // nothing to resume, just refresh text
    }
    updateHeaderText();
  }

  function init() {
    const btn = soundToggleBtn();
    if (btn) btn.addEventListener("click", toggleMute);
    updateHeaderText();
  }

  return { init, playMusic, stopMusic, playSfx, toggleMute };
})();
