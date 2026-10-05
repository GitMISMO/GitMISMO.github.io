/* MISMO Resources search engine (5 Oct 2026). Shared by pages that search their own contents;
   first used by the Initiative Hub. The home page (assets/home.js) has the same engine inline
   and can move to this one.

   MismoSearch.rank(items, query) scores items { t: name, a: other names and keywords, d: what
   it is about, w: a small weight for its kind } and returns [{ it, score, why, how }], best first.
   - Everyday wording: filler ("how do I", "need to") is ignored; word endings don't matter.
   - Related words count ("time" finds "hours"); small typos and the word still being typed are
     forgiven; two letters alone are treated as an acronym and matched whole.
   - An item qualifies when most of the words are in its name or other names, or when every word
     appears somewhere in what it is about ("regulator exams"). Name matches rank higher. */
(function () {
  'use strict';
  const RELATED = [
    ['time', 'hours', 'timesheet'], ['define', 'definition', 'meaning', 'term'], ['change', 'update', 'revise', 'fix', 'amend', 'request'],
    ['idea', 'proposal', 'potential', 'propose'], ['event', 'summit', 'conference'], ['site', 'website', 'web'], ['todo', 'task', 'tasks'],
    ['sponsor', 'sponsorship', 'exhibitor'], ['contract', 'agreement', 'order', 'msa'], ['create', 'make', 'new', 'add'],
    ['scan', 'scans', 'scanned', 'analytics'], ['qr', 'barcode', 'code'], ['note', 'notes', 'jot'], ['spec', 'specification', 'standard', 'dataset'],
    ['meeting', 'meetings', 'calendar', 'schedule'], ['regulator', 'regulators', 'regulatory', 'examiner', 'exam', 'examination'],
    ['appraisal', 'valuation', 'avm'], ['ai', 'artificial', 'intelligence'], ['enote', 'emortgage', 'electronic'],
  ];
  const FILLER = new Set(('a an the i im i\'m me my we our to for of in on at and or is are be can do does how what where which who need want '
    + 'would like please find get go open see show help with about this that some any it its into from by just new many much').split(' '));
  const norm = w => w.toLowerCase().replace(/[^a-z0-9]/g, '');
  const stem = w => w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w;
  const words = s => String(s == null ? '' : s).toLowerCase().split(/[^a-z0-9]+/).map(norm).filter(Boolean);
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 99;   /* too different to measure: never a match */
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function relatedTo(w) { const s = stem(w); const g = RELATED.find(r => r.some(x => stem(x) === s)); return g ? g.map(stem).filter(x => x !== s) : []; }
  const prepared = new WeakMap();
  function prep(it) {
    let c = prepared.get(it);
    if (!c) { c = { it, title: words(it.t).map(stem), alias: words(it.a).map(stem), desc: words(it.d).map(stem), full: String(it.t || '').toLowerCase() }; prepared.set(it, c); }
    return c;
  }
  function score(c, qWords, phrase, typing) {
    let total = 0, strong = 0, ctx = 0; const why = [];
    qWords.forEach((raw, qi) => {
      const w = stem(raw), last = typing && qi === qWords.length - 1;
      const minPrefix = last ? (qWords.length > 1 ? 2 : 3) : 4;   /* the word still being typed counts as the start of a word */
      let best = 0, kind = '', reason = '';
      if (c.title.includes(w)) { best = 3; kind = 'strong'; }
      else if (w.length >= minPrefix && c.title.some(x => x.startsWith(raw) || x.startsWith(w))) { best = 2.4; kind = 'strong'; }
      else if (c.alias.includes(w)) { best = 2.5; kind = 'strong'; reason = raw; }
      else if (w.length >= Math.max(minPrefix, 3) && c.alias.some(x => x.startsWith(w))) { best = 2; kind = 'strong'; reason = raw; }
      else if (w.length >= 5 && c.title.some(x => x.length >= 5 && lev(w, x) <= (w.length >= 8 ? 2 : 1))) { best = 1.5; kind = 'strong'; }
      else if (w.length >= 5 && c.title.some(x => x.length > w.length && x.includes(w))) { best = 1.4; kind = 'strong'; }
      else {
        const rel = relatedTo(w), r1 = rel.find(r => c.title.includes(r) || c.alias.includes(r));
        if (r1) { best = 1.2; kind = 'ctx'; reason = raw + ' \u2192 ' + r1; }
        else if (c.desc.includes(w) || (w.length >= 4 && w.length >= minPrefix && c.desc.some(x => x.startsWith(w)))) { best = 1; kind = 'ctx'; reason = 'mentions ' + raw; }
        else if (rel.some(r => c.desc.includes(r))) { best = .8; kind = 'ctx'; reason = 'mentions ' + rel.find(r => c.desc.includes(r)); }
        else if (w.length >= 5 && c.desc.some(x => x.length >= 5 && lev(w, x) <= 1)) { best = .7; kind = 'ctx'; reason = 'mentions ' + raw; }
      }
      if (best) { total += best; if (kind === 'strong') strong++; else ctx++; if (reason) why.push(reason); }
    });
    const matched = strong + ctx;
    if (!matched) return null;
    const byName = strong >= Math.ceil(qWords.length * .6), byContext = matched === qWords.length;
    if (!byName && !byContext) return null;
    total *= matched / qWords.length;
    if (phrase.length > 3 && c.full.includes(phrase)) total += 2;
    if (c.full === phrase) total += 3;
    return { it: c.it, score: total + (c.it.w || 0), why: [...new Set(why)], how: byName ? 'name' : 'context' };   /* each reason once */
  }
  function rank(items, query, opts) {
    opts = opts || {};
    const qWords = words(query).filter(w => !FILLER.has(w));
    if (!qWords.length) return [];
    const typing = !/\s$/.test(query), phrase = qWords.join(' ');
    const out = [];
    for (const it of items) { const s = score(prep(it), qWords, phrase, typing); if (s && s.score >= (opts.min || 1.5)) out.push(s); }
    return out.sort((x, y) => y.score - x.score);
  }
  window.MismoSearch = { rank, words };
})();
