import test from 'node:test';
import assert from 'node:assert/strict';
import { AiRouteError, canFailoverAi, executeAiRoutes, gatewayCanHandle, gatewayGenerate, gatewayMessages, jsonSchema, matchesResponseSchema, normalizeAiBaseUrl, resolveOpenRouterRoute, isOpenRouter, type AiRoute } from './aiRouting.ts';
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


test('Google invalid API keys reported as HTTP 400 can fail over without retrying other invalid arguments', () => {
  assert.equal(canFailoverAi(new AiRouteError('Gemini: API key belum valid. (HTTP 400)', 400)), true);
  assert.equal(canFailoverAi(new AiRouteError('Gemini: Model menolak format permintaan. (HTTP 400)', 400)), false);
});

const openRouter: AiRoute = { ...route, id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'test/editor', tools: false, json: false, vision: false };
test('OpenRouter normalizes dashboard URLs without treating other gateways as OpenRouter', () => {
 for (const url of ['https://openrouter.ai', 'https://openrouter.ai/', 'https://openrouter.ai/api', 'https://openrouter.ai/api/v1/chat/completions']) assert.equal(normalizeAiBaseUrl(url), openRouter.baseUrl);
 assert.equal(isOpenRouter(openRouter), true); assert.equal(isOpenRouter({...openRouter,baseUrl:'https://openrouter.ai.evil.example/api/v1'}), false);
});
test('OpenRouter detects model capabilities and caches public catalog without sending API keys', async () => {
 let count=0;
 const resolved=await resolveOpenRouterRoute(openRouter,(async(u:any,opts:any)=>{
  count++; assert.equal(u, 'https://openrouter.ai/api/v1/models'); assert.equal(opts.headers, undefined);
  return new Response(JSON.stringify({data:[
   {id:'test/editor',architecture:{input_modalities:['text','image'],output_modalities:['text']},supported_parameters:['tools','response_format','temperature']},
   {id:'test/text',architecture:{input_modalities:['text'],output_modalities:['text']},supported_parameters:[]}
  ]}),{status:200});
 }) as typeof fetch);
 assert.equal(resolved.tools,true); assert.equal(resolved.json,true); assert.equal(resolved.vision,true);
 const plain=await resolveOpenRouterRoute({...openRouter,model:'test/text'},(async()=>{throw new Error('cache missing')}) as typeof fetch);
 assert.equal(count,1);assert.equal(plain.tools,false);assert.equal(plain.vision,false);assert.equal(plain.json,true);
 await assert.rejects(resolveOpenRouterRoute({...openRouter,model:'not-real'}),/ID model lengkap/);
});
test('OpenRouter models without native JSON mode use instructions and validated JSON, not unsupported parameters',async()=>{
 const resolved=await resolveOpenRouterRoute({...openRouter,model:'test/text'});
 let body:any;
 const result=await gatewayGenerate(resolved,{model:'text',contents:'JSON',config:{responseMimeType:'application/json',temperature:0.5,responseSchema:{type:'OBJECT',properties:{title:{type:'STRING'}},required:['title']}}},10,(async(_u:any,o:any)=>{body=JSON.parse(o.body);return reply({content:'{"title":"Judul"}'})}) as typeof fetch);
 assert.equal(result.text,'{"title":"Judul"}');assert.equal(body.response_format,undefined);assert.equal(body.temperature,undefined);assert.deepEqual(body.provider,{require_parameters:true});assert.equal(typeof body.messages[1].content,'string');
});
test('OpenRouter tool round trip retains IDs, schema, arguments and provider reasoning without leaking to fallback',async()=>{
 const resolved=await resolveOpenRouterRoute(openRouter);
 const config={tools:[{functionDeclarations:[{name:'rename_project',parametersJsonSchema:{type:'object',properties:{title:{type:'string'}},required:['title']}}]}],toolConfig:{functionCallingConfig:{mode:'ANY',allowedFunctionNames:['rename_project']}}};
 const details=[{type:'reasoning.encrypted',data:'opaque-provider-data',format:'test',index:0}];
 let initial:any, continuation:any;
 const first=await gatewayGenerate(resolved,{model:'text',contents:'Ubah nama',config},10,(async(_u:any,o:any)=>{
  initial=JSON.parse(o.body); assert.equal(o.headers['HTTP-Referer'],'https://pusatbanksoal.id');assert.equal(o.headers.Authorization,'Bearer test-only-key');
  return reply({content:null,reasoning_details:details,tool_calls:[{id:'rename-1',type:'function',function:{name:'rename_project',arguments:JSON.stringify({title:'Filmku'},null,2)}}]});
 }) as typeof fetch);
 assert.deepEqual(initial.tool_choice,{type:'function',function:{name:'rename_project'}});assert.deepEqual(initial.tools[0].function.parameters,config.tools[0].functionDeclarations[0].parametersJsonSchema);
 assert.deepEqual(first.functionCalls,[{id:'rename-1',name:'rename_project',args:{title:'Filmku'}}]);
 const req={model:'text',contents:[{role:'model',parts:first.candidates[0].content.parts},{role:'user',parts:[{functionResponse:{id:'rename-1',name:'rename_project',response:{success:true}}}]}],config:{tools:config.tools}};
 await gatewayGenerate(resolved,req,10,(async(_u:any,o:any)=>{continuation=JSON.parse(o.body);return reply({content:'Nama proyek sudah diubah.'})}) as typeof fetch);
 assert.deepEqual(continuation.messages[1].reasoning_details,details);assert.equal(continuation.messages[2].tool_call_id,'rename-1');assert.equal(continuation.messages[2].role,'tool');
 assert.equal(gatewayMessages(req,route)[1].reasoning_details,undefined);
});
test('malformed, unknown or wrong-type tool calls never reach the editor',async()=>{
 const config={tools:[{functionDeclarations:[{name:'rename_project',parameters:{type:'OBJECT',properties:{title:{type:'STRING'}},required:['title']}}]}]};
 for (const c of [{name:'unknown',arguments:'{}'},{name:'rename_project',arguments:'bad-json'},{name:'rename_project',arguments:'{"title":9}'},{name:'rename_project',arguments:'[]'}]) {
  await assert.rejects(gatewayGenerate(openRouter,{model:'text',contents:'execute',config},10,(async()=>reply({content:null,tool_calls:[{id:'invalid',type:'function',function:c}]})) as typeof fetch),/alat/);
 }
});
test('OpenRouter credit and in-band errors fail over with useful messages without exposing raw data',async()=>{
 for(const status of [401,402,429]) {
  for(const http of [status,200]) {
   await assert.rejects(gatewayGenerate(openRouter,{model:'text',contents:'hello'},10,(async()=>new Response(JSON.stringify({error:{code:status,message:'test-only-key private prompt'}}),{status:http})) as typeof fetch),(e:any)=>e.status===status && canFailoverAi(e) && !e.message.includes('test-only-key') && !e.message.includes('private prompt') && (status!==402 || e.message.includes('Saldo')));
  }
 }
 await assert.rejects(gatewayGenerate(openRouter,{model:'text',contents:'hello'},10,(async()=>new Response('Unauthorized',{status:401})) as typeof fetch),(e:any)=>e.status===401);
});
