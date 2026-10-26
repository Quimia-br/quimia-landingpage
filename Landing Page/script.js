// Animação ao navegar pelo site
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    var targetId = this.getAttribute('href');

    if (targetId.charAt(0) !== '#') {
      return;
    }

    event.preventDefault();

    if (targetId === '#') {
      return;
    }

    if (targetId === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.querySelector(targetId).scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Frases subtítulo h1
var subtitle = document.querySelector('#hero-text p');

var phrases = [
  'Tudo o que você precisa saber sobre seus produtos de limpeza, em um só lugar.',
  'Cuide da sua casa do jeito que você sempre quis.',
  'Usar produtos de limpeza corretamente não deveria ser tão complicado.',
  'Proteger quem voce ama começa pelos produtos que voce usa.'
];

var phraseIndex = 0;
var pauseTime = 2700;
var duration = 400;
var blurStrength = 2;

var text = document.createElement('span');
text.style.display = 'block';
text.textContent = phrases[0];
subtitle.textContent = '';
subtitle.appendChild(text);

function reserveHeight() {
  var currentPhrase = text.textContent;
  var maxHeight = 0;

  subtitle.style.minHeight = '';
  phrases.forEach(function (phrase) {
    text.textContent = phrase;
    if (subtitle.offsetHeight > maxHeight) {
      maxHeight = subtitle.offsetHeight;
    }
  });
  text.textContent = currentPhrase;
  subtitle.style.minHeight = maxHeight + 'px';
}
reserveHeight();

var heightTimer;
window.addEventListener('resize', function () {
  clearTimeout(heightTimer);
  heightTimer = setTimeout(reserveHeight, 150);
});

text.style.filter = 'blur(0px)';
text.style.opacity = '1';
text.style.transition =
  'filter ' + duration + 'ms ease, opacity ' + duration + 'ms ease';

function changePhrase() {
  text.style.filter = 'blur(' + blurStrength + 'px)';
  text.style.opacity = '0';

  setTimeout(function () {
    phraseIndex = phraseIndex + 1;

    if (phraseIndex >= phrases.length) {
      phraseIndex = 0;
    }

    text.textContent = phrases[phraseIndex];
    text.style.filter = 'blur(0px)';
    text.style.opacity = '1';
  }, duration);
}

setInterval(changePhrase, pauseTime + duration * 2);

(() => {
  const tabList = document.querySelector('#features .feature-right');
  const panel = document.getElementById('feature-panel');

  if (!tabList || !panel) {
    return;
  }

  const tabs = Array.from(tabList.querySelectorAll('.feature-card'));
  const screens = Array.from(panel.querySelectorAll('.feature-image'));
  const keySteps = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

  const setFocusableTab = (focusTab) => {
    tabs.forEach((tab) => {
      tab.tabIndex = tab === focusTab ? 0 : -1;
    });
  };

  const selectFeature = (selectedTab) => {
    const featureKey = selectedTab.dataset.feature;

    tabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', String(isSelected));
    });

    screens.forEach((screen) => {
      const isVisible = screen.dataset.feature === featureKey;
      screen.classList.toggle('active', isVisible);
      screen.setAttribute('aria-hidden', String(!isVisible));
    });

    panel.setAttribute('aria-labelledby', selectedTab.id);
    setFocusableTab(selectedTab);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      selectFeature(tab);
    });
  });

  tabList.addEventListener('keydown', (event) => {
    const currentIndex = tabs.indexOf(document.activeElement);
    let nextIndex;

    if (currentIndex === -1) {
      return;
    }

    if (event.key in keySteps) {
      nextIndex = (currentIndex + keySteps[event.key] + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setFocusableTab(tabs[nextIndex]);
    tabs[nextIndex].focus();
  });

  tabList.addEventListener('focusout', (event) => {
    if (!tabList.contains(event.relatedTarget)) {
      setFocusableTab(tabList.querySelector('.feature-card.active'));
    }
  });
})();

