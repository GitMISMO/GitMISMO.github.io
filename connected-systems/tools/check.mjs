// Connected Systems checks: run on every change to connected-systems/ (.github/workflows/connected-systems-checks.yml).
// The page parses, has its safety list, carries no keys, reads only its own relay key, and never saves.
import fs from 'node:fs';
import vm from 'node:vm';
const f = new URL('../index.html', import.meta.url);
const s = fs.readFileSync(f, 'utf8');
let bad = 0; const no = m => { bad++; console.log('::error::' + m); }; const ok = m => console.log('ok   ' + m);
const scripts = [...s.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((c, i) => { try { new vm.Script(c); } catch (e) { no('Script ' + i + ' does not parse: ' + e.message); } });
if (scripts.length >= 2) ok(scripts.length + ' scripts parse');
/<meta http-equiv="Content-Security-Policy"[^>]*connect-src 'self' https:\/\/rgvdi67cg27o5kcmiytcqbqnrm0hmztx\.lambda-url\.us-east-1\.on\.aws/.test(s) ? ok('safety list is there and names the relay') : no('The Content-Security-Policy is missing or changed.');
/(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-ant-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})/.test(s) ? no('Something that looks like a key is in the page.') : ok('no keys in the page');
/var KEY = 'connected-systems', FILE = '\/file\/data\/systemsmap\.json'/.test(s) ? ok('reads only its own key and file') : no('The relay key or file changed.');
/method:\s*'(PUT|POST)'/.test(s) || /\/commit\b/.test(s) ? no('The page must never save.') : ok('never saves');
/<script src="\/team-hq\/src\/systems\.js|\/team-hq\/src\/systems\.js\?v=/.test(s) ? ok('draws with Team HQ’s systems.js') : no('The drawing code address changed.');
/var BUILD = '\d{8}-\d{4}'/.test(s) ? ok('version stamp') : no('No version stamp.');
console.log(bad ? bad + ' problem(s).' : 'No problems.'); process.exit(bad ? 1 : 0);
