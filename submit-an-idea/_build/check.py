# Submit an Idea on a stand-in for its mismo.org page (Perry, 13 Nov 2026, as for the Business Glossary).
# Run: python3 submit-an-idea/_build/check.py   (builds first; needs Playwright with Chromium, and Pillow)
# The form's files are served from one address and the stand-in website (_build/test-page.html) from another, as
# resources.mismo.org and www.mismo.org will be. The relay is stood in: nothing is sent anywhere.
import functools, http.server, importlib.util, io, json, os, re, subprocess, sys, threading
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subprocess.run([sys.executable, os.path.join(APP, '_build', 'build.py')], check=True)
spec = importlib.util.spec_from_file_location('build', os.path.join(APP, '_build', 'build.py')); B = importlib.util.module_from_spec(spec); spec.loader.exec_module(B)
GP, SP = 8741, 8742
FORM, SITE = f'http://127.0.0.1:{GP}', f'http://127.0.0.1:{SP}'
RELAY = 'https://rgvdi67cg27o5kcmiytcqbqnrm0hmztx.lambda-url.us-east-1.on.aws/'


class Pages(http.server.SimpleHTTPRequestHandler):   # GitHub Pages lets any site read its files
    def end_headers(self): self.send_header('Access-Control-Allow-Origin', '*'); super().end_headers()
    def log_message(self, *a): pass


TEST = open(os.path.join(APP, '_build', 'test-page.html'), encoding='utf-8').read().replace('GLOSSARY_BASE', FORM)
BARE = re.sub(r'<script>\s*window\.MISMO_SUBMIT_IDEA.*?</script>\s*<script src="[^"]*embed\.js"></script>', '', TEST, flags=re.S)
AUTO = re.sub(r'<script>\s*window\.MISMO_SUBMIT_IDEA.*?</script>', '', TEST, flags=re.S)
assert BARE != TEST and AUTO != TEST


