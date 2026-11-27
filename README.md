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
| `assets/favicon-48x48.png` | The browser tab icon for every MISMO system: the same picture as www.mismo.org's icon (the MISMO S mark on a navy square), saved unchanged. Every page's `<head>` has one icon line and no other: `<link rel="icon" type="image/png" sizes="48x48" href="https://resources.mismo.org/assets/favicon-48x48.png">` (CN-030, Nov 25, 2026). To change the icon everywhere, replace this file and `favicon.ico`. |
| `assets/holiday.js` | December only (1st to 31st): a santa hat with a long tail sits on the O of the masthead logo, its bobble swings and a little snow falls the first time a tool is opened in a session; hovering over the hat brings the snow back. Once each business day (December 1 to 24, a different time each day between 9:30 AM and 4:30 PM Eastern, the same moment for everyone), Santa flies across the screen on his sleigh with the reindeer and waves if you're watching. Only people with a tool open and on screen at that moment see him; there's no catching him later. Preview with `?holiday=sleigh`. `session.js` loads it only on internal tool pages (the ones with the sign-in chip) for people signed in with a MISMO or MBA address; never the website, forms, applications or work-product downloads; MyMISMO and MISMO Money load it with their own line. Preview any time with `?holiday=preview` (Jonna, Nov 26, 2026). |
| `assets/occasions.js` | The other holidays (Jonna, Nov 27, 2026): New Year's (the first time each person opens a tool in January), Groundhog Day, Valentine's Day, Pi Day, St. Patrick's Day, Easter (on Good Friday; the O becomes a bunny), the 4th of July, Halloween (the O becomes a jack-o'-lantern) and Thanksgiving (on the Wednesday; the O becomes a turkey). Each shows on the day, or the business day before when the day is a weekend or a MISMO day off. holiday.js works out the day and loads this file only then. Preview with `?holiday=<name>` (newyear, groundhog, valentine, piday, stpatrick, easter, july4, halloween, thanksgiving). |
| `assets/back.js` | The browser's Back and Forward buttons for every MISMO app: moving between left-menu pages (`nav button[data-hq]`, whichever carries `aria-current`) becomes a history step, and Back first closes any right-hand panel or drawer the app has registered (`MismoBack.layer({isOpen, close})`). Only what a person does makes a step; the address never changes. Each app loads it with `<script src="/assets/back.js"></script>` right after `session.js` A page button outside the menu (Help) joins with `data-back-page="help"` (piloted on Summit HQ, Nov 25, 2026). |
| `favicon.ico` | The same icon at 16, 32 and 48 px, for any page on resources.mismo.org with no icon line. |
| `_internal/ADDING-A-TOOL.md` | How to add a new tool to this domain, with and without saving. Start here. |
| `_internal/relay-save.js` | Drop-in saving module for a tool that needs to write back to GitHub. |
| `assets/tools.json` | Every tool with its own access. The admin panel's People & Access and every account menu read this one list, so a tool added here appears in both. |
| `_internal/projects.json` | The save relay's project list. The Lambda reads this file, so adding a tool that saves is a commit here rather than an AWS change. |

## The masthead (CN-053, Nov 26, 2026)

The internal pages here with the navy bar (the home page `index.html`, `help.html`, `signature.html` and
`reset-password.html`) use Certification Management's masthead exactly, so the MISMO logo sits in the same spot in
every tool: a 68px navy bar (#0d314c) with a 1px line along its foot (box-shadow 0 1px 0 rgba(80,164,219,.28)), 22px
in from the left; the white logo box (9px 13px padding, 5px corners, box-shadow 0 1px 0 rgba(80,164,219,.35)) with the
logo 24px tall and 157px wide; 14px gaps between the box, a 1px divider 42px tall in rgba(80,164,219,.4), and the page
name at 16px, weight 500, #94c8e9. The right-hand group (Help, dark mode, sign-in chip) is unchanged. Public forms
(`forms/`) and the applicant portal (`portal/`) keep the shared website header. The older December hat (`.santa`,
`#mismo-hat`, `html[data-season="december"]` rules and the `season()` script) is retired everywhere here;
`assets/holiday.js` does December now.

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


## Read-only keys one system gives another (Nov 23, 2026)

Some relay keys in `_internal/projects.json` exist only so one system can read a folder of another
system's data repository: `"writable": []` and one `readable` folder, nothing else.

| Key | Reads | Who gets it |
|---|---|---|
| `cert-completions` | cms-data `data/accounting/` | Its own row in People & Access (the Accounting Desk's Certification Completions tab) |
| `cms-member-360` | cms-data `data/member-360/` (`certifications.json`, written by the CMS) | Everyone with Member 360: it is in Member 360's `also` in `assets/tools.json`, so People & Access gives it the same access as Member 360 (CN-017) |
| `media-member-360` | marketing-hq-data `data/member-360/` (`downloads.json`, website downloads written by MISMO Media) | Everyone with Member 360, through Member 360's `also` in `assets/tools.json`, the same way as `cms-member-360` (CN-020) |
| `connected-systems` | connected-systems-data `data/` (`systemsmap.json`, a copy of Team HQ's Connected Systems record, brought over by mismo-connections' Connected Systems Copy job; the repository holds nothing else) | Its own row in People & Access (View is enough), for the Connected Systems app at /connected-systems/ (/team-hq/connected-systems/ forwards there). Not in Team HQ's `also` (CN-027); that only matters for people outside staff, since People & Access gives staff full access to every system (Jonna, Nov 24, 2026). |

A key added to a tool's `also` reaches people who already have that tool the next time a platform
admin opens People & Access: the panel brings their keys into line and asks for Save Access.

## MyMISMO's relay key (CN-035, Nov 25, 2026)

`_internal/projects.json` has a `mymismo` key for MyMISMO (resources.mismo.org/mymismo/, GitMISMO/mymismo).
Its data is the private GitMISMO/mymismo-data, written only by the relay. `writable` is empty on purpose:
staff pages save nothing there yet. `attendees: true` and `attendeeFeed` (Summit HQ's
`data/feed-mymismo-attendees.json` in GitMISMO/summit-hq-data) are for relay request 13: attendee sign-in
with the registration email and an emailed 6-digit code, an opt-in attendee directory and messages
between attendees. The key does nothing until Perry deploys relay request 13. MyMISMO is public, so it
has no People & Access entry.

MyMISMO alerts and slides (CN-037, Nov 25, 2026): the `mymismo` key also has `push: true`, `alertSenders`
(only jcritchley@mismo.org can press Send on an alert; nothing goes out automatically) and `slidesFeed`
(Summit HQ's `data/feed-mymismo-slides.json` in GitMISMO/summit-hq-data: slides uploaded by the MISMO team,
downloadable only by signed-in attendees). These do nothing until Perry deploys relay request 14, and push
also needs the two VAPID keys set on the function.
