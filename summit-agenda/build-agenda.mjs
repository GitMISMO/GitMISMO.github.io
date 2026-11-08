// Summit agenda feed for the website.
// Reads Summit HQ's website agenda (private GitMISMO/summit-hq-data, data/feed-website-agenda.json) and writes
// summit-agenda/agenda.json plus each speaker's headshot as an image file in summit-agenda/photos/.
// Summit HQ only lists a summit once "Show on the Website Agenda" is on for it.
// The Summit Agenda page reads agenda.json (Nav Behavior module __mmGS): the General Sessions day and the
// Workshop are drawn from it; with no entry the page keeps what is typed on it.
// Published per session: start, end, kind, title, description, sponsor, break flag, and per speaker: name,
// title, company, role and headshot. Nothing else from Summit HQ (no emails, notes or contacts).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TOKEN = process.env.SUMMIT_DATA_TOKEN || '';
const REPO = 'GitMISMO/summit-hq-data';
const API = `https://api.github.com/repos/${REPO}`;
const OUT = 'summit-agenda/agenda.json';
const PHOTOS = 'summit-agenda/photos';
const PUBLIC = 'https://resources.mismo.org/summit-agenda/photos/';
const EXT = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/gif': 'gif' };
const H = { authorization: `Bearer ${TOKEN}`, 'user-agent': 'mismo-summit-agenda', 'x-github-api-version': '2022-11-28' };

const str = (v, max = 4000) => (v == null ? '' : String(v)).trim().slice(0, max);
const httpUrl = (v) => (/^https:\/\/[^\s"'<>]+$/i.test(str(v)) ? str(v) : '');

async function raw(file) {
  const r = await fetch(`${API}/contents/${file}`, { headers: { ...H, accept: 'application/vnd.github.raw' } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Could not read ${file} (${r.status}).`);
  return r.json();
}

// photo "photo-jane-doe" (or "photo-jane-doe.json", or "jane-doe") -> data/photo-jane-doe.json
function photoFile(id) {
  const base = str(id).replace(/\.json$/i, '').replace(/^data\//, '');
  if (!/^[A-Za-z0-9._-]+$/.test(base)) return '';
  return `data/${base}.json`;
}

const wanted = new Set();
async function headshot(person) {
  const file = photoFile(person.photo);
  if (file) {
    const doc = await raw(file).catch(() => null);
    const m = /^data:(image\/[a-z+.-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(str(doc && doc.doc && doc.doc.img, 8e6));
    const ext = m && EXT[m[1].toLowerCase()];
    if (ext) {
      const bytes = Buffer.from(m[2].replace(/\s+/g, ''), 'base64');
      const name = `${path.basename(file, '.json')}-${crypto.createHash('sha1').update(bytes).digest('hex').slice(0, 8)}.${ext}`;
      wanted.add(name);
      const dest = path.join(PHOTOS, name);
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, bytes);
      return PUBLIC + name;
    }
  }
  return httpUrl(person.photoUrl);
}

async function block(b) {
  if (!b || !Array.isArray(b.sessions) || !b.sessions.length) return null;
  const sessions = [];
  for (const s of b.sessions) {
    if (!s || !str(s.title) && !s.brk) continue;
    const people = [];
    for (const p of Array.isArray(s.people) ? s.people : []) {
      if (!p || !str(p.name)) continue;
      people.push({ name: str(p.name, 120), title: str(p.title, 160), company: str(p.company, 160), role: str(p.role, 60), photo: await headshot(p) });
    }
    sessions.push({ start: str(s.start, 20), end: str(s.end, 20), kind: str(s.kind, 60), title: str(s.title, 300), desc: str(s.desc), sponsor: str(s.sponsor, 160), brk: !!s.brk, people });
  }
  if (!sessions.length) return null;
  return { label: str(b.label, 80), day: str(b.day, 20), date: str(b.date, 40), room: str(b.room, 120), sessions };
}

async function main() {
  if (!TOKEN) {
    console.log('::warning::No token yet. The SUMMIT_DATA_TOKEN or SPONSOR_DATA_TOKEN secret needs read access to GitMISMO/summit-hq-data. The current agenda is unchanged.');
    return;
  }
  const repo = await fetch(API, { headers: { ...H, accept: 'application/vnd.github+json' } });
  if (!repo.ok) {
    console.log(`::warning::The token can't read GitMISMO/summit-hq-data (${repo.status}). Give the "Summit Sponsor Feed" token read access to that repository. The current agenda is unchanged.`);
    return;
  }
  const feed = await raw('data/feed-website-agenda.json');
  const src = (feed && feed.doc && feed.doc.summits) || {};
  fs.mkdirSync(PHOTOS, { recursive: true });
  const summits = {};
  for (const [id, s] of Object.entries(src)) {
    if (!/^[A-Za-z0-9_-]+$/.test(id) || !s) continue;
    const gs = await block(s.gs), wk = await block(s.wk);
    if (!gs && !wk) continue;
    summits[id] = { name: str(s.name, 160), city: str(s.city, 120), dates: str(s.dates, 80), ...(gs ? { gs } : {}), ...(wk ? { wk } : {}) };
  }
  // headshots no longer on any agenda come down with it (Summit HQ keeps the originals)
  for (const f of fs.readdirSync(PHOTOS)) if (!wanted.has(f) && f !== '.gitkeep') fs.unlinkSync(path.join(PHOTOS, f));
  const body = { source: 'Summit HQ', sourceUpdated: str(feed && feed.doc && feed.doc.updatedAt, 40), summits };
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
  const same = (a, b) => JSON.stringify({ ...a, updated: undefined, sourceUpdated: undefined }) === JSON.stringify({ ...b, updated: undefined, sourceUpdated: undefined });
  if (prev && same(prev, body)) { console.log('No change.'); return; }
  fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), ...body }, null, 1) + '\n');
  const ids = Object.keys(summits);
  console.log(ids.length ? ids.map((k) => `${k}: ${summits[k].gs ? summits[k].gs.sessions.length + ' General Sessions items' : 'no General Sessions'}, ${summits[k].wk ? summits[k].wk.sessions.length + ' Workshop items' : 'no Workshop'}`).join('\n') : 'No summit is on the website agenda yet (Show on the Website Agenda is off).');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
