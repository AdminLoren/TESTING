window.COTA = window.COTA || {};

COTA.audio = (function () {
  let currentMusic = null;
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
      label.textContent = currentMusicTitle;
    } else {
      label.textContent = "Sound On";
    }
  }

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
      audio.play().catch(() => {});
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

  function playSfx(fileName) {
    if (muted) return;
    try {
      const sfx = new Audio(`assets/audio/${fileName}`);
      sfx.volume = 0.2;
      sfx.play().catch(() => {});
    } catch (err) {}
  }

  function toggleMute() {
    muted = !muted;
    const btn = soundToggleBtn();
    if (btn) btn.setAttribute("aria-pressed", String(muted));
    if (muted && currentMusic) {
      currentMusic.pause();
    } else if (!muted && currentMusic) {
      currentMusic.play().catch(() => {});
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
