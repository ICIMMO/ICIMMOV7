/* IC Immobilien Gruppe – Relaunch V7 „Blueprint in Bewegung“
   Bewegungs- und Interaktionsschicht für alle Seiten.
   - verändert keine Inhalte: Texte werden höchstens in <span> gehüllt (Wort-Animation),
     Zahlen laufen hoch und enden exakt beim Originaltext.
   - alle Zusatz-Elemente sind rein dekorativ (aria-hidden).
   - bei „Bewegung reduzieren“ (prefers-reduced-motion) bleibt die Seite statisch. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var main = doc.querySelector('main') || doc.body;

  root.classList.add('v7-js');

  var HERO_SELECTOR = [
    '.hero', '.service-hero', '.let-hero', '.inv-hero', '.ta-hero', '.pf-hero', '.nl-hero',
    '.kr-hero', '.kd-hero', '.job-hero', '.obj-hero', '.leadership-hero'
  ].join(',');

  function el(tag, cls) {
    var node = doc.createElement(tag);
    if (cls) node.className = cls;
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  function isVisible(node) {
    if (!node || !node.getClientRects().length) return false;
    var r = node.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /* ------------------------------------------------------------------ */
  /* 1. Scroll-Fortschritt                                               */
  /* ------------------------------------------------------------------ */
  (function progress() {
    var bar = el('div', 'v7-progress');
    doc.body.appendChild(bar);
    var ticking = false;
    function update() {
      ticking = false;
      var max = root.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.setProperty('--p', p.toFixed(4));
      root.classList.toggle('v7-scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  })();

  /* ------------------------------------------------------------------ */
  /* 2. Hero: Blueprint-Linien, Lichtkegel                               */
  /* ------------------------------------------------------------------ */
  var heroes = Array.prototype.slice.call(doc.querySelectorAll(HERO_SELECTOR)).filter(function (h) {
    return !h.parentElement.closest(HERO_SELECTOR);
  });

  heroes.forEach(function (hero) {
    hero.classList.add('v7-hero');
    if (getComputedStyle(hero).position === 'static') hero.classList.add('v7-rel');
    // Helle oder dunkle Bühne? Maßgeblich ist die Schriftfarbe der Überschrift.
    var title = hero.querySelector('h1') || hero;
    var rgb = (getComputedStyle(title).color.match(/[\d.]+/g) || [0, 0, 0]).map(parseFloat);
    var bright = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255 > 0.6;
    hero.classList.add(bright ? 'v7-hero--dark' : 'v7-hero--light');
    var fx = el('div', 'v7-hero-fx');
    fx.innerHTML =
      '<span class="v7-beam v7-beam--a"></span><span class="v7-beam v7-beam--b"></span>' +
      '<span class="v7-ln v7-ln--v v7-ln--l"><i></i></span>' +
      '<span class="v7-ln v7-ln--v v7-ln--r"><i></i></span>' +
      '<span class="v7-ln v7-ln--h"><i></i></span>' +
      '<span class="v7-cross v7-cross--l"></span><span class="v7-cross v7-cross--r"></span>';
    hero.insertBefore(fx, hero.firstChild);
  });

  /* ------------------------------------------------------------------ */
  /* 3. Cursor-Licht auf dunklen Flächen                                 */
  /* ------------------------------------------------------------------ */
  function isDark(node) {
    var m = getComputedStyle(node).backgroundColor.match(/rgba?\(([^)]+)\)/);
    if (!m) return false;
    var c = m[1].split(',').map(parseFloat);
    if (c.length > 3 && c[3] < 0.6) return false;
    var lum = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
    return lum < 0.36;
  }

  if (finePointer && !reduce) {
    var zones = heroes.filter(function (h) { return h.classList.contains('v7-hero--dark'); });
    Array.prototype.forEach.call(doc.querySelectorAll('main section, footer.site-footer'), function (s) {
      if (heroes.indexOf(s) === -1 && !s.closest('.v7-hero') && isDark(s)) zones.push(s);
    });
    zones.forEach(function (zone) {
      var cs = getComputedStyle(zone);
      if (cs.position === 'static') zone.classList.add('v7-rel');
      var holder = el('div', 'v7-light');
      var spot = el('span', 'v7-light-spot');
      holder.appendChild(spot);
      zone.insertBefore(holder, zone.firstChild);
      var tx = 0, ty = 0, x = 0, y = 0, raf = 0, active = false;
      function loop() {
        x += (tx - x) * 0.12; y += (ty - y) * 0.12;
        spot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
        if (active || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) raf = requestAnimationFrame(loop);
        else raf = 0;
      }
      zone.addEventListener('pointermove', function (e) {
        var r = zone.getBoundingClientRect();
        tx = e.clientX - r.left; ty = e.clientY - r.top;
        if (!active) { active = true; x = tx; y = ty; holder.classList.add('is-on'); }
        if (!raf) raf = requestAnimationFrame(loop);
      }, { passive: true });
      zone.addEventListener('pointerleave', function () {
        active = false; holder.classList.remove('is-on');
      }, { passive: true });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Überschriften: Wort-für-Wort                                     */
  /* ------------------------------------------------------------------ */
  function splitWords(heading) {
    if (heading.classList.contains('v7-split')) return;
    var walker = doc.createTreeWalker(heading, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    var index = 0;
    nodes.forEach(function (textNode) {
      var text = textNode.nodeValue;
      if (!text || !/\S/.test(text)) return;
      var frag = doc.createDocumentFragment();
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); return; }
        var span = doc.createElement('v7-w'); // eigenes Element: bestehende „h1 span“-Regeln greifen nicht
        span.className = 'v7-w';
        // Nur kurze Wörter ohne Trennstellen als Block bewegen – lange Wörter behalten ihren Umbruch.
        if (part.length <= 12 && !/[-­‑/]/.test(part)) span.className += ' v7-w--b';
        span.style.setProperty('--i', index++);
        span.textContent = part;
        frag.appendChild(span);
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
    heading.classList.add('v7-split');
  }

  var headings = [];
  if (!reduce && hasIO) {
    Array.prototype.forEach.call(main.querySelectorAll('h1, h2'), function (h) {
      if (h.closest('[hidden]') || !isVisible(h)) return;
      if (h.textContent.length > 160) return;
      splitWords(h);
      headings.push(h);
    });
  }
  root.classList.add('v7-split-done');

  /* ------------------------------------------------------------------ */
  /* 5. Gestaffelte Einblendung von Rastern und Bildern                  */
  /* ------------------------------------------------------------------ */
  var staggerItems = [];
  var imageItems = [];

  if (!reduce && hasIO) {
    var vh = window.innerHeight;
    var containers = doc.querySelectorAll('main *, footer.site-footer .sf-grid');
    Array.prototype.forEach.call(containers, function (box) {
      var count = box.children.length;
      if (count < 2 || count > 14) return;
      if (box.closest('.ic-header, .v7-hero-fx, svg, [hidden], [role="tablist"], .lcr-cycle')) return;
      var cs = getComputedStyle(box);
      var isGrid = cs.display === 'grid' || cs.display === 'inline-grid';
      var isFlex = (cs.display === 'flex' || cs.display === 'inline-flex');
      if (!isGrid && !isFlex) return;
      if (!isVisible(box)) return;
      var kids = Array.prototype.slice.call(box.children).filter(function (kid) {
        if (kid.classList.contains('reveal') || kid.classList.contains('v7-item')) return false;
        if (kid.hasAttribute('hidden') || kid.hasAttribute('aria-hidden')) return false;
        if (/^(SVG|SCRIPT|STYLE|BR)$/i.test(kid.tagName)) return false;
        var r = kid.getBoundingClientRect();
        if (r.width < 96 || r.height < 44 || r.height > vh * 1.4) return false;
        var kcs = getComputedStyle(kid);
        if (kcs.position === 'absolute' || kcs.position === 'fixed' || kcs.position === 'sticky') return false;
        if (kcs.display === 'none' || kcs.display === 'contents' || kcs.display === 'inline') return false;
        return true;
      });
      if (kids.length < 2) return;
      kids.forEach(function (kid) {
        // Bereits sichtbare Elemente oberhalb der Falz nicht nachträglich ausblenden (kein Flackern).
        var r = kid.getBoundingClientRect();
        if (r.top < vh * 0.92) return;
        kid.classList.add('v7-item', 'v7-wait');
        staggerItems.push(kid);
      });
    });

    Array.prototype.forEach.call(main.querySelectorAll('img'), function (img) {
      if (img.closest('.v7-hero, .ic-header, [hidden]')) return;
      var r = img.getBoundingClientRect();
      if (r.width < 220 || r.height < 140) return;
      if (r.top < vh * 0.92) return;
      if (img.complete && img.naturalWidth === 0) return;
      img.classList.add('v7-img', 'v7-wait');
      imageItems.push(img);
    });
  }

  function play(node, delay, cls) {
    node.style.setProperty('--v7-delay', delay + 'ms');
    node.classList.remove('v7-wait');
    node.classList.add(cls);
    var done = function () {
      node.classList.remove(cls);
      node.style.removeProperty('--v7-delay');
      node.removeEventListener('animationend', onEnd);
    };
    var onEnd = function (e) { if (e.target === node) done(); };
    node.addEventListener('animationend', onEnd);
    window.setTimeout(done, delay + 1600);
  }

  if (hasIO && !reduce) {
    var itemObserver = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      batch.sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
      batch.forEach(function (node, i) {
        itemObserver.unobserve(node);
        play(node, Math.min(i, 8) * 80, node.classList.contains('v7-img') ? 'v7-img-in' : 'v7-in');
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    staggerItems.concat(imageItems).forEach(function (node) { itemObserver.observe(node); });

    // Sicherheitsnetz: Wird ein Element übersprungen (Sprungmarke, sehr schnelles Scrollen),
    // erscheint es ohne Animation – nichts bleibt unsichtbar.
    var pending = staggerItems.concat(imageItems);
    var sweepTimer = 0;
    function sweep() {
      sweepTimer = 0;
      pending = pending.filter(function (node) {
        if (!node.classList.contains('v7-wait')) return false;
        if (node.getBoundingClientRect().bottom < 0) {
          itemObserver.unobserve(node);
          node.classList.remove('v7-wait');
          return false;
        }
        return true;
      });
      if (!pending.length) window.removeEventListener('scroll', onSweepScroll);
    }
    function onSweepScroll() { if (!sweepTimer) sweepTimer = window.setTimeout(sweep, 180); }
    window.addEventListener('scroll', onSweepScroll, { passive: true });

    var headingObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('v7-said');
        headingObserver.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    window.addEventListener('scroll', function () {
      window.clearTimeout(headingObserver._t);
      headingObserver._t = window.setTimeout(function () {
        headings.forEach(function (h) {
          if (!h.classList.contains('v7-said') && h.getBoundingClientRect().bottom < 0) {
            h.classList.add('v7-said'); headingObserver.unobserve(h);
          }
        });
      }, 200);
    }, { passive: true });
    headings.forEach(function (h) { headingObserver.observe(h); });
  }

  /* ------------------------------------------------------------------ */
  /* 6. Zahlen hochzählen (Endwert = exakter Originaltext)               */
  /* ------------------------------------------------------------------ */
  (function counters() {
    if (reduce || !hasIO) return;
    var pattern = /^(\D*?)(\d{1,3}(?:\.\d{3})+|\d+)(\D*)$/;
    var found = [];
    Array.prototype.forEach.call(main.querySelectorAll('*'), function (node) {
      if (node.children.length || node.closest('svg, [hidden], .v7-w, h1, h2, a[href^="tel:"], address')) return;
      var text = node.textContent;
      if (!text || text.length > 16) return;
      var m = text.match(pattern);
      if (!m) return;
      var raw = m[2];
      if (raw.length > 1 && raw.charAt(0) === '0') return;            // Indizes wie 01, 02
      var value = parseInt(raw.replace(/\./g, ''), 10);
      if (value < 10) return;
      if (raw.length === 4 && value >= 1900 && value <= 2100) return;  // Jahreszahlen
      if (/[.,:/]\s*$/.test(m[1])) return;                               // Datums-/Dezimalreste
      if (parseFloat(getComputedStyle(node).fontSize) < 26) return;
      found.push({ node: node, text: text, pre: m[1], post: m[3], value: value, grouped: raw.indexOf('.') > -1 });
    });
    if (!found.length) return;

    function format(n, grouped) {
      var s = String(n);
      return grouped ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : s;
    }
    function run(item) {
      var start = performance.now();
      var duration = 1500;
      item.node.classList.add('v7-counting');
      function frame(now) {
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 4);
        if (t < 1) {
          item.node.textContent = item.pre + format(Math.round(item.value * eased), item.grouped) + item.post;
          requestAnimationFrame(frame);
        } else {
          item.node.textContent = item.text;
          item.node.classList.remove('v7-counting');
        }
      }
      requestAnimationFrame(frame);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        for (var i = 0; i < found.length; i++) if (found[i].node === entry.target) run(found[i]);
      });
    }, { threshold: 0.6 });
    found.forEach(function (item) { io.observe(item.node); });
  })();

  /* ------------------------------------------------------------------ */
  /* 7. Magnetische Buttons & Karten-Neigung                             */
  /* ------------------------------------------------------------------ */
  if (finePointer && !reduce) {
    Array.prototype.forEach.call(doc.querySelectorAll('main .btn, .sf-btn, .ic-nav-contact'), function (btn) {
      btn.classList.add('v7-magnet');
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.translate = (dx * 8).toFixed(1) + 'px ' + (dy * 6).toFixed(1) + 'px';
      }, { passive: true });
      btn.addEventListener('pointerleave', function () { btn.style.translate = ''; }, { passive: true });
    });

    Array.prototype.forEach.call(doc.querySelectorAll('.home-page .asset-card'), function (card) {
      card.classList.add('v7-tilt');
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--rx', ((0.5 - py) * 5).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((px - 0.5) * 6).toFixed(2) + 'deg');
        card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        card.style.removeProperty('--rx'); card.style.removeProperty('--ry');
      }, { passive: true });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 8. Startseite: Lebenszyklus läuft selbstständig durch die Phasen    */
  /* ------------------------------------------------------------------ */
  (function lifecycle() {
    var ring = doc.querySelector('[data-lcr]');
    if (!ring || reduce || !hasIO) return;
    var tabs = Array.prototype.slice.call(ring.querySelectorAll('.lcr-tab'));
    if (tabs.length < 2) return;
    var stopped = false, inView = false, hovering = false, timer = 0;
    function stop() { stopped = true; window.clearInterval(timer); ring.classList.remove('v7-auto'); }
    ['pointerdown', 'keydown', 'focusin', 'touchstart'].forEach(function (type) {
      ring.addEventListener(type, function (e) { if (e.isTrusted) stop(); }, { passive: true });
    });
    ring.addEventListener('pointerenter', function () { hovering = true; });
    ring.addEventListener('pointerleave', function () { hovering = false; });
    function next() {
      if (stopped || !inView || hovering || doc.hidden) return;
      var current = 0;
      tabs.forEach(function (tab, i) { if (tab.getAttribute('aria-selected') === 'true') current = i; });
      tabs[(current + 1) % tabs.length].click();
    }
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView && !stopped && !timer) {
        ring.classList.add('v7-auto');
        timer = window.setInterval(next, 5200);
      }
    }, { threshold: 0.45 }).observe(ring);
  })();

  /* ------------------------------------------------------------------ */
  /* 9. Auftakt: Vorhang auf der Startseite (einmal pro Sitzung)         */
  /* ------------------------------------------------------------------ */
  function ready() {
    root.classList.remove('v7-intro');
    root.classList.add('v7-ready');
  }

  (function intro() {
    if (!root.classList.contains('v7-intro') || reduce) { ready(); return; }
    try { sessionStorage.setItem('v7-intro', '1'); } catch (e) { /* ohne Speicher: Vorhang bei jedem Aufruf */ }
    var curtain = el('div', 'v7-curtain');
    var logo = doc.querySelector('.ic-brand svg');
    if (logo) {
      var clone = logo.cloneNode(true);
      clone.removeAttribute('id');
      clone.setAttribute('class', 'v7-curtain-logo');
      curtain.appendChild(clone);
    }
    curtain.appendChild(el('span', 'v7-curtain-line'));
    doc.body.appendChild(curtain);
    root.classList.add('v7-curtain-on');
    window.setTimeout(function () { curtain.classList.add('is-leaving'); ready(); }, 1150);
    window.setTimeout(function () {
      if (curtain.parentNode) curtain.parentNode.removeChild(curtain);
      root.classList.remove('v7-curtain-on');
    }, 2100);
  })();
})();
