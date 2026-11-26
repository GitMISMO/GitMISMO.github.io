# Developing the Membership Desk

How the Membership Desk works, for whoever changes it next, whether that's a new Claude or a person. Read this whole
file before changing anything. The guide for the people who *use* the desk is **Help**, inside the page.

**When a feature changes, update Help and this file in the same change, and add a line to CHANGELOG.md.**

Every MISMO system follows the `mismo-connected-systems` skill (stay in your lane, connections are contracts, never
overwrite newer work, the same safety net everywhere). This file is how those rules apply here.

Contents: What It Is · Where Everything Lives · How a Change Goes Live · Connections · Rules and Decisions · Safety Net

---

## What It Is

The Membership Desk is the MBA membership team's own page (membership@mismo.org: Armonie and whoever MBA adds). It
shows what they need to set up in Aptify for MISMO and what they've done, so they never need Member 360 or MISMO Money.
Amy and Kelly use it too, mostly for Payment in Process.

Pages (left menu): **Home** (the to-do list and how the work is going), **Payment in Process** (invoices sent and not
paid yet, Lenders and Non-Lenders apart), **Contact Updates** (send a change to a
member's contacts straight into Member 360; every update is kept with who sent it and where it stands), **Case Management** (MISMO's cases from Aptify case management), **Completed**
(what's been set up, a page at a time) and **Help**. The foot of the menu shows **Aptify Data Updated** (the date of the
latest weekly Aptify data) and Dark Mode.

The to-do kinds: **Square Set-Ups** (from MISMO Money), **New Members**, **Free Memberships** and **IIF Lenders** (from
Member 360). Each opens a set-up panel with everything needed to set the member up in Aptify. **Still Needed** details
(address, phone, website, contacts, member type, sector) can be filled in right on the set-up; they are optional and
never stop a set-up being submitted. **Mark Set Up** records who did it and when, with the order number and the
membership start and end dates.

## Where Everything Lives

- **Live page:** `membership-desk/index.html` in the `GitMISMO.github.io` repo, served at
  https://resources.mismo.org/membership-desk/. One file: the page is the code.
- **Test copy:** `membership-desk/test/index.html`, at https://resources.mismo.org/membership-desk/test/. It is the
  live page plus two test-only parts (`tools/test-copy-head.txt` right after the charset line, `tools/test-copy-tail.txt`
  right before the last `</body>`). It reads the real data but can't save, upload or send anything.
- **Tools:** `membership-desk/tools/desk.js` (Page Checks and publishing, one script so both run the same checks).
- **Browser checks:** `membership-desk/tests/` (`run.js` and `harness.js`; `npm test` there). They open the page the test
  copy would publish in a headless browser with a pretend sign-in and a pretend relay holding made-up records (nothing
  real is read or changed), and serve `/assets/back.js` from the live copy. Add a check there when you add a feature.
- **Versions:** `membership-desk/releases/` keeps every version made live (never deleted), listed in
  `releases/index.json` with who published it, when, a note and its fingerprint.
- **Automatic checks and publishing:** `.github/workflows/membership-desk-checks.yml` and
  `.github/workflows/membership-desk-publish.yml` at the top of the repo. They only touch `membership-desk/`.
