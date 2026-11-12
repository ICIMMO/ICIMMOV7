// Keep the location map card aligned with the seven-row list, including font loading.
(function () {
  'use strict';
  var section = document.getElementById('niederlassungen');
  if (!section) return;
  var list = section.querySelector('.branches-copy');
  var map = section.querySelector('.branch-map');
  if (!list || !map) return;
  var desktop = window.matchMedia('(min-width: 761px)');
  function alignMap() {
    if (!desktop.matches) { map.style.removeProperty('height'); return; }
    var height = Math.ceil(list.getBoundingClientRect().height);
    if (height > 0 && map.style.height !== height + 'px') map.style.height = height + 'px';
  }
  if ('ResizeObserver' in window) new ResizeObserver(alignMap).observe(list);
  window.addEventListener('resize', alignMap, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignMap);
  alignMap();
})();
