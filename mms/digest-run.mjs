/* MMS Daily Digest: the scheduled sender.
   Run by .github/workflows/mms-digest.yml every weekday afternoon. It reads the MMS,
   Meeting Trackers and Service Orders records straight from their private repositories,
   builds each facilitator's email with the same engine the MMS uses (mms/digest.js),
   and hands each one to the MMS email flow in Power Automate.

   It only sends when Settings > Daily Digest in the MMS says:
     - the digest is On,
     - "Sent By" is "The scheduled sender on GitHub",
     - today is a send day, it is the send hour (Eastern) or later, and today's digest has not gone yet.
   Two repository secrets switch it on; without them it says so and stops:
     MMS_DATA_TOKEN       a read-only GitHub token for mms-data, meeting-trackers-data and the so-*-data repositories
     MMS_MAIL_FLOW_URL    the MMS email flow's HTTP link (the same one in Settings > Notifications)
   Add DRY_RUN=1 to the run to build everything and send nothing. */
import { createRequire } from 'module';
import zlib from 'zlib';
const require = createRequire(import.meta.url);
const D = require('./digest.js');
const TOKEN = process.env.MMS_DATA_TOKEN, FLOW = process.env.MMS_MAIL_FLOW_URL, DRY = process.env.DRY_RUN === '1', FORCE = process.env.FORCE === '1';
if (!TOKEN) { console.log('Not switched on yet: add the MMS_DATA_TOKEN secret.'); process.exit(0); }

async function gh(repo, path) {
  const r = await fetch(`https://api.github.com/repos/GitMISMO/${repo}/contents/${path}`, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github.raw', 'User-Agent': 'mms-digest' } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`${repo}/${path}: ${r.status}`);
  return JSON.parse(await r.text());
}
const docsOf = (f, coll) => { const out = {}; Object.entries((f && f.docs) || {}).forEach(([p, v]) => { const [c, id] = p.split('/'); if (c === coll) out[id] = v; }); return out; };

const now = new Date(), et = D.et(now);
const cfgFile = await gh('mms-data', 'data/config.json');
const config = docsOf(cfgFile, 'config');
const settings = D.settings(config.digest);
if (!FORCE) {
  if (!settings.on) { console.log('The digest is off in Settings.'); process.exit(0); }
  if (settings.sender !== 'action') { console.log('Settings say the MMS sends the digest, not this scheduled sender.'); process.exit(0); }
  if (!settings.days.includes(et.dow)) { console.log('Not a send day.'); process.exit(0); }
  /* GitHub often runs scheduled jobs late or skips them, so send on the first run at or after the send hour.
     The workflow remembers a day once it is done, so later runs that day stop before reaching here. */
  if (Math.floor(et.min / 60) < settings.hour) { console.log(`Not the send hour yet (now ${Math.floor(et.min / 60)}:00 ET, sending at ${settings.hour}:00).`); process.exit(0); }
}

/* the MMS */
const tickets = {};
const y = now.getFullYear();
for (const n of ['tickets-other', ...Array.from({ length: y - 2014 + 1 }, (_, i) => 'tickets-' + (2015 + i))]) Object.assign(tickets, docsOf(await gh('mms-data', `data/${n}.json`), 'tickets'));
const arch = docsOf(await gh('mms-data', 'data/arch.json'), 'arch');
const media = docsOf(await gh('mms-data', 'data/media.json'), 'media');
const cf = await gh('mms-data', 'data/comments.json');
const comments = cf ? (Array.isArray(cf.items) ? cf.items : Object.values(cf.docs || {})) : [];

/* Meeting Trackers */
let mt = null;
try {
  const KEY = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const h8 = s => { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return ('0000000' + h.toString(36)).slice(-8); };
  const safe = s => String(s).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-{3,}/g, '--').replace(/^-+|-+$/g, '') || 'x';
  const fname = s => { s = safe(s); return s.length <= 40 ? s : s.slice(0, 31).replace(/-+$/, '') + '-' + h8(s); };
  const groups = {}, sched = {}, logged = {};
  const base = await gh('meeting-trackers-data', 'data/baseline.json');
  if (base && base.doc && base.doc.z) {
    const B = JSON.parse(zlib.gunzipSync(Buffer.from(base.doc.z, 'base64')).toString('utf8'));
    const gks = B.groups.map(x => KEY(x[0]));
    B.groups.forEach((x, i) => { groups[gks[i]] = { name: x[0], archived: !!x[2], facilitator: x[3] || '' }; });
    Object.assign(sched, B.sched || {});
    B.meetings.forEach(m => { const k = gks[m[0]]; (logged[k] = logged[k] || {})[m[1]] = 1; });
  }
  const sd = await gh('meeting-trackers-data', 'data/sched.json');
  Object.entries(((sd && sd.docs['sched/all']) || {}).items || {}).forEach(([k, v]) => { sched[k] = v.removed ? { removed: true } : Object.assign({}, sched[k] || {}, v); });
  const gd = await gh('meeting-trackers-data', 'data/groups.json');
  Object.entries(((gd && gd.docs['groups/all']) || {}).items || {}).forEach(([k, v]) => { groups[k] = Object.assign({}, groups[k] || {}, v); });
  const idx = await gh('meeting-trackers-data', 'data/own-index.json');
  for (const p of Object.keys((idx && idx.docs) || {})) {
    const id = p.split('/')[1] || '', k = id.split('__')[0], yr = +id.split('__')[1];
    if (yr < y - 1 || !sched[k] || sched[k].removed || !sched[k].rule) continue;
    const f = await gh('meeting-trackers-data', `data/${fname('m-' + id)}.json`);
    Object.keys((f && f.doc && f.doc.items) || {}).forEach(dt => { (logged[k] = logged[k] || {})[dt] = 1; });
  }
  const G = {};
  Object.entries(sched).forEach(([k, v]) => { const g = groups[k] || {}; G[k] = { name: g.name || v.sheetName || k, fac: v.fac || g.facilitator || '', rule: v.rule, en: v.en, removed: !!v.removed, hold: !!g.hold, archived: !!g.archived }; });
  mt = { groups: G, logged };
} catch (e) { console.log('Meeting Trackers not read:', e.message); }

