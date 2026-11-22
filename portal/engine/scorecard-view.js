/* Certified Consultant points scorecard: one view for MISMO (CMS > Consultant Scorecards) and for the company (its portal
   and its renewal page), so both see the same thing. MISMO's copy adds edit buttons through opts.edit.
   No endless list: the six categories are tabs; one category shows at a time, grouped by person, with the people who
   earned points beside it (select one to see only theirs).
   ScorecardView.render(host, scorecard, { company: "Your company", edit: { removePerson(name), removeItem(id) } })
   The page record carries only that company's own scorecard; nothing here can reach another company's. (21 Nov 2026) */
(function (root) {
  "use strict";
  var CATS = ["membership", "leadership", "participation", "mismoEd", "otherEd", "ancillary"];
  var WHAT = {
    membership: "MISMO membership this year, plus a Champion level.",
    leadership: "Board, RSGC, CSGC, workgroup chairs and vice chairs, and IM, AWG and Education Council representatives, active on the date.",
    participation: "Summits attended, Summit presentation panels, workgroups attended at 66% of meetings held, and Bootcamp instructors, in the last 12 months.",
    mismoEd: "People holding an active CMSP or AMSP.",
    otherEd: "People holding the MBA CMB or AMP designation.",
    ancillary: "Industry panels and presentations, MISMO webinars, published MISMO-related articles, and MISMO Product certifications, in the last 12 months."
  };
  var M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dt(d) { if (!d) return ""; var p = String(d).slice(0, 10).split("-"); return M[+p[1] - 1] + " " + (+p[2]) + ", " + p[0]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function mono(n) { var w = String(n || "").replace(/[^A-Za-z ]/g, " ").trim().split(/\s+/); return ((w[0] || "?")[0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase(); }

  var CSS = '.scv{--scv-ink:var(--ink,#0d314c);--scv-ink2:var(--ink-2,#456179);--scv-ink3:var(--ink-3,#7794aa);--scv-line:var(--border,#d5e2ed);' +
    '--scv-bg:var(--surface,#fff);--scv-bg2:var(--surface-2,#f6fafd);--scv-good:var(--good,#0f7b5c);--scv-warn:var(--warn,#a2701a);--scv-acc:var(--sky,#74bfeb);color:var(--scv-ink);min-width:0}' +
    '.scv *{box-sizing:border-box}.scv p{margin:0}' +
    '.scv-top{display:flex;gap:18px;align-items:center;flex-wrap:wrap}' +
    '.scv-total{display:flex;align-items:baseline;gap:6px}.scv-total b{font-size:44px;line-height:1;letter-spacing:-.02em}.scv-total span{color:var(--scv-ink3);font-weight:600}' +
    '.scv-say{flex:1 1 320px;min-width:0;color:var(--scv-ink2);font-size:13.5px;line-height:1.5;overflow-wrap:anywhere}' +
    '.scv-verdict{display:inline-block;margin-top:6px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:5px 9px;border-radius:4px}' +
    '.scv-verdict.yes{background:color-mix(in srgb,var(--scv-good) 15%,transparent);color:var(--scv-good)}' +
    '.scv-verdict.no{background:color-mix(in srgb,var(--scv-warn) 16%,transparent);color:var(--scv-warn)}' +
    '.scv-tabs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:16px}' +
    '.scv.narrow .scv-tabs{grid-template-columns:repeat(3,minmax(0,1fr))}.scv.tiny .scv-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}' +
    '.scv-tab{all:unset;cursor:pointer;display:block;border:1px solid var(--scv-line);border-radius:7px;padding:10px 11px 9px;background:var(--scv-bg2);min-width:0;position:relative}' +
    '.scv-tab:hover{border-color:var(--scv-ink3)}.scv-tab:focus-visible{outline:2px solid var(--scv-acc);outline-offset:2px}' +
    '.scv-tab[aria-selected="true"]{border-color:var(--scv-ink);box-shadow:inset 0 -3px 0 var(--scv-ink);background:var(--scv-bg)}' +
    '.scv-tab .l{display:block;padding-right:18px;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;font-weight:700;color:var(--scv-ink3);line-height:1.3;min-height:2.6em;overflow-wrap:anywhere}' +
    '.scv-tab .n{display:flex;align-items:baseline;gap:6px;margin-top:3px}.scv-tab .n b{font-size:22px}.scv-tab .n i{font-style:normal;font-size:11.5px;color:var(--scv-ink3)}' +
    '.scv-tab .m{display:block;height:4px;border-radius:2px;background:var(--scv-line);margin-top:6px;overflow:hidden}.scv-tab .m em{display:block;height:100%;background:var(--scv-warn)}' +
    '.scv-tab.met .m em{background:var(--scv-good)}.scv-tab.met .n b{color:var(--scv-good)}' +
    '.scv-tab .ok{position:absolute;top:8px;right:8px;width:16px;height:16px;border-radius:50%;background:var(--scv-good);color:#fff;font-size:11px;line-height:16px;text-align:center;font-weight:700}' +
    '.scv-body{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:14px;margin-top:14px;align-items:start}' +
    '.scv.narrow .scv-body{grid-template-columns:1fr}' +
    '.scv-panel{border:1px solid var(--scv-line);border-radius:8px;background:var(--scv-bg);min-width:0}' +
    '.scv-ph{padding:12px 14px;border-bottom:1px solid var(--scv-line)}.scv-ph h3{margin:0;font-size:16px;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline}' +
    '.scv-ph h3 small{font-size:12.5px;font-weight:600;color:var(--scv-ink3)}.scv-ph p{margin-top:4px;color:var(--scv-ink2);font-size:13px;line-height:1.45}' +
    '.scv-list{max-height:430px;overflow:auto;padding:4px 0}' +
    '.scv-grp{padding:9px 14px;border-bottom:1px solid var(--scv-line)}.scv-grp:last-child{border-bottom:0}' +
    '.scv-who{display:flex;align-items:center;gap:8px;font-weight:700;font-size:13.5px;margin-bottom:4px;min-width:0}' +
    '.scv-mono{flex:none;width:26px;height:26px;border-radius:50%;background:#14486e;color:#fff;font-size:10.5px;font-weight:700;display:flex;align-items:center;justify-content:center}' +
    '.scv-who span{min-width:0;overflow-wrap:anywhere}.scv-who em{margin-left:auto;font-style:normal;color:var(--scv-ink2);white-space:nowrap}' +
    '.scv-it{display:flex;gap:10px;align-items:flex-start;padding:3px 0 3px 34px;font-size:13px;line-height:1.4}' +
    '.scv-it div{flex:1;min-width:0;overflow-wrap:anywhere}.scv-it small{display:block;color:var(--scv-ink3);font-size:12px}' +
    '.scv-it b{white-space:nowrap;color:var(--scv-good)}' +
    '.scv-x{all:unset;cursor:pointer;font-size:11.5px;color:var(--scv-ink3);border:1px solid var(--scv-line);border-radius:4px;padding:1px 6px;white-space:nowrap}.scv-x:hover{color:#b3372c;border-color:#b3372c}' +
    '.scv-empty{padding:18px 14px;color:var(--scv-ink2);font-size:13.5px;line-height:1.5}' +
    '.scv-people .scv-ph h3{font-size:14px}.scv-pl{max-height:430px;overflow:auto}' +
    '.scv-p{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;padding:7px 12px;border-bottom:1px solid var(--scv-line);font-size:13px}' +
    '.scv-p:hover{background:var(--scv-bg2)}.scv-p[aria-pressed="true"]{background:color-mix(in srgb,var(--scv-acc) 18%,transparent)}' +
    '.scv-p span{min-width:0;overflow-wrap:anywhere}.scv-p b{white-space:nowrap}.scv-p i{grid-column:2/4;display:block;width:100%;height:3px;border-radius:2px;background:var(--scv-line);overflow:hidden}.scv-p i em{display:block;height:100%;background:var(--scv-acc)}' +
    '.scv-pf{padding:8px 12px;font-size:12px;color:var(--scv-ink3);display:flex;justify-content:space-between;gap:8px;align-items:center}' +
    '.scv-note{margin-top:12px;color:var(--scv-ink3);font-size:12.5px;line-height:1.5}';
  function css() { if (document.getElementById("scv-css")) return; var s = document.createElement("style"); s.id = "scv-css"; s.textContent = CSS; document.head.appendChild(s); }

  function render(host, sc, opts) {
    opts = opts || {}; css();
    var company = opts.company || "The company";
    var cats = CATS.filter(function (k) { return sc.categories && sc.categories[k]; });
    var items = (sc.items || []).slice();
    var st = host.__scv || (host.__scv = { cat: null, who: null });
    if (!st.cat || cats.indexOf(st.cat) < 0) st.cat = cats.filter(function (k) { return !sc.categories[k].met; })[0] || cats[0];
    /* people from the items (and from opts.people for MISMO's view, which also lists people with no points yet) */
    var pts = {};
    items.forEach(function (i) { if (i.person) pts[i.person] = (pts[i.person] || 0) + (+i.pts || 0); });
    (opts.people || []).forEach(function (p) { if (!(p.name in pts)) pts[p.name] = 0; });
    var people = Object.keys(pts).sort(function (a, b) { return pts[b] - pts[a] || a.localeCompare(b); });
    var top = people.length ? Math.max.apply(null, people.map(function (n) { return pts[n]; })) || 1 : 1;
    if (st.who && !(st.who in pts)) st.who = null;
    var metN = cats.filter(function (k) { return sc.categories[k].met; }).length;
    var miss = cats.filter(function (k) { return !sc.categories[k].met; }).map(function (k) { return sc.categories[k].label; });

    var h = '<div class="scv"><div class="scv-top"><div class="scv-total"><b>' + esc(sc.total) + "</b><span>points</span></div>" +
      '<div class="scv-say"><p>' + (sc.kind === "renewal" ? "Renewal" : "Initial certification") + " scorecard as of " + esc(dt(sc.asOf)) +
      " &middot; minimums for " + (sc.size === "small" ? "10 employees and under" : "11 employees and over") +
      " &middot; participation and ancillary points count from " + esc(dt(sc.from)) + "</p>" +
      '<span class="scv-verdict ' + (sc.meetsAll ? "yes" : "no") + '">' + (sc.meetsAll ? "Meets every minimum" : metN + " of " + cats.length + " minimums met &middot; short in " + esc(miss.join(", "))) + "</span></div></div>";
    h += '<div class="scv-tabs" role="tablist" aria-label="Categories">' + cats.map(function (k) {
      var c = sc.categories[k], w = c.min ? Math.min(100, Math.round(c.points / c.min * 100)) : (c.points ? 100 : 0);
      return '<button type="button" class="scv-tab' + (c.met ? " met" : "") + '" role="tab" data-scv-cat="' + k + '" aria-selected="' + (st.cat === k) + '">' +
        (c.met ? '<span class="ok" aria-hidden="true">&#10003;</span>' : "") + '<span class="l">' + esc(c.label) + '</span><span class="n"><b>' + esc(c.points) + "</b><i>" +
        (c.min ? "min " + esc(c.min) : "no minimum") + '</i></span><span class="m"><em style="width:' + w + '%"></em></span></button>'; }).join("") + "</div>";

    var c = sc.categories[st.cat] || { label: "", points: 0, min: 0 };
    var mine = items.filter(function (i) { return i.cat === st.cat && (!st.who || i.person === st.who); });
    var groups = {}, order = [];
    mine.forEach(function (i) { var g = i.person || company; if (!groups[g]) { groups[g] = []; order.push(g); } groups[g].push(i); });
    order.sort(function (a, b) { var sa = groups[a].reduce(function (s, i) { return s + (+i.pts || 0); }, 0), sb = groups[b].reduce(function (s, i) { return s + (+i.pts || 0); }, 0); return sb - sa || a.localeCompare(b); });
    var body = order.map(function (g) {
      var sum = groups[g].reduce(function (s, i) { return s + (+i.pts || 0); }, 0);
      return '<div class="scv-grp"><div class="scv-who"><span class="scv-mono" aria-hidden="true">' + esc(g === company ? "Co" : mono(g)) + "</span><span>" + esc(g) + "</span><em>" + sum + " pts</em></div>" +
        groups[g].map(function (i) {
          return '<div class="scv-it"><div>' + esc(i.name) + (i.detail ? "<small>" + esc(i.detail) + (opts.edit && i.source ? " &middot; " + esc(i.source) : "") + "</small>" : (opts.edit && i.source ? "<small>" + esc(i.source) + "</small>" : "")) + "</div><b>+" + esc(i.pts) + "</b>" +
            (opts.edit && i.hand ? '<button type="button" class="scv-x" data-scv-unhand="' + esc(i.hand) + '" title="Remove these added points">Remove</button>' : "") + "</div>"; }).join("") + "</div>"; }).join("");
    if (!body) body = '<div class="scv-empty">' + (st.who ? esc(st.who) + " has no points in " + esc(c.label) + "." : "No points in " + esc(c.label) + " yet.") + " " + esc(WHAT[st.cat] || "") + "</div>";
    h += '<div class="scv-body"><section class="scv-panel" role="tabpanel"><div class="scv-ph"><h3>' + esc(c.label) + "<small>" + esc(c.points) + " points" + (c.min ? " &middot; minimum " + esc(c.min) : "") +
      (st.who ? " &middot; showing " + esc(st.who) : "") + "</small></h3><p>" + esc(WHAT[st.cat] || "") + '</p></div><div class="scv-list">' + body + "</div></section>";
    h += '<aside class="scv-panel scv-people" aria-label="People"><div class="scv-ph"><h3>Who Earned Points <small>' + people.length + '</small></h3></div><div class="scv-pl">' +
      (people.length ? people.map(function (n) {
        return '<button type="button" class="scv-p" data-scv-who="' + esc(n) + '" aria-pressed="' + (st.who === n) + '"><span class="scv-mono" aria-hidden="true">' + esc(mono(n)) + "</span><span>" + esc(n) + "</span><b>" + pts[n] +
          '</b><i><em style="width:' + Math.round(pts[n] / top * 100) + '%"></em></i></button>'; }).join("") : '<div class="scv-empty">No one yet.</div>') + "</div>" +
      '<div class="scv-pf"><span>' + (st.who ? "Showing " + esc(st.who) + " only" : "Select a person to see only theirs") + "</span>" +
      (st.who ? '<button type="button" class="scv-x" data-scv-who="">Everyone</button>' : "") +
      (opts.edit && st.who ? '<button type="button" class="scv-x" data-scv-rm="' + esc(st.who) + '" title="Take this person off this company\'s scorecard">Not Theirs</button>' : "") + "</div></aside></div>";
    if (opts.note) h += '<p class="scv-note">' + opts.note + "</p>";
    h += "</div>";
    host.innerHTML = h;
    var el = host.firstChild;
    function fit() { var w = host.clientWidth; el.classList.toggle("narrow", w < 820); el.classList.toggle("tiny", w < 470); }
    fit(); if (!host.__scvRO && window.ResizeObserver) { host.__scvRO = new ResizeObserver(function () { var e = host.querySelector(".scv"); if (e) { var w = host.clientWidth; e.classList.toggle("narrow", w < 820); e.classList.toggle("tiny", w < 470); } }); host.__scvRO.observe(host); }
    if (!host.__scvWired) {
      host.__scvWired = true;
      host.addEventListener("click", function (e) {
        var t = e.target.closest && e.target.closest("[data-scv-cat],[data-scv-who],[data-scv-rm],[data-scv-unhand]"); if (!t || !host.contains(t)) return;
        var s = host.__scv, cur = host.__scvArgs;
        if (t.hasAttribute("data-scv-cat")) { s.cat = t.getAttribute("data-scv-cat"); render(host, cur.sc, cur.opts); var b = host.querySelector('[data-scv-cat="' + s.cat + '"]'); if (b) b.focus(); return; }
        if (t.hasAttribute("data-scv-rm")) { if (cur.opts.edit && cur.opts.edit.removePerson) cur.opts.edit.removePerson(t.getAttribute("data-scv-rm")); return; }
        if (t.hasAttribute("data-scv-unhand")) { if (cur.opts.edit && cur.opts.edit.removeItem) cur.opts.edit.removeItem(t.getAttribute("data-scv-unhand")); return; }
        var w = t.getAttribute("data-scv-who"); s.who = w && s.who !== w ? w : null; render(host, cur.sc, cur.opts);
      });
    }
    host.__scvArgs = { sc: sc, opts: opts };
  }
  root.ScorecardView = { render: render, WHAT: WHAT };
})(window);
