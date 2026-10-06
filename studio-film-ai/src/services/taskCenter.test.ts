import test from 'node:test';
import assert from 'node:assert/strict';
import {startTask,cancelTask,getTasks,clearFinishedTasks,trackTask} from './taskCenter.ts';
test('cancelled task cannot be overwritten by late completion or failure',()=>{
 let cancelled=0;const task=startTask({label:'test',cancel:()=>{cancelled++;}});cancelTask(task.id);task.complete();task.fail(new Error('late'));task.update({status:'running'});
 assert.equal(getTasks().find(t=>t.id===task.id)?.status,'cancelled');assert.equal(cancelled,1);cancelTask(task.id);assert.equal(cancelled,1);clearFinishedTasks();
});
test('more than twelve failed tasks stay available for batch history',async()=>{
 for(let i=0;i<20;i++) await assert.rejects(trackTask({label:`shot ${i}`},async()=>{throw new Error('failed');}));
 assert.equal(getTasks().filter(t=>t.status==='failed').length,20);clearFinishedTasks();
});
