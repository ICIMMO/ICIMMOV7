// IC mega navigation. Native links and details; no framework or external dependencies.
(function () {
  'use strict';
  const header = document.querySelector('.ic-header');
  if (!header) return;
  const groups = Array.from(header.querySelectorAll('[data-nav-group]'));
  const backdrop = document.querySelector('.ic-nav-backdrop');
  const toggle = document.getElementById('ic-mobile-toggle');
  const mobile = document.getElementById('ic-mobile-nav');
  const desktop = window.matchMedia('(min-width: 1101px)');
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let active = null;
  let openTimer;
  let closeTimer;
  let suppressFocus = false;
  let mobileOpen = false;
  let hoverOpened = false;
  let previousInert = [];
  header.setAttribute('data-ready', '');

  function cancelTimers() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
  }
  function closeMega(restoreFocus) {
    cancelTimers();
    const previous = active;
    if (previous) {
      previous.querySelector('.ic-expand').setAttribute('aria-expanded', 'false');
      previous.querySelector('.ic-mega').hidden = true;
      previous.classList.remove('is-open');
    }
    active = null;
    hoverOpened = false;
    header.classList.remove('ic-nav-open');
    backdrop.hidden = true;
    if (restoreFocus && previous) {
      suppressFocus = true;
      previous.querySelector('.ic-primary-link').focus();
      suppressFocus = false;
    }
  }
  function openMega(group, focusFirst) {
    cancelTimers();
    if (!desktop.matches || mobileOpen) return;
    if (active !== group) {
      closeMega(false);
      active = group;
      group.querySelector('.ic-mega').hidden = false;
      group.querySelector('.ic-expand').setAttribute('aria-expanded', 'true');
      group.classList.add('is-open');
      header.classList.add('ic-nav-open');
      backdrop.hidden = false;
    }
    if (focusFirst) group.querySelector('.ic-mega a').focus();
  }
  groups.forEach(function (group) {
    const button = group.querySelector('.ic-expand');
    group.addEventListener('pointerenter', function (event) {
      if (!hover.matches || event.pointerType === 'touch') return;
      cancelTimers();
      openTimer = setTimeout(function () {
        const wasOpen = active === group;
        openMega(group, false);
        if (!wasOpen && active === group) hoverOpened = true;
      }, 100);
    });
    group.addEventListener('pointerleave', function () {
      cancelTimers();
      closeTimer = setTimeout(function () {
        if (active === group && !group.contains(document.activeElement)) closeMega(false);
      }, 220);
    });
    // Leistungen and Niederlassungen are pure dropdown triggers. A click right after
    // the hover preview keeps the menu open instead of closing it again.
    button.addEventListener('click', function () {
      if (active === group && !hoverOpened) closeMega(false);
      else openMega(group, false);
      hoverOpened = false;
    });
    group.addEventListener('focusout', function (event) {
      if (active === group && !group.contains(event.relatedTarget)) closeMega(false);
    });
    group.querySelector('.ic-trigger-row').addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openMega(group, true);
      }
    });
  });

  function setMobile(open, restoreFocus) {
    cancelTimers();
    if (open && desktop.matches) return;
    closeMega(false);
    mobileOpen = open;
    mobile.hidden = !open;
    header.classList.toggle('ic-mobile-open', open);
    document.body.classList.toggle('ic-navigation-locked', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Navigation schließen' : 'Navigation öffnen');
    toggle.querySelector('.ic-toggle-label').textContent = open ? 'Schließen' : 'Menü';
    if (open) {
      previousInert = Array.from(document.body.children)
        .filter(function (element) { return element !== header && !['SCRIPT', 'STYLE', 'LINK'].includes(element.tagName); })
        .map(function (element) { const state = [element, element.inert]; element.inert = true; return state; });
      mobile.querySelector('summary').focus();
    } else {
      previousInert.forEach(function (entry) { entry[0].inert = entry[1]; });
      previousInert = [];
      mobile.querySelectorAll('details[open]').forEach(function (item) { item.open = false; });
      if (restoreFocus) toggle.focus();
    }
  }
  toggle.addEventListener('click', function () { setMobile(!mobileOpen, mobileOpen); });
  mobile.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMobile(false, true); });
  });
  // One expanded mobile section keeps the long navigation easy to scan.
  mobile.querySelectorAll('details').forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) mobile.querySelectorAll('details').forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (mobileOpen) { event.preventDefault(); setMobile(false, true); }
      else if (active) { event.preventDefault(); closeMega(true); }
    }
    if (event.key === 'Tab' && mobileOpen) {
      const focusable = Array.from(header.querySelectorAll('a[href],button,summary'))
        .filter(function (element) { return element.getClientRects().length > 0; });
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('pointerdown', function (event) {
    if (active && !header.contains(event.target)) closeMega(true);
  });
  header.querySelectorAll('.ic-desktop-nav > a').forEach(function (link) {
    link.addEventListener('pointerenter', function () { closeMega(false); });
    link.addEventListener('focus', function () { closeMega(false); });
  });
  desktop.addEventListener('change', function () {
    const hadMobileFocus = mobileOpen && header.contains(document.activeElement);
    const hadMegaFocus = active && active.querySelector('.ic-mega').contains(document.activeElement);
    closeMega(false);
    if (mobileOpen) setMobile(false, false);
    if (hadMobileFocus && desktop.matches) header.querySelector('.ic-brand').focus();
    if (hadMegaFocus && !desktop.matches) toggle.focus();
  });
  window.addEventListener('pagehide', function () {
    closeMega(false);
    if (mobileOpen) setMobile(false, false);
  });
  function syncScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
  syncScroll();
  window.addEventListener('scroll', syncScroll, { passive: true });
  const current = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  header.querySelectorAll('a[href]').forEach(function (link) {
    const path = new URL(link.href, window.location.href).pathname.replace(/\/$/, '') || '/';
    if (!link.hash && current === path) link.setAttribute('aria-current', 'page');
    if (link.classList.contains('ic-primary-link') && path !== '/' && (current === path || current.startsWith(path + '/'))) link.classList.add('is-current');
  });
  // Mark the dropdown trigger when the current page belongs to its section.
  groups.forEach(function (group) {
    const base = '/' + group.getAttribute('data-nav-group');
    if (current === base || current.startsWith(base + '/')) group.querySelector('.ic-primary-link').classList.add('is-current');
  });
})();
