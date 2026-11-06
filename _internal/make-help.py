"""Builds help.html (Perry, 6 Nov 2026): Help for MISMO Resources, in Jonna's pattern (a guide for each kind of user).
It takes the home page's frame (styles, logo, top bar) from index.html so the two always match; rerun after changing either.
    python3 _internal/make-help.py
"""
import os, re, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
head, rest = src.split('<body>', 1); chrome = rest.split('<main>', 1)[0]
head = re.sub(r'<title>[^<]*</title>', '<title>Help — MISMO Resources</title>', head, count=1)
chrome = chrome.replace('id="helpBtn" href="/help.html" title="Help">', 'id="helpBtn" href="/help.html" title="Help" aria-current="page">')
GUIDE = {'what': 'MISMO Resources is the front door to every MISMO tool you can use, with one sign-in.',
 'flowTitle': 'How It Works', 'flow': [['Sign In', 'once, for every tool', ''], ['Find It', 'search or browse your tools', ''], ['Pin It', 'a tool, or any page in it', 'ask'], ['Start', 'straight into the tool', 'dk']],
 'roles': [
  ['Everyone', 'You use one or more of MISMO’s tools.',
   ['Sign in once; every tool you can use is listed under Everything You Can Do.',
    'Type what you need into the search box, such as a task, a tool, an initiative or a workgroup, and Start goes straight to it.',
    'Pin a tool, or any page inside it, to keep it at the top of your page. Drag the pins to reorder them.',
    'Switch between light and dark with the button at the top right.'],
   ['Your pins follow you to any computer you sign in on.', 'You see only the tools you have access to. Ask the person who runs a tool if you need it.', 'Press / to jump to the search box.']],
  ['Platform Admin', 'You manage who can use which MISMO tool.',
   ['Open the Admin panel from your account menu, at the top right.',
    'In People, add someone, or change which tools they can use and how: view, edit or admin.',
    'Tools lists every tool on the platform.',
    'Use View as beside a person to see the site the way they do: read-only, for 30 minutes, and recorded in Activity.'],
   ['Changes in People apply to the home page and to every tool.', 'Activity keeps a record of changes and View as sessions.']]]}
