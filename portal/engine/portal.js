/* MISMO certification portal, sample edition (Jonna, 21 Nov 2026: "one each of the certifications so i can show them").
   One engine for every company certification's example portal. Each page under /portal/<program>/ carries its own
   settings in <script id="cfg" type="application/json">: the journey, the steps, a made-up sample company, and the
   application and questionnaire questions copied from the live forms on resources.mismo.org/forms/.
   Nothing is sent or uploaded: everything stays in this browser (localStorage), and Restore the Sample puts it back.
   The AI Governance portal (/portal/ai-governance/) is its own page and does not use this engine. */
(function () {
"use strict";
var CFG = JSON.parse(document.getElementById("cfg").textContent);
var KEY = "resources:" + CFG.key + "-portal:draft", SKEY = "resources:" + CFG.key + "-portal:signedin";
var CO = CFG.sample;

/* ---------- helpers ---------- */
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function filled(v) { if (Array.isArray(v)) return v.length > 0; return v != null && v !== false && String(v).trim() !== ""; }
function clone(x) { return JSON.parse(JSON.stringify(x)); }
function toast(msg) { var t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 2600); }
function fsize(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1e3)) + " KB"; }
function ftype(n) { var e = (String(n).split(".").pop() || "").toLowerCase(); var c = { pdf: "#b3372c", doc: "#2477b8", docx: "#2477b8", xls: "#0f7b5c", xlsx: "#0f7b5c", csv: "#0f7b5c", ppt: "#c25a1d", pptx: "#c25a1d", png: "#6b5bb5", jpg: "#6b5bb5", jpeg: "#6b5bb5", mp4: "#6b5bb5", zip: "#55687a", xml: "#0f7b5c" }[e] || "#55687a"; return '<span class="ftype" style="background:' + c + '">' + esc(e.slice(0, 4).toUpperCase() || "FILE") + "</span>"; }
function ringSvg(p) { var size = 132, stroke = 10, r = (size - stroke) / 2, c = 2 * Math.PI * r; return '<svg viewBox="0 0 132 132" aria-hidden="true"><circle cx="66" cy="66" r="' + r + '" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="10"/><circle cx="66" cy="66" r="' + r + '" fill="none" stroke="#74bfeb" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (c * p).toFixed(1) + " " + c.toFixed(1) + '"/></svg>'; }
function fmtDay(iso) { var d = new Date(iso + "T12:00:00"); return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); }
function addDays(n) { var d = new Date(); d.setDate(d.getDate() + n); while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); }
function first(name) { return String(name || "").split(" ")[0] || "there"; }

/* ---------- the sample, and saving ---------- */
function sample() {
  var s = { v: 1, step: 1, qsec: 0, values: clone(CO.values || {}), reps: clone(CO.reps || {}), answers: clone(CO.answers || {}), docs: clone(CO.docs || []), booking: {}, attest: false, signer: "", submitted: false };
  (CFG.steps || []).forEach(function (st) { if (st.type === "booking") s.booking[st.id] = { chosen: null, slots: [addDays(st.offset || 9) + "|10:00 AM ET", addDays((st.offset || 9) + 1) + "|1:30 PM ET", addDays((st.offset || 9) + 3) + "|11:00 AM ET"] }; });
  return s;
}
function load() { try { var t = localStorage.getItem(KEY); if (t) { var x = JSON.parse(t); if (x && x.v === 1) return x; } } catch (e) {} return sample(); }
var S = load(), savedAt = null;
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} savedAt = new Date(); var el = $("savedline"); if (el) el.textContent = "Saved " + savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }

/* ---------- counting what is done ---------- */
function visible(f, vals) { if (!f.showIf) return true; return String(vals[f.showIf.key] || "") === String(f.showIf.equals); }
function fieldsOf(st) { var out = []; (st.sections || []).forEach(function (sec) { (sec.fields || []).forEach(function (f) { if (f.type !== "checkbox" || f.required) out.push(f); }); }); return out; }
function fieldStats(st) {
  var req = fieldsOf(st).filter(function (f) { return f.required && visible(f, S.values); }), d = req.filter(function (f) { return filled(S.values[f.key]); }).length;
  var tot = req.length;
  (st.sections || []).forEach(function (sec) { (sec.repeatingBlocks || []).forEach(function (b) {
    var items = S.reps[b.key] || [], need = b.fields.filter(function (f) { return f.required; });
    tot += Math.max(items.length, b.min || 1);
    items.forEach(function (it) { if (need.every(function (f) { return filled(it[f.key]); })) d++; });
  }); });
  return { done: d, tot: tot };
}
function qItems(st) { var out = []; (st.form.sections || []).forEach(function (sec, si) { (sec.items || []).forEach(function (it) { if (it.number) out.push(si + "-" + it.number); }); (sec.blocks || []).forEach(function (b, bi) { out.push(si + "-b" + bi); }); }); return out; }
function ansFilled(a) { if (a == null) return false; if (typeof a === "object" && !Array.isArray(a)) return Object.keys(a).some(function (k) { return filled(a[k]); }); return filled(a); }
function qStats(st, si) { var ids = qItems(st).filter(function (id) { return si == null || id.split("-")[0] === String(si); }); return { done: ids.filter(function (id) { return ansFilled(S.answers[id]); }).length, tot: ids.length }; }
function docStats(st) { var areas = st.areas.filter(function (a) { return !a.optional; }); return { done: areas.filter(function (a) { return S.docs.some(function (d) { return d.area === a.code; }); }).length, tot: areas.length, files: S.docs.filter(function (d) { return st.areas.some(function (a) { return a.code === d.area; }); }).length }; }
function stepStats(st) {
  if (st.type === "fields") return fieldStats(st);
  if (st.type === "questionnaire") return qStats(st);
  if (st.type === "docs") return docStats(st);
  if (st.type === "booking") return { done: S.booking[st.id] && S.booking[st.id].chosen ? 1 : 0, tot: 1 };
  if (st.type === "exercise") return { done: S.docs.some(function (d) { return d.area === "exercise"; }) ? 1 : 0, tot: 1 };
  return { done: S.submitted ? 1 : 0, tot: 1 };
}
function overall() { var d = 0, t = 0; CFG.steps.forEach(function (st) { if (st.type === "review") return; var x = stepStats(st); d += x.done; t += x.tot; }); d += S.attest ? 1 : 0; t += 1; return t ? d / t : 0; }
function stepOk(st) { var x = stepStats(st); return x.tot > 0 && x.done >= x.tot; }
function stepSub(st) {
  var x = stepStats(st);
  if (st.type === "fields") return x.done + " of " + x.tot + " done";
  if (st.type === "questionnaire") return x.done + " of " + x.tot + " answered";
  if (st.type === "docs") return x.files + " uploaded · " + x.done + " of " + x.tot + " areas";
  if (st.type === "booking") { var b = S.booking[st.id] || {}; return b.chosen ? "Booked " + fmtDay(b.chosen.split("|")[0]).replace(/^\w+, /, "") : "Pick a time"; }
  if (st.type === "exercise") return x.done ? "Response uploaded" : "Brief and scenario";
  return S.submitted ? "Sent to MISMO" : "Check, sign and send";
}

