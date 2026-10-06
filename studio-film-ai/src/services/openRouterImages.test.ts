import test from 'node:test';
import assert from 'node:assert/strict';
import { generateOpenRouterImage } from './openRouterImages.ts';
import { AiRouteError, type AiRoute } from './aiRouting.ts';
const route:AiRoute={id:'openrouter',name:'OpenRouter',baseUrl:'https://openrouter.ai/api/v1',model:'text',apiKey:'fake-test-secret',enabled:true,vision:false,tools:false,json:false};
const model='gemini-3.1-flash-image-preview';
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZAAAAABJRU5ErkJggg==';
const response=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
const catalog={data:[{id:'google/'+model,architecture:{input_modalities:['text','image'],output_modalities:['text','image']}},{id:'google/text-only',architecture:{input_modalities:['text'],output_modalities:['text']}}]};
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
