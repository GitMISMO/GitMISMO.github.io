import html as _h
e = lambda s: _h.escape(s, quote=True)
R = 'https://resources.mismo.org'; W = 'https://collaborate.mismo.org/mismowebsite'; IC = W + '/standards-resources/certification/individual-certifications'
CSS = """
<style>
.mpath{--ink:#0d314c;--text:#44607a;--blue:#1a8fe3;--blue-ink:#1a74b8;--line:#cfdeeb;--tint:#e3f1fc;color:var(--ink);font-family:inherit;font-size:16px;line-height:1.6;max-width:1120px}
.mpath *{box-sizing:border-box}
.mpath .ey{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--blue)}
.mpath h2.t{font-size:38px;line-height:1.2;margin:6px 0 0;font-weight:700;color:var(--ink)}
.mpath .rule{width:76px;height:4px;border-radius:2px;background:linear-gradient(90deg,#1a8fe3,#74bfeb);margin:14px 0 18px}
.mpath .lede{color:var(--text);font-size:17px;max-width:780px;margin:0}
.mpath input.tb{position:absolute;opacity:0;pointer-events:none}
.mpath .tabs{display:inline-flex;gap:4px;background:#eef5fb;border:1px solid var(--line);border-radius:8px;padding:4px;margin:22px 0 8px}
.mpath .tabs label{padding:8px 18px;border-radius:6px;white-space:nowrap;font-weight:600;font-size:14.5px;color:var(--text);cursor:pointer}
.mpath #mp-a:checked ~ .tabs label[for=mp-a],.mpath #mp-b:checked ~ .tabs label[for=mp-b]{background:var(--ink);color:#fff}
.mpath #mp-a:focus-visible ~ .tabs label[for=mp-a],.mpath #mp-b:focus-visible ~ .tabs label[for=mp-b]{outline:2px solid #74bfeb;outline-offset:2px}
.mpath .panel{display:none} .mpath #mp-a:checked ~ .pa,.mpath #mp-b:checked ~ .pb{display:block}
.mpath .path{margin:22px 0 0 22px;border-left:3px solid var(--line)}
.mpath .st{position:relative;padding:0 0 22px 42px}
.mpath .st .n{position:absolute;left:-23px;top:0;width:42px;height:42px;border-radius:50%;background:var(--tint);color:var(--blue-ink);font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 0 0 1px var(--line)}
.mpath .st.us .n{background:var(--ink);color:#fff}
.mpath .st h3{font-size:18px;margin:0;font-weight:700;color:var(--ink)}
.mpath .who{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border-radius:4px;padding:2px 8px;margin-left:10px;vertical-align:3px;background:var(--tint);color:var(--blue-ink)}
.mpath .st.us .who{background:var(--ink);color:#fff}
.mpath .st p{margin:6px 0 0;color:var(--text);max-width:860px}
.mpath .term{border-bottom:2px dotted var(--blue);color:var(--ink);font-weight:600;cursor:help;position:relative;outline:none}
.mpath .term .tip{display:none;position:absolute;left:0;top:calc(100% + 10px);z-index:20;width:min(320px,80vw);background:var(--ink);color:#fff;border-radius:12px;padding:14px 16px;font-weight:400;font-size:14.5px;line-height:1.5;box-shadow:0 18px 40px -16px rgba(7,29,46,.6)}
.mpath .term .tip b{color:#74bfeb;display:block;margin-bottom:4px} .mpath .term .tip a{color:#a9d8f3;font-weight:700}
.mpath .term:hover .tip,.mpath .term:focus .tip,.mpath .term:focus-within .tip{display:block}
.mpath .prices{margin-top:12px;border:1px solid var(--line);border-radius:12px;overflow:hidden;max-width:720px}
.mpath .prices table{width:100%;border-collapse:collapse;font-size:15px}
.mpath .prices th{background:#f3f8fc;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text);text-align:left;padding:10px 14px}
.mpath .prices td{padding:10px 14px;border-top:1px solid #e2ecf5;color:var(--ink)} .mpath .prices td:first-child{font-weight:600} .mpath .prices tr.comp td{background:#f1f8fe}
.mpath .ready{margin-top:26px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(180deg,#f8fbfe,#eef5fb);padding:24px 26px}
.mpath .ready h3{font-size:22px;margin:0;color:var(--ink)} .mpath .ready .sub2{color:var(--text);margin:4px 0 16px}
.mpath .two{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.mpath a.go{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 18px;text-decoration:none;color:var(--ink)}
.mpath a.go:hover{border-color:var(--blue);box-shadow:0 8px 22px -16px rgba(26,143,227,.8)}
.mpath a.go .gn{width:38px;height:38px;border-radius:50%;background:var(--blue);color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.mpath a.go b{display:block;font-size:16.5px} .mpath a.go small{color:var(--text);font-size:14px} .mpath a.go .ar{margin-left:auto;color:var(--blue);font-weight:800;font-size:20px}
.mpath .more{display:flex;gap:22px;flex-wrap:wrap;margin-top:16px;padding-top:14px;border-top:1px solid #d9e6f1;font-size:15px}
.mpath .more a{color:var(--blue);font-weight:600;text-decoration:none} .mpath .more .q{margin-left:auto;color:var(--text)}
.mpath .call{margin-top:18px;background:var(--tint);border-left:4px solid var(--blue);border-radius:6px;padding:14px 18px;color:var(--ink)}
@media (max-width:760px){ .mpath .term{position:static} .mpath .term .tip{left:42px;right:0;width:auto;top:auto;margin-top:6px} .mpath .term .tip::before{display:none} .mpath h2.t{font-size:30px} .mpath .two{grid-template-columns:1fr} .mpath .more .q{margin-left:0} .mpath .prices{overflow-x:auto} }
</style>"""
def step(n, title, us, text, extra=''):
    return (f'<div class="st{" us" if us else ""}"><span class="n">{n}</span><h3>{e(title)}<span class="who">{"MISMO" if us else "You"}</span></h3>'
            f'<p>{text}</p>{extra}</div>')
