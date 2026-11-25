# Developing the MBA Accounting Desk

How the desk works, for whoever changes it next. The guide for the people who *use* it is **Help**, inside the page.
**When a feature changes, update Help and this file in the same change, and add a line to CHANGELOG.md.**

## What It Is

MBA Accounting's own view-only desk (Jonna, Nov 21, 2026): `accounting-desk/index.html` in the `GitMISMO.github.io`
repo, served at https://resources.mismo.org/accounting-desk/. One file: the page is the code. It reads
`accounting-desk/` in MISMO Money's store (relay key `accounting-desk`) and the CMS's Certification Completions file
(relay key `cert-completions`). Nothing on it saves. The rest of the repo belongs to other systems: stay inside
`accounting-desk/` and `.github/workflows/accounting-desk-checks.yml`.

## How a Change Goes Live

Merge to `main`; GitHub Pages publishes it. Every save under `accounting-desk/` runs **Accounting Desk Checks**
(`.github/workflows/accounting-desk-checks.yml`); don't merge a change whose checks fail.

## Checks

`npm install` then `npm test` in `accounting-desk/` (`tests/run.js`). Each check opens the page in a headless browser
with a pretend sign-in and a pretend relay serving `tests/sample-data.json`, so nothing real is read:

1. Every page script parses.
2. The shared Back helper is loaded from `/assets/back.js` right after `session.js`, the page makes no history steps of
   its own, and no copy of `back.js` is kept here.
3. The browser's Back button: two menu pages and Back returns to the first, Forward goes again, Back closes an open
   details panel and stays on the page, a panel closed with its X leaves no step behind, and no page errors.
   The harness serves `/assets/back.js` from the live copy (set `MISMO_BACK=<file>` to try a local one).

## The Back Button (CN-033, Nov 25, 2026)

The shared `/assets/back.js` (owned by Forms and shared pages) turns each change of page in the left menu
(`nav button[data-hq]`, the one carrying `aria-current`; Help is in the menu) into a browser history step. The details
panel (`#pane`) is registered with `MismoBack.layer`, so Back closes it first, exactly as its X does; `pane()` and
`closePane()` call `MismoBack.check()` so a panel opened from the search counts too. Never copy `back.js` here or add
`history.pushState`. The desk's own `history.replaceState(null, "", "#tab")` stays (it keeps the page in the address so
a reload reopens it); back.js keeps its note on the entry when it runs.
