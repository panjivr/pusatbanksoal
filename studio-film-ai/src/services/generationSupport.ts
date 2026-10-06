import { isOpenRouter, readAiRouting } from './aiRouting.ts';
/** Provider selection stays separate from the existing creative ranking algorithm. */
export type ProviderKeys = { openrouter?: boolean; gemini?: boolean; replicate?: boolean; fal?: boolean; higgsfield?: boolean; xai?: boolean; ltx?: boolean; runway?: boolean; midjourney?: boolean; googleProvider?: string };
export const readGenerationKeys = (): ProviderKeys => {
  const has = (key: string) => Boolean(localStorage.getItem(key)?.trim());
  return { openrouter: readAiRouting().routes.some(r => r.enabled && isOpenRouter(r) && r.apiKey.trim()), gemini: has('gemini_api_key'), replicate: has('replicate_api_key'), fal: has('fal_api_key'), higgsfield: Boolean(localStorage.getItem('higgsfield_api_key')?.includes(':')), xai: has('xai_api_key'), ltx: has('ltx_api_key'), runway: has('runway_api_key'), midjourney: has('midjourney_api_key'), googleProvider: localStorage.getItem('google_model_provider_v1') || 'gemini' };
};
export const modelHasCredentials = (id: string, keys: ProviderKeys, kind: 'image' | 'video', higgsfieldHost = false): boolean => {
  if (id === 'auto') return false;
  if (id.endsWith('-hf') || id.startsWith('soul-')) return Boolean(keys.higgsfield);
  if (/-fal(?:-|$)/.test(id)) return Boolean(keys.fal || (kind === 'video' && higgsfieldHost && keys.higgsfield));
  if (id === 'imagen') return Boolean(keys.gemini && keys.googleProvider !== 'replicate' && keys.googleProvider !== 'openrouter');
  if (kind === 'image' && keys.googleProvider === 'openrouter' && (id === 'nano' || id === 'gemini-pro' || id.startsWith('gemini-'))) return Boolean(keys.openrouter);
  if (id === 'nano' || id === 'gemini-pro' || id.startsWith('gemini-') || (id === 'veo' || id.startsWith('veo-'))) return Boolean(keys.googleProvider === 'replicate' ? keys.replicate : keys.gemini);
  if (id.startsWith('grok-')) return Boolean(keys.xai);
  // Midjourney's desktop agent is not a key-based browser service.
  if (id === 'midjourney' || id === 'comfyui') return false;
  if (id.startsWith('runway')) return Boolean(keys.runway);
  if (id === 'ltx-2.3-api') return Boolean(keys.ltx);
  return Boolean(keys.replicate);
};
export const generationTimeoutSeconds = (request: { model: string; config?: any }, textTimeout: number): number =>
  /image|tts|audio|imagen|veo/i.test(request.model) || request.config?.responseModalities?.some((m: string) => m.toUpperCase() !== 'TEXT')
    ? Math.max(180, textTimeout) : textTimeout;
export const isNativeMediaRequest = (request: { model: string; config?: any }): boolean => /image|tts|audio|imagen|veo/i.test(request.model) || Boolean(request.config?.responseModalities?.some((m: string) => m.toUpperCase() !== 'TEXT'));
export const safeGenerationError = (error: unknown, provider = 'Gemini'): { message: string; status?: number; blocked: boolean } => {
  const raw = error instanceof Error ? error.message : '';
  const status = Number((error as any)?.status || (error as any)?.code || raw.match(/\b(400|401|403|404|408|429|500|502|503|504)\b/)?.[1]) || undefined;
  const blocked = /safety|blocked|prohibited|content.?policy|moderation/i.test(raw);
  let detail = 'Permintaan belum berhasil. Periksa koneksi, izin CORS, dan konfigurasi layanan.';
  if (blocked) detail = 'Permintaan ditolak kebijakan konten. Sesuaikan prompt tanpa mengubah identitas karakter.';
  else if (status === 401 || /API_KEY_INVALID|API key not valid/i.test(raw)) detail = 'API key belum valid. Periksa kunci untuk penyedia dan perangkat ini di Pengaturan.';
  else if (status === 403) detail = 'Kunci ini belum mendapat akses ke model. Periksa izin proyek, aktivasi API, dan penagihan pada penyedia.';
  else if (status === 429) detail = 'Kuota atau batas permintaan penyedia sudah tercapai. Periksa kuota dan saldo layanan.';
  else if (status === 404) detail = 'Model belum tersedia untuk kunci ini. Pilih model lain yang tersedia pada penyedia.';
  else if (status === 400) detail = 'Model menolak format permintaan. Periksa dukungan referensi, ukuran gambar, dan rasio yang dipilih.';
  else if (status && status >= 500) detail = 'Layanan sedang mengalami gangguan. Coba lagi setelah beberapa saat.';
  return { message: `${provider}: ${detail}${status ? ` (HTTP ${status})` : ''}`, status, blocked };
};

export const availableGenerationModels = <T extends string>(ids: readonly T[], kind: 'image' | 'video', higgsfieldHosts?: (id: T) => boolean): T[] => {
  const keys = readGenerationKeys();
  const available = ids.filter(id => modelHasCredentials(id, keys, kind, higgsfieldHosts?.(id)));
  if (!available.length) throw new Error(kind === 'image' ? 'Belum ada penyedia gambar yang siap. Isi API Gemini atau fal.ai/Replicate di Pengaturan. Router teks tidak membuat gambar.' : 'Belum ada penyedia video yang siap. Isi API penyedia video di Pengaturan sebelum memakai mode Otomatis.');
  return available;
};

/** Veo can return a Google API URL or a signed media URL. Never leak its key to a CDN. */
export const prepareGoogleMediaDownload = (uri: string, apiKey?: string | null): { url: string; headers: Record<string, string> } => {
  const url = new URL(uri);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Alamat hasil media dari penyedia tidak valid.');
  const headers: Record<string, string> = {};
  if (url.hostname === 'generativelanguage.googleapis.com') {
    url.searchParams.delete('key');
    if (apiKey) headers['x-goog-api-key'] = apiKey;
  }
  return { url: url.href, headers };
};

export const isBlockedGenerationResponse = (response: any): boolean => {
  const reason = response?.promptFeedback?.blockReason;
  return Boolean((reason && reason !== 'BLOCK_REASON_UNSPECIFIED') || response?.candidates?.some((candidate: any) => /SAFETY|BLOCKLIST|PROHIBITED|RECITATION|SPII/.test(String(candidate.finishReason || ''))));
};
