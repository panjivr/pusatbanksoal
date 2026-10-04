#!/usr/bin/env python3
"""Discover new public pages, then synchronize visible UI and search metadata."""
from html.parser import HTMLParser
from pathlib import Path
import importlib.util,json,re
ROOT=Path(__file__).resolve().parents[1]
class Metadata(HTMLParser):
    def __init__(self,source):
        super().__init__(convert_charrefs=True);self.meta={};self.title='';self.heading='';self.in_title=False;self.in_heading=False;self.main=0;self.feed(source)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='meta':self.meta[attrs.get('name','')]=attrs.get('content','')
        if tag=='title':self.in_title=True
        if tag=='h1':self.in_heading=True
        if tag=='main':self.main+=1
    def handle_endtag(self,tag):
        if tag=='title':self.in_title=False
        if tag=='h1':self.in_heading=False
    def handle_data(self,data):
        if self.in_title:self.title+=data
        if self.in_heading:self.heading+=data

def discover(root=ROOT):
    path=root/'assets/features.json';features=json.loads(path.read_text());known={f['url'] for f in features};added=[]
    for page in sorted(root.glob('*.html')):
        if page.name=='index.html' or page.name in known:continue
        p=Metadata(page.read_text())
        if 'noindex' in p.meta.get('robots','').lower():continue
        if not p.main or not p.title.strip() or not p.meta.get('description','').strip():continue
        title=re.sub(r'\s*\|\s*Bekal\s*$','',p.title).strip();symbol=p.meta.get('feature:icon','file-text')
        assert re.fullmatch(r'[a-z-]+',symbol),f'{page.name}: invalid feature icon'
        entry=dict(url=page.name,name=p.heading.strip() or title,title=title,description=p.meta['description'],group=p.meta.get('feature:group','studio'),icon=symbol,new=True)
        features.append(entry);added.append(page.name)
    if added:path.write_text(json.dumps(features,ensure_ascii=False,indent=2)+'\n')
    return added

def run_module(name):
    spec=importlib.util.spec_from_file_location(name,ROOT/'scripts'/f'{name}.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
if __name__=='__main__':
    added=discover();print('Discovered public features: '+(', '.join(added) if added else 'none'))
    run_module('sync-feature-ui').sync()
    seo=run_module('sync-seo');seo.sync(seo.date.today().isoformat())
