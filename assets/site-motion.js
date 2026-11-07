/* Motion layer for the portfolio. Uses the self-hosted Motion build (motion-14.5.0.min.js, global "Motion").
   Rules: content is always readable without this file; nothing animates for visitors who ask for reduced motion;
   every effect is short and only moves things into place. */
(function () {
  'use strict';
  var html = document.documentElement;
  var M = window.Motion;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showAll() {
    html.classList.remove('hero-anim');
    var hidden = document.querySelectorAll('[data-rv]');
    for (var i = 0; i < hidden.length; i++) hidden[i].style.opacity = '';
  }

  /* Current section in the nav (no library needed). */
  try {
    var links = document.querySelectorAll('.nav a[href^="#"]');
    var map = {};
    for (var l = 0; l < links.length; l++) map[links[l].getAttribute('href').slice(1)] = links[l];
    if ('IntersectionObserver' in window) {
      var seen = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
        var current = null;
        Object.keys(map).forEach(function (id) { if (seen[id]) current = id; });
        Object.keys(map).forEach(function (id) {
          if (id === current) map[id].setAttribute('aria-current', 'true');
          else map[id].removeAttribute('aria-current');
        });
      }, { rootMargin: '-35% 0px -55% 0px' });
      Object.keys(map).forEach(function (id) {
        var s = document.getElementById(id);
        if (s) io.observe(s);
      });
    }
  } catch (err) { /* nav highlight is optional */ }

  if (!M || reduce) { showAll(); return; }

  try {
    var animate = M.animate, inView = M.inView, scroll = M.scroll, stagger = M.stagger;
    var ease = [0.22, 1, 0.36, 1];

    /* Reading progress: a hairline under the header that grows with the scroll. */
    var bar = document.querySelector('.progress');
    if (bar && scroll) scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));

    /* Hero: elements arrive in order, the portrait unwraps from the top. */
    var hero = document.querySelectorAll('[data-hero]');
    if (hero.length) {
      animate(hero, { opacity: [0, 1], y: [18, 0] }, { duration: 0.7, delay: stagger(0.09), ease: ease });
    }
    var frame = document.querySelector('.portrait-media');
    var img = document.querySelector('.portrait-media img');
    if (frame) animate(frame, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }, { duration: 0.9, delay: 0.25, ease: ease });
    if (img) animate(img, { scale: [1.07, 1] }, { duration: 1.3, delay: 0.25, ease: ease });

    /* Section content: fade up once, as it scrolls into view. Elements already on screen are left alone. */
    var seenEl = [];
    var sel = '.sec-label, .sec-body > *, .stat, .foot';
    var nodes = document.querySelectorAll(sel);
    var vh = window.innerHeight || 800;
    for (var n = 0; n < nodes.length; n++) {
      (function (el) {
        if (seenEl.indexOf(el) !== -1) return;
        seenEl.push(el);
        if (el.getBoundingClientRect().top < vh * 0.92) return;
        el.setAttribute('data-rv', '');
        el.style.opacity = '0';
        inView(el, function () {
          animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: 0.55, ease: ease });
        }, { margin: '0px 0px -8% 0px' });
      })(nodes[n]);
    }

    /* Result numbers count up once when they scroll into view; the final text is always restored exactly. */
    var counters = document.querySelectorAll('[data-count]');
    for (var c = 0; c < counters.length; c++) {
      (function (el) {
        var end = parseFloat(el.getAttribute('data-count'));
        var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
        var finalText = el.textContent;
        if (isNaN(end)) return;
        el.textContent = (0).toFixed(dec);
        inView(el, function () {
          animate(0, end, {
            duration: 1.4, ease: ease,
            onUpdate: function (v) { el.textContent = v.toFixed(dec); },
            onComplete: function () { el.textContent = finalText; }
          });
        });
        setTimeout(function () { if (el.textContent !== finalText && el.getBoundingClientRect().top < vh) el.textContent = finalText; }, 4000);
      })(counters[c]);
    }
  } catch (err) {
    showAll();
  }
})();
