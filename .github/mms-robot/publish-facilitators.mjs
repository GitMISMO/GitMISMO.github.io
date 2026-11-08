/* Publishes the MMS's facilitator list, names only, for other MISMO systems (Summit HQ first):
   resources.mismo.org/mms/facilitators.json. The list is the one in the MMS (Settings › People and Roles ›
   Facilitators). Emails and everything else stay private. The file only changes when the list does.
   Shape: {"source":"MMS","updated":"<ISO time the list last changed>","facilitators":[{"name":"..."}]} */
import fs from 'fs';
const TOKEN = process.env.MMS_DATA_TOKEN; if (!TOKEN) { console.log('No MMS_DATA_TOKEN; nothing published.'); process.exit(0); }
const OUT = 'mms/facilitators.json';
const r = await fetch('https://api.github.com/repos/GitMISMO/mms-data/contents/data/config.json', { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github.raw', 'User-Agent': 'mms-robot' } });
if (!r.ok) { console.log('Could not read the MMS settings: ' + r.status); process.exit(1); }
const cfg = JSON.parse(await r.text()); const people = (cfg.docs || {})['config/people'] || {};
const names = [...new Set((people.facilitators || []).map(p => String((p && p.name) || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
if (!names.length) { console.log('The MMS has no facilitators listed; leaving the published list as it is.'); process.exit(0); }
let old = null; try { old = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) {}
const same = old && Array.isArray(old.facilitators) && JSON.stringify(old.facilitators.map(f => f.name)) === JSON.stringify(names);
if (same) { console.log(`Facilitator list unchanged (${names.length}).`); process.exit(0); }
fs.writeFileSync(OUT, JSON.stringify({ source: 'MMS', note: 'MISMO facilitators from the MMS (Settings > People and Roles). Names only.', updated: new Date().toISOString(), facilitators: names.map(name => ({ name })) }, null, 2) + '\n');
console.log(`Facilitator list updated (${names.length}).`);
