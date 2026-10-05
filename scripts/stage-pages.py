#!/usr/bin/env python3
"""Stage runtime files only, keeping build dependencies/source out of Pages artifacts."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1];dest=root/'.pages'
if dest.exists():shutil.rmtree(dest)
dest.mkdir()
for p in root.iterdir():
    if p.name in ('assets','partials') and p.is_dir():shutil.copytree(p,dest/p.name)
    elif p.is_file() and (p.suffix=='.html' or p.name in ('CNAME','.nojekyll','robots.txt','sitemap.xml','site.webmanifest')):shutil.copy2(p,dest/p.name)
assert (dest/'film-studio.html').is_file()
assert not (dest/'studio-film-ai').exists()
print('Staged runtime HTML/assets/partials and site metadata for Pages.')