def prices(rows):
    return ('<div class="prices"><table><thead><tr><th></th><th>MISMO Member</th><th>Non-Member</th></tr></thead><tbody>'
            + ''.join(f'<tr{" class=comp" if c else ""}><td>{e(a)}</td><td>{e(m)}</td><td>{e(n)}</td></tr>' for a, m, n, c in rows) + '</tbody></table></div>')
def ready(sub, a, b, links):
    go = lambda i, t, s, h: f'<a class="go" href="{h}"><span class="gn">{i}</span><span><b>{e(t)}</b><small>{e(s)}</small></span><span class="ar" aria-hidden="true">→</span></a>'
    return (f'<div class="ready"><h3>Ready to Start?</h3><p class="sub2">{e(sub)}</p><div class="two">{go(1, *a)}{go(2, *b)}</div><div class="more">'
            + ''.join(f'<a href="{h}">{e(t)}</a>' for t, h in links) + '<span class="q">Questions: <a href="mailto:certifications@mismo.org">certifications@mismo.org</a></span></div></div>')
COMP = 'If your company is a MISMO Champion member, it gets a set number of complimentary enrollments (comps) each year, and you can use one. After we verify your application, we apply the comp and let your company’s primary contact know; otherwise we email you how to pay.'
LT = ('<span class="term" tabindex="0">MISMO’s Leadership Team<span class="tip" role="tooltip"><b>MISMO’s Leadership Team</b>The people who lead MISMO’s work: the chairs and vice chairs of its communities of practice, '
      'workgroups and councils, and MISMO’s Board. Any of them can be your reference. Not sure who to ask? <a href="mailto:certifications@mismo.org">Email us</a>.</span></span>')
