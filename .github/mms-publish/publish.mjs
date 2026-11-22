/* MMS Publish, step 2 (runs in the GitMISMO.github.io checkout, in the Playwright container).
   1) Refuses to publish over newer work: if mms/index.html was changed since the last publish (its build fingerprint
      isn't the one mms/build.json recorded), or the source is older than the source last published. FORCE=1 skips this.
   2) Copies the new build into mms/, runs the MMS Checks on it, and only if they pass commits and pushes. */
import fs from 'fs'; import { execFileSync } from 'child_process';
const dir = process.argv[2], FILES = ['index.html', 'mms-door.js', 'digest.js', 'digest-run.mjs'];
const sh = (c, a) => execFileSync(c, a, { stdio: 'inherit' });
const fpOf = h => ((String(h).match(/__mmsBuild=\{[^}]*fp:['"]([0-9a-f]+)['"]/) || [])[1]) || '';
const atOf = h => ((String(h).match(/__mmsBuild=\{[^}]*at:['"]([^'"]+)['"]/) || [])[1]) || '';
const rec = fs.existsSync('mms/build.json') ? JSON.parse(fs.readFileSync('mms/build.json', 'utf8')) : null;
const live = fs.existsSync('mms/index.html') ? fs.readFileSync('mms/index.html', 'utf8') : '';
const next = fs.readFileSync(`${dir}/index.html`, 'utf8');
const force = process.env.FORCE === '1', src = process.env.SRC_SHA || '', srcDate = process.env.SRC_DATE || '';
console.log(`Source ${src.slice(0, 10)} (${srcDate}); live page build ${fpOf(live) || 'none'}; new build ${fpOf(next)} (${atOf(next)})`);
if (!fpOf(next)) { console.log('NOT PUBLISHED: the new build has no version stamp.'); process.exit(1); }
/* the very first publish must rebuild exactly what is live, so an out-of-date source can never replace a newer page */
if (!force && !rec && fpOf(live) && fpOf(live) !== fpOf(next)) { console.log(`STOPPED: first publish, and this source builds ${fpOf(next)} but the live page is ${fpOf(live)}. Upload the source the live page was built from first.`); process.exit(1); }
if (!force && rec) {
  if (fpOf(live) && rec.fp && fpOf(live) !== rec.fp) { console.log(`STOPPED: mms/index.html was changed since the last publish (live ${fpOf(live)}, last published ${rec.fp}). Put that change into the source first, or run with force.`); process.exit(1); }
  if (rec.sourceDate && srcDate && srcDate < rec.sourceDate) { console.log(`STOPPED: this source (${srcDate}) is older than the source last published (${rec.sourceDate}). Run with force only if that is intended.`); process.exit(1); }
}
if (rec && rec.fp === fpOf(next) && fpOf(live) === fpOf(next)) { console.log(`Nothing to publish: the live page already has build ${fpOf(next)}.`); process.exit(0); }
for (const f of FILES) if (fs.existsSync(`${dir}/${f}`)) fs.copyFileSync(`${dir}/${f}`, `mms/${f}`);
/* the same checks that run on every change: scripts parse, no keys, page safety list, opens in a browser on made-up records */
try { sh('node', ['.github/mms-checks/check.mjs']); } catch (e) { console.log('NOT PUBLISHED: the MMS Checks failed on this build.'); process.exit(1); }
fs.writeFileSync('mms/build.json', JSON.stringify({ fp: fpOf(next), builtAt: atOf(next), source: src, sourceDate: srcDate, publishedAt: new Date().toISOString(), by: 'MMS Publish' }, null, 2) + '\n');
sh('git', ['config', 'user.name', 'MMS Publish']); sh('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
sh('git', ['add', ...FILES.map(f => `mms/${f}`).filter(f => fs.existsSync(f)), 'mms/build.json']);
try { execFileSync('git', ['diff', '--cached', '--quiet']); console.log('Nothing to publish: the live page already has this build.'); process.exit(0); } catch (e) {}
sh('git', ['commit', '-q', '-m', `MMS published from source ${src.slice(0, 10)} (build ${fpOf(next)})`]);
for (let i = 1; i <= 5; i++) { try { sh('git', ['pull', '-q', '--rebase', 'origin', 'main']); sh('git', ['push', '-q', 'origin', 'HEAD:main']); console.log(`Published build ${fpOf(next)}.`); process.exit(0); } catch (e) { execFileSync('sleep', [String(i * 5)]); } }
console.log('NOT PUBLISHED: could not push after 5 tries.'); process.exit(1);
