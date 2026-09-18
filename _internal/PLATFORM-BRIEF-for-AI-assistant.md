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
the *server hands over*. If content must not be seen by everyone, it cannot live in the
page — it has to come from an authenticated API at runtime. Assume anything you commit is
public forever.

**Never use `localStorage.clear()`.** Every tool shares one origin, so clearing storage
wipes other tools' data. Namespace every key as `resources:<your-tool>:<name>` and remove
only your own.

**Git commits whole files.** There is no row-level permission. If a file contains data
that only some people should see, the *whole file* reaches every browser that loads it —
hiding rows in JavaScript changes nothing, the data is already there. Confidential data
cannot live in the repository. That is a property of git, not a limitation to work
around.

**Pass `parentSha` on every save.** It is the commit your page actually read. If someone
else saved meanwhile, the relay returns `409` and refuses rather than silently discarding
their work. Omit it and colleagues overwrite each other invisibly.

---

## What the relay will and will not write

The relay refuses to write anything outside a small set of paths. This is deliberate: a
leaked password should mean a bad data edit, not a site takeover. It cannot commit HTML,
JavaScript, configuration or its own source. Code changes are ordinary pull requests by a
person.

| Route | Purpose |
|---|---|
| `GET /{project}/data/{id}` | read a data file |
| `PUT /{project}/data/{id}` | write one data file |
| `POST /{project}/commit` | write up to 50 files in one atomic commit |
| `GET /{project}/facilitators` | list accounts (admin only) |
| `PUT /{project}/facilitators` | replace the account list (admin only) |

Limits: 50 files per commit; no path may begin with `/` or contain `..`.

---

## Authentication, as it is today and as it will be

**Today:** a person enters `email:password`. The page sends it to the relay on each
request as an `X-Facilitator-Key` header. The relay checks it against a PBKDF2 hash in
`_internal/facilitators.json` in that tool's repository. The key is kept in
`localStorage` and does not expire.

**Soon (built, tested, not switched on):** one sign-in across every tool. The person signs
in once, the relay returns a signed token, and the token is sent instead of the password.
Permissions live in `_internal/access.json` in the `GitMISMO.github.io` repository, per
person and per tool.

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
5. Add an entry to `_internal/projects.json` in `GitMISMO.github.io`. This is a pull
   request, not a ticket.
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

## When to stop and ask

- A design seems to need a secret in the browser.
- Data should be visible to some people and not others.
- You are about to add a build step, a framework or a package manager.
- You are about to rename a repository that is already linked from somewhere.
- Something needs an AWS change — those go through IT and take days, so raise them early.

The platform owner is Perry Williams. The relay, its tests and its setup guide are in the
`initiative-hub` repository under `_dev/aws/`.
