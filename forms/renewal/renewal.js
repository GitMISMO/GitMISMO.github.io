/* The renewal response page.

   The provider arrives from the renewal notice with a token in the link. The token is
   all the page is given: it asks MISMO for the renewal behind it, and posts the answers
   back the same way. Nothing about a company is ever baked into this page, which is what
   lets it sit on the public website.

   Answers are kept in this browser as they are typed, under the token, so closing the
   page loses nothing. */

var FLOW_ENDPOINT = "https://default867e5d11bde4499fb45e61572f9f33.7c.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/30/workflows/b7c43e642a114351bea85f898ce0cf65/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=GjeuqRbTNg00VzD2nKHSTcXJXRHlVLVtbeTYbNX6H5Q";   /* filled in when the flow is built */
var token = (new URLSearchParams(location.search)).get("r") || "";
var KEY = "mismo.renewal." + (token || "preview");
var R = null;             /* the renewal, as MISMO describes it */
var A = { documents: {}, signer: {}, attest: {}, website: {}, files: {}, script: {} };
var submitted = false;

/* Examples (21 Nov 2026, Jonna: an Initial / Renewal switch on All Portals in the CMS, for the example portals only).
   ?demo=<program> opens a made-up company's renewal; nothing is fetched or sent, and its answers are kept
   under their own key in this browser. */
var DEMO = ((new URLSearchParams(location.search)).get("demo") || "").toLowerCase().replace(/[^a-z]/g, "");
if (DEMO) { token = ""; KEY = "mismo.renewal.example-" + DEMO; }
function demoSays(what){ toast("This is an example: " + what); }

(function season(){ if (new Date().getMonth() === 11) document.documentElement.setAttribute("data-season","december"); })();
(function theme(){
  /* The website build drops the tool masthead, and the toggle with it - the site has
     no dark mode. Without this guard the page would die here and never start. */
  var btn = document.getElementById("theme-btn");
  if (!btn) return;
  function cur(){ var t = document.documentElement.getAttribute("data-theme"); if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
  function paint(){ btn.textContent = cur() === "dark" ? "Light" : "Dark"; }
  btn.addEventListener("click", function(){
    document.documentElement.setAttribute("data-theme", cur() === "dark" ? "light" : "dark"); paint();
    try { localStorage.setItem("mismo.portal.theme", cur()); } catch(e){}
  });
  try { var s = localStorage.getItem("mismo.portal.theme"); if (s) document.documentElement.setAttribute("data-theme", s); } catch(e){}
  paint();
})();

var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function longDate(iso){ if(!iso) return "—"; var p = String(iso).slice(0,10).split("-");
  return MONTHS[parseInt(p[1],10)-1] + " " + parseInt(p[2],10) + ", " + p[0]; }  /* US style, November 9, 2026 (27 Oct 2026) */
function money(n){ return n == null ? "—" : "$" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function el(id){ return document.getElementById(id); }
function bytes(n){ return n < 1024 ? n + " B" : n < 1048576 ? (n/1024).toFixed(0) + " KB" : (n/1048576).toFixed(1) + " MB"; }

function toast(msg){
  var t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 3600);
}

/* ---------- keeping the answers ---------- */
function load(){
  try { var raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw);
    if (o && o.answers) A = o.answers; submitted = !!(o && o.submitted); } } catch(e){}
}
function persist(){
  try { localStorage.setItem(KEY, JSON.stringify({ answers: A, submitted: submitted, at: new Date().toISOString() })); return; } catch(e){}
  /* A large attachment can be more than this browser will keep. The typed answers are still kept
     then, without the files, so nothing else is lost; a file is attached again after a reload. */
  try {
    var lite = JSON.parse(JSON.stringify(A));
    Object.keys(lite.files || {}).forEach(function(k){ lite.files[k] = []; });
    localStorage.setItem(KEY, JSON.stringify({ answers: lite, submitted: submitted, at: new Date().toISOString() }));
  } catch(e){}
}
function setPath(path, value){
  var parts = path.split("."), o = A;
  for (var i = 0; i < parts.length - 1; i++) o = (o[parts[i]] = o[parts[i]] || {});
  o[parts[parts.length - 1]] = value;
  persist();
}
function getPath(path){
  var parts = path.split("."), o = A;
  for (var i = 0; i < parts.length; i++) { if (o == null) return undefined; o = o[parts[i]]; }
  return o;
}

/* ---------- step numbers ----------
   The certification script step only appears for the programs that have a script (RON,
   eClosing, eVault), so the steps are numbered from what is on the page, not typed in. */
var STEP_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
function hasScript(){ return !!(R && R.script && R.script.questions && R.script.questions.length); }
function stepKeys(){
  return ["facts", "docs"].concat(hasScript() ? ["script"] : []).concat(["signer", "website", "attest", "send"]);
}
function stepOf(key){ return stepKeys().indexOf(key) + 1; }
function stepCount(){ return stepKeys().length; }
function numberSteps(){
  el("script-panel").hidden = !hasScript();
  Array.prototype.forEach.call(document.querySelectorAll("[data-step]"), function(s){
    s.textContent = "STEP " + stepOf(s.getAttribute("data-step"));
  });
}

/* ---------- the certification script's questions ---------- */
function renderScript(){
  if (!hasScript()) { el("script").innerHTML = ""; return; }
  A.script = A.script || {};
  el("script").innerHTML = R.script.questions.map(function(q, i){
    if (A.script[q.id] === undefined) A.script[q.id] = q.answer || "";
    return '<div class="doc">'
      + '<div class="fld"><label for="sq-' + esc(q.id) + '" style="text-transform:none;letter-spacing:0;font-size:14px;font-weight:600;line-height:1.45">'
      + (q.number ? esc(q.number) + ". " : "") + esc(q.text) + "</label>"
      + '<textarea id="sq-' + esc(q.id) + '" data-f="script.' + esc(q.id) + '" style="min-height:70px"></textarea>'
      + (q.answer ? '<span class="hint">Filled in from what you told us last time.</span>' : "")
      + "</div></div>";
  }).join("");
  wireFields(el("script"));
}

/* ---------- drawing ---------- */
function progName(p){ return { Consultant: "Certified Consultant", FRAME: "FRAME Certified Advisory Partner" }[p] || p + " Certification"; }
function renderHeader(){
  el("pname").textContent = progName(R.program) + " Renewal";
  document.title = R.program + " Renewal · " + R.org + (DEMO ? " · Example" : "");
  paintHero();
}

/* ---------- the portal look (21 Nov 2026, Jonna: "update the renewal portals to look and feel like the
   initial portals"): a hero with the progress ring and the renewal's journey, step tiles, one step at a
   time. The answers, the steps and what is sent to MISMO are exactly as before. ---------- */
