/* ============================================================================
   MMS ON resources.mismo.org - the one door to MISMO's save relay
   ----------------------------------------------------------------------------
   Built the same way as MISMO Media's, Member 360's and Summit HQ's doors.
   The MMS was built inside Claude, where it reaches its records through
   window.claude.use('db'). This gives the page that same door, backed by the
   save relay instead, so nothing in the page changes.

   Where the data lives: the PRIVATE repository GitMISMO/mms-data, reached only
   through the relay under the project key "mms". This PUBLIC page holds no
   records at all.

   How documents are filed (the relay has no "list a folder" route):
     tickets             one file per year of the WR#: tickets-2026, tickets-2025 ...
                         {docs:{"tickets/<id>": {...}}}, so no file nears the 1 MB limit
     config, outbox, media
                         one file per collection: {docs:{"<collection>/<id>": {...}}}

   PREVIEW: while PREVIEW is true the page opens for everyone with access but
   saves nothing, and says so.

   Saving: every save sends the version (sha) it last read. If someone else saved
   in between, the relay answers 409; the change is re-applied on top of theirs
   and sent again. Other people's changes are re-read every minute.

   Sign-in is the shared resources.mismo.org sign-in (/assets/session.js). Who may
   open it, and who may save, is set per person in People & Access (project "mms").
   ============================================================================ */
