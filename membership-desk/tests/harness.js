// Opens the Membership Desk in a headless browser with a pretend sign-in and a pretend save relay holding made-up
// records, so the page can be checked without touching the real data. Nothing here reaches MISMO, except reading the
// live shared Back-button helper (resources.mismo.org/assets/back.js), which is tested as it is live.
// The page checked is the one the test copy would publish (tools/desk.js make-live).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DESK = path.resolve(__dirname, '..');

const SESSION = `window.ResourcesSession={current:()=>({email:'tester@example.org',name:'Test Person'}),
  token:()=>'t',canEdit:()=>true,role:()=>'admin',requireAccess:()=>Promise.resolve(),signIn:()=>Promise.resolve(),
  onChange:()=>{},require:()=>Promise.resolve(),ready:Promise.resolve()};`;

/* made-up records, the same shapes the real files have */
function sample() {
  const day = new Date().toISOString().slice(0, 10);
  return {
    todos: { asOf: day, todo: { members: [], free: [], iif: [] }, done: {}, pip: [], invPaid: {} },
    square: { pending: [], done: [], waitingPay: [] },
    done: { items: [] },
    invoices: { items: [] },
    contactupdates: { items: [] },
    people: {},
    cases: null,
    applications: { docs: {
      'MA-TEST-1': { id: 'MA-TEST-1', action: 'apply', company: 'Example Lending Co', level: 'Corporate Member', levelPrice: 5000,
        submittedAt: day + 'T10:00:00Z', website: 'https://example.com', mainPhone: '5550100',
        addr: { street: '1 Main St', city: 'Springfield', state: 'IL', zip: '62701', country: 'United States' }, billAddr: { sameAsCompany: true },
        sector: 'Lender', contacts: { primary: { first: 'Pat', last: 'Example', email: 'pat@example.com', title: 'VP' }, billing: { sameAsPrimary: true } } },
      'MA-TEST-2': { id: 'MA-TEST-2', action: 'apply', company: 'Sample Tech LLC', level: 'Associate Member', levelPrice: 2500,
        submittedAt: day + 'T11:00:00Z', contacts: { primary: { first: 'Sam', last: 'Sample', email: 'sam@example.com' } } } } },
  };
}

let BACK = null;
/* MISMO_BACK can point at a local copy of back.js instead (for trying a change before it is published) */
async function backJs() {
  if (BACK !== null) return BACK;
  try {
    if (process.env.MISMO_BACK) BACK = fs.readFileSync(process.env.MISMO_BACK, 'utf8');
    else { const r = await fetch('https://resources.mismo.org/assets/back.js'); BACK = r.ok ? await r.text() : ''; }
  } catch (e) { BACK = ''; }
  return BACK;
}

async function open(opts = {}) {
  const html = execFileSync(process.execPath, [path.join(DESK, 'tools', 'desk.js'), 'make-live'], { encoding: 'utf8' });
  const browser = opts.browser || await chromium.launch();
  const page = await browser.newPage({ viewport: { width: opts.w || 1440, height: opts.h || 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  const store = opts.store || sample();
  await page.route('**/*', async r => {
    const u = r.request().url();
    if (u.startsWith('http://desk.test/membership-desk/') && !u.includes('/releases/')) return r.fulfill({ body: html, contentType: 'text/html' });
    if (u.includes('/assets/session.js')) return r.fulfill({ contentType: 'application/javascript', body: SESSION });
    if (u.includes('/assets/back.js')) return r.fulfill({ contentType: 'application/javascript', body: await backJs() });
    if (u.includes('lambda-url')) {
      const name = decodeURIComponent((u.split('/data/')[1] || '').split('?')[0]);
      if (r.request().method() !== 'GET') return r.fulfill({ status: 403, contentType: 'application/json', body: '{"error":"read only in tests"}' });
      if (name in store && store[name] !== null) return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: store[name], sha: 's0' }) });
      return r.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"NOT_FOUND"}' });
    }
    if (u.startsWith('http://desk.test')) return r.fulfill({ status: 404, body: '' });
    return r.abort();
  });
  await page.goto('http://desk.test/membership-desk/' + (opts.hash || ''));
  await page.waitForTimeout(opts.settle || 2500);
  return { browser, page, errs, store, backLoaded: !!BACK, close: () => opts.browser ? page.close() : browser.close() };
}

module.exports = { open, DESK, backJs };
