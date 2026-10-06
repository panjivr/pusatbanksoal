import { videoRequestKey, readVideoJob, writeVideoJob, validVideoJobId } from './openRouterJobs.ts';
import { audioRequest, readOpenRouterAudioStream, type StudioAudioOptions } from './openRouterAudio.ts';
import { trackTask } from './taskCenter.ts';
import type { MediaItem } from '../types';
import { configuredOpenRouterImageRoute, generateRoutedOpenRouterImage } from './openRouterImages.ts';
import { loadStudioCatalog, studioSelectedModel } from './openRouterCatalog.ts';
import { AiRouteError } from './aiRouting.ts';
type ImageRef = { base64: string; mimeType: string };
const auth = () => { const route = configuredOpenRouterImageRoute(); if (!route) throw new AiRouteError('Isi API key OpenRouter dan aktifkan di Pengaturan.', undefined, true); return { Authorization: `Bearer ${route.apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://pusatbanksoal.id', 'X-Title': 'Bekal Studio Film AI' }; };
const item = (type: 'image' | 'video' | 'audio', url: string, model: string): MediaItem => ({ id: `openrouter-${crypto.randomUUID()}`, name: `${model.split('/').pop()}-${type}`, type, url, source:'generated' });
const generateStudioImageInner = async (model: string, prompt: string, refs: ImageRef[] = [], ratio = '1:1', resolution = '1K', signal?: AbortSignal): Promise<MediaItem> => {
  if (!model.includes('/')) throw new Error('Pilih model gambar dari katalog OpenRouter sebelum generate.');
  const result = await generateRoutedOpenRouterImage({ model, contents: [{ parts: [{ text:prompt }, ...refs.map(r => ({ inlineData:{ data:r.base64, mimeType:r.mimeType } }))] }], config:{ abortSignal:signal, responseModalities:['IMAGE'], imageConfig:{ aspectRatio:ratio, imageSize:resolution } } });
  const part = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
  if (!part) throw new Error('OpenRouter tidak mengembalikan gambar. Periksa Activity sebelum mencoba ulang.');
  return { ...item('image', `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, result.bekalModel || model), generatedBy: result.bekalModel || model, aiGeneration:{selectedModel:model,model:result.bekalModel || model,provider:'openrouter',...(typeof result.usageMetadata?.cost === 'number' ? {cost:result.usageMetadata.cost} : {}),totalTokens:result.usageMetadata?.totalTokenCount} };
};
const validate = async (response: Response) => { let data; try { data = await response.json(); } catch { throw new AiRouteError('Jawaban OpenRouter belum dapat dibaca. Periksa Activity sebelum mencoba ulang.', undefined, true); }
  if (!response.ok || data.error) throw new AiRouteError(`OpenRouter: permintaan belum berhasil (HTTP ${response.ok ? Number(data.error?.code) || 502 : response.status}). Periksa saldo, izin model, dan Activity.`, response.ok ? Number(data.error?.code) || 502 : response.status, true); return data; };
