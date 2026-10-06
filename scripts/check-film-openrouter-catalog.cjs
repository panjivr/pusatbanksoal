const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],requests=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZAAAAABJRU5ErkJggg==';
const models=JSON.parse(fs.readFileSync('studio-film-ai/src/services/fixtures/openrouter-image-catalog.json','utf8')).data;
const prices=JSON.parse(fs.readFileSync('studio-film-ai/src/services/fixtures/openrouter-image-prices.json','utf8')).endpoints;
const videos=JSON.parse(fs.readFileSync('studio-film-ai/src/services/fixtures/openrouter-video-catalog.json','utf8'));
let failShot3=true;
await page.addInitScript(()=>{localStorage.setItem('studio_onboarding_completed_v1','true');localStorage.setItem('ui_mode_v1','pro');localStorage.setItem('bekal_ai_routing_v1',JSON.stringify({version:1,fallback:true,imagesViaOpenRouter:true,routes:[{id:'openrouter',name:'OpenRouter',enabled:true,baseUrl:'https://openrouter.ai/api/v1',model:'google/gemini-2.5-flash',apiKey:'fixture-key'}]}));});
await page.route('https://mock-image.test/**',r=>r.fulfill({status:200,contentType:'image/png',body:Buffer.from(png,'base64')}));
await page.route('https://openrouter.ai/api/v1/**',async r=>{
 const req=r.request(),url=req.url(),reply=(body,status=200)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
 if(req.method()==='GET'){
  if(url.endsWith('/images/models'))return reply({data:models});
  if(url.includes('/images/models/') && url.endsWith('/endpoints')){const id=url.split('/images/models/')[1].replace('/endpoints','');return reply(prices[id]||{endpoints:[]});}
  if(url.endsWith('/content'))return r.fulfill({status:200,contentType:'video/mp4',body:Buffer.from('AAAAHGZ0eXBpc29tAAACAGlzb21pc28y','base64')});
  if(url.includes('/videos/gen-vid-'))return reply({id:'gen-vid-123-abcdefghijklmnopqrst',status:'completed'});
  if(url.endsWith('/videos/models'))return reply(videos);
  return reply({data:[{id:'openai/gpt-audio-mini',architecture:{input_modalities:['text','audio'],output_modalities:['text','audio']},pricing:{prompt:'.0000006',audio_output:'.0000024'}},{id:'google/gemini-2.5-flash',architecture:{input_modalities:['text','image','audio','video'],output_modalities:['text']},supported_parameters:['tools','response_format']}]});
 }
 const body=req.postDataJSON();requests.push({url,body});
 if(url.endsWith('/videos')) {assert.equal(req.headers().authorization,'Bearer fixture-key');if(body.model==='google/veo-3.1'){assert.equal(body.duration,8);assert.equal(body.aspect_ratio,'9:16');assert.equal(body.frame_images[0].frame_type,'first_frame');assert.equal(body.frame_images[0].image_url.url,'data:image/png;base64,'+png);}else{assert.equal(body.model,'black-forest-labs/flux-video-upscale');assert.equal(body.upscale_factor,2);assert.equal(body.input_references[0].type,'video_url');assert.equal(body.duration,undefined);}return reply({id:'gen-vid-123-abcdefghijklmnopqrst',polling_url:'https://openrouter.ai/api/v1/videos/gen-vid-123-abcdefghijklmnopqrst',status:'pending'});}
 if(body.model==='openai/gpt-audio-mini'){assert.deepEqual(body.modalities,['text','audio']);assert.equal(body.audio.format,'wav');return reply({choices:[{message:{audio:{data:Buffer.from('RIFF fixture WAVE').toString('base64')}}}]});}
 if(url.endsWith('/images')){
  assert.equal(body.model,'bytedance-seed/seedream-4.5');assert.equal(body.aspect_ratio,'9:16');
  if(failShot3 && body.prompt.includes('shot3')) return reply({error:{code:429}},429);
  return reply({data:[{b64_json:png,media_type:'image/png'}]});
 }
 return reply({choices:[{message:{content:'{}'}}]});
});
await page.route('https://generativelanguage.googleapis.com/**',()=>{throw new Error('Unexpected direct Google API');});
await page.route('https://api.replicate.com/**',()=>{throw new Error('Unexpected direct Replicate API');});
await page.goto('http://127.0.0.1:8010/assets/studio-film-ai/studio.html');await page.locator('.project-hub').waitFor();
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
     const [ready,setReady]=React.useState(true),[shots,setShots]=React.useState([
       {shot:1,sceneNumber:1,sceneShotNumber:1,characters:['Fitri'],environment:'Rumah',motionPrompt:'Gerakan kamera perlahan',description:'Fitri shot1',prompt:'Fitri shot1',duration:5,imageUrl:'https://mock-image.test/kept.png'},
       {shot:2,sceneNumber:1,sceneShotNumber:2,characters:['Fitri'],environment:'Rumah',motionPrompt:'Gerakan kamera perlahan',description:'Fitri shot2',prompt:'Fitri shot2',duration:5},
       {shot:3,sceneNumber:1,sceneShotNumber:3,characters:['Fitri'],environment:'Rumah',motionPrompt:'Gerakan kamera perlahan',description:'Fitri shot3',prompt:'Fitri shot3',duration:5}
     ]),[media,setMedia]=React.useState([]);
     React.useEffect(()=>{window.__generationState={refs,bible,ready,media,shots};window.__generationSetShots=setShots},[refs,bible,ready,media,shots]);
     const noop=()=>{};
     return React.createElement(Hub,{storyBible:bible,setStoryBible:setBible,projectPath:null,projectSync:{},setProjectSync:noop,projectCollaboration:{collaborators:[]},setProjectCollaboration:noop,syncStatus:{},activeProfileName:'Uji',onReloadProject:noop,onPushToCloud:noop,onPullFromCloud:noop,shotPrompts:shots,setShotPrompts:setShots,onRoughCutReady:noop,setMediaItems:setMedia,references:refs,setReferences:setRefs,apiKeyReady:ready,setApiKeyReady:setReady,recentProjects:[],onOpenRecentProject:noop,onOpenProjectPicker:noop,initialPhase:phase,onBindStudioAutomation:b=>{window.__generationBindings=b}});
    }
    root.render(React.createElement(Harness,{key:title}));
   };
  });

