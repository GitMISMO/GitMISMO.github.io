// Summit sponsor feed for the website.
// Reads the Sponsorship Portal records (private GitMISMO/sponsorship-data, data/applications.json)
// and writes one file per 2027 summit (sponsors/winter-2027.json, spring-2027.json, fall-2027.json):
// name, tier, link, logo and what each sponsor is sponsoring.
// No contacts, amounts or payment details are published.
// The Summit home, Sponsors and Agenda pages read this file (Nav Behavior module __mmSpons).
//
// Logos: a sponsor already on the website keeps its logo (KNOWN below). For a new sponsor, save a
// web-ready PNG or SVG as sponsors/logos/<name-in-lowercase-with-dashes>.png (for example fico.png);
// until then the site shows the company name in the tile.
import fs from 'node:fs';

const TOKEN = process.env.SPONSOR_DATA_TOKEN || '';
const SRC = 'https://api.github.com/repos/GitMISMO/sponsorship-data/contents/data/applications.json';
const SHOW = ['Paid', 'Approved', 'Pending Payment', 'In Kind'];
// One feed per summit of the 2027 Series. A Series record counts toward every summit unless its custom
// package lists only some of them; a single-summit record ("Winter 2027") counts toward that summit only.
const SUMMITS = [
  { season: 'Winter', summit: '2027 Winter Summit', out: 'sponsors/winter-2027.json', events: ['2027 Series', 'Winter 2027'],
    workshop: { title: 'AI Governance in Practice Workshop', match: 'AI Governance in Practice' } },
  { season: 'Spring', summit: '2027 Spring Summit', out: 'sponsors/spring-2027.json', events: ['2027 Series', 'Spring 2027'] },
  { season: 'Fall', summit: '2027 Fall Summit', out: 'sponsors/fall-2027.json', events: ['2027 Series', 'Fall 2027'] },
];
const TIERS = { PLATINUM: 'Platinum', GOLD: 'Gold', SILVER: 'Silver', BRONZE: 'Bronze' };
const HL = 'https://higherlogicdownload.s3.amazonaws.com/MISMO/b0af7660-1193-44cf-ad90-4073559f7527/UploadedImages/';

// Name shown on the website when it differs from the Portal
const NAMES = { 'California Mortgage Bankers': 'California MBA' };

// Sponsors already on the website: their link and logo
const KNOWN = {
  'Factual Data': ['https://www.factualdata.com', HL + 'fdlogo3f573562e07844af9b9962043e03b7a4.png'],
  'ICE Mortgage Technology': ['https://www.icemortgagetechnology.com', HL + 'ice_mt_primary_logo.jpg'],
  'Optimal Blue': ['https://www.optimalblue.com', HL + 'ob-logo-2025-_horizontal-color_-_2_.png'],
  'Xactus': ['https://xactus.com', HL + 'xactus_logo_color_rgb_pos.png?sfvrsn=5e2eeb00_1'],
  'Dark Matter Technologies': ['https://dmatter.com', HL + 'dark-matter-technologies-logo-stacked6fa6033e932640bfb486c1edc3c7c9f2.png'],
  'California MBA': ['https://www.cmba.com', HL + 'california-mba-logo.png'],
  'Crittora': ['https://crittora.com', HL + 'crittora-logo-400px.png'],
  'Experian': ['https://www.experian.com', HL + 'experian-logo.png'],
  'First American': ['https://www.firstam.com', HL + 'first-american-logo.png'],
  'Lenders One': ['https://www.lendersone.com', HL + 'lenders-one-logo_stacked_rgb.png'],
};

