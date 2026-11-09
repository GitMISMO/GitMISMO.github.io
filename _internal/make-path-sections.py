import html as _h
e = lambda s: _h.escape(s, quote=True)
R = 'https://resources.mismo.org'; W = 'https://collaborate.mismo.org/mismowebsite'
CSS = """
<style>
/* MISMO professional certification path (Perry, 9 Nov 2026). Everything is scoped to .mpath; no scripts. */
.mpath{--ink:#0f314c;--text:#44607a;--blue:#1a8fe3;--blue-ink:#1a74b8;--line:#cfdeeb;--tint:#e3f1fc;color:var(--ink);font-family:inherit;font-size:16px;line-height:1.55;max-width:1120px}
.mpath *{box-sizing:border-box}
.mpath .ey{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--blue)}
.mpath h2.t{font-size:38px;line-height:1.12;margin:6px 0 0;font-weight:700;color:var(--ink)}
.mpath .rule{width:76px;height:4px;border-radius:2px;background:linear-gradient(90deg,#1a8fe3,#74bfeb);margin:14px 0 18px}
.mpath .lede{color:var(--text);font-size:17px;max-width:780px;margin:0}
.mpath input.tb{position:absolute;opacity:0;pointer-events:none}
.mpath .tabs{display:inline-flex;gap:4px;background:#eef5fb;border:1px solid var(--line);border-radius:999px;padding:4px;margin:22px 0 8px}
.mpath .tabs label{padding:8px 18px;border-radius:999px;font-weight:600;font-size:14.5px;color:var(--text);cursor:pointer}
.mpath #mp-a:checked ~ .tabs label[for=mp-a],.mpath #mp-b:checked ~ .tabs label[for=mp-b]{background:var(--ink);color:#fff}
.mpath #mp-a:focus-visible ~ .tabs label[for=mp-a],.mpath #mp-b:focus-visible ~ .tabs label[for=mp-b]{outline:2px solid #74bfeb;outline-offset:2px}
.mpath .panel{display:none} .mpath #mp-a:checked ~ .pa,.mpath #mp-b:checked ~ .pb{display:block}
.mpath .path{margin:22px 0 0 22px;border-left:3px solid var(--line)}
.mpath .st{position:relative;padding:0 0 22px 42px}
.mpath .st .n{position:absolute;left:-23px;top:0;width:42px;height:42px;border-radius:50%;background:var(--tint);color:var(--blue-ink);font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 0 0 1px var(--line)}
.mpath .st.us .n{background:var(--ink);color:#fff}
.mpath .st h3{font-size:18px;margin:0;font-weight:700;color:var(--ink)}
.mpath .who{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border-radius:999px;padding:2px 9px;margin-left:10px;vertical-align:3px;background:var(--tint);color:var(--blue-ink)}
.mpath .st.us .who{background:var(--ink);color:#fff}
.mpath .st p{margin:6px 0 0;color:var(--text);max-width:860px}
.mpath .term{border-bottom:2px dotted var(--blue);color:var(--ink);font-weight:600;cursor:help;position:relative;outline:none}
.mpath .term .tip{display:none;position:absolute;left:0;top:calc(100% + 10px);z-index:20;width:min(400px,80vw);background:var(--ink);color:#fff;border-radius:12px;padding:14px 16px;font-weight:400;font-size:14.5px;line-height:1.5;box-shadow:0 18px 40px -16px rgba(7,29,46,.6)}
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
    return (CSS + f'\n<div class="mpath"><div class="ey">{e(ey)}</div><h2 class="t">{e(title)}</h2><div class="rule"></div><p class="lede">{lede}</p>'
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
  + step(6, 'Take the Exam', False, 'Once you’re enrolled, we open the exam in TopClass and email you how to get in. 150 minutes, open book; 75% or higher passes.')
  + step(7, 'Get Certified', True, 'When your pass is recorded, your certificate arrives by email and you’re listed among current CMSPs. We remind you before it’s time to renew.')
  + '</div>' + ready('Two things to do now; MISMO emails you at every step after that.', ('Check My Points', 'Find out if you have the 100 you need', R + '/forms/points/?for=cmsp-new'),
                     ('Start My Application', 'Once you have your points and your reference', R + '/forms/cmsp/?kind=new'), [('CMSP Exam Study Guide', W + '/cmsp-exam-study'), ('Current CMSPs', W + '/current-cmsps')]))
cmsp_b = ('<div class="path">'
  + step(1, 'Check Your Points', False, 'Renewing takes 25 points from the last two years, at least 15 of them participation. The calculator adds up what MISMO has on record.')
  + step(2, 'Renew', False, 'Your points carry over from the calculator. If your company is a MISMO Champion member, you’ll see how many comps it has left.')
  + step(3, 'We Verify', True, 'We confirm your points. Points from MISMO’s own records are already checked, so this is quick.')
  + step(4, 'Your Renewal Fee, or a Comp', True, 'If your company has a comp left, we apply it and let its primary contact know; otherwise we email you how to pay.',
         prices([('CMSP renewal', '$100', '$200', False), ('With your company’s Champion comp', '$0', '$0', True)]))
  + step(5, 'Renewed', True, 'Your new certificate arrives by email, valid for two more years, and you stay listed among current CMSPs.')
  + '</div>' + ready('We remind you by email before your CMSP is due, with a link to renew.', ('Check My Points', 'Find out if you have the 25 you need', R + '/forms/points/?for=cmsp-ren'),
                     ('Start My Renewal', 'Once you have your points', R + '/forms/cmsp/?kind=renew'), [('Current CMSPs', W + '/current-cmsps')]))
amsp_a = ('<div class="path">'
  + step(1, 'Pass the MISMO Boot Camp Exam', False, 'Take MISMO Boot Camp and pass its exam. Keep your proof of passing; you’ll attach it to your application.')
  + step(2, 'Apply', False, 'Attach your Boot Camp exam result, and if your company is a MISMO Champion member, you’ll see how many comps it has left.')
  + step(3, 'We Verify', True, 'We confirm your Boot Camp exam.')
  + step(4, 'Enroll in the Program', True, COMP, prices([('AMSP', '$200', '$400', False), ('With your company’s Champion comp', '$0', '$0', True)]))
  + step(5, 'Get Certified', True, 'Your certificate arrives by email and you’re listed among current AMSPs. We remind you before it’s time to renew.')
  + '</div>' + ready('Two things to do; MISMO emails you at every step after that.', ('About MISMO Boot Camp', 'Where the AMSP starts', W + '/events/boot-camp'),
                     ('Start My Application', 'Once you’ve passed the Boot Camp exam', R + '/forms/amsp/?kind=new'), [('Current AMSPs', W + '/current-amsps'), ('Thinking of the CMSP?', W + '/standards-resources/certification/professional-certifications/cmsp')]))
amsp_b = ('<div class="path">'
  + step(1, 'Check Your Points', False, 'Renewing takes 10 participation points from the last two years. The calculator adds up what MISMO has on record.')
  + step(2, 'Renew', False, 'Your points carry over from the calculator. If your company is a MISMO Champion member, you’ll see how many comps it has left.')
  + step(3, 'We Verify', True, 'We confirm your points.')
  + step(4, 'Your Renewal Fee, or a Comp', True, 'If your company has a comp left, we apply it and let its primary contact know; otherwise we email you how to pay.',
         prices([('AMSP renewal', '$75', '$150', False), ('With your company’s Champion comp', '$0', '$0', True)]))
  + step(5, 'Renewed', True, 'Your new certificate arrives by email, valid for two more years, and you stay listed among current AMSPs.')
  + '</div>' + ready('We remind you by email before your AMSP is due, with a link to renew.', ('Check My Points', 'Find out if you have the 10 you need', R + '/forms/points/?for=amsp-ren'),
                     ('Start My Renewal', 'Once you have your points', R + '/forms/amsp/?kind=renew'), [('Current AMSPs', W + '/current-amsps')]))
cm = section('Certified MISMO Standards Professional', 'Your Path to CMSP', 'Seven steps, in order. You do four of them; MISMO does the rest and emails you at each one.', 'Become a CMSP', 'Renew My CMSP', cmsp_a, cmsp_b)
am = section('Associate MISMO Standards Professional', 'Your Path to AMSP', 'A shorter path: no reference and no separate exam. Passing the MISMO Boot Camp exam is the proof.', 'Become an AMSP', 'Renew My AMSP', amsp_a, amsp_b)
import os
O = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'website-sections') + '/'
open(O + 'cmsp-path-section.html', 'w', encoding='utf-8').write('<!-- Paste into the CMSP page on collaborate.mismo.org (Higher Logic), in place of “Five Steps to CMSP”. Perry, 9 Nov 2026. -->\n' + cm)
open(O + 'amsp-path-section.html', 'w', encoding='utf-8').write('<!-- Paste into the AMSP page on collaborate.mismo.org (Higher Logic), in place of its steps section. Perry, 9 Nov 2026. -->\n' + am)
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
