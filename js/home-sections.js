/* A quiet paper index. All sections remain readable when JavaScript is unavailable. */
(function () {
  'use strict';
  var sections = Array.from(document.querySelectorAll('.home-page .paper-section'));
  if (!sections.length) return;
  var host = document.createElement('div');
  host.className = 'home-index';
  var nav = document.createElement('div');
  nav.className = 'home-index-nav';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Home sections');
  var panels = document.createElement('div');
  panels.className = 'home-index-panels';
  sections[0].before(host);
  host.appendChild(nav);
  host.appendChild(panels);
  var buttons = sections.map(function (section, i) {
    var heading = section.querySelector('h1');
    var title = heading.textContent.trim();
    if (title.indexOf('Academic Service') === 0) title = 'Service';
    if (title === 'Leadership Experience') title = 'Leadership';
    var button = document.createElement('button');
    button.className = 'home-index-tab';
    button.type = 'button';
    button.textContent = title;
    button.id = 'index-tab-' + i;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'index-panel-' + i);
    section.id = 'index-panel-' + i;
    section.setAttribute('role', 'tabpanel');
    section.setAttribute('aria-labelledby', button.id);
    section.tabIndex = 0;
    nav.appendChild(button);
    panels.appendChild(section);
    button.addEventListener('click', function () { select(i); });
    button.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight') next = (i + 1) % sections.length;
      if (event.key === 'ArrowLeft') next = (i + sections.length - 1) % sections.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = sections.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(next);
      buttons[next].focus({ preventScroll: true });
      buttons[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    return button;
  });
  function select(index) {
    sections.forEach(function (section, i) {
      section.hidden = i !== index;
      buttons[i].setAttribute('aria-selected', i === index ? 'true' : 'false');
      buttons[i].tabIndex = i === index ? 0 : -1;
    });
  }
  function revealHash() {
    var target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (error) { return; }
    var index = sections.findIndex(function (section) { return target && section.contains(target); });
    if (index !== -1) select(index);
  }
  select(0);
  revealHash();
  window.addEventListener('hashchange', revealHash);
}());
