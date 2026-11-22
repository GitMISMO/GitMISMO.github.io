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
paid yet, Lenders and Non-Lenders apart), **Case Management** (MISMO's cases from Aptify case management), **Completed**
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

Page Checks fails when: a script on either page doesn't parse; something that looks like a key or token is in a page;
the page safety list (Content-Security-Policy) is missing; the test copy could save, or the live page couldn't; the test
copy is more than the live page plus its two test-only parts; or the live page isn't a published version.

## Connections

Every hand-off is in the MISMO Connections Map (https://claude.ai/artifact/UcBYh3aakukXcjYvjnWBY7). Update it in the
same session as any change to one. Add fields; never rename or remove one another system reads.

| Data (`membership-desk/data/...`) | Written by | Read by | What it holds |
| --- | --- | --- | --- |
| `todos` | Member 360, whenever someone with edit rights has it open | the desk | New members, free memberships and IIF lenders to set up; what Aptify shows done; Payment in Process items from Member 360 (`pip`) and paid marks (`invPaid`) |
| `square` | MISMO Money | the desk | Square special-rate members (TMC, Broker, ACUMA) to set up, set up and waiting for payment |
| `done` | the desk | the desk, Member 360 | Every set-up marked done, with who, when, order and dates. Never deleted: Undo marks one undone |
| `setupinfo` | the desk | Member 360 | Still Needed details the team filled in on a set-up; Member 360 adds them to the company |
| `invoices` | the desk | the desk, Member 360 | Invoices added on Payment in Process. Never deleted: Entered by Mistake only marks one |
| `cases` | the weekly Aptify email (MISMO Cases sheet); administrators can also drop the report on Case Management | the desk | MISMO-only case management numbers and the latest cases. Its date is the Aptify Data Updated date at the foot of the menu |

The desk sends no email of its own.

## Rules and Decisions

- The membership team never goes into Member 360 or MISMO Money; everything they need is here.
- Each person signs in as themselves, so every mark shows who made it.
- Still Needed is optional and never blocks a set-up.
- Square and IIF set-ups ship the IIF quotation already in Aptify for the amount paid.
- Payment in Process lists Lenders and Non-Lenders apart; an invoice comes off when Aptify payments on or after its
  date add up to it, or when someone selects Mark Paid.
- Archive, never delete: done items are undone, invoices are marked Entered by Mistake.
- Contacts who leave a company are handled in Member 360 only. There is no Aptify Updates tab: Jonna is moving MISMO
  away from Aptify upkeep (Nov 20, 2026).
- Plain language and Title Case headings; squared-off buttons and tags, never pills; no big empty spaces.

## Safety Net

- Source in this repo; this guide; `CHANGELOG.md` (one line per change people would notice, newest first).
- Automatic checks on every change (Membership Desk Page Checks) and before every publish.
- Publishing only through Membership Desk: Publish a Version, with every version kept for rollback.
- Version stamp on the page (fingerprint and time), with a notice when a newer version is out.
- Page safety list (Content-Security-Policy) naming the only places the page may load from or send to.
- Saves retry when two people save at once, and record who saved.
