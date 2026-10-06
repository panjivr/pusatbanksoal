const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8010/assets/studio-film-ai/studio.html');
 const result=await page.evaluate(async()=>{
  const {generateStudioVideo,generateStudioAudio}=await import('/assets/studio-film-ai/src/services/openRouterMedia.ts');
  const {reloadStudioCatalog}=await import('/assets/studio-film-ai/src/services/openRouterCatalog.ts');
  const {getTasks,cancelTask}=await import('/assets/studio-film-ai/src/services/taskCenter.ts');
  localStorage.setItem('bekal_ai_routing_v1',JSON.stringify({version:1,fallback:true,imagesViaOpenRouter:true,routes:[{id:'openrouter',name:'OpenRouter',enabled:true,baseUrl:'https://openrouter.ai/api/v1',model:'text',apiKey:'fixture-only'}]}));
  const originalFetch=window.fetch;let posts=0,downloadFails=true,tts=0,chat=0;
  const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
  window.fetch=async(url,opts)=>{
   url=String(url);
   if(url.endsWith('/videos/models'))return json({data:[{id:'test/video',supported_resolutions:['720p'],supported_aspect_ratios:['16:9'],supported_durations:[8],supported_frame_images:[]}]});
   if(url.includes('/models?output_modalities=speech'))return json({data:[{id:'test/tts',architecture:{output_modalities:['speech']},supported_voices:['id-ID-A']}]});
   if(url.includes('/models?output_modalities=audio'))return json({data:[{id:'test/audio',architecture:{output_modalities:['audio']},description:'Conversational audio'}]});
   if(url.endsWith('/videos')){posts++;return json({id:'abc123',status:'completed'});}
   if(url.endsWith('/videos/abc123'))return json({id:'abc123',status:'completed'});
   if(url.endsWith('/content'))return downloadFails?new Response('',{status:503}):new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'video/mp4'}});
   if(url.endsWith('/audio/speech')){const body=JSON.parse(opts.body);if(body.voice!=='id-ID-A'||body.input!=='Halo'||body.response_format!=='wav')throw new Error('Bad TTS payload');tts++;return new Response(new Uint8Array([82,73,70,70]),{headers:{'content-type':'audio/wav'}});}
   if(url.endsWith('/chat/completions')){chat++;const body=JSON.parse(opts.body);if(!body.stream)throw new Error('Missing streaming');return new Response('data: {"choices":[{"delta":{"audio":{"data":"AQID"}}}]}\n\ndata: [DONE]\n\n',{headers:{'content-type':'text/event-stream'}});}
   throw new Error('Unexpected fixture request '+url);
  };
  try{
   reloadStudioCatalog();let failure='';try{await generateStudioVideo('test/video','retry download')}catch(e){failure=e.message;}
   const saved=Object.keys(localStorage).filter(k=>k.startsWith('bekal-openrouter-video-job-v1:'));
   if(saved.length!==1||!failure.includes('unduhan'))throw new Error('Missing durable video job');
   downloadFails=false;const video=await generateStudioVideo('test/video','retry download');const bytes=Array.from(new Uint8Array(await (await originalFetch(video.url)).arrayBuffer()));
   if(posts!==1)throw new Error('Recovery resubmitted paid job');
   const voice=await generateStudioAudio('test/tts','Halo');const audio=await generateStudioAudio('test/audio','Halo');
   // Freeze a response, cancel from Activity, then allow it to settle.
   let settle;window.fetch=async()=>new Promise(resolve=>{settle=resolve});
   const pending=generateStudioAudio('test/audio','cancel');let task;for(let i=0;i<100;i++){task=getTasks().find(t=>t.status==='running'&&t.kind==='audio');if(task && settle)break;await new Promise(r=>setTimeout(r,50));}
   if(!task || !settle)throw new Error('Fixture audio task did not start: '+JSON.stringify(getTasks()));cancelTask(task.id);settle(new Response('data: {"choices":[{"delta":{"audio":{"data":"AQID"}}}]}\n\ndata: [DONE]\n\n'));await pending.catch(()=>{});
   return {posts,bytes,tts,chat,voice:voice.type,audio:audio.url,cancelled:getTasks().find(t=>t.id===task.id).status};
  }finally{window.fetch=originalFetch;reloadStudioCatalog();}
 });
 assert.deepEqual(result,{posts:1,bytes:[1,2,3],tts:1,chat:1,voice:'audio',audio:'data:audio/wav;base64,AQID',cancelled:'cancelled'});
 // Verify mask compositing preserves the exact outside pixels in the browser.
 const mask=await page.evaluate(async()=>{
  const {editMaskedImage}=await import('/assets/studio-film-ai/src/services/maskedImageEdit.ts');const {reloadStudioCatalog}=await import('/assets/studio-film-ai/src/services/openRouterCatalog.ts');
  const canvas=()=>{const c=document.createElement('canvas');c.width=4;c.height=4;return c;};const base=canvas(),mask=canvas(),output=canvas();base.getContext('2d').fillStyle='rgb(255,0,0)';base.getContext('2d').fillRect(0,0,4,4);mask.getContext('2d').fillRect(0,0,2,4);output.getContext('2d').fillStyle='rgb(0,0,255)';output.getContext('2d').fillRect(0,0,4,4);
  const original=window.fetch;window.fetch=async(url,opts)=>new Response(JSON.stringify(String(url).endsWith('/images/models') ? {data:[]} : String(url).endsWith('/models')?{data:[{id:'test/image',architecture:{input_modalities:['text','image'],output_modalities:['image']}}]}:{choices:[{message:{images:[{image_url:{url:output.toDataURL()}}]}}]}),{headers:{'content-type':'application/json'}});
  try{reloadStudioCatalog();const result=await editMaskedImage('test/image','edit',base,mask,'1K');const image=new Image();image.src=result.url;await image.decode();output.getContext('2d').drawImage(image,0,0);const ctx=output.getContext('2d');return {inside:Array.from(ctx.getImageData(0,0,1,1).data),outside:Array.from(ctx.getImageData(3,0,1,1).data)};}finally{window.fetch=original;reloadStudioCatalog();}
 });assert.deepEqual(mask,{inside:[0,0,255,255],outside:[255,0,0,255]});
 await page.evaluate(async()=>{const {startTask}=await import('/assets/studio-film-ai/src/services/taskCenter.ts');for(let i=0;i<20;i++)startTask({label:'audit-persist-'+i}).fail(new Error('fixture failure'));});
 await page.reload();const persisted=await page.evaluate(async()=>{const {getTasks}=await import('/assets/studio-film-ai/src/services/taskCenter.ts');return getTasks().filter(t=>t.label.startsWith('audit-persist-')&&t.status==='failed').length;});assert.equal(persisted,20);
 console.log('PASS: 20 failed tasks retained after browser reload.');
 console.log('PASS: opaque video ID, durable download recovery with one POST, speech endpoint, chat streaming, cancellation terminal state, exact pixels outside edit mask. API responses simulated.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
