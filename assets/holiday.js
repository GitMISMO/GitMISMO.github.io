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

   Santa's flight: once a business day in December, a different time each day (see sleighWatch below).

   Preview outside December: add ?holiday=preview to a page's address, or run
   localStorage.setItem('mismo.holiday','preview') in that browser (removeItem to stop).
   Owner: Forms and shared pages (GitMISMO.github.io). Change notices: GitMISMO/mismo-connections. */
(function () {
  'use strict';
  if (window.MismoHoliday) return;
  var preview = false;
  try { preview = /[?&]holiday=(preview|sleigh)\b/.test(location.search) || localStorage.getItem('mismo.holiday') === 'preview'; } catch (e) {}
  var now = new Date();
  /* never on the website's side: public forms, applications and work-product downloads */
  var publicPage = /^\/(forms|work-products)(\/|$)/i.test(location.pathname);
  var on = (now.getMonth() === 11 || preview) && !publicPage;
  window.MismoHoliday = { on: on, version: '2026-11-26e' };
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

  /* ------------------------------------------------------------------------------------------
     Santa's flight (Jonna, Nov 26, 2026). Once a day in December, on a business day, at a
     different time each day between 9:30 AM and 4:30 PM Eastern, Santa flies across the screen
     on his sleigh behind his reindeer, Rudolph's nose glowing in front, a trail of gold and sky
     sparkles behind. If you're watching (you've used the page in the last minute, or your
     pointer comes near him) he turns and waves. The time is the same for everyone at MISMO, so
     the whole team sees him go by together. Once a day per person, across every tool: if no
     MISMO tool was open at that moment, he comes by once the next time one is, before 5 PM
     Eastern. Not on weekends or Winter Break (December 25 to 31), and never for anyone whose
     computer asks for reduced motion. Preview any time: ?holiday=sleigh on a page's address.
     ------------------------------------------------------------------------------------------ */
  var DEER_BODY = 'M12,34 C10,26 18,21 32,21 L52,21 C60,21 65,24 67,29 L63,39 C59,43 51,43 45,43 L26,43 C17,43 13,40 12,34 Z';
  function deer(x, y, k, rudolph, back) {
    var fur = back ? 'url(#ms-fur-b)' : 'url(#ms-fur)';
    var leg = function (cls, hx, hy, d) {
      return '<g class="' + cls + '" style="transform-origin:' + hx + 'px ' + hy + 'px">' +
        '<path d="' + d + '" fill="none" stroke="' + (back ? '#4a2c1a' : '#5e3a24') + '" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</g>';
    };
    var nose = rudolph
      ? '<circle cx="87" cy="15" r="7" fill="url(#ms-glow)" class="ms-glow"/><circle cx="87" cy="15" r="3.3" fill="#ff3b30"/><circle cx="86" cy="14" r="1" fill="#fff" opacity=".85"/>'
      : '<circle cx="87" cy="15" r="2.2" fill="#2a1a10"/>';
    return '<g class="ms-deer" style="animation-delay:' + (-k * 0.17) + 's"><g transform="translate(' + x + ',' + y + ')">' +
      /* back legs (stretched back as it flies), front legs (tucked) */
      leg('ms-legb ms-a', 20, 38, 'M20,38 L12,48 L4,52') + leg('ms-legb ms-b', 26, 39, 'M26,39 L19,49 L11,54') +
      /* tail */
      '<path d="M13,30 C7,27 5,31 8,34 C10,35 12,34 13,32 Z" fill="#fff4e8"/>' +
      '<path d="' + DEER_BODY + '" fill="' + fur + '"/>' +
      '<path d="M22,40 C30,44 46,44 56,40 C50,38 32,38 22,40 Z" fill="#e9c9a0" opacity=".7"/>' +
      leg('ms-legf ms-a', 56, 39, 'M56,39 L66,44 L70,52') + leg('ms-legf ms-b', 51, 40, 'M51,40 L61,47 L63,55') +
      /* harness: gold strap and a collar of bells */
      '<path d="M44,21 C42,30 42,36 45,43" fill="none" stroke="#c0392f" stroke-width="3.4"/>' +
      '<path d="M44,21 C42,30 42,36 45,43" fill="none" stroke="#f3c75a" stroke-width="1" stroke-dasharray="2 2"/>' +
      /* neck and head */
      '<path d="M58,26 C61,18 66,12 72,10 C78,8 85,10 88,13 C90,16 88,20 84,20 L77,20 C72,22 68,28 66,32 Z" fill="' + fur + '"/>' +
      '<path d="M60,24 C64,26 67,28 67,32" fill="none" stroke="#c0392f" stroke-width="3.6"/>' +
      '<g class="ms-bells"><circle cx="61.5" cy="28" r="2" fill="#f3c75a"/><circle cx="64" cy="31.5" r="2" fill="#f3c75a"/><circle cx="66" cy="35" r="2" fill="#f3c75a"/></g>' +
      /* ear, eye, antlers */
      '<path d="M71,10 C67,6 64,7 65,10 C67,11 69,11 71,11 Z" fill="#7a4b2e"/>' +
      '<circle cx="78" cy="12.5" r="1.4" fill="#1b120c"/><circle cx="78.4" cy="12" r=".45" fill="#fff"/>' +
      '<path d="M72,9 C70,2 66,-2 61,-4 M69,3 L64,1 M66,-1 L64,-6 M76,9 C78,2 82,-1 87,-2 M79,3 L83,0 M82,0 L85,-5" fill="none" stroke="#d8b27a" stroke-width="2.1" stroke-linecap="round"/>' +
      nose + '</g></g>';
  }
  function sleighSvg() {
    return '<svg class="ms-flight" viewBox="0 -14 440 160" aria-hidden="true" focusable="false" xmlns="' + NS + '"><defs>' +
      '<linearGradient id="ms-fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9b6844"/><stop offset="1" stop-color="#5f3b24"/></linearGradient>' +
      '<linearGradient id="ms-fur-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5034"/><stop offset="1" stop-color="#4a2d1b"/></linearGradient>' +
      '<radialGradient id="ms-glow"><stop offset="0" stop-color="#ff6b5e" stop-opacity=".95"/><stop offset=".45" stop-color="#ff3b30" stop-opacity=".45"/><stop offset="1" stop-color="#ff3b30" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="ms-red" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8483c"/><stop offset=".6" stop-color="#c0392f"/><stop offset="1" stop-color="#8e2620"/></linearGradient>' +
      '<linearGradient id="ms-gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8872c"/><stop offset=".5" stop-color="#ffe08a"/><stop offset="1" stop-color="#c99a3a"/></linearGradient>' +
      '<radialGradient id="ms-white" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d7e3ec"/></radialGradient>' +
      '</defs>' +
      /* reins, from Santa's hand to the team */
      '<path class="ms-reins" d="M126,76 C170,64 210,60 238,58 M126,76 C190,72 250,66 318,60 M126,76 C220,74 300,66 366,56" fill="none" stroke="#f3c75a" stroke-width="1.2" opacity=".9"/>' +
      /* the team: two pairs, then Rudolph out front */
      deer(214, 30, 1, false, true) + deer(294, 28, 3, false, true) +
      deer(204, 42, 0, false, false) + deer(284, 40, 2, false, false) +
      deer(354, 30, 4, true, false) +
      /* the sack of presents */
      '<g><path d="M18,82 C10,62 18,44 34,40 C44,38 52,44 54,56 C56,68 52,80 46,86 Z" fill="#5a3a2a"/>' +
      '<rect x="22" y="30" width="16" height="16" rx="2" fill="#74bfeb" transform="rotate(-12 30 38)"/><path d="M30,30 L30,46 M22,38 L38,38" stroke="#fff" stroke-width="2.2" transform="rotate(-12 30 38)"/>' +
      '<rect x="36" y="24" width="14" height="18" rx="2" fill="#2f8f5b" transform="rotate(8 43 33)"/><path d="M43,24 L43,42" stroke="#f3c75a" stroke-width="2.2" transform="rotate(8 43 33)"/>' +
      '<rect x="27" y="18" width="12" height="12" rx="2" fill="#f3c75a" transform="rotate(-4 33 24)"/><path d="M33,18 L33,30 M27,24 L39,24" stroke="#c0392f" stroke-width="2" transform="rotate(-4 33 24)"/>' +
      '<path d="M22,50 C30,46 44,46 52,52" fill="none" stroke="#3e2619" stroke-width="2"/></g>' +
      /* Santa */
      '<g class="ms-santa">' +
      '<path d="M66,92 C62,72 72,58 90,56 C106,55 116,64 116,80 L116,94 Z" fill="url(#ms-red)"/>' +
      '<path d="M88,57 C86,70 87,84 90,94" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<rect x="70" y="80" width="46" height="6" rx="1.5" fill="#1d1d24"/><rect x="88" y="78.5" width="9" height="9" rx="1.5" fill="none" stroke="url(#ms-gold)" stroke-width="2"/>' +
      /* the arm that holds the reins */
      '<path d="M108,68 C116,70 122,73 126,76" stroke="url(#ms-red)" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="127" cy="76.5" r="4.6" fill="#1f5a3c"/>' +
      /* face, beard, hat */
      '<circle cx="96" cy="42" r="11.5" fill="#f6d0b5"/>' +
      '<path d="M83,44 C82,58 90,66 98,66 C106,66 112,58 110,44 C106,49 100,50 96,49 C91,50 86,48 83,44 Z" fill="url(#ms-white)"/>' +
      '<path d="M90,47 C93,45 96,46 97,47 C98,46 102,45 104,47 C101,49 99,49 97,48 C95,49 92,49 90,47 Z" fill="#fff"/>' +
      '<circle cx="100" cy="39" r="1.5" fill="#22160f"/><circle cx="92.5" cy="39" r="1.5" fill="#22160f"/>' +
      '<circle cx="104.5" cy="43" r="2.6" fill="#f2a08e" opacity=".75"/><circle cx="88" cy="43" r="2.6" fill="#f2a08e" opacity=".75"/>' +
      '<circle cx="96.5" cy="43" r="2.2" fill="#ec9d86"/>' +
      '<path d="M84,34 C84,22 96,16 106,20 C114,23 118,30 120,38 C116,36 113,34 110,33 Z" fill="url(#ms-red)"/>' +
      '<rect x="82" y="31" width="27" height="7" rx="3.5" fill="url(#ms-white)"/>' +
      '<circle cx="121" cy="39" r="4.6" fill="url(#ms-white)"/>' +
      /* the waving arm: down at his side until he waves */
      '<g class="ms-wave" style="transform-origin:76px 66px">' +
      '<path d="M76,66 C72,58 70,50 70,42" stroke="url(#ms-red)" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<path d="M70,46 L70,44" stroke="#fff" stroke-width="9" stroke-linecap="round"/>' +
      '<circle cx="70" cy="37" r="5.2" fill="#1f5a3c"/><path d="M66,35 L64,31" stroke="#1f5a3c" stroke-width="3.2" stroke-linecap="round"/></g>' +
      '</g>' +
      /* the sleigh */
      '<g><path d="M12,92 C8,104 14,118 32,120 L104,120 C124,120 138,112 146,98 C150,90 150,80 144,74 C140,84 132,92 118,92 Z" fill="url(#ms-red)"/>' +
      '<path d="M12,92 L118,92 C132,92 140,84 144,74" fill="none" stroke="url(#ms-gold)" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M36,104 C44,96 54,96 58,104 C62,112 72,112 78,104 C84,96 94,96 98,104" fill="none" stroke="url(#ms-gold)" stroke-width="2" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M40,120 L36,132 M108,120 L112,132" stroke="url(#ms-gold)" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M8,132 L138,132 C156,132 162,118 152,110 C146,106 138,110 142,116" fill="none" stroke="url(#ms-gold)" stroke-width="3.4" stroke-linecap="round"/>' +
      '</g>' +
      /* "Ho ho ho!" when he waves */
      '<g class="ms-bubble" style="opacity:0;transform-origin:70px 14px"><rect x="34" y="0" width="70" height="22" rx="4" fill="#fff" stroke="#74bfeb" stroke-width="1.4"/>' +
      '<path d="M60,22 L66,30 L70,22 Z" fill="#fff"/><text x="69" y="15.5" text-anchor="middle" font-family="IBM Plex Sans,-apple-system,Segoe UI,sans-serif" font-size="11" font-weight="700" fill="#0d314c">Ho ho ho!</text></g>' +
      '</svg>';
  }

  function sleighCss() {
    if (document.getElementById('mismo-sleigh-css')) return;
    var s = document.createElement('style');
    s.id = 'mismo-sleigh-css';
    s.textContent =
      '.ms-sky{position:fixed;inset:0;pointer-events:none;z-index:2147483001;overflow:hidden}' +
      '.ms-fly{position:absolute;left:0;top:0;will-change:transform}' +
      '.ms-bob{animation:msBob 1.3s ease-in-out infinite alternate}' +
      '.ms-flight{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 8px 12px rgba(13,49,76,.28))}' +
      '.ms-deer{animation:msDeer .52s ease-in-out infinite alternate}' +
      '.ms-legf.ms-a,.ms-legb.ms-b{animation:msLegF .52s ease-in-out infinite alternate}' +
      '.ms-legf.ms-b,.ms-legb.ms-a{animation:msLegB .52s ease-in-out infinite alternate}' +
      '.ms-legf,.ms-legb,.ms-wave,.ms-bubble{transform-box:view-box}' +
      '.ms-glow{animation:msGlow 1s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}' +
      '.ms-bells{animation:msJingle .26s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:top center}' +
      '.ms-wave{transform:rotate(-150deg)}' +
      '.ms-spark{position:absolute;left:0;top:0;pointer-events:none;will-change:transform,opacity}' +
      '@keyframes msBob{from{transform:translateY(-5px)}to{transform:translateY(6px)}}' +
      '@keyframes msDeer{from{transform:translateY(-2.5px)}to{transform:translateY(2.5px)}}' +
      '@keyframes msLegF{from{transform:rotate(-22deg)}to{transform:rotate(16deg)}}' +
      '@keyframes msLegB{from{transform:rotate(18deg)}to{transform:rotate(-20deg)}}' +
      '@keyframes msGlow{from{opacity:.55;transform:scale(.8)}to{opacity:1;transform:scale(1.35)}}' +
      '@keyframes msJingle{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}';
    (document.head || document.documentElement).appendChild(s);
  }

  /* a sparkle in the trail: gold, white or sky, a star or a twinkle, drifting down as it fades */
  function sparkle(sky, x, y) {
    var size = 5 + Math.random() * 11, c = ['#ffd76a', '#ffffff', '#74bfeb', '#ffe9a8', '#bfe3f7'][Math.floor(Math.random() * 5)];
    var e = document.createElementNS(NS, 'svg');
    e.setAttribute('viewBox', '-10 -10 20 20'); e.setAttribute('width', size); e.setAttribute('height', size);
    e.setAttribute('class', 'ms-spark');
    e.innerHTML = Math.random() < 0.55
      ? '<path d="M0,-10 C1.2,-2 2,-1.2 10,0 C2,1.2 1.2,2 0,10 C-1.2,2 -2,1.2 -10,0 C-2,-1.2 -1.2,-2 0,-10 Z" fill="' + c + '"/>'
      : '<circle r="4" fill="' + c + '"/><circle r="9" fill="' + c + '" opacity=".25"/>';
    sky.appendChild(e);
    var dx = -20 - Math.random() * 50, dy = 30 + Math.random() * 90, dur = 1100 + Math.random() * 1300;
    var a = e.animate([
      { transform: 'translate(' + x + 'px,' + y + 'px) scale(.3) rotate(0deg)', opacity: 0 },
      { transform: 'translate(' + (x + dx * 0.2) + 'px,' + (y + dy * 0.15) + 'px) scale(1) rotate(60deg)', opacity: 1, offset: 0.15 },
      { transform: 'translate(' + (x + dx) + 'px,' + (y + dy) + 'px) scale(.2) rotate(200deg)', opacity: 0 }
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
    var w = Math.max(250, Math.min(520, W * 0.36)), h = w * 160 / 440;
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
    var y0 = H * (0.42 + Math.random() * 0.12), y1 = H * (0.12 + Math.random() * 0.08);
    var pt = function (t) {
      var x = -w * 1.05 + (W + w * 1.15) * t;
      var y = y0 + (y1 - y0) * (1 - Math.pow(1 - t, 1.6)) + Math.sin(t * Math.PI * 2.2) * H * 0.035;
      return { x: x, y: y - h / 2 };
    };
    for (var i = 0; i <= steps; i++) {
      var t = i / steps, p = pt(t), q = pt(Math.min(1, t + 0.02));
      var ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI * 0.55;
      frames.push({ transform: 'translate(' + p.x + 'px,' + p.y + 'px) rotate(' + ang + 'deg)', offset: t });
    }
    var anim = box.animate(frames, { duration: dur, easing: 'linear', fill: 'forwards' });

    /* sparkles stream from the back of the sleigh and the runner */
    var trail = setInterval(function () {
      var r = box.getBoundingClientRect();
      for (var n = 0; n < 3; n++) sparkle(sky, r.left + w * (0.02 + Math.random() * 0.12), r.top + h * (0.55 + Math.random() * 0.3));
      if (Math.random() < 0.35) sparkle(sky, r.left + w * (0.8 + Math.random() * 0.15), r.top + h * (0.15 + Math.random() * 0.2));
    }, 45);

    /* he waves if you're watching: as he crosses the middle, if you've used the page in the last
       minute, and whenever your pointer comes near him */
    var waved = 0, svg = bob.querySelector('svg'), arm = svg.querySelector('.ms-wave'), bubble = svg.querySelector('.ms-bubble');
    function wave() {
      if (Date.now() - waved < 2600) return;
      waved = Date.now();
      arm.animate([
        { transform: 'rotate(-150deg)' }, { transform: 'rotate(-10deg)', offset: 0.16 }, { transform: 'rotate(22deg)', offset: 0.27 },
        { transform: 'rotate(-14deg)', offset: 0.38 }, { transform: 'rotate(22deg)', offset: 0.49 }, { transform: 'rotate(-14deg)', offset: 0.6 },
        { transform: 'rotate(18deg)', offset: 0.71 }, { transform: 'rotate(-6deg)', offset: 0.82 }, { transform: 'rotate(-150deg)' }
      ], { duration: 2300, easing: 'ease-in-out' });
      bubble.animate([
        { opacity: 0, transform: 'scale(.4) translateY(8px)' }, { opacity: 1, transform: 'scale(1.06) translateY(0)', offset: 0.14 },
        { opacity: 1, transform: 'scale(1) translateY(0)', offset: 0.8 }, { opacity: 0, transform: 'scale(.9) translateY(-6px)' }
      ], { duration: 2000, easing: 'ease-out' });
    }
    var watch = setInterval(function () {
      var r = box.getBoundingClientRect(), cx = r.left + r.width * 0.25, cy = r.top + r.height * 0.35;
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
      if (e.mins < slot(e.day) || e.mins >= 17 * 60) return;
      if (document.visibilityState !== 'visible') return;
      var seen = null;
      try { seen = localStorage.getItem('mismo.sleigh'); } catch (x) {}
      if (seen === e.day) return;
      try { localStorage.setItem('mismo.sleigh', e.day); } catch (x) {}   /* once a day, in one tab only */
      fly();
    };
    /* checked every 20 seconds; after coming back to a tab, a short pause first so it's a surprise */
    setInterval(check, 20000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') setTimeout(check, 6000 + Math.random() * 20000);
    });
    setTimeout(check, 8000 + Math.random() * 12000);
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
