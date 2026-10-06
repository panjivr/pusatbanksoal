const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{const page=await browser.newPage();await page.goto('http://127.0.0.1:8010/assets/studio-film-ai/studio.html');const result=await page.evaluate(async()=>{
 const api=await import('/assets/studio-film-ai/src/services/bekalBrowserProject.ts');
 const serialization=await import('/assets/studio-film-ai/src/services/projectSerialization.ts');
 const block=new Uint8Array(1024*1024);block[0]=17;block[block.length-1]=239;
 const bytes=new Blob(Array.from({length:128},()=>block),{type:'video/mp4'});
 const path='browser/large-'+crypto.randomUUID();
 const project={name:'Proyek Besar',storyBible:{title:'Proyek Besar',script:'Naskah lengkap tidak berubah.'},projectHub:{shotPrompts:Array.from({length:160},(_,i)=>({shot:i+1,prompt:'Adegan '+(i+1),imagePath:'media/frame.png',imageVersionPaths:['media/frame.png','media/frame-v2.png']}))},mediaItems:[{id:'video',name:'besar.mp4',type:'video',path:'media/large.mp4'}],timelineClips:[{id:'clip',mediaId:'video',start:0,end:8}],timelineTracks:[],references:[],avatars:[]};
 await api.browserProjectApi.saveProject({folderPath:path,project,assets:[{relativePath:'media/large.mp4',data:await bytes.arrayBuffer()},{relativePath:'media/frame.png',data:new Uint8Array([1,2,3]).buffer},{relativePath:'media/frame-v2.png',data:new Uint8Array([4,5,6]).buffer}]});
 const statuses=[];const backup=await api.createBrowserProjectBackup(path,s=>statuses.push(s));
 const restored=await api.importBrowserProject(new File([backup.blob],backup.name),s=>statuses.push(s));
 const loaded=await api.browserProjectApi.loadProject({folderPath:restored});
 const metadata=JSON.parse(new TextDecoder().decode(await api.browserProjectApi.readProjectFile({folderPath:restored,relativePath:'project.json'})));
 if(JSON.stringify(metadata)!==JSON.stringify(project))throw new Error('Restored project.json must preserve the project contract.');
 const savedVideo=await fetch(api.browserAssetUrl(restored,'media/large.mp4')).then(r=>r.blob());
 const first=new Uint8Array(await savedVideo.slice(0,1).arrayBuffer())[0],last=new Uint8Array(await savedVideo.slice(-1).arrayBuffer())[0];
 const versions=await api.browserProjectApi.readProjectFile({folderPath:restored,relativePath:'media/frame-v2.png'});
 let truncated=false;try{await api.importBrowserProject(new File([backup.blob.slice(0,-1)],'rusak.bekal-film'));}catch{truncated=true;}
 const legacy=await api.importBrowserProject(new File([JSON.stringify({format:'bekal-video-project',version:1,project:{name:'Cadangan Lama'},assets:[{relativePath:'media/a.png',data:'AQID',mime:'image/png'}]})],'lama.json'));
 const legacyBytes=await api.browserProjectApi.readProjectFile({folderPath:legacy,relativePath:'media/a.png'});
 return {backupSize:backup.blob.size,videoSize:savedVideo.size,first,last,versions:Array.from(versions),legacyBytes:Array.from(legacyBytes),restoredProject:loaded.project,original:project,truncated,statuses};
});assert.equal(result.videoSize,128*1024*1024);assert.ok(result.backupSize<result.videoSize+1024*1024);assert.equal(result.first,17);assert.equal(result.last,239);assert.deepEqual(result.versions,[4,5,6]);assert.deepEqual(result.legacyBytes,[1,2,3]);assert.deepEqual(result.restoredProject,result.original);assert.ok(result.truncated);assert.ok(result.statuses.length>2);console.log('PASS: 128 MiB binary media + 160 shots and frame versions save/backup/restore, byte boundaries, legacy JSON import, progress and truncated-backup rejection.');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
