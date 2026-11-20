/* MMS Robot, part 2 (Nov 18, 2026): puts work products on the website.
   When staff mark a work product Published, the MMS saves its listing in mms-data (wpqueue) and its public files in
   small pieces (wpup-<key>-<file>-<piece>). This joins the pieces, saves each file to GitMISMO/work-products
   (files/<id>/<file>, served at resources.mismo.org/work-products/files/...), adds or updates the product in
   data/products.json there (its own workflow then rebuilds catalog.json), marks the listing done and removes the pieces.
   Logs counts only. Needs MMS_ROBOT_TOKEN to include work-products. */
import crypto from 'node:crypto'; import { checkBuf } from './filecheck.mjs';
export async function publishWorkProducts({ RW, GH = 'https://api.github.com', ORG = 'GitMISMO' }) {
  const head = { Authorization: `Bearer ${RW}`, Accept: 'application/vnd.github+json', 'User-Agent': 'mms-robot', 'X-GitHub-Api-Version': '2022-11-28' };
  const url = (repo, p) => `${GH}/repos/${ORG}/${repo}/contents/${p.split('/').map(encodeURIComponent).join('/')}`;
  async function get(repo, p, raw) {
    const r = await fetch(url(repo, p), { headers: head }); if (r.status === 404) return null; if (!r.ok) throw Object.assign(new Error('GitHub ' + r.status), { status: r.status });
    const b = await r.json(); let buf = b.content ? Buffer.from(b.content, 'base64') : null;
    if (!buf && b.git_url) { const g = await fetch(b.git_url, { headers: head }).then(x => x.json()); buf = Buffer.from(g.content, 'base64'); }
    return { sha: b.sha, buf, data: raw ? null : JSON.parse(buf.toString('utf8')) };
  }
  async function put(repo, p, buf, sha, message) {
    const r = await fetch(url(repo, p), { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, head),
      body: JSON.stringify(Object.assign({ message, content: buf.toString('base64'), committer: { name: 'MMS Robot', email: 'workrequests@mismo.org' } }, sha ? { sha } : {})) });
    if (!r.ok) throw Object.assign(new Error('GitHub ' + r.status), { status: r.status }); return (await r.json()).content.sha;
  }
  async function del(repo, p, sha) { await fetch(url(repo, p), { method: 'DELETE', headers: Object.assign({ 'Content-Type': 'application/json' }, head), body: JSON.stringify({ message: 'MMS Robot: tidy ' + p, sha, committer: { name: 'MMS Robot', email: 'workrequests@mismo.org' } }) }).catch(() => {}); }
  const PUB = 'https://resources.mismo.org/work-products/files/';
  const q = await get('mms-data', 'data/wpqueue.json'); if (!q || !q.data) return { ready: 0 };
  const docs = (q.data.docs || {}); const ready = Object.values(docs).filter(d => d && d.status === 'ready' && d.id);
  if (!ready.length) return { ready: 0 };
  const pf = await get('work-products', 'data/products.json'); if (!pf) throw new Error('work-products/data/products.json not found');
  const list = pf.data.products || []; const done = {}, tidy = []; let files = 0, failed = 0;
  for (const d of ready) {
    try {
      const out = [];
      for (const [fi, f] of (d.files || []).entries()) {
        const parts = [];
        for (let i = 0; i < f.chunks; i++) { const c = await get('mms-data', `data/wpup-${d.key}-${fi}-${i}.json`); if (!c) throw new Error('a piece of ' + f.file + ' is missing'); parts.push(Buffer.from(c.data.c || '', 'base64')); tidy.push([`data/wpup-${d.key}-${fi}-${i}.json`, c.sha]); }
        const buf = Buffer.concat(parts); const bad = checkBuf(buf, f.file, f.bytes); if (bad) throw new Error(f.file + ' ' + bad); /* size and, for zips, "PK" + whole directory (Nov 20) */
        const path = `files/${d.id}/${f.file}`; const ex = await get('work-products', path, true).catch(() => null);
        const saved = await put('work-products', path, buf, ex && ex.sha, `MMS: ${d.id} ${f.file}`); files++;
        /* the saved copy must be exactly the file sent: GitHub's id for it is the hash of its bytes */
        const want = crypto.createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex'); if (saved !== want) throw new Error(f.file + ' was not saved whole');
        out.push({ name: f.name, file: f.file, url: PUB + encodeURIComponent(d.id) + '/' + encodeURIComponent(f.file), bytes: buf.length });
      }
      const i = list.findIndex(p => p.id === d.id), old = i >= 0 ? list[i] : {};
      const p = Object.assign({ id: d.id, title: '', summary: '', category: null, version: null, status: null, published: null, license: null, membersOnly: false, libraryUrl: null, externalUrl: null, purchaseUrl: null, files: [], aliases: [] }, old, d.product, { id: d.id, ticket: d.ticket });
      p.files = p.membersOnly ? [] : (out.length ? out : (old.files || []));
      if (i >= 0) list[i] = p; else list.push(p);
      done[d.key] = { status: 'done', doneAt: new Date().toISOString(), files: out.length };
    } catch (e) { failed++; done[d.key] = { status: 'error', error: String(e.message || e).slice(0, 200), triedAt: new Date().toISOString() }; }
  }
  if (Object.values(done).some(x => x.status === 'done')) await put('work-products', 'data/products.json', Buffer.from(JSON.stringify(Object.assign({}, pf.data, { products: list }), null, 2)), pf.sha, 'MMS: work products published');
  for (let a = 0; a < 4; a++) {   /* the MMS may be saving the queue too: read it again and only change these entries */
    const q2 = await get('mms-data', 'data/wpqueue.json'); const D = q2.data.docs || {};
    for (const [k, v] of Object.entries(done)) if (D[k]) D[k] = Object.assign({}, D[k], v);
    try { await put('mms-data', 'data/wpqueue.json', Buffer.from(JSON.stringify(Object.assign({}, q2.data, { docs: D }), null, 2)), q2.sha, 'MMS Robot: work products queue'); break; }
    catch (e) { if (e.status !== 409 && e.status !== 422) throw e; await new Promise(r => setTimeout(r, 1500)); }
  }
  for (const [p, sha] of tidy) if (done[p.replace(/^data\/wpup-|-\d+-\d+\.json$/g, '')]?.status === 'done') await del('mms-data', p, sha);
  return { ready: ready.length, files, failed };
}
