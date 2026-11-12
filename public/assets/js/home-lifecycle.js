// Independent phase selection: property phases may overlap. No automatic sequence.
(function () {
  'use strict';
  var choices = document.querySelectorAll('#leistungen [data-lc-select]');
  choices.forEach(function (button) {
    button.addEventListener('click', function () {
      var selected = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(selected));
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
  });
})();
