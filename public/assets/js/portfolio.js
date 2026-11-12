// Portfolio page: chapter navigation state and the object detail dialog. No dependencies.
(function () {
  'use strict';
  const dataNode = document.getElementById('pf-data');
  if (!dataNode) return;
  let objects = [];
  try { objects = JSON.parse(dataNode.textContent); } catch (error) { return; }

  /* ---------- Chapter navigation: active chapter + scroll progress ---------- */
  const chapters = Array.from(document.querySelectorAll('[data-chapter]'));
  const navLinks = Array.from(document.querySelectorAll('[data-nav-for]'));
  const progress = document.querySelector('.pf-nav-progress');

  function updateNav() {
    const marker = window.innerHeight * 0.35;
    let activeId = null;
    chapters.forEach(function (chapter) {
      const rect = chapter.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) activeId = chapter.id;
    });
    navLinks.forEach(function (link) {
      const active = link.dataset.navFor === activeId;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (progress && chapters.length) {
      const start = chapters[0].getBoundingClientRect().top + window.scrollY - marker;
      const last = chapters[chapters.length - 1];
      const end = last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      const value = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
      progress.style.setProperty('--pf-progress', value.toFixed(4));
    }
  }
  let navFrame = null;
  window.addEventListener('scroll', function () {
    if (navFrame) return;
    navFrame = requestAnimationFrame(function () { navFrame = null; updateNav(); });
  }, { passive: true });
  window.addEventListener('resize', updateNav);
  updateNav();

  // Keep the active chapter chip visible in the horizontally scrolling nav (mobile).
  navLinks.forEach(function (link) {
    new MutationObserver(function () {
      if (!link.classList.contains('is-active')) return;
      const strip = link.parentElement;
      if (strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: link.offsetLeft - 16, behavior: 'smooth' });
    }).observe(link, { attributes: true, attributeFilter: ['class'] });
  });

  /* ---------- Object dialog ---------- */
  const dialog = document.getElementById('pf-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const el = function (id) { return document.getElementById(id); };
  const media = dialog.querySelector('.pf-d-media');
  const body = dialog.querySelector('.pf-d-body');
  const img = el('pf-d-img');
  let current = -1;
  let opener = null;

  function restart(node) {
    node.classList.remove('is-changing');
    void node.offsetWidth;
    node.classList.add('is-changing');
  }

  function render(index) {
    current = (index + objects.length) % objects.length;
    const item = objects[current];
    img.onerror = function () { media.classList.add('pf-img-missing'); img.style.visibility = 'hidden'; };
    img.style.visibility = '';
    media.classList.remove('pf-img-missing');
    img.src = item.img;
    img.alt = item.name + ', ' + item.city;
    el('pf-d-chapter').textContent = item.chapter;
    el('pf-d-counter').textContent = String(current + 1).padStart(2, '0') + ' / ' + String(objects.length).padStart(2, '0');
    el('pf-d-type').textContent = item.type;
    el('pf-d-city').textContent = item.city;
    el('pf-d-title').textContent = item.name;
    el('pf-d-lead').textContent = item.lead;
    el('pf-d-desc').textContent = item.desc;

    const specs = el('pf-d-specs');
    specs.textContent = '';
    item.specs.forEach(function (spec) {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = spec[0];
      dd.textContent = spec[1];
      row.append(dt, dd);
      specs.append(row);
    });

    const services = el('pf-d-services');
    const servicesWrap = services.closest('.pf-d-services');
    services.textContent = '';
    item.services.forEach(function (service) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = service[1];
      a.textContent = service[0];
      li.append(a);
      services.append(li);
    });
    if (servicesWrap) servicesWrap.hidden = item.services.length === 0;

    const page = el('pf-d-page');
    if (page) {
      if (item.page) { page.href = item.page; page.hidden = false; }
      else { page.hidden = true; page.removeAttribute('href'); }
    }

    body.scrollTop = 0;
    dialog.scrollTop = 0;
    restart(media);
    restart(body);

    // Warm up the neighbours so browsing feels instant.
    [current - 1, current + 1].forEach(function (n) {
      const next = objects[(n + objects.length) % objects.length];
      const preload = new Image();
      preload.src = next.img;
    });
    if (history.replaceState) history.replaceState(null, '', '#objekt-' + item.id);
  }

  function open(id, trigger) {
    const index = objects.findIndex(function (item) { return item.id === id; });
    if (index < 0) return;
    opener = trigger || null;
    render(index);
    if (!dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add('pf-locked');
    }
    dialog.querySelector('.pf-d-close').focus({ preventScroll: true });
  }

  function close() { if (dialog.open) dialog.close(); }

  document.querySelectorAll('[data-object]').forEach(function (trigger) {
    trigger.addEventListener('click', function () { open(trigger.dataset.object, trigger); });
  });
  dialog.querySelector('.pf-d-close').addEventListener('click', close);
  dialog.querySelector('.pf-d-prev').addEventListener('click', function () { render(current - 1); });
  dialog.querySelector('.pf-d-next').addEventListener('click', function () { render(current + 1); });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('keydown', function (event) {
    if (event.target.closest('a')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); render(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); render(current - 1); }
  });
  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('pf-locked');
    if (history.replaceState) history.replaceState(null, '', window.location.pathname + window.location.search);
    // Return focus to the card of the object last shown, so keyboard users keep their place.
    const last = objects[current];
    const target = last && document.querySelector('.pf-card-hit[data-object="' + last.id + '"], .pf-feature-open[data-object="' + last.id + '"]');
    const focusTarget = target || opener;
    if (focusTarget) focusTarget.focus();
  });

  // Deep link: /objekte/#objekt-<id> opens that object directly.
  const match = window.location.hash.match(/^#objekt-([a-z0-9-]+)$/);
  if (match) open(match[1], null);
})();
