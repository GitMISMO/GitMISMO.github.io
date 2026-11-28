import re
AD=open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','..','accounting-desk','index.html')).read().split('\n')
head_meta=AD[3]  # <meta charset> + CSP line
# The Accounting Desk grows above these blocks now and then (its favicon line, CN-030), so find where its CSS starts
# and move every slice by the same amount (the asserts below catch anything else).
o=next(i for i,l in enumerate(AD) if l.startswith(':root{'))-15
css_shell='\n'.join(AD[15+o:129+o])   # :root .. end of rail css
# the svg defs: found by their opening line, up to and including </defs></svg> (the Desk's lines above them move now and then)
d0=next(i for i,l in enumerate(AD) if l.startswith('<svg width="0" height="0"'))
defs='\n'.join(AD[d0:next(i for i in range(d0,len(AD)) if '</defs></svg>' in AD[i])+1])
# The Accounting Desk's own script grows too (its data-season line, more search sources), so find the rail script by
# its opening comment and take it up to its closing </script>.
r0=next(i for i,l in enumerate(AD) if l.startswith('/* the rail'))
rail_js='\n'.join(AD[r0:next(i for i in range(r0,len(AD)) if AD[i].startswith('</script>'))])  # the rail + theme scripts (without <script> tags)
rail_js=rail_js.replace("const ORDER=['Receivables','Invoices','Certification Complete','New and Renewing Members','IIF Payments','Sponsorships'];","const ORDER=['Systems','Stories','Sections'];")
assert "const ORDER=['Systems','Stories','Sections'];" in rail_js
assert head_meta.startswith('<meta charset') and 'Content-Security-Policy' in head_meta
assert css_shell.startswith(':root{') and defs.startswith('<svg') and rail_js.startswith('/* the rail')
# CN-053 (Jonna, Nov 26, 2026): the masthead is Certification Management's exactly, so the MISMO logo sits in the same
# spot in every tool: a 68px navy bar (13px above and below the logo box, 22px in), the logo box 9px 13px with 5px
# corners and a sky line, the logo 24px x 157px, 14px gaps, a 1px x 42px divider and the name at 16px/500 #94c8e9.
# The Accounting Desk's copy may still have the older measurements, so each rule is set here, whatever it was.
# The rail and everything else below the bar go by --hq-h, so they line up to 68px with it (62px on a phone).
# The older December hat (.santa, #mismo-hat, html[data-season="december"]) is retired: /assets/holiday.js does December.
MAST={
 '.hqtop{':None,  # kept, with gap 14px (below)
 '.hqtop .mastrule{':'.hqtop .mastrule{display:block;width:1px;height:42px;flex:0 0 auto;background:rgba(80,164,219,.4)}',
 '.hqtop .hqname{':'.hqtop .hqname{font-family:var(--display);font-size:16px;font-weight:500;color:#94c8e9;white-space:nowrap}',
 '.logoplate{':'.logoplate{background:#fff;border-radius:5px;padding:9px 13px;display:flex;align-items:center;line-height:0;flex:0 0 auto;position:relative;box-shadow:0 1px 0 rgba(80,164,219,.35)}',
 '.logoplate .wordmark{':'.logoplate .wordmark{height:24px;width:157px;display:block}'
   # a phone, as Certification Management does it: a 62px bar 16px in, 11px gaps, the logo box 7px 10px, the logo 19px
   '\n@media(max-width:560px){:root{--hq-h:62px}.hqtop{gap:11px;padding:0 16px}.logoplate{padding:7px 10px}.logoplate .wordmark{height:19px;width:auto}'
   '.hqtop .hqname{font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis}.hqtop-r{gap:10px}}',
}
lines=[]
for l in css_shell.split('\n'):
  if l.startswith('.santa{') or 'data-season' in l: continue
  k=next((k for k in MAST if l.startswith(k)),None)
  if k=='.hqtop{':
    l=re.sub(r'(?<=;)gap:[^;]*;','gap:14px;',l); l=re.sub(r'(?<=;)padding:[^;]*;','padding:0 22px;',l)
    l=re.sub(r'(?<=;)background:[^;]*;','background:#0d314c;',l); l=re.sub(r'(?<=;)box-shadow:[^;]*;','box-shadow:0 1px 0 rgba(80,164,219,.28);',l)
    assert 'gap:14px;' in l and 'height:var(--hq-h)' in l
  elif k: l=MAST[k]
  lines.append(l)
