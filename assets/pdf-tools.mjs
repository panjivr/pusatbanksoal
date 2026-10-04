import {dependency,stop,breathe,pages,number,canvas,blob,image,reader,render,font,textPDF,safeName,result,csv,xlsx,ocr} from './file-tool-core.mjs';
const PDF='application/pdf';
async function load(file,password){const lib=await dependency('pdf-engine');try{return await lib.PDFDocument.load(await file.arrayBuffer(),{password:password||undefined,updateMetadata:false});}catch(e){if(/encrypt|password/i.test(e.message))throw new Error('PDF terkunci. Masukkan password yang benar pada pengaturan.');throw new Error('PDF belum bisa diproses. Periksa file atau coba alat Perbaiki PDF.');}}
async function copyDocument(source,indices){const {PDFDocument}=await dependency('pdf-engine'),out=await PDFDocument.create();const copied=await out.copyPages(source,indices);copied.forEach(p=>out.addPage(p));return out;}
function geometry(o){return {x:number(o.x,0,0,100)/100,y:number(o.y,0,0,100)/100,w:number(o.w,100,.1,100)/100,h:number(o.h,100,.1,100)/100};}
async function addCanvas(doc,c,size){const bytes=await blob(c,'image/jpeg',.9),im=await doc.embedJpg(await bytes.arrayBuffer()),page=doc.addPage(size||[c.width*.75,c.height*.75]);page.drawImage(im,{x:0,y:0,width:page.getWidth(),height:page.getHeight()});return page;}
async function readLines(pdf,index){const page=await pdf.getPage(index+1),content=await page.getTextContent();const rows=[];for(const item of content.items){if(!('str' in item)||!item.str.trim())continue;let row=rows.find(r=>Math.abs(r.y-item.transform[5])<3);if(!row){row={y:item.transform[5],cells:[]};rows.push(row);}row.cells.push({x:item.transform[4],text:item.str});}return rows.sort((a,b)=>b.y-a.y).map(r=>r.cells.sort((a,b)=>a.x-b.x).map(c=>c.text));}
async function officePDF(file,signal,progress){
 const {preview,html2canvas}=await dependency('office-engine'),holder=document.createElement('div');holder.className='ft-render-stage';holder.setAttribute('aria-hidden','true');document.body.append(holder);
 try{await preview.renderAsync(await file.arrayBuffer(),holder,undefined,{inWrapper:false,breakPages:true,renderAltChunks:false,useBase64URL:true,ignoreLastRenderedPageBreak:false});const sections=[...holder.querySelectorAll('section.docx')];if(!sections.length)throw new Error('Dokumen Word tidak memiliki halaman yang bisa ditampilkan.');if(sections.length>50)throw new Error('Maksimal 50 halaman Word per proses.');const {PDFDocument}=await dependency('pdf-engine'),doc=await PDFDocument.create();for(let i=0;i<sections.length;i++){stop(signal);const section=sections[i];const c=await html2canvas(section,{scale:1.5,backgroundColor:'#ffffff',logging:false,useCORS:false,allowTaint:false});await addCanvas(doc,c,[c.width/1.5*.75,c.height/1.5*.75]);progress?.((i+1)/sections.length);await breathe(signal);}return doc.save();}finally{holder.remove();}
}
export async function processPDF(tool,files,o={},signal,progress=()=>{}){
 stop(signal);const lib=await dependency('pdf-engine'),{PDFDocument,rgb,degrees,PDFName,PDFDict}=lib;const outputs=[];
 if(tool==='images-pdf'){
  const doc=await PDFDocument.create();for(let i=0;i<files.length;i++){const im=await image(files[i]),c=canvas(im.naturalWidth||im.width,im.naturalHeight||im.height);c.getContext('2d').drawImage(im,0,0);const png=await blob(c),embedded=await doc.embedPng(await png.arrayBuffer());const dims=o.paper==='original'?[c.width*.75,c.height*.75]:o.orientation==='landscape'?[841.89,595.28]:[595.28,841.89],pad=number(o.margin,20,0,100),p=doc.addPage(dims),scale=Math.min((dims[0]-pad*2)/c.width,(dims[1]-pad*2)/c.height);p.drawImage(embedded,{x:(dims[0]-c.width*scale)/2,y:(dims[1]-c.height*scale)/2,width:c.width*scale,height:c.height*scale});progress((i+1)/files.length);await breathe(signal);}return [result('gambar-bekal.pdf',await doc.save(),PDF)];
 }
 if(tool==='text-pdf')return [result('catatan-bekal.pdf',await textPDF(o.text||await files[0]?.text()||'',{title:o.title||'Catatan'}),PDF)];
 if(tool==='merge'){
  const out=await PDFDocument.create();for(let i=0;i<files.length;i++){const doc=await load(files[i],o.password),ids=pages(o.pages,doc.getPageCount());const copied=await out.copyPages(doc,ids);copied.forEach(p=>out.addPage(p));progress((i+1)/files.length);await breathe(signal);}return [result('gabungan-bekal.pdf',await out.save(),PDF)];
 }
 for(let fi=0;fi<files.length;fi++){
  const file=files[fi],name=safeName(file.name);const tick=f=>progress((fi+f)/files.length);stop(signal);
  if(tool==='word-pdf'){outputs.push(result(name+'.pdf',await officePDF(file,signal,tick),PDF,'Halaman menjadi gambar. Periksa tata letak pada pratinjau hasil.'));continue;}
  if(tool==='sheet-pdf'){
   const sheet=await window.FILES.readFile(file);const rows=[sheet.headers,...sheet.rows];outputs.push(result(name+'.pdf',await textPDF(rows.map(r=>r.join(' | ')).join('\n'),{title:name,landscape:true,size:9}),PDF,'Data lembar pertama, tanpa grafik dan tata letak Excel.'));tick(1);continue;
  }
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(['pdf-images','pdf-text','pdf-word','pdf-sheet','pdf-slides','compress','redact','ocr','scan'].includes(tool)){
   const source=await reader(bytes,o.password);try{
    const indices=pages(o.pages,source.numPages);if(['pdf-images','compress','redact','ocr','scan','pdf-slides'].includes(tool)&&indices.length>50)throw new Error('Pilih maksimal 50 halaman untuk pemrosesan gambar.');
    if(['pdf-text','pdf-word','pdf-sheet'].includes(tool)){
     const all=[];let text='';for(let n=0;n<indices.length;n++){const lines=await readLines(source,indices[n]);all.push(...lines);text+=lines.map(r=>r.join(' ')).join('\n')+'\n\n';tick((n+1)/indices.length);await breathe(signal);}if(!text.trim())throw new Error('Tidak ada teks yang bisa dipilih. Gunakan OCR untuk PDF hasil scan.');
     if(tool==='pdf-text')outputs.push(result(name+'.txt',text,'text/plain;charset=utf-8'));
     if(tool==='pdf-sheet')outputs.push(result(name+'.xlsx',await xlsx(all),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Kolom berdasarkan posisi teks, bukan rekonstruksi tabel yang sempurna.'));
     if(tool==='pdf-word'){const d=await dependency('word-engine');const document=new d.Document({sections:[{children:text.split('\n').map(t=>new d.Paragraph({children:[new d.TextRun(t)]}))}]});outputs.push(result(name+'.docx',await d.Packer.toBlob(document),'application/vnd.openxmlformats-officedocument.wordprocessingml.document','Hasil berupa teks yang dapat diedit; tata letak dan gambar PDF tidak dipertahankan.'));}
     continue;
    }
    if(tool==='compress'&&o.mode==='structure'){const doc=await load(file,o.password);const saved=await doc.save({useObjectStreams:true});outputs.push(saved.length<file.size?result(name+'-ringkas.pdf',saved,PDF):result(name+'-asli.pdf',file,PDF,'Struktur sudah efisien; file asli dipertahankan agar tidak lebih besar.'));tick(1);continue;}
    const out=await PDFDocument.create();let pptx;
    if(tool==='pdf-slides'){const {default:Pptx}=await dependency('slides-engine');pptx=new Pptx();const p=await source.getPage(indices[0]+1),v=p.getViewport({scale:1});pptx.defineLayout({name:'PDF',width:v.width/72,height:v.height/72});pptx.layout='PDF';}
    let recognizedText='';const f=tool==='ocr'?await font(out):null;
    for(let n=0;n<indices.length;n++){
     stop(signal);const index=indices[n],page=await source.getPage(index+1),v=page.getViewport({scale:1});let c=await render(source,index,number(o.scale,1.5,.5,3));
     if(tool==='pdf-images'){const type=o.format==='png'?'image/png':'image/jpeg';outputs.push(result(`${name}-halaman-${index+1}.${type==='image/png'?'png':'jpg'}`,await blob(c,type,number(o.quality,85,10,100)/100),type));}
     else if(tool==='pdf-slides'){const slide=pptx.addSlide();slide.addImage({data:c.toDataURL('image/png'),x:0,y:0,w:v.width/72,h:v.height/72});}
     else{
      if(tool==='redact'){const g=geometry(o);if(g.x+g.w>1.00001||g.y+g.h>1.00001)throw new Error('Area penutupan melewati batas halaman.');const ctx=c.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(g.x*c.width,g.y*c.height,g.w*c.width,g.h*c.height);}
      if(tool==='scan'){const ctx=c.getContext('2d'),data=ctx.getImageData(0,0,c.width,c.height);for(let j=0;j<data.data.length;j+=4){const gray=.299*data.data[j]+.587*data.data[j+1]+.114*data.data[j+2],val=o.scanMode==='bw'?(gray>number(o.threshold,160,0,255)?255:0):Math.max(0,Math.min(255,(gray-128)*1.3+145));data.data[j]=data.data[j+1]=data.data[j+2]=val;}ctx.putImageData(data,0,0);}
      const quality=tool==='compress'?number(o.quality,65,10,100)/100:.9;const im=await out.embedJpg(await (await blob(c,'image/jpeg',quality)).arrayBuffer()),p=out.addPage([v.width,v.height]);p.drawImage(im,{x:0,y:0,width:v.width,height:v.height});
      if(tool==='ocr'){const data=await ocr(c,signal,fraction=>tick((n+fraction)/indices.length));recognizedText+=data.text+'\n\n';for(const block of data.blocks||[])for(const paragraph of block.paragraphs||[])for(const line of paragraph.lines||[])for(const word of line.words||[]){if(!word.text.trim())continue;const box=word.bbox,sz=Math.max(1,Math.min((box.y1-box.y0)*v.height/c.height*.85,(box.x1-box.x0)*v.width/c.width/Math.max(.01,f.widthOfTextAtSize(word.text,1))));p.drawText(word.text,{x:box.x0*v.width/c.width,y:v.height-box.y1*v.height/c.height,size:sz,font:f,opacity:0});}}
     }
     c.width=c.height=1;tick((n+1)/indices.length);await breathe(signal);
    }
    if(tool==='pdf-slides')outputs.push(result(name+'.pptx',await pptx.write({outputType:'arraybuffer'}),'application/vnd.openxmlformats-officedocument.presentationml.presentation','Setiap halaman menjadi gambar pada slide; isi teks tidak dapat diedit.'));
    else if(tool!=='pdf-images'){
     const saved=await out.save();if(tool==='compress'&&saved.length>=file.size)outputs.push(result(name+'-asli.pdf',file,PDF,'Hasil kompresi lebih besar. File asli dipertahankan.'));else outputs.push(result(name+'-'+tool+'.pdf',saved,PDF,tool==='redact'?'Isi halaman dirasterisasi agar teks di bawah area tertutup tidak tersimpan.':tool==='compress'?'Kompresi gambar mengubah halaman menjadi gambar; teks dan tautan tidak dapat dipilih.':''));
     if(tool==='ocr')outputs.push(result(name+'-ocr.txt',recognizedText,'text/plain;charset=utf-8','Periksa kembali hasil pengenalan, terutama angka dan nama.'));
    }
   }finally{await source.destroy();}continue;
  }
  let doc;
  if(tool==='repair'){try{doc=await PDFDocument.load(bytes,{password:o.password||undefined,updateMetadata:false,throwOnInvalidObject:false});if(!doc.getPageCount())throw new Error();}catch{throw new Error('Struktur PDF tidak bisa dipulihkan di browser. File sumber lain diperlukan.');}}
  else doc=await load(file,o.password);
  const count=doc.getPageCount(),indices=pages(o.pages,count);
  if(tool==='split'){for(let n=0;n<indices.length;n++){const out=await copyDocument(doc,[indices[n]]);outputs.push(result(`${name}-halaman-${indices[n]+1}.pdf`,await out.save(),PDF));tick((n+1)/indices.length);await breathe(signal);}continue;}
  if(tool==='extract'||tool==='reorder'){doc=await copyDocument(doc,indices);}
  if(tool==='delete'){if(!o.pages?.trim())throw new Error('Isi nomor halaman yang ingin dihapus.');const remaining=Array.from({length:count},(_,i)=>i).filter(i=>!indices.includes(i));if(!remaining.length)throw new Error('Tidak bisa menghapus semua halaman.');doc=await copyDocument(doc,remaining);}
  if(tool==='rotate')for(const i of indices)doc.getPage(i).setRotation(degrees((doc.getPage(i).getRotation().angle+number(o.angle,90,-360,360)+360)%360));
  if(tool==='crop'){const g=geometry(o);if(g.x+g.w>1.00001||g.y+g.h>1.00001)throw new Error('Area potongan melewati batas halaman.');for(const i of indices){const p=doc.getPage(i),box=p.getCropBox();p.setCropBox(box.x+g.x*box.width,box.y+(1-g.y-g.h)*box.height,g.w*box.width,g.h*box.height);}}
  if(tool==='resize'){const out=await PDFDocument.create();const dims=o.orientation==='landscape'?[841.89,595.28]:[595.28,841.89];for(let n=0;n<indices.length;n++){const embedded=await out.embedPage(doc.getPage(indices[n])),p=out.addPage(dims),pad=number(o.margin,20,0,100),scale=Math.min((dims[0]-pad*2)/embedded.width,(dims[1]-pad*2)/embedded.height);p.drawPage(embedded,{x:(dims[0]-embedded.width*scale)/2,y:(dims[1]-embedded.height*scale)/2,width:embedded.width*scale,height:embedded.height*scale});await breathe(signal);}doc=out;}
  if(tool==='flatten'){doc.getForm().flatten();}
  if(tool==='metadata'){
   if(o.clean==='yes'){const info=doc.context.lookup(doc.context.trailerInfo.Info);if(info instanceof PDFDict)for(const [key] of info.entries())info.delete(key);doc.catalog.delete(PDFName.of('Metadata'));}
   else{doc.setTitle(o.title||'');doc.setAuthor(o.author||'');doc.setSubject(o.subject||'');doc.setKeywords((o.keywords||'').split(',').map(x=>x.trim()).filter(Boolean));}
  }
  if(['watermark','numbers','sign','annotate'].includes(tool)){
   const f=await font(doc),text=tool==='numbers'?'':o.text||'',color=String(o.color||'#245b36').match(/^#([0-9a-f]{6})$/i);const hex=color?color[1]:'245b36',ink=rgb(parseInt(hex.slice(0,2),16)/255,parseInt(hex.slice(2,4),16)/255,parseInt(hex.slice(4),16)/255);let signature;
   if(tool==='sign'&&o.signature){const data=await (await fetch(o.signature)).arrayBuffer();signature=await doc.embedPng(data);}
   if(tool!=='numbers'&&!text.trim()&&!signature)throw new Error('Isi teks atau gambar tanda tangan terlebih dahulu.');
   for(let n=0;n<indices.length;n++){const i=indices[n],p=doc.getPage(i),box=p.getCropBox(),width=box.width,height=box.height,size=number(o.size,tool==='watermark'?36:14,6,96),value=tool==='numbers'?`${number(o.start,1,1,100000)+n} / ${indices.length}`:text;
    if(signature){const targetW=Math.min(width*.5,number(o.signatureWidth,150,20,400)),targetH=signature.height/signature.width*targetW;p.drawImage(signature,{x:box.x+number(o.x,55,0,100)/100*width,y:box.y+(1-number(o.y,80,0,100)/100)*height-targetH,width:targetW,height:targetH});}
    else{const x=tool==='numbers'?box.x+(width-f.widthOfTextAtSize(value,size))/2:tool==='watermark'?box.x+width*.18:box.x+number(o.x,10,0,100)/100*width,y=tool==='numbers'?box.y+20:tool==='watermark'?box.y+height*.42:box.y+(1-number(o.y,20,0,100)/100)*height-size;p.drawText(value,{x,y,size,font:f,color:ink,opacity:tool==='watermark'?number(o.opacity,30,5,100)/100:1,rotate:degrees(tool==='watermark'?number(o.angle,30,-180,180):0)});}
    tick((n+1)/indices.length);await breathe(signal);
   }
  }
  if(tool==='protect'){if(!o.newPassword||o.newPassword.length<8)throw new Error('Gunakan password baru minimal 8 karakter.');doc.encrypt({userPassword:o.newPassword,ownerPassword:o.newPassword,algorithm:'AES-256'});}
  if(tool==='unlock')doc=await copyDocument(doc,Array.from({length:count},(_,i)=>i));
  outputs.push(result(name+'-'+tool+'.pdf',await doc.save({useObjectStreams:true}),PDF,tool==='sign'?'Tanda tangan visual, bukan tanda tangan digital bersertifikat.':tool==='repair'?'Pemulihan struktur sebisa mungkin. Periksa kembali semua halaman.':''));tick(1);await breathe(signal);
 }
 return outputs;
}
