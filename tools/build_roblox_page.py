"""Build roblox-security/index.html from its markdown sources.

    python tools/build_roblox_page.py           write the page
    python tools/build_roblox_page.py --check   exit 1 if the page is out of date

Sources (the source of truth; never edit index.html by hand):
    roblox-security/source/case-study.md   the review: title, Date/Reviewer/Scope/Method
                                           lines, then ## sections; under ## Findings,
                                           one ### per finding with "- Label: text" lines
    roblox-security/source/page.md         front matter (title, description, category,
                                           tags, role), then ## Intro and ## Contact
    tools/roblox_page.html                 the HTML and CSS around them

Markdown supported: paragraphs, - lists, 1. lists, | tables |, `code`, **bold**
and [links](https://... or mailto:...). Anything else stops the build with a message rather
than guessing. Standard library only.
"""

import argparse
import datetime
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CASE_STUDY = ROOT / 'roblox-security' / 'source' / 'case-study.md'
PAGE = ROOT / 'roblox-security' / 'source' / 'page.md'
TEMPLATE = ROOT / 'tools' / 'roblox_page.html'
OUT = ROOT / 'roblox-security' / 'index.html'

# Chip colours the template's CSS defines. A new value needs a colour there first.
SEVERITY_CLASS = {'Critical': 'sev-critical', 'High': 'sev-high'}
STATUS_CLASS = {'Verified fixed': 'ok'}


class BuildError(Exception):
    pass


def esc(text):
    return html.escape(text, quote=False)


def inline(text):
    """`code`, **bold** and [label](https://url or mailto:address); everything else is escaped text."""
    out = []
    pos = 0
    pattern = re.compile(r'`([^`]+)`|\*\*(.+?)\*\*|\[([^\]]+)\]\(((?:https?://|mailto:)[^)\s]+)\)')
    for m in pattern.finditer(text):
        out.append(esc(text[pos:m.start()]))
        if m.group(1) is not None:
            out.append('<code>%s</code>' % esc(m.group(1)))
        elif m.group(2) is not None:
            out.append('<strong>%s</strong>' % inline(m.group(2)))
        else:
            out.append('<a href="%s">%s</a>' % (html.escape(m.group(4)), inline(m.group(3))))
        pos = m.end()
    out.append(esc(text[pos:]))
    result = ''.join(out)
    # Markdown this script does not understand would otherwise reach the page as raw symbols.
    outside_code = re.sub(r'<code>.*?</code>', '', result)
    if '`' in outside_code or '**' in outside_code or '](' in outside_code:
        raise BuildError('unsupported or unclosed inline markdown in: %s' % text)
    return result


def blocks(lines):
    """Split lines into ('p', text), ('ul', items), ('ol', items) and ('table', rows)."""
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith('#'):
            raise BuildError('unexpected heading here: %s' % line)
        if line.startswith('- '):
            items = []
            while i < len(lines) and lines[i].startswith('- '):
                items.append(lines[i][2:].strip())
                i += 1
            out.append(('ul', items))
        elif re.match(r'\d+\. ', line):
            items = []
            while i < len(lines) and re.match(r'\d+\. ', lines[i]):
                items.append(re.sub(r'^\d+\. ', '', lines[i]).strip())
                i += 1
            out.append(('ol', items))
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', c) for c in cells):
                    rows.append(cells)
                i += 1
            out.append(('table', rows))
        else:
            para = []
            while i < len(lines) and lines[i].strip() and not re.match(r'(- |\d+\. |\||#)', lines[i]):
                para.append(lines[i].strip())
                i += 1
            out.append(('p', ' '.join(para)))
    return out


def chip(value, classes, what):
    if value not in classes:
        raise BuildError('no chip colour for %s "%s"; known: %s. Add a colour to the CSS in '
                         'tools/roblox_page.html and to %s in this script.'
                         % (what, value, ', '.join(classes), 'SEVERITY_CLASS' if what == 'severity' else 'STATUS_CLASS'))
    return '<span class="chip %s">%s</span>' % (classes[value], esc(value))


