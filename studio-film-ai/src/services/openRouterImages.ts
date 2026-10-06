import { AiRouteError, isOpenRouter, readAiRouting, getOpenRouterModels, type AiRoute, type GeminiRequest } from './aiRouting.ts';

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
    const id = req.model.includes('/') ? req.model : openRouterImageModelId(req.model), models = await getOpenRouterModels(route, fetcher);
    if (controller.signal.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError');
    const model = models.find(m => m.id === id && m.architecture?.output_modalities?.includes('image'));
    if (!model) throw new AiRouteError('Model gambar yang dipilih belum tersedia di katalog OpenRouter. Pilih Nano Banana 2 atau Gemini 3 Pro Image yang tersedia, atau gunakan API Gemini.', 404, true);
    const contents = Array.isArray(req.contents) ? req.contents : [req.contents];
    const messages = contents.map(content => ({ role: content?.role === 'model' ? 'assistant' : 'user', content: partsOf(content).map(p => {
      if (typeof p?.text === 'string') return { type: 'text', text: p.text };
      if (p?.inlineData?.data && /^image\/(png|jpeg|webp|gif)$/.test(p.inlineData.mimeType)) {
        if (!model.architecture.input_modalities?.includes('image')) throw new AiRouteError('Model ini tidak menerima referensi gambar. Referensi karakter tetap dipertahankan; pilih model yang mendukungnya.', 422, true);
        return { type: 'image_url', image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` } };
      }
      throw new AiRouteError('Format masukan gambar belum didukung OpenRouter. Referensi tidak dihapus otomatis.', 422, true);
    }) }));
    const imageConfig = req.config?.imageConfig;
    const body = { model: id, messages, modalities: model.architecture.output_modalities.includes('text') ? ['image', 'text'] : ['image'], stream: false, provider: { allow_fallbacks: true },
      ...(imageConfig ? { image_config: { ...(imageConfig.aspectRatio ? { aspect_ratio: imageConfig.aspectRatio } : {}), ...(imageConfig.imageSize ? { image_size: imageConfig.imageSize } : {}) } } : {}) };
    submitted = true;
    const response = await fetcher('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${route.apiKey.trim()}`, 'HTTP-Referer': 'https://pusatbanksoal.id', 'X-Title': 'Bekal Studio Film AI' }, body: JSON.stringify(body), signal: controller.signal, credentials: 'omit', redirect: 'error' });
    let data: any; try { data = await response.json(); } catch { throw new AiRouteError('Jawaban gambar belum dapat dibaca. Periksa Activity OpenRouter sebelum mengirim ulang.', response.status, true); }
    if (!response.ok || data.error) {
      const status = response.ok ? Number(data.error?.code) || 502 : response.status;
      const raw = JSON.stringify(data.error || {});
      const detail = /safety|content.?policy|moderation|blocked/i.test(raw) ? 'Permintaan ditolak oleh kebijakan konten penyedia.' : status === 401 ? 'API key belum valid.' : status === 402 ? 'Saldo atau batas kredit tidak cukup.' : status === 429 ? 'Kuota atau batas permintaan tercapai.' : status === 403 ? 'Kunci belum mendapat akses ke model gambar.' : `Permintaan gambar gagal (HTTP ${status}).`;
      // Only explicit rejection with no result is eligible for another submission.
      if (!data.choices?.length && !/safety|content.?policy|moderation|blocked/i.test(raw) && [400, 401, 402, 403, 404, 422, 429, 500, 502, 503, 504].includes(status)) throw new OpenRouterImageRejected(`OpenRouter: ${detail}`, status);
      throw new AiRouteError(`OpenRouter: ${detail} Periksa Activity sebelum mencoba lagi.`, status, true);
    }
    const choice = data.choices?.[0];
    if (choice?.finish_reason === 'content_filter') throw new AiRouteError('OpenRouter: Gambar ditolak oleh kebijakan konten penyedia.', undefined, true);
    const images = choice?.message?.images || [];
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
    return { candidates: [{ content: { role: 'model', parts }, finishReason: 'STOP' }], text: typeof choice.message.content === 'string' ? choice.message.content : '', bekalProvider: 'openrouter', bekalModel: id, usageMetadata: { totalTokenCount: data.usage?.total_tokens || 0 } };
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
  const references = parts.some(p => p?.inlineData);
  return models.filter(m => typeof m.id === 'string' && m.architecture?.output_modalities?.includes('image') && m.architecture?.input_modalities?.includes('text') && (!references || m.architecture.input_modalities.includes('image')));
};
/** Exhaust compatible OpenRouter models before invoking a configured native image provider. */
export const generateRoutedOpenRouterImage = async (req: GeminiRequest, direct?: () => Promise<any>, fetcher: typeof fetch = fetch, announce?: (model: string, status: string) => void, directLabel = 'Gemini (API langsung)'): Promise<any> => {
  const config = readAiRouting();
  const routes = config.routes.filter(r => r.enabled && isOpenRouter(r) && r.apiKey.trim());
  let last: unknown = new AiRouteError('Belum ada model gambar OpenRouter yang kompatibel dengan masukan ini.', 422, true);
  const seenKeys = new Set<string>();
  for (const route of routes) {
    if (seenKeys.has(route.apiKey.trim())) continue;
    seenKeys.add(route.apiKey.trim());
    let models: any[];
    try { models = compatibleOpenRouterImageModels(await getOpenRouterModels(route, fetcher), req); }
    catch (error) { last = error; if (!config.fallback) throw error; continue; }
    const preferred = config.openRouterImageModel && config.openRouterImageModel !== 'auto' ? config.openRouterImageModel : openRouterImageModelId(req.model);
    models.sort((a, b) => Number(b.id === preferred) - Number(a.id === preferred) || a.id.localeCompare(b.id));
    if (!config.fallback) models = models.filter(m => m.id === preferred).slice(0, 1);
    for (const model of models) {
      if (req.config?.abortSignal?.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError');
      announce?.(model.id, 'trying');
      try {
        const result = await generateOpenRouterImage(route, { ...req, model: model.id }, fetcher);
        announce?.(model.id, 'success');
        return result;
      } catch (error) {
        last = error;
        if (!(error instanceof OpenRouterImageRejected) || !config.fallback) { announce?.(model.id, 'failed'); throw error; }
        announce?.(model.id, 'fallback');
        // Account/key-wide rejection: trying another model cannot replenish credit.
        if (error.status === 401 || error.status === 402) break;
      }
    }
  }
  if (config.fallback && direct) {
    if (req.config?.abortSignal?.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError');
    announce?.(directLabel, 'trying');
    const result = await direct();
    announce?.(directLabel, 'success');
    return result;
  }
  announce?.('OpenRouter (gambar)', 'failed');
  throw last;
};
