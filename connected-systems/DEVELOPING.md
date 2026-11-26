# Developing Connected Systems

How the Connected Systems app works, for whoever changes it next. Every MISMO system follows the
`mismo-connected-systems` skill (stay in your lane, connections are contracts, never overwrite newer work, the same
safety net everywhere). **When something changes, update Help (inside the page), this file and CHANGELOG.md together.**

## What It Is

A view-only app at https://resources.mismo.org/connected-systems/ that shows how MISMO's systems fit together, for
people who should see it without being in Team HQ (for example MBA staff and leadership). Jonna asked for it on
Nov 24, 2026, "like the Membership Desk or the MBA Accounting Desk", with all the same information as Team HQ's
Connected Systems page, and so that giving someone access never affects or opens Team HQ.

Left menu: **Overview** (the hero numbers and the System Map), then one page per section Team HQ's page has
(**Follow the Work**, **Security**, **What Changed**, **On Its Own**, then **To Rock Solid**, **Change Notices**,
**Failures**, **Coverage** when the record has them), and **Help**. Search finds systems, stories and sections. The
foot of the menu shows **As Of** (the record's asOf date) and Dark Mode. Jonna and Vanessa (and any Team HQ admin)
see **Edit in Team HQ**, which opens /team-hq/?page=systems.

## Where Everything Lives

- **The page:** `connected-systems/index.html` in GitMISMO.github.io. Built by `connected-systems/tools/build.py`,
  which takes the masthead, left menu, search and Dark Mode from the MBA Accounting Desk (accounting-desk/index.html),
  so the shell stays the same as the desks. Run `python3 connected-systems/tools/build.py <yyyymmdd-hhmm>` after any
  change to build.py, then `node connected-systems/tools/check.mjs`.
- **The drawing:** Team HQ's own `src/systems.js` (GitMISMO/team-hq, served at /team-hq/src/systems.js), loaded with
  a stand-in `window.__S` (me '', a one-collection db whose onSnapshot hands over the record). Because nobody is an
  editor here, it draws with no Edit controls. Team HQ's DEVELOPING.md notes this, so a change to systems.js that
  needs `window.__S` to offer more must keep working here.
- **The data:** GitMISMO/connected-systems-data `data/systemsmap.json` (private): the same file as Team HQ's
  `data/systemsmap.json` in GitMISMO/team-hq-data (records `current` and `requests`). Read with
  `GET <relay>/connected-systems/file/data/systemsmap.json` (reply `{content: base64}`), every 5 minutes while the
  page is open.
- **The copy:** GitMISMO/mismo-connections `.github/workflows/connected-systems-copy.yml` (Connected Systems Copy),
  every 10 minutes: copies team-hq-data data/systemsmap.json to connected-systems-data when it changed. Uses that
  repository's NOTICES_TOKEN. It only ever writes that one file.

## The Back Button

CN-033 (Jonna, Nov 25, 2026): the shared `/assets/back.js` (owned by Forms and shared pages; loaded in `<head>` right
after session.js, never copied here) makes each change of page in the left menu a step in the browser's history, so
Back goes to the last page and Forward goes again. Help is in the menu itself (`nav button[data-hq="help"]`), and
`mark()` puts aria-current on the page showing. Back first closes what's open, registered with `MismoBack.layer` at
the end of the main script, bottom first: the list under a headline number (`.cs-drill`, closed with its ×), then the
system or story panel beside the map (`.cs-panel`, closed with its × or the story's Close ×). The page still keeps the
page name in the address (`#Security`, `#help`) with `history.replaceState`, as before; back.js keeps its note on the
entry when it does. Never add a `history.pushState` of our own. If Team HQ's systems.js renames those classes, the
browser check fails.

## The Masthead

CN-053 (Jonna, Nov 26, 2026): the masthead is Certification Management's exactly, so the MISMO logo sits in the same
spot in every tool. A 68px navy bar (#0d314c), 22px in from the left, with a 1px line along its foot (box-shadow 0 1px 0
rgba(80,164,219,.28)); the white logo box 9px 13px with 5px corners and a sky line (box-shadow 0 1px 0
rgba(80,164,219,.35)), the logo 24px tall and 157px wide; 14px gaps, a 1px divider 42px tall in rgba(80,164,219,.4),
and the name at 16px, weight 500, #94c8e9. On a phone (560px or narrower), as Certification Management does: a 62px bar
16px in, 11px gaps, the logo box 7px 10px, the logo 19px tall, the name 13px. The right-hand group (eyebrow, View Only,
Edit in Team HQ, sign-in chip) is unchanged.

`tools/build.py` sets these rules itself (the `MAST` block) over whatever the Accounting Desk's copy has, so the
measurements here never depend on the Accounting Desk. The left menu and the map's stuck position go by `--hq-h`,
and the page sets the map's sticky top and the scroll-margins of Team HQ's drawing to `--hq-h` + 8px (they were made for
a shorter bar), so nothing slides under the bar. Checked side by side with resources.mismo.org/cms/ at 1440px and
390px wide: the logo box is at the same spot to the pixel. The older December hat (`.santa`, `#mismo-hat`,
`html[data-season="december"]`) is gone; the shared /assets/holiday.js (loaded by session.js) does December.

## Build Note

`tools/build.py` copies the masthead, menu and Dark Mode from accounting-desk/index.html. It moves the CSS and defs
ranges by however far the Accounting Desk's CSS has moved (it had grown by its favicon line, CN-030), finds the rail
script by its opening comment (`/* the rail`) up to its `</script>` (the desk's own script grows above it), and its
asserts stop the build if anything else shifted. Rebuilding with the same stamp must give the same page.

## Access

Relay key `connected-systems` in `_internal/projects.json`: repo GitMISMO/connected-systems-data, `readable:
["data/"]`, `writable: []`. That repository holds nothing but the copy, so the key reaches nothing else. People &
Access: the Connected Systems row in `assets/tools.json` (View is enough). It is not in Team HQ's `also` yet (CN-027:
People & Access would take it from people who have it on its own), so Team HQ people are given it separately. Jonna
(Nov 24, 2026, CN-028): People & Access gives staff full access to every system, so this only matters for non-staff.

## Safety Net

- Checks: `.github/workflows/connected-systems-checks.yml` runs `tools/check.mjs` on every change (scripts parse,
  safety list, no keys, its own key and file only, never saves, version stamp).
- Browser check: `connected-systems/tests/back.cjs` (same workflow) opens the page in headless Chrome with a pretend
  sign-in and a made-up map (`tests/sample-map.json`, never the real one), loading back.js and Team HQ's systems.js
  from their live copies, and checks the Back button (below). Locally: `npm install --prefix /tmp/pw playwright`, then
  `NODE_PATH=/tmp/pw/node_modules CHROME_PATH=/usr/bin/google-chrome node connected-systems/tests/back.cjs`.
- Version stamp: `BUILD` in the page, shown at the foot of Help.
- Nothing saves: the stand-in db refuses every save, and the key has no writable folder.
- System Health and incoming-data warnings live in Team HQ's Connected Systems (the record's own data); the copy job's
  failures reach the Failure Watcher like every other GitHub job.
