const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));let calls=0,fail=false;
 const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZAAAAABJRU5ErkJggg==';
 await p.addInitScript(()=>{localStorage.setItem('studio_onboarding_completed_v1','true');localStorage.setItem('ui_mode_v1','pro');localStorage.setItem('google_model_provider_v1','openrouter');localStorage.setItem('bekal_ai_routing_v1',JSON.stringify({version:1,preferGateway:true,fallback:true,timeoutSeconds:10,routes:[{id:'openrouter',name:'OpenRouter',enabled:true,baseUrl:'https://openrouter.ai/api/v1',model:'google/gemini-2.5-flash',apiKey:'fake-openrouter-image-key',vision:false,tools:false,json:false}]}));});
 await p.route('https://generativelanguage.googleapis.com/**',()=>{throw new Error('Google media API must not be called with OpenRouter selected');});
 await p.route('https://openrouter.ai/api/v1/**',async r=>{
  if(r.request().method()==='GET')return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:['google/gemini-3.1-flash-image-preview','google/gemini-3-pro-image-preview'].map(id=>({id,architecture:{input_modalities:['text','image'],output_modalities:['text','image']}}))})});
  calls++;assert.equal(r.request().headers().authorization,'Bearer fake-openrouter-image-key');assert.deepEqual(r.request().postDataJSON().modalities,['image','text']);
  if(fail)return r.fulfill({status:402,contentType:'application/json',body:'{"error":{"message":"fake-openrouter-image-key"}}'});
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,'+png}}]},finish_reason:'stop'}]})});
 });
 await p.goto((process.env.PBS_SITE_BASE_URL||'http://127.0.0.1:8006')+'/film-studio.html#image_gen');const prompt=p.getByPlaceholder('Describe the scene, subject, mood, and setting...', {exact:true});await prompt.fill('Potret sutradara Indonesia, pakaian hijau, latar studio film');const generate=p.locator('button.app-primary').filter({hasText:/^(Create Image|Buat gambar)/});await generate.click();
 try{await p.waitForFunction(()=>[...document.querySelectorAll('img')].some(i=>i.src.startsWith('data:image/png;base64,')&&i.naturalWidth===1));}catch(e){console.error('Generation state:',calls,(await p.locator('body').innerText()).slice(-2800));throw e;}assert.equal(calls,1);

 fail=true;await generate.click();await p.getByText(/Saldo atau batas kredit/).first().waitFor();assert.equal(calls,2);assert.deepEqual(errors,[]);
 console.log('PASS: production Studio Film AI image workspace Generate button, OpenRouter-only key, rendered output, actionable credit error, no duplicate paid requests or Google fallback. Provider responses simulated.');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
