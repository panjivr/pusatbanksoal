const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const production=Boolean(process.env.FILM_STUDIO_URL);
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],posts=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('studio_onboarding_completed_v1','true');localStorage.setItem('ui_mode_v1','pro');localStorage.setItem('pbs_theme','dark');});
 const details=[{type:'reasoning.encrypted',data:'test-opaque-reasoning',index:0}];
 await page.route('https://openrouter.ai/api/v1/**',async r=>{
  if(r.request().method()==='GET')return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:[{id:'test/editor',architecture:{input_modalities:['text','image'],output_modalities:['text']},supported_parameters:['tools','response_format','temperature','tool_choice']}]})});
  const body=r.request().postDataJSON();posts.push(body);assert.equal(body.model,'test/editor');assert.equal(r.request().headers().authorization,'Bearer test-browser-key');
  let message={content:'Siap.'},finish_reason='stop';
  const toolResult=body.messages.findLast(m=>m.role==='tool');
  if(toolResult){assert.equal(toolResult.tool_call_id,'status-real-editor');assert.deepEqual(body.messages.find(m=>m.tool_calls)?.reasoning_details,details);assert.equal(JSON.parse(toolResult.content).result.success,true);assert.equal(typeof JSON.parse(toolResult.content).result.mode,'string');message={content:'Status editor berhasil dibaca melalui OpenRouter.'};}
  else if(body.tools?.some(t=>t.function.name==='getStudioAgentStatus')){message={content:null,reasoning_details:details,tool_calls:[{id:'status-real-editor',type:'function',function:{name:'getStudioAgentStatus',arguments:'{}'}}]};finish_reason='tool_calls';}
  else if(body.tools?.some(t=>t.function.name==='cek_koneksi')){assert.equal(body.tool_choice.function.name,'cek_koneksi');message={content:null,tool_calls:[{id:'probe',type:'function',function:{name:'cek_koneksi',arguments:'{"siap":true}'}}]};finish_reason='tool_calls';}
  else if(body.response_format)message={content:body.messages[0].content.includes('"title"')?'{"title":"Film uji OpenRouter"}':'{"siap":true}'};
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message,finish_reason}]})});
 });
 await page.goto((process.env.FILM_STUDIO_URL||'http://127.0.0.1:8010/assets/studio-film-ai/studio.html')+'#microdrama');await page.locator('.microdrama-workspace').waitFor();
 await page.getByRole('button',{name:'Menu akun',exact:true}).click();await page.locator('.app-menu-item').filter({hasText:'Pengaturan dan API key'}).click();
 const card=page.locator('.ai-route-card').filter({has:page.locator('legend',{hasText:'OpenRouter'})});
 await card.getByLabel('Aktifkan',{exact:true}).check();await card.getByLabel('Alamat API',{exact:true}).fill('https://openrouter.ai');await card.getByLabel('Model atau nama kombo',{exact:true}).fill('test/editor');await card.getByLabel('API key (jika diwajibkan layanan)',{exact:true}).fill('test-browser-key');
 await card.getByRole('button',{name:'Uji koneksi',exact:true}).click();await page.getByRole('status').filter({hasText:'OpenRouter berhasil diuji'}).waitFor();assert.equal(await card.getByLabel('Panggilan alat',{exact:true}).isChecked(),true);assert.equal(await card.getByLabel('Keluaran JSON',{exact:true}).isChecked(),true);
 await page.getByLabel('Buat gambar Nano Banana 2 dan Gemini 3 Pro Image melalui OpenRouter',{exact:true}).check();
 await page.getByRole('button',{name:'Simpan router AI',exact:true}).click();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('bekal_ai_routing_v1')).imagesViaOpenRouter),true);
 await page.evaluate(()=>{localStorage.removeItem('gemini_api_key');const c=JSON.parse(localStorage.getItem('bekal_ai_routing_v1'));c.routes.find(r=>r.id==='openrouter').tools=false;c.routes.find(r=>r.id==='openrouter').json=false;localStorage.setItem('bekal_ai_routing_v1',JSON.stringify(c));});
 if(!production){const title=await page.evaluate(async()=>{const {getStudioAiClient}=await import('/assets/studio-film-ai/src/services/studioAiClient.ts');return (await getStudioAiClient().models.generateContent({model:'gemini-3.1-pro-preview',contents:'Buat judul',config:{responseMimeType:'application/json',responseSchema:{type:'OBJECT',properties:{title:{type:'STRING'}},required:['title']}}})).text;});assert.equal(JSON.parse(title).title,'Film uji OpenRouter');}
 // Reload to exercise the saved configuration with both old capability switches off.
 await page.reload();await page.locator('.microdrama-workspace').waitFor();await page.locator('.ai-tool-dock__trigger').click();await page.locator('.ai-tool-dock__item').first().click();
 await page.getByPlaceholder(/Tulis permintaan/).fill('Periksa status editor sekarang');await page.getByRole('button',{name:'Kirim',exact:true}).click();await page.getByText('Status editor berhasil dibaca melalui OpenRouter.',{exact:true}).waitFor();
 if(!production){const thinking=await page.evaluate(async()=>{const {runChat}=await import('/assets/studio-film-ai/src/services/geminiService.ts');const response=await runChat([{role:'user',text:'Periksa status',id:'thinking-test'}],'thinking',[{name:'getStudioAgentStatus',parameters:{type:'OBJECT',properties:{}}}]);return response.functionCalls;});assert.equal(thinking[0].name,'getStudioAgentStatus');}
 assert.ok(posts.some(b=>b.messages.some(m=>m.role==='tool')));assert.deepEqual(errors,[]);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 console.log('PASS: OpenRouter visible settings, model capability detection, JSON with old toggles off, real assistant executes editor status tool and sends its result with call ID and reasoning, mobile layout. Provider responses simulated; no paid request.');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
