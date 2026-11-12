// IC Immobilien Gruppe – gemeinsames Frontend-Verhalten
(function () {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  function onScroll() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (burger && mobileMenu) {
    function toggleMenu(open) {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
    }

    burger.addEventListener('click', function () {
      toggleMenu(!document.body.classList.contains('menu-open'));
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggleMenu(false);
      });
    });
  }

  const revealItems = document.querySelectorAll('.reveal:not(.in)');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('in');
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const button = contactForm.querySelector('button');
      if (!button) return;

      const originalText = button.innerHTML;
      button.innerHTML = 'Vielen Dank — wir melden uns ✓';
      button.style.background = 'var(--ic-deep)';
      contactForm.reset();

      window.setTimeout(function () {
        button.innerHTML = originalText;
      }, 3500);
    });
  }
})();

// Niederlassungen: Karte/Liste-Synchronisation und echte Detailseiten-Verlinkung
(function () {
  const OLD_DUESSELDORF_HASH = '#/niederlassungen/duesseldorf';
  const DUESSELDORF_URL = '/niederlassungen/duesseldorf/';

  if (window.location.pathname === '/' && window.location.hash === OLD_DUESSELDORF_HASH) {
    window.location.replace(DUESSELDORF_URL);
    return;
  }

  const rows = document.querySelectorAll('.branch-row');
  const pins = document.querySelectorAll('.pin');

  if (!rows.length && !pins.length) return;

  function setHot(city, on) {
    rows.forEach(function (row) {
      row.classList.toggle('hot', on && row.dataset.city === city);
    });
    pins.forEach(function (pin) {
      pin.classList.toggle('hot', on && pin.dataset.city === city);
    });
  }

  rows.forEach(function (row) {
    row.addEventListener('mouseenter', function () { setHot(row.dataset.city, true); });
    row.addEventListener('mouseleave', function () { setHot(row.dataset.city, false); });
  });

  pins.forEach(function (pin) {
    pin.addEventListener('mouseenter', function () { setHot(pin.dataset.city, true); });
    pin.addEventListener('mouseleave', function () { setHot(pin.dataset.city, false); });

    function activate() {
      if (pin.dataset.link) {
        window.location.href = pin.dataset.url || DUESSELDORF_URL;
      }
    }

    pin.addEventListener('click', activate);
    pin.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });
})();

