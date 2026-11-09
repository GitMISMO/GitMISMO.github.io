import json, threading, http.server, functools, base64
from playwright.sync_api import sync_playwright
# The CMSP and AMSP applications (Perry, 9 Nov 2026): carried-over points, the Champion panel, the reference tick,
# comps wording, the new Boot Camp choice, light by default. Run: python3 _internal/check-cert-forms.py
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8798), functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
fails = []
def fill(pg, k, v):
    pg.evaluate("([k, v]) => { const e = document.querySelector('[data-k=\"' + k + '\"]'); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }", [k, v])
def ck(c, m, d=None): print(('PASS ' if c else 'FAIL ') + m + ('' if c or d is None else '  ' + str(d)[:260])); (None if c else fails.append(m))
pts = {'v': 1, 'kind': 'Initial certification', 'rows': {'education': [{'c': 'Completed the MISMO Boot Camp Course — 50 points', 'w': 'MISMO Boot Camp, March 2025', 'd': '2025-03-12'},
       {'c': 'Attended a MISMO Monthly Webinar — 2 points per webinar', 'w': 'MISMO Webinar: Data Quality', 'd': '2025-06-04'}],
       'participation': [{'c': 'MISMO Summit Attendance — 4 points per Summit', 'w': 'MISMO Fall Summit 2026', 'd': '2026-09-15'},
       {'c': 'Workgroup Attendance (at Least 33% of Meetings) — 3 points per workgroup per year', 'w': 'Loan Boarding workgroup (2025, Past 12 Months)', 'd': '2026-11-09', 'u': 2}]}}
frag = base64.urlsafe_b64encode(json.dumps(pts).encode()).decode().rstrip('=')
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1280, 'height': 900}, color_scheme='dark'); pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:8798/forms/cmsp/#pts=' + frag); pg.wait_for_timeout(1200)
    ck(pg.evaluate("document.documentElement.getAttribute('data-theme') !== 'dark'"), 'CMSP form: light, even with the computer in dark mode')
    ck('We added 4 activities from your points calculator' in pg.inner_text('body'), 'the calculator’s activities arrive, with a note saying so')
    ed = pg.eval_on_selector_all('[data-arow="education"][data-c="what"]', 'e => e.map(x => x.value)'); pa = pg.eval_on_selector_all('[data-arow="participation"][data-c="what"]', 'e => e.map(x => x.value)')
    ck(ed == ['MISMO Boot Camp, March 2025', 'MISMO Webinar: Data Quality'] and pa[:2] == ['MISMO Fall Summit 2026', 'Loan Boarding workgroup (2025, Past 12 Months)'], '...as education and participation rows', (ed, pa))
    ck(pg.eval_on_selector('[data-arow="participation"][data-c="units"][data-i="1"]', 'e => e.value') == '2', '...a workgroup with two years counts twice')
    ck(pg.evaluate('location.hash') == '', '...and the address bar drops them once read')
    ck('Digital Closing & eMortgage Boot Camp' not in pg.content(), 'the Digital Closing & eMortgage Boot Camp is not a separate 3-point choice')
    TX = lambda: pg.evaluate('document.body.textContent')
    ck('Have They Agreed to Be Your Reference?' in TX(), 'the reference section asks if they’ve agreed')
    ck('Use One of Its Comps?' in TX() and 'Complimentary Places' not in TX(), 'comps, not places')
    fill(pg, 'email', 'someone@alpha7x.com'); pg.wait_for_timeout(500)
    box = pg.evaluate("(document.getElementById('champBox') || {}).textContent || ''")
    ck('Alpha7X is a MISMO Champion member' in box and '3 of 3 comps left for 2026' in box and 'Lynn Calahan' in box, 'a Champion’s email shows its level, comps left and primary contact', box[:200])
    ck(pg.evaluate("document.querySelector('[data-k=\"championComp\"][value=\"Yes\"]').checked"), '...and ticks “use one” for them')
    fill(pg, 'email', 'someone@1781lending.com'); pg.wait_for_timeout(300)
    ck('is a MISMO Corporate member' in pg.evaluate("document.getElementById('champBox').textContent"), 'a Corporate member is called that, not a Champion')
    fill(pg, 'email', 'someone@gmail.com'); fill(pg, 'org', 'Nobody Lending'); pg.wait_for_timeout(300)
    ck(pg.evaluate("document.getElementById('champBox').hidden"), 'no match: no panel')
    pg.goto('http://127.0.0.1:8798/forms/amsp/'); pg.wait_for_timeout(1000)
    ck('Digital Closing & eMortgage Boot Camp' not in pg.content() and 'Use One of Its Comps?' in TX(), 'AMSP form: comps wording too, and no 3-point Digital Closing & eMortgage choice')
    fill(pg, 'email', 'x@alpha7x.com'); pg.wait_for_timeout(400)
    ck('Alpha7X is a MISMO Champion member' in pg.evaluate("document.getElementById('champBox').textContent"), '...and the Champion panel')
    ck(not errs, 'no page errors ' + '; '.join(errs[:2])); b.close()
srv.shutdown(); print(len(fails), 'failed')