def section(ey, title, lede, a_label, b_label, pa, pb):
    return (CSS + f'\n<div class="mpath" id="steps"><div class="ey">{e(ey)}</div><h2 class="t">{e(title)}</h2><div class="rule"></div><p class="lede">{lede}</p>'
            f'<input class="tb" type="radio" name="mp-tab" id="mp-a" checked><input class="tb" type="radio" name="mp-tab" id="mp-b">'
            f'<div class="tabs"><label for="mp-a">{e(a_label)}</label><label for="mp-b">{e(b_label)}</label></div>'
            f'<div class="panel pa">{pa}</div><div class="panel pb">{pb}</div></div>\n')
cmsp_a = ('<div class="path">'
  + step(1, 'Check Your Points', False, 'You need 100 points, at least 25 of them participation. Our points calculator adds up what MISMO already has on record for you, and emails you a link to your total.')
  + step(2, 'Line Up Your Reference', False, f'Ask someone on {LT} whether they’ll be your reference. You’ll add their name and email to your application, and we send them the short form ourselves.')
  + step(3, 'Apply', False, 'Your points carry over from the calculator. Add your reference, and if your company is a MISMO Champion member, you’ll see how many comps it has left. Your application saves as you go.')
  + step(4, 'We Verify', True, 'We confirm your points and your reference. Points from MISMO’s own records are already checked, so this is quick.')
  + step(5, 'Enroll in the Program', True, 'Enrollment includes the CMSP exam. ' + COMP,
         prices([('CMSP, with the exam', '$500', '$900', False), ('CMSP for current AMSPs, with the exam', '$400', '$800', False), ('With your company’s Champion comp', '$0', '$0', True)]))
  + step(6, 'Take the Exam', False, 'Once you’re enrolled, we open the exam in TopClass and email you how to get in. 150 minutes, open book; 75% or higher passes. If you don’t pass, you have 10 days to take a second exam; after that there’s a six-month wait, and each re-test is $100 for members, $300 for non-members.')
  + step(7, 'Get Certified', True, 'When your pass is recorded, your certificate arrives by email and you’re listed among current CMSPs. We remind you before it’s time to renew.')
  + '</div>' + ready('Two things to do now; MISMO emails you at every step after that.', ('Check My Points', 'Find out if you have the 100 you need', R + '/forms/points/?for=cmsp-new'),
                     ('Start My Application', 'Once you have your points and your reference', R + '/forms/cmsp/?kind=new'), [('CMSP Exam Study Guide', IC + '/cmsp-exam-study'), ('Current CMSPs', IC + '/current-cmsps')]))
cmsp_b = ('<div class="path">'
  + step(1, 'Check Your Points', False, 'Renewing takes 25 points from the last two years, at least 15 of them participation. The calculator adds up what MISMO has on record. Renew within a year of your expiration date, or you’ll need to start again, exam included.')
  + step(2, 'Renew', False, 'Your points carry over from the calculator. If your company is a MISMO Champion member, you’ll see how many comps it has left.')
  + step(3, 'We Verify', True, 'We confirm your points. Points from MISMO’s own records are already checked, so this is quick.')
  + step(4, 'Your Renewal Fee, or a Comp', True, 'If your company has a comp left, we apply it and let its primary contact know; otherwise we email you how to pay.',
         prices([('CMSP renewal', '$100', '$200', False), ('With your company’s Champion comp', '$0', '$0', True)]))
  + step(5, 'Renewed', True, 'Your new certificate arrives by email, valid for two more years, and you stay listed among current CMSPs.')
  + '</div>' + ready('We remind you by email before your CMSP is due, with a link to renew.', ('Check My Points', 'Find out if you have the 25 you need', R + '/forms/points/?for=cmsp-ren'),
                     ('Start My Renewal', 'Once you have your points', R + '/forms/cmsp/?kind=renew'), [('CMSP Exam Study Guide', IC + '/cmsp-exam-study'), ('Current CMSPs', IC + '/current-cmsps')]))
