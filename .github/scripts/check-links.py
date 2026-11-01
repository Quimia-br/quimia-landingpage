#!/usr/bin/env python3
"""Confere os links internos do site: href, src, poster e srcset dos HTML e url() dos CSS.

Uso: python3 .github/scripts/check-links.py site
Só olha caminhos e âncoras do próprio site; http(s), mailto, tel e data: são ignorados.
Sai com código 1 se algum arquivo não existir. Âncora (#id) que não existe só gera aviso.
"""
import re
import sys
from pathlib import Path
from urllib.parse import unquote

ATTR = re.compile(r'\b(?:href|src|poster|data-src)\s*=\s*(?:"([^"]*)"|\'([^\']*)\')', re.I)
SRCSET = re.compile(r'\bsrcset\s*=\s*"([^"]*)"', re.I)
CSS_URL = re.compile(r'url\(\s*(?:"([^"]*)"|\'([^\']*)\'|([^)\s]*))\s*\)', re.I)
ID = re.compile(r'\b(?:id|name)\s*=\s*(?:"([^"]*)"|\'([^\']*)\')', re.I)
SKIP = re.compile(r'^(?:[a-z][a-z0-9+.-]*:|//|\{\{)', re.I)

root = Path(sys.argv[1] if len(sys.argv) > 1 else 'site').resolve()
errors = []    # arquivo que não existe: reprova o CI
warnings = []  # âncora que não existe: só avisa
ids_cache = {}


def ids_of(page):
    if page not in ids_cache:
        text = page.read_text(encoding='utf-8')
        ids_cache[page] = {a or b for a, b in ID.findall(text)}
    return ids_cache[page]


def check(source, ref, line):
    ref = ref.strip()
    if not ref or SKIP.match(ref):
        return
    path, _, fragment = ref.partition('#')
    path = path.partition('?')[0]
    if path:
        base = root if path.startswith('/') else source.parent
        target = (base / unquote(path.lstrip('/'))).resolve()
        if target.is_dir():
            target = target / 'index.html'
    else:
        target = source
    rel = source.relative_to(root)
    if not target.exists():
        errors.append((rel, line, 'arquivo não existe: %s' % ref))
        return
    if fragment and fragment != 'top' and target.suffix == '.html' and unquote(fragment) not in ids_of(target):
        warnings.append((rel, line, 'âncora não existe: %s' % ref))


def line_of(text, pos):
    return text.count('\n', 0, pos) + 1


for page in sorted(root.rglob('*.html')):
    text = page.read_text(encoding='utf-8')
    for m in ATTR.finditer(text):
        check(page, m.group(1) or m.group(2) or '', line_of(text, m.start()))
    for m in SRCSET.finditer(text):
        for part in m.group(1).split(','):
            if part.strip():
                check(page, part.strip().split()[0], line_of(text, m.start()))

for sheet in sorted(root.rglob('*.css')):
    text = sheet.read_text(encoding='utf-8')
    for m in CSS_URL.finditer(text):
        ref = m.group(1) or m.group(2) or m.group(3) or ''
        if not ref.startswith('#'):  # url(#id) aponta para um SVG no próprio arquivo
            check(sheet, ref, line_of(text, m.start()))

for rel, line, msg in warnings:
    print('::warning file=%s,line=%d::%s' % (rel.as_posix(), line, msg))
for rel, line, msg in errors:
    print('::error file=%s,line=%d::%s' % (rel.as_posix(), line, msg))
print('%d arquivo(s) HTML e CSS conferidos, %d erro(s), %d aviso(s)' % (
    len(list(root.rglob('*.html'))) + len(list(root.rglob('*.css'))), len(errors), len(warnings)))
sys.exit(1 if errors else 0)
