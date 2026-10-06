import test from 'node:test';
import assert from 'node:assert/strict';
import { audioRequest, readOpenRouterAudioStream } from './openRouterAudio.ts';
test('speech uses dedicated endpoint, supported Indonesian voice and explicit format', () => {
 const m={id:'microsoft/voice',architecture:{output_modalities:['speech']},supported_voices:['en-US-A','id-ID-B']};
 const req=audioRequest(m,'Halo',{format:'mp3'});
 assert.equal(req.path,'/audio/speech');assert.deepEqual(req.body,{model:m.id,input:'Halo',voice:'id-ID-B',response_format:'mp3'});
 assert.throws(()=>audioRequest(m,'Halo',{voice:'unknown'}),/Suara/);
});
test('music and speech cannot silently use the wrong operation',()=>{
 const speech={id:'voice/a',architecture:{output_modalities:['speech']},description:'Text to speech'};
 assert.throws(()=>audioRequest(speech,'musik',{operation:'music'}),/dukungan musik/);
 const music={id:'music/a',architecture:{output_modalities:['audio']},description:'music generation'};
 assert.throws(()=>audioRequest(music,'Halo'),/narasi/);
 assert.equal(audioRequest(music,'piano',{operation:'music'}).body.stream,true);
});
test('audio streaming handles split SSE frames, usage and complete output',async()=>{
 const text='data: {"choices":[{"delta":{"audio":{"data":"AQ"}}}]}\r\n\r\ndata: {"model":"audio/a","choices":[{"delta":{"audio":{"data":"ID"}}}],"usage":{"cost":0.01}}\n\ndata: [DONE]\n\n';
 const stream=new ReadableStream({start(c){const bytes=new TextEncoder().encode(text);for(let i=0;i<bytes.length;i+=7)c.enqueue(bytes.slice(i,i+7));c.close();}});
 const result=await readOpenRouterAudioStream(new Response(stream));assert.equal(result.data,'AQID');assert.equal(result.usage.cost,.01);assert.equal(result.model,'audio/a');
});
test('truncated or rejected audio never returns partial media',async()=>{
 await assert.rejects(readOpenRouterAudioStream(new Response('data: {"choices":[{"delta":{"audio":{"data":"AQID"}}}]}\n\n')),/belum lengkap/);
 await assert.rejects(readOpenRouterAudioStream(new Response('data: {"error":{"code":402}}\n\n')),/menolak/);
});