amsp_a = ('<div class="path">'
  + step(1, 'Pass the MISMO Boot Camp Exam', False, 'Take MISMO Boot Camp and pass its exam. Keep your proof of passing; you’ll attach it to your application.')
  + step(2, 'Apply', False, 'Attach your Boot Camp exam result, and if your company is a MISMO Champion member, you’ll see how many comps it has left.')
  + step(3, 'We Verify', True, 'We confirm your Boot Camp exam.')
  + step(4, 'Enroll in the Program', True, COMP, prices([('AMSP', '$200', '$400', False), ('With your company’s Champion comp', '$0', '$0', True)]))
  + step(5, 'Get Certified', True, 'Your certificate arrives by email and you’re listed among current AMSPs. We remind you before it’s time to renew.')
  + '</div>' + ready('Two things to do; MISMO emails you at every step after that.', ('About MISMO Boot Camp', 'Where the AMSP starts', W + '/events/boot-camp'),
                     ('Start My Application', 'Once you’ve passed the Boot Camp exam', R + '/forms/amsp/?kind=new'), [('Current AMSPs', IC + '/current-amsps'), ('Thinking of the CMSP?', IC + '/cmsp')]))
amsp_b = ('<div class="path">'
  + step(1, 'Check Your Points', False, 'Renewing takes 10 participation points from the last two years. The calculator adds up what MISMO has on record. Renew within a year of your expiration date, or you’ll need to start again.')
  + step(2, 'Renew', False, 'Your points carry over from the calculator. If your company is a MISMO Champion member, you’ll see how many comps it has left.')
  + step(3, 'We Verify', True, 'We confirm your points.')
  + step(4, 'Your Renewal Fee, or a Comp', True, 'If your company has a comp left, we apply it and let its primary contact know; otherwise we email you how to pay.',
         prices([('AMSP renewal', '$75', '$150', False), ('With your company’s Champion comp', '$0', '$0', True)]))
  + step(5, 'Renewed', True, 'Your new certificate arrives by email, valid for two more years, and you stay listed among current AMSPs.')
  + '</div>' + ready('We remind you by email before your AMSP is due, with a link to renew.', ('Check My Points', 'Find out if you have the 10 you need', R + '/forms/points/?for=amsp-ren'),
                     ('Start My Renewal', 'Once you have your points', R + '/forms/amsp/?kind=renew'), [('Current AMSPs', IC + '/current-amsps')]))
cm = section('Certified MISMO Standards Professional', 'Your Path to CMSP', 'Seven steps, in order. You do four of them; MISMO does the rest and emails you at each one.', 'Become a CMSP', 'Renew My CMSP', cmsp_a, cmsp_b)
am = section('Associate MISMO Standards Professional', 'Your Path to AMSP', 'A shorter path: no reference and no separate exam. Passing the MISMO Boot Camp exam is the proof.', 'Become an AMSP', 'Renew My AMSP', amsp_a, amsp_b)
import os
O = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'website-sections') + '/'
open(O + 'cmsp-path-section.html', 'w', encoding='utf-8').write(cm)
open(O + 'amsp-path-section.html', 'w', encoding='utf-8').write(am)
prev = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CMSP &amp; AMSP Path Sections (Preview)</title>'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&amp;display=swap"><style>body{margin:0;font-family:"IBM Plex Sans",sans-serif;background:#fff} '
        '.nav{height:64px;background:#071d2e;color:#fff;display:flex;align-items:center;padding:0 40px;font-weight:800;font-size:24px} .nav b{color:#74bfeb} .wrap{max-width:1120px;margin:0 auto;padding:40px 24px 70px} '
        '.sep{margin:70px 0 0;border-top:1px dashed #cfdeeb;padding-top:12px;color:#6c899f;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}</style></head><body>'
        '<div class="nav">MI<b>S</b>MO</div><div class="wrap">' + cm.replace('mp-a', 'mpc-a').replace('mp-b', 'mpc-b').replace('name="mp-tab"', 'name="mpc-tab"')
        + '<div class="sep">The AMSP page</div>' + am + '</div></body></html>')
