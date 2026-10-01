/* ============================================================================
   MISMO Resources — shared sign-in
   ----------------------------------------------------------------------------
   One file, loaded by every tool on resources.mismo.org:

       <script src="/assets/session.js"></script>
       <div id="rs-account"></div>          (where the indicator should appear)

   Every tool is served from the same origin, so a session stored here is visible
   to all of them. That is what makes one sign-in carry across tools: sign in on
   the Hub and the Glossary already knows who you are.

   What it stores, in localStorage under 'resources:session':
       { token, name, email, access: {hub:'admin', ...}, platformAdmin, expiresAt }
   localStorage rather than sessionStorage because sessionStorage is private to
   one tab, and a sign-in that did not follow you into a new tab would not feel
   like one sign-in. The token expires after four hours regardless, and signing
   out removes it everywhere at once.

   The token proves who someone is. It is not what decides what they may do: the
   relay looks that up afresh on every request. The access map kept here is only
   for showing the right controls — a stale one can show a button the relay will
   then refuse, never the other way round.

   Public API — window.ResourcesSession:
       current()            the session, or null
       token()              the bearer token, or null
       refreshAccess(list)  ask the relay about several tools; correct the saved copy
       requireAccess(p,o)   gate a page: resolves with the role, or shows the refusal.
                            o.toolName names it on screen ("the Sponsorship Portal");
                            o.gated (default true) sends Cancel/Close back to the home
                            page, since a gated page has nothing to show without it.
                            A gated screen covers the WHOLE page (layout C, Sept 2026):
                            navy panel with the logo and the tool's name, the sign-in on
                            the right, nothing of the tool visible behind it.
                            o.title / o.eyebrow: the panel's heading and the small line
                            above it (default: the tool name, and the page's masthead
                            eyebrow). <html data-rs-gate> on a page hides it until
                            requireAccess has decided, so nothing flashes first.
       role(project)        'admin' | 'staff' | 'view' | null for this person
       canEdit(project)     true if they may save changes there (admin or staff)
       isAdmin()            admin on any tool
       isPlatformAdmin()    may edit who has access, across every tool
       signIn(opts)         opens the sign-in screen; resolves with the session
                            opts.reason: 'expired' | 'no-access' | undefined
       signOut()
       onChange(fn)         called whenever the session starts, ends or changes
       mount(el)            renders the account indicator into el
   ========================================================================== */
