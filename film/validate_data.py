#!/usr/bin/env python3
"""Check the Film Studies data and the component manifest before publishing.

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
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, 'data')

UNITS = {'u1': ('unit1', list('abck')), 'u2': ('unit2', list('abk'))}
SHARED = {'k'}          # data/shared/k.json, the Film Toolkit, in both components
PAPER_MARKS = {'u1': 120, 'u2': 60}   # C2 papers cover Sections A (40) + B (20) only

errors = []
warnings = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def load(folder, name):
    if name in SHARED:
        folder = 'shared'
    with open(os.path.join(DATA, folder, name + '.json'), encoding='utf-8') as f:
        return json.load(f)


def dicts_of(obj, out):
    if isinstance(obj, dict):
        out.append(obj)
        for v in obj.values():
            dicts_of(v, out)
    elif isinstance(obj, list):
        for v in obj:
            dicts_of(v, out)
    return out


def items_of(obj):
    return [d for d in dicts_of(obj, []) if d.get('code') and d.get('term')]


def terms_without_code(obj):
    """A term with no code cannot be rated, searched or tracked. This has to walk
    every object: items_of() only returns objects that HAVE a code, so asking it
    for codeless items can never find one."""
    return [d['term'] for d in dicts_of(obj, []) if d.get('term') and not d.get('code')]


# app.js builds most pages with innerHTML and puts ids and codes inside onclick
# attributes, so content is trusted as markup. Rather than trust every future
# edit, the characters that would let text become markup are kept out of it: no
# '<' anywhere (write "less than", or use the ≤ sign), and ids/codes limited to
# characters that cannot close a quoted attribute.
SAFE_ID = re.compile(r'[A-Za-z0-9._-]+')
ID_FIELDS = ('id', 'code', 'scenario', 'paperId', 'category', 'section')


def unsafe_strings(obj, key=None, out=None):
    out = [] if out is None else out
    if isinstance(obj, dict):
        for k, v in obj.items():
            unsafe_strings(v, k, out)
    elif isinstance(obj, list):
        for v in obj:
            unsafe_strings(v, key, out)
    elif isinstance(obj, str):
        if '<' in obj:
            out.append('%s contains "<": %r' % (key, obj[:60]))
        elif key in ID_FIELDS and not SAFE_ID.fullmatch(obj):
            out.append('%s %r may only use letters, digits, ".", "_" and "-"' % (key, obj))
    return out


# The checks above guard the live content, so they are run against known-bad
# input first. A check that cannot fail would pass broken content silently.
_bad = {'items': [{'code': 'A1.1', 'term': 'ok'}, {'term': 'no code'}]}
if terms_without_code(_bad) != ['no code'] or len(items_of(_bad)) != 1:
    err('self-test: the term-without-code check no longer detects a missing code')
if len(unsafe_strings({'id': "a'b", 'term': '<img>', 'definition': 'x > y'})) != 2:
    err('self-test: the markup check no longer detects unsafe content')


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
        letters = re.findall(r"'([a-z])'", order.group(1)) if order else []
        secs = {}
        for m in re.finditer(r"\n\s+([a-z]):\s*\{([^}]*)\}", body):
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

        items = items_of(d)
        for it in items:
            all_codes.append(it['code'])

        # Notes are kept to flashcard length: games show definitions whole, and
        # the Match game truncates anything past 120 characters.
        long_defs = [it['code'] for it in items if len(it.get('definition', '')) > 120]
        if long_defs:
            err('%s/%s.json: definitions over 120 characters: %s' % (unit, letter, ', '.join(long_defs[:5])))

        missing = terms_without_code(d)
        if missing:
            err('%s/%s.json: %d item(s) with a term but no code: %s'
                % (unit, letter, len(missing), ', '.join(missing[:5])))

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
            # Traps are shown as plain text (marker list and PPP tips), so
            # **bold** markup would appear as literal asterisks.
            if any('**' in t for t in q.get('traps', [])):
                err('%s: question %s has ** in a trap; traps are plain text' % (unit, q['id']))
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
                if q['marks'] % 5 or not ms.get('indicative'):
                    err('%s: question %s levels need marks divisible by 5 (five bands) and indicative content'
                        % (unit, q['id']))
            elif kind not in ('points', 'chain'):
                err('%s: question %s has unknown mark scheme type %r' % (unit, q['id'], kind))
        # PPP: sealed papers copy the real exam's shape and stay out of the
        # practice bank, and every section needs enough unsealed parts for a
        # topic set (5). Units with no sealed paper skip these checks.
        sealed_scen = set()
        for p in qfile.get('papers', []):
            if p.get('sealed'):
                sealed_scen.update(p.get('scenarios', []))
                total = sum(q['marks'] for q in qs if q.get('scenario') in p.get('scenarios', []))
                if total != PAPER_MARKS[unit]:
                    err('%s: sealed paper %s totals %d marks, not %d' % (unit, p.get('id'), total, PAPER_MARKS[unit]))
        for s in qfile.get('scenarios', []):
            got = sum(q['marks'] for q in qs if q.get('scenario') == s['id'])
            if 'total' in s and got != s['total']:
                err('%s: scenario %s says %d marks but its parts add up to %d'
                    % (unit, s['id'], s['total'], got))
            elif 'total' not in s and s['id'] in sealed_scen:
                err('%s: sealed scenario %s needs a "total"' % (unit, s['id']))
        if sealed_scen:
            note_codes = set()
            for letter in letters:
                try:
                    note_codes.update(d['code'] for d in dicts_of(load(folder, letter), []) if 'code' in d)
                except FileNotFoundError:
                    pass
            for q in qs:
                if not q.get('section') or q.get('code') not in note_codes:
                    err('%s: question %s has no section or a code that is not in the notes (%r)'
                        % (unit, q['id'], q.get('code')))
                if q.get('section') and q.get('code') and not q['code'].startswith(q['section']):
                    err('%s: question %s code %s is not in section %s'
                        % (unit, q['id'], q['code'], q['section']))
            bank = [q for q in qs if q.get('scenario') not in sealed_scen]
            for letter in [l for l in letters if l not in SHARED]:
                n = sum(1 for q in bank if q.get('section') == letter.upper())
                if n < 5:
                    err('%s: Section %s has %d unsealed parts; a topic set needs 5'
                        % (unit, letter.upper(), n))
    except (FileNotFoundError, KeyError) as e:
        err('%s: questions.json unreadable (%s)' % (unit, e))

    # Sections path: written scenario questions, keyed by spec code. Every
    # lesson term must have at least one, or its lesson is definitions only.
    lesson_qs = 0
    lesson_codes = set()
    for letter in letters:
        path = os.path.join(DATA, 'shared' if letter in SHARED else folder, 'lessons', letter + '.json')
        if not os.path.exists(path):
            continue   # written lesson questions are optional; the path also builds questions from the notes
        with open(path, encoding='utf-8') as f:
            bank = json.load(f)
        for code, qs in bank.items():
            lesson_codes.add(code)
            if code not in all_codes:
                err('%s: lessons/%s.json has questions for unknown code %s' % (unit, letter, code))
            if not isinstance(qs, list) or not qs:
                err('%s: lesson %s needs a non-empty list of questions' % (unit, code))
                continue
            for i, q in enumerate(qs):
                where = '%s: lesson %s question %d' % (unit, code, i + 1)
                opts = q.get('options') if isinstance(q, dict) else None
                if not isinstance(opts, list) or not 3 <= len(opts) <= 4:
                    err(where + ' needs 3 or 4 options')
                    continue
                if len(set(o.strip().lower() for o in opts)) != len(opts):
                    err(where + ' has duplicate options')
                ans = q.get('answer')
                if not isinstance(ans, int) or not 0 <= ans < len(opts):
                    err(where + ' answer index is out of range')
                if not str(q.get('q', '')).strip() or not str(q.get('why', '')).strip():
                    err(where + ' needs both q and why text')
                lesson_qs += 1
    missing_lessons = [c for c in all_codes if '-' not in c and c not in lesson_codes]
    if missing_lessons:
        warn('%s: %d terms have no written lesson questions (the path still quizzes them from the notes)'
             % (unit, len(missing_lessons)))

    print('%s: %d item codes, %d flashcards, %d questions, %d lesson questions'
          % (unit, len(all_codes), len(all_cards), len(all_qs), lesson_qs))

for root, _, files in os.walk(DATA):
    for name in sorted(files):
        if not name.endswith('.json'):
            continue
        path = os.path.join(root, name)
        try:
            with open(path, encoding='utf-8') as f:
                problems = unsafe_strings(json.load(f))
        except ValueError as e:
            err('%s: not valid JSON (%s)' % (os.path.relpath(path, HERE).replace(os.sep, '/'), e))
            continue
        for p in problems[:5]:
            err('%s: %s' % (os.path.relpath(path, HERE).replace(os.sep, '/'), p))

# The build must be reproducible, or a rebuild silently rewrites live content.
# A failed build leaves the old bundle in place, which would compare equal and
# pass, so the build's own exit status is checked first.
inline_path = os.path.join(HERE, 'data_inline.js')
before = open(inline_path, encoding='utf-8').read() if os.path.exists(inline_path) else None
build = subprocess.run([sys.executable, os.path.join(HERE, 'build_inline.py')],
                       capture_output=True, text=True)
if build.returncode != 0:
    tail = (build.stderr or build.stdout).strip().splitlines()[-1:] or ['no output']
    err('build_inline.py failed (exit %d): %s' % (build.returncode, tail[0]))
elif not os.path.exists(inline_path):
    err('build_inline.py did not write data_inline.js')
elif before is not None and before != open(inline_path, encoding='utf-8').read():
    err('data_inline.js is not reproducible from data/: rebuilding changed it. '
        'Back-port the hand edits into data/<unit>/*.json first.')

# The site must work offline from a file:// URL, so nothing may be LOADED from
# another site. A plain link the student chooses to open (href="...") is not a
# load, so a short allow-list of link-only hosts is permitted: Pearson's own page,
# which replaces hosting their copyrighted past papers.
LINK_ONLY_HOSTS = ('www.eduqas.co.uk',)
# The page's own address, named for search engines and link previews. Never fetched.
SELF_URL_TAG = re.compile(r'<(link rel="canonical"|meta property="og:url") ')
for name in ('index.html', 'styles.css', 'app.js', 'ppp.js', 'timetable.js'):
    txt = open(os.path.join(HERE, name), encoding='utf-8').read()
    for m in re.finditer(r'https?://[^\s"\')]+', txt):
        url = m.group(0)
        if 'w3.org' in url:
            continue
        host = re.sub(r'^https?://', '', url).split('/')[0]
        if host in LINK_ONLY_HOSTS and txt[max(0, m.start() - 6):m.start()] == 'href="':
            continue
        tag = txt[txt.rfind('<', 0, m.start()):m.start()]
        if host == 'zainsplace.github.io' and SELF_URL_TAG.match(tag):
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
