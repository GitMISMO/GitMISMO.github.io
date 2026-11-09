"""Builds assets/home-index.json, what the home page's search finds inside the Initiative Hub:
its initiatives and workgroups. (Potential initiatives are read live by the page, so new ones
appear without this.) Run from the repository root, with initiative-hub cloned beside it:

    python3 _internal/build-home-index.py ../initiative-hub

Rerun when an initiative is added or renamed, or the workgroup list changes."""
import re, json, sys, os
hub = sys.argv[1] if len(sys.argv) > 1 else '../initiative-hub'
def short(s, n=150):
    s = re.sub(r'\s+', ' ', s or '').strip()
    return s if len(s) <= n else s[:n].rsplit(' ', 1)[0] + '\u2026'
items = []
idx = open(os.path.join(hub, 'index.html'), encoding='utf-8').read()
# Other names people search by (6 Nov 2026): the library page's LIB_AKA ('Title': 'MCD ...'), and each initiative's
# lifecycle domain from LIB_PLACE. (Before the library was redone, acronyms came from its old domain list, which had three:
# MCD, AI and MI; those are kept below for workgroups named after those domains.)
def js_map(name):
    m = re.search(r'const ' + name + r' = \{(.*?)\};', idx, re.S)
    return dict(re.findall(r"'((?:[^'\\]|\\.)+)':\s*'((?:[^'\\]|\\.)*)'", m.group(1))) if m else {}
AKA, PLACE = js_map('LIB_AKA'), js_map('LIB_PLACE')
ABBR = {'Mortgage Compliance': 'MCD', 'Artificial Intelligence': 'AI', 'Mortgage Insurance': 'MI'}
def with_abbr(title, domains):
    """Its old domains, its lifecycle domain, its other names, and the acronym of any domain it names."""
    t = title.replace('&amp;', '&')
    extra = [ABBR[d] for d in domains if d in ABBR] + [a for d, a in ABBR.items() if d.lower() in t.lower()]
    extra += [v for k, v in AKA.items() if k.lower() in t.lower()]          # a workgroup named after an initiative gets its acronym
    life = [PLACE[t]] if t in PLACE else []
    return ' '.join(dict.fromkeys(list(domains) + life + sorted(set(extra))))
start = idx.index('const initiatives = [')
blk = idx[start:idx.index('\n  ];', start) + 1]   # through the last entry's closing line
for m in re.finditer(r"\{\s*title:\s*'((?:[^'\\]|\\.)*)'(.*?)\n\s*\},?\n", blk, re.S):
    title = m.group(1).replace("\\'", "'"); rest = m.group(2)
    href = (re.search(r"href:\s*'([^']*)'", rest) or [None, ''])[1]
    what = (re.search(r"whatIsIt:\s*'((?:[^'\\]|\\.)*)'", rest) or [None, ''])[1].replace("\\'", "'")
    doms = re.findall(r"'([^']+)'", (re.search(r"domains?:\s*(\[[^\]]*\])", rest) or [None, '[]'])[1])
    items.append({'t': title.replace('&amp;', '&'), 'k': 'Initiative', 'o': 'hub', 'd': short(what), 'x': with_abbr(title, doms),
                  'h': '/initiative-hub/' + (href if href and href != '#' else '')})
# the workgroups, from the list Work Requests uses (const L = {...} at the top of work-requests.js)
src = open(os.path.join(hub, 'work-requests.js'), encoding='utf-8').read()
L = json.JSONDecoder().raw_decode(src[src.index('const L = ') + len('const L = '):])[0]
names = L.get('workgroups', [])
for w in names:
    items.append({'t': w, 'k': 'Workgroup', 'o': 'hub', 'd': 'Meetings on the Initiative Hub calendar', 'x': with_abbr(w, []), 'h': '/initiative-hub/calendar.html'})
json.dump({'built': 'see _internal/build-home-index.py', 'abbr': ABBR, 'items': items}, open('assets/home-index.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(len(items), 'items:', sum(1 for i in items if i['k'] == 'Initiative'), 'initiatives,', sum(1 for i in items if i['k'] == 'Workgroup'), 'workgroups')
