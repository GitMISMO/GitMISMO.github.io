/* The MISMO Resources home page (Perry, 5 Oct 2026): the greeting and search box, pinned tasks,
   and every tool by section. Search understands everyday wording and finds initiatives, potential
   initiatives and workgroups inside the Initiative Hub. Built from the B6b prototype. */
/* ─────────────── Search by meaning ───────────────
   Each entry carries the words people use for it (not only its title), plain sentences are
   reduced to the words that matter, related words count, and small typos are forgiven. Results
   are ranked and say why they matched. Runs entirely in the page. */
const CONTEXT = {
  'hub:Submit a work request': 'request change update revise revision fix correction amend standard specification spec dataset work request intake care feeding propose modification',
  'hub:Browse potential initiatives': 'potential initiative idea proposal proposed new consideration considering pipeline candidate emerging',
  'hub:Find an initiative': 'initiative workgroup dwg cop community practice dashboard domain calendar meeting schedule roster',
  'glossary:Find a glossary term': 'term definition define meaning glossary word vocabulary acronym abbreviation lookup',
  'glossary:Propose or edit a term': 'propose edit change add new term definition draft stage publish console glossary',
  'qr:See all QR codes': 'qr code codes barcode link short link live expiring placed',
  'qr:Make a QR code': 'qr code create new make generate barcode link print flyer poster sign',
  'qr:See how codes are scanned': 'scans scanned scanning qr analytics statistics stats traffic usage count',
  'cms:Certification Management System': 'certification certifications certified cms macts assessor assessors invoices pricing renewals ron eclosing evault frame consultant smartdoc programs lifecycle action queue',
  'member-360:Member 360': 'member members membership 360 renewals renew renewal outreach dues prospects organizations orgs levels specials stats contacts relationship',
  'iif-hq:IIF Planning HQ': 'iif innovation investment fee fees invoicing invoice invoices collections billing cycle plan tasks key dates decisions risks raid last cycle',
  'summit-hq:Plan the summit': 'summit event conference meeting rooms room session sessions agenda schedule venue placement conflicts',
  'website-migration:Check the migration': 'website site web page pages migration move sitefinity higher logic launch cutover redirects',
  'team-hq:Open my board': 'board tasks task todo to-do plan plans projects priorities today key dates team meeting',
  'team-hq:Jot it down': 'note notes jot quick idea reminder remember capture',
  'meeting-trackers:Track meeting attendance': 'meeting meetings attendance attend attended attendee attendees tracker trackers workgroup dwg cop roster participation regulars summit session sessions who came member 360 activity',
  'sponsorship:Track a sponsor': 'sponsor sponsors sponsorship exhibitor exhibitors booth prospect prospects pipeline commitment payment payments invoice revenue',
  'sponsorship:Send the prospectus': 'prospectus sponsorship packet brochure tiers benefits levels pricing send share',
  'so:Log hours on a service order': 'hours time timesheet log logging billing bill invoice worked effort contractor service order',
  'so:Review and accept an order': 'review accept sign approve order orders contract contracts agreement agreements msa extension service order',
};
/* Words that mean much the same thing here. */
const RELATED = [
  ['time', 'hours', 'timesheet'], ['define', 'definition', 'meaning', 'term'], ['change', 'update', 'revise', 'fix', 'amend', 'request'],
  ['idea', 'proposal', 'potential', 'propose'], ['event', 'summit', 'conference'], ['site', 'website', 'web'], ['todo', 'task', 'tasks'],
  ['sponsor', 'sponsorship', 'exhibitor'], ['contract', 'agreement', 'order', 'msa'], ['create', 'make', 'new', 'add'],
  ['scan', 'scans', 'scanned', 'analytics'], ['qr', 'barcode', 'code'], ['note', 'notes', 'jot'], ['spec', 'specification', 'standard', 'dataset'],
];
const FILLER = new Set(('a an the i im i\'m me my we our to for of in on at and or is are be can do does how what where which who need want '
  + 'would like please find get go open see show help with about this that some any it its into from by just new many much').split(' '));
