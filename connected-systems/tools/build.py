import re
AD=open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','..','accounting-desk','index.html')).read().split('\n')
head_meta=AD[3]  # <meta charset> + CSP line
# The Accounting Desk grows above these blocks now and then (its favicon line, CN-030), so find where its CSS starts
# and move every slice by the same amount (the asserts below catch anything else).
o=next(i for i,l in enumerate(AD) if l.startswith(':root{'))-15
css_shell='\n'.join(AD[15+o:129+o])   # :root .. end of rail css
defs='\n'.join(AD[316+o:347+o])       # svg defs
rail_js='\n'.join(AD[1285+o:1441+o])  # the rail + theme scripts (without <script> tags)
rail_js=rail_js.replace("const ORDER=['Receivables','Invoices','Certification Complete','New and Renewing Members','IIF Payments','Sponsorships'];","const ORDER=['Systems','Stories','Sections'];")
assert "const ORDER=['Systems','Stories','Sections'];" in rail_js
assert head_meta.startswith('<meta charset') and 'Content-Security-Policy' in head_meta
assert css_shell.startswith(':root{') and defs.startswith('<svg') and rail_js.startswith('/* the rail')
I=lambda d:'<svg viewBox="0 0 24 24" aria-hidden="true">'+d+'</svg>'
ICONS={
 'overview':I('<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M7 6.6h10M6.2 7.9l4.6 8.3M17.8 7.9l-4.6 8.3"/>'),
 'Follow the Work':I('<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H14a3.5 3.5 0 010 7h-4a3.5 3.5 0 000 7h5.5"/>'),
 'To Rock Solid':I('<path d="M4 6l2 2 3-3.5M4 12.5l2 2 3-3.5M4 19l2 2 3-3.5"/><path d="M12 7h8M12 13.5h8M12 20h8"/>'),
 'Change Notices':I('<path d="M6 9a6 6 0 1112 0c0 5 2 6.5 2 6.5H4S6 14 6 9z"/><path d="M10 19a2 2 0 004 0"/>'),
 'Failures':I('<path d="M12 3l9.5 17H2.5z"/><path d="M12 10v4.5M12 17.5v.1"/>'),
 'Coverage':I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.6 6.5-5.6s5.9 2 6.5 5.6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5c2.5.2 4 1.8 4.5 4.5"/>'),
 'Security':I('<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
 'What Changed':I('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'),
 'On Its Own':I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
 'help':I('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 014.8.9c0 1.7-2.4 2.2-2.4 3.6"/><path d="M12 17.2v.1"/>'),
}
import json
page=r'''<!doctype html>
<html lang="en" data-rs-gate>
<head>
__META__
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Connected Systems</title>
<meta name="description" content="How MISMO's systems fit together: the system map, how work moves, security, what changed and what runs on its own.">
<meta name="theme-color" content="#0d314c">
<meta name="robots" content="noindex">
<!-- Connected Systems (Jonna, 24 November 2026): its own view-only app, like the Membership Desk and the MBA Accounting
     Desk, so people can see how MISMO's systems fit together without being in Team HQ. Its own access ("Connected
     Systems", key connected-systems) and its own storage: it reads only data/systemsmap.json in
     GitMISMO/connected-systems-data, a copy of Team HQ's Connected Systems record that mismo-connections' Connected
     Systems Copy job brings over whenever it changes. Nothing on it saves, and the key reaches nothing else.
     The drawing is Team HQ's own code (/team-hq/src/systems.js), so it always shows exactly what Team HQ shows.
     Jonna and Vanessa edit Connected Systems in Team HQ (Edit in Team HQ, top right). Notes: DEVELOPING.md. -->
<link rel="icon" type="image/png" sizes="48x48" href="https://resources.mismo.org/assets/favicon-48x48.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&display=swap">
<script src="/assets/session.js"></script>
<script src="/assets/back.js"></script>
<style>
__CSS__
/* the colors Team HQ's Connected Systems drawing uses */
:root{--c1:#2477b8;--c2:#eb6834;--c3:#1baf7a;--c4:#eda100;--c5:#e87ba4;--c6:#008300;--c7:#8a6fd4;--cn:#adc4d6;--good-soft:#e2f2ec;--bad-soft:#f9e6e4;--warn-soft:#f8efdc;--info-soft:#e4f2fb;--shadow:0 1px 2px rgba(13,49,76,.06),0 6px 18px rgba(13,49,76,.06)}
:root[data-theme="dark"]{--c1:#3987e5;--c2:#d95926;--c3:#199e70;--c4:#c98500;--c5:#d55181;--c6:#2f9e2f;--c7:#9b86e0;--cn:#2f6688;--good-soft:#123d33;--bad-soft:#43201f;--warn-soft:#3d3218;--info-soft:#123a52;--sky-wash:#123a52;--shadow:0 1px 2px rgba(0,0,0,.3),0 6px 18px rgba(0,0,0,.25)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--c1:#3987e5;--c2:#d95926;--c3:#199e70;--c4:#c98500;--c5:#d55181;--c6:#2f9e2f;--c7:#9b86e0;--cn:#2f6688;--good-soft:#123d33;--bad-soft:#43201f;--warn-soft:#3d3218;--info-soft:#123a52;--sky-wash:#123a52}}
#rs-account .rs-who,#rs-account .rs-signin{border-radius:4px}
.vochip{font-size:11.5px;font-weight:700;color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:4px;padding:4px 9px;white-space:nowrap}
.edit-hq{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--navy);background:var(--sky);border-radius:4px;padding:6px 11px;text-decoration:none;white-space:nowrap}
.edit-hq:hover{background:#fff}
.edit-hq svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.edit-hq[hidden]{display:none}
@media(max-width:700px){.vochip{display:none}.edit-hq span{display:none}}
main{max-width:1360px;margin:0 auto;padding:22px 26px 48px}
@media(max-width:700px){main{padding:14px 12px 36px}}
.view[hidden]{display:none}
.msg{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:22px;color:var(--ink-2)}
.msg b{display:block;color:var(--ink);font-size:16px;margin-bottom:4px}
/* one page at a time: Overview is the hero and the map; every other page is its own section */
#csw .cs-nav{display:none}
#csw.ov .cs > .cs-hero + .cs-nav + section.cs-band ~ section.cs-band{display:none}
#csw.sec .cs > .cs-hero, #csw.sec .cs > .cs-hero + .cs-nav + section.cs-band{display:none}
#csw.sec .cs > section.cs-band:not([hidden]){margin-top:0}
.help{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:22px 26px;max-width:860px;line-height:1.55}
.help h1{margin:0 0 4px;font-size:24px}.help h2{font-size:16px;margin:20px 0 4px}.help p,.help li{color:var(--ink-2);font-size:14px}.help ul{padding-left:20px;margin:6px 0}
.help .k{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);font-weight:700}
.vstamp{margin-top:22px;font-size:11.5px;color:var(--ink-3)}
</style>
</head>
<body>
__DEFS__
<header class="hqtop">
  <span class="logoplate"><svg class="wordmark" role="img" aria-label="MISMO" viewBox="0 0 708 108"><use href="#mismo-logo"/></svg><svg class="santa" viewBox="0 0 100 100" aria-hidden="true"><use href="#mismo-hat"/></svg></span>
  <span class="mastrule"></span>
  <span class="hqname">Connected Systems</span>
  <span class="hqtop-r"><span class="eyebrow-m">How MISMO’s Systems Fit Together</span><span class="vochip">View Only</span>
    <a class="edit-hq" id="edit-hq" href="/team-hq/?page=systems" hidden title="Edit Connected Systems in Team HQ"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg><span>Edit in Team HQ</span></a>
    <div id="rs-account"></div></span>
</header>
<aside class="hq rail" id="rail">
  <div class="rail-top"><span class="rail-lbl">Sections</span>
    <button class="railhide" id="rail-hide" type="button" aria-label="Narrow the menu" title="Narrow the menu (backslash)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button></div>
  <div class="railfind">
    <button class="railfind-b" id="rail-qb" type="button" aria-label="Search" title="Search" tabindex="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg></button>
    <svg class="fi" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>
    <input type="search" id="rail-q" autocomplete="off" spellcheck="false" placeholder="Search" aria-label="Search systems and stories">
    <button class="railq-x" id="rail-qx" type="button" aria-label="Clear the search" hidden>×</button>
    <div class="railhits" id="rail-hits" hidden></div>
  </div>
  <nav aria-label="Connected Systems" id="nav">
    <button type="button" data-hq="overview" aria-current="page" title="Overview">__I_overview__<span>Overview</span></button>
    <button type="button" data-hq="help" title="Help">__I_help__<span>Help</span></button>
  </nav>
  <div class="mast-right">
    <div class="railupd" id="rail-upd" hidden><span>As Of</span><b id="rail-upd-t"></b></div>
    <button class="theme-btn" id="theme-btn" type="button"><svg class="ti ti-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6.4 6.4 0 009 9 9 9 0 11-9-9z"/></svg><svg class="ti ti-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><span id="theme-lab">Dark Mode</span></button>
  </div>
</aside>
<div class="railscrim" id="rail-scrim"></div>

<main>
  <section class="view" id="v-map"><div id="csw" class="ov"><div class="msg"><b>Opening Connected Systems…</b>Reading the latest map.</div></div></section>
  <section class="view" id="v-help" hidden>
    <div class="help">
      <div class="k">Help</div>
      <h1>Connected Systems</h1>
      <p>How MISMO’s systems fit together: which system hands what to which, how the data is protected, what each system replaced and what runs on its own. It’s a view-only page; nothing here can be changed.</p>
      <h2>The Pages</h2>
      <ul>
        <li><b>Overview</b>: the headline numbers and the System Map. Point at a box to see what it touches; select it for the full story. The area buttons and Find a System narrow the map.</li>
        <li><b>Follow the Work</b>: step-by-step stories of how work moves between systems. Pick one and choose Play on the Map to watch it travel across the System Map.</li>
        <li><b>Security</b>: each layer that protects the data, and where it lives.</li>
        <li><b>What Changed</b>: what each system replaced.</li>
        <li><b>On Its Own</b>: the jobs that run on a schedule or the moment something changes.</li>
        <li>The other pages show what’s still being finished on each system, the notices systems send each other when something changes, any jobs that failed, and who keeps each system running.</li>
      </ul>
      <h2>How Current It Is</h2>
      <p>Connected Systems is kept in Team HQ. This page picks up every change within about 10 minutes. The date at the foot of the menu (As Of) is the date of the latest map.</p>
      <h2>Getting Access</h2>
      <p>Access is its own item in People &amp; Access (Connected Systems), separate from Team HQ. Ask Jonna Critchley. Having it doesn’t give access to Team HQ or anything else.</p>
      <h2>Search</h2>
      <p>The search box finds systems and stories. Press Ctrl+K (Cmd+K on a Mac) to jump to it, and the backslash key to narrow or widen the menu.</p>
      <h2>The Back Button</h2>
      <p>Your browser’s Back button goes to the last page you were on and closes an open panel or list first; it never undoes a change.</p>
      <div class="vstamp" id="vstamp"></div>
    </div>
  </section>
</main>

<script>
(function(){
  'use strict';
  var BUILD = '__BUILD__';
  var RELAY = 'https://rgvdi67cg27o5kcmiytcqbqnrm0hmztx.lambda-url.us-east-1.on.aws';
  var KEY = 'connected-systems', FILE = '/file/data/systemsmap.json';
  var EDITORS = ['jcritchley@mismo.org', 'jcritchley@mba.org', 'vrios@mismo.org', 'vrios@mba.org'];
  var ICONS = __ICONS__;
  var wrap = document.getElementById('csw'), nav = document.getElementById('nav');
  var subs = [], last = null, lastData = null, page = 'overview', built = '';
  document.getElementById('vstamp').textContent = 'Version ' + BUILD + '.';
  function msg(t, p){ wrap.innerHTML = '<div class="msg"><b></b><span></span></div>'; wrap.querySelector('b').textContent = t; wrap.querySelector('span').textContent = p || ''; }

  /* ---------- the data: one file, read only ---------- */
  function read(){
    var rs = window.ResourcesSession, t = rs && rs.token();
    return fetch(RELAY + '/' + KEY + FILE, { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' }).then(function(r){
      if (r.status === 401) { rs.signIn({ reason: 'expired', toolName: 'Connected Systems', gated: true }); throw new Error('signed out'); }
      if (r.status === 404) return null;
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json(); }).then(function(b){
        if (!b || !b.content) return null;
        var bin = atob(String(b.content).replace(/\s/g, '')), bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return JSON.parse(new TextDecoder('utf-8').decode(bytes)); });
  }
  function snap(data){ var d = (data && data.docs) || {}; return { docs: Object.keys(d).map(function(id){ return { id: id, data: function(){ return d[id]; } }; }) }; }
  function longDate(iso){ if(!iso) return ''; var p = String(iso).split('-'); var d = new Date(+p[0], +p[1]-1, +p[2]); return isNaN(d) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function refresh(){
    return read().then(function(data){
      var sig = JSON.stringify(data && data.docs); if (sig === last) return; last = sig; lastData = data;
      var cur = data && data.docs && data.docs.current;
      if (cur && cur.asOf) { document.getElementById('rail-upd-t').textContent = longDate(cur.asOf); document.getElementById('rail-upd').hidden = false; }
      subs.forEach(function(f){ f(snap(data)); });
    });
  }
  /* what Team HQ's drawing code expects: who is looking (nobody who can edit here) and the one record */
  window.__S = { me: '', viewOnly: true, db: { collection: function(){ return {
    onSnapshot: function(ok){ subs.push(ok); if (lastData) ok(snap(lastData)); return function(){}; },
    doc: function(){ return { set: function(){ return Promise.reject(new Error('Connected Systems is view only here.')); } }; } }; } } };

  /* ---------- pages: Overview, then one page per section, then Help ---------- */
  function sections(){ return [].slice.call(wrap.querySelectorAll('.cs-nav button[data-tab]')).map(function(b){ return b.dataset.tab; }).filter(Boolean); }
  function btnFor(k, label){ var b = document.createElement('button'); b.type = 'button'; b.dataset.hq = k; b.title = label;
    b.innerHTML = ICONS[k] || ICONS[label] || ICONS.Coverage; var s = document.createElement('span'); s.textContent = label; b.appendChild(s);
    b.addEventListener('click', function(){ show(k); }); return b; }
  function buildNav(){
    var L = sections(), sig = L.join('|'); if (sig === built) return; built = sig;
    var first = ['Follow the Work', 'Security', 'What Changed', 'On Its Own'];
    var order = first.filter(function(x){ return L.indexOf(x) >= 0; }).concat(L.filter(function(x){ return first.indexOf(x) < 0; }));
    nav.textContent = '';
    nav.appendChild(btnFor('overview', 'Overview'));
    order.forEach(function(l){ nav.appendChild(btnFor('s:' + l, l)); });
    nav.appendChild(btnFor('help', 'Help'));
    if (page.indexOf('s:') === 0 && L.indexOf(page.slice(2)) < 0) page = 'overview';
    mark();
  }
  function mark(){ [].forEach.call(nav.querySelectorAll('button[data-hq]'), function(b){ if (b.dataset.hq === page) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }); }
  function apply(){
    var sec = page.indexOf('s:') === 0;
    wrap.className = sec ? 'sec' : 'ov';
    if (sec) { var b = wrap.querySelector('.cs-nav button[data-tab="' + page.slice(2).replace(/"/g, '') + '"]'); if (b && b.getAttribute('aria-selected') !== 'true') b.click(); }
  }
  function show(k, keepScroll){
    page = k; mark();
    document.getElementById('v-map').hidden = k === 'help'; document.getElementById('v-help').hidden = k !== 'help';
    if (k !== 'help') apply();
    try { history.replaceState(null, '', k === 'overview' ? location.pathname : '#' + encodeURIComponent(k === 'help' ? 'help' : k.slice(2))); } catch (e) {}
    if (!keepScroll) window.scrollTo(0, 0);
    if (window.matchMedia('(max-width:900px)').matches && window.__rail) window.__rail.hide();
  }
  function fromHash(){ var h = decodeURIComponent(location.hash.slice(1)); if (!h) return 'overview'; if (h === 'help') return 'help'; return 's:' + h; }

  /* ---------- search: systems and stories ---------- */
  window.__deskFind = function(t, push, go){
    var cur = lastData && lastData.docs && lastData.docs.current; if (!cur) return;
    (cur.systems || []).forEach(function(s){ var hay = (s.name + ' ' + (s.what || '')).toLowerCase(); if (hay.indexOf(t) < 0) return;
      push('Systems', s.name, s.status || '', function(){ show('overview'); var i = wrap.querySelector('.cs-find input'); if (i) { i.value = s.name; i.dispatchEvent(new Event('input', { bubbles: true })); i.scrollIntoView({ block: 'center' }); } }); });
    (cur.journeys || []).forEach(function(j){ var hay = (j.title || j.name || '').toLowerCase(); if (!hay || hay.indexOf(t) < 0) return;
      push('Stories', j.title || j.name, 'Follow the Work', function(){ show('s:Follow the Work'); }); });
    sections().forEach(function(l){ if (l.toLowerCase().indexOf(t) >= 0) push('Sections', l, '', function(){ show('s:' + l); }); });
  };

  function boot(){
    var rs = window.ResourcesSession;
    if (!rs) { msg('Connected Systems Couldn’t Load', 'The resources.mismo.org sign-in didn’t load. Check your connection, then reload the page.'); return; }
    rs.requireAccess(KEY, { toolName: 'Connected Systems', eyebrow: 'MISMO' }).then(function(){
      var me = rs.current() && String(rs.current().email || '').toLowerCase();
      document.getElementById('edit-hq').hidden = !(EDITORS.indexOf(me) >= 0 || (rs.role && rs.role('team-hq') === 'admin'));
      return refresh();
    }).then(function(){
      if (!lastData || !lastData.docs || !lastData.docs.current) { msg('Connected Systems Isn’t Ready Yet', 'The map hasn’t been brought over yet. Try again in a few minutes.'); return; }
      var s = document.createElement('script'); s.src = '/team-hq/src/systems.js?v=' + BUILD + '-' + Math.floor(Date.now() / 36e5);
      s.onload = function(){ var CS = window.__hqSystems; if (!CS) { msg('Connected Systems Couldn’t Load', 'Reload the page to try again.'); return; }
        wrap.textContent = ''; wrap.appendChild(CS.page());
        CS.onChange(function(){ buildNav(); if (page !== 'help') apply(); });
        buildNav(); show(fromHash(), true);
        setInterval(function(){ if (!document.hidden) refresh().catch(function(){}); }, 5 * 60000); };
      s.onerror = function(){ msg('Connected Systems Couldn’t Load', 'Check your connection, then reload the page.'); };
      document.body.appendChild(s);
    }).catch(function(e){
      if (e && /signed out/.test(e.message)) return;
      if (e && e.code === 'NO_ACCESS') return;
      msg('Connected Systems Couldn’t Load', 'Something went wrong reading the map (' + ((e && e.message) || 'unknown') + '). Reload the page to try again.');
    });
  }
  document.getElementById('nav').addEventListener('click', function(e){ var b = e.target.closest('button[data-hq]'); if (b && !b.onclick && (b.dataset.hq === 'overview' || b.dataset.hq === 'help') && !built) show(b.dataset.hq); });
  window.addEventListener('hashchange', function(){ var k = fromHash(); if (k !== page) show(k); });
  /* a story played from Follow the Work plays on the System Map, so go to the map to watch it (Jonna, Nov 24, 2026) */
  wrap.addEventListener('click', function(e){
    if (page.indexOf('s:') !== 0 || !e.target.closest('.cs-sb button')) return;
    setTimeout(function(){ if (!wrap.querySelector('.cs-panel .cs-story')) return;
      show('overview', true); var mw = wrap.querySelector('.cs-mapwrap'); if (mw) window.scrollTo(0, Math.max(0, mw.getBoundingClientRect().top + window.scrollY - 80)); }, 60);
  });
  /* the browser's Back button (CN-033, Jonna, Nov 25, 2026): the shared /assets/back.js makes each change of page in
     the left menu a step in the browser's history. Back first closes what's open, one at a time: the list under a
     headline number, then the system or story panel beside the map, each the way its own × does. */
  function press(sel){ var b = wrap.querySelector(sel); if (b) b.click(); }
  if (window.MismoBack) {
    MismoBack.layer({ isOpen: function(){ var d = wrap.querySelector('.cs-drill'); return !!d && !d.hidden; },
      close: function(){ press('.cs-drill .cs-dh .cs-dx'); } });
    MismoBack.layer({ isOpen: function(){ var p = wrap.querySelector('.cs-panel'); return !!p && !!p.parentNode && !p.classList.contains('is-intro') && !p.parentNode.classList.contains('solo'); },
      close: function(){ press('.cs-panel .cs-krow .cs-all, .cs-panel .cs-ph > button.x'); } });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
</script>
<script>
__RAIL__
</script>
</body>
</html>
'''
import sys, datetime
build=sys.argv[1] if len(sys.argv)>1 else datetime.datetime.utcnow().strftime('%Y%m%d-%H%M')
out=page.replace('__META__',head_meta).replace('__CSS__',css_shell).replace('__DEFS__',defs).replace('__RAIL__',rail_js).replace('__BUILD__',build).replace('__ICONS__',json.dumps(ICONS)).replace('__I_overview__',ICONS['overview']).replace('__I_help__',ICONS['help'])
open(sys.argv[2] if len(sys.argv)>2 else __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','index.html'),'w').write(out)
print('built',build,len(out))