css_shell=re.sub(r'--hq-h:\d+px','--hq-h:68px','\n'.join(lines),count=1)
assert all(css_shell.count(k)>=1 for k in MAST) and '--hq-h:68px' in css_shell and 'santa' not in css_shell
defs='\n'.join(l for l in defs.split('\n') if 'id="mismo-hat"' not in l)
I=lambda d:'<svg viewBox="0 0 24 24" aria-hidden="true">'+d+'</svg>'
ICONS={
 'overview':I('<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M7 6.6h10M6.2 7.9l4.6 8.3M17.8 7.9l-4.6 8.3"/>'),
 'Follow the Work':I('<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H14a3.5 3.5 0 010 7h-4a3.5 3.5 0 000 7h5.5"/>'),
 'To Rock Solid':I('<path d="M4 6l2 2 3-3.5M4 12.5l2 2 3-3.5M4 19l2 2 3-3.5"/><path d="M12 7h8M12 13.5h8M12 20h8"/>'),
 'Change Notices':I('<path d="M6 9a6 6 0 1112 0c0 5 2 6.5 2 6.5H4S6 14 6 9z"/><path d="M10 19a2 2 0 004 0"/>'),
 'Failures':I('<path d="M12 3l9.5 17H2.5z"/><path d="M12 10v4.5M12 17.5v.1"/>'),
 'Coverage':I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.6 6.5-5.6s5.9 2 6.5 5.6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5c2.5.2 4 1.8 4.5 4.5"/>'),
 'Security':I('<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
 'What Changed':I('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'),
 'On Its Own':I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
 'help':I('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 014.8.9c0 1.7-2.4 2.2-2.4 3.6"/><path d="M12 17.2v.1"/>'),
}
import json
page=r'''<!doctype html>
<html lang="en" data-rs-gate>
<head>
__META__
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Connected Systems</title>
<meta name="description" content="How MISMO's systems fit together: the system map, how work moves, security, what changed and what runs on its own.">
<meta name="theme-color" content="#0d314c">
<meta name="robots" content="noindex">
<!-- Connected Systems (Jonna, 24 November 2026): its own view-only app, like the Membership Desk and the MBA Accounting
     Desk, so people can see how MISMO's systems fit together without being in Team HQ. Its own access ("Connected
     Systems", key connected-systems) and its own storage: it reads only data/systemsmap.json in
     GitMISMO/connected-systems-data, a copy of Team HQ's Connected Systems record that mismo-connections' Connected
     Systems Copy job brings over whenever it changes. Nothing on it saves, and the key reaches nothing else.
     The drawing is Team HQ's own code (/team-hq/src/systems.js), so it always shows exactly what Team HQ shows.
     Jonna and Vanessa edit Connected Systems in Team HQ (Edit in Team HQ, top right). Notes: DEVELOPING.md. -->
<link rel="icon" type="image/png" sizes="48x48" href="https://resources.mismo.org/assets/favicon-48x48.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&display=swap">
<script src="/assets/session.js"></script>
<script src="/assets/back.js"></script>
<style>
__CSS__
/* the colors Team HQ's Connected Systems drawing uses */
:root{--c1:#2477b8;--c2:#eb6834;--c3:#1baf7a;--c4:#eda100;--c5:#e87ba4;--c6:#008300;--c7:#8a6fd4;--cn:#adc4d6;--good-soft:#e2f2ec;--bad-soft:#f9e6e4;--warn-soft:#f8efdc;--info-soft:#e4f2fb;--shadow:0 1px 2px rgba(13,49,76,.06),0 6px 18px rgba(13,49,76,.06)}
:root[data-theme="dark"]{--c1:#3987e5;--c2:#d95926;--c3:#199e70;--c4:#c98500;--c5:#d55181;--c6:#2f9e2f;--c7:#9b86e0;--cn:#2f6688;--good-soft:#123d33;--bad-soft:#43201f;--warn-soft:#3d3218;--info-soft:#123a52;--sky-wash:#123a52;--shadow:0 1px 2px rgba(0,0,0,.3),0 6px 18px rgba(0,0,0,.25)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--c1:#3987e5;--c2:#d95926;--c3:#199e70;--c4:#c98500;--c5:#d55181;--c6:#2f9e2f;--c7:#9b86e0;--cn:#2f6688;--good-soft:#123d33;--bad-soft:#43201f;--warn-soft:#3d3218;--info-soft:#123a52;--sky-wash:#123a52}}
/* Team HQ's drawing keeps the map and jump targets clear of a shorter bar (top:62px, scroll-margin 56-70px); here they
   go by this page's own bar height (68px since CN-053), so nothing slides under it or leaves a gap */
#csw .cs-mapwrap.cs-stick{top:calc(var(--hq-h) + env(safe-area-inset-top,0px) + 8px)}
#csw .cs-band,#csw .cs-mapwrap,#csw .cs-panel,#csw .cs-sbd{scroll-margin-top:calc(var(--hq-h) + 8px)}
#csw .cs-wk{scroll-margin-top:calc(var(--hq-h) + 14px)}
#rs-account .rs-who,#rs-account .rs-signin{border-radius:4px}
.vochip{font-size:11.5px;font-weight:700;color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:4px;padding:4px 9px;white-space:nowrap}
.edit-hq{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--navy);background:var(--sky);border-radius:4px;padding:6px 11px;text-decoration:none;white-space:nowrap}
.edit-hq:hover{background:#fff}
.edit-hq svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.edit-hq[hidden]{display:none}
@media(max-width:700px){.vochip{display:none}.edit-hq span{display:none}}
main{max-width:1360px;margin:0 auto;padding:22px 26px 48px}
@media(max-width:700px){main{padding:14px 12px 36px}}
.view[hidden]{display:none}
.msg{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:22px;color:var(--ink-2)}
.msg b{display:block;color:var(--ink);font-size:16px;margin-bottom:4px}
/* one page at a time: Overview is the hero and the map; every other page is its own section */
#csw .cs-nav{display:none}
#csw.ov .cs > .cs-hero + .cs-nav + section.cs-band ~ section.cs-band{display:none}
#csw.sec .cs > .cs-hero, #csw.sec .cs > .cs-hero + .cs-nav + section.cs-band{display:none}
#csw.sec .cs > section.cs-band:not([hidden]){margin-top:0}
.help{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:22px 26px;max-width:860px;line-height:1.55}
.help h1{margin:0 0 4px;font-size:24px}.help h2{font-size:16px;margin:20px 0 4px}.help p,.help li{color:var(--ink-2);font-size:14px}.help ul{padding-left:20px;margin:6px 0}
.help .k{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);font-weight:700}
.vstamp{margin-top:22px;font-size:11.5px;color:var(--ink-3)}

/* ===== Phone (Jonna, Nov 27, 2026): no left menu on a phone. A bottom tab bar with every page (More holds the rest),
   the System Map fitted to the screen, and turning the phone sideways opens the whole map full screen, with pinch to
   zoom, drag to move, and a tap on a box for its story. html.ph is set by the script below. ===== */
#mtab,#msheet,#mscrim,.mm-ui,.mm-rot{display:none}
html.ph body{padding-left:0!important;padding-bottom:calc(64px + env(safe-area-inset-bottom,0px))}
html.ph .hq.rail,html.ph .railscrim{display:none!important}
/* the masthead keeps the shared phone size (CN-053); only the left menu's room goes */
html.ph .hqtop{margin-left:0!important;width:100%!important}
html.ph .hqtop .eyebrow-m,html.ph .hqtop .vochip,html.ph .hqtop .edit-hq{display:none!important}
html.ph .hqtop .hqtop-r{gap:8px}
html.ph main{padding:12px 10px 22px}
#mtab{position:fixed;left:0;right:0;bottom:0;z-index:150;background:var(--navy);border-top:1px solid rgba(116,191,235,.25);padding:6px 6px calc(6px + env(safe-area-inset-bottom,0px));gap:4px}
html.ph #mtab{display:grid;grid-template-columns:repeat(5,minmax(0,1fr))}
#mtab button{all:unset;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:50px;border-radius:6px;color:#a9c3d6;font:600 10.5px/1.1 var(--ui);letter-spacing:.01em;cursor:pointer;-webkit-tap-highlight-color:transparent;text-align:center;padding:4px 2px}
#mtab button svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
#mtab button[aria-current="page"]{color:#fff;background:rgba(116,191,235,.18);box-shadow:inset 0 2px 0 var(--sky)}
#mtab button:focus-visible{outline:2px solid var(--sky);outline-offset:-2px}
#mscrim{position:fixed;inset:0;z-index:160;background:rgba(6,32,47,.5);border:0;padding:0}
#msheet{position:fixed;left:0;right:0;bottom:0;z-index:161;background:var(--surface);border-radius:14px 14px 0 0;box-shadow:0 -10px 40px rgba(6,32,47,.35);padding:8px 14px calc(16px + env(safe-area-inset-bottom,0px));max-height:86vh;overflow:auto;overscroll-behavior:contain}
html.ph #msheet.open,html.ph #mscrim.open{display:block}
#msheet .grab{width:42px;height:4px;border-radius:2px;background:var(--border-strong);margin:2px auto 10px}
#msheet .mh{display:flex;align-items:center;justify-content:space-between;margin:0 0 10px}
#msheet .mh b{font-size:17px}#msheet .mh small{display:block;color:var(--ink-3);font-size:12px;font-weight:500;margin-top:2px}
#msheet .mx{all:unset;cursor:pointer;width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--border);border-radius:6px;font-size:20px;color:var(--ink-2)}
#msheet .mfind{display:flex;align-items:center;gap:8px;border:1px solid var(--border-strong);border-radius:8px;padding:0 10px;height:42px;margin-bottom:10px;background:var(--surface-2)}
#msheet .mfind svg{width:18px;height:18px;fill:none;stroke:var(--ink-3);stroke-width:2;flex:none}
#msheet .mfind input{all:unset;flex:1;font-size:16px;color:var(--ink)}
#msheet .mhits{display:flex;flex-direction:column;gap:4px;margin:-4px 0 10px}
#msheet .mhits button{all:unset;cursor:pointer;display:flex;justify-content:space-between;gap:10px;padding:9px 10px;border:1px solid var(--border);border-radius:6px;font-size:14px;font-weight:600;color:var(--ink)}
#msheet .mhits button small{color:var(--ink-3);font-weight:500;font-size:12px;white-space:nowrap}
#msheet .mgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
#msheet .mgrid button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:12px 11px;min-height:78px;border:1px solid var(--border);border-radius:8px;background:var(--surface-2);font-size:13px;font-weight:650;color:var(--ink);line-height:1.2}
#msheet .mgrid button svg{width:22px;height:22px;fill:none;stroke:var(--navy-mid);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
:root[data-theme="dark"] #msheet .mgrid button svg{stroke:var(--sky)}
#msheet .mgrid button[aria-current="page"]{border-color:var(--sky);background:var(--sky-wash);box-shadow:inset 0 0 0 1px var(--sky)}
#msheet .mfoot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid var(--border);font-size:12.5px;color:var(--ink-3)}
#msheet .mfoot button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-strong);border-radius:6px;padding:7px 11px;font-size:13px;font-weight:600;color:var(--ink);white-space:nowrap}
#msheet .mfoot svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2}
/* the map on a phone: the whole map, fitted to the width */
html.ph .cs-mapbox svg,html.ph .cs-mapin{min-width:0!important}
html.ph .cs-swipe{display:none!important}
html.ph .cs .cs-band{margin-top:14px}
.mm-rot{align-items:center;gap:12px;background:linear-gradient(120deg,var(--navy),var(--navy-mid));color:#fff;border-radius:10px;padding:12px 12px 12px 14px;margin:0 0 10px}
html.ph:not(.land) #csw.ov .mm-rot{display:flex}
.mm-rot svg.ph-i{width:34px;height:34px;flex:none;fill:none;stroke:var(--sky);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;animation:mmtilt 2.8s ease-in-out infinite;transform-origin:50% 50%}
@keyframes mmtilt{0%,35%{transform:rotate(0)}55%,85%{transform:rotate(-90deg)}100%{transform:rotate(0)}}
.mm-rot div{flex:1;min-width:0}.mm-rot b{display:block;font-size:14px}.mm-rot span{display:block;font-size:12px;color:#cfe3f1;margin-top:2px}
.mm-rot button{all:unset;cursor:pointer;flex:none;background:var(--sky);color:var(--navy);font-weight:700;font-size:12.5px;border-radius:6px;padding:9px 11px;white-space:nowrap}

/* phone held sideways (outside the full-screen map): a slimmer top bar and tab bar, so the page has room */
html.ph.land body{padding-bottom:calc(46px + env(safe-area-inset-bottom,0px))}
html.ph.land #mtab{padding:4px max(8px,env(safe-area-inset-left,0px)) calc(4px + env(safe-area-inset-bottom,0px))}
html.ph.land #mtab button{flex-direction:row;min-height:36px;gap:7px;font-size:12px}
html.ph.land #mtab button svg{width:18px;height:18px}
html.ph.land main{padding-left:max(10px,env(safe-area-inset-left,0px));padding-right:max(10px,env(safe-area-inset-right,0px))}
/* the opening on a phone: the four headline numbers two by two, so the map is close */
html.ph .cs-hero{padding:18px 16px 16px;border-radius:12px}
html.ph .cs-hero h2{font-size:24px}
html.ph .cs-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
html.ph .cs-stat{padding:10px 11px}html.ph .cs-stat b{font-size:26px}
html.ph.land .cs-stats{grid-template-columns:repeat(4,minmax(0,1fr))}
/* full-screen map */
html.mapmode,html.mapmode body{overflow:hidden!important;overscroll-behavior:none}
html.mapmode #mtab,html.mapmode .hqtop{display:none!important}
html.mapmode body{padding-bottom:0}
.cs-grid.mm-on{position:fixed;inset:0;z-index:300;margin:0!important;display:block!important;background:var(--ground)}
.cs-grid.mm-on>.cs-mapwrap{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:var(--ground);padding:0;margin:0;overflow:hidden}
.cs-grid.mm-on .cs-legend{display:none}
.cs-grid.mm-on.mm-key .cs-legend{display:flex;flex-wrap:wrap;gap:6px 14px;position:absolute;left:calc(12px + env(safe-area-inset-left,0px));right:auto;max-width:min(520px,70vw);bottom:12px;z-index:5;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:9px 12px;box-shadow:var(--shadow);font-size:11.5px}
.cs-grid.mm-on .cs-mapbox{position:absolute;inset:0;overflow:hidden;border-radius:0;touch-action:none;display:flex;align-items:center;justify-content:center}
.cs-grid.mm-on .cs-mapin{flex:none;transform-origin:0 0;will-change:transform}
.cs-grid.mm-on>.cs-panel{position:absolute;z-index:6;top:0;right:0;bottom:0;width:min(430px,52vw);height:auto!important;min-height:0!important;max-height:none;margin:0;border-radius:0;border:0;border-left:1px solid var(--border);box-shadow:-10px 0 30px rgba(6,32,47,.22);overflow:auto;overscroll-behavior:contain;padding-right:env(safe-area-inset-right,0px);animation:mmin .22s ease-out}
html:not(.land) .cs-grid.mm-on>.cs-panel{top:auto;left:0;width:auto;max-height:62vh;border-left:0;border-top:1px solid var(--border);border-radius:14px 14px 0 0;box-shadow:0 -10px 30px rgba(6,32,47,.22);animation:mmup .22s ease-out}
.cs-grid.mm-on.solo>.cs-panel{display:none}
@keyframes mmin{from{transform:translateX(30px);opacity:0}to{transform:none;opacity:1}}@keyframes mmup{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
.cs-grid.mm-on .mm-ui{display:flex;position:absolute;z-index:7;gap:6px;top:calc(10px + env(safe-area-inset-top,0px))}
.cs-grid.mm-on .mm-ui.l{left:calc(10px + env(safe-area-inset-left,0px))}
.cs-grid.mm-on .mm-ui.r{right:calc(10px + env(safe-area-inset-right,0px))}
.cs-grid.mm-on:not(.solo) .mm-ui.r{display:none}
.mm-ui button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 11px;border-radius:6px;background:rgba(13,49,76,.92);color:#fff;font:600 12.5px var(--ui);box-shadow:0 2px 10px rgba(6,32,47,.3);white-space:nowrap;-webkit-tap-highlight-color:transparent}
.mm-ui button[aria-pressed="true"]{background:var(--sky);color:var(--navy)}
.mm-ui button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.mm-zoom{position:absolute;z-index:7;bottom:12px;right:calc(12px + env(safe-area-inset-right,0px));font:600 11px var(--ui);color:var(--ink-3);background:var(--surface);border:1px solid var(--border);border-radius:5px;padding:3px 7px;opacity:0;transition:opacity .3s;pointer-events:none}
.mm-zoom.on{opacity:1}
.cs-grid.mm-on:not(.solo) .mm-zoom{display:none}
.mm-hint{position:absolute;z-index:7;left:50%;bottom:14px;transform:translateX(-50%);background:rgba(13,49,76,.92);color:#fff;font:600 12px var(--ui);border-radius:6px;padding:8px 12px;white-space:nowrap;pointer-events:none;animation:mmhint 4.5s ease forwards}
@keyframes mmhint{0%,70%{opacity:1}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){.mm-rot svg.ph-i{animation:none}.cs-grid.mm-on>.cs-panel{animation:none}}
</style>
</head>
<body>
__DEFS__
<header class="hqtop">
  <span class="logoplate"><svg class="wordmark" role="img" aria-label="MISMO" viewBox="0 0 708 108"><use href="#mismo-logo"/></svg></span>
  <span class="mastrule"></span>
  <span class="hqname">Connected Systems</span>
  <span class="hqtop-r"><span class="eyebrow-m">How MISMO’s Systems Fit Together</span><span class="vochip">View Only</span>
    <a class="edit-hq" id="edit-hq" href="/team-hq/?page=systems" hidden title="Edit Connected Systems in Team HQ"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg><span>Edit in Team HQ</span></a>
    <div id="rs-account"></div></span>
</header>
<aside class="hq rail" id="rail">
  <div class="rail-top"><span class="rail-lbl">Sections</span>
    <button class="railhide" id="rail-hide" type="button" aria-label="Narrow the menu" title="Narrow the menu (backslash)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button></div>
  <div class="railfind">
    <button class="railfind-b" id="rail-qb" type="button" aria-label="Search" title="Search" tabindex="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg></button>
    <svg class="fi" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>
    <input type="search" id="rail-q" autocomplete="off" spellcheck="false" placeholder="Search" aria-label="Search systems and stories">
    <button class="railq-x" id="rail-qx" type="button" aria-label="Clear the search" hidden>×</button>
    <div class="railhits" id="rail-hits" hidden></div>
  </div>
  <nav aria-label="Connected Systems" id="nav">
    <button type="button" data-hq="overview" aria-current="page" title="Overview">__I_overview__<span>Overview</span></button>
    <button type="button" data-hq="help" title="Help">__I_help__<span>Help</span></button>
  </nav>
  <div class="mast-right">
    <div class="railupd" id="rail-upd" hidden><span>As Of</span><b id="rail-upd-t"></b></div>
    <button class="theme-btn" id="theme-btn" type="button"><svg class="ti ti-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6.4 6.4 0 009 9 9 9 0 11-9-9z"/></svg><svg class="ti ti-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><span id="theme-lab">Dark Mode</span></button>
  </div>
</aside>
<div class="railscrim" id="rail-scrim"></div>

<nav id="mtab" aria-label="Connected Systems pages"></nav>
<button id="mscrim" type="button" aria-label="Close"></button>
<div id="msheet" role="dialog" aria-modal="true" aria-label="Every Page"></div>

<main>
  <section class="view" id="v-map"><div id="csw" class="ov"><div class="msg"><b>Opening Connected Systems…</b>Reading the latest map.</div></div></section>
  <section class="view" id="v-help" hidden>
    <div class="help">
      <div class="k">Help</div>
      <h1>Connected Systems</h1>
      <p>How MISMO’s systems fit together: which system hands what to which, how the data is protected, what each system replaced and what runs on its own. It’s a view-only page; nothing here can be changed.</p>
      <h2>The Pages</h2>
      <ul>
        <li><b>Overview</b>: the headline numbers and the System Map. Point at a box to see what it touches; select it for the full story. The area buttons and Find a System narrow the map.</li>
        <li><b>Follow the Work</b>: step-by-step stories of how work moves between systems. Pick one and choose Play on the Map to watch it travel across the System Map.</li>
        <li><b>Security</b>: each layer that protects the data, and where it lives.</li>
        <li><b>What Changed</b>: what each system replaced.</li>
        <li><b>On Its Own</b>: the jobs that run on a schedule or the moment something changes.</li>
        <li>The other pages show what’s still being finished on each system, the notices systems send each other when something changes, any jobs that failed, and who keeps each system running.</li>
      </ul>
      <h2>On a Phone</h2>
      <p>The pages are in the bar along the bottom: Map, Stories, On Its Own and Security, with every other page, Search and Dark Mode under More. Turn your phone sideways on the Map and the whole System Map opens full screen: pinch to zoom, drag to move around, double-tap to zoom in or out, and tap a box for its story. Fit shows the whole map again, Key shows what the lines mean, and Back returns to the page. Turn the phone upright to leave the full-screen map, or choose Full Screen on the Map to open it upright.</p>
      <h2>How Current It Is</h2>
      <p>Connected Systems is kept in Team HQ. This page picks up every change within about 10 minutes. The date at the foot of the menu (As Of) is the date of the latest map.</p>
      <h2>Getting Access</h2>
      <p>Access is its own item in People &amp; Access (Connected Systems), separate from Team HQ. Ask Jonna Critchley. Having it doesn’t give access to Team HQ or anything else.</p>
      <h2>Search</h2>
      <p>The search box finds systems and stories. Press Ctrl+K (Cmd+K on a Mac) to jump to it, and the backslash key to narrow or widen the menu.</p>
      <h2>The Back Button</h2>
      <p>Your browser’s Back button goes to the last page you were on and closes an open panel or list first; it never undoes a change.</p>
      <div class="vstamp" id="vstamp"></div>
    </div>
  </section>
</main>

<script>
(function(){
  'use strict';
  var BUILD = '__BUILD__';
  var RELAY = 'https://rgvdi67cg27o5kcmiytcqbqnrm0hmztx.lambda-url.us-east-1.on.aws';
  var KEY = 'connected-systems', FILE = '/file/data/systemsmap.json';
  var EDITORS = ['jcritchley@mismo.org', 'jcritchley@mba.org', 'vrios@mismo.org', 'vrios@mba.org'];
  var ICONS = __ICONS__;
  var wrap = document.getElementById('csw'), nav = document.getElementById('nav');
  var subs = [], last = null, lastData = null, page = 'overview', built = '';
  document.getElementById('vstamp').textContent = 'Version ' + BUILD + '.';
  function msg(t, p){ wrap.innerHTML = '<div class="msg"><b></b><span></span></div>'; wrap.querySelector('b').textContent = t; wrap.querySelector('span').textContent = p || ''; }

  /* ---------- the data: one file, read only ---------- */
  function read(){
    var rs = window.ResourcesSession, t = rs && rs.token();
    return fetch(RELAY + '/' + KEY + FILE, { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' }).then(function(r){
      if (r.status === 401) { rs.signIn({ reason: 'expired', toolName: 'Connected Systems', gated: true }); throw new Error('signed out'); }
      if (r.status === 404) return null;
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json(); }).then(function(b){
        if (!b || !b.content) return null;
        var bin = atob(String(b.content).replace(/\s/g, '')), bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return JSON.parse(new TextDecoder('utf-8').decode(bytes)); });
  }
  function snap(data){ var d = (data && data.docs) || {}; return { docs: Object.keys(d).map(function(id){ return { id: id, data: function(){ return d[id]; } }; }) }; }
  function longDate(iso){ if(!iso) return ''; var p = String(iso).split('-'); var d = new Date(+p[0], +p[1]-1, +p[2]); return isNaN(d) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function refresh(){
    return read().then(function(data){
      var sig = JSON.stringify(data && data.docs); if (sig === last) return; last = sig; lastData = data;
      var cur = data && data.docs && data.docs.current;
      if (cur && cur.asOf) { document.getElementById('rail-upd-t').textContent = longDate(cur.asOf); document.getElementById('rail-upd').hidden = false; }
      subs.forEach(function(f){ f(snap(data)); });
    });
  }
  /* what Team HQ's drawing code expects: who is looking (nobody who can edit here) and the one record */
  window.__S = { me: '', viewOnly: true, db: { collection: function(){ return {
    onSnapshot: function(ok){ subs.push(ok); if (lastData) ok(snap(lastData)); return function(){}; },
    doc: function(){ return { set: function(){ return Promise.reject(new Error('Connected Systems is view only here.')); } }; } }; } } };

  /* ---------- pages: Overview, then one page per section, then Help ---------- */
  function sections(){ return [].slice.call(wrap.querySelectorAll('.cs-nav button[data-tab]')).map(function(b){ return b.dataset.tab; }).filter(Boolean); }
  function btnFor(k, label){ var b = document.createElement('button'); b.type = 'button'; b.dataset.hq = k; b.title = label;
    b.innerHTML = ICONS[k] || ICONS[label] || ICONS.Coverage; var s = document.createElement('span'); s.textContent = label; b.appendChild(s);
    b.addEventListener('click', function(){ show(k); }); return b; }
  function buildNav(){
    var L = sections(), sig = L.join('|'); if (sig === built) return; built = sig;
    var first = ['Follow the Work', 'Security', 'What Changed', 'On Its Own'];
    var order = first.filter(function(x){ return L.indexOf(x) >= 0; }).concat(L.filter(function(x){ return first.indexOf(x) < 0; }));
    nav.textContent = '';
    nav.appendChild(btnFor('overview', 'Overview'));
    order.forEach(function(l){ nav.appendChild(btnFor('s:' + l, l)); });
    nav.appendChild(btnFor('help', 'Help'));
    if (page.indexOf('s:') === 0 && L.indexOf(page.slice(2)) < 0) page = 'overview';
    mark();
  }
  function mark(){ [].forEach.call(nav.querySelectorAll('button[data-hq]'), function(b){ if (b.dataset.hq === page) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }); }
  function apply(){
    var sec = page.indexOf('s:') === 0;
    wrap.className = sec ? 'sec' : 'ov';
    if (sec) { var b = wrap.querySelector('.cs-nav button[data-tab="' + page.slice(2).replace(/"/g, '') + '"]'); if (b && b.getAttribute('aria-selected') !== 'true') b.click(); }
  }
  function show(k, keepScroll){
    page = k; mark();
    document.getElementById('v-map').hidden = k === 'help'; document.getElementById('v-help').hidden = k !== 'help';
    if (k !== 'help') apply();
    try { history.replaceState(null, '', k === 'overview' ? location.pathname : '#' + encodeURIComponent(k === 'help' ? 'help' : k.slice(2))); } catch (e) {}
    if (!keepScroll) window.scrollTo(0, 0);
    if (window.matchMedia('(max-width:900px)').matches && window.__rail) window.__rail.hide();
  }
  function fromHash(){ var h = decodeURIComponent(location.hash.slice(1)); if (!h) return 'overview'; if (h === 'help') return 'help'; return 's:' + h; }

  /* ---------- search: systems and stories ---------- */
  window.__deskFind = function(t, push, go){
    var cur = lastData && lastData.docs && lastData.docs.current; if (!cur) return;
    (cur.systems || []).forEach(function(s){ var hay = (s.name + ' ' + (s.what || '')).toLowerCase(); if (hay.indexOf(t) < 0) return;
      push('Systems', s.name, s.status || '', function(){ show('overview'); var i = wrap.querySelector('.cs-find input'); if (i) { i.value = s.name; i.dispatchEvent(new Event('input', { bubbles: true })); i.scrollIntoView({ block: 'center' }); } }); });
    (cur.journeys || []).forEach(function(j){ var hay = (j.title || j.name || '').toLowerCase(); if (!hay || hay.indexOf(t) < 0) return;
      push('Stories', j.title || j.name, 'Follow the Work', function(){ show('s:Follow the Work'); }); });
    sections().forEach(function(l){ if (l.toLowerCase().indexOf(t) >= 0) push('Sections', l, '', function(){ show('s:' + l); }); });
  };

  function boot(){
    var rs = window.ResourcesSession;
    if (!rs) { msg('Connected Systems Couldn’t Load', 'The resources.mismo.org sign-in didn’t load. Check your connection, then reload the page.'); return; }
    rs.requireAccess(KEY, { toolName: 'Connected Systems', eyebrow: 'MISMO' }).then(function(){
      var me = rs.current() && String(rs.current().email || '').toLowerCase();
      document.getElementById('edit-hq').hidden = !(EDITORS.indexOf(me) >= 0 || (rs.role && rs.role('team-hq') === 'admin'));
      return refresh();
    }).then(function(){
      if (!lastData || !lastData.docs || !lastData.docs.current) { msg('Connected Systems Isn’t Ready Yet', 'The map hasn’t been brought over yet. Try again in a few minutes.'); return; }
      var s = document.createElement('script'); s.src = '/team-hq/src/systems.js?v=' + BUILD + '-' + Math.floor(Date.now() / 36e5);
      s.onload = function(){ var CS = window.__hqSystems; if (!CS) { msg('Connected Systems Couldn’t Load', 'Reload the page to try again.'); return; }
        wrap.textContent = ''; wrap.appendChild(CS.page());
        CS.onChange(function(){ buildNav(); if (page !== 'help') apply(); });
        buildNav(); show(fromHash(), true);
        setInterval(function(){ if (!document.hidden) refresh().catch(function(){}); }, 5 * 60000); };
      s.onerror = function(){ msg('Connected Systems Couldn’t Load', 'Check your connection, then reload the page.'); };
      document.body.appendChild(s);
    }).catch(function(e){
      if (e && /signed out/.test(e.message)) return;
      if (e && e.code === 'NO_ACCESS') return;
      msg('Connected Systems Couldn’t Load', 'Something went wrong reading the map (' + ((e && e.message) || 'unknown') + '). Reload the page to try again.');
    });
  }
  document.getElementById('nav').addEventListener('click', function(e){ var b = e.target.closest('button[data-hq]'); if (b && !b.onclick && (b.dataset.hq === 'overview' || b.dataset.hq === 'help') && !built) show(b.dataset.hq); });
  window.addEventListener('hashchange', function(){ var k = fromHash(); if (k !== page) show(k); });
  /* a story played from Follow the Work plays on the System Map, so go to the map to watch it (Jonna, Nov 24, 2026) */
  wrap.addEventListener('click', function(e){
    if (page.indexOf('s:') !== 0 || !e.target.closest('.cs-sb button')) return;
    setTimeout(function(){ if (!wrap.querySelector('.cs-panel .cs-story')) return;
      show('overview', true); var mw = wrap.querySelector('.cs-mapwrap'); if (mw) window.scrollTo(0, Math.max(0, mw.getBoundingClientRect().top + window.scrollY - 80)); }, 60);
  });
  /* the browser's Back button (CN-033, Jonna, Nov 25, 2026): the shared /assets/back.js makes each change of page in
     the left menu a step in the browser's history. Back first closes what's open, one at a time: the list under a
     headline number, then the system or story panel beside the map, each the way its own × does. */
  function press(sel){ var b = wrap.querySelector(sel); if (b) b.click(); }
  if (window.MismoBack) {
    MismoBack.layer({ isOpen: function(){ var d = wrap.querySelector('.cs-drill'); return !!d && !d.hidden; },
      close: function(){ press('.cs-drill .cs-dh .cs-dx'); } });
    MismoBack.layer({ isOpen: function(){ var p = wrap.querySelector('.cs-panel'); return !!p && !!p.parentNode && !p.classList.contains('is-intro') && !p.parentNode.classList.contains('solo'); },
      close: function(){ press('.cs-panel .cs-krow .cs-all, .cs-panel .cs-ph > button.x'); } });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
</script>
<script>
__RAIL__
</script>
<script>
/* ===== Phone: tab bar, More sheet and the full-screen map (Jonna, Nov 27, 2026) ===== */
(function(){
  'use strict';
  var ICONS = __ICONS__, root = document.documentElement;
  var Q = window.matchMedia('(max-width:700px), (max-height:500px) and (max-width:1000px)');
  var tab = document.getElementById('mtab'), sheet = document.getElementById('msheet'), scrim = document.getElementById('mscrim');
  var TABS = [['overview','Map','overview'],['s:Follow the Work','Stories','Follow the Work'],['s:On Its Own','On Its Own','On Its Own'],['s:Security','Security','Security']];
  var MORE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/></svg>';
  var ROT = '<svg class="ph-i" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg>';
  function land(){ return window.innerWidth > window.innerHeight; }
  function cur(){ var b = document.querySelector('#nav button[aria-current="page"]'); return b ? b.dataset.hq : 'overview'; }
  function go(k){ var b = document.querySelector('#nav button[data-hq="' + k.replace(/"/g,'') + '"]'); if (b) b.click(); closeSheet(); window.scrollTo(0,0); }
  function paintTab(){
    var c = cur(), inTabs = TABS.some(function(t){ return t[0] === c; });
    tab.textContent = '';
    TABS.forEach(function(t){ if (t[0] !== 'overview' && !document.querySelector('#nav button[data-hq="' + t[0] + '"]')) return;
      var b = document.createElement('button'); b.type = 'button'; b.innerHTML = ICONS[t[2]] || ''; var s = document.createElement('span'); s.textContent = t[1]; b.appendChild(s);
      if (t[0] === c) b.setAttribute('aria-current','page'); b.addEventListener('click', function(){ go(t[0]); }); tab.appendChild(b); });
    var m = document.createElement('button'); m.type = 'button'; m.innerHTML = MORE; var ms = document.createElement('span'); ms.textContent = 'More'; m.appendChild(ms);
    if (!inTabs) m.setAttribute('aria-current','page'); m.setAttribute('aria-haspopup','dialog'); m.addEventListener('click', openSheet); tab.appendChild(m);
    tab.style.gridTemplateColumns = 'repeat(' + tab.children.length + ',minmax(0,1fr))';
  }
  function openSheet(){
    var c = cur(); sheet.textContent = '';
    var g = document.createElement('div'); g.className = 'grab'; sheet.appendChild(g);
    var mh = document.createElement('div'); mh.className = 'mh'; var t = document.createElement('div'); t.innerHTML = '<b>Every Page</b>';
    var asof = document.getElementById('rail-upd-t').textContent; if (asof) { var sm = document.createElement('small'); sm.textContent = 'Map as of ' + asof; t.appendChild(sm); }
    mh.appendChild(t); var x = document.createElement('button'); x.className = 'mx'; x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label','Close'); x.addEventListener('click', closeSheet); mh.appendChild(x); sheet.appendChild(mh);
    var f = document.createElement('label'); f.className = 'mfind'; f.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>';
    var inp = document.createElement('input'); inp.type = 'search'; inp.placeholder = 'Find a system or story'; inp.setAttribute('aria-label','Find a system or story'); f.appendChild(inp); sheet.appendChild(f);
    var hits = document.createElement('div'); hits.className = 'mhits'; sheet.appendChild(hits);
    inp.addEventListener('input', function(){ hits.textContent = ''; var q = inp.value.trim().toLowerCase(); if (q.length < 2 || !window.__deskFind) return; var n = 0;
      window.__deskFind(q, function(grp, label, sub, fn){ if (n++ >= 8) return; var b = document.createElement('button'); b.type = 'button'; var l = document.createElement('span'); l.textContent = label; var s2 = document.createElement('small'); s2.textContent = sub || grp; b.appendChild(l); b.appendChild(s2);
        b.addEventListener('click', function(){ closeSheet(); fn(); }); hits.appendChild(b); }, function(){}); });
    var grid = document.createElement('div'); grid.className = 'mgrid';
    [].forEach.call(document.querySelectorAll('#nav button[data-hq]'), function(nb){ var k = nb.dataset.hq;
      var b = document.createElement('button'); b.type = 'button'; var ic = nb.querySelector('svg'); if (ic) b.appendChild(ic.cloneNode(true));
      var s = document.createElement('span'); s.textContent = k === 'overview' ? 'Overview and Map' : (nb.querySelector('span') || nb).textContent; b.appendChild(s);
      if (k === c) b.setAttribute('aria-current','page'); b.addEventListener('click', function(){ go(k); }); grid.appendChild(b); });
    sheet.appendChild(grid);
    var ft = document.createElement('div'); ft.className = 'mfoot'; var tl = document.createElement('span'); tl.textContent = 'View only';
    var th = document.createElement('button'); th.type = 'button'; var dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    th.innerHTML = dark ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>Light Mode' : '<svg viewBox="0 0 24 24"><path d="M12 3a6.4 6.4 0 009 9 9 9 0 11-9-9z"/></svg>Dark Mode';
    th.addEventListener('click', function(){ var tb = document.getElementById('theme-btn'); if (tb) tb.click(); openSheet(); });
    ft.appendChild(tl); ft.appendChild(th); sheet.appendChild(ft);
    sheet.classList.add('open'); scrim.classList.add('open'); sheet.scrollTop = 0;
  }
  function closeSheet(){ sheet.classList.remove('open'); scrim.classList.remove('open'); }
  scrim.addEventListener('click', closeSheet);
  /* a tap on a phone leaves the box "pointed at"; let go of it when its panel closes or the map is tapped between boxes */
  function unhover(){ [].forEach.call(document.querySelectorAll('#csw .cs-n'), function(n){ n.dispatchEvent(new MouseEvent('mouseleave')); }); }
  document.addEventListener('click', function(e){ if (!Q.matches) return; if (e.target.closest('.cs-panel .cs-ph .x')) setTimeout(unhover, 30); }, true);
  document.addEventListener('keydown', function(e){ if (e.key !== 'Escape') return; if (sheet.classList.contains('open')) closeSheet(); else if (MM.on) leaveMap(true); });

  /* ---------- the full-screen map ---------- */
  var MM = { on: false, auto: false, skip: false, s: 1, tx: 0, ty: 0, base: 0 };
  function grid(){ var w = document.querySelector('#csw .cs-mapwrap'); return w && w.parentNode; }
  function fit(){
    var g = grid(); if (!g || !MM.on) return; var mi = g.querySelector('.cs-mapin'), svg = mi && mi.querySelector('svg'); if (!svg) return;
    var vb = (svg.getAttribute('viewBox') || '0 0 1200 800').split(/\s+/).map(Number), ar = vb[3] / vb[2];
    var W = window.innerWidth - 12, H = window.innerHeight - (land() ? 22 : 120);
    var w = Math.min(W, H / ar); mi.style.width = Math.floor(w) + 'px'; MM.base = w; apply();
  }
  function apply(){ var g = grid(); if (!g) return; var mi = g.querySelector('.cs-mapin'); if (!mi) return;
    mi.style.transform = MM.s === 1 ? '' : 'translate(' + MM.tx + 'px,' + MM.ty + 'px) scale(' + MM.s + ')';
    var z = g.querySelector('.mm-zoom'); if (z) { z.textContent = Math.round(MM.s * 100) + '%'; z.classList.toggle('on', MM.s > 1.01); } }
  function clamp(){ MM.s = Math.max(1, Math.min(5, MM.s)); if (MM.s === 1) { MM.tx = 0; MM.ty = 0; return; }
    var g = grid(), mi = g && g.querySelector('.cs-mapin'); if (!mi) return; var w = mi.offsetWidth, h = mi.offsetHeight;
    var minX = w - w * MM.s, minY = h - h * MM.s; MM.tx = Math.min(w * .25, Math.max(minX - w * .25, MM.tx)); MM.ty = Math.min(h * .25, Math.max(minY - h * .25, MM.ty)); }
  function zoomAt(cx, cy, ns){ var g = grid(), mi = g.querySelector('.cs-mapin'), r = mi.getBoundingClientRect();
    var ox = (cx - r.left) / MM.s, oy = (cy - r.top) / MM.s; // the point under the finger, in map space
    var base = r.left - MM.tx, baseT = r.top - MM.ty; MM.s = Math.max(1, Math.min(5, ns)); MM.tx = cx - base - ox * MM.s; MM.ty = cy - baseT - oy * MM.s; clamp(); apply(); }
  function ui(g){
    if (g.querySelector('.mm-ui')) return;
    var mk = function(cls, html, label, fn){ var b = document.createElement('button'); b.type = 'button'; b.innerHTML = html; b.setAttribute('aria-label', label); b.addEventListener('click', fn); return b; };
    var L = document.createElement('div'); L.className = 'mm-ui l';
    L.appendChild(mk('', '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>Back', 'Leave the full-screen map', function(){ leaveMap(true); }));
    var R = document.createElement('div'); R.className = 'mm-ui r';
    R.appendChild(mk('', '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>Fit', 'Fit the whole map', function(){ MM.s = 1; MM.tx = 0; MM.ty = 0; apply(); }));
    var key = mk('', '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h13"/></svg>Key', 'Show the key', function(){ var on = g.classList.toggle('mm-key'); key.setAttribute('aria-pressed', String(on)); });
    key.setAttribute('aria-pressed','false'); R.appendChild(key);
    var z = document.createElement('div'); z.className = 'mm-zoom'; z.setAttribute('aria-hidden','true');
    var w = g.querySelector('.cs-mapwrap'); w.appendChild(L); w.appendChild(R); w.appendChild(z);
  }
  function enterMap(auto){
    var g = grid(); if (!g || MM.on) return; MM.on = true; MM.auto = !!auto; MM.s = 1; MM.tx = 0; MM.ty = 0;
    if (cur() !== 'overview') go('overview');
    root.classList.add('mapmode'); g.classList.add('mm-on'); ui(g); fit();
    if (!sessionStorage.getItem('cs-mm-hint')) { try { sessionStorage.setItem('cs-mm-hint','1'); } catch(e){} var hn = document.createElement('div'); hn.className = 'mm-hint'; hn.textContent = 'Pinch to zoom · drag to move · tap a box'; g.querySelector('.cs-mapwrap').appendChild(hn); setTimeout(function(){ hn.remove(); }, 4600); }
  }
  function leaveMap(byHand){
    var g = grid(); MM.on = false; if (byHand && land()) MM.skip = true;
    root.classList.remove('mapmode'); if (!g) return; g.classList.remove('mm-on','mm-key');
    var mi = g.querySelector('.cs-mapin'); if (mi) { mi.style.width = ''; mi.style.transform = ''; }
    [].forEach.call(g.querySelectorAll('.mm-ui,.mm-zoom,.mm-hint'), function(x){ x.remove(); });
    var mw = g.querySelector('.cs-mapwrap'); if (byHand && mw) window.scrollTo(0, Math.max(0, mw.getBoundingClientRect().top + window.scrollY - 70));
  }
  /* pinch, drag and double-tap on the full-screen map; a plain tap still selects a box */
  var pts = {}, start = null, moved = false, lastTap = 0;
  document.addEventListener('pointerdown', function(e){ if (!MM.on || !e.target.closest('.mm-on .cs-mapbox')) return;
    pts[e.pointerId] = { x: e.clientX, y: e.clientY }; var k = Object.keys(pts);
    if (k.length === 1) { start = { x: e.clientX, y: e.clientY, tx: MM.tx, ty: MM.ty }; moved = false; }
    if (k.length === 2) { var a = pts[k[0]], b = pts[k[1]]; start = { d: Math.hypot(a.x - b.x, a.y - b.y), s: MM.s, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; moved = true; }
  }, true);
  document.addEventListener('pointermove', function(e){ if (!MM.on || !pts[e.pointerId] || !start) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY }; var k = Object.keys(pts);
    if (k.length >= 2 && start.d) { var a = pts[k[0]], b = pts[k[1]]; var d = Math.hypot(a.x - b.x, a.y - b.y); zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, start.s * d / start.d); start.s = MM.s; start.d = d; return; }
    if (k.length === 1 && start.x != null) { var dx = e.clientX - start.x, dy = e.clientY - start.y; if (!moved && Math.hypot(dx, dy) < 8) return; moved = true;
      if (MM.s > 1) { MM.tx = start.tx + dx; MM.ty = start.ty + dy; clamp(); apply(); } }
  }, true);
  function up(e){ if (!pts[e.pointerId]) return; delete pts[e.pointerId]; var k = Object.keys(pts);
    if (!k.length) { if (!moved && MM.on && e.type === 'pointerup') { if (!e.target.closest('.cs-n')) unhover(); var now = Date.now(); if (now - lastTap < 300 && !e.target.closest('.cs-n')) { zoomAt(e.clientX, e.clientY, MM.s > 1.2 ? 1 : 2.4); lastTap = 0; } else lastTap = now; } start = null; }
    else { var p = pts[k[0]]; start = { x: p.x, y: p.y, tx: MM.tx, ty: MM.ty }; } }
  document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', up, true);
  /* a drag must not also count as a tap on a box */
  document.addEventListener('click', function(e){ if (MM.on && moved && e.target.closest('.mm-on .cs-mapbox')) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);

  /* ---------- turning the phone ---------- */
  function rotBanner(){
    var w = document.querySelector('#csw .cs-mapwrap'); if (!w || w.querySelector('.mm-rot') || w.parentNode.previousElementSibling && w.parentNode.previousElementSibling.classList && w.parentNode.previousElementSibling.classList.contains('mm-rot')) return;
    var r = document.createElement('div'); r.className = 'mm-rot'; r.innerHTML = ROT + '<div><b>Turn Your Phone Sideways</b><span>The whole System Map opens full screen.</span></div>';
    var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Full Screen'; b.addEventListener('click', function(){ enterMap(false); }); r.appendChild(b);
    w.parentNode.parentNode.insertBefore(r, w.parentNode);
  }
  function sync(){
    var ph = Q.matches; root.classList.toggle('ph', ph); root.classList.toggle('land', land());
    if (!ph) { closeSheet(); if (MM.on) leaveMap(false); return; }
    paintTab(); rotBanner();
    if (land() && cur() === 'overview' && !MM.on && !MM.skip && grid()) enterMap(true);
    if (!land()) { MM.skip = false; if (MM.on && MM.auto) leaveMap(false); }
    if (MM.on) fit();
  }
  var tmr; function later(){ clearTimeout(tmr); tmr = setTimeout(sync, 120); }
  window.addEventListener('resize', later); window.addEventListener('orientationchange', later);
  if (Q.addEventListener) Q.addEventListener('change', later);
  /* repaint the tab bar whenever the page changes or the map is redrawn */
  new MutationObserver(function(){ if (Q.matches) { paintTab(); rotBanner(); if (MM.on) { var g = grid(); if (g && !g.classList.contains('mm-on')) { g.classList.add('mm-on'); ui(g); fit(); } } else if (land() && cur() === 'overview' && !MM.skip && grid()) enterMap(true); } })
    .observe(document.getElementById('nav'), { attributes: true, subtree: true, childList: true, attributeFilter: ['aria-current'] });
  new MutationObserver(function(){ if (Q.matches) later(); }).observe(document.getElementById('csw'), { childList: true });
  /* the browser's Back button closes the More sheet, then leaves the full-screen map (CN-033) */
  if (window.MismoBack) {
    MismoBack.layer({ isOpen: function(){ return MM.on; }, close: function(){ leaveMap(true); } });
    MismoBack.layer({ isOpen: function(){ return sheet.classList.contains('open'); }, close: closeSheet });
  }
  window.__csPhone = { enterMap: enterMap, leaveMap: leaveMap, sync: sync, state: MM };
  sync();
})();
</script>
</body>
</html>
'''
import sys, datetime
build=sys.argv[1] if len(sys.argv)>1 else datetime.datetime.utcnow().strftime('%Y%m%d-%H%M')
out=page.replace('__ICONS__',json.dumps(ICONS)).replace('__META__',head_meta).replace('__CSS__',css_shell).replace('__DEFS__',defs).replace('__RAIL__',rail_js).replace('__BUILD__',build).replace('__ICONS__',json.dumps(ICONS)).replace('__I_overview__',ICONS['overview']).replace('__I_help__',ICONS['help'])
open(sys.argv[2] if len(sys.argv)>2 else __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','index.html'),'w').write(out)
print('built',build,len(out))