await page.evaluate(()=>window.__mountGeneration('bytedance-seed/seedream-4.5',false,false,'storyboard'));
const host=page.locator('#generation-harness');await host.getByLabel('Model gambar OpenRouter',{exact:true}).waitFor({timeout:10000}).catch(async e=>{console.error('HOST',await host.innerText());console.error('ERRORS',errors);throw e;});
await host.getByLabel('Model gambar OpenRouter',{exact:true}).selectOption('bytedance-seed/seedream-4.5');
await host.getByText('Estimasi 2 gambar: $0.08.',{exact:false}).waitFor({timeout:10000}).catch(async e=>{console.error(await host.locator('.openrouter-picker').innerText());throw e;});
const sort=host.getByLabel('Urutkan harga model');await sort.selectOption('asc');
let values=await host.getByLabel('Model gambar OpenRouter',{exact:true}).locator('option').evaluateAll(items=>items.map(i=>i.value));assert.equal(values[1],'black-forest-labs/flux.2-klein-4b');
await sort.selectOption('desc');values=await host.getByLabel('Model gambar OpenRouter',{exact:true}).locator('option').evaluateAll(items=>items.map(i=>i.value));assert.equal(values[1],'bytedance-seed/seedream-4.5');
await host.getByLabel('Rasio OpenRouter',{exact:true}).selectOption('9:16');
const batch=await page.evaluate(()=>window.__generationBindings.generateStoryboardImages());assert.equal(batch.generatedCount,1);
await host.getByRole('button',{name:'Generate ulang shot 1.3',exact:true}).first().waitFor();
const before=await page.evaluate(()=>window.__generationState.shots);assert.equal(before[0].imageUrl,'https://mock-image.test/kept.png');assert.ok(before[1].imageUrl);assert.ok(before[2].imageGenerationError);
const posts=requests.filter(r=>r.url.endsWith('/images'));assert.equal(posts.length,2);
failShot3=false;await host.getByRole('button',{name:'Generate ulang shot 1.3',exact:true}).first().click();await page.waitForFunction(()=>window.__generationState.shots[2].imageUrl&&!window.__generationState.shots[2].isGenerating);
const after=await page.evaluate(()=>window.__generationState.shots);assert.equal(after[0].imageUrl,before[0].imageUrl);assert.equal(after[1].imageUrl,before[1].imageUrl);assert.equal(after[2].imageGenerationError,undefined);assert.equal(requests.filter(r=>r.url.endsWith('/images')).length,3);assert.ok(requests.filter(r=>r.url.endsWith('/images')).at(-1).body.prompt.includes('shot3'));
await page.evaluate(()=>window.__mountGeneration('bytedance-seed/seedream-4.5',false,false,'concept'));
await host.locator('.ref-card').first().waitFor();await host.getByLabel('Model gambar OpenRouter',{exact:true}).selectOption('bytedance-seed/seedream-4.5');await host.getByLabel('Rasio OpenRouter',{exact:true}).selectOption('9:16');
await host.locator('.ref-card').first().locator('.edit-text-btn--primary').click();await page.waitForFunction(()=>window.__generationState.refs[0].imageUrl?.startsWith('data:image/')&&!window.__generationState.refs[0].isGenerating);assert.equal(await page.evaluate(()=>window.__generationState.refs[0].id),'fitri-stable-id');assert.equal(requests.filter(r=>r.url.endsWith('/images')).length,4);
const media=await page.evaluate(async png=>{const api=await import('/assets/studio-film-ai/src/services/openRouterMedia.ts');const ref={base64:png,mimeType:'image/png'};const video=await api.generateStudioVideo('google/veo-3.1','Gerakan kamera perlahan',{ratio:'9:16',resolution:'720p',seconds:8,start:ref});const upscale=await api.generateStudioVideo('black-forest-labs/flux-video-upscale','Pertahankan detail',{sourceVideo:{base64:'AAAA',mimeType:'video/mp4'},upscaleFactor:2});const audio=await api.generateStudioAudio('openai/gpt-audio-mini','Bacakan selamat datang');return {video:video.type,upscale:upscale.type,audio:audio.type,audioUrl:audio.url};},png);
assert.deepEqual([media.video,media.upscale,media.audio],['video','video','audio']);assert.ok(media.audioUrl.startsWith('data:audio/wav;base64,'));assert.equal(requests.filter(r=>r.url.endsWith('/videos')).length,2);
await page.evaluate(async()=>{const {getStudioAiClient}=await import('/assets/studio-film-ai/src/services/studioAiClient.ts');const client=getStudioAiClient();await client.models.generateContent({model:'gemini-2.5-flash',contents:[{role:'user',parts:[{text:'Transkripsikan audio'},{inlineData:{mimeType:'audio/wav',data:'AAAA'}}]}]});await client.models.generateContent({model:'gemini-2.5-flash',contents:[{role:'user',parts:[{text:'Ringkas video'},{fileData:{mimeType:'video/mp4',fileUri:'data:video/mp4;base64,AAAA'}}]}]});});const binary=requests.filter(r=>r.url.endsWith('/chat/completions')&&r.body.model==='google/gemini-2.5-flash');assert.ok(binary.some(r=>r.body.messages.some(m=>Array.isArray(m.content)&&m.content.some(p=>p.type==='input_audio'&&p.input_audio.format==='wav'))));assert.ok(binary.some(r=>r.body.messages.some(m=>Array.isArray(m.content)&&m.content.some(p=>p.type==='video_url'&&p.video_url.url==='data:video/mp4;base64,AAAA'))));
await page.evaluate(()=>window.__mountGeneration('bytedance-seed/seedream-4.5',false,false,'storyboard'));await host.getByLabel('Model gambar OpenRouter',{exact:true}).waitFor();await page.evaluate(()=>window.__generationSetShots(Array.from({length:160},(_,i)=>({shot:i+1,sceneNumber:Math.floor(i/8)+1,sceneShotNumber:i%8+1,characters:['Fitri'],environment:'Rumah',description:'Adegan '+(i+1),prompt:'Fitri di rumah',duration:8,imageUrl:'https://mock-image.test/kept.png'}))));
for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:1440,height:900}]){await page.setViewportSize(viewport);await host.getByLabel('Model gambar OpenRouter',{exact:true}).scrollIntoViewIfNeeded();const hidden=await host.locator('.openrouter-picker').evaluate(el=>Array.from(el.querySelectorAll('input,select,button')).filter(control=>{const r=control.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(!r.width||!r.height||y<0||y>innerHeight||x<0||x>innerWidth)return false;const top=document.elementFromPoint(x,y);return top&&!control.contains(top);}).map(el=>el.getAttribute('aria-label')||el.textContent));assert.deepEqual(hidden,[],JSON.stringify({viewport,hidden}));const bar=await host.locator('.phase-bar').first().evaluate(el=>getComputedStyle(el).position);assert.notEqual(bar,'sticky');}
assert.deepEqual(errors,[]);console.log('PASS: character Generate button, catalogue prices, ascending/descending sorting, failed individual shot retry, completed shots and source script preserved. Video submit/poll/download, video upscaling and audio protocol also passed. Provider responses simulated.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