(function () {
  'use strict';
  if (window.ResourcesSession) return;           // loaded twice: keep the first

  var RELAY_URL = 'https://rgvdi67cg27o5kcmiytcqbqnrm0hmztx.lambda-url.us-east-1.on.aws';
  var LOGIN_PROJECT = 'hub';                     // sign-in is global; any project path works
  /* Where "Ask for access" writes to. A person who has been refused cannot be shown the
     administrator list — they cannot read it — so the address is named here instead. */
  var ACCESS_CONTACT = 'info@mismo.org';
  var KEY = 'resources:session';

  /* Every tool the menu lists. A tool someone cannot use is still shown, as "No
     access", so a read-only page has an explanation rather than looking broken. */
  /* Only tools registered in _internal/projects.json belong here. A tool listed before
     the relay knows it shows a permission that governs nothing. Files (hub-files) is
     left out on purpose: it is storage behind the Hub, not somewhere you go. */
  /* Every tool with its own access. The real list is /assets/tools.json, which the admin
     panel's People & Access reads too, so a tool added there appears in both (Perry, 1 Oct
     2026). This copy is only the fallback for a page that can't read that file. */
  var TOOLS = [
    { key: "hub", name: "Initiative Hub", path: "/initiative-hub/", group: "Standards" },
    { key: "glossary", name: "Business Glossary Console", path: "/glossary/console/", group: "Standards" },
    { key: "hub-requests", name: "Work Requests", path: "/initiative-hub/work-requests.html", group: "Standards" },
    { key: "summit-hq", name: "Summit HQ", path: "/summit-hq/", group: "Events" },
    { key: "sponsorship", name: "Sponsorship Portal", path: "/sponsorship/", group: "Sponsorship" },
    { key: "website-migration", name: "Website Migration HQ", path: "/website-migration/", group: "Website" },
    { key: "qr", name: "QR Code Manager", path: "/QR/", group: "QR Codes" },
    { key: "so-phoenix", name: "Phoenix Oversight Group LLC", path: "/service-orders/", group: "Service Orders and Agreements" },
    { key: "so-actualize", name: "Actualize Consulting LLC", path: "/service-orders/", group: "Service Orders and Agreements" },
    { key: "so-trex", name: "Tidgewell Results eXperience LLC", path: "/service-orders/", group: "Service Orders and Agreements" },
    { key: "so-falcon", name: "Falcon Capital Advisors LLC", path: "/service-orders/", group: "Service Orders and Agreements" },
    { key: "so-trudigital", name: "TruDigital Mortgage Solutions LLC", path: "/service-orders/", group: "Service Orders and Agreements" }
  ];
  function useToolList(list) {
    var ok = (list || []).filter(function (t) { return t && /^[a-z0-9-]{1,40}$/.test(t.key) && t.label && t.group; });
    if (!ok.length) return;
    TOOLS = ok.map(function (t) { return { key: t.key, name: t.menu || t.label, path: t.path || '', group: t.group }; });
    renderAll();
  }
  try {
    fetch('/assets/tools.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.tools) useToolList(j.tools); }, function () {});
  } catch (e) {}

  /* The MISMO wordmark, for the whole-page sign-in. Inline so the screen draws at once. */
  var LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 708 108" role="img" aria-label="MISMO"><g transform="translate(0.000000,108.000000) scale(0.100000,-0.100000)" fill="#0f314c"><path d="M5917 1065 c-169 -46 -279 -153 -335 -323 -21 -65 -25 -96 -25 -197 0 -101 4 -132 25 -197 57 -172 168 -280 335 -323 84 -22 723 -22 808 0 222 58 355 253 355 520 0 270 -132 459 -361 520 -74 20 -730 20 -802 0z m692 -320 c57 -33 76 -84 76 -200 0 -116 -19 -167 -76 -200 -32 -19 -52 -20 -294 -20 -297 0 -307 2 -346 83 -30 61 -31 198 -2 262 41 93 68 100 368 97 219 -2 243 -4 274 -22z M0 545 l0 -515 225 0 225 0 2 296 3 296 116 -294 116 -293 197 0 198 0 119 295 118 295 1 -297 0 -298 225 0 225 0 0 515 0 515 -337 -2 -338 -3 -104 -264 c-80 -204 -107 -260 -113 -245 -5 10 -52 129 -106 264 l-98 245 -337 3 -337 2 0 -515z M1892 1044 l-22 -15 0 -483 c0 -455 1 -484 18 -499 16 -15 48 -17 246 -17 128 0 235 4 246 10 32 17 34 57 4 95 -33 44 -64 143 -64 206 l0 49 203 0 c191 0 205 -1 222 -20 10 -11 34 -24 54 -30 49 -13 586 -13 612 0 22 12 26 62 7 78 -8 6 -174 15 -413 21 -502 15 -549 23 -628 110 -43 48 -57 93 -57 187 0 82 19 156 55 208 30 44 32 77 7 99 -27 25 -456 25 -490 1z M3716 1044 c-23 -22 -20 -31 19 -77 43 -49 78 -155 73 -218 l-3 -44 -204 -3 c-194 -2 -205 -1 -218 17 -24 35 -78 41 -355 41 -255 0 -269 -1 -288 -20 -27 -27 -26 -58 3 -70 12 -5 202 -14 422 -19 421 -12 476 -18 555 -62 92 -51 132 -159 111 -299 -12 -77 -34 -129 -77 -179 -23 -28 -25 -36 -16 -57 l12 -24 215 0 215 0 2 306 3 306 120 -303 120 -304 197 -3 196 -2 118 296 119 297 3 -296 2 -297 225 0 225 0 0 515 0 515 -338 0 -337 0 -104 -265 c-58 -146 -106 -263 -108 -261 -2 2 -50 120 -107 262 l-104 259 -340 3 c-300 2 -342 0 -356 -14z"/></g><g transform="translate(0.000000,108.000000) scale(0.100000,-0.100000)" fill="#50a4db"><path d="M2485 1046 c-44 -20 -111 -94 -136 -151 -27 -60 -37 -198 -20 -263 13 -48 68 -115 114 -138 64 -34 162 -43 562 -55 239 -6 405 -15 413 -21 19 -16 15 -66 -7 -78 -26 -13 -563 -13 -612 0 -20 6 -44 19 -54 30 -17 19 -31 20 -222 20 l-203 0 0 -49 c0 -81 34 -172 86 -230 78 -87 31 -81 672 -81 l568 0 46 29 c79 50 122 121 139 231 21 140 -19 248 -111 299 -79 44 -134 50 -555 62 -220 5 -410 14 -422 19 -29 12 -30 43 -3 70 19 19 33 20 288 20 277 0 331 -6 355 -41 13 -18 24 -19 218 -17 l204 3 3 44 c4 60 -31 168 -70 215 -17 21 -52 52 -77 67 l-45 29 -550 0 c-440 -1 -557 -3 -581 -14z"/></g></svg>';

  /* A page that shows nothing without access marks itself <html data-rs-gate>; it is
     kept hidden until requireAccess has decided, so the tool never flashes before the
     sign-in or the refusal covers it. The timer is only a backstop for a page that
     forgets to call requireAccess: the whole-page screen is opaque anyway. */
  var root = document.documentElement;
  if (root.hasAttribute('data-rs-gate')) {
    root.classList.add('rs-wait');
    setTimeout(function () { root.classList.remove('rs-wait'); }, 8000);
  }
  function unwait() { root.classList.remove('rs-wait'); }

  var listeners = [];
  var expiryTimer = null;

  /* ---------- storage ---------- */
  /* Who was signed in on this page most recently, kept in memory only. An expired session
     is deleted from storage the moment it is read, and without this the "Your session
     expired while you were working" window opened with an empty email field, asking the
     person to type who they are to finish a save they had just started. */
  var lastKnown = null;
  function read() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!s || !s.token || !s.expiresAt) return null;
      lastKnown = { name: s.name, email: s.email };
      if (Date.parse(s.expiresAt) <= Date.now()) { localStorage.removeItem(KEY); return null; }
      return s;
    } catch (e) { return null; }
  }
  function write(s) {
    try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch (e) {}
    changed();
  }
  function changed() {
    scheduleExpiry();
    var s = read();
    listeners.forEach(function (fn) { try { fn(s); } catch (e) {} });
    renderAll();
  }
  /* Signing in or out in another tab updates this one too. */
  window.addEventListener('storage', function (e) { if (e.key === KEY) changed(); });

  function scheduleExpiry() {
    if (expiryTimer) clearTimeout(expiryTimer);
    var s = read();
    if (!s) return;
    var ms = Date.parse(s.expiresAt) - Date.now();
    if (ms > 0 && ms < 2147483647) expiryTimer = setTimeout(function () { write(null); }, ms + 500);
  }

  function currentTool() {
    var t = currentEntry(); return t ? t.key : null;
  }
  function currentEntry() {
    var p = location.pathname.toLowerCase(), best = null;   // /QR/ and /qr/ are the same page
    for (var i = 0; i < TOOLS.length; i++) {
      var tp = String(TOOLS[i].path || '').toLowerCase();
      if (tp && p.indexOf(tp) === 0 && (!best || tp.length > best.path.length)) best = TOOLS[i];
    }
    return best;
  }

  /* ---------- what does the relay say this person may do on this tool? ----------
     'edit', 'view', 'no', 'signed-out' or 'unknown'. It attempts a save to a reserved
     name on the tool's /data/ route, and the relay turns it away before anything is
     read or written: no access is refused at sign-in, View is refused by the view-only
     guard, and Edit gets past both and is refused for the name. So one request gives the
     person's CURRENT level, whatever the browser's copy says. Admin cannot be told from
     staff this way; both are Edit, and 'staff' is recorded until the next sign-in.
     The relay's tests pin all of this ("the access check session.js relies on"). If they
     ever fail, this needs a proper route instead. */
  function checkAccess(project) {
    var s = read();
    if (!s || !s.token) return Promise.resolve('signed-out');
    return fetch(RELAY_URL + '/' + encodeURIComponent(project) + '/data/facilitators', {
      method: 'PUT', cache: 'no-store', headers: { 'Authorization': 'Bearer ' + s.token }
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) {
        if (r.status === 400 && b.error === 'BAD_ID') return 'edit';
        if (r.status === 403 && b.error === 'VIEW_ONLY') return 'view';
        if (r.status === 403 && b.error === 'NO_ACCESS') return 'no';
        if (r.status === 401) return 'signed-out';
        return 'unknown';
      });
    }, function () { return 'unknown'; });
  }

  /* ---------- API ---------- */
  var api = {
    current: function () { return read(); },
    token: function () { var s = read(); return s ? s.token : null; },
    /* Three levels, and anything unrecognised is null. Falling back to null rather
       than to the lowest level matters: a role this file does not know about must
       show as no access, so a page cannot offer something the relay will refuse. */
    role: function (project) {
      var s = read(); if (!s || !s.access) return null;
      var r = s.access[project];
      if (r === 'facilitator') return 'staff';              // renamed Sept 2026
      return r === 'admin' || r === 'staff' || r === 'view' ? r : null;
    },
    /* The one question a page actually asks: may this person save? Asking it here
       rather than comparing role strings in each tool means adding a level later
       changes one line. It decides what to SHOW; the relay decides what happens. */
    canEdit: function (project) {
      var r = api.role(project);
      return r === 'admin' || r === 'staff';
    },
    isAdmin: function () {
      var s = read(); if (!s || !s.access) return false;
      return Object.keys(s.access).some(function (k) { return s.access[k] === 'admin'; });
    },
    /* Editing who has access is its own permission, not "admin of something", so it
       comes from the session rather than being inferred from the access map. */
    isPlatformAdmin: function () {
      var s = read(); return !!(s && s.platformAdmin === true);
    },
    signIn: function (opts) { return openModal(opts || {}); },
    /* What a gated page calls once, at the top. Resolves with the role once the person
       holds one, having shown the sign-in screen or the refusal along the way.
       It gates what the page OFFERS. It is not the gate: every file this page fetches
       comes back through the relay, which checks the same thing server-side on every
       request. A page that only hid its controls would still be handing out its data. */
    requireAccess: function (project, opts) {
      opts = opts || {};
      var shown = { toolName: opts.toolName, title: opts.title, eyebrow: opts.eyebrow, project: project, gated: opts.gated !== false };
      function again() { return api.requireAccess(project, opts); }

      if (!read()) return openModal(shown).then(again);
      var r = api.role(project);
      if (r) { unwait(); return Promise.resolve(r); }

      /* The access list in the browser is a copy taken at sign-in. Someone granted this
         tool since then would be refused by it while the relay would let them in, so the
         relay is asked before anyone is turned away. If it says yes, the copy is corrected
         on the spot and the page opens: no second sign-in for a grant made since. */
      return checkAccess(project).then(function (answer) {
        if (answer === 'edit' || answer === 'view') {
          var cur = read();
          cur.access = cur.access || {};
          cur.access[project] = answer === 'edit' ? 'staff' : 'view';
          write(cur);
          unwait();
          return cur.access[project];
        }
        if (answer === 'signed-out') { write(null); return openModal(shown).then(again); }
        if (answer === 'no') {
          return openModal({ reason: 'no-access', toolName: opts.toolName, title: opts.title, eyebrow: opts.eyebrow, project: project, gated: shown.gated }).then(again);
        }
        /* The relay could not be reached. That is not a refusal, and saying "you do not
           have access" to someone who does would be wrong, so the page is told instead. */
        unwait();
        var e = new Error('The sign-in service could not be reached.'); e.code = 'OFFLINE';
        return Promise.reject(e);
      });
    },
    /* For a tool spanning several keys (Service Orders has one per contracting company):
       ask the relay about each and correct the browser's copy for any it says this person
       holds. Shows nothing; resolves with the corrected session, or null if signed out.
       A page calls this before deciding someone has no access, never after refusing. */
    refreshAccess: function (projects) {
      var list = (projects || []).slice();
      return Promise.all(list.map(function (p) {
        return checkAccess(p).then(function (a) { return { p: p, a: a }; });
      })).then(function (answers) {
        /* Not one answer came back: the relay was unreachable. That is not "no access",
           and a page must not refuse someone on the strength of it. */
        if (answers.length && answers.every(function (x) { return x.a === 'unknown'; })) {
          var e = new Error('The sign-in service could not be reached.'); e.code = 'OFFLINE'; throw e;
        }
        var cur = read();
        if (!cur) return null;
        cur.access = cur.access || {};
        var changed = false;
        answers.forEach(function (x) {
          var level = x.a === 'edit' ? 'staff' : x.a === 'view' ? 'view' : null;
          if (level && !cur.access[x.p]) { cur.access[x.p] = level; changed = true; }
        });
        if (changed) write(cur);
        return cur;
      });
    },
    signOut: function () { write(null); },
    onChange: function (fn) { listeners.push(fn); },
    mount: function (el) { if (el) { el.setAttribute('data-rs-mount', ''); renderInto(el); } }
  };
  window.ResourcesSession = api;

  /* ---------- styles, scoped under .rs- so nothing leaks into a host page ---------- */
  var css = [
    ':root{--rs-card:#fff;--rs-paper:#F1F3F9;--rs-ink:#101B33;--rs-soft:#4B5670;--rs-line:#E1E4EC;',
    '--rs-brand:#2A4DFF;--rs-brand-soft:#EAF0FF;--rs-brand-text:#1E3ACC;',
    /* The account colour is deliberately NOT a theme token: it is the same in light and
       dark, on every tool. The name needs a deeper shade on a white card, where #94c8e9
       measures 1.8:1 and all but disappears. */
    '--rs-acct:#94c8e9;--rs-acct-name:#2C74A6;',
    '--rs-err-bg:#FDECEC;--rs-err:#8A2A2A;--rs-warn-bg:#E7E1F4;--rs-warn:#514080;',
    '--rs-admin-bg:#E3EBFF;--rs-admin:#1B34B8;--rs-admin-bd:#C9D8FB;--rs-staff-bg:#E7EAF1;--rs-staff:#4C5468;--rs-staff-bd:#D3D8E3;',
    /* View is an outline rather than a third fill, so the three levels read as a
       ladder at a glance instead of as three interchangeable badges. */
    '--rs-view:#5A6478;--rs-view-bd:#D3D8E3;',
    '--rs-shadow:0 12px 32px rgba(16,27,51,.14);--rs-scrim:rgba(16,27,51,.42);--rs-ground:#F1F6FA}',
    'html[data-theme="dark"]{--rs-card:#112336;--rs-paper:#0B1826;--rs-ink:#EEF3F8;--rs-soft:#B9C8D6;--rs-line:#243E5A;',
    '--rs-brand:#50A4DB;--rs-brand-soft:#173A57;--rs-brand-text:#A3CDE7;',
    '--rs-acct:#94c8e9;--rs-acct-name:#94c8e9;',
    '--rs-err-bg:#3A1D1D;--rs-err:#F5A9A9;--rs-warn-bg:#251E3D;--rs-warn:#C4A9F5;',
    '--rs-admin-bg:#173A57;--rs-admin:#A3CDE7;--rs-admin-bd:transparent;--rs-staff-bg:#172D44;--rs-staff:#B9C8D6;--rs-staff-bd:transparent;',
    '--rs-view:#8C9FB1;--rs-view-bd:#3A5A7C;',
    '--rs-shadow:0 12px 32px rgba(0,0,0,.5);--rs-scrim:rgba(0,0,0,.6);--rs-ground:#0B1826}',

    '.rs-wrap{position:relative;display:inline-flex;font-family:"Libre Franklin",system-ui,-apple-system,"Segoe UI",Arial,sans-serif}',
    '.rs-signin{height:40px;padding:0 16px;border-radius:999px;border:1px solid var(--rs-brand);background:var(--rs-brand);color:#fff;',
    'font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}',
    '.rs-signin:hover{filter:brightness(1.07)}',
    '.rs-who{display:inline-flex;align-items:center;gap:8px;height:40px;box-sizing:border-box;padding:0 12px 0 7px;border-radius:999px;',
    'border:1px solid var(--rs-line);background:var(--rs-card);color:var(--rs-ink);font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}',
    '.rs-who:hover{border-color:var(--rs-acct);background:rgba(148,200,233,.22)}',
    'html[data-theme="dark"] .rs-who:hover{background:rgba(148,200,233,.18)}',
    '.rs-who .rs-first{color:var(--rs-acct-name)}',
    /* White initials on this blue measure 1.8:1, which no weight can change. The circle
       deepens toward the bottom so the letters sit on a darker tone, and a soft shadow
       holds their edges — the colour still reads as #94c8e9. */
    '.rs-av{width:26px;height:26px;border-radius:50%;flex:0 0 auto;display:flex;align-items:center;justify-content:center;',
    'font-size:11px;font-weight:800;color:#fff;letter-spacing:.02em;',
    'background:linear-gradient(160deg,#a8d4ef 0%,#94c8e9 45%,#6fb2dc 100%);',
    'text-shadow:0 1px 1.5px rgba(10,45,70,.45)}',
    '.rs-chev{color:var(--rs-soft);font-size:10px}',
    /* Option A: on a narrow screen the first name drops away and the initials remain */
    '@media (max-width:560px){.rs-who .rs-first,.rs-who .rs-chev{display:none}.rs-who{width:40px;padding:0;justify-content:center}}',

    '.rs-menu{position:absolute;right:0;top:calc(100% + 8px);width:300px;z-index:9000;background:var(--rs-card);',
    'border:1px solid var(--rs-line);border-radius:14px;overflow:hidden;box-shadow:var(--rs-shadow);text-align:left}',
    '.rs-mhead{display:flex;gap:11px;align-items:center;padding:15px 16px;border-bottom:1px solid var(--rs-line)}',
    '.rs-mhead .rs-av{width:38px;height:38px;font-size:13px}',
    '.rs-mname{font-size:14px;font-weight:700;color:var(--rs-ink)}',
    '.rs-mmail{font-size:12px;color:var(--rs-soft);margin-top:1px;word-break:break-all}',
    '.rs-msec{padding:12px 16px;border-bottom:1px solid var(--rs-line)}',
    '.rs-mlab{font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--rs-soft);margin-bottom:8px}',
    '.rs-mrow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0;font-size:13px;color:var(--rs-ink)}',
    '.rs-mlinkrow{text-decoration:none;border-radius:6px;margin:0 -6px;padding:4px 6px}',
    '.rs-mlinkrow:hover{background:var(--rs-brand-soft)}',
    '.rs-mgroup{font-size:11.5px;font-weight:600;color:var(--rs-soft);margin:10px 0 2px;padding-top:8px;border-top:1px solid var(--rs-line)}',
    '.rs-mlab + .rs-mgroup{border-top:0;padding-top:0;margin-top:0}',
    '.rs-mnone{color:var(--rs-soft)}',
    '.rs-msec{max-height:min(52vh,420px);overflow:auto}',
    '.rs-here{font-size:10px;font-weight:700;color:var(--rs-brand-text);margin-left:6px}',
    '.rs-role{font-size:11px;font-weight:600;padding:2px 9px;border-radius:999px;border:1px solid transparent}',
    '.rs-r-admin{background:var(--rs-admin-bg);color:var(--rs-admin);border-color:var(--rs-admin-bd)}',
    '.rs-r-staff{background:var(--rs-staff-bg);color:var(--rs-staff);border-color:var(--rs-staff-bd)}',
    '.rs-r-view{background:transparent;color:var(--rs-view);border-color:var(--rs-view-bd)}',
    '.rs-r-none{color:var(--rs-soft);font-style:italic;font-weight:500}',
    '.rs-mlink{display:flex;align-items:center;gap:9px;padding:11px 16px;font-size:13px;color:var(--rs-ink);border-bottom:1px solid var(--rs-line);text-decoration:none}',
    '.rs-mlink:hover{background:var(--rs-brand-soft)}',
    '.rs-mlink svg{width:16px;height:16px;color:var(--rs-soft)}',
    '.rs-mfoot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 16px}',
    '.rs-mexp{font-size:11.5px;color:var(--rs-soft)}',
    '.rs-mout{font:inherit;font-size:12.5px;font-weight:600;color:var(--rs-ink);background:var(--rs-card);border:1px solid var(--rs-line);',
    'border-radius:8px;padding:6px 12px;cursor:pointer}',
    '.rs-mout:hover{border-color:var(--rs-brand);color:var(--rs-brand-text)}',

    /* the sign-in screen — Direction 1, a card over a dimmed page */
    '.rs-scrim{position:fixed;inset:0;z-index:9500;background:var(--rs-scrim);display:flex;align-items:center;justify-content:center;padding:18px;',
    'font-family:"Libre Franklin",system-ui,-apple-system,"Segoe UI",Arial,sans-serif}',
    '.rs-card{background:var(--rs-card);border:1px solid var(--rs-line);border-radius:14px;box-shadow:var(--rs-shadow);width:100%;max-width:380px;overflow:hidden}',
    '.rs-chead{padding:18px 22px 0}',
    '.rs-ctitle{font-size:17px;font-weight:700;color:var(--rs-ink);letter-spacing:-.01em}',
    '.rs-csub{font-size:12.5px;color:var(--rs-soft);line-height:1.5;margin-top:5px}',
    '.rs-cbody{padding:16px 22px 20px}',
    '.rs-fld{margin-bottom:12px}',
    '.rs-fld label{display:block;font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--rs-soft);margin-bottom:5px}',
    '.rs-fld input{width:100%;box-sizing:border-box;font:inherit;font-size:13.5px;padding:9px 11px;border:1px solid var(--rs-line);',
    'border-radius:9px;background:var(--rs-paper);color:var(--rs-ink)}',
    '.rs-fld input:focus{outline:none;border-color:var(--rs-brand);background:var(--rs-card)}',
    '.rs-go{width:100%;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;padding:10px 14px;border-radius:9px;',
    'border:1px solid var(--rs-brand);background:var(--rs-brand);color:#fff}',
    '.rs-go[disabled]{opacity:.6;cursor:default}',
    '.rs-quiet{width:100%;margin-top:8px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;padding:9px 14px;border-radius:9px;',
    'border:1px solid var(--rs-line);background:var(--rs-card);color:var(--rs-soft)}',
    '.rs-note{font-size:11.5px;color:var(--rs-soft);line-height:1.5;margin-top:12px}',
    '.rs-golink{display:block;text-align:center;text-decoration:none;box-sizing:border-box}',
    '.rs-whoami{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--rs-line);',
    'border-radius:10px;background:var(--rs-paper);margin-bottom:14px}',
    '.rs-wname{font-size:13px;font-weight:600;color:var(--rs-ink);display:block}',
    '.rs-wmail{font-size:11.5px;color:var(--rs-soft);display:block}',
    '.rs-banner{display:none;gap:9px;align-items:flex-start;padding:10px 12px;border-radius:9px;font-size:12.5px;line-height:1.5;margin-bottom:14px}',
    '.rs-banner.on{display:flex}',
    '.rs-b-ok{background:var(--rs-brand-soft);color:var(--rs-brand-text)}',
    '.rs-forgot{display:block;margin:-4px 0 12px auto;background:none;border:0;padding:2px 0;font:inherit;font-size:12.5px;font-weight:600;color:var(--rs-brand-text);cursor:pointer;text-align:right}',
    '.rs-forgot:hover{text-decoration:underline}',
    '.rs-checks{list-style:none;margin:-4px 0 12px;padding:0;font-size:12.5px;line-height:1.5}',
    '.rs-checks li{display:flex;gap:8px;align-items:flex-start;color:var(--rs-soft)}',
    '.rs-checks li::before{content:"";flex:0 0 auto;width:12px;height:12px;margin-top:3px;border-radius:50%;border:2px solid var(--rs-line)}',
    '.rs-checks li.ok{color:var(--rs-ink)}',
    '.rs-checks li.ok::before{background:var(--rs-brand);border-color:var(--rs-brand)}',
    '.rs-mpw{width:100%;background:none;border:0;border-bottom:1px solid var(--rs-line);font:inherit;cursor:pointer;text-align:left}',
    '.rs-b-err{background:var(--rs-err-bg);color:var(--rs-err)}',
    '.rs-b-warn{background:var(--rs-warn-bg);color:var(--rs-warn)}',
    '.rs-b-info{background:var(--rs-brand-soft);color:var(--rs-brand-text)}',

    /* The whole-page version, for a page that shows nothing without access (layout C,
       chosen Sept 28, 2026). Opaque: someone signed out, or without access, sees the
       MISMO panel and the sign-in and nothing of the tool behind them. */
    'html.rs-locked,html.rs-locked body{overflow:hidden}',
    'html.rs-wait body>*:not(.rs-scrim){visibility:hidden!important}',
    'html.rs-wait body{background:var(--rs-ground)!important}',
    '.rs-scrim.rs-full{background:var(--rs-ground);padding:0;display:grid;grid-template-columns:clamp(320px,39vw,500px) minmax(0,1fr);',
    'align-items:stretch;justify-content:stretch;overflow:auto}',
    '.rs-side{background:#0f314c;color:#fff;box-sizing:border-box;padding:44px 48px;display:flex;flex-direction:column;justify-content:space-between;gap:32px;',
    'box-shadow:1px 0 0 rgba(80,164,219,.22);font-family:"IBM Plex Sans","Libre Franklin",system-ui,-apple-system,"Segoe UI",Arial,sans-serif}',
    '.rs-plate{align-self:flex-start;background:#fff;border-radius:5px;padding:9px 13px;display:flex;line-height:0;box-shadow:0 1px 0 rgba(80,164,219,.35)}',
    '.rs-plate svg{height:24px;width:auto;display:block}',
    '.rs-brand{display:flex;flex-direction:column;gap:14px}',
    '.rs-bar{width:44px;height:3px;border-radius:2px;background:#50a4db}',
    '.rs-eyebrow{font-size:11px;letter-spacing:.11em;text-transform:uppercase;font-weight:600;color:rgba(255,255,255,.62)}',
    '.rs-tool{margin:0;font-size:40px;line-height:1.05;font-weight:700;letter-spacing:-.02em;color:#fff;text-wrap:balance}',
    '.rs-part{font-size:14px;line-height:1.5;color:rgba(255,255,255,.72)}',
    '.rs-main{display:flex;align-items:center;justify-content:center;padding:24px;min-width:0}',
    '@media (max-width:760px){',
    '.rs-scrim.rs-full{grid-template-columns:minmax(0,1fr);grid-template-rows:auto 1fr}',
    '.rs-side{padding:24px 22px 26px;gap:18px;justify-content:flex-start}',
    '.rs-plate{padding:7px 10px}.rs-plate svg{height:18px}',
    '.rs-brand{gap:8px}.rs-bar{width:36px}.rs-eyebrow{font-size:10.5px}.rs-tool{font-size:28px;line-height:1.1}.rs-part{display:none}',
    '.rs-main{align-items:flex-start;padding:24px 18px}}'
  ].join('\n');
  var styleEl = document.createElement('style');
  styleEl.setAttribute('data-rs', '');
  styleEl.textContent = css;
  (document.head || document.documentElement).appendChild(styleEl);

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function initials(name) {
    var p = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '?';
    return (p.length === 1 ? p[0][0] : p[0][0] + p[p.length - 1][0]).toUpperCase();
  }
  function firstName(name) { return String(name || '').trim().split(/\s+/)[0] || ''; }
  function timeOf(iso) {
    try { return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; }
  }
  var GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
  var KEY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3M16 7l3 3M14 9l2 2"/></svg>';

  /* ---------- the indicator (Option A) and its menu ---------- */
  function renderAll() {
    var els = document.querySelectorAll('[data-rs-mount]');
    for (var i = 0; i < els.length; i++) {
      var open = els[i].querySelector('.rs-menu') && !els[i].querySelector('.rs-menu').hidden;
      renderInto(els[i]);
      if (open) { var m = els[i].querySelector('.rs-menu'), w = els[i].querySelector('.rs-who'); if (m) m.hidden = false; if (w) w.setAttribute('aria-expanded', 'true'); }
    }
  }
  /* What this person may reach, as it is now. The menu otherwise shows what they had when
     they signed in, so a change made in the admin panel would wait for their next sign-in.
     Asked when a page loads (at most every two minutes) and when the menu is opened (at most
     every thirty seconds). Stored and re-drawn only if something changed, and without telling
     the page, which goes on as it was. A session ended by a password change signs out. */
  var ME_AT = 'resources:me-at';
  function refreshMe(minAgeMs) {
    var s = read(); if (!s) return;
    var last = 0; try { last = +sessionStorage.getItem(ME_AT) || 0; } catch (e) {}
    if (Date.now() - last < minAgeMs) return;
    try { sessionStorage.setItem(ME_AT, String(Date.now())); } catch (e) {}
    fetch(RELAY_URL + '/' + LOGIN_PROJECT + '/auth/me', { cache: 'no-store', headers: { 'Authorization': 'Bearer ' + s.token } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { r: r, b: b }; }); })
      .then(function (x) {
        var cur = read(); if (!cur || cur.token !== s.token) return;
        if (x.r.status === 401 && /^(TOKEN_STALE|TOKEN_BAD|NO_ACCOUNT)$/.test(x.b.error || '')) { write(null); return; }
        if (!x.r.ok || !x.b || typeof x.b.access !== 'object') return;   // an older relay: keep what sign-in gave
        var next = JSON.parse(JSON.stringify(cur));
        next.access = x.b.access || {}; next.platformAdmin = x.b.platformAdmin === true;
        if (x.b.name) next.name = x.b.name;
        if (typeof x.b.passwords === 'boolean') next.passwords = x.b.passwords;
        if (JSON.stringify(next) === JSON.stringify(cur)) return;
        try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
        renderAll();
      }, function () {});
  }
  api.refreshMe = function () { try { sessionStorage.removeItem(ME_AT); } catch (e) {} refreshMe(0); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { refreshMe(120000); });
  else refreshMe(120000);

  function renderInto(el) {
    var s = read();
    if (!s) {
      el.innerHTML = '<span class="rs-wrap"><button type="button" class="rs-signin">Sign in</button></span>';
      el.querySelector('.rs-signin').addEventListener('click', function () { openModal({}); });
      return;
    }
    /* Every tool this person has access to, as the admin panel lists them, and nothing else. */
    var hereT = currentEntry(), herePath = hereT ? String(hereT.path).toLowerCase() : null;
    var lastGroup = null, rows = '';
    TOOLS.forEach(function (t) {
      var r = api.role(t.key);
      if (!r) return;
      if (t.group !== lastGroup) { rows += '<div class="rs-mgroup">' + esc(t.group) + '</div>'; lastGroup = t.group; }
      var pill = r === 'admin' ? '<span class="rs-role rs-r-admin">Admin</span>'
               : r === 'staff' ? '<span class="rs-role rs-r-staff">Edit</span>'
               : '<span class="rs-role rs-r-view">View</span>';
      var here = herePath && String(t.path || '').toLowerCase() === herePath ? '<span class="rs-here">&bull; you are here</span>' : '';
      rows += (t.path ? '<a class="rs-mrow rs-mlinkrow" href="' + esc(t.path) + '">' : '<div class="rs-mrow">') +
              '<span>' + esc(t.name) + here + '</span>' + pill + (t.path ? '</a>' : '</div>');
    });
    if (!rows) rows = '<div class="rs-mrow rs-mnone">No tools yet. A MISMO administrator can add them.</div>';
    /* Shown only to admins. Anyone else never sees a way into it, rather than seeing a
       gear that leads to a sign-in they cannot pass. */
    var pwLink = s.passwords ? '<button type="button" class="rs-mlink rs-mpw">' + KEY_ICON + 'Change password</button>' : '';
    var adminLink = api.isAdmin()
      ? '<a class="rs-mlink" href="/initiative-hub/admin.html">' + GEAR + 'Admin panel</a>' : '';

    el.innerHTML =
      '<span class="rs-wrap">' +
        '<button type="button" class="rs-who" aria-haspopup="true" aria-expanded="false" title="' + esc(s.name) + '">' +
          '<span class="rs-av">' + esc(initials(s.name)) + '</span>' +
          '<span class="rs-first">' + esc(firstName(s.name)) + '</span><span class="rs-chev">&#9662;</span>' +
        '</button>' +
        '<div class="rs-menu" role="menu" hidden>' +
          '<div class="rs-mhead"><span class="rs-av">' + esc(initials(s.name)) + '</span>' +
            '<div><div class="rs-mname">' + esc(s.name) + '</div><div class="rs-mmail">' + esc(s.email) + '</div></div></div>' +
          '<div class="rs-msec"><div class="rs-mlab">Your access</div>' + rows + '</div>' +
          pwLink + adminLink +
          '<div class="rs-mfoot"><span class="rs-mexp">Signed in until ' + esc(timeOf(s.expiresAt)) + '</span>' +
            '<button type="button" class="rs-mout">Sign out</button></div>' +
        '</div>' +
      '</span>';

    var btn = el.querySelector('.rs-who'), menu = el.querySelector('.rs-menu');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.hidden;
      closeMenus();
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (open) refreshMe(30000);
    });
    el.querySelector('.rs-mout').addEventListener('click', function () { api.signOut(); });
    var mpw = el.querySelector('.rs-mpw'); if (mpw) mpw.addEventListener('click', function () { closeMenus(); openChangePassword(); });
  }
  function closeMenus() {
    var ms = document.querySelectorAll('.rs-menu');
    for (var i = 0; i < ms.length; i++) ms[i].hidden = true;
    var bs = document.querySelectorAll('.rs-who');
    for (var j = 0; j < bs.length; j++) bs[j].setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.rs-wrap')) closeMenus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenus(); });

  /* ---------- your own password ----------
     The rules mirror the relay's (which is what actually decides): at least PW_MIN characters,
     and not containing your name, your email or "MISMO". Breached passwords are caught by the
     relay when you save. */
  var PW_MIN = 13;
  function pwChecks(pw, s, confirm) {
    var low = String(pw || '').toLowerCase();
    var parts = [String((s && s.email) || '').split('@')[0]].concat(String((s && s.name) || '').split(/\s+/)).concat(['mismo'])
      .map(function (t) { return t.toLowerCase(); }).filter(function (t) { return t.length >= 3; });
    var clean = low.length > 0 && !parts.some(function (t) { return low.indexOf(t) >= 0; });
    return [
      { ok: String(pw || '').length >= PW_MIN, text: 'At least ' + PW_MIN + ' characters. A few unrelated words make a strong password that\u2019s easy to remember.' },
      { ok: clean, text: 'Doesn\u2019t include your name, your email or \u201cMISMO\u201d' },
      { ok: confirm !== undefined && String(pw || '').length > 0 && confirm === pw, text: 'Both entries match' }
    ];
  }
  function checksHTML(list) { return list.map(function (c) { return '<li class="' + (c.ok ? 'ok' : '') + '">' + esc(c.text) + '</li>'; }).join(''); }
  function openChangePassword() {
    var s = read(); if (!s) return openModal({});
    var scrim = document.createElement('div');
    scrim.className = 'rs-scrim'; scrim.setAttribute('role', 'dialog'); scrim.setAttribute('aria-modal', 'true'); scrim.setAttribute('aria-label', 'Change your password');
    scrim.innerHTML = '<div class="rs-card"><div class="rs-chead"><div class="rs-ctitle">Change your password</div><div class="rs-csub">For ' + esc(s.email) + '</div></div>' +
      '<div class="rs-cbody"><div class="rs-banner rs-b-err" data-rs-err><span>!</span><span data-rs-errtext></span></div>' +
      '<div class="rs-fld"><label for="rs-pcur">Current password</label><input id="rs-pcur" type="password" autocomplete="current-password"></div>' +
      '<div class="rs-fld"><label for="rs-pnew">New password</label><input id="rs-pnew" type="password" autocomplete="new-password"></div>' +
      '<div class="rs-fld"><label for="rs-pnew2">New password again</label><input id="rs-pnew2" type="password" autocomplete="new-password"></div>' +
      '<ul class="rs-checks" aria-live="polite"></ul>' +
      '<button type="button" class="rs-go" data-rs-pgo>Change password</button><button type="button" class="rs-quiet" data-rs-pcancel>Cancel</button>' +
      '<div class="rs-note">Changing it signs you out everywhere else.</div></div></div>';
    document.body.appendChild(scrim);
    var cur = scrim.querySelector('#rs-pcur'), nw = scrim.querySelector('#rs-pnew'), nw2 = scrim.querySelector('#rs-pnew2'), checks = scrim.querySelector('.rs-checks');
    var go = scrim.querySelector('[data-rs-pgo]'), err = scrim.querySelector('[data-rs-err]'), errText = scrim.querySelector('[data-rs-errtext]');
    function paint() { checks.innerHTML = checksHTML(pwChecks(nw.value, s, nw2.value)); }
    function say(msg, good) { errText.textContent = msg; err.className = 'rs-banner ' + (good ? 'rs-b-ok' : 'rs-b-err') + ' on'; }
    function close() { if (scrim.parentNode) scrim.parentNode.removeChild(scrim); }
    nw.addEventListener('input', paint); nw2.addEventListener('input', paint); paint();
    scrim.querySelector('[data-rs-pcancel]').addEventListener('click', close);
    scrim.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    go.addEventListener('click', function () {
      if (!cur.value) return say('Enter your current password.');
      if (!pwChecks(nw.value, s, nw2.value).every(function (c) { return c.ok; })) return say('The new password doesn\u2019t meet the checks yet.');
      go.disabled = true; go.textContent = 'Changing\u2026';
      fetch(RELAY_URL + '/' + LOGIN_PROJECT + '/auth/password', { method: 'POST', cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.token }, body: JSON.stringify({ current: cur.value, password: nw.value }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { r: r, b: b }; }); })
        .then(function (x) {
          if (x.r.ok && x.b.token) {
            write({ token: x.b.token, name: x.b.name || s.name, email: x.b.email || s.email, access: x.b.access || s.access, platformAdmin: x.b.platformAdmin === true, passwords: true, expiresAt: x.b.expiresAt });
            say('Password changed. A confirmation is on its way to your email.', true); go.hidden = true;
            setTimeout(close, 2200); return;
          }
          if (x.r.status === 400 && x.b.problems) return say(x.b.problems.join(' '));
          if (x.r.status === 401) return say('Your session has ended. Sign in again, then change your password.');
          if (x.r.status === 503 || x.r.status === 404) return say('Changing your own password isn\u2019t switched on yet. Ask a MISMO administrator to reset it.');
          say(x.b.message || ('That didn\u2019t work (' + x.r.status + ').'));
        }, function () { say('Could not reach the sign-in service. Check your connection and try again.'); })
        .then(function () { if (go.isConnected){ go.disabled = false; go.textContent = 'Change password'; } });
    });
    setTimeout(function () { cur.focus(); }, 30);
  }
  api.pwChecks = pwChecks; api.checksHTML = checksHTML;   // for /reset-password.html
  /* The reset page signs the person in with what the relay returned. */
  api.adopt = function (b) { write({ token: b.token, name: b.name || b.email, email: b.email, access: b.access || {}, platformAdmin: b.platformAdmin === true, passwords: true, expiresAt: b.expiresAt }); };

  /* ---------- the sign-in screen ---------- */
  /* The navy panel of the whole-page screen: the logo, the tool's name, and the line the
     page's own masthead carries above it. */
  function toolTitle(opts) {
    if (opts.title) return opts.title;
    var n = String(opts.toolName || '').replace(/^the\s+/i, '');
    if (n) return n.charAt(0).toUpperCase() + n.slice(1);
    var hq = document.querySelector('.hqname');
    if (hq && hq.textContent.trim()) return hq.textContent.trim();
    var key = opts.project || currentTool();
    for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].key === key) return TOOLS[i].name;
    return 'MISMO Resources';
  }
  function sideHTML(opts) {
    var eb = opts.eyebrow;
    if (eb == null) { var m = document.querySelector('.eyebrow-m'); eb = m ? m.textContent.trim() : ''; }
    return '<div class="rs-side"><span class="rs-plate">' + LOGO + '</span>' +
      '<div class="rs-brand"><span class="rs-bar"></span>' +
        (eb ? '<div class="rs-eyebrow">' + esc(eb) + '</div>' : '') +
        '<h1 class="rs-tool">' + esc(toolTitle(opts)) + '</h1>' +
        '<div class="rs-part">Part of MISMO Resources</div></div></div>';
  }

  var pending = null;   // one screen at a time; a second request joins the first

  function openModal(opts) {
    if (pending) return pending.promise;
    var resolveFn, rejectFn;
    var promise = new Promise(function (res, rej) { resolveFn = res; rejectFn = rej; });
    pending = { promise: promise };

    var prev = read();
    var expired = opts.reason === 'expired';
    var noAccess = opts.reason === 'no-access';
    /* On a page that shows nothing without signing in, dismissing the window would leave
       a blank screen, so the way out goes back to the home page instead. */
    var leave = opts.gated ? 'Back to MISMO Resources' : (noAccess ? 'Close' : 'Cancel');
    var title = expired ? 'Sign in to finish saving'
      : noAccess ? (opts.toolName ? 'You do not have access to ' + opts.toolName : 'You do not have access to this')
      : 'Sign in to MISMO Resources';
    var sub = expired ? ''
      : noAccess ? 'Ask an administrator to add it to your account, or sign in with a different one.'
      : 'One sign-in covers every tool you have access to.';
    /* Named rather than described, because the usual cause of this screen is being
       signed in as the wrong account, and that is only obvious once you see which one. */
    var whoami = (noAccess && prev)
      ? '<div class="rs-whoami"><span class="rs-av">' + esc(initials(prev.name || prev.email)) + '</span>' +
        '<span><span class="rs-wname">' + esc(prev.name || prev.email) + '</span>' +
        '<span class="rs-wmail">' + esc(prev.email) + '</span></span></div>'
      : '';
    var askHref = 'mailto:' + ACCESS_CONTACT +
      '?subject=' + encodeURIComponent('Access request: ' + (opts.toolName || document.title || 'MISMO Resources')) +
      '&body=' + encodeURIComponent(
        'Hello,\n\nCould I be given access to ' + (opts.toolName || document.title || 'this application') + '?\n\n' +
        (prev ? 'My account: ' + prev.email + '\n' : '') +
        'Page: ' + location.href + '\n\nThank you.');

    /* Whole page when the page has nothing to show without access; the smaller window
       over the page when someone is mid-task (a save that needs signing in again) or the
       page is public anyway. */
    var full = !!opts.gated && !expired;
    var scrim = document.createElement('div');
    scrim.className = 'rs-scrim' + (full ? ' rs-full' : '');
    scrim.setAttribute('role', 'dialog');
    scrim.setAttribute('aria-modal', 'true');
    scrim.setAttribute('aria-label', title);
    scrim.innerHTML = (full ? sideHTML(opts) + '<div class="rs-main">' : '') +
      '<div class="rs-card">' +
        '<div class="rs-chead"><div class="rs-ctitle">' + esc(title) + '</div>' + (sub ? '<div class="rs-csub">' + esc(sub) + '</div>' : '') + '</div>' +
        '<div class="rs-cbody">' +
          '<div class="rs-banner rs-b-warn' + (expired ? ' on' : '') + '"><span>&#9201;</span><span>Your session expired while you were working. Nothing has been lost. Sign in and your save will go through.</span></div>' +
          (noAccess ? whoami : '') +
          '<div class="rs-banner rs-b-info' + (noAccess && !prev ? ' on' : '') + '"><span>i</span><span>' +
            'You are not signed in, and this application is not open to everyone.' +
          '</span></div>' +
          '<div class="rs-banner rs-b-err" data-rs-err><span>!</span><span data-rs-errtext></span></div>' +
          '<div' + (noAccess ? ' hidden' : '') + '>' +
            '<div class="rs-fld"><label for="rs-email">Email</label><input id="rs-email" type="email" autocomplete="username" placeholder="name@company.com"></div>' +
            '<div class="rs-fld"><label for="rs-pass">Password</label><input id="rs-pass" type="password" autocomplete="current-password"></div>' +
            '<button type="button" class="rs-forgot" data-rs-forgot>Forgot your password?</button>' +
            '<button type="button" class="rs-go" data-rs-go>' + (expired ? 'Sign in and save' : 'Sign in') + '</button>' +
          '</div>' +
          '<div data-rs-fview hidden>' +
            '<p class="rs-note" style="margin:0 0 12px;text-align:left">Enter your email and we\u2019ll send a link to set a new password. It works once, for one hour.</p>' +
            '<div class="rs-fld"><label for="rs-femail">Email</label><input id="rs-femail" type="email" autocomplete="username" placeholder="name@company.com"></div>' +
            '<button type="button" class="rs-go" data-rs-fgo>Send reset link</button>' +
            '<button type="button" class="rs-quiet" data-rs-fback>Back to sign in</button>' +
          '</div>' +
          (noAccess ? '<a class="rs-go rs-golink" href="' + esc(askHref) + '">Ask for access</a>' +
                      '<button type="button" class="rs-quiet" data-rs-switch>Sign in as someone else</button>' : '') +
          '<button type="button" class="rs-quiet" data-rs-cancel>' + esc(leave) + '</button>' +
          '<div class="rs-note">' + (noAccess
            ? 'Accounts and what each one can reach are managed by a MISMO administrator.'
            : 'Accounts are created by a MISMO administrator.') + '</div>' +
        '</div>' +
      '</div>' + (full ? '</div>' : '');
    document.body.appendChild(scrim);
    if (full) { root.classList.add('rs-locked'); unwait(); }

    var email = scrim.querySelector('#rs-email'), pass = scrim.querySelector('#rs-pass');
    var go = scrim.querySelector('[data-rs-go]'), err = scrim.querySelector('[data-rs-err]'), errText = scrim.querySelector('[data-rs-errtext]');
    var known = prev || lastKnown;
    if (known && known.email && email) email.value = known.email;
    setTimeout(function () { (email && !email.value ? email : pass || go).focus(); }, 30);

    function showErr(msg) { errText.textContent = msg; err.className = 'rs-banner rs-b-err on'; }
    function close(result, error) {
      if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
      root.classList.remove('rs-locked');
      pending = null;
      error ? rejectFn(error) : resolveFn(result);
    }

    function submit() {
      var e = (email.value || '').trim().toLowerCase(), p = pass.value || '';
      if (!e || e.indexOf('@') < 0) return showErr('Enter your email.');
      if (!p) return showErr('Enter your password.');
      go.disabled = true; go.textContent = 'Signing in\u2026'; err.classList.remove('on');
      fetch(RELAY_URL + '/' + LOGIN_PROJECT + '/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({ email: e, password: p })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (b) { return { r: r, b: b }; });
      }).then(function (x) {
        if (x.r.ok && x.b.token) {
          var s = { token: x.b.token, name: x.b.name || e, email: x.b.email || e,
                    access: x.b.access || {}, platformAdmin: x.b.platformAdmin === true,
                    passwords: x.b.passwords === true, expiresAt: x.b.expiresAt };
          write(s);
          close(s);
          return;
        }
        /* One message for a wrong password, an unknown email and an expired account —
           the relay deliberately does not say which, and neither does this. A relay with
           self-service passwords adds how many tries are left, and 423 once locked. */
        if (x.r.status === 423) { showErr(x.b.message || 'This account is locked. Reset your password to unlock it.'); showForgot(true); }
        else if (x.r.status === 401) showErr(x.b.message || 'That email and password do not match an account.');
        else if (x.r.status === 502) showErr('Sign-in is briefly unavailable. Your work is safe. Try again in a minute.');
        else showErr(x.b.message || ('Sign-in failed (' + x.r.status + ').'));
      }).catch(function () {
        showErr('Could not reach the sign-in service. Check your connection and try again.');
      }).then(function () {
        if (go.isConnected) { go.disabled = false; go.textContent = expired ? 'Sign in and save' : 'Sign in'; }
      });
    }

    /* "Forgot your password?": the same card, switched to asking for an email. The answer is
       the same whether or not there is an account, so it reveals nothing. */
    var fview = scrim.querySelector('[data-rs-fview]'), fgo = scrim.querySelector('[data-rs-fgo]'), femail = scrim.querySelector('#rs-femail');
    var signinView = go ? go.parentNode : null;
    function showForgot(locked) {
      if (!fview || !signinView) return;
      if (locked) { var fl = scrim.querySelector('[data-rs-forgot]'); if (fl) { fl.textContent = 'Reset your password'; fl.classList.add('rs-go'); fl.classList.remove('rs-forgot'); } return; }
      signinView.hidden = true; fview.hidden = false; err.classList.remove('on');
      femail.value = (email.value || '').trim(); setTimeout(function () { (femail.value ? fgo : femail).focus(); }, 20);
    }
    var flink = scrim.querySelector('[data-rs-forgot]');
    if (flink) flink.addEventListener('click', function () { showForgot(false); });
    var fback = scrim.querySelector('[data-rs-fback]');
    if (fback) fback.addEventListener('click', function () { fview.hidden = true; signinView.hidden = false; err.classList.remove('on'); (pass || email).focus(); });
    function sendReset() {
      var e = (femail.value || '').trim().toLowerCase();
      if (!e || e.indexOf('@') < 0) return showErr('Enter your email.');
      fgo.disabled = true; fgo.textContent = 'Sending\u2026'; err.classList.remove('on');
      fetch(RELAY_URL + '/' + LOGIN_PROJECT + '/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body: JSON.stringify({ email: e }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { r: r, b: b }; }); })
        .then(function (x) {
          if (x.r.ok) { errText.textContent = 'If there\u2019s an account for ' + e + ', a reset link is on its way. Check your email; it works once, for one hour.'; err.className = 'rs-banner rs-b-ok on'; fgo.hidden = true; return; }
          if (x.r.status === 503 || x.r.status === 404) return showErr('Resetting your own password isn\u2019t switched on yet. Ask a MISMO administrator to reset it.');
          showErr(x.b.message || ('That didn\u2019t work (' + x.r.status + '). Try again.'));
        }, function () { showErr('Could not reach the sign-in service. Check your connection and try again.'); })
        .then(function () { if (fgo.isConnected){ fgo.disabled = false; fgo.textContent = 'Send reset link'; } });
    }
    if (fgo) fgo.addEventListener('click', sendReset);
    if (femail) femail.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') sendReset(); });
    if (go) go.addEventListener('click', submit);
    if (pass) pass.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    if (email) email.addEventListener('keydown', function (e) { if (e.key === 'Enter') pass.focus(); });
    var sw = scrim.querySelector('[data-rs-switch]');
    /* Chained, not fired and forgotten. The caller is awaiting THIS promise; opening a
       second screen underneath it would sign the person in with nobody listening. */
    if (sw) sw.addEventListener('click', function () {
      write(null);
      if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
      root.classList.remove('rs-locked');
      pending = null;
      openModal({ gated: opts.gated, toolName: opts.toolName, title: opts.title, eyebrow: opts.eyebrow, project: opts.project }).then(resolveFn, rejectFn);
    });
    function dismiss() {
      if (opts.gated) { location.href = '/'; return; }
      close(null, new Error('cancelled'));
    }
    scrim.querySelector('[data-rs-cancel]').addEventListener('click', dismiss);
    scrim.addEventListener('keydown', function (e) { if (e.key === 'Escape') dismiss(); });
    return promise;
  }

  /* ---------- start ---------- */
  function start() {
    scheduleExpiry();
    var auto = document.getElementById('rs-account');
    if (auto) api.mount(auto);
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();
