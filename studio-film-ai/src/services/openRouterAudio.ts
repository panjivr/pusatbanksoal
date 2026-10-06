/** Audio chat uses SSE deltas; speech models use the binary TTS endpoint. */
export type StudioAudioOptions = { voice?: string; format?: string; operation?: 'voice' | 'music' | 'sfx'; signal?: AbortSignal };
export const audioRequest = (model: any, prompt: string, options: StudioAudioOptions = {}) => {
  const speech = model.architecture?.output_modalities?.includes('speech');
  const operation = options.operation || 'voice';
  const music = /music|song|sound effects|sound design/i.test(model.description || '');
  if ((operation === 'music' && !/music|song/i.test(model.description || '')) || (operation === 'sfx' && !/sound effects|sound design|sfx/i.test(model.description || ''))) throw new Error('Model ini belum menyatakan dukungan musik atau efek suara. Pilih model audio yang sesuai.');
  if (operation === 'voice' && music) throw new Error('Model musik tidak dapat dipakai untuk narasi. Pilih model suara dari katalog OpenRouter.');
  const voices = model.supported_voices;
  const voice = options.voice || voices?.find((v: string) => v.startsWith('id-ID')) || voices?.[0] || 'alloy';
  if (voices?.length && !voices.includes(voice)) throw new Error('Suara pilihan tidak didukung model ini. Pilih suara yang tersedia untuk model OpenRouter.');
  const format = options.format || 'wav';
  if (!['wav','mp3','opus','flac','pcm16'].includes(format)) throw new Error('Format audio belum didukung. Pilih WAV, MP3, Opus, FLAC, atau PCM16.');
  return { path: speech ? '/audio/speech' : '/chat/completions', format, body: speech ? { model:model.id, input:prompt, voice, response_format:format } : { model:model.id, messages:[{role:'user',content:prompt}], modalities:['text','audio'], ...(!music ? {audio:{voice,format}} : {}), stream:true } };
};
export const readOpenRouterAudioStream = async (response: Response, signal?: AbortSignal): Promise<{data:string;usage?:any;model?:string}> => {
  if (!response.body) throw new Error('Aliran audio kosong. Periksa Activity sebelum mencoba ulang.');
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let pending = '', encoded = '', usage: any, model: string | undefined, done = false;
  const consume = (block: string) => {
    const raw = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
    if (!raw) return;
    if (raw === '[DONE]') { done = true; return; }
    let chunk: any;
    try { chunk = JSON.parse(raw); } catch { throw new Error('Aliran audio tidak lengkap. Periksa Activity sebelum mencoba ulang.'); }
    if (chunk.error) throw new Error('Penyedia menolak audio. Periksa Activity; permintaan tidak diulang otomatis.');
    if (chunk.choices?.[0]?.finish_reason === 'content_filter') throw new Error('Audio ditolak kebijakan konten penyedia.');
    const data = chunk.choices?.[0]?.delta?.audio?.data;
    if (typeof data === 'string') encoded += data;
    if (chunk.usage) usage = chunk.usage;
    if (chunk.model) model = chunk.model;
  };
  const abort = () => { void reader.cancel(); };
  signal?.addEventListener('abort', abort, {once:true});
  try {
    while (true) {
      if (signal?.aborted) throw new DOMException('Dibatalkan','AbortError');
      const part = await reader.read();
      pending += part.done ? decoder.decode() : decoder.decode(part.value,{stream:true});
      pending = pending.replace(/\r\n/g,'\n');
      let index: number;
      while ((index = pending.indexOf('\n\n')) >= 0) { consume(pending.slice(0,index)); pending = pending.slice(index+2); }
      if (part.done) break;
    }
    if (pending.trim()) consume(pending);
    if (signal?.aborted) throw new DOMException('Dibatalkan','AbortError');
    if (!done || !encoded) throw new Error('Audio belum lengkap. Periksa Activity sebelum mencoba ulang.');
    return {data:encoded,usage,model};
  } finally { signal?.removeEventListener('abort',abort); reader.releaseLock(); }
};