/* Service Orders hours */
const hours = {};
const V = ['actualize', 'falcon', 'phoenix', 'trex', 'trudigital', 'vianteye'];
for (const p of ((config.people || {}).facilitators || [])) {
  const slug = String(p.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const known = (settings.hoursVendor || {})[p.name];
  search: for (const v of known ? [known, ...V.filter(x => x !== known)] : V) for (const fy of ['fy' + (y + 1), 'fy' + y]) {
    try { const f = await gh(`so-${v}-data`, `hours/${slug}-${fy}.json`); if (f && f.weeks) { hours[p.name] = f; break search; } } catch (e) { /* no access to that company's records */ }
  }
}

const list = D.build({ now, tickets, process: config.process, people: config.people, arch, media, comments, mt, hours, settings: config.digest });
const N = config.notify || {}, holdUntil = ('holdUntil' in N) ? N.holdUntil : '2026-11-20';
const HELD = !!holdUntil && new Date().toISOString().slice(0, 10) < holdUntil;
if (HELD) console.log(`Email is on hold until ${holdUntil}: building the digests but not sending them. Staff see them in MMS Notifications as Held.`);
let sent = 0;
for (const m of list) {
  if (!m.to.length) { console.log(`Skipped ${m.name}: no email on file.`); continue; }
  if (m.empty && settings.skipEmpty) { console.log(`Skipped ${m.name}: nothing to report.`); continue; }
  console.log(`${DRY ? '[dry run] ' : ''}${m.name}: ${m.subject} (${m.sections} sections)`);
  if (DRY || !FLOW || HELD) continue;
  const r = await fetch(FLOW, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: m.to.join(';'), cc: m.cc.join(';'), subject: m.subject, body: m.text, html: m.html, from: ((config.notify || {}).from) || 'workrequests@mismo.org', kind: 'digest' }) });
  if (r.ok) sent++; else console.log(`  Not sent: the flow answered ${r.status}`);
}
if (!FLOW && !DRY) console.log('Built the digests but did not send them: add the MMS_MAIL_FLOW_URL secret.');
console.log(`${sent} digest${sent === 1 ? '' : 's'} sent.`);
/* tell the workflow today is done (not for dry runs, and not when nothing could be sent yet) */
if (!DRY && (FLOW || HELD) && process.env.GITHUB_OUTPUT) { const fs = await import('fs'); fs.appendFileSync(process.env.GITHUB_OUTPUT, 'done=1\n'); fs.writeFileSync('.digest-done', new Date().toISOString()); }