const norm = w => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const stem = w => w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w;
const words = s => String(s).toLowerCase().split(/[^a-z0-9]+/).map(norm).filter(Boolean);
function lev(a, b){
  if (Math.abs(a.length - b.length) > 2) return 99;   /* too different to measure: never a match */
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function relatedTo(w){ const s = stem(w); const g = RELATED.find(r => r.some(x => stem(x) === s)); return g ? g.map(stem).filter(x => x !== s) : []; }
/* How well one entry answers the query, and why. */
function scoreEntry(e, qWords, typing){
  const title = words(e.title).map(stem), place = words(e.page + ' ' + e.tool.name + ' ' + e.tool.sec).map(stem), ctx = words(CONTEXT[e.id] || '').map(stem);
  let score = 0, matched = 0, shortOnly = 0; const why = [];
  for (const raw of qWords){
    const w = stem(raw), last = typing && raw === qWords[qWords.length - 1]; let best = 0, reason = '';
    const test = (list, pts, label) => { if (best >= pts) return;
      if (list.includes(w)){ best = pts; reason = label ? raw : ''; return; }
      if (w.length >= (last && qWords.length > 1 ? 2 : 3) && list.some(x => x.startsWith(w) || x.startsWith(raw))){ best = pts * .8; reason = w.length < 3 ? '\u0000short' : ''; return; } };
    test(title, 3, ''); test(place, 2, ''); test(ctx, 2, 'ctx');
    if (best < 1.5){ const rel = relatedTo(w); const hitRel = rel.find(r => title.includes(r) || ctx.includes(r) || place.includes(r)); if (hitRel){ best = 1.5; reason = raw + ' \u2192 ' + hitRel; } }
    if (best < 1 && w.length >= 4){ const all = title.concat(ctx, place); const near = all.find(x => x.length >= 4 && lev(w, x) <= 1); if (near){ best = 1; reason = raw + ' \u2192 ' + near; } }
    if (best > 0){ matched++; score += best; if (reason === '\u0000short') shortOnly++; else if (reason) why.push(reason); }
  }
  if (!matched || matched === shortOnly) return null;   /* a two-letter fragment counts only beside a real match */
  if (shortOnly && matched - shortOnly < qWords.length - shortOnly) return null;
  score *= matched / qWords.length;                       /* every word that matters should count */
  if (qWords.length > 1 && matched === qWords.length) score += 1;
  return { e, score, why };
}
/* Search everything; what the person can't reach is reported separately. */
function search(query, entries, others){
  const qWords = words(query).filter(w => !FILLER.has(w));
  if (!qWords.length) return { qWords, hits: [], missing: [] };
  const typing = !/\s$/.test(query);
  const rank = list => list.map(e => scoreEntry(e, qWords, typing)).filter(Boolean).sort((a, b) => b.score - a.score);
  const hits = rank(entries).filter(h => h.score >= 1);
  const missing = rank(others).filter(h => h.score >= 2 && (!hits.length || h.score > hits[0].score * .8));
  return { qWords, hits, missing };
}

let CONTENT = [];   /* filled on the first search (assets/home-index.json and the Hub's potential initiatives) */
/* ─────────────── Searching inside the tools ───────────────
   Initiatives, potential initiatives, workgroups and glossary terms, each with its name, other
   names and a description. A name counts most; a description alone is a weak match. */
const KIND_WEIGHT = { 'Initiative': .8, 'Potential initiative': .6, 'Workgroup': .3, 'Glossary term': 0 };
let CIDX = null;
function contentIndex(){
  if (!CIDX) CIDX = CONTENT.map(it => ({ it, title: words(it.t).map(stem), alias: words(it.x).map(stem), desc: words(it.d).map(stem), full: it.t.toLowerCase() }));
  return CIDX;
}
function scoreItem(c, qWords, phrase, typing){
  let score = 0, strong = 0;
  qWords.forEach((raw, qi) => {
    const w = stem(raw), last = typing && qi === qWords.length - 1; let best = 0, isStrong = false;
    const minPrefix = last ? (qWords.length > 1 ? 2 : 3) : 4;   /* the word still being typed counts as the start of a word; two letters alone are an acronym ("MI"), matched whole */
    if (c.title.includes(w)){ best = 3; isStrong = true; }
    else if (w.length >= minPrefix && c.title.some(x => x.startsWith(raw) || x.startsWith(w))){ best = 2.4; isStrong = true; }   /* a finished short word ("tri") must match whole */
    else if (c.alias.includes(w)){ best = 2.5; isStrong = true; }
    else if (w.length >= 5 && c.title.some(x => x.length >= 5 && lev(w, x) <= (w.length >= 8 ? 2 : 1))){ best = 1.5; isStrong = true; }
    else if (w.length >= 5 && c.title.some(x => x.length > w.length && x.includes(w))){ best = 1.4; isStrong = true; }   /* inside a longer word */
    else { const rel = relatedTo(w); if (rel.some(r => c.title.includes(r))) best = 1.2; else if (c.desc.includes(w)) best = .8; }   /* related words help rank, but don't qualify an item alone */
    score += best; if (isStrong) strong++;
  });
  if (!strong || strong < Math.ceil(qWords.length * .6)) return 0;   /* most of the words must be in its name */
  score *= strong / qWords.length;
  if (phrase.length > 3 && c.full.includes(phrase)) score += 2;
  if (c.full === phrase) score += 3;
  return score + (KIND_WEIGHT[c.it.k] || 0);
}
function searchContent(query, keys){
  const qWords = words(query).filter(w => !FILLER.has(w)); if (!qWords.length) return { hits: [], missing: [] };
  const typing = !/\s$/.test(query);
  const phrase = qWords.join(' ');
  const all = []; for (const c of contentIndex()){ const s = scoreItem(c, qWords, phrase, typing); if (s >= 2) all.push({ it: c.it, score: s }); }
  all.sort((a, b) => b.score - a.score);
  return { hits: all.filter(h => keys.includes(h.it.o)).slice(0, 8), missing: all.filter(h => !keys.includes(h.it.o)).slice(0, 3) };
}

(function () {
'use strict';
const SITE = '';   /* the live page links within resources.mismo.org */
const $ = s => document.querySelector(s);
const esc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const store = { get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const I = d => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const P = {
  cert:'M12 3l2.2 4.5 5 .7-3.6 3.5.9 4.9L12 14.3l-4.5 2.3.9-4.9-3.6-3.5 5-.7z M9 15.6V21l3-1.6 3 1.6v-5.4',
  member:'M12 11.2a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4 M7.6 17.4c.7-2 2.4-3.2 4.4-3.2s3.7 1.2 4.4 3.2 M20.5 12a8.5 8.5 0 1 1-2.5-6 M18 2.5V6h-3.5',
  iif:'M20.5 12a8.5 8.5 0 1 1-2.5-6 M18 2.5V6h-3.5 M12 7.5v9 M14.5 9.6c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.8-2.5 1.8s1.1 1.5 2.5 1.8 2.5.8 2.5 1.8-1.1 1.8-2.5 1.8c-1.1 0-2-.4-2.5-1.2',
  hub:'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z', glossary:'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z M5 17a3 3 0 0 1 3-3h11',
  so:'M7 3h8l4 4v14H7z M15 3v4h4 M10 13l2 2 4-4', sponsorship:'M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.4l6-.9z',
  summit:'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M8 3v4 M16 3v4 M3 10h18',
  website:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18',
  team:'M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7 M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M17 11a3 3 0 1 0 0-6 M21 20c0-2.6-1.7-4.8-4-5.6',
  tracker:'M9 3h6v3H9z M7 4.5H5V21h14V4.5h-2 M8.5 13.5l2.5 2.5 4.5-5',
  money:'M3 6.5h18v11H3z M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5 M6.5 9.5v.01 M17.5 14.5v.01',
  link:'M10.6 13.4a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.1 1.1 M13.4 10.6a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.1-1.1',
  qr:'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h2v2h-2z M18 14h2v2h-2z M14 18h2v2h-2z M18 18h2v2h-2z',
  plus:'M12 5v14 M5 12h14', book:'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z', clock:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 7v5l3 2',
  bulb:'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z', edit:'M4 20h4L19 9l-4-4L4 16v4z M13.5 6.5l4 4',
  check:'M5 12.5l4.2 4.2L19 7', send:'M4 12l16-8-6 16-3-7z', chart:'M4 20V10 M10 20V4 M16 20v-7 M22 20H2', note:'M5 4h14v16H5z M8 9h8 M8 13h8 M8 17h5',
  arrow:'M5 12h14 M13 6l6 6-6 6', chev:'M6 9l6 6 6-6', grip:'M9 6h.01 M15 6h.01 M9 12h.01 M15 12h.01 M9 18h.01 M15 18h.01',
  pin:'M9 3h6l-1.2 5.2L17 11.5H7l3.2-3.3z M12 11.5V21', moon:'M12 3a6.4 6.4 0 0 0 9 9 9 9 0 1 1-9-9z',
  sun:'M12 7.9a4.1 4.1 0 1 0 0 8.2a4.1 4.1 0 1 0 0-8.2 M12 2.4v2.3M12 19.3v2.3M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.4 12h2.3M19.3 12h2.3M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7',
  key:'M8 15a4 4 0 1 0 0 .01 M10.8 12.2L20 3M16 7l3 3' };
/* The sections and tools, in the admin panel's order (assets/tools.json, 5 Oct 2026). */
const SECTIONS = ['Standards & Tools', 'Planning', 'Certification', 'Sponsorship'];   /* Service Orders sits in Certification on the home page (Perry, 9 Oct 2026) */
const TOOLS = [
  { key:'hub', name:'Initiative Hub', c:'#2A4DFF', icon:'hub', sec:'Standards & Tools' },
  { key:'glossary', name:'Business Glossary', c:'#0F9D77', icon:'glossary', sec:'Standards & Tools' },
  { key:'qr', name:'QR Code Manager', c:'#2477B8', icon:'qr', sec:'Standards & Tools' },
  { key:'mismo-link', name:'MISMO Link', c:'#1E3A8A', icon:'link', sec:'Standards & Tools' },
  { key:'summit-hq', name:'Summit HQ', c:'#B45309', icon:'summit', sec:'Planning' },
  { key:'website-migration', name:'Website Migration HQ', c:'#475569', icon:'website', sec:'Planning' },
  { key:'team-hq', name:'Team HQ', c:'#0D314C', icon:'team', sec:'Planning' },
  { key:'meeting-trackers', name:'Meeting Trackers', c:'#6D28D9', icon:'tracker', sec:'Planning' },
  { key:'iif-hq', name:'IIF Planning HQ', c:'#4D7C0F', icon:'iif', sec:'Planning' },
  { key:'member-360', name:'Member 360', c:'#0F7B5C', icon:'member', sec:'Planning' },
  { key:'financials', name:'MISMO Money', c:'#16A34A', icon:'money', sec:'Planning' },
  { key:'cms', name:'Certification Management System', c:'#BE123C', icon:'cert', sec:'Certification' },
  { key:'sponsorship', name:'Sponsorship', c:'#0EA5E9', icon:'sponsorship', sec:'Sponsorship' },
  { key:'so', name:'Service Orders and Agreements', c:'#E11D48', icon:'so', sec:'Certification' },
];
TOOLS.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity:'base' }));   /* A to Z within each section, left to right, top to bottom (Perry, 23 Oct 2026) */
/* Every page the old home page offered, once each, worded as what people come to do. */
const ENTRIES = {
  'hub': [['Submit a work request', 'Work Requests', 'plus', '/initiative-hub/work-requests.html', 'hub-requests'], ['Browse potential initiatives', 'Potential Initiatives', 'bulb', '/initiative-hub/#potential'], ['Find an initiative', 'Initiative Hub', 'hub', '/initiative-hub/']],
  'glossary': [['Propose or edit a term', 'Business Glossary Console', 'edit', '/glossary/console/'], ['Find a glossary term', 'Public glossary', 'book', '/glossary/']],   /* the console leads (Perry, 13 Oct 2026) */
  'qr': [['See all QR codes', 'QR Code Manager', 'qr', '/qr/'], ['Make a QR code', 'Make a New Code', 'plus', '/qr/#new'], ['See how codes are scanned', 'Scans', 'chart', '/qr/#scans']],
  'mismo-link': [['MISMO Link', 'MISMO Link', 'link', '/mismo-link/'], ['Send the beta agreement', 'MISMO Link Beta Agreement', 'send', '/mismo-link/sign/']],   /* the hub, and the public signing page (Perry, 23 Oct 2026) */
  'financials': [['MISMO Money', 'MISMO Money', 'money', '/financials/']],   /* the main page only, named after the tool, until its views are known (Perry, 23 Oct 2026) */
  'summit-hq': [['Plan the summit', 'Summit HQ', 'summit', '/summit-hq/']],
  'website-migration': [['Check the migration', 'Website Migration HQ', 'website', '/website-migration/']],
  'team-hq': [['Open my board', 'Team HQ', 'team', '/team-hq/'], ['Jot it down', 'Team HQ', 'note', '/team-hq/']],
  'meeting-trackers': [['Track meeting attendance', 'Meeting Trackers', 'tracker', '/meeting-trackers/']],
  'iif-hq': [['IIF Planning HQ', 'IIF Planning HQ', 'iif', '/iif-hq/']],   /* the main page only, named after the tool (Perry, 9 Oct 2026) */
  'member-360': [['Member 360', 'Member 360', 'member', '/member-360/']],   /* no sub-pages identified: the main page only, named after the tool (Perry, 9 Oct 2026) */
  'cms': [['Certification Management System', 'Certification Management System', 'cert', '/cms/']],   /* one button, named after the tool (Perry, 9 Oct 2026) */
  'sponsorship': [['Track a sponsor', 'Sponsorship Portal', 'sponsorship', '/sponsorship/'], ['Send the prospectus', '2027 Summit Sponsorship Prospectus', 'send', '/sponsorship-prospectus/']],
  'so': [['Log hours on a service order', 'Service Orders and Agreements', 'clock', '/service-orders/'], ['Review and accept an order', 'Service Orders and Agreements', 'check', '/service-orders/']],
};
/* Home page D with pins (Perry, 13 Oct 2026): each tool is a tile; its pin opens a menu to pin the whole tool or any
   page in it. A tool's pages are its own entries that lead somewhere other than its main page, plus these pages that
   have their own address. */
const TOOL_PATH = { hub:'/initiative-hub/', glossary:'/glossary/console/', qr:'/qr/', 'summit-hq':'/summit-hq/', 'website-migration':'/website-migration/', 'team-hq':'/team-hq/',
  'meeting-trackers':'/meeting-trackers/', 'iif-hq':'/iif-hq/', 'member-360':'/member-360/', cms:'/cms/', sponsorship:'/sponsorship/', so:'/service-orders/',
  'mismo-link':'/mismo-link/', financials:'/financials/' };
const MORE_PAGES = {
  hub: [['Meeting Calendar', 'Page', 'hub', '/initiative-hub/calendar.html'],
    ['Mortgage Compliance Dataset (MCD)', 'Overview', 'hub', '/initiative-hub/mcd-dashboard.html'], ['Common Confidence Score (CCS)', 'Overview', 'hub', '/initiative-hub/ccs-dashboard.html'],
    ['Loan Boarding Data Segment (LBDS)', 'Overview', 'hub', '/initiative-hub/lbds-dashboard.html'], ['Title Order Dataset Specification', 'Overview', 'hub', '/initiative-hub/title-order-dashboard.html'],
    ['AVM Testing Guidance and Best Practices', 'Overview', 'hub', '/initiative-hub/avm-testing-dashboard.html'], ['eNote Master Control Agreement', 'Overview', 'hub', '/initiative-hub/tpa-dashboard.html']],
};
/* Views inside each tool, opened from the address: #open=<view> through the shared sign-in, or the tool's own #<view>
   where it reads the address itself (Website Migration HQ, QR Code Manager). Setup views (Settings, Migration,
   Backups & Import) and each tool's default view are left out (Perry, 13 Oct 2026). */
const NATIVE_HASH = new Set(['website-migration']);
const VIEWS = {
  'team-hq': [['Today', 'today'], ['My Board', 'mine'], ['Team Projects', 'rocks'], ['Plans', 'plans'], ['Key Dates', 'dates'], ['Team Meeting', 'agenda'], ['Sync Ups', 'syncs'], ['Expenses', 'expenses']],
  'iif-hq': [['Tasks', 'tasks'], ['Key Dates', 'dates'], ['Decisions and Risks', 'raid'], ['Automations', 'autos'], ['Last Cycle', 'last']],
  'member-360': [['Outreach Planner', 'week'], ['Renewals', 'renewals'], ['Membership Stats', 'stats'], ['Monthly Report', 'deals'], ['IIF Cycle', 'iif'], ['Members and Prospects', 'members'], ['Issues Log', 'issues'], ['Playbooks', 'plays']],
  cms: [['Action Queue', 'queue'], ['Assessor Portal', 'assessors'], ['Invoices', 'invoices'], ['Pricing', 'pricing'], ['Records', 'records'], ['Certified Counts', 'counts'], ['Programs', 'programs'], ['Forms', 'forms'], ['Lifecycle', 'lifecycle'], ['Activity', 'activity']],
  'summit-hq': [['Schedule', 'grid']],
  sponsorship: [['Pipeline', 'pipeline'], ['Prospects', 'leads'], ['Inventory', 'stock'], ['Money', 'money']],
  'meeting-trackers': [['Log Attendance', 'ov'], ['Stats', 'stats'], ['Issues', 'iss']],
  glossary: [['Terms', 'terms'], ['Staging', 'staging'], ['Needs a Decision', 'issues'], ['Draft & Publish', 'publish'], ['Classifications', 'classes'], ['Versions', 'versions']],
  'website-migration': [['Tasks', 'tasks'], ['Pages', 'pages'], ['Must-Keep', 'must'], ['Word Rules', 'words'], ['Key Dates', 'dates'], ['Meeting Prep', 'meeting'], ['Backup Plan', 'backup']],
  qr: [['All Codes', 'codes'], ['What Scanners See', 'scanner']],
};
/* Which tool's first entry leads, for the chips and the default pins. */
const LEAD = ['hub', 'glossary', 'so', 'team-hq', 'qr', 'sponsorship', 'summit-hq', 'website-migration', 'meeting-trackers', 'iif-hq', 'member-360', 'cms'];
/* The person signed in: their tools and level in each, from the sign-in (session.js). */
const RS = window.ResourcesSession;
const ROLE_NAME = { admin:'Admin', staff:'Edit', view:'View' };
const RANK = { view:1, staff:2, admin:3 };
let COMPANIES = { 'so-phoenix':'Phoenix Oversight Group LLC', 'so-actualize':'Actualize Consulting LLC', 'so-trex':'Tidgewell Results eXperience LLC', 'so-falcon':'Falcon Capital Advisors LLC', 'so-trudigital':'TruDigital Mortgage Solutions LLC', 'so-vianteye':'Viant Eye LLC' };
function me(){
  const s = (RS && RS.current()) || {}, acc = s.access || {}, admin = !!(RS && RS.isPlatformAdmin && RS.isPlatformAdmin());
  const soKeys = Object.keys(acc).filter(k => k.indexOf('so-') === 0 && acc[k]);
  const keys = admin ? TOOLS.map(t => t.key).concat('hub-requests') : Object.keys(acc).filter(k => acc[k]).concat(soKeys.length ? ['so'] : []);
  const roleOf = k => { if (admin) return 'Admin'; if (k === 'so'){ const best = soKeys.map(x => acc[x]).sort((x, y) => RANK[y] - RANK[x])[0]; return ROLE_NAME[best] || 'Edit'; } return ROLE_NAME[acc[k]] || 'Edit'; };
  const name = s.name || s.email || '';
  return { name, first: name.split(/\s+/)[0] || 'there', email: (s.email || '').toLowerCase(), admin, keys, roleOf,
           so: admin ? 'All six companies' : soKeys.map(k => COMPANIES[k] || k).join(', ') };
}
let q = '';

const tool = k => TOOLS.find(t => t.key === k);
const mine = () => TOOLS.filter(t => me().keys.includes(t.key));
const entriesOf = t => (ENTRIES[t.key] || []).filter(e => !e[4] || me().keys.includes(e[4])).map(e => ({ id: t.key + ':' + e[0], tool: t, title: e[0], page: e[1], icon: e[2], href: SITE + e[3] }));
const allEntries = () => mine().flatMap(entriesOf);
const pathOf = h => String(h).split('#')[0].replace(/index\.html$/, '');
const isMain = (t, e) => pathOf(e.href) === SITE + TOOL_PATH[t.key] && !String(e.href).includes('#');
const mainOf = t => entriesOf(t).find(e => isMain(t, e));
const toolItem = t => { const m = mainOf(t); return { id: 'tool:' + t.key, kind: 'tool', tool: t, title: m && m.title !== t.name ? m.title : 'Open ' + t.name,
  page: t.name, sub: 'Opens ' + t.name, icon: (m && m.icon) || t.icon, href: SITE + (TOOL_PATH[t.key] || (m ? m.href : '/')) }; };
function pagesOf(t){
  const seen = new Set(), out = [], add = (name, kind, icon, href) => { if (seen.has(name)) return; seen.add(name);
    out.push({ id: 'page:' + t.key + ':' + name, kind: 'page', tool: t, title: name, page: name, kindName: kind, sub: kind + ' in ' + t.name, icon, href }); };
  entriesOf(t).filter(e => !isMain(t, e)).forEach(e => add(e.page, 'Page', e.icon, e.href));
  (MORE_PAGES[t.key] || []).forEach(([n, k, ic, h]) => add(n, k, ic, SITE + h));
  (VIEWS[t.key] || []).forEach(([n, v]) => add(n, 'View', t.icon, SITE + TOOL_PATH[t.key] + (NATIVE_HASH.has(t.key) ? '#' + v : '#open=' + v)));
  return out;
}
const pinnables = () => mine().flatMap(t => [toolItem(t), ...pagesOf(t), ...entriesOf(t)]);
const byId = id => pinnables().find(e => e.id === id);
const leadEntries = () => LEAD.filter(k => me().keys.includes(k)).map(k => entriesOf(tool(k))[0]).filter(Boolean);
/* Pins and open sections are kept per person (in this browser, for the prototype). */
const pinKey = () => 'resources:home:pins:' + me().email, openKey = () => 'resources:home:open:' + me().email;
const getPins = () => store.get(pinKey(), null) || leadEntries().slice(0, 4).map(e => e.id);
const setPins = ids => { const keep = ids.filter(id => byId(id)); store.set(pinKey(), keep); saveAccountPins(keep); };
/* Pins with the account (relay request 10): read once the page opens; until the relay knows the route (404), pins stay
   in this browser as before. The first time, pins already in this browser are carried over to the account. */
const PREFS_URL = 'https://rgvdi67cg27o5kcmiytcqbqnrm0hmztx.lambda-url.us-east-1.on.aws/hub/auth/prefs';
let acctPins = 'unknown', acctSaveT = null;
function loadAccountPins(){
  const s = RS && RS.current && RS.current(); if (!s || !s.token) return;
  fetch(PREFS_URL, { cache: 'no-store', headers: { 'Authorization': 'Bearer ' + s.token } }).then(r => {
    if (r.status === 404) { acctPins = 'off'; return null; } if (!r.ok) return null; return r.json(); })
  .then(b => { if (!b) return; acctPins = 'on';
    if (b.known) { store.set(pinKey(), (b.prefs.pins || []).map(p => p.id)); drawPins(); drawSecs(); }
    else { const local = store.get(pinKey(), null); if (local && local.length) saveAccountPins(local); } })
  .catch(() => {});
}
function saveAccountPins(ids){
  if (acctPins !== 'on') return; clearTimeout(acctSaveT);
  acctSaveT = setTimeout(() => { const s = RS && RS.current && RS.current(); if (!s || !s.token || s.viewAs) return;
    const pins = ids.map(byId).filter(Boolean).map(e => ({ kind: e.kind || 'task', key: e.tool.key, id: e.id, title: e.title, page: e.page || '', href: e.href }));
    fetch(PREFS_URL, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.token }, body: JSON.stringify({ prefs: { pins } }) }).catch(() => {}); }, 700);
}
function getOpen(){
  const saved = store.get(openKey(), null); if (saved) return saved;
  const secs = SECTIONS.filter(s => mine().some(t => t.sec === s));
  return mine().length <= 4 ? secs : secs.slice(0, 2);   /* a few tools: all open; many: the first two */
}
const setOpen = s => store.set(openKey(), s);
const tint = c => c + '1A';
const ticon = (t, ic, size, solid) => `<span class="ticon" style="width:${size}px;height:${size}px;border-radius:${Math.round(size / 4) + 2}px;background:${solid ? t.c : tint(t.c)};color:${solid ? '#fff' : t.c};font-size:${Math.round(size * .5)}px">${I(P[ic])}</span>`;
const tag = t => `<span class="tag"><i style="background:${t.c}"></i>${esc(t.name)}</span>`;
const roleHTML = t => { const r = me().roleOf(t.key); return `<span class="role${r === 'Admin' ? ' admin' : ''}">${r}</span>`; };
const pinBtn = e => { const on = getPins().includes(e.id); return `<button type="button" class="pinbtn" data-pin="${esc(e.id)}" aria-pressed="${on}" aria-label="${on ? 'Unpin' : 'Pin'} ${esc(e.title)}" title="${on ? 'Unpin' : 'Pin to the top'}">${I(P.pin)}</button>`; };
const hit = (e, s) => !s || (e.title + ' ' + e.page + ' ' + e.tool.name + ' ' + e.tool.sec).toLowerCase().includes(s);
const hl = text => { return esc(text); const i = text.toLowerCase().indexOf(q); return i < 0 ? esc(text) : esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length)); };