# both sections on one preview page need their own tab names; keep the CSS selectors in step
prev = prev.replace('#mp-a:checked', '#mpc-a:checked', 0)
open(O + 'preview.html', 'w', encoding='utf-8').write(prev)
print('sections written')

# ---------- the rest of the CMSP page (Perry, 9 Nov 2026): What Counts for Points (updated) and the call to action (new) ----------
PCSS = """
<style>
.mpts{--ink:#0d314c;--text:#44607a;--blue:#1a8fe3;--line:#cfdeeb;color:var(--ink);font-family:inherit;font-size:16px;line-height:1.6;max-width:1120px}
.mpts *{box-sizing:border-box} .mpts .ey{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--blue)}
.mpts h2{font-size:38px;line-height:1.2;margin:6px 0 0;font-weight:700;color:var(--ink)} .mpts .rule{width:76px;height:4px;border-radius:2px;background:linear-gradient(90deg,#1a8fe3,#74bfeb);margin:14px 0 18px}
.mpts .cols{display:grid;grid-template-columns:1.25fr 1fr;gap:24px;align-items:start}
.mpts .box{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff}
.mpts .box h3{margin:0;padding:14px 18px;font-size:17px;background:#f3f8fc;border-bottom:1px solid var(--line)} .mpts .box h3 small{display:block;font-weight:400;color:var(--text);font-size:14px;margin-top:2px}
.mpts .r{display:grid;grid-template-columns:52px 1fr;gap:12px;align-items:center;padding:10px 18px;border-top:1px solid #eef3f8} .mpts .r:first-of-type{border-top:0}
.mpts .r b{font-size:20px;color:#1a74b8;text-align:center} .mpts .r span{color:var(--ink);font-size:15px} 
.mpts .calc{margin-top:16px;border:1px solid #9fd0f3;background:#f1f8fe;border-radius:12px;padding:16px 18px;display:flex;gap:14px;align-items:center}
.mpts .calc p{margin:0;color:var(--text);font-size:15px} .mpts .calc b{color:var(--ink)} .mpts .calc a{margin-left:auto;white-space:nowrap;min-width:max-content;display:inline-block;padding:14px 22px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;box-sizing:border-box;background:linear-gradient(180deg,#2e9dee 0%,#1a8fe3 100%);border:1.5px solid #1a8fe3;box-shadow:0 5px 16px -4px rgba(26,143,227,.55);color:#fff}
.mcta{background:#071d2e;color:#fff;border-radius:18px;padding:34px 36px;display:flex;gap:28px;align-items:center;flex-wrap:wrap;font-family:inherit;max-width:1120px}
.mcta h2{margin:0;font-size:30px;color:#fff} .mcta p{margin:6px 0 0;color:#a9d8f3;font-size:16px;max-width:560px}
.mcta .b{margin-left:auto;display:flex;gap:12px;flex-wrap:wrap} .mcta a{white-space:nowrap;min-width:max-content;display:inline-block;padding:14px 22px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;box-sizing:border-box}
.mcta a.p1{background:linear-gradient(180deg,#2e9dee 0%,#1a8fe3 100%);border:1.5px solid #1a8fe3;box-shadow:0 5px 16px -4px rgba(26,143,227,.55);color:#fff} .mcta a.p2{background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.6);box-shadow:inset 0 1px 0 rgba(255,255,255,.18);color:#fff}
@media (max-width:760px){ .mpts h2{font-size:30px} .mpts .cols{grid-template-columns:1fr} .mpts .calc{flex-wrap:wrap} .mpts .calc a{margin-left:0;width:100%;text-align:center} .mcta .b{margin-left:0;width:100%} .mcta a{width:100%;text-align:center} }
</style>"""
def plist(title, sub, rows):
    return f'<div class="box"><h3>{e(title)}<small>{e(sub)}</small></h3>' + ''.join(f'<div class="r"><b>{n}</b><span>{e(t)}{"<em>New</em>" if new else ""}</span></div>' for n, t, new in rows) + '</div>'
