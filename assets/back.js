/* MISMO Back — the browser's Back and Forward buttons for every app on resources.mismo.org.
   ----------------------------------------------------------------------------------------
   One shared copy, loaded by each app with one line in <head> (right after session.js):

     <script src="/assets/back.js"></script>

   What it does, with nothing else to set up:
   - Moving to another page of the app from its left menu (nav button[data-hq]) is a step
     in the browser's history, so Back returns to the page you were on and Forward goes
     again. It follows whichever menu button carries aria-current, so tiles, search results
     and links that change the page count too.
   - Only what a person does makes a step. Pages an app changes on its own while it loads
     or redraws do not, so Back never lands somewhere you weren't.
   - The address bar does not change, and opening the app fresh still lands where the app
     always opens.

   Right-hand panels, pop-ups and drawers: an app tells this file about each one, and Back
   then closes the open one before it changes page. Register them bottom layer first:

     window.MismoBack && MismoBack.layer({
       isOpen: () => document.body.classList.contains('paneon'),
       close:  () => myPanel.userClose()       // the same close the X button uses
     });

   close() should do exactly what the panel's own X or Escape does (including asking about
   unsaved changes). If the panel is still open afterwards, nothing is lost: the step comes
   back, and once it does close the history catches up.

   MismoBack.check() can be called after an app changes page or opens a panel some other way.
   Owner: Forms and shared pages (GitMISMO.github.io). Change notices: GitMISMO/mismo-connections. */
(function () {
  'use strict';
  if (window.MismoBack) return;

  var NAV = 'nav button[data-hq]';
  var layers = [];
  var last = null;          /* the state the history entry we're on stands for */
  var ready = false;
  var restoring = 0;        /* while Back/Forward is putting the page back */
  var ignore = 0;           /* popstates this file caused itself */
  var touched = 0;          /* when the person last clicked, tapped or pressed a key */
  var timer = null;

  function section() {
    var b = document.querySelector(NAV + '[aria-current]');
    return b ? b.getAttribute('data-hq') : '';
  }
  function opened() {
    var n = 0;
    for (var i = 0; i < layers.length; i++) { try { if (layers[i].isOpen()) n++; } catch (e) {} }
    return n;
  }
  function now(pushed) { return { mismoBack: 1, s: section(), n: opened(), p: pushed ? 1 : 0 }; }
  function same(a, b) { return !!a && !!b && a.s === b.s && a.n === b.n; }
  function ours(st) { return !!st && st.mismoBack === 1; }
  function put(st, push) {
    try { push ? history.pushState(st, '') : history.replaceState(st, ''); } catch (e) {}
    last = st;
  }

  function check() {
    timer = null;
    if (!ready || restoring) return;
    var st = now(true);
    if (same(st, last)) return;
    var cur = history.state;
    /* A panel was closed the ordinary way (its X, Escape, a click outside): step back over
       the entry its opening made, so Back doesn't stop on a panel that's already shut. */
    if (last && st.s === last.s && st.n < last.n && ours(cur) && cur.p && cur.n > st.n) {
      ignore++; last = st;
      try { history.back(); } catch (e) { ignore--; }
      return;
    }
    /* A step only for what the person did; the app's own changes just update the entry. */
    var byPerson = Date.now() - touched < 2500;
    if (byPerson && st.s) put(st, true);
    else put({ mismoBack: 1, s: st.s, n: st.n, p: ours(cur) ? cur.p : 0 }, false);
  }
  function soon() { if (timer) clearTimeout(timer); timer = setTimeout(check, 90); }

  function closeTop() {
    for (var i = layers.length - 1; i >= 0; i--) {
      var l = layers[i];
      try { if (l.isOpen()) { l.close(); return; } } catch (e) {}
    }
  }
  function goTo(s) {
    if (!s || s === section()) return;
    var bs = document.querySelectorAll(NAV);
    for (var i = 0; i < bs.length; i++) {
      if (bs[i].getAttribute('data-hq') === s && !bs[i].disabled && bs[i].offsetParent !== null) { bs[i].click(); return; }
    }
    for (i = 0; i < bs.length; i++) { if (bs[i].getAttribute('data-hq') === s) { bs[i].click(); return; } }
  }

  /* Apps sometimes tidy the address with history.replaceState(null, '', url). Keep this file's
     note on the entry when they do, so Back still knows what that entry was. */
  try {
    var rs = history.replaceState;
    history.replaceState = function (st, title, url) {
      if (st == null && last) st = last;
      return rs.call(history, st, title, url);
    };
  } catch (e) {}

  window.addEventListener('popstate', function (e) {
    if (ignore) { ignore--; return; }
    var t = e.state;
    if (!ours(t) || !ready) return;
    restoring++;
    var tries = 0;
    (function step() {
      if (opened() > t.n && tries++ < 6) { closeTop(); setTimeout(step, 80); return; }
      var stuck = opened() > t.n;               /* e.g. it asked about unsaved changes */
      if (!stuck) goTo(t.s);
      setTimeout(function () {
        restoring--;
        var a = now(true);
        if (stuck) { put(a, true); return; }  /* stay on this step; it catches up when it closes */
        put({ mismoBack: 1, s: a.s, n: a.n, p: t.p }, false);
      }, 140);
    })();
  });

  ['pointerdown', 'keydown', 'click'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (e.isTrusted !== false) touched = Date.now();
      if (ev !== 'pointerdown') soon();
    }, true);
  });

  function watch() {
    try {
      new MutationObserver(soon).observe(document.documentElement,
        { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
      new MutationObserver(soon).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
  }
  function start() {
    watch();
    /* wait until the app has drawn its menu and settled on its opening page */
    var waited = 0;
    (function wait() {
      if (!section() && waited < 30000) { waited += 250; setTimeout(wait, 250); return; }
      setTimeout(function () {
        ready = true;
        var cur = history.state;
        put({ mismoBack: 1, s: section(), n: opened(), p: ours(cur) ? cur.p : 0 }, false);
      }, 400);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.MismoBack = {
    layer: function (l) { if (l && typeof l.isOpen === 'function' && typeof l.close === 'function') layers.push(l); soon(); },
    check: soon,
    version: '2026-11-25'
  };
})();
