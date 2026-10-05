# resources.mismo.org

The organization site for MISMO's internal tools. This repository is the **home page**
for `resources.mismo.org`; every other tool is its own repository in the GitMISMO
organization and appears at `resources.mismo.org/<repository-name>/`.

That inheritance is the whole reason this repo is named `GitMISMO.github.io`. GitHub
treats a repository named `<org>.github.io` as the organization's own site, and a custom
domain set here applies automatically to every other public Pages site in the org. A new
tool therefore needs no DNS work at all — create the repo, turn on Pages, and it is live
under this domain.

## Files

Anything under `_internal/` is **not published**. GitHub Pages runs Jekyll, which skips
paths beginning with an underscore, so those files exist in the repository but are not
fetchable from the website. The save relay reads `projects.json` through the GitHub API,
not over the web, so it is unaffected by where the file sits.

That is tidiness rather than security — the repository is public either way, so anyone can
read these on github.com. It just stops the site handing out a map of the estate to anyone
who fetches one URL.

| File | What it is |
|---|---|
| `index.html` | The home page, in the Summit HQ look the admin panel and the glossary console use. The wordmark is inline; the IBM Plex Sans font comes from Google Fonts with a system-font fallback, and the account bubble from `assets/session.js`. |
| `assets/` | The two official wordmarks, colour and white, kept as files for use by other tools. |
| `_internal/ADDING-A-TOOL.md` | How to add a new tool to this domain, with and without saving. Start here. |
| `_internal/relay-save.js` | Drop-in saving module for a tool that needs to write back to GitHub. |
| `assets/tools.json` | Every tool with its own access. The admin panel's People & Access and every account menu read this one list, so a tool added here appears in both. |
| `_internal/projects.json` | The save relay's project list. The Lambda reads this file, so adding a tool that saves is a commit here rather than an AWS change. |

## Editing the home page

Everything renders from the `APPS` array in `index.html`. Adding a tool is one object —
name, folder, colour, description, its main pages (`entries`, always shown) and any other
pages (`groups`, shown when the tool is expanded from its heading). The sidebar and the
page counts follow from it, and the list sorts itself alphabetically, so a new entry lands
in the right place wherever it is added.

Two conventions the page relies on:

- `base` must match the tool's **repository name exactly**, because on GitHub Pages the
  path is the repository name.
- Browser storage keys are namespaced `tools:<app>:<name>`. Every tool on this domain
  shares one origin, so unprefixed keys collide and `localStorage.clear()` would wipe
  other tools' unsaved work. See `ADDING-A-TOOL.md`.

## Who can change what

`projects.json` decides which repositories the save relay knows about. The relay's GitHub
token decides which it can actually write to, and that grant lives in GitHub under
org-admin control — so an entry here naming a repository the token cannot reach is simply
refused. Keep write access to this repository with a small group, and require a pull
request on `main`.

## Adding a new tool: the checklist (Perry, 5 Oct 2026)

First ask Perry which **section** it belongs in. Then add it to:

1. **The home page** (`index.html`), in that section.
2. **The admin console**: `assets/tools.json` (its section is `group`) and `_internal/projects.json`.
3. **Access**: who gets it, set in People & Access (ask Perry).
4. **Its pages on the home page**: suggest which pages or tasks to show, and let Perry choose.

## The home page (5 Oct 2026)

`index.html` (behind the sign-in) and `assets/home.js`: a greeting and a search box, pinned tasks
(each person's own, kept per account in their browser), and every tool they have, by section, as
tasks with the page each opens. The tools, sections and tasks are listed near the top of
`assets/home.js` (TOOLS, ENTRIES, and CONTEXT for the words people search with): a new tool is
added there too (see the checklist above).

The search also finds initiatives and workgroups (`assets/home-index.json`, rebuilt with
`python3 _internal/build-home-index.py ../initiative-hub` when an initiative is added or renamed)
and potential initiatives (read live from the Hub). Domain acronyms (the `abbr` on the Hub's domainMeta, such as
MCD for Mortgage Compliance) are searchable too: an initiative or workgroup in, or naming, that domain
answers to its acronym. A search of two letters alone is treated as an acronym and matched whole. Business Glossary terms are deliberately left
out; the glossary has its own search.

