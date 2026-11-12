// Startseite – Lebenszyklus-Grafik: Phasen über Ring-Tabs auswählen.
(function () {
  'use strict';
  var root = document.querySelector('[data-lcr]');
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.lcr-tab'));
  var segs = root.querySelectorAll('.lcr-seg');
  var panels = root.querySelectorAll('.lcr-panel');

  function select(phase, focus) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-phase') === phase;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    segs.forEach(function (seg) { seg.classList.toggle('is-active', seg.getAttribute('data-phase') === phase); });
    panels.forEach(function (panel) { panel.hidden = panel.getAttribute('data-phase') !== phase; });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab.getAttribute('data-phase')); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next.getAttribute('data-phase'), true); }
    });
  });
  segs.forEach(function (seg) {
    seg.addEventListener('click', function () { select(seg.getAttribute('data-phase')); });
  });

  root.classList.add('is-ready');
  select('1');

  function draw() { root.classList.add('is-drawn'); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { requestAnimationFrame(draw); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(root);
  } else { draw(); }
})();
