import test from 'node:test';
import assert from 'node:assert/strict';
import { generateOpenRouterImage, generateRoutedOpenRouterImage, compatibleOpenRouterImageModels } from './openRouterImages.ts';
import { AiRouteError, type AiRoute } from './aiRouting.ts';
const route:AiRoute={id:'openrouter',name:'OpenRouter',baseUrl:'https://openrouter.ai/api/v1',model:'text',apiKey:'fake-test-secret',enabled:true,vision:false,tools:false,json:false};
const model='gemini-3.1-flash-image-preview';
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZAAAAABJRU5ErkJggg==';
const response=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
const catalog={data:[{id:'black-forest-labs/flux-test',architecture:{input_modalities:['text','image'],output_modalities:['image']}},{id:'google/'+model,architecture:{input_modalities:['text','image'],output_modalities:['text','image']}},{id:'google/text-only',architecture:{input_modalities:['text'],output_modalities:['text']}}]};
const req={model,contents:{parts:[{text:'Karakter'},{inlineData:{mimeType:'image/png',data:png}}]},config:{imageConfig:{aspectRatio:'9:16',imageSize:'1K'},responseModalities:['IMAGE','TEXT']}};
test('OpenRouter preserves the model identity, references, ratio and size and returns usable SDK image parts',async()=>{
 let calls=0;const out=await generateOpenRouterImage(route,req,(async(u:any,o:any)=>{
  if(String(u).endsWith('/models')){assert.equal(o.headers,undefined);return response(catalog);}
  calls++;assert.equal(o.headers.Authorization,'Bearer fake-test-secret');assert.equal(o.credentials,'omit');const body=JSON.parse(o.body);assert.equal(body.model,'google/'+model);assert.deepEqual(body.image_config,{aspect_ratio:'9:16',image_size:'1K'});assert.equal(body.messages[0].content[1].image_url.url,'data:image/png;base64,'+png);assert.deepEqual(body.modalities,['image','text']);return response({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,'+png}}]}}]});
 }) as typeof fetch);assert.equal(calls,1);assert.equal(out.candidates[0].content.parts[0].inlineData.data,png);assert.equal(out.bekalProvider,'openrouter');assert.equal(out.bekalModel,'google/'+model);
});
test('unsupported selected models never send a paid image request or silently change the model',async()=>{
 let calls=0;await assert.rejects(generateOpenRouterImage(route,{...req,model:'text-only'},(async()=>{calls++;return response({})}) as typeof fetch),(e:any)=>e instanceof AiRouteError&&e.terminal);assert.equal(calls,0);
});
test('credit errors, empty responses, policy and malformed image replies never retry or expose keys',async()=>{
 for(const [status,data] of [[402,{error:{message:'fake-test-secret'}}],[200,{choices:[{message:{images:[]}}]}],[200,{choices:[{finish_reason:'content_filter',message:{}}]}],[200,{choices:[{message:{images:[{image_url:{url:'http://unsafe.example/a.png'}}]}}]}]] as const){let calls=0;await assert.rejects(generateOpenRouterImage(route,req,(async()=>{calls++;return response(data,status)}) as typeof fetch),(e:any)=>e instanceof AiRouteError&&e.terminal&&!e.message.includes('fake-test-secret'));assert.equal(calls,1);}
});
test('CDN image downloads never carry the API key and normalize image bytes',async()=>{
 const out=await generateOpenRouterImage(route,req,(async(u:any,o:any)=>{if(String(u).startsWith('https://cdn.example/')){assert.equal(o.headers,undefined);assert.equal(o.credentials,'omit');return new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'image/png'}});}return response({choices:[{message:{images:[{image_url:{url:'https://cdn.example/image.png'}}]}}]});}) as typeof fetch);assert.equal(out.candidates[0].content.parts[0].inlineData.data,'AQID');
});
test('caller cancellation does not submit a generation request',async()=>{
 const c=new AbortController();c.abort();let calls=0;await assert.rejects(generateOpenRouterImage(route,{...req,config:{...req.config,abortSignal:c.signal}},(async()=>{calls++;return response({})}) as typeof fetch),(e:any)=>e.name==='AbortError');assert.equal(calls,0);
});

