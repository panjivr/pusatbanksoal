import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateStudioCost, priceBasis } from './openRouterCatalog.ts';
test('flat per-image price multiplies by count and retains endpoint price ranges',()=>{
 const m={priceEndpoints:[{pricing:[{billable:'output_image',unit:'image',cost_usd:.01},{billable:'input_image',unit:'image',cost_usd:0}]},{pricing:[{billable:'output_image',unit:'image',cost_usd:.02}]}]};
 const cost=estimateStudioCost(m,'image',{count:8,references:3});assert.equal(cost?.low,.08);assert.equal(cost?.high,.16);
});
test('megapixel prices are explicit assumptions, not flat per-image prices',()=>{
 const m={priceEndpoints:[{pricing:[{billable:'output_image',unit:'megapixel',cost_usd:.014}]}]};
 assert.equal(estimateStudioCost(m,'image',{count:8}),null);assert.equal(estimateStudioCost(m,'image',{count:8,outputMegapixels:1})!.low,.112);
 assert.equal(estimateStudioCost({...m,supported_parameters:{resolution:{values:['2K']}}},'image',{count:1,resolution:'2K',ratio:'1:1'})!.low,.014*2048*2048/1e6);
});
test('unknown image-token totals are never advertised as free',()=>{
 const m={priceEndpoints:[{pricing:[{billable:'output_image',unit:'token',cost_usd:.00003}]}]};assert.equal(estimateStudioCost(m,'image',{count:8}),null);assert.match(priceBasis(m),/token/);
});
test('video estimate uses selected duration, resolution, references and count',()=>{
 const m={supported_resolutions:['720p'],pricing_skus:{duration_seconds_720p:'.02',reference_duration_seconds_720p:'.03'}};
 assert.equal(estimateStudioCost(m,'video',{count:8,seconds:5,resolution:'720p'})!.low,.8);
 assert.equal(estimateStudioCost(m,'video',{seconds:10,resolution:'720p',references:1})!.low,.3);
 assert.equal(estimateStudioCost(m,'video',{resolution:'4K'}),null);
});
test('audio flat prices come from published descriptions; zero token fields do not imply free music',()=>{
 const m={description:'30 second duration clips are priced at $0.04 per clip.',pricing:{prompt:'0',completion:'0'}}; assert.equal(estimateStudioCost(m,'audio',{count:2})!.low,.08);
 assert.equal(estimateStudioCost({pricing:{prompt:'0',completion:'0'}},'audio'),null);
 const tokenEstimate=estimateStudioCost({pricing:{prompt:'.000001',audio_output:'.000002'}},'audio',{inputTokens:500,outputTokens:2000});assert.ok(Math.abs(tokenEstimate!.low-.0045)<1e-9);assert.match(tokenEstimate!.basis,/500 token masukan \+ 2000 token audio/);
});

test('explicit image-token assumptions produce a batch estimate without treating token rate as image rate',()=>{const model={priceEndpoints:[{pricing:[{billable:'input_text',unit:'token',cost_usd:.000005},{billable:'output_image',unit:'token',cost_usd:.00003}]}]};const cost=estimateStudioCost(model,'image',{count:8,inputTokens:1000,outputTokens:1000});assert.ok(Math.abs(cost!.low-.28)<1e-9);assert.match(cost!.basis,/asumsi/);});

test('Flux Flex includes input and output MP and refuses a misleading total when dimensions are unknown',()=>{const m={priceEndpoints:[{pricing:[{billable:'input_image',unit:'megapixel',cost_usd:.06},{billable:'output_image',unit:'megapixel',cost_usd:.06}]}]};assert.equal(estimateStudioCost(m,'image',{references:8}),null);assert.equal(estimateStudioCost(m,'image',{outputMegapixels:1}),null);const c=estimateStudioCost(m,'image',{referenceMegapixels:7.333333333333333,outputMegapixels:1,count:8});assert.ok(Math.abs(c!.low-4)<1e-9);assert.match(priceBasis(m),/masukan.*keluaran/);});
