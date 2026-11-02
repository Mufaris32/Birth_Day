/**
 * ════════════════════════════════════════════════════════════
 *  BIRTHDAY SURPRISE — app.js
 *  Edit CONFIG below to customise names, dates, videos & audio.
 * ════════════════════════════════════════════════════════════
 */

/* ─────────────────────────────────────────────────────────────
   CONFIG — edit everything here
───────────────────────────────────────────────────────────── */
const CONFIG = {
  loadingTitle: 'ACCHUUU 💜',
  birthdayHeading: 'HAPPIEST BIRTHDAY CHOKKIII 😍',
  birthdaySub: 'Today is ALL about you, my love ✨',
  loveQuestion: 'Do you love me? 🥰',
  loveResponse: 'LOVE YOUUU TOO\nALAHII 💜',
  finalHeading: 'SARINGOOOW\nMADAM JII 😂',
  finalSub: 'CRINGE MUDICHII 😂',
  finalLove: 'But you know I mean every word 💜',

  // ── Birthday unlock target (IST +05:30) ────────────────────
  // 🎂 Real date — countdown unlocks at midnight 3 Nov 2026
  targetISO: '2026-11-03T00:00:00+05:30',

  // ── Videos (relative paths from project root) ─────────────
  videos: [
    {
      src: 'videos/FIRSTONE.mp4',
      poster: '',
      caption: '💜 Our very first memory together… I still smile every time.'
    },
    {
      src: 'videos/SECONDONE.mp4',
      poster: '',
      caption: '😂 Remember this day? Best day ever with you.'
    },
    {
      src: 'videos/THIRDONE.mp4',
      poster: '',
      caption: '🌸 Every second with you is my favourite second.'
    }
  ],

  particleEmojis: ['💜', '✨', '⭐', '🌸', '💫', '🫧', '💗', '🌟'],

  // ── Audio (relative path from project root) ───────────────
  audioSrc: 'audio/alex-morgan-melody-so-melody-545531.mp3',
};

/* ─────────────────────────────────────────────────────────────
   URL TEST PARAMS
     ?test=1          → skip countdown → go straight to birthday
     ?test=countdown  → 10 s countdown from now
───────────────────────────────────────────────────────────── */
const params = new URLSearchParams(window.location.search);
const testMode = params.get('test');

let targetMs = new Date(CONFIG.targetISO).getTime();
if (testMode === 'countdown') targetMs = Date.now() + 10_000;

/* ─────────────────────────────────────────────────────────────
   DOM REFS
───────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const screens = {
  loading: $('screen-loading'),
  birthday: $('screen-birthday'),
  love: $('screen-love'),
  videos: $('screen-videos'),
  final: $('screen-final'),
};

const loadingPhase = $('loading-phase');
const countdownPhase = $('countdown-phase');
const loadingLetters = $('loading-letters');
const progressBar = $('progress-bar');
const cdDays = $('cd-days');
const cdHours = $('cd-hours');
const cdMins = $('cd-mins');
const cdSecs = $('cd-secs');
const continueBtn = $('continue-btn');
const btnYes = $('btn-yes');
const btnYesMore = $('btn-yes-more');
const loveOverlay = $('love-overlay');
const closeOverlay = $('close-overlay');
const scrollHint = $('scroll-hint');
const videoCards = $('video-cards');
const replayBtn = $('replay-btn');
const musicBtn = $('music-btn');
const bgAudio = $('bg-audio');

/* Flash overlay */
const flashOverlay = document.createElement('div');
flashOverlay.id = 'flash-overlay';
document.body.appendChild(flashOverlay);

/* ─────────────────────────────────────────────────────────────
   AUDIO / BGM
───────────────────────────────────────────────────────────── */
let musicPlaying = false;
let targetVol = 1.0;
let volRaf = null;

if (bgAudio) {
  bgAudio.src = CONFIG.audioSrc;
  bgAudio.volume = 1.0;
}

function duckBgm(vol) {
  targetVol = Math.max(0, Math.min(1, vol));
  if (volRaf) cancelAnimationFrame(volRaf);
  (function step() {
    if (!bgAudio || !musicPlaying) return;
    const diff = targetVol - bgAudio.volume;
    if (Math.abs(diff) < 0.004) { bgAudio.volume = targetVol; return; }
    bgAudio.volume += diff * 0.1;
    volRaf = requestAnimationFrame(step);
  })();
}

function updateMusicBtn() {
  if (!musicBtn) return;
  musicBtn.textContent = musicPlaying ? '🔊' : '🎵';
  musicBtn.classList.toggle('playing', musicPlaying);
  musicBtn.title = musicPlaying ? 'Pause music' : 'Play music';
}