const FREE_MAIL = /^(gmail|googlemail|yahoo|outlook|hotmail|live|msn|aol|icloud|me|mac|comcast|proton|protonmail)\./i;
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Where a sponsorship shows on the agenda and in "What Our Sponsors Power".
// match = the agenda line it attaches to on that day.
// Nov 18, 2026 (asked by the website's Claude): a Workshop sponsorship goes on that summit's Monday
// workshop. The Portal records it with no day, so it takes Monday; the title and match are the summit's
// workshop when it is named above, otherwise just "Workshop".
function placement(opp, day, S) {
  const o = String(opp || '').toLowerCase();
  if (/workshop/.test(o) && !/custom series/.test(o)) {
    const w = (S && S.workshop) || { title: 'Workshop', match: 'Workshop' };
    return { title: w.title, type: 'Workshop', match: w.match, order: 6, day: day || 'Monday' };
  }
  if (!day || /custom series/.test(o)) return null;
  if (/breakfast/.test(o)) return { title: 'Breakfast', type: 'Break', match: 'Breakfast', order: 1 };
  if (/coffee|morning break/.test(o)) return { title: 'Morning Coffee Break', type: 'Break', match: 'Morning Break', order: 2 };
  if (/lunch/.test(o)) return { title: o.includes('newcomer') ? 'Newcomer Luncheon' : 'Lunch', type: 'Break', match: o.includes('newcomer') ? 'Newcomer' : 'Lunch', order: 3 };
  if (/snack|afternoon/.test(o)) return { title: 'Afternoon Snack Break', type: 'Break', match: 'Afternoon', order: 4 };
  if (/reception/.test(o)) return { title: day === 'Monday' ? 'Welcome Reception' : 'Evening Reception', type: 'Networking', match: 'Reception', order: 5 };
  return null;
}

function logoFor(name) {
  for (const ext of ['svg', 'png', 'jpg', 'jpeg', 'webp']) {
    const f = `sponsors/logos/${slug(name)}.${ext}`;
    if (fs.existsSync(f)) return `https://resources.mismo.org/${f}`;
  }
  // a logo in sponsors/logos (usually the Portal's) wins over the old website logo
  if (KNOWN[name]) return KNOWN[name][1];
  return '';
}

function urlFor(name, email) {
  if (KNOWN[name]) return KNOWN[name][0];
  const dom = String(email || '').split('@')[1] || '';
  if (!dom || FREE_MAIL.test(dom)) return '';
  return 'https://' + (dom.split('.').length === 2 ? 'www.' + dom : dom);
}

