function runExitTransition(onDone) {
  document.body.classList.add("page-exit");
  setTimeout(onDone, 260);
}

function runProfileExitTransition(onDone) {
  document.body.classList.add("page-zoom-exit");
  setTimeout(onDone, 320);
}

function navigateTo(url) {
  runExitTransition(() => {
    window.location.href = url;
  });
}

function initPageTransition() {
  requestAnimationFrame(() => {
    document.body.classList.add("page-visible");
  });
}

function goHome() {
  navigateTo("home.html");
}

function selectProfile() {
  const profileSound = document.getElementById("profileSelectSound");

  if (!profileSound) {
    goHome();
    return;
  }

  profileSound.currentTime = 0;
  let navigated = false;
  const proceed = () => {
    if (navigated) {
      return;
    }
    navigated = true;
    runProfileExitTransition(() => {
      window.location.href = "home.html";
    });
  };

  profileSound.addEventListener("ended", proceed, { once: true });
  profileSound.play().catch(() => {
    proceed();
  });

  const fallbackDelay = Number.isFinite(profileSound.duration) && profileSound.duration > 0
    ? Math.ceil(profileSound.duration * 1000) + 250
    : 4000;
  setTimeout(proceed, fallbackDelay);
}

function openPlayer() {
  navigateTo("player.html");
}

function goBack() {
  runExitTransition(() => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = "home.html";
  });
}

const INTRO_REVEAL_DELAY_MS = 2900;
const INTRO_HEART_COUNT = 32;

const movie = {
  title: "My Little Princess",
  overlayTitle: "For My Queen",
  description: "A love trailer starring your smile, your laugh, and every little moment that makes my world brighter.",
  cast: "Cast: My Beautiful Wife, Her Biggest Fan",
  details: "2026 | Romance | Special Cut",
  video: "https://res.cloudinary.com/drka68plu/video/upload/v1771061491/gf-video_qzfsu8.mp4"
};

function createIntroHearts(introStage) {
  const layer = document.createElement("div");
  layer.className = "intro-particles";

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < INTRO_HEART_COUNT; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart-particle";
    heart.textContent = "\u2665";

    heart.style.setProperty("--start-x", `${(Math.random() * 100).toFixed(2)}vw`);
    heart.style.setProperty("--drift", `${(Math.random() * 22 - 11).toFixed(2)}vw`);
    heart.style.setProperty("--duration", `${(1.8 + Math.random() * 1.4).toFixed(2)}s`);
    heart.style.setProperty("--delay", `${(Math.random() * 0.85).toFixed(2)}s`);
    heart.style.setProperty("--size", `${Math.floor(14 + Math.random() * 24)}px`);
    heart.style.setProperty("--alpha", (0.35 + Math.random() * 0.5).toFixed(2));
    heart.style.setProperty("--spin", `${Math.floor(Math.random() * 70 - 35)}deg`);

    fragment.appendChild(heart);
  }

  layer.appendChild(fragment);
  introStage.appendChild(layer);
}

function setupIntroPage() {
  const introStage = document.getElementById("introStage");
  const whoScreen = document.getElementById("whoScreen");
  const introSound = document.getElementById("introSound");
  const introLogo = document.querySelector(".brand-intro-logo");

  if (!introStage || !whoScreen) {
    return;
  }

  let revealed = false;
  const introPointerHandler = () => {
    attemptSound();
  };

  const revealWhoScreen = () => {
    if (revealed) {
      return;
    }

    revealed = true;
    document.body.removeEventListener("pointerdown", introPointerHandler);
    introStage.remove();
    whoScreen.classList.remove("hidden");
    whoScreen.style.display = "grid";
    document.body.classList.remove("intro-page");
  };

  const attemptSound = () => {
    if (!introSound) {
      return;
    }

    introSound.currentTime = 0;
    introSound.play().catch(() => {
      // Autoplay may be blocked until user gesture.
    });
  };

  createIntroHearts(introStage);
  attemptSound();
  document.body.addEventListener("pointerdown", introPointerHandler, { once: true });

  setTimeout(revealWhoScreen, INTRO_REVEAL_DELAY_MS);

  if (introLogo) {
    introLogo.addEventListener("animationend", revealWhoScreen, { once: true });
  }

  setTimeout(revealWhoScreen, INTRO_REVEAL_DELAY_MS + 1200);
}

function setupPlayerPage() {
  if (!window.location.pathname.includes("player.html")) {
    return;
  }

  const video = document.getElementById("videoPlayer");
  const title = document.getElementById("movieTitle");
  const desc = document.getElementById("movieDesc");
  const cast = document.getElementById("movieCast");
  const details = document.getElementById("movieDetails");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlay = document.getElementById("videoOverlay");
  const overlayPlayBtn = document.getElementById("overlayPlayBtn");
  const overlayMuteBtn = document.getElementById("overlayMuteBtn");
  const playerContainer = document.getElementById("playerContainer");

  if (!video || !title || !desc || !cast || !details || !overlayTitle || !overlay || !overlayPlayBtn || !overlayMuteBtn || !playerContainer) {
    return;
  }

  title.textContent = movie.title;
  desc.textContent = movie.description;
  cast.textContent = movie.cast;
  details.textContent = movie.details;
  overlayTitle.textContent = movie.overlayTitle;
  video.src = movie.video;

  let hideOverlayTimer;

  const showOverlay = () => {
    overlay.classList.add("visible");
  };

  const scheduleOverlayHide = () => {
    clearTimeout(hideOverlayTimer);
    if (!video.paused) {
      hideOverlayTimer = setTimeout(() => {
        overlay.classList.remove("visible");
      }, 2000);
    }
  };

  const playVideo = () => {
    video.play().then(() => {
      overlayPlayBtn.textContent = "Pause";
      scheduleOverlayHide();
    }).catch(() => {
      // Ignore blocked play errors.
    });
  };

  const pauseVideo = () => {
    video.pause();
    overlayPlayBtn.textContent = "Play";
    showOverlay();
    clearTimeout(hideOverlayTimer);
  };

  const togglePlay = () => {
    if (video.paused) {
      playVideo();
      return;
    }

    pauseVideo();
  };

  const toggleMute = () => {
    video.muted = !video.muted;
    overlayMuteBtn.textContent = video.muted ? "Unmute" : "Mute";
  };

  overlayPlayBtn.addEventListener("click", togglePlay);
  overlayMuteBtn.addEventListener("click", toggleMute);

  playerContainer.addEventListener("mousemove", () => {
    showOverlay();
    scheduleOverlayHide();
  });

  playerContainer.addEventListener("touchstart", () => {
    showOverlay();
    scheduleOverlayHide();
  }, { passive: true });

  video.addEventListener("click", () => {
    showOverlay();
    togglePlay();
  });

  video.addEventListener("ended", () => {
    pauseVideo();
    video.currentTime = 0;
  });

  showOverlay();
}

setupIntroPage();
setupPlayerPage();
initPageTransition();
