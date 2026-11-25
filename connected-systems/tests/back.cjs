// Connected Systems browser check: the browser's Back button (CN-033, Jonna, Nov 25, 2026).
// Opens the page in a headless browser with a pretend sign-in and a pretend relay that hands over a small made-up map
// (sample-map.json; never the real one). The shared Back helper (/assets/back.js) and Team HQ's drawing code
// (/team-hq/src/systems.js) are loaded from their live copies on resources.mismo.org, as the real page loads them.
// MISMO_BACK can point at a local copy of back.js instead. Nothing here reaches MISMO's data.
// Run: npm install --no-save playwright && npx playwright install chromium && node connected-systems/tests/back.cjs
// (CHROME_PATH can name a browser already on the machine instead of installing one.)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MAP = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-map.json'), 'utf8'));
const SESSION = `window.ResourcesSession={current:()=>({email:'tester@example.org',name:'Test Person'}),
  token:()=>'t',role:()=>'',requireAccess:()=>Promise.resolve(),signIn:()=>Promise.resolve(),onChange:()=>{},ready:Promise.resolve()};`;

const live = {};
async function fromLive(name, local) {
  if (live[name] != null) return live[name];
  if (local) return (live[name] = fs.readFileSync(local, 'utf8'));
  const r = await fetch('https://resources.mismo.org' + name, { cache: 'no-store' });
  if (!r.ok) throw new Error(name + ' could not be read from resources.mismo.org (HTTP ' + r.status + ')');
  return (live[name] = await r.text());
}

let bad = 0;
const ok = m => console.log('ok   ' + m);
const no = m => { bad++; console.log('::error::' + m); };
const expect = (c, m) => { if (!c) throw new Error(m); };
async function check(name, fn) { try { await fn(); ok(name); } catch (e) { no(name + ': ' + e.message); } }

async function open(browser, hash) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.route('**/*', async r => {
    const u = r.request().url();
    if (u.startsWith('http://cs.test/connected-systems/')) return r.fulfill({ contentType: 'text/html', body: fs.readFileSync(path.join(ROOT, 'index.html')) });
    if (u.includes('/assets/session.js')) return r.fulfill({ contentType: 'application/javascript', body: SESSION });
    if (u.includes('/assets/back.js')) return r.fulfill({ contentType: 'application/javascript', body: await fromLive('/assets/back.js', process.env.MISMO_BACK) });
    if (u.includes('/team-hq/src/systems.js')) return r.fulfill({ contentType: 'application/javascript', body: await fromLive('/team-hq/src/systems.js') });
    if (u.includes('lambda-url')) {
      expect(r.request().method() === 'GET', 'the page tried to save');
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ content: Buffer.from(JSON.stringify(MAP)).toString('base64') }) });
    }
    if (u.startsWith('http://cs.test')) return r.fulfill({ status: 404, body: '' });
    return r.abort();
  });
  await page.goto('http://cs.test/connected-systems/' + (hash || ''));
  await page.waitForSelector('#nav button[data-hq="s:Security"]', { timeout: 20000 });
  await page.waitForTimeout(900); // back.js settles on the opening page
  return { page, errs };
}
const current = page => page.evaluate(() => { const b = document.querySelector('#nav button[aria-current]'); return b ? b.dataset.hq : ''; });
const panelOpen = page => page.evaluate(() => { const p = document.querySelector('#csw .cs-panel'); return !!p && !p.classList.contains('is-intro') && !p.parentNode.classList.contains('solo'); });
const go = async (page, k) => { await page.click('#nav button[data-hq="' + k + '"]'); await page.waitForTimeout(400); };
const back = async page => { await page.evaluate(() => history.back()); await page.waitForTimeout(700); };
const forward = async page => { await page.evaluate(() => history.forward()); await page.waitForTimeout(700); };
const pickSystem = async (page, name) => { await page.click('#csw .cs-n[aria-label^="' + name + ',"]'); await page.waitForTimeout(400); };

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  try {
    await check('Back returns to the last page from the menu, Forward goes again', async () => {
      const { page, errs } = await open(browser);
      expect(await current(page) === 'overview', 'it did not open on Overview');
      await go(page, 's:Security'); await go(page, 's:What Changed'); await go(page, 'help');
      await back(page); expect(await current(page) === 's:What Changed', 'Back from Help went to ' + await current(page));
      await back(page); expect(await current(page) === 's:Security', 'second Back went to ' + await current(page));
      await forward(page); expect(await current(page) === 's:What Changed', 'Forward went to ' + await current(page));
      expect(!errs.length, 'page errors: ' + errs.join(' | '));
      await page.close();
    });
    await check('Back closes an open system panel first and stays on the page', async () => {
      const { page, errs } = await open(browser);
      await go(page, 's:Security'); await go(page, 'overview');
      await pickSystem(page, 'Alpha Desk'); expect(await panelOpen(page), 'selecting a system did not open its panel');
      await back(page);
      expect(!(await panelOpen(page)), 'Back did not close the panel');
      expect(await current(page) === 'overview', 'Back left Overview while closing the panel (went to ' + await current(page) + ')');
      await back(page); expect(await current(page) === 's:Security', 'the next Back went to ' + await current(page));
      expect(!errs.length, 'page errors: ' + errs.join(' | '));
      await page.close();
    });
    await check('A panel closed with its × leaves no extra step: Back goes straight to the page before', async () => {
      const { page, errs } = await open(browser);
      await go(page, 's:Security'); await go(page, 'overview');
      await pickSystem(page, 'Alpha Desk'); expect(await panelOpen(page), 'selecting a system did not open its panel');
      await page.click('#csw .cs-panel .cs-ph > button.x'); await page.waitForTimeout(500);
      expect(!(await panelOpen(page)), 'the × did not close the panel');
      await back(page); expect(await current(page) === 's:Security', 'Back after the × went to ' + await current(page));
      expect(!errs.length, 'page errors: ' + errs.join(' | '));
      await page.close();
    });
    await check('Back closes the list under a headline number', async () => {
      const { page, errs } = await open(browser);
      await go(page, 's:Security'); await go(page, 'overview');
      await page.click('#csw .cs-stat[data-k="apps"]'); await page.waitForTimeout(400);
      const shown = () => page.evaluate(() => !document.querySelector('#csw .cs-drill').hidden);
      expect(await shown(), 'the headline number did not open its list');
      await back(page); expect(!(await shown()), 'Back did not close the list');
      expect(await current(page) === 'overview', 'Back left Overview while closing the list');
      expect(!errs.length, 'page errors: ' + errs.join(' | '));
      await page.close();
    });
    await check('Still opens where it always opens (a page named in the address)', async () => {
      const { page, errs } = await open(browser, '#Security');
      expect(await current(page) === 's:Security', 'opened on ' + await current(page));
      expect(!errs.length, 'page errors: ' + errs.join(' | '));
      await page.close();
    });
  } finally { await browser.close(); }
  console.log(bad ? bad + ' problem(s).' : 'No problems.');
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('::error::' + e.message); process.exit(1); });
