import test from 'node:test';
import assert from 'node:assert/strict';
import {validVideoJobId,videoRequestKey,readVideoJob,writeVideoJob} from './openRouterJobs.ts';
test('video IDs are opaque safe path segments without undocumented prefix',()=>{
 assert.equal(validVideoJobId('abc123'),true);assert.equal(validVideoJobId('gen-vid-test'),true);
 for(const id of ['../test','a/b','a?key=bad','a#bad','a\\b','a\n','..',''])assert.equal(validVideoJobId(id),false);
});
test('job recovery retains exact identity without persisting prompt or media',()=>{
 const values=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k),setItem:(k:string,v:string)=>values.set(k,v)}});
 const key=videoRequestKey({model:'video/a',prompt:'private script',frame:'private frame'});assert.equal(key.includes('private'),false);
 writeVideoJob(key,{id:'abc123',model:'video/a',status:'queued',updatedAt:1});assert.equal(readVideoJob(key)?.id,'abc123');assert.equal([...values.values()].join('').includes('private'),false);
 assert.notEqual(key,videoRequestKey({model:'video/b',prompt:'private script',frame:'private frame'}));
 values.set(key,'bad-json');assert.throws(()=>readVideoJob(key),/Catatan/);
});
