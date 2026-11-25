// Opens the MBA Accounting Desk in a headless browser with a pretend sign-in and a pretend save relay,
// so the page can be checked without touching the real data. Nothing here reaches MISMO.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SESSION = `window.ResourcesSession={current:()=>({email:'tester@example.org',name:'Test Person'}),
  token:()=>'t',canEdit:()=>false,role:()=>'viewer',requireAccess:()=>Promise.resolve(),signIn:()=>Promise.resolve(),
  onChange:()=>{},require:()=>Promise.resolve(),ready:Promise.resolve()};`;

/* the files the desk reads, keyed by their path after /file/ (sample-data.json) */
const SAMPLE = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-data.json'), 'utf8'));

async function open(opts = {}) {
  const browser = opts.browser || await chromium.launch();
  const page = await browser.newPage({ viewport: { width: opts.w || 1440, height: opts.h || 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  const store = Object.assign({}, SAMPLE, opts.store || {});
  await page.route('**/*', async r => {
    const u = r.request().url();
    if (u.startsWith('http://desk.test/accounting-desk/')) return r.fulfill({ body: fs.readFileSync(path.join(ROOT, 'index.html')), contentType: 'text/html' });
    if (u.includes('/assets/session.js')) return r.fulfill({ contentType: 'application/javascript', body: SESSION });
    if (u.includes('/assets/back.js')) return r.fulfill({ contentType: 'application/javascript', body: await backJs() });
    if (u.includes('lambda-url')) {
      const name = decodeURIComponent((u.split('/file/')[1] || '').split('?')[0]);
      if (!store[name]) return r.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"NOT_FOUND"}' });
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ content: Buffer.from(JSON.stringify(store[name])).toString('base64') }) });
    }
    return r.abort();   /* fonts and anything else: not needed for the checks */
  });
  await page.goto('http://desk.test/accounting-desk/' + (opts.hash || ''));
  await page.waitForTimeout(opts.wait || 2500);
  return { page, errs, close: () => page.close() };
}

/* The shared Back-button helper (resources.mismo.org/assets/back.js) is tested as it is live:
   MISMO_BACK can point at a local copy instead (for trying a change before it is published). */
let BACK = null;
async function backJs() {
  if (BACK !== null) return BACK;
  try {
    if (process.env.MISMO_BACK) BACK = fs.readFileSync(process.env.MISMO_BACK, 'utf8');
    else { const r = await fetch('https://resources.mismo.org/assets/back.js'); BACK = r.ok ? await r.text() : ''; }
  } catch (e) { BACK = ''; }
  return BACK;
}

module.exports = { open, ROOT };
