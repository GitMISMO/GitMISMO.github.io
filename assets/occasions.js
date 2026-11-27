/* MISMO holidays besides December (Jonna, Nov 27, 2026), for every internal tool on resources.mismo.org and MyMISMO.
   ------------------------------------------------------------------------------------------------------------------
   Loaded by /assets/holiday.js only on the day (its calendar picks the day: the holiday itself, or the business day
   before when it falls on a weekend or a MISMO day off). One look per holiday:
   - New Year's: the first time each person opens any tool in January, fireworks, confetti and the new year in gold,
     and a party hat on the O for that day. Once per person per year.
   - Groundhog Day: a groundhog pops up from its burrow in the corner, looks around and ducks back down.
   - Valentine's Day: a cupid flies across and shoots an arrow into the O; hearts float up.
   - Pi Day: a pie rises at the bottom with the digits of pi streaming up from it.
   - St. Patrick's Day: a leprechaun hat on the O, a rainbow across the top into a pot of gold, shamrocks drifting.
   - Easter (shows on Good Friday): bunny ears on the O; a bunny hops along the bottom, stops for a look, leaves eggs.
   - Earth Day: a spinning globe rises at the bottom with leaves swirling.
   - First day of summer: sunglasses slide onto the O, with a warm glow.
   - 4th of July: an Uncle Sam hat on the O and red, white and blue fireworks.
   - Halloween: a witch hat on the O and bats flying across; hover and a spider drops down on its thread.
   - Thanksgiving (shows on the Wednesday): a pilgrim hat on the O, autumn leaves falling and a turkey waddling by.
   The show plays the first time a tool is opened that day (per browser session); hovering over the logo brings a
   little of it back. Never for anyone whose computer asks for reduced motion (hats still show). Nothing is ever
   clickable: everything lets clicks through, and a click on a hat does what a click on the logo does.
   Preview: ?holiday=<name> (newyear, groundhog, valentine, piday, stpatrick, easter, earthday, summer, july4,
   halloween, thanksgiving) plays it on every load.
   Owner: Forms and shared pages (GitMISMO.github.io). */
