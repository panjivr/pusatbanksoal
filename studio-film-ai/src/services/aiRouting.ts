/** Browser-side routing for OpenAI-compatible gateways. Never routes media jobs. */
export type AiRoute = {
  id: string; name: string; baseUrl: string; model: string; apiKey: string;
  enabled: boolean; vision: boolean; tools: boolean; json: boolean;
};
export type AiRoutingConfig = { version: 1; preferGateway: boolean; fallback: boolean; mediaFallback: boolean; timeoutSeconds: number; routes: AiRoute[] };
export const AI_ROUTING_KEY = 'bekal_ai_routing_v1';
export const defaultAiRouting = (): AiRoutingConfig => ({ version: 1, preferGateway: true, fallback: true, mediaFallback: true, timeoutSeconds: 45, routes: [
  { id: '9router', name: '9Router', baseUrl: '', model: '', apiKey: '', enabled: false, vision: false, tools: false, json: false },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: '', apiKey: '', enabled: false, vision: false, tools: false, json: false },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: '', apiKey: '', enabled: false, vision: false, tools: false, json: false },
  { id: 'custom', name: 'Layanan lain', baseUrl: '', model: '', apiKey: '', enabled: false, vision: false, tools: false, json: false },
] });
export const readAiRouting = (): AiRoutingConfig => {
  try {
    const raw = JSON.parse(localStorage.getItem(AI_ROUTING_KEY) || 'null');
    if (raw?.version !== 1 || !Array.isArray(raw.routes)) return defaultAiRouting();
    return { version: 1, preferGateway: raw.preferGateway === true, fallback: raw.fallback === true, mediaFallback: raw.mediaFallback !== false,
      timeoutSeconds: Math.max(10, Math.min(120, Number(raw.timeoutSeconds) || 45)),
      routes: raw.routes.filter((r: any) => typeof r?.id === 'string' && typeof r.baseUrl === 'string' && typeof r.model === 'string').map((r: any) => ({
        id: r.id, name: String(r.name || r.id), baseUrl: r.baseUrl, model: r.model, apiKey: String(r.apiKey || ''),
        enabled: r.enabled === true, vision: r.vision === true, tools: r.tools === true, json: r.json === true,
      })) };
  } catch { return defaultAiRouting(); }
};
export const normalizeAiBaseUrl = (value: string): string => {
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
    throw new Error('Gunakan alamat HTTPS. HTTP hanya tersedia untuk localhost.');
  }
  if (url.username || url.password || url.search || url.hash) throw new Error('Alamat API tidak boleh berisi kunci, parameter, atau fragmen.');
  return url.href.replace(/\/$/, '').replace(/\/(chat\/completions|models)$/, '');
};
export const saveAiRouting = (config: AiRoutingConfig) => {
  const routes = config.routes.map(r => ({ ...r, apiKey: r.apiKey.trim(), model: r.model.trim(), baseUrl: r.baseUrl.trim() ? normalizeAiBaseUrl(r.baseUrl) : '' }));
  if (routes.some(r => r.enabled && (!r.baseUrl || !r.model))) throw new Error('Lengkapi alamat API dan nama model/kombo untuk setiap layanan aktif.');
  localStorage.setItem(AI_ROUTING_KEY, JSON.stringify({ ...config, routes }));
  window.dispatchEvent(new Event('bekal-ai-config-changed'));
};
export const hasGatewayTextRoute = () => readAiRouting().routes.some(r => r.enabled && r.baseUrl && r.model);
export const hasTextAiConfigured = () => {
  try { return hasGatewayTextRoute() || Boolean(localStorage.getItem('gemini_api_key')?.trim() || (localStorage.getItem('google_model_provider_v1') === 'replicate' && localStorage.getItem('replicate_api_key')?.trim())); }
  catch { return false; }
};
export type GeminiRequest = { model: string; contents: any; config?: any };
export class AiRouteError extends Error {
  status?: number;
  terminal: boolean;
  constructor(message: string, status?: number, terminal = false) { super(message); this.status = status; this.terminal = terminal; }
}
export const canFailoverAi = (error: unknown) => {
  if (error instanceof AiRouteError) return !error.terminal && (error.status === undefined || [401, 403, 404, 408, 409, 422, 429].includes(error.status) || error.status >= 500);
  if (error instanceof Error && error.name === 'AbortError') return false;
  const s = error instanceof Error ? error.message : String(error);
  if (/safety|blocked|prohibited|content.?policy|moderation/i.test(s)) return false;
  return /401|403|404|408|429|500|502|503|504|quota|network|fetch|timed? ?out|overload|permission|RESOURCE_EXHAUSTED|API_KEY_INVALID/i.test(s);
};
const partsOf = (value: any): any[] => typeof value === 'string' ? [{ text: value }] : Array.isArray(value) ? value.flatMap(partsOf) : value?.parts ? value.parts : [value];
export const gatewayCanHandle = (r: AiRoute, req: GeminiRequest): boolean => {
  const config = req.config || {};
  if (/image|tts|audio|veo|imagen/i.test(req.model) || config.responseModalities?.some((m: string) => m.toUpperCase() !== 'TEXT') || config.speechConfig) return false;
  if (config.tools?.some((t: any) => !Array.isArray(t.functionDeclarations))) return false;
  if (config.tools?.length && !r.tools) return false;
  if (config.responseMimeType === 'application/json' && !r.json) return false;
  const parts = partsOf(req.contents);
  if (parts.some(p => p?.functionCall || p?.functionResponse) && !r.tools) return false;
  if (parts.some(p => p?.fileData || (p?.inlineData && !String(p.inlineData.mimeType).startsWith('image/')))) return false;
  if (parts.some(p => p?.inlineData) && !r.vision) return false;
  return true;
};
export const jsonSchema = (value: any): any => {
  if (Array.isArray(value)) return value.map(jsonSchema);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([k]) => k !== 'propertyOrdering').map(([k, v]) => [k, k === 'type' && typeof v === 'string' ? v.toLowerCase() : jsonSchema(v)]));
};
export const matchesResponseSchema = (value: any, schema: any): boolean => {
  if (!schema || typeof schema !== 'object') return true;
  if (value === null) return schema.nullable === true || String(schema.type).toLowerCase() === 'null';
  if (schema.enum && !schema.enum.includes(value)) return false;
  if (schema.anyOf && !schema.anyOf.some((s: any) => matchesResponseSchema(value, s))) return false;
  const type = String(schema.type || '').toLowerCase();
  if (type === 'object') {
    if (typeof value !== 'object' || Array.isArray(value)) return false;
    if ((schema.required || []).some((k: string) => !(k in value))) return false;
    return Object.entries(schema.properties || {}).every(([k, s]) => !(k in value) || matchesResponseSchema(value[k], s));
  }
  if (type === 'array') return Array.isArray(value) && value.every(v => matchesResponseSchema(v, schema.items)) && (schema.minItems === undefined || value.length >= schema.minItems) && (schema.maxItems === undefined || value.length <= schema.maxItems);
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (type === 'string' || type === 'boolean') return typeof value === type;
  return true;
};
export const gatewayMessages = (req: GeminiRequest): any[] => {
  const messages: any[] = [];
  const answeredCalls = new Set<string>();
  const system = partsOf(req.config?.systemInstruction || '').map(p => p?.text || '').join('\n');
  const schema = req.config?.responseSchema || req.config?.responseJsonSchema;
  const schemaInstruction = schema ? `\nKeluarkan JSON sesuai skema ini, tanpa mengubah nama properti: ${JSON.stringify(jsonSchema(schema))}` : '';
  messages.push({ role: 'system', content: `${system}${schemaInstruction}\nJawab dalam bahasa Indonesia yang jelas dan alami. Pertahankan nama properti JSON, nama fungsi, dan parameter teknis.`.trim() });
  const contents = Array.isArray(req.contents) ? req.contents : [req.contents];
  for (const content of contents) {
    const parts = partsOf(content);
    const role = content?.role === 'model' ? 'assistant' : 'user';
    const textParts: any[] = [];
    const calls: any[] = [];
    for (const p of parts) {
      if (typeof p?.text === 'string') textParts.push({ type: 'text', text: p.text });
      if (p?.inlineData) textParts.push({ type: 'image_url', image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` } });
      if (p?.functionCall) calls.push({ id: p.functionCall.id || `bekal_${messages.length}_${calls.length}`, type: 'function', function: { name: p.functionCall.name, arguments: JSON.stringify(p.functionCall.args || {}) } });
      if (p?.functionResponse) {
        const id = p.functionResponse.id || [...messages].reverse().flatMap(m => m.tool_calls || []).find(c => c.function.name === p.functionResponse.name && !answeredCalls.has(c.id))?.id;
        if (!id) throw new AiRouteError('Riwayat alat belum memiliki pasangan panggilan yang lengkap.', 422);
        answeredCalls.add(id);
        messages.push({ role: 'tool', tool_call_id: id, content: JSON.stringify(p.functionResponse.response) });
      }
    }
    if (textParts.length || calls.length) messages.push({ role: calls.length ? 'assistant' : role, content: textParts.length ? textParts : null, ...(calls.length ? { tool_calls: calls } : {}) });
  }
  return messages;
};
export const gatewayGenerate = async (route: AiRoute, req: GeminiRequest, timeoutSeconds = 45, fetcher: typeof fetch = fetch): Promise<any> => {
  const baseUrl = normalizeAiBaseUrl(route.baseUrl);
  const config = req.config || {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutSeconds * 1000);
  const callerSignal = config.abortSignal as AbortSignal | undefined;
  const abort = () => controller.abort(callerSignal?.reason);
  if (callerSignal?.aborted) { clearTimeout(timer); throw new DOMException('Permintaan dibatalkan.', 'AbortError'); }
  callerSignal?.addEventListener('abort', abort, { once: true });
  const body: any = { model: route.model, messages: gatewayMessages(req), stream: false };
  if (typeof config.temperature === 'number') body.temperature = config.temperature;
  if (config.maxOutputTokens) body.max_tokens = config.maxOutputTokens;
  if (config.responseMimeType === 'application/json') body.response_format = { type: 'json_object' };
  if (config.tools?.length) {
    body.tools = config.tools.flatMap((t: any) => t.functionDeclarations || []).map((f: any) => ({ type: 'function', function: { name: f.name, description: f.description, parameters: jsonSchema(f.parameters || { type: 'object', properties: {} }) } }));
  }
  try {
    const response = await fetcher(`${baseUrl}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(route.apiKey ? { Authorization: `Bearer ${route.apiKey}` } : {}) }, body: JSON.stringify(body), signal: controller.signal });
    if (!response.ok) {
      // Never display raw provider errors: gateways sometimes echo credentials.
      let errorBody: any; try { errorBody = await response.json(); } catch {}
      const blocked = /safety|content.?policy|moderation|blocked/i.test(String(errorBody?.error?.code || '') + String(errorBody?.error?.type || ''));
      throw new AiRouteError(blocked ? 'Permintaan ditolak oleh kebijakan konten penyedia.' : `Layanan ${route.name} gagal (HTTP ${response.status}).`, response.status, blocked);
    }
    const data = await response.json();
    const choice = data.choices?.[0];
    if (choice?.finish_reason === 'content_filter') throw new AiRouteError('Permintaan ditolak oleh kebijakan konten penyedia.', undefined, true);
    if (choice?.finish_reason === 'length') throw new AiRouteError('Jawaban terpotong karena batas token. Tingkatkan batas keluaran atau persingkat permintaan.', 422);
    const m = choice?.message;
    const text = typeof m?.content === 'string' ? m.content : Array.isArray(m?.content) ? m.content.map((p: any) => p.text || '').join('') : '';
    const calls = (m?.tool_calls || []).map((c: any) => ({ id: c.id, name: c.function?.name, args: JSON.parse(c.function?.arguments || '{}') }));
    if (!text.trim() && !calls.length) throw new AiRouteError('Layanan mengembalikan jawaban kosong.', 502);
    if (config.responseMimeType === 'application/json' && text) { try { const parsed = JSON.parse(text); if (!matchesResponseSchema(parsed, config.responseSchema || config.responseJsonSchema)) throw new Error('schema'); } catch { throw new AiRouteError('Layanan mengembalikan JSON yang tidak sesuai struktur proyek.', 502); } }
    const parts = [...(text ? [{ text }] : []), ...calls.map((functionCall: any) => ({ functionCall }))];
    return { text, functionCalls: calls.length ? calls : undefined, candidates: [{ content: { role: 'model', parts }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: data.usage?.prompt_tokens || 0, candidatesTokenCount: data.usage?.completion_tokens || 0, totalTokenCount: data.usage?.total_tokens || 0 } };
  } catch (error) {
    if (callerSignal?.aborted) throw new DOMException('Permintaan dibatalkan.', 'AbortError');
    if (controller.signal.aborted) throw new AiRouteError(`Layanan ${route.name} melewati batas waktu.`);
    if (error instanceof AiRouteError) throw error;
    throw new AiRouteError(`Layanan ${route.name} tidak dapat dihubungi. Periksa koneksi, HTTPS, dan izin CORS.`);
  } finally { clearTimeout(timer); callerSignal?.removeEventListener('abort', abort); }
};
export type RoutingAttempt = { id: string; run: () => Promise<any> };
export const executeAiRoutes = async (attempts: RoutingAttempt[], fallback: boolean, onAttempt?: (id: string, status: 'trying' | 'success' | 'fallback' | 'failed') => void) => {
  let last: unknown;
  for (const [index, attempt] of attempts.entries()) {
    onAttempt?.(attempt.id, 'trying');
    try { const result = await attempt.run(); onAttempt?.(attempt.id, 'success'); return result; }
    catch (error) {
      last = error;
      if (!fallback || !canFailoverAi(error) || index === attempts.length - 1) { onAttempt?.(attempt.id, 'failed'); throw error; }
      onAttempt?.(attempt.id, 'fallback');
    }
  }
  throw last || new AiRouteError('Belum ada layanan yang mendukung permintaan ini. Lengkapi API di Pengaturan.');
};
