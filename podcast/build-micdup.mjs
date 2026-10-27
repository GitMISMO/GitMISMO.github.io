// Builds podcast/micdup.json: the list of MISMO Mic'd Up episodes on YouTube.
// The home page reads this file and adds any episode it does not already show.
// Runs from .github/workflows/micdup.yml. No API key needed: it reads the
// channel's public RSS feed, and each new video's public page for its length.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const CHANNEL = 'UCuKIkeqACTIU7j0eL_igPHA';   // youtube.com/@MISMOStandards
const OUT = 'podcast/micdup.json';
const HEADERS = { 'user-agent': 'Mozilla/5.0 (MISMO podcast publisher)', 'accept-language': 'en-US,en' };

const decode = s => s
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function clock(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

async function lengthOf(id) {
  try {
    const html = await (await fetch(`https://www.youtube.com/watch?v=${id}`, { headers: HEADERS })).text();
    const m = html.match(/"lengthSeconds":"(\d+)"/);
    return m ? clock(Number(m[1])) : '';
  } catch { return ''; }
}

// What we published last time, so older episodes stay listed after they
// fall out of the feed (the feed only holds the latest 15 videos).
const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { episodes: [] };
const known = new Map(old.episodes.map(e => [e.id, e]));

const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL}`, { headers: HEADERS });
if (!res.ok) { console.log(`Feed returned ${res.status}; leaving the list as it is.`); process.exit(0); }
const xml = await res.text();

const fromFeed = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => {
  const e = m[1];
  const get = re => (e.match(re) || [, ''])[1];
  return { id: get(/<yt:videoId>([^<]+)/), title: decode(get(/<title>([^<]*)/)), published: get(/<published>([^<]+)/) };
}).filter(v => v.id && /mic.?d up/i.test(v.title));

if (!fromFeed.length && !known.size) { console.log('No Mic\'d Up episodes found; nothing to write.'); process.exit(0); }

for (const v of fromFeed) {
  const prev = known.get(v.id);
  const title = v.title.replace(/^MISMO\s+Mic.?d\s+Up\s*[:\-–—]?\s*/i, '').trim();
  const duration = prev && prev.duration ? prev.duration : await lengthOf(v.id);
  known.set(v.id, { id: v.id, title, published: v.published, duration });
}

const episodes = [...known.values()].sort((a, b) => (b.published || '').localeCompare(a.published || ''));
const same = JSON.stringify(episodes) === JSON.stringify(old.episodes);
if (same) { console.log(`No change (${episodes.length} episodes).`); process.exit(0); }

mkdirSync('podcast', { recursive: true });
writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), count: episodes.length, episodes }, null, 2) + '\n');
console.log(`Wrote ${episodes.length} episodes. Newest: ${episodes[0].title}`);
