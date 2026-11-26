/* MISMO December — the santa hat and a little snow, for every internal tool on resources.mismo.org.
   ----------------------------------------------------------------------------------------------
   One shared copy. Every internal page loads it through /assets/session.js (or with its own line,
   <script src="/assets/holiday.js" defer></script>, where a page doesn't load session.js).

   December 1 to 31, on the person's own clock, with no upkeep:
   - A santa hat with a long tail sits on the top-right of the O of MISMO in the masthead logo, like
     a hat on a head. Pages that already carry the brand standard's hat (.santa) have it swapped for this one.
     The logo itself is never touched.
   - The first time a tool is opened in a browser session, the bobble on the end of the hat swings and
     settles, and a handful of snowflakes drift gently down the page for a few seconds and are gone.
     Not again until the next session, unless someone hovers over the hat, which brings the snow and
     the swing back. Never for anyone whose computer asks for reduced motion.
   Outside December nothing happens at all.

   Internal MISMO tools and MyMISMO only (Jonna, Nov 26, 2026): never the website or anything attached
   to it, such as forms, applications, work-product downloads or the prospectus.

   An app with a loading screen marks both logos with data-mismo-logo (MyMISMO): the hat is on the
   loading-screen logo from the first moment, and on the masthead logo once the app opens.

   Preview outside December: add ?holiday=preview to a page's address, or run
   localStorage.setItem('mismo.holiday','preview') in that browser (removeItem to stop).
   Owner: Forms and shared pages (GitMISMO.github.io). Change notices: GitMISMO/mismo-connections. */
