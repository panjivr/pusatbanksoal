import {build} from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
const here=path.dirname(new URL(import.meta.url).pathname),root=path.resolve(here,'..'),out=path.join(root,'assets/vendor');
await fs.mkdir(out,{recursive:true});
await fs.rm(path.join(out,'chunks'),{recursive:true,force:true});
for(const file of await fs.readdir(out))if(/\.mjs(?:\.LEGAL\.txt)?$/.test(file))await fs.rm(path.join(out,file));
await build({entryPoints:['pdf-engine','font-engine','zip-engine','word-engine','office-engine','slides-engine','image-codecs','ocr-engine'].map(n=>path.join(here,'entries',n+'.mjs')),outdir:out,outExtension:{'.js':'.mjs'},bundle:true,minify:true,splitting:true,format:'esm',platform:'browser',target:['es2022'],legalComments:'linked',chunkNames:'chunks/[name]-[hash]',define:{'process.env.NODE_ENV':'"production"'},metafile:true});
const pdfjs=path.join(here,'node_modules/pdfjs-dist');
await fs.copyFile(path.join(pdfjs,'build/pdf.min.mjs'),path.join(out,'pdf-reader.mjs'));
await fs.copyFile(path.join(pdfjs,'build/pdf.worker.min.mjs'),path.join(out,'pdf.worker.min.mjs'));
await fs.cp(path.join(pdfjs,'cmaps'),path.join(out,'cmaps'),{recursive:true});
await fs.cp(path.join(pdfjs,'standard_fonts'),path.join(out,'standard_fonts'),{recursive:true});
await fs.copyFile(path.join(here,'node_modules/tesseract.js/dist/worker.min.js'),path.join(out,'ocr-worker.min.js'));
for(const file of ['tesseract-core-lstm.wasm.js','tesseract-core-lstm.wasm'])await fs.copyFile(path.join(here,'node_modules/tesseract.js-core',file),path.join(out,file));
const packages=['@cantoo/pdf-lib','@cantoo/fontkit','pdfjs-dist','jszip','docx','docx-preview','gifenc','gifuct-js','html2canvas','mammoth','pptxgenjs','utif','tesseract.js','tesseract.js-core'];
await fs.mkdir(path.join(out,'licenses'),{recursive:true});
for(const name of packages){const dir=path.join(here,'node_modules',name);const files=await fs.readdir(dir);for(const file of files.filter(n=>/^licen[sc]e|^copying|^notice/i.test(n))){const p=path.join(dir,file);if((await fs.stat(p)).isFile())await fs.copyFile(p,path.join(out,'licenses',name.replaceAll('/','-').replace('@','')+'-'+file));}}
console.log('Built pinned, local browser modules and copied PDF resources and licenses.');

const lock=JSON.parse(await fs.readFile(path.join(here,'package-lock.json'),'utf8'));
for(const entry of Object.keys(lock.packages).filter(p=>p.startsWith('node_modules/'))){const dir=path.join(here,entry);try{for(const file of (await fs.readdir(dir)).filter(n=>/^licen[sc]e|^copying|^notice/i.test(n))){const src=path.join(dir,file);if((await fs.stat(src)).isFile())await fs.copyFile(src,path.join(out,'licenses',entry.replaceAll('/','-')+'-'+file));}}catch(e){if(e.code!=='ENOENT')throw e;}}
