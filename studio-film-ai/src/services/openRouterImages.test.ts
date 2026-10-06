import test from 'node:test';
import assert from 'node:assert/strict';
import { generateOpenRouterImage, generateRoutedOpenRouterImage, compatibleOpenRouterImageModels, getOpenRouterImageModels } from './openRouterImages.ts';
import { AiRouteError, type AiRoute } from './aiRouting.ts';
const route:AiRoute={id:'openrouter',name:'OpenRouter',baseUrl:'https://openrouter.ai/api/v1',model:'text',apiKey:'fake-test-secret',enabled:true,vision:false,tools:false,json:false};
const model='gemini-3.1-flash-image-preview';
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZAAAAABJRU5ErkJggg==';
const response=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
const catalog={data:[{id:'black-forest-labs/flux-test',architecture:{input_modalities:['text','image'],output_modalities:['image']}},{id:'google/'+model,architecture:{input_modalities:['text','image'],output_modalities:['text','image']}},{id:'google/text-only',architecture:{input_modalities:['text'],output_modalities:['text']}}]};
const legacyFetch = (fn: typeof fetch): typeof fetch => (async(u:any,o:any)=>String(u).endsWith('/images/models') ? response({data:[]}) : fn(u,o)) as typeof fetch;
const req={model,contents:{parts:[{text:'Karakter'},{inlineData:{mimeType:'image/png',data:png}}]},config:{imageConfig:{aspectRatio:'9:16',imageSize:'1K'},responseModalities:['IMAGE','TEXT']}};
test('OpenRouter preserves the model identity, references, ratio and size and returns usable SDK image parts',async()=>{
 let calls=0;const out=await generateOpenRouterImage(route,req,legacyFetch((async(u:any,o:any)=>{
  if(String(u).endsWith('/models')){assert.equal(o.headers,undefined);return response(catalog);}
  calls++;assert.equal(o.headers.Authorization,'Bearer fake-test-secret');assert.equal(o.credentials,'omit');const body=JSON.parse(o.body);assert.equal(body.model,'google/'+model);assert.deepEqual(body.image_config,{aspect_ratio:'9:16',image_size:'1K'});assert.equal(body.messages[0].content[1].image_url.url,'data:image/png;base64,'+png);assert.deepEqual(body.modalities,['image','text']);return response({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,'+png}}]}}]});
 }) as typeof fetch));assert.equal(calls,1);assert.equal(out.candidates[0].content.parts[0].inlineData.data,png);assert.equal(out.bekalProvider,'openrouter');assert.equal(out.bekalModel,'google/'+model);
});
test('unsupported selected models never send a paid image request or silently change the model',async()=>{
 let calls=0;await assert.rejects(generateOpenRouterImage(route,{...req,model:'text-only'},legacyFetch((async()=>{calls++;return response({})}) as typeof fetch)),(e:any)=>e instanceof AiRouteError&&e.terminal);assert.equal(calls,0);
});
test('credit errors, empty responses, policy and malformed image replies never retry or expose keys',async()=>{
 for(const [status,data] of [[402,{error:{message:'fake-test-secret'}}],[200,{choices:[{message:{images:[]}}]}],[200,{choices:[{finish_reason:'content_filter',message:{}}]}],[200,{choices:[{message:{images:[{image_url:{url:'http://unsafe.example/a.png'}}]}}]}]] as const){let calls=0;await assert.rejects(generateOpenRouterImage(route,req,legacyFetch((async()=>{calls++;return response(data,status)}) as typeof fetch)),(e:any)=>e instanceof AiRouteError&&e.terminal&&!e.message.includes('fake-test-secret'));assert.equal(calls,1);}
});
test('CDN image downloads never carry the API key and normalize image bytes',async()=>{
 const out=await generateOpenRouterImage(route,req,legacyFetch((async(u:any,o:any)=>{if(String(u).startsWith('https://cdn.example/')){assert.equal(o.headers,undefined);assert.equal(o.credentials,'omit');return new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'image/png'}});}return response({choices:[{message:{images:[{image_url:{url:'https://cdn.example/image.png'}}]}}]});}) as typeof fetch));assert.equal(out.candidates[0].content.parts[0].inlineData.data,'AQID');
});
test('caller cancellation does not submit a generation request',async()=>{
 const c=new AbortController();c.abort();let calls=0;await assert.rejects(generateOpenRouterImage(route,{...req,config:{...req.config,abortSignal:c.signal}},legacyFetch((async()=>{calls++;return response({})}) as typeof fetch)),(e:any)=>e.name==='AbortError');assert.equal(calls,0);
});

