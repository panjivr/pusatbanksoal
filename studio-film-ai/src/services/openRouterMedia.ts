import { trackTask } from './taskCenter.ts';
import type { MediaItem } from '../types';
import { configuredOpenRouterImageRoute, generateRoutedOpenRouterImage } from './openRouterImages.ts';
import { loadStudioCatalog, studioSelectedModel } from './openRouterCatalog.ts';
import { AiRouteError } from './aiRouting.ts';
type ImageRef = { base64: string; mimeType: string };
const auth = () => { const route = configuredOpenRouterImageRoute(); if (!route) throw new AiRouteError('Isi API key OpenRouter dan aktifkan di Pengaturan.', undefined, true); return { Authorization: `Bearer ${route.apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://pusatbanksoal.id', 'X-Title': 'Bekal Studio Film AI' }; };
const item = (type: 'image' | 'video' | 'audio', url: string, model: string): MediaItem => ({ id: `openrouter-${crypto.randomUUID()}`, name: `${model.split('/').pop()}-${type}`, type, url, source:'generated' });
const generateStudioImageInner = async (model: string, prompt: string, refs: ImageRef[] = [], ratio = '1:1', resolution = '1K'): Promise<MediaItem> => {
  if (!model.includes('/')) throw new Error('Pilih model gambar dari katalog OpenRouter sebelum generate.');
  const result = await generateRoutedOpenRouterImage({ model, contents: [{ parts: [{ text:prompt }, ...refs.map(r => ({ inlineData:{ data:r.base64, mimeType:r.mimeType } }))] }], config:{ responseModalities:['IMAGE'], imageConfig:{ aspectRatio:ratio, imageSize:resolution } } });
  const part = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
  if (!part) throw new Error('OpenRouter tidak mengembalikan gambar. Periksa Activity sebelum mencoba ulang.');
  return item('image', `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, result.bekalModel || model);
};
const validate = async (response: Response) => { let data; try { data = await response.json(); } catch { throw new AiRouteError('Jawaban OpenRouter belum dapat dibaca. Periksa Activity sebelum mencoba ulang.', undefined, true); }
  if (!response.ok || data.error) throw new AiRouteError(`OpenRouter: permintaan belum berhasil (HTTP ${response.status}). Periksa saldo, izin model, dan Activity.`, response.status, true); return data; };
const generateStudioVideoInner = async (model: string, prompt: string, opts: { ratio?: string; resolution?: string; seconds?: number; start?: ImageRef; end?: ImageRef; sourceVideo?: ImageRef; upscaleFactor?: number; refs?: ImageRef[]; onProgress?: (s:string) => void } = {}): Promise<MediaItem> => {
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
  try {
    opts.onProgress?.(`Mengirim video ke ${model}...`);
    let job = await validate(await fetch('https://openrouter.ai/api/v1/videos', { method:'POST', headers, body:JSON.stringify(source ? { model,prompt,upscale_factor,input_references:[{type:'video_url',video_url:{url:`data:${source.mimeType};base64,${source.base64}`}}] } : { model,prompt,aspect_ratio:ratio,resolution,duration,...(frame_images.length ? { frame_images } : {}) }), signal:controller.signal, credentials:'omit', redirect:'error' }));
    if (typeof job.id !== 'string' || !/^gen-vid-[\w-]+$/.test(job.id)) throw new AiRouteError('ID pekerjaan video tidak valid. Periksa Activity sebelum mencoba ulang.', undefined, true);
    const jobId = job.id;
    while (!['completed','failed','cancelled','expired'].includes(job.status)) {
      opts.onProgress?.(`Video sedang diproses oleh ${model}.`);
      await new Promise<void>((resolve,reject) => { const stop = () => { clearTimeout(t); reject(new DOMException('Dibatalkan','AbortError')); }; const t = setTimeout(() => { controller.signal.removeEventListener('abort',stop); resolve(); },3000); controller.signal.addEventListener('abort',stop,{once:true}); });
      job = await validate(await fetch(`https://openrouter.ai/api/v1/videos/${encodeURIComponent(jobId)}`, { headers, signal:controller.signal, credentials:'omit', redirect:'error' }));
    }
    if (job.status !== 'completed') throw new AiRouteError(`Video ${job.status}. Periksa Activity; gunakan generate ulang jika diperlukan.`, undefined, true);
    // Fetch bytes through the official authenticated content endpoint. Never forward the key to a CDN.
    const content = await fetch(`https://openrouter.ai/api/v1/videos/${encodeURIComponent(jobId)}/content`, { headers:{ Authorization:headers.Authorization }, signal:controller.signal, credentials:'omit', redirect:'error' });
    if (!content.ok) throw new AiRouteError('Video selesai, tetapi unduhan belum berhasil. Periksa Activity sebelum membuat video baru.', content.status, true);
    return { ...item('video', URL.createObjectURL(await content.blob()), model), ...(metadata.upscale_factor ? {} : { duration }) };
  } catch (error) { if (error instanceof TypeError || controller.signal.aborted) throw new AiRouteError('Koneksi atau waktu tunggu video berakhir. Pekerjaan mungkin masih diproses. Periksa Activity sebelum generate ulang.', undefined, true); throw error; }
  finally { clearTimeout(timer); }
};
const generateStudioAudioInner = async (model: string, prompt: string): Promise<MediaItem> => {
  const metadata = (await loadStudioCatalog('audio')).find(m => m.id === model); if (!metadata) throw new Error('Pilih model audio dari katalog OpenRouter.');
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', { method:'POST', headers:auth(), body:JSON.stringify({ model, messages:[{role:'user',content:prompt}], modalities:['text','audio'], audio:{ voice:'alloy',format:'wav' }, stream:false }), credentials:'omit', redirect:'error', signal:AbortSignal.timeout(240000) });
  const data = await validate(response), audio = data.choices?.[0]?.message?.audio;
  if (!audio?.data) throw new AiRouteError('Model tidak mengembalikan audio. Periksa Activity sebelum mengirim ulang.', undefined, true);
  return item('audio', `data:audio/wav;base64,${audio.data}`, model);
};
export { studioSelectedModel };

export const generateStudioImage = (...args: Parameters<typeof generateStudioImageInner>): Promise<MediaItem> => trackTask({label:args[0],kind:'image',provider:'openrouter',estimatedMs:45000,message:'Memproses melalui OpenRouter...'}, () => generateStudioImageInner(...args));
export const generateStudioVideo = (...args: Parameters<typeof generateStudioVideoInner>): Promise<MediaItem> => trackTask({label:args[0],kind:'video',provider:'openrouter',estimatedMs:90000,message:'Memproses melalui OpenRouter...'}, () => generateStudioVideoInner(...args));
export const generateStudioAudio = (...args: Parameters<typeof generateStudioAudioInner>): Promise<MediaItem> => trackTask({label:args[0],kind:'audio',provider:'openrouter',estimatedMs:45000,message:'Memproses melalui OpenRouter...'}, () => generateStudioAudioInner(...args));
