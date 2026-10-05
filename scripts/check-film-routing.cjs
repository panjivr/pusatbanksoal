const {chromium}=require('playwright'), assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:820,height:1100}}), errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('studio_onboarding_completed_v1','true');localStorage.setItem('ui_mode_v1','pro');localStorage.setItem('pbs_theme','light');});
 await p.goto('http://127.0.0.1:8010/assets/studio-film-ai/studio.html#microdrama');await p.locator('.microdrama-workspace').waitFor();

 for(const theme of ['light','dark'])for(const width of [320,390,820,1440]){
  await p.evaluate(t=>{document.body.dataset.theme=t;document.documentElement.dataset.theme=t},theme);await p.setViewportSize({width,height:1000});
  for(const tab of ['Naskah drama','Prompt video','Audio untuk HP']){
   await p.getByRole('tab',{name:tab,exact:true}).click();await p.waitForTimeout(250);
   assert.ok(await p.locator('.microdrama-workspace textarea,.microdrama-workspace input').count()>0,'Tab must render functional controls: '+tab);
   const metrics=await p.evaluate(()=>{const w=document.querySelector('.microdrama-workspace'),h=w.querySelector('h1'),c=w.querySelector('textarea,input,select');return {width:document.documentElement.scrollWidth,viewport:innerWidth,titleColor:getComputedStyle(h).color,bg:getComputedStyle(w).backgroundColor,controlBg:c&&getComputedStyle(c).backgroundColor,text:getComputedStyle(w).color,red:[...w.querySelectorAll('button')].some(el=>getComputedStyle(el).backgroundColor==='rgb(220, 38, 38)')}});
   assert.equal(metrics.width,metrics.viewport);assert.notEqual(metrics.titleColor,metrics.bg);assert.equal(metrics.red,false);if(width===820&&tab==='Naskah drama')await p.screenshot({path:`/tmp/bekal-micro-${theme}.png`});
  }
 }
 console.log('PASS: 24 Microdrama tab/viewport/theme checks.');
 await p.getByRole('button',{name:'Menu akun',exact:true}).click();await p.getByRole('button',{name:/Pengaturan dan API key/}).click();await p.getByRole('heading',{name:'Router AI dan layanan cadangan'}).waitFor();
 await p.route('https://bekal-router.test/**',async r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:'Siap.'},finish_reason:'stop'}]})}));
 const card=p.locator('.ai-route-card').first();await card.getByLabel('Alamat API',{exact:true}).fill('https://bekal-router.test/v1');await card.getByLabel('Model atau nama kombo',{exact:true}).fill('my-combo');await card.getByLabel('Aktifkan',{exact:true}).check();await card.getByRole('button',{name:'Uji koneksi'}).click();await p.getByRole('status').filter({hasText:'9Router berhasil menjawab'}).waitFor();await p.getByRole('button',{name:'Simpan router AI',exact:true}).click();
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('bekal_ai_routing_v1')).routes[0].model),'my-combo');
 console.log('PASS: visible 9Router settings, API connection test, model/combination save.');
 const seen=[];await p.route('https://fallback-a.test/**',async r=>{seen.push('A');assert.equal(r.request().headers().authorization,'Bearer key-a');await r.fulfill({status:401,contentType:'application/json',body:'{"error":{"message":"invalid key"}}'});});
 await p.route('https://fallback-b.test/**',async r=>{seen.push('B');assert.equal(r.request().headers().authorization,'Bearer key-b');await r.fulfill({status:429,contentType:'application/json',body:'{"error":{"message":"quota"}}'});});
 await p.route('https://fallback-c.test/**',async r=>{seen.push('C');assert.equal(r.request().headers().authorization,'Bearer key-c');const body=r.request().postDataJSON();assert.equal(body.model,'combo-c');assert.match(body.messages[0].content,/bahasa Indonesia/);await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{content:'{"title":"Film Bekal"}'},finish_reason:'stop'}]})});});
 const result=await p.evaluate(async()=>{
  localStorage.removeItem('gemini_api_key');localStorage.setItem('bekal_ai_routing_v1',JSON.stringify({version:1,preferGateway:true,fallback:true,timeoutSeconds:10,routes:['a','b','c','d'].map(id=>({id,name:id.toUpperCase(),baseUrl:`https://fallback-${id}.test/v1`,model:`combo-${id}`,apiKey:`key-${id}`,enabled:true,vision:true,tools:true,json:true}))}));
  const {getStudioAiClient}=await import('/assets/studio-film-ai/src/services/studioAiClient.ts');const ai=getStudioAiClient();const r=await ai.models.generateContent({model:'gemini-3.1-pro-preview',contents:'Tulis judul',config:{responseMimeType:'application/json',responseSchema:{type:'OBJECT',properties:{title:{type:'STRING'}},required:['title']}}});return r.text;
 });assert.deepEqual(seen,['A','B','C']);assert.equal(JSON.parse(result).title,'Film Bekal');assert.deepEqual(errors,[]);console.log('PASS: real browser AI client A→B→C failover, per-provider credentials, JSON structure, Indonesian instruction, no D retry.');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
