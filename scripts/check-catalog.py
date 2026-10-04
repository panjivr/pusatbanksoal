#!/usr/bin/env python3
import importlib.util,json,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def module(name):
    spec=importlib.util.spec_from_file_location(name,ROOT/'scripts'/f'{name}.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
with tempfile.TemporaryDirectory() as d:
    root=Path(d);(root/'assets').mkdir();(root/'assets/features.json').write_text('[]')
    (root/'index.html').write_text('<html><body><!-- feature-map:start --><!-- feature-map:end --></body></html>')
    nav='<div class="nav-menu" id="menu-studio" role="menu"></div></div>'
    (root/'baru.html').write_text('<html><head><title>Alat Baru | Bekal</title><meta name="description" content="Fitur publik baru."><meta name="feature:icon" content="markdown"></head><body>'+nav+'<main><h1>Alat Baru</h1></main></body></html>')
    (root/'private.html').write_text('<title>Privat</title><meta name="description" content="Private"><meta name="robots" content="noindex"><main><h1>Privat</h1></main>')
    discover=module('sync-catalog').discover;sync=module('sync-feature-ui').sync
    assert discover(root)==['baru.html'];assert discover(root)==[];sync(root)
    landing=(root/'index.html').read_text();page=(root/'baru.html').read_text();assert 'href="baru.html" class="lp-item"' in landing and '#i-markdown' in landing and '<em>Baru</em>' in landing;assert 'private.html' not in landing;assert 'nav-menu-ic' in page and '#i-markdown' in page
    before=landing;sync(root);assert (root/'index.html').read_text()==before
print('PASS: public-page discovery, private-page exclusion, generated landing/menu icons, and idempotence.')
