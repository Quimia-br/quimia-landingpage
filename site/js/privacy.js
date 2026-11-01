// Índice: aberto e fixo em telas largas, recolhível em telas menores
(() => {
  const details = document.getElementById('privacy-toc-details');
  const summary = details.querySelector('summary');
  const wideScreen = window.matchMedia('(min-width: 1101px)');

  const syncDetails = () => {
    details.open = wideScreen.matches;
  };

  summary.addEventListener('click', (event) => {
    if (wideScreen.matches) {
      event.preventDefault();
    }
  });

  wideScreen.addEventListener('change', syncDetails);
  syncDetails();
})();

// Índice: destaca a seção que está sendo lida
(() => {
  const links = Array.from(document.querySelectorAll('#privacy-toc a'));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!links.length || !('IntersectionObserver' in window)) {
    return;
  }

  const setActive = (id) => {
    links.forEach((link) => {
      const isActive = link.getAttribute('href') === '#' + id;

      link.classList.toggle('is-active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (visible.length) {
      setActive(visible[0].target.id);
    }
  }, { rootMargin: '-90px 0px -65% 0px', threshold: 0 });

  sections.forEach((section) => observer.observe(section));
})();
