import { GoogleGenAI } from '@google/genai';
import { generateRoutedOpenRouterImage } from './openRouterImages';
import { generateStudioAudio, studioSelectedModel } from './openRouterMedia';
import { AiRouteError, canFailoverAi, executeAiRoutes, gatewayCanHandle, gatewayGenerate, isOpenRouter, resolveOpenRouterRoute, hasTextAiConfigured, readAiRouting, type GeminiRequest, type RoutingAttempt } from './aiRouting';
/** SDK-shaped client preserves the editor's structured prompts and tools; every generation uses OpenRouter. */
export const getStudioAiClient = (): GoogleGenAI => {
  if (!hasTextAiConfigured()) throw new AiRouteError('Isi dan aktifkan API key OpenRouter di Pengaturan.', undefined, true);
  const ai = new GoogleGenAI({ apiKey:'openrouter-adapter' });
  const announce = (provider: string, status: string, error?: unknown) => window.dispatchEvent(new CustomEvent('bekal-ai-route-status', { detail:{ provider,status,message:error instanceof AiRouteError ? error.message : undefined } }));
  ai.models.generateContent = async params => {
    const req = params as GeminiRequest, config = readAiRouting();
    if (req.config?.responseModalities?.includes('IMAGE')) return generateRoutedOpenRouterImage(req, undefined, fetch, announce);
    if (req.config?.responseModalities?.includes('AUDIO')) throw new AiRouteError('Gunakan alur audio OpenRouter untuk mendapatkan berkas audio sesuai format asli model.', undefined, true);
    const language = 'Jawab dalam bahasa Indonesia yang alami. Pertahankan struktur JSON, nama properti, nama fungsi, dan parameter teknis.';
    const system = req.config?.systemInstruction;
    const localized = { ...req, config:{ ...req.config, systemInstruction: typeof system === 'string' ? `${system}\n${language}` : system ? { parts:[...(Array.isArray(system) ? system : system.parts || []),{text:language}] } : language } };
    const attempts: RoutingAttempt[] = config.routes.filter(r => isOpenRouter(r) && r.enabled && r.apiKey.trim() && r.model).map(r => ({ id:r.name, run:async () => {
      const resolved = await resolveOpenRouterRoute(r);
      if (!gatewayCanHandle(resolved,req)) throw new AiRouteError('Model OpenRouter ini belum mendukung format permintaan. Pilih model teks dengan dukungan JSON, alat, atau analisis gambar yang sesuai.',422);
      return gatewayGenerate(resolved, localized, config.timeoutSeconds);
    } }));
    if (!attempts.length) throw new AiRouteError('Pilih model teks OpenRouter di Pengaturan, lalu simpan.',undefined,true);
    return executeAiRoutes(attempts,config.fallback,announce);
  };
  ai.models.generateImages = async params => {
    const req = params as any;
    const result = await generateRoutedOpenRouterImage({ model:studioSelectedModel('image') || configImageModel(),contents:req.prompt,config:{responseModalities:['IMAGE'],imageConfig:{aspectRatio:req.config?.aspectRatio || '1:1',imageSize:'1K'}} });
    return {generatedImages:result.candidates[0].content.parts.filter((p:any) => p.inlineData).map((p:any) => ({ image:{imageBytes:p.inlineData.data,mimeType:p.inlineData.mimeType} }))} as any;
  };
  ai.models.generateVideos = async () => { throw new AiRouteError('Pilih model dan parameter dari katalog video OpenRouter pada panel Video AI.',undefined,true); };
  ai.files.upload = async () => { throw new AiRouteError('Unggah langsung ke Google dinonaktifkan. Gunakan masukan berkas lokal pada alur OpenRouter.',undefined,true); };
  return ai;
};
const configImageModel = () => readAiRouting().openRouterImageModel || '';
export { hasTextAiConfigured, canFailoverAi };
