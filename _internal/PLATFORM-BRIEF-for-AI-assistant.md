# MISMO Resources platform — brief for an AI assistant

You are helping build a tool that will live on MISMO's shared tools platform. This
explains how the platform works, what you can and cannot do, and the mistakes that are
easy to make here.

Read it before designing anything. Several constraints below are not obvious and will
send you down the wrong path if you assume the normal answers.

---

## The shape of it

Everything lives at `resources.mismo.org`. Each tool is a **separate public GitHub
repository** in the **GitMISMO** organization, published with GitHub Pages. The path is
the repository name: a repo called `press-release` serves at
`resources.mismo.org/press-release/`.

There is **no server, no build step and no framework**. Hand-written HTML, CSS and
vanilla JavaScript, committed and served as-is. Do not introduce React, a bundler, npm
or a build pipeline. A page must work when opened directly from the repository.

Saving works through a **relay**: one AWS Lambda shared by every tool. The relay holds
the single GitHub token; no page ever does. Every save becomes a real commit, so history,
attribution and rollback come for free.

```
browser  →  relay (AWS Lambda)  →  GitHub commit
            holds the token
            checks who you are
            checks what you may write
```

---

## Hard constraints — these are not style preferences

**Never put a GitHub token, API key or any secret in a page.** Every file in the
repository is publicly readable, and so is everything the site serves. If a design seems
to need a credential in the browser, the design is wrong. Route it through the relay.

**Nothing served by GitHub Pages can be hidden.** There is no such thing as a private
page here. A login screen on a static page controls what the *interface offers*, not what
the *server hands over*. Assume anything committed to a PUBLIC repository is public
forever.

**But sensitive data has a home: a private repository, read through the relay.** The page
stays public and holds nothing; after sign-in it asks the relay, which reads the private
repository on the server and returns only what that person may see. So you gate the data,
not the page. Files attached to Initiative Hub records already work this way — the
documents and even their file names live in a private repository, and someone without
access sees no sign that any exist.

**Never use `localStorage.clear()`.** Every tool shares one origin, so clearing storage
wipes other tools' data. Namespace every key as `resources:<your-tool>:<name>` and remove
only your own.

**Git commits whole files, so a PUBLIC repository cannot hold anything confidential.**
If a public file contains data only some people should see, the *whole file* reaches every
browser that loads it — hiding rows in JavaScript changes nothing, the data is already
there. That is a property of git, not a limitation to work around.

Row-level permission is still possible, but only on the server. When the data sits in a
private repository, the relay reads the file, filters it, and returns only that person's
rows; the rest never leaves the server. So one person can see their own hours while
another sees everyone's rates — as long as the filtering happens in the relay and never in
the page. Contractor rates, signed agreements and similar all belong here rather than in
a public repository.

**Pass `parentSha` on every save.** It is the commit your page actually read. If someone
else saved meanwhile, the relay returns `409` and refuses rather than silently discarding
their work. Omit it and colleagues overwrite each other invisibly.

**Every tool uses the shared sign-in and refusal screens. Never build your own.** Signing
in, being refused, and signing in again after a session expires all look and behave the
same in every tool, because they all come from `/assets/session.js`. Decided September
2026, after four tools had grown four different versions. Concretely:

- **No sign-in form of your own**, no password field, and never `prompt()` for a key.
- **No "you don't have access" banner of your own.** A page that requires sign-in calls
  `ResourcesSession.requireAccess('your-tool', {toolName: 'the Your Tool'})` once at the
  top and does nothing until it resolves. It shows the sign-in window or the standard
  refusal as needed. If the relay later refuses a request with `NO_ACCESS` (access removed
  while the page was open), show the same refusal:
  `ResourcesSession.signIn({reason: 'no-access', toolName: 'the Your Tool', gated: true})`.
- **Never refuse someone from the browser's copy of their access.** That copy is taken at
  sign-in and goes stale the moment someone is granted a tool. `requireAccess` asks the
  relay before refusing and quietly corrects the copy. Checking `role()` yourself and
  showing a refusal when it is empty turns away people who have access.