def render_table(rows):
    head, body = rows[0], rows[1:]
    cols = [h.lower() for h in head]
    out = ['<div class="tablewrap" tabindex="0" role="region" aria-label="Findings summary"><table><thead><tr>']
    out += ['<th>%s</th>' % inline(h) for h in head]
    out.append('</tr></thead><tbody>')
    for row in body:
        if len(row) != len(head):
            raise BuildError('table row has %d cells, header has %d: %s' % (len(row), len(head), row))
        out.append('<tr>')
        for col, cell in zip(cols, row):
            if col == 'finding' and '#' in cols and row[cols.index('#')].isdigit():
                # Each summary row jumps to its finding, whose heading has id fN.
                out.append('<td><a href="#f%s">%s</a></td>' % (row[cols.index('#')], inline(cell)))
            elif col == 'severity':
                out.append('<td>%s</td>' % chip(cell, SEVERITY_CLASS, 'severity'))
            elif col == 'status':
                out.append('<td>%s</td>' % chip(cell, STATUS_CLASS, 'status'))
            else:
                out.append('<td>%s</td>' % inline(cell))
        out.append('</tr>')
    out.append('</tbody></table></div>')
    return ''.join(out)


def render_blocks(parsed):
    out = []
    for kind, value in parsed:
        if kind == 'p':
            out.append('<p>%s</p>' % inline(value))
        elif kind == 'ol':
            out.append('<ol>%s</ol>' % ''.join('<li>%s</li>' % inline(v) for v in value))
        elif kind == 'ul':
            out.append('<ul>%s</ul>' % ''.join('<li>%s</li>' % inline(v) for v in value))
        else:
            out.append(render_table(value))
    return '\n'.join(out)


def render_facts(pairs):
    return '<dl class="facts">%s</dl>' % ''.join(
        '<dt>%s</dt><dd>%s</dd>' % (esc(k), inline(v)) for k, v in pairs)


def sections(lines, level):
    """Split at headings of the given level: [(heading, lines)], with the lines before the first."""
    mark = '#' * level + ' '
    head, found = [], []
    for line in lines:
        if line.startswith(mark):
            found.append((line[len(mark):].strip(), []))
        elif found:
            found[-1][1].append(line)
        else:
            head.append(line)
    return head, found


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def read_page():
    text = PAGE.read_text(encoding='utf-8').replace('\r\n', '\n')
    m = re.match(r'---\n(.*?)\n---\n', text, re.S)
    if not m:
        raise BuildError('%s must start with --- front matter ---' % PAGE.name)
    meta = {}
    for line in m.group(1).splitlines():
        key, _, value = line.partition(':')
        meta[key.strip()] = value.strip()
    for key in ('title', 'description', 'category', 'tags', 'role'):
        if not meta.get(key):
            raise BuildError('%s front matter needs "%s"' % (PAGE.name, key))
    _, secs = sections(text[m.end():].splitlines(), 2)
    parts = dict(secs)
    for name in ('Intro', 'Contact'):
        if name not in parts:
            raise BuildError('%s needs a "## %s" section' % (PAGE.name, name))
    return meta, parts


