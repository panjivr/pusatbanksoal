import test from 'node:test';
import assert from 'node:assert/strict';
import {limitReferencePixels} from './imagePayload.ts';
test('identical references do not multiply input charges while unique inputs and originals remain intact',async()=>{
 const ref=(url:string)=>({type:'image_url',image_url:{url}}),body={model:'test/chosen',input_references:[ref('data:image/png;base64,AAA'),ref('data:image/png;base64,AAA'),ref('data:image/png;base64,BBB')]};
 const result=await limitReferencePixels(body,2);assert.equal(result.model,body.model);assert.deepEqual(result.input_references,[body.input_references[0],body.input_references[2]]);assert.equal(body.input_references.length,3);
});
test('deduplication retains text order and conversation roles',async()=>{
 const image={type:'image_url',image_url:{url:'data:image/png;base64,AAA'}},body={model:'test/chosen',messages:[{role:'user',content:[{type:'text',text:'Scene'},image,image,{type:'text',text:'Identity'}]}]};
 const result=await limitReferencePixels(body,2);assert.deepEqual(result.messages[0],{role:'user',content:[body.messages[0].content[0],image,body.messages[0].content[3]]});assert.equal(body.messages[0].content.length,4);
});
