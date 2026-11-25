// Membership Desk browser checks. Run with:  npm test   (in membership-desk/tests; or: node run.js [part of a check name])
// Every check opens the page against a pretend relay with made-up records, so nothing real is read or changed.
// The run fails (exit code 1) if any check fails. Page Checks (tools/desk.js check) run alongside these.
const { chromium } = require('playwright');
const { open, backJs } = require('./harness');

const results = [];
const only = process.argv.slice(2);
async function check(name, fn) {
  if (only.length && !only.some(o => name.toLowerCase().includes(o.toLowerCase()))) return;
  try { await fn(); results.push({ name, ok: true }); console.log('  PASS  ' + name); }
  catch (e) { results.push({ name, ok: false }); console.log('  FAIL  ' + name + '\n        ' + String(e.message).split('\n').join('\n        ')); }
}
function expect(cond, msg) { if (!cond) throw new Error(msg); }
const noErrors = (errs) => expect(!errs.length, 'Page errors:\n' + errs.join('\n'));

(async () => {
  const browser = await chromium.launch();

  /* 1. The desk opens on Home with the made-up set-ups, and nothing goes wrong */
  await check('Opens on Home with the set-ups waiting', async () => {
    const s = await open({ browser });
    const st = await s.page.evaluate(() => ({ tab: (document.querySelector('.hq nav button[aria-current]') || {}).dataset?.hq, rows: document.querySelectorAll('#v-home button.row').length }));
    expect(st.tab === 'home', 'Home is not the page showing: ' + JSON.stringify(st));
    expect(st.rows >= 1, 'no set-ups showed under Your To Do: ' + JSON.stringify(st));
    noErrors(s.errs); await s.close();
  });

  /* 2. The browser's Back button (Jonna, Nov 25, 2026; CN-033): it closes the panel, then goes to the last page you were on */
  await check('Back button: closes the panel, then returns to the last page', async () => {
    expect(await backJs(), 'could not read the live /assets/back.js');
    const s = await open({ browser });
    const state = () => s.page.evaluate(() => ({
      tab: (document.querySelector('.hq nav button[aria-current]') || {}).dataset?.hq || '',
      pane: document.getElementById('pane').classList.contains('on'),
      at: location.href, back: !!window.MismoBack }));
    const go = async t => { await s.page.click('.hq nav button[data-hq="' + t + '"]'); await s.page.waitForTimeout(600); };
    const back = async () => { await s.page.evaluate(() => history.back()); await s.page.waitForTimeout(1000); };
    let st = await state();
    expect(st.back, 'the shared Back helper (MismoBack) did not load');
    expect(st.tab === 'home', 'the desk did not open on Home: ' + JSON.stringify(st));
    const start = st.at;
    await go('pip'); await go('done');
    st = await state(); expect(st.tab === 'done', 'Completed did not open: ' + JSON.stringify(st));
    await back(); st = await state(); expect(st.tab === 'pip', 'Back from Completed should land on Payment in Process: ' + JSON.stringify(st));
    await s.page.evaluate(() => history.forward()); await s.page.waitForTimeout(1000);
    st = await state(); expect(st.tab === 'done', 'Forward should go to Completed again: ' + JSON.stringify(st));
    await back(); await back(); st = await state(); expect(st.tab === 'home', 'Back twice should land on Home: ' + JSON.stringify(st));
    expect(st.at === start, 'the address changed: ' + st.at);
    /* a set-up's panel: Back closes it first and stays on the page */
    await s.page.click('#v-home button.row'); await s.page.waitForTimeout(800);
    expect((await state()).pane, 'a set-up did not open in the right-hand panel');
    await back(); st = await state();
    expect(!st.pane && st.tab === 'home', 'Back should close the panel and stay on Home: ' + JSON.stringify(st));
    /* closing the panel with its X doesn't leave a step behind */
    await go('help'); await go('home');
    await s.page.click('#v-home button.row'); await s.page.waitForTimeout(800);
    await s.page.click('#pane-x'); await s.page.waitForTimeout(800);
    expect(!(await state()).pane, 'the X did not close the panel');
    await back(); st = await state(); expect(st.tab === 'help', 'after closing the panel with its X, Back should go straight to Help: ' + JSON.stringify(st));
    expect(st.at === start, 'the address changed: ' + st.at);
    noErrors(s.errs); await s.close();
  });

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log('\n' + (results.length - failed.length) + ' of ' + results.length + ' checks passed.');
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