/* Responsiveness */
(() => {
  const navbar = document.getElementById('navbar');
  const navMenu = document.getElementById('main-nav');
  const menuButton = document.getElementById('menu-toggle');
  const largeScreen = window.matchMedia('(min-width: 901px)');

  const setMenu = (isOpen) => {
    navbar.classList.toggle('menu-open', isOpen);
    navMenu.classList.toggle('open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  };

  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  navMenu.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setMenu(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu.classList.contains('open')) {
      setMenu(false);
      menuButton.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (navMenu.classList.contains('open') && !navbar.contains(event.target)) {
      setMenu(false);
    }
  });

  largeScreen.addEventListener('change', (event) => {
    if (event.matches) {
      setMenu(false);
    }
  });
})();

// Vídeo de demonstração
var demoVideo = document.getElementById('quimiaVideo');
var soundButton = document.getElementById('quimiaSom');

if (demoVideo && soundButton) {
  var mobileQuery = window.matchMedia('(max-width: 768px)');
  var videoVersions = {
    desktop: {
      src: 'assets/videos/quimia-demo-com-voz-desktop.mp4',
      poster: 'assets/images/capa-desktop.jpg'
    },
    mobile: {
      src: 'assets/videos/quimia-demo-com-voz-celular.mp4',
      poster: 'assets/images/capa-celular.jpg'
    }
  };
  var currentVersion = '';

  function loadVideoVersion() {
    var version = mobileQuery.matches ? 'mobile' : 'desktop';

    if (!demoVideo.muted || version === currentVersion) {
      return;
    }
    currentVersion = version;
    demoVideo.poster = videoVersions[version].poster;
    demoVideo.querySelector('source').src = videoVersions[version].src;
    demoVideo.load();
    demoVideo.play().catch(function () {});
  }

  function setSound(on, restart) {
    var track = demoVideo.textTracks[0];

    if (restart) {
      demoVideo.currentTime = 0;
    }
    demoVideo.muted = !on;
    demoVideo.loop = !on;
    if (track) {
      track.mode = on ? 'showing' : 'hidden';
    }
    soundButton.setAttribute('aria-pressed', on ? 'true' : 'false');
    soundButton.textContent = on ? '\uD83D\uDD07 Desativar som' : '\uD83D\uDD0A Ativar som';
    demoVideo.play().catch(function () {});
  }

  loadVideoVersion();
  mobileQuery.addEventListener('change', loadVideoVersion);

  soundButton.addEventListener('click', function () {
    var turnOn = demoVideo.muted;

    setSound(turnOn, false);
  });

  demoVideo.addEventListener('ended', function () {
    setSound(false, true);
  });
}


// Fazendo os buttons de dowload app funcionarem

const appStoreUrl = "https://apps.apple.com/br/app//spotify-music-and-podcasts/id324684580";
const playStoreUrl = "https://play.google.com/store/apps/details?id=com.spotify.music";
const fallback = "https://quimia.tech/download";

const downloadModal = document.getElementById('downloadModal');
const downloadModalClose = document.getElementById('downloadModalClose');
const downloadQr = document.getElementById('downloadQr');

function downloadApp() {

  const userAgent = navigator.userAgent;

  const isIOS =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (navigator.platform === "MacIntel" &&
     navigator.maxTouchPoints > 1);
    
  const isAndroid = /Android/i.test(userAgent);

  if (isIOS){
    window.location.href = appStoreUrl;
  } else if (isAndroid){
    window.location.href = playStoreUrl;
  } else if (downloadModal && typeof downloadModal.showModal === 'function') {
    downloadModal.showModal();
  } else {
    window.location.href = fallback;
  }
}

// Aplica a função acima de download em todos os botões de download

document.querySelectorAll('[data-link="appDownload"]').forEach(function (button) {
  button.addEventListener('click', function (event) {
    event.preventDefault();
    downloadApp();
  });
});

// Fechar o pop-up de instalação

downloadModalClose.addEventListener('click', function () {
  downloadModal.close();
});

downloadModal.addEventListener('click', function (event) {
  if (event.target === downloadModal) {
    downloadModal.close();
  }
});

// Links das stores e QR Code

document.getElementById('downloadAppStore').href = appStoreUrl;
document.getElementById('downloadPlayStore').href = playStoreUrl;

try {
  downloadQr.innerHTML = '';

  new QRCode(downloadQr, {
    text: fallback,
    width: 206,
    height: 206,
    colorDark: '#212121',
    colorLight: '#ffffff'
  });
} catch (error) {
  // Se o QR code não puder ser gerado, mostra um link para a página de download
  downloadQr.innerHTML = '<a href="' + fallback + '">Acesse a página de download</a>';
}
