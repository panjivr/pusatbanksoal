#!/usr/bin/env python3
"""Publish the imported React studio at the site's existing film-studio.html URL."""
from pathlib import Path
import html,json,re,shutil
ROOT=Path(__file__).resolve().parents[1]
build=ROOT/'studio-film-ai/dist'
assert (build/'studio.html').is_file(), 'Build studio-film-ai first.'
source=(build/'studio.html').read_text()
scripts=re.findall(r'<script[^>]*src="([^"]+)"[^>]*></script>',source)
styles=re.findall(r'<link[^>]*href="([^"]+\.css)"[^>]*>',source)
assert scripts and styles
out=ROOT/'assets/studio-film-ai'
if out.exists():shutil.rmtree(out)
out.mkdir()
for p in build.iterdir():
    if p.suffix=='.html':continue
    if p.is_dir():shutil.copytree(p,out/p.name)
    else:shutil.copy2(p,out/p.name)
feature=next(f for f in json.loads((ROOT/'assets/features.json').read_text()) if f['url']=='film-studio.html')
url='https://pusatbanksoal.id/film-studio.html'
meta=''.join(f'<meta name="{k}" content="{html.escape(v,quote=True)}">' for k,v in [('description',feature['description']),('feature:group','studio'),('feature:icon','film'),('theme-color','#0a0e17')])
app={'@context':'https://schema.org','@type':'WebApplication','name':feature['name'],'url':url,'description':feature['description'],'applicationCategory':'MultimediaApplication','operatingSystem':'Web','inLanguage':'id-ID','offers':{'@type':'Offer','price':'0','priceCurrency':'IDR'}}
page='<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(feature['title'])+' | Bekal</title>'+meta+'<link rel="canonical" href="'+url+'"><link rel="icon" href="assets/favicon.svg"><script type="application/ld+json">'+json.dumps(app,ensure_ascii=False,separators=(',',':'))+'</script>'+''.join('<link rel="stylesheet" href="'+html.escape(p,quote=True)+'">' for p in styles)+''.join('<script type="module" src="'+html.escape(p,quote=True)+'"></script>' for p in scripts)+'</head><body style="margin:0;background:#0a0e17;color:#e7eaf0"><main id="studio-fallback" style="max-width:960px;margin:40px auto;padding:24px;font-family:system-ui"><h1>Studio Film AI</h1><p>Studio Film AI Bekal: naskah, storyboard, media, timeline, warna, audio dan ekspor video.</p><p id="studio-loading" role="status">Memuat studio...</p><noscript>Aktifkan JavaScript untuk menggunakan studio.</noscript><a href="index.html" style="color:#6fd08a">Kembali ke Bekal</a></main><div id="root"></div><script>window.addEventListener("error",function(){var el=document.getElementById("studio-loading");if(el)el.textContent="Studio belum dapat dimuat. Muat ulang halaman atau periksa koneksi.";});</script></body></html>'
(ROOT/'film-studio.html').write_text(page+'\n')
print('Published React studio and '+str(len(list(out.iterdir())))+' build assets.')