(function () {
  'use strict';
  if (window.__hqRelay) return;

  var RELAY_URL = 'https://rgvdi67cg27o5kcmiytcqbqnrm0hmztx.lambda-url.us-east-1.on.aws';
  var PROJECT = 'mms', TOOL = 'the MISMO Manufacturing System';
  var PREVIEW = false;
  var POLL_MS = 60000, IDLE_POLL_MS = 180000, IDLE_AFTER = 10 * 60000;
  var FLUSH_MS = 350, RETRY_MS = 8000;
  var MAX_FILE = 940000;        /* the relay takes at most 1,000,000 bytes a save */
  var FIRST_YEAR = 2015;

  /* browser storage: this page's own keys are filed under tools:mms: */
  (function () {
    var P = 'tools:mms:';
    var shared = function (k) { k = String(k); return k.indexOf('tools:') === 0 || k.indexOf('resources:') === 0 || k === 'mismo.portal.theme'; };
    try {
      var S = Storage.prototype, g = S.getItem, s = S.setItem, r = S.removeItem;
      S.getItem = function (k) { return g.call(this, shared(k) ? k : P + k); };
      S.setItem = function (k, v) { return s.call(this, shared(k) ? k : P + k, v); };
      S.removeItem = function (k) { return r.call(this, shared(k) ? k : P + k); };
    } catch (e) {}
  })();

  function RS() { return window.ResourcesSession || null; }
  function clone(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }
  function safe(s) { return String(s).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-{3,}/g, '--').replace(/^-+|-+$/g, '') || 'x'; }
  function err(code, message, status) { var e = new Error(message || code); e.code = code; e.status = status || 0; return e; }
  function now() { return Date.now(); }

  /* ---------- where a document is filed ---------- */
  function shard(id) { var m = String(id).match(/(19|20)\d{2}/); return 'tickets-' + (m ? m[0] : 'other'); }
  function place(path) {
    var seg = String(path).split('/');
    if (seg.length !== 2) throw err('invalid_argument', 'Not a document path: ' + path);
    if (seg[0] === 'tickets') return { file: shard(seg[1]), coll: seg[0], id: seg[1] };
    return { file: safe(seg[0]).slice(0, 40), coll: seg[0], id: seg[1] };
  }
  function filesOfColl(coll) {
    if (coll !== 'tickets') return [safe(coll).slice(0, 40)];
    var out = ['tickets-other'], y = new Date().getFullYear() + 1;
    for (var i = FIRST_YEAR; i <= y; i++) out.push('tickets-' + i);
    return out;
  }
  function parentOf(path) { var s = String(path).split('/'); return s.slice(0, -1).join('/'); }
  function idOf(path) { var s = String(path).split('/'); return s[s.length - 1]; }

  /* ---------- talking to the relay ---------- */
  var status = { offline: false, lastError: '' };
  function net(method, name, body) {
    var rs = RS(), tok = rs && rs.token();
    if (!tok) return Promise.reject(err('SIGNED_OUT', 'Not signed in', 401));
    var headers = { 'Authorization': 'Bearer ' + tok };
    if (body) headers['Content-Type'] = 'application/json';
    return fetch(RELAY_URL + '/' + PROJECT + '/data/' + encodeURIComponent(name), {
      method: method, cache: 'no-store', headers: headers, body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      status.offline = false;
      return r.json().catch(function () { return {}; }).then(function (b) {
        if (r.ok) return b;
        var e = err((b && b.error) || ('HTTP_' + r.status), b && b.message, r.status);
        e.gh = (b && typeof b.status === 'number') ? b.status : 0;
        if (r.status === 401 && rs) { needSignIn(); }
        throw e;
      });
    }, function () { status.offline = true; throw err('OFFLINE', 'Could not reach the relay', 0); });
  }

  /* ---------- files ---------- */
  var F = {};
  function file(name) {
    if (!F[name]) F[name] = { name: name, server: null, sha: null, loaded: false, loading: null,
      loadedAt: 0, pending: [], timer: null, flushing: false, view: null, waitingSignIn: false };
    return F[name];
  }
  function normalise(c) { c = c && typeof c === 'object' ? c : {}; return { docs: c.docs && typeof c.docs === 'object' ? c.docs : {} }; }
  function load(f) {
    if (f.loading) return f.loading;
    f.loading = net('GET', f.name).then(function (b) {
      return { content: normalise(b && b.data), sha: (b && b.sha) || null };
    }, function (e) {
      if (e && e.status === 404 && (e.code === 'NOT_FOUND' || e.code === 'HTTP_404')) return { content: normalise(null), sha: null };
      throw e;
    }).then(function (got) {
      var before = f.loaded ? JSON.stringify(f.server) : null;
      f.server = got.content; f.sha = got.sha; f.loaded = true; f.loadedAt = now(); f.view = null; f.loading = null;
      if (before !== JSON.stringify(f.server)) notify(f, false);
      return f;
    }, function (e) { f.loading = null; throw e; });
    return f.loading;
  }
  function ensure(f) { return f.loaded ? Promise.resolve(f) : load(f); }
  function applyOps(content, ops) {
    ops.forEach(function (op) {
      if (op.kind === 'set') content.docs[op.path] = clone(op.data);
      else if (op.kind === 'update') content.docs[op.path] = Object.assign({}, content.docs[op.path] || {}, clone(op.data));
      else if (op.kind === 'delete') delete content.docs[op.path];
    });
    return content;
  }
  function viewOf(f) { if (!f.loaded) return null; if (!f.view) f.view = applyOps(clone(f.server), f.pending); return f.view; }
  function docIn(f, path) { var v = viewOf(f); if (!v) return undefined; var d = v.docs[path]; return d === undefined ? null : d; }

  /* ---------- saving ---------- */
  var previewWarned = 0;
  function queue(path, kind, data) {
    if (PREVIEW) {
      if (now() - previewWarned > 4000) { previewWarned = now(); toast('This is the preview of the MMS on resources.mismo.org — nothing here is saved yet.', 'bad'); }
      return Promise.reject(err('invalid_argument', 'Preview: not saved'));
    }
    var p = place(path), f = file(p.file);
    return new Promise(function (res, rej) {
      var go = function () {
        if (kind === 'update' && f.loaded && docIn(f, path) === null) { rej(err('not-found', 'No document to update: ' + path)); return; }
        f.pending.push({ kind: kind, path: path, data: data, res: res, rej: rej }); f.view = null;
        notify(f, true);
        schedule(f, FLUSH_MS);
      };
      if (kind === 'update' && !f.loaded) ensure(f).then(go, function (e) { rej(e); });
      else { if (!f.loaded) ensure(f).catch(function () {}); go(); }
    });
  }
  function schedule(f, ms) { if (f.timer) return; f.timer = setTimeout(function () { f.timer = null; flush(f); }, ms); }
  /* GitHub makes one commit to a branch at a time, so saves go out one after another */
  var putChain = Promise.resolve();
  function put(name, body) { var go = function () { return net('PUT', name, body); }; var p = putChain.then(go, go); putChain = p.then(function () {}, function () {}); return p; }
  function flush(f) {
    if (f.flushing || !f.pending.length) return;
    if (!(RS() && RS().token())) { f.waitingSignIn = true; needSignIn(); return; }
    f.flushing = true;
    var batch = f.pending.slice(), tries = 0;
    var attempt = function () {
      return ensure(f).then(function () {
        var next = applyOps(clone(f.server), batch);
        if (JSON.stringify(next, null, 2).length > MAX_FILE) throw err('TOO_BIG', 'This part of the MMS has grown too big to save in one piece.');
        return put(f.name, { content: next, sha: f.sha }).then(function (b) {
          f.server = next; f.sha = (b && b.sha) || f.sha; f.loadedAt = now();
          f.pending = f.pending.filter(function (op) { return batch.indexOf(op) < 0; }); f.view = null;
          batch.forEach(function (op) { op.res(); });
          notify(f, false); saved();
        });
      }).catch(function (e) {
        if (e && e.status === 409 && tries < 8) {
          tries++; f.loaded = false;
          return new Promise(function (r) { setTimeout(r, 300 * tries + Math.random() * 500); }).then(function () { return load(f); }).then(attempt);
        }
        throw e;
      });
    };
    attempt().catch(function (e) {
      var transient = e && (e.code === 'OFFLINE' || e.status === 401 || e.code === 'SIGNED_OUT' ||
        (e.status >= 500 && e.code !== 'TOKEN' && e.code !== 'GITHUB' && e.code !== 'REJECTED') ||
        (e.code === 'GITHUB' && (e.gh >= 500 || !e.gh && /timed? ?out|ETIMEDOUT|ECONNRESET|fetch failed/i.test(e.message || ''))));
      if (transient) {
        if (e.status === 401 || e.code === 'SIGNED_OUT') f.waitingSignIn = true;
        else setTimeout(function () { schedule(f, 0); }, RETRY_MS);
        problem(e); return;
      }
      f.pending = f.pending.filter(function (op) { return batch.indexOf(op) < 0; }); f.view = null;
      batch.forEach(function (op) { op.rej(e); });
      notify(f, false); problem(e, true);
    }).then(function () { f.flushing = false; if (f.pending.length && !f.waitingSignIn) schedule(f, FLUSH_MS); });
  }
  function anyPending() { return Object.keys(F).some(function (k) { return F[k].pending.length; }); }
  window.addEventListener('beforeunload', function (e) { if (anyPending()) { e.preventDefault(); e.returnValue = 'The MMS is still saving.'; return e.returnValue; } });

  /* ---------- snapshots and listeners ---------- */
  function docSnap(path, data, pending) {
    var exists = data !== null && data !== undefined;
    return { id: idOf(path), exists: exists, ref: { id: idOf(path), path: path },
      data: function () { return exists ? clone(data) : undefined; }, metadata: { hasPendingWrites: !!pending, fromCache: false } };
  }
  var docL = [], collL = [];
  function docValue(path) { return docIn(file(place(path).file), path); }
  function collDocs(coll) {
    var out = {};
    filesOfColl(coll).forEach(function (n) { var v = viewOf(file(n)); if (v) Object.keys(v.docs).forEach(function (p) { if (parentOf(p) === coll) out[p] = v.docs[p]; }); });
    return out;
  }
  function loadColl(coll) { return Promise.all(filesOfColl(coll).map(function (n) { return ensure(file(n)); })); }
  function collSnap(coll, changes, pending) {
    var docs = collDocs(coll), list = Object.keys(docs).map(function (p) { return docSnap(p, docs[p], pending); });
    return { docs: list, size: list.length, empty: !list.length, forEach: function (fn) { list.forEach(fn); },
      docChanges: function () { return changes || list.map(function (d) { return { type: 'added', doc: d }; }); },
      metadata: { hasPendingWrites: !!pending, fromCache: false } };
  }
  function notify(f, pending) {
    docL.forEach(function (l) {
      if (place(l.path).file !== f.name || !f.loaded) return;
      var d = docValue(l.path), sig = JSON.stringify(d);
      if (l.primed && sig === l.sig) return;
      l.primed = true; l.sig = sig;
      try { l.cb(docSnap(l.path, d, pending)); } catch (e) { console.error(e); }
    });
    collL.forEach(function (l) {
      var files = filesOfColl(l.coll);
      if (files.indexOf(f.name) < 0) return;
      if (!files.every(function (n) { return file(n).loaded; })) return;
      var docs = collDocs(l.coll), changes = [], seen = {};
      Object.keys(docs).forEach(function (p) {
        var sig = JSON.stringify(docs[p]); seen[p] = 1;
        if (!(p in l.last)) changes.push({ type: 'added', doc: docSnap(p, docs[p], pending) });
        else if (l.last[p] !== sig) changes.push({ type: 'modified', doc: docSnap(p, docs[p], pending) });
        l.last[p] = sig;
      });
      Object.keys(l.last).forEach(function (p) { if (!seen[p]) { changes.push({ type: 'removed', doc: docSnap(p, null, pending) }); delete l.last[p]; } });
      if (l.primed && !changes.length) return;
      l.primed = true;
      try { l.cb(collSnap(l.coll, changes, pending)); } catch (e) { console.error(e); }
    });
  }

  /* ---------- the store, in the shape the page already uses ---------- */
  function docRef(path) {
    var p = place(path);
    var need = function () { return ensure(file(p.file)); };
    return {
      id: p.id, path: path,
      get: function () { return need().then(function () { return docSnap(path, docValue(path), false); }); },
      set: function (data) { return queue(path, 'set', data); },
      update: function (patch) { return queue(path, 'update', patch); },
      delete: function () { return queue(path, 'delete', null); },
      onSnapshot: function (cb, errCb) {
        var l = { path: path, cb: cb, primed: false, sig: null }; docL.push(l);
        need().then(function () { if (l.primed) return; var d = docValue(path); l.primed = true; l.sig = JSON.stringify(d); cb(docSnap(path, d, false)); })
          .catch(function (e) { if (errCb) errCb(e); });
        return function () { var i = docL.indexOf(l); if (i >= 0) docL.splice(i, 1); };
      }
    };
  }
  function collRef(coll, max) {
    var ref = {
      id: coll, path: coll,
      doc: function (id) { return docRef(coll + '/' + (id || (now().toString(36) + Math.random().toString(36).slice(2, 8)))); },
      add: function (data) { var id = now().toString(36) + Math.random().toString(36).slice(2, 8); return queue(coll + '/' + id, 'set', data).then(function () { return { id: id, path: coll + '/' + id }; }); },
      limit: function (n) { return collRef(coll, n); },
      where: function () { return ref; }, orderBy: function () { return ref; },
      get: function () { return loadColl(coll).then(function () { var s = collSnap(coll, null, false); if (max && s.docs.length > max) { s.docs = s.docs.slice(0, max); s.size = s.docs.length; } return s; }); },
      onSnapshot: function (cb, errCb) {
        var l = { coll: coll, cb: cb, primed: false, last: {} }; collL.push(l);
        loadColl(coll).then(function () {
          if (l.primed) return;
          var docs = collDocs(coll); Object.keys(docs).forEach(function (p) { l.last[p] = JSON.stringify(docs[p]); });
          l.primed = true; cb(collSnap(coll, null, false));
        }).catch(function (e) { if (errCb) errCb(e); });
        return function () { var i = collL.indexOf(l); if (i >= 0) collL.splice(i, 1); };
      }
    };
    return ref;
  }
  function hasListener(f) {
    return docL.some(function (l) { return place(l.path).file === f.name; }) ||
      collL.some(function (l) { return filesOfColl(l.coll).indexOf(f.name) >= 0; });
  }
  var DB = { doc: docRef, collection: function (c) { return collRef(c); } };

  /* ---------- keeping up with everyone else ---------- */
  var lastActive = now();
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, function () { lastActive = now(); }, { capture: true, passive: true }); });
  function poll(force) {
    if (!ready || !(RS() && RS().token())) return;
    if (PREVIEW && !force) return;
    if (!force && document.visibilityState === 'hidden') return;
    var idle = now() - lastActive > IDLE_AFTER;
    Object.keys(F).forEach(function (k) {
      var f = F[k];
      if (!f.loaded || f.flushing || f.pending.length || f.loading || !hasListener(f)) return;
      /* last year's tickets and older barely change: look at them every half hour */
      var old = /^tickets-(\d{4})$/.test(k) && +k.slice(8) < new Date().getFullYear() - 1;
      var gap = old ? 1800000 : (idle ? IDLE_POLL_MS : POLL_MS);
      if (!force && now() - (f.polledAt || f.loadedAt) < gap) return;
      f.polledAt = now();
      load(f).catch(function () {});
    });
  }
  setInterval(function () { poll(false); }, 5000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') poll(true); });

  /* ---------- who is signed in ---------- */
  function me() { var s = RS() && RS().current(); return { name: (s && s.name) || '', email: (s && s.email) || '' }; }
  var USER = {
    id: function () { var m = me(); return Promise.resolve(m.email || ''); },
    profiles: function (ids) { var o = {}; (ids || []).forEach(function (id) { o[id] = { name: '' }; }); return Promise.resolve(o); },
    can: function () { var rs = RS(); return Promise.resolve(!PREVIEW && !!(rs && rs.canEdit && rs.canEdit(PROJECT))); },
    canEdit: function () { var rs = RS(); return Promise.resolve(!!(rs && rs.role && rs.role(PROJECT) === 'admin')); },
    me: function () { return Promise.resolve(me()); }
  };
  var DOWNLOADS = {
    save: function (o) {
      return new Promise(function (res) {
        var data = o && o.data, blob = data instanceof Blob ? data : new Blob([data], { type: 'application/octet-stream' });
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (o && o.filename) || 'download';
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); res(); }, 1500);
      });
    }
  };

  /* ---------- the sign-in gate ---------- */
  var ready = false, readyWaiters = [], gateEl = null;
  function whenReady() { return ready ? Promise.resolve() : new Promise(function (r) { readyWaiters.push(r); }); }
  var WHY = {
    UNKNOWN_PROJECT: 'The save relay doesn’t know the MMS yet. It’s being added to the relay’s project list.',
    NO_ACCESS: 'Your account doesn’t have the MMS yet. Ask Jonna Critchley to add you.',
    TOKEN: 'The save relay’s GitHub key was refused. It needs the mms-data repository added to it.',
    GITHUB: 'GitHub refused the save. The save relay’s GitHub key most likely doesn’t include the mms-data repository yet.',
    CONFIG_UNAVAILABLE: 'The save relay can’t read its settings right now.',
    OFFLINE: 'The MMS couldn’t reach the save relay. Check your connection.'
  };
  function gate(kind, e) {
    if (!document.body) { document.addEventListener('DOMContentLoaded', function () { gate(kind, e); }, { once: true }); return; }
    if (!gateEl) {
      var st = document.createElement('style');
      st.textContent = '#hq-gate{position:fixed;inset:0;z-index:9400;display:flex;align-items:center;justify-content:center;padding:16px;background:var(--ground,#f1f6fa);font-family:"IBM Plex Sans",system-ui,sans-serif}' +
        '#hq-gate[hidden]{display:none}#hq-gate .card{max-width:420px;width:100%;background:var(--surface,#fff);border:1px solid var(--border,#d5e2ed);border-radius:12px;padding:28px 26px;box-shadow:0 8px 28px rgba(13,49,76,.12)}' +
        '#hq-gate .ey{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3,#7794aa);margin-bottom:6px}#hq-gate h1{font-size:21px;margin:0 0 10px;color:var(--ink,#0d314c);font-weight:700}' +
        '#hq-gate p{font-size:14px;line-height:1.5;margin:0 0 18px;color:var(--ink-2,#456179)}#hq-gate button{font:inherit;font-size:14px;font-weight:600;padding:10px 18px;border-radius:6px;border:1px solid var(--navy,#0d314c);background:var(--navy,#0d314c);color:#fff;cursor:pointer}';
      document.head.appendChild(st);
      gateEl = document.createElement('div'); gateEl.id = 'hq-gate'; gateEl.setAttribute('role', 'dialog'); document.body.appendChild(gateEl);
    }
    if (!kind) { gateEl.hidden = true; return; }
    gateEl.hidden = false;
    var h, p, b = null, fn = null;
    if (kind === 'blank') { gateEl.innerHTML = ''; return; }
    if (kind === 'loading') { h = 'Opening the MMS…'; p = 'Reading the latest from the private data store.'; }
    else if (kind === 'nosession') { h = 'The MMS Couldn’t Load'; p = 'The resources.mismo.org sign-in didn’t load. Check your connection, then reload the page.'; b = 'Reload'; fn = function () { location.reload(); }; }
    else { h = 'The MMS Couldn’t Reach Its Data'; p = (e && (WHY[e.code] || e.message)) || 'Something went wrong reading the data.'; b = 'Try Again'; fn = function () { start(); }; }
    gateEl.innerHTML = '<div class="card"><div class="ey">MISMO Manufacturing System</div><h1></h1><p></p></div>';
    gateEl.querySelector('h1').textContent = h; gateEl.querySelector('p').textContent = p;
    if (b) { var btn = document.createElement('button'); btn.type = 'button'; btn.textContent = b; btn.addEventListener('click', fn); gateEl.querySelector('.card').appendChild(btn); }
  }
  var starting = false;
  function start() {
    var rs = RS();
    if (!rs) { gate('nosession'); return; }
    if (starting) return;
    if (ready && rs.current() && rs.role(PROJECT)) { gate(null); resumeWrites(); return; }
    starting = true; gate('blank');
    rs.requireAccess(PROJECT, { toolName: TOOL, eyebrow: 'Programs & Operations' }).then(function () {
      if (ready) return;
      gate('loading');
      return ensure(file('config'));
    }).then(function () {
      ready = true; starting = false; gate(null); resumeWrites();
      readyWaiters.splice(0).forEach(function (r) { r(); });
    }, function (e) {
      starting = false;
      if (e && e.code === 'NO_ACCESS') { rs.signIn({ reason: 'no-access', toolName: TOOL, gated: true }).catch(function () {}); return; }
      if (e && e.message === 'cancelled') return;
      gate('error', e);
    });
  }
  function resumeWrites() { Object.keys(F).forEach(function (k) { var f = F[k]; if (f.waitingSignIn) { f.waitingSignIn = false; schedule(f, 0); } }); }
  var askedSignIn = false;
  function needSignIn() { if (askedSignIn) return; askedSignIn = true; var rs = RS(); if (!rs) return; rs.signIn({ reason: 'expired' }).catch(function () {}).then(function () { askedSignIn = false; }); }
  function hookSession() { var rs = RS(); if (!rs) { gate('nosession'); return; } rs.onChange(function () { start(); }); start(); }

  /* ---------- a quiet line when a save has a problem ---------- */
  var toastEl = null, toastT = null;
  function toast(text, tone) {
    if (!document.body) return;
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.id = 'hq-savestate';
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;max-width:min(560px,calc(100vw - 32px));padding:10px 16px;border-radius:6px;font:500 13px/1.4 "IBM Plex Sans",system-ui,sans-serif;box-shadow:0 6px 20px rgba(13,49,76,.18)';
      document.body.appendChild(toastEl); }
    toastEl.textContent = text; toastEl.style.background = tone === 'bad' ? '#b3372c' : '#0d314c'; toastEl.style.color = '#fff'; toastEl.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.hidden = true; }, tone === 'bad' ? 9000 : 4000);
  }
  var troubled = false;
  function problem(e, lost) {
    status.lastError = (e && (e.code || e.message)) || 'error';
    if (lost) { toast('A change didn’t save (' + ((e && (WHY[e.code] || e.message)) || 'relay error') + '). It has been taken back.', 'bad'); return; }
    troubled = true;
    toast(e && (e.status === 401 || e.code === 'SIGNED_OUT') ? 'Sign in again to finish saving — nothing is lost.' : 'Not saved yet — trying again. Keep this tab open.', 'bad');
  }
  function saved() { if (troubled && !anyPending()) { troubled = false; toast('All changes saved.'); } }

  /* ---------- asking Claude: the relay's Ask route (the key stays in the relay) ---------- */
  function ask(prompt) {
    var rs = RS(), tok = rs && rs.token();
    if (!tok) return Promise.reject(err('SIGNED_OUT', 'Not signed in', 401));
    return fetch(RELAY_URL + '/' + PROJECT + '/ask', { method: 'POST', cache: 'no-store',
      headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: prompt })
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) {
      if (r.ok) return String((b && b.text) || '');
      throw err((b && b.error) || ('HTTP_' + r.status), (b && b.message) || 'The AI Review could not run', r.status);
    }); }, function () { throw err('OFFLINE', 'Could not reach the relay', 0); });
  }
  function promptOf(input) { return typeof input === 'string' ? input : (input || []).map(function (m) { return m.content; }).join('\n\n'); }
  var SAMPLE = function (input) { return ask(promptOf(input)).then(function (t) { return { text: t, truncated: false }; }); };
  SAMPLE.json = function (input) { return ask(promptOf(input)).then(function (t) {
    var a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a < 0 || b < a) throw err('BAD_JSON', 'The AI Review answer could not be read');
    return JSON.parse(t.slice(a, b + 1)); }); };
  SAMPLE.limits = function () { return Promise.resolve({ inputBytes: 75000 }); };

  /* ---------- the door ---------- */
  window.claude = {
    use: function (cap) {
      if (cap === 'db') return whenReady().then(function () { return DB; });
      if (cap === 'user') return whenReady().then(function () { return USER; });
      if (cap === 'downloads') return Promise.resolve(DOWNLOADS);
      if (cap === 'sample') return whenReady().then(function () { return PREVIEW ? null : SAMPLE; });
      return Promise.resolve(null);
    }
  };
  window.__hqRelay = { files: F, place: place, poll: function () { poll(true); }, pending: anyPending, status: status,
    why: function () { return WHY[status.lastError] || status.lastError || ''; }, config: { RELAY_URL: RELAY_URL, PROJECT: PROJECT, POLL_MS: POLL_MS } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hookSession); else hookSession();
})();
