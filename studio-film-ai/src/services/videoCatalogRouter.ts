import { readAiRouting } from './aiRouting';
import { runSafeMediaFailover } from './mediaFailover';
import { MediaItem } from '../types';
import { generateVideoWithFalCatalog } from './falAiService';
import { getFalVideoCatalogEntry } from './falVideoCatalog';
import { generateVideoWithHiggsfield, getVideoProviderPreference, hasHiggsfieldApiKey, higgsfieldHostsVideoModel } from './higgsfieldService';

const hasFalKey = () => { try { return Boolean(localStorage.getItem('fal_api_key')); } catch { return false; } };

export type CatalogVideoOptions = {
  image?: { base64: string; mimeType: string };
  endImage?: { base64: string; mimeType: string };
  duration?: number;
  aspectRatio?: string;
  resolution?: string;
  audio?: boolean;
  negativePrompt?: string;
};

/**
 * Same model, two hosts. Preference (Settings → Higgsfield) decides; "auto" uses fal
 * when a fal key exists, otherwise Higgsfield; a Higgsfield-only model always goes
 * to Higgsfield.
 */
export const resolveCatalogProvider = (modelId: string): 'fal' | 'higgsfield' => {
  const onFal = Boolean(getFalVideoCatalogEntry(modelId));
  const onHf = higgsfieldHostsVideoModel(modelId) && hasHiggsfieldApiKey();
  if (!onFal) return 'higgsfield';
  if (!onHf) return 'fal';
  const preference = getVideoProviderPreference();
  if (preference === 'higgsfield') return 'higgsfield';
  if (preference === 'fal') return 'fal';
  return hasFalKey() ? 'fal' : 'higgsfield';
};

export const generateCatalogVideo = async (modelId: string, prompt: string, opts?: CatalogVideoOptions): Promise<MediaItem> => {
  const primary = resolveCatalogProvider(modelId);
  const both = Boolean(getFalVideoCatalogEntry(modelId)) && higgsfieldHostsVideoModel(modelId) && hasFalKey() && hasHiggsfieldApiKey();
  const run = (provider: 'fal' | 'higgsfield') => provider === 'higgsfield' ? generateVideoWithHiggsfield(modelId, prompt, opts) : generateVideoWithFalCatalog(modelId, prompt, opts);
  const secondary = primary === 'fal' ? 'higgsfield' : 'fal';
  let switched = false;
  const notify = (provider: string, status: string) => window.dispatchEvent(new CustomEvent('bekal-ai-route-status', { detail: { provider, status } }));
  try {
    const result = await runSafeMediaFailover(() => run(primary), both ? () => run(secondary) : null, readAiRouting().mediaFallback, () => { switched = true; notify(primary, 'fallback'); });
    if (switched) notify(secondary, 'success');
    return result;
  } catch (error) { if (switched) notify(secondary, 'failed'); throw error; }
};
