// Summit agenda feed for the website.
// Reads Summit HQ's website agenda (private GitMISMO/summit-hq-data, data/feed-website-agenda.json) and writes
// summit-agenda/agenda.json plus each speaker's headshot as an image file in summit-agenda/photos/.
// Summit HQ only lists a summit once "Show on the Website Agenda" is on for it.
// The Summit Agenda page reads agenda.json (Nav Behavior module __mmGS): the General Sessions day and the
// Workshop are drawn from it; with no entry the page keeps what is typed on it.
// Published per session: start, end, kind, title, description, sponsor, break flag, and per speaker: name,
// title, company, role, bio and headshot. Nothing else from Summit HQ (no emails, notes or contacts).
// Nov 25, 2026 (CN-036, for MyMISMO's View Bio button): each speaker also carries "bio", plain text with paragraphs
// separated by a blank line, up to 5,000 characters ("" when Summit HQ has none). Speakers send it through Summit
// HQ's speaker bio and headshot form, which tells them it is used for the agenda and the event app.
// Nov 18, 2026 (asked by the website's Claude): each summit can also carry "grid", the whole week from the
// Summit HQ Schedule (every public session, all four days), once Show on the Website Agenda is on for it on
// the Schedule: { updated, sessions: [{ id, day, date, start, end, type, title, room, desc, sponsor, status }] }.
// Nov 25, 2026 (CN-045, for MyMISMO's Summit Wi-Fi card): each summit can also carry "wifi":
// { network, password, sponsor, note }, once Summit HQ has the network entered (left out until then). The Wi-Fi
// is public on purpose: attendees need it. A summit with only wifi (no gs, wk or grid) is still published.
// Nov 27, 2026 (CN-067, for MyMISMO's meal menus, CN-066): a session can also carry "menu", plain text with one item
// a line, up to 4,000 characters. Summit HQ sends it on each meal in grid (breakfast@<day>, reception-mon@mon,
// reception-tue@tue, newcomer@mon) and on each Break in gs; it is copied in both block() and grid() and left out
// when empty (MyMISMO then shows "The menu shows here once it's set with the hotel").
// Nov 27, 2026 (CN-070, for MyMISMO's Champions Lounge, CN-069): each summit can also carry "lounges":
// [{ title, room, days: [YYYY-MM-DD], desc }], no times, which Summit HQ writes with the week's grid. title and room
// up to 120 characters, desc up to 500, days only the YYYY-MM-DD strings; a lounge with no title is skipped, and
// lounges is left out when empty or missing.
// Published per summit: name, city, dates, gs, wk, grid, wifi and lounges.
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
      people.push({ name: str(p.name, 120), title: str(p.title, 160), company: str(p.company, 160), role: str(p.role, 60), bio: str(p.bio, 5000), photo: await headshot(p) });
    }
    const menu = str(s.menu);
    sessions.push({ start: str(s.start, 20), end: str(s.end, 20), kind: str(s.kind, 60), title: str(s.title, 300), desc: str(s.desc), sponsor: str(s.sponsor, 160), brk: !!s.brk, ...(menu ? { menu } : {}), people });
  }
  if (!sessions.length) return null;
  return { label: str(b.label, 80), day: str(b.day, 20), date: str(b.date, 40), room: str(b.room, 120), sessions };
}

const DAYNAMES = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
const hhmm = (v) => (/^\d{1,2}:\d{2}$/.test(str(v)) ? str(v) : '');
function grid(g) {
  if (!g || !Array.isArray(g.sessions) || !g.sessions.length) return null;
  const sessions = [];
  for (const s of g.sessions) {
    if (!s || !str(s.title) || !hhmm(s.start)) continue;
    const status = ['confirmed', 'tentative', 'cancelled'].includes(str(s.status)) ? str(s.status) : 'confirmed';
    sessions.push({
      id: str(s.id, 120), day: DAYNAMES.has(str(s.day)) ? str(s.day) : '', date: /^\d{4}-\d{2}-\d{2}$/.test(str(s.date)) ? str(s.date) : '',
      start: hhmm(s.start), end: hhmm(s.end), type: str(s.type, 60), title: str(s.title, 300), room: str(s.room, 120),
      desc: str(s.desc), sponsor: str(s.sponsor, 160), status, ...(str(s.menu) ? { menu: str(s.menu) } : {}),
    });
  }
  return sessions.length ? { updated: str(g.updated, 40), sessions } : null;
}

function wifi(w) {
  if (!w || !str(w.network)) return null;
  return { network: str(w.network, 64), password: str(w.password, 64), sponsor: str(w.sponsor, 120), note: str(w.note, 160) };
}

const ymd = (v) => /^\d{4}-\d{2}-\d{2}$/.test(str(v));
function lounges(list) {
  if (!Array.isArray(list)) return null;
  const out = [];
  for (const l of list) {
    if (!l || !str(l.title)) continue;
    out.push({ title: str(l.title, 120), room: str(l.room, 120), days: (Array.isArray(l.days) ? l.days : []).filter(ymd).map((d) => str(d)), desc: str(l.desc, 500) });
  }
  return out.length ? out : null;
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
    const gs = await block(s.gs), wk = await block(s.wk), gr = grid(s.grid), wf = wifi(s.wifi), lg = lounges(s.lounges);
    if (!gs && !wk && !gr && !wf) continue;
    summits[id] = { name: str(s.name, 160), city: str(s.city, 120), dates: str(s.dates, 80), ...(gs ? { gs } : {}), ...(wk ? { wk } : {}), ...(gr ? { grid: gr } : {}), ...(wf ? { wifi: wf } : {}), ...(lg ? { lounges: lg } : {}) };
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
  console.log(ids.length ? ids.map((k) => `${k}: ${summits[k].gs ? summits[k].gs.sessions.length + ' General Sessions items' : 'no General Sessions'}, ${summits[k].wk ? summits[k].wk.sessions.length + ' Workshop items' : 'no Workshop'}, ${summits[k].grid ? summits[k].grid.sessions.length + ' Schedule sessions' : 'no Schedule'}, ${summits[k].wifi ? 'Wi-Fi ' + summits[k].wifi.network : 'no Wi-Fi'}, ${summits[k].lounges ? summits[k].lounges.length + ' lounges' : 'no lounges'}`).join('\n') : 'No summit is on the website agenda yet (Show on the Website Agenda is off).');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