- **Sign-in:** the shared `/assets/session.js`. Access is given person by person in People and Access
  (resources.mismo.org/initiative-hub/admin.html#people) under the project `membership-desk`. Administrators can also
  drop the weekly case report on Case Management.
- **Data:** saved through the save relay under `membership-desk/data/` (see Connections).

The rest of the `GitMISMO.github.io` repo belongs to other systems (the resources.mismo.org home, MMS, forms and
more). Stay inside `membership-desk/` and the two `membership-desk-*` workflows.

## How a Change Goes Live

1. Make the change in `membership-desk/test/index.html`, starting from the newest copy in the repo (never an older
   one). Keep the two test-only parts exactly as they are.
2. Saving it runs **Membership Desk Page Checks** automatically. Try it at the test address with real data.
3. Make it live with **Actions > Membership Desk: Publish a Version > Run workflow**: leave "test copy" and add a short
   note. It runs the same checks, takes the test-only parts out, writes `index.html`, keeps the version in `releases/`
   and lists it in `releases/index.json`.
4. To roll back, run the same workflow and type an earlier version from `releases/index.json` (for example
   `20261122-1530`). The test copy is reset to match.

Never upload `index.html` by hand: Page Checks fails when the live page isn't the last published version. Jonna has
said the Claude working on the desk may publish once Page Checks pass, then tell her what went live.

Page Checks also runs the browser checks in `tests/` (Publish a Version runs them too before making the test copy live).
Page Checks fails when: a browser check fails; a script on either page doesn't parse; something that looks like a key or token is in a page;
the page safety list (Content-Security-Policy) is missing; the test copy could save, or the live page couldn't; the test
copy is more than the live page plus its two test-only parts; or the live page isn't a published version.

## Connections

Every hand-off is in the MISMO Connections Map (https://claude.ai/artifact/UcBYh3aakukXcjYvjnWBY7). Update it in the
same session as any change to one. Add fields; never rename or remove one another system reads.

| Data (`membership-desk/data/...`) | Written by | Read by | What it holds |
| --- | --- | --- | --- |
| `todos` | Member 360, whenever someone with edit rights has it open | the desk | New members, free memberships and IIF lenders to set up; what Aptify shows done; Payment in Process items from Member 360 (`pip`) and paid marks (`invPaid`) |
| `applications` (+ `file/data/application-pdfs/<id>.pdf`) | Member 360's Membership Application PDFs job (member-360-data), on each application | the desk | Website applications (tests left out) and their PDFs: an application Member 360 hasn't listed yet shows on the To Do as a set-up built from the application alone, and Open the Application (PDF) reads the desk's own copy first (Nov 22, 2026) |
| `square` | MISMO Money | the desk | Square special-rate members (TMC, Broker, ACUMA) to set up, set up and waiting for payment |
| `done` | the desk | the desk, Member 360 | Every set-up marked done, with who, when, order and dates. Never deleted: Undo marks one undone |
| `setupinfo` | the desk | Member 360 | Still Needed details the team filled in on a set-up; Member 360 adds them to the company |
| `contactupdates` | the desk | Member 360 | Contact changes sent from Contact Updates (add someone, change details or roles, someone has left), with who and when. Never deleted: Withdraw only marks one. Member 360 applies each one once (Nov 24, 2026) |
| `people` | Member 360, whenever someone who can save has it open (and every 5 minutes) | the desk | Each member's and prospect's current contacts and roles, for the Contact Updates form, and what Member 360 did with each update (In Member 360, or Needs a Look with the reason) |
| `invoices` | the desk | the desk, Member 360 | Invoices added on Payment in Process. Never deleted: Entered by Mistake only marks one |
| `cases` | the weekly Aptify email (MISMO Cases sheet); administrators can also drop the report on Case Management | the desk | MISMO-only case management numbers and the latest cases. Its date is the Aptify Data Updated date at the foot of the menu |

The desk sends no email of its own.

## Rules and Decisions

- The membership team never goes into Member 360 or MISMO Money; everything they need is here.
- Each person signs in as themselves, so every mark shows who made it.
- Still Needed is optional and never blocks a set-up.
- Contact updates go straight into Member 360, with no approval step, and every one stays on Contact Updates. Aptify isn't changed. Someone who has left moves to Former Contacts in Member 360 (Nov 24, 2026).
- Square and IIF set-ups ship the IIF quotation already in Aptify for the amount paid.
- Payment in Process lists Lenders and Non-Lenders apart; an invoice comes off when Aptify payments on or after its
  date add up to it, or when someone selects Mark Paid.
- Archive, never delete: done items are undone, invoices are marked Entered by Mistake.
- Contacts who leave a company are handled in Member 360 only. There is no Aptify Updates tab: Jonna is moving MISMO
  away from Aptify upkeep (Nov 20, 2026).
- The browser's Back button (Nov 25, 2026, CN-033): the shared `<script src="/assets/back.js"></script>` right after
  `session.js` makes each change of page in the left menu a Back step (the menu button showing carries `aria-current`;
  Help is in the menu, so it needs nothing more). The right-hand panel is registered with `MismoBack.layer` (the script
  just before the version stamp), so Back closes it first, exactly as its X does. Only what a person does makes a step
  and the address never changes. Never copy back.js here or add a `history.pushState` of our own. A new panel, pop-up
  or drawer gets its own `MismoBack.layer` line (bottom layer first) and a step in the Back check in `tests/run.js`.
  The narrow-screen menu drawer isn't registered (as on Summit HQ): choosing a page in it closes it.
- The browser tab icon is the one shared MISMO icon, from https://resources.mismo.org/assets/favicon-48x48.png, and
  no other icon line (Nov 25, 2026). Never copy the image here.
- The masthead matches Certification Management's exactly, so the MISMO logo sits in the same spot in every tool
  (Nov 26, 2026, CN-053): navy bar 68px tall (`--hq-h:68px`, padding 13px 22px), white logo box 9px 13px with 5px
  corners and a sky line under it, logo 24px tall (157px wide), 14px gaps, a 1px divider 42px tall, the name at 16px
  weight 500 in #94c8e9. It is the same on a phone (the name shortens with "..." if it can't fit). Everything that sits
  below the bar (the left menu, the right-hand panel, `#work`'s scroll-margin) uses `--hq-h`, so change only that; the
  newer-version notice sits at `top:80px` (bar + 12px). The December hat is the shared `/assets/holiday.js` (loaded
  by session.js): never add a `.santa`, `#mismo-hat`, `data-season` rule or season script here.
- Plain language and Title Case headings; squared-off buttons and tags, never pills; no big empty spaces.

## Safety Net

- Source in this repo; this guide; `CHANGELOG.md` (one line per change people would notice, newest first).
- Automatic checks on every change (Membership Desk Page Checks) and before every publish.
- Publishing only through Membership Desk: Publish a Version, with every version kept for rollback.
- Version stamp on the page (fingerprint and time), with a notice when a newer version is out.
- Page safety list (Content-Security-Policy) naming the only places the page may load from or send to.
- Saves retry when two people save at once, and record who saved.