- **A save made after the session has expired must not be lost.** `ResourcesSession.token()`
  returns null once the four-hour session runs out. Before any write, if there is no token,
  call `ResourcesSession.signIn({reason: 'expired'})` (the "Sign in to finish saving"
  window, with the email filled in), then send the same save. If they cancel, say on screen
  that the change was not saved. Never swallow the failure: a save that fails silently is
  the worst outcome this platform has.
- A page that works without an account (the Glossary console keeps drafts locally) shows
  the refusal with `gated: false`, so Close just closes it.
- **Every tool shows the shared account bubble in the same place**: the far right of the
  top bar, after the "Programs &amp; Operations" label. Put `<div id="rs-account"></div>`
  there and `session.js` fills it automatically; it carries the person's name, their
  access to each tool, and sign-out. The Sponsorship Portal, Summit HQ and Service Orders
  use the same top bar, so copy it from any of them:

  ```html
  <span class="hqtop-r">
    <span class="eyebrow-m">Programs &amp; Operations</span>
    <div id="rs-account"></div>
  </span>
  ```

**Change a tool's current file; never re-upload an older copy over it.** Uploading a whole
`index.html` replaces everything in it, including fixes other people made since your copy
was taken. On 28 September 2026 an upload of Summit HQ undid two fixes from an hour
earlier (the page flashed before sign-in again), and nobody could tell until it was
reported. Before uploading, download the current file from the repository and work from
that, or ask whoever last changed it.

---

## What the relay will and will not write

The relay only writes where your project has said it may. Each project declares a
`writable` list of folders in `_internal/projects.json`, and a save touching anything
outside those folders is refused in full — not partly written. Code changes are ordinary
pull requests by a person.

This is deliberate: a leaked password should mean a bad data edit, not a changed website.
So declare only the folders your tool genuinely writes, usually just `data/`. Never list
the folder containing your page code.

Three locations are refused whatever a project declares: `_internal/`, `.github/` and
`.git/`. That means account lists, CI workflows and git internals can never be changed by
saving, even through a mistake in `projects.json`.

| Route | Purpose |
|---|---|
| `GET /{project}/data/{id}` | read a data file |
| `PUT /{project}/data/{id}` | write one data file |
| `POST /{project}/commit` | write up to 50 files in one atomic commit |
| `GET /{project}/file/{path}` | read one file back, base64 — how a private repository reaches a signed-in person |
| `GET /{project}/facilitators` | list accounts (admin only) |
| `PUT /{project}/facilitators` | replace the account list (admin only) |

Limits: 50 files per commit; no path may begin with `/` or contain `..`; and each project
declares in `projects.json` which folders it may write, with `_internal/`, `.github/` and
`.git/` refused whatever it declares.

A file may carry `encoding: 'base64'` to store a document — Word, Excel, PDF, images —
byte for byte. Without it the content is treated as text and a document would be
corrupted. About 4 MB per file, from the relay's request limit.

---

## Authentication, as it is today and as it will be

**Today:** a person enters `email:password`. The page sends it to the relay on each
request as an `X-Facilitator-Key` header. The relay checks it against a PBKDF2 hash in
`_internal/facilitators.json` in that tool's repository. The key is kept in
`localStorage` and does not expire.

**Live since September 2026:** one sign-in across every tool. The person signs
in once, the relay returns a signed token, and the token is sent instead of the password.
Permissions live in `_internal/access.json` in the `GitMISMO.github.io` repository, per
person and per tool.

**Three levels of access per tool:** Edit, View, or none. Edit saves; View reads
everything and cannot save; none means the tool is not theirs. The relay refuses every
write from a View account itself, so hiding a button is courtesy, not security.

Use the shared module rather than reading roles yourself:

