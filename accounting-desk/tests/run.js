// MBA Accounting Desk checks. Run with:  npm test   (from accounting-desk/; or: node tests/run.js)
// Every check opens the page against a pretend relay with sample data, so nothing real is read.
// The run fails (exit code 1) if any check fails; GitHub then emails the person who saved the change.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chromium } = require('playwright');
const { open, ROOT } = require('./harness');

const results = [];
const only = process.argv.slice(2);
async function check(name, fn) {
  if (only.length && !only.some(o => name.toLowerCase().includes(o.toLowerCase()))) return;
  try { await fn(); results.push({ name, ok: true }); console.log('  PASS  ' + name); }
  catch (e) { results.push({ name, ok: false, why: e.message }); console.log('  FAIL  ' + name + '\n        ' + String(e.message).split('\n').join('\n        ')); }
}
function expect(cond, msg) { if (!cond) throw new Error(msg); }
const noErrors = errs => expect(!errs.length, 'Page errors:\n' + errs.join('\n'));

(async () => {
  const browser = await chromium.launch();
  const opts = o => Object.assign({ browser }, o || {});
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  /* 1. Every script on the page reads as valid JavaScript */
  await check('Every page script parses', async () => {
    const bad = []; const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g; let m, i = 0;
    while ((m = re.exec(html))) { i++; try { new vm.Script(m[2], { filename: 'index.html script ' + i }); } catch (e) { bad.push('script ' + i + ': ' + e.message); } }
    expect(!bad.length, bad.join('\n'));
  });

  /* 2. The shared Back helper is loaded right after session.js, and never copied or replaced here (CN-033) */
  await check('Back helper is loaded from /assets/back.js right after session.js', async () => {
    expect(/<script src="\/assets\/session\.js"><\/script>\n<script src="\/assets\/back\.js"><\/script>/.test(html), 'the /assets/back.js line is not right after the /assets/session.js line');
    expect(!/history\.pushState/.test(html), 'the page makes its own history steps (history.pushState); leave that to /assets/back.js');
    expect(!fs.existsSync(path.join(ROOT, 'back.js')), 'a copy of back.js is in accounting-desk/; use the shared one');
  });

  /* 3. The browser's Back button: it closes the panel, then goes to the last page you were on (CN-033, Nov 25) */
  await check('Back button: closes the panel, then returns to the last page', async () => {
    const s = await open(opts());
    const state = () => s.page.evaluate(() => ({
      tab: (document.querySelector('.hq nav button[data-hq][aria-current]') || {}).dataset?.hq || '',
      pane: document.getElementById('pane').classList.contains('on'), helper: !!window.MismoBack }));
    expect((await state()).helper, 'the shared Back helper (/assets/back.js) did not load');
    const go = async tab => { await s.page.click('.hq nav button[data-hq="' + tab + '"]'); await s.page.waitForTimeout(1200); };
    const back = async () => { await s.page.evaluate(() => history.back()); await s.page.waitForTimeout(1200); };
    const start = (await state()).tab;
    expect(start === 'overview', 'the desk should open on the Overview: ' + start);
    await go('help'); await go('close');
    let st = await state(); expect(st.tab === 'close', 'Monthly Close did not open: ' + JSON.stringify(st));
    await back(); st = await state(); expect(st.tab === 'help', 'Back from Monthly Close should land on Help: ' + JSON.stringify(st));
    await s.page.evaluate(() => history.forward()); await s.page.waitForTimeout(1200);
    st = await state(); expect(st.tab === 'close', 'Forward should go to Monthly Close again: ' + JSON.stringify(st));
    await back(); await back(); st = await state(); expect(st.tab === start, 'Back to where the desk opened (' + start + '): ' + JSON.stringify(st));
    /* a panel: Back closes it first and stays on the page */
    await go('close');
    const row = await s.page.$('#close-list tbody tr.go');
    expect(row, 'Monthly Close has no rows to open');
    await row.click(); await s.page.waitForTimeout(1000);
    expect((await state()).pane, 'a month did not open in the right-hand panel');
    await back(); st = await state();
    expect(!st.pane && st.tab === 'close', 'Back should close the panel and stay on Monthly Close: ' + JSON.stringify(st));
    await back(); st = await state(); expect(st.tab === start, 'Back after the panel should go to the page before Monthly Close: ' + JSON.stringify(st));
    /* closing the panel with its X doesn't leave a step behind */
    await go('close'); await (await s.page.$('#close-list tbody tr.go')).click(); await s.page.waitForTimeout(1000);
    expect((await state()).pane, 'a month did not open in the right-hand panel the second time');
    await s.page.click('#pane-x'); await s.page.waitForTimeout(800);
    expect(!(await state()).pane, 'the X did not close the panel');
    await back(); st = await state(); expect(st.tab === start, 'after closing the panel with X, Back should go straight to the page before: ' + JSON.stringify(st));
    noErrors(s.errs); await s.close();
  });

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log('\n' + (results.length - failed.length) + ' passed, ' + failed.length + ' failed');
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
