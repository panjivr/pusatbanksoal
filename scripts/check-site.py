#!/usr/bin/env python3
"""Check local links, metadata, structured data, and sitemap coverage using Python only."""
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://pusatbanksoal.id/'


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.meta = {}
        self.ids = []
        self.links = []
        self.canonical = []
        self.title = ''
        self.main = 0
        self.h1 = 0
        self.json = []
        self._title = False
        self._json = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'meta':
            key = attrs.get('name') or attrs.get('property')
            if key:
                assert key not in self.meta, f'Duplicate metadata: {key}'
                self.meta[key] = attrs.get('content', '')
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical.append(attrs['href'])
        if tag in ('a', 'link') and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag in ('script', 'img', 'iframe') and 'src' in attrs:
            self.links.append(attrs['src'])
        if tag == 'main':
            self.main += 1
        if tag == 'h1':
            self.h1 += 1
        if tag == 'title':
            self._title = True
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self._json = ''

    def handle_endtag(self, tag):
        if tag == 'title':
            self._title = False
        if tag == 'script' and self._json is not None:
            self.json.append(json.loads(self._json))
            self._json = None

    def handle_data(self, data):
        if self._title:
            self.title += data
        if self._json is not None:
            self._json += data


def check():
    features = json.loads((ROOT / 'assets/features.json').read_text())
    registry = {f['url']: f for f in features}
    assert len(registry) == len(features), 'Duplicate registry entries'
    pages = {p.name: Page(p.read_text()) for p in ROOT.glob('*.html')}
    public = set()
    for filename, page in pages.items():
        prefix = filename + ': '
        assert page.title and page.meta.get('description'), prefix + 'missing title/description'
        assert page.meta.get('viewport'), prefix + 'missing viewport'
        assert page.main == 1, prefix + 'expected one main landmark'
        assert not [id_ for id_, n in Counter(page.ids).items() if n > 1], prefix + 'duplicate IDs'
        assert len(page.canonical) == 1, prefix + 'expected one canonical'
        expected_url = BASE if filename == 'index.html' else BASE + filename
        assert page.canonical[0] == expected_url, prefix + 'canonical URL mismatch'
        for target in page.links:
            url = urlsplit(target)
            if url.scheme or url.netloc or not url.path:
                continue
            local = ROOT / unquote(url.path.lstrip('/'))
            assert local.is_file(), prefix + 'missing local link/asset: ' + target
        if 'noindex' not in page.meta.get('robots', ''):
            public.add(filename)
            assert page.h1 == 1, prefix + 'expected one static page heading'
            assert page.meta.get('og:url') == expected_url, prefix + 'Open Graph URL mismatch'
            for key in ('og:title', 'og:description', 'og:image', 'twitter:title', 'twitter:description'):
                assert page.meta.get(key), prefix + 'missing ' + key
        if filename in registry:
            feature = registry[filename]
            assert page.title == feature['title'] + ' | Bekal', prefix + 'outdated feature title'
            assert page.meta['description'] == feature['description'], prefix + 'outdated feature description'
            nodes = [node for data in page.json for node in data.get('@graph', [data])]
            breadcrumbs = [n for n in nodes if n.get('@type') == 'BreadcrumbList']
            assert len(breadcrumbs) == 1, prefix + 'expected one breadcrumb schema'
            assert breadcrumbs[0]['itemListElement'][-1]['item'] == expected_url, prefix + 'breadcrumb URL mismatch'
            assert any(n.get('@type') == 'WebPage' and n.get('url') == expected_url for n in nodes), prefix + 'missing WebPage schema'
    assert public == set(registry) | {'index.html'}, 'Public pages and feature registry differ'
    sitemap = ET.parse(ROOT / 'sitemap.xml')
    urls = [n.text for n in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    expected = {BASE} | {BASE + name for name in registry}
    assert len(urls) == len(set(urls)) and set(urls) == expected, 'Sitemap coverage mismatch'
    landing = pages['index.html']
    assert set(registry).issubset(set(landing.links)), 'Some public features are missing from the landing page'
    catalogs = [d for d in landing.json if d.get('@id') == BASE + '#fitur']
    assert len(catalogs) == 1 and {i['url'] for i in catalogs[0]['itemListElement']} == expected - {BASE}, 'Landing schema catalog mismatch'
    print(f'PASS: {len(pages)} pages, {len(features)} public features, local links, metadata, JSON-LD, landing catalog and sitemap.')


if __name__ == '__main__':
    check()
