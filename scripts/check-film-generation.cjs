// Exercises the real SDK, services and character buttons with simulated provider responses.
// No paid generation request or real key is sent by this check.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZQAAAABJRU5ErkJggg==';
const videoFixture=Buffer.from('AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAPBbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAA+gAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAux0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAA+gAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAEAAAABAAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAPoAAAIAAABAAAAAAJkbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAwAAAAMABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAACD21pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAc9zdGJsAAAAv3N0c2QAAAAAAAAAAQAAAK9hdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAEAAQABIAAAASAAAAAAAAAABFUxhdmM2MS4xOS4xMDEgbGlieDI2NAAAAAAAAAAAAAAAGP//AAAANWF2Y0MBZAAK/+EAGGdkAAqs2UQmwEQAAAMABAAAAwBgPEiWWAEABmjr48siwP34+AAAAAAQcGFzcAAAAAEAAAABAAAAFGJ0cnQAAAAAAAAbuAAAAAAAAAAYc3R0cwAAAAAAAAABAAAADAAABAAAAAAUc3RzcwAAAAAAAAABAAAAAQAAAGhjdHRzAAAAAAAAAAsAAAABAAAIAAAAAAEAABQAAAAAAQAACAAAAAABAAAAAAAAAAEAAAQAAAAAAQAAFAAAAAABAAAIAAAAAAEAAAAAAAAAAQAABAAAAAABAAAQAAAAAAIAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAAMAAAAAQAAAERzdHN6AAAAAAAAAAAAAAAMAAAC3QAAAA4AAAAMAAAADAAAAAwAAAAUAAAADgAAAAwAAAAMAAAAFAAAAA4AAAAMAAAAFHN0Y28AAAAAAAAAAQAAA/EAAABhdWR0YQAAAFltZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAACxpbHN0AAAAJKl0b28AAAAcZGF0YQAAAAEAAAAATGF2ZjYxLjcuMTAzAAAACGZyZWUAAAN/bWRhdAAAAq4GBf//qtxF6b3m2Ui3lizYINkj7u94MjY0IC0gY29yZSAxNjQgcjMxMDggMzFlMTlmOSAtIEguMjY0L01QRUctNCBBVkMgY29kZWMgLSBDb3B5bGVmdCAyMDAzLTIwMjMgLSBodHRwOi8vd3d3LnZpZGVvbGFuLm9yZy94MjY0Lmh0bWwgLSBvcHRpb25zOiBjYWJhYz0xIHJlZj0zIGRlYmxvY2s9MTowOjAgYW5hbHlzZT0weDM6MHgxMTMgbWU9aGV4IHN1Ym1lPTcgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTEgOHg4ZGN0PTEgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz0yIGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MyBiX3B5cmFtaWQ9MiBiX2FkYXB0PTEgYl9iaWFzPTAgZGlyZWN0PTEgd2VpZ2h0Yj0xIG9wZW5fZ29wPTAgd2VpZ2h0cD0yIGtleWludD0yNTAga2V5aW50X21pbj0xMiBzY2VuZWN1dD00MCBpbnRyYV9yZWZyZXNoPTAgcmNfbG9va2FoZWFkPTQwIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAACdliIQAEP/+5sD5llUNV3/2YjwHgLSLlJeKSOrCiJeV3ezaG+F4beEAAAAKQZokbEEP/qpX3gAAAAhBnkJ4hv8HfQAAAAgBnmF0Qz8ICAAAAAgBnmNqQz8ICQAAABBBmmhJqEFomUwIf//+qZ01AAAACkGehkURLDf/B30AAAAIAZ6ldEM/CAkAAAAIAZ6nakM/CAgAAAAQQZqrSahBbJlMCGf//p4t8AAAAApBnslFFSw3/wd9AAAACAGe6mpDPwgI','base64');
const base = 'http://127.0.0.1:8010/assets/studio-film-ai/studio.html';
(async () => {
 const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  const page = await browser.newPage({viewport:{width:390,height:844}}), errors=[], requests=[];
  page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR:',e.message)});
  await page.addInitScript(()=>{localStorage.setItem('studio_onboarding_completed_v1','true');localStorage.setItem('ui_mode_v1','pro');localStorage.setItem('gemini_api_key','fake-google-key');});
  let googleError=0, textError=0, emptyImage=false, fallbackImage=false, videoComplete=false, googlePolicy=false;
  await page.route('https://generativelanguage.googleapis.com/**',async route=>{
   const req=route.request(),url=req.url(),body=req.postDataJSON();requests.push({provider:'google',url,body});
   const fulfill=body=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
   if(url.includes('files/test-video:download')) {assert.equal(req.headers()['x-goog-api-key'],'fake-google-key');assert.equal(new URL(url).searchParams.has('key'),false);return route.fulfill({status:200,contentType:'video/mp4',body:videoFixture})}
   if(req.method()==='GET') return fulfill({models:[{name:'models/gemini-2.5-flash-image',supportedGenerationMethods:['generateContent']}]});
   if(googleError) return route.fulfill({status:googleError,contentType:'application/json',body:JSON.stringify({error:{code:googleError,message:'PERMISSION_DENIED fake-google-key'}})});
   if(url.includes(':predictLongRunning'))return fulfill(videoComplete?{name:'operations/test-video',done:true,response:{generateVideoResponse:{generatedSamples:[{video:{uri:'https://generativelanguage.googleapis.com/v1beta/files/test-video:download'}}]}}}:{name:'operations/test-video'});
   if(url.includes(':predict'))return fulfill({predictions:[{bytesBase64Encoded:png,mimeType:'image/png'}]});
   const media=body?.generationConfig?.responseModalities || [];
   if(media.includes('IMAGE')) {
    if(googlePolicy)return fulfill({promptFeedback:{blockReason:'SAFETY'}});
    assert.equal(body.systemInstruction,undefined,'Image system instruction must stay native');
    if(fallbackImage && url.includes('gemini-3.1-flash-image-preview'))return route.fulfill({status:404,contentType:'application/json',body:'{"error":{"code":404,"message":"model not found"}}'});
    if(url.includes('gemini-2.5-flash-image'))assert.equal(body.generationConfig.imageConfig.imageSize,undefined,'2.5 image fallback must drop unsupported imageSize');
    return fulfill({candidates:[{content:{role:'model',parts:emptyImage?[{text:'Tidak ada gambar'}]:[{inlineData:{mimeType:'image/png',data:png}}]},finishReason:'STOP'}]});
   }
   if(media.includes('AUDIO'))return fulfill({candidates:[{content:{parts:[{inlineData:{mimeType:'audio/pcm;rate=24000',data:Buffer.alloc(4800).toString('base64')}}]},finishReason:'STOP'}]});
   if(textError)return route.fulfill({status:textError,contentType:'application/json',body:JSON.stringify({error:{code:textError,message:'quota exhausted'}})});
   return fulfill({candidates:[{content:{role:'model',parts:[{text:JSON.stringify({prompt:'Potret Fitri dengan identitas dan pakaian yang sama',tags:['karakter']})}]},finishReason:'STOP'}]});
  });
  await page.route('https://queue.fal.run/**',async route=>{
   const req=route.request();requests.push({provider:'fal',url:req.url(),body:req.method()==='POST'?req.postDataJSON():null});
   assert.equal(req.headers().authorization,'Key fake-fal-key');
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(req.method()==='POST'?{request_id:'test-job',status:'COMPLETED',response_url:'https://queue.fal.run/test/result'}:{images:[{url:`data:image/png;base64,${png}`}]} )});
  });
  await page.route('https://mock-image.test/**',r=>r.fulfill({status:200,contentType:'image/png',body:Buffer.from(png,'base64')}));
  await page.goto(base);await page.locator('.project-hub').waitFor();
  const serviceResult = await page.evaluate(async png=>{
   const service=await import('/assets/studio-film-ai/src/services/geminiService.ts');
   const client=await import('/assets/studio-film-ai/src/services/studioAiClient.ts');
   const budgets=[], originalTimeout=window.setTimeout;
   window.setTimeout=function(fn,ms,...args){if(ms>=10000)budgets.push(ms);return originalTimeout(fn,ms,...args)};
   try {
    const reference={base64:png,mimeType:'image/png'};
    const outputs=[await service.generateImageWithNano('Potret Fitri',{aspectRatio:'9:16',imageSize:'1K'}),await service.generateImageWithGemini3Pro('Potret Bayu','9:16','1K'),await service.generateImageWithReferences('Identitas Fitri tetap sama',[reference],reference,'gemini-3.1-flash-image-preview',{aspectRatio:'9:16'}),await service.generateImageWithImagen('Pemandangan','16:9'),await service.generateSpeechWithTTS('Selamat datang di Bekal'),await service.generateMoviePoster({title:'Film Fitri',logline:'Kisah keluarga',script:'Fitri di rumah',selectedStyle:'realistis'},[])];
    const video=await client.getStudioAiClient().models.generateVideos({model:'veo-3.1-generate-preview',prompt:'Adegan desa',config:{aspectRatio:'16:9'}});
    return {outputs:outputs.map(o=>({type:o.type,url:o.url})),video:video.name,budgets};
   }finally{window.setTimeout=originalTimeout}
  },png);
  assert.equal(serviceResult.outputs.filter(o=>o.type==='image'&&o.url.startsWith('data:image/')).length,5);
  assert.equal(serviceResult.outputs[4].type,'audio');assert.equal(serviceResult.video,'operations/test-video');assert.ok(serviceResult.budgets.filter(ms=>ms===180000).length>=6);
  assert.equal(requests.find(r=>r.body?.contents?.[0]?.parts?.some(p=>p.inlineData))?.body.contents[0].parts.filter(p=>p.inlineData).length,2);
  console.log('PASS: real Google SDK image, reference image, Imagen, poster, speech and video submission paths; media budgets and exact reference payloads.');

  videoComplete=true;
  const rendered=await page.evaluate(async png=>{const service=await import('/assets/studio-film-ai/src/services/geminiService.ts');const video=await service.generateVideoWithVeo('Adegan desa',()=>{},'9:16',{base64:png,mimeType:'image/png'});const bytes=new Uint8Array(await(await fetch(video.url)).arrayBuffer());return {type:video.type,duration:video.duration,bytes:Array.from(bytes)}},png);
  assert.equal(rendered.type,'video');assert.ok(rendered.duration>0&&Number.isFinite(rendered.duration));assert.deepEqual(Buffer.from(rendered.bytes),videoFixture);videoComplete=false;
  console.log('PASS: completed Veo SDK operation, authenticated result download with a query-free URL, exact MP4 bytes and playable metadata.');

  // A missing preview model must retry with the API-listed image model, not a text model.
  fallbackImage=true;
  const fallback=await page.evaluate(async()=>{const {getStudioAiClient}=await import('/assets/studio-film-ai/src/services/studioAiClient.ts');const ai=getStudioAiClient();const req={model:'gemini-3.1-flash-image-preview',contents:'Potret',config:{responseModalities:['TEXT','IMAGE'],imageConfig:{imageSize:'1K',aspectRatio:'9:16'}}};await ai.models.generateContent(req);await ai.models.generateContent(req);return req.config.imageConfig.imageSize;});
  assert.equal(fallback,'1K');assert.ok(requests.filter(r=>r.url.includes('gemini-2.5-flash-image')).length>=2);fallbackImage=false;
  console.log('PASS: renamed image model fallback and cached calls preserve request identity and remove incompatible options.');
  emptyImage=true;const before=requests.length;
  const empty=await page.evaluate(async png=>{try{const s=await import('/assets/studio-film-ai/src/services/geminiService.ts');await s.generateImageWithReferences('Fitri',[{base64:png,mimeType:'image/png'}]);return null}catch(e){return e.message}},png);
  assert.match(empty,/tidak diulang tanpa referensi/);assert.equal(requests.length-before,1);emptyImage=false;

  googlePolicy=true;const policyCount=requests.length;
  const blocked=await page.evaluate(async()=>{try{const s=await import('/assets/studio-film-ai/src/services/geminiService.ts');await s.generateImageWithReferences('Karakter',[]);return null}catch(e){return {message:e.message,terminal:e.terminal}}});
  assert.equal(blocked.terminal,true);assert.match(blocked.message,/kebijakan konten/);assert.equal(requests.length-policyCount,1);googlePolicy=false;
  console.log('PASS: native safety rejection does not trigger an image retry or switch to a text gateway.');

  // Mount the actual concept component with React state, leaving the full application loaded.
  await page.evaluate(async()=>{
   const source=await (await fetch('/assets/studio-film-ai/src/index.tsx')).text();
   const reactUrl=source.match(/from "([^"]*\/react\.js\?[^"]*)"/)[1];
   const domUrl=source.match(/from "([^"]*\/react-dom_client\.js\?[^"]*)"/)[1];
   const reactModule=await import(reactUrl);const React=reactModule.default || reactModule;
   const domModule=await import(domUrl);const {createRoot}=domModule.default || domModule;
   const {default:Hub}=await import('/assets/studio-film-ai/src/workspaces/ProjectHubWorkspace.tsx');
   document.getElementById('root').style.display='none';const host=document.createElement('div');host.id='generation-harness';document.body.appendChild(host);const root=createRoot(host);
   window.__mountGeneration=(model,hasImage=false,blankPrompt=false,phase='concept')=>{
    const title='Generation '+model+' '+crypto.randomUUID();
    localStorage.setItem('project_hub_ui_prefs_v1',JSON.stringify({[title.toLowerCase()]:{activePhase:phase,referenceImageModel:model,referenceAspectRatio:'9:16',conceptEntityTab:'characters',useGeminiContextMemory:false,useStoryboardContinuityAutoRefine:false,useFilmingContinuityAutoRefine:false}}));
    function Harness(){
     const [bible,setBible]=React.useState({title,projectType:'trailer',script:'Fitri dan Bayu bertemu di rumah.',logline:'Kisah keluarga',characters:[],moodboard:[],selectedStyle:'realistis'});
     const [refs,setRefs]=React.useState([{id:'fitri-stable-id',type:'character',name:'Fitri',description:'28 tahun. Perempuan Minang. Pakaian biru.',prompt:blankPrompt?'':'Potret Fitri, pakaian biru',tags:['Minang'],imageUrl:hasImage?'https://mock-image.test/original.png':null,isGenerating:false}]);
     const [ready,setReady]=React.useState(true),[shots,setShots]=React.useState([{shot:1,description:'Fitri di rumah',prompt:'Portrait of a woman Fitri at home',characters:['Fitri'],environment:'Rumah',duration:5,motionPrompt:'Gerakan kamera perlahan mengikuti Fitri',imageUrl:phase==='filming'&&hasImage?'https://mock-image.test/original.png':undefined,isGenerating:false}]),[media,setMedia]=React.useState([]);
     React.useEffect(()=>{window.__generationState={refs,bible,ready,media,shots}},[refs,bible,ready,media,shots]);
     const noop=()=>{};
     return React.createElement(Hub,{storyBible:bible,setStoryBible:setBible,projectPath:null,projectSync:{},setProjectSync:noop,projectCollaboration:{collaborators:[]},setProjectCollaboration:noop,syncStatus:{},activeProfileName:'Uji',onReloadProject:noop,onPushToCloud:noop,onPullFromCloud:noop,shotPrompts:shots,setShotPrompts:setShots,onRoughCutReady:noop,setMediaItems:setMedia,references:refs,setReferences:setRefs,apiKeyReady:ready,setApiKeyReady:setReady,recentProjects:[],onOpenRecentProject:noop,onOpenProjectPicker:noop,initialPhase:phase,onBindStudioAutomation:b=>{window.__generationBindings=b}});
    }
    root.render(React.createElement(Harness,{key:title}));
   };
  });
  const host=page.locator('#generation-harness');
  const mount=async(model,image=false,blank=false,phase='concept')=>{await page.evaluate(([m,i,b,p])=>window.__mountGeneration(m,i,b,p),[model,image,blank,phase]);await page.waitForTimeout(400);if(phase==='concept')await host.locator('.ref-card').waitFor();};
  const generate=()=>host.locator('.ref-card').first().locator('.edit-text-btn--primary').click();
  const done=()=>page.waitForFunction(()=>window.__generationState?.refs[0]?.imageUrl?.startsWith('data:image/')&&!window.__generationState.refs[0].isGenerating);
  await mount('auto');await generate();await done();assert.ok(requests.at(-1).provider==='google');
  assert.equal((await page.evaluate(()=>window.__generationState.refs[0])).id,'fitri-stable-id');
  console.log('PASS: character Generate button in Auto mode uses configured Gemini, writes the real response, preserves character ID.');
  googleError=403;await mount('nano');await generate();await host.getByText(/Kunci ini belum mendapat akses/).first().waitFor();assert.equal(await page.evaluate(()=>window.__generationState.ready),true);assert.equal(await page.evaluate(()=>window.__generationState.refs[0].isGenerating),false);assert.equal(await page.evaluate(()=>window.__generationState.refs[0].imageUrl),null);
  await host.getByRole('button',{name:'Buat semua',exact:true}).click();await host.getByText(/Kunci ini belum mendapat akses/).first().waitFor();googleError=0;
  console.log('PASS: character and Generate All access failures are visible, reset loading, retain the description and keep other AI features ready.');
  await page.evaluate(()=>localStorage.setItem('fal_api_key','fake-fal-key'));
  for(const [model,expected,image] of [
   ['gpt-image-2-fal-t2i','gpt-image-2',false],['seedream-v5-pro-fal','seedream',false],['seedream-v5-pro-edit-fal','edit',true],['krea-2-large-fal','krea',false],['krea-2-turbo-fal','krea',false],['ideogram-v4-fal','ideogram',false]
  ]) {
   const start=requests.length;await mount(model,image);await generate();await done();
   const calls=requests.slice(start);assert.ok(calls.some(r=>r.provider==='fal'&&r.body&&r.url.includes(expected)),model+' must call its chosen provider');assert.ok(calls.every(r=>r.provider!=='google'),model+' must not silently use Gemini');
   const state=await page.evaluate(()=>window.__generationState.refs[0]);assert.equal(state.id,'fitri-stable-id');assert.match(state.description,/Perempuan Minang/);if(image)assert.ok(state.imageVersions.includes('https://mock-image.test/original.png'));
  }
  textError=429;await mount('nano',false,true);await host.getByRole('button',{name:'Buat semua',exact:true}).click();await done();textError=0;
  console.log('PASS: six previously missing concept model dispatches, reference edit/version preservation, Generate All continues from description when the text pre-step fails.');
  for(const [model,endpoint] of [['imagen',':predict'],['gemini-pro','gemini-3-pro-image-preview'],['gpt-image-2-fal-t2i','gpt-image-2']]) {
   await mount(model,false,false,'storyboard');const start=requests.length;
   const result=await page.evaluate(()=>window.__generationBindings.generateStoryboardImages());
   assert.equal(result.generatedCount,1);await page.waitForFunction(()=>window.__generationState.shots[0].imageUrl);
   assert.ok(requests.slice(start).some(r=>r.url.includes(endpoint)),model+' storyboard must call its selected engine');
   assert.equal(await page.evaluate(()=>window.__generationState.bible.script),'Fitri dan Bayu bertemu di rumah.');
  }
  googleError=403;await mount('nano',false,false,'storyboard');
  const failedBatch=await page.evaluate(async()=>{try{return await window.__generationBindings.generateStoryboardImages()}catch(e){return {error:e.message}}});
  assert.match(failedBatch.error,/No storyboard shots were generated/);assert.equal(await page.evaluate(()=>window.__generationState.shots[0].imageUrl),undefined);
  assert.equal(await page.evaluate(()=>window.__generationState.shots[0].isGenerating),false);googleError=0;
  console.log('PASS: storyboard model dispatches, accurate batch success/failure reporting, preserved source script.');

  videoComplete=true;await mount('nano',true,false,'filming');
  const videoBatch=await page.evaluate(()=>window.__generationBindings.generateStoryboardVideos());
  assert.equal(videoBatch.generatedCount,1);await page.waitForFunction(()=>window.__generationState.shots[0].videoUrl?.startsWith('blob:'));
  assert.equal(await page.evaluate(()=>window.__generationState.refs[0].imageUrl),'https://mock-image.test/original.png');
  googleError=403;await mount('nano',true,false,'filming');
  const failedVideo=await page.evaluate(async()=>{try{return await window.__generationBindings.generateStoryboardVideos()}catch(e){return {error:e.message}}});
  assert.match(failedVideo.error,/No storyboard videos were generated/);await page.waitForFunction(()=>window.__generationState.shots[0].isFilming===false);assert.equal(await page.evaluate(()=>window.__generationState.shots[0].isFilming),false);assert.equal(await page.evaluate(()=>window.__generationState.shots[0].videoUrl),undefined);
  googleError=0;videoComplete=false;
  console.log('PASS: filming pipeline stores the completed video, preserves the base character and reports failed batch jobs as failures.');

  await page.evaluate(()=>{localStorage.removeItem('gemini_api_key');localStorage.removeItem('fal_api_key');localStorage.setItem('bekal_ai_routing_v1',JSON.stringify({version:1,preferGateway:true,fallback:true,timeoutSeconds:10,routes:[{id:'text',name:'Text only',enabled:true,baseUrl:'https://text-only.test/v1',model:'text-model',apiKey:'fake-text-key',vision:true,tools:true,json:true}]}))});
  const count=requests.length;
  const noMedia=await page.evaluate(async()=>{const {getStudioAiClient}=await import('/assets/studio-film-ai/src/services/studioAiClient.ts');try{await getStudioAiClient().models.generateContent({model:'gemini-3.1-flash-image-preview',contents:'Karakter',config:{responseModalities:['IMAGE']}})}catch(e){return e.message}});
  assert.match(noMedia,/API penyedia media/);assert.equal(requests.length,count);
  await mount('auto');await generate();await host.getByText(/Belum ada penyedia gambar yang siap/).first().waitFor();assert.equal(requests.length,count);
  console.log('PASS: text-only routers cannot masquerade as media providers; missing media setup gives actionable Indonesian guidance.');
  let imageJobs=0, openRouterError=0;
  await page.route('https://openrouter.ai/api/v1/**',async r=>{
   if(r.request().method()==='GET')return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:['google/gemini-3.1-flash-image-preview','google/gemini-3-pro-image-preview'].map(id=>({id,architecture:{input_modalities:['text','image'],output_modalities:['text','image']}}))})});
   const body=r.request().postDataJSON();assert.equal(r.request().headers().authorization,'Bearer fake-openrouter-image-key');assert.ok(body.model.startsWith('google/'));assert.deepEqual(body.modalities,['image','text']);imageJobs++;
   if(openRouterError)return r.fulfill({status:openRouterError,contentType:'application/json',body:'{"error":{"message":"fake-openrouter-image-key"}}'});
   return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,'+png}}]},finish_reason:'stop'}]})});
  });
  await page.evaluate(()=>{localStorage.setItem('google_model_provider_v1','openrouter');localStorage.setItem('bekal_ai_routing_v1',JSON.stringify({version:1,preferGateway:true,fallback:true,timeoutSeconds:10,routes:[{id:'openrouter',name:'OpenRouter',enabled:true,baseUrl:'https://openrouter.ai/api/v1',model:'google/gemini-2.5-flash',apiKey:'fake-openrouter-image-key',vision:false,tools:false,json:false}]}))});
  await mount('auto');await generate();await done();assert.equal(imageJobs,1);assert.equal(await page.evaluate(()=>window.__generationState.refs[0].id),'fitri-stable-id');
  await mount('gemini-pro',true);await generate();await done();assert.equal(imageJobs,2);assert.ok((await page.evaluate(()=>window.__generationState.refs[0].imageVersions)).includes('https://mock-image.test/original.png'));
  openRouterError=402;await mount('nano');await generate();await host.getByText(/Saldo atau batas kredit/).first().waitFor();await page.waitForFunction(()=>!window.__generationState.refs[0].isGenerating);assert.equal(imageJobs,3);assert.equal(await page.evaluate(()=>window.__generationState.refs[0].imageUrl),null);assert.equal(await page.evaluate(()=>window.__generationState.ready),true);
  console.log('PASS: actual character Generate button through OpenRouter in Auto and reference modes, preserved character/version, credit error displayed, one request per click without retry or native fallback. Provider responses simulated.');
  assert.deepEqual(errors,[]);
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