const configure = (patch: any = {}) => {
 const value = JSON.stringify({version:1,imagesViaOpenRouter:true,fallback:true,routes:[route],...patch});
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>value}});
};
test('catalogue routing tries another compatible model after rejection, preserving references and provider fallback', async()=>{
 configure(); const seen:string[]=[]; let direct=0;
 const result=await generateRoutedOpenRouterImage(req,async()=>{direct++;},(async(u:any,o:any)=>{
  const body=JSON.parse(o.body); seen.push(body.model);assert.equal(body.provider.allow_fallbacks,true);assert.equal(body.messages[0].content[1].image_url.url,'data:image/png;base64,'+png);
  return seen.length===1?response({error:{code:429}},429):response({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,'+png}}]}}]});
 }) as typeof fetch);
 assert.deepEqual(seen,['google/'+model,'black-forest-labs/flux-test']);assert.equal(direct,0);assert.equal(result.bekalModel,'black-forest-labs/flux-test');
});
test('explicit Flux selection uses the catalogue model without a Google prefix',async()=>{
 configure({openRouterImageModel:'black-forest-labs/flux-test'});
 const out=await generateRoutedOpenRouterImage(req,undefined,(async(u:any,o:any)=>{assert.equal(JSON.parse(o.body).model,'black-forest-labs/flux-test');return response({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,'+png}}]}}]});}) as typeof fetch);
 assert.equal(out.bekalModel,'black-forest-labs/flux-test');
});
test('only after compatible models are exhausted does the direct provider run',async()=>{
 configure(); const seen:string[]=[];
 const out=await generateRoutedOpenRouterImage(req,async()=>{seen.push('direct');return 'native';},(async(u:any,o:any)=>{seen.push(JSON.parse(o.body).model);return response({error:{code:404}},404);}) as typeof fetch);
 assert.equal(out,'native');assert.deepEqual(seen,['google/'+model,'black-forest-labs/flux-test','direct']);
});
test('account credit rejection skips other models on that key and tries the direct provider',async()=>{
 configure();let calls=0,direct=0;
 await generateRoutedOpenRouterImage(req,async()=>{direct++;return 'native';},(async()=>{calls++;return response({error:{code:402}},402);}) as typeof fetch);
 assert.equal(calls,1);assert.equal(direct,1);
});
test('uncertain acceptance, empty results, policy, and cancellation never generate on another provider',async()=>{
 configure();
 for(const mode of ['network','empty','policy','abort']) {
  let calls=0,direct=0;
  await assert.rejects(generateRoutedOpenRouterImage(req,async()=>{direct++;},(async()=>{calls++;if(mode==='network')throw new TypeError('network');if(mode==='abort')throw new DOMException('cancel','AbortError');return mode==='policy'?response({error:{message:'content policy'}},403):response({choices:[{message:{}}]});}) as typeof fetch));
  assert.equal(calls,1);assert.equal(direct,0);
 }
});
test('disabled fallback makes exactly one request and never uses a direct provider',async()=>{
 configure({fallback:false});let calls=0,direct=0;
 await assert.rejects(generateRoutedOpenRouterImage(req,async()=>{direct++;},(async()=>{calls++;return response({error:{code:429}},429);}) as typeof fetch));
 assert.equal(calls,1);assert.equal(direct,0);
});
test('reference-incompatible models are excluded without removing references',()=>{
 const models=[{id:'flux-text',architecture:{input_modalities:['text'],output_modalities:['image']}},{id:'flux-edit',architecture:{input_modalities:['text','image'],output_modalities:['image']}}];
 assert.deepEqual(compatibleOpenRouterImageModels(models,req).map(m=>m.id),['flux-edit']);
 assert.equal(compatibleOpenRouterImageModels(models,{model,contents:'gambar'}).length,2);
});
test('invalid account key skips duplicate routes and uses the next OpenRouter key before native',async()=>{
 configure({routes:[route,{...route,id:'duplicate'},{...route,id:'second',apiKey:'second-test-key'}]});const keys:string[]=[];let direct=0;
 await generateRoutedOpenRouterImage(req,async()=>{direct++;},(async(u:any,o:any)=>{keys.push(o.headers.Authorization);return keys.length===1?response({error:{code:401}},401):response({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,'+png}}]}}]});}) as typeof fetch);
 assert.deepEqual(keys,['Bearer fake-test-secret','Bearer second-test-key']);assert.equal(direct,0);
});
test('caller abort after an explicit rejection prevents all further submissions',async()=>{
 configure();const controller=new AbortController();let calls=0,direct=0;
 await assert.rejects(generateRoutedOpenRouterImage({...req,config:{...req.config,abortSignal:controller.signal}},async()=>{direct++;},(async()=>{calls++;controller.abort();return response({error:{code:429}},429);}) as typeof fetch),(e:any)=>e.name==='AbortError');
 assert.equal(calls,1);assert.equal(direct,0);
});
test('explicit Flux selection overrides a global Gemini setting and never falls across model families',async()=>{
 configure({openRouterImageModel:'google/'+model});let calls=0,direct=0;
 const out=await generateRoutedOpenRouterImage({...req,model:'black-forest-labs/flux-test'},async()=>{direct++;return 'native-flux';},(async(u:any,o:any)=>{calls++;assert.equal(JSON.parse(o.body).model,'black-forest-labs/flux-test');return response({error:{code:429}},429);}) as typeof fetch);
 assert.equal(out,'native-flux');assert.equal(calls,1);assert.equal(direct,1);
});
test('unavailable explicitly selected Flux Klein does not submit a Gemini image request',async()=>{
 configure({openRouterImageModel:'google/'+model});let calls=0;
 await assert.rejects(generateRoutedOpenRouterImage({...req,model:'black-forest-labs/flux-2-klein-9b-base'},undefined,(async()=>{calls++;return response({});}) as typeof fetch),(e:any)=>e instanceof AiRouteError&&/tidak diganti ke Gemini/.test(e.message));assert.equal(calls,0);
});
