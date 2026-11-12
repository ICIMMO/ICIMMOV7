// Karriere – Filter für die Stellenliste (Standort / Berufsfeld).
(function () {
  'use strict';
  var filter = document.querySelector('[data-kj-filter]');
  var list = document.querySelector('[data-kj-list]');
  if (!filter || !list) return;
  var items = Array.prototype.slice.call(list.querySelectorAll('.kj-item'));
  var count = filter.querySelector('[data-kj-count]');
  var empty = document.querySelector('[data-kj-empty]');
  var state = { ort: '', feld: '' };
  filter.hidden = false;

  function apply() {
    var shown = 0;
    items.forEach(function (item) {
      var ok = (!state.ort || item.getAttribute('data-ort') === state.ort) &&
               (!state.feld || item.getAttribute('data-feld') === state.feld);
      item.hidden = !ok;
      if (ok) shown++;
    });
    if (count) count.textContent = shown;
    if (count) count.nextSibling.textContent = shown === 1 ? ' Stelle' : ' Stellen';
    if (empty) empty.hidden = shown > 0;
  }

  filter.addEventListener('click', function (e) {
    var chip = e.target.closest('.kj-chip');
    if (!chip) return;
    var key = chip.getAttribute('data-filter');
    state[key] = chip.getAttribute('data-value');
    filter.querySelectorAll('.kj-chip[data-filter="' + key + '"]').forEach(function (c) {
      c.setAttribute('aria-pressed', String(c === chip));
    });
    apply();
  });
  apply();
})();

// Karriere – Werdegänge: Personenauswahl als Tabs.
// Maus: kurzes Verweilen über einer Person wechselt die Bühne (kein Flackern beim Drüberfahren).
// Klick/Tipp und Tastatur (Pfeiltasten, Pos1/Ende) funktionieren ebenfalls.
(function () {
  'use strict';
  var root = document.querySelector('[data-kp]');
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.kp-tab'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('.kp-panel'));
  var hoverTimer = null;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

  function select(i, focus) {
    if (i < 0 || i >= tabs.length) return;
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (panels[k]) panels[k].classList.toggle('is-active', on);
    });
    if (focus) tabs[i].focus();
    if (!canHover && tabs[i].scrollIntoView) {
      tabs[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(i); });
    if (canHover) {
      tab.addEventListener('mouseenter', function () {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(function () { select(i); }, 140);
      });
      tab.addEventListener('mouseleave', function () { clearTimeout(hoverTimer); });
    }
    tab.addEventListener('keydown', function (e) {
      var k = e.key, n = tabs.length, next = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % n;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + n) % n;
      else if (k === 'Home') next = 0;
      else if (k === 'End') next = n - 1;
      if (next !== null) { e.preventDefault(); select(next, true); }
    });
  });
})();

// Karriere – Links aus dem Einstieg-Abschnitt (data-kp-goto="<person>") springen zu den
// Werdegängen und öffnen dort direkt die passende Person.
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-kp-goto]');
    if (!link) return;
    var tab = document.querySelector('.kp-tab[data-person="' + link.getAttribute('data-kp-goto') + '"]');
    if (!tab) return;
    e.preventDefault();
    tab.click();
    var target = document.querySelector('.kp-tabs') || tab;
    var y = target.getBoundingClientRect().top + window.pageYOffset - 120;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
})();
