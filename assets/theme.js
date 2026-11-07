/* Light/dark switch (the bulb in the header). The choice is saved in this browser only (localStorage) and applied before the page paints
   by a tiny script in the page head. Until a visitor chooses, the page follows the system setting. */
(function () {
  'use strict';
  var d = document.documentElement;
  var btn = document.querySelector('.bulb');
  if (!btn) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function current() { return d.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }

  function paint(t) {
    d.setAttribute('data-theme', t);
    btn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
    var meta = document.getElementById('tc');
    if (meta) meta.setAttribute('content', t === 'light' ? '#F4F2EC' : '#0D0F11');
  }

  function stored() {
    try { var v = localStorage.getItem('theme'); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; }
  }

  paint(current());

  /* A short pull on the cord (or a small press on narrow screens), only when motion is allowed. */
  function pull() {
    var M = window.Motion;
    if (!M || !M.animate || reduce) return;
    var cord = document.querySelector('.cord');
    var hanging = cord && window.getComputedStyle(cord).display !== 'none';
    if (hanging) M.animate(btn.parentNode, { y: [0, 12, 0] }, { duration: 0.5, ease: [0.3, 1.5, 0.5, 1] });
    else M.animate(btn, { scale: [1, 0.88, 1] }, { duration: 0.3 });
  }

  btn.addEventListener('click', function () {
    var next = current() === 'light' ? 'dark' : 'light';
    if (!reduce) {
      d.classList.add('theme-fade');
      setTimeout(function () { d.classList.remove('theme-fade'); }, 450);
    }
    pull();
    paint(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* the choice just will not be remembered */ }
  });

  /* Follow the system setting only while the visitor has not chosen. */
  try {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var onChange = function (e) { if (!stored()) paint(e.matches ? 'light' : 'dark'); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  } catch (e) { /* optional */ }
})();
