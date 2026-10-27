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