#!/usr/bin/env python3
"""Read Bekal's live CSS tokens without pulling global page styles into the editor."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
s=(root/'assets/style.css').read_text()
blocks=[]
for selector in (':root', ':root[data-theme="light"]'):
 match=re.search(re.escape(selector)+r'\s*\{(.*?)\}',s,re.S)
 assert match,selector
 content=match.group(1)
 for token in ('canvas','card','elevated','muted-strong','primary','accent2'):
  value=re.search(r'--'+re.escape(token)+r':\s*(#[0-9a-fA-F]{3,6})\s*;',content)
  if value:
   hexval=value.group(1)[1:]
   if len(hexval)==3:hexval=''.join(c*2 for c in hexval)
   content+='\n--bekal-'+token+'-rgb:'+ ' '.join(str(int(hexval[i:i+2],16)) for i in (0,2,4))+';'
 blocks.append(selector+'{'+content+'}')
(root/'studio-film-ai/src/bekal-tokens.css').write_text('\n'.join(blocks)+'\n')
print('Synchronized Film Studio colors from assets/style.css.')
