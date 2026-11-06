// Summit sponsor feed for the website.
// Reads the Sponsorship Portal records (private GitMISMO/sponsorship-data, data/applications.json)
// and writes sponsors/winter-2027.json: name, tier, link, logo and what each sponsor is sponsoring.
// No contacts, amounts or payment details are published.
// The Summit home, Sponsors and Agenda pages read this file (Nav Behavior module __mmSpons).
//
// Logos: a sponsor already on the website keeps its logo (KNOWN below). For a new sponsor, save a
// web-ready PNG or SVG as sponsors/logos/<name-in-lowercase-with-dashes>.png (for example fico.png);
// until then the site shows the company name in the tile.
import fs from 'node:fs';

const TOKEN = process.env.SPONSOR_DATA_TOKEN || '';
const SRC = 'https://api.github.com/repos/GitMISMO/sponsorship-data/contents/data/applications.json';
const OUT = 'sponsors/winter-2027.json';
const SUMMIT = '2027 Winter Summit';
const EVENTS = ['2027 Series', 'Winter 2027'];
const SHOW = ['Paid', 'Approved', 'Pending Payment', 'In Kind'];
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
function placement(opp, day) {
  const o = String(opp || '').toLowerCase();
  if (!day || /custom series/.test(o)) return null;
  if (/breakfast/.test(o)) return { title: 'Breakfast', type: 'Break', match: 'Breakfast', order: 1 };
  if (/coffee|morning break/.test(o)) return { title: 'Morning Coffee Break', type: 'Break', match: 'Morning Break', order: 2 };
  if (/lunch/.test(o)) return { title: o.includes('newcomer') ? 'Newcomer Luncheon' : 'Lunch', type: 'Break', match: o.includes('newcomer') ? 'Newcomer' : 'Lunch', order: 3 };
  if (/snack|afternoon/.test(o)) return { title: 'Afternoon Snack Break', type: 'Break', match: 'Afternoon', order: 4 };
  if (/reception/.test(o)) return { title: day === 'Monday' ? 'Welcome Reception' : 'Evening Reception', type: 'Networking', match: 'Reception', order: 5 };
  return null;
}

function logoFor(name) {
  if (KNOWN[name]) return KNOWN[name][1];
  for (const ext of ['svg', 'png', 'jpg', 'jpeg', 'webp']) {
    const f = `sponsors/logos/${slug(name)}.${ext}`;
    if (fs.existsSync(f)) return `https://resources.mismo.org/${f}`;
  }
  return '';
}

function urlFor(name, email) {
  if (KNOWN[name]) return KNOWN[name][0];
  const dom = String(email || '').split('@')[1] || '';
  if (!dom || FREE_MAIL.test(dom)) return '';
  return 'https://' + (dom.split('.').length === 2 ? 'www.' + dom : dom);
}

async function main() {
  if (!TOKEN) throw new Error('No token: add the SPONSOR_DATA_TOKEN repository secret (read access to GitMISMO/sponsorship-data).');
  const r = await fetch(SRC, { headers: { authorization: `Bearer ${TOKEN}`, accept: 'application/vnd.github.raw', 'user-agent': 'mismo-sponsor-feed' } });
  if (!r.ok) throw new Error(`Could not read the Portal records (${r.status}). The token needs read access to GitMISMO/sponsorship-data.`);
  const docs = (await r.json()).docs || {};
  const seen = new Map();
  for (const a of Object.values(docs)) {
    if (!EVENTS.includes(a.event) || !SHOW.includes(a.status)) continue;
    const tier = TIERS[String(a.level2027 || '').toUpperCase()];
    if (!tier) continue;
    const raw = String(a.company || '').trim();
    const name = NAMES[raw] || raw;
    if (!name) continue;
    const p = placement(a.opportunity, a.day);
    const cur = seen.get(name);
    if (cur) { // one sponsor, several sponsorships: keep the highest tier, add each placement
      if (Object.values(TIERS).indexOf(tier) < Object.values(TIERS).indexOf(cur.tier)) cur.tier = tier;
      if (p) cur.placements.push({ ...p, day: a.day });
      continue;
    }
    seen.set(name, { name, tier, url: urlFor(name, a.contactEmail), logo: logoFor(name), placements: p ? [{ ...p, day: a.day }] : [] });
  }
  const sponsors = [...seen.values()].sort((x, y) => Object.values(TIERS).indexOf(x.tier) - Object.values(TIERS).indexOf(y.tier) || x.name.localeCompare(y.name));
  const body = { summit: SUMMIT, source: 'Sponsorship Portal', sponsors };
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
  if (prev && JSON.stringify({ ...prev, updated: undefined }) === JSON.stringify({ ...body, updated: undefined })) {
    console.log('No change.');
    return;
  }
  fs.mkdirSync('sponsors', { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), ...body }, null, 1) + '\n');
  for (const s of sponsors) console.log(`${s.tier.padEnd(8)} ${s.name}${s.logo ? '' : '  (no logo yet)'}${s.placements.map((p) => '  · ' + p.day + ' ' + p.title).join('')}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
