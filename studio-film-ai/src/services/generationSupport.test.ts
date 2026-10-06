import test from 'node:test';
import assert from 'node:assert/strict';
import { modelHasCredentials, generationTimeoutSeconds, isNativeMediaRequest, safeGenerationError, prepareGoogleMediaDownload, isBlockedGenerationResponse } from './generationSupport.ts';

test('auto selection cannot use an image provider whose key is absent', () => {
  const googleOnly = { gemini: true, googleProvider: 'gemini' };
  for (const model of ['nano', 'gemini-pro', 'gemini-flash', 'imagen']) assert.equal(modelHasCredentials(model, googleOnly, 'image'), true);
  for (const model of ['nano-banana-2-fal', 'seedream-v5-pro-fal', 'gpt-image-2-fal-edit', 'krea-2-large-fal', 'flux', 'soul-2-hf', 'grok-image']) assert.equal(modelHasCredentials(model, googleOnly, 'image'), false);
  assert.equal(modelHasCredentials('gpt-image-2-fal-edit', { fal: true }, 'image'), true);
  assert.equal(modelHasCredentials('nano', { replicate: true, googleProvider: 'replicate' }, 'image'), true);
  assert.equal(modelHasCredentials('imagen', { replicate: true, googleProvider: 'replicate' }, 'image'), false);
  assert.equal(modelHasCredentials('nano', { gemini: true, googleProvider: 'replicate' }, 'image'), false);
});
test('video selection respects native providers and only hosted Higgsfield models', () => {
  for (const model of ['veo', 'veo-fast', 'veo-3.1-generate-preview']) assert.equal(modelHasCredentials(model, { gemini: true }, 'video'), true);
  assert.equal(modelHasCredentials('seedance-2.5-i2v-fal', { gemini: true }, 'video'), false);
  assert.equal(modelHasCredentials('seedance-2.5-i2v-fal', { higgsfield: true }, 'video', true), true);
  assert.equal(modelHasCredentials('seedance-2.5-i2v-fal', { higgsfield: true }, 'video', false), false);
  assert.equal(modelHasCredentials('grok-video', { xai: true }, 'video'), true);
  assert.equal(modelHasCredentials('auto', { gemini: true, fal: true }, 'video'), false);
});
test('native image, audio and video calls have a separate budget from text', () => {
  assert.equal(generationTimeoutSeconds({ model: 'gemini-3.1-pro-preview' }, 10), 10);
  for (const model of ['gemini-3.1-flash-image-preview', 'imagen-4.0-generate-001', 'gemini-2.5-flash-preview-tts', 'veo-3.1-generate-preview']) {
    assert.equal(generationTimeoutSeconds({ model }, 45), 180);
    assert.equal(isNativeMediaRequest({ model }), true);
  }
  assert.equal(isNativeMediaRequest({ model: 'gemini-flash', config: { responseModalities: ['IMAGE'] } }), true);
  assert.equal(isNativeMediaRequest({ model: 'gemini-flash', config: { responseModalities: ['TEXT'] } }), false);
});
test('generation errors explain access, quota, formats and policy without exposing raw data', () => {
  for (const status of [400,401,403,404,429,503]) {
    const error = new Error(`raw secret-test-key prompt-test ${status}`);
    const safe = safeGenerationError(error);
    assert.equal(safe.status, status);
    assert.ok(!safe.message.includes('secret-test-key') && !safe.message.includes('prompt-test'));
  }
  assert.match(safeGenerationError(new Error('403 PERMISSION_DENIED')).message, /akses/);
  assert.equal(safeGenerationError(new Error('400 blocked by safety')).blocked, true);
  assert.match(safeGenerationError(new TypeError('Failed to fetch secret-test-key')).message, /CORS/);
});


test('Veo result download handles URLs with or without queries and never leaks the key to media hosts', () => {
  for (const uri of ['https://generativelanguage.googleapis.com/v1beta/files/video:download', 'https://generativelanguage.googleapis.com/v1beta/files/video:download?alt=media&key=stale']) {
    const result = prepareGoogleMediaDownload(uri, 'fake-key');
    assert.equal(result.headers['x-goog-api-key'], 'fake-key');
    assert.equal(new URL(result.url).searchParams.has('key'), false);
    assert.ok(!result.url.includes('fake-key'));
  }
  const cdn = 'https://storage.googleapis.com/video.mp4?signature=preserved';
  assert.deepEqual(prepareGoogleMediaDownload(cdn, 'fake-key'), { url: cdn, headers: {} });
  for (const uri of ['http://provider.example/video.mp4','javascript:alert(1)','https://user:pass@provider.example/video.mp4']) assert.throws(()=>prepareGoogleMediaDownload(uri,'fake-key'));
});


test('successful HTTP responses with safety rejection remain terminal instead of regenerating without references', () => {
  assert.equal(isBlockedGenerationResponse({ promptFeedback: { blockReason: 'SAFETY' } }), true);
  assert.equal(isBlockedGenerationResponse({ candidates: [{ finishReason: 'IMAGE_SAFETY' }] }), true);
  assert.equal(isBlockedGenerationResponse({ candidates: [{ finishReason: 'STOP' }] }), false);
  assert.equal(isBlockedGenerationResponse({ promptFeedback: { blockReason: 'BLOCK_REASON_UNSPECIFIED' } }), false);
  assert.equal(isBlockedGenerationResponse({ name: 'operations/test-video', done: true }), false);
});