const generateStudioVideoInner = async (model: string, prompt: string, opts: { ratio?: string; resolution?: string; seconds?: number; start?: ImageRef; end?: ImageRef; sourceVideo?: ImageRef; upscaleFactor?: number; refs?: ImageRef[]; onProgress?: (s:string) => void; signal?: AbortSignal } = {}): Promise<MediaItem> => {
  const metadata = (await loadStudioCatalog('video')).find(m => m.id === model); if (!metadata) throw new Error('Pilih model video yang tersedia di katalog OpenRouter.');
  const resolution = opts.resolution || metadata.supported_resolutions?.[0], ratio = opts.ratio || '16:9', duration = opts.seconds || 8;
  if (metadata.supported_resolutions?.length && !metadata.supported_resolutions.includes(resolution)) throw new Error(`Model ini mendukung resolusi ${metadata.supported_resolutions.join(', ')}. Sesuaikan pilihan video.`);
  if (metadata.supported_aspect_ratios?.length && !metadata.supported_aspect_ratios.includes(ratio)) throw new Error(`Rasio ${ratio} belum didukung model ini.`);
  if (metadata.supported_durations?.length && !metadata.supported_durations.includes(duration)) throw new Error(`Durasi didukung: ${metadata.supported_durations.join(', ')} detik. Pilih durasi yang tersedia.`);
  const frame_images = [['first_frame',opts.start],['last_frame',opts.end]].filter(([,ref]) => ref).map(([frame_type,ref]) => {
    if (!metadata.supported_frame_images?.includes(frame_type)) throw new Error(`Model ini belum menerima ${frame_type}. Referensi tetap dipertahankan; pilih model lain.`);
    const r = ref as ImageRef; return { type:'image_url', frame_type, image_url:{ url:`data:${r.mimeType};base64,${r.base64}` } };
  });
  // Unknown support must not silently discard continuity references.
  if (opts.refs?.length) throw new Error('Referensi tambahan video belum diverifikasi untuk model ini. Gunakan bingkai awal/akhir atau gambar papan adegan yang sudah menggabungkan referensi.');
  const source = opts.sourceVideo;
  if (metadata.upscale_factor && !source) throw new Error('Pilih video sumber untuk meningkatkan resolusi.');
  if (source && !metadata.upscale_factor) throw new Error('Model ini belum diverifikasi untuk peningkatan resolusi video.');
  const upscale_factor = opts.upscaleFactor || 2;
  if (source && (upscale_factor < metadata.upscale_factor.min || upscale_factor > metadata.upscale_factor.max)) throw new Error(`Faktor resolusi didukung: ${metadata.upscale_factor.min} sampai ${metadata.upscale_factor.max} kali.`);
  const headers = auth(), controller = new AbortController(), timer = setTimeout(() => controller.abort(), 900000);
  const callerCancel = () => controller.abort();
  if (opts.signal?.aborted) { clearTimeout(timer); throw new DOMException('Dibatalkan','AbortError'); }
  opts.signal?.addEventListener('abort',callerCancel,{once:true});
  try {
    opts.onProgress?.(`Mengirim video ke ${model}...`);
    const body = source ? { model,prompt,upscale_factor,input_references:[{type:'video_url',video_url:{url:`data:${source.mimeType};base64,${source.base64}`}}] } : { model,prompt,aspect_ratio:ratio,resolution,duration,...(frame_images.length ? { frame_images } : {}) };
    const key = videoRequestKey(body), previous = readVideoJob(key);
    let job: any;
    if (previous) {
      if (!previous.id) throw new AiRouteError('Pengiriman video sebelumnya belum dapat dipastikan. Periksa Activity OpenRouter; video baru tidak dikirim otomatis.', undefined, true);
      opts.onProgress?.(`Melanjutkan pekerjaan video ${previous.id}, tanpa generate baru.`);
      job = await validate(await fetch(`https://openrouter.ai/api/v1/videos/${encodeURIComponent(previous.id)}`, { headers, signal:controller.signal, credentials:'omit', redirect:'error' }));
      job.id = previous.id;
    } else {
      // Persist uncertainty before POST. Network loss must not create a second paid job.
      writeVideoJob(key, { model,status:'submitting',updatedAt:Date.now() });
      const response = await fetch('https://openrouter.ai/api/v1/videos', { method:'POST', headers, body:JSON.stringify(body), signal:controller.signal, credentials:'omit', redirect:'error' });
      try { job = await validate(response); } catch (error) { if (!response.ok && [400,401,402,403,404,422,429].includes(response.status)) localStorage.removeItem(key); throw error; }
      if (!validVideoJobId(job.id)) throw new AiRouteError('ID pekerjaan video tidak valid. Periksa Activity sebelum mencoba ulang.', undefined, true);
      writeVideoJob(key, { id:job.id,model,status:job.status || 'queued',updatedAt:Date.now() });
    }
    const jobId = job.id;
    while (!['completed','failed','cancelled','expired'].includes(job.status)) {
      opts.onProgress?.(`Video sedang diproses oleh ${model}.`);
      await new Promise<void>((resolve,reject) => { const stop = () => { clearTimeout(t); reject(new DOMException('Dibatalkan','AbortError')); }; const t = setTimeout(() => { controller.signal.removeEventListener('abort',stop); resolve(); },3000); controller.signal.addEventListener('abort',stop,{once:true}); });
      job = await validate(await fetch(`https://openrouter.ai/api/v1/videos/${encodeURIComponent(jobId)}`, { headers, signal:controller.signal, credentials:'omit', redirect:'error' }));
    }
    if (job.status !== 'completed') { localStorage.removeItem(key); throw new AiRouteError(`Video ${job.status}. Periksa Activity; gunakan generate ulang jika diperlukan.`, undefined, true); }
    // Fetch bytes through the official authenticated content endpoint. Never forward the key to a CDN.
    const content = await fetch(`https://openrouter.ai/api/v1/videos/${encodeURIComponent(jobId)}/content`, { headers:{ Authorization:headers.Authorization }, signal:controller.signal, credentials:'omit', redirect:'error' });
    if (!content.ok) throw new AiRouteError('Video selesai, tetapi unduhan belum berhasil. Periksa Activity sebelum membuat video baru.', content.status, true);
    const blob = await content.blob();
    if (!blob.size) throw new AiRouteError('Video selesai tetapi berkas kosong. Pekerjaan tersimpan untuk melanjutkan unduhan.', undefined, true);
    const result = { ...item('video', URL.createObjectURL(blob), model), generatedBy:model, aiGeneration:{selectedModel:model,model:job.model || model,provider:'openrouter',jobId,...(typeof job.usage?.cost === 'number' ? {cost:job.usage.cost} : {})}, ...(metadata.upscale_factor ? {} : { duration }) };
    localStorage.removeItem(key);
    return result;
  } catch (error) { if (error instanceof TypeError || controller.signal.aborted) throw new AiRouteError('Koneksi atau waktu tunggu video berakhir. Pekerjaan mungkin masih diproses. Periksa Activity sebelum generate ulang.', undefined, true); throw error; }
  finally { clearTimeout(timer); opts.signal?.removeEventListener('abort',callerCancel); }
};
const generateStudioAudioInner = async (model: string, prompt: string, options: StudioAudioOptions = {}): Promise<MediaItem> => {
  const metadata = (await loadStudioCatalog('audio')).find(m => m.id === model); if (!metadata) throw new Error('Pilih model audio dari katalog OpenRouter.');
  const request = audioRequest(metadata, prompt, {...options,voice:options.voice || localStorage.getItem(`bekal-openrouter-voice:${model}`) || undefined});
  const signal = options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(240000)]) : AbortSignal.timeout(240000);
  const response = await fetch('https://openrouter.ai/api/v1' + request.path, { method:'POST', headers:auth(), body:JSON.stringify(request.body), credentials:'omit', redirect:'error', signal });
  if (!response.ok) await validate(response);
  if (request.path === '/audio/speech') {
    const mime = response.headers.get('content-type') || '';
    if (!mime.startsWith('audio/') && !mime.startsWith('application/octet-stream')) throw new AiRouteError('Jawaban TTS bukan audio. Periksa Activity sebelum mencoba ulang.', undefined, true);
    const bytes = await response.blob();
    if (!bytes.size) throw new AiRouteError('Hasil TTS kosong. Periksa Activity sebelum mencoba ulang.', undefined, true);
    return { ...item('audio', URL.createObjectURL(bytes), model), generatedBy:model, aiGeneration:{selectedModel:model,model,provider:'openrouter'} };
  }
  const audio = await readOpenRouterAudioStream(response, signal);
  const mime = {mp3:'mpeg',pcm16:'pcm',opus:'ogg'}[request.format] || request.format;
  return { ...item('audio', `data:audio/${mime};base64,${audio.data}`, audio.model || model), generatedBy:audio.model || model, aiGeneration:{selectedModel:model,model:audio.model || model,provider:'openrouter',...(typeof audio.usage?.cost === 'number' ? {cost:audio.usage.cost} : {}),totalTokens:audio.usage?.total_tokens} };
};
export { studioSelectedModel };