function drawTop(){
  const d = new Date();
  $('#date').textContent = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
  const h = d.getHours(); $('#hi').textContent = `Good ${h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'}, ${me().first}`;
}
function drawPins(){
  const list = getPins().map(byId).filter(Boolean);
  const box = $('#pins');
  if (!list.length){ box.innerHTML = `<div class="empty">Nothing pinned yet. Pin a tool, or any page in it, with the pin on its tile below.</div>`; return; }
  box.innerHTML = `<div class="pins n${Math.min(list.length, 4)}" role="list">${list.map((e, i) => `<div class="pcard" role="listitem" draggable="true" data-card="${esc(e.id)}">
      <div class="head">${ticon(e.tool, e.icon, 44)}
        <button type="button" class="handle" data-move="${esc(e.id)}" aria-label="Move ${esc(e.title)}. Use the left and right arrow keys. Position ${i + 1} of ${list.length}." title="Drag, or use the arrow keys">${I(P.grip)}</button>${pinBtn(e)}</div>
      <div>${tag(e.tool)}<div class="t" style="margin-top:4px">${esc(e.title)}</div><div class="s">${esc(e.sub || 'Opens ' + e.page)}</div></div>
      <a class="go" href="${e.href}">Start ${I(P.arrow)}</a></div>`).join('')}</div>`;
}
/* Sections: each tool a tile (select it to open the tool); its pin opens the menu to pin the tool or a page in it. */
let pinMenu = null;   /* { key, q } while a tile's pin menu is open */
function drawSecs(){
  const pins = getPins();
  let html = '';
  for (const sec of SECTIONS){
    const ts = mine().filter(t => t.sec === sec); if (!ts.length) continue;
    html += `<div class="sec tsec"><div class="sh2"><span class="dots" aria-hidden="true">${ts.map(t => `<i style="background:${t.c}"></i>`).join('')}</span><span class="nm">${esc(sec)}</span><span class="ct">${ts.length} ${ts.length === 1 ? 'tool' : 'tools'}</span></div>
      <div class="tgrid">${ts.map(t => { const it = toolItem(t), any = pins.some(id => id === it.id || id.startsWith('page:' + t.key + ':') || id.startsWith(t.key + ':')), open = pinMenu && pinMenu.key === t.key;
        return `<div class="ttile${open ? ' menu-open' : ''}" data-tile="${esc(t.key)}"><a class="tlink" href="${it.href}">${ticon(t, t.icon, 36, true)}<b>${esc(t.name)}</b><small>${t.key === 'so' ? esc(me().so) : esc(it.title === 'Open ' + t.name ? 'Open \u203a' : it.title)}</small></a>
          <button type="button" class="pinbtn tpin" data-pinmenu="${esc(t.key)}" aria-haspopup="dialog" aria-expanded="${!!open}" aria-pressed="${any}" title="Pin ${esc(t.name)}, or a page in it">${I(P.pin)}</button>${open ? menuHTML(t) : ''}</div>`; }).join('')}</div></div>`;
  }
  $('#secs').innerHTML = html;
  $('#expall').hidden = true;
  $('#askadmin').innerHTML = me().admin ? '' : `<div class="askadmin">${I(P.key)}<span>These are the tools on your account. Need another one? <b>Ask a MISMO administrator.</b></span></div>`;
  if (pinMenu) { const qi = document.getElementById('pmq'); if (qi && document.activeElement !== qi && pinMenu.focus) { qi.focus(); qi.setSelectionRange(qi.value.length, qi.value.length); } }
}
function menuHTML(t){
  const pins = getPins(), qq = (pinMenu.q || '').trim().toLowerCase(), whole = toolItem(t), pages = pagesOf(t);
  const mark = text => { if (!qq) return esc(text); const i = text.toLowerCase().indexOf(qq); return i < 0 ? esc(text) : esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + qq.length)) + '</mark>' + esc(text.slice(i + qq.length)); };
  const row = (e, label, sub) => { const on = pins.includes(e.id); return `<button type="button" class="prow" data-pin="${esc(e.id)}" aria-pressed="${on}"><span class="nm">${label}<small>${esc(sub)}</small></span><span class="pinbtn${on ? ' on' : ''}" aria-hidden="true">${I(P.pin)}</span></button>`; };
  const hits = pages.filter(e => !qq || e.title.toLowerCase().includes(qq));
  return `<div class="pmenu" role="dialog" aria-label="Pin to your page: ${esc(t.name)}"><div class="pttl">Pin to your page <span>${esc(t.name)}</span></div>
    ${pages.length > 3 ? `<input id="pmq" type="search" placeholder="Find a page in ${esc(t.name)}\u2026" value="${esc(pinMenu.q || '')}" autocomplete="off" aria-label="Find a page in ${esc(t.name)}">` : ''}
    ${qq ? '' : row(whole, `<b>${esc(t.name)}</b>`, 'The whole tool')}
    ${pages.length ? `<div class="plab">Pages${qq ? '' : ' (' + pages.length + ')'}</div>${hits.map(e => row(e, mark(e.title), e.kindName || 'Page')).join('') || '<div class="pfoot">No page matches.</div>'}` : ''}
    <div class="pfoot">${pages.length ? 'Select a pin to add it to the top of your page; select it again to unpin.' : 'This tool is one page. Pin it to keep it at the top of your page.'}</div></div>`;
}
function drawTheme(){
  const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
  $('#theme').innerHTML = I(dark ? P.sun : P.moon); $('#theme').setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}
