const test=require('node:test'),assert=require('node:assert/strict');
const {localizeSource}=require('./bekal-locale.cjs');
test('translation changes only display strings and preserves all workflow discriminants',()=>{
 const input=`const activeTab='script';const x='text';const jsx=<><button onClick={()=>setActiveTab('script')} aria-label="Save">Save</button>{activeTab==='script'&&<h2>Script</h2>}{x==='text'?'Text':'Image'}{items['script']}{['script','text'].includes(x)}</>;`;
 const out=localizeSource(input,'screen.tsx');
 assert.ok(out.includes("const activeTab='script'"));assert.ok(out.includes("setActiveTab('script')"));assert.ok(out.includes("activeTab==='script'"));assert.ok(out.includes("x==='text'"));assert.ok(out.includes("items['script']"));assert.ok(out.includes("['script','text'].includes(x)"));assert.ok(out.includes('Simpan'));assert.ok(out.includes('Naskah'));assert.ok(out.includes('Gambar'));
});
test('project/user values and API IDs remain unchanged; multiline UI text is translated',()=>{
 const out=localizeSource(`const model={id:'script',name:'text'};const jsx=<><input value="text" type="text" placeholder="Enter project title..."/><p>\n Save\n</p><p>{userText}</p></>;`,'screen.tsx');
 assert.ok(out.includes("id:'script'"));assert.ok(out.includes("name:'text'"));assert.ok(out.includes('value="text"'));assert.ok(out.includes('type="text"'));assert.ok(out.includes('Tulis judul proyek...'));assert.ok(out.includes('Simpan'));assert.ok(out.includes('{userText}'));
});
test('user-facing error messages are translated without changing action arguments',()=>{
 const out=localizeSource(`alert('Please select an API key first.');setError('Missing API key');setActiveTab('script');dispatchAction('remove');setStatus('rendering');setFeedback('helpful');`,'screen.tsx');
 assert.ok(out.includes('Pilih API key terlebih dahulu.'));assert.ok(out.includes('API key belum tersedia'));assert.ok(out.includes("setActiveTab('script')"));assert.ok(out.includes("dispatchAction('remove')"));assert.ok(out.includes("setStatus('rendering')"));assert.ok(out.includes("setFeedback('helpful')"));
});
test('every source file retains comparisons, action arguments, and technical DOM attributes',()=>{
 const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
 const files=[];function walk(dir){for(const name of fs.readdirSync(dir)){const file=path.join(dir,name);if(fs.statSync(file).isDirectory())walk(file);else if(/\.tsx?$/.test(name)&&!name.includes('.test.'))files.push(file);}}walk(path.resolve(__dirname,'../src'));
 function invariants(code,file){const sf=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true,file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS),values=[];assert.equal(sf.parseDiagnostics.length,0,file+' parse diagnostics');
  function visit(n){if(ts.isStringLiteral(n)){const p=n.parent;
   if(ts.isBinaryExpression(p)&&[ts.SyntaxKind.EqualsEqualsToken,ts.SyntaxKind.EqualsEqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsToken,ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(p.operatorToken.kind))values.push('compare:'+n.text);
   if(ts.isCallExpression(p)&&p.expression.getText(sf)!=='alert'&&!(p.expression.getText(sf)==='setError'&&/\s/.test(n.text)))values.push('call:'+p.expression.getText(sf)+':'+n.text);
   if(ts.isJsxAttribute(p)&&['id','key','value','type','name','data-studio-action'].includes(p.name.getText(sf)))values.push('attr:'+p.name.getText(sf)+':'+n.text);
  }ts.forEachChild(n,visit);}visit(sf);return values;
 }
 for(const file of files){const source=fs.readFileSync(file,'utf8');assert.deepEqual(invariants(localizeSource(source,file),file),invariants(source,file),file);}
 assert.ok(files.length>200);
});
test('legacy revision and preset labels retain their identity and are translated only for display',()=>{
 const out=localizeSource(`const revision={label:'Original',name:'Golden Hour'};const preset={label:'Custom'};const jsx=<><span>{revision.label}</span>{preset.label==='Custom'&&<button>Custom</button>}</>;`,'screen.tsx');
 assert.ok(out.includes("label:'Original'"));assert.ok(out.includes("label:'Custom'"));assert.ok(out.includes("name:'Golden Hour'"));assert.ok(out.includes("preset.label==='Custom'"));assert.ok(out.includes('__bekalUiLabel(revision.label)'));
});
