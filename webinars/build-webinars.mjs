// Builds webinars/webinars.json for the MISMO website Education page pop-ups.
// Source: MBA's public Complimentary Education listing (mba.org, where MISMO webinars are posted) + each event page.
// Only MISMO webinars: events whose title mentions MISMO (Get to Know MISMO, 5 Key MISMO Initiatives, ...).
// Runs daily from .github/workflows/webinars.yml. Keeps the old file if MBA can't be read.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const BASE = 'https://www.mba.org';
const LIST = BASE + '/conferences-and-education/education-courses/complimentary-education';
const OUT = new URL('./webinars.json', import.meta.url);
const UA = 'MISMO-website-webinar-feed/1.0 (+https://www.mismo.org)';
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' } });
      if (r.ok) return await r.text();
      if (r.status === 404) return '';
    } catch (e) { /* retry */ }
    await sleep(1500 * (i + 1));
  }
  throw new Error('Could not read ' + url);
}
const decode = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#39;|&rsquo;|&#8217;/g, '’').replace(/&quot;/g, '"').replace(/&ndash;|&#8211;/g, '–')
  .replace(/&mdash;|&#8212;/g, '—').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/\s+/g, ' ').trim();

// Offset of America/New_York (e.g. "-05:00") on a given date
function etOffset(y, m, d) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'longOffset' });
  const part = f.formatToParts(new Date(Date.UTC(y, m - 1, d, 17))).find((p) => p.type === 'timeZoneName').value;
  return part.replace('GMT', '') || '+00:00';
}
function to24(t) {
  const m = t.match(/(\d{1,2}):(\d\d)\s*([AP])M/i); if (!m) return null;
  let h = +m[1] % 12; if (/p/i.test(m[3])) h += 12;
  return String(h).padStart(2, '0') + ':' + m[2];
}

async function main() {
  // 1) Every event on the listing pages
  const events = new Map();
  for (let p = 1; p <= 30; p++) {
    const html = await get(p === 1 ? LIST : LIST + '/' + p);
    if (!html) break;
    let added = 0;
    for (const m of html.matchAll(/href="([^"]*\/conferences-and-education\/event\/(\d{4})\/(\d\d)\/(\d\d)\/[^"]*-(\d+))"[^>]*>([\s\S]*?)<\/a>/g)) {
      const title = decode(m[6]);
      const id = m[5];
      if (!title || events.has(id)) continue;
      events.set(id, { id, url: new URL(m[1], BASE).href, title, ymd: `${m[2]}-${m[3]}-${m[4]}` });
      added++;
    }
    if (!added) break;
    await sleep(400);
  }
  if (!events.size) throw new Error('No events found on the MBA listing');

  // 2) Keep upcoming MISMO webinars, read date/time from each event page
  const today = new Date().toISOString().slice(0, 10);
  const wanted = [...events.values()].filter((e) => e.ymd >= today && /\bMISMO\b/i.test(e.title));
  const out = { updated: new Date().toISOString(), source: LIST, mismo: [] };
  for (const e of wanted) {
    const html = await get(e.url);
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
    const title = h1 ? decode(h1) : e.title;
    const text = decode(html);
    const re = new RegExp(`(${MONTHS.join('|')}) (\\d{1,2}), (\\d{4})\\s+(\\d{1,2}:\\d\\d\\s*[AP]M)\\s*[-–]\\s*(\\d{1,2}:\\d\\d\\s*[AP]M)`, 'i');
    const t = text.match(re);
    const [y, mo, d] = e.ymd.split('-').map(Number);
    const start = t ? t[4].replace(/\s+/g, ' ').toUpperCase() : '';
    const end = t ? t[5].replace(/\s+/g, ' ').toUpperCase() : '';
    const off = etOffset(y, mo, d);
    const endIso = `${e.ymd}T${to24(end) || '23:59'}:00${off}`;
    const item = {
      id: e.id,
      date: e.ymd,
      label: `${MONTHS[mo - 1]} ${d}, ${y}`,
      title: title.replace(/\s+-\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i, '').trim(),
      fullTitle: title,
      start, end, endsAt: endIso,
      url: e.url,
      register: `https://ebiz.mba.org/ebusiness/Meetings/MeetingRegistration.aspx?ID=${e.id}`,
    };
    out.mismo.push(item);
    await sleep(300);
  }
  out.mismo.sort((a, b) => a.endsAt.localeCompare(b.endsAt));

  await mkdir(new URL('.', OUT), { recursive: true });
  let old = '';
  try { old = await readFile(OUT, 'utf8'); } catch {}
  const strip = (s) => s.replace(/"updated":"[^"]*",?/, '');
  const next = JSON.stringify(out, null, 1);
  if (old && strip(JSON.stringify(JSON.parse(old), null, 1)) === strip(next)) { console.log('No change'); return; }
  await writeFile(OUT, next + '\n');
  console.log(`Wrote ${out.mismo.length} MISMO webinars`);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