def build():
    meta, parts = read_page()
    lines = CASE_STUDY.read_text(encoding='utf-8').replace('\r\n', '\n').splitlines()
    if not lines or not lines[0].startswith('# '):
        raise BuildError('%s must start with "# Title"' % CASE_STUDY.name)
    heading = lines[0][2:].strip()
    head, secs = sections(lines[1:], 2)

    fields = []
    for line in head:
        if line.strip():
            key, sep, value = line.partition(': ')
            if not sep:
                raise BuildError('expected "Key: value" before the first section, got: %s' % line)
            fields.append((key.strip(), value.strip()))
    info = dict(fields)
    for key in ('Date', 'Reviewer'):
        if key not in info:
            raise BuildError('%s needs a "%s:" line' % (CASE_STUDY.name, key))
    reviewer = info['Reviewer']
    try:
        date_iso = datetime.datetime.strptime(info['Date'], '%d %B %Y').date().isoformat()
    except ValueError:
        raise BuildError('Date must read like "12 October 2026", got: %s' % info['Date'])

    def post(body):
        return ('<article class="post">\n'
                '<div class="who"><span class="avatar" aria-hidden="true">%s</span></div>\n'
                '<div class="what">\n'
                '<div class="meta"><strong>%s</strong><span class="role">%s</span><span class="when">%s</span></div>\n'
                '%s\n'
                '</div>\n'
                '</article>') % (esc(reviewer[:1].upper()), esc(reviewer), esc(meta['role']), esc(info['Date']), body)

    intro = render_blocks(blocks(parts['Intro']))
    facts = [(k, v) for k, v in fields if k not in ('Date', 'Reviewer')]
    posts = [post(intro + '\n' + render_facts(facts) if facts else intro)]

    for title, body in secs:
        if title == 'Findings':
            _, findings = sections(body, 3)
            for name, flines in findings:
                m = re.fullmatch(r'(\d+)\. (.+) \((\w+)\)', name)
                if not m:
                    raise BuildError('finding heading must read "### N. Name (Severity)": %s' % name)
                pairs = []
                for kind, value in blocks(flines):
                    if kind != 'ul':
                        raise BuildError('finding %s: only "- Label: text" lines are supported' % m.group(1))
                    for item in value:
                        label, sep, text = item.partition(': ')
                        if not sep:
                            raise BuildError('finding %s: "%s" needs "Label: text"' % (m.group(1), item))
                        pairs.append((label, text))
                h2 = '<h2 id="f%s">%s. %s %s</h2>' % (m.group(1), m.group(1), inline(m.group(2)),
                                                     chip(m.group(3), SEVERITY_CLASS, 'severity'))
                posts.append(post(h2 + '\n' + render_facts(pairs)))
        else:
            posts.append(post('<h2 id="%s">%s</h2>\n%s' % (slug(title), esc(title), render_blocks(blocks(body)))))

    contact = blocks(parts['Contact'])
    if len(contact) != 1 or contact[0][0] != 'p':
        raise BuildError('## Contact must be one paragraph')

    crumbs = '<span class="cat">%s</span>' % esc(meta['category']) + ''.join(
        '<span class="tag">%s</span>' % esc(t.strip()) for t in meta['tags'].split(',') if t.strip())

    url = 'https://zainsplace.github.io/roblox-security/'
    # Article metadata for search and link previews. "<" is escaped so no text can close the tag.
    jsonld = json.dumps({
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': heading,
        'description': meta['description'],
        'url': url,
        'mainEntityOfPage': url,
        'datePublished': date_iso,
        'dateModified': date_iso,
        'image': 'https://zainsplace.github.io/og.png',
        'author': {'@type': 'Person', 'name': 'Zain', 'alternateName': reviewer,
                   'url': 'https://zainsplace.github.io/'},
    }, ensure_ascii=False).replace('<', '\\u003c')

    page = TEMPLATE.read_text(encoding='utf-8').replace('\r\n', '\n')
    values = {
        'title': html.escape(meta['title']),
        'description': html.escape(meta['description']),
        'heading': esc(heading),
        'crumbs': crumbs,
        'posts': '\n'.join(posts),
        'contact': inline(contact[0][1]),
        'date_iso': date_iso,
        'jsonld': jsonld,
    }
    for key, value in values.items():
        if '{{%s}}' % key not in page:
            raise BuildError('template is missing {{%s}}' % key)
        page = page.replace('{{%s}}' % key, value)
    if '{{' in page:
        raise BuildError('template has a placeholder this script does not fill: %s'
                         % re.search(r'\{\{[^}]*\}\}', page).group(0))
    return page


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true', help='exit 1 if index.html is out of date')
    args = parser.parse_args()
    try:
        page = build()
    except BuildError as e:
        print('build_roblox_page: %s' % e, file=sys.stderr)
        return 2
    current = OUT.read_text(encoding='utf-8').replace('\r\n', '\n') if OUT.exists() else ''
    if args.check:
        if current != page:
            print('roblox-security/index.html is out of date: run python tools/build_roblox_page.py')
            return 1
        print('roblox-security/index.html is up to date.')
        return 0
    OUT.write_text(page, encoding='utf-8', newline='\n')
    print('Wrote roblox-security/index.html (%d bytes).' % len(page.encode('utf-8')))
    return 0


if __name__ == '__main__':
    sys.exit(main())
