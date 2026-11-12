#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import json, sys, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'public'
errors, warnings = [], []
indexable_urls = set()
html_pages = sorted(PUB.rglob('index.html'))
prototype_terms = [
    'Objektname folgt', 'Adresse folgt', 'kann später', 'ist jetzt so angelegt',
    'bewusst ruhig und hochwertig aufgebaut', 'Testdatei', 'technische Platzhaltervorlage'
]

def url_for_page(p: Path) -> str:
    rel = p.relative_to(PUB)
    if rel == Path('index.html'):
        return '/'
    return '/' + rel.parent.as_posix().strip('/') + '/'

def local_target_exists(href: str) -> bool:
    path = urlparse(href).path
    if not path or path == '/':
        return (PUB/'index.html').exists()
    candidate = PUB / path.lstrip('/')
    if candidate.is_file(): return True
    if candidate.is_dir() and (candidate/'index.html').exists(): return True
    if not candidate.suffix and (PUB / (path.lstrip('/') + '/index.html')).exists(): return True
    return False

for p in html_pages:
    rel = p.relative_to(PUB)
    s = BeautifulSoup(p.read_text('utf-8'), 'html.parser')
    title = s.title.get_text(' ', strip=True) if s.title else ''
    desc = s.find('meta', attrs={'name':'description'})
    canonical = s.find('link', rel='canonical')
    robots = s.find('meta', attrs={'name':'robots'})
    h1 = s.find_all('h1')
    noindex = bool(robots and 'noindex' in robots.get('content','').lower())

    if not title: errors.append(f'{rel}: title fehlt')
    if not desc or not desc.get('content'): errors.append(f'{rel}: meta description fehlt')
    if not canonical: errors.append(f'{rel}: canonical fehlt')
    elif not canonical.get('href','').startswith('https://www.ic-group.de/'):
        errors.append(f'{rel}: canonical nicht auf www.ic-group.de: {canonical.get("href")}')
    if len(h1) != 1: warnings.append(f'{rel}: {len(h1)} H1-Elemente')
    if not robots: errors.append(f'{rel}: robots meta fehlt')

    if not noindex:
        indexable_urls.add(url_for_page(p))
        scripts = s.find_all('script', attrs={'type':'application/ld+json'})
        if not scripts: errors.append(f'{rel}: JSON-LD fehlt')
        for sc in scripts:
            try: json.loads(sc.string or sc.get_text())
            except Exception as e: errors.append(f'{rel}: JSON-LD ungültig: {e}')
        txt = s.get_text(' ', strip=True)
        for term in prototype_terms:
            if term.lower() in txt.lower():
                errors.append(f'{rel}: sichtbarer Prototype-/Platzhaltertext: {term}')

    for img in s.find_all('img'):
        if not img.has_attr('alt'):
            warnings.append(f'{rel}: Bild ohne alt: {img.get("src")}')

    for a in s.find_all('a', href=True):
        href = a['href'].strip()
        if not href or href.startswith(('#','mailto:','tel:','javascript:','http://','https://')):
            continue
        if href.startswith('/') and not local_target_exists(href):
            errors.append(f'{rel}: interner Link ohne Ziel: {href}')

# Sitemap: valid XML, only indexable local pages, no missing pages.
sitemap = PUB/'sitemap.xml'
if sitemap.exists():
    try:
        tree = ET.parse(sitemap)
        ns = {'sm':'http://www.sitemaps.org/schemas/sitemap/0.9'}
        locs = [el.text.strip() for el in tree.findall('.//sm:loc', ns) if el.text]
        seen = set()
        for loc in locs:
            if loc in seen: errors.append(f'sitemap.xml: doppelte URL {loc}')
            seen.add(loc)
            if not loc.startswith('https://www.ic-group.de/'):
                errors.append(f'sitemap.xml: falscher Host {loc}')
                continue
            path = urlparse(loc).path or '/'
            if not local_target_exists(path): errors.append(f'sitemap.xml: Ziel fehlt {path}')
            if path not in indexable_urls: errors.append(f'sitemap.xml: noindex/nicht indexierbare URL enthalten {path}')
        missing = sorted(indexable_urls - {urlparse(x).path or '/' for x in locs})
        for path in missing: warnings.append(f'sitemap.xml: indexierbare Seite fehlt {path}')
    except Exception as e:
        errors.append(f'sitemap.xml ungültig: {e}')

for needed in ['robots.txt','sitemap.xml','llms.txt','_redirects','assets/brand/favicon.svg','assets/brand/ic-immobilien-gruppe.svg','assets/img/og-default.jpg']:
    if not (PUB/needed).exists(): errors.append(f'{needed} fehlt')

# Netlify redirects: catch redirect loops caused by trailing-slash normalization.
redirects_file = PUB / '_redirects'
if redirects_file.exists():
    seen_sources = set()
    for lineno, raw in enumerate(redirects_file.read_text('utf-8').splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split()
        if len(parts) < 2:
            errors.append(f'_redirects:{lineno}: ungültige Regel')
            continue
        source, target = parts[0], parts[1]
        status = parts[2] if len(parts) > 2 else '301'

        # Netlify treats /foo and /foo/ as the same path before redirect matching.
        if source.startswith('/') and target.startswith('/'):
            source_path = urlparse(source).path.rstrip('/') or '/'
            target_path = urlparse(target).path.rstrip('/') or '/'
            if source_path == target_path:
                errors.append(f'_redirects:{lineno}: potenzieller Redirect-Loop {source} -> {target}')
            normalized_source = source_path
            if normalized_source in seen_sources:
                warnings.append(f'_redirects:{lineno}: doppelte normalisierte Quelle {source}')
            seen_sources.add(normalized_source)
            if status.endswith('!'):
                errors.append(f'_redirects:{lineno}: erzwungener interner Redirect vermeiden: {line}')

            # Every local destination should resolve to a real page or file.
            if not local_target_exists(target):
                errors.append(f'_redirects:{lineno}: lokales Ziel fehlt: {target}')

robots_txt = (PUB/'robots.txt').read_text('utf-8') if (PUB/'robots.txt').exists() else ''
if 'OAI-SearchBot' not in robots_txt or 'Sitemap: https://www.ic-group.de/sitemap.xml' not in robots_txt:
    errors.append('robots.txt: OAI-SearchBot oder produktive Sitemap fehlt')

print(f'HTML pages: {len(html_pages)}')
print(f'Indexable pages: {len(indexable_urls)}')
print(f'Errors: {len(errors)} | Warnings: {len(warnings)}')
for x in errors: print('ERROR', x)
for x in warnings[:100]: print('WARN ', x)
sys.exit(1 if errors else 0)