function startBgm() {
  if (!bgAudio || musicPlaying) return;
  bgAudio.volume = targetVol;
  bgAudio.play().then(() => { musicPlaying = true; updateMusicBtn(); }).catch(() => { });
}

/* Auto-start on first user interaction */
['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
  window.addEventListener(evt, function unlock() {
    startBgm();
    window.removeEventListener(evt, unlock, true);
  }, { once: true, capture: true, passive: true });
});

/* Manual toggle */
if (musicBtn) {
  musicBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (musicPlaying) {
      bgAudio.pause();
      musicPlaying = false;
      updateMusicBtn();
    } else {
      startBgm();
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   SCREEN MANAGEMENT
───────────────────────────────────────────────────────────── */
function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    if (key === name) {
      el.classList.remove('hidden');
      el.classList.add('active');
      requestAnimationFrame(() => el.classList.add('screen--fade-in'));
    } else {
      el.classList.add('hidden');
      el.classList.remove('active', 'screen--fade-in');
    }
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ─────────────────────────────────────────────────────────────
   PARTICLES
───────────────────────────────────────────────────────────── */
function createParticles(id, count = 18) {
  const c = $(id);
  if (!c) return;
  c.innerHTML = '';
  CONFIG.particleEmojis.forEach((_, i) => {
    if (i >= count) return;
    const el = document.createElement('span');
    el.className = 'particle';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = CONFIG.particleEmojis[Math.floor(Math.random() * CONFIG.particleEmojis.length)];
    el.style.cssText = `
      left:${Math.random() * 100}%;
      animation-duration:${4 + Math.random() * 8}s;
      animation-delay:${Math.random() * 6}s;
      font-size:${12 + Math.random() * 18}px;
      opacity:0;
    `;
    c.appendChild(el);
  });
}

/* ─────────────────────────────────────────────────────────────
   BALLOONS
───────────────────────────────────────────────────────────── */
const BALLOON_EMOJIS = ['🎈', '🎀', '💜', '🎊', '🎉', '💜', '🎈'];
function createBalloons() {
  const c = $('balloons');
  if (!c) return;
  c.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('span');
    el.className = 'balloon';
    el.textContent = BALLOON_EMOJIS[Math.floor(Math.random() * BALLOON_EMOJIS.length)];
    el.style.cssText = `
      left:${5 + Math.random() * 90}%;
      animation-duration:${5 + Math.random() * 7}s;
      animation-delay:${Math.random() * 6}s;
      font-size:${28 + Math.random() * 24}px;
    `;
    c.appendChild(el);
  }
}

/* ─────────────────────────────────────────────────────────────
   CONFETTI
───────────────────────────────────────────────────────────── */
const CONFETTI_COLORS = ['#6F2DBD', '#A663CC', '#FBFBFB', '#d4a1f5', '#f9d4ff'];

function burstConfetti(opts = {}) {
  if (typeof confetti === 'undefined') return;
  confetti({ particleCount: 120, spread: 80, startVelocity: 40, colors: CONFETTI_COLORS, origin: { y: 0.5 }, ...opts });
}

function softConfetti() {
  if (typeof confetti === 'undefined') return;
  const end = Date.now() + 2500;
  const colors = ['#6F2DBD', '#A663CC', '#d4a1f5'];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ─────────────────────────────────────────────────────────────
   SCREEN 1 — LOADING ANIMATION
───────────────────────────────────────────────────────────── */
function initLoading() {
  createParticles('loading-particles', 14);

  /* Build animated letters */
  if (loadingLetters) {
    loadingLetters.innerHTML = '';
    [...CONFIG.loadingTitle].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'loading-letter';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${i * 0.1}s`;
      loadingLetters.appendChild(span);
    });

    /* Stagger letters in one by one */
    const letters = loadingLetters.querySelectorAll('.loading-letter');
    let idx = 0;
    const iv = setInterval(() => {
      if (idx < letters.length) {
        letters[idx].classList.add('animate');
        idx++;
      } else {
        clearInterval(iv);
      }
    }, 110);
  }

  /* Progress bar */
  if (progressBar) {
    let prog = 0;
    const pbIv = setInterval(() => {
      prog = Math.min(100, prog + Math.random() * 3.5 + 0.5);
      progressBar.style.width = prog + '%';
      if (prog >= 100) clearInterval(pbIv);
    }, 50);
  }

  /* After 2.8 s decide: birthday or countdown */
  setTimeout(() => {
    if (testMode === '1' || Date.now() >= targetMs) {
      transitionToBirthday(false);
    } else {
      showCountdown();
    }
  }, 2800);
}

/* ─────────────────────────────────────────────────────────────
   SCREEN 1 — COUNTDOWN
───────────────────────────────────────────────────────────── */
function showCountdown() {
  if (!loadingPhase || !countdownPhase) return;
  loadingPhase.style.cssText = 'opacity:0;transition:opacity 0.5s ease';
  setTimeout(() => {
    loadingPhase.classList.add('hidden');
    countdownPhase.classList.remove('hidden');
    countdownPhase.style.cssText = 'opacity:0;transition:opacity 0.6s ease';
    requestAnimationFrame(() => { countdownPhase.style.opacity = '1'; });
    startCountdownLoop();
  }, 500);
}

function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }

function startCountdownLoop() {
  (function tick() {
    const diff = targetMs - Date.now();
    if (diff <= 0) {
      [cdDays, cdHours, cdMins, cdSecs].forEach(el => { if (el) el.textContent = '00'; });
      transitionToBirthday(true);
      return;
    }
    const t = Math.floor(diff / 1000);
    if (cdDays) cdDays.textContent = pad(Math.floor(t / 86400));
    if (cdHours) cdHours.textContent = pad(Math.floor((t % 86400) / 3600));
    if (cdMins) cdMins.textContent = pad(Math.floor((t % 3600) / 60));
    if (cdSecs) cdSecs.textContent = pad(t % 60);
    requestAnimationFrame(tick);
  })();
}

/* ─────────────────────────────────────────────────────────────
   COUNTDOWN → BIRTHDAY
───────────────────────────────────────────────────────────── */
function transitionToBirthday(flash) {
  if (flash) {
    flashOverlay.classList.add('flash');
    burstConfetti({ origin: { y: 0.6 }, particleCount: 160 });
    setTimeout(initBirthday, 300);
  } else {
    initBirthday();
  }
}

/* ─────────────────────────────────────────────────────────────
   SCREEN 2 — BIRTHDAY GREETING
───────────────────────────────────────────────────────────── */
function initBirthday() {
  showScreen('birthday');
  createParticles('bday-particles', 20);
  createBalloons();
  softConfetti();
}

if (continueBtn) {
  continueBtn.addEventListener('click', () => {
    showScreen('love');
    createParticles('love-particles', 16);
  });
}

/* ─────────────────────────────────────────────────────────────
   SCREEN 3 — LOVE QUESTION
───────────────────────────────────────────────────────────── */
function handleLoveAnswer() {
  if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  if (loveOverlay) {
    loveOverlay.classList.remove('hidden');
    spawnPopupHearts();
  }
}

function spawnPopupHearts() {
  const c = $('popup-hearts');
  if (!c) return;
  c.innerHTML = '';
  const emojis = ['💜', '💜', '💗', '💜', '💫', '✨', '💜', '🥰'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('span');
    el.className = 'popup-heart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const tx = (Math.random() - 0.5) * 200;
    const ty = -(60 + Math.random() * 140);
    el.style.cssText = `
      left:${20 + Math.random() * 60}%;
      top:${30 + Math.random() * 40}%;
      --tx:${tx}px; --ty:${ty}px;
      animation-delay:${Math.random() * 0.6}s;
      font-size:${14 + Math.random() * 14}px;
    `;
    c.appendChild(el);
  }
  burstConfetti({ origin: { y: 0.5 }, particleCount: 100 });
}

if (btnYes) btnYes.addEventListener('click', handleLoveAnswer);
if (btnYesMore) btnYesMore.addEventListener('click', handleLoveAnswer);

if (closeOverlay) {
  closeOverlay.addEventListener('click', () => {
    if (loveOverlay) loveOverlay.classList.add('hidden');
    revealVideoSection();
  });
}

/* ─────────────────────────────────────────────────────────────
   SCREEN 4 & 5 — VIDEOS + FINAL
───────────────────────────────────────────────────────────── */
let videosRevealed = false;

function revealVideoSection() {
  if (videosRevealed) return;
  videosRevealed = true;

  /* Make scroll hint visible on love screen */
  if (scrollHint) scrollHint.classList.remove('hidden');

  /* Attach the video + final screens directly below the love screen in the page flow */
  if (screens.videos) {
    screens.videos.classList.remove('hidden');
    screens.videos.classList.add('active');
  }
  if (screens.final) {
    screens.final.classList.remove('hidden');
    screens.final.classList.add('active');
  }

  buildVideoCards();
  observeVideoCards();
  createParticles('final-particles', 14);

  /* Duck BGM when user scrolls into the video section */
  if (screens.videos) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) duckBgm(0.08);
        else if (e.boundingClientRect.top > 0) duckBgm(1.0);
      });
    }, { threshold: 0.15 });
    obs.observe(screens.videos);
  }
}

function scrollToVideos() {
  revealVideoSection();
  setTimeout(() => {
    if (screens.videos) screens.videos.scrollIntoView({ behavior: 'smooth' });
  }, 60);
  duckBgm(0.08);
}

/* ── Video Cards ─────────────────────────────────────────────── */
function buildVideoCards() {
  if (!videoCards) return;
  videoCards.innerHTML = '';

  CONFIG.videos.forEach((vid, i) => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <div class="video-wrapper">
        <video src="${vid.src}"${vid.poster ? ` poster="${vid.poster}"` : ''} playsinline muted preload="metadata" aria-label="Memory video ${i + 1}"></video>
        <div class="play-overlay" role="button" tabindex="0" aria-label="Play video ${i + 1}">
          <div class="play-btn-circle"><div class="play-icon"></div></div>
        </div>
      </div>
      <p class="video-caption">${vid.caption}</p>
    `;
    videoCards.appendChild(card);

    const videoEl = card.querySelector('video');
    const overlay = card.querySelector('.play-overlay');

    function togglePlay() {
      if (videoEl.paused) {
        /* Pause sibling videos */
        document.querySelectorAll('.video-card video').forEach(v => {
          if (v !== videoEl) {
            v.pause(); v.muted = true;
            const sib = v.closest('.video-wrapper')?.querySelector('.play-overlay');
            if (sib) sib.classList.remove('hidden');
          }
        });
        videoEl.muted = false;
        videoEl.play().catch(() => { });
        overlay.classList.add('hidden');
        duckBgm(0.02); /* near-silent while video plays */
        if (navigator.vibrate) navigator.vibrate(40);
      } else {
        videoEl.pause();
        overlay.classList.remove('hidden');
        duckBgm(0.08);
      }
    }

    overlay.addEventListener('click', togglePlay);
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePlay(); }
    });
    videoEl.addEventListener('ended', () => { overlay.classList.remove('hidden'); duckBgm(0.08); });
    videoEl.addEventListener('pause', () => { overlay.classList.remove('hidden'); duckBgm(0.08); });
    videoEl.addEventListener('play', () => { overlay.classList.add('hidden'); });
  });
}