| Call | Use it for |
|---|---|
| `ResourcesSession.requireAccess('your-tool', {toolName:'the Your Tool'})` | Gating a whole page. Shows sign-in or the refusal screen as needed, asks the relay before refusing, and resolves with the role. Cancel sends the person back to the home page unless you pass `gated: false`. |
| `ResourcesSession.signIn({reason:'expired'})` | Before a save when `token()` is null: the "Sign in to finish saving" window. Then send the same save. |
| `ResourcesSession.canEdit('your-tool')` | Deciding whether to show Save, Add, Remove and similar. |
| `ResourcesSession.role('your-tool')` | Only if you truly need to tell admin from staff. Returns `'admin'`, `'staff'`, `'view'` or `null`. |

Do not compare role strings in your page. A fourth level added later would silently fall
through every `role === 'staff'` check, and `canEdit()` changes in one place.

**Design for the second one.** Keep credential handling in one small module rather than
scattered through the page, so the switch is one file. Do not build anything that assumes
the password is available on every request.

**A rule worth keeping:** the token proves *who* someone is; permissions are looked up
fresh on every request. Do not "optimise" by caching a role in the token — a removed
person would keep working until it expired.

---

## The `_internal/` convention

Jekyll, which GitHub Pages runs, skips any path beginning with an underscore. So
`_internal/` files are in the repository but **not served by the website**. Anything the
site itself should not hand out goes there: account lists, configuration, developer notes.

It is tidiness, not security — the repository is public, so it is all readable on
github.com. It stops the *website* handing out your internal structure to anyone who
guesses a URL.

---

## Adding a tool that saves

1. Create a **public** repo in GitMISMO, lowercase with hyphens. The name becomes the URL
   and renaming it later breaks every saved link.
2. Commit your files; `index.html` at the root is what loads. Settings → Pages → deploy
   from `main`, folder `/`.
3. Add `_internal/facilitators.json` with the account list — hashes only, never passwords.
   Generate them with `key-helper.html` in the Initiative Hub repo, which runs entirely in
   the browser.
4. Copy `relay-save.js` from `GitMISMO.github.io/_internal/` and set your project key.
5. Add an entry to `_internal/projects.json` in `GitMISMO.github.io`, including a
   `writable` list of the folders your tool saves to. This is a pull request, not a
   ticket.
6. Ask for the repository to be added to the relay's GitHub token. **This is the one step
   that needs someone else**, and the one most often forgotten — the token cannot read a
   repository it was not granted, even a public one.

Full detail: `_internal/ADDING-A-TOOL.md` in the `GitMISMO.github.io` repository.

---

## Conventions worth matching

Light and dark themes throughout, keyed to `data-theme` on `<html>`. **Always check a
design in both** — a pale tint that reads as a pill on white disappears on a dark card,
and a near-black label vanishes entirely. Both have happened.

Storage keys: `resources:<tool>:<name>`.

When copying an existing page as a starting point, **search it for the original tool's
storage keys and internal identifiers**. They come along silently and nothing fails
loudly: two tools sharing a draft key will offer each other's unsaved work.

---

## Facilitator names come from one list

Anywhere a facilitator's name can be edited, it is chosen from a drop-down, never typed.
The list is kept in the Initiative Hub Admin Panel (Facilitators), which publishes the
names to `/initiative-hub/data/facilitator-roster.json` as `{"facilitators":[{"name":"…"}]}`.
Read that file; do not hard-code names. Keep any saved name that is not on the list
selectable, marked "(not on the list)", so opening a page never changes data. Summit HQ
also allows a walk-on (someone covering at one summit only), typed in its picker and
never added to the shared list.

## When to stop and ask

- A design seems to need a secret in the browser.
- Data should be visible to some people and not others AND you are tempted to put it in
  a public repository. In a private one, read through the relay, this is supported.
- You are about to add a build step, a framework or a package manager.
- You are about to rename a repository that is already linked from somewhere.
- Something needs an AWS change — those go through IT and take days, so raise them early.

The platform owner is Perry Williams. The relay, its tests and its setup guide are in the
`initiative-hub` repository under `_dev/aws/`.
