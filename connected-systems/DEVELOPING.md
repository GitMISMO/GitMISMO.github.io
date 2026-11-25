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

## Access

Relay key `connected-systems` in `_internal/projects.json`: repo GitMISMO/connected-systems-data, `readable:
["data/"]`, `writable: []`. That repository holds nothing but the copy, so the key reaches nothing else. People &
Access: the Connected Systems row in `assets/tools.json` (View is enough). It is not in Team HQ's `also` yet (CN-027:
People & Access would take it from people who have it on its own), so Team HQ people are given it separately. Jonna
(Nov 24, 2026, CN-028): People & Access gives staff full access to every system, so this only matters for non-staff.

## Safety Net

- Checks: `.github/workflows/connected-systems-checks.yml` runs `tools/check.mjs` on every change (scripts parse,
  safety list, no keys, its own key and file only, never saves, version stamp).
- Version stamp: `BUILD` in the page, shown at the foot of Help.
- Nothing saves: the stand-in db refuses every save, and the key has no writable folder.
- System Health and incoming-data warnings live in Team HQ's Connected Systems (the record's own data); the copy job's
  failures reach the Failure Watcher like every other GitHub job.
