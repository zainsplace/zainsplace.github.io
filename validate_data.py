#!/usr/bin/env python3
"""Check the data and the unit manifest before committing.

Run:  python validate_data.py

What it does NOT check: cross-unit id collisions. Topic codes, flashcard ids and
question ids deliberately repeat between Unit 1 and Unit 2 — that is a property
of the content, and the reason progress is namespaced per unit. Uniqueness is
therefore only ever asserted *within* a unit.

Codes also legitimately repeat across nesting levels inside one file (a subtopic
and one of its items can share a code), so uniqueness is asserted at item level:
objects carrying both a `code` and a `term`.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, 'data')

UNITS = {'u1': ('unit1', list('abcdef')), 'u2': ('unit2', list('abcd'))}

errors = []
warnings = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def load(folder, name):
    with open(os.path.join(DATA, folder, name + '.json'), encoding='utf-8') as f:
        return json.load(f)


def items_of(obj, out):
    if isinstance(obj, dict):
        if obj.get('code') and obj.get('term'):
            out.append(obj)
        for v in obj.values():
            items_of(v, out)
    elif isinstance(obj, list):
        for v in obj:
            items_of(v, out)
    return out


def manifest_sections():
    """Read the UNITS manifest straight out of app.js so the two cannot drift."""
    src = open(os.path.join(HERE, 'app.js'), encoding='utf-8').read()
    out = {}
    for unit in UNITS:
        block = re.search(unit + r':\s*\{(.*?)\n  \}', src, re.S)
        if not block:
            err('manifest: no %s block found in app.js' % unit)
            continue
        body = block.group(1)
        order = re.search(r"order:\s*\[([^\]]*)\]", body)
        letters = re.findall(r"'([a-f])'", order.group(1)) if order else []
        secs = {}
        for m in re.finditer(r"\n\s+([a-f]):\s*\{([^}]*)\}", body):
            attrs = m.group(2)
            secs[m.group(1)] = {
                'colour': (re.search(r"colour:\s*'([^']+)'", attrs) or [None, None])[1],
                'shortName': (re.search(r"shortName:\s*'([^']+)'", attrs) or [None, None])[1],
                'blurb': (re.search(r"blurb:\s*'([^']+)'", attrs) or [None, None])[1],
            }
        out[unit] = {'order': letters, 'sections': secs}
    return out


manifest = manifest_sections()

for unit, (folder, letters) in UNITS.items():
    man = manifest.get(unit, {})
    order = man.get('order', [])
    secs = man.get('sections', {})

    if sorted(order) != sorted(letters):
        err('%s: manifest order %s does not match the unit\'s sections %s'
            % (unit, order, letters))
    if len(order) != len(set(order)):
        err('%s: manifest order repeats a letter: %s' % (unit, order))

    all_codes, all_cards, all_qs = [], [], []

    for letter in letters:
        try:
            d = load(folder, letter)
        except FileNotFoundError:
            err('%s: data/%s/%s.json is missing' % (unit, folder, letter))
            continue

        for field in ('section', 'title', 'tier'):
            if d.get(field) in (None, ''):
                err('%s/%s.json: missing "%s"' % (unit, letter, field))

        meta = secs.get(letter, {})
        for field in ('colour', 'shortName', 'blurb'):
            if not meta.get(field):
                err('%s manifest section %s: missing "%s"' % (unit, letter, field))

        items = items_of(d, [])
        for it in items:
            all_codes.append(it['code'])

        # Notes are kept to flashcard length: games show definitions whole, and
        # the Match game truncates anything past 120 characters.
        long_defs = [it['code'] for it in items if len(it.get('definition', '')) > 120]
        if long_defs:
            err('%s/%s.json: definitions over 120 characters: %s' % (unit, letter, ', '.join(long_defs[:5])))

        # A term with no code cannot be rated or tracked.
        missing = [t.get('title') or t.get('term')
                   for t in items_of(d, []) if not t.get('code')]
        if missing:
            err('%s/%s.json: %d item(s) with a term but no code' % (unit, letter, len(missing)))

    dupes = {c for c in all_codes if all_codes.count(c) > 1}
    if dupes:
        err('%s: item-level codes repeat within the unit: %s'
            % (unit, ', '.join(sorted(dupes))[:200]))

    try:
        cards = load(folder, 'flashcards')['cards']
        all_cards = [c['id'] for c in cards]
        if len(all_cards) != len(set(all_cards)):
            err('%s: duplicate flashcard ids' % unit)
        bad = [c['id'] for c in cards if not c.get('front') or not c.get('back')]
        if bad:
            err('%s: flashcards missing front/back: %s' % (unit, bad[:5]))
        long_backs = [c['id'] for c in cards if len(c.get('back', '')) > 140]
        if long_backs:
            err('%s: flashcard answers over 140 characters: %s' % (unit, ', '.join(long_backs[:5])))
    except (FileNotFoundError, KeyError) as e:
        err('%s: flashcards.json unreadable (%s)' % (unit, e))

    try:
        qs = load(folder, 'questions')['questions']
        all_qs = [q['id'] for q in qs]
        if len(all_qs) != len(set(all_qs)):
            err('%s: duplicate question ids' % unit)
        # Exam-style questions: every scenario reference resolves and every
        # mark scheme is one the marker in app.js knows how to score.
        qfile = load(folder, 'questions')
        scen_ids = {s['id'] for s in qfile.get('scenarios', [])}
        for p in qfile.get('papers', []):
            missing = [s for s in p.get('scenarios', []) if s not in scen_ids]
            if missing or not p.get('scenarios'):
                err('%s: mock paper %s has missing scenarios %s' % (unit, p.get('id'), missing))
        for q in qs:
            if q.get('scenario') and q['scenario'] not in scen_ids:
                err('%s: question %s points at unknown scenario %s' % (unit, q['id'], q['scenario']))
            ms = q.get('markScheme')
            if not ms:
                continue
            kind = ms.get('type')
            if kind == 'points' and not ms.get('points'):
                err('%s: question %s has an empty points mark scheme' % (unit, q['id']))
            elif kind == 'chain':
                steps = len(ms.get('steps', []))
                if not steps or any(len(p) != steps for p in ms.get('points', [])):
                    err('%s: question %s chain points do not match its steps' % (unit, q['id']))
            elif kind == 'levels':
                if q['marks'] % 3 or not ms.get('indicative'):
                    err('%s: question %s levels need marks divisible by 3 and indicative content'
                        % (unit, q['id']))
            elif kind not in ('points', 'chain'):
                err('%s: question %s has unknown mark scheme type %r' % (unit, q['id'], kind))
    except (FileNotFoundError, KeyError) as e:
        err('%s: questions.json unreadable (%s)' % (unit, e))

    print('%s: %d item codes, %d flashcards, %d questions'
          % (unit, len(all_codes), len(all_cards), len(all_qs)))

# The build must be reproducible, or a rebuild silently rewrites live content.
inline_path = os.path.join(HERE, 'data_inline.js')
before = open(inline_path, encoding='utf-8').read() if os.path.exists(inline_path) else None
os.system('%s "%s" > %s' % (sys.executable, os.path.join(HERE, 'build_inline.py'),
                            os.devnull))
after = open(inline_path, encoding='utf-8').read()
if before is not None and before != after:
    err('data_inline.js is not reproducible from data/: rebuilding changed it. '
        'Back-port the hand edits into data/<unit>/*.json first.')

# The site must work offline from a file:// URL.
for name in ('index.html', 'styles.css', 'app.js'):
    txt = open(os.path.join(HERE, name), encoding='utf-8').read()
    for m in re.finditer(r'https?://[^\s"\')]+', txt):
        url = m.group(0)
        if 'w3.org' in url:
            continue
        err('%s references an external URL, breaking offline use: %s' % (name, url))

print()
for w in warnings:
    print('WARN  ' + w)
for e in errors:
    print('ERROR ' + e)

if errors:
    print('\n%d error(s).' % len(errors))
    sys.exit(1)
print('All checks passed.')
