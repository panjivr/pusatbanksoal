import test from 'node:test';
import assert from 'node:assert/strict';
import { AiRouteError, canFailoverAi, executeAiRoutes, gatewayCanHandle, gatewayGenerate, gatewayMessages, jsonSchema, matchesResponseSchema, normalizeAiBaseUrl, type AiRoute } from './aiRouting.ts';
const route: AiRoute = { id:'a',name:'A',baseUrl:'https://router.example/v1',model:'my-combo',apiKey:'test-only-key',enabled:true,vision:true,tools:true,json:true };
const reply = (content: any) => new Response(JSON.stringify({choices:[{message:content,finish_reason:'stop'}],usage:{prompt_tokens:4,completion_tokens:3,total_tokens:7}}),{status:200,headers:{'Content-Type':'application/json'}});
test('failed A and B switch to C once and stop after success',async()=>{
 const seen:string[]=[];
 const result=await executeAiRoutes([
  {id:'a',run:async()=>{seen.push('a');throw new AiRouteError('invalid key',401)}},
  {id:'b',run:async()=>{seen.push('b');throw new AiRouteError('quota',429)}},
  {id:'c',run:async()=>{seen.push('c');return 'berhasil'}},
  {id:'d',run:async()=>{seen.push('d');return 'tidak dipakai'}},
 ],true);
 assert.equal(result,'berhasil');assert.deepEqual(seen,['a','b','c']);
});
test('disabled fallback never calls second provider',async()=>{
 let next=false; await assert.rejects(executeAiRoutes([{id:'a',run:async()=>{throw new AiRouteError('quota',429)}},{id:'b',run:async()=>{next=true}}],false));assert.equal(next,false);
});
test('content policy and caller cancellation never fall through',async()=>{
 for(const error of [new AiRouteError('policy',403,true),new DOMException('cancelled','AbortError')]){
  let next=false;await assert.rejects(executeAiRoutes([{id:'a',run:async()=>{throw error}},{id:'b',run:async()=>{next=true}}],true));assert.equal(next,false);
 }
 assert.equal(canFailoverAi(new Error('403 PERMISSION_DENIED')),true);
 assert.equal(canFailoverAi(new Error('400 invalid arguments')),false);
});
test('normalizes endpoint suffix and rejects credential-bearing/insecure URLs',()=>{
 assert.equal(normalizeAiBaseUrl('https://router.example/v1/chat/completions/'),'https://router.example/v1');
 assert.equal(normalizeAiBaseUrl('http://localhost:20128/v1'),'http://localhost:20128/v1');
 for(const s of ['http://router.example/v1','https://user:pass@router.example/v1','https://router.example/v1?key=secret','javascript:alert(1)'])assert.throws(()=>normalizeAiBaseUrl(s));
});
test('routes preserve model/combos, isolated credentials, JSON and tool responses',async()=>{
 let body:any,headers:any,url:any;
 const req={model:'gemini-3-pro',contents:[{role:'user',parts:[{text:'Tulis cerita'}]}],config:{responseMimeType:'application/json',responseSchema:{type:'OBJECT',properties:{title:{type:'STRING'}},required:['title']}}};
 const out=await gatewayGenerate(route,req,10,(async(u:any,o:any)=>{url=u;headers=o.headers;body=JSON.parse(o.body);return reply({content:'{"title":"Cerita baru"}'})}) as typeof fetch);
 assert.equal(url,'https://router.example/v1/chat/completions');assert.equal(headers.Authorization,'Bearer test-only-key');assert.equal(body.model,'my-combo');assert.equal(body.stream,false);assert.match(body.messages[0].content,/bahasa Indonesia/);assert.match(body.messages[0].content,/"title"/);assert.equal(out.text,'{"title":"Cerita baru"}');assert.equal(out.usageMetadata.totalTokenCount,7);
 const history=gatewayMessages({model:'text',contents:[{role:'model',parts:[{functionCall:{id:'call-1',name:'add_clip',args:{clipId:'123'}}}]},{role:'user',parts:[{functionResponse:{name:'add_clip',response:{success:true}}}]}]});
 assert.equal(history[1].tool_calls[0].function.name,'add_clip');assert.equal(history[2].tool_call_id,'call-1');
});
test('does not route unsupported media, native search, or tools to text-only providers',()=>{
 const textOnly={...route,vision:false,tools:false,json:false};
 assert.equal(gatewayCanHandle(textOnly,{model:'gemini-flash',contents:'hello'}),true);
 for(const req of [
 {model:'gemini-image',contents:'image'},
 {model:'gemini-pro',contents:[{inlineData:{mimeType:'image/png',data:'AA'}}]},
 {model:'gemini-pro',contents:[{inlineData:{mimeType:'video/mp4',data:'AA'}}]},
 {model:'gemini-pro',contents:[{fileData:{fileUri:'private-google-uri'}}]},
 {model:'gemini-pro',contents:'search',config:{tools:[{googleSearch:{}}]}},
 {model:'gemini-pro',contents:'tools',config:{tools:[{functionDeclarations:[]}]}},
 {model:'gemini-pro',contents:'json',config:{responseMimeType:'application/json'}},
 {model:'gemini-pro',contents:[{functionCall:{name:'x'}}]},
 {model:'gemini-pro',contents:'audio',config:{responseModalities:['AUDIO']}},
 ])assert.equal(gatewayCanHandle(textOnly,req),false);
 assert.equal(gatewayCanHandle(route,{model:'gemini-pro',contents:[{inlineData:{mimeType:'image/png',data:'AA'}}]}),true);
});
test('rejects malformed or structurally wrong JSON instead of damaging project state',async()=>{
 const req={model:'text',contents:'json',config:{responseMimeType:'application/json',responseSchema:{type:'OBJECT',properties:{shots:{type:'ARRAY',items:{type:'OBJECT',properties:{shot:{type:'INTEGER'}},required:['shot']}}},required:['shots']}}};
 for(const content of ['not-json','{"shots":"wrong"}','{"shots":[{"shot":"wrong"}]}'])await assert.rejects(gatewayGenerate(route,req,10,(async()=>reply({content})) as typeof fetch),/struktur proyek/);
 assert.equal(matchesResponseSchema({shots:[{shot:1}]},req.config.responseSchema),true);
 assert.deepEqual(jsonSchema({type:'OBJECT',propertyOrdering:['a'],properties:{a:{type:'STRING'}}}),{type:'object',properties:{a:{type:'string'}}});
});
test('never exposes raw gateway errors or credentials',async()=>{
 await assert.rejects(gatewayGenerate(route,{model:'text',contents:'hello'},10,(async()=>new Response(JSON.stringify({error:{message:'test-only-key'}}),{status:401})) as typeof fetch),(e:any)=>e.status===401&&!e.message.includes('test-only-key'));
});
test('empty, truncated, and filtered responses do not silently succeed',async()=>{
 for(const finish_reason of ['content_filter','length'])await assert.rejects(gatewayGenerate(route,{model:'text',contents:'hello'},10,(async()=>new Response(JSON.stringify({choices:[{message:{content:'text'},finish_reason}]}),{status:200})) as typeof fetch));
 await assert.rejects(gatewayGenerate(route,{model:'text',contents:'hello'},10,(async()=>reply({content:''})) as typeof fetch),/kosong/);
});
test('timeout aborts the request and can fail over; caller abort does not',async()=>{
 const blocked:typeof fetch=async(_u,opts)=>new Promise((_resolve,reject)=>opts?.signal?.addEventListener('abort',()=>reject(new DOMException('cancelled','AbortError'))));
 await assert.rejects(gatewayGenerate(route,{model:'text',contents:'hello'},0.01,blocked),(e:any)=>canFailoverAi(e));
 const c=new AbortController();c.abort();await assert.rejects(gatewayGenerate(route,{model:'text',contents:'hello',config:{abortSignal:c.signal}},1,blocked),(e:any)=>e.name==='AbortError'&&!canFailoverAi(e));
});
test('parallel calls to the same tool preserve separate response IDs',()=>{
 const messages=gatewayMessages({model:'text',contents:[{role:'model',parts:[{functionCall:{id:'first',name:'add_clip',args:{id:'1'}}},{functionCall:{id:'second',name:'add_clip',args:{id:'2'}}}]},{role:'user',parts:[{functionResponse:{name:'add_clip',response:{clip:'1'}}},{functionResponse:{name:'add_clip',response:{clip:'2'}}}]}]});
 assert.deepEqual(messages.filter(m=>m.role==='tool').map(m=>m.tool_call_id),['first','second']);
 assert.throws(()=>gatewayMessages({model:'text',contents:[{functionResponse:{name:'unknown',response:{}}}]}),/pasangan panggilan/);
});