// ---- Sponsor logos from the Sponsorship Portal (Nov 21, 2026) ----
// The logo a sponsor gives the Portal is the one the website shows. Before each build this copies the
// Portal's own logo copies (private GitMISMO/sponsorship-data) into sponsors/logos/<slug>.<ext>:
//   1. a logo the team added on the company card: data/logo-co-<company key>.json
//   2. the logo sent with the online prospectus: data/logo-<reference>.json (the Intake flow's copy)
// Each is {name, type, data (base64)}. Only a real PNG, JPG or WebP, or an SVG with no scripts, up to 4 MB.
// A logo in sponsors/logos wins over the KNOWN list. A replaced logo moves to sponsors/logos/archive/
// (archive, never delete). A Portal problem never stops the sponsor feed.
// The Portal keeps the original in SharePoint (Sponsor Logos), which this run cannot read, so a logo
// reaches the website only once the Portal has its copy in sponsorship-data.
const DATA_DIR = 'https://api.github.com/repos/GitMISMO/sponsorship-data/contents/data';
const LOGO_MAX = 4 * 1024 * 1024;
const CO_NOISE = new Set(['inc', 'llc', 'ltd', 'corp', 'corporation', 'co', 'company', 'the', 'ai', 'io', 'com', 'group', 'technologies', 'technology']);
// the same keys the Portal uses (companyKey and refKey in the Portal's index.html)
const companyKey = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').split(/[^a-z0-9]+/).filter((w) => w && !CO_NOISE.has(w)).join('');
const refKey = (s) => String(s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const gh = (url, raw) => fetch(url, { headers: { authorization: 'Bearer ' + TOKEN, accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json', 'user-agent': 'mismo-sponsor-feed' } });

function decodeLogo(doc) {
  if (doc && doc.content && typeof doc.content === 'object') doc = doc.content;
  const b64 = String((doc && (doc.data || doc.base64)) || '').replace(/^data:[^,]*,/, '').replace(/\s+/g, '');
  if (!b64) return null;
  const buf = Buffer.from(b64, 'base64');
  if (!buf.length || buf.length > LOGO_MAX) return null;
  // trust the bytes, not the file name
  if (buf[0] === 0x89 && buf.toString('latin1', 1, 4) === 'PNG') return { buf, ext: 'png' };
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { buf, ext: 'jpg' };
  if (buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return { buf, ext: 'webp' };
  const t = buf.toString('utf8');
  if (/<svg[\s>]/i.test(t) && !/<script|<foreignobject|<iframe|<embed|<object|javascript:|\son[a-z]+\s*=/i.test(t)) return { buf, ext: 'svg' };
  return null;
}

async function syncLogos(docs) {
  const r = await gh(DATA_DIR, false);
  if (!r.ok) throw new Error('could not list the Portal data folder (' + r.status + ')');
  const have = new Set((await r.json()).map((f) => f.name));
  const byName = new Map();
  for (const a of Object.values(docs)) {
    if (!SHOW.includes(a.status)) continue;
    const raw = String(a.company || '').trim();
    if (!raw) continue;
    const name = NAMES[raw] || raw;
    if (!byName.has(name)) byName.set(name, { raws: new Set(), recs: [] });
    byName.get(name).raws.add(raw);
    byName.get(name).recs.push(a);
  }
  const today = new Date().toISOString().slice(0, 10);
  let wrote = 0;
  for (const [name, e] of byName) {
    const s = slug(name);
    if (!s) continue;
    const stores = [];
    for (const raw of [...e.raws, name]) { const k = companyKey(raw); if (k) stores.push('logo-co-' + k); }
    e.recs.slice().sort((x, y) => String(y.dateSubmitted || '').localeCompare(String(x.dateSubmitted || '')))
      .forEach((x) => { const k = refKey(x.prospectusRef); if (k) stores.push('logo-' + k); });
    let got = null, from = '';
    for (const st of new Set(stores)) {
      if (!have.has(st + '.json')) continue;
      try {
        const rr = await gh(DATA_DIR + '/' + st + '.json', true);
        if (rr.ok) got = decodeLogo(await rr.json());
      } catch (err) { console.log('::warning::' + st + '.json: ' + err.message); }
      if (got) { from = st; break; }
      console.log('::warning::' + st + '.json is not a usable PNG, JPG, WebP or SVG logo; skipped.');
    }
    if (!got) continue;
    const file = 'sponsors/logos/' + s + '.' + got.ext;
    if (fs.existsSync(file) && fs.readFileSync(file).equals(got.buf)) continue;
    for (const ext of ['svg', 'png', 'jpg', 'jpeg', 'webp']) {
      const f = 'sponsors/logos/' + s + '.' + ext;
      if (!fs.existsSync(f)) continue;
      fs.mkdirSync('sponsors/logos/archive', { recursive: true });
      fs.renameSync(f, 'sponsors/logos/archive/' + s + '-' + today + '.' + ext);
    }
    fs.writeFileSync(file, got.buf);
    wrote++;
    console.log('Logo for ' + name + ' from the Portal (' + from + '.json) saved as ' + file);
  }
  console.log('Portal logos: ' + wrote + ' new or changed.');
}

// CN-072: the MyMISMO phone prospectus (resources.mismo.org/Sponsorship-Prospectus/app/) reads
// /sponsors/prospectus-app.json to know which prospectus pages to show. The Portal's
// "Publish on MyMISMO" switches live in sponsorship-data data/settings.json at docs.main.mymismo.pages.
// Copy only the four page switches (never mymismo.changed, which has staff names). With no
// mymismo settings yet, show only the 2027 Series (Winter) page.
const APP_OUT = 'sponsors/prospectus-app.json';
const APP_KEYS = ['series-winter', 'spring', 'fall', 'spring-fall'];
async function writeProspectusApp() {
  let src = null;
  const r = await gh(DATA_DIR + '/settings.json', true);
  if (r.ok) {
    const s = JSON.parse(await r.text());
    src = s && s.docs && s.docs.main && s.docs.main.mymismo && s.docs.main.mymismo.pages;
  } else if (r.status !== 404) {
    throw new Error('Could not read data/settings.json (' + r.status + ')');
  }
  const pages = {};
  for (const k of APP_KEYS) pages[k] = src && typeof src === 'object' ? src[k] === true : k === 'series-winter';
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(APP_OUT, 'utf8')); } catch {}
  if (prev && JSON.stringify(prev.pages) === JSON.stringify(pages)) { console.log('Prospectus app pages: no change.'); return; }
  fs.mkdirSync('sponsors', { recursive: true });
  fs.writeFileSync(APP_OUT, JSON.stringify({ pages, updated: new Date().toISOString() }, null, 1) + '\n');
  console.log('Prospectus app pages: ' + JSON.stringify(pages));
}

async function main() {
  if (!TOKEN) { // not set up yet: leave the current file alone, don't fail the run
    console.log('::warning::No token yet. Add the SPONSOR_DATA_TOKEN repository secret (read access to GitMISMO/sponsorship-data). The current sponsors file is unchanged.');
    return;
  }
  const r = await fetch(SRC, { headers: { authorization: `Bearer ${TOKEN}`, accept: 'application/vnd.github.raw', 'user-agent': 'mismo-sponsor-feed' } });
  if (!r.ok) throw new Error(`Could not read the Portal records (${r.status}). The token needs read access to GitMISMO/sponsorship-data.`);
  const docs = (await r.json()).docs || {};
  try { await syncLogos(docs); } catch (e) { console.log('::warning::Portal logos skipped: ' + e.message); }
  for (const S of SUMMITS) build(S, docs);
  try { await writeProspectusApp(); } catch (e) { console.log('::warning::Prospectus app pages skipped: ' + e.message); }
}

function build(S, docs) {
  const { season: SEASON, summit: SUMMIT, out: OUT, events: EVENTS } = S;
  const seen = new Map();
  for (const a of Object.values(docs)) {
    if (!EVENTS.includes(a.event) || !SHOW.includes(a.status)) continue;
    // A 2027 Series record with a custom package covers only the summits listed in it, each at its
    // own tier, opportunity and day (Connections Map: "Reading Sponsorship Portal records").
    // For example a Spring & Fall package has no Winter line, so it is not a Winter sponsor.
    let level = a.level2027, opp = a.opportunity, day = a.day;
    const lines = (Array.isArray(a.custom) ? a.custom : (a.custom && typeof a.custom === 'object' ? Object.values(a.custom) : [])).filter((c) => c && c.s);
    if (a.event === '2027 Series' && lines.length) {
      const line = lines.find((c) => String(c.s).trim().toLowerCase() === SEASON.toLowerCase());
      if (!line) continue;
      level = line.tier || level; opp = line.opp || ''; day = line.day || '';
    }
    const tier = TIERS[String(level || '').toUpperCase()];
    if (!tier) continue;
    const raw = String(a.company || '').trim();
    const name = NAMES[raw] || raw;
    if (!name) continue;
    const p = placement(opp, day, S);
    const cur = seen.get(name);
    if (cur) { // one sponsor, several sponsorships: keep the highest tier, add each placement
      if (Object.values(TIERS).indexOf(tier) < Object.values(TIERS).indexOf(cur.tier)) cur.tier = tier;
      if (p) cur.placements.push({ ...p, day: p.day || day });
      continue;
    }
    seen.set(name, { name, tier, url: urlFor(name, a.contactEmail), logo: logoFor(name), placements: p ? [{ ...p, day: p.day || day }] : [] });
  }
  const sponsors = [...seen.values()].sort((x, y) => Object.values(TIERS).indexOf(x.tier) - Object.values(TIERS).indexOf(y.tier) || x.name.localeCompare(y.name));
  // Placements held back from the website (Jonna). Delete an entry once the Portal record is changed.
  const HOLD_PLACEMENTS = [
    { name: 'Optimal Blue', match: 'AI Governance in Practice' }, // Nov 23, 2026: may sponsor a different session instead
  ];
  for (const s of sponsors) s.placements = s.placements.filter(p => !HOLD_PLACEMENTS.some(h => h.name === s.name && String(p.match || p.title || '').includes(h.match)));
  const body = { summit: SUMMIT, source: 'Sponsorship Portal', sponsors };
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
  if (prev && JSON.stringify({ ...prev, updated: undefined }) === JSON.stringify({ ...body, updated: undefined })) {
    console.log(`${SUMMIT}: no change.`);
    return;
  }
  fs.mkdirSync('sponsors', { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), ...body }, null, 1) + '\n');
  console.log(`${SUMMIT}: ${sponsors.length} sponsors`);
  for (const s of sponsors) console.log(`${s.tier.padEnd(8)} ${s.name}${s.logo ? '' : '  (no logo yet)'}${s.placements.map((p) => '  · ' + p.day + ' ' + p.title).join('')}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