(function () {
  'use strict';
  if (window.MismoHoliday) return;
  var preview = false;
  try { preview = /[?&]holiday=preview\b/.test(location.search) || localStorage.getItem('mismo.holiday') === 'preview'; } catch (e) {}
  var now = new Date();
  /* never on the website's side: public forms, applications and work-product downloads */
  var publicPage = /^\/(forms|work-products)(\/|$)/i.test(location.pathname);
  var on = (now.getMonth() === 11 || preview) && !publicPage;
  window.MismoHoliday = { on: on, version: '2026-11-26d' };
  if (!on) return;

  var NS = 'http://www.w3.org/2000/svg';
  /* The hat, drawn for December: low, its brim curved as if round a head, and a long tail that
     drapes down the right side with a fluffy bobble hanging off the end. The bobble sits in a group
     of its own so it can swing. Drawn on a 120 x 100 grid: brim 12 to 66 across, about 70 to 88 down;
     the tail ends at about 100,77. */
  var HAT = '<defs>' +
    '<linearGradient id="mh-red" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5493d"/><stop offset=".55" stop-color="#c0392f"/><stop offset="1" stop-color="#8e2620"/></linearGradient>' +
    '<radialGradient id="mh-fur" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f4f7fa"/><stop offset="1" stop-color="#c9d7e2"/></radialGradient>' +
    '</defs>' +
    '<path d="M16,76 C14,60 24,46 44,40 C60,35 80,36 93,46 C103,54 108,64 108,76 C104,80 95,79 93,74 C91,65 86,59 79,57 C71,55 65,61 63,76 Z" fill="url(#mh-red)"/>' +
    '<path d="M16,76 C14,60 24,46 44,40 C48,39 52,39 55,39 C38,48 30,60 30,76 Z" fill="#0d314c" opacity=".14"/>' +
    '<path d="M42,44 C57,39 74,40 86,47" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="2.6" stroke-linecap="round"/>' +
    '<g fill="url(#mh-fur)"><path d="M12,76 Q39,67 66,76 L66,88 Q39,79 12,88 Z"/><circle cx="12" cy="82" r="6"/><circle cx="66" cy="82" r="6"/><circle cx="12.0" cy="76.0" r="3.8"/><circle cx="19.7" cy="73.8" r="3.8"/><circle cx="27.4" cy="72.3" r="3.8"/><circle cx="35.1" cy="71.6" r="3.8"/><circle cx="42.9" cy="71.6" r="3.8"/><circle cx="50.6" cy="72.3" r="3.8"/><circle cx="58.3" cy="73.8" r="3.8"/><circle cx="66.0" cy="76.0" r="3.8"/><circle cx="12.0" cy="88.0" r="3.8"/><circle cx="19.7" cy="85.8" r="3.8"/><circle cx="27.4" cy="84.3" r="3.8"/><circle cx="35.1" cy="83.6" r="3.8"/><circle cx="42.9" cy="83.6" r="3.8"/><circle cx="50.6" cy="84.3" r="3.8"/><circle cx="58.3" cy="85.8" r="3.8"/><circle cx="66.0" cy="88.0" r="3.8"/></g>' +
    '<path d="M14,85 Q39,77 64,85" fill="none" stroke="#0d314c" stroke-opacity=".07" stroke-width="4" stroke-linecap="round"/>' +
    '<g class="mismo-bobble" style="transform-box:view-box;transform-origin:100px 77px"><g fill="url(#mh-fur)"><circle cx="108.5" cy="86.0" r="4.1"/><circle cx="106.3" cy="91.3" r="4.1"/><circle cx="101.0" cy="93.5" r="4.1"/><circle cx="95.7" cy="91.3" r="4.1"/><circle cx="93.5" cy="86.0" r="4.1"/><circle cx="95.7" cy="80.7" r="4.1"/><circle cx="101.0" cy="78.5" r="4.1"/><circle cx="106.3" cy="80.7" r="4.1"/><circle cx="101" cy="86" r="9"/></g>' +
    '<circle cx="98" cy="83" r="2.5" fill="#ffffff" opacity=".9"/></g>';

  function css() {
    if (document.getElementById('mismo-holiday-css')) return;
    var s = document.createElement('style');
    s.id = 'mismo-holiday-css';
    s.textContent =
      /* the hat sits on the top-right of the O of MISMO, like a hat on a head (placed by fit() below).
         Hats built into a page from the older standard are hidden: this one replaces them. */
      '.mismo-hat-host{position:relative!important;overflow:visible!important}' +
      '.mismo-hat-host .santa{display:none!important}' +
      '.mismo-hat-host .mismo-hat{position:absolute!important;display:block!important;pointer-events:visiblePainted;cursor:default;' +
      'right:auto!important;transform:rotate(15deg);transform-origin:32.5% 80%;z-index:2;overflow:visible;' +
      'filter:drop-shadow(0 1px 1.5px rgba(13,49,76,.38))}' +
      /* the snow */
      '.mismo-snow{position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden}' +
      '.mismo-snow svg{position:absolute;top:-30px;will-change:transform,opacity}';
    (document.head || document.documentElement).appendChild(s);
  }

  /* the white plates MISMO logos sit on. Every logo marked data-mismo-logo gets a hat (an app can mark
     its loading-screen logo as well as its masthead logo, so the hat is there from the first moment);
     with none marked, the masthead logo is found by itself. */
  function hostOf(el) {
    var host = el.closest('.plate, .logoplate, .logo-plate, .lplate, [class*="plate"]') || el.parentElement;
    return host && host !== document.body ? { host: host, logo: el } : null;
  }
  function plates() {
    var marked = document.querySelectorAll('[data-mismo-logo]'), out = [];
    for (var i = 0; i < marked.length; i++) { var m = hostOf(marked[i]); if (m) out.push(m); }
    if (out.length) return out;
    var logo = document.querySelector('header use[href="#mismo-logo"], .mast use[href="#mismo-logo"], .masthead use[href="#mismo-logo"], use[href="#mismo-logo"]');
    var el = logo ? logo.closest('svg') : null;
    if (!el) el = document.querySelector('header svg[aria-label="MISMO"], header img[alt*="MISMO"], .mast svg[aria-label="MISMO"], .masthead svg[aria-label="MISMO"], .masthead img[alt*="MISMO"], .mast img[alt*="MISMO"], svg[aria-label="MISMO"], img[alt="MISMO"]');
    var one = el ? hostOf(el) : null;
    return one ? [one] : [];
  }

  /* the O is the last letter of the lockup: 556 to 708 across its 708 x 108 drawing. The hat is as
     big as reads well: its brim a little wider than the O and resting over the O's top edge, like a
     hat on a head, tipped slightly right, the tail and bobble draping down the right side. Its tip may run off the top of the window;
     that's fine (Jonna, Nov 26, 2026). */
  function fit(h, logo, host) {
    var L = logo.getBoundingClientRect(), P = host.getBoundingClientRect();
    if (!L.width) return;
    /* a hat waiting to swing (its logo was hidden until now) swings the first time it is seen */
    if (h.__mismoSwing) { h.__mismoSwing = false; swing(h, true); }
    var oLeft = L.left + L.width * 556 / 708, oWidth = L.width * 152 / 708;
    /* brim (45% of the drawing's width) a little wider than the O; a big loading-screen logo gets a big hat */
    var wid = Math.max(40, Math.min(Math.max(110, L.width * 0.55), oWidth * 1.12 / 0.45)), hgt = wid / 1.2;
    var set = function (k, v) { h.style.setProperty(k, v, 'important'); };
    set('width', wid + 'px'); set('height', hgt + 'px');
    /* brim centred just right of the O's middle, its lower edge resting over the top of the O */
    set('left', (oLeft - P.left + oWidth * 0.56 - wid * 0.325) + 'px');
    set('top', (L.top - P.top + L.height * 0.2 - hgt * 0.83) + 'px');
  }

  /* a container that would clip the hat inside the masthead lets it show (the window's top edge may
     still trim the tip, which is fine) */
  function unclip(h) {
    var r = h.getBoundingClientRect(), el = h.parentElement, up = 0;
    while (el && el !== document.body && up++ < 8) {
      var cs = getComputedStyle(el), b = el.getBoundingClientRect();
      if (cs.overflow !== 'visible' || cs.overflowY !== 'visible' || cs.overflowX !== 'visible') {
        if (r.top < b.top || r.right > b.right) { el.style.overflow = 'visible'; }
      }
      el = el.parentElement;
    }
  }

  /* only the bobble on the end swings when the tool first opens, and settles */
  function swing(h, first) {
    var b = h.querySelector('.mismo-bobble');
    if (!first || !b || !b.animate) return;
    try { if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
    b.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-32deg)' }, { transform: 'rotate(26deg)' },
      { transform: 'rotate(-18deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-6deg)' },
      { transform: 'rotate(3deg)' }, { transform: 'rotate(0deg)' }
    ], { duration: 3200, delay: 400, easing: 'ease-in-out' });
  }

  var hatCount = 0;
  function hatOn(found, first) {
    var host = found.host;
    host.classList.add('mismo-hat-host');
    var h = host.querySelector('.mismo-hat');
    if (h) return;
    h = document.createElementNS(NS, 'svg');
    h.setAttribute('class', 'mismo-hat');
    h.setAttribute('viewBox', '0 0 120 100');
    h.setAttribute('aria-hidden', 'true');
    h.setAttribute('focusable', 'false');
    /* each hat carries its own colors: when a loading screen and its hat are hidden, the hat in the
       masthead must not lose the red and the fur along with it */
    var k = ++hatCount;
    h.innerHTML = HAT.replace(/mh-(red|fur)/g, 'mh-$1-' + k);
    host.appendChild(h);
    /* hover over the hat: it snows again and the bobble swings (not more than every few seconds) */
    var lastSnow = 0;
    h.addEventListener('mouseenter', function () {
      var t = Date.now();
      if (t - lastSnow < 4000) return;
      lastSnow = t; snow(true); swing(h, true);
    });
    /* the hat sits over part of the logo: a click on it does what a click on the logo does */
    h.addEventListener('click', function () {
      var a = host.closest('a') || host.querySelector('a');
      if (a) a.click(); else if (typeof host.click === 'function') host.click();
    });
    /* on first open the bobble swings as soon as this logo is on screen */
    h.__mismoSwing = !!first;
    requestAnimationFrame(function () { fit(h, found.logo, host); unclip(h); });
    /* mastheads can shift as fonts and pages finish loading: the hat follows the logo */
    var refit = function () { fit(h, found.logo, host); };
    window.addEventListener('resize', refit);
    try { new ResizeObserver(refit).observe(found.logo); new ResizeObserver(refit).observe(host); } catch (e) {}
    [400, 1200, 3000, 6000].forEach(function (ms) { setTimeout(refit, ms); });
  }

  /* hats every logo found; true once a logo that is on screen has one */
  function hat(first) {
    var all = plates(), shown = false;
    for (var i = 0; i < all.length; i++) {
      hatOn(all[i], first);
      if (all[i].logo.getBoundingClientRect().width) shown = true;
    }
    return shown && all.length > 0;
  }

  /* the first time this tool is opened in this browser session */
  var KEY = 'mismo.holiday.first:' + location.pathname.split('/').slice(0, 2).join('/');
  var first = true;
  try { first = preview || !sessionStorage.getItem(KEY); sessionStorage.setItem(KEY, '1'); } catch (e) {}

  function snow(again) {
    if (!first && !again) return;
    try { if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
    var box = document.createElement('div');
    box.className = 'mismo-snow';
    box.setAttribute('aria-hidden', 'true');
    document.body.appendChild(box);
    var W = window.innerWidth, H = window.innerHeight, n = 18, longest = 0;
    for (var i = 0; i < n; i++) {
      var size = 10 + Math.random() * 12;
      var f = document.createElementNS(NS, 'svg');
      f.setAttribute('viewBox', '-12 -12 24 24');
      f.setAttribute('width', size);
      f.setAttribute('height', size);
      f.style.left = (W * (i + Math.random()) / n) + 'px';
      f.innerHTML = '<g stroke="#74bfeb" stroke-width="1.6" stroke-linecap="round" fill="none">' +
        '<path d="M0-10V10M-8.7-5L8.7 5M-8.7 5L8.7-5"/>' +
        '<path d="M-2.5-7.5L0-5 2.5-7.5M-2.5 7.5L0 5 2.5 7.5M-7.7-1.2L-4.6-2.6-5.2-6M7.7 1.2L4.6 2.6 5.2 6M-7.7 1.2L-4.6 2.6-5.2 6M7.7-1.2L4.6-2.6 5.2-6"/></g>' +
        '<circle r="1.6" fill="#ffffff"/>';
      box.appendChild(f);
      var fall = H * (0.55 + Math.random() * 0.4), sway = 18 + Math.random() * 26, dur = 5200 + Math.random() * 3600, delay = Math.random() * 1600;
      longest = Math.max(longest, dur + delay);
      if (f.animate) {
        f.animate([
          { transform: 'translate(0,0) rotate(0deg)', opacity: 0 },
          { transform: 'translate(' + sway + 'px,' + fall * 0.25 + 'px) rotate(60deg)', opacity: 0.95, offset: 0.15 },
          { transform: 'translate(' + (-sway) + 'px,' + fall * 0.6 + 'px) rotate(140deg)', opacity: 0.9, offset: 0.6 },
          { transform: 'translate(' + (sway * 0.5) + 'px,' + fall + 'px) rotate(220deg)', opacity: 0 }
        ], { duration: dur, delay: delay, easing: 'ease-in-out', fill: 'both' });
      }
    }
    setTimeout(function () { box.remove(); }, longest + 300);
  }

  function start() {
    /* The older brand standard dropped the whole masthead 20px in December (html[data-season="december"])
       to make room for its small hat. This hat sits on the O and needs no room, so the masthead stays
       exactly where it is the rest of the year (Jonna, Nov 26, 2026): the attribute is taken off,
       and kept off if a page's own script puts it back. */
    var root = document.documentElement;
    var unseason = function () { if (root.hasAttribute('data-season')) root.removeAttribute('data-season'); };
    unseason();
    try { new MutationObserver(unseason).observe(root, { attributes: true, attributeFilter: ['data-season'] }); } catch (e) {}
    css();
    var tries = 0;
    /* apps draw their masthead after sign-in or after loading: keep looking for a little while */
    /* and keep looking after the first hat, so a masthead drawn after a loading screen gets one too */
    (function place() { hat(first); if (tries++ < 360) setTimeout(place, 500); })();   /* up to 3 minutes */
    setTimeout(snow, 700);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