/* ---------- hero and steps ---------- */
function paintHero() {
  var p = overall(), now = S.submitted ? CFG.now + 1 : CFG.now;
  var h = '<div class="wrap"><div style="min-width:0"><div class="kicker">' + esc(CFG.kicker) + "</div>" +
    "<h1>Welcome, " + esc(first(CO.contactName)) + ". Let's get <span>" + esc(CO.subject) + "</span> certified.</h1>" +
    '<p class="sub">' + esc(CFG.heroSub) + "</p>" +
    '<div class="meta">' + (CFG.meta || []).map(function (m) { return "<span>" + esc(m[0]) + " <b>" + esc(m[1]) + "</b></span>"; }).join("") + "</div></div>" +
    '<div class="ring" aria-label="' + Math.round(p * 100) + ' percent complete">' + ringSvg(p) + '<div class="lbl"><span class="pct">' + Math.round(p * 100) + '%</span><span class="cap">' + (S.submitted ? "Submitted" : "Complete") + "</span></div></div>" +
    '<div class="journey" style="--j:' + CFG.journey.length + '">' + CFG.journey.map(function (j, i) { var c = i < now ? "done" : i === now ? "now" : ""; return '<div class="jstop ' + c + '"><span class="dot"></span>' + esc(j[0]) + '<span class="who">' + esc(i === now ? (S.submitted ? "With MISMO now" : "You are here") : j[1]) + "</span></div>"; }).join("") + "</div></div>";
  $("hero").innerHTML = h;
}
function paintSteps() {
  var el = $("steps"); el.style.setProperty("--n", CFG.steps.length);
  el.innerHTML = CFG.steps.map(function (st, i) { var n = i + 1, ok = st.type === "review" ? S.submitted : stepOk(st); return '<button type="button" class="stepbtn' + (ok ? " ok" : "") + '" data-step="' + n + '"' + (S.step === n ? ' aria-current="step"' : "") + '><span class="n">' + (ok && S.step !== n ? "&#10003;" : n) + '</span><span><span class="t">' + esc(st.title) + '</span><span class="s">' + esc(stepSub(st)) + "</span></span></button>"; }).join("");
}

