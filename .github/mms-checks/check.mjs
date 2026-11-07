/* MMS automatic checks (GitHub Actions). Made-up records only: this repository is public. Exits 1 on any failure. */
import fs from 'fs'; import { createRequire } from 'module'; import { execFileSync } from 'child_process';
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); }; const pass = m => console.log('PASS ' + m);
const read = p => fs.readFileSync(p, 'utf8');
const pages = ['mms/index.html', 'im-review/index.html', 'awg-review/index.html'].filter(p => fs.existsSync(p));
const scripts = ['mms/mms-door.js', 'mms/digest.js', 'mms/digest-run.mjs'].filter(p => fs.existsSync(p));

/* 1) every script parses */
const tmp = fs.mkdtempSync('/tmp/mmsck-');
for (const p of pages) { const h = read(p); let i = 0;
  for (const m of h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) { if (!m[1].trim()) continue; const f = `${tmp}/s${i++}.js`; fs.writeFileSync(f, m[1]);
    try { execFileSync('node', ['--check', f], { stdio: 'pipe' }); } catch (e) { fail(`${p}: inline script ${i} does not parse: ${String(e.stderr).split('\n').slice(0, 4).join(' ')}`); } }
  pass(`${p}: ${i} inline script(s) parse`); }
for (const p of scripts) { try { execFileSync('node', ['--check', p], { stdio: 'pipe' }); pass(`${p} parses`); } catch (e) { fail(`${p} does not parse: ${String(e.stderr).split('\n').slice(0, 4).join(' ')}`); } }

/* 2) no keys, tokens or passwords */
const SECRET = [/ghp_[A-Za-z0-9]{30,}/, /github_pat_[A-Za-z0-9_]{40,}/, /sk-ant-[A-Za-z0-9_-]{20,}/, /AKIA[0-9A-Z]{16}/, /[?&]sig=[A-Za-z0-9%_-]{30,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /xox[baprs]-[A-Za-z0-9-]{10,}/];
for (const p of [...pages, ...scripts]) { const t = read(p); const hit = SECRET.find(r => r.test(t)); if (hit) fail(`${p}: something that looks like a key or token (${hit})`); else pass(`${p}: no keys or tokens`); }

/* 3) the page safety list */
for (const p of ['mms/index.html']) { const t = read(p); /http-equiv="Content-Security-Policy"/.test(t) ? pass(`${p}: page safety list present`) : fail(`${p}: no Content-Security-Policy`); }

/* 4) the MMS opens in a browser on made-up records */
const { chromium } = createRequire(process.cwd() + '/')('playwright');
const RELAY = 'https://rgvdi67cg27o5kcmiytcqbqnrm0hmztx.lambda-url.us-east-1.on.aws';
const docs = { tickets: { 'tickets/WR2026_90': { id: 'WR2026_90', wr: 'WR2026_90', uid: 'WR2026_90', name: 'Sample Work Request', workgroup: 'Sample CoP', facilitator: 'Kellie Stoll', workType: 'Initiative', reqType: 'New', stage: 'work', state: 'active', stageSince: '2026-10-01', dates: { submitted: '2026-09-01' }, history: [] } } };
const browser = await chromium.launch(); const page = await browser.newPage(); const errs = [];
page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
await page.route('**/*', async r => { const u = new URL(r.request().url());
  if (u.origin === RELAY) { const name = decodeURIComponent(u.pathname.split('/').pop()); const m = r.request().method();
    if (m === 'GET') { const coll = name.replace(/-\d{4}$|-other$/, ''); const d = name === 'tickets-2026' ? docs.tickets : {};
      return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ data: { docs: d }, sha: 'x' }) }); }
    return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ sha: 'y' }) }); }
  if (u.host === 'resources.mismo.org') {
    if (u.pathname === '/mms/' || u.pathname === '/mms/index.html') return r.fulfill({ contentType: 'text/html', body: read('mms/index.html') });
    if (u.pathname === '/mms/mms-door.js') return r.fulfill({ contentType: 'application/javascript', body: read('mms/mms-door.js') });
    if (u.pathname === '/assets/session.js') return r.fulfill({ contentType: 'application/javascript', body: "window.ResourcesSession={token:()=>'t',current:()=>({name:'Sam Staff',email:'sam@mismo.org'}),role:()=>'admin',canEdit:()=>true,requireAccess:()=>Promise.resolve('admin'),signIn:()=>new Promise(()=>{}),signOut:()=>{},onChange:()=>{}};" });
    return r.fulfill({ status: 404, body: '' }); }
  return r.fulfill({ status: 200, contentType: 'text/plain', body: '' }); });
await page.goto('https://resources.mismo.org/mms/');
/* poll with evaluate (waitForFunction can trip the page safety list's no-eval rule in some browser versions) */
let opened = false; for (let i = 0; i < 60 && !opened; i++) { opened = await page.evaluate(() => !!(window.__mms && window.__mms.ready)).catch(() => false); if (!opened) await page.waitForTimeout(500); }
opened ? pass('the MMS opens') : fail('the MMS did not finish opening');
const views = await page.evaluate(() => [...document.querySelectorAll('#nav button[data-hq]')].map(b => b.dataset.hq)).catch(() => []);
for (const v of views) { await page.evaluate(v => document.querySelector('#nav button[data-hq="' + v + '"]').click(), v); await page.waitForTimeout(300); }
views.length ? pass(`every screen opened (${views.length})`) : fail('no screens found');
const blocked = await page.evaluate(() => (window.__mmsErrs || []).map(e => e.msg)).catch(() => []);
const all = [...new Set([...errs, ...blocked])].filter(m => !/Failed to fetch|NetworkError/.test(m));
all.length ? fail('errors on the page: ' + all.slice(0, 5).join(' | ')) : pass('no errors on any screen');
await browser.close();
console.log(bad ? `${bad} check(s) FAILED` : 'ALL CHECKS PASS'); process.exit(bad ? 1 : 0);