(function () {
  'use strict';
  var H = window.MismoHoliday || {}, OCC = H.occasion;
  if (!OCC || OCC === 'christmas' || window.MismoOccasions) return;
  var PREVIEW = !!H.preview;
  window.MismoOccasions = { version: '2026-11-27', occasion: OCC };
  var NS = 'http://www.w3.org/2000/svg';
  var still = false;
  try { still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var R = Math.random, rnd = function (a, b) { return a + R() * (b - a); }, pick = function (a) { return a[Math.floor(R() * a.length)]; };
  var uid = 0;

  /* ---------------- shared pieces ---------------- */
  function css() {
    if (document.getElementById('mismo-occ-css')) return;
    var s = document.createElement('style');
    s.id = 'mismo-occ-css';
    s.textContent =
      '.mismo-hat-host{position:relative!important;overflow:visible!important}' +
      '.mismo-hat-host .santa{display:none!important}' +
      '.mo-hat{position:absolute!important;display:block!important;pointer-events:visiblePainted;cursor:default;z-index:2;overflow:visible;' +
      'filter:drop-shadow(0 1px 1.5px rgba(13,49,76,.35))}' +
      '.mo-sky{position:fixed;inset:0;pointer-events:none;z-index:2147483001;overflow:hidden}' +
      '.mo-p{position:absolute;left:0;top:0;pointer-events:none;will-change:transform,opacity;display:block}' +
      '.mo-dot{border-radius:50%;background:radial-gradient(circle,currentColor 0 35%,transparent 72%)}' +
      '.mo-glow{border-radius:50%;background:radial-gradient(circle,currentColor 0 12%,transparent 68%)}' +
      '.mo-star{background:currentColor;clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}' +
      '.mo-conf{border-radius:1.5px}' +
      '.mo-big{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);text-align:center;font-family:"IBM Plex Sans",-apple-system,"Segoe UI",sans-serif;white-space:nowrap}' +
      '.mo-big b{display:block;font-weight:800;line-height:1;letter-spacing:.02em;' +
      'background:linear-gradient(180deg,#fff6cf 0%,#ffd76a 35%,#e2a73b 62%,#fff0b8 80%,#c98d23 100%);-webkit-background-clip:text;background-clip:text;color:transparent;' +
      'filter:drop-shadow(0 4px 14px rgba(13,49,76,.45))}' +
      '.mo-big span{display:block;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:#0d314c;' +
      'text-shadow:0 0 12px #fff,0 0 4px #fff}' +
      '.mo-bubble{position:absolute;background:#fff;border:1.5px solid #74bfeb;border-radius:4px;padding:5px 10px;' +
      'font:700 14px/1.2 "IBM Plex Sans",-apple-system,"Segoe UI",sans-serif;color:#0d314c;white-space:nowrap;box-shadow:0 4px 14px rgba(13,49,76,.18)}' +
      '.mo-digit{position:absolute;left:0;top:0;font:800 22px/1 "IBM Plex Sans",-apple-system,"Segoe UI",sans-serif;will-change:transform,opacity}';
    (document.head || document.documentElement).appendChild(s);
  }
  function svg(vb, inner, w, h) {
    var e = document.createElementNS(NS, 'svg');
    e.setAttribute('viewBox', vb); e.setAttribute('aria-hidden', 'true'); e.setAttribute('focusable', 'false');
    if (w) e.setAttribute('width', w); if (h) e.setAttribute('height', h);
    e.style.overflow = 'visible';
    e.innerHTML = inner;
    return e;
  }
  /* the ids inside a drawing are made unique, so two copies on one page never share their colors */
  function ids(s) { var k = '-' + (++uid); return s.replace(/\b(I-[a-z0-9]+)\b/g, '$1' + k); }
  var skyEl = null, skyUse = 0;
  function sky() {
    if (!skyEl || !skyEl.isConnected) { skyEl = document.createElement('div'); skyEl.className = 'mo-sky'; skyEl.setAttribute('aria-hidden', 'true'); document.body.appendChild(skyEl); }
    skyUse++; return skyEl;
  }
  function done(el, ms) { setTimeout(function () { if (el && el.remove) el.remove(); if (--skyUse <= 0 && skyEl) { skyEl.remove(); skyEl = null; skyUse = 0; } }, ms); }
  function anim(el, frames, o) { return el.animate ? el.animate(frames, o) : null; }

  /* the logos: every one marked data-mismo-logo, or the masthead logo found by itself (as holiday.js) */
  function hostOf(el) { var h = el.closest('.plate, .logoplate, .logo-plate, .lplate, [class*="plate"]') || el.parentElement; return h && h !== document.body ? { host: h, logo: el } : null; }
  function plates() {
    var marked = document.querySelectorAll('[data-mismo-logo]'), out = [];
    for (var i = 0; i < marked.length; i++) { var m = hostOf(marked[i]); if (m) out.push(m); }
    if (out.length) return out;
    var u = document.querySelector('header use[href="#mismo-logo"], .mast use[href="#mismo-logo"], .masthead use[href="#mismo-logo"], use[href="#mismo-logo"]');
    var el = u ? u.closest('svg') : null;
    if (!el) el = document.querySelector('header svg[aria-label="MISMO"], header img[alt*="MISMO"], .mast svg[aria-label="MISMO"], .masthead svg[aria-label="MISMO"], .masthead img[alt*="MISMO"], .mast img[alt*="MISMO"], svg[aria-label="MISMO"], img[alt="MISMO"]');
    var one = el ? hostOf(el) : null;
    return one ? [one] : [];
  }
  /* the O of MISMO: 556 to 708 across the 708-wide lockup */
  function oBox(logo) {
    var L = logo.getBoundingClientRect();
    if (!L.width) return null;
    var w = L.width * 152 / 708;
    return { L: L, x: L.left + L.width * 556 / 708, w: w, cx: L.left + L.width * 632 / 708, cy: L.top + L.height / 2, top: L.top, h: L.height };
  }
  function visibleLogo() { var all = plates(); for (var i = 0; i < all.length; i++) { var b = oBox(all[i].logo); if (b && b.L.bottom > 0) return b; } return null; }
  function unclip(h) {
    var r = h.getBoundingClientRect(), el = h.parentElement, up = 0;
    while (el && el !== document.body && up++ < 8) {
      var cs = getComputedStyle(el), b = el.getBoundingClientRect();
      if ((cs.overflow !== 'visible' || cs.overflowY !== 'visible' || cs.overflowX !== 'visible') && (r.top < b.top || r.right > b.right || r.left < b.left)) el.style.overflow = 'visible';
      el = el.parentElement;
    }
  }

  /* ---------------- particles ---------------- */
  /* a piece that drifts: down (fall) or up (rise), swaying and turning as it goes */
  function drift(layer, make, n, o) {
    var W = innerWidth, Hh = innerHeight, longest = 0;
    for (var i = 0; i < n; i++) {
      var e = make(i), size = rnd(o.size[0], o.size[1]);
      e.style.width = size + 'px'; e.style.height = size + 'px';
      layer.appendChild(e);
      var x = W * (i + R()) / n, up = o.dir === 'up', y0 = up ? Hh + 20 : -40, dist = Hh * rnd(o.reach ? o.reach[0] : 0.55, o.reach ? o.reach[1] : 1.05);
      var y1 = up ? y0 - dist : y0 + dist, sway = rnd(16, o.sway || 40), dur = rnd(o.dur[0], o.dur[1]), delay = rnd(0, o.spread || 1800), spin = rnd(-1, 1) * (o.spin || 200);
      longest = Math.max(longest, dur + delay);
      anim(e, [
        { transform: 'translate(' + x + 'px,' + y0 + 'px) rotate(0deg)', opacity: 0 },
        { transform: 'translate(' + (x + sway) + 'px,' + (y0 + (y1 - y0) * 0.25) + 'px) rotate(' + spin * 0.3 + 'deg)', opacity: 1, offset: 0.15 },
        { transform: 'translate(' + (x - sway) + 'px,' + (y0 + (y1 - y0) * 0.65) + 'px) rotate(' + spin * 0.7 + 'deg)', opacity: 0.95, offset: 0.65 },
        { transform: 'translate(' + (x + sway * 0.4) + 'px,' + y1 + 'px) rotate(' + spin + 'deg)', opacity: 0 }
      ], { duration: dur, delay: delay, easing: 'ease-in-out', fill: 'both' });
    }
    return longest + 200;
  }
  /* a burst out of one point (the logo's O, or wherever) */
  function burst(layer, x, y, make, n, o) {
    o = o || {}; var longest = 0;
    for (var i = 0; i < n; i++) {
      var e = make(i), size = rnd(o.size ? o.size[0] : 12, o.size ? o.size[1] : 22);
      e.style.width = size + 'px'; e.style.height = size + 'px';
      layer.appendChild(e);
      var a = (o.up ? -Math.PI / 2 : 0) + (o.up ? rnd(-1.1, 1.1) : rnd(0, Math.PI * 2)), d = rnd(o.dist ? o.dist[0] : 40, o.dist ? o.dist[1] : 110);
      var dx = Math.cos(a) * d, dy = Math.sin(a) * d, fallBy = o.fall == null ? 40 : o.fall, dur = rnd(1100, 1700), spin = rnd(-280, 280);
      longest = Math.max(longest, dur);
      anim(e, [
        { transform: 'translate(' + (x - size / 2) + 'px,' + (y - size / 2) + 'px) scale(.3) rotate(0deg)', opacity: 0 },
        { transform: 'translate(' + (x - size / 2 + dx * 0.75) + 'px,' + (y - size / 2 + dy * 0.75) + 'px) scale(1) rotate(' + spin * 0.5 + 'deg)', opacity: 1, offset: 0.35 },
        { transform: 'translate(' + (x - size / 2 + dx) + 'px,' + (y - size / 2 + dy + fallBy) + 'px) scale(.85) rotate(' + spin + 'deg)', opacity: 0 }
      ], { duration: dur, easing: 'cubic-bezier(.15,.7,.35,1)', fill: 'both' });
    }
    return longest + 200;
  }
  function piece(cls, color) { var e = document.createElement('i'); e.className = 'mo-p ' + cls; e.style.color = color; return e; }
  function art(vb, inner) { var e = svg(vb, ids(inner)); e.setAttribute('class', 'mo-p'); return e; }

  /* fireworks: a rocket climbs from the bottom and bursts into a ring of sparks that sag and fade */
  function firework(layer, x, y, colors) {
    var Hh = innerHeight, rocket = piece('mo-glow', '#fff6d2');
    rocket.style.width = '10px'; rocket.style.height = '26px'; layer.appendChild(rocket);
    anim(rocket, [{ transform: 'translate(' + (x - 5) + 'px,' + Hh + 'px)', opacity: 0.2 }, { transform: 'translate(' + (x - 5) + 'px,' + (y - 13) + 'px)', opacity: 1 }],
      { duration: 650, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' });
    setTimeout(function () {
      rocket.remove();
      var flash = piece('mo-glow', pick(colors)); flash.style.width = flash.style.height = '130px'; layer.appendChild(flash);
      anim(flash, [{ transform: 'translate(' + (x - 65) + 'px,' + (y - 65) + 'px) scale(.2)', opacity: 0.9 }, { transform: 'translate(' + (x - 65) + 'px,' + (y - 65) + 'px) scale(1.2)', opacity: 0 }], { duration: 600, fill: 'forwards' });
      setTimeout(function () { flash.remove(); }, 650);
      var c1 = pick(colors), c2 = pick(colors), n = 30, rad = rnd(70, 130);
      for (var i = 0; i < n; i++) {
        var p = piece(i % 5 === 0 ? 'mo-star' : 'mo-dot', i % 2 ? c1 : c2), s = i % 5 === 0 ? 9 : rnd(5, 8);
        p.style.width = p.style.height = s + 'px'; layer.appendChild(p);
        var a = i / n * Math.PI * 2 + rnd(-0.08, 0.08), d = rad * rnd(0.8, 1.05), dx = Math.cos(a) * d, dy = Math.sin(a) * d, dur = rnd(1300, 1800);
        var pa = anim(p, [
          { transform: 'translate(' + (x - s / 2) + 'px,' + (y - s / 2) + 'px)', opacity: 1 },
          { transform: 'translate(' + (x - s / 2 + dx) + 'px,' + (y - s / 2 + dy) + 'px)', opacity: 1, offset: 0.55 },
          { transform: 'translate(' + (x - s / 2 + dx * 1.08) + 'px,' + (y - s / 2 + dy + 46) + 'px)', opacity: 0 }
        ], { duration: dur, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'forwards' });
        (function (el) { setTimeout(function () { el.remove(); }, dur + 50); })(p);
      }
    }, 660);
  }
  function fireworks(layer, colors, n, spread) {
    var W = innerWidth, Hh = innerHeight;
    for (var i = 0; i < n; i++) (function (i) {
      setTimeout(function () { firework(layer, W * (0.1 + 0.8 * (i + R()) / n), Hh * rnd(0.14, 0.4), colors); }, i * (spread || 520) + rnd(0, 200));
    })(i);
    return n * (spread || 520) + 2800;
  }
  function confettiPiece(colors) {
    var e = piece('mo-conf', ''), c = pick(colors);
    e.style.background = c;
    return e;
  }
  function confetti(layer, n) {
    var cols = ['#ffd76a', '#74bfeb', '#ffffff', '#e2a73b', '#0d314c', '#bfe3f7'], W = innerWidth, Hh = innerHeight, longest = 0;
    for (var i = 0; i < n; i++) {
      var e = confettiPiece(cols), w = rnd(6, 10), h = rnd(10, 16);
      e.style.width = w + 'px'; e.style.height = h + 'px'; layer.appendChild(e);
      var x = W * (i + R()) / n, fall = Hh * rnd(0.6, 1.1), dur = rnd(3400, 5600), delay = rnd(0, 1400), sw = rnd(20, 60), r0 = rnd(0, 360);
      longest = Math.max(longest, dur + delay);
      anim(e, [
        { transform: 'translate(' + x + 'px,-30px) rotate(' + r0 + 'deg) scaleX(1)', opacity: 1 },
        { transform: 'translate(' + (x + sw) + 'px,' + fall * 0.3 + 'px) rotate(' + (r0 + 220) + 'deg) scaleX(-1)', opacity: 1, offset: 0.3 },
        { transform: 'translate(' + (x - sw) + 'px,' + fall * 0.65 + 'px) rotate(' + (r0 + 470) + 'deg) scaleX(1)', opacity: 1, offset: 0.65 },
        { transform: 'translate(' + (x + sw * 0.5) + 'px,' + fall + 'px) rotate(' + (r0 + 720) + 'deg) scaleX(-1)', opacity: 0 }
      ], { duration: dur, delay: delay, easing: 'linear', fill: 'both' });
    }
    return longest + 200;
  }

  /* ---------------- the drawings ---------------- */
  var GOLD = '<linearGradient id="I-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a8781f"/><stop offset=".4" stop-color="#ffe7a0"/><stop offset=".65" stop-color="#e2b04a"/><stop offset="1" stop-color="#9c6f1c"/></linearGradient>';
  var heartP = 'M0,8 C-13,-1 -8,-11 0,-4 C8,-11 13,-1 0,8 Z';
  function heart(c) { return '<path d="' + heartP + '" fill="' + c + '"/><ellipse cx="-4.2" cy="-3.6" rx="1.8" ry="1.2" fill="#fff" opacity=".6" transform="rotate(-30 -4.2 -3.6)"/>'; }
  var leafA = 'M0,-10 L2,-5.5 L6.5,-7.5 L5.2,-2.4 L10,-1.2 L6.2,2 L7.6,5.6 L2.4,4.4 L1,9.6 L0,10 L-1,9.6 L-2.4,4.4 L-7.6,5.6 L-6.2,2 L-10,-1.2 L-5.2,-2.4 L-6.5,-7.5 L-2,-5.5 Z';
  function leaf(c, v) { return '<path d="' + leafA + '" fill="' + c + '" stroke="' + c + '" stroke-width="1.2" stroke-linejoin="round"/><path d="M0,10 L0,-7 M0,1.5 L5.5,-2.5 M0,1.5 L-5.5,-2.5" stroke="' + v + '" stroke-width=".9" fill="none" opacity=".7"/>'; }
  function greenLeaf(c) { return '<path d="M0,-10 C7,-5 7,5 0,10 C-7,5 -7,-5 0,-10 Z" fill="' + c + '"/><path d="M0,-8 L0,9 M0,-2 L3.5,-5 M0,2 L-3.5,-1" stroke="#1f6b3a" stroke-width=".9" fill="none" opacity=".6"/>'; }
  var lobe = 'M0,0 C-7.5,-3 -7.5,-10.5 -2.7,-10.5 C-1.2,-10.5 0,-9 0,-8 C0,-9 1.2,-10.5 2.7,-10.5 C7.5,-10.5 7.5,-3 0,0 Z';
  function shamrock(c) { return '<path d="M0,0 C1,4.5 3,7.5 6.5,9.5" stroke="#2e7d4a" stroke-width="1.8" fill="none" stroke-linecap="round"/>' + [0, 120, 240].map(function (a) { return '<path d="' + lobe + '" fill="' + c + '" transform="rotate(' + a + ')"/>'; }).join('') + '<circle r="1.6" fill="#2e7d4a"/>'; }
  function coin() { return '<circle r="9" fill="#d69e2e"/><circle r="7.2" fill="#f7cf5c" stroke="#c48a22" stroke-width="1"/><path d="M-2.6,-4.4 C-1,-5.6 2.8,-5.2 2.8,-3 C2.8,-.4 -2.6,.2 -2.6,2.8 C-2.6,5 1.6,5.4 3,4" stroke="#b07a1c" stroke-width="1.5" fill="none" stroke-linecap="round"/><ellipse cx="-3.8" cy="-4.4" rx="2" ry="1.2" fill="#fff6c8" opacity=".8" transform="rotate(-35 -3.8 -4.4)"/>'; }
  var EGGS = [['#f7b6c8', '#ffffff', '#e8799a'], ['#bfe3f7', '#ffffff', '#5aa9dc'], ['#fff0a8', '#f3a623', '#ffffff'], ['#c9f2d2', '#4caf6a', '#ffffff'], ['#dccbf5', '#8e6bd1', '#ffffff']];
  function egg(k) { var c = EGGS[k % EGGS.length]; return '<ellipse rx="6.8" ry="8.8" fill="' + c[0] + '"/><path d="M-6.6,-1 L-4.2,-3.2 L-1.6,-1 L1,-3.2 L3.6,-1 L6.6,-3.2" stroke="' + c[1] + '" stroke-width="1.7" fill="none" stroke-linejoin="round"/><path d="M-6.4,3 L6.4,3" stroke="' + c[2] + '" stroke-width="1.5"/><circle cx="-2.5" cy="6" r=".9" fill="' + c[2] + '"/><circle cx="2.5" cy="6" r=".9" fill="' + c[2] + '"/><ellipse cx="-2.8" cy="-4.6" rx="1.5" ry="2.6" fill="#fff" opacity=".55"/>'; }

  /* hats: drawn on 100 x 100 with the brim centred at (bx, by), brimW units wide; scale = how much wider than the O */
  var HATS = {
    party: { bx: 50, by: 88, brimW: 44, scale: 1.05, tilt: 14, inner:
      '<defs>' + GOLD + '<linearGradient id="I-cone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d5b88"/><stop offset=".55" stop-color="#0d314c"/><stop offset="1" stop-color="#071f31"/></linearGradient>' +
      '<clipPath id="I-k"><path d="M28,88 L57,14 L72,88 Z"/></clipPath></defs>' +
      '<path d="M28,88 L57,14 L72,88 Z" fill="url(#I-cone)"/>' +
      '<g clip-path="url(#I-k)"><path d="M10,78 L90,52 L90,60 L10,86 Z" fill="url(#I-gold)"/><path d="M10,52 L90,26 L90,33 L10,59 Z" fill="url(#I-gold)"/>' +
      '<circle cx="46" cy="70" r="2.3" fill="#74bfeb"/><circle cx="61" cy="76" r="2.3" fill="#74bfeb"/><circle cx="54" cy="46" r="2.1" fill="#74bfeb"/><circle cx="40" cy="83" r="2" fill="#74bfeb"/><circle cx="62" cy="58" r="1.8" fill="#fff"/>' +
      '<path d="M28,88 L57,14 L45,88 Z" fill="#fff" opacity=".1"/></g>' +
      '<ellipse cx="50" cy="88" rx="23" ry="4.6" fill="url(#I-gold)"/>' +
      '<g stroke-width="2.4" stroke-linecap="round">' + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function (a, i) {
        var r = a * Math.PI / 180; return '<path d="M57,13 L' + (57 + Math.cos(r) * 9).toFixed(1) + ',' + (13 + Math.sin(r) * 9).toFixed(1) + '" stroke="' + (i % 2 ? '#74bfeb' : '#ffd76a') + '"/>'; }).join('') + '</g>' +
      '<circle cx="57" cy="13" r="5.4" fill="url(#I-gold)"/><circle cx="55.4" cy="11.4" r="1.6" fill="#fff" opacity=".85"/>' },
    leprechaun: { bx: 50, by: 86, brimW: 76, scale: 1.4, tilt: 10, inner:
      '<defs>' + GOLD + '<linearGradient id="I-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#43b065"/><stop offset=".5" stop-color="#2a8a49"/><stop offset="1" stop-color="#16592d"/></linearGradient></defs>' +
      '<ellipse cx="50" cy="86" rx="38" ry="7.5" fill="#145a2c"/><ellipse cx="50" cy="84.5" rx="36.5" ry="5.6" fill="url(#I-g)"/>' +
      '<path d="M27,84 L30.5,36 C31,31.5 69,31.5 69.5,36 L73,84 Z" fill="url(#I-g)"/><ellipse cx="50" cy="34.5" rx="19.5" ry="4.4" fill="#36a058"/>' +
      '<path d="M33.5,80 L35.5,40 L40,39.4 L38.4,80 Z" fill="#fff" opacity=".16"/>' +
      '<path d="M28.4,67 L71.6,67 L72.5,80 L27.5,80 Z" fill="#1d1d24"/>' +
      '<rect x="43" y="65.4" width="14" height="16.2" rx="1.6" fill="none" stroke="url(#I-gold)" stroke-width="3.2"/>' +
      '<g transform="translate(65 64) scale(.62)">' + shamrock('#5cd07f') + '</g>' },
    bunny: { bx: 50, by: 92, brimW: 46, scale: 1.15, tilt: 4, inner:
      '<defs><linearGradient id="I-w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d3dbe4"/></linearGradient></defs>' +
      '<g transform="rotate(-14 38 88)"><ellipse cx="38" cy="50" rx="11.5" ry="40" fill="url(#I-w)"/><ellipse cx="38" cy="54" rx="5.6" ry="29" fill="#f7b6c8"/></g>' +
      '<g transform="rotate(16 62 88)"><path d="M50.5,88 C48,62 52,30 62,16 C70,8 76,14 74,26 C72,46 72,70 73.5,88 Z" fill="url(#I-w)"/><path d="M57,86 C56,64 58,38 64,26 C67,22 69,25 68.5,31 C67,48 67,68 68,86 Z" fill="#f7b6c8"/></g>' +
      '<path d="M24,93 Q50,79 76,93" stroke="#f49ab0" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M27,90.5 Q50,78.5 73,90.5" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round"/>' },
    unclesam: { bx: 50, by: 86, brimW: 76, scale: 1.4, tilt: 10, inner:
      '<defs><clipPath id="I-c"><path d="M28,84 L31,26 C31,21.5 69,21.5 69,26 L72,84 Z"/></clipPath></defs>' +
      '<ellipse cx="50" cy="86" rx="38" ry="7.5" fill="#16306e"/><ellipse cx="50" cy="84.6" rx="36.5" ry="5.4" fill="#22408f"/>' +
      '<path d="M28,84 L31,26 C31,21.5 69,21.5 69,26 L72,84 Z" fill="#f6f8fb"/>' +
      '<g clip-path="url(#I-c)" fill="#d23a2c"><rect x="30" y="20" width="6" height="66"/><rect x="42" y="20" width="6" height="66"/><rect x="54" y="20" width="6" height="66"/><rect x="66" y="20" width="6" height="66"/>' +
      '<path d="M28,84 L31,26 L38,26 L35,84 Z" fill="#fff" opacity=".18"/><path d="M62,26 L69,26 L72,84 L66,84 Z" fill="#000" opacity=".12"/></g>' +
      '<ellipse cx="50" cy="25" rx="19" ry="4.2" fill="#e3e8ef"/>' +
      '<path d="M29.2,65 L70.8,65 L71.7,79 L28.3,79 Z" fill="#22408f"/>' +
      [35, 44.5, 54, 63.5].map(function (x) { return '<path transform="translate(' + x + ' 72) scale(.42)" d="M0,-10 L2.9,-3.1 L9.5,-3.1 L4.3,1.2 L5.9,8.1 L0,4.2 L-5.9,8.1 L-4.3,1.2 L-9.5,-3.1 L-2.9,-3.1 Z" fill="#fff"/>'; }).join('') },
    witch: { bx: 50, by: 86, brimW: 88, scale: 1.55, tilt: 8, inner:
      '<defs>' + GOLD + '<linearGradient id="I-p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b3484"/><stop offset=".6" stop-color="#32194d"/><stop offset="1" stop-color="#180c27"/></linearGradient></defs>' +
      '<ellipse cx="50" cy="86" rx="44" ry="8.2" fill="#140a21"/><ellipse cx="50" cy="84.4" rx="42.5" ry="6.2" fill="url(#I-p)"/>' +
      '<path d="M30,84 C34,64 41,46 49,29 C53,20 62,11 78,13 C71,17 65,23 62.5,31 C60,48 64,68 70,84 Z" fill="url(#I-p)"/>' +
      '<path d="M36,78 C39,62 45,46 52,32" stroke="#fff" stroke-opacity=".14" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M31.4,75 C44,78.5 57,78.5 68.6,75 L70,84 C57,87.5 43,87.5 30,84 Z" fill="#f08a24"/>' +
      '<rect x="45" y="73.2" width="10" height="12" rx="1.4" fill="none" stroke="url(#I-gold)" stroke-width="2.6"/>' +
      '<path d="M70,22 l1.2,2.6 2.8,.3 -2.1,1.9 .6,2.8 -2.5,-1.4 -2.5,1.4 .6,-2.8 -2.1,-1.9 2.8,-.3 Z" fill="#ffd76a"/>' },
    pilgrim: { bx: 50, by: 86, brimW: 80, scale: 1.45, tilt: 9, inner:
      '<defs>' + GOLD + '<linearGradient id="I-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a4a56"/><stop offset=".55" stop-color="#26262e"/><stop offset="1" stop-color="#111116"/></linearGradient></defs>' +
      '<ellipse cx="50" cy="86" rx="40" ry="7.4" fill="#111116"/><ellipse cx="50" cy="84.6" rx="38.5" ry="5.4" fill="url(#I-b)"/>' +
      '<path d="M29,84 L33.5,34 C34,30 66,30 66.5,34 L71,84 Z" fill="url(#I-b)"/><ellipse cx="50" cy="33" rx="16.5" ry="3.8" fill="#3a3a44"/>' +
      '<path d="M35,80 L38,38 L42,37.6 L39.6,80 Z" fill="#fff" opacity=".12"/>' +
      '<path d="M30.4,66 L69.6,66 L70.6,79 L29.4,79 Z" fill="#6b5236"/>' +
      '<rect x="42.6" y="63.8" width="14.8" height="17.4" rx="1" fill="none" stroke="url(#I-gold)" stroke-width="3.4"/>' }
  };
  var GLASSES = '<defs><linearGradient id="I-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d314c"/><stop offset=".6" stop-color="#14486e"/><stop offset="1" stop-color="#74bfeb"/></linearGradient></defs>' +
    '<g stroke="#0b0f14" stroke-width="2.6" stroke-linejoin="round">' +
    '<path d="M5,10 C5,7 8,5 13,5 L50,5 C54,5 56,8 55.4,12 L52.4,29 C50.6,37 45,40 36.5,40 L22.5,40 C12.5,40 8,34 6.8,26 Z" fill="url(#I-l)"/>' +
    '<path transform="translate(120 0) scale(-1 1)" d="M5,10 C5,7 8,5 13,5 L50,5 C54,5 56,8 55.4,12 L52.4,29 C50.6,37 45,40 36.5,40 L22.5,40 C12.5,40 8,34 6.8,26 Z" fill="url(#I-l)"/></g>' +
    '<path d="M55.4,11 C58,7.6 62,7.6 64.6,11" stroke="#0b0f14" stroke-width="3.2" fill="none"/>' +
    '<path d="M14,9 L24,9 L15,26 L9.6,26 Z M76,9 L86,9 L77,26 L71.6,26 Z" fill="#fff" opacity=".38"/>' +
    '<path d="M28,9 L32,9 L24.6,23 L21.6,23 Z M90,9 L94,9 L86.6,23 L83.6,23 Z" fill="#fff" opacity=".26"/>';

  function fitHat(h, logo, host, spec) {
    var b = oBox(logo), P = host.getBoundingClientRect();
    if (!b) return;
    var set = function (k, v) { h.style.setProperty(k, v, 'important'); };
    if (spec.glasses) {
      var gw = b.w * 1.62, gh = gw * 44 / 120;
      set('width', gw + 'px'); set('height', gh + 'px');
      set('left', (b.cx - P.left - gw / 2) + 'px'); set('top', (b.cy - P.top - gh * 0.52) + 'px');
      return;
    }
    var u = b.w * spec.scale / spec.brimW, size = 100 * u;   /* pixels per drawing unit */
    set('width', size + 'px'); set('height', size + 'px');
    set('left', (b.x + b.w * 0.55 - P.left - spec.bx * u) + 'px');
    set('top', (b.top + b.h * 0.2 - P.top - spec.by * u) + 'px');
    set('transform', 'rotate(' + (spec.tilt || 0) + 'deg)'); set('transform-origin', spec.bx + '% ' + spec.by + '%');
  }
  var hats = [];
  function hatOn(found, spec) {
    var host = found.host;
    if (host.querySelector('.mo-hat')) return;
    host.classList.add('mismo-hat-host');
    var h = svg(spec.glasses ? '0 0 120 44' : '0 0 100 100', ids(spec.glasses ? GLASSES : spec.inner));
    h.setAttribute('class', 'mo-hat');
    host.appendChild(h);
    hats.push({ el: h, logo: found.logo, host: host });
    h.addEventListener('click', function () { var a = host.closest('a') || host.querySelector('a'); if (a) a.click(); else if (typeof host.click === 'function') host.click(); });
    var refit = function () { fitHat(h, found.logo, host, spec); };
    requestAnimationFrame(function () { refit(); unclip(h); });
    addEventListener('resize', refit);
    try { new ResizeObserver(refit).observe(found.logo); new ResizeObserver(refit).observe(host); } catch (e) {}
    [400, 1200, 3000, 6000].forEach(function (ms) { setTimeout(refit, ms); });
    if (spec.glasses && FIRST && !still && h.animate) anim(h, [{ transform: 'translateY(-60px) rotate(-12deg)', opacity: 0 }, { transform: 'translateY(4px) rotate(3deg)', opacity: 1, offset: 0.75 }, { transform: 'translateY(0) rotate(0)', opacity: 1 }], { duration: 1100, delay: 600, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
  }

  /* ---------------- sprites ---------------- */
  var CUPID = '<defs><radialGradient id="I-s" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffe6d6"/><stop offset="1" stop-color="#f2b99b"/></radialGradient>' +
    '<linearGradient id="I-wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe6f5"/></linearGradient></defs>' +
    '<g class="mo-wing"><animateTransform attributeName="transform" type="rotate" values="12 72 44;-22 72 44;12 72 44" dur=".34s" repeatCount="indefinite"/>' +
    '<path d="M70,42 C82,18 108,12 116,26 C104,27 101,34 107,42 C96,40 92,47 96,55 C86,52 77,50 70,48 Z" fill="url(#I-wg)" stroke="#b9d8ee" stroke-width="1.4"/>' +
    '<path d="M80,36 C90,26 102,22 110,26 M80,42 C90,36 98,36 104,40" stroke="#b9d8ee" stroke-width="1.2" fill="none"/></g>' +
    '<ellipse cx="62" cy="76" rx="6" ry="9" fill="url(#I-s)" transform="rotate(25 62 76)"/><ellipse cx="54" cy="78" rx="6" ry="9" fill="url(#I-s)" transform="rotate(-10 54 78)"/>' +
    '<ellipse cx="60" cy="57" rx="16" ry="18" fill="url(#I-s)"/>' +
    '<path d="M44.5,61 C50,72 69,74 76,62 C73,75 67,79 60,79 C51,79 46,72 44.5,61 Z" fill="#fff"/>' +
    '<path d="M50,42 L74,66" stroke="#e8483c" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M18,28 C6,44 6,62 18,78" stroke="#a8693a" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M18,28 L31,53 L18,78" stroke="#f3e2c6" stroke-width="1.1" fill="none"/>' +
    '<g class="mo-arrow"><path d="M33,53 L5,53" stroke="#8a5a32" stroke-width="2.4"/><path d="M34,53 l5,-4 M34,53 l5,4" stroke="#e8483c" stroke-width="2"/>' +
    '<path transform="translate(2 53) rotate(90) scale(.5)" d="' + heartP + '" fill="#e8483c"/></g>' +
    '<path d="M54,50 C46,53 38,54 31,53" stroke="url(#I-s)" stroke-width="7" stroke-linecap="round" fill="none"/>' +
    '<circle cx="52" cy="34" r="14.5" fill="url(#I-s)"/>' +
    '<g fill="#f3c75a"><circle cx="45" cy="22" r="6"/><circle cx="54" cy="19" r="6.4"/><circle cx="63" cy="23" r="5.8"/><circle cx="66" cy="31" r="5"/><circle cx="40" cy="28" r="4.4"/></g>' +
    '<path d="M44,34 C46,31.5 49,31.5 50.5,34" stroke="#3a2416" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<circle cx="45" cy="39.5" r="3.6" fill="#f4927e" opacity=".55"/><path d="M41,42 C43,44.5 46.5,44.5 48,42.5" stroke="#b0503c" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  var BAT = '<g fill="#2b1f3d"><g><animateTransform attributeName="transform" type="scale" values="1 1;1 -.45;1 1" dur=".26s" repeatCount="indefinite"/>' +
    '<path d="M-3,0 C-10,-11 -21,-11 -29,-4 C-25,-2.4 -23,1.4 -23,4 C-20,1 -16,1 -14,5 C-11,2 -7.5,3 -5.5,6.5 Z"/></g>' +
    '<g><animateTransform attributeName="transform" type="scale" values="1 1;1 -.45;1 1" dur=".26s" repeatCount="indefinite"/>' +
    '<path d="M3,0 C10,-11 21,-11 29,-4 C25,-2.4 23,1.4 23,4 C20,1 16,1 14,5 C11,2 7.5,3 5.5,6.5 Z"/></g>' +
    '<ellipse cx="0" cy="2" rx="5" ry="7"/><circle cx="0" cy="-5" r="4.6"/><path d="M-3.6,-7 L-4.6,-12 L-1.4,-8.4 Z M3.6,-7 L4.6,-12 L1.4,-8.4 Z"/></g>' +
    '<circle cx="-1.7" cy="-5.4" r=".95" fill="#ffd76a"/><circle cx="1.7" cy="-5.4" r=".95" fill="#ffd76a"/>';
  var BUNNY = '<defs><radialGradient id="I-f" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd7e1"/></radialGradient></defs>' +
    '<g class="mo-ears"><g transform="rotate(8 64 34)"><ellipse cx="62" cy="18" rx="5.5" ry="17" fill="#d6dde6"/></g>' +
    '<g transform="rotate(-14 70 34)"><ellipse cx="70" cy="16" rx="6.4" ry="19" fill="url(#I-f)"/><ellipse cx="70" cy="18" rx="3" ry="13" fill="#f7b6c8"/></g></g>' +
    '<ellipse cx="46" cy="66" rx="27" ry="22" fill="url(#I-f)"/><ellipse cx="36" cy="74" rx="16" ry="14" fill="#eef2f6"/>' +
    '<circle cx="19" cy="62" r="8" fill="#fff"/><circle cx="17" cy="60" r="3" fill="#eef2f6"/>' +
    '<ellipse cx="72" cy="46" rx="16" ry="14" fill="url(#I-f)"/>' +
    '<circle cx="77.5" cy="42.5" r="2.6" fill="#2a1d18"/><circle cx="78.3" cy="41.6" r=".9" fill="#fff"/>' +
    '<ellipse cx="87" cy="48" rx="2.4" ry="2" fill="#f49ab0"/><path d="M84,51 C85,53 87,53 88,51" stroke="#b77" stroke-width="1" fill="none"/>' +
    '<path d="M86,50 L97,47 M86,51 L97,52 M86,52 L96,56" stroke="#b9c2cc" stroke-width=".7"/>' +
    '<circle cx="80" cy="50" r="3.2" fill="#f7b6c8" opacity=".5"/>' +
    '<ellipse cx="64" cy="86" rx="7.5" ry="4" fill="#eef2f6"/><ellipse cx="32" cy="87" rx="13" ry="4.6" fill="#e2e8ef"/>';
  var TURKEY = (function () {
    var cols = [['#b8322a', '#e8483c'], ['#d9701f', '#f39a3c'], ['#e9b02f', '#ffd76a'], ['#7a4a22', '#a5683a']], f = '';
    for (var i = -4; i <= 4; i++) { var c = cols[(i + 8) % 4]; f += '<g transform="rotate(' + i * 19 + ' 46 70)"><ellipse cx="46" cy="34" rx="9.5" ry="35" fill="' + c[0] + '"/><ellipse cx="46" cy="10" rx="7" ry="9" fill="' + c[1] + '"/><path d="M46,64 L46,6" stroke="#3a2210" stroke-opacity=".35" stroke-width="1"/></g>'; }
    return '<defs><radialGradient id="I-t" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#9a6234"/><stop offset="1" stop-color="#4e2e14"/></radialGradient></defs>' + f +
      '<path d="M56,96 L53,110 L47,112 M53,110 L56,113 M70,96 L72,110 L66,112 M72,110 L76,112" stroke="#f3a623" stroke-width="3" stroke-linecap="round" fill="none"/>' +
      '<ellipse cx="62" cy="74" rx="29" ry="25" fill="url(#I-t)"/>' +
      '<path d="M46,68 C55,58 73,60 80,72 C72,84 57,87 47,78 Z" fill="#6b3f1c"/><path d="M52,72 C60,68 70,70 76,74 M51,77 C59,74 68,76 73,79" stroke="#3a2210" stroke-opacity=".45" stroke-width="1.2" fill="none"/>' +
      '<path d="M81,66 C85,52 87,42 93,36 C99,31 106,35 106,42 C106,48 100,50 98,56 C96,64 94,70 90,76 Z" fill="#7a4a22"/>' +
      '<circle cx="100" cy="37" r="8.6" fill="#c98a5f"/>' +
      '<path d="M107,38 L115,40 L107,42.4 Z" fill="#f3a623"/>' +
      '<path d="M106,42 C109,45 109,52 104,55" stroke="#d23a2c" stroke-width="4.2" fill="none" stroke-linecap="round"/>' +
      '<circle cx="101.5" cy="34" r="2" fill="#1b120c"/><circle cx="102.1" cy="33.4" r=".7" fill="#fff"/>';
  })();
  var GROUNDHOG = '<defs><radialGradient id="I-h" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#b07a48"/><stop offset="1" stop-color="#6a4224"/></radialGradient>' +
    '<linearGradient id="I-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5232"/><stop offset="1" stop-color="#4a301c"/></linearGradient></defs>' +
    '<g class="mo-gh"><path d="M27,112 C22,78 30,46 50,42 C70,46 78,78 73,112 Z" fill="url(#I-h)"/><ellipse cx="50" cy="84" rx="14" ry="19" fill="#d1a676"/>' +
    '<g class="mo-face"><ellipse cx="50" cy="38" rx="18" ry="15.5" fill="url(#I-h)"/><circle cx="36" cy="26" r="4.4" fill="#5a381e"/><circle cx="64" cy="26" r="4.4" fill="#5a381e"/>' +
    '<circle cx="43.5" cy="35" r="2.7" fill="#1b120c"/><circle cx="44.3" cy="34.1" r=".9" fill="#fff"/><circle cx="56.5" cy="35" r="2.7" fill="#1b120c"/><circle cx="57.3" cy="34.1" r=".9" fill="#fff"/>' +
    '<ellipse cx="50" cy="45" rx="9" ry="6.6" fill="#e3c294"/><ellipse cx="50" cy="41.4" rx="3.4" ry="2.4" fill="#3a2516"/>' +
    '<rect x="47.4" y="47.8" width="5.2" height="5.2" rx="1" fill="#fff"/><path d="M50,47.8 L50,53" stroke="#d9d9d9" stroke-width=".6"/></g>' +
    '<ellipse cx="39" cy="66" rx="5.6" ry="4.4" fill="#7a4e2c"/><ellipse cx="61" cy="66" rx="5.6" ry="4.4" fill="#7a4e2c"/></g>' +
    '<path d="M-6,118 C6,92 28,84 50,84 C72,84 94,92 106,118 Z" fill="url(#I-d)"/>' +
    '<g fill="#3b2614"><circle cx="24" cy="102" r="2.2"/><circle cx="40" cy="95" r="1.6"/><circle cx="62" cy="98" r="2"/><circle cx="78" cy="104" r="1.8"/><circle cx="52" cy="108" r="2.2"/></g>' +
    '<g fill="#5fae5e"><path d="M8,104 l2,-9 2,9 Z"/><path d="M90,104 l2,-10 2,10 Z"/><path d="M94,106 l2,-7 2,7 Z"/></g>';
  var PIE = '<defs><linearGradient id="I-tin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7e0e7"/><stop offset="1" stop-color="#8a97a3"/></linearGradient>' +
    '<radialGradient id="I-cr" cx=".45" cy=".35" r=".8"><stop offset="0" stop-color="#f7cf8c"/><stop offset="1" stop-color="#cf8a3b"/></radialGradient></defs>' +
    '<path d="M12,52 L128,52 L117,80 C111,87 29,87 23,80 Z" fill="url(#I-tin)"/><path d="M18,60 L122,60" stroke="#fff" stroke-opacity=".4" stroke-width="1.4"/>' +
    '<ellipse cx="70" cy="50" rx="59" ry="16.5" fill="url(#I-cr)"/>' +
    (function () { var s = ''; for (var k = 0; k < 26; k++) { var a = k / 26 * Math.PI * 2; s += '<circle cx="' + (70 + 58 * Math.cos(a)).toFixed(1) + '" cy="' + (50 + 16 * Math.sin(a)).toFixed(1) + '" r="4.4" fill="#e6ac62"/>'; } return s; })() +
    '<ellipse cx="70" cy="49" rx="48" ry="11.5" fill="url(#I-cr)"/>' +
    '<path d="M54,43.5 L86,43.5 M62,43.5 C62,49 61,53 58.5,56 M78,43.5 C78,49 79,53 82.5,55" stroke="#9a5a22" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M54,43 L86,43" stroke="#ffe2ad" stroke-width="1" opacity=".6"/>' +
    '<g stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7">' +
    '<path d="M54,30 C50,24 58,20 54,12"><animate attributeName="opacity" values="0;.8;0" dur="2.4s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -6" dur="2.4s" repeatCount="indefinite"/></path>' +
    '<path d="M70,28 C66,22 74,18 70,8"><animate attributeName="opacity" values="0;.8;0" dur="2.4s" begin=".8s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -6" dur="2.4s" begin=".8s" repeatCount="indefinite"/></path>' +
    '<path d="M86,30 C82,24 90,20 86,12"><animate attributeName="opacity" values="0;.8;0" dur="2.4s" begin="1.6s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -6" dur="2.4s" begin="1.6s" repeatCount="indefinite"/></path></g>';
  var GLOBE = '<defs><radialGradient id="I-o" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#7cc6f0"/><stop offset=".7" stop-color="#2b7fbf"/><stop offset="1" stop-color="#155985"/></radialGradient>' +
    '<radialGradient id="I-a"><stop offset=".72" stop-color="#bfe3f7" stop-opacity=".0"/><stop offset=".8" stop-color="#bfe3f7" stop-opacity=".55"/><stop offset="1" stop-color="#bfe3f7" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="I-sh" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#06202f" stop-opacity=".45"/></radialGradient>' +
    '<clipPath id="I-gc"><circle cx="50" cy="50" r="38"/></clipPath></defs>' +
    '<circle cx="50" cy="50" r="49" fill="url(#I-a)"/><circle cx="50" cy="50" r="38" fill="url(#I-o)"/>' +
    '<g clip-path="url(#I-gc)"><g fill="#4caf6a"><animateTransform attributeName="transform" type="translate" values="0 0;-152 0" dur="10s" repeatCount="indefinite"/>' +
    (function () { var c = '<path d="M20,30 C28,22 40,24 44,32 C48,40 40,46 42,54 C44,62 36,68 30,62 C24,56 26,48 20,44 C14,40 14,34 20,30 Z"/><path d="M58,22 C68,18 80,22 84,30 C80,34 72,32 68,38 C64,44 56,40 54,32 C53,27 54,24 58,22 Z"/><path d="M62,52 C70,48 82,52 84,62 C86,72 78,82 68,80 C60,78 62,68 58,62 C56,58 58,54 62,52 Z"/><path d="M100,40 C108,36 118,40 118,48 C118,56 110,58 104,56 C98,54 96,44 100,40 Z"/><path d="M128,26 C136,22 146,28 144,36 C142,42 134,42 130,38 C126,34 124,30 128,26 Z"/>'; return c + '<g transform="translate(152 0)">' + c + '</g>'; })() +
    '</g></g><circle cx="50" cy="50" r="38" fill="url(#I-sh)"/><ellipse cx="38" cy="32" rx="10" ry="6" fill="#fff" opacity=".28" transform="rotate(-30 38 32)"/>';
  var SPIDER = '<g stroke="#1b1424" stroke-width="1.6" stroke-linecap="round" fill="none">' +
    '<path d="M-3,-1 C-8,-6 -11,-5 -14,-1 M-3,1 C-8,-1 -12,1 -15,5 M-3,2 C-7,4 -10,8 -11,12 M-2,3 C-4,7 -6,11 -6,14"/>' +
    '<path d="M3,-1 C8,-6 11,-5 14,-1 M3,1 C8,-1 12,1 15,5 M3,2 C7,4 10,8 11,12 M2,3 C4,7 6,11 6,14"/></g>' +
    '<ellipse cx="0" cy="4" rx="5.4" ry="6.4" fill="#1b1424"/><circle cx="0" cy="-3" r="4" fill="#2b2238"/>' +
    '<circle cx="-1.5" cy="-3.6" r="1.2" fill="#fff"/><circle cx="1.5" cy="-3.6" r="1.2" fill="#fff"/><circle cx="-1.3" cy="-3.4" r=".55" fill="#000"/><circle cx="1.7" cy="-3.4" r=".55" fill="#000"/>';
  var POT = '<defs>' + GOLD + '<radialGradient id="I-pt" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#4a4a56"/><stop offset="1" stop-color="#0e0e12"/></radialGradient></defs>' +
    '<g fill="#f7cf5c" stroke="#c48a22" stroke-width="1">' + [[30, 30], [42, 26], [54, 28], [66, 31], [36, 22], [48, 18], [60, 22], [46, 30], [72, 34], [24, 34]].map(function (p) { return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="7" ry="3.6"/>'; }).join('') + '</g>' +
    '<path d="M14,36 C14,66 30,80 48,80 C66,80 82,66 82,36 Z" fill="url(#I-pt)"/><ellipse cx="48" cy="36" rx="35" ry="7" fill="#26262e" stroke="#4a4a56" stroke-width="2.4"/>' +
    '<ellipse cx="48" cy="35" rx="31" ry="5" fill="url(#I-gold)"/><path d="M24,46 C24,60 32,70 40,72" stroke="#fff" stroke-opacity=".18" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M26,80 L22,88 M70,80 L74,88" stroke="#0e0e12" stroke-width="4" stroke-linecap="round"/>';

  /* ---------------- the shows ---------------- */
  /* a sprite that crosses the screen along a path; returns the moving element */
  function cross(layer, el, w, dur, path, flip) {
    var box = document.createElement('div');
    box.className = 'mo-p'; box.style.width = w + 'px';
    el.style.width = '100%'; el.style.height = 'auto'; el.style.display = 'block';
    if (flip) el.style.transform = 'scaleX(-1)';
    box.appendChild(el); layer.appendChild(box);
    var frames = [];
    for (var i = 0; i <= 30; i++) { var t = i / 30, p = path(t); frames.push({ transform: 'translate(' + p.x + 'px,' + p.y + 'px) rotate(' + (p.r || 0) + 'deg)', offset: t }); }
    box.__a = anim(box, frames, { duration: dur, easing: 'linear', fill: 'forwards' });
    box.__path = path; box.__dur = dur;
    return box;
  }
  function bubble(layer, text, x, y, ms) {
    var b = document.createElement('div'); b.className = 'mo-bubble'; b.textContent = text; layer.appendChild(b);
    var r = b.getBoundingClientRect(); b.style.left = (x - r.width / 2) + 'px'; b.style.top = (y - r.height) + 'px';
    anim(b, [{ opacity: 0, transform: 'translateY(8px) scale(.6)' }, { opacity: 1, transform: 'translateY(0) scale(1.05)', offset: 0.12 }, { opacity: 1, transform: 'scale(1)', offset: 0.85 }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: ms || 2200, fill: 'forwards' });
    setTimeout(function () { b.remove(); }, (ms || 2200) + 50);
  }
  var SHOW = {
    newyear: {
      hat: 'party',
      open: function () {
        var L = sky(), yr = String(new Date().getFullYear() + (new Date().getMonth() === 11 ? 1 : 0));
        var big = document.createElement('div'); big.className = 'mo-big';
        big.innerHTML = '<span style="font-size:' + Math.max(14, Math.min(26, innerWidth * 0.02)) + 'px">Happy New Year</span><b style="font-size:' + Math.max(84, Math.min(190, innerWidth * 0.15)) + 'px">' + yr + '</b>';
        L.appendChild(big);
        anim(big, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.04)', offset: 0.12 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: 0.8 }, { opacity: 0, transform: 'translate(-50%,-56%) scale(.98)' }], { duration: 4800, delay: 900, fill: 'both' });
        var t = Math.max(fireworks(L, ['#ffd76a', '#74bfeb', '#ffffff', '#ffe9a8'], 8, 560), confetti(L, 70), 6000);
        done(L, t);
      },
      hover: function (b) { var L = sky(); done(L, Math.max(burst(L, b.cx, b.cy, function () { return confettiPiece(['#ffd76a', '#74bfeb', '#ffffff', '#e2a73b']); }, 26, { size: [7, 11], dist: [50, 140], up: true, fall: 90 }), 2200)); firework(L, b.cx + rnd(60, 220), b.cy + rnd(80, 160), ['#ffd76a', '#74bfeb', '#ffffff']); }
    },
    groundhog: {
      open: function () { groundhog('Happy Groundhog Day!'); },
      hover: function () { groundhog(); }
    },
    valentine: {
      open: function () {
        var L = sky(), W = innerWidth, Hh = innerHeight, b = visibleLogo();
        var w = Math.max(110, Math.min(190, W * 0.13)), h = w * 100 / 120, dur = 7600, y0 = Hh * 0.2;
        var c = art('0 0 120 100', CUPID);
        var box = cross(L, c, w, dur, function (t) { return { x: W + 20 - (W + w + 40) * t, y: y0 + Math.sin(t * Math.PI * 3) * 22 - h / 2, r: Math.sin(t * Math.PI * 3) * 4 }; });
        /* half way across, the arrow flies into the O and hearts pop there */
        setTimeout(function () {
          var bb = visibleLogo() || b, arrowEl = c.querySelector('.mo-arrow'); if (arrowEl) arrowEl.style.opacity = '0';
          var t = 0.5, p = box.__path(t), sx = p.x + w * 0.05, sy = p.y + h * 0.53;
          var tx = bb ? bb.cx : 60, ty = bb ? bb.cy : 40;
          var ar = art('-36 -8 44 16', '<path d="M-30,0 L6,0" stroke="#8a5a32" stroke-width="2.6"/><path d="M-30,0 l-5,-4 M-30,0 l-5,4" stroke="#e8483c" stroke-width="2.2"/><path transform="translate(6 0) rotate(-90) scale(.55)" d="' + heartP + '" fill="#e8483c"/>');
          ar.style.width = '70px'; ar.style.height = '26px'; L.appendChild(ar);
          var ang = Math.atan2(ty - sy, tx - sx) * 180 / Math.PI + 180;
          anim(ar, [{ transform: 'translate(' + (sx - 35) + 'px,' + (sy - 13) + 'px) rotate(' + ang + 'deg)' }, { transform: 'translate(' + (tx - 35) + 'px,' + (ty - 13) + 'px) rotate(' + ang + 'deg)' }], { duration: 650, easing: 'cubic-bezier(.4,.1,.6,1)', fill: 'forwards' });
          setTimeout(function () { ar.remove(); burst(L, tx, ty, function (i) { return art('-12 -12 24 24', heart(['#e8483c', '#f49ab0', '#ff6b8b', '#ffffff'][i % 4])); }, 18, { size: [14, 26], dist: [40, 120] }); }, 660);
        }, dur * 0.5);
        var r = drift(L, function (i) { return art('-12 -12 24 24', heart(['#e8483c', '#f49ab0', '#ff6b8b', '#ffc2d1'][i % 4])); }, 22, { dir: 'up', size: [14, 30], dur: [5200, 8200], spread: 2400, spin: 40, reach: [0.6, 1] });
        done(L, Math.max(dur + 400, r, dur * 0.5 + 2600));
      },
      hover: function (b) { var L = sky(); done(L, burst(L, b.cx, b.cy, function (i) { return art('-12 -12 24 24', heart(['#e8483c', '#f49ab0', '#ff6b8b', '#ffffff'][i % 4])); }, 16, { size: [14, 26], dist: [40, 120] })); }
    },
    piday: {
      open: function () { pie(); },
      hover: function (b) { digits(sky(), b.cx, b.cy + 10, 14, true); }
    },
    stpatrick: {
      hat: 'leprechaun',
      open: function () {
        var L = sky(), b = visibleLogo(), W = innerWidth, Hh = innerHeight;
        var x0 = b ? b.cx + b.w * 0.8 : W * 0.12, y0 = b ? b.L.bottom + 6 : 70, x1 = W * 0.84, y1 = Hh * 0.42, cols = ['#e8483c', '#f39a3c', '#f7cf5c', '#4caf6a', '#3d8fd6', '#7a5cc9'];
        var rw = Math.max(10, Math.min(20, W * 0.012)), arcs = '';
        cols.forEach(function (c, i) { var o = i * rw; arcs += '<path d="M' + (x0 + o) + ',' + y0 + ' A' + ((x1 - x0) / 2 - o) + ',' + (Hh * 0.34 - o) + ' 0 0 1 ' + (x1 - o) + ',' + y1 + '" stroke="' + c + '" stroke-width="' + (rw + 0.6) + '" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" opacity=".55"/>'; });
        var rb = svg('0 0 ' + W + ' ' + Hh, arcs); rb.setAttribute('class', 'mo-p'); rb.style.width = W + 'px'; rb.style.height = Hh + 'px'; L.appendChild(rb);
        Array.prototype.forEach.call(rb.querySelectorAll('path'), function (p, i) { anim(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1600, delay: 300 + i * 60, easing: 'ease-out', fill: 'forwards' }); });
        anim(rb, [{ opacity: 1 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 7200, fill: 'forwards' });
        var pw = Math.max(80, Math.min(130, W * 0.09)), pot = art('0 0 96 92', POT); pot.style.width = pw + 'px'; pot.style.height = (pw * 92 / 96) + 'px'; L.appendChild(pot);
        var px = x1 - rw * 3 - pw / 2, py = y1 - pw * 0.42;
        anim(pot, [{ transform: 'translate(' + px + 'px,' + (py + 30) + 'px) scale(.6)', opacity: 0 }, { transform: 'translate(' + px + 'px,' + py + 'px) scale(1.05)', opacity: 1, offset: 0.18 }, { transform: 'translate(' + px + 'px,' + py + 'px) scale(1)', opacity: 1, offset: 0.85 }, { transform: 'translate(' + px + 'px,' + py + 'px) scale(1)', opacity: 0 }], { duration: 6400, delay: 1400, fill: 'both' });
        setTimeout(function () { burst(L, px + pw / 2, py + pw * 0.3, function () { return art('-10 -10 20 20', coin()); }, 12, { size: [14, 22], dist: [30, 80], up: true, fall: 60 }); }, 2400);
        var r = drift(L, function (i) { return art('-12 -12 24 24', shamrock(['#4caf6a', '#5cd07f', '#2e8a4a'][i % 3])); }, 20, { dir: 'down', size: [16, 30], dur: [5200, 8000], spread: 2600, spin: 220 });
        done(L, Math.max(r, 8400));
      },
      hover: function (b) { var L = sky(); done(L, burst(L, b.cx + b.w * 0.5, b.top, function () { return art('-10 -10 20 20', coin()); }, 14, { size: [14, 22], dist: [40, 110], up: true, fall: 80 })); }
    },
    easter: {
      hat: 'bunny',
      open: function () { bunny(); },
      hover: function (b) { var L = sky(); done(L, burst(L, b.cx, b.cy, function (i) { return art('-10 -10 20 20', egg(i)); }, 12, { size: [16, 24], dist: [40, 110], up: true, fall: 70 })); }
    },
    earthday: {
      open: function () { globe(); },
      hover: function (b) { var L = sky(); done(L, burst(L, b.cx, b.cy, function (i) { return art('-12 -12 24 24', greenLeaf(['#4caf6a', '#7cc47a', '#2e8a4a'][i % 3])); }, 14, { size: [14, 24], dist: [40, 120] })); }
    },
    summer: {
      hat: 'glasses',
      open: function () {
        var L = sky(), b = visibleLogo(); if (!b) { done(L, 10); return; }
        var g = piece('mo-glow', '#ffd76a'), s = b.w * 6; g.style.width = g.style.height = s + 'px'; L.appendChild(g);
        anim(g, [{ transform: 'translate(' + (b.cx - s / 2) + 'px,' + (b.cy - s / 2) + 'px) scale(.3)', opacity: 0 }, { transform: 'translate(' + (b.cx - s / 2) + 'px,' + (b.cy - s / 2) + 'px) scale(1)', opacity: 0.7, offset: 0.4 }, { transform: 'translate(' + (b.cx - s / 2) + 'px,' + (b.cy - s / 2) + 'px) scale(1.15)', opacity: 0 }], { duration: 3600, delay: 1500, fill: 'both' });
        setTimeout(function () { var bb = visibleLogo() || b; for (var i = 0; i < 3; i++) (function (i) { setTimeout(function () { var st = piece('mo-star', '#fff'); st.style.width = st.style.height = '16px'; L.appendChild(st); var x = bb.cx - bb.w * 0.55 + i * bb.w * 0.5, y = bb.cy - bb.w * 0.2; anim(st, [{ transform: 'translate(' + x + 'px,' + y + 'px) scale(0) rotate(0)', opacity: 1 }, { transform: 'translate(' + x + 'px,' + y + 'px) scale(1.2) rotate(90deg)', opacity: 1, offset: 0.5 }, { transform: 'translate(' + x + 'px,' + y + 'px) scale(0) rotate(180deg)', opacity: 0 }], { duration: 700, fill: 'forwards' }); }, i * 260); })(i); }, 1750);
        done(L, 5400);
      },
      hover: function () { hats.forEach(function (h) { anim(h.el, [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (h.el.getBoundingClientRect().height * 0.55) + 'px)', offset: 0.3 }, { transform: 'translateY(' + (h.el.getBoundingClientRect().height * 0.55) + 'px)', offset: 0.7 }, { transform: 'translateY(0)' }], { duration: 1400, easing: 'ease-in-out' }); }); }
    },
    july4: {
      hat: 'unclesam',
      open: function () { var L = sky(); done(L, fireworks(L, ['#e8483c', '#ffffff', '#3d6fd6', '#74bfeb'], 9, 520)); },
      hover: function () { var L = sky(); done(L, fireworks(L, ['#e8483c', '#ffffff', '#3d6fd6'], 2, 380)); }
    },
    halloween: {
      hat: 'witch',
      open: function () {
        var L = sky(), W = innerWidth, Hh = innerHeight, longest = 0;
        for (var i = 0; i < 6; i++) (function (i) {
          var w = rnd(46, 84), dur = rnd(5200, 7800), delay = i * 520 + rnd(0, 300), y = Hh * rnd(0.12, 0.55), amp = rnd(14, 40), ph = R() * 6;
          longest = Math.max(longest, dur + delay);
          setTimeout(function () { cross(L, art('-30 -15 60 30', BAT), w, dur, function (t) { return { x: W + 30 - (W + w + 60) * t, y: y + Math.sin(t * Math.PI * 4 + ph) * amp, r: Math.sin(t * Math.PI * 4 + ph) * 8 }; }); }, delay);
        })(i);
        done(L, longest + 500);
      },
      hover: function (b) { spider(b); }
    },
    thanksgiving: {
      hat: 'pilgrim',
      open: function () {
        var L = sky(), W = innerWidth, Hh = innerHeight;
        var r = drift(L, function (i) { var c = [['#d9701f', '#8a3d0c'], ['#b8322a', '#6b1610'], ['#e9b02f', '#8a6210'], ['#a5683a', '#4e2e14']][i % 4]; return art('-12 -12 24 24', leaf(c[0], c[1])); }, 26, { dir: 'down', size: [18, 34], dur: [5600, 9000], spread: 2800, spin: 320, sway: 60 });
        var w = Math.max(110, Math.min(170, W * 0.11)), h = w * 120 / 130, dur = Math.max(8000, W * 6), base = Hh - h - 8;
        setTimeout(function () {
          var t = art('0 0 130 120', TURKEY);
          var box = cross(L, t, w, dur, function (u) { var step = Math.sin(u * Math.PI * 22); return { x: -w - 10 + (W + w + 20) * u, y: base - Math.abs(step) * 5, r: step * 5 }; });
          setTimeout(function () { var p = box.__path(0.5); bubble(L, 'Gobble gobble!', p.x + w * 0.65, p.y - 4, 2000); }, dur * 0.48);
        }, 600);
        done(L, Math.max(r, dur + 1200));
      },
      hover: function (b) { var L = sky(); done(L, burst(L, b.cx, b.cy, function (i) { var c = [['#d9701f', '#8a3d0c'], ['#b8322a', '#6b1610'], ['#e9b02f', '#8a6210']][i % 3]; return art('-12 -12 24 24', leaf(c[0], c[1])); }, 14, { size: [16, 28], dist: [40, 120], fall: 120 })); }
    }
  };

  /* Groundhog Day: up from the burrow in the bottom-right corner, a look each way, back down */
  var ghBusy = false;
  function groundhog(say) {
    if (ghBusy) return; ghBusy = true;
    var L = sky(), W = innerWidth, Hh = innerHeight, w = Math.max(110, Math.min(170, W * 0.11)), h = w * 1.18;
    var g = art('-6 0 112 118', GROUNDHOG); g.style.width = w + 'px'; g.style.height = h + 'px';
    var box = document.createElement('div'); box.className = 'mo-p'; box.style.width = w + 'px'; box.style.height = h + 'px'; box.appendChild(g); L.appendChild(box);
    var x = W - w - Math.max(24, W * 0.04), y = Hh - h + 2;
    box.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    anim(box, [{ opacity: 0 }, { opacity: 1, offset: 0.06 }, { opacity: 1, offset: 0.94 }, { opacity: 0 }], { duration: 5400, fill: 'forwards' });
    var body = g.querySelector('.mo-gh'), face = g.querySelector('.mo-face');
    anim(body, [{ transform: 'translateY(70px)' }, { transform: 'translateY(-4px)', offset: 0.12 }, { transform: 'translateY(0)', offset: 0.16 }, { transform: 'translateY(0)', offset: 0.82 }, { transform: 'translateY(-3px)', offset: 0.86 }, { transform: 'translateY(74px)' }], { duration: 5400, easing: 'ease-in-out', fill: 'forwards' });
    anim(face, [{ transform: 'translateX(0)' }, { transform: 'translateX(0)', offset: 0.22 }, { transform: 'translateX(-4px)', offset: 0.3 }, { transform: 'translateX(-4px)', offset: 0.42 }, { transform: 'translateX(4px)', offset: 0.5 }, { transform: 'translateX(4px)', offset: 0.62 }, { transform: 'translateX(0)', offset: 0.7 }, { transform: 'translateX(0)' }], { duration: 5400, fill: 'forwards' });
    if (say) setTimeout(function () { bubble(L, say, x + w * 0.4, y + h * 0.1, 2000); }, 2300);
    done(L, 5600); setTimeout(function () { box.remove(); ghBusy = false; }, 5600);
  }
  /* Pi Day: a warm pie rises at the bottom, and the digits of pi stream up out of it */
  var PI = '3.14159265358979323846264338327950288419716939937510';
  function digits(L, x, y, n, quick) {
    var cols = ['#0d314c', '#74bfeb', '#e2a73b', '#14486e'], longest = 0;
    for (var i = 0; i < n; i++) (function (i) {
      var d = document.createElement('span'); d.className = 'mo-digit'; d.textContent = PI.charAt(i % PI.length); d.style.color = cols[i % 4];
      d.style.fontSize = rnd(18, 30) + 'px'; d.style.textShadow = '0 0 6px #fff,0 0 2px #fff';
      L.appendChild(d);
      var dx = rnd(-90, 90), up = rnd(160, 300), dur = rnd(2200, 3200), delay = i * (quick ? 90 : 160);
      longest = Math.max(longest, dur + delay);
      anim(d, [{ transform: 'translate(' + x + 'px,' + y + 'px) scale(.4)', opacity: 0 }, { transform: 'translate(' + (x + dx * 0.3) + 'px,' + (y - up * 0.25) + 'px) scale(1)', opacity: 1, offset: 0.2 }, { transform: 'translate(' + (x + dx) + 'px,' + (y - up) + 'px) scale(.9) rotate(' + rnd(-30, 30) + 'deg)', opacity: 0 }], { duration: dur, delay: delay, easing: 'ease-out', fill: 'both' });
    })(i);
    done(L, longest + 200);
  }
  function pie() {
    var L = sky(), W = innerWidth, Hh = innerHeight, w = Math.max(150, Math.min(240, W * 0.16)), h = w * 90 / 140;
    var p = art('0 0 140 90', PIE); p.style.width = w + 'px'; p.style.height = h + 'px'; L.appendChild(p);
    var x = W / 2 - w / 2, y = Hh - h - 18;
    anim(p, [{ transform: 'translate(' + x + 'px,' + (Hh + 10) + 'px)', opacity: 0 }, { transform: 'translate(' + x + 'px,' + (y - 6) + 'px)', opacity: 1, offset: 0.1 }, { transform: 'translate(' + x + 'px,' + y + 'px)', opacity: 1, offset: 0.14 }, { transform: 'translate(' + x + 'px,' + y + 'px)', opacity: 1, offset: 0.86 }, { transform: 'translate(' + x + 'px,' + (Hh + 10) + 'px)', opacity: 0 }], { duration: 7400, easing: 'ease-in-out', fill: 'forwards' });
    setTimeout(function () { digits(L, W / 2 - 8, y + h * 0.2, 34); bubble(L, 'Happy Pi Day!', W / 2, y - 10, 2400); }, 1100);
    done(L, 7600);
  }
  /* Easter: the bunny hops in along the bottom, stops for a look (ears twitch), hops on, leaving eggs */
  function bunny() {
    var L = sky(), W = innerWidth, Hh = innerHeight, w = Math.max(90, Math.min(140, W * 0.09)), h = w, base = Hh - h - 6;
    var b = art('0 0 100 100', BUNNY); b.style.width = w + 'px'; b.style.height = h + 'px';
    var box = document.createElement('div'); box.className = 'mo-p'; box.appendChild(b); L.appendChild(box);
    var hops = Math.max(8, Math.round(W / (w * 1.05))), stop = Math.floor(hops / 2), frames = [], tot = hops + 2, x0 = -w, x1 = W + w, stepX = (x1 - x0) / hops;
    /* time: each hop one share, plus two shares paused in the middle */
    for (var i = 0, t = 0; i <= hops; i++) {
      var x = x0 + stepX * i, at = (i + (i > stop ? 2 : 0)) / tot;
      frames.push({ transform: 'translate(' + x + 'px,' + base + 'px) scale(1.04,.94)', offset: Math.min(1, at) });
      if (i === stop) frames.push({ transform: 'translate(' + x + 'px,' + base + 'px) scale(1,1)', offset: Math.min(1, (i + 2) / tot - 0.001) });
      if (i < hops) frames.push({ transform: 'translate(' + (x + stepX / 2) + 'px,' + (base - h * 0.55) + 'px) scale(.96,1.06)', offset: Math.min(1, ((i + (i >= stop ? 2 : 0)) + 0.5) / tot) });
    }
    frames.sort(function (a, c) { return a.offset - c.offset; });
    var dur = tot * 560;
    anim(box, frames, { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
    var ears = b.querySelector('.mo-ears');
    setTimeout(function () { anim(ears, [{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0)' }], { duration: 900 }); bubble(L, 'Happy Easter!', x0 + stepX * stop + w / 2, base - 4, 1500); }, (stop + 0.3) / tot * dur);
    /* eggs left behind on some of the landings */
    for (var k = 1; k < hops; k += 2) (function (k) {
      setTimeout(function () {
        var e = art('-10 -10 20 20', egg(k)), s = w * 0.24; e.style.width = s + 'px'; e.style.height = (s * 1.25) + 'px'; L.appendChild(e);
        var ex = x0 + stepX * k + w * 0.15, ey = Hh - s * 1.25 - 4;
        anim(e, [{ transform: 'translate(' + ex + 'px,' + ey + 'px) scale(0)', opacity: 1 }, { transform: 'translate(' + ex + 'px,' + ey + 'px) scale(1.15)', opacity: 1, offset: 0.08 }, { transform: 'translate(' + ex + 'px,' + ey + 'px) scale(1)', opacity: 1, offset: 0.7 }, { transform: 'translate(' + ex + 'px,' + ey + 'px) scale(.9)', opacity: 0 }], { duration: 4200, fill: 'forwards' });
      }, (k + (k > stop ? 2 : 0)) / tot * dur);
    })(k);
    done(L, dur + 4400);
  }
  /* Earth Day: the globe rises at the bottom, turning, with leaves swirling round it */
  function globe() {
    var L = sky(), W = innerWidth, Hh = innerHeight, s = Math.max(120, Math.min(200, W * 0.13));
    var g = art('0 0 100 100', GLOBE); g.style.width = g.style.height = s + 'px'; L.appendChild(g);
    var x = W / 2 - s / 2, y = Hh - s - 24;
    anim(g, [{ transform: 'translate(' + x + 'px,' + (Hh + 10) + 'px) scale(.8)', opacity: 0 }, { transform: 'translate(' + x + 'px,' + (y - 8) + 'px) scale(1.04)', opacity: 1, offset: 0.12 }, { transform: 'translate(' + x + 'px,' + y + 'px) scale(1)', opacity: 1, offset: 0.18 }, { transform: 'translate(' + x + 'px,' + (y - 10) + 'px) scale(1)', opacity: 1, offset: 0.5 }, { transform: 'translate(' + x + 'px,' + y + 'px) scale(1)', opacity: 1, offset: 0.84 }, { transform: 'translate(' + x + 'px,' + (Hh + 10) + 'px) scale(.8)', opacity: 0 }], { duration: 7600, easing: 'ease-in-out', fill: 'forwards' });
    setTimeout(function () {
      var cx = W / 2, cy = y + s / 2;
      for (var i = 0; i < 12; i++) (function (i) {
        var e = art('-12 -12 24 24', greenLeaf(['#4caf6a', '#7cc47a', '#2e8a4a'][i % 3])), sz = rnd(14, 24); e.style.width = e.style.height = sz + 'px'; L.appendChild(e);
        var r0 = s * 0.75, a0 = i / 12 * Math.PI * 2, fr = [];
        for (var k = 0; k <= 12; k++) { var a = a0 + k / 12 * Math.PI * 1.6, r = r0 + Math.sin(k / 12 * Math.PI) * 20; fr.push({ transform: 'translate(' + (cx + Math.cos(a) * r - sz / 2) + 'px,' + (cy + Math.sin(a) * r * 0.55 - sz / 2) + 'px) rotate(' + (k * 40) + 'deg)', opacity: k === 0 || k === 12 ? 0 : 1, offset: k / 12 }); }
        anim(e, fr, { duration: 4200, delay: i * 90, fill: 'both' });
      })(i);
      bubble(L, 'Happy Earth Day!', W / 2, y - 12, 2400);
    }, 1200);
    done(L, 7800);
  }
  /* Halloween hover: a spider drops from the masthead on its thread, bobs, and climbs back */
  var spBusy = false;
  function spider(b) {
    if (spBusy) return; spBusy = true;
    var L = sky(), x = b.cx + b.w * 1.3, top = b.L.bottom - 4, drop = Math.min(140, innerHeight * 0.2);
    var line = document.createElement('i'); line.className = 'mo-p'; line.style.width = '1.2px'; line.style.height = (drop + 10) + 'px'; line.style.background = 'rgba(80,80,90,.7)'; line.style.transformOrigin = 'top'; L.appendChild(line);
    var sp = art('-16 -16 32 32', SPIDER); sp.style.width = sp.style.height = '34px'; L.appendChild(sp);
    var fr = function (d) { return 'translate(' + (x - 17) + 'px,' + (top + d - 8) + 'px)'; };
    anim(sp, [{ transform: fr(0) }, { transform: fr(drop + 8), offset: 0.28 }, { transform: fr(drop - 6), offset: 0.36 }, { transform: fr(drop), offset: 0.42 }, { transform: fr(drop), offset: 0.7 }, { transform: fr(0) }], { duration: 3400, easing: 'ease-in-out', fill: 'forwards' });
    anim(line, [{ transform: 'translate(' + x + 'px,' + top + 'px) scaleY(0)' }, { transform: 'translate(' + x + 'px,' + top + 'px) scaleY(1.06)', offset: 0.28 }, { transform: 'translate(' + x + 'px,' + top + 'px) scaleY(.92)', offset: 0.36 }, { transform: 'translate(' + x + 'px,' + top + 'px) scaleY(1)', offset: 0.42 }, { transform: 'translate(' + x + 'px,' + top + 'px) scaleY(1)', offset: 0.7 }, { transform: 'translate(' + x + 'px,' + top + 'px) scaleY(0)' }], { duration: 3400, easing: 'ease-in-out', fill: 'forwards' });
    setTimeout(function () { bubble(L, 'Boo!', x, top + drop - 16, 1200); }, 1300);
    done(L, 3500); setTimeout(function () { sp.remove(); line.remove(); spBusy = false; }, 3500);
  }

  /* ---------------- when it plays ---------------- */
  var spec = SHOW[OCC];
  if (!spec) return;
  var tool = location.pathname.split('/').slice(0, 2).join('/');
  function etDay() { try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  var today = etDay(), FIRST = true, active = true;
  if (OCC === 'newyear' && !PREVIEW) {
    /* New Year's: once per person per year, the first time any tool opens in January; the hat stays that day */
    var yr = today.slice(0, 4), seen = null, day = null;
    try { seen = localStorage.getItem('mismo.newyear'); day = localStorage.getItem('mismo.newyear.day'); } catch (e) {}
    if (seen !== yr) { FIRST = true; try { localStorage.setItem('mismo.newyear', yr); localStorage.setItem('mismo.newyear.day', today); } catch (e) {} }
    else if (day === today) FIRST = false;
    else active = false;
  } else if (!PREVIEW) {
    var K = 'mismo.occ:' + OCC + ':' + today + ':' + tool;
    try { FIRST = !sessionStorage.getItem(K); sessionStorage.setItem(K, '1'); } catch (e) {}
  }
  if (!active) return;

  function start() {
    css();
    var hatSpec = spec.hat === 'glasses' ? { glasses: true } : spec.hat ? HATS[spec.hat] : null, tries = 0, wired = {};
    /* hats on every logo (apps draw their masthead late: keep looking for a while), and hover on each */
    (function place() {
      plates().forEach(function (f) {
        if (hatSpec) hatOn(f, hatSpec);
        if (!f.host.__moHover) {
          f.host.__moHover = true;
          var last = 0;
          f.host.addEventListener('mouseenter', function () {
            var t = Date.now(); if (still || t - last < 4000) return; last = t;
            var b = oBox(f.logo); if (b) spec.hover(b);
          });
        }
      });
      if (tries++ < 360) setTimeout(place, 500);
    })();
    if (FIRST && !still) setTimeout(function () { if (document.visibilityState === 'hidden') return; spec.open(); }, 900);
  }
  window.MismoOccasions.play = function () { css(); spec.open(); };
  window.MismoOccasions.hover = function () { var b = visibleLogo(); if (b) spec.hover(b); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
