import json, threading, http.server, functools, os, shutil
from playwright.sync_api import sync_playwright
# The points calculator page (Perry, 9 Nov 2026). Run: python3 _internal/check-points-page.py LINK.json
# (LINK.json: {"link": a personal link from cms-data's tools/checks/check-points-job.py}.)
import sys
SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); W = '/tmp/ptspage'
shutil.rmtree(W, ignore_errors=True); os.makedirs(W + '/forms/points')
s = open(SRC + '/forms/points/index.html', encoding='utf-8').read()
open(W + '/forms/points/index.html', 'w', encoding='utf-8').write(s)                                    # as it ships: no flow yet
open(W + '/forms/points/flow.html', 'w', encoding='utf-8').write(s.replace("var FLOW_ENDPOINT = '';", "var FLOW_ENDPOINT = 'https://flow.test/points';"))
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8797), functools.partial(http.server.SimpleHTTPRequestHandler, directory=W)); threading.Thread(target=srv.serve_forever, daemon=True).start()
LINK = json.load(open(sys.argv[1]))['link'].split('#', 1)[1]
fails = []
def ck(c, m, d=None): print(('PASS ' if c else 'FAIL ') + m + ('' if c or d is None else '  ' + str(d)[:250])); (None if c else fails.append(m))
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1280, 'height': 900}, color_scheme='dark'); pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:8797/forms/points/index.html'); pg.wait_for_timeout(400)
    ck(pg.evaluate("document.documentElement.getAttribute('data-theme') !== 'dark'") and pg.inner_text('#theme-btn') == 'Dark', 'light by default, even with the computer in dark mode')
    pg.fill('#email', 'jordan.sample@example.com'); pg.click('#send1'); pg.wait_for_timeout(200)
    ck('isn’t open yet' in pg.inner_text('#e1'), 'until the flow is set up, step 1 says the calculator isn’t open yet')
    got = []
    pg.route('https://flow.test/points', lambda r: (got.append(json.loads(r.request.post_data)), r.fulfill(status=202, body='{}')))
    pg.goto('http://127.0.0.1:8797/forms/points/flow.html'); pg.wait_for_timeout(300)
    pg.fill('#email', 'Jordan.Sample@Example.com '); pg.click('#oldbox summary'); pg.fill('#oldin', 'j.sample@oldco.com, not-an-email, jordan.sample@example.com'); pg.click('#send1'); pg.wait_for_timeout(400)
    ck(got == [{'email': 'jordan.sample@example.com', 'old': 'j.sample@oldco.com'}], 'it sends the email and any real old ones to the flow (not the bad one, not the same one again)', got)
    ck(pg.is_visible('#v2') and 'j•••@example.com' in pg.inner_text('#v2'), 'then: Check Your Inbox, with the address masked')
    pg.goto('http://127.0.0.1:8797/forms/points/index.html#' + LINK); pg.wait_for_timeout(500)
    ck(pg.is_visible('#v3') and pg.inner_text('#hello').startswith('Your Points'), 'the emailed link opens straight onto the person’s points')
    for sc in ['cmsp-new', 'cmsp-ren', 'amsp-ren']:
        pg.click(f'.seg [data-s="{sc}"]'); pg.wait_for_timeout(150)
        ck(len(pg.query_selector_all('#sel .row')) > 0 and pg.inner_text('#banner').strip() != '', f'{sc}: a banner, the meters and what to submit')
    with ctx.expect_page() as np: pg.click('#go')
    ck(np.value.url.endswith('/forms/renewal/'), 'the button opens the renewal form in a new tab', np.value.url)
    pg.click('#askold'); pg.wait_for_timeout(200)
    ck(pg.is_visible('#v1') and pg.evaluate("document.getElementById('oldbox').open") and pg.evaluate('location.hash') == '', 'Ask Again with an Old Email goes back to step 1 with the old-email box open, and drops the link from the address bar')
    pg.set_viewport_size({'width': 390, 'height': 844}); pg.goto('http://127.0.0.1:8797/forms/points/index.html#' + LINK); pg.wait_for_timeout(400)
    ck(pg.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'phone width: nothing scrolls sideways')
    pg.goto('http://127.0.0.1:8797/forms/points/index.html#d=not-real'); pg.wait_for_timeout(300)
    ck(pg.is_visible('#v1'), 'a broken link falls back to step 1')
    ck(not errs, 'no page errors ' + '; '.join(errs[:2])); b.close()
srv.shutdown(); print(len(fails), 'failed')