CSS = """<style>
/* Help (Perry, 6 Nov 2026) */
.hh-band{position:relative;overflow:hidden;border-radius:16px;background:linear-gradient(120deg,#0F314C 0%,#14486E 58%,#0F7A86 135%);color:#fff;padding:22px 26px 0}
.hh-ey{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94C8E9}
.hh-band h1{font-size:32px;font-weight:800;margin:6px 0 0;color:#fff;letter-spacing:-.01em} .hh-band p{color:#cfe3f1;font-size:14px;margin:6px 0 0}
.hh-tabs{display:flex;gap:10px;margin:18px -26px 0;padding:8px 26px 0;background:rgba(5,22,36,.28);border-top:1px solid rgba(255,255,255,.08)}
.hh-tabs .lbl{align-self:center;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#94C8E9;margin-right:6px}
.hh-tabs button{all:unset;cursor:pointer;padding:10px 18px 11px;border-radius:11px 11px 0 0;font-size:13.5px;font-weight:600;color:#cfe3f1}
.hh-tabs button[aria-selected="true"]{background:var(--paper);color:var(--ink);font-weight:700} .hh-tabs button:focus-visible{outline:2px solid #74BFEB;outline-offset:-2px}
.hh-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:16px;margin-top:18px}
.hh-card{background:var(--surface);border:1px solid var(--line-2);border-radius:14px;padding:18px 20px}
.hh-card h2{font-size:16.5px;margin:0 0 6px;color:var(--ink)} .hh-card h2.more{margin-top:18px}
.hh-who{color:var(--ink-2);margin:0 0 12px;font-size:14px}
.hh-steps{list-style:none;margin:0;padding:0;counter-reset:s}
.hh-steps li{counter-increment:s;display:grid;grid-template-columns:30px 1fr;gap:10px;padding:9px 0;border-top:1px solid var(--line);font-size:14px;line-height:1.5}
.hh-steps li::before{content:counter(s);width:26px;height:26px;border-radius:50%;background:#0F314C;color:#fff;font-weight:800;font-size:12.5px;display:flex;align-items:center;justify-content:center}
[data-theme="dark"] .hh-steps li::before{background:#50A4DB;color:#0F314C}
.hh-good{margin:0;padding-left:18px;font-size:14px;line-height:1.55} .hh-good li{margin:4px 0}
.hh-what{margin:0;font-size:14px;line-height:1.6;color:var(--ink-2)}
.hh-q{margin-top:14px;padding:10px 12px;border-radius:10px;background:var(--sunk);font-size:13px;color:var(--ink-2)} .hh-q b{color:var(--ink)} .hh-q a{color:var(--accent)}
.hh-flow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px}
.hh-node{border-radius:10px;padding:8px 12px;font-size:13px;font-weight:700;background:var(--sunk);color:var(--ink);border:1px solid var(--line-2);text-align:center}
.hh-node small{display:block;font-weight:600;font-size:11px;color:var(--ink-3)}
.hh-node.ask{background:#FBF1DE;border-color:#EBD7AE;color:#7a5413} .hh-node.ask small{color:inherit;opacity:.8}
.hh-node.dk{background:#0F314C;color:#fff;border-color:#0F314C} .hh-node.dk small{color:#a9c7dc} .hh-arr{color:var(--ink-3);font-weight:800}
@media (max-width:900px){ .hh-grid{grid-template-columns:1fr} }
</style>
"""
MAIN = '<main id="helpMain" aria-label="Help"></main>\n'
SCRIPT = """<script src="/assets/session.js"></script>
<script>
  /* Help (Perry, 6 Nov 2026): built by _internal/make-help.py; the wording lives there. */
  const G = __GUIDE__;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const M = document.getElementById('helpMain'); let r = 0;
  function render(focus){ const R = G.roles[r];
    M.innerHTML = `<header class="hh-band"><div class="hh-ey">Help</div><h1>How MISMO Resources Works</h1><p>For each person who uses it: pick who you are. Questions: Perry Williams.</p>
      <div class="hh-tabs" role="tablist" aria-label="Who are you?"><span class="lbl" aria-hidden="true">Who Are You?</span>${G.roles.map((x, i) => `<button type="button" role="tab" data-r="${i}" aria-selected="${i === r}" tabindex="${i === r ? 0 : -1}">${esc(x[0])}</button>`).join('')}</div></header>
      <div class="hh-grid"><section class="hh-card"><h2>${esc(R[0])}: What You Do Here</h2><p class="hh-who">${esc(R[1])}</p><ol class="hh-steps">${R[2].map(x => `<li><span>${esc(x)}</span></li>`).join('')}</ol></section>
        <section class="hh-card"><h2>Good to Know</h2><ul class="hh-good">${R[3].map(x => `<li>${esc(x)}</li>`).join('')}</ul><h2 class="more">What This Is</h2><p class="hh-what">${esc(G.what)}</p>
          <div class="hh-q">Something missing or unclear? Tell <b>Perry Williams</b> (<a href="mailto:pwilliams@mba.org">pwilliams@mba.org</a>).</div></section></div>
      <section class="hh-card" style="margin-top:16px"><h2>${esc(G.flowTitle)}</h2><div class="hh-flow">${G.flow.map(n => `<div class="hh-node ${n[2]}">${esc(n[0])}${n[1] ? `<small>${esc(n[1])}</small>` : ''}</div>`).join('<span class="hh-arr" aria-hidden="true">→</span>')}</div></section>`;
    M.querySelectorAll('[data-r]').forEach(b => { b.addEventListener('click', () => { r = +b.dataset.r; render(true); });
      b.addEventListener('keydown', ev => { if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return; ev.preventDefault(); r = (r + 1) % G.roles.length; render(true); }); });
    if (focus) { const f = M.querySelector(`[data-r="${r}"]`); if (f) f.focus(); } }
  render();
  /* signed in, as on the home page: the page stays hidden until then */
  const RS = window.ResourcesSession;
  if (!RS) document.documentElement.classList.remove('rs-wait');
  else RS.requireSignIn({ toolName: 'MISMO Resources', eyebrow: 'Programs & Operations' }).then(() => document.documentElement.classList.remove('rs-wait'), () => document.documentElement.classList.remove('rs-wait'));
  /* light or dark: the home page's saved choice, light unless chosen */
  const tb = document.getElementById('theme');
  const SUN = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.1"/><path d="M12 2.4v2.3M12 19.3v2.3M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.4 12h2.3M19.3 12h2.3M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>';
  const MOON = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6.4 6.4 0 009 9 9 9 0 11-9-9z"/></svg>';
  function paint(){ const d = document.documentElement.getAttribute('data-theme') === 'dark'; tb.innerHTML = d ? SUN : MOON; tb.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); }
  tb.addEventListener('click', () => { const d = document.documentElement.getAttribute('data-theme') === 'dark', n = d ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', n); try { localStorage.setItem('resources:home:theme', n); } catch (e) {} paint(); });
  paint();
</script>
""".replace('__GUIDE__', json.dumps(GUIDE, ensure_ascii=False))
head = head.replace('</head>', CSS + '</head>', 1)
out = head + '<body>' + chrome + MAIN + SCRIPT + '</body>\n</html>\n'
assert 'home.js' not in out.split('<body>', 1)[1]
open(os.path.join(ROOT, 'help.html'), 'w', encoding='utf-8').write(out); print('help.html', round(len(out) / 1024), 'KB')