class Site(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = {'/bare.html': BARE, '/auto.html': AUTO}.get(self.path.split('?')[0].split('#')[0], TEST).encode('utf-8')
        self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.end_headers(); self.wfile.write(body)
    def log_message(self, *a): pass


for port, h in [(GP, functools.partial(Pages, directory=APP)), (SP, Site)]:
    s = http.server.ThreadingHTTPServer(('127.0.0.1', port), h); threading.Thread(target=s.serve_forever, daemon=True).start()

fails = []
def ck(c, m, d=None):
    print(('PASS ' if c else 'FAIL ') + m + ('' if c or d is None else '  ' + str(d)[:300])); (None if c else fails.append(m))
def same(a, b):
    A, Bb = Image.open(io.BytesIO(a)).convert('RGB'), Image.open(io.BytesIO(b)).convert('RGB')
    if A.size != Bb.size: return f'sizes {A.size} and {Bb.size}'
    # Pixel for pixel, apart from rendering noise of a few levels at most (anti-aliasing at a picture's edge); anything
    # the website's styles change (text, spacing, colour, borders) differs by far more.
    d = ImageChops.difference(A, Bb); worst = max(d.tobytes())
    return True if worst <= 4 else f'differs in {d.getbbox()}, by up to {worst} levels'

SITE_ELS = ['body', '#site-header', '#site-menu-link', '#site-menu', '#site-title', '#site-footer', '#site-footer p', '#site-footer a', '#ask-mismo']
PROPS = ['font-family', 'font-size', 'color', 'background-color', 'margin-top', 'padding-left', 'line-height', 'letter-spacing',
         'text-align', 'text-transform', 'border-top-width', 'height', 'z-index', 'position', 'display', 'box-sizing']
STYLES_JS = """([els, props]) => els.map(s => { const e = document.querySelector(s); if(!e) return null; const c = getComputedStyle(e); return props.map(p => s === 'body' && p === 'height' ? '' : c.getPropertyValue(p)); })"""
PDF = b'%PDF-1.4\n' + b'A' * 2000

with sync_playwright() as p:
    br = p.chromium.launch()
    def page(w=1280, h=900):
        pg = br.new_page(viewport={'width': w, 'height': h}); pg.errs = []; pg.reqs = []; pg.sent = []
        pg.on('pageerror', lambda e: pg.errs.append(str(e)))
        pg.on('console', lambda m: pg.errs.append(m.text) if m.type == 'error' else None)
        pg.on('request', lambda r: pg.reqs.append(r.url))
        def relay(r):
            pg.sent.append({'url': r.request.url, 'origin': r.request.headers.get('origin')})
            body = {'ok': True, 'reference': 'IDEA-0042', 'replyBy': '2026-11-17', 'attach': 'a.b.c'} if r.request.url.endswith('/ideas/submit') else {'ok': True}
            r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': r.request.headers.get('origin') or '*'}, body=json.dumps(body))
        pg.route(RELAY + '**', relay)
        return pg
    def ready(pg, url):
        pg.goto(url); pg.wait_for_selector('#si-who [data-who]', timeout=15000); pg.wait_for_timeout(300)
    hdr = lambda pg: pg.evaluate("document.getElementById('site-header').getBoundingClientRect().bottom")
    top_of = lambda pg, sel: pg.evaluate(f"document.querySelector('{sel}').getBoundingClientRect().top")

    # ---------- the built styles stay inside the box
    css = open(os.path.join(APP, json.load(open(os.path.join(APP, 'version.json')))['css']), encoding='utf-8').read()
    def walk(nodes):
        for prelude, body in nodes:
            if isinstance(body, list): yield from walk(body)
            elif body is not None and not prelude.startswith('@'): yield from (x.strip() for x in B.split_top(prelude, ','))
    sels = list(walk(B.parse(B.strip_comments(css))[0])); loose = [x for x in sels if not re.match(r'#mm-submit-idea(?![\w-])', x)]
    ck(sels and not loose, f'every built style rule ({len(sels)} selectors) is scoped to #mm-submit-idea', loose[:3])

    # ---------- side by side with the standalone page
    bare = page(); bare.goto(SITE + '/bare.html'); bare.wait_for_timeout(300)
    keys0 = set(bare.evaluate('Object.keys(window)')); site0 = bare.evaluate(STYLES_JS, [SITE_ELS, PROPS])
    kids0 = bare.evaluate("() => [...document.body.children].map(e => e.id || e.tagName).join(',')"); bare.close()
    pg = page(); ready(pg, SITE + '/?from=menu')
    ck(set(pg.evaluate('Object.keys(window)')) - keys0 <= {'MISMO_SUBMIT_IDEA'}, 'no new global name but MISMO_SUBMIT_IDEA', sorted(set(pg.evaluate('Object.keys(window)')) - keys0))
    ck(pg.evaluate("$() === 'the website\u2019s jQuery' && $.fn.jquery === '3.6.0'"), 'the website\u2019s $ is untouched')
    ck(pg.evaluate(STYLES_JS, [SITE_ELS, PROPS]) == site0, 'the website\u2019s header, menu, footer, Ask MISMO and page keep exactly the styles they had without the form')
    bad = pg.evaluate("() => [...document.querySelectorAll('#mm-submit-idea [id]')].map(e => e.id).filter(i => !i.startsWith('si-'))")
    ck(not bad, 'every element id inside the form starts si-', bad[:5])
    outside = pg.evaluate("() => [...document.body.children].map(e => e.id || e.tagName).join(',')")
    ck(outside == kids0 + ',SCRIPT,SCRIPT', 'nothing is added to the page outside the form\u2019s box', [kids0, outside])
    ck(pg.evaluate("[...document.querySelectorAll('head [data-mm-submit-idea]')].map(e => e.tagName).sort().join()") == 'LINK,SCRIPT', '...apart from its one stylesheet and one script, in the head')
    ck(pg.evaluate("getComputedStyle(document.getElementById('mm-submit-idea')).fontFamily === getComputedStyle(document.body).fontFamily") and not [u for u in pg.reqs if 'fonts.g' in u],
       'the form uses the website\u2019s font and loads none of its own')
    ck(not pg.evaluate("!!document.querySelector('#mm-submit-idea .mm-header, #mm-submit-idea .mm-footer')"), 'embedded, the form draws no header or footer')
    hidden = pg.evaluate("() => [...document.querySelectorAll('#mm-submit-idea [hidden]')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.id)")
    ck(not hidden, 'everything marked hidden stays hidden (the Other field, the thank-you, the messages)', hidden)

    st = page(); ready(st, FORM + '/index.html')
    ck(st.evaluate("!!document.querySelector('.mm-header') && !!document.querySelector('.mm-footer')"), 'standalone, it still draws its own copy of the website header and footer')
    pg.add_style_tag(content='#ask-mismo{visibility:hidden}')
    def shot(q, sel, h=700):
        q.evaluate("([s]) => { const r = document.querySelector(s).getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.top - 200); }", [sel]); q.wait_for_timeout(250)
        r = q.evaluate("([s]) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }", [sel])
        return q.screenshot(clip={'x': r[0], 'y': r[1], 'width': r[2], 'height': min(h, r[3])})
    pg.add_style_tag(content='#site-header,#site-title{display:none}'); st.add_style_tag(content='.mm-header{display:none}')
    def hero(q):
        q.evaluate('window.scrollTo(0, 0)'); q.wait_for_timeout(200)
        r = q.evaluate("() => { const r = document.querySelector('#mm-submit-idea main > div').getBoundingClientRect(); return [r.top, r.width, r.height]; }")
        return Image.open(io.BytesIO(q.screenshot(clip={'x': 0, 'y': r[0], 'width': r[1], 'height': r[2]}))).convert('RGB')
    a, b = hero(pg), hero(st)
    d = ImageChops.difference(a, b).convert('L').tobytes() if a.size == b.size else b'\xff'
    ck(max(d) <= 16 and sum(1 for v in d if v > 4) / len(d) < 0.005, 'the hero looks as on the standalone page, despite the website\u2019s own styles (only the art\u2019s dither differs)', [max(d)])
    # (both headers stay set aside for these pictures too, so the form sits at exactly the same height on both pages)
    r = same(shot(pg, '#si-tell', 1600), shot(st, '#si-tell', 1600)); ck(r is True, 'the form looks exactly as on the standalone page, despite the website\u2019s own styles', r)
    for q in (pg, st): q.click('#si-who [data-who=""]'); q.wait_for_timeout(200)
    r = same(shot(pg, '#si-form', 1600), shot(st, '#si-form', 1600)); ck(r is True, '...and with Other chosen, its field showing', r)
    for q in (pg, st): q.evaluate("document.querySelectorAll('style').forEach(s => { if(/display:none\\}$/.test(s.textContent) && /header/.test(s.textContent)) s.remove(); })")
    pg.click('#si-who [data-who=""]'); pg.wait_for_timeout(100)   # Other off again
    st.close()

    # ---------- Share Your Idea, and links to the form
    pg.evaluate('window.scrollTo(0, 0)'); pg.wait_for_timeout(200); pg.click('a[href="#si-tell"]'); pg.wait_for_timeout(1200)
    ck(abs(top_of(pg, '#si-tell') - (hdr(pg) + 20)) <= 2 and pg.evaluate('location.hash') == '', 'Share Your Idea scrolls the form to 20 pixels below the website\u2019s header, and leaves the address alone',
       [top_of(pg, '#si-tell'), hdr(pg), pg.evaluate('location.hash')])
    pg.close()
    pg = page(); ready(pg, SITE + '/#tell'); pg.wait_for_timeout(400)
    ck(abs(top_of(pg, '#si-tell') - (hdr(pg) + 20)) <= 2, 'an old link ending #tell still lands on the form, below the header', [top_of(pg, '#si-tell'), hdr(pg)])

    # ---------- sending
    pg.click('#si-go'); pg.wait_for_timeout(700)
    first = pg.evaluate("document.activeElement.id")
    ck(first == 'si-title' and top_of(pg, '#si-title') >= hdr(pg) + 19 and pg.evaluate("!document.getElementById('si-msg').hidden"),
       'sending it empty lists what to finish and puts you on the first field, clear of the header', [first, top_of(pg, '#si-title'), hdr(pg)])
    pg.fill('#si-title', 'Flood and climate risk data'); pg.fill('#si-idea', 'A shared set of MISMO data points for flood and climate risk, carried with the loan file.')
    pg.fill('#si-why', 'Investors have begun asking for it at delivery.'); pg.click('#si-who [data-who="Lenders"]')
    pg.fill('#si-name', 'Dana Whitfield'); pg.fill('#si-company', 'Northbridge Mortgage'); pg.fill('#si-email', 'dana@northbridge.example')
    pg.set_input_files('#si-files', files=[{'name': 'note.pdf', 'mimeType': 'application/pdf', 'buffer': PDF}]); pg.wait_for_timeout(200)
    pg.click('#si-go'); pg.wait_for_timeout(1500)
    urls = [s['url'].rsplit('/', 2)[-2] + '/' + s['url'].rsplit('/', 1)[-1] for s in pg.sent]
    ck(urls == ['ideas/submit', 'ideas/attach'] and all(s['origin'] == SITE for s in pg.sent),
       'it sends the idea and then its file to the same relay addresses as today, from the website\u2019s own address (what relay request 11 allows)', pg.sent)
    ck('IDEA-0042' in pg.evaluate("document.getElementById('si-sum').textContent") and pg.evaluate("!document.getElementById('si-done').hidden && document.getElementById('si-form').hidden")
       and pg.evaluate("document.activeElement.id") == 'si-thanks' and top_of(pg, '#si-thanks') >= hdr(pg) + 19,
       '...then thanks you, with the reference and the attachment, clear of the header', [pg.evaluate("document.activeElement.id"), top_of(pg, '#si-thanks')])

    # ---------- Talk to Us First, and the website's menu
    pg.click('#si-again'); pg.wait_for_timeout(300); pg.evaluate('window.scrollTo(0, 0)'); pg.wait_for_timeout(200)
    pg.click('#si-talk'); pg.wait_for_timeout(300)
    over = pg.evaluate("() => { const d = document.getElementById('si-talkd'), r = d.getBoundingClientRect(); const e = document.elementFromPoint(r.left + 20, r.top + 20); return [d.open, !!(e && d.contains(e)), getComputedStyle(d).borderTopColor]; }")
    ck(over[0] and over[1] and over[2] != 'rgb(255, 0, 0)', 'Talk to Us First opens over everything, in its own style', over)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    pg.hover('#site-menu-link'); pg.wait_for_timeout(200)
    hit = pg.evaluate("() => { const r = document.querySelector('#site-menu li:last-child a').getBoundingClientRect(); const e = document.elementFromPoint(r.left + 20, r.top + r.height / 2); return e && e.closest('#site-menu') ? 'menu' : (e && (e.id || e.className)); }")
    ck(hit == 'menu', 'the website\u2019s menu opens over the form', hit)
    ck(not pg.errs, 'no errors in the browser console', pg.errs[:3]); pg.close()

    # ---------- phone
    pg = page(390, 844); ready(pg, SITE + '/')
    ck(pg.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), 'at 390 pixels wide nothing scrolls sideways', pg.evaluate('[document.documentElement.scrollWidth, document.documentElement.clientWidth]'))
    ck(not pg.errs, '...and no errors', pg.errs[:3]); pg.close()

    # ---------- how it loads
    pg = page(); ready(pg, SITE + '/auto.html')
    ck(pg.evaluate("document.querySelectorAll('#si-form').length") == 1 and pg.evaluate("MISMO_SUBMIT_IDEA.version && MISMO_SUBMIT_IDEA.version.js") == json.load(open(os.path.join(APP, 'version.json')))['js'],
       'with no options set, it mounts itself on #mm-submit-idea, once, and says which version it loaded')
    pg.evaluate("MISMO_SUBMIT_IDEA.mount(document.getElementById('mm-submit-idea'), {})"); pg.wait_for_timeout(200)
    ck(pg.evaluate("document.querySelectorAll('#si-form').length") == 1, 'mounting again changes nothing'); pg.close()
    pg = page(); n = {'v': 0}
    def ver(r):
        n['v'] += 1
        if n['v'] == 1: r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body='{"js":"app-0000000000.js","css":"app-0000000000.css","published":"2026-11-12"}')
        else: r.continue_()
    pg.route('**/version.json*', ver); ready(pg, SITE + '/')
    ck(n['v'] == 2, 'just after a publish, a page that finds its app files gone asks for the current ones and loads', n); pg.close()
    br.close()

print(f'{len(fails)} failed' if fails else '0 failed'); sys.exit(1 if fails else 0)