function observeVideoCards() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.video-card').forEach(c => obs.observe(c));
}

/* ─────────────────────────────────────────────────────────────
   SCROLL NAVIGATION: Love → Videos
───────────────────────────────────────────────────────────── */
function initScrollNav() {
  /* Scroll hint click */
  if (scrollHint) scrollHint.addEventListener('click', scrollToVideos);

  /* Touch swipe-down on love screen */
  let ty0 = 0;
  if (screens.love) {
    screens.love.addEventListener('touchstart', e => { ty0 = e.touches[0].clientY; }, { passive: true });
    screens.love.addEventListener('touchend', e => {
      const dy = ty0 - e.changedTouches[0].clientY;
      if (dy > 50 && scrollHint && !scrollHint.classList.contains('hidden')) scrollToVideos();
    }, { passive: true });

    /* Mouse wheel down */
    screens.love.addEventListener('wheel', e => {
      if (e.deltaY > 30 && scrollHint && !scrollHint.classList.contains('hidden')) scrollToVideos();
    }, { passive: true });
  }
}

/* ─────────────────────────────────────────────────────────────
   FINAL SCREEN — REPLAY
───────────────────────────────────────────────────────────── */
if (replayBtn) {
  replayBtn.addEventListener('click', () => {
    burstConfetti({ origin: { y: 0.8 }, particleCount: 80 });
    softConfetti();

    document.querySelectorAll('.video-card video').forEach(v => v.pause());
    duckBgm(1.0);
    videosRevealed = false;

    /* Hide videos + final */
    if (screens.videos) { screens.videos.classList.add('hidden'); screens.videos.classList.remove('active', 'screen--fade-in'); }
    if (screens.final) { screens.final.classList.add('hidden'); screens.final.classList.remove('active', 'screen--fade-in'); }

    /* Return to loading */
    Object.values(screens).forEach(s => { if (s) { s.classList.add('hidden'); s.classList.remove('active', 'screen--fade-in'); } });
    if (screens.loading) { screens.loading.classList.remove('hidden'); screens.loading.classList.add('active'); }

    if (loadingPhase) { loadingPhase.classList.remove('hidden'); loadingPhase.style.cssText = 'opacity:1'; }
    if (countdownPhase) countdownPhase.classList.add('hidden');
    if (progressBar) progressBar.style.width = '0%';
    if (scrollHint) scrollHint.classList.add('hidden');
    if (loveOverlay) loveOverlay.classList.add('hidden');
    if (videoCards) videoCards.innerHTML = '';

    window.scrollTo({ top: 0, behavior: 'instant' });
    initLoading();
  });
}

/* ─────────────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────────── */
(function init() {
  initScrollNav();
  initLoading();
  /* Try immediate play (will succeed if browser allows, otherwise waits for first tap) */
  startBgm();
})();