points_html = (PCSS + '\n<div class="mpts" id="points"><div class="ey">Earning Points</div><h2>What Counts for Points</h2><div class="rule"></div><div class="cols">'
  + plist('Participation Points', 'At least 25 of your 100 points, and at least 15 of your 25 renewal points.', [
      (10, 'Board member, Committee / Council / Forum Chair, Workgroup Chair or Vice Chair, per year', False), (5, 'Workgroup representative to IM, the Architecture Workgroup or the Education Council, per year', False),
      (5, 'Developing a MISMO Webinar', False), (5, 'Serving as a MISMO Boot Camp instructor', False), (4, 'MISMO Summit attendance', False),
      (3, 'Workgroup attendance, per workgroup per year, at a third or more of its meetings', False), (3, 'Authoring a published MISMO-related industry article', False),
      (2, 'Serving on a Summit presentation panel', False), (2, 'Serving on an industry panel or presentation on MISMO topics', False), (1, 'Developing a MISMO Short', False), (1, 'Serving as a MISMO Ambassador during a Summit', False)])
  + plist('Education Points', 'Up to 75 of the 100 points needed.', [
      (50, 'Completing the MISMO Boot Camp Course', False), (2, 'Attending each MISMO Monthly Webinar', False)])
  + '</div><div class="calc"><p><b>Rather not add it up?</b> The points calculator finds what MISMO already has on record for you, picks what to submit, and carries it into your application.</p>'
  + f'<a href="{R}/forms/points/?for=cmsp-new">Check My Points&nbsp;&rarr;</a></div></div>\n')
cta_html = (PCSS + f'\n<div class="mcta"><div><h2>Become a CMSP</h2><p>Check your points, line up your reference, and apply. MISMO takes it from there and emails you at every step.</p></div>'
  + f'<div class="b"><a class="p1" href="{R}/forms/points/?for=cmsp-new">Check My Points&nbsp;&rarr;</a><a class="p2" href="{R}/forms/cmsp/?kind=new">Start My Application</a></div></div>\n')
open(O + 'cmsp-points-section.html', 'w', encoding='utf-8').write(points_html)
open(O + 'cmsp-bottom-section.html', 'w', encoding='utf-8').write(cta_html)
# ---------- the opening section (Perry chose Option D, 9 Nov 2026): the statement, then four values ----------
LCSS = """
<style>
.mlead{--ink:#0d314c;--text:#44607a;max-width:1120px;color:var(--ink);font-family:inherit}
.mlead *{box-sizing:border-box}
.mlead h2{margin:0;font-size:50px;font-weight:700;line-height:1.12;letter-spacing:-.015em;color:var(--ink)}
.mlead .stmt{margin:18px 0 0;font-size:24px;line-height:1.5;font-weight:500;color:#2b4a63;max-width:1000px}
.mlead .vals{margin-top:44px;padding-top:40px;border-top:1px solid #cfdeeb;display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:32px}
.mlead .v{display:flex;flex-direction:column;gap:14px}
.mlead .ic{width:52px;height:52px;border-radius:10px;background:#e3f1fc;display:flex;align-items:center;justify-content:center}
.mlead .ic svg{width:28px;height:28px;fill:none;stroke:#1a8fe3;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.mlead h3{margin:0;font-size:20px;font-weight:700;color:var(--ink)}
.mlead p.d{margin:0;font-size:17px;line-height:1.6;color:var(--text)}
@media (max-width:760px){ .mlead h2{font-size:34px} .mlead .stmt{font-size:19px} .mlead .vals{margin-top:32px;padding-top:28px;gap:26px} }
</style>"""
LICON = {
 'badge': '<path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/>',
 'rise': '<path d="M4 17l5-5 4 4 7-7"/><path d="M15 9h5v5"/>',
 'team': '<circle cx="8" cy="9" r="3"/><circle cx="16.5" cy="10" r="2.5"/><path d="M3 19c.8-3 2.8-4.5 5-4.5s4.2 1.5 5 4.5"/><path d="M13.5 18.5c.6-2 2-3 3-3s2.4 1 3 3"/>',
 'star': '<path d="M5 20V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v15l-7-4z"/>'}
