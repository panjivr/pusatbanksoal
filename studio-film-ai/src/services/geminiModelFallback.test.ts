import test from 'node:test';
import assert from 'node:assert/strict';

import { isModelNotFoundError, pickFallbackModel, withModelFallback } from './geminiModelFallback.ts';

test('recognises the API "model not found" error', () => {
  assert.equal(isModelNotFoundError(new Error('{"error":{"code":404,"message":"models/gemini-3.1-flash-preview is not found for API version v1beta, or is not supported for generateContent."}}')), true);
  assert.equal(isModelNotFoundError(new Error('429 RESOURCE_EXHAUSTED')), false);
});

test('picks the next listed model of the same family', () => {
  const available = new Set(['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-image']);
  assert.equal(pickFallbackModel('gemini-3.1-flash-preview', available), 'gemini-2.5-flash');
  assert.equal(pickFallbackModel('gemini-3.1-pro-preview', available), 'gemini-2.5-pro');
  assert.equal(pickFallbackModel('gemini-3.1-flash-image-preview', available), 'gemini-2.5-flash-image');
});

test('falls back to the chain when the list is unknown, and never to the same model', () => {
  assert.equal(pickFallbackModel('gemini-3.1-flash-preview', null), 'gemini-3-flash-preview');
  assert.equal(pickFallbackModel('unknown-model', null), null);
  assert.equal(pickFallbackModel('gemini-3.1-flash-preview', new Set(['gemini-3.1-flash-preview'])), null);
});


test('image fallback removes unsupported size on first and cached calls without mutating the caller', async () => {
  const calls: any[] = [];
  const ai: any = { models: {
    generateContent: async (params: any) => {
      calls.push(params);
      if (params.model === 'gemini-3.1-flash-image-preview') throw new Error('404 model not found');
      return { image: true };
    },
    list: async () => ({ async *[Symbol.asyncIterator]() { yield { name: 'models/gemini-2.5-flash-image', supportedActions: ['generateContent'] }; } }),
  }};
  const request = { model: 'gemini-3.1-flash-image-preview', contents: [{ parts: [{ inlineData: { data: 'reference', mimeType: 'image/png' } }] }], config: { responseModalities: ['TEXT','IMAGE'], imageConfig: { imageSize: '1K', aspectRatio: '9:16' } } };
  const client = withModelFallback(ai);
  await client.models.generateContent(request);
  await client.models.generateContent(request);
  assert.equal(calls.length, 3);
  for (const call of calls.slice(1)) {
    assert.equal(call.model, 'gemini-2.5-flash-image');
    assert.equal(call.config.imageConfig.imageSize, undefined);
    assert.equal(call.config.imageConfig.aspectRatio, '9:16');
    assert.equal(call.contents, request.contents);
  }
  assert.equal(request.config.imageConfig.imageSize, '1K');
});

test('model fallback does not substitute a different engine for an access or policy rejection', async () => {
  for (const message of ['403 PERMISSION_DENIED', '400 content blocked by policy']) {
    let listed = false, called = 0;
    const ai: any = { models: { generateContent: async () => { called++; throw new Error(message); }, list: async () => { listed = true; } } };
    await assert.rejects(withModelFallback(ai).models.generateContent({ model: 'gemini-3-pro-image-preview', contents: 'test' }));
    assert.equal(called, 1); assert.equal(listed, false);
  }
});
