/* MISMO holidays besides December (Jonna, Nov 27, 2026), for every internal tool on resources.mismo.org and MyMISMO.
   ------------------------------------------------------------------------------------------------------------------
   Loaded by /assets/holiday.js only on the day (its calendar picks the day: the holiday itself, or the business day
   before when it falls on a weekend or a MISMO day off). One look per holiday:
   - New Year's: the first time each person opens any tool in January, fireworks, confetti and the new year in gold,
     and a party hat on the O for that day. Once per person per year.
   - Groundhog Day: a groundhog pops up out of his burrow in the corner, looks around and ducks back in.
   - Valentine's Day: shiny heart balloons float up the page; then an arrow streaks in and lands in the O, and
     hearts burst out of it.
   - Pi Day: a lattice cherry pie is set down at the bottom with the digits of pi streaming up from it.
   - St. Patrick's Day: a leprechaun hat on the O, a rainbow across the top into a pot of gold, shamrocks drifting.
   - Easter (shows on Good Friday): the O gets floppy bunny ears and a bunny face. Someone in a bunny costume hops in
     with a bottomless basket on their back, finds an egg, tosses it over the shoulder into the basket, it drops out
     behind them, they turn around and find it again (surprised every time), three times, then poof.
   - The costumes (bunny, jack-o'-lantern, turkey) keep the O an O: they add ears, a stem or feathers around it and a
     face in its middle; the jack-o'-lantern turns it orange.
   - 4th of July: an Uncle Sam hat on the O and red, white and blue fireworks.
   - Halloween: the O is a jack-o'-lantern; a big moon rises in the top right and bats flap out of it. Hover over the
     logo and a spider drops down on its thread.
   - Thanksgiving (shows on the Wednesday): the O is a turkey, and autumn leaves drift gently down the page.
   (Earth Day and the first day of summer were tried and dropped, Jonna, Nov 27, 2026.)
   The show plays the first time a tool is opened that day (per browser session); hovering over the logo brings a
   little of it back. Never for anyone whose computer asks for reduced motion (hats and costumes still show).
   Nothing is ever clickable: everything lets clicks through, and a click on a hat does what a click on the logo does.
   Preview: ?holiday=<name> (newyear, groundhog, valentine, piday, stpatrick, easter, july4, halloween,
   thanksgiving) plays it on every load.
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
      '.mo-flick{animation:moFlick 2.2s infinite}@keyframes moFlick{0%,100%{opacity:1}18%{opacity:.78}22%{opacity:.95}48%{opacity:.82}55%{opacity:1}77%{opacity:.86}}' +
      '.mo-fw{border-radius:50%;background:radial-gradient(circle,#fff 0 16%,currentColor 30%,transparent 70%)}' +
      '.mo-big{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);text-align:center;font-family:"IBM Plex Sans",-apple-system,"Segoe UI",sans-serif;white-space:nowrap}' +
      '.mo-big b{display:block;font-weight:800;line-height:1;letter-spacing:.02em;' +
      'background:linear-gradient(180deg,#fff6cf 0%,#ffd76a 35%,#e2a73b 62%,#fff0b8 80%,#c98d23 100%);-webkit-background-clip:text;background-clip:text;color:transparent;' +
      'filter:drop-shadow(0 4px 14px rgba(13,49,76,.45))}' +
      '.mo-big span{display:block;font-weight:800;letter-spacing:.32em;text-transform:uppercase;color:#fff;' +
      'text-shadow:0 2px 10px rgba(13,49,76,.9),0 0 3px rgba(13,49,76,.8)}' +
      '.mo-big:before{content:"";position:absolute;left:50%;top:50%;width:150%;height:190%;transform:translate(-50%,-50%);z-index:-1;' +
      'background:radial-gradient(closest-side,rgba(13,49,76,.55),rgba(13,49,76,.25) 55%,transparent)}' +
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

  /* fireworks, the way real ones go: a rocket climbs, slowing as it rises, and bursts just as it tops out; the
     sparks fly out fast, slow down in the air, droop as they fall and fade. No stop-and-go. */
  function firework(layer, x, y, colors) {
    var Hh = innerHeight, rise = rnd(900, 1150), c1 = pick(colors), c2 = pick(colors), x0 = x + rnd(-40, 40);
    var rocket = piece('mo-fw', '#fff1c2'); rocket.style.width = rocket.style.height = '9px'; layer.appendChild(rocket);
    var ease = function (t) { return 1 - Math.pow(1 - t, 2.4); }, rf = [];
    for (var k = 0; k <= 12; k++) { var t = k / 12, e = ease(t); rf.push({ transform: 'translate(' + (x0 + (x - x0) * e - 4.5) + 'px,' + (Hh + 10 + (y - Hh - 10) * e - 4.5) + 'px)', opacity: t > 0.92 ? 0 : 1 }); }
    anim(rocket, rf, { duration: rise, easing: 'linear', fill: 'forwards' });
    /* a little trail of embers behind the rocket */
    var t0 = performance.now(), trail = setInterval(function () {
      var t = Math.min(1, (performance.now() - t0) / rise), e = ease(t);
      if (t > 0.9) { clearInterval(trail); return; }
      var em = piece('mo-dot', '#ffe9a8'); em.style.width = em.style.height = '5px'; layer.appendChild(em);
      var ex = x0 + (x - x0) * e, ey = Hh + 10 + (y - Hh - 10) * e;
      anim(em, [{ transform: 'translate(' + (ex - 2.5) + 'px,' + (ey - 2.5) + 'px)', opacity: 0.9 }, { transform: 'translate(' + (ex - 2.5 + rnd(-4, 4)) + 'px,' + (ey + 14) + 'px)', opacity: 0 }], { duration: 420, fill: 'forwards' });
      setTimeout(function () { em.remove(); }, 440);
    }, 45);
    setTimeout(function () {
      rocket.remove();
      var flash = piece('mo-glow', c1); flash.style.width = flash.style.height = '240px'; layer.appendChild(flash);
      anim(flash, [{ transform: 'translate(' + (x - 120) + 'px,' + (y - 120) + 'px) scale(.3)', opacity: 0.9 }, { transform: 'translate(' + (x - 120) + 'px,' + (y - 120) + 'px) scale(1.1)', opacity: 0 }], { duration: 420, easing: 'ease-out', fill: 'forwards' });
      setTimeout(function () { flash.remove(); }, 440);
      var n = 46, R0 = rnd(110, 175), dur = rnd(1700, 2200);
      for (var i = 0; i < n; i++) {
        var inner = i % 3 === 0, p = piece(i % 7 === 0 ? 'mo-star' : 'mo-fw', inner ? c2 : c1), s = i % 7 === 0 ? 11 : rnd(13, 19);
        p.style.width = p.style.height = s + 'px'; layer.appendChild(p);
        var a = i / n * Math.PI * 2 + rnd(-0.07, 0.07), sp = R0 * (inner ? 0.55 : 1) * rnd(0.88, 1.04), fr = [], tw = R() < 0.35;
        for (var k2 = 0; k2 <= 14; k2++) {
          var u = k2 / 14, r = sp * (1 - Math.exp(-4.6 * u)) / (1 - Math.exp(-4.6)), drop = 85 * u * u;
          var op = u < 0.5 ? 1 : Math.max(0, 1 - (u - 0.5) / 0.5); if (tw && u > 0.45 && k2 % 2) op *= 0.35;
          fr.push({ transform: 'translate(' + (x + Math.cos(a) * r - s / 2) + 'px,' + (y + Math.sin(a) * r + drop - s / 2) + 'px) scale(' + (1 - 0.55 * u).toFixed(2) + ')', opacity: op });
        }
        anim(p, fr, { duration: dur, easing: 'linear', fill: 'forwards' });
        (function (el) { setTimeout(function () { el.remove(); }, dur + 40); })(p);
      }
    }, rise * 0.9);
    return rise + 2300;
  }
  /* a show: bursts at uneven moments and heights, like the real thing */
  function fireworks(layer, colors, n) {
    var W = innerWidth, Hh = innerHeight, t = 0, longest = 0;
    for (var i = 0; i < n; i++) (function (i, at) {
      setTimeout(function () { firework(layer, W * (0.1 + 0.8 * (i + R()) / n), Hh * rnd(0.12, 0.38), colors); }, at);
      longest = Math.max(longest, at + 3600);
    })(i, t), t += rnd(320, 900);
    return longest;
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
  var LEAVES = [
    'M0,-10 L2,-5.5 L6.5,-7.5 L5.2,-2.4 L10,-1.2 L6.2,2 L7.6,5.6 L2.4,4.4 L1,9.6 L0,10 L-1,9.6 L-2.4,4.4 L-7.6,5.6 L-6.2,2 L-10,-1.2 L-5.2,-2.4 L-6.5,-7.5 L-2,-5.5 Z',
    'M0,11 L0,7 C-2,8 -4.4,7.2 -4,5 C-7,6 -8.4,3 -6,1.6 C-9,0 -8.4,-3.4 -5,-3 C-7,-6 -5,-8.4 -2.8,-7 C-3,-10 0,-11 0,-11 C0,-11 3,-10 2.8,-7 C5,-8.4 7,-6 5,-3 C8.4,-3.4 9,0 6,1.6 C8.4,3 7,6 4,5 C4.4,7.2 2,8 0,7 Z',
    'M0,-11 C3,-9 6.5,-5 7,0 C7.4,4 4,8.6 0,11 C-4,8.6 -7.4,4 -7,0 C-6.5,-5 -3,-9 0,-11 Z',
    'M0,10 C-1,6 -9,4 -9,-2 C-9,-7 -4,-9 0,-5 C4,-9 9,-7 9,-2 C9,4 1,6 0,10 Z'
  ];
  var FALL = [['#d9701f', '#8a3d0c'], ['#b8322a', '#6b1610'], ['#e9b02f', '#8a6210'], ['#a5683a', '#4e2e14'], ['#8e2a2a', '#4a1010'], ['#c9a227', '#6b5a10'], ['#e2852b', '#7a3a0a'], ['#9a8a2a', '#4e4410']];
  function fallLeaf(i) {
    var c = FALL[Math.floor(R() * FALL.length)], d = LEAVES[i % LEAVES.length];
    return '<path d="' + d + '" fill="' + c[0] + '" stroke="' + c[0] + '" stroke-width="1" stroke-linejoin="round"/>' +
      '<path d="M0,10 L0,-8 M0,2 L5,-3 M0,2 L-5,-3 M0,-3 L3.4,-6 M0,-3 L-3.4,-6" stroke="' + c[1] + '" stroke-width=".8" fill="none" opacity=".55"/>' +
      '<path d="M0,10 L0,13" stroke="' + c[1] + '" stroke-width="1.2" stroke-linecap="round"/>';
  }
  /* leaves that drift down slowly, swaying and tumbling, spread across the page and over a few seconds */
  function leafFall(layer, n) {
    var W = innerWidth, Hh = innerHeight, longest = 0;
    for (var i = 0; i < n; i++) {
      var e = art('-14 -14 28 28', fallLeaf(i)), s = rnd(28, 58); e.style.width = e.style.height = s + 'px'; layer.appendChild(e);
      var x0 = W * (i + R()) / n, dur = rnd(10000, 15000), delay = rnd(0, 6500), sw = rnd(30, 90), f1 = rnd(1.2, 2.2), ph = R() * 6, drift = rnd(-60, 60), r0 = rnd(0, 360), spin = rnd(-220, 220), flip = rnd(2, 4), fr = [];
      for (var k = 0; k <= 16; k++) {
        var t = k / 16, y = -70 + (Hh + 140) * t, x = x0 + Math.sin(t * Math.PI * 2 * f1 + ph) * sw + drift * t;
        fr.push({ transform: 'translate(' + (x - s / 2) + 'px,' + (y - s / 2) + 'px) rotate(' + (r0 + spin * t).toFixed(1) + 'deg) scaleX(' + Math.cos(t * Math.PI * flip).toFixed(2) + ')', opacity: t < 0.06 ? t / 0.06 : t > 0.92 ? (1 - t) / 0.08 : 1 });
      }
      anim(e, fr, { duration: dur, delay: delay, easing: 'linear', fill: 'both' });
      longest = Math.max(longest, dur + delay);
    }
    return longest + 200;
  }

  /* hats: drawn on 100 x 100 with the brim centred at (bx, by), brimW units wide; scale = how much wider than the O */
  var HATS = {
    party: { bx: 50, by: 88, brimW: 40, scale: 1.0, tilt: 24, inner:
      '<defs>' + GOLD + '<linearGradient id="I-cone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfe3f7"/><stop offset=".5" stop-color="#74bfeb"/><stop offset="1" stop-color="#2b7fbf"/></linearGradient>' +
      '<clipPath id="I-k"><path d="M30,88 L58,44 L70,88 Z"/></clipPath></defs>' +
      '<path d="M30,88 L58,44 L70,88 Z" fill="url(#I-cone)"/>' +
      '<g clip-path="url(#I-k)"><path d="M10,82 L90,62 L90,69 L10,89 Z" fill="url(#I-gold)"/><path d="M10,68 L90,48 L90,52 L10,72 Z" fill="#fff"/><path d="M10,58 L90,38 L90,44 L10,64 Z" fill="url(#I-gold)"/>' +
      '<circle cx="48" cy="78" r="2.2" fill="#0d314c"/><circle cx="60" cy="81" r="2.2" fill="#fff"/><circle cx="56" cy="62" r="2" fill="#0d314c"/>' +
      '<path d="M30,88 L58,44 L46,88 Z" fill="#fff" opacity=".2"/><path d="M58,44 L70,88 L63,88 Z" fill="#0d314c" opacity=".22"/></g>' +
      '<ellipse cx="50" cy="88" rx="21" ry="4.4" fill="url(#I-gold)"/>' +
      '<g stroke-width="2.6" stroke-linecap="round">' + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function (a, i) {
        var r = a * Math.PI / 180; return '<path d="M58,43 L' + (58 + Math.cos(r) * 9).toFixed(1) + ',' + (43 + Math.sin(r) * 9).toFixed(1) + '" stroke="' + (i % 2 ? '#74bfeb' : '#ffd76a') + '"/>'; }).join('') + '</g>' +
      '<circle cx="58" cy="43" r="5.6" fill="url(#I-gold)"/><circle cx="56.4" cy="41.4" r="1.7" fill="#fff" opacity=".85"/>' },
    leprechaun: { bx: 50, by: 86, brimW: 76, scale: 1.95, tilt: 10, inner:
      '<defs>' + GOLD + '<linearGradient id="I-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#43b065"/><stop offset=".5" stop-color="#2a8a49"/><stop offset="1" stop-color="#16592d"/></linearGradient></defs>' +
      '<ellipse cx="50" cy="86" rx="38" ry="7.5" fill="#145a2c"/><ellipse cx="50" cy="84.5" rx="36.5" ry="5.6" fill="url(#I-g)"/>' +
      '<path d="M27,84 L30.5,36 C31,31.5 69,31.5 69.5,36 L73,84 Z" fill="url(#I-g)"/><ellipse cx="50" cy="34.5" rx="19.5" ry="4.4" fill="#36a058"/>' +
      '<path d="M33.5,80 L35.5,40 L40,39.4 L38.4,80 Z" fill="#fff" opacity=".16"/>' +
      '<path d="M28.4,67 L71.6,67 L72.5,80 L27.5,80 Z" fill="#1d1d24"/>' +
      '<rect x="43" y="65.4" width="14" height="16.2" rx="1.6" fill="none" stroke="url(#I-gold)" stroke-width="3.2"/>' +
      '<g transform="translate(65 64) scale(.62)">' + shamrock('#5cd07f') + '</g>' },
    unclesam: { bx: 50, by: 86, brimW: 76, scale: 1.95, tilt: 10, inner:
      '<defs><clipPath id="I-c"><path d="M28,84 L31,26 C31,21.5 69,21.5 69,26 L72,84 Z"/></clipPath></defs>' +
      '<ellipse cx="50" cy="86" rx="38" ry="7.5" fill="#16306e"/><ellipse cx="50" cy="84.6" rx="36.5" ry="5.4" fill="#22408f"/>' +
      '<path d="M28,84 L31,26 C31,21.5 69,21.5 69,26 L72,84 Z" fill="#f6f8fb"/>' +
      '<g clip-path="url(#I-c)" fill="#d23a2c"><rect x="30" y="20" width="6" height="66"/><rect x="42" y="20" width="6" height="66"/><rect x="54" y="20" width="6" height="66"/><rect x="66" y="20" width="6" height="66"/>' +
      '<path d="M28,84 L31,26 L38,26 L35,84 Z" fill="#fff" opacity=".18"/><path d="M62,26 L69,26 L72,84 L66,84 Z" fill="#000" opacity=".12"/></g>' +
      '<ellipse cx="50" cy="25" rx="19" ry="4.2" fill="#e3e8ef"/>' +
      '<path d="M29.2,65 L70.8,65 L71.7,79 L28.3,79 Z" fill="#22408f"/>' +
      [35, 44.5, 54, 63.5].map(function (x) { return '<path transform="translate(' + x + ' 72) scale(.42)" d="M0,-10 L2.9,-3.1 L9.5,-3.1 L4.3,1.2 L5.9,8.1 L0,4.2 L-5.9,8.1 L-4.3,1.2 L-9.5,-3.1 L-2.9,-3.1 Z" fill="#fff"/>'; }).join('') }
  };

  /* costumes: the O itself becomes something, and stays an O. Drawn over the O's own footprint (0 to 152 across,
     0 to 108 down, the O of the 708 x 108 lockup), with room around it for ears, a stem or feathers: viewBox
     -50 -80 252 210. OPATH is the logo's own O (ring); OOUT is just its outside edge. */
  var OOUT = 'M35.7,1.5C18.8,6.1 7.8,16.8 2.2,33.8C0.1,40.3 -0.3,43.4 -0.3,53.5C-0.3,63.6 0.1,66.7 2.2,73.2C7.9,90.4 19.0,101.2 35.7,105.5C44.1,107.7 108.0,107.7 116.5,105.5C138.7,99.7 152.0,80.2 152.0,53.5C152.0,26.5 138.8,7.6 115.9,1.5C108.5,-0.5 42.9,-0.5 35.7,1.5Z';
  var OPATH = OOUT + 'M104.9,33.5C110.6,36.8 112.5,41.9 112.5,53.5C112.5,65.1 110.6,70.2 104.9,73.5C101.7,75.4 99.7,75.5 75.5,75.5C45.8,75.5 44.8,75.3 40.9,67.2C37.9,61.1 37.8,47.4 40.7,41.0C44.8,31.7 47.5,31.0 77.5,31.3C99.4,31.5 101.8,31.7 104.9,33.5Z';
  var COSTUMES = {
    /* Easter: big floppy ears on top of the O (one up, one flopped over), and a little bunny face in its middle */
    bunny: '<defs><linearGradient id="I-w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe6ee"/></linearGradient></defs>' +
      '<g class="mo-ears">' +
      '<path d="M30,8 C18,-30 16,-66 32,-78 C50,-72 62,-36 62,6 Z" fill="url(#I-w)" stroke="#0f314c" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M37,-1 C30,-30 29,-58 35,-67 C46,-59 52,-32 53,-1 Z" fill="#f7b6c8"/>' +
      '<path d="M90,6 C89,-20 94,-42 108,-52 C126,-62 156,-48 174,-20 C180,-10 172,-2 163,-7 C150,-24 134,-32 124,-28 C120,-16 120,-6 121,6 Z" fill="url(#I-w)" stroke="#0f314c" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M98,-1 C98,-22 102,-38 112,-44 C126,-50 146,-40 159,-21 C146,-29 132,-36 120,-33 C113,-22 111,-11 111,-1 Z" fill="#f7b6c8"/></g>' +
      '<ellipse cx="52" cy="62" rx="7" ry="4.4" fill="#f7b6c8" opacity=".7"/><ellipse cx="100" cy="62" rx="7" ry="4.4" fill="#f7b6c8" opacity=".7"/>' +
      '<ellipse cx="61" cy="47" rx="4.6" ry="5.6" fill="#0f314c"/><ellipse cx="91" cy="47" rx="4.6" ry="5.6" fill="#0f314c"/><circle cx="62.6" cy="45" r="1.7" fill="#fff"/><circle cx="92.6" cy="45" r="1.7" fill="#fff"/>' +
      '<g stroke="#9aa6b2" stroke-width="1.6" stroke-linecap="round"><path d="M68,58 L26,52 M68,61 L24,63 M84,58 L126,52 M84,61 L128,63"/></g>' +
      '<path d="M71,54 C72,52 80,52 81,54 C80.4,57 78,59 76,59.6 C74,59 71.6,57 71,54 Z" fill="#f49ab0"/>' +
      '<path d="M76,59.6 L76,62 M76,62 C74.6,65.6 70.4,66.4 68.4,64.2 M76,62 C77.4,65.6 81.6,66.4 83.6,64.2" stroke="#0f314c" stroke-width="1.9" fill="none" stroke-linecap="round"/>' +
      '<rect x="72.6" y="63.6" width="6.8" height="6" rx="1.4" fill="#fff" stroke="#0f314c" stroke-width="1.1"/><path d="M76,63.6 L76,69.6" stroke="#0f314c" stroke-width=".9"/>',
    /* Halloween: the O turns pumpkin orange with a stem and vine on top, and a carved face in its middle */
    pumpkin: '<defs><linearGradient id="I-pk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffab42"/><stop offset=".55" stop-color="#f27d1b"/><stop offset="1" stop-color="#bf560b"/></linearGradient>' +
      '<radialGradient id="I-gl" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#ffd23a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd23a" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="I-oc"><path d="' + OPATH + '" clip-rule="evenodd"/></clipPath></defs>' +
      '<path d="M82,-11 C93,-19 106,-12 101,-3 C97,3 89,0 92,-6" stroke="#4e6b26" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M92,-14 C100,-26 114,-24 116,-16 C108,-12 99,-11 92,-14 Z" fill="#6f9a37"/>' +
      '<path d="M68,6 C66,-8 70,-20 81,-27 C85,-24 84,-18 81,-14 C78,-7 79,-1 82,6 Z" fill="#5b7a2e" stroke="#3e5a1c" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="' + OPATH + '" fill="url(#I-pk)" fill-rule="evenodd" stroke="#e8741a" stroke-width="2.4"/>' +
      '<g clip-path="url(#I-oc)" fill="none" stroke-linecap="round"><g stroke="#a8480a" stroke-opacity=".5" stroke-width="2.6">' +
      '<path d="M20,4 C6,30 6,78 20,104 M132,4 C146,30 146,78 132,104 M52,-2 C46,8 44,20 46,32 M100,-2 C106,8 108,20 106,32 M52,110 C46,100 44,88 46,76 M100,110 C106,100 108,88 106,76"/></g>' +
      '<path d="M12,34 C16,20 24,11 36,7" stroke="#fff" stroke-opacity=".45" stroke-width="5"/></g>' +
      '<ellipse class="mo-flick" cx="76" cy="54" rx="40" ry="26" fill="url(#I-gl)"/>' +
      '<g fill="#3b1a06" stroke="#f08a24" stroke-width="1.4" stroke-linejoin="round">' +
      '<path d="M50,50 L61,36 L67,51 Z"/><path d="M102,50 L91,36 L85,51 Z"/><path d="M76,49 L80,56 L72,56 Z"/>' +
      '<path d="M47,59 C58,72 94,72 105,59 L101,67 L94,64 L90,71 L83,67 L76,73 L69,67 L62,71 L58,64 L51,67 Z"/></g>',
    /* Thanksgiving: tail feathers fan out behind the O, and a turkey face (eyes, beak, wattle) sits in its middle */
    turkey: (function () {
      var cols = [['#b8322a', '#e8483c'], ['#d9701f', '#f39a3c'], ['#e9b02f', '#ffd76a'], ['#7a4a22', '#a5683a']], f = '';
      for (var i = -5; i <= 5; i++) { var c = cols[(i + 10) % 4]; f += '<g transform="rotate(' + i * 15 + ' 76 62)"><ellipse cx="76" cy="-12" rx="14" ry="50" fill="' + c[0] + '"/><ellipse cx="76" cy="-50" rx="10" ry="12" fill="' + c[1] + '"/><circle cx="76" cy="-52" r="4" fill="#3a2210" opacity=".35"/><path d="M76,40 L76,-58" stroke="#3a2210" stroke-opacity=".35" stroke-width="1.4"/></g>'; }
      return '<defs><mask id="I-tm" maskUnits="userSpaceOnUse" x="-50" y="-80" width="252" height="210"><rect x="-50" y="-80" width="252" height="210" fill="#fff"/><path d="' + OOUT + '" fill="#000" stroke="#000" stroke-width="3"/></mask></defs>' +
        '<g mask="url(#I-tm)">' + f + '</g>' +
        '<circle cx="64" cy="46" r="6.6" fill="#fff" stroke="#0f314c" stroke-width="1.2"/><circle cx="88" cy="46" r="6.6" fill="#fff" stroke="#0f314c" stroke-width="1.2"/>' +
        '<circle cx="65.4" cy="47" r="3.4" fill="#1b120c"/><circle cx="89.4" cy="47" r="3.4" fill="#1b120c"/><circle cx="66.4" cy="45.8" r="1.1" fill="#fff"/><circle cx="90.4" cy="45.8" r="1.1" fill="#fff"/>' +
        '<path d="M69,54 L83,54 L76,64 Z" fill="#f3a623" stroke="#c97f12" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<path d="M79,59 C87,63 87,72 81,75 C77,70 76,64 79,59 Z" fill="#d23a2c"/>' +
        '<path d="M56,106 L56,118 M49,124 L56,118 L63,124 M56,118 L56,126 M96,106 L96,118 M89,124 L96,118 L103,124 M96,118 L96,126" stroke="#f3a623" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
    })()
  };

  function fitHat(h, logo, host, spec) {
    var b = oBox(logo), P = host.getBoundingClientRect();
    if (!b) return;
    var set = function (k, v) { h.style.setProperty(k, v, 'important'); };
    if (spec.costume) {
      var u0 = b.w / 152;
      set('width', 252 * u0 + 'px'); set('height', 210 * u0 + 'px');
      set('left', (b.x - 50 * u0 - P.left) + 'px'); set('top', (b.top - 80 * u0 - P.top) + 'px');
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
    var h = svg(spec.costume ? '-50 -80 252 210' : '0 0 100 100', ids(spec.costume ? COSTUMES[spec.costume] : spec.inner));
    h.setAttribute('class', 'mo-hat' + (spec.costume ? ' mo-costume' : ''));
    host.appendChild(h);
    hats.push({ el: h, logo: found.logo, host: host });
    h.addEventListener('click', function () { var a = host.closest('a') || host.querySelector('a'); if (a) a.click(); else if (typeof host.click === 'function') host.click(); });
    var refit = function () { fitHat(h, found.logo, host, spec); };
    requestAnimationFrame(function () { refit(); unclip(h); });
    addEventListener('resize', refit);
    try { new ResizeObserver(refit).observe(found.logo); new ResizeObserver(refit).observe(host); } catch (e) {}
    [400, 1200, 3000, 6000].forEach(function (ms) { setTimeout(refit, ms); });
    /* the costume pops on the first time the tool opens today */
    if (spec.costume && FIRST && !still) anim(h, [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.12)', opacity: 1, offset: 0.6 }, { transform: 'scale(.96)', offset: 0.8 }, { transform: 'scale(1)', opacity: 1 }], { duration: 900, delay: 500, easing: 'ease-out', fill: 'backwards' });
  }

  /* ---------------- sprites ---------------- */
  /* a bat whose wings really flap (the wing shape morphs up and down), dark with a faint violet edge */
  var WUP = 'M2,-1 C7,-10 15,-16 27,-15 C25,-11 26,-7 29,-4 C25,-4.5 22,-2 22,1 C19,-1.5 15,-1 13,2 C10,0 6,1 3,3 Z';
  var WDN = 'M2,-1 C8,2 16,7 25,14 C22,11 21,8 22,5 C19,6.5 16,6 14,4 C12,6 9,6.5 6,5.5 C5,4.5 4,3.5 3,3 Z';
  function bat(speed) {
    var flap = '<animate attributeName="d" values="' + WUP + ';' + WDN + ';' + WUP + '" keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="' + speed + 's" repeatCount="indefinite"/>';
    return '<g fill="#1a1224" stroke="#7a5aa6" stroke-width=".6" stroke-opacity=".9">' +
      '<path d="' + WUP + '">' + flap + '</path><g transform="scale(-1 1)"><path d="' + WUP + '">' + flap + '</path></g>' +
      '<ellipse cx="0" cy="3" rx="4.6" ry="7.4"/><circle cx="0" cy="-5" r="4.4"/><path d="M-3.4,-7 L-4.6,-12.6 L-1.2,-8.6 Z M3.4,-7 L4.6,-12.6 L1.2,-8.6 Z"/>' +
      '<path d="M-1.6,10 L-2.4,12.4 M1.6,10 L2.4,12.4" stroke="#1a1224" stroke-width="1"/></g>' +
      '<circle cx="-1.7" cy="-5.4" r=".95" fill="#ff9d2e"/><circle cx="1.7" cy="-5.4" r=".95" fill="#ff9d2e"/>';
  }
  /* the groundhog stays inside his burrow until he pops up: everything below the hole is hidden */
  var GROUNDHOG = '<defs><radialGradient id="I-h" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#b07a48"/><stop offset="1" stop-color="#6a4224"/></radialGradient>' +
    '<linearGradient id="I-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5e3a"/><stop offset="1" stop-color="#4a301c"/></linearGradient>' +
    '<clipPath id="I-hole"><rect x="-20" y="-40" width="140" height="130"/></clipPath></defs>' +
    '<ellipse cx="50" cy="90" rx="30" ry="8" fill="#2a1a0e"/>' +
    '<g clip-path="url(#I-hole)"><g class="mo-gh"><path d="M27,128 C22,88 30,46 50,42 C70,46 78,88 73,128 Z" fill="url(#I-h)"/><ellipse cx="50" cy="86" rx="14" ry="19" fill="#d1a676"/>' +
    '<g class="mo-face"><ellipse cx="50" cy="38" rx="18" ry="15.5" fill="url(#I-h)"/><circle cx="36" cy="26" r="4.4" fill="#5a381e"/><circle cx="64" cy="26" r="4.4" fill="#5a381e"/><circle cx="36" cy="26" r="2" fill="#c99a6a"/><circle cx="64" cy="26" r="2" fill="#c99a6a"/>' +
    '<circle cx="43.5" cy="35" r="2.8" fill="#1b120c"/><circle cx="44.4" cy="34" r="1" fill="#fff"/><circle cx="56.5" cy="35" r="2.8" fill="#1b120c"/><circle cx="57.4" cy="34" r="1" fill="#fff"/>' +
    '<ellipse cx="50" cy="45" rx="9" ry="6.6" fill="#e3c294"/><ellipse cx="50" cy="41.4" rx="3.4" ry="2.4" fill="#3a2516"/>' +
    '<rect x="47.4" y="47.8" width="5.2" height="5.2" rx="1" fill="#fff"/><path d="M50,47.8 L50,53" stroke="#d9d9d9" stroke-width=".6"/>' +
    '<path d="M40,46 L30,44 M40,48 L30,49 M60,46 L70,44 M60,48 L70,49" stroke="#5a381e" stroke-width=".7"/></g>' +
    '<ellipse cx="39" cy="66" rx="5.6" ry="4.4" fill="#7a4e2c"/><ellipse cx="61" cy="66" rx="5.6" ry="4.4" fill="#7a4e2c"/></g></g>' +
    '<path d="M-8,120 C0,102 14,93 22,91 C32,97 68,97 78,91 C86,93 100,102 108,120 Z" fill="url(#I-d)"/>' +
    '<path d="M22,91 C32,97 68,97 78,91" stroke="#a8784e" stroke-width="2" fill="none"/>' +
    '<g fill="#3b2614"><circle cx="14" cy="108" r="2.2"/><circle cx="34" cy="102" r="1.6"/><circle cx="62" cy="104" r="2"/><circle cx="84" cy="110" r="1.8"/><circle cx="50" cy="113" r="2.2"/></g>' +
    '<g fill="#5fae5e"><path d="M4,112 l2,-9 2,9 Z"/><path d="M92,110 l2,-10 2,10 Z"/><path d="M97,113 l2,-7 2,7 Z"/></g>';
  /* a lattice cherry pie, golden and glossy, in a blue dish, with a pastry pi on top */
  var PIE = (function () {
    var crimp = '', strips = '', cherries = '';
    for (var k = 0; k < 30; k++) { var a = k / 30 * Math.PI * 2, x = 80 + 64 * Math.cos(a), y = 53 + 16.5 * Math.sin(a); crimp += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5.4" fill="#e9ac58"/><circle cx="' + (x - 1.4).toFixed(1) + '" cy="' + (y - 1.6).toFixed(1) + '" r="2" fill="#fbe0a8" opacity=".8"/>'; }
    for (var s = -4; s <= 4; s++) { var xa = 80 + s * 15; strips += '<path d="M' + (xa - 22) + ',30 L' + (xa + 22) + ',76" stroke="#b9732a" stroke-width="9.6" stroke-linecap="round"/><path d="M' + (xa - 22) + ',30 L' + (xa + 22) + ',76" stroke="url(#I-st)" stroke-width="7.4" stroke-linecap="round"/>'; }
    for (var s2 = -4; s2 <= 4; s2++) { var xb = 80 + s2 * 15; strips += '<path d="M' + (xb + 22) + ',30 L' + (xb - 22) + ',76" stroke="#b9732a" stroke-width="9.6" stroke-linecap="round"/><path d="M' + (xb + 22) + ',30 L' + (xb - 22) + ',76" stroke="url(#I-st)" stroke-width="7.4" stroke-linecap="round"/>'; }
    [[46, 50], [62, 60], [100, 46], [114, 56], [74, 44], [90, 62], [56, 44], [106, 62]].forEach(function (p) { cherries += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.2" fill="#9e0d16"/><circle cx="' + (p[0] - 1.4) + '" cy="' + (p[1] - 1.4) + '" r="1.3" fill="#ff9a8f"/>'; });
    return '<defs><linearGradient id="I-dish" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7ecf8"/><stop offset="1" stop-color="#3d8fd6"/></linearGradient>' +
      '<radialGradient id="I-cr" cx=".45" cy=".35" r=".85"><stop offset="0" stop-color="#fde2a8"/><stop offset=".55" stop-color="#e9a94e"/><stop offset="1" stop-color="#b8742a"/></radialGradient>' +
      '<radialGradient id="I-ch" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#ff5a4e"/><stop offset=".55" stop-color="#c4161c"/><stop offset="1" stop-color="#6e0b12"/></radialGradient>' +
      '<linearGradient id="I-st" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde4ad"/><stop offset=".5" stop-color="#eeb15d"/><stop offset="1" stop-color="#cf8a3a"/></linearGradient>' +
      '<clipPath id="I-fc"><ellipse cx="80" cy="52" rx="56" ry="15"/></clipPath></defs>' +
      '<ellipse cx="80" cy="94" rx="66" ry="7" fill="#0d314c" opacity=".14"/>' +
      '<path d="M8,56 L152,56 L142,84 C136,92 24,92 18,84 Z" fill="url(#I-dish)"/>' +
      '<g stroke="#fff" stroke-opacity=".4" stroke-width="2">' + [24, 38, 52, 66, 80, 94, 108, 122, 136].map(function (x) { return '<path d="M' + x + ',60 L' + (x + (x - 80) * -0.06) + ',86"/>'; }).join('') + '</g>' +
      '<ellipse cx="80" cy="56" rx="72" ry="20" fill="#e6f3fb"/>' +
      '<ellipse cx="80" cy="53" rx="68" ry="18.5" fill="url(#I-cr)"/>' + crimp +
      '<ellipse cx="80" cy="52" rx="56" ry="15" fill="url(#I-ch)"/>' +
      '<g clip-path="url(#I-fc)">' + cherries + strips + '<ellipse cx="62" cy="44" rx="14" ry="3" fill="#fff" opacity=".22"/></g>' +
      '<g fill="#fff" opacity=".85"><circle cx="40" cy="47" r=".9"/><circle cx="122" cy="51" r=".9"/><circle cx="70" cy="64" r=".8"/><circle cx="98" cy="40" r=".8"/><circle cx="110" cy="64" r=".9"/></g>' +
      '<g transform="translate(80 49)"><path d="M-15,-6 L15,-6 M-7.5,-6 C-7.5,2 -8.5,7 -11.5,10.5 M7.5,-6 C7.5,2 8,7 11.5,9.5" stroke="#8a4f17" stroke-width="7.6" stroke-linecap="round" fill="none"/>' +
      '<path d="M-15,-6 L15,-6 M-7.5,-6 C-7.5,2 -8.5,7 -11.5,10.5 M7.5,-6 C7.5,2 8,7 11.5,9.5" stroke="url(#I-st)" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<path d="M-13,-7.4 L13,-7.4" stroke="#fff3d6" stroke-width="1.2" stroke-linecap="round" opacity=".8"/></g>' +
      '<g stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".75">' +
      '<path d="M60,30 C56,24 64,20 60,12"><animate attributeName="opacity" values="0;.8;0" dur="2.4s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -6" dur="2.4s" repeatCount="indefinite"/></path>' +
      '<path d="M80,28 C76,22 84,18 80,8"><animate attributeName="opacity" values="0;.8;0" dur="2.4s" begin=".8s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -6" dur="2.4s" begin=".8s" repeatCount="indefinite"/></path>' +
      '<path d="M100,30 C96,24 104,20 100,12"><animate attributeName="opacity" values="0;.8;0" dur="2.4s" begin="1.6s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -6" dur="2.4s" begin="1.6s" repeatCount="indefinite"/></path></g>';
  })();
  /* Easter: a person in a bunny costume, carrying a basket with no bottom on their back. Drawn on 140 x 200, facing right;
     feet on the ground at y 198. Torso turns at the hips (60,140); the reaching arm at the shoulder (62,96). */
  var KID = '<defs><radialGradient id="I-su" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9dfe8"/></radialGradient>' +
    '<radialGradient id="I-sk" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffe3d2"/><stop offset="1" stop-color="#f0b796"/></radialGradient>' +
    '<linearGradient id="I-bk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcab62"/><stop offset="1" stop-color="#9c6a2e"/></linearGradient></defs>' +
    '<path d="M54,140 C52,160 52,176 54,188" stroke="#dfe5ec" stroke-width="16" stroke-linecap="round" fill="none"/><ellipse cx="60" cy="192" rx="16" ry="6.5" fill="#e3e8ef"/>' +
    '<path d="M66,140 C66,160 66,176 68,188" stroke="#f4f6f9" stroke-width="17" stroke-linecap="round" fill="none"/><ellipse cx="76" cy="192.5" rx="17" ry="7" fill="#fff"/><ellipse cx="88" cy="194" rx="5" ry="2.6" fill="#f7b6c8"/>' +
    '<g class="kb-torso">' +
    '<circle cx="35" cy="128" r="10.5" fill="#fff"/><circle cx="32" cy="125" r="4" fill="#eef1f5"/>' +
    '<path d="M6,102 L34,102 L30.5,126 L9.5,126 Z" fill="url(#I-bk)"/>' +
    '<path d="M6.8,110 L33.2,110 M7.9,118 L32.1,118" stroke="#7a4f1e" stroke-opacity=".6" stroke-width="1.4"/>' +
    '<path d="M13,102 L14,126 M20,102 L20,126 M27,102 L26,126" stroke="#7a4f1e" stroke-opacity=".45" stroke-width="1.2"/>' +
    '<ellipse cx="20" cy="102" rx="14.5" ry="3.8" fill="#c08a44" stroke="#7a4f1e" stroke-width="1"/><ellipse cx="20" cy="102" rx="11.5" ry="2.4" fill="#5a3a16"/>' +
    '<ellipse cx="20" cy="126" rx="10.5" ry="2" fill="#3a240c" opacity=".8"/>' +
    '<path d="M38,146 C33,118 40,92 60,86 C82,90 88,118 84,146 C70,152 50,152 38,146 Z" fill="url(#I-su)"/>' +
    '<ellipse cx="67" cy="120" rx="12" ry="18" fill="#ffe3ec"/>' +
    '<path d="M30,103 C40,94 52,90 64,92" stroke="#9c6a2e" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
    '<g class="kb-ears"><path d="M52,42 C42,10 44,-14 53,-22 C62,-16 64,8 60,42 Z" fill="#e3e8ef"/>' +
    '<path d="M66,40 C66,4 72,-18 83,-22 C89,-14 85,10 75,42 Z" fill="url(#I-su)"/><path d="M70,34 C70,8 74,-10 81,-14 C84,-8 80,10 74,34 Z" fill="#f7b6c8"/></g>' +
    '<circle cx="64" cy="60" r="25.5" fill="url(#I-su)"/>' +
    '<ellipse cx="71" cy="64" rx="16.5" ry="17.5" fill="url(#I-sk)"/>' +
    '<path d="M56,54 C59,45 72,43 86,50 C81,52 75,50 71,53 C66,50 61,52 56,54 Z" fill="#7a4a28"/>' +
    '<g class="kb-eyes"><ellipse cx="67" cy="62" rx="2.3" ry="2.9" fill="#2a1d18"/><ellipse cx="79" cy="62" rx="2.3" ry="2.9" fill="#2a1d18"/><circle cx="67.8" cy="61" r=".8" fill="#fff"/><circle cx="79.8" cy="61" r=".8" fill="#fff"/></g>' +
    '<ellipse cx="76" cy="68" rx="2.7" ry="2" fill="#f49ab0"/>' +
    '<path d="M81,70 L91,67 M81,72 L91,73 M68,70 L59,68 M68,72 L59,73" stroke="#8a6a5a" stroke-width=".8"/>' +
    '<circle cx="63" cy="70" r="3.4" fill="#f49ab0" opacity=".5"/><circle cx="85" cy="70" r="3" fill="#f49ab0" opacity=".5"/>' +
    '<path class="kb-smile" d="M70,74 C73,78.5 79,78.5 82,74" stroke="#9a4a3a" stroke-width="1.9" fill="none" stroke-linecap="round"/>' +
    '<ellipse class="kb-oh" cx="76" cy="76" rx="2.8" ry="3.4" fill="#9a4a3a" opacity="0"/>' +
    '<g class="kb-arm"><path d="M62,96 L62,134" stroke="#f4f6f9" stroke-width="11" stroke-linecap="round"/><circle cx="62" cy="140" r="6.6" fill="#fff"/>' +
    '<g class="kb-hand-egg" opacity="0" transform="translate(62 146)">EGG</g></g>' +
    '</g>';
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
  function nextYear() { var n = new Date(); return String(n.getMonth() >= 6 ? n.getFullYear() + 1 : n.getFullYear()); }
  var SHOW = {
    newyear: {
      hat: 'party',
      open: function () {
        var L = sky();
        var big = document.createElement('div'); big.className = 'mo-big';
        big.innerHTML = '<span style="font-size:' + Math.max(14, Math.min(26, innerWidth * 0.02)) + 'px">Happy New Year</span><b style="font-size:' + Math.max(84, Math.min(190, innerWidth * 0.15)) + 'px">' + nextYear() + '</b>';
        L.appendChild(big);
        anim(big, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.04)', offset: 0.12 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: 0.8 }, { opacity: 0, transform: 'translate(-50%,-56%) scale(.98)' }], { duration: 4800, delay: 900, fill: 'both' });
        var t = Math.max(fireworks(L, ['#ffd76a', '#74bfeb', '#ffffff', '#ffe9a8'], 8), confetti(L, 70), 6000);
        done(L, t);
      },
      hover: function (b) { var L = sky(); done(L, Math.max(burst(L, b.cx, b.cy, function () { return confettiPiece(['#ffd76a', '#74bfeb', '#ffffff', '#e2a73b']); }, 26, { size: [7, 11], dist: [50, 140], up: true, fall: 90 }), firework(L, b.cx + rnd(80, 240), b.cy + rnd(90, 170), ['#ffd76a', '#74bfeb', '#ffffff']))); }
    },
    groundhog: {
      open: function () { groundhog('Happy Groundhog Day!'); },
      hover: function () { groundhog(); }
    },
    valentine: {
      open: function () {
        var L = sky(), r = balloons(L, 16);
        setTimeout(function () { var b = visibleLogo(); if (b) arrowInto(L, b); }, 4600);
        done(L, Math.max(r, 7600));
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
      costume: 'bunny',
      open: function () { eggStory(); },
      hover: function (b) { wiggleEars(); var L = sky(); done(L, burst(L, b.cx, b.cy, function (i) { return art('-10 -10 20 20', egg(i)); }, 12, { size: [16, 24], dist: [40, 110], up: true, fall: 70 })); }
    },
    july4: {
      hat: 'unclesam',
      open: function () { var L = sky(); done(L, fireworks(L, ['#e8483c', '#ffffff', '#3d6fd6', '#74bfeb'], 9)); },
      hover: function () { var L = sky(); done(L, fireworks(L, ['#e8483c', '#ffffff', '#3d6fd6'], 2)); }
    },
    halloween: {
      costume: 'pumpkin',
      open: function () { batNight(); },
      hover: function (b) { spider(b); }
    },
    thanksgiving: {
      costume: 'turkey',
      open: function () { var L = sky(); done(L, leafFall(L, 24)); },
      hover: function (b) { var L = sky(); bubble(L, 'Gobble gobble!', b.cx, b.top - 4, 1800); done(L, Math.max(2000, burst(L, b.cx, b.cy, function (i) { var e = art('-14 -14 28 28', fallLeaf(i)); return e; }, 10, { size: [22, 34], dist: [50, 130], fall: 140 }))); }
    }
  };
  var ghBusy = false;
  function groundhog(say) {
    if (ghBusy) return; ghBusy = true;
    var L = sky(), W = innerWidth, Hh = innerHeight, w = Math.max(130, Math.min(200, W * 0.13)), h = w * 122 / 120;
    var g = art('-10 0 120 122', GROUNDHOG); g.style.width = w + 'px'; g.style.height = h + 'px';
    var box = document.createElement('div'); box.className = 'mo-p'; box.style.width = w + 'px'; box.style.height = h + 'px'; box.appendChild(g); L.appendChild(box);
    var x = W - w - Math.max(24, W * 0.04), y = Hh - h + 2;
    box.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    anim(box, [{ opacity: 0 }, { opacity: 1, offset: 0.06 }, { opacity: 1, offset: 0.94 }, { opacity: 0 }], { duration: 5400, fill: 'forwards' });
    var body = g.querySelector('.mo-gh'), face = g.querySelector('.mo-face');
    anim(body, [{ transform: 'translateY(80px)' }, { transform: 'translateY(-4px)', offset: 0.12 }, { transform: 'translateY(0)', offset: 0.16 }, { transform: 'translateY(0)', offset: 0.82 }, { transform: 'translateY(-3px)', offset: 0.86 }, { transform: 'translateY(84px)' }], { duration: 5400, easing: 'ease-in-out', fill: 'forwards' });
    anim(face, [{ transform: 'translateX(0)' }, { transform: 'translateX(0)', offset: 0.22 }, { transform: 'translateX(-4px)', offset: 0.3 }, { transform: 'translateX(-4px)', offset: 0.42 }, { transform: 'translateX(4px)', offset: 0.5 }, { transform: 'translateX(4px)', offset: 0.62 }, { transform: 'translateX(0)', offset: 0.7 }, { transform: 'translateX(0)' }], { duration: 5400, fill: 'forwards' });
    if (say) setTimeout(function () { bubble(L, say, x + w * 0.4, y + h * 0.1, 2000); }, 2300);
    done(L, 5600); setTimeout(function () { box.remove(); ghBusy = false; }, 5600);
  }
  /* Pi Day: a warm pie rises at the bottom, and the digits of pi stream up out of it */
  var PI = '3.14159265358979323846264338327950288419716939937510';
  function digits(L, x, y, n, quick) {
    var cols = ['#0d314c', '#1a8fe3', '#c98d23', '#14486e'], longest = 0;
    for (var i = 0; i < n; i++) (function (i) {
      var d = document.createElement('span'); d.className = 'mo-digit'; d.textContent = PI.charAt(i % PI.length); d.style.color = cols[i % 4];
      d.style.fontSize = rnd(26, 42) + 'px'; d.style.textShadow = '0 0 10px #fff,0 0 3px #fff,0 0 1px #fff';
      L.appendChild(d);
      var dx = rnd(-90, 90), up = rnd(160, 300), dur = rnd(2200, 3200), delay = i * (quick ? 90 : 160);
      longest = Math.max(longest, dur + delay);
      anim(d, [{ transform: 'translate(' + x + 'px,' + y + 'px) scale(.4)', opacity: 0 }, { transform: 'translate(' + (x + dx * 0.3) + 'px,' + (y - up * 0.25) + 'px) scale(1)', opacity: 1, offset: 0.15 }, { transform: 'translate(' + (x + dx * 0.7) + 'px,' + (y - up * 0.7) + 'px) scale(1)', opacity: 1, offset: 0.7 }, { transform: 'translate(' + (x + dx) + 'px,' + (y - up) + 'px) scale(.9) rotate(' + rnd(-30, 30) + 'deg)', opacity: 0 }], { duration: dur, delay: delay, easing: 'ease-out', fill: 'both' });
    })(i);
    done(L, longest + 200);
  }
  /* Valentine's: shiny heart balloons on strings float up the page, swaying */
  function balloonHeart(c, d) {
    return '<defs><radialGradient id="I-bh" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".22" stop-color="' + c + '"/><stop offset="1" stop-color="' + d + '"/></radialGradient></defs>' +
      '<path d="M0,22 C0,30 -4,34 1.5,40 C6.5,45 -2.5,50 1,56" stroke="#b9a2ab" stroke-width=".9" fill="none"/>' +
      '<path d="M-1.8,23.6 L1.8,23.6 L0,20.4 Z" fill="' + d + '"/>' +
      '<path d="M0,21 C-21,7 -16,-12 -7.5,-13 C-3.4,-13.5 -1,-11 0,-8 C1,-11 3.4,-13.5 7.5,-13 C16,-12 21,7 0,21 Z" fill="url(#I-bh)"/>' +
      '<ellipse cx="-7.5" cy="-5" rx="2.8" ry="4.6" fill="#fff" opacity=".5" transform="rotate(-28 -7.5 -5)"/>';
  }
  function balloons(layer, n) {
    var W = innerWidth, Hh = innerHeight, longest = 0, cols = [['#ff4d6d', '#a8102f'], ['#ff8fab', '#cf4470'], ['#e8483c', '#8e1520'], ['#ffb3c6', '#d9688f'], ['#ff6b8b', '#b8173f']];
    for (var i = 0; i < n; i++) {
      var c = cols[i % cols.length], w = rnd(48, 96), h = w * 56 / 32, e = art('-16 -15 32 56', balloonHeart(c[0], c[1]));
      e.style.width = w + 'px'; e.style.height = h + 'px'; layer.appendChild(e);
      var x0 = W * (i + R()) / n - w / 2, dur = rnd(9000, 12500), delay = rnd(0, 2600), sway = rnd(14, 34), f1 = rnd(0.8, 1.6), ph = R() * 6, fr = [];
      for (var k = 0; k <= 20; k++) {
        var t = k / 20, y = Hh + 20 - (Hh + h + 60) * t, x = x0 + Math.sin(t * Math.PI * 2 * f1 + ph) * sway;
        fr.push({ transform: 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (Math.sin(t * Math.PI * 2 * f1 + ph + 1) * 7).toFixed(1) + 'deg)', opacity: t < 0.05 ? t / 0.05 : 1 });
      }
      anim(e, fr, { duration: dur, delay: delay, easing: 'linear', fill: 'both' });
      longest = Math.max(longest, dur + delay);
    }
    return longest + 200;
  }
  /* Valentine's: an arrow streaks in from the top right, trailing glitter, and lands in the O; hearts burst out */
  function arrowInto(L, b) {
    var W = innerWidth, sx = W + 60, sy = -40, tx = b.cx, ty = b.cy, dur = 900;
    var ang = Math.atan2(ty - sy, tx - sx) * 180 / Math.PI;
    var ar = art('-44 -9 52 18', '<path d="M-40,0 L4,0" stroke="#8a5a32" stroke-width="2.8" stroke-linecap="round"/><path d="M-40,0 l-4,-5 M-36,0 l-4,-5 M-40,0 l-4,5 M-36,0 l-4,5" stroke="#e8483c" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path transform="translate(5 0) rotate(-90) scale(.62)" d="' + heartP + '" fill="#e8483c"/>');
    ar.style.width = '88px'; ar.style.height = '30px'; L.appendChild(ar);
    var pos = function (u) { return { x: sx + (tx - sx) * u, y: sy + (ty - sy) * u }; };
    anim(ar, [{ transform: 'translate(' + (sx - 80) + 'px,' + (sy - 15) + 'px) rotate(' + ang + 'deg)', opacity: 1 }, { transform: 'translate(' + (tx - 80) + 'px,' + (ty - 15) + 'px) rotate(' + ang + 'deg)', opacity: 1, offset: 0.5 },
      { transform: 'translate(' + (tx - 80) + 'px,' + (ty - 15) + 'px) rotate(' + (ang + 4) + 'deg)', offset: 0.56 }, { transform: 'translate(' + (tx - 80) + 'px,' + (ty - 15) + 'px) rotate(' + (ang - 3) + 'deg)', offset: 0.62 },
      { transform: 'translate(' + (tx - 80) + 'px,' + (ty - 15) + 'px) rotate(' + ang + 'deg)', opacity: 1, offset: 0.85 }, { transform: 'translate(' + (tx - 80) + 'px,' + (ty - 15) + 'px) rotate(' + ang + 'deg)', opacity: 0 }],
      { duration: dur * 2, easing: 'linear', fill: 'forwards' });
    ar.style.transformOrigin = '80px 15px';
    var t0 = performance.now(), glitter = setInterval(function () {
      var u = (performance.now() - t0) / dur; if (u >= 1) { clearInterval(glitter); return; }
      var p = pos(u), g = piece(R() < 0.5 ? 'mo-star' : 'mo-dot', pick(['#ff6b8b', '#ffc2d1', '#ffffff', '#ffd76a'])), s = rnd(6, 12);
      g.style.width = g.style.height = s + 'px'; L.appendChild(g);
      anim(g, [{ transform: 'translate(' + (p.x - s / 2) + 'px,' + (p.y - s / 2) + 'px) scale(1)', opacity: 1 }, { transform: 'translate(' + (p.x - s / 2 + rnd(-10, 10)) + 'px,' + (p.y - s / 2 + rnd(10, 30)) + 'px) scale(.2)', opacity: 0 }], { duration: 700, fill: 'forwards' });
      setTimeout(function () { g.remove(); }, 720);
    }, 30);
    setTimeout(function () { burst(L, tx, ty, function (i) { return art('-12 -12 24 24', heart(['#e8483c', '#f49ab0', '#ff6b8b', '#ffffff'][i % 4])); }, 20, { size: [14, 28], dist: [50, 140] }); }, dur);
    setTimeout(function () { ar.remove(); }, dur * 2 + 50);
  }
  /* Pi Day: a warm lattice cherry pie is set down at the bottom with a little bounce and a twinkle, and the digits of pi stream up out of it */
  function pie() {
    var L = sky(), W = innerWidth, Hh = innerHeight, w = Math.max(190, Math.min(300, W * 0.2)), h = w * 100 / 160;
    var p = art('0 0 160 100', PIE); p.style.width = w + 'px'; p.style.height = h + 'px'; L.appendChild(p);
    var x = W / 2 - w / 2, y = Hh - h - 14;
    var tr = function (dy, sx, sy) { return 'translate(' + x + 'px,' + (y + dy) + 'px) scale(' + sx + ',' + sy + ')'; };
    p.style.transformOrigin = '50% 92%';
    anim(p, [{ transform: tr(-46, 1, 1), opacity: 0 }, { transform: tr(-8, 1, 1), opacity: 1, offset: 0.06, easing: 'ease-in' }, { transform: tr(0, 1.05, 0.93), offset: 0.08 },
      { transform: tr(0, 0.985, 1.02), offset: 0.1 }, { transform: tr(0, 1, 1), opacity: 1, offset: 0.12 }, { transform: tr(0, 1, 1), opacity: 1, offset: 0.88 }, { transform: tr(6, 0.96, 0.96), opacity: 0 }], { duration: 7600, easing: 'ease-out', fill: 'forwards' });
    setTimeout(function () { burst(L, W / 2, y + h * 0.55, function (i) { return piece(i % 2 ? 'mo-star' : 'mo-dot', pick(['#ffd76a', '#ffffff', '#ffe9a8'])); }, 12, { size: [6, 12], dist: [30, 90], up: true, fall: 20 }); }, 620);
    setTimeout(function () { digits(L, W / 2 - 8, y + h * 0.25, 34); bubble(L, 'Happy Pi Day!', W / 2, y - 8, 2400); }, 1100);
    done(L, 7800);
  }
  /* Easter: the O's bunny ears give a wiggle */
  function wiggleEars() {
    hats.forEach(function (h) { var e = h.el.querySelector('.mo-ears'); if (e) anim(e, [{ transform: 'rotate(0)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' }], { duration: 800 }); });
  }
  /* a tiny timeline: tracks of [ms, value] eased between, applied every frame */
  function play(tracks, total, apply, end) {
    var t0 = performance.now();
    var val = function (tr, t) {
      if (t <= tr[0][0]) return tr[0][1];
      for (var i = 1; i < tr.length; i++) if (t <= tr[i][0]) { var a = tr[i - 1], c = tr[i], u = (t - a[0]) / Math.max(1, c[0] - a[0]); u = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; return a[1] + (c[1] - a[1]) * u; }
      return tr[tr.length - 1][1];
    };
    (function f(n) { var t = n - t0, v = {}; for (var k in tracks) v[k] = val(tracks[k], t); apply(v); if (t < total) requestAnimationFrame(f); else if (end) end(); })(t0);
  }
  /* Easter: someone in a bunny costume hops in, with a basket on their back that has no bottom. Spots an egg and is
     thrilled, picks it up and tosses it over the shoulder into the basket; it drops straight out the bottom, behind
     them. Pleased, they turn around... a new egg! Surprised every time. Three times, then poof. */
  function eggStory() {
    var L = sky(), W = innerWidth, Hh = innerHeight, hp = Math.max(150, Math.min(230, Hh * 0.27)), s = hp / 200, ground = Hh - 8, k = Math.floor(R() * EGGS.length);
    var X0 = W * 0.5 - 70 * s, start = -170 * s;
    var kid = art('0 -30 140 230', KID.replace('EGG', egg(k)));
    kid.style.width = (140 * s) + 'px'; kid.style.height = (230 * s) + 'px'; kid.style.transformOrigin = '50% 99%';
    var eggEl = art('-10 -10 20 20', egg(k)); eggEl.style.width = (20 * s) + 'px'; eggEl.style.height = (20 * s) + 'px';
    L.appendChild(eggEl); L.appendChild(kid);
    var torso = kid.querySelector('.kb-torso'), arm = kid.querySelector('.kb-arm'), ears = kid.querySelector('.kb-ears'), handEgg = kid.querySelector('.kb-hand-egg'), oh = kid.querySelector('.kb-oh'), smile = kid.querySelector('.kb-smile');
    /* drawing spots to page pixels; dir 1 faces right, -1 faces left (the drawing flips about its middle, x 70) */
    var px = function (xd, dir) { return X0 + (70 + dir * (xd - 70)) * s; }, py = function (yd) { return ground - (198 - yd) * s; };
    var FRONT = 120, BACK = 20, EGGY = 189;
    var at = function (x, y) { return 'translate(' + (x - 10 * s) + 'px,' + (y - 10 * s) + 'px)'; };
    eggEl.style.transform = at(px(FRONT, 1), py(EGGY));
    var T = { x: [[0, start]], y: [[0, 0]], torso: [[0, 0]], arm: [[0, 0]], ears: [[0, 0]], dir: [[0, 1]], sq: [[0, 1]] };
    var key = function (tr, t, v) { T[tr].push([t, v]); }, ev = [];
    /* hop in: crouch, spring up and stretch, sail, land with a squash */
    var hops = 5;
    for (var i = 0; i < hops; i++) {
      var ta = 150 + i * 520;
      key('x', ta, start + (X0 - start) * i / hops); key('x', ta + 340, start + (X0 - start) * (i + 1) / hops);
      key('y', ta, 0); key('y', ta + 170, -34); key('y', ta + 340, 0);
      key('sq', ta, 0.92); key('sq', ta + 90, 1.07); key('sq', ta + 250, 1.02); key('sq', ta + 340, 0.88); key('sq', ta + 460, 1);
      key('ears', ta + 90, -14); key('ears', ta + 340, 7); key('ears', ta + 460, 0);
    }
    var t = 150 + hops * 520 + 150, dir = 1;
    /* sees the egg: thrilled, two little jumps, ears wiggle */
    ev.push([t, function () { bubble(L, 'Ooh, an egg!', px(66, 1), ground - 228 * s, 1500); }]);
    key('y', t + 160, -14); key('y', t + 320, 0); key('y', t + 480, -14); key('y', t + 640, 0);
    key('ears', t + 160, -10); key('ears', t + 320, 8); key('ears', t + 480, -8); key('ears', t + 640, 0);
    t += 900;
    var lines = ['Another egg!', 'Another one?!', 'So many eggs!'];
    for (var c = 0; c < 3; c++) (function (c, t, d) {
      /* bend down and pick it up */
      key('torso', t, 0); key('arm', t, 0); key('y', t, 0);
      key('torso', t + 600, 80); key('arm', t + 600, -100); key('y', t + 600, 5);
      ev.push([t + 600, function () { eggEl.style.opacity = '0'; handEgg.setAttribute('opacity', '1'); }]);
      /* stand up holding it, then toss it back over the shoulder into the basket */
      key('torso', t + 1150, 0); key('arm', t + 1150, -40); key('y', t + 1150, 0);
      key('arm', t + 1650, 105);
      ev.push([t + 1650, function () {
        handEgg.setAttribute('opacity', '0'); eggEl.style.opacity = '1';
        var hx = px(13.7, d), hy = py(83), bx = px(BACK, d);
        anim(eggEl, [{ transform: at(hx, hy) }, { transform: at(bx, py(124)), offset: 0.35 }, { transform: at(bx, py(EGGY)), offset: 0.72, easing: 'ease-out' },
          { transform: at(bx, py(EGGY - 9)), offset: 0.86, easing: 'ease-in' }, { transform: at(bx, py(EGGY)) }], { duration: 720, easing: 'ease-in', fill: 'forwards' });
      }]);
      key('arm', t + 2100, 0);
      /* pleased with that, a little bounce, without noticing */
      ev.push([t + 2150, function () { bubble(L, 'Got it!', px(66, d), ground - 228 * s, 900); }]);
      key('y', t + 2100, 0); key('y', t + 2250, -8); key('y', t + 2400, 0);
      /* turns around... and there's an egg! */
      key('dir', t + 2750, d); key('dir', t + 3100, -d);
      ev.push([t + 3150, function () { oh.setAttribute('opacity', '1'); smile.setAttribute('opacity', '0'); bubble(L, lines[c], px(66, -d), ground - 228 * s, 1300); }]);
      ev.push([t + 4050, function () { oh.setAttribute('opacity', '0'); smile.setAttribute('opacity', '1'); }]);
      key('y', t + 3150, 0); key('y', t + 3300, -18); key('y', t + 3480, 0);
      key('ears', t + 3150, 0); key('ears', t + 3300, -12); key('ears', t + 3480, 6); key('ears', t + 3650, 0);
    })(c, t + c * 4200, c % 2 ? -1 : 1);
    t += 3 * 4200;
    /* poof */
    ev.push([t, function () {
      burst(L, X0 + 70 * s, ground - 110 * s, function (i) { return piece(i % 3 ? 'mo-dot' : 'mo-star', pick(['#f7b6c8', '#bfe3f7', '#fff0a8', '#c9f2d2', '#dccbf5', '#ffffff'])); }, 26, { size: [10, 22], dist: [40, 130], fall: 30 });
      anim(kid, [{ opacity: 1 }, { opacity: 0 }], { duration: 380, fill: 'forwards' });
      anim(eggEl, [{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: 2600, fill: 'forwards' });
    }]);
    ev.forEach(function (e) { setTimeout(e[1], e[0]); });
    play(T, t, function (v) {
      var sx = v.dir * (1 + (1 - v.sq) * 0.8);
      kid.style.transform = 'translate(' + v.x + 'px,' + (ground - 228 * s + v.y * s) + 'px) scale(' + sx.toFixed(3) + ',' + v.sq.toFixed(3) + ')';
      torso.setAttribute('transform', 'rotate(' + v.torso.toFixed(2) + ' 60 140)');
      arm.setAttribute('transform', 'rotate(' + v.arm.toFixed(2) + ' 62 96)');
      ears.setAttribute('transform', 'rotate(' + v.ears.toFixed(2) + ' 66 40)');
    });
    done(L, t + 2800);
  }
  /* Halloween: a big moon rises in the top right, and bats come flapping out of it toward you, across the page */
  function batNight() {
    var L = sky(), W = innerWidth, Hh = innerHeight, longest = 0;
    var ms = Math.max(170, Math.min(300, W * 0.19)), moon = art('0 0 100 100', '<defs><radialGradient id="I-m" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fffbe6"/><stop offset=".7" stop-color="#ffe7a0"/><stop offset="1" stop-color="#f2c457"/></radialGradient><radialGradient id="I-mg"><stop offset=".55" stop-color="#ffe7a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffe7a0" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#I-mg)"/><circle cx="50" cy="50" r="30" fill="url(#I-m)"/><g fill="#e3b54a" opacity=".45"><circle cx="40" cy="42" r="5"/><circle cx="58" cy="58" r="7"/><circle cx="60" cy="38" r="3"/><circle cx="44" cy="62" r="3.4"/></g>');
    moon.style.width = moon.style.height = ms + 'px'; L.appendChild(moon);
    var mx = W - ms * 0.82, my = -ms * 0.12, mcx = mx + ms / 2, mcy = my + ms / 2;
    anim(moon, [{ transform: 'translate(' + mx + 'px,' + (my + 40) + 'px)', opacity: 0 }, { transform: 'translate(' + mx + 'px,' + my + 'px)', opacity: 1, offset: 0.14 }, { transform: 'translate(' + mx + 'px,' + my + 'px)', opacity: 1, offset: 0.86 }, { transform: 'translate(' + mx + 'px,' + (my - 10) + 'px)', opacity: 0 }], { duration: 9800, fill: 'both' });
    for (var i = 0; i < 8; i++) (function (i) {
      var w = rnd(60, 95), dur = rnd(5200, 7600), delay = 900 + i * 520 + rnd(0, 260), ex = rnd(-0.15, 0.25) * W - w, ey = Hh * rnd(0.15, 0.75), wob = rnd(16, 40), f1 = rnd(2.5, 4.5), ph = R() * 6, fr = [];
      longest = Math.max(longest, dur + delay);
      var b = art('-30 -18 60 36', bat(rnd(0.24, 0.34).toFixed(2))); b.style.width = w + 'px'; b.style.height = (w * 0.6) + 'px';
      for (var k = 0; k <= 30; k++) {
        var t = k / 30, e = t * t * (3 - 2 * t), x = mcx + (ex - mcx) * e, y = mcy + (ey - mcy) * e + Math.sin(t * Math.PI * f1 + ph) * wob * t, sc = 0.25 + 0.95 * t;
        fr.push({ transform: 'translate(' + (x - w / 2) + 'px,' + (y - w * 0.3) + 'px) scale(' + sc.toFixed(2) + ') rotate(' + (Math.sin(t * Math.PI * f1 + ph) * 10).toFixed(1) + 'deg)', opacity: t < 0.08 ? t / 0.08 : 1 });
      }
      setTimeout(function () { L.appendChild(b); anim(b, fr, { duration: dur, easing: 'linear', fill: 'forwards' }); setTimeout(function () { b.remove(); }, dur + 50); }, delay);
    })(i);
    done(L, Math.max(longest + 400, 10000));
  }
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
    var hatSpec = spec.costume ? { costume: spec.costume } : spec.hat ? HATS[spec.hat] : null, tries = 0;
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
