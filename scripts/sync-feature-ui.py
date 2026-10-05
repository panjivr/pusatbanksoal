#!/usr/bin/env python3
"""Generate visible landing map and practical-tools menus from the feature registry."""
from pathlib import Path
import html,json,re
ROOT=Path(__file__).resolve().parents[1]
def icon(name):
    assert re.fullmatch(r'[a-z-]+',name), 'Invalid feature icon'
    return f'<svg class="i" aria-hidden="true"><use href="#i-{name}"></use></svg>'
def sync(root=ROOT):
    features=json.loads((root/'assets/features.json').read_text())
    groups=[('belajar','Belajar','Lolos seleksi dan ujian','target','#2e8b40,#0ea5a4'),('kampus','Kampus & Karier','Kuliah sampai kerja','grad','#f59e0b,#ef4444'),('usaha','Usaha','Ide, hitung, mulai','briefcase','#eab308,#2e8b40'),('studio','Alat Praktis','Untuk kebutuhan sehari-hari','sparkles','#8b5cf6,#2e8b40')]
    assert all(f['group'] in [g[0] for g in groups]+['alat'] for f in features), 'Unknown feature group'
    pillars=[]
    for i,(key,name,desc,symbol,colors) in enumerate(groups):
        rows=[]
        for f in features:
            if ('studio' if f['group']=='alat' else f['group'])!=key:continue
            rows.append(f'<a href="{html.escape(f["url"],quote=True)}" class="lp-item"><span class="ii">{icon(f.get("icon","file-text"))}</span><div><b>{html.escape(f["name"])}'+(' <em>Baru</em>' if f.get('new') else '')+f'</b><span>{html.escape(f.get("landing_description",f["description"]))}</span></div></a>')
        if key=='belajar':rows.append('<a href="dashboard.html" class="lp-item"><span class="ii">'+icon('chart')+'</span><div><b>Progres Belajar</b><span>Progres, riwayat tryout, dan tren skor</span></div></a>')
        pillars.append(f'<div class="lp-pillar reveal d{i+1}"><div class="ph"><span class="pi" style="background:linear-gradient(135deg,{colors})">{icon(symbol)}</span><div><b>{html.escape(name)}</b><small>{html.escape(desc)}</small></div></div>'+''.join(rows)+'</div>')
    p=root/'index.html';source=p.read_text();block='<!-- feature-map:start -->\n<div class="lp-map">'+''.join(pillars)+'</div>\n<!-- feature-map:end -->'
    if '<!-- feature-map:start -->' in source:source=re.sub(r'<!-- feature-map:start -->.*?<!-- feature-map:end -->',lambda _:block,source,flags=re.S)
    else:
        start=source.index('<div class="lp-map">');end=source.index('\n</div></section>',start);source=source[:start]+block+source[end:]
    tool_sources=[('pdf','Alat PDF','doc'),('image','Alat Gambar','image'),('markdown','Alat Markdown','markdown'),('film','Studio Film AI','film')]
    operations=json.loads((root/'assets/file-tools.json').read_text()) if (root/'assets/file-tools.json').exists() else {}
    if (root/'assets/markdown-tools.json').exists():operations['markdown']=json.loads((root/'assets/markdown-tools.json').read_text())
    if (root/'assets/film-tools.json').exists():operations['film']=json.loads((root/'assets/film-tools.json').read_text())
    catalogs=[];tool_count=0
    for kind,title,symbol in tool_sources:
        items=operations.get(kind,[])
        if not items:continue
        tool_count+=len(items)
        links=''.join(f'<a href="{'film-studio' if kind=='film' else kind+'-tools'}.html#{html.escape(t["id"],quote=True)}">{icon(t.get("icon",symbol))}<span>{html.escape(t["name"])}</span></a>' for t in items)
        catalogs.append(f'<details class="feature-tool-group"><summary>{icon(symbol)} {title} ({len(items)})</summary><nav class="feature-tool-links" aria-label="Daftar {title}">{links}</nav></details>')
    if catalogs:
        directory='<!-- practical-tool-catalog:start --><section class="feature-guide" id="alat-file"><div class="wrap"><h2>Semua alat praktis</h2><p>Pilih dari '+str(tool_count)+' alat untuk dokumen, foto, film, dan video. Cari alat, lalu buka untuk mulai.</p><label for="practical-tool-search">Cari alat</label><input id="practical-tool-search" type="search" placeholder="Cari PDF, Markdown, film, prompt, video..."><p id="practical-tool-count" role="status" aria-live="polite"></p>'+''.join(catalogs)+'</div></section><!-- practical-tool-catalog:end -->'
        if '<!-- practical-tool-catalog:start -->' in source:source=re.sub(r'<!-- practical-tool-catalog:start -->.*?<!-- practical-tool-catalog:end -->',lambda _:directory,source,flags=re.S)
        elif re.search(r'<section class="feature-guide"><div class="wrap"><h2>PDF dan gambar,',source):source=re.sub(r'<section class="feature-guide"><div class="wrap"><h2>PDF dan gambar,.*?</section>',lambda _:directory,source,count=1,flags=re.S)
        else:source=source.replace('<footer',directory+'<footer',1)
        if 'src="assets/feature-catalog.js"' not in source:source=source.replace('</body>','<script src="assets/feature-catalog.js" defer></script></body>')
    p.write_text(source)
    menu=''.join(f'<a href="{html.escape(f["url"],quote=True)}" class="nav-menu-item" role="menuitem"><span class="nav-menu-ic">{icon(f.get("icon","file-text"))}</span><span class="nav-menu-tx"><b>{html.escape(f["name"])}</b><small>{html.escape(f.get("landing_description",f["description"]))}</small></span></a>' for f in features if f['group'] in ('studio','alat'))
    for p in root.glob('*.html'):
        source=p.read_text();source=re.sub(r'(<div class="nav-menu" id="menu-studio" role="menu">).*?(</div>\s*</div>)',lambda m:m[1]+menu+m[2],source,count=1,flags=re.S);p.write_text(source)
    print(f'Synchronized visible landing map and menus from {len(features)} features.')
if __name__=='__main__':sync()
