import test from 'node:test';import assert from 'node:assert/strict';
import { MediaSubmissionRejected, canFailoverMedia, runSafeMediaFailover } from './mediaFailover.ts';
test('same-model media fallback only follows a rejected submission, never polling errors or ambiguous network errors',async()=>{
 const seen:string[]=[];const out=await runSafeMediaFailover(async()=>{seen.push('a');throw new MediaSubmissionRejected('a',401)},async()=>{seen.push('b');return 'video'},true);assert.equal(out,'video');assert.deepEqual(seen,['a','b']);
 for(const error of [new Error('Network fetch failed'),new Error('FAL Queue status error (429)'),new Error('FAL Queue timed out before completion.'),new Error('Cancelled.'),new MediaSubmissionRejected('a',403,true)]){let called=false;await assert.rejects(runSafeMediaFailover(async()=>{throw error},async()=>{called=true;return 'bad'},true));assert.equal(called,false);}
 assert.equal(canFailoverMedia(new MediaSubmissionRejected('a',429)),true);assert.equal(canFailoverMedia(new MediaSubmissionRejected('a',400)),false);
});
test('disabled media fallback keeps original provider behavior',async()=>{let called=false;await assert.rejects(runSafeMediaFailover(async()=>{throw new MediaSubmissionRejected('a',401)},async()=>{called=true},false));assert.equal(called,false)});
