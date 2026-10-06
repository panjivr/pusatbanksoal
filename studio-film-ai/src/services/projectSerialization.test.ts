import test from 'node:test';
import assert from 'node:assert/strict';
import {jsonChunks,projectJsonBlob,projectFingerprint} from './projectSerialization.ts';
test('chunked project JSON preserves escaped text, unicode boundaries and array semantics', async()=>{
 const text='x'.repeat(32767)+'😀\n"\\\u0000';const value={text,list:[undefined,null,NaN],omitted:undefined,date:new Date('2026-10-06')};
 assert.deepEqual(JSON.parse(await projectJsonBlob(value).text()),JSON.parse(JSON.stringify(value)));
});
test('large frame collections never request a single aggregate JSON string',()=>{
 const value={shots:Array.from({length:160},(_,shot)=>({shot,imageUrl:'data:image/png;base64,'+'a'.repeat(32768),versions:['a'.repeat(32768)]}))};
 const native=JSON.stringify;let max=0;
 JSON.stringify=((v:any,...args:any[])=>{if(v && typeof v==='object')throw new RangeError('Invalid string length');const str=(native as any)(v,...args);max=Math.max(max,str?.length || 0);return str;}) as any;
 try {let total=0;for(const chunk of jsonChunks(value))total+=chunk.length;assert.ok(total>10_000_000);assert.ok(max<33000);assert.equal(projectFingerprint(value),projectFingerprint(value));}
 finally {JSON.stringify=native;}
});
test('project signatures detect changes at the end of generated frames and reject circular data',()=>{
 const prefix='data:image/png;base64,'+'a'.repeat(100000);
 assert.notEqual(projectFingerprint({image:prefix+'a'}),projectFingerprint({image:prefix+'b'}));
 const circular:any={};circular.self=circular;assert.throws(()=>[...jsonChunks(circular)],/melingkar/);
});