function drawAll(){ drawTop(); drawPins(); drawSecs(); drawTheme(); }
function toast(t){ const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2200); }
document.addEventListener('input', e => { if (e.target && e.target.id === 'pmq' && pinMenu) { pinMenu.q = e.target.value; pinMenu.focus = true; drawSecs(); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && pinMenu) { const k = pinMenu.key; pinMenu = null; drawSecs(); const b = document.querySelector(`[data-pinmenu="${CSS.escape(k)}"]`); if (b) b.focus(); } });
function togglePin(id){
  const pins = getPins(), i = pins.indexOf(id), e = byId(id);
  if (i >= 0){ pins.splice(i, 1); toast('Unpinned ' + e.title); } else { pins.push(id); toast('Pinned ' + e.title); }
  setPins(pins); drawPins(); drawSecs();
}
function move(id, by){
  const pins = getPins(), i = pins.indexOf(id), j = i + by;
  if (i < 0 || j < 0 || j >= pins.length) return;
  pins.splice(j, 0, pins.splice(i, 1)[0]); setPins(pins); drawPins();
  const h = document.querySelector(`[data-move="${CSS.escape(id)}"]`); if (h) h.focus();
}

/* events */
document.addEventListener('click', e => {
  if (pinMenu && !e.target.closest('.pmenu') && !e.target.closest('[data-pinmenu]')) { pinMenu = null; drawSecs(); }
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.pinmenu){ const k = b.dataset.pinmenu; pinMenu = pinMenu && pinMenu.key === k ? null : { key: k, q: '', focus: true }; drawSecs();
    if (!pinMenu) { const again = document.querySelector(`[data-pinmenu="${CSS.escape(k)}"]`); if (again) again.focus(); } else if (!document.getElementById('pmq')) { const f = document.querySelector('.pmenu .prow'); if (f) f.focus(); } return; }
  if (b.dataset.pin && b.closest('.pmenu')){ const k = pinMenu && pinMenu.key; togglePin(b.dataset.pin); const again = document.querySelector(`.pmenu [data-pin="${CSS.escape(b.dataset.pin)}"]`); if (again) again.focus(); return; }
  if (b.dataset.pin){ togglePin(b.dataset.pin); const again = document.querySelector(`[data-pin="${CSS.escape(b.dataset.pin)}"]`); if (again && document.activeElement === document.body) again.focus(); return; }
  if (b.dataset.sec){ const o = getOpen(), s = b.dataset.sec; setOpen(o.includes(s) ? o.filter(x => x !== s) : o.concat(s)); drawSecs(); const h = document.querySelector(`[data-sec="${CSS.escape(s)}"]`); if (h) h.focus(); return; }
  if (b.dataset.opento){ const s = b.dataset.opento; setOpen(getOpen().concat(s)); drawSecs(); const h = document.querySelector(`[data-sec="${CSS.escape(s)}"]`); if (h) h.focus(); return; }
  if (b.id === 'expall'){ const all = SECTIONS.filter(x => mine().some(t => t.sec === x)); setOpen(all.every(x => getOpen().includes(x)) ? [] : all); drawSecs(); return; }
  if (b.id === 'clear'){ $('#q').value = ''; q = ''; $('#clear').hidden = true; drawResults(); $('#q').focus(); return; }
  if (b.id === 'theme'){ const r = document.documentElement, dark = $('#theme').getAttribute('aria-label').includes('light'); r.setAttribute('data-theme', dark ? 'light' : 'dark'); try { localStorage.setItem('resources:home:theme', dark ? 'light' : 'dark'); } catch (er) {} drawTheme(); return; }
});
/* everything the person could be looking for, including what isn't on their account */
const othersEntries = () => TOOLS.filter(t => !me().keys.includes(t.key)).flatMap(t => (ENTRIES[t.key] || []).map(e => ({ id: t.key + ':' + e[0], tool: t, title: e[0], page: e[1], icon: e[2], href: SITE + e[3] })));
let lastHits = [];
const KIND_TOOL = { hub:'hub', glossary:'glossary' };
function drawResults(){
  const box = $('#results'), query = $('#q').value;
  if (!query.trim()){ box.hidden = true; box.innerHTML = ''; $('#qnote').textContent = ''; lastHits = []; return; }
  const t = search(query, allEntries(), othersEntries());
  const c = searchContent(query, me().keys);
  /* one ranking for the best match; then things to do and things found, separately */
  const cand = t.hits.map(h => ({ type:'task', score:h.score, h })).concat(c.hits.map(h => ({ type:'item', score:h.score, h })));
  cand.sort((a, b) => b.score - a.score);
  const best = cand[0];
  lastHits = best ? [{ e: { href: best.type === 'task' ? best.h.e.href : SITE + best.h.it.h, title: best.type === 'task' ? best.h.e.title : best.h.it.t } }] : [];
  const why = h => h.why && h.why.length ? `<span class="why">${h.why.slice(0, 3).map(w => `<span>${esc(w)}</span>`).join('')}</span>` : '';
  const kindTag = it => `<span class="kind">${esc(it.k)}</span>`;
  let html = '';
  if (best){
    if (best.type === 'task'){ const b = best.h;
      html += `<div class="best">${ticon(b.e.tool, b.e.icon, 46)}<div style="min-width:0"><div class="lbl">Best match</div><div class="t">${esc(b.e.title)}</div>
        <div class="s">${tag(b.e.tool)} <span style="margin-left:6px">Opens ${esc(b.e.page)}</span></div>${why(b)}</div><a class="go" href="${b.e.href}">Start ${I(P.arrow)}</a></div>`;
    } else { const it = best.h.it, tl = tool(it.o);
      html += `<div class="best">${ticon(tl, tl.icon, 46, true)}<div style="min-width:0"><div class="lbl">Best match ${kindTag(it)}</div><div class="t">${esc(it.t)}</div>
        <div class="s">${tag(tl)}${it.d ? `<span style="display:block;margin-top:3px">${esc(it.d)}</span>` : ''}</div></div><a class="go" href="${SITE + it.h}">Open ${I(P.arrow)}</a></div>`; }
  }
  const tasks = t.hits.filter(h => !(best && best.type === 'task' && h === best.h)).slice(0, 4);
  const items = c.hits.filter(h => !(best && best.type === 'item' && h === best.h)).slice(0, 6);
  if (tasks.length) html += `<div class="grp">Things to do</div><ul class="more">${tasks.map(h => `<li><a href="${h.e.href}">${ticon(h.e.tool, h.e.icon, 32)}
      <span style="min-width:0"><span class="t" style="display:block">${esc(h.e.title)}</span><span class="s" style="display:block">${esc(h.e.tool.name)}, opens ${esc(h.e.page)}</span>${why(h)}</span></a></li>`).join('')}</ul>`;
  if (items.length) html += `<div class="grp">Found in your tools</div><ul class="more">${items.map(h => { const it = h.it, tl = tool(it.o); return `<li><a href="${SITE + it.h}">${ticon(tl, tl.icon, 32, true)}
      <span style="min-width:0"><span class="t" style="display:block">${esc(it.t)} ${kindTag(it)}</span><span class="s" style="display:block">${esc(it.d || tl.name)}</span></span></a></li>`; }).join('')}</ul>`;
  const lacking = [...new Map(t.missing.map(m => [m.e.tool.key, m.e.tool]).concat(c.missing.map(m => [m.it.o, tool(m.it.o)]))).values()].filter(Boolean);
  if (!best) html += `<div class="noresults">Nothing on your account matches \u201c${esc(query.trim())}\u201d.${lacking.length ? '' : ' Try a word for what you want to do, or part of the name of an initiative or workgroup.'}</div>`;
  if (lacking.length) html += `<div class="missing">${I(P.key)}<span>${lacking.map(x => esc(x.name)).join(' and ')} ${lacking.length === 1 ? 'isn\u2019t' : 'aren\u2019t'} on your account. <b>A MISMO administrator can add ${lacking.length === 1 ? 'it' : 'them'}.</b></span></div>`;
  box.hidden = false; box.innerHTML = html;
  $('#qnote').textContent = best ? `Best match: ${lastHits[0].e.title}. Press Enter to open it, or the down arrow to go through the results.` : 'No results.';
}
/* a short pause while typing keeps it smooth on slower computers */
let qTimer = null;
let contentState = 'none';
function loadContent(){
  if (contentState !== 'none') return; contentState = 'loading';
  const get = u => fetch(u, { cache:'no-cache' }).then(r => r.ok ? r.json() : null).catch(() => null);
  Promise.all([get('/assets/home-index.json'), get('/initiative-hub/data/potential/index.json')]).then(([idx, pot]) => {
    const items = (idx && idx.items) || [], abbr = (idx && idx.abbr) || {};   /* domain acronyms, e.g. Mortgage Compliance: MCD */
    const ids = (pot && pot.ids) || [];
    return Promise.all(ids.map(id => get('/initiative-hub/data/potential/' + encodeURIComponent(id) + '.json').then(d => d && ({
      t: d.name || id, k: 'Potential initiative', o: 'hub', d: (d.summary || '').slice(0, 150), x: [d.domain || ''].concat(Object.keys(abbr).filter(k => k === d.domain || (d.name || '').toLowerCase().includes(k.toLowerCase())).map(k => abbr[k])).join(' '), h: '/initiative-hub/potential.html?id=' + encodeURIComponent(id) })))).then(ps => items.concat(ps.filter(Boolean)));
  }).then(list => { CONTENT = list; CIDX = null; contentState = 'ready'; if ($('#q').value.trim()) drawResults(); });
}
$('#q').addEventListener('focus', loadContent);
$('#q').addEventListener('input', e => { loadContent(); q = e.target.value.trim().toLowerCase(); $('#clear').hidden = !e.target.value; clearTimeout(qTimer); qTimer = setTimeout(drawResults, e.target.value.trim() ? 90 : 0); });
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== $('#q') && !/input|textarea/i.test((document.activeElement || {}).tagName || '')){ e.preventDefault(); $('#q').focus(); return; }
  if (e.key === 'Escape'){ if ($('#q').value){ $('#q').value = ''; q = ''; $('#clear').hidden = true; drawResults(); $('#q').focus(); } return; }
  if (e.key === 'Enter' && document.activeElement === $('#q') && lastHits.length){ e.preventDefault(); location.href = lastHits[0].e.href; return; }
  /* the arrow keys go from the box through the results and back */
  const inResults = document.activeElement && document.activeElement.closest && document.activeElement.closest('#results');
  if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && (document.activeElement === $('#q') || inResults) && !$('#results').hidden){
    const links = [...document.querySelectorAll('#results a')]; if (!links.length) return;
    e.preventDefault();
    const i = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') (links[i + 1] || links[0]).focus();
    else if (i <= 0) $('#q').focus(); else links[i - 1].focus();
    return;
  }
  const h = e.target.closest && e.target.closest('[data-move]');
  if (h && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')){ e.preventDefault(); move(h.dataset.move, -1); }
  if (h && (e.key === 'ArrowRight' || e.key === 'ArrowDown')){ e.preventDefault(); move(h.dataset.move, 1); }
});
/* drag to reorder */
let dragId = null;
document.addEventListener('dragstart', e => { const c = e.target.closest && e.target.closest('[data-card]'); if (!c) return; dragId = c.dataset.card; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (er) {} });
document.addEventListener('dragover', e => { const c = e.target.closest && e.target.closest('[data-card]'); if (!c || !dragId) return; e.preventDefault(); document.querySelectorAll('.pcard.over').forEach(x => x.classList.remove('over')); if (c.dataset.card !== dragId) c.classList.add('over'); });
document.addEventListener('drop', e => { const c = e.target.closest && e.target.closest('[data-card]'); if (!c || !dragId) return; e.preventDefault();
  const pins = getPins(), from = pins.indexOf(dragId), to = pins.indexOf(c.dataset.card); if (from < 0 || to < 0 || from === to) return;
  pins.splice(to, 0, pins.splice(from, 1)[0]); setPins(pins); dragId = null; drawPins(); });
document.addEventListener('dragend', () => { dragId = null; document.querySelectorAll('.pcard').forEach(x => x.classList.remove('dragging', 'over')); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', drawTheme);
fetch('/assets/tools.json', { cache:'no-cache' }).then(r => r.ok ? r.json() : null).then(j => { (j && j.tools || []).forEach(t => { if (t.key.indexOf('so-') === 0) COMPANIES[t.key] = t.label; }); }).catch(() => {});
function start(){ drawAll(); if ($('#q').value.trim()) drawResults(); loadAccountPins(); }
if (!RS){ document.documentElement.classList.remove('rs-wait'); }
else {
  RS.requireSignIn({ toolName:'MISMO Resources', eyebrow:'Programs & Operations' }).then(start, () => document.documentElement.classList.remove('rs-wait'));
  RS.onChange(s => { if (!s) location.reload(); else start(); });
  document.addEventListener('rs:access', start);
}
})();
