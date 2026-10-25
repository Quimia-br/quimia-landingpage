// Animação ao navegar pelo site
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    event.preventDefault();

    var targetId = this.getAttribute('href');

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

//Carrossel
var cardsWindow = document.querySelector('.cards-window');
var track = document.querySelector('.cards-track');
var originalCards = document.querySelectorAll('.member-card');
var total = originalCards.length;
var cloneCount = 3;

for (var i = total - cloneCount; i < total; i++) {
  var startClone = originalCards[i].cloneNode(true);
  track.insertBefore(startClone, originalCards[0]);
}


for (var j = 0; j < cloneCount; j++) {
  var endClone = originalCards[j].cloneNode(true);
  track.appendChild(endClone);
}

var cards = document.querySelectorAll('.member-card');
var activeIndex = cloneCount;
var isAnimating = false;

function updateCarousel(withAnimation) {
  if (!withAnimation) {
    track.classList.add('no-transition');
  }

  var activeCard = cards[activeIndex];
  var cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
  var windowCenter = cardsWindow.offsetWidth / 2;
  var offset = windowCenter - cardCenter;

  track.style.transform = 'translateX(' + offset + 'px)';

  cards.forEach(function (card, position) {
    if (position === activeIndex) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  if (!withAnimation) {
    track.offsetWidth;
    track.classList.remove('no-transition');
  }
}

document.getElementById('next-button').addEventListener('click', function () {
  if (isAnimating) {
    return;
  }
  isAnimating = true;
  activeIndex = activeIndex + 1;
  updateCarousel(true);
});

document.getElementById('prev-button').addEventListener('click', function () {
  if (isAnimating) {
    return;
  }
  isAnimating = true;
  activeIndex = activeIndex - 1;
  updateCarousel(true);
});

track.addEventListener('transitionend', function (event) {
  if (event.target !== track) {
    return;
  }

  if (activeIndex >= total + cloneCount) {
    activeIndex = activeIndex - total;
    updateCarousel(false);
  } else if (activeIndex < cloneCount) {
    activeIndex = activeIndex + total;
    updateCarousel(false);
  }

  isAnimating = false;
});

window.addEventListener('resize', function () {
  updateCarousel(false);
});

updateCarousel(false);


//Responsividade
// menu
var menuButton = document.getElementById('menu-toggle');
var navMenu = document.getElementById('main-nav');
var navbar = document.getElementById('navbar');

function setMenu(isOpen) {
  navbar.classList.toggle('menu-open', isOpen);
  navMenu.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
}

menuButton.addEventListener('click', function () {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

document.querySelectorAll('#nav-list a').forEach(function (link) {
  link.addEventListener('click', function () {
    setMenu(false);
  });
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && navMenu.classList.contains('open')) {
    setMenu(false);
    menuButton.focus();
  }
});

//se clicar fora da navbar fecha o menu
document.addEventListener('click', function (event) {
  if (navMenu.classList.contains('open') && !navbar.contains(event.target)) {
    setMenu(false);
  }
});

var largeScreen = window.matchMedia('(min-width: 901px)');
largeScreen.addEventListener('change', function (event) {
  if (event.matches) {
    setMenu(false);
  }
});