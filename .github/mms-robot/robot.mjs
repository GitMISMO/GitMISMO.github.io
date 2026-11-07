/* MMS Robot: runs the MMS's automatic steps on a schedule, so they happen even when nobody on staff has the MMS open
   (reminders, retrying emails, bringing in approved Initiative Hub requests, IM and AWG hand-offs, the System Health
   check). It opens the real MMS page in a headless browser, signed in as "MMS Robot", with the save relay replaced
   by GitHub: reads and saves go straight to each system's data repository, with the same conflict checks.
   It never writes to another system's repository: the Initiative Hub, Elections HQ and Meeting Trackers are read only.
   This repository is public: the log shows counts only, never record contents.
   Secrets: MMS_ROBOT_TOKEN (read and write: mms-data, im-review-data, awg-review-data),
            MMS_DATA_TOKEN (read only: meeting-trackers-data, elections-hq-data, GitMISMO-initiative-hub-requests, so-*-data),
            MMS_MAIL_KEY (lets the MMS email flow accept the robot's emails). */
import fs from 'fs'; import { createRequire } from 'module';
const { chromium } = createRequire(process.cwd() + '/')('playwright');
const RW = process.env.MMS_ROBOT_TOKEN, RO = process.env.MMS_DATA_TOKEN || RW, KEY = process.env.MMS_MAIL_KEY || '';
const GH = process.env.GH_API || 'https://api.github.com', ORG = 'GitMISMO', RUN_MS = +(process.env.RUN_MS || 120000);
const FLOW_OVERRIDE = process.env.FLOW_OVERRIDE || '';   /* tests only */
if (!RW) { console.log('Not switched on yet: add the MMS_ROBOT_TOKEN secret.'); process.exit(0); }
const RELAY = 'https://rgvdi67cg27o5kcmiytcqbqnrm0hmztx.lambda-url.us-east-1.on.aws';
const REPO = { mms: 'mms-data', 'im-review': 'im-review-data', 'awg-review': 'awg-review-data', 'meeting-trackers': 'meeting-trackers-data', 'elections-hq': 'elections-hq-data', 'hub-requests': 'GitMISMO-initiative-hub-requests' };
const WRITE = new Set(['mms', 'im-review', 'awg-review']);
const stat = { reads: 0, writes: 0, conflicts: 0, denied: 0, mail: 0, mailFailed: 0 };
const PAGE = process.env.PAGE_DIR || 'mms';
const json = (status, body) => ({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });
const ghHead = tok => ({ Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json', 'User-Agent': 'mms-robot', 'X-GitHub-Api-Version': '2022-11-28' });
async function ghGet(repo, path, tok) {
  const r = await fetch(`${GH}/repos/${ORG}/${repo}/contents/${path}`, { headers: ghHead(tok) });
  if (r.status === 404) return null; if (!r.ok) throw Object.assign(new Error('GitHub ' + r.status), { status: r.status });
  const b = await r.json(); let text = b.content ? Buffer.from(b.content, 'base64').toString('utf8') : '';
  if (!b.content && b.git_url) { const g = await fetch(b.git_url, { headers: ghHead(tok) }).then(x => x.json()); text = Buffer.from(g.content, 'base64').toString('utf8'); }
  return { data: JSON.parse(text), sha: b.sha };
}
async function ghPut(repo, path, content, sha, tok, who) {
  const body = { message: `MMS Robot: ${path}`, content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'), committer: { name: 'MMS Robot', email: 'workrequests@mismo.org' } }; if (sha) body.sha = sha;
  const r = await fetch(`${GH}/repos/${ORG}/${repo}/contents/${path}`, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, ghHead(tok)), body: JSON.stringify(body) });
  if (r.ok) { const b = await r.json(); return { ok: true, sha: b.content && b.content.sha }; }
  return { ok: false, status: (r.status === 409 || r.status === 422) ? 409 : r.status };
}
async function relay(route) {
  const req = route.request(), u = new URL(req.url()), m = req.method(); const seg = u.pathname.split('/').filter(Boolean); const project = seg[0], kind = seg[1], rest = decodeURIComponent(seg.slice(2).join('/'));
  if (m === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
  if (kind === 'ask') return route.fulfill(json(503, { error: 'UNAVAILABLE', message: 'AI review runs only from a person’s MMS' }));
  if (kind === 'file' && /^so-/.test(project)) { try { const f = await ghGet(project + '-data', rest, RO); stat.reads++; return f ? route.fulfill(json(200, f.data)) : route.fulfill(json(404, { error: 'NOT_FOUND' })); } catch (e) { return route.fulfill(json(e.status || 502, { error: 'GITHUB' })); } }
  const repo = REPO[project]; if (!repo || kind !== 'data') return route.fulfill(json(404, { error: 'UNKNOWN_PROJECT' }));
  const path = `data/${rest}.json`, tok = WRITE.has(project) ? RW : RO;
  try {
    if (m === 'GET') { const f = await ghGet(repo, path, tok); stat.reads++; return f ? route.fulfill(json(200, { data: f.data, sha: f.sha })) : route.fulfill(json(404, { error: 'NOT_FOUND' })); }
    if (m === 'PUT') { if (!WRITE.has(project)) { stat.denied++; return route.fulfill(json(403, { error: 'VIEW_ONLY', message: 'The robot only reads ' + project })); }
      const b = JSON.parse(req.postData() || '{}'); const r = await ghPut(repo, path, b.content, b.sha, tok);
      if (r.ok) { stat.writes++; return route.fulfill(json(200, { sha: r.sha })); } if (r.status === 409) { stat.conflicts++; return route.fulfill(json(409, { error: 'CONFLICT', message: 'sha mismatch' })); }
      return route.fulfill(json(r.status, { error: 'GITHUB', status: r.status })); }
    return route.fulfill(json(405, { error: 'METHOD' }));
  } catch (e) { return route.fulfill(json(e.status || 502, { error: 'GITHUB', status: e.status || 502 })); }
}
async function flow(route) {
  const req = route.request(); let body = {}; try { body = JSON.parse(req.postData() || '{}'); } catch (e) {}
  body.key = KEY; delete body.token;   /* the flow accepts the robot by its key, not a sign-in */
  try { const r = await fetch(FLOW_OVERRIDE || req.url(), { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-mms-key': KEY }, body: JSON.stringify(body) });
    stat.mail++; if (!r.ok) stat.mailFailed++; return route.fulfill({ status: r.status, contentType: 'text/plain', headers: { 'access-control-allow-origin': '*' }, body: await r.text() }); }
  catch (e) { stat.mail++; stat.mailFailed++; return route.fulfill({ status: 502, body: '' }); }
}
const browser = await chromium.launch(); const ctx = await browser.newContext({ timezoneId: 'America/New_York' }); const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
await page.route('**/*', async route => { const u = new URL(route.request().url());
  if (u.origin === RELAY) return relay(route);
  if (/\.environment\.api\.powerplatform\.com$|\.logic\.azure\.com$/.test(u.host)) return flow(route);
  if (u.host === 'resources.mismo.org') {
    if (u.pathname === '/mms/' || u.pathname === '/mms/index.html') return route.fulfill({ contentType: 'text/html', body: fs.readFileSync(`${PAGE}/index.html`, 'utf8') });
    if (u.pathname === '/mms/mms-door.js') return route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(`${PAGE}/mms-door.js`, 'utf8') });
    if (u.pathname === '/assets/session.js') return route.fulfill({ contentType: 'application/javascript', body:
      "(function(){var R={mms:'admin','im-review':'admin','awg-review':'admin','meeting-trackers':'view','elections-hq':'view','hub-requests':'view'};" +
      "window.ResourcesSession={token:function(){return 'mms-robot';},current:function(){return {name:'MMS Robot',email:'mms-robot@mismo.org'};},role:function(p){return R[p]||null;},canEdit:function(p){return R[p]==='admin';}," +
      "requireAccess:function(p){return R[p]?Promise.resolve(R[p]):Promise.reject(Object.assign(new Error('no access'),{code:'NO_ACCESS'}));},signIn:function(){return new Promise(function(){});},signOut:function(){},onChange:function(){}};})();" });
    return route.fulfill({ status: 404, body: '' }); }
  if (u.host === 'api.github.com') { try { const r = await fetch(u.href, { headers: { 'User-Agent': 'mms-robot', Accept: 'application/vnd.github+json' } }); return route.fulfill({ status: r.status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: await r.text() }); }
    catch (e) { return route.fulfill(json(502, {})); } }
  if (u.host === 'cdnjs.cloudflare.com') return route.continue();
  return route.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
await page.goto('https://resources.mismo.org/mms/');
let ready = false; for (let i = 0; i < 90 && !ready; i++) { ready = await page.evaluate(() => !!(window.__mms && window.__mms.ready && window.__mms.autoOn)).catch(() => false); if (!ready) await page.waitForTimeout(1000); }
if (!ready) { console.log('The MMS did not finish opening.', errs.slice(0, 3).join(' | ')); await browser.close(); process.exit(1); }
await page.waitForTimeout(RUN_MS);
for (let i = 0; i < 60; i++) { const busy = await page.evaluate(() => !!(window.__hqRelay && window.__hqRelay.pending())).catch(() => false); if (!busy) break; await page.waitForTimeout(1000); }
const sum = await page.evaluate(() => ({ tickets: Object.keys(__mms.tickets || {}).length, health: __mms.health && __mms.health.level, red: __mms.health ? __mms.health.rows.filter(r => r.level === 'bad').map(r => r.label) : [], stale: !!__mms.stale })).catch(() => ({}));
await browser.close();
console.log(`Opened the MMS (${sum.tickets} work requests). Reads ${stat.reads}, saves ${stat.writes}, conflicts retried ${stat.conflicts}, read-only refusals ${stat.denied}. Emails posted ${stat.mail}${stat.mailFailed ? ` (${stat.mailFailed} refused)` : ''}. Health: ${sum.health}${sum.red && sum.red.length ? ' (red: ' + sum.red.join(', ') + ')' : ''}.`);
const real = errs.filter(m => !/Failed to fetch|NetworkError/.test(m));
if (real.length) { console.log('Page errors: ' + real.length + (process.env.SHOW_ERRORS ? ' ' + real.slice(0, 3).join(' | ') : '')); process.exit(1); }
