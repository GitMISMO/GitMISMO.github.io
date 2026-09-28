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
       requireAccess(p,o)   gate a page: resolves with the role, or shows the refusal
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
  var ACCESS_CONTACT = 'pwilliams@mba.org';
  var KEY = 'resources:session';

  /* Every tool the menu lists. A tool someone cannot use is still shown, as "No
     access", so a read-only page has an explanation rather than looking broken. */
  var TOOLS = [
    { key: 'hub',         name: 'Initiative Hub',    path: '/initiative-hub/' },
    { key: 'glossary',    name: 'Business Glossary', path: '/glossary/' },
    { key: 'sponsorship', name: 'Sponsorship',       path: '/sponsorship/' }
  ];

  var listeners = [];
  var expiryTimer = null;

  /* ---------- storage ---------- */
  function read() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!s || !s.token || !s.expiresAt) return null;
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
    var p = location.pathname;
    for (var i = 0; i < TOOLS.length; i++) if (p.indexOf(TOOLS[i].path) === 0) return TOOLS[i].key;
    return null;
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
      var r = api.role(project);
      if (r) return Promise.resolve(r);
      var deny = function () {
        return openModal({ reason: 'no-access', toolName: opts.toolName })
          .then(function () { return api.role(project) || Promise.reject(new Error('no-access')); },
                function (e) { return Promise.reject(e); });
      };
      if (!read()) {
        return openModal({ toolName: opts.toolName }).then(function () {
          return api.role(project) || deny();
        });
      }
      return deny();
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
    '--rs-shadow:0 12px 32px rgba(16,27,51,.14);--rs-scrim:rgba(16,27,51,.42)}',
    'html[data-theme="dark"]{--rs-card:#161C30;--rs-paper:#0B0F1C;--rs-ink:#E8EAF0;--rs-soft:#A0A8C0;--rs-line:#2A3150;',
    '--rs-brand:#5B85FF;--rs-brand-soft:#1A2745;--rs-brand-text:#9AB8FF;',
    '--rs-acct:#94c8e9;--rs-acct-name:#94c8e9;',
    '--rs-err-bg:#3A1D1D;--rs-err:#F5A9A9;--rs-warn-bg:#251E3D;--rs-warn:#C4A9F5;',
    '--rs-admin-bg:#1A2745;--rs-admin:#9AB8FF;--rs-admin-bd:transparent;--rs-staff-bg:#202536;--rs-staff:#A0A8C0;--rs-staff-bd:transparent;',
    '--rs-view:#8A92A8;--rs-view-bd:#343B52;',
    '--rs-shadow:0 12px 32px rgba(0,0,0,.5);--rs-scrim:rgba(0,0,0,.6)}',

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
    '.rs-b-err{background:var(--rs-err-bg);color:var(--rs-err)}',
    '.rs-b-warn{background:var(--rs-warn-bg);color:var(--rs-warn)}',
    '.rs-b-info{background:var(--rs-brand-soft);color:var(--rs-brand-text)}'
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

  /* ---------- the indicator (Option A) and its menu ---------- */
  function renderAll() {
    var els = document.querySelectorAll('[data-rs-mount]');
    for (var i = 0; i < els.length; i++) renderInto(els[i]);
  }

  function renderInto(el) {
    var s = read();
    if (!s) {
      el.innerHTML = '<span class="rs-wrap"><button type="button" class="rs-signin">Sign in</button></span>';
      el.querySelector('.rs-signin').addEventListener('click', function () { openModal({}); });
      return;
    }
    var here = currentTool();
    var rows = TOOLS.map(function (t) {
      var r = api.role(t.key);
      var pill = r === 'admin' ? '<span class="rs-role rs-r-admin">Admin</span>'
               : r === 'staff' ? '<span class="rs-role rs-r-staff">Edit</span>'
               : r === 'view'  ? '<span class="rs-role rs-r-view">View</span>'
               : '<span class="rs-role rs-r-none">No access</span>';
      return '<div class="rs-mrow"><span>' + esc(t.name) + (t.key === here ? '<span class="rs-here">&bull; you are here</span>' : '') +
             '</span>' + pill + '</div>';
    }).join('');
    /* Shown only to admins. Anyone else never sees a way into it, rather than seeing a
       gear that leads to a sign-in they cannot pass. */
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
          adminLink +
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
    });
    el.querySelector('.rs-mout').addEventListener('click', function () { api.signOut(); });
  }
  function closeMenus() {
    var ms = document.querySelectorAll('.rs-menu');
    for (var i = 0; i < ms.length; i++) ms[i].hidden = true;
    var bs = document.querySelectorAll('.rs-who');
    for (var j = 0; j < bs.length; j++) bs[j].setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.rs-wrap')) closeMenus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenus(); });

  /* ---------- the sign-in screen ---------- */
  var pending = null;   // one screen at a time; a second request joins the first

  function openModal(opts) {
    if (pending) return pending.promise;
    var resolveFn, rejectFn;
    var promise = new Promise(function (res, rej) { resolveFn = res; rejectFn = rej; });
    pending = { promise: promise };

    var prev = read();
    var expired = opts.reason === 'expired';
    var noAccess = opts.reason === 'no-access';
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

    var scrim = document.createElement('div');
    scrim.className = 'rs-scrim';
    scrim.setAttribute('role', 'dialog');
    scrim.setAttribute('aria-modal', 'true');
    scrim.innerHTML =
      '<div class="rs-card">' +
        '<div class="rs-chead"><div class="rs-ctitle">' + esc(title) + '</div>' + (sub ? '<div class="rs-csub">' + esc(sub) + '</div>' : '') + '</div>' +
        '<div class="rs-cbody">' +
          '<div class="rs-banner rs-b-warn' + (expired ? ' on' : '') + '"><span>&#9201;</span><span>Your session expired while you were working. Nothing has been lost &mdash; sign in and your save will go through.</span></div>' +
          (noAccess ? whoami : '') +
          '<div class="rs-banner rs-b-info' + (noAccess && !prev ? ' on' : '') + '"><span>i</span><span>' +
            'You are not signed in, and this application is not open to everyone.' +
          '</span></div>' +
          '<div class="rs-banner rs-b-err" data-rs-err><span>!</span><span data-rs-errtext></span></div>' +
          '<div' + (noAccess ? ' hidden' : '') + '>' +
            '<div class="rs-fld"><label for="rs-email">MISMO email</label><input id="rs-email" type="email" autocomplete="username" placeholder="you@mismo.org"></div>' +
            '<div class="rs-fld"><label for="rs-pass">Password</label><input id="rs-pass" type="password" autocomplete="current-password"></div>' +
            '<button type="button" class="rs-go" data-rs-go>' + (expired ? 'Sign in and save' : 'Sign in') + '</button>' +
          '</div>' +
          (noAccess ? '<a class="rs-go rs-golink" href="' + esc(askHref) + '">Ask for access</a>' +
                      '<button type="button" class="rs-quiet" data-rs-switch>Sign in as someone else</button>' : '') +
          '<button type="button" class="rs-quiet" data-rs-cancel>' + (noAccess ? 'Close' : 'Cancel') + '</button>' +
          '<div class="rs-note">' + (noAccess
            ? 'Accounts and what each one can reach are managed by a MISMO administrator.'
            : 'Accounts are created by a MISMO administrator. Lost your password? Ask them to reset it.') + '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(scrim);

    var email = scrim.querySelector('#rs-email'), pass = scrim.querySelector('#rs-pass');
    var go = scrim.querySelector('[data-rs-go]'), err = scrim.querySelector('[data-rs-err]'), errText = scrim.querySelector('[data-rs-errtext]');
    if (prev && prev.email && email) email.value = prev.email;
    setTimeout(function () { (email && !email.value ? email : pass || go).focus(); }, 30);

    function showErr(msg) { errText.textContent = msg; err.classList.add('on'); }
    function close(result, error) {
      if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
      pending = null;
      error ? rejectFn(error) : resolveFn(result);
    }

    function submit() {
      var e = (email.value || '').trim().toLowerCase(), p = pass.value || '';
      if (!e || e.indexOf('@') < 0) return showErr('Enter your MISMO email.');
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
                    expiresAt: x.b.expiresAt };
          write(s);
          close(s);
          return;
        }
        /* One message for a wrong password, an unknown email and an expired account —
           the relay deliberately does not say which, and neither does this. */
        if (x.r.status === 401) showErr('That email and password do not match an account.');
        else if (x.r.status === 502) showErr('Sign-in is briefly unavailable. Your work is safe \u2014 try again in a minute.');
        else showErr(x.b.message || ('Sign-in failed (' + x.r.status + ').'));
      }).catch(function () {
        showErr('Could not reach the sign-in service. Check your connection and try again.');
      }).then(function () {
        if (go.isConnected) { go.disabled = false; go.textContent = expired ? 'Sign in and save' : 'Sign in'; }
      });
    }

    if (go) go.addEventListener('click', submit);
    if (pass) pass.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    if (email) email.addEventListener('keydown', function (e) { if (e.key === 'Enter') pass.focus(); });
    var sw = scrim.querySelector('[data-rs-switch]');
    /* Chained, not fired and forgotten. The caller is awaiting THIS promise; opening a
       second screen underneath it would sign the person in with nobody listening. */
    if (sw) sw.addEventListener('click', function () {
      write(null);
      if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
      pending = null;
      openModal({}).then(resolveFn, rejectFn);
    });
    scrim.querySelector('[data-rs-cancel]').addEventListener('click', function () { close(null, new Error('cancelled')); });
    scrim.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(null, new Error('cancelled')); });
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