const configure = (patch: any = {}) => {
 const value = JSON.stringify({version:1,imagesViaOpenRouter:true,fallback:true,routes:[route],...patch});
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>value}});
};
test('catalogue routing tries another compatible model after rejection, preserving references and provider fallback', async()=>{
 configure(); const seen:string[]=[]; let direct=0;
 const result=await generateRoutedOpenRouterImage(req,async()=>{direct++;},legacyFetch((async(u:any,o:any)=>{
  const body=JSON.parse(o.body); seen.push(body.model);assert.equal(body.provider.allow_fallbacks,true);assert.equal(body.messages[0].content[1].image_url.url,'data:image/png;base64,'+png);
  return seen.length===1?response({error:{code:429}},429):response({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,'+png}}]}}]});
 }) as typeof fetch));
 assert.deepEqual(seen,['google/'+model,'black-forest-labs/flux-test']);assert.equal(direct,0);assert.equal(result.bekalModel,'black-forest-labs/flux-test');
});
test('explicit Flux selection uses the catalogue model without a Google prefix',async()=>{
 configure({openRouterImageModel:'black-forest-labs/flux-test'});
 const out=await generateRoutedOpenRouterImage(req,undefined,legacyFetch((async(u:any,o:any)=>{assert.equal(JSON.parse(o.body).model,'black-forest-labs/flux-test');return response({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,'+png}}]}}]});}) as typeof fetch));
 assert.equal(out.bekalModel,'black-forest-labs/flux-test');
});
test('exhausted OpenRouter models never invoke a direct provider',async()=>{
 configure(); const seen:string[]=[];
 await assert.rejects(generateRoutedOpenRouterImage(req,async()=>{seen.push('direct');return 'native';},legacyFetch((async(u:any,o:any)=>{seen.push(JSON.parse(o.body).model);return response({error:{code:404}},404);}) as typeof fetch)));
 assert.deepEqual(seen,['google/'+model,'black-forest-labs/flux-test']);
});
test('account credit rejection stops without direct-provider billing',async()=>{
 configure();let calls=0,direct=0;
 await assert.rejects(generateRoutedOpenRouterImage(req,async()=>{direct++;return 'native';},legacyFetch((async()=>{calls++;return response({error:{code:402}},402);}) as typeof fetch)));
 assert.equal(calls,1);assert.equal(direct,0);
});
test('uncertain acceptance, empty results, policy, and cancellation never generate on another provider',async()=>{
 configure();
 for(const mode of ['network','empty','policy','abort']) {
  let calls=0,direct=0;
  await assert.rejects(generateRoutedOpenRouterImage(req,async()=>{direct++;},legacyFetch((async()=>{calls++;if(mode==='network')throw new TypeError('network');if(mode==='abort')throw new DOMException('cancel','AbortError');return mode==='policy'?response({error:{message:'content policy'}},403):response({choices:[{message:{}}]});}) as typeof fetch)));
  assert.equal(calls,1);assert.equal(direct,0);
 }
});
test('disabled fallback makes exactly one request and never uses a direct provider',async()=>{
 configure({fallback:false});let calls=0,direct=0;
 await assert.rejects(generateRoutedOpenRouterImage(req,async()=>{direct++;},legacyFetch((async()=>{calls++;return response({error:{code:429}},429);}) as typeof fetch)));
 assert.equal(calls,1);assert.equal(direct,0);
});
test('reference-incompatible models are excluded without removing references',()=>{
 const models=[{id:'flux-text',architecture:{input_modalities:['text'],output_modalities:['image']}},{id:'flux-edit',architecture:{input_modalities:['text','image'],output_modalities:['image']}}];
 assert.deepEqual(compatibleOpenRouterImageModels(models,req).map(m=>m.id),['flux-edit']);
 assert.equal(compatibleOpenRouterImageModels(models,{model,contents:'gambar'}).length,2);
});
test('invalid account key skips duplicate routes and uses the next OpenRouter key before native',async()=>{
 configure({routes:[route,{...route,id:'duplicate'},{...route,id:'second',apiKey:'second-test-key'}]});const keys:string[]=[];let direct=0;
 await generateRoutedOpenRouterImage(req,async()=>{direct++;},legacyFetch((async(u:any,o:any)=>{keys.push(o.headers.Authorization);return keys.length===1?response({error:{code:401}},401):response({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,'+png}}]}}]});}) as typeof fetch));
 assert.deepEqual(keys,['Bearer fake-test-secret','Bearer second-test-key']);assert.equal(direct,0);
});
test('caller abort after an explicit rejection prevents all further submissions',async()=>{
 configure();const controller=new AbortController();let calls=0,direct=0;
 await assert.rejects(generateRoutedOpenRouterImage({...req,config:{...req.config,abortSignal:controller.signal}},async()=>{direct++;},legacyFetch((async()=>{calls++;controller.abort();return response({error:{code:429}},429);}) as typeof fetch)),(e:any)=>e.name==='AbortError');
 assert.equal(calls,1);assert.equal(direct,0);
});
test('explicit Flux selection overrides a global Gemini setting and never falls across model families',async()=>{
 configure({openRouterImageModel:'google/'+model});let calls=0,direct=0;
 await assert.rejects(generateRoutedOpenRouterImage({...req,model:'black-forest-labs/flux-test'},async()=>{direct++;return 'native-flux';},legacyFetch((async(u:any,o:any)=>{calls++;assert.equal(JSON.parse(o.body).model,'black-forest-labs/flux-test');return response({error:{code:429}},429);}) as typeof fetch)));
 assert.equal(calls,1);assert.equal(direct,0);
});
test('unavailable explicitly selected Flux Klein does not submit a Gemini image request',async()=>{
 configure({openRouterImageModel:'google/'+model});let calls=0;
 await assert.rejects(generateRoutedOpenRouterImage({...req,model:'black-forest-labs/flux-2-klein-9b-base'},undefined,legacyFetch((async()=>{calls++;return response({});}) as typeof fetch)),(e:any)=>e instanceof AiRouteError&&/tidak diganti ke Gemini/.test(e.message));assert.equal(calls,0);
});

// These IDs and capability records come from the real official image catalogue, not chat fixtures.
const nativeCatalog = JSON.parse((await import('node:fs')).readFileSync(new URL('./fixtures/openrouter-image-catalog.json',import.meta.url),'utf8'));
const nativeImageFetch = (paid: (url:any, options:any)=>Promise<Response>): typeof fetch => (async(url:any, options:any)=>{
 if(String(url).endsWith('/images/models')) { assert.equal(options.headers,undefined);return response(nativeCatalog); }
 if(String(url).endsWith('/models')) return response({data:[]});
 return paid(url,options);
}) as typeof fetch;
test('official Flux image catalogue resolves dotted Flux Klein ID and uses POST /images with native references',async()=>{
 configure({openRouterImageModel:'google/'+model});let calls=0;
 const fetcher=nativeImageFetch(async(url,options)=>{
  calls++;assert.equal(url,'https://openrouter.ai/api/v1/images');assert.equal(options.headers.Authorization,'Bearer fake-test-secret');
  const body=JSON.parse(options.body);assert.equal(body.model,'black-forest-labs/flux.2-klein-4b');assert.equal(body.prompt,'Karakter');assert.equal(body.aspect_ratio,'9:16');assert.equal(body.output_format,'png');assert.equal(body.n,1);assert.equal(body.messages,undefined);assert.equal(body.modalities,undefined);assert.equal(body.resolution,undefined);assert.deepEqual(body.input_references,[{type:'image_url',image_url:{url:'data:image/png;base64,'+png}}]);
  return response({created:1,data:[{b64_json:png,media_type:'image/png'}]});
 });
 const out=await generateRoutedOpenRouterImage({...req,model:'black-forest-labs/flux-2-klein-9b-base'},undefined,fetcher);
 assert.equal(calls,1);assert.equal(out.bekalModel,'black-forest-labs/flux.2-klein-4b');assert.equal(out.candidates[0].content.parts[0].inlineData.data,png);
});
test('Seedream uses real namespace and normalized resolution, and OpenAI image models use the image API',async()=>{
 for(const [selected,actual] of [['bytedance/seedream-4.5','bytedance-seed/seedream-4.5'],['openai/gpt-image-2','openai/gpt-image-2']]) {
  configure();const out=await generateRoutedOpenRouterImage({...req,model:selected},undefined,nativeImageFetch(async(url,options)=>{
   assert.equal(url,'https://openrouter.ai/api/v1/images');const body=JSON.parse(options.body);assert.equal(body.model,actual);
   if(actual.includes('seedream'))assert.equal(body.resolution,'1K');
   return response({created:1,data:[{b64_json:png,media_type:'image/png'}]});
  }));assert.equal(out.bekalModel,actual);
 }
});
test('native image reference limits reject excess references without stripping them or making a paid request',async()=>{
 configure();let calls=0;
 const request={...req,model:'black-forest-labs/flux-2-klein-9b-base',contents:{parts:[{text:'Karakter'},...Array.from({length:5},()=>({inlineData:{mimeType:'image/png',data:png}}))]}};
 await assert.rejects(generateRoutedOpenRouterImage(request,undefined,nativeImageFetch(async()=>{calls++;return response({});})),(e:any)=>e.terminal&&/referensi/i.test(e.message));assert.equal(calls,0);
});
test('empty native image results and transport loss never cause another paid generation',async()=>{
 configure();
 for(const mode of ['empty','network']) {
  let calls=0,direct=0;
  await assert.rejects(generateRoutedOpenRouterImage({...req,model:'black-forest-labs/flux-2-klein-9b-base'},async()=>{direct++;},nativeImageFetch(async()=>{calls++;if(mode==='network')throw new TypeError('lost');return response({created:1,data:[]});})));
  assert.equal(calls,1);assert.equal(direct,0);
 }
});

test('automatic candidates skip reference-only and vector-only native models without losing input',()=>{
 const candidates=[{id:'native/styles',imageApi:true,architecture:{input_modalities:['text','image'],output_modalities:['image']},supported_parameters:{input_references:{min:1,max:4}}},{id:'native/vector',imageApi:true,architecture:{input_modalities:['text'],output_modalities:['image']},supported_parameters:{output_format:{values:['svg']}}},{id:'native/raster',imageApi:true,architecture:{input_modalities:['text'],output_modalities:['image']},supported_parameters:{}}];
 assert.deepEqual(compatibleOpenRouterImageModels(candidates,{model:'auto',contents:'Gambar'}).map(m=>m.id),['native/raster']);
});

test('optional automatic fallback prefers explicit model then another compatible OpenRouter model',async()=>{
 configure({imageFallbackModels:true});const seen:string[]=[];
 const result=await generateRoutedOpenRouterImage({...req,model:'black-forest-labs/flux-test'},undefined,legacyFetch((async(u:any,o:any)=>{const body=JSON.parse(o.body);seen.push(body.model);return seen.length===1?response({error:{code:429}},429):response({choices:[{message:{images:[{image_url:{url:'data:image/png;base64,'+png}}]}}]});}) as typeof fetch));
 assert.deepEqual(seen,['black-forest-labs/flux-test','google/'+model]);assert.equal(result.bekalModel,'google/'+model);
});
test('native image metadata overrides duplicate general catalog capability',async()=>{
 const out=await getOpenRouterImageModels(route,(async(u:any)=>response({data:String(u).includes('/images/models')?[{id:'test/duplicate',architecture:{input_modalities:['text','image'],output_modalities:['image']},supported_parameters:{input_references:{max:4}}}]:[{id:'test/duplicate',architecture:{input_modalities:['text'],output_modalities:['image']}}]})) as typeof fetch);
 const duplicate=out.find(m=>m.id==='test/duplicate');assert.equal(duplicate.imageApi,true);assert.equal(duplicate.supported_parameters.input_references.max,4);assert.ok(duplicate.architecture.input_modalities.includes('image'));
});

test('plain HTML 413 identifies payload size and never switches the selected model', async () => {
 configure({imageFallbackModels:true}); let calls=0;
 await assert.rejects(generateRoutedOpenRouterImage({...req,model:'black-forest-labs/flux-test'},undefined,legacyFetch((async(u:any,o:any)=>{
  calls++; assert.equal(JSON.parse(o.body).model,'black-forest-labs/flux-test');
  return new Response('<html>Request too large</html>',{status:413});
 }) as typeof fetch)), (error:any)=>error.status===413 && /ukuran referensi/.test(error.message));
 assert.equal(calls,1);
});
