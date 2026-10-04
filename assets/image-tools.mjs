import {dependency,stop,breathe,number,canvas,blob,image,safeName,result,ocr} from './file-tool-core.mjs';
import {processPDF} from './pdf-tools.mjs';
const hex=s=>/^#[0-9a-f]{6}$/i.test(s||'')?s:'#ffffff';
const region=(o,c)=>({x:Math.round(number(o.x,0,0,100)/100*c.width),y:Math.round(number(o.y,0,0,100)/100*c.height),w:Math.max(1,Math.round(number(o.w,100,.1,100)/100*c.width)),h:Math.max(1,Math.round(number(o.h,100,.1,100)/100*c.height))});
function dimensions(im){return [im.naturalWidth||im.width,im.naturalHeight||im.height];}
function fit(ctx,im,x,y,w,h,cover=false){const [iw,ih]=dimensions(im),s=cover?Math.max(w/iw,h/ih):Math.min(w/iw,h/ih);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(im,x+(w-iw*s)/2,y+(h-ih*s)/2,iw*s,ih*s);ctx.restore();}
export function transformImage(im,tool,o={}){
 const [iw,ih]=dimensions(im);let c=canvas(iw,ih),ctx=c.getContext('2d');ctx.drawImage(im,0,0);
 if(tool==='resize'||tool==='upscale'||tool==='passport'){
  let w,h;if(tool==='passport'){w=o.photo==='3x4'?354:472;h=o.photo==='3x4'?472:709;}else if(tool==='upscale'){const factor=number(o.factor,2,1,4);w=iw*factor;h=ih*factor;}else{w=number(o.width,1280,1,16384);h=o.keep==='no'?number(o.height,720,1,16384):Math.round(ih*w/iw);}
  c=canvas(w,h);ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';if(tool==='passport'){ctx.fillStyle=hex(o.background);ctx.fillRect(0,0,w,h);fit(ctx,im,0,0,w,h,true);}else ctx.drawImage(im,0,0,w,h);
 }
 if(tool==='crop'){const r=region(o,c);if(r.x+r.w>iw+1||r.y+r.h>ih+1)throw new Error('Area potongan melewati batas gambar.');c=canvas(r.w,r.h);c.getContext('2d').drawImage(im,r.x,r.y,r.w,r.h,0,0,r.w,r.h);}
 if(tool==='rotate'){const a=number(o.angle,90,-360,360)*Math.PI/180,w=Math.ceil(Math.abs(iw*Math.cos(a))+Math.abs(ih*Math.sin(a))-1e-8),h=Math.ceil(Math.abs(iw*Math.sin(a))+Math.abs(ih*Math.cos(a))-1e-8);c=canvas(w,h);ctx=c.getContext('2d');ctx.translate(w/2,h/2);ctx.rotate(a);ctx.drawImage(im,-iw/2,-ih/2);}
 if(tool==='flip'){ctx.clearRect(0,0,iw,ih);ctx.save();ctx.translate(o.direction==='vertical'?0:iw,o.direction==='vertical'?ih:0);ctx.scale(o.direction==='vertical'?1:-1,o.direction==='vertical'?-1:1);ctx.drawImage(im,0,0);ctx.restore();}
 if(['adjust','grayscale','sepia'].includes(tool)){ctx.clearRect(0,0,iw,ih);ctx.filter=tool==='grayscale'?'grayscale(1)':tool==='sepia'?'sepia(1)':`brightness(${number(o.brightness,100,0,200)/100}) contrast(${number(o.contrast,100,0,200)/100}) saturate(${number(o.saturation,100,0,200)/100})`;ctx.drawImage(im,0,0);ctx.filter='none';}
 if(['blur','pixelate','redact-image'].includes(tool)){
  const r=region(o,c);if(r.x+r.w>iw+1||r.y+r.h>ih+1)throw new Error('Area efek melewati batas gambar.');
  if(tool==='redact-image'){ctx.fillStyle=hex(o.color||'#000000');ctx.fillRect(r.x,r.y,r.w,r.h);}
  else{const patch=canvas(tool==='pixelate'?Math.max(1,Math.round(r.w/number(o.strength,16,2,80))):r.w,tool==='pixelate'?Math.max(1,Math.round(r.h/number(o.strength,16,2,80))):r.h),pctx=patch.getContext('2d');if(tool==='blur')pctx.filter=`blur(${number(o.strength,12,1,80)}px)`;pctx.drawImage(c,r.x,r.y,r.w,r.h,0,0,patch.width,patch.height);ctx.fillStyle='#fff';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.imageSmoothingEnabled=tool!=='pixelate';ctx.drawImage(patch,r.x,r.y,r.w,r.h);}
 }
 if(tool==='remove-bg'){
  const data=ctx.getImageData(0,0,iw,ih),color=hex(o.background),target=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)),tol=number(o.tolerance,35,0,180),feather=number(o.feather,10,0,80);for(let i=0;i<data.data.length;i+=4){const d=Math.sqrt(target.reduce((sum,v,j)=>sum+(data.data[i+j]-v)**2,0));if(d<=tol)data.data[i+3]=0;else if(feather&&d<tol+feather)data.data[i+3]=Math.round(data.data[i+3]*(d-tol)/feather);}ctx.putImageData(data,0,0);
 }
 if(tool==='watermark'){
  const text=(o.text||'').trim();if(!text)throw new Error('Isi teks watermark.');const size=number(o.size,32,8,200);ctx.fillStyle=hex(o.color||'#ffffff');ctx.globalAlpha=number(o.opacity,65,1,100)/100;ctx.font=`700 ${size}px Arial, sans-serif`;const x=number(o.x,5,0,100)/100*iw,y=number(o.y,90,0,100)/100*ih;if(o.repeat==='yes'){for(let yy=size;yy<ih;yy+=size*4)for(let xx=10;xx<iw;xx+=Math.max(size*5,ctx.measureText(text).width+size*2))ctx.fillText(text,xx,yy);}else ctx.fillText(text,x,y);ctx.globalAlpha=1;
 }
 if(tool==='meme'){
  const size=number(o.size,48,12,200);ctx.font=`900 ${size}px Impact, Arial, sans-serif`;ctx.textAlign='center';ctx.textBaseline='top';ctx.lineWidth=Math.max(2,size/15);ctx.strokeStyle='#000';ctx.fillStyle='#fff';const draw=(text,y)=>{const words=text.toUpperCase().split(/\s+/),lines=[];let line='';for(const word of words){if(ctx.measureText((line?line+' ':'')+word).width>iw-30&&line){lines.push(line);line=word;}else line+=(line?' ':'')+word;}lines.push(line);for(const [i,t]of lines.entries()){ctx.strokeText(t,iw/2,y+i*size*1.15);ctx.fillText(t,iw/2,y+i*size*1.15);}};draw(o.top||'',12);draw(o.bottom||'',ih-size*1.3*(Math.max(1,Math.ceil(ctx.measureText(o.bottom||'').width/(iw-30))))-12);
 }
 if(tool==='border'){const size=number(o.border,20,1,500),out=canvas(iw+size*2,ih+size*2),cx=out.getContext('2d');cx.fillStyle=hex(o.color);cx.fillRect(0,0,out.width,out.height);cx.drawImage(c,size,size);c=out;}
 if(tool==='rounded'){const out=canvas(iw,ih),cx=out.getContext('2d');cx.beginPath();cx.roundRect(0,0,iw,ih,Math.min(iw/2,ih/2,number(o.radius,40,0,1000)));cx.clip();cx.drawImage(c,0,0);c=out;}
 return c;
}
async function encodeGIF(frames,delay,signal){const {GIFEncoder,quantize,applyPalette}=await dependency('image-codecs'),enc=GIFEncoder();for(const frame of frames){stop(signal);const pixels=frame.canvas.getContext('2d').getImageData(0,0,frame.canvas.width,frame.canvas.height).data,palette=quantize(pixels,256,{format:'rgba4444',oneBitAlpha:true}),indexed=applyPalette(pixels,palette,'rgba4444'),index=palette.findIndex(p=>p[3]===0);enc.writeFrame(indexed,frame.canvas.width,frame.canvas.height,{palette,delay:frame.delay||delay,repeat:0,transparent:index>=0,transparentIndex:Math.max(0,index),dispose:2});await breathe(signal);}enc.finish();return new Blob([enc.bytes()],{type:'image/gif'});}
async function encode(c,format,quality,signal){
 if(format==='gif')return encodeGIF([{canvas:c}],100,signal);
 if(format==='tiff'){const {UTIF}=await dependency('image-codecs');return new Blob([UTIF.encodeImage(c.getContext('2d').getImageData(0,0,c.width,c.height).data,c.width,c.height)],{type:'image/tiff'});}
 if(format==='svg')return new Blob([`<svg xmlns="http://www.w3.org/2000/svg" width="${c.width}" height="${c.height}" viewBox="0 0 ${c.width} ${c.height}"><image width="${c.width}" height="${c.height}" href="${c.toDataURL('image/png')}"/></svg>`],{type:'image/svg+xml'});
 if(format==='jpeg'){const out=canvas(c.width,c.height),cx=out.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,c.width,c.height);cx.drawImage(c,0,0);return blob(out,'image/jpeg',quality);}return blob(c,'image/'+format,quality);
}
async function animated(file,tool,o,signal,progress){const {parseGIF,decompressFrames}=await dependency('image-codecs'),parsed=parseGIF(await file.arrayBuffer()),width=parsed.lsd.width,height=parsed.lsd.height;const count=parsed.frames.filter(f=>f.image).length;if(count>120||width*height*count>16000000)throw new Error('GIF terlalu berat. Gunakan maksimal 120 frame dan total 16 megapiksel.');const frames=decompressFrames(parsed,true),screen=canvas(width,height),ctx=screen.getContext('2d');const output=[];let previous,restore;
 for(let i=0;i<frames.length;i++){stop(signal);if(previous?.disposalType===2)ctx.clearRect(previous.dims.left,previous.dims.top,previous.dims.width,previous.dims.height);else if(previous?.disposalType===3&&restore)ctx.putImageData(restore,0,0);const f=frames[i];restore=f.disposalType===3?ctx.getImageData(0,0,width,height):null;const patch=canvas(f.dims.width,f.dims.height);patch.getContext('2d').putImageData(new ImageData(f.patch,f.dims.width,f.dims.height),0,0);ctx.drawImage(patch,f.dims.left,f.dims.top);const transformed=transformImage(screen,tool,o);if(transformed.width*transformed.height*frames.length>16000000)throw new Error('Ukuran animasi hasil terlalu besar. Kurangi ukuran atau jumlah frame.');output.push({canvas:transformed,delay:f.delay});previous=f;progress((i+1)/frames.length*.7);await breathe(signal);}const b=await encodeGIF(output,100,signal);output.forEach(f=>{f.canvas.width=f.canvas.height=1;});progress(1);return b;}