var STEP_TITLE = { facts: "What Is Being Renewed", docs: "Application and Questionnaire", script: "Certification Script",
  signer: "Who Signs", website: "On mismo.org", attest: "Attestation", send: "Send It Back" };
var JOURNEY = [["Renewal Notice", "Sent to you"], ["Confirm and Attest", "This page"], ["Renewal Invoice", "Raised and paid"],
  ["Assessment", "Demo or review"], ["Results", "MISMO decides"], ["Renewed", "A new term"]];
var CUR = null;
function stepState(k){
  var b = blockers(), n = String(stepOf(k));
  var open = b.filter(function(x){ return x.indexOf("Step " + n + ":") === 0; }).length;
  if (k === "facts") { var i = R.invoice || {}; return { ok: true, sub: i.paid ? "Fee paid" : i.available ? "Invoice ready" : "Check the details" }; }
  if (k === "docs") { var ds = R.documents || [], done = ds.filter(function(d){ var a = A.documents[d.id] || {}; return a.response === "no-changes" || (a.response === "updates" && (A.files[d.id] || []).length); }).length;
    return { ok: ds.length > 0 && !open, sub: done + " of " + ds.length + " answered" }; }
  if (k === "script") { var qs = (R.script && R.script.questions) || [], an = qs.filter(function(q){ return String((A.script || {})[q.id] || "").trim(); }).length;
    return { ok: !open, sub: an + " of " + qs.length + " answered" }; }
  if (k === "signer") return { ok: A.signer.keep !== undefined && !open, sub: A.signer.keep === true ? "Still right" : A.signer.keep === false ? "Someone new" : "Confirm who signs" };
  if (k === "website") { var w = !!(String(A.website.page || "").trim() || String(A.website.aboutUs || "").trim()); return { ok: w, sub: w ? "Checked" : "Your listing" }; }
  if (k === "attest") return { ok: !open, sub: open ? "Tick and sign" : "Signed" };
  return { ok: !!(submitted || R.received), sub: submitted || R.received ? "Sent to MISMO" : b.length ? b.length + " thing" + (b.length === 1 ? "" : "s") + " open" : "Ready to send" };
}
function progress(){
  if (submitted || R.received) return 1;
  var ks = stepKeys().filter(function(k){ return k !== "facts" && k !== "send"; });
  return ks.length ? ks.filter(function(k){ return stepState(k).ok; }).length / ks.length : 0;
}
function ringSvg(p){
  var r = 34, c = 2 * Math.PI * r;
  return '<svg viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="' + r + '" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="8"/>'
    + '<circle cx="42" cy="42" r="' + r + '" fill="none" stroke="#74bfeb" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (c * p).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 42 42)"/></svg>';
}
function firstName(n){ n = String(n || "").trim().split(/[\s,]+/)[0] || ""; return /^[A-Za-z][A-Za-z'.-]*$/.test(n) ? n : ""; }
function paintHero(){
  var h = el("hero"); if (!h) return;
  if (!R) { h.innerHTML = '<div class="wrap"><div style="min-width:0"><div class="kicker">MISMO Certifications</div><h1>Renew Your MISMO <span>Certification</span></h1><p class="sub">Confirm what we hold, sign the attestation and send it back.</p></div></div>'; return; }
  var sent = !!(submitted || R.received), i = R.invoice || {}, p = progress();
  var now = !sent ? 1 : i.paid ? 3 : 2;
  var who = firstName((R.contact && (R.contact.first || R.contact.name)) || (R.website && R.website.contact));
  h.innerHTML = '<div class="wrap"><div style="min-width:0"><div class="kicker">' + esc(progName(R.program)) + " · Renewal" + (DEMO ? " · Example" : "") + "</div>"
    + "<h1>Welcome" + (who ? ", " + esc(who) : "") + ". Let's renew <span>" + esc(R.org) + "</span>.</h1>"
    + '<p class="sub">' + (sent ? "We have your renewal. Nothing else is needed from you today; your invoice is on this page."
        : "Confirm what we hold, sign the attestation and send it back. " + STEP_WORDS[stepCount()].replace(/^./, function(c){ return c.toUpperCase(); }) + " short steps.") + "</p>"
    + '<div class="meta"><span>Certification <b>' + esc(R.program) + (R.product ? " · " + esc(R.product) : "") + "</b></span>"
    + "<span>Renews On <b>" + esc(longDate(R.anniversary)) + "</b></span>"
    + "<span>Renewal Fee <b>" + esc(money(R.fee)) + "</b></span></div></div>"
    + '<div class="ring" aria-label="' + Math.round(p * 100) + ' percent complete">' + ringSvg(p) + '<div class="lbl"><span class="pct">' + Math.round(p * 100) + '%</span><span class="cap">' + (sent ? "Sent" : "Done") + "</span></div></div>"
    + '<div class="journey" style="--j:' + JOURNEY.length + '">' + JOURNEY.map(function(j, n){
        var c = n < now ? "done" : n === now ? "now" : "";
        return '<div class="jstop ' + c + '"><span class="dot"></span>' + esc(j[0]) + '<span class="who">' + esc(n === now ? (n === 1 ? "You are here" : n === 2 ? (i.available ? "Ready to pay" : "On its way") : "With MISMO now") : j[1]) + "</span></div>";
      }).join("") + "</div></div>";
}
function paintTiles(){
  var nav = el("steps"); if (!nav || !R) return;
  var ks = stepKeys(); nav.style.setProperty("--n", ks.length);
  nav.innerHTML = ks.map(function(k, n){
    var s = stepState(k), on = CUR === k;
    return '<button type="button" class="stepbtn' + (s.ok ? " ok" : "") + '" data-rstep="' + k + '"' + (on ? ' aria-current="step"' : "") + '><span class="n">' + (s.ok && !on ? "&#10003;" : n + 1) + '</span><span><span class="t">' + esc(STEP_TITLE[k]) + '</span><span class="s">' + esc(s.sub) + "</span></span></button>";
  }).join("");
}
function footFor(k){
  var ks = stepKeys(), n = ks.indexOf(k), prev = ks[n - 1], next = ks[n + 1];
  return (prev ? '<button type="button" class="btn ghost" data-rstep="' + prev + '">&larr; ' + esc(STEP_TITLE[prev]) + "</button>" : "<span></span>")
    + (next ? '<button type="button" class="btn" data-rstep="' + next + '">' + esc(STEP_TITLE[next]) + " &rarr;</button>" : "");
}
function showStep(k, scroll){
  var ks = stepKeys(); if (ks.indexOf(k) < 0) k = ks[0];
  CUR = k;
  try { localStorage.setItem(KEY + ":step", k); } catch(e){}
  Array.prototype.forEach.call(document.querySelectorAll(".rn-step"), function(s){
    var on = s.getAttribute("data-key") === k;
    s.classList.toggle("off", !on);
    var f = s.querySelector(".foot-actions"); if (on && f) f.innerHTML = footFor(k);
  });
  paintTiles();
  if (scroll) window.scrollTo({ top: el("steps").getBoundingClientRect().top + window.scrollY - 12, behavior: "smooth" });
}
document.addEventListener("click", function(e){
  var b = e.target.closest && e.target.closest("[data-rstep]");
  if (b) showStep(b.getAttribute("data-rstep"), true);
  var r = e.target.closest && e.target.closest("#demo-reset");
  if (r) { try { localStorage.removeItem(KEY); localStorage.removeItem(KEY + ":step"); } catch(x){} location.reload(); }
});
function renderFacts(){
  var rows = [
    ["Company", esc(R.org), false],
    ["Certification", esc(R.program) + (R.product ? " · " + esc(R.product) : ""), false],
    ["Renews On", esc(longDate(R.anniversary)), true],
    ["Renewal Fee", esc(money(R.fee)), true]
  ];
  el("facts").innerHTML = rows.map(function(r){
    return '<div class="fact"><dt>' + r[0] + '</dt><dd' + (r[2] ? ' class="num"' : "") + '>' + r[1] + "</dd></div>";
  }).join("");
}
/* The invoice itself is never part of the page. MISMO holds it, and the page asks for it
   by token only when the provider presses Download, so the bytes are never sitting on a
   public web server waiting to be found. */
function renderInvoice(){
  var i = R.invoice;
  var host = el("invoice");
  if (!i || !i.available){
    host.innerHTML = '<div class="inv"><div class="inv-b"><p class="inv-n">Your renewal invoice</p>'
      + '<p class="inv-m">' + esc((i && i.note) || "Not raised yet. It will be sent to you, and will appear here once it is ready.") + "</p></div></div>";
    return;
  }
  host.innerHTML = '<div class="inv">'
    + '<div class="inv-i" aria-hidden="true">PDF</div>'
    + '<div class="inv-b"><p class="inv-n">Renewal Fee Invoice'
      + (i.paid ? ' <span class="paid">Paid</span>' : "") + "</p>"
    + '<p class="inv-m">' + (i.number ? 'Order <span class="num">' + esc(i.number) + "</span> \u00b7 " : "")
      + '<span class="num">' + esc(money(i.amount)) + "</span>"
      + (i.date ? " \u00b7 raised " + esc(longDate(i.date)) : "")
      + (i.paid ? "" : " \u00b7 payable on receipt") + "</p></div>"
    + '<div class="inv-a"><button class="btn ghost" type="button" id="inv-dl">Download the Invoice</button></div>'
    + "</div>"
    + (i.paid ? "" : '<p class="hint" style="margin:9px 2px 0">How to pay is printed on the invoice. Once the fee reaches us we will write to arrange your assessment.</p>');
  el("inv-dl").addEventListener("click", downloadInvoice);
}

/* A link that has been forwarded still opens this page, so the invoice is the one thing
   behind a second door: MISMO emails a short code to the contact it already holds for this
   company, and the file only comes back once that code is typed in. The address is never
   asked for here - whoever is holding the link cannot redirect the code to themselves. */
var codeState = null;   /* {hint: the masked address MISMO sent to, tries: 0} while the code step is open */

function post(mode, extra){
  var body = { formKey: "mismo-renewal-response", mode: mode, token: token };
  if (extra) for (var k in extra) body[k] = extra[k];
  return fetch(FLOW_ENDPOINT, {
    method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(body)
  }).then(function(r){
    if (!r.ok) throw new Error("status " + r.status);
    return r.json();
  });
}

/* Step one: ask MISMO to send the code. */
function downloadInvoice(){
  if (DEMO) { demoSays("a real renewal page sends a six-digit code to your contact, then the invoice downloads."); return; }
  var b = el("inv-dl");
  b.disabled = true; b.textContent = "Sending a code\u2026";
  function done(){ b.disabled = false; b.textContent = "Download the Invoice"; }
  if (!FLOW_ENDPOINT){ done(); toast("This is a preview \u2014 the invoice is not wired up yet."); return; }
  post("invoice-code").then(function(d){
    if (!d || !d.sent) throw new Error(d && d.error || "not sent");
    codeState = { hint: d.hint || "the contact we hold for you", tries: 0 };
    renderCodeStep();
  }).catch(function(e){
    done();
    if (String(e.message) === "no-contact")
      toast("We do not have an email address on file for this company, so we cannot send a code. Reply to the email that brought you here and we will send the invoice.");
    else
      toast("We could not send the code just now. Reply to the email that brought you here and we will send the invoice.");
  });
}

function renderCodeStep(bad){
  var host = el("invoice");
  host.innerHTML = '<div class="inv-code">'
    + "<p>For your security the invoice is not handed out on the link alone. We have emailed a "
    + 'six-digit code to <span class="to">' + esc(codeState.hint) + "</span>. Enter it here and the "
    + "invoice will download. The code lasts fifteen minutes.</p>"
    + '<div class="inv-row">'
    + '<input type="text" id="inv-code" inputmode="numeric" autocomplete="one-time-code" '
    + 'maxlength="6" placeholder="000000" aria-label="Six-digit code">'
    + '<button class="btn" type="button" id="inv-go">Get the Invoice</button>'
    + '<button class="inv-again" type="button" id="inv-again">Send it again</button>'
    + "</div>"
    + (bad ? '<p class="inv-bad">' + esc(bad) + "</p>" : "")
    + "</div>";
  var f = el("inv-code");
  f.addEventListener("input", function(){ f.value = f.value.replace(/\D/g, "").slice(0, 6); });
  f.addEventListener("keydown", function(e){ if (e.key === "Enter") { e.preventDefault(); sendCode(); } });
  el("inv-go").addEventListener("click", sendCode);
  el("inv-again").addEventListener("click", againCode);
  f.focus();
}

function againCode(){
  var a = el("inv-again");
  a.disabled = true; a.textContent = "Sending\u2026";
  post("invoice-code").then(function(d){
    a.textContent = d && d.sent ? "Sent again" : "Send it again";
    setTimeout(function(){ if (el("inv-again")) { el("inv-again").disabled = false; el("inv-again").textContent = "Send it again"; } }, 20000);
  }).catch(function(){
    a.disabled = false; a.textContent = "Send it again";
    toast("We could not send the code just now.");
  });
}

/* Step two: hand the code back, and the file comes with it. */
function sendCode(){
  var f = el("inv-code"), g = el("inv-go");
  var code = (f.value || "").replace(/\D/g, "");
  if (code.length !== 6){ renderCodeStep("That code is six digits."); return; }
  g.disabled = true; g.textContent = "Checking\u2026";
  post("invoice", { code: code }).then(function(d){
    if (d && d.error) throw new Error(d.error);
    if (!d || !d.data) throw new Error("no file came back");
    var bin = atob(d.data), n = bin.length, arr = new Uint8Array(n);
    for (var k = 0; k < n; k++) arr[k] = bin.charCodeAt(k);
    saveBlob(new Blob([arr], { type: d.type || "application/pdf" }), d.name || "MISMO renewal invoice.pdf");
    codeState = null;
    renderInvoice();
    toast("The invoice is downloading.");
  }).catch(function(e){
    var m = String(e.message);
    codeState.tries++;
    if (m === "expired") renderCodeStep("That code has run out. Press \u201cSend it again\u201d for a fresh one.");
    else if (m === "too-many") renderCodeStep("Too many tries. Press \u201cSend it again\u201d for a fresh code.");
    else if (m === "bad-code") renderCodeStep("That code does not match. Check the email and try again.");
    else {
      codeState = null;
      renderInvoice();
      toast("The invoice would not come through. Reply to the email that brought you here and we will send it.");
    }
  });
}

/* ---------- the documents the company sent last time (26 Oct 2026) ----------
   Behind the same emailed code as the invoice, since they carry the company's own contacts and
   answers. A code that worked is remembered for this visit only (never stored), so both
   documents open with one code; the invoice still spends it. */
var docCode = null;      /* a code that opened a document in this visit */
var docAsk = null;       /* {id, hint, bad} while a document's code box is open */
function docName(id){ var d = (R.documents || []).filter(function(x){ return x.id === id; })[0]; return d ? d.name : "document"; }
function docCodeBox(d){
  return '<div class="inv-code" style="margin-top:12px">'
    + "<p>For your security this is not handed out on the link alone. We have emailed a six-digit code to "
    + '<span class="to">' + esc(docAsk.hint) + "</span>. Enter it and your " + esc(d.name) + " will download.</p>"
    + '<div class="inv-row">'
    + '<input type="text" id="doc-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" aria-label="Six-digit code">'
    + '<button class="btn" type="button" data-docgo="' + esc(d.id) + '">Open It</button>'
    + "</div>"
    + (docAsk.bad ? '<p class="inv-bad">' + esc(docAsk.bad) + "</p>" : "")
    + "</div>";
}
function redrawDocs(){ renderDocs(); wireAll(); paintReady(); var f = el("doc-code"); if (f) f.focus(); }
function openDoc(id, btn){
  if (DEMO) { demoSays("a real renewal page sends a six-digit code, then what you sent last time opens."); return; }
  if (!FLOW_ENDPOINT){ toast("This is a preview \u2014 documents are not wired up here."); return; }
  if (docCode) { fetchDoc(id, docCode); return; }
  if (btn) { btn.disabled = true; btn.textContent = "Sending a code\u2026"; }
  post("invoice-code").then(function(d){
    if (!d || !d.sent) throw new Error(d && d.error || "not sent");
    docAsk = { id: id, hint: d.hint || "the contact we hold for you" };
    redrawDocs();
  }).catch(function(){
    redrawDocs();
    toast("We could not send the code just now. Reply to the email that brought you here and we will send your " + docName(id) + ".");
  });
}
function fetchDoc(id, code){
  post("invoice", { code: code, doc: id }).then(function(d){
    if (d && d.error) throw new Error(d.error);
    if (!d || !d.data) throw new Error("no file came back");
    var bin = atob(d.data), n = bin.length, arr = new Uint8Array(n);
    for (var k = 0; k < n; k++) arr[k] = bin.charCodeAt(k);
    saveBlob(new Blob([arr], { type: d.type || "application/pdf" }), d.name || (docName(id) + ".pdf"));
    docCode = code; docAsk = null; redrawDocs();
    toast("Your " + docName(id) + " is downloading.");
  }).catch(function(e){
    var m = String(e.message);
    if (m === "bad-code" || m === "too-many" || m === "expired") {
      docCode = null;
      docAsk = docAsk || { id: id, hint: "the contact we hold for you" };
      docAsk.bad = m === "bad-code" ? "That code does not match. Check the email and try again."
        : "That code can no longer be used. Press \u201cOpen what you sent\u201d again for a fresh one.";
      if (m !== "bad-code") docAsk = null;
      redrawDocs();
      if (m !== "bad-code") toast("That code can no longer be used. Press \u201cOpen what you sent\u201d again for a fresh one.");
    } else {
      docAsk = null; redrawDocs();
      toast("That document would not come through. Reply to the email that brought you here and we will send it.");
    }
  });
}

/* Some viewers refuse to let a page hand over a file at all - the artifact preview is one.
   Saying so is better than a button that silently does nothing. */
function saveBlob(blob, name){
  try {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
  } catch(e){
    toast("This preview will not let the page hand over a file. It works on the live page.");
  }
}

/* The documents step is named for what this certification renews on: the application and questionnaire (eMortgage,
   FRAME), the application alone (Product), or the firm's own documents (Certified Consultant). */
function docsTitle(){
  var ds = R.documents || [];
  if (ds.some(function(d){ return d.id === "questionnaire"; })) return ["Application and Questionnaire", "Your Application and Questionnaire", "Open what you sent us last time and tell us whether it still holds. If anything has changed, send the corrected document back."];
  if (ds.length <= 1) return ["Your Application", "Your Application", "Open what you sent us last time and tell us whether it still holds. If anything has changed, send the corrected version back."];
  return ["Your Documents", "Your Documents", "For each one, open what you sent us last time and tell us whether it still holds: your application, key employee bios, project examples and client references. If anything has changed, send the updated document back."];
}
function renderDocs(){
  var tt = docsTitle(), sec = document.querySelector('.rn-step[data-key="docs"]');
  STEP_TITLE.docs = tt[0];
  if (sec) { sec.querySelector("h2").textContent = tt[1]; sec.querySelector(".ph p").textContent = tt[2]; }
  el("docs").innerHTML = (R.documents || []).map(function(d){
    var v = (A.documents[d.id] || {}).response || "";
    var files = A.files[d.id] || [];
    return '<div class="doc" data-doc="' + esc(d.id) + '">'
      + '<div class="doc-h"><span class="doc-n">' + esc(d.name) + "</span>"
      + (d.lastSent ? '<span class="doc-s">you last sent this on ' + esc(longDate(d.lastSent)) + "</span>" : "")
      + (d.url ? '<a class="doc-link" href="' + esc(d.url) + '" target="_blank" rel="noopener noreferrer">Open what you sent&nbsp;&rarr;</a>'
         : d.available ? '<button class="doc-link doc-open" type="button" data-docopen="' + esc(d.id) + '">Open what you sent&nbsp;&rarr;</button>' : "")
      + "</div>"
      + (docAsk && docAsk.id === d.id ? docCodeBox(d) : "")
      + '<div class="choices">'
      + choice(d.id, "no-changes", "Nothing has changed", v)
      + choice(d.id, "updates", "I have changes to send", v)
      + "</div>"
      + (v === "updates" ? uploadBlock(d, files) : "")
      + "</div>";
  }).join("") || '<div class="warn">No documents are listed for this renewal. Reply to the email that brought you here and we will sort it out.</div>';
}
function choice(docId, val, label, current){
  var on = current === val;
  return '<label class="choice' + (on ? " on" : "") + '">'
    + '<input type="radio" name="doc-' + esc(docId) + '" value="' + val + '"' + (on ? " checked" : "") + ">"
    + "<span>" + esc(label) + "</span></label>";
}
function uploadBlock(d, files){
  return '<div class="drop"><p>Send us the corrected ' + esc(d.name) + ".</p>"
    + '<button class="btn ghost" type="button" data-pick="' + esc(d.id) + '">Choose a File</button>'
    + '<input type="file" hidden data-file="' + esc(d.id) + '" multiple></div>'
    + (files.length ? '<ul class="filelist">' + files.map(function(f, i){
        return "<li><span class=\"nm\">" + esc(f.name) + '</span><span class="sz">' + bytes(f.size) + "</span>"
          + '<button class="btn ghost" type="button" style="padding:3px 10px;font-size:12px" data-drop="'
          + esc(d.id) + "|" + i + '">Remove</button></li>';
      }).join("") + "</ul>" : "");
}
function renderSigner(){
  var keep = A.signer.keep;
  el("signer").innerHTML = '<div class="facts" style="grid-template-columns:1fr">'
      + '<div class="fact"><dt>On File</dt><dd>' + esc(R.signer && R.signer.name || "Nobody recorded")
      + (R.signer && R.signer.email ? ' <span style="font-weight:400;color:var(--ink-3)">· ' + esc(R.signer.email) + "</span>" : "")
      + "</dd></div></div>"
    + '<div class="choices">'
      + '<label class="choice' + (keep === true ? " on" : "") + '"><input type="radio" name="signer" value="keep"'
        + (keep === true ? " checked" : "") + "><span>That is still right</span></label>"
      + '<label class="choice' + (keep === false ? " on" : "") + '"><input type="radio" name="signer" value="change"'
        + (keep === false ? " checked" : "") + "><span>Someone else signs now</span></label>"
    + "</div>"
    + (keep === false ? '<div class="grid2" style="margin-top:14px">'
        + '<div class="fld"><label for="s-name">Signer’s Name</label>'
        + '<input type="text" id="s-name" data-f="signer.name" autocomplete="off"></div>'
        + '<div class="fld"><label for="s-email">Signer’s Email</label>'
        + '<input type="email" id="s-email" data-f="signer.email" autocomplete="off"></div></div>' : "");
  wireFields(el("signer"));
}
var ATTEST_TEXT = "I hereby attest that I am authorized by the Applicant to sign and submit "
  + "this Application on its behalf. The information provided in this Application is all "
  + "accurate to the best of my knowledge and based on my diligent review. Should any "
  + "information cease to be accurate after the time of submission of this Application, the "
  + "Applicant will notify MISMO of such and provide updated information.";

function renderAttest(){
  if (A.attest.company === undefined) A.attest.company = R.org || "";
  var on = A.attest.agreed === true;
  el("attest").innerHTML =
      '<label class="att-box' + (on ? " on" : "") + '">'
        + '<input type="checkbox" id="att-ok"' + (on ? " checked" : "") + ">"
        + "<span>" + esc(ATTEST_TEXT) + "</span>"
      + "</label>"
    + '<div class="grid2" style="margin-top:14px">'
      + '<div class="fld"><label for="att-name">Printed Name</label>'
        + '<input type="text" id="att-name" data-f="attest.name" autocomplete="off"></div>'
      + '<div class="fld"><label for="att-title">Title</label>'
        + '<input type="text" id="att-title" data-f="attest.title" autocomplete="off"></div>'
    + "</div>"
    + '<div class="fld" style="margin-top:12px"><label for="att-co">Company</label>'
      + '<input type="text" id="att-co" data-f="attest.company" autocomplete="off"></div>'
    + '<p class="att-stamp">The date and time are recorded automatically when you send this.</p>';
  el("att-ok").addEventListener("change", function(){
    A.attest.agreed = this.checked; persist(); renderAttest(); wireFields(el("attest")); paintReady();
  });
}

function renderWebsite(){
  var w = R.website || {};
  if (A.website.page === undefined) A.website.page = w.page || "";
  if (A.website.aboutUs === undefined) A.website.aboutUs = w.aboutUs || "";
  el("w-page").value = A.website.page;
  el("w-about").value = A.website.aboutUs;
  el("w-lastcheck").value = w.lastUpdated ? longDate(w.lastUpdated) : "Not recorded";
  countAbout();
}
function countAbout(){ el("w-count").textContent = (el("w-about").value || "").length; }

/* ---------- what is still missing ---------- */
function blockers(){
  var out = [];
  (R.documents || []).forEach(function(d){
    var a = A.documents[d.id] || {};
    if (!a.response) out.push("Step " + stepOf("docs") + ": say whether your " + d.name + " has changed.");
    else if (a.response === "updates" && !(A.files[d.id] || []).length)
      out.push("Step " + stepOf("docs") + ": attach your corrected " + d.name + ".");
  });
  if (hasScript()) {
    var open = R.script.questions.filter(function(q){ return !String((A.script || {})[q.id] || "").trim(); }).length;
    if (open) out.push("Step " + stepOf("script") + ": answer " + (open === 1 ? "the last certification script question." : "the " + open + " certification script questions still blank."));
  }
  if (A.signer.keep === undefined) out.push("Step " + stepOf("signer") + ": confirm who signs for your company.");
  /* With no email on file for the signer, "That is still right" would leave MISMO nobody to send the
     signing request to (stress test, 1 Nov 2026). */
  if (A.signer.keep === true && !(R.signer && R.signer.email)) out.push("Step " + stepOf("signer") + ": we have no email address for your signer, so choose \u201cSomeone else signs now\u201d and give the signer\u2019s name and email, even if it is the same person.");
  if (A.signer.keep === false) {
    if (!(A.signer.name || "").trim()) out.push("Step " + stepOf("signer") + ": give the new signer’s name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((A.signer.email || "").trim())) out.push("Step " + stepOf("signer") + ": give the new signer’s email.");
  }
  if (A.attest.agreed !== true) out.push("Step " + stepOf("attest") + ": tick the attestation.");
  if (!(A.attest.name || "").trim()) out.push("Step " + stepOf("attest") + ": type your printed name.");
  if (!(A.attest.title || "").trim()) out.push("Step " + stepOf("attest") + ": give your title.");
  if (!(A.attest.company || "").trim()) out.push("Step " + stepOf("attest") + ": give your company.");
  return out;
}
function paintReady(){
  var b = blockers();
  el("blockers").innerHTML = b.length
    ? '<div class="warn"><b>Not quite ready.</b><ul style="margin:7px 0 0;padding-left:19px">'
      + b.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"
    : "";
  el("ready-sub").textContent = b.length
    ? "A few things are still open. They are listed below."
    : "Everything above is answered. Send it and we will take it from there.";
  el("send").disabled = b.length > 0;
  paintHero(); paintTiles();
}

/* ---------- wiring ---------- */
function wireFields(scope){
  Array.prototype.forEach.call(scope.querySelectorAll("[data-f]"), function(i){
    if (i.__w) return; i.__w = 1;
    var p = i.dataset.f;
    var v = getPath(p);
    if (v !== undefined && i.value !== v) i.value = v;
    i.addEventListener("input", function(){ setPath(p, i.value); paintReady(); if (p === "website.aboutUs") countAbout(); });
  });
}
function wireAll(){
  wireFields(document);
  /* The page-wide listeners go on once. wireAll runs again after every redraw, and each run
     used to add another set, so one click could act several times. */
  if (wireAll.done) return;
  wireAll.done = true;
  document.addEventListener("change", function(e){
    var t = e.target;
    if (t.name && t.name.indexOf("doc-") === 0){
      var id = t.name.slice(4);
      A.documents[id] = A.documents[id] || {};
      A.documents[id].response = t.value;
      persist(); renderDocs(); wireAll(); paintReady();
    }
    if (t.name === "signer"){
      A.signer.keep = t.value === "keep";
      if (A.signer.keep) { delete A.signer.name; delete A.signer.email; }
      persist(); renderSigner(); paintReady();
    }
    if (t.dataset && t.dataset.file){
      var did = t.dataset.file;
      var list = A.files[did] = A.files[did] || [];
      Array.prototype.forEach.call(t.files, function(f){
        if (f.size > 12 * 1024 * 1024) { toast(f.name + " is too large — 12 MB is the limit."); return; }
        var fr = new FileReader();
        fr.onload = function(){
          list.push({ name: f.name, size: f.size, type: f.type || "application/octet-stream",
                      data: String(fr.result).split(",")[1] || "" });
          persist(); renderDocs(); wireAll(); paintReady();
        };
        fr.readAsDataURL(f);
      });
      t.value = "";
    }
  });
  document.addEventListener("click", function(e){
    var op = e.target.closest && e.target.closest("[data-docopen]");
    if (op){ openDoc(op.dataset.docopen, op); return; }
    var go = e.target.closest && e.target.closest("[data-docgo]");
    if (go){
      var c = ((el("doc-code") || {}).value || "").replace(/\D/g, "");
      if (c.length !== 6){ docAsk.bad = "That code is six digits."; redrawDocs(); return; }
      go.disabled = true; go.textContent = "Checking\u2026";
      fetchDoc(go.dataset.docgo, c);
      return;
    }
    var pick = e.target.closest && e.target.closest("[data-pick]");
    if (pick){ var inp = document.querySelector('[data-file="' + pick.dataset.pick + '"]'); if (inp) inp.click(); return; }
    var drop = e.target.closest && e.target.closest("[data-drop]");
    if (drop){
      var parts = drop.dataset.drop.split("|");
      (A.files[parts[0]] || []).splice(Number(parts[1]), 1);
      persist(); renderDocs(); wireAll(); paintReady();
    }
  });
  el("w-about").addEventListener("input", countAbout);
  el("save").addEventListener("click", saveCopy);
  el("send").addEventListener("click", send);
}

function payload(){
  return {
    formKey: "mismo-renewal-response",
    /* The flow switches on this. Without it the switch fell through to its default,
       which answered 200, and the page below took that for success. */
    mode: "submit",
    token: token,
    org: R.org, program: R.program, product: R.product || null,
    anniversary: R.anniversary,
    documents: (R.documents || []).map(function(d){
      return { id: d.id, name: d.name,
               response: (A.documents[d.id] || {}).response || null,
               files: (A.files[d.id] || []).map(function(f){
                 return { name: f.name, size: f.size, type: f.type, data: f.data }; }) };
    }),
    signer: A.signer.keep ? { unchanged: true, name: R.signer && R.signer.name || null,
                              email: R.signer && R.signer.email || null }
                          : { unchanged: false, name: A.signer.name || null, email: A.signer.email || null },
    /* The company's answers for the certification script, keyed the way the questionnaire
       answers are, so they drop straight into the cycle and fill the assessor's workbook. */
    scriptAnswers: hasScript() ? R.script.questions.map(function(q){
      return { Section: q.section, Question: q.question, Answer: String((A.script || {})[q.id] || "").trim() || null,
               number: q.number || null, text: q.text };
    }) : [],
    website: { contact: null, contactEmail: null,   /* no longer asked (19 Nov 2026); keys kept for the readers */
               page: A.website.page || null, aboutUs: A.website.aboutUs || null },
    attestation: {
      agreed: A.attest.agreed === true,
      name: (A.attest.name || "").trim(),
      title: (A.attest.title || "").trim(),
      company: (A.attest.company || "").trim(),
      text: ATTEST_TEXT,
      at: new Date().toISOString()
    },
    submittedAt: new Date().toISOString()
  };
}
function saveCopy(){
  var body = payload();
  var copy = JSON.parse(JSON.stringify(body));
  copy.documents.forEach(function(d){ d.files.forEach(function(f){ delete f.data; }); });
  saveBlob(new Blob([JSON.stringify(copy, null, 2)], { type: "application/json" }),
           "MISMO renewal - " + (R.org || "response") + ".json");
  toast("Saved to your computer.");
}
function send(){
  if (DEMO) { submitted = true; persist(); showDone(); demoSays("nothing was sent."); return; }
  var b = el("send");
  b.disabled = true; b.textContent = "Sending…";
  var body = payload();
  if (!FLOW_ENDPOINT){
    b.disabled = false; b.textContent = "Send to MISMO";
    toast("This is a preview — nothing was sent.");
    return;
  }
  fetch(FLOW_ENDPOINT, {
    method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(body)
  }).then(function(r){
    if (!r.ok) throw new Error("status " + r.status);
    return r.json();
  }).then(function(d){
    /* A 200 only means the flow answered. It says whether it kept the answers. */
    if (!d || d.saved !== true) throw new Error((d && d.error) || "not saved");
    submitted = true; persist(); showDone();
  }).catch(function(){
    b.disabled = false; b.textContent = "Send to MISMO";
    saveCopy();
    toast("That did not go through — your answers have been saved to your computer instead.");
  });
}
/* Sent already - on this browser, or on any other (R.received, from MISMO's records): the thank-you
   screen, with the invoice moved onto it so it can still be downloaded, and a way to send a
   correction (5 Nov 2026: Proof came back for the invoice and found the form empty). */
var invHome = null, invNext = null;
function fmtSent(iso){
  var d = iso ? new Date(iso) : null;
  return d && !isNaN(d) ? d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
}
function showDone(){
  el("form-wrap").hidden = true;
  el("steps-wrap").hidden = true;
  el("done-wrap").hidden = false;
  var rc = R.received || null, when = rc && rc.at ? fmtSent(rc.at) : "";
  el("done-line").textContent = "We have your renewal for " + R.org
    + (R.product ? " · " + R.product : "") + "."
    + (when ? " It was sent on " + when + (rc.by ? " by " + rc.by : "") + "." : "")
    + " Nothing else is needed from you today.";
  var inv = el("invoice"), box = el("done-invoice");
  if (inv && box && inv.parentNode !== box){ invHome = inv.parentNode; invNext = inv.nextSibling; box.appendChild(inv); }
  var i = R.invoice || {};
  el("done-inv-step").textContent = i.paid ? "Your renewal fee is paid. Thank you."
    : i.available ? "Your renewal invoice is above. Download it here at any time."
    : "Your renewal invoice is raised and sent to you. It will also appear on this page.";
  paintHero();
  window.scrollTo(0, 0);
}
function showForm(){
  var inv = el("invoice");
  if (inv && invHome && inv.parentNode !== invHome) invHome.insertBefore(inv, invNext);
  el("done-wrap").hidden = true;
  el("form-wrap").hidden = false;
  el("steps-wrap").hidden = false;
  paintReady(); showStep(CUR);
  window.scrollTo(0, 0);
}

/* The live page holds no renewal of its own. It arrives with a code in the link, asks
   MISMO for that one renewal, and shows nothing at all if the answer does not come back.
   The preview in the artifact calls start() with a worked example instead. */
function showWaiting(title, line, help){
  var f = el("form-wrap"), d = el("done-wrap"), w = el("wait-wrap");
  if (f) f.hidden = true;
  if (d) d.hidden = true;
  if (el("steps-wrap")) el("steps-wrap").hidden = true;
  paintHero();
  if (!w) return;
  w.hidden = false;
  el("wait-h").textContent = title;
  el("wait-line").textContent = line;
  el("wait-help").hidden = !help;
}

function boot(){
  if (DEMO) {
    var ex = example(DEMO);
    if (!ex) { showWaiting("There is no example for that certification", "Open an example from the list in the Certification Management System.", false); return; }
    el("bandnote").innerHTML = "<b>Example</b><span>A made-up company, to show how a renewal looks. Nothing is fetched or sent.</span>";
    el("demo-reset").hidden = false;
    el("wait-wrap").hidden = true; el("form-wrap").hidden = false;
    start(ex);
    return;
  }
  if (!token){
    showWaiting("This link is not complete",
      "The address is missing the code that identifies your renewal, so there is nothing to open.", true);
    return;
  }
  if (!FLOW_ENDPOINT){
    showWaiting("This renewal cannot be opened yet",
      "The renewal pages are not switched on here. Reply to the email that brought you here and we will help.", false);
    return;
  }
  showWaiting("Opening your renewal\u2026", "One moment.", false);
  post("load").then(function(d){
    /* A renewal page is open only while its renewal is going on (7 Nov 2026). A closed one carries
       nothing about the company, so there is nothing to show but that. */
    if (d && d.closed){
      showWaiting("This renewal page is closed",
        "It opens again when your next renewal comes round, and we will email you a new link then. If you need anything from a past renewal, email certifications@mismo.org.", false);
      return;
    }
    if (!d || d.error || !d.org) throw new Error(d && d.error || "no record");
    el("wait-wrap").hidden = true;
    el("form-wrap").hidden = false;
    start(d);
  }).catch(function(){
    showWaiting("We could not open this renewal",
      "The link may have been replaced by a newer one, or it may have been typed in rather than clicked.", true);
  });
}

/* ---------- Certified Consultant points scorecard (21 Nov 2026) ----------
   The CMS works it out from MISMO's records and saves it; the page record carries it as "scorecard". */
var SC_CATS = ["membership", "leadership", "participation", "mismoEd", "otherEd", "ancillary"];
function scoreHTML(sc) {
  var M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var dt = function (d) { if (!d) return ""; var p = String(d).slice(0, 10).split("-"); return M[+p[1] - 1] + " " + (+p[2]) + ", " + p[0]; };
  var cats = SC_CATS.filter(function (k) { return sc.categories && sc.categories[k]; });
  var miss = cats.filter(function (k) { return !sc.categories[k].met; }).map(function (k) { return sc.categories[k].label; });
  var h = '<div class="scc"><div class="scc-head"><div><div class="kicker">Your Points Scorecard</div><h2>' + esc(sc.total) + ' points</h2>' +
    '<p>' + (sc.kind === "renewal" ? "Renewal" : "Initial certification") + " scorecard as of " + esc(dt(sc.asOf)) + ". Participation and ancillary points count from " + esc(dt(sc.from)) +
    ". Minimums for " + (sc.size === "small" ? "10 employees and under" : "11 employees and over") + ".</p></div>" +
    '<span class="scc-verdict ' + (sc.meetsAll ? "yes" : "no") + '">' + (sc.meetsAll ? "Meets Every Minimum" : "Not Yet: " + esc(miss.join(", "))) + "</span></div>" +
    '<div class="scc-cats">' + cats.map(function (k) { var c = sc.categories[k], w = c.min ? Math.min(100, Math.round(c.points / c.min * 100)) : 100;
      return '<div class="scc-cat' + (c.met ? " met" : "") + '"><span>' + esc(c.label) + "</span><b>" + esc(c.points) + "</b><i>" + (c.min ? "Minimum " + esc(c.min) : "No minimum") + '</i><div class="m"><em style="width:' + w + '%"></em></div></div>'; }).join("") + "</div>";
  var rows = cats.map(function (k) { var its = (sc.items || []).filter(function (i) { return i.cat === k; }); if (!its.length) return "";
    return '<tr class="scc-cr"><td colspan="3">' + esc(sc.categories[k].label) + "</td></tr>" + its.map(function (i) {
      return "<tr><td>" + esc(i.name) + (i.detail ? '<span class="d">' + esc(i.detail) + "</span>" : "") + "</td><td>" + esc(i.person || "Your company") + '</td><td class="n">' + esc(i.pts) + "</td></tr>"; }).join(""); }).join("");
  if (rows) h += '<details class="scc-more"><summary>Where your points come from</summary><table>' + rows + "</table></details>";
  h += '<p class="scc-note">Points come from MISMO\u2019s own records (membership, leadership roles, meeting and Summit attendance, certifications and designations). Something missing? Email <a href="mailto:certifications@mismo.org">certifications@mismo.org</a> and MISMO will add it.</p></div>';
  return h;
}
/* the made-up company's scorecard, for the Consultant example (?demo=consultant) */
var SAMPLE_SC = { kind: "renewal", asOf: "2026-11-21", from: "2025-11-21", size: "large", total: 64, meetsAll: false,
  categories: { membership: { label: "Membership", points: 4, min: 1, met: true }, leadership: { label: "Leadership", points: 15, min: 10, met: true },
    participation: { label: "Participation", points: 24, min: 20, met: true }, mismoEd: { label: "MISMO Education / Certification", points: 13, min: 9, met: true },
    otherEd: { label: "Other Education / Certification", points: 5, min: 7, met: false }, ancillary: { label: "Ancillary Points", points: 3, min: 7, met: false } },
  items: [ { cat: "membership", name: "MISMO Member", pts: 1, person: null, detail: "Member (Associate)" }, { cat: "membership", name: "Associate Level Champion", pts: 3, person: null, detail: "" },
    { cat: "leadership", name: "Chair or Vice Chair - Development Workgroup", pts: 10, person: "Sam Rivera", detail: "Co-Chair" }, { cat: "leadership", name: "Workgroup IM Representative", pts: 5, person: "Lee Park", detail: "IM Rep" },
    { cat: "participation", name: "MISMO Summit Attendance", pts: 4, person: "Sam Rivera", detail: "Fall Summit" }, { cat: "participation", name: "Workgroup Attendance (66% of meetings)", pts: 4, person: "Lee Park", detail: "9 of 11 meetings" },
    { cat: "mismoEd", name: "CMSP", pts: 10, person: "Sam Rivera", detail: "" }, { cat: "mismoEd", name: "AMSP", pts: 3, person: "Lee Park", detail: "" },
    { cat: "otherEd", name: "CMB", pts: 5, person: "Jordan Sample", detail: "" }, { cat: "ancillary", name: "Developed / Participated in a MISMO Webinar", pts: 3, person: "Sam Rivera", detail: "" } ] };
function renderScore(){
  var sc = R.scorecard || (R.program === "Consultant" && /[?&]demo=/.test(location.search) ? SAMPLE_SC : null), host = el("score-wrap");
  if (!sc) { if (host) host.hidden = true; return; }
  if (!host) { host = document.createElement("div"); host.className = "wrap"; host.id = "score-wrap"; var sw = el("steps-wrap"); sw.parentNode.insertBefore(host, sw.nextSibling); }
  host.hidden = false; host.innerHTML = '<section class="panel scc-panel">' + scoreHTML(sc) + "</section>";
}
function start(renewal){
  R = renewal;
  load();
  numberSteps();
  renderHeader(); renderFacts(); renderInvoice(); renderDocs(); renderScript(); renderSigner(); renderAttest(); renderWebsite(); renderScore();
  wireAll(); paintReady();
  el("steps-wrap").hidden = false;
  var saved = null; try { saved = localStorage.getItem(KEY + ":step"); } catch(e){}
  showStep(saved || "facts");
  var fix = el("done-fix");
  if (fix) fix.onclick = function(){ submitted = false; persist(); R.received = null; showForm(); };
  if (submitted || R.received) showDone();
}

/* Made-up renewals for the examples. ".example" addresses; no real company. */
function example(p){
  var P = { ron: ["RON", "Northbeam Notary Cloud", 4900, true], eclosing: ["eClosing", "Northbeam Closing Room", 4900, true],
    evault: ["eVault", "Northbeam eVault", 4900, true], product: ["Product", "Northbeam Loan Origination", 6500, false],
    consultant: ["Consultant", null, 3000, false], frame: ["FRAME", null, 3000, false] }[p];
  if (!P) return null;
  var y = new Date().getFullYear(), ann = (y + 1) + "-01-15", last = (y - 1) + "-01-20";
  var docs = [{ id: "application", name: "Certification Application", lastSent: last, available: true }];
  if (p === "consultant") docs.push({ id: "bio", name: "Key Employee Bios", lastSent: last, available: true },
    { id: "example", name: "Project Examples and Write-Ups", lastSent: last, available: true }, { id: "references", name: "Client References", lastSent: last, available: true });
  else if (p !== "product") docs.push({ id: "questionnaire", name: (P[0] === "FRAME" ? "FRAME" : P[0]) + " Questionnaire", lastSent: last, available: true });
  return {
    org: "Northbeam Financial (Example)", program: P[0], product: P[1], anniversary: ann, fee: P[2],
    contact: { name: "Jordan Sample" },
    invoice: { available: true, number: "6299001", amount: P[2], date: y + "-11-02", paid: false },
    documents: docs,
    script: P[3] ? { questions: [
      { id: "q1", number: "1", section: "Security", question: "Q1", text: "How do you confirm the identity of each signer before a session starts?", answer: "Knowledge-based authentication and credential analysis for every signer." },
      { id: "q2", number: "2", section: "Records", question: "Q2", text: "Where is the session recording kept, and for how long?", answer: "" },
      { id: "q3", number: "3", section: "Changes", question: "Q3", text: "What has changed in the product since your last certification?", answer: "" } ] } : null,
    signer: { name: "Jordan Sample", email: "jordan.sample@northbeam.example" },
    website: { page: "https://northbeam.example", aboutUs: "Northbeam builds digital mortgage tools for lenders and settlement agents.", lastUpdated: (y - 1) + "-02-01", contact: "Jordan Sample" },
    received: null
  };
}

boot();
