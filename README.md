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
| `index.html` | The home page. Self-contained — fonts and both wordmarks are embedded, so it makes no external requests and cannot be broken by a CDN outage. |
| `assets/` | The two official wordmarks, colour and white, kept as files for use by other tools. |
| `_internal/ADDING-A-TOOL.md` | How to add a new tool to this domain, with and without saving. Start here. |
| `_internal/relay-save.js` | Drop-in saving module for a tool that needs to write back to GitHub. |
| `_internal/projects.json` | The save relay's project list. The Lambda reads this file, so adding a tool that saves is a commit here rather than an AWS change. |

## Editing the home page

Everything renders from the `APPS` array at the top of `index.html`. Adding a tool is one
object — name, folder, colour, description, and its pages. The rail, the page counts and
the footer all follow from it, and the list sorts itself alphabetically, so a new entry
lands in the right place wherever it is added.

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