export async function processImage(tool,files,o={},signal,progress=()=>{}){
 const outputs=[];stop(signal);
 if(tool==='images-pdf')return processPDF('images-pdf',files,o,signal,progress);
 if(['collage','sprite','gif'].includes(tool)){
  const width=number(o.width,1200,32,5000),gap=number(o.gap,12,0,100),cols=number(o.columns,2,1,8),tile=number(o.tile,400,32,2000),rows=Math.ceil(files.length/cols);
  if(tool==='gif'){if(files.length>60)throw new Error('Gunakan maksimal 60 gambar untuk membuat GIF.');if(width*number(o.height,800,32,5000)*files.length>16000000)throw new Error('Animasi melebihi total 16 megapiksel. Kurangi dimensi atau jumlah gambar.');const frames=[];for(let i=0;i<files.length;i++){const im=await image(files[i]),c=canvas(width,number(o.height,800,32,5000)),ctx=c.getContext('2d');ctx.fillStyle=hex(o.background);ctx.fillRect(0,0,c.width,c.height);fit(ctx,im,0,0,c.width,c.height,o.fit==='cover');frames.push({canvas:c});progress((i+1)/files.length*.6);await breathe(signal);}outputs.push(result('animasi-bekal.gif',await encodeGIF(frames,number(o.delay,300,20,5000),signal),'image/gif'));return outputs;}
  const c=canvas(tool==='sprite'?cols*tile:width,tool==='sprite'?rows*tile:rows*(width/cols)),ctx=c.getContext('2d');ctx.fillStyle=hex(o.background);ctx.fillRect(0,0,c.width,c.height);let css='/* Sprite Bekal */\n';for(let i=0;i<files.length;i++){const im=await image(files[i]),cw=c.width/cols,ch=c.height/rows,x=i%cols*cw,y=Math.floor(i/cols)*ch;fit(ctx,im,x+gap/2,y+gap/2,cw-gap,ch-gap,o.fit==='cover');css+=`.sprite-${i+1}{width:${Math.round(cw)}px;height:${Math.round(ch)}px;background:url("sprite-bekal.png") -${Math.round(x)}px -${Math.round(y)}px;}\n`;progress((i+1)/files.length);await breathe(signal);}outputs.push(result(tool==='sprite'?'sprite-bekal.png':'kolase-bekal.png',await blob(c),'image/png'));if(tool==='sprite')outputs.push(result('sprite-bekal.css',css,'text/css'));return outputs;
 }
 for(let i=0;i<files.length;i++){
  const file=files[i],name=safeName(file.name),tick=f=>progress((i+f)/files.length);stop(signal);const format=o.format||(['remove-bg','rounded'].includes(tool)?'png':'jpeg');
  if(file.type==='image/gif'&&format==='gif'&&['compress','resize','crop','rotate','flip','watermark','adjust','grayscale','sepia','blur','pixelate','remove-bg','metadata','convert'].includes(tool)){outputs.push(result(name+'-'+tool+'.gif',await animated(file,tool,o,signal,tick),'image/gif','Animasi dipertahankan; warna dikuantisasi hingga 256 warna.'));continue;}
  const im=await image(file),c=transformImage(im,tool,o);
  if(tool==='ocr-image'){const data=await ocr(c,signal,tick);outputs.push(result(name+'-teks.txt',data.text,'text/plain;charset=utf-8','Periksa kembali angka dan nama pada hasil OCR.'));continue;}
  if(tool==='palette'){const tiny=canvas(64,64),ctx=tiny.getContext('2d');ctx.drawImage(im,0,0,64,64);const data=ctx.getImageData(0,0,64,64).data,map=new Map();for(let n=0;n<data.length;n+=4){if(data[n+3]<128)continue;const key=[data[n],data[n+1],data[n+2]].map(v=>Math.min(255,Math.round(v/32)*32).toString(16).padStart(2,'0')).join('');map.set(key,(map.get(key)||0)+1);}const colors=[...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>'#'+x[0]);const out=canvas(800,160),cx=out.getContext('2d');colors.forEach((col,n)=>{cx.fillStyle=col;cx.fillRect(n*800/colors.length,0,800/colors.length,110);cx.fillStyle='#fff';cx.fillRect(n*800/colors.length,110,800/colors.length,50);cx.fillStyle='#111';cx.font='14px Arial';cx.fillText(col,n*800/colors.length+12,142);});outputs.push(result(name+'-palet.png',await blob(out),'image/png'),result(name+'-palet.json',JSON.stringify({colors},null,2),'application/json'));tick(1);continue;}
  const b=await encode(c,format,number(o.quality,85,5,100)/100,signal);
  if(tool==='compress'&&b.size>=file.size&&b.type===file.type)outputs.push(result(file.name,file,file.type,'File asli dipertahankan karena hasil kompresi tidak lebih kecil.'));
  else outputs.push(result(name+'-'+tool+'.'+(format==='jpeg'?'jpg':format==='tiff'?'tif':format),b,b.type,`${c.width} × ${c.height} piksel`+(file.type==='image/gif'&&format!=='gif'?'. GIF menjadi gambar frame pertama.':format==='svg'?'. SVG membungkus bitmap, bukan vektor hasil tracing.':'')));
  c.width=c.height=1;tick(1);await breathe(signal);
 }
 return outputs;
}
