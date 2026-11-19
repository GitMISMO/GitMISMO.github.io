/* Publishes the MMS's announcement requests for MISMO Media: resources.mismo.org/mms/announcements.json.
   One entry for each announcement the MMS asks MISMO Media for (Call for Participation, open for comment,
   Candidate Recommendation or Final release), with the facts a press release is drafted from: the work
   request, its workgroup leaders (from Elections HQ, as the MMS shows them), the summary, status, license
   and links. Every item here is already public when it is listed (a call for participation, a comment
   period, an approved release). Emails and everything else stay private.
   Requests stay listed while open and for 90 days after MISMO Media marks them done. The file changes only
   when its contents do.
   Shape (fields are only ever added, never renamed or removed):
   {"source":"MMS","updated":"<ISO>","announcements":[{"id","type":"cfp|comment|release","kind","status",
     "requested","done","link","wr","name","publicName","workgroup","groupType","classification","releaseStatus",
     "facilitator","summary","license","availableTo","memberUrl","nonMemberUrl","websiteId","version",
     "commentOpens","commentCloses","mmsUrl","leaders":[{"name","position","company"}]}]} */
import fs from 'fs';
const TOKEN = process.env.MMS_DATA_TOKEN; if (!TOKEN) { console.log('No MMS_DATA_TOKEN; nothing published.'); process.exit(0); }
const GH = process.env.GH_API || 'https://api.github.com', OUT = process.env.ANN_OUT || 'mms/announcements.json', KEEP_DAYS = 90;
async function data(name) {
  const r = await fetch(`${GH}/repos/GitMISMO/mms-data/contents/data/${name}.json`, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github.raw', 'User-Agent': 'mms-robot' } });
  if (r.status === 404) return {}; if (!r.ok) throw new Error(`Could not read ${name}: ${r.status}`);
  return (JSON.parse(await r.text()).docs) || {};
}
const gnorm = s => String(s || '').toLowerCase().replace(/\(.*?\)/g, ' ').replace(/\b(cop|dwg|community of practice|development workgroup|workgroup|task force|area of focus|docs)\b/g, ' ').replace(/[^a-z0-9]/g, '');
const rank = p => { p = String(p).toLowerCase(); return /^chair|^co-chair/.test(p) ? 0 : /vice/.test(p) ? 1 : /lead/.test(p) ? 2 : /rep/.test(p) ? 3 : 4; };
const TYPE = k => /call for participation/i.test(k) ? 'cfp' : /linkedin post/i.test(k) ? 'comment' : /announcement/i.test(k) ? 'release' : '';
const shard = id => { const m = String(id).match(/(19|20)\d{2}/); return 'tickets-' + (m ? m[0] : 'other'); };
const clean = s => String(s || '').trim();
const pub = t => clean(t.cpCard && t.cpCard.title) || clean(t.wp && t.wp.title) || clean(t.productPageName) ||
  clean(t.name).replace(/\s*\((existing|new)[^)]*\)/gi, '').replace(/\s*\([^)]*page\)/gi, '').trim();

const media = await data('media'), cfg = await data('config');
const leaders = ((cfg['config/leaders'] || {}).list || []).map(r => ({ name: r[0], position: r[1], company: r[2], groups: [r[3], r[4], ...String(r[7] || '').split('|')] }));
const cutoff = new Date(Date.now() - KEEP_DAYS * 864e5).toISOString().slice(0, 10);
const reqs = Object.values(media).filter(m => m && m.id && m.ticket && TYPE(m.kind) && m.status !== 'Canceled' && (m.status !== 'Done' || (m.done || m.requested || '') >= cutoff));
const files = {}; for (const n of new Set(reqs.map(m => shard(m.ticket)))) files[n] = await data(n);
const out = [];
for (const m of reqs) {
  const t = files[shard(m.ticket)]['tickets/' + m.ticket]; if (!t || t.deleted) continue;
  const d = t.dates || {}, L = t.links || {}, W = t.wp || {}, D = t.designation || {}, k = gnorm(t.workgroup);
  const isStd = /standard/i.test(t.classification || '');
  out.push({
    id: m.id, type: TYPE(m.kind), kind: m.kind, status: m.status || 'Requested', requested: m.requested || '', done: m.done || '', link: m.link || '',
    wr: t.wr || '', name: t.name || '', publicName: pub(t), workgroup: t.workgroup || '', groupType: t.groupType || '', classification: t.classification || '',
    releaseStatus: W.status || (TYPE(m.kind) === 'release' ? (isStd ? 'Candidate Recommendation' : 'Final') : ''),
    facilitator: t.facilitator || '', summary: clean(W.summary) || clean(t.cpCard && t.cpCard.text),
    license: W.license || D.license || '', availableTo: D.availableTo || '', memberUrl: L.resourceLibrary || '', nonMemberUrl: clean(t.cpCard && t.cpCard.nonMember),
    websiteId: W.off ? '' : (W.id || ''), version: W.version || '', commentOpens: d.commentStart || '', commentCloses: d.commentEnd || '',
    mmsUrl: 'https://resources.mismo.org/mms/#wr=' + encodeURIComponent(t.id),
    leaders: k ? leaders.filter(l => l.groups.some(g => g && gnorm(g) === k)).sort((a, b) => rank(a.position) - rank(b.position) || a.name.localeCompare(b.name)).map(l => ({ name: l.name, position: l.position || '', company: l.company || '' })) : []
  });
}
out.sort((a, b) => (b.requested || '').localeCompare(a.requested || '') || a.id.localeCompare(b.id));
let old = null; try { old = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) {}
if (old && JSON.stringify(old.announcements) === JSON.stringify(out)) { console.log(`Announcements unchanged (${out.length}).`); process.exit(0); }
fs.writeFileSync(OUT, JSON.stringify({ source: 'MMS', note: 'Announcement requests from the MMS for MISMO Media, with the facts to draft from. Public information only.', updated: new Date().toISOString(), announcements: out }, null, 2) + '\n');
console.log(`Announcements updated (${out.length}).`);
