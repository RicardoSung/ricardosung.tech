/* An optional, self-contained Macintosh opening. The real page is always underneath. */
(function () {
  'use strict';
  var root = document.documentElement;
  var intro = document.getElementById('mac-intro');
  var page = document.getElementById('site-content');
  if (!intro || !page) return;
  var computer = document.getElementById('mac-computer');
  var camera = document.getElementById('mac-camera');
  var screen = document.getElementById('mac-screen');
  var floppy = document.getElementById('mac-floppy');
  var boot = document.getElementById('mac-boot');
  var step = document.getElementById('intro-step');
  var progress = document.getElementById('intro-progress');
  var skip = document.getElementById('intro-skip');
  var replay = document.querySelector('[data-replay-intro]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Give each movement and the boot text the same, more leisurely rhythm.
  var pace = 1.6;
  var controller = null;
  var animations = new Set();
  var generation = 0;
  var running = false;
  var previousFocus = null;

  function wait(ms, signal) {
    return new Promise(function (resolve) {
      if (signal.aborted) { resolve(false); return; }
      var timer = setTimeout(function () { signal.removeEventListener('abort', stop); resolve(true); }, Math.round(ms * pace));
      function stop() { clearTimeout(timer); resolve(false); }
      signal.addEventListener('abort', stop, { once: true });
    });
  }
  function animate(element, frames, options, signal) {
    if (signal.aborted) return Promise.resolve(false);
    options = Object.assign({}, options, { duration: Math.round(options.duration * pace) });
    var animation = element.animate(frames, Object.assign({ fill: 'forwards' }, options));
    animations.add(animation);
    return new Promise(function (resolve) {
      var settled = false;
      var timer = setTimeout(function () {
        // Some browsers suspend their animation timeline while the window is inactive.
        // Commit the final pose before advancing to the next scene.
        try { animation.finish(); } catch (error) { /* The page can still open. */ }
        settle(true);
      }, options.duration + 150);
      function settle(value) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal.removeEventListener('abort', stop);
        resolve(value);
      }
      function stop() { animation.cancel(); settle(false); }
      signal.addEventListener('abort', stop, { once: true });
      animation.finished.then(function () { settle(true); }, function () { settle(false); });
    });
  }
  function phase(name, label, percent) {
    intro.dataset.phase = name;
    step.textContent = label;
    progress.style.width = percent + '%';
  }
  function finish() {
    if (!running && !root.classList.contains('intro-pending')) return;
    running = false;
    generation++;
    var ownedFocus = intro.contains(document.activeElement);
    intro.hidden = true;
    root.classList.remove('intro-pending', 'intro-playing');
    page.inert = false;
    page.removeAttribute('aria-hidden');
    if (controller) controller.abort();
    animations.forEach(function (animation) { animation.cancel(); });
    animations.clear();
    clearTimeout(window.__macIntroFallback);
    if (!document.hidden && ownedFocus) {
      var focus = previousFocus && previousFocus.isConnected && !intro.contains(previousFocus) ? previousFocus : page;
      focus.focus({ preventScroll: true });
    }
  }
  async function start() {
    if (reduced.matches || !computer.animate || !camera.animate) { finish(); return; }
    if (running) finish();
    var ticket = ++generation;
    controller = new AbortController();
    var signal = controller.signal;
    running = true;
    previousFocus = document.activeElement;
    intro.classList.remove('is-exiting');
    camera.style.transformOrigin = '';
    boot.textContent = '';
    intro.hidden = false;
    root.classList.add('intro-pending', 'intro-playing');
    page.inert = true;
    page.setAttribute('aria-hidden', 'true');
    skip.focus({ preventScroll: true });
    clearTimeout(window.__macIntroFallback);
    window.__macIntroFallback = setTimeout(finish, 20000);
    function active() { return running && ticket === generation && !signal.aborted; }
    try {
      phase('rotate', '01 / STARTUP', 8);
      await animate(computer, [
        { transform: 'translate3d(-50%,-50%,0) rotateY(78deg) rotateX(-3deg)' },
        { transform: 'translate3d(-50%,-50%,0) rotateY(0deg) rotateX(0deg)' }
      ], { duration: 1850, easing: 'cubic-bezier(.22,.7,.25,1)' }, signal);
      if (!active()) return;
      await wait(180, signal);
      if (!active()) return;
      phase('insert', '02 / INSERTING HOME.DISK', 30);
      await animate(floppy, [
        { transform: 'translateZ(350px) rotateX(67deg)', opacity: 0, offset: 0 },
        { transform: 'translateZ(320px) rotateX(67deg)', opacity: 1, offset: .15 },
        { transform: 'translateZ(120px) rotateX(87deg)', opacity: 1, offset: .83 },
        { transform: 'translateZ(91px) rotateX(90deg)', opacity: 0, offset: 1 }
      ], { duration: 1050, easing: 'cubic-bezier(.4,0,.2,1)' }, signal);
      if (!active()) return;
      phase('boot', '03 / LOADING THE ARCHIVE', 48);
      var lines = [
        'FEI SYSTEM / 1.0',
        'Checking memory ........ OK',
        'Mounting HOME.DISK ...... OK',
        'Loading research notes ...',
        'Linking publications ... OK',
        'Preparing the paper desk ..',
        '> open /home'
      ];
      for (var i = 0; i < lines.length; i++) {
        if (!active()) return;
        boot.textContent += (i ? '\n' : '') + lines[i];
        progress.style.width = (48 + i * 5) + '%';
        await wait(i === lines.length - 1 ? 350 : 230, signal);
      }
      if (!active()) return;
      phase('desktop', '04 / WELCOME HOME', 88);
      await wait(480, signal);
      if (!active()) return;
      // Zoom about the actual screen centre, including the mobile scene scale.
      var bounds = screen.getBoundingClientRect();
      var centreX = bounds.left + bounds.width / 2;
      var centreY = bounds.top + bounds.height / 2;
      var scale = Math.max(window.innerWidth / bounds.width, window.innerHeight / bounds.height) * 1.14;
      camera.style.transformOrigin = centreX + 'px ' + centreY + 'px';
      phase('portal', '04 / WELCOME HOME', 100);
      await animate(camera, [
        { transform: 'translate3d(0,0,0) scale(1)' },
        { transform: 'translate3d(' + (window.innerWidth / 2 - centreX) + 'px,' + (window.innerHeight / 2 - centreY) + 'px,0) scale(' + scale + ')' }
      ], { duration: 1250, easing: 'cubic-bezier(.65,0,.25,1)' }, signal);
      if (!active()) return;
      root.classList.remove('intro-pending');
      intro.classList.add('is-exiting');
      await wait(550, signal);
      if (active()) finish();
    } catch (error) { if (active()) finish(); }
  }
  skip.addEventListener('click', finish);
  intro.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { event.preventDefault(); finish(); }
    if (event.key === 'Tab') { event.preventDefault(); skip.focus(); }
  });
  if (replay) {
    replay.hidden = reduced.matches;
    replay.addEventListener('click', start);
  }
  reduced.addEventListener('change', function () {
    if (replay) replay.hidden = reduced.matches;
    if (reduced.matches) finish();
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden && running) finish(); });
  window.addEventListener('pagehide', finish);
  if (root.classList.contains('intro-pending')) start();
}());
