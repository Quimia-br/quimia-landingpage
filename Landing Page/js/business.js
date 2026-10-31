const QUIMIA_LINKS = Object.freeze({
  userPage: { url: 'index.html', newTab: false },
  basicPlan: { url: 'https://quimia.app/', newTab: true },
  proPlan: { url: 'https://quimia.app/', newTab: true },
  enterpriseQuote: { url: 'mailto:quimia.app@gmail.com?subject=Or%C3%A7amento%20Quimia%20Enterprise', newTab: false },
  restrictedArea: { url: '', newTab: false }
});

(() => {
  document.querySelectorAll('[data-link]').forEach((element) => {
    const link = QUIMIA_LINKS[element.dataset.link];
    const fallback = element.getAttribute('href');

    if (link && link.url) {
      element.href = link.url;
      element.removeAttribute('aria-disabled');

      if (link.newTab) {
        element.target = '_blank';
        element.rel = 'noopener noreferrer';
      }
      return;
    }

    if (fallback && fallback !== '#') {
      return;
    }

    element.setAttribute('aria-disabled', 'true');
    element.addEventListener('click', (event) => {
      event.preventDefault();
    });
  });
})();

(() => {
  const tabList = document.getElementById('dashboard-tabs');

  if (!tabList) {
    return;
  }

  const tabs = Array.from(tabList.querySelectorAll('.dashboard-tab'));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  const keySteps = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

  const setFocusableTab = (focusTab) => {
    tabs.forEach((tab) => {
      tab.tabIndex = tab === focusTab ? 0 : -1;
    });
  };

  const selectTab = (selectedTab) => {
    tabs.forEach((tab, index) => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', String(isSelected));
      panels[index].classList.toggle('active', isSelected);
    });

    setFocusableTab(selectedTab);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      selectTab(tab);
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
      setFocusableTab(tabList.querySelector('.dashboard-tab.active'));
    }
  });
})();

(() => {
  const audienceLinks = document.querySelectorAll('.audience-button:not(.active)');
  const navLogo = document.getElementById('nav-logo');

  if (!audienceLinks.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'page-transition is-covering';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<img src="' + navLogo.getAttribute('src') + '" alt="" class="page-transition-logo" width="56" height="56">';
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.remove('is-covering');
  }, 150);

  audienceLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      event.preventDefault();
      overlay.classList.add('is-leaving', 'is-covering');
      setTimeout(() => {
        window.location.href = link.href;
      }, 700);
    });
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      overlay.classList.remove('is-leaving', 'is-covering');
    }
  });
})();

(() => {
  const faqButtons = document.querySelectorAll('.faq-button[aria-controls]');

  const setAnswerState = (button, isOpen) => {
    const answer = document.getElementById(button.getAttribute('aria-controls'));

    button.setAttribute('aria-expanded', String(isOpen));
    answer.inert = !isOpen;
  };

  faqButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      faqButtons.forEach((otherButton) => {
        setAnswerState(otherButton, false);
      });
      setAnswerState(button, !isOpen);
    });
  });
})();

(() => {
  const navbar = document.getElementById('navbar');
  const navMenu = document.getElementById('main-nav');
  const menuButton = document.getElementById('menu-toggle');

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
})();

/* Planos: no celular viram um carrossel e o plano recomendado abre centralizado */
(() => {
  const list = document.getElementById('plan-cards');

  if (!list) {
    return;
  }

  const cards = Array.from(list.querySelectorAll('.plan-card'));
  const carousel = window.matchMedia('(max-width: 768px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollLockMs = 600;
  let scrollLockUntil = 0;
  let scrollFrame = 0;

  const hint = document.createElement('p');
  hint.className = 'plan-hint';
  hint.textContent = 'Deslize para ver os outros planos';

  const hideHint = () => {
    hint.classList.add('is-hidden');
  };

  const dots = document.createElement('div');
  dots.className = 'plan-dots';

  const dotButtons = cards.map((card) => {
    const dot = document.createElement('button');

    dot.type = 'button';
    dot.className = 'plan-dot';
    dot.textContent = card.querySelector('.plan-name').textContent.trim();
    dot.addEventListener('click', () => {
      hideHint();
      scrollToCard(card, false);
      setActive(card);
    });
    dots.appendChild(dot);

    return dot;
  });

  list.after(hint, dots);
  list.addEventListener('pointerdown', hideHint, { once: true });

  const setActive = (activeCard) => {
    dotButtons.forEach((dot, index) => {
      const isActive = cards[index] === activeCard;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', String(isActive));
    });
  };

  const scrollToCard = (card, instant) => {
    scrollLockUntil = performance.now() + (instant ? 0 : scrollLockMs);
    list.scrollTo({
      left: card.offsetLeft - (list.clientWidth - card.offsetWidth) / 2,
      behavior: instant || reducedMotion.matches ? 'auto' : 'smooth'
    });
  };

  list.addEventListener('scroll', () => {
    if (!carousel.matches || scrollFrame || performance.now() < scrollLockUntil) {
      return;
    }

    scrollFrame = requestAnimationFrame(() => {
      const middle = list.scrollLeft + list.clientWidth / 2;
      let nearest = cards[0];
      let nearestDistance = Infinity;

      scrollFrame = 0;

      cards.forEach((card) => {
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = card;
        }
      });

      setActive(nearest);
    });
  });

  const recommended = list.querySelector('.plan-card.pro') || cards[0];

  const showRecommended = () => {
    scrollToCard(recommended, true);
    setActive(recommended);
  };

  carousel.addEventListener('change', () => {
    if (carousel.matches) {
      showRecommended();
    }
  });

  setActive(recommended);

  if (carousel.matches) {
    showRecommended();
  }
})();
