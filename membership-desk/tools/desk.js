#!/usr/bin/env node
// Membership Desk tools (Jonna, Nov 22, 2026). One script so Page Checks and Publish a Version run exactly the same checks.
//
// The test copy (membership-desk/test/index.html) is the live page (membership-desk/index.html) plus two test-only parts,
// and nothing else:
//   1. right after <meta charset="utf-8">: tools/test-copy-head.txt (keeps search engines out, and blocks every save,
//      upload and email, so the test copy reads the real data but never changes it)
//   2. right before the last </body>: tools/test-copy-tail.txt (the "Test copy" banner and ribbon)
// Every change is made in the test copy first, tried at https://resources.mismo.org/membership-desk/test/, and made live
// with Actions > "Membership Desk: Publish a Version", which takes the two parts back out.
//
//   node membership-desk/tools/desk.js check
//       Page Checks: every script on both pages parses, no keys or tokens, the page safety list is there, the test copy
//       can't save and can be published, and the live page is a published version (not uploaded by hand).
//   VERSION="test copy" NOTE="what changed" ACTOR=name node membership-desk/tools/desk.js publish
//       Makes the test copy live. VERSION=20261122-1530 (from releases/index.json) rolls back to that version instead.
//
// Each version made live is kept in releases/ (never deleted) and listed in releases/index.json.

"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");

const DESK = path.resolve(__dirname, "..");
const P = (f) => path.join(DESK, f);
const LIVE = P("index.html"), TEST = P("test/index.html"), REL = P("releases"), REL_INDEX = P("releases/index.json");
const CHARSET = '<meta charset="utf-8">', END = "</body>";
const read = (f) => fs.readFileSync(f, "utf8");
const HEAD = read(P("tools/test-copy-head.txt")), TAIL = read(P("tools/test-copy-tail.txt"));
const count = (s, part) => s.split(part).length - 1;
const sha = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");

class Refused extends Error {}

function makeLive(test) {
  if (count(test, HEAD) !== 1)
    throw new Refused("The test copy's test-only header (tools/test-copy-head.txt) is missing or changed. Put it back exactly, or change tools/test-copy-head.txt in the same change.");
  if (count(test, TAIL) !== 1)
    throw new Refused("The test copy's banner (tools/test-copy-tail.txt) is missing or changed. Put it back exactly, or change tools/test-copy-tail.txt in the same change.");
  const live = test.replace(HEAD, "").replace(TAIL, "");
  if (makeTest(live) !== test)
    throw new Refused("The test-only parts are not where they belong (the header right after the charset line, the banner right before the last </body>).");
  return live;
}

function makeTest(live) {
  const i = live.indexOf(CHARSET);
  if (i < 0) throw new Refused("The live page has no " + CHARSET + " line.");
  const t = live.slice(0, i + CHARSET.length) + HEAD + live.slice(i + CHARSET.length);
  const j = t.lastIndexOf(END);
  if (j < 0) throw new Refused("The page has no </body>.");
  return t.slice(0, j) + TAIL + t.slice(j);
}

const SECRETS = [
  [/github_pat_[A-Za-z0-9_]{20,}/, "a GitHub token"],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}/, "a GitHub token"],
  [/\bAKIA[0-9A-Z]{16}\b/, "an AWS key"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key"],
  [/\bxox[abposr]-[A-Za-z0-9-]{10,}/, "a Slack token"],
  [/\bsk-(ant-)?[A-Za-z0-9_-]{32,}/, "an API key"],
  [/\b(?:client_secret|api[_-]?key|password)\s*[:=]\s*["'][^"'\s]{12,}["']/i, "a password or secret"],
];

function checkPage(label, html, isTest) {
  const errs = [];
  let n = 0;
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1] || "";
    if (/\bsrc\s*=/.test(attrs)) continue;
    const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
    if (type && !/^(text|application)\/(javascript|ecmascript)$|^module$/i.test(type)) continue;
    n++;
    try {
      new vm.Script(m[2], { filename: label + " script " + n });
    } catch (e) {
      errs.push("Script " + n + " does not parse: " + e.message);
    }
  }
  for (const [rx, what] of SECRETS) if (rx.test(html)) errs.push("Something that looks like " + what + " is in the page. Take it out; keys never go in a page.");
  if (!/Content-Security-Policy/.test(html.slice(0, 6000))) errs.push("The page safety list (Content-Security-Policy) is missing.");
  if (isTest) {
    if (!/window\.DESK_TEST\s*=\s*true/.test(html)) errs.push("The test copy must switch saving off (window.DESK_TEST=true).");
  } else {
    if (html.includes(HEAD) || html.includes(TAIL)) errs.push("The live page still has the test copy's header or banner in it.");
    if (/window\.DESK_TEST\s*=\s*true/.test(html)) errs.push("The live page has saving switched off (window.DESK_TEST=true).");
  }
  return { n, errs };
}