LVALS = [('badge', 'Proven Expertise', 'A credential earned through MISMO’s exam and verified participation, recognized across the mortgage industry.'),
         ('rise', 'Career Growth', 'Stand out on implementation, data and technology teams as the person who knows the standards.'),
         ('team', 'Stronger Teams', 'Bring standards know-how in-house, so your organization gets more from MISMO.'),
         ('star', 'Recognition', 'CMSPs are listed on the MISMO website and recognized at MISMO Summits.')]
lead_html = (LCSS + '\n<div class="mlead"><h2>Standards Expertise, Recognized</h2>'
  '<p class="stmt">The CMSP recognizes the professionals who make the mortgage industry’s data work: people who know MISMO standards deeply and help their organizations, and the industry, put them to use.</p>'
  '<div class="vals">' + ''.join(f'<div class="v"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true">{LICON[k]}</svg></div><h3>{e(t)}</h3><p class="d">{e(d)}</p></div>' for k, t, d in LVALS)
  + '</div></div>\n')
open(O + 'cmsp-lead-section.html', 'w', encoding='utf-8').write(lead_html)
# the whole page as it would read, built from the website page template (its header, menus and the Home hero,
# verbatim, with only the words and buttons changed), with what's kept, new and updated marked
import re as _re, os as _os
TPL = open(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'website-sections', 'MISMO-Page-Template.html') if _os.path.exists(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'website-sections', 'MISMO-Page-Template.html')) else '/mnt/user-data/uploads/MISMO-Page-Template__1___1_.html', encoding='utf-8').read()
tcss = _re.search(r'<style>(.*?)</style>', TPL, _re.S).group(1)
h0 = TPL.index('<header class="mm-header"'); h1 = TPL.index('</script>', TPL.index('</header>')) + len('</script>')
header = TPL[h0:h1]
e0 = TPL.index('<!-- ===== HERO'); e1 = TPL.index('-->', TPL.index('<!-- ===== END HERO')) + 3
hero = TPL[e0:e1]
def swap(a, b):
    global hero
    assert hero.count(a) >= 1, a[:60]; hero = hero.replace(a, b, 1)
swap('Shared Standards. A Stronger Tomorrow.', 'Individual Certifications')
swap('Where Our Industry<span', 'Become a<span'); swap('Builds What’s Next</span>', 'CMSP</span>')
swap('MISMO is the shared infrastructure that helps mortgage finance move with greater clarity, consistency, and confidence.', 'MISMO’s designation of excellence for advanced standards expertise.')
swap('By bringing industry participants together around common standards, MISMO helps reduce friction and create a stronger foundation for what comes next.', 'The CMSP is point-based. You need 100 points to sit for the exam, and 25 points every two years to maintain it.')
swap('href="https://collaborate.mismo.org/mismowebsite/membership"', f'href="{R}/forms/points/?for=cmsp-new"'); swap('Explore Membership&nbsp;→', 'Check My Points&nbsp;→')
swap('href="https://collaborate.mismo.org/mismowebsite/about-mismo"', 'href="#steps"'); swap('>Explore MISMO</a>', '>See Your Path&nbsp;→</a>')
_words = iter(['Expertise', 'Standards', 'Leadership', 'Excellence'])   # the CMSP page's own list, in its order
hero = _re.sub(r'(line-height: 2\.15;[^>]*>)(People|Systems|Standards|Progress)(<)', lambda m: m.group(1) + next(_words) + m.group(3), hero)
tag = lambda t, c: f'<div class="tagbar {c}">{t}</div>'
glance = ('<div class="glance"><div><b>100</b><span>Points to sit for the exam</span><small>At least 25 must be participation points. Education points can cover up to 75.</small></div>'
          '<div><b>75%</b><span>Passing score</span><small>The exam is 150 minutes and open book.</small></div><div><b>25</b><span>Points every two years</span><small>To maintain certification, including at least 15 participation points.</small></div></div>')
page = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>The CMSP Page, Reworked (Preview)</title><style>' + tcss
        + ' .wrap{max-width:1120px;margin:0 auto;padding:10px clamp(20px,5vw,48px) 70px} .glance{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}'
        '.glance div{border:1px solid #cfdeeb;border-radius:12px;padding:18px} .glance b{display:block;font-size:34px;color:#1a74b8} .glance span{font-weight:700;color:#0d314c} .glance small{display:block;color:#44607a;font-size:14.5px;margin-top:4px}'
        '.gap{height:56px} .tagbar{display:inline-block;margin:44px 0 12px;font-size:11.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border-radius:4px;padding:4px 10px} .tagbar.k{background:#eef3f8;color:#546f88} .tagbar.n{background:#e3f3ec;color:#0b5c44} .tagbar.u{background:#fdf1d8;color:#8a6412}'
        '@media (max-width:760px){.glance{grid-template-columns:1fr}}</style></head><body>'
        + header + hero + '<div class="wrap"><div style="height:80px"></div>' + lead_html + '<div class="gap"></div>' + glance + '<div class="gap"></div>' + cm + '<div class="gap"></div>' + points_html + '<div class="gap"></div>' + cta_html + '</div></body></html>')
open(O + 'preview-cmsp-page.html', 'w', encoding='utf-8').write(page)
print('cmsp page blocks written')

# ---------- the whole CMSP page body, for one paste into Higher Logic (Perry, 10 Nov 2026) ----------
BCSS = """<style>
.mcms-wrap{max-width:1120px;margin:0 auto;padding:0 clamp(20px,5vw,48px);box-sizing:border-box}
.mcms-gap{height:56px} .mcms-gap.top{height:80px}
.mcms-glance{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;font-family:inherit}
.mcms-glance>div{border:1px solid #cfdeeb;border-radius:12px;padding:18px 20px;background:#fff}
.mcms-glance b{display:block;font-size:34px;line-height:1.2;color:#1a74b8} .mcms-glance span{font-weight:700;color:#0d314c}
.mcms-glance small{display:block;color:#44607a;font-size:14.5px;line-height:1.6;margin-top:4px}
@media (max-width:760px){ .mcms-glance{grid-template-columns:1fr} .mcms-gap{height:40px} .mcms-gap.top{height:48px} }
</style>"""
GL = ('<div class="mcms-glance"><div><b>100</b><span>Points to Sit for the Exam</span><small>At least 25 must be participation points. Education points can cover up to 75.</small></div>'
      '<div><b>75%</b><span>Passing Score</span><small>The exam is 150 minutes and open book.</small></div>'
      '<div><b>25</b><span>Points Every Two Years</span><small>To maintain certification, including at least 15 participation points.</small></div></div>')
body = (BCSS + '\n' + hero + '\n<div class="mcms-wrap"><div class="mcms-gap top"></div>' + lead_html + '<div class="mcms-gap"></div>' + GL
        + '<div class="mcms-gap"></div>' + cm + '<div class="mcms-gap"></div>' + points_html + '<div class="mcms-gap"></div>' + cta_html + '<div class="mcms-gap"></div></div>\n')
body = _re.sub(r'<!--.*?-->', '', body, flags=_re.S)
open(O + 'cmsp-page-body.html', 'w', encoding='utf-8').write(body)
print('cmsp page body written', len(body))
