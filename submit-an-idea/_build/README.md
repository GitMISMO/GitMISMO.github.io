# Submit an Idea on mismo.org

The public Submit an Idea form moves onto a page of mismo.org, as the Business Glossary does (Perry, 13 November 2026). It follows the same plan and the same rules: see the glossary's `docs/embed.md`. The form keeps sending to the relay as before. From mismo.org, that needs relay request 11 plus `"formOrigins"` on `hub-requests` in `_internal/projects.json`.

## What the Website Loads

All of these live at `https://resources.mismo.org/submit-an-idea/`. Folders starting `_` are not published.

| File | What It Is |
|---|---|
| `embed.js` | The loader. Its address never changes, and it's kept by hand. |
| `version.json` | Which app files are current |
| `app-<fingerprint>.js` and `.css` | The form, built from `_src/` |

**The website's block,** for its Submit an Idea page:

```html
<div id="mm-submit-idea"></div>
<script>
  window.MISMO_SUBMIT_IDEA = { options: {
    headerOffset: function(){ return document.querySelector('<the sticky header>').offsetHeight; }
  } };
</script>
<script src="https://resources.mismo.org/submit-an-idea/embed.js"></script>
```

- **Options:** the same as the glossary's (`headerOffset`, `base`, `embedded`).
- **Global:** `window.MISMO_SUBMIT_IDEA`, with `mount` and `version`.
- **Ids:** every id inside the box starts `si-`.
- **Share Your Idea:** it scrolls to the form below the website's header without changing the address. An old link ending `#tell` still lands on the form.

## Changing the Form

resources.mismo.org publishes this repository as it stands, with no build step, so the built files are committed:

1. Edit `_src/idea.js` or `_src/idea.css`.
2. Run `python3 submit-an-idea/_build/build.py`.
3. Run `python3 submit-an-idea/_build/check.py` (27 checks, on the stand-in website in `_build/test-page.html`).
4. Commit the built files with the change.

The standalone page, `index.html`, loads the same built files with its own copy of the website's header and footer, until go-live.
