/* MISMO holidays: December's santa hat, snow and Santa, and the calendar for the other holidays (occasions.js),
   for every internal tool on resources.mismo.org and MyMISMO.
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

   Santa's flight: once a business day in December, a different time each day (see sleighWatch below).

   Preview outside December: add ?holiday=preview to a page's address, or run
   localStorage.setItem('mismo.holiday','preview') in that browser (removeItem to stop).
   ?holiday=sleigh sends Santa across a moment after the page opens.
   Owner: Forms and shared pages (GitMISMO.github.io). Change notices: GitMISMO/mismo-connections. */
(function () {
  'use strict';
  if (window.MismoHoliday) return;
  /* never on the website's side: public forms, applications and work-product downloads */
  var publicPage = /^\/(forms|work-products)(\/|$)/i.test(location.pathname);
  if (publicPage) { window.MismoHoliday = { on: false }; return; }

  /* ---------- the holiday calendar (Jonna, Nov 27, 2026) ----------
     Besides December, a little something on: Groundhog Day, Valentine's Day, Pi Day, St. Patrick's Day,
     Easter, Earth Day, the first day of summer, the 4th of July, Halloween and Thanksgiving, on the day
     itself, or on the business day before when the day falls on a weekend or a MISMO day off (so the team
     sees it: Easter shows on Good Friday, Thanksgiving on the Wednesday, the 4th on the day before). New
     Year's is the first time each person opens any tool in January. All of it lives in /assets/occasions.js,
     loaded only on those days. Preview any of them with ?holiday=<name> on a page's address:
     newyear, groundhog, valentine, piday, stpatrick, easter, earthday, summer, july4, halloween, thanksgiving.
     Dates are worked out on Eastern time, MISMO's working clock. */
  function U(y, m, d) { return new Date(Date.UTC(y, m - 1, d)); }
  function key(d) { return d.toISOString().slice(0, 10); }
  function addDays(d, n) { return new Date(d.getTime() + n * 864e5); }
  function nth(y, m, wd, n) { var d = U(y, m, 1); while (d.getUTCDay() !== wd) d = addDays(d, 1); return addDays(d, 7 * (n - 1)); }
  function lastWd(y, m, wd) { var d = U(y, m + 1, 1); d = addDays(d, -1); while (d.getUTCDay() !== wd) d = addDays(d, -1); return d; }
  function observed(d) { var w = d.getUTCDay(); return w === 6 ? addDays(d, -1) : w === 0 ? addDays(d, 1) : d; }
  /* MISMO's days off: the holidays the team is out, and Winter Break (December 25 to January 1) */
  var offCache = {};
  function daysOff(y) {
    if (offCache[y]) return offCache[y];
    var o = {}, add = function (d) { o[key(d)] = 1; };
    add(observed(U(y, 1, 1))); add(nth(y, 1, 1, 3)); add(nth(y, 2, 1, 3)); add(lastWd(y, 5, 1)); add(observed(U(y, 6, 19)));
    add(observed(U(y, 7, 4))); add(nth(y, 9, 1, 1)); add(observed(U(y, 11, 11)));
    var tg = nth(y, 11, 4, 4); add(tg); add(addDays(tg, 1));
    for (var d = 24; d <= 31; d++) add(U(y, 12, d));
    return (offCache[y] = o);
  }
  function biz(d) { var w = d.getUTCDay(); return w !== 0 && w !== 6 && !daysOff(d.getUTCFullYear())[key(d)]; }
  function easter(y) {   /* Easter Sunday (Anonymous Gregorian algorithm) */
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return U(y, Math.floor((h + l - 7 * m + 114) / 31), ((h + l - 7 * m + 114) % 31) + 1);
  }
  /* the June solstice on Eastern time (June 20 in 2028 and 2032, June 21 the other years to 2035) */
  function summer(y) { return U(y, 6, ({ 2028: 20, 2032: 20 })[y] || 21); }
  var DAYS = [
    ['groundhog', function (y) { return U(y, 2, 2); }],
    ['valentine', function (y) { return U(y, 2, 14); }],
    ['piday', function (y) { return U(y, 3, 14); }],
    ['stpatrick', function (y) { return U(y, 3, 17); }],
    ['easter', easter],
    ['earthday', function (y) { return U(y, 4, 22); }],
    ['summer', summer],
    ['july4', function (y) { return U(y, 7, 4); }],
    ['halloween', function (y) { return U(y, 10, 31); }],
    ['thanksgiving', function (y) { return nth(y, 11, 4, 4); }]
  ];
  function etToday() {
    var p = {};
    try { new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; }); } catch (e) { var n = new Date(); return U(n.getFullYear(), n.getMonth() + 1, n.getDate()); }
    return U(+p.year, +p.month, +p.day);
  }
  function occasionOn(t) {
    var y = t.getUTCFullYear(), k = key(t);
    if (t.getUTCMonth() === 11) return 'christmas';
    for (var i = 0; i < DAYS.length; i++) {
      var hd = DAYS[i][1](y), show = hd;
      while (!biz(show)) show = addDays(show, -1);
      if (k === key(show) || k === key(hd)) return DAYS[i][0];
    }
    if (t.getUTCMonth() === 0) return 'newyear';
    return null;
  }
  var ask = (location.search.match(/[?&]holiday=([a-z0-9]+)/i) || [])[1] || '';
  ask = ask.toLowerCase();
  var stored = ''; try { stored = localStorage.getItem('mismo.holiday') || ''; } catch (e) {}
  var preview = ask === 'preview' || ask === 'sleigh' || (!ask && stored === 'preview');
  var occ = preview ? 'christmas' : (ask && ask !== 'christmas' ? ask : (ask === 'christmas' ? 'christmas' : occasionOn(etToday())));
  window.MismoHoliday = { on: !!occ, occasion: occ || '', preview: !!ask || preview, version: '2026-11-27c', calendar: { occasionOn: occasionOn, U: U } };
  if (!occ) return;
  if (occ !== 'christmas') {
    /* the other holidays: their own file, loaded only today */
    if (!document.querySelector('script[src*="/assets/occasions.js"]')) {
      var s0 = document.createElement('script'); s0.src = '/assets/occasions.js?v=' + window.MismoHoliday.version; s0.defer = true;
      (document.head || document.documentElement).appendChild(s0);
    }
    return;
  }
  if (ask === 'christmas') preview = true;
  var on = true;

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

  /* ------------------------------------------------------------------------------------------
     Santa's flight (Jonna, Nov 26, 2026). Once a day in December, on a business day, at a
     different time each day between 9:30 AM and 4:30 PM Eastern, Santa flies across the screen
     on his sleigh behind his reindeer, Rudolph's nose glowing in front, a trail of gold and sky
     sparkles behind. If you're watching (you've used the page in the last minute, or your
     pointer comes near him) he turns and waves. The time is the same for everyone at MISMO, so
     the whole team sees him go by together. A special easter egg (Jonna, Nov 26, 2026): only
     those with a MISMO tool open and on screen at that moment see him; anyone who isn't misses
     him that day, and he doesn't come back later. Once a day at most, in one tab. Not on weekends or Winter Break (December 25 to 31), and never for anyone whose
     computer asks for reduced motion. Preview any time: ?holiday=sleigh on a page's address.
     ------------------------------------------------------------------------------------------ */
  /* ---- the picture: drawn on a 720 x 270 grid, flying to the right ---- */
  function spin(a, b, cx, cy, dur, delay) {
    return '<animateTransform attributeName="transform" type="rotate" values="' + a + ' ' + cx + ' ' + cy + ';' + b + ' ' + cx + ' ' + cy + ';' + a + ' ' + cx + ' ' + cy +
      '" keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="' + dur + 's" begin="' + delay + 's" repeatCount="indefinite"/>';
  }
  /* a leg: thigh, shin and a dark hoof, swinging from the hip */
  function leg(hx, hy, kx, ky, fx, fy, a, b, delay, back) {
    var fur = back ? '#55331f' : '#7a4c2e', shin = back ? '#4a2c1a' : '#6a4128';
    return '<g>' + spin(a, b, hx, hy, 0.56, delay) +
      '<path d="M' + hx + ',' + hy + ' L' + kx + ',' + ky + '" stroke="' + fur + '" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M' + kx + ',' + ky + ' L' + fx + ',' + fy + '" stroke="' + shin + '" stroke-width="4.6" stroke-linecap="round"/>' +
      '<circle cx="' + fx + '" cy="' + fy + '" r="3.2" fill="#22150c"/></g>';
  }
  function antler(x, y, s) {
    return '<path transform="translate(' + x + ',' + y + ') scale(' + s + ',1)" d="M0,0 C-2,-10 -6,-18 -14,-24 M-4,-9 C-9,-11 -13,-11 -17,-9 M-8,-16 C-9,-22 -8,-27 -5,-31 M-12,-21 C-17,-23 -21,-22 -24,-19 M-14,-24 C-17,-28 -18,-32 -17,-36" fill="none" stroke="url(#ms-antler)" stroke-width="2.6" stroke-linecap="round"/>';
  }
  function deer(x, y, k, rudolph, back) {
    var d = -k * 0.13, fur = back ? 'url(#ms-fur-b)' : 'url(#ms-fur)';
    var nose = rudolph
      ? '<circle cx="129" cy="13" r="16" fill="url(#ms-glow)" class="ms-glow"/><circle cx="129" cy="13" r="4.6" fill="url(#ms-nose)"/><circle cx="127.6" cy="11.4" r="1.4" fill="#fff" opacity=".9"/>'
      : '<ellipse cx="129" cy="13" rx="3.4" ry="2.8" fill="#24160d"/><circle cx="128" cy="12" r=".9" fill="#fff" opacity=".5"/>';
    return '<g class="ms-deer" style="animation-delay:' + d + 's"><g transform="translate(' + x + ',' + y + ')">' +
      /* far legs */
      leg(30, 44, 16, 56, 2, 60, -8, 14, d, true) + leg(84, 46, 98, 54, 100, 66, 10, -16, d, true) +
      /* tail and body */
      '<path d="M20,34 C12,28 8,32 10,37 C12,40 17,39 20,37 Z" fill="#fbf1e4"/>' +
      '<path d="M18,40 C14,28 26,20 44,19 C60,18 76,18 88,22 C96,25 100,32 98,40 C96,48 88,52 76,52 L40,53 C28,53 20,49 18,40 Z" fill="' + fur + '"/>' +
      '<path d="M30,50 C46,57 70,57 88,47 C74,51 46,52 30,50 Z" fill="#ead2ae" opacity=".85"/>' +
      '<path d="M28,24 C44,19 66,19 84,23" fill="none" stroke="#ffe7c2" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M22,44 C30,52 50,54 70,53 C56,50 36,48 22,44 Z" fill="#2c180c" opacity=".25"/>' +
      /* neck, chest fluff, head */
      '<path d="M84,30 C90,20 96,10 104,5 L112,9 C108,18 102,28 97,40 Z" fill="' + fur + '"/>' +
      '<path d="M92,30 C99,34 102,42 97,50 C95,44 92,40 87,37 Z" fill="#f4e6d1"/>' +
      '<path d="M100,4 C104,-3 114,-4 121,0 C127,3 131,8 131,12 C131,16 127,18 122,17 L114,16 C109,17 104,14 100,10 Z" fill="' + fur + '"/>' +
      '<path d="M118,9 C122,7 128,8 131,11 C131,15 127,18 121,17 C118,15 117,12 118,9 Z" fill="#c79a6f"/>' +
      antler(106, -1, 1) + antler(112, -2, -0.8) +
      '<path d="M104,1 C98,-5 94,-4 95,0 C97,3 101,3 104,3 Z" fill="#8a5a38"/><path d="M102,1 C99,-2 97,-2 97,0" stroke="#e9c9a8" stroke-width="1.2" fill="none"/>' +
      '<ellipse cx="114" cy="5" rx="2.3" ry="2.6" fill="#1b120c"/><circle cx="114.8" cy="4.1" r=".9" fill="#fff"/>' +
      '<path d="M111,1.5 C113,0.5 116,0.8 117,2" stroke="#3a2416" stroke-width="1" fill="none" stroke-linecap="round"/>' +
      nose +
      /* harness: red leather with gold studs, a collar of bells */
      '<path d="M66,19 C63,30 63,42 67,53" fill="none" stroke="#a8302a" stroke-width="5"/>' +
      '<path d="M66,19 C63,30 63,42 67,53" fill="none" stroke="#ffd76a" stroke-width="1.6" stroke-dasharray=".1 6" stroke-linecap="round"/>' +
      '<path d="M90,26 C95,31 99,37 100,44" fill="none" stroke="#a8302a" stroke-width="5"/>' +
      '<g class="ms-bells">' + [[91, 31], [95, 36], [98, 41]].map(function (p) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="url(#ms-bell)"/><circle cx="' + (p[0] - 1) + '" cy="' + (p[1] - 1) + '" r=".9" fill="#fff" opacity=".8"/>';
      }).join('') + '</g>' +
      /* near legs */
      leg(36, 46, 20, 60, 6, 66, -10, 16, d - 0.1, false) + leg(80, 48, 96, 58, 99, 71, 12, -18, d - 0.1, false) +
      '</g></g>';
  }
  function fluff(pts, r) {
    return pts.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (p[2] || r) + '"/>'; }).join('');
  }
  function sleighSvg() {
    return '<svg class="ms-flight" viewBox="-10 -40 740 280" aria-hidden="true" focusable="false" xmlns="' + NS + '"><defs>' +
      '<linearGradient id="ms-fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8754d"/><stop offset=".55" stop-color="#7d4f30"/><stop offset="1" stop-color="#5a3720"/></linearGradient>' +
      '<linearGradient id="ms-fur-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#83573a"/><stop offset="1" stop-color="#4a2d1b"/></linearGradient>' +
      '<linearGradient id="ms-antler" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b48a58"/><stop offset="1" stop-color="#f1dcb5"/></linearGradient>' +
      '<radialGradient id="ms-glow"><stop offset="0" stop-color="#ff7a6e" stop-opacity=".95"/><stop offset=".35" stop-color="#ff3b30" stop-opacity=".5"/><stop offset="1" stop-color="#ff3b30" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="ms-nose" cx=".35" cy=".35"><stop offset="0" stop-color="#ff8a7f"/><stop offset=".6" stop-color="#ff2d20"/><stop offset="1" stop-color="#b3150c"/></radialGradient>' +
      '<radialGradient id="ms-bell" cx=".35" cy=".35"><stop offset="0" stop-color="#fff4c2"/><stop offset=".5" stop-color="#f3c75a"/><stop offset="1" stop-color="#a87a22"/></radialGradient>' +
      '<linearGradient id="ms-red" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#ee5246"/><stop offset=".55" stop-color="#c8372d"/><stop offset="1" stop-color="#84211b"/></linearGradient>' +
      '<linearGradient id="ms-lacquer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2443a"/><stop offset=".45" stop-color="#b52a22"/><stop offset="1" stop-color="#6e1612"/></linearGradient>' +
      '<linearGradient id="ms-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a8781f"/><stop offset=".35" stop-color="#ffe7a0"/><stop offset=".6" stop-color="#e2b04a"/><stop offset="1" stop-color="#9c6f1c"/></linearGradient>' +
      '<radialGradient id="ms-white" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".75" stop-color="#f1f5f8"/><stop offset="1" stop-color="#cdd9e3"/></radialGradient>' +
      '<radialGradient id="ms-skin" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffe2cf"/><stop offset="1" stop-color="#eeb99b"/></radialGradient>' +
      '<linearGradient id="ms-sack" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a6246"/><stop offset="1" stop-color="#4a3022"/></linearGradient>' +
      '<radialGradient id="ms-lamp"><stop offset="0" stop-color="#fff6d2" stop-opacity="1"/><stop offset=".35" stop-color="#ffd76a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="ms-shadow"><stop offset="0" stop-color="#0d314c" stop-opacity=".16"/><stop offset="1" stop-color="#0d314c" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="ms-streak" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="ms-beam" cx="0" cy=".5" r="1"><stop offset="0" stop-color="#ff6b5e" stop-opacity=".35"/><stop offset="1" stop-color="#ff6b5e" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="ms-aura"><stop offset="0" stop-color="#bfe3f7" stop-opacity=".4"/><stop offset=".6" stop-color="#74bfeb" stop-opacity=".1"/><stop offset="1" stop-color="#74bfeb" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      /* a soft magical glow around the whole team */
      '<ellipse cx="360" cy="120" rx="380" ry="120" fill="url(#ms-aura)" class="ms-aura"/>' +
      /* wind streaks: they race past as he flies */
      '<g class="ms-streaks" stroke="url(#ms-streak)" stroke-linecap="round" fill="none">' +
      '<path d="M-60,96 L40,96" stroke-width="2.2"/><path d="M-90,150 L10,150" stroke-width="1.6"/><path d="M-40,206 L60,206" stroke-width="2"/>' +
      '<path d="M200,22 L290,22" stroke-width="1.4"/><path d="M380,128 L460,128" stroke-width="1.4"/><path d="M520,6 L600,6" stroke-width="1.2"/></g>' +
      /* Rudolph lights the way */
      '<path d="M696,47 L770,30 L770,64 Z" fill="url(#ms-beam)" opacity=".7"/>' +
      /* reins */
      '<path d="M226,114 C280,92 300,70 330,64 M226,114 C300,98 350,80 450,64 M226,114 C330,104 420,88 470,72 M226,114 C380,104 520,80 590,64" fill="none" stroke="#f3c75a" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>' +
      '<ellipse cx="140" cy="214" rx="124" ry="10" fill="url(#ms-shadow)"/><ellipse cx="460" cy="128" rx="214" ry="9" fill="url(#ms-shadow)"/>' +
      /* the team: two pairs, then Rudolph out front */
      '<g opacity=".82">' + deer(318, 34, 1, false, true) + deer(448, 30, 3, false, true) + '</g>' +
      deer(300, 52, 0, false, false) + deer(430, 48, 2, false, false) +
      deer(566, 34, 4, true, false) +
      /* the sack of presents, one wrapped in MISMO navy */
      '<g><path d="M30,146 C14,118 22,82 52,72 C76,64 96,78 100,100 C104,122 96,142 86,152 Z" fill="url(#ms-sack)"/>' +
      '<path d="M40,86 C36,104 36,124 44,142 M62,80 C58,100 60,124 66,146" fill="none" stroke="#2f1d13" stroke-opacity=".35" stroke-width="2"/>' +
      '<path d="M34,96 C40,90 44,92 44,98" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>' +
      '<g transform="rotate(-14 48 62)"><rect x="34" y="50" width="28" height="24" rx="2" fill="#0d314c"/><rect x="45" y="50" width="6" height="24" fill="#74bfeb"/><rect x="34" y="59" width="28" height="6" fill="#74bfeb"/>' +
      '<path d="M48,50 C40,40 34,46 46,50 M48,50 C56,40 62,46 50,50" fill="#bfe3f7" stroke="#74bfeb" stroke-width="1.5"/></g>' +
      '<g transform="rotate(9 82 58)"><rect x="70" y="42" width="24" height="30" rx="2" fill="#2f8f5b"/><rect x="79" y="42" width="6" height="30" fill="#f3c75a"/>' +
      '<path d="M82,42 C74,32 70,38 80,42 M82,42 C90,32 94,38 84,42" fill="#ffe08a" stroke="#d9a441" stroke-width="1.4"/></g>' +
      '<g transform="rotate(-4 62 38)"><rect x="52" y="28" width="20" height="18" rx="2" fill="#f3c75a"/><rect x="60" y="28" width="5" height="18" fill="#c0392f"/><rect x="52" y="35" width="20" height="5" fill="#c0392f"/>' +
      '<path d="M62,28 C56,20 52,25 60,28 M62,28 C68,20 72,25 64,28" fill="#e8483c"/></g>' +
      '<path d="M72,84 C80,90 90,88 96,82" fill="none" stroke="#d8b07a" stroke-width="3" stroke-linecap="round"/></g>' +
      /* Santa */
      '<g class="ms-santa" transform="translate(-46,-58) scale(1.3)">' +
      /* the waving arm, behind him: down at his side until he waves */
      '<g class="ms-wave">' +
      '<path d="M128,104 C122,90 118,76 117,62" stroke="url(#ms-red)" stroke-width="13" fill="none" stroke-linecap="round"/>' +
      '<g fill="url(#ms-white)">' + fluff([[117, 68, 7], [111, 67, 4], [123, 67, 4]]) + '</g>' +
      '<ellipse cx="116" cy="55" rx="8" ry="9" fill="#1f5a3c"/><path d="M109,55 C105,51 105,47 108,45" stroke="#1f5a3c" stroke-width="5" stroke-linecap="round" fill="none"/></g>' +
      /* coat */
      '<path d="M114,154 C108,118 122,92 156,88 C188,86 204,110 202,154 Z" fill="url(#ms-red)"/>' +
      '<path d="M128,100 C122,112 120,128 122,150" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M186,100 C198,114 202,134 200,154 L176,154 C184,136 184,116 176,96 Z" fill="#5c120e" opacity=".35"/>' +
      '<g fill="url(#ms-white)">' + fluff([[158, 92], [157, 102], [157, 112], [157, 122], [158, 132], [158, 142]], 6.5) + '</g>' +
      '<rect x="116" y="126" width="86" height="11" rx="2" fill="#1d1d24"/>' +
      '<rect x="149" y="122.5" width="18" height="18" rx="3" fill="none" stroke="url(#ms-gold)" stroke-width="3.6"/>' +
      /* the arm holding the reins */
      '<path d="M186,104 C200,108 214,112 224,114" stroke="url(#ms-red)" stroke-width="13" fill="none" stroke-linecap="round"/>' +
      '<g fill="url(#ms-white)">' + fluff([[218, 112, 7], [216, 105, 4.5], [219, 119, 4.5]]) + '</g>' +
      '<ellipse cx="228" cy="114" rx="8" ry="7.5" fill="#1f5a3c"/>' +
      /* head */
      '<circle cx="160" cy="58" r="20" fill="url(#ms-skin)"/>' +
      '<circle cx="146" cy="64" r="5.5" fill="#f4927e" opacity=".55"/><circle cx="174" cy="64" r="5.5" fill="#f4927e" opacity=".55"/>' +
      /* beard and mustache */
      '<g fill="url(#ms-white)">' + spin(-3, 4, 160, 64, 0.9, 0) + fluff([[140, 64, 9], [146, 76, 11], [158, 84, 12], [172, 76, 11], [178, 64, 9], [152, 92, 9], [166, 92, 9], [159, 100, 8], [146, 98, 6], [140, 90, 5]]) +
      '<path d="M146,80 C150,88 156,92 162,94 M166,80 C168,86 166,92 162,96" stroke="#c9d6e0" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>' +
      '<path d="M159,64 C152,58 142,60 140,67 C146,66 152,68 159,67 C166,68 172,66 178,67 C176,60 166,58 159,64 Z" fill="#fff"/>' +
      '<ellipse cx="159.5" cy="60" rx="5" ry="4.2" fill="#ef9d86"/><circle cx="158" cy="58.6" r="1.4" fill="#fff" opacity=".6"/>' +
      /* jolly closed eyes, eyebrows, little gold spectacles */
      '<path d="M146,51 C148,48 152,48 154,51 M165,51 C167,48 171,48 173,51" stroke="#3a2416" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<circle cx="150" cy="51" r="6" fill="none" stroke="url(#ms-gold)" stroke-width="1.4"/><circle cx="169" cy="51" r="6" fill="none" stroke="url(#ms-gold)" stroke-width="1.4"/><path d="M156,51 L163,51" stroke="url(#ms-gold)" stroke-width="1.4"/>' +
      '<path d="M143,43 C147,40 153,41 155,43 M164,43 C166,41 172,40 176,43" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
      /* hat: its tail streams back in the wind and flutters, the bobble with it */
      '<g>' + spin(-6, 9, 150, 30, 0.7, 0) +
      '<path d="M140,42 C138,22 150,10 166,12 C150,14 132,18 112,30 C104,34 100,40 104,44 C110,40 120,38 130,40 Z" fill="url(#ms-red)"/>' +
      '<path d="M140,40 C132,30 122,30 112,32" fill="none" stroke="#5c120e" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>' +
      '<g fill="url(#ms-white)">' + fluff([[103, 44, 8], [98, 40, 4.5], [108, 40, 4.5], [102, 50, 4.5]]) + '</g></g>' +
      '<path d="M140,42 C138,24 152,10 170,12 C184,14 182,30 180,40 Z" fill="url(#ms-red)"/>' +
      '<path d="M148,22 C156,16 166,15 174,18" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>' +
      '<g fill="url(#ms-white)">' + fluff([[140, 42], [148, 40], [156, 39], [164, 39], [172, 40], [180, 42]], 6) + '</g>' +
      '</g>' +
      /* the sleigh: red lacquer, gold scrollwork, a curled front with a lantern */
      '<g>' +
      '<path d="M18,150 C12,118 22,94 42,90 C56,88 62,100 58,114 C80,120 170,122 220,116 C238,113 248,98 250,82 C262,94 264,122 250,144 C236,166 208,176 172,178 L64,178 C38,178 22,168 18,150 Z" fill="url(#ms-lacquer)"/>' +
      '<path d="M58,114 C80,120 170,122 220,116 C238,113 248,98 250,82" fill="none" stroke="url(#ms-gold)" stroke-width="4.4" stroke-linecap="round"/>' +
      '<path d="M18,150 C12,118 22,94 42,90 C56,88 62,100 58,114" fill="none" stroke="url(#ms-gold)" stroke-width="4.4" stroke-linecap="round"/>' +
      '<path d="M42,104 C34,104 32,96 38,94 C44,92 46,100 40,100" fill="none" stroke="url(#ms-gold)" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M250,82 C256,74 266,76 264,84 C262,90 254,88 256,84" fill="none" stroke="url(#ms-gold)" stroke-width="3" stroke-linecap="round"/>' +
      /* filigree on the side */
      '<g fill="none" stroke="url(#ms-gold)" stroke-width="2.4" stroke-linecap="round" opacity=".95">' +
      '<path d="M70,150 C80,134 100,134 106,146 C110,156 100,162 94,156 C90,150 96,146 100,150"/>' +
      '<path d="M206,150 C196,134 176,134 170,146 C166,156 176,162 182,156 C186,150 180,146 176,150"/>' +
      '<path d="M112,150 C124,142 152,142 164,150"/><path d="M120,160 C132,156 144,156 156,160"/>' +
      '<circle cx="138" cy="140" r="4"/></g>' +
      '<path d="M30,132 C36,150 52,160 80,162" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M64,178 L172,178" stroke="#4a0e0b" stroke-opacity=".5" stroke-width="2"/>' +
      /* runners */
      '<path d="M54,178 L48,200 M128,178 L128,200 M200,176 L206,200" stroke="url(#ms-gold)" stroke-width="3.6" stroke-linecap="round"/>' +
      '<path d="M14,200 C8,200 6,192 12,190 M14,200 L236,200 C270,200 280,172 262,162 C250,156 240,166 248,174" fill="none" stroke="url(#ms-gold)" stroke-width="5" stroke-linecap="round"/>' +
      /* lantern */
      '<path d="M262,84 C270,78 276,80 278,86" fill="none" stroke="url(#ms-gold)" stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle cx="279" cy="100" r="26" fill="url(#ms-lamp)" class="ms-glow"/>' +
      '<rect x="272" y="88" width="14" height="20" rx="2.5" fill="#fff3c4" stroke="url(#ms-gold)" stroke-width="2"/>' +
      '<path d="M272,88 L286,88 L279,81 Z M273,108 L285,108 L282,112 L276,112 Z" fill="url(#ms-gold)"/><path d="M279,92 C283,97 281,103 279,104 C277,103 275,97 279,92 Z" fill="#ff9d2e"/>' +
      '</g>' +
      /* the speech bubble when he waves */
      '<g class="ms-bubble" style="opacity:0" transform="translate(40,-26)"><rect class="ms-bubble-box" x="76" y="-22" width="90" height="28" rx="4" fill="#fff" stroke="#74bfeb" stroke-width="1.6"/>' +
      '<path d="M108,6 L116,16 L120,6 Z" fill="#fff"/><path d="M108,6 L116,16 L120,6" fill="none" stroke="#74bfeb" stroke-width="1.6"/><rect x="107" y="3" width="15" height="4" fill="#fff"/>' +
      '<text class="ms-bubble-text" x="121" y="-3" text-anchor="middle" font-family="IBM Plex Sans,-apple-system,Segoe UI,sans-serif" font-size="14" font-weight="700" fill="#0d314c">Ho ho ho!</text></g>' +
      '</svg>';
  }

  function sleighCss() {
    if (document.getElementById('mismo-sleigh-css')) return;
    var s = document.createElement('style');
    s.id = 'mismo-sleigh-css';
    s.textContent =
      '.ms-sky{position:fixed;inset:0;pointer-events:none;z-index:2147483001;overflow:hidden}' +
      '.ms-fly{position:absolute;left:0;top:0;will-change:transform;transform-origin:30% 50%}' +
      '.ms-bob{animation:msBob 1.3s ease-in-out infinite alternate}' +
      '.ms-flight{display:block;width:100%;height:auto;overflow:visible}' +
      '.ms-deer{animation:msDeer .52s ease-in-out infinite alternate}' +
                  '.ms-wave{transform-box:fill-box;transform-origin:82% 96%}.ms-bubble{transform-box:fill-box;transform-origin:50% 100%}' +
      '.ms-streaks{animation:msStreak .45s linear infinite}' +
      '@keyframes msStreak{from{transform:translateX(30px);opacity:.9}to{transform:translateX(-60px);opacity:.2}}' +
      '.ms-aura{animation:msAura 1.6s ease-in-out infinite alternate}' +
      '.ms-glow{animation:msGlow 1s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}' +
      '.ms-bells{animation:msJingle .26s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:top center}' +
      '.ms-wave{transform:rotate(-140deg)}' +
      '.ms-spark{position:absolute;left:0;top:0;pointer-events:none;will-change:transform,opacity;display:block}' +
      '.ms-dot{border-radius:50%;background:radial-gradient(circle,currentColor 0 30%,transparent 72%)}' +
      '.ms-orb{border-radius:50%;background:radial-gradient(circle,currentColor 0 18%,transparent 70%);opacity:.6}' +
      '.ms-star{background:currentColor;clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%)}' +
      '@keyframes msBob{from{transform:translateY(-5px)}to{transform:translateY(6px)}}' +
      '@keyframes msDeer{from{transform:translateY(-2.5px)}to{transform:translateY(2.5px)}}' +
      '@keyframes msAura{from{opacity:.7}to{opacity:1}}' +
      '@keyframes msGlow{from{opacity:.55;transform:scale(.8)}to{opacity:1;transform:scale(1.35)}}' +
      '@keyframes msJingle{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}';
    (document.head || document.documentElement).appendChild(s);
  }

  /* a sparkle in the trail: gold, white or sky, a star or a twinkle, drifting down as it fades */
  function sparkle(sky, x, y) {
    var size = 5 + Math.random() * 11, c = ['#ffd76a', '#ffffff', '#74bfeb', '#ffe9a8', '#bfe3f7'][Math.floor(Math.random() * 5)];
    var e = document.createElement('i'), r = Math.random();
    if (r < 0.12) size = 22 + Math.random() * 26;
    e.className = 'ms-spark ' + (r < 0.12 ? 'ms-orb' : r < 0.6 ? 'ms-star' : 'ms-dot');
    e.style.width = e.style.height = size + 'px';
    e.style.color = c;
    sky.appendChild(e);
    var dx = -20 - Math.random() * 50, dy = 30 + Math.random() * 90, dur = 1100 + Math.random() * 1300;
    var a = e.animate([
      { transform: 'translate(' + (x - size / 2) + 'px,' + (y - size / 2) + 'px) scale(.3) rotate(0deg)', opacity: 0 },
      { transform: 'translate(' + (x - size / 2 + dx * 0.2) + 'px,' + (y - size / 2 + dy * 0.15) + 'px) scale(1) rotate(60deg)', opacity: 1, offset: 0.15 },
      { transform: 'translate(' + (x - size / 2 + dx) + 'px,' + (y - size / 2 + dy) + 'px) scale(.2) rotate(200deg)', opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' });
    a.onfinish = function () { e.remove(); };
  }

  var lastActive = 0, pointer = null;
  ['mousemove', 'keydown', 'scroll', 'touchstart', 'pointerdown', 'wheel'].forEach(function (ev) {
    window.addEventListener(ev, function (e) {
      lastActive = Date.now();
      if (e.clientX != null) pointer = { x: e.clientX, y: e.clientY };
    }, { passive: true, capture: true });
  });

  var flying = false;
  function fly() {
    if (flying || !document.body) return;
    try { if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
    flying = true;
    sleighCss();
    var W = window.innerWidth, H = window.innerHeight;
    var w = Math.max(300, Math.min(760, W * 0.5)), h = w * 280 / 740;
    var sky = document.createElement('div');
    sky.className = 'ms-sky'; sky.setAttribute('aria-hidden', 'true');
    var box = document.createElement('div');
    box.className = 'ms-fly'; box.style.width = w + 'px';
    var bob = document.createElement('div');
    bob.className = 'ms-bob';
    bob.innerHTML = sleighSvg();
    box.appendChild(bob); sky.appendChild(box); document.body.appendChild(sky);

    /* the path: in from the left, a long climbing curve across the middle of the screen, out on the right */
    var dur = Math.max(9000, Math.min(14000, W * 8)), steps = 40, frames = [];
    /* the whole sleigh always stays on screen: it never climbs past the top or dips past the bottom */
    var top = h * 0.62 + 12, bottom = Math.max(top + 40, H - h * 0.6);
    var y0 = Math.min(bottom, H * (0.5 + Math.random() * 0.12)), y1 = Math.max(top, Math.min(bottom, H * (0.28 + Math.random() * 0.08)));
    var pt = function (t) {
      var x = -w * 1.05 + (W + w * 1.15) * t;
      var y = Math.max(top, Math.min(bottom, y0 + (y1 - y0) * (1 - Math.pow(1 - t, 1.6)) + Math.sin(t * Math.PI * 2.2) * H * 0.035));
      return { x: x, y: y - h / 2 };
    };
    for (var i = 0; i <= steps; i++) {
      var t = i / steps, p = pt(t), q = pt(Math.min(1, t + 0.02));
      var ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI * 0.55;
      /* swoops toward you as he passes the middle, then away */
      var sc = 0.72 + 0.34 * Math.sin(Math.PI * Math.min(1, t * 1.1));
      frames.push({ transform: 'translate(' + p.x + 'px,' + p.y + 'px) rotate(' + ang + 'deg) scale(' + sc.toFixed(3) + ')', offset: t });
    }
    var anim = box.animate(frames, { duration: dur, easing: 'linear', fill: 'forwards' });

    /* sparkles stream from the back of the sleigh and the runner */
    var at = function () {
      var t = Math.min(1, (anim.currentTime || 0) / dur), p = pt(t), sc = 0.72 + 0.34 * Math.sin(Math.PI * Math.min(1, t * 1.1));
      return { left: p.x + w * 0.3 * (1 - sc), top: p.y + h * 0.5 * (1 - sc), width: w * sc, height: h * sc };
    };
    var trail = setInterval(function () {
      var r = at();
      for (var n = 0; n < 3; n++) sparkle(sky, r.left + r.width * (0.01 + Math.random() * 0.1), r.top + r.height * (0.5 + Math.random() * 0.38));
      if (Math.random() < 0.4) sparkle(sky, r.left + r.width * (0.4 + Math.random() * 0.55), r.top + r.height * (0.25 + Math.random() * 0.3));
    }, 55);

    /* he waves if you're watching: as he crosses the middle, if you've used the page in the last
       minute, and whenever your pointer comes near him */
    var waved = 0, svg = bob.querySelector('svg'), arm = svg.querySelector('.ms-wave'), bubble = svg.querySelector('.ms-bubble');
    var waves = 0;
    function wave() {
      if (Date.now() - waved < 2600) return;
      waved = Date.now(); waves++;
      var txt = bubble.querySelector('.ms-bubble-text'), bx = bubble.querySelector('.ms-bubble-box');
      if (waves > 1) { txt.textContent = 'Merry Christmas!'; bx.setAttribute('width', '132'); bx.setAttribute('x', '55'); }
      setTimeout(function () {
        var m = svg.querySelector('.ms-wave ellipse'), r = m ? m.getBoundingClientRect() : null;
        if (r) for (var n = 0; n < 16; n++) sparkle(sky, r.left + r.width / 2 + (Math.random() - 0.5) * 30, r.top + (Math.random() - 0.5) * 30);
      }, 380);
      if (waves === 1) snow(true);
      arm.animate([
        { transform: 'rotate(-140deg)' }, { transform: 'rotate(-10deg)', offset: 0.16 }, { transform: 'rotate(22deg)', offset: 0.27 },
        { transform: 'rotate(-14deg)', offset: 0.38 }, { transform: 'rotate(22deg)', offset: 0.49 }, { transform: 'rotate(-14deg)', offset: 0.6 },
        { transform: 'rotate(18deg)', offset: 0.71 }, { transform: 'rotate(-6deg)', offset: 0.82 }, { transform: 'rotate(-140deg)' }
      ], { duration: 2300, easing: 'ease-in-out' });
      bubble.animate([
        { opacity: 0, transform: 'scale(.4) translateY(8px)' }, { opacity: 1, transform: 'scale(1.06) translateY(0)', offset: 0.14 },
        { opacity: 1, transform: 'scale(1) translateY(0)', offset: 0.8 }, { opacity: 0, transform: 'scale(.9) translateY(-6px)' }
      ], { duration: 2000, easing: 'ease-out' });
    }
    var watch = setInterval(function () {
      var r = at(), cx = r.left + r.width * 0.25, cy = r.top + r.height * 0.35;
      var mid = cx > W * 0.3 && cx < W * 0.62;
      var watching = Date.now() - lastActive < 60000;
      var near = pointer && Math.abs(pointer.x - cx) < w * 0.45 && Math.abs(pointer.y - cy) < h * 0.9;
      if ((mid && watching && !waved) || near) wave();
    }, 120);

    anim.onfinish = function () {
      clearInterval(trail); clearInterval(watch);
      setTimeout(function () { sky.remove(); flying = false; }, 2600);
    };
    return true;
  }

  /* when he comes: the same minute for everyone at MISMO on a given day, between 9:30 AM and
     4:30 PM Eastern, worked out from the date */
  function eastern() {
    var p = {};
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    } catch (e) { return null; }
    return { day: p.year + '-' + p.month + '-' + p.day, month: +p.month, date: +p.day, wd: p.weekday, mins: (+p.hour) * 60 + (+p.minute) };
  }
  function slot(day) {
    var h = 2166136261;
    for (var i = 0; i < day.length; i++) { h ^= day.charCodeAt(i); h = Math.imul(h, 16777619); }
    return 9 * 60 + 30 + ((h >>> 0) % (7 * 60));   /* 9:30 AM to 4:29 PM */
  }
  function sleighWatch() {
    if (/[?&]holiday=sleigh\b/.test(location.search)) { setTimeout(fly, 1500); return; }
    var check = function () {
      var e = eastern();
      if (!e || e.month !== 12 || e.date >= 25 || e.wd === 'Sat' || e.wd === 'Sun') return;
      /* only at that moment: a two-minute window, never later in the day */
      if (e.mins < slot(e.day) || e.mins > slot(e.day) + 1) return;
      if (document.visibilityState !== 'visible') return;
      var seen = null;
      try { seen = localStorage.getItem('mismo.sleigh'); } catch (x) {}
      if (seen === e.day) return;
      try { localStorage.setItem('mismo.sleigh', e.day); } catch (x) {}   /* once a day, in one tab only */
      fly();
    };
    /* checked every 15 seconds, so whoever is looking at that moment sees him */
    setInterval(check, 15000);
    setTimeout(check, 2000);
  }
  window.MismoHoliday.sleigh = fly;

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
    sleighWatch();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