/* ---------- application-style fields ---------- */
function inputFor(f, val, scope, idx) {
  var id = "f-" + scope + "-" + (idx == null ? "" : idx + "-") + f.key, a = ' id="' + id + '" data-scope="' + scope + '" data-k="' + esc(f.key) + '"' + (idx == null ? "" : ' data-i="' + idx + '"');
  if (f.type === "longtext") return '<textarea class="in" rows="' + (f.lines || 3) + '"' + a + ">" + esc(val) + "</textarea>";
  if (f.type === "choice") return '<select class="in"' + a + '><option value="">Choose…</option>' + (f.options || []).map(function (o) { return "<option" + (o === val ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>";
  if (f.type === "checkbox") return '<label class="tick"><input type="checkbox"' + a + (val ? " checked" : "") + "> " + esc(f.label) + "</label>";
  var t = { email: "email", tel: "tel", url: "url", number: "number", date: "date" }[f.type] || "text";
  return '<input class="in" type="' + t + '"' + a + ' value="' + esc(val) + '">';
}
function fieldHTML(f, val, scope, idx, fromApp) {
  if (f.type === "checkbox") return '<div class="fld">' + inputFor(f, val, scope, idx) + (f.help ? '<span class="help">' + esc(f.help) + "</span>" : "") + "</div>";
  var id = "f-" + scope + "-" + (idx == null ? "" : idx + "-") + f.key;
  return '<div class="fld' + (f.type === "longtext" ? " wide" : "") + '"><label for="' + id + '">' + esc(f.label) + (f.required ? '<span class="req" aria-hidden="true">*</span>' : "") + (fromApp && filled(val) ? '<span class="from">From your application</span>' : "") + "</label>" + (f.help ? '<span class="help">' + esc(f.help) + "</span>" : "") + inputFor(f, val, scope, idx) + "</div>";
}
function stepFields(st) {
  var h = '<div class="panel"><div class="ph"><div><h2>' + esc(st.title) + "</h2><p>" + esc(st.intro) + '</p></div><div class="tools"><span class="muted" id="savedline" style="font-size:12.5px"></span></div></div><div class="pb">';
  st.sections.forEach(function (sec) {
    h += '<div class="sectlabel">' + esc(sec.heading) + "</div>" + (sec.help ? '<p class="muted" style="margin:-4px 0 12px;font-size:13.5px">' + esc(sec.help) + "</p>" : "");
    if (sec.fields && sec.fields.length) {
      h += '<div class="fgrid" style="--cols:' + (sec.cols || 3) + ';margin-bottom:18px">' + sec.fields.filter(function (f) { return visible(f, S.values); }).map(function (f) { return fieldHTML(f, S.values[f.key], "v", null, true); }).join("") + "</div>";
    }
    (sec.repeatingBlocks || []).forEach(function (b) {
      var items = S.reps[b.key] || [];
      h += items.map(function (it, i) {
        return '<div class="rep"><div class="rephead"><b>' + esc(b.itemLabel) + " " + (i + 1) + "</b>" + (items.length > (b.min || 1) ? '<button type="button" class="linkbtn" data-repdel="' + esc(b.key) + "|" + i + '">Remove</button>' : "") + '</div><div class="fgrid" style="--cols:3">' + b.fields.map(function (f) { return fieldHTML(f, it[f.key], "r:" + b.key, i, true); }).join("") + "</div></div>";
      }).join("") + (items.length < (b.max || 20) ? '<button type="button" class="btn ghost sm" data-repadd="' + esc(b.key) + '" style="margin:4px 0 18px">Add ' + esc(b.itemLabel) + "</button>" : "");
    });
  });
  return h + foot() + "</div></div>";
}

/* ---------- the questionnaire ---------- */
function answerInput(it, id) {
  var a = S.answers[id], t = it.type, h = "";
  var tableOf = function (kind) { return (it.tables || []).filter(function (x) { return x.kind === kind; })[0]; };
  if (t === "single_select" || t === "single_select_explain") {
    var cur = a && typeof a === "object" ? a.pick : a;
    h += '<div class="opts">' + (it.options || []).map(function (o, i) { return '<label class="opt"><input type="radio" name="q' + id + '" data-q="' + id + '" data-part="pick" value="' + esc(o) + '"' + (cur === o ? " checked" : "") + "><span>" + esc(o) + "</span></label>"; }).join("") + "</div>";
    if (t === "single_select_explain") h += '<textarea class="in" rows="2" data-q="' + id + '" data-part="explain" placeholder="Explain">' + esc(a && a.explain) + "</textarea>";
    return h;
  }
  if (t === "multi_select" || t === "checkbox_unspecified") {
    var opts = (it.options && it.options.length) ? it.options : ((tableOf("checkbox_grid") || {}).options || []), sel = Array.isArray(a) ? a : [];
    return '<div class="opts">' + opts.map(function (o) { return '<label class="opt"><input type="checkbox" data-q="' + id + '" data-part="multi" value="' + esc(o) + '"' + (sel.indexOf(o) >= 0 ? " checked" : "") + "><span>" + esc(o) + "</span></label>"; }).join("") + "</div>";
  }
  if (t === "yes_no" || t === "yes_no_explain") {
    var yn = a && typeof a === "object" ? a.yn : a;
    h += '<div class="yn"><button type="button" class="yes" data-yn="' + id + '|Yes" aria-pressed="' + (yn === "Yes") + '">Yes</button><button type="button" class="no" data-yn="' + id + '|No" aria-pressed="' + (yn === "No") + '">No</button></div>';
    if (t === "yes_no_explain") h += '<textarea class="in" rows="2" data-q="' + id + '" data-part="explain" placeholder="Explain">' + esc(a && a.explain) + "</textarea>";
    return h;
  }
  if (t === "matrix") {
    var m = tableOf("matrix") || {}, v = a && typeof a === "object" ? a : {};
    return '<div class="tblwrap"><table class="docs mtx"><thead><tr><th></th>' + (m.levels || []).map(function (l) { return "<th>" + esc(l) + "</th>"; }).join("") + "</tr></thead><tbody>" + (m.subjects || []).map(function (sj, r) { return "<tr><td>" + esc(sj) + "</td>" + (m.levels || []).map(function (l) { return '<td class="c"><input type="radio" aria-label="' + esc(sj + ": " + l) + '" name="m' + id + "-" + r + '" data-q="' + id + '" data-part="' + esc(sj) + '" value="' + esc(l) + '"' + (v[sj] === l ? " checked" : "") + "></td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  if (t === "grid") {
    var g = tableOf("grid") || {}, cols = g.columns || [], rows = Math.min(g.blank_rows || 3, 4), gv = a && typeof a === "object" ? a : {};
    return '<div class="tblwrap"><table class="docs"><thead><tr>' + cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" + Array.apply(null, Array(rows)).map(function (_, r) { return "<tr>" + cols.map(function (c) { var k = r + ":" + c; return '<td><input class="in" aria-label="' + esc(c) + '" data-q="' + id + '" data-part="' + esc(k) + '" value="' + esc(gv[k]) + '"></td>'; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  if (t === "repeating_block") {
    var rv = a && typeof a === "object" ? a : {};
    return (it.subparts || []).map(function (sp) { var fb = (sp.tables || [])[0] || {}; return '<div class="rep"><div class="rephead"><b>' + esc(sp.label) + '</b></div><div class="fgrid" style="--cols:2">' + (fb.fields || []).map(function (f) { var k = sp.label + ":" + f; return '<div class="fld"><label>' + esc(f) + '</label><input class="in" data-q="' + id + '" data-part="' + esc(k) + '" value="' + esc(rv[k]) + '"></div>'; }).join("") + "</div></div>"; }).join("");
  }
  if (t === "short_text") return '<input class="in" data-q="' + id + '" data-part="" value="' + esc(a) + '">';
  var must = (t === "long_text_with_checklist" && it.options && it.options.length) ? '<div class="must"><b>Make sure you cover</b>' + it.options.map(function (o) { return "<span>" + esc(o) + "</span>"; }).join("") + "</div>" : "";
  var parts = (t === "multi_part_text" && it.subparts && it.subparts.length) ? it.subparts : null;
  if (parts) { var pv = a && typeof a === "object" ? a : {}; return parts.map(function (sp) { return '<div class="fld"><label>' + esc(sp.label) + '</label><textarea class="in" rows="2" data-q="' + id + '" data-part="' + esc(sp.label) + '">' + esc(pv[sp.label]) + "</textarea></div>"; }).join(""); }
  return must + '<textarea class="in" rows="' + Math.max(3, Math.min(6, it.response_lines || 3)) + '" data-q="' + id + '" data-part="">' + esc(a) + "</textarea>";
}
function qCard(it, si) {
  var id = si + "-" + it.number, done = ansFilled(S.answers[id]);
  return '<div class="q' + (done ? " answered" : "") + '" id="q-' + id + '"><div class="qhead"><span class="tag">Question ' + esc(it.number) + '</span><span class="state ' + (done ? "ok" : "todo") + '">' + (done ? "&#10003; Answered" : "To answer") + '</span></div><div class="qt">' + esc(it.text) + "</div>" +
    ((it.guidance || []).length ? '<div class="why">' + it.guidance.map(esc).join("<br>") + "</div>" : "") + answerInput(it, id) + "</div>";
}
function blockCard(b, si, bi) {
  var id = si + "-b" + bi, v = S.answers[id] && typeof S.answers[id] === "object" ? S.answers[id] : {}, fb = (b.tables || [])[0] || {}, done = ansFilled(S.answers[id]);
  return '<div class="q' + (done ? " answered" : "") + '"><div class="qhead"><span class="tag">' + esc(b.label) + '</span><span class="state ' + (done ? "ok" : "todo") + '">' + (done ? "&#10003; Filled in" : "To fill in") + '</span></div><div class="fgrid" style="--cols:3">' + (fb.fields || []).map(function (f) { return '<div class="fld"><label>' + esc(f) + '</label><input class="in" data-q="' + id + '" data-part="' + esc(f) + '" value="' + esc(v[f]) + '"></div>'; }).join("") + "</div></div>";
}
function stepQuestionnaire(st) {
  var secs = st.form.sections, cur = Math.min(S.qsec || 0, secs.length - 1), sec = secs[cur], all = qStats(st);
  var nav = secs.map(function (s, i) { var x = qStats(st, i), lab = s.heading.replace(/^\d+\.\s*/, ""); return '<button type="button" data-qsec="' + i + '" aria-pressed="' + (i === cur) + '"><span class="k' + (x.tot && x.done === x.tot ? " done" : "") + '">' + (x.tot ? x.done + "/" + x.tot : "Read") + '</span><span class="c">' + esc(lab) + "</span></button>"; }).join("");
  var body = (sec.pre && sec.pre.length ? '<div class="callout before"><div class="grow"><h4>Before You Start</h4>' + sec.pre.map(function (b) { return "<p><b>" + esc(b.heading) + ".</b> " + b.paras.map(esc).join(" ") + "</p>"; }).join("") + "</div></div>" : "") +
    '<h3 class="qsech">' + esc(sec.heading) + "</h3>" + (sec.intro || []).map(function (p) { return '<p class="qintro">' + esc(p) + "</p>"; }).join("");
  (sec.tables || []).forEach(function (tb, ti) {
    if (tb.kind === "field_block") { var id = cur + "-t" + ti, v = S.answers[id] || {}; body += '<div class="q"><div class="fgrid" style="--cols:2">' + (tb.fields || []).map(function (f) { return '<div class="fld"><label>' + esc(f) + '</label><input class="in" data-q="' + id + '" data-part="' + esc(f) + '" value="' + esc(v[f]) + '"></div>'; }).join("") + "</div></div>"; }
    if (tb.kind === "checkbox_grid" && tb.options) { var id2 = cur + "-t" + ti, sel = S.answers[id2] || []; body += '<div class="q"><div class="qt">Documents you are providing</div><div class="opts">' + tb.options.map(function (o) { return '<label class="opt"><input type="checkbox" data-q="' + id2 + '" data-part="multi" value="' + esc(o) + '"' + (sel.indexOf(o) >= 0 ? " checked" : "") + "><span>" + esc(o) + "</span></label>"; }).join("") + '</div><div class="why">Upload them on the ' + esc((CFG.steps.filter(function (s) { return s.type === "docs"; })[0] || {}).title || "documents") + " step.</div></div>"; }
  });
  body += (sec.items || []).filter(function (it) { return it.number; }).map(function (it) { return qCard(it, cur); }).join("");
  body += (sec.blocks || []).map(function (b, bi) { return blockCard(b, cur, bi); }).join("");
  var back = cur > 0 ? '<button type="button" class="btn ghost" data-qsec="' + (cur - 1) + '">‹ ' + esc(secs[cur - 1].heading.replace(/^\d+\.\s*/, "")) + "</button>" : (S.step > 1 ? '<button type="button" class="btn ghost" data-step="' + (S.step - 1) + '">‹ Back</button>' : "<span></span>");
  var fwd = cur < secs.length - 1 ? '<button type="button" class="btn" data-qsec="' + (cur + 1) + '">Next: ' + esc(secs[cur + 1].heading.replace(/^\d+\.\s*/, "")) + " ›</button>" : '<button type="button" class="btn" data-step="' + (S.step + 1) + '">Next: ' + esc(CFG.steps[S.step].title) + " ›</button>";
  return '<div class="panel"><div class="ph"><div><h2>' + esc(st.title) + "</h2><p>" + esc(st.intro) + '</p></div><div class="tools"><span class="tag">' + all.done + " of " + all.tot + ' answered</span><span class="muted" id="savedline" style="font-size:12.5px"></span></div></div><div class="pb"><div class="qlayout"><nav class="anav" aria-label="Sections">' + nav + '</nav><div class="qcol">' + body +
    '<div class="foot-actions">' + back + fwd + "</div></div></div></div></div>";
}

/* ---------- documents ---------- */
function stepDocs(st) {
  var areaBtns = st.areas.map(function (a) { var n = S.docs.filter(function (d) { return d.area === a.code; }).length; return '<div class="area' + (n ? "" : " empty") + '"><span class="nm">' + esc(a.name) + (a.optional ? ' <span class="muted" style="font-weight:400">(if you have it)</span>' : "") + '</span><span class="ct">' + n + " file" + (n === 1 ? "" : "s") + "</span>" + (a.help ? '<span class="c">' + esc(a.help) + "</span>" : "") + "</div>"; }).join("");
  var rows = S.docs.filter(function (d) { return st.areas.some(function (a) { return a.code === d.area; }); });
  var opts = function (cur) { return st.areas.map(function (a) { return '<option value="' + a.code + '"' + (a.code === cur ? " selected" : "") + ">" + esc(a.name) + "</option>"; }).join(""); };
  return '<div class="panel"><div class="ph"><div><h2>' + esc(st.title) + "</h2><p>" + esc(st.intro) + '</p></div><div class="tools"><span class="muted" id="savedline" style="font-size:12.5px"></span></div></div><div class="pb">' +
    '<label class="drop" id="drop" data-area="' + st.areas[0].code + '"><input type="file" id="filein" multiple hidden><div class="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16V4M6 10l6-6 6 6M4 20h16"/></svg></div><div class="big">Drop files here, or choose them</div><p>Sample only: the file names are kept to show how it works, nothing is uploaded. Pick what each file is in the list below.</p></label>' +
    '<div class="areas docareas">' + areaBtns + "</div>" +
    (rows.length ? '<div class="tblwrap"><table class="docs"><thead><tr><th>File</th><th>What It Is</th><th>Size</th><th></th></tr></thead><tbody>' + rows.map(function (d) { return '<tr><td class="fname">' + ftype(d.name) + " " + esc(d.name) + '</td><td><select class="in" data-docarea="' + d.id + '">' + opts(d.area) + '</select></td><td class="fsz">' + fsize(d.size) + '</td><td><button type="button" class="linkbtn" data-docdel="' + d.id + '">Remove</button></td></tr>'; }).join("") + "</tbody></table></div>" : '<p class="muted">Nothing uploaded yet.</p>') +
    foot() + "</div></div>";
}

/* ---------- booking ---------- */
function stepBooking(st) {
  var b = S.booking[st.id];
  var slots = b.slots.map(function (s) { var p = s.split("|"), on = b.chosen === s; return '<button type="button" class="slot" data-slot="' + esc(st.id + "~" + s) + '" aria-pressed="' + on + '"><b>' + esc(fmtDay(p[0])) + "</b><span>" + esc(p[1]) + " · " + esc(st.length) + "</span></button>"; }).join("");
  return '<div class="panel"><div class="ph"><div><h2>' + esc(st.title) + "</h2><p>" + esc(st.intro) + '</p></div></div><div class="pb">' +
    '<div class="sectlabel">Times ' + esc(st.from) + " Offered</div><div class=\"slots\">" + slots + "</div>" +
    (b.chosen ? '<div class="callout"><div class="grow"><h4>Booked for ' + esc(fmtDay(b.chosen.split("|")[0])) + " at " + esc(b.chosen.split("|")[1]) + "</h4><p>" + esc(st.confirm) + '</p></div><button type="button" class="btn ghost sm" data-unbook="' + st.id + '">Change It</button></div>' : '<div class="callout next"><div class="grow"><h4>None of these work?</h4><p>Email certifications@mismo.org and we will offer more times. In the real portal this is a button.</p></div></div>') +
    (st.prep && st.prep.length ? '<div class="sectlabel" style="margin-top:20px">How to Get Ready</div><ol class="prep">' + st.prep.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" : "") +
    foot() + "</div></div>";
}

/* ---------- practical exercise (FRAME) ---------- */
function stepExercise(st) {
  var mine = S.docs.filter(function (d) { return d.area === "exercise"; });
  return '<div class="panel"><div class="ph"><div><h2>' + esc(st.title) + "</h2><p>" + esc(st.intro) + '</p></div></div><div class="pb"><div class="grid2">' +
    '<div class="rcard"><div class="sectlabel">The Brief</div>' + st.brief.map(function (x) { return "<p>" + esc(x) + "</p>"; }).join("") + '</div><div class="rcard"><div class="sectlabel">Your Scenario</div><h3 style="font-size:17px">' + esc(st.scenario.title) + "</h3>" + st.scenario.body.map(function (x) { return "<p>" + esc(x) + "</p>"; }).join("") + "</div></div>" +
    '<div class="sectlabel" style="margin-top:20px">Your Response</div><label class="drop" id="drop" data-area="exercise"><input type="file" id="filein" multiple hidden><div class="big">Drop your write-up here</div><p>Sample only: nothing is uploaded.</p></label>' +
    (mine.length ? '<div class="tblwrap"><table class="docs"><tbody>' + mine.map(function (d) { return '<tr><td class="fname">' + ftype(d.name) + " " + esc(d.name) + '</td><td class="fsz">' + fsize(d.size) + '</td><td><button type="button" class="linkbtn" data-docdel="' + d.id + '">Remove</button></td></tr>'; }).join("") + "</tbody></table></div>" : "") +
    foot() + "</div></div>";
}

/* ---------- review and submit ---------- */
function stepReview() {
  if (S.submitted) return doneScreen();
  var rows = CFG.steps.filter(function (s) { return s.type !== "review"; }).map(function (st, i) { var ok = stepOk(st); return '<li><span class="mk ' + (ok ? "ok" : "no") + '">' + (ok ? "&#10003;" : "!") + "</span><span><b>" + esc(st.title) + "</b> · " + esc(stepSub(st)) + "</span>" + (ok ? "" : '<button type="button" class="linkbtn" data-step="' + (i + 1) + '">Finish it</button>') + "</li>"; }).join("");
  var allOk = CFG.steps.every(function (s) { return s.type === "review" || stepOk(s); });
  return '<div class="panel"><div class="ph"><div><h2>Review and Submit</h2><p>Check everything is there, sign, and send it to MISMO. You can still see it all afterwards, and MISMO will tell you if anything is missing.</p></div></div><div class="pb">' +
    '<ul class="checks">' + rows + "</ul>" +
    '<div class="sectlabel" style="margin-top:18px">Attestation</div><label class="attest"><input type="checkbox" id="attest"' + (S.attest ? " checked" : "") + "><span>" + esc(CFG.attestation) + "</span></label>" +
    '<div class="fgrid" style="--cols:2;margin-top:12px"><div class="fld"><label for="signer">Authorized Signer</label><input class="in" id="signer" value="' + esc(S.signer || CO.signerName || "") + '"></div><div class="fld"><label>Organization</label><input class="in" value="' + esc(CO.org) + '" disabled></div></div>' +
    '<div class="callout"><div class="grow"><h4>What happens next</h4><ol class="prep">' + CFG.after.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol></div></div>" +
    '<div class="foot-actions"><button type="button" class="btn ghost" data-step="' + (CFG.steps.length - 1) + '">‹ Back</button><button type="button" class="btn good" id="submit"' + (S.attest ? "" : " disabled") + ">Send to MISMO</button></div>" +
    (allOk ? "" : '<p class="muted" style="font-size:13px;margin-top:8px">In the sample you can send it with steps unfinished; the real portal will ask you to finish them first.</p>') + "</div></div>";
}
function doneScreen() {
  return '<div class="panel done-screen"><div class="pb" style="text-align:center;padding:40px 20px"><div class="ok">&#10003;</div><h2 style="margin-top:10px">Sent to MISMO</h2><p class="muted" style="max-width:60ch;margin:8px auto 0">Thank you, ' + esc(first(CO.contactName)) + ". MISMO has everything for " + esc(CO.subject) + ". We will email you at " + esc(CO.contactEmail) + " if anything is missing, and this portal will show each step as it happens.</p>" +
    '<ol class="prep" style="text-align:left;max-width:640px;margin:22px auto 0">' + CFG.after.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ol><div style="margin-top:22px"><button type="button" class="btn ghost" id="reopen">Back to My Answers</button></div></div></div>';
}
function foot() {
  var n = S.step, last = CFG.steps.length;
  return '<div class="foot-actions">' + (n > 1 ? '<button type="button" class="btn ghost" data-step="' + (n - 1) + '">‹ Back</button>' : "<span></span>") + (n < last ? '<button type="button" class="btn" data-step="' + (n + 1) + '">Next: ' + esc(CFG.steps[n].title) + " ›</button>" : "") + "</div>";
}

/* ---------- drawing ---------- */
function render() {
  paintHero(); paintSteps();
  var st = CFG.steps[S.step - 1], m = $("main");
  m.innerHTML = st.type === "fields" ? stepFields(st) : st.type === "questionnaire" ? stepQuestionnaire(st) : st.type === "docs" ? stepDocs(st) : st.type === "booking" ? stepBooking(st) : st.type === "exercise" ? stepExercise(st) : stepReview();
  if (savedAt) save();
}
function rerender() { var y = window.scrollY; render(); window.scrollTo(0, y); }
function go(n) { S.step = n; save(); render(); window.scrollTo({ top: $("steps").getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" }); }

/* ---------- typing ---------- */
document.addEventListener("input", function (e) {
  var t = e.target, d = t.dataset;
  if (d.scope === "v") { S.values[d.k] = t.type === "checkbox" ? t.checked : t.value; save(); if (t.tagName === "SELECT" || t.type === "checkbox") rerender(); else { paintHero(); paintSteps(); } return; }
  if (d.scope && d.scope.indexOf("r:") === 0) { var bk = d.scope.slice(2); S.reps[bk] = S.reps[bk] || []; S.reps[bk][+d.i] = S.reps[bk][+d.i] || {}; S.reps[bk][+d.i][d.k] = t.value; save(); paintHero(); paintSteps(); return; }
  if (d.q != null) {
    var id = d.q, p = d.part;
    if (p === "multi") { var arr = Array.isArray(S.answers[id]) ? S.answers[id] : []; if (t.checked) { if (arr.indexOf(t.value) < 0) arr.push(t.value); } else arr = arr.filter(function (x) { return x !== t.value; }); S.answers[id] = arr; }
    else if (p === "") S.answers[id] = t.value;
    else { var o = S.answers[id] && typeof S.answers[id] === "object" && !Array.isArray(S.answers[id]) ? S.answers[id] : {}; if (typeof S.answers[id] === "string" && S.answers[id]) o.pick = S.answers[id]; o[p] = t.value; S.answers[id] = o; }
    save(); paintHero(); paintSteps(); var card = t.closest(".q"); if (card) { var ok = ansFilled(S.answers[id]); card.classList.toggle("answered", ok); var stt = card.querySelector(".state"); if (stt) { stt.className = "state " + (ok ? "ok" : "todo"); stt.innerHTML = ok ? "&#10003; Answered" : "To answer"; } }
    return;
  }
  if (d.docarea) { var doc = S.docs.filter(function (x) { return x.id === d.docarea; })[0]; if (doc) doc.area = t.value; save(); rerender(); return; }
  if (t.id === "attest") { S.attest = t.checked; save(); rerender(); return; }
  if (t.id === "signer") { S.signer = t.value; save(); return; }
});
document.addEventListener("change", function (e) { var t = e.target; if ((t.type === "radio" || t.type === "checkbox") && !t.dataset.scope && t.id !== "attest") t.dispatchEvent(new Event("input", { bubbles: true })); if (t.id === "filein") addFiles(t.files, $("drop").dataset.area); });

/* ---------- clicks ---------- */
function addFiles(list, area) {
  var n = 0;
  Array.prototype.forEach.call(list || [], function (f) { if (S.docs.some(function (d) { return d.name === f.name && d.size === f.size; })) return; S.docs.push({ id: "d" + Date.now().toString(36) + n, name: f.name, size: f.size, area: area }); n++; });
  if (n) { save(); rerender(); toast(n + " file" + (n === 1 ? "" : "s") + " added (sample: not uploaded)"); }
}
document.addEventListener("click", function (e) {
  var t = e.target.closest("button"); if (!t) return;
  var d = t.dataset;
  if (d.step) { go(+d.step); return; }
  if (d.qsec != null) { S.qsec = +d.qsec; save(); render(); var p = document.querySelector(".qlayout"); if (p) window.scrollTo({ top: p.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" }); return; }
  if (d.yn) { var y = d.yn.split("|"), cur = S.answers[y[0]], o = cur && typeof cur === "object" ? cur : {}; o.yn = o.yn === y[1] ? "" : y[1]; S.answers[y[0]] = o; save(); rerender(); return; }
  if (d.repadd) { S.reps[d.repadd] = S.reps[d.repadd] || []; S.reps[d.repadd].push({}); save(); rerender(); return; }
  if (d.repdel) { var r = d.repdel.split("|"); S.reps[r[0]].splice(+r[1], 1); save(); rerender(); return; }
  if (d.docdel) { S.docs = S.docs.filter(function (x) { return x.id !== d.docdel; }); save(); rerender(); toast("File removed"); return; }
  if (d.slot) { var s = d.slot.split("~"); S.booking[s[0]].chosen = S.booking[s[0]].chosen === s[1] ? null : s[1]; save(); rerender(); if (S.booking[s[0]].chosen) toast("Booked (sample: nobody is told)"); return; }
  if (d.unbook) { S.booking[d.unbook].chosen = null; save(); rerender(); return; }
  if (t.id === "submit") { S.submitted = true; save(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); toast("Sent (sample: nothing was sent)"); return; }
  if (t.id === "reopen") { S.submitted = false; S.step = 1; save(); render(); return; }
});
document.addEventListener("dragover", function (e) { var z = e.target.closest && e.target.closest("#drop"); if (z) { e.preventDefault(); z.classList.add("over"); } });
document.addEventListener("dragleave", function (e) { var z = e.target.closest && e.target.closest("#drop"); if (z) z.classList.remove("over"); });
document.addEventListener("drop", function (e) { var z = e.target.closest && e.target.closest("#drop"); if (z) { e.preventDefault(); z.classList.remove("over"); if (e.dataTransfer) addFiles(e.dataTransfer.files, z.dataset.area); } });

/* ---------- how sign-in works (shown, never sent) ---------- */
var G = { s: 0, code: CFG.code || "615204", err: "" };
function signedIn() { try { return sessionStorage.getItem(SKEY) === "1"; } catch (e) { return !!signedIn._m; } }
function setSigned(v) { try { if (v) sessionStorage.setItem(SKEY, "1"); else sessionStorage.removeItem(SKEY); } catch (e) {} signedIn._m = v; }
function mask(e) { var p = String(e || "").split("@"); if (p.length < 2) return e; return p[0].slice(0, 2) + "••••••@" + p[1]; }
function logoSvg() { return '<span class="logoplate"><svg class="wordmark" role="img" aria-label="MISMO" viewBox="0 0 708 108"><use href="#mismo-logo"/></svg></span>'; }
function mailFrame(subject, inner, label) {
  return '<div class="inbox" aria-label="' + esc(label) + '"><div class="ihead"><b>From</b><span>MISMO Certifications &lt;certifications@mismo.org&gt;</span><b>To</b><span>' + esc(CO.contactName) + " &lt;" + esc(mask(CO.contactEmail)) + '&gt;</span><div class="subj">' + esc(subject) + '<span class="tag">Preview, not sent</span></div></div>' +
    '<div class="mail"><div class="card"><div class="mh">' + logoSvg() + "<span>" + esc(CFG.programName) + '</span></div><div class="mb">' + inner + '</div><div class="mf">MISMO Certifications · certifications@mismo.org</div></div></div></div>';
}
function paintGate() {
  var labels = ["The Invitation", "Sign In", "The Code", "Signed In"], fn = first(CO.contactName);
  var steps = '<div class="gsteps">' + labels.map(function (l, i) { return '<span class="' + (i === G.s ? "on" : i < G.s ? "done" : "") + '">' + (i < G.s ? "&#10003; " : "") + l + "</span>"; }).join("") + "</div>";
  var h = '<div class="lead"><div><span class="code">HOW SIGN-IN WORKS · SAMPLE</span><h2>' + ["The email that opens the portal", "Their portal asks who they are", "A code arrives by email"][G.s] + "</h2><p>" +
    [CFG.inviteWhen + " Click the button in the email to follow it through.", "The link is theirs alone, but the link by itself never opens the portal. A one-time code goes to the email MISMO has on file, so a forwarded link is no use to anyone else.", "The code is good for 10 minutes and works once. In the real portal it only arrives by email; here it is shown so you can try it."][G.s] + "</p></div>" + steps + "</div>";
  if (G.s === 0) {
    h += '<div class="gcols">' + mailFrame("Your MISMO " + CFG.programName + " portal is ready", '<div class="ctx">' + esc(CFG.programName) + " · " + esc(CO.org) + "</div><p>Hello " + esc(fn) + ",</p><p>" + esc(CFG.inviteBody) + "</p>" +
      '<div class="rows">' + (CFG.inviteRows || []).map(function (r) { return "<div><b>" + esc(r[0]) + "</b><span>" + esc(r[1]) + "</span></div>"; }).join("") + '</div><p><button type="button" class="mbtn" data-g="1">Open My Portal</button></p><div class="note">This link is yours. When you open it we email you a sign-in code, so it only works for you. Teammates can be added from the portal, and each signs in with their own code.</div>', "Invitation email") +
      '<div class="panel how"><div class="pb"><div class="sectlabel">What Happens</div><ol><li><b>' + esc(CFG.inviteStep) + "</b> The CMS opens the portal and this email goes out (only once MISMO approves it).</li><li><b>They click Open My Portal.</b> The portal knows which company it is, but asks for a code first.</li><li><b>A six-digit code is emailed</b> to the address on file. Good for 10 minutes.</li><li><b>Signed in.</b> On their own device they stay signed in for 30 days.</li><li><b>MISMO can open any company's portal</b> from the CMS.</li></ol></div></div></div>";
  } else if (G.s === 1) {
    h += '<div class="gcols"><div class="panel"><div class="pb signbox"><h3>Sign in to your certification portal</h3><div class="who"><span class="mono">' + esc(fn.charAt(0)) + "</span><div><b>" + esc(CO.org) + '</b><br><span class="muted" style="font-size:13px">' + esc(CO.subject) + " · " + esc(CFG.programName) + "</span></div></div><p style=\"margin:0\">We'll email a six-digit sign-in code to <b>" + esc(mask(CO.contactEmail)) + '</b>.</p><div><button class="btn" type="button" data-g="2">Email Me a Code</button></div><p class="muted" style="margin:0;font-size:13px">Not you, or need a different address? Email certifications@mismo.org.</p></div></div>' +
      '<div class="panel how"><div class="pb"><div class="sectlabel">Why a Code</div><ol><li>No password for the company to create or forget.</li><li>A forwarded or leaked link is useless without the inbox.</li><li>Only addresses MISMO has on file, plus teammates they add, can get a code.</li></ol></div></div></div>';
  } else {
    h += '<div class="gcols">' + mailFrame("Your MISMO sign-in code", '<div class="ctx">Sign-In Code · ' + esc(CFG.programName) + "</div><p>Hello " + esc(fn) + ",</p><p>Here is your code to sign in to the " + esc(CO.subject) + ' certification portal:</p><div class="code">' + G.code.slice(0, 3) + " " + G.code.slice(3) + '</div><p>It works once and expires in 10 minutes.</p><div class="note">If you didn\'t ask for this code, you can ignore this email. Nobody can sign in without it.</div>', "Sign-in code email") +
      '<div class="panel"><div class="pb signbox"><h3>Enter your code</h3><p class="muted" style="margin:0">We sent it to ' + esc(mask(CO.contactEmail)) + '.</p><label class="sr" for="codein">Six-digit code</label><input class="in codein" id="codein" inputmode="numeric" autocomplete="one-time-code" maxlength="7" placeholder="000000">' + (G.err ? '<div class="err" role="alert">' + esc(G.err) + "</div>" : "") +
      '<label class="remember"><input type="checkbox" checked> Keep me signed in on this device for 30 days</label><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="button" data-g="3">Sign In</button><button class="btn ghost" type="button" data-g="fill">Fill It In for Me</button></div><p class="muted" style="margin:0;font-size:13px">Didn\'t get it? <button type="button" class="linkbtn" data-g="1">Send a new code</button></p></div></div></div>';
  }
  $("gate").innerHTML = h;
}
function showGate(on) { $("gate").hidden = !on; $("hero").hidden = on; $("steps").parentNode.hidden = on; $("main").hidden = on; if (on) paintGate(); }
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-g]"); if (!b) return;
  var v = b.getAttribute("data-g");
  if (v === "fill") { var i = $("codein"); if (i) { i.value = G.code.slice(0, 3) + " " + G.code.slice(3); i.focus(); } return; }
  if (v === "3") { var c = (($("codein") || {}).value || "").replace(/\D/g, ""); if (c !== G.code) { G.err = c ? "That code doesn't match. Check the email and try again." : "Enter the six-digit code from the email."; paintGate(); return; } G.err = ""; setSigned(true); showGate(false); render(); window.scrollTo(0, 0); toast("Signed in as " + CO.contactName); return; }
  G.s = +v; G.err = ""; paintGate(); window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- theme, band buttons, start ---------- */
(function theme() {
  var btn = $("theme-btn");
  function cur() { var t = document.documentElement.getAttribute("data-theme"); if (t) return t; return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
  function paint() { btn.textContent = cur() === "dark" ? "Light" : "Dark"; }
  btn.addEventListener("click", function () { document.documentElement.setAttribute("data-theme", cur() === "dark" ? "light" : "dark"); paint(); try { localStorage.setItem("mismo.portal.theme", cur()); } catch (e) {} });
  try { var saved = localStorage.getItem("mismo.portal.theme"); if (saved) document.documentElement.setAttribute("data-theme", saved); } catch (e) {}
  paint();
})();
$("reset").addEventListener("click", function () { S = sample(); save(); render(); window.scrollTo(0, 0); toast("The sample is back as it started"); });
$("seesign").addEventListener("click", function () { setSigned(false); G.s = 0; G.err = ""; showGate(true); window.scrollTo(0, 0); });
if (/[?&]in=1/.test(location.search)) setSigned(true);
render(); showGate(!signedIn());
})();
