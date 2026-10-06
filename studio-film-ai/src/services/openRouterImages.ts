import { prepareImagePayload, packImageReferences } from './imagePayload.ts';
import { AiRouteError, isOpenRouter, readAiRouting, getOpenRouterModels, type AiRoute, type GeminiRequest } from './aiRouting.ts';

const imageCatalogCache = new Map<typeof fetch, { expires: number; promise: Promise<any[]> }>();
export const clearOpenRouterImageCache = () => imageCatalogCache.clear();
/** Image-only models have a separate official catalogue and endpoint. Chat metadata alone is incomplete. */
export const getOpenRouterImageModels = async (route: AiRoute, fetcher: typeof fetch = fetch): Promise<any[]> => {
  let entry = imageCatalogCache.get(fetcher);
  if (!entry || entry.expires < Date.now()) {
    const promise = (async () => {
      const results = await Promise.allSettled([
        getOpenRouterModels(route, fetcher),
        (async () => {
          const response = await fetcher('https://openrouter.ai/api/v1/images/models', { signal: AbortSignal.timeout(10000), credentials: 'omit', redirect: 'error' });
          if (!response.ok) throw new Error('image catalogue');
          const body = await response.json();
          if (!Array.isArray(body.data)) throw new Error('image catalogue');
          return body.data.map((model: any) => ({ ...model, imageApi: true }));
        })(),
      ]);
      if (results.every(r => r.status === 'rejected')) throw new AiRouteError('Katalog gambar OpenRouter belum dapat dimuat. Periksa jaringan lalu coba lagi.', 503);
      const merged = new Map<string, any>();
      // Keep working multimodal chat models on chat; dedicated image-only models use /images.
      for (const result of results) if (result.status === 'fulfilled') for (const model of result.value) if (model.architecture?.output_modalities?.includes('image')) merged.set(model.id, { ...merged.get(model.id), ...model });
      return [...merged.values()];
    })();
    entry = { expires: Date.now() + 300000, promise }; imageCatalogCache.set(fetcher, entry);
    promise.catch(() => { if (imageCatalogCache.get(fetcher)?.promise === promise) imageCatalogCache.delete(fetcher); });
  }
  return entry.promise;
};
const normalizeImageModelName = (id: string) => (id.split('/').pop()?.split(':')[0] || '').replace('flux.2', 'flux-2');
export const sameOpenRouterImageSelection = (selected: string, candidate: string) => {
  const name = normalizeImageModelName(selected), target = normalizeImageModelName(candidate);
  return name.startsWith('flux-2-klein') ? target.startsWith('flux-2-klein') : name === target;
};
export const configuredOpenRouterImageRoute = (): AiRoute | undefined => readAiRouting().routes.find(r => r.enabled && isOpenRouter(r) && r.apiKey.trim());
/** Preserve Google's selected model identity, including version; do not substitute another image model. */
export const openRouterImageModelId = (nativeModel: string) => nativeModel.includes('/') ? nativeModel : `google/${nativeModel}`;
const partsOf = (value: any): any[] => typeof value === 'string' ? [{ text: value }] : Array.isArray(value) ? value.flatMap(partsOf) : value?.parts ? value.parts : [value];
export const generateOpenRouterImage = async (route: AiRoute, req: GeminiRequest, fetcher: typeof fetch = fetch): Promise<any> => {
  const controller = new AbortController(), caller = req.config?.abortSignal as AbortSignal | undefined;
  if (caller?.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError');
  const cancel = () => controller.abort(); caller?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => controller.abort(), 240000);
  let submitted = false;
  try {
    if (!isOpenRouter(route) || !route.apiKey.trim()) throw new AiRouteError('Isi dan aktifkan API key OpenRouter di Pengaturan.', undefined, true);
    const id = req.model.includes('/') ? req.model : openRouterImageModelId(req.model), models = await getOpenRouterImageModels(route, fetcher);
    if (controller.signal.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError');
    const model = models.find(m => m.id === id && m.architecture?.output_modalities?.includes('image'));
    if (!model) throw new AiRouteError('Model gambar yang dipilih belum tersedia di katalog OpenRouter. Muat katalog gambar di Pengaturan dan pilih model yang tersedia.', 404, true);
    const contents = Array.isArray(req.contents) ? req.contents : [req.contents];
    const messages = contents.map(content => ({ role: content?.role === 'model' ? 'assistant' : 'user', content: partsOf(content).map(p => {
      if (typeof p?.text === 'string') return { type: 'text', text: p.text };
      if (p?.inlineData?.data && /^image\/(png|jpeg|webp|gif)$/.test(p.inlineData.mimeType)) {
        if (!req.model.includes('/') && !model.architecture.input_modalities?.includes('image')) throw new AiRouteError('Model ini tidak menerima referensi gambar. Referensi karakter tetap dipertahankan; pilih model yang mendukungnya.', 422, true);
        return { type: 'image_url', image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` } };
      }
      throw new AiRouteError('Format masukan gambar belum didukung OpenRouter. Referensi tidak dihapus otomatis.', 422, true);
    }) }));
    const imageConfig = req.config?.imageConfig;
    let body: any = { model: id, messages, modalities: model.architecture.output_modalities.includes('text') ? ['image', 'text'] : ['image'], stream: false, provider: { allow_fallbacks: true },
      ...(imageConfig ? { image_config: { ...(imageConfig.aspectRatio ? { aspect_ratio: imageConfig.aspectRatio } : {}), ...(imageConfig.imageSize ? { image_size: imageConfig.imageSize } : {}) } } : {}) };
    if (model.imageApi) {
      const allParts = messages.flatMap(message => message.content);
      let refs = allParts.filter(part => part.type === 'image_url');
      const parameters = model.supported_parameters || {};
      const refRange = parameters.input_references;
      if (!req.model.includes('/') && refRange && (refs.length < (refRange.min || 0) || refs.length > (refRange.max ?? Infinity))) throw new AiRouteError(`Model ${id} menerima ${refRange.min || 0} sampai ${refRange.max} referensi. Semua referensi dipertahankan; sesuaikan jumlahnya.`, 422, true);
      if (refRange?.max > 0 && refs.length > refRange.max) refs = await packImageReferences(refs, refRange.max, controller.signal);
      let ratio = imageConfig?.aspectRatio;
      if (ratio && parameters.aspect_ratio?.values?.length && !parameters.aspect_ratio.values.includes(ratio)) {
        const numeric = (r: string) => {const [w,h] = r.split(':').map(Number);return w/h;};
        ratio = [...parameters.aspect_ratio.values].filter((r: string)=>Number.isFinite(numeric(r))).sort((a: string,b: string)=>Math.abs(Math.log(numeric(a)/numeric(ratio!)))-Math.abs(Math.log(numeric(b)/numeric(ratio!))))[0] || parameters.aspect_ratio.values[0];
      }
      if (!req.model.includes('/') && parameters.aspect_ratio?.values && ratio && !parameters.aspect_ratio.values.includes(ratio)) throw new AiRouteError(`Rasio ${ratio} tidak didukung ${id}. Pilih rasio yang didukung model.`, 422, true);
      const resolution = parameters.resolution?.values?.length && !parameters.resolution.values.includes(imageConfig?.imageSize) ? parameters.resolution.values[0] : imageConfig?.imageSize;
      if (!req.model.includes('/') && parameters.resolution?.values && resolution && !parameters.resolution.values.includes(resolution)) throw new AiRouteError(`Resolusi ${resolution} tidak didukung ${id}. Pilih resolusi yang didukung model.`, 422, true);
      const formats = parameters.output_format?.values;
      const outputFormat = formats ? ['png', 'jpeg', 'webp'].find(format => formats.includes(format)) : undefined;
      if (formats && !outputFormat) throw new AiRouteError('Model ini menghasilkan format vektor yang belum didukung jalur gambar studio. Pilih model gambar PNG, JPEG, atau WebP.', 422, true);
      body = { model: id, prompt: allParts.filter(part => part.type === 'text').map((part: any) => part.text).join('\n') + (refs.length < allParts.filter(part=>part.type==='image_url').length ? '\nReferensi disusun dalam panel bernomor. Gunakan seluruh panel sebagai referensi visual; hasil akhir satu gambar adegan, bukan kolase.' : ''), n: 1, stream: false, provider: { allow_fallbacks: true },
        ...(refs.length ? { input_references: refs } : {}), ...(ratio && parameters.aspect_ratio ? { aspect_ratio: ratio } : {}),
        ...(resolution && parameters.resolution ? { resolution } : {}), ...(outputFormat ? { output_format: outputFormat } : {}) };
    }
    let payload: string;
    try { payload = await prepareImagePayload(body, undefined, controller.signal); }
    catch (error) { if (controller.signal.aborted) throw error; throw new AiRouteError(error instanceof Error ? error.message : 'Referensi belum dapat disiapkan untuk OpenRouter.', undefined, true); }
    const send = async () => {
      submitted = true;
      return fetcher(model.imageApi ? 'https://openrouter.ai/api/v1/images' : 'https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${route.apiKey.trim()}`, 'HTTP-Referer': 'https://pusatbanksoal.id', 'X-Title': 'Bekal Studio Film AI' }, body: payload, signal: controller.signal, credentials: 'omit', redirect: 'error' });
    };
    let response = await send();
    // A 413 explicitly rejects the body: retry once with smaller copies, on the SAME model.
    // Never retry an accepted, ambiguous, cancelled or policy-rejected generation here.
    if (response.status === 413) {
      await response.body?.cancel();
      let smaller: string;
      try { smaller = await prepareImagePayload(body, 2 * 1024 * 1024, controller.signal); }
      catch { throw new AiRouteError('Referensi terlalu besar untuk OpenRouter dan belum dapat dipadatkan. File asli proyek tetap aman.', 413, true); }
      if (smaller !== payload) { payload = smaller; response = await send(); }
      if (response.status === 413) throw new AiRouteError('OpenRouter masih menolak ukuran referensi (HTTP 413) setelah dipadatkan. Kurangi jumlah referensi untuk shot ini; model pilihan tetap dipertahankan.', 413, true);
    }
    let data: any; try { data = await response.json(); } catch { throw new AiRouteError('Jawaban gambar belum dapat dibaca. Periksa Activity OpenRouter sebelum mengirim ulang.', response.status, true); }
    if (!response.ok || data.error) {
      const status = response.ok ? Number(data.error?.code) || 502 : response.status;
      const raw = JSON.stringify(data.error || {});
      const providerMessage = typeof data.error?.message === 'string' ? data.error.message.split(route.apiKey.trim()).join('[disamarkan]').replace(/(?:sk-[\w-]+|Bearer\s+\S+|data:[^\s]+|https?:\/\/\S+)/gi, '[disamarkan]').slice(0,300) : '';
      const detail = /safety|content.?policy|moderation|blocked/i.test(raw) ? 'Permintaan ditolak oleh kebijakan konten penyedia.' : status === 401 ? 'API key belum valid.' : status === 402 ? 'Saldo atau batas kredit tidak cukup.' : status === 429 ? 'Kuota atau batas permintaan tercapai.' : status === 403 ? 'Kunci belum mendapat akses ke model gambar.' : `Permintaan gambar gagal (HTTP ${status}).${providerMessage ? ` ${providerMessage}` : ''}`;
      // Only explicit rejection with no result is eligible for another submission.
      if (!data.choices?.length && !data.data?.length && !/safety|content.?policy|moderation|blocked/i.test(raw) && [400, 401, 402, 403, 404, 422, 429, 500, 502, 503, 504].includes(status)) throw new OpenRouterImageRejected(`OpenRouter: ${detail}`, status);
      throw new AiRouteError(`OpenRouter: ${detail} Periksa Activity sebelum mencoba lagi.`, status, true);
    }
    const choice = data.choices?.[0];
    if (choice?.finish_reason === 'content_filter') throw new AiRouteError('OpenRouter: Gambar ditolak oleh kebijakan konten penyedia.', undefined, true);
    const images = model.imageApi ? (data.data || []).map((item: any) => {
      const mime = item.media_type || 'image/png';
      return { image_url: { url: typeof item.b64_json === 'string' ? `data:${mime};base64,${item.b64_json}` : item.url } };
    }) : choice?.message?.images || [];
    const parts: any[] = [];
    for (const image of images) {
      const url = image.image_url?.url;
      if (typeof url !== 'string') continue;
      const inline = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/.exec(url);
      if (inline) { parts.push({ inlineData: { mimeType: inline[1], data: inline[2] } }); continue; }
      let remote: URL; try { remote = new URL(url); } catch { continue; }
      if (remote.protocol !== 'https:' || remote.username || remote.password) continue;
      // The generated image may be hosted on a CDN. Never send the API key there.
      const file = await fetcher(remote.href, { signal: controller.signal, credentials: 'omit', redirect: 'error' });
      const mimeType = file.headers.get('content-type')?.split(';')[0];
      if (!file.ok || !/^image\/(png|jpeg|webp|gif)$/.test(mimeType || '')) throw new AiRouteError('Hasil gambar belum dapat diunduh. Periksa Activity; permintaan tidak dikirim ulang otomatis.', undefined, true);
      const bytes = new Uint8Array(await file.arrayBuffer()); let binary = '';
      for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
      if (binary) parts.push({ inlineData: { mimeType, data: btoa(binary) } });
    }
    if (!parts.length) throw new AiRouteError('OpenRouter belum mengembalikan gambar yang dapat digunakan. Periksa Activity; tidak ada pengiriman ulang otomatis.', undefined, true);
    return { candidates: [{ content: { role: 'model', parts }, finishReason: 'STOP' }], text: typeof choice?.message?.content === 'string' ? choice.message.content : '', bekalProvider: 'openrouter', bekalModel: id, usageMetadata: { ...data.usage, totalTokenCount: data.usage?.total_tokens || 0 } };
  } catch (error) {
    if (caller?.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError');
    if (error instanceof AiRouteError) throw error;
    throw new AiRouteError(submitted ? 'Hasil gambar OpenRouter belum diterima. Periksa Activity sebelum mengirim ulang karena permintaan mungkin sudah diproses.' : 'Koneksi OpenRouter belum tersedia. Periksa jaringan dan konfigurasi API.', undefined, true);
  } finally { clearTimeout(timer); caller?.removeEventListener('abort', cancel); }
};

/** An explicit API rejection, as distinct from a lost or already accepted response. */
export class OpenRouterImageRejected extends AiRouteError {
  constructor(message: string, status: number) { super(message, status, true); }
}
export const compatibleOpenRouterImageModels = (models: any[], req: GeminiRequest): any[] => {
  const parts = (Array.isArray(req.contents) ? req.contents : [req.contents]).flatMap(partsOf);
  const referenceCount = parts.filter(p => p?.inlineData).length;
  return models.filter(m => {
    if (typeof m.id !== 'string' || !m.architecture?.output_modalities?.includes('image') || !m.architecture?.input_modalities?.includes('text') || (referenceCount && !m.architecture.input_modalities.includes('image'))) return false;
    if (!m.imageApi) return true;
    const parameters = m.supported_parameters || {}, range = parameters.input_references;
    if (range && (referenceCount < (range.min || 0) || referenceCount > (range.max ?? Infinity))) return false;
    if (parameters.output_format?.values && !parameters.output_format.values.some((format: string) => ['png', 'jpeg', 'webp'].includes(format))) return false;
    const config = req.config?.imageConfig;
    return !(config?.aspectRatio && parameters.aspect_ratio?.values && !parameters.aspect_ratio.values.includes(config.aspectRatio)) && !(config?.imageSize && parameters.resolution?.values && !parameters.resolution.values.includes(config.imageSize));
  });
};
/** Route only through compatible OpenRouter models; never invoke a direct provider. */
export const generateRoutedOpenRouterImage = async (req: GeminiRequest, direct?: () => Promise<any>, fetcher: typeof fetch = fetch, announce?: (model: string, status: string) => void, directLabel = 'Gemini (API langsung)'): Promise<any> => {
  const config = readAiRouting();
  const routes = config.routes.filter(r => r.enabled && isOpenRouter(r) && r.apiKey.trim());
  let last: unknown = new AiRouteError('Belum ada model gambar OpenRouter yang kompatibel dengan masukan ini.', 422, true);
  const seenKeys = new Set<string>();
  for (const route of routes) {
    if (seenKeys.has(route.apiKey.trim())) continue;
    seenKeys.add(route.apiKey.trim());
    let models: any[];
    try { const catalog = await getOpenRouterImageModels(route, fetcher); models = req.model.includes('/') ? catalog : compatibleOpenRouterImageModels(catalog, req); }
    catch (error) { last = error; if (!config.fallback) throw error; continue; }
    const explicitProviderModel = req.model.includes('/');
    const selectedName = req.model.split('/').pop()?.split(':')[0] || '';
    if (explicitProviderModel) {
      const exact = models.find(m => m.id === req.model);
      models = exact ? [exact] : models.filter(m => sameOpenRouterImageSelection(req.model, m.id));
      if (!models.length) last = new AiRouteError(`Model ${selectedName} yang dipilih tidak tersedia di OpenRouter untuk masukan ini. Referensi, rasio, atau resolusi harus sesuai kemampuan model. Model tidak diganti ke Gemini. Pilih model lain dari katalog OpenRouter secara manual.`, 422, true);
    }
    const preferred = explicitProviderModel ? req.model : config.openRouterImageModel && config.openRouterImageModel !== 'auto' ? config.openRouterImageModel : openRouterImageModelId(req.model);
    models.sort((a, b) => Number(b.id === preferred) - Number(a.id === preferred) || a.id.localeCompare(b.id));
    if (!config.fallback) models = (explicitProviderModel ? models : models.filter(m => m.id === preferred)).slice(0, 1);
    for (const model of models) {
      if (req.config?.abortSignal?.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError');
      announce?.(model.id, 'trying');
      try {
        const result = await generateOpenRouterImage(route, { ...req, model: model.id }, fetcher);
        announce?.(model.id, 'success');
        return result;
      } catch (error) {
        last = error;
        if (explicitProviderModel || !(error instanceof OpenRouterImageRejected) || !config.fallback) { announce?.(model.id, 'failed'); throw error; }
        announce?.(model.id, 'fallback');
        // Account/key-wide rejection: trying another model cannot replenish credit.
        if (error.status === 401 || error.status === 402) break;
      }
    }
  }
  announce?.('OpenRouter (gambar)', 'failed');
  throw last;
};
