import { GoogleGenAI } from '@google/genai';
import { withModelFallback } from './geminiModelFallback';
import { generationTimeoutSeconds, isNativeMediaRequest, safeGenerationError, isBlockedGenerationResponse } from './generationSupport';
import { AiRouteError, canFailoverAi, executeAiRoutes, gatewayCanHandle, gatewayGenerate, hasTextAiConfigured, readAiRouting, type GeminiRequest, type RoutingAttempt } from './aiRouting';

/** Text gateways and native media APIs have separate capabilities and time budgets. */
export const getStudioAiClient = (): GoogleGenAI => {
  const geminiKey = process.env.API_KEY || localStorage.getItem('gemini_api_key')?.trim();
  if (!geminiKey && !hasTextAiConfigured()) throw new AiRouteError('Tambahkan API Gemini atau layanan AI yang sesuai di Pengaturan.', undefined, true);
  const ai = withModelFallback(new GoogleGenAI({ apiKey: geminiKey || 'bekal-not-configured' }));
  const announce = (provider: string, status: string, error?: unknown) => window.dispatchEvent(new CustomEvent('bekal-ai-route-status', { detail: { provider, status, message: error instanceof AiRouteError ? error.message : undefined } }));
  const nativeCall = async <T>(req: { model: string; config?: any }, invoke: (signal: AbortSignal) => Promise<T>): Promise<T> => {
    const controller = new AbortController();
    const signal = req.config?.abortSignal as AbortSignal | undefined;
    if (signal?.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError');
    const cancel = () => controller.abort(signal?.reason);
    signal?.addEventListener('abort', cancel, { once: true });
    const seconds = generationTimeoutSeconds(req, readAiRouting().timeoutSeconds);
    const timer = setTimeout(() => controller.abort(), seconds * 1000);
    try {
      const result = await invoke(controller.signal);
      if (isBlockedGenerationResponse(result)) throw new AiRouteError('Gemini: Permintaan ditolak oleh kebijakan konten penyedia. Sesuaikan prompt.', undefined, true);
      return result;
    }
    catch (error) {
      if (signal?.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError');
      if (controller.signal.aborted) throw new AiRouteError(`Gemini melewati batas waktu ${seconds} detik. Proses dihentikan di browser; periksa penyedia sebelum mengirim ulang.`);
      if (error instanceof AiRouteError) throw error;
      const safe = safeGenerationError(error);
      throw new AiRouteError(safe.message, safe.status, safe.blocked);
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
  };
  const nativeGenerate = ai.models.generateContent.bind(ai.models);
  ai.models.generateContent = async (params) => {
    const req = params as GeminiRequest;
    const config = readAiRouting();
    const language = 'Jawab dalam bahasa Indonesia yang alami. Pertahankan struktur JSON, nama properti, nama fungsi, dan parameter teknis.';
    const originalSystem = req.config?.systemInstruction;
    // Image/audio prompts and references must be passed unchanged to the media model.
    const localized = isNativeMediaRequest(req) ? params : { ...params, config: { ...params.config, systemInstruction: originalSystem ? (typeof originalSystem === 'string' ? `${originalSystem}\n${language}` : { parts: [...(Array.isArray(originalSystem) ? originalSystem : typeof originalSystem === 'object' && 'parts' in originalSystem ? originalSystem.parts || [] : [{ text: String(originalSystem) }]), { text: language }] }) : language } };
    const gateways: RoutingAttempt[] = config.routes.filter(r => r.enabled && r.baseUrl && r.model && gatewayCanHandle(r, req)).map(r => ({ id: r.name, run: () => gatewayGenerate(r, req, config.timeoutSeconds) }));
    const google: RoutingAttempt[] = geminiKey ? [{ id: 'Gemini', run: () => nativeCall(req, signal => nativeGenerate({ ...localized, config: { ...localized.config, abortSignal: signal } } as typeof params)) }] : [];
    const attempts = config.preferGateway ? [...gateways, ...google] : [...google, ...gateways];
    if (!attempts.length) throw new AiRouteError(isNativeMediaRequest(req) ? 'Pembuatan gambar dan audio membutuhkan API penyedia media. Router teks atau analisis gambar tidak menghasilkan gambar. Isi API Gemini, atau pilih model fal.ai/Replicate yang kuncinya tersedia.' : 'Belum ada layanan aktif yang mendukung format permintaan ini. Periksa dukungan JSON, analisis gambar, dan alat di Pengaturan AI.', undefined, true);
    return executeAiRoutes(attempts, config.fallback, announce);
  };
  // Imagen and video submissions bypass generateContent, so protect these paths too.
  for (const method of ['generateImages', 'generateVideos'] as const) {
    const native = ai.models[method].bind(ai.models) as (params: any) => Promise<any>;
    (ai.models as any)[method] = async (params: any) => {
      if (!geminiKey) throw new AiRouteError('Model media Google ini membutuhkan API Gemini. Router teks tidak membuat gambar/video. Isi API Gemini atau pilih penyedia media lain.', undefined, true);
      return executeAiRoutes([{ id: 'Gemini', run: () => nativeCall(params, signal => native({ ...params, config: { ...params.config, abortSignal: signal } })) }], false, announce);
    };
  }
  if (!geminiKey) ai.files.upload = async () => { throw new AiRouteError('Unggah media Google membutuhkan API Gemini. Router teks tidak menerima file Google.', undefined, true); };
  return ai;
};
export { hasTextAiConfigured, canFailoverAi };
