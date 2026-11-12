// Regional topic navigation, shared only by Stuttgart and Chemnitz.
(function () {
  'use strict';
  const profile = document.querySelector('[data-regional-profile]');
  if (!profile) return;
  const tabs = Array.from(profile.querySelectorAll('[data-rg-tab]'));
  const panels = Array.from(profile.querySelectorAll('.rg-panel'));
  if (!tabs.length || tabs.length !== panels.length) return;
  function select(index, focus) {
    const current = (index + tabs.length) % tabs.length;
    tabs.forEach(function (tab, i) {
      tab.setAttribute('aria-selected', String(i === current));
      tab.tabIndex = i === current ? 0 : -1;
      panels[i].hidden = i !== current;
    });
    if (focus) {
      tabs[current].focus({ preventScroll: true });
      const strip = tabs[current].parentElement;
      if (strip.scrollWidth > strip.clientWidth) strip.scrollTo({left: tabs[current].offsetLeft - strip.offsetLeft, behavior:'auto'});
    }
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { select(index, false); });
    tab.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault(); select(index + (event.key === 'ArrowRight' ? 1 : -1), true);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault(); select(event.key === 'Home' ? 0 : tabs.length - 1, true);
      }
    });
  });
  const sources = document.querySelector('.rg-sources');
  profile.querySelectorAll('.rg-source-mark').forEach(function (link) {
    link.addEventListener('click', function () { if (sources) sources.open = true; });
  });
  if (sources && window.location.hash === '#rg-sources') sources.open = true;
  select(0, false);
  profile.setAttribute('data-ready', '');
})();