function releases() {
  if (!fs.existsSync(REL_INDEX)) return null;
  return JSON.parse(read(REL_INDEX));
}

function check() {
  let bad = 0;
  const say = (e) => { console.log("::error::" + e); bad++; };
  const live = read(LIVE), test = read(TEST);
  for (const [label, html, isTest] of [["live page (membership-desk/index.html)", live, false], ["test copy (membership-desk/test/index.html)", test, true]]) {
    const r = checkPage(label, html, isTest);
    console.log(label + ": " + r.n + " scripts checked");
    r.errs.forEach((e) => say(label + ": " + e));
  }
  let would = null;
  try { would = makeLive(test); console.log("The test copy can be published."); } catch (e) { say(e.message); }
  if (would) checkPage("live page the test copy would publish", would, false).errs.forEach((e) => say("If published: " + e));
  const R = releases();
  if (!R) console.log("No published versions yet: the published-version check starts with the first Publish a Version.");
  else {
    const last = R.versions[R.versions.length - 1];
    if (!last || last.sha256 !== sha(live))
      say("membership-desk/index.html isn't the last published version (" + (last ? last.version : "none") + "). It was changed by hand: make the change in the test copy and use Actions > Membership Desk: Publish a Version.");
    else console.log("The live page is published version " + last.version + ".");
  }
  if (bad) { console.log(bad + " problem(s) found."); process.exit(1); }
  console.log("All checks passed.");
}

function stamp() {
  const d = new Date(), z = (x) => String(x).padStart(2, "0");
  return d.getUTCFullYear() + z(d.getUTCMonth() + 1) + z(d.getUTCDate()) + "-" + z(d.getUTCHours()) + z(d.getUTCMinutes());
}

function publish() {
  const want = String(process.env.VERSION || "test copy").trim();
  const note = String(process.env.NOTE || "").trim().slice(0, 300);
  const actor = String(process.env.ACTOR || "").trim();
  const R = releases() || { versions: [] };
  let live, rolledBackTo = "";
  if (!want || /^test copy$/i.test(want)) {
    live = makeLive(read(TEST));
  } else {
    if (!/^\d{8}-\d{4}$/.test(want) || !R.versions.some((v) => v.version === want))
      throw new Refused("There is no published version " + want + ". Pick one from membership-desk/releases/index.json.");
    live = read(path.join(REL, want + ".html"));
    rolledBackTo = want;
  }
  const r = checkPage("live page", live, false);
  if (r.errs.length) throw new Refused("Not published: " + r.errs.join(" "));
  const t = checkPage("test copy", makeTest(live), true);
  if (t.errs.length) throw new Refused("Not published: " + t.errs.join(" "));
  let ver = stamp();
  while (R.versions.some((v) => v.version === ver)) ver = ver.slice(0, 13) + String.fromCharCode(97 + Math.floor(Math.random() * 26));
  fs.mkdirSync(REL, { recursive: true });
  fs.writeFileSync(path.join(REL, ver + ".html"), live);
  fs.writeFileSync(LIVE, live);
  if (rolledBackTo) fs.writeFileSync(TEST, makeTest(live));
  R.versions.push({ version: ver, at: new Date().toISOString(), by: actor, note: rolledBackTo ? ("Rolled back to " + rolledBackTo + (note ? ": " + note : "")) : note, sha256: sha(live) });
  fs.writeFileSync(REL_INDEX, JSON.stringify(R, null, 2) + "\n");
  fs.writeFileSync(path.join(REL, "LAST"), ver);
  console.log("Published version " + ver + (rolledBackTo ? " (rolled back to " + rolledBackTo + ")" : "") + ".");
}

const cmd = process.argv[2];
try {
  if (cmd === "check") check();
  else if (cmd === "publish") publish();
  else if (cmd === "make-live") process.stdout.write(makeLive(read(process.argv[3] || TEST)));
  else if (cmd === "make-test") process.stdout.write(makeTest(read(process.argv[3] || LIVE)));
  else { console.log("Use: check | publish | make-live [file] | make-test [file]"); process.exit(2); }
} catch (e) {
  console.log("::error::" + e.message);
  process.exit(1);
}
