import { GoogleGenAI } from '@google/genai';
import { withModelFallback } from './geminiModelFallback';
import { AiRouteError, canFailoverAi, executeAiRoutes, gatewayCanHandle, gatewayGenerate, hasTextAiConfigured, readAiRouting, type GeminiRequest, type RoutingAttempt } from './aiRouting';

/** Adapts text/vision/tool calls only. Native Google media/upload/live methods stay native. */
export const getStudioAiClient = (): GoogleGenAI => {
  const geminiKey = process.env.API_KEY || localStorage.getItem('gemini_api_key')?.trim();
  if (!geminiKey && !hasTextAiConfigured()) throw new Error('Tambahkan API Gemini atau aktifkan layanan teks di Pengaturan AI.');
  const ai = withModelFallback(new GoogleGenAI({ apiKey: geminiKey || 'bekal-not-configured' }));
  const nativeGenerate = ai.models.generateContent.bind(ai.models);
  ai.models.generateContent = async (params) => {
    const req = params as GeminiRequest;
    const config = readAiRouting();
    const language = 'Jawab dalam bahasa Indonesia yang alami. Pertahankan struktur JSON, nama properti, nama fungsi, dan parameter teknis.';
    const originalSystem = req.config?.systemInstruction;
    const localized = { ...params, config: { ...params.config, systemInstruction: originalSystem ? (typeof originalSystem === 'string' ? `${originalSystem}\n${language}` : { parts: [...(Array.isArray(originalSystem) ? originalSystem : typeof originalSystem === 'object' && 'parts' in originalSystem ? originalSystem.parts || [] : [{ text: String(originalSystem) }]), { text: language }] }) : language } };
    const gateways: RoutingAttempt[] = config.routes.filter(r => r.enabled && r.baseUrl && r.model && gatewayCanHandle(r, req)).map(r => ({ id: r.name, run: () => gatewayGenerate(r, req, config.timeoutSeconds) }));
    const google: RoutingAttempt[] = geminiKey ? [{ id: 'Gemini', run: async () => {
      const controller = new AbortController();
      const signal = params.config?.abortSignal;
      const cancel = () => controller.abort(signal?.reason);
      if (signal?.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError');
      signal?.addEventListener('abort', cancel, { once: true });
      const timer = setTimeout(() => controller.abort(), config.timeoutSeconds * 1000);
      try { return await nativeGenerate({ ...localized, config: { ...localized.config, abortSignal: controller.signal } } as typeof params); }
      catch (error) { if (signal?.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError'); if (controller.signal.aborted) throw new AiRouteError('Gemini melewati batas waktu.'); throw error; }
      finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
    } }] : [];
    const attempts = config.preferGateway ? [...gateways, ...google] : [...google, ...gateways];
    if (!attempts.length) throw new Error('Permintaan ini memerlukan kemampuan khusus. Gunakan API Gemini atau layanan yang mendukung format media/alat tersebut.');
    return executeAiRoutes(attempts, config.fallback, (provider, status) => window.dispatchEvent(new CustomEvent('bekal-ai-route-status', { detail: { provider, status } })));
  };
  if (!geminiKey) {
    const unavailable = async () => { throw new Error('Fitur Google khusus ini membutuhkan API Gemini. Router teks tidak mendukung pembuatan gambar/video, unggah media Google, atau siaran langsung.'); };
    ai.models.generateImages = unavailable;
    ai.models.generateVideos = unavailable;
    ai.files.upload = unavailable;
  }
  return ai;
};
export { hasTextAiConfigured, canFailoverAi };
