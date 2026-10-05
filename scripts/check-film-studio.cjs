const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.PBS_SITE_BASE_URL||'http://127.0.0.1:8006';
const dev=process.env.FILM_DEV_BASE_URL||'http://127.0.0.1:8007/assets/studio-film-ai/';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 try{
 const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(dev);
 const result=await p.evaluate(async()=>{
  const db=await import('/assets/studio-film-ai/src/lib/db.ts');const cd=await import('/assets/studio-film-ai/src/lib/canvas-db.ts');const {localClient}=await import('/assets/studio-film-ai/src/lib/local-store.ts');
  const check=(v,m)=>{if(!v)throw Error(m)};
  const project=await db.createProject({title:'Uji Studio',genre:'Drama',logline:'Sebuah surat mengubah hidup Rani.'});
  const other=await db.createProject({title:'Proyek Kedua'});
  const ch=await db.createCharacter(project.id,{canonical_name:'Rani'});
  await db.createWardrobe(project.id,{character_id:ch.id,name:'Jaket'});await db.createLocation(project.id,{name:'Rumah'});await db.createProp(project.id,{name:'Surat'});
  const ep=await db.createEpisode(project.id,{number:1,title:'Surat pertama'});
  let duplicate=false;try{await db.createEpisode(project.id,{number:1});}catch{duplicate=true;}check(duplicate,'Episode unique constraint');
  const sc=await db.createScene(project.id,ep.id,1,{objective:'Membaca surat',time_of_day:'pagi'});
  const sh=await db.createShot(project.id,sc.id,1,{character_id:ch.id,action:'Rani membuka surat',duration:2,camera_move:'push-in'});
  await db.updateShotQC([sh.id],'pass','OK');
  const params={expression:'neutral',light_side:'left',intensity:.6};const kf=await db.upsertKeyframe(project.id,sh.id,1,params);const kf2=await db.upsertKeyframe(project.id,sh.id,2,params);check(kf.id===kf2.id,'Upsert preserves identity');await db.setKeyframeApproval(kf.id,true);
  const n1=await cd.createCanvasNode(project.id,{kind:'episode',title:'Episode',episode_id:ep.id});const n2=await cd.createCanvasNode(project.id,{kind:'scene',title:'Scene',scene_id:sc.id});await cd.createCanvasEdge(project.id,n1.id,n2.id);await cd.deleteCanvasNode(n2.id);check((await cd.loadCanvas(project.id)).edges.length===0,'Edge cascade');
  await db.createCharacter(other.id,{canonical_name:'Karakter proyek lain'});
  const data=await db.loadStudioData();check(data.episodes.length===1,'Failed transaction rollback');check(data.shots[0].qc_status==='pass','in update');
  const bad=await localClient.from('shots').insert({project_id:project.id,scene_id:'missing'});check(!!bad.error,'Foreign key check');
  const state=await new Promise((resolve,reject)=>{const r=indexedDB.open('bekal-cinematic-studio',1);r.onsuccess=()=>{const q=r.result.transaction('state').objectStore('state').get('current');q.onsuccess=()=>{resolve(q.result);r.result.close()};q.onerror=()=>reject(q.error)}});
  const video=await import('/assets/studio-film-ai/src/lib/video-engine.ts');check(video.canRecordVideo(),'Recorder available');
  const clip=await video.renderShotClip({shot:sh,scene:sc,project,character:ch,seed:1,params},10);check(clip.blob.size>1000,'Actual clip bytes');
  const film=await video.assembleFilm({clips:[clip,clip]});check(film.size>1000,'Actual assembled film bytes');
  const playback=await new Promise((resolve,reject)=>{const v=document.createElement('video');v.muted=true;v.src=URL.createObjectURL(film);v.onerror=()=>reject(Error('Film decode'));v.onended=()=>resolve({width:v.videoWidth,height:v.videoHeight,time:v.currentTime});v.play().catch(reject)});check(playback.time>=3,'Both clips play');
  await db.deleteProject(project.id);const left=await db.loadStudioData();check(left.scenes.length===0&&left.shots.length===0&&left.keyframes.length===0&&left.episodes.length===0,'Project cascade');check(left.characters.length===1,'Other project survives');await db.deleteProject(other.id);
  return {state,projectId:project.id,playback,clipBytes:clip.blob.size,filmBytes:film.size};
 });
 console.log('PASS: local CRUD, rollback, relationships, keyframes, Canvas edges and actual WebM render/assembly',result.playback);
 await p.goto(base+'/film-studio.html');await p.getByRole('button',{name:'Buat Proyek Baru',exact:true}).click();await p.getByLabel('Judul Serial').fill('Proyek lewat UI');await p.getByRole('button',{name:'Buat Series Bible',exact:true}).click();await p.getByRole('button',{name:'AI Canvas',exact:true}).waitFor();await p.reload();await p.getByRole('button',{name:'AI Canvas',exact:true}).waitFor();assert.equal(await p.locator('header select').inputValue()!=='',true);
 // Load a populated fixture through the same native IndexedDB storage used by the application.
 await p.evaluate(async({state,projectId})=>{await new Promise((resolve,reject)=>{const r=indexedDB.open('bekal-cinematic-studio',1);r.onsuccess=()=>{const tx=r.result.transaction('state','readwrite');tx.objectStore('state').put(state,'current');tx.oncomplete=()=>{r.result.close();resolve()};tx.onerror=()=>reject(tx.error)}});localStorage.setItem('bekal-film-active-project',projectId)},result);
 await p.reload();await p.getByRole('button',{name:'AI Canvas',exact:true}).click();await p.getByRole('button',{name:'Sync Aset',exact:true}).click();await p.waitForTimeout(300);const count=await p.evaluate(async()=>{const r=await new Promise(resolve=>{const req=indexedDB.open('bekal-cinematic-studio',1);req.onsuccess=()=>resolve(req.result)});return await new Promise(resolve=>{const q=r.transaction('state').objectStore('state').get('current');q.onsuccess=()=>{resolve(q.result.canvas_nodes.length);r.close()}})});await p.getByRole('button',{name:'Sync Aset',exact:true}).click();await p.waitForTimeout(300);const second=await p.evaluate(async()=>{const r=await new Promise(resolve=>{const req=indexedDB.open('bekal-cinematic-studio',1);req.onsuccess=()=>resolve(req.result)});return await new Promise(resolve=>{const q=r.transaction('state').objectStore('state').get('current');q.onsuccess=()=>{resolve(q.result.canvas_nodes.length);r.close()}})});assert.equal(second,count,'Repeated asset sync must not duplicate');
 await p.locator('header nav').getByRole('button',{name:'Produksi',exact:true}).click();
 await p.locator('main select').selectOption(result.state.episodes[0].id);
 const imageDownload=p.waitForEvent('download');await p.getByTitle('Unduh gambar',{exact:true}).click();const image=await imageDownload;assert.match(image.suggestedFilename(),/\.jpg$/);assert.equal(await image.failure(),null);
 await p.getByRole('button',{name:'Lanjut ke Video →',exact:true}).click();await p.getByRole('button',{name:/Render Semua/}).click();await p.getByRole('button',{name:'Lanjut ke Rakitan →',exact:true}).waitFor();await p.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('Lanjut ke Rakitan')&&!b.disabled));await p.getByRole('button',{name:'Lanjut ke Rakitan →',exact:true}).click();await p.getByRole('button',{name:'Jadikan Video Episode',exact:true}).click();await p.getByRole('button',{name:'Unduh Episode',exact:true}).waitFor();
 const episodeDownload=p.waitForEvent('download');await p.getByRole('button',{name:'Unduh Episode',exact:true}).click();const episodeFile=await episodeDownload;assert.equal(await episodeFile.failure(),null);
 await p.getByRole('button',{name:'Lanjut ke Film Final →',exact:true}).click();
 const wav=Buffer.alloc(44+16000*2);wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);for(let i=0;i<16000;i++)wav.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*440/16000)*6000),44+i*2);
 await p.locator('input[type=file]').nth(1).setInputFiles({name:'narasi.wav',mimeType:'audio/wav',buffer:wav});
 await p.getByRole('button',{name:'Rakit Ulang',exact:true}).click();await p.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('Gabungkan Jadi Film')&&!b.disabled));await p.getByRole('button',{name:'Gabungkan Jadi Film',exact:true}).click();await p.getByRole('button',{name:'Ekspor Film (.webm)',exact:true}).waitFor();
 const masterDownload=p.waitForEvent('download');await p.getByRole('button',{name:'Ekspor Film (.webm)',exact:true}).click();const masterFile=await masterDownload;assert.equal(await masterFile.failure(),null);const fs=require('node:fs');const exported=fs.readFileSync(await masterFile.path());assert.ok(exported.length>1000);assert.equal(exported.subarray(0,4).toString('hex'),'1a45dfa3');assert.ok(exported.includes(Buffer.from('A_OPUS')),'Narration audio track must exist in final WebM');
 console.log('PASS: UI keyframe JPEG download, clip render, episode assembly, audio mixing and final WebM download ('+exported.length+' bytes).');
 let checks=0;
 for(const viewport of [{width:320,height:740},{width:390,height:844},{width:768,height:1024},{width:1024,height:768},{width:1440,height:900},{width:2560,height:1440},{width:820,height:390}]){
  await p.setViewportSize(viewport);
  for(const tab of ['AI Canvas','Series Bible','Asset Bible','Episode','Shot List','Produksi']){
   await p.locator('header nav').getByRole('button',{name:tab,exact:true}).click();if(tab==='Shot List'){await p.locator('header nav').getByRole('button',{name:'Episode',exact:true}).click();await p.locator('main').getByRole('button',{name:'Shot List',exact:true}).click();}await p.waitForTimeout(60);
   const inspect=async()=>await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);if(!r.width||!r.height||s.visibility==='hidden'||s.display==='none')return false;for(let a=el.parentElement;a&&a!==document.body;a=a.parentElement)if(['auto','scroll','hidden'].includes(getComputedStyle(a).overflowX))return false;return r.right>innerWidth+2||r.left< -2}).slice(0,5).map(el=>({tag:el.tagName,text:el.textContent.slice(0,70),class:el.getAttribute('class')})));
   assert.deepEqual(await inspect(),[],JSON.stringify({viewport,tab,overflow:await inspect()}));checks++;
   if(tab==='Produksi')for(const name of [/^1\s*Gambar/,/^2\s*Video/,/^3\s*Episode/,/^4\s*Film Final/]){await p.getByRole('button',{name}).click();await p.waitForTimeout(60);if(await p.locator('main select').count())await p.locator('main select').first().selectOption(result.state.episodes[0].id);await p.waitForTimeout(60);assert.deepEqual(await inspect(),[],JSON.stringify({viewport,name:String(name),overflow:await inspect()}));checks++;}
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS: project creation/reload, idempotent Canvas sync and '+checks+' populated responsive panels.');await p.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
