import { configuredOpenRouterImageRoute, getOpenRouterImageModels, clearOpenRouterImageCache } from './openRouterImages.ts';
import { getOpenRouterModels, clearOpenRouterModelCache } from './aiRouting.ts';
export type CatalogKind = 'image' | 'video' | 'text' | 'audio';
export type EstimateOptions = { count?: number; seconds?: number; resolution?: string; ratio?: string; references?: number; inputTokens?: number; outputTokens?: number };
const cache = new Map<string, Promise<any>>();
export const reloadStudioCatalog = () => { cache.clear(); clearOpenRouterImageCache(); clearOpenRouterModelCache(); };
export const supportsStudioWorldModels = (): boolean => false;
const publicJson = (path: string) => {
  let promise = cache.get(path);
  if (!promise) { promise = fetch(`https://openrouter.ai/api/v1${path}`, { credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(15000) }).then(async r => { if (!r.ok) throw new Error('Katalog OpenRouter belum dapat dimuat. Coba muat ulang.'); return r.json(); }); cache.set(path, promise); promise.catch(() => cache.delete(path)); const timer = setTimeout(() => cache.delete(path), 300000); (timer as any).unref?.(); }
  return promise;
};
export const loadStudioCatalog = async (kind: CatalogKind): Promise<any[]> => {
  const route = configuredOpenRouterImageRoute() || { id: 'openrouter', name: 'OpenRouter', enabled: true, baseUrl: 'https://openrouter.ai/api/v1', apiKey: '', model: 'auto', tools: true, json: true, vision: true };
  if (kind === 'image') return (await getOpenRouterImageModels(route)).filter(m => !m.imageApi || !m.supported_parameters?.output_format?.values || m.supported_parameters.output_format.values.some((f: string) => ['png','jpeg','webp'].includes(f)));
  if (kind === 'video') return (await publicJson('/videos/models')).data;
  return (await getOpenRouterModels(route)).filter(m => m.architecture?.output_modalities?.includes(kind === 'audio' ? 'audio' : 'text'));
};
export const priceStudioModel = async (model: any, kind: CatalogKind): Promise<any> => {
  if (kind !== 'image') return model;
  // Prefer native endpoint prices even for multimodal models also served by chat.
  try { const data = await publicJson(`/images/models/${model.id}/endpoints`); if (Array.isArray(data.endpoints)) return { ...model, priceEndpoints: data.endpoints }; } catch { /* chat-only models retain token pricing */ }
  return model;
};
export const usd = (value: number) => `$${value.toFixed(value > 0 && value < .001 ? 6 : 4).replace(/0+$/, '').replace(/\.$/, '')}`;
/** Unknown prices are deliberately null, never advertised as free. */
export const estimateStudioCost = (model: any, kind: CatalogKind, options: EstimateOptions = {}): { low: number; high: number; basis: string } | null => {
  const count = Math.max(1, options.count || 1);
  if (kind === 'video') {
    const skus = model.pricing_skus || {}, resolution = options.resolution || model.supported_resolutions?.[0];
    const prefix = options.references ? 'reference_duration_seconds_' : 'duration_seconds_';
    const rate = Number(skus[prefix + String(resolution).toLowerCase()]);
    if (!Number.isFinite(rate)) return null;
    return { low: rate * (options.seconds || 8) * count, high: rate * (options.seconds || 8) * count, basis: `${options.seconds || 8} detik, ${resolution}, ${options.references ? 'dengan referensi' : 'tanpa referensi'}` };
  }
  if (kind === 'image' && model.priceEndpoints?.length) {
    const totals: number[] = []; let basis = '';
    for (const endpoint of model.priceEndpoints) {
      let total = 0, known = false, unsupported = false;
      for (const p of endpoint.pricing || []) {
        const rate = Number(p.cost_usd); if (!Number.isFinite(rate)) { unsupported = true; break; }
        if (p.billable === 'output_image' && ['image','request'].includes(p.unit)) { total += rate; known = true; basis = 'per gambar'; }
        else if (p.billable === 'output_image' && p.unit === 'megapixel') {
          // Models without a resolution knob use provider default, whose dimensions aren't declared.
          if (!model.supported_parameters?.resolution) { total += rate; known = true; basis = 'asumsi 1 megapiksel per gambar; dimensi akhir ditentukan penyedia'; continue; }
          if (!options.resolution) { unsupported = true; break; }
          const side = ({ '1K': 1024, '1.5K': 1536, '2K': 2048, '4K': 4096 } as Record<string, number>)[options.resolution];
          const [w,h] = (options.ratio || '1:1').split(':').map(Number);
          if (!side || !w || !h) { unsupported = true; break; }
          const mp = side * side * Math.min(w,h) / Math.max(w,h) / 1e6;
          total += rate * mp; known = true; basis = `${options.resolution}, rasio ${options.ratio || '1:1'} (perkiraan megapiksel)`;
        } else if (p.billable === 'input_image' && p.unit === 'image') total += rate * (options.references || 0);
        else if (p.unit === 'token' && options.inputTokens != null && options.outputTokens != null) {
          const tokens = p.billable === 'output_image' ? options.outputTokens : p.billable === 'input_image' ? options.inputTokens * (options.references || 0) : p.billable === 'input_text' ? options.inputTokens : null;
          if (tokens == null) { unsupported = true; break; } total += rate * tokens; known = true; basis = `asumsi ${options.inputTokens} token teks masukan, ${options.outputTokens} token gambar keluaran, ${options.inputTokens} token per referensi`;
        }
        else if (p.billable === 'input_image' && !options.references) continue;
        else { unsupported = true; break; }
      }
      if (known && !unsupported) totals.push(total * count);
    }
    if (totals.length) return { low: Math.min(...totals), high: Math.max(...totals), basis };
  }
  const pricing = model.pricing || {};
  if (kind === 'image' && pricing.image_output != null && options.inputTokens != null && options.outputTokens != null) {
    const cost = Number(pricing.prompt || 0) * options.inputTokens + Number(pricing.image_output) * options.outputTokens;
    if (Number.isFinite(cost)) return { low:cost*count,high:cost*count,basis:`asumsi ${options.inputTokens} token masukan total + ${options.outputTokens} token gambar keluaran` };
  }
  if (kind === 'audio') {
    const flat = model.description?.match(/priced at \$(\d+(?:\.\d+)?) per (?:song|clip)/i);
    if (flat) return { low:Number(flat[1])*count, high:Number(flat[1])*count, basis:'per lagu/klip, sesuai deskripsi katalog OpenRouter' };
    if (pricing.audio_output != null) { const cost = Number(pricing.audio_output) * (options.outputTokens || 1000) + Number(pricing.prompt || 0) * (options.inputTokens || 1000); if (Number.isFinite(cost)) return { low:cost*count, high:cost*count, basis:'asumsi 1.000 token masukan + 1.000 token audio keluaran' }; }
  }
  if (kind === 'text' && pricing.prompt != null && pricing.completion != null) {
    const cost = Number(pricing.prompt) * (options.inputTokens || 1000) + Number(pricing.completion) * (options.outputTokens || 1000);
    if (Number.isFinite(cost)) return { low: cost * count, high: cost * count, basis: `${options.inputTokens || 1000} token masukan + ${options.outputTokens || 1000} token keluaran (asumsi)` };
  }
  return null;
};
export const priceBasis = (model: any) => {
  const p = model.priceEndpoints?.[0]?.pricing?.find((p: any) => p.billable === 'output_image');
  if (p) return `${usd(Number(p.cost_usd))}/${p.unit === 'megapixel' ? 'megapiksel' : p.unit}`;
  if (model.pricing?.audio_output) return `${usd(Number(model.pricing.audio_output) * 1e6)}/1 juta token audio keluaran`;
  if (model.pricing?.image_output) return `${usd(Number(model.pricing.image_output) * 1e6)}/1 juta token gambar keluaran`;
  return 'Tarif akhir bergantung pada penggunaan; lihat OpenRouter';
};
export const studioSelectedModel = (kind: CatalogKind) => localStorage.getItem(`bekal-openrouter-${kind}-model`) || '';
