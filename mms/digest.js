/* =====================================================================
   MMS Daily Digest: one engine, two places.
   - In the MMS (Settings > Daily Digest) it builds the preview and the
     "Send Now" emails from what is on screen.
   - On a schedule, mms/digest/run.mjs loads this same file in Node and
     builds the same emails from the same records.
   It knows nothing about the page: everything it needs is passed in.
   ===================================================================== */
(function (root) {
  'use strict';
  var D = {};
  var APP = 'https://resources.mismo.org/mms/';
  var LOGO = 'https://resources.mismo.org/mismo-signature-logo.png';
  var HOURS_URL = 'https://resources.mismo.org/service-orders/';
  var MT_URL = 'https://resources.mismo.org/meeting-trackers/';

  /* Every switch the digest has. Settings shows them as tick boxes. */
  D.SECTIONS = [
    { group: 'Every Day', items: [
      ['yourMove', 'Your move', 'Work requests waiting on the facilitator right now, with the next step.'],
      ['overdue', 'Past target', 'Work past its Target to Submit to IM date.'],
      ['targetUpdate', 'Update your Target to Submit to IM date', 'Targets that have passed or are coming up, with a nudge to change the date if it is no longer right.'],
      ['stalled', 'Sitting too long', 'Work that has not moved in longer than the stalled limit.'],
      ['cpToday', 'Comment period ends today', ''],
      ['cpTomorrow', 'Comment period ends tomorrow', ''],
      ['cpWeek', 'Comment period ends this week', 'Ending in the next seven days, after tomorrow.'],
      ['cpOpening', 'Comment period opens soon', 'Opening in the next seven days.'],
      ['cpAll', 'Show every open comment period, not just their own', 'Applies to the four comment period lines above.'],
      ['comments', 'New comments received', 'Comments sent through the comment form since the last digest.'],
      ['attendance', 'Meeting attendance still to log', 'Workgroup meetings in Meeting Trackers with no attendance logged yet.'],
      ['asks', 'Their requests waiting on MISMO staff', 'Hold, close or cancel requests not decided yet.'],
      ['arch', 'Architecture Help', 'Their open architecture requests and where each stands.'],
      ['media', 'MISMO Media requests for their work', 'Calls for Participation, posts and announcements in progress.'],
      ['movedToday', 'What moved today', 'Changes other people made to their work today.']
    ] },
    { group: 'Friday: the Weekly Wrap-Up', items: [
      ['wkOn', 'Send a weekly wrap-up on Fridays', 'Friday’s email becomes a look back at the week and ahead to next week.'],
      ['wkMoved', 'What moved this week', ''],
      ['wkPublished', 'Published this week (all MISMO)', ''],
      ['wkComment', 'Comment periods that opened or closed this week', ''],
      ['wkNext', 'Coming up next week', 'Targets and comment dates in the next seven days.'],
      ['wkOverdue', 'Still past target', '']
    ] },
    { group: 'Monday', items: [
      ['hours', 'Hours still to log in the Service Orders portal', 'Weeks the facilitator has not submitted yet. Only for people who log time.']
    ] }
  ];
  D.DEFAULTS = {
    on: false, days: [1, 2, 3, 4, 5], hour: 16, cc: ['pwilliams@mba.org', 'jcritchley@mba.org'], ccNames: 'Perry Williams, Jonna Critchley',
    skipEmpty: true, targetSoonDays: 14, staleDays: 45, attendanceDays: 60,
    sections: { yourMove: true, overdue: true, targetUpdate: true, stalled: true, cpToday: true, cpTomorrow: true, cpWeek: true, cpOpening: false, cpAll: false,
      comments: true, attendance: true, asks: true, arch: true, media: false, movedToday: true,
      wkOn: true, wkMoved: true, wkPublished: true, wkComment: true, wkNext: true, wkOverdue: true, hours: true },
    skip: {}
  };
  D.settings = function (s) {
    var o = JSON.parse(JSON.stringify(D.DEFAULTS));
    if (!s) return o;
    Object.keys(s).forEach(function (k) { if (k !== 'sections' && k !== 'skip') o[k] = s[k]; });
    Object.assign(o.sections, s.sections || {}); Object.assign(o.skip, s.skip || {});
    return o;
  };

  /* ---------- dates, always in Eastern time ---------- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function et(d) {
    var p = {};
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    } catch (e) { p = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes() }; }
    var ymd = p.year + '-' + String(p.month).padStart(2, '0') + '-' + String(p.day).padStart(2, '0');
    return { ymd: ymd, min: (+p.hour) * 60 + (+p.minute), dow: U(ymd).getUTCDay() };
  }
  function U(s) { var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null; }
  function Y(d) { return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'); }
  function add(s, n) { var d = U(s); d.setUTCDate(d.getUTCDate() + n); return Y(d); }
  function diff(a, b) { var x = U(a), y = U(b); return (x && y) ? Math.round((y - x) / 864e5) : null; }
  function f(s) { var d = U(s); return d ? MON[d.getUTCMonth()] + ' ' + d.getUTCDate() : ''; }
  function fl(s) { var d = U(s); return d ? DOW[d.getUTCDay()] + ', ' + MON[d.getUTCMonth()] + ' ' + d.getUTCDate() : ''; }
  function ageTxt(n) { if (n == null) return ''; if (n < 60) return n + ' day' + (n === 1 ? '' : 's'); if (n < 730) return Math.round(n / 30.4) + ' months'; return (n / 365).toFixed(1).replace(/\.0$/, '') + ' years'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function same(a, b) { a = String(a || '').trim().toLowerCase(); b = String(b || '').trim().toLowerCase(); if (!a || !b) return false; if (a === b) return true; var fa = a.split(/\s+/), fb = b.split(/\s+/); return fa.length === 1 ? fa[0] === fb[0] : (fb.length === 1 ? fb[0] === fa[0] : false); }

  /* ---------- the process, from the same settings the MMS uses ---------- */
  var BUILT = ['approved', 'cfp', 'kickoff', 'work', 'aireview', 'im', 'awg', 'designation', 'gc-comment', 'comment', 'post', 'gc-publish', 'release'];
  function proc(process) { var p = process || {}; return (p.presets && p.presets[p.active]) || { stages: [], gov: 'GC' }; }
  function stageName(P, k) { var s = (P.stages || []).find(function (x) { return x.key === k; }); return s ? s.name : (k === 'published' ? 'Published' : k); }
  function stageAge(t, today) { return diff(t.stageSince || (t.dates && t.dates.workStart) || (t.importedAt || '').slice(0, 10), today); }
  function pastTarget(t, today) { var d = t.dates || {}; return t.state === 'active' && !t.split && !t.rides && d.targetIM && d.targetIM < today && ['approved', 'cfp', 'kickoff', 'work', 'aireview'].indexOf(t.stage) >= 0; }
  /* The facilitator's next step, or null when the move is someone else's. Mirrors whoseMove() in the MMS. */
  function facMove(t, P) {
    if (t.state !== 'active' || t.split || t.rides || t.request) return null;
    var sub = t.sub || '';
    switch (t.stage) {
      case 'work': return 'Build the work product; submit for AI Review when ready';
      case 'aireview': return sub === 'updates' ? 'Make the updates AI Review found, then resubmit' : (sub === 'reviewed' ? 'Read the AI Review and send it to IM, or make updates' : 'Run the AI Review on the submission');
      case 'im': case 'awg': { var nm = t.stage === 'im' ? 'IM' : 'AWG'; if (sub === 'updates') return 'Make the ' + nm + ' updates, then resubmit'; if (sub === 'prep') return 'Submit to ' + nm; return null; }
      case 'designation': return (sub === 'prep' || !sub) ? 'Send it to designation with the comment length and page name' : null;
      case 'post': return 'Report what came back from comment';
    }
    var sd = (P.stages || []).find(function (s) { return s.key === t.stage; });
    if (sd && sd.owner === 'facilitator' && BUILT.indexOf(t.stage) < 0) return sd.desc || ('Finish ' + sd.name);
    return null;
  }

  /* ---------- Meeting Trackers: which meetings still need attendance ---------- */
  function meetsOn(rule, ymd) {
    if (!rule) return false; var d = U(ymd);
    if (rule.dow !== d.getUTCDay()) return false;
    if (rule.weeks === '*') return true;
    return (rule.weeks || []).indexOf(Math.floor((d.getUTCDate() - 1) / 7) + 1) >= 0;
  }
  function endMin(g) { var m = String(g.en || '').match(/^(\d{1,2}):(\d{2})$/); if (m) return (+m[1]) * 60 + (+m[2]); return 17 * 60; }
  D.attendanceOwed = function (mt, facName, now, days) {
    if (!mt || !mt.groups) return null;
    var n = et(now || new Date()), out = [];
    Object.keys(mt.groups).forEach(function (gk) {
      var g = mt.groups[gk];
      if (!g || g.removed || g.hold || g.archived || !g.rule || !same(g.fac, facName)) return;
      var have = mt.logged[gk] || {}, since = mt.since || '';
      var dates = [];
      for (var i = 0; i < (days || 60); i++) {
        var d = add(n.ymd, -i);
        if (since && d < since) break;
        if (!meetsOn(g.rule, d)) continue;
        if (i === 0 && n.min < endMin(g)) continue;
        if (!have[d]) dates.push(d);
      }
      if (dates.length) out.push({ gk: gk, name: g.name || gk, dates: dates });
    });
    return out.sort(function (a, b) { return a.name.localeCompare(b.name); });
  };

  /* ---------- Service Orders: weeks of hours not submitted (Fridays end a week) ---------- */
  function weMDY(ymd) { var d = U(ymd); return String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCFullYear()).slice(2); }
  function mdyToYmd(s) { var m = String(s || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); if (!m) return String(s || '').slice(0, 10); var y = m[3].length === 2 ? '20' + m[3] : m[3]; return y + '-' + String(m[1]).padStart(2, '0') + '-' + String(m[2]).padStart(2, '0'); }
  D.hoursOwed = function (file, now) {
    if (!file || !file.weeks) return null;
    var n = et(now || new Date());
    var sent = {}, back = {}, shut = {}, first = null;
    file.weeks.forEach(function (w) {
      var y = mdyToYmd(w.weekEnding); if (!first || y < first) first = y;
      if (w.state === 'returned') back[y] = 1; else sent[y] = 1;
      if (w.state === 'invoiced' || w.state === 'paid') shut[y.slice(0, 7)] = 1;
    });
    if (!first) return [];
    var lastFri = n.ymd; while (U(lastFri).getUTCDay() !== 5) lastFri = add(lastFri, -1);
    if (lastFri === n.ymd) lastFri = add(lastFri, -7);           /* this week is not owed until it ends */
    var out = [];
    for (var d = lastFri; d >= first && diff(d, n.ymd) <= 63; d = add(d, -7)) {
      if (sent[d] || shut[d.slice(0, 7)]) continue;
      out.push({ ending: d, label: weMDY(d), back: !!back[d] });
    }
    return out;
  };

  /* ---------- one person's digest ---------- */
  D.forPerson = function (input, person) {
    var cfg = D.settings(input.settings), on = cfg.sections, P = proc(input.process), gov = P.gov || 'GC';
    var now = input.now || new Date(), n = et(now), today = n.ymd, dow = n.dow;
    var friday = dow === 5 && on.wkOn, monday = dow === 1;
    var T = Object.keys(input.tickets || {}).map(function (k) { return input.tickets[k]; });
    var mine = T.filter(function (t) { return (t.state === 'active' || t.state === 'hold') && !t.split && same(t.facilitator, person.name); });
    var act = mine.filter(function (t) { return t.state === 'active'; });
    var S = [], count = { todo: 0, late: 0 };
    var link = function (t) { return APP + '#wr=' + encodeURIComponent(t.id); };
    var row = function (t, sub, badge, tone) { return { lead: t.wr, main: t.name, sub: sub, badge: badge, tone: tone, href: link(t) }; };

    if (on.yourMove) {
      var ym = act.map(function (t) { return [t, facMove(t, P)]; }).filter(function (x) { return x[1]; })
        .sort(function (a, b) { return (pastTarget(b[0], today) - pastTarget(a[0], today)) || ((stageAge(b[0], today) || 0) - (stageAge(a[0], today) || 0)); });
      count.todo = ym.length;
      if (ym.length) S.push({ key: 'yourMove', title: 'Your Move', note: ym.length + ' waiting on you', tone: 'warn',
        rows: ym.map(function (x) { var a = stageAge(x[0], today); return row(x[0], stageName(P, x[0].stage) + ': ' + x[1], a != null ? ageTxt(a) + ' at this stage' : '', pastTarget(x[0], today) ? 'bad' : (a != null && a > cfg.staleDays ? 'warn' : '')); }) });
    }
    var late = act.filter(function (t) { return pastTarget(t, today); });
    count.late = late.length;
    if (on.overdue && late.length) S.push({ key: 'overdue', title: 'Past Target', tone: 'bad', note: 'Past the Target to Submit to IM date',
      rows: late.map(function (t) { return row(t, stageName(P, t.stage), 'Was due ' + f(t.dates.targetIM), 'bad'); }) });
    if (on.targetUpdate) {
      var tu = act.filter(function (t) { var d = (t.dates || {}).targetIM; return ['approved', 'work', 'aireview'].indexOf(t.stage) >= 0 && !t.split && !t.rides && (!d || diff(today, d) <= cfg.targetSoonDays); })
        .sort(function (a, b) { return String((a.dates || {}).targetIM || '0').localeCompare(String((b.dates || {}).targetIM || '0')); });
      if (tu.length) S.push({ key: 'targetUpdate', title: 'Check Your Target to Submit to IM', tone: 'warn',
        note: 'If a date below is no longer right, open the work request and choose Change Target Date.',
        rows: tu.map(function (t) { var d = (t.dates || {}).targetIM; var k = d ? diff(today, d) : null;
          return row(t, !d ? 'No target date set yet' : (k < 0 ? 'Target passed ' + ageTxt(-k) + ' ago. Set a new date.' : (k === 0 ? 'Target is today' : 'Target in ' + ageTxt(k))), d ? f(d) : 'No date', !d || k < 0 ? 'bad' : 'warn'); }) });
    }
    if (on.stalled) {
      var st = act.filter(function (t) { var a = stageAge(t, today); return t.stage !== 'work' && t.stage !== 'comment' && a != null && a > cfg.staleDays; });
      if (st.length) S.push({ key: 'stalled', title: 'Sitting Too Long', tone: 'warn', rows: st.map(function (t) { return row(t, stageName(P, t.stage), ageTxt(stageAge(t, today)), 'warn'); }) });
    }
    /* comment periods */
    var cpPool = (on.cpAll ? T : mine).filter(function (t) { return t.stage === 'comment' && t.state === 'active' && t.sub !== 'setup' && t.dates && t.dates.commentEnd; });
    var cpName = function (t) { var x = t.productPageName || ''; return (!x || /^https?:|www\./i.test(x)) ? t.name : x; };
    var cpRow = function (t, badge, tone) { var r = row(t, (same(t.facilitator, person.name) ? '' : (t.facilitator || '') + ' · ') + 'Open ' + f(t.dates.commentStart) + ' to ' + f(t.dates.commentEnd), badge, tone); r.main = cpName(t); return r; };
    var cps = [];
    if (on.cpToday) cpPool.filter(function (t) { return t.dates.commentEnd === today; }).forEach(function (t) { cps.push(cpRow(t, 'Ends today', 'bad')); });
    if (on.cpTomorrow) cpPool.filter(function (t) { return t.dates.commentEnd === add(today, 1); }).forEach(function (t) { cps.push(cpRow(t, 'Ends tomorrow', 'warn')); });
    if (on.cpWeek) cpPool.filter(function (t) { var k = diff(today, t.dates.commentEnd); return k >= 2 && k <= 7; }).forEach(function (t) { cps.push(cpRow(t, 'Ends ' + fl(t.dates.commentEnd).split(',')[0], 'info')); });
    if (on.cpOpening) (on.cpAll ? T : mine).filter(function (t) { var s = (t.dates || {}).commentStart; var k = s ? diff(today, s) : null; return t.state === 'active' && k != null && k >= 0 && k <= 7; })
      .forEach(function (t) { cps.push(cpRow(t, 'Opens ' + f(t.dates.commentStart), 'good')); });
    if (cps.length) S.push({ key: 'cp', title: 'Comment Periods', tone: 'info', rows: cps });
    /* comments in from the form */
    if (on.comments && input.comments) {
      var since = add(today, monday ? -3 : -1);
      var mineIds = {}; mine.concat(T.filter(function (t) { return same(t.facilitator, person.name); })).forEach(function (t) { mineIds[t.id] = t; mineIds[t.wr] = t; });
      var cm = input.comments.filter(function (c) { var t = mineIds[c.ticket] || mineIds[c.wr]; return t && String(c.submittedAt || '').slice(0, 10) >= since; });
      if (cm.length) S.push({ key: 'comments', title: 'New Comments', tone: 'info', note: cm.length + ' new since ' + (monday ? 'Friday' : 'yesterday'),
        rows: cm.map(function (c) { var t = mineIds[c.ticket] || mineIds[c.wr]; return { lead: t.wr, main: (c.name || 'Someone') + (c.company ? ', ' + c.company : ''), sub: String(c.comment || '').slice(0, 160) + (String(c.comment || '').length > 160 ? '…' : ''), badge: f(String(c.submittedAt).slice(0, 10)), href: link(t) }; }) });
    }
    /* attendance */
    if (on.attendance) {
      var owed = D.attendanceOwed(input.mt, person.name, now, cfg.attendanceDays);
      if (owed && owed.length) S.push({ key: 'attendance', title: 'Attendance Still to Log', tone: 'warn', note: 'In Meeting Trackers', button: { href: MT_URL, label: 'Open Meeting Trackers' },
        rows: owed.map(function (g) { return { lead: g.dates.length + ' meeting' + (g.dates.length === 1 ? '' : 's'), main: g.name, sub: g.dates.slice(0, 6).map(f).join(', ') + (g.dates.length > 6 ? ' and ' + (g.dates.length - 6) + ' more' : ''), badge: '', href: MT_URL }; }) });
    }
    if (on.asks) {
      var ak = mine.filter(function (t) { return t.request && same(t.request.by, person.name); });
      if (ak.length) S.push({ key: 'asks', title: 'Your Requests Waiting on MISMO Staff', tone: 'info', rows: ak.map(function (t) { return row(t, 'Asked to ' + t.request.kind + (t.request.why ? ': ' + t.request.why : ''), f(String(t.request.at || '').slice(0, 10))); }) });
    }
    if (on.arch && input.arch) {
      var ar = Object.keys(input.arch).map(function (k) { return input.arch[k]; }).filter(function (a) { return same(a.requestedBy, person.name) && ['Done', 'Declined'].indexOf(a.status) < 0; });
      if (ar.length) S.push({ key: 'arch', title: 'Architecture Help', tone: 'info', rows: ar.map(function (a) { return { lead: a.id, main: a.title, sub: (a.wr ? a.wr + ' · ' : '') + (a.needBy ? 'Target ' + f(a.needBy) : ''), badge: a.status, href: APP + '#arch' }; }) });
    }
    if (on.media && input.media) {
      var md = Object.keys(input.media).map(function (k) { return input.media[k]; }).filter(function (m) { var t = (input.tickets || {})[m.ticket]; return m.status !== 'Done' && t && same(t.facilitator, person.name); });
      if (md.length) S.push({ key: 'media', title: 'MISMO Media Requests', tone: 'info', rows: md.map(function (m) { return { lead: m.wr, main: m.kind, sub: m.name, badge: m.status, href: APP + '#media' }; }) });
    }
    var hist = function (from) { var out = []; mine.concat(T.filter(function (t) { return t.state === 'published' && same(t.facilitator, person.name); })).forEach(function (t) { (t.history || []).forEach(function (h) { var d = String(h.at || '').slice(0, 10); if (d >= from && d <= today && !same(h.by, person.name) && !/^Brought over/.test(h.text || '')) out.push([t, h]); }); }); return out.sort(function (a, b) { return String(b[1].at).localeCompare(String(a[1].at)); }); };
    if (on.movedToday && !friday) {
      var mv = hist(today);
      if (mv.length) S.push({ key: 'moved', title: 'What Moved Today', tone: 'good', rows: mv.slice(0, 12).map(function (x) { return row(x[0], x[1].text + (x[1].by ? ' (' + x[1].by + ')' : ''), ''); }) });
    }
    /* Friday wrap-up */
    if (friday) {
      var wkStart = add(today, -4);
      if (on.wkMoved) { var wm = hist(wkStart); if (wm.length) S.push({ key: 'wkMoved', title: 'What Moved This Week', tone: 'good', note: wm.length + ' change' + (wm.length === 1 ? '' : 's') + ' to your work', rows: wm.slice(0, 15).map(function (x) { return row(x[0], x[1].text, f(String(x[1].at).slice(0, 10))); }) }); }
      if (on.wkPublished) { var pb = T.filter(function (t) { var d = (t.dates || {}).published; return t.state === 'published' && d && d >= wkStart && d <= today; }); if (pb.length) S.push({ key: 'wkPublished', title: 'Published This Week', tone: 'good', note: 'Across MISMO', rows: pb.map(function (t) { return row(t, t.workgroup || '', f(t.dates.published), 'good'); }) }); }
      if (on.wkComment) { var wc = []; mine.concat(T.filter(function (t) { return same(t.facilitator, person.name); })).forEach(function (t) { var d = t.dates || {}; if (d.commentStart >= wkStart && d.commentStart <= today) wc.push(cpRow(t, 'Opened ' + f(d.commentStart), 'good')); if (d.commentEnd >= wkStart && d.commentEnd < today) wc.push(cpRow(t, 'Closed ' + f(d.commentEnd), '')); }); if (wc.length) S.push({ key: 'wkComment', title: 'Comment Periods This Week', tone: 'info', rows: wc }); }
      if (on.wkNext) { var nx = []; act.forEach(function (t) { var d = t.dates || {}; [['targetIM', 'Target to Submit to IM'], ['commentStart', 'Comment opens'], ['commentEnd', 'Comment ends']].forEach(function (k) { var v = d[k[0]]; var x = v ? diff(today, v) : null; if (x != null && x >= 1 && x <= 7) nx.push([v, row(t, k[1], fl(v).slice(0,3) + ', ' + f(v), 'info')]); }); }); nx.sort(function (a, b) { return a[0].localeCompare(b[0]); }); if (nx.length) S.push({ key: 'wkNext', title: 'Coming Up Next Week', tone: 'info', rows: nx.map(function (x) { return x[1]; }) }); }
      if (on.wkOverdue && late.length && !on.overdue) S.push({ key: 'wkOverdue', title: 'Still Past Target', tone: 'bad', rows: late.map(function (t) { return row(t, stageName(P, t.stage), 'Was due ' + f(t.dates.targetIM), 'bad'); }) });
    }
    /* Monday hours */
    if (monday && on.hours && input.hours) {
      var hw = D.hoursOwed(input.hours[person.name], now);
      if (hw && hw.length) S.push({ key: 'hours', title: 'Hours Still to Log', tone: 'bad', note: 'In the Service Orders portal', button: { href: HOURS_URL, label: 'Log My Hours' },
        rows: hw.map(function (w) { return { lead: 'Week ending', main: fl(w.ending), sub: w.back ? 'Sent back to you to correct' : 'Not submitted yet', badge: w.back ? 'Sent back' : 'Not submitted', tone: w.back ? 'warn' : 'bad', href: HOURS_URL }; }) });
    }
    var first = String(person.name || '').split(' ')[0];
    var kind = friday ? 'weekly' : (monday ? 'monday' : 'daily');
    var subject = friday ? 'Your MMS Week in Review, ' + f(add(today, -4)) + ' to ' + f(today)
      : 'Your MMS Day' + (count.todo ? ': ' + count.todo + ' to do' : '') + (count.late ? ', ' + count.late + ' past target' : '') + ' (' + f(today) + ')';
    var intro = friday ? 'Here’s how the week went for your work, and what’s coming next week.'
      : (S.length ? (count.todo ? 'You have <b>' + count.todo + '</b> work request' + (count.todo === 1 ? '' : 's') + ' waiting on you' + (count.late ? ', and <b>' + count.late + '</b> ' + (count.late === 1 ? 'is' : 'are') + ' past target' : '') + '.' : 'Nothing is waiting on you right now. Here’s what’s happening with your work.') : 'Nothing needs you today. Nice work.');
    var html = D.html({ first: first, title: friday ? 'Your Week in Review' : (monday ? 'Your Monday Start' : 'Your Day in the MMS'), dateLine: fl(today), intro: intro, sections: S });
    return { name: person.name, email: person.email || '', kind: kind, subject: subject, html: html, text: D.text(first, intro, S), sections: S.length, counts: count, empty: !S.length };
  };

  D.build = function (input) {
    var cfg = D.settings(input.settings), people = (input.people && input.people.facilitators) || [];
    return people.filter(function (p) { return p && p.name && !cfg.skip[p.name]; }).map(function (p) {
      var m = D.forPerson(input, p); m.to = p.email ? [p.email] : []; m.cc = (cfg.cc || []).filter(Boolean); return m;
    });
  };
  D.isSendDay = function (settings, now) { var cfg = D.settings(settings), n = et(now || new Date()); return (cfg.days || []).indexOf(n.dow) >= 0; };

  /* ---------- the email itself: email-safe tables, MISMO navy and sky ---------- */
  var TONE = { bad: ['#b3372c', '#fbe9e7'], warn: ['#8a5d0f', '#fbf1dc'], info: ['#1f5f93', '#e4f2fb'], good: ['#0f7b5c', '#e3f4ed'], '': ['#456179', '#eef3f7'] };
  function btn(href, label, big) {
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:' + (big ? '22px 0 6px' : '10px 0 2px') + '"><tr><td bgcolor="#0d314c" style="border-radius:6px;background:#0d314c">' +
      '<a href="' + esc(href) + '" target="_blank" style="display:inline-block;padding:' + (big ? '13px 26px' : '8px 16px') + ';font-family:\'IBM Plex Sans\',Arial,sans-serif;font-size:' + (big ? '15px' : '13px') + ';font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;border-bottom:3px solid #74bfeb">' + esc(label) + ' &rarr;</a></td></tr></table>';
  }
  D.html = function (o) {
    var F = "font-family:'IBM Plex Sans',Arial,Helvetica,sans-serif;";
    var sec = (o.sections || []).map(function (s) {
      var c = TONE[s.tone || ''] || TONE[''];
      return '<tr><td style="padding:0 28px 18px">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #d5e2ed;border-radius:8px;border-collapse:separate;overflow:hidden">' +
        '<tr><td style="' + F + 'padding:11px 16px;background:' + c[1] + ';border-bottom:1px solid #d5e2ed;border-left:4px solid ' + c[0] + '">' +
        '<span style="font-size:15px;font-weight:700;color:#0d314c">' + esc(s.title) + '</span>' + (s.rows && !s.noCount ? ' <span style="font-size:12px;font-weight:700;color:' + c[0] + '">&nbsp;' + s.rows.length + '</span>' : '') +
        (s.note ? '<div style="font-size:12.5px;color:#456179;margin-top:2px">' + esc(s.note) + '</div>' : '') + '</td></tr>' +
        (s.rows || []).map(function (r, i) {
          var rc = TONE[r.tone || ''] || TONE[''];
          return '<tr><td style="' + F + 'padding:10px 16px;border-top:' + (i ? '1px solid #e5eef5' : '0') + '">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
            '<td style="' + F + 'vertical-align:top;font-size:13.5px;color:#0d314c">' +
            (r.lead ? '<div style="font-size:11px;font-weight:700;letter-spacing:.04em;color:#7794aa;text-transform:uppercase">' + esc(r.lead) + '</div>' : '') +
            '<a href="' + esc(r.href || APP) + '" target="_blank" style="font-weight:700;color:#0d314c;text-decoration:none">' + esc(r.main) + '</a>' +
            (r.sub ? '<div style="font-size:12.5px;color:#456179;margin-top:2px">' + esc(r.sub) + '</div>' : '') + '</td>' +
            (r.badge ? '<td style="' + F + 'vertical-align:top;text-align:right;white-space:nowrap;padding-left:12px"><span style="display:inline-block;font-size:11.5px;font-weight:700;color:' + rc[0] + ';background:' + rc[1] + ';border-radius:4px;padding:3px 8px">' + esc(r.badge) + '</span></td>' : '') +
            '</tr></table></td></tr>';
        }).join('') +
        (s.button ? '<tr><td style="padding:0 16px 12px">' + btn(s.button.href, s.button.label) + '</td></tr>' : '') +
        '</table></td></tr>';
    }).join('');
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>' + esc(o.title) + '</title></head>' +
      '<body style="margin:0;padding:0;background:#f1f6fa">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f1f6fa" style="background:#f1f6fa"><tr><td align="center" style="padding:24px 12px">' +
      '<table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:10px;border-collapse:separate;overflow:hidden;box-shadow:0 2px 10px rgba(13,49,76,.08)">' +
      '<tr><td bgcolor="#0d314c" style="background:#0d314c;padding:18px 28px;border-bottom:4px solid #74bfeb">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><img src="' + LOGO + '" alt="MISMO" width="120" style="display:block;border:0;background:#ffffff;border-radius:6px;padding:6px 10px"></td>' +
      '<td align="right" style="' + F + 'font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#74bfeb">MISMO Manufacturing System</td></tr></table></td></tr>' +
      '<tr><td style="' + F + 'padding:24px 28px 6px"><div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#7794aa">' + esc(o.dateLine) + '</div>' +
      '<div style="font-size:24px;font-weight:700;color:#0d314c;margin:4px 0 8px">' + esc(o.title) + '</div>' +
      '<div style="font-size:15px;color:#0d314c;line-height:1.5">Hi ' + esc(o.first || 'there') + ',</div><div style="font-size:15px;color:#456179;line-height:1.5;margin-top:4px">' + o.intro + '</div>' +
      btn(o.button ? o.button.href : APP + '#mine', o.button ? o.button.label : 'Open My Queue', true) + '</td></tr>' +
      '<tr><td style="height:14px;line-height:14px;font-size:0">&nbsp;</td></tr>' + sec +
      '<tr><td style="' + F + 'padding:6px 28px 24px;font-size:12px;color:#7794aa;line-height:1.5;border-top:1px solid #e5eef5">' + (o.footer || 'Sent by the MMS to MISMO facilitators at the end of each workday. Click any work request to open it.') + ' Questions about this email: <a href="mailto:workrequests@mismo.org" style="color:#2477b8">workrequests@mismo.org</a>.</td></tr>' +
      '</table></td></tr></table></body></html>';
  };
  D.text = function (first, intro, S) {
    var t = 'Hi ' + first + ',\n\n' + intro.replace(/<[^>]+>/g, '') + '\n\nOpen My Queue: ' + APP + '#mine\n';
    S.forEach(function (s) { t += '\n' + s.title.toUpperCase() + '\n'; (s.rows || []).forEach(function (r) { t += '- ' + (r.lead ? r.lead + ' ' : '') + r.main + (r.sub ? ': ' + r.sub : '') + (r.badge ? ' (' + r.badge + ')' : '') + '\n'; }); });
    return t;
  };
  D.et = et;
  if (typeof module !== 'undefined' && module.exports) module.exports = D; else root.MMSDigest = D;
})(typeof window !== 'undefined' ? window : globalThis);
