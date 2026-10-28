const QUIMIA_LINKS = Object.freeze({
  userPage: { url: 'index.html', newTab: false },
  basicPlan: { url: '', newTab: false },
  proPlan: { url: '', newTab: false },
  enterpriseQuote: { url: 'mailto:quimia.app@gmail.com?subject=Or%C3%A7amento%20Quimia%20Enterprise', newTab: false },
  restrictedArea: { url: '', newTab: false },
  privacyPolicy: { url: '', newTab: true }
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
  const faqButtons = document.querySelectorAll('.faq-button[aria-controls]');

  faqButtons.forEach((button) => {
    const answer = document.getElementById(button.getAttribute('aria-controls'));

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
    });
  });
})();