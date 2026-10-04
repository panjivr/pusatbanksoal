#!/usr/bin/env python3
"""Generate static feature metadata from assets/features.json without touching app logic."""
import argparse
from datetime import date
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://pusatbanksoal.id/'


def meta(source, attribute, key, value):
    pattern = r'<meta\b(?=[^>]*\b' + attribute + r'="' + re.escape(key) + r'")[^>]*>'
    tag = f'<meta {attribute}="{key}" content="{html.escape(value, quote=True)}">'
    if re.search(pattern, source):
        return re.sub(pattern, lambda _: tag, source, count=1)
    return source.replace('</head>', tag + '\n</head>', 1)


def json_script(source, identifier, data):
    tag = f'<script id="{identifier}" type="application/ld+json">' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '</script>'
    pattern = r'<script id="' + identifier + r'" type="application/ld\+json">.*?</script>'
    if re.search(pattern, source, re.S):
        return re.sub(pattern, lambda _: tag, source, count=1, flags=re.S)
    return source.replace('</head>', tag + '\n</head>', 1)



class VisibleFAQ(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.items = []
        self.depth = 0
        self.in_summary = False
        self.in_answer = False
        self.question = ''
        self.answer = ''
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        if tag == 'details':
            self.depth += 1
            if self.depth == 1:
                self.question = self.answer = ''
        if self.depth and tag == 'summary':
            self.in_summary = True
        if self.depth and tag == 'p':
            self.in_answer = True

    def handle_endtag(self, tag):
        if tag == 'summary':
            self.in_summary = False
        if tag == 'p':
            self.in_answer = False
            self.answer += ' '
        if tag == 'details':
            self.depth -= 1
            if self.depth == 0 and '?' in self.question and self.answer.strip():
                self.items.append({'@type': 'Question', 'name': ' '.join(self.question.split()),
                                   'acceptedAnswer': {'@type': 'Answer', 'text': ' '.join(self.answer.split())}})

    def handle_data(self, data):
        if self.in_summary:
            self.question += data
        if self.in_answer:
            self.answer += data


def sync_faq(source):
    # FAQ schema must describe questions and answers actually available on the page.
    def remove(match):
        data = json.loads(match[2])
        if data.get('@type') == 'FAQPage':
            return ''
        if isinstance(data.get('@graph'), list):
            data['@graph'] = [node for node in data['@graph'] if node.get('@type') != 'FAQPage']
        return '<script' + match[1] + '>' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '</script>' + ('\n' if match[0].endswith('\n') else '')
    source = re.sub(r'<script([^>]*type="application/ld\+json"[^>]*)>(.*?)</script>(?:\n)?', remove, source, flags=re.S)
    questions = VisibleFAQ(source).items
    if questions:
        source = json_script(source, 'feature-faq', {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': questions})
    return source


def sync(lastmod):
    features = json.loads((ROOT / 'assets/features.json').read_text())
    assert len({f['url'] for f in features}) == len(features), 'Duplicate feature URLs'
    for feature in features:
        path = ROOT / feature['url']
        assert path.parent == ROOT and path.suffix == '.html' and path.is_file()
        source = path.read_text()
        title = feature['title'] + ' | Bekal'
        url = BASE + feature['url']
        source = re.sub(r'<title>.*?</title>', lambda _: '<title>' + html.escape(title) + '</title>', source, count=1, flags=re.S)
        source = re.sub(r'<link rel="canonical"[^>]*>', lambda _: '<link rel="canonical" href="' + url + '">', source, count=1)
        for attribute, key, value in [
            ('name', 'description', feature['description']),
            ('property', 'og:title', title), ('property', 'og:description', feature['description']),
            ('property', 'og:url', url), ('property', 'og:locale', 'id_ID'),
            ('property', 'og:site_name', 'Bekal'), ('property', 'og:type', 'website'),
            ('property', 'og:image', BASE + 'assets/og-bekal.png'),
            ('name', 'twitter:title', title), ('name', 'twitter:description', feature['description']),
            ('name', 'twitter:card', 'summary_large_image'),
            ('name', 'twitter:image', BASE + 'assets/og-bekal.png'),
        ]:
            source = meta(source, attribute, key, value)
        graph = {'@context': 'https://schema.org', '@graph': [
            {'@type': 'WebPage', '@id': url + '#page', 'url': url,
             'name': feature['title'], 'description': feature['description'], 'inLanguage': 'id-ID',
             'isPartOf': {'@id': BASE + '#website'}, 'publisher': {'@id': BASE + '#org'},
             'breadcrumb': {'@id': url + '#breadcrumb'}},
            {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Beranda', 'item': BASE},
                {'@type': 'ListItem', 'position': 2, 'name': feature['name'], 'item': url},
            ]},
        ]}
        source = json_script(source, 'feature-seo', graph)
        # Existing application schemas also use the registry's public description.
        def update_application(match):
            data = json.loads(match[2])
            nodes = data.get('@graph', [data])
            for node in nodes:
                if node.get('@type') in ('WebApplication', 'SoftwareApplication'):
                    node['name'] = feature['name'] + ' Bekal'
                    node['description'] = feature['description']
            return '<script' + match[1] + '>' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '</script>'
        source = re.sub(r'<script([^>]*type="application/ld\+json"[^>]*)>(.*?)</script>', update_application, source, flags=re.S)
        source = re.sub(r'(<h2 id="feature-guide-title">).*?</h2><p>.*?</p>',
                        lambda m: m[1] + 'Tentang ' + html.escape(feature['name']) + '</h2><p>' + html.escape(feature['description']) + '</p>', source, count=1, flags=re.S)
        path.write_text(sync_faq(source))
    landing = ROOT / 'index.html'
    catalog = {'@context': 'https://schema.org', '@type': 'ItemList', '@id': BASE + '#fitur', 'name': 'Fitur Bekal',
               'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': f['name'], 'url': BASE + f['url']} for i, f in enumerate(features)]}
    landing.write_text(sync_faq(json_script(landing.read_text(), 'feature-catalog', catalog)))
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += ''.join(f'  <url><loc>{BASE}{path}</loc><lastmod>{lastmod}</lastmod></url>\n' for path in [''] + [f['url'] for f in features])
    (ROOT / 'sitemap.xml').write_text(sitemap + '</urlset>\n')
    print(f'Synchronized {len(features)} public features and the landing catalog.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--lastmod', default=date.today().isoformat(), help='Date of this content update, YYYY-MM-DD')
    args = parser.parse_args()
    date.fromisoformat(args.lastmod)
    sync(args.lastmod)