export const generateStudioImage = async (...args: Parameters<typeof generateStudioImageInner>): Promise<MediaItem> => {
  const [model,,refs = [],ratio = '1:1',resolution = '1K'] = args;
  if (!(await loadStudioCatalog('image')).some(m => m.id === model)) throw new Error('Pilih model gambar dari katalog OpenRouter.');
  const controller = new AbortController();
  const signal = args[5] ? AbortSignal.any([args[5],controller.signal]) : controller.signal;
  return trackTask({label:model,kind:'image',provider:'openrouter',estimatedMs:45000,message:'Memproses melalui OpenRouter...',cancel:()=>controller.abort()},()=>generateStudioImageInner(model,args[1],refs,ratio,resolution,signal));
};
const runningVideoRequests = new Set<string>();
export const generateStudioVideo = async (...args: Parameters<typeof generateStudioVideoInner>): Promise<MediaItem> => {
  const key = videoRequestKey([args[0],args[1], {...args[2],onProgress:undefined,signal:undefined}]);
  if (runningVideoRequests.has(key)) throw new Error('Video ini sedang diproses. Tunggu pekerjaan yang sedang berjalan.');
  runningVideoRequests.add(key); const controller = new AbortController();
  try { return await trackTask({label:args[0],kind:'video',provider:'openrouter',estimatedMs:90000,message:'Memproses melalui OpenRouter...',cancel:()=>controller.abort()}, () => generateStudioVideoInner(args[0],args[1],{...args[2],signal:args[2]?.signal ? AbortSignal.any([args[2].signal,controller.signal]) : controller.signal})); }
  finally { runningVideoRequests.delete(key); }
};
export const generateStudioAudio = (...args: Parameters<typeof generateStudioAudioInner>): Promise<MediaItem> => {
  const controller = new AbortController();
  return trackTask({label:args[0],kind:'audio',provider:'openrouter',estimatedMs:45000,message:'Memproses melalui OpenRouter...',cancel:()=>controller.abort()}, () => generateStudioAudioInner(args[0],args[1],{...args[2],signal:args[2]?.signal ? AbortSignal.any([args[2].signal,controller.signal]) : controller.signal}));
};
