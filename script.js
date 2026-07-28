(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });

  nav.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      setActive(event.target.getAttribute('href').slice(1));
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const targets = [
    { id: 'about', element: document.querySelector('#about') },
    { id: 'skills', element: document.querySelector('#skills') },
    { id: 'experience', element: document.querySelector('#experience') },
    { id: 'games', element: document.querySelector('#games') },
    { id: 'games', element: document.querySelector('#minesweeper') },
    { id: 'contact', element: document.querySelector('#contact') }
  ].filter((target) => target.element);

  function setActive(id) {
    links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  }

  function syncActiveSection() {
    if (window.scrollY < 160) { setActive('top'); return; }
    const marker = window.innerHeight * 0.35;
    const visible = targets.filter(({ element }) => {
      const rect = element.getBoundingClientRect();
      return rect.top <= marker && rect.bottom >= marker;
    });
    if (visible.length) setActive(visible[visible.length - 1].id);
  }

  window.addEventListener('scroll', syncActiveSection, { passive: true });
  window.addEventListener('resize', syncActiveSection);
  syncActiveSection();
})();
