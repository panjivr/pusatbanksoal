import { generateStudioAudio, studioSelectedModel } from './openRouterMedia';
import { MediaItem } from '../types';
import { getVideoDuration } from '../utils/helpers';
import { recordUsage } from '../utils/usageTracker';
import { byokProxyBinaryUrl, byokProxyJson, shouldUseByokProxy } from './byokProxyClient';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';
const DEFAULT_OUTPUT_FORMAT = 'mp3_44100_128';

const getElevenLabsKeyOptional = () => localStorage.getItem('elevenlabs_api_key');

export type ElevenLabsVoice = {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  labels?: Record<string, string>;
  preview_url?: string;
};

export const fetchElevenLabsVoices = async (): Promise<ElevenLabsVoice[]> => {
  const key = getElevenLabsKeyOptional();
  if (!key && shouldUseByokProxy('elevenlabs')) {
    const data = await byokProxyJson<{ voices?: ElevenLabsVoice[] }>({
      provider: 'elevenlabs',
      url: `${ELEVENLABS_API_BASE}/voices`,
      method: 'GET',
      usage: {
        kind: 'other',
        model: 'elevenlabs/voices',
        units: 1,
      },
      meta: {
        billable: false,
        note: 'ElevenLabs voice list',
      },
    });
    return (data?.voices || []) as ElevenLabsVoice[];
  }
  if (!key) {
    throw new Error('ElevenLabs API Key is missing. Please add it in settings.');
  }

  const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`ElevenLabs Voice List Error (${response.status}): ${body || response.statusText}`);
  }

  const data = await response.json();
  return (data?.voices || []) as ElevenLabsVoice[];
};

export const generateSpeechWithElevenLabs = async (
  text: string,
  opts?: { voiceId?: string; modelId?: string; outputFormat?: string },
): Promise<MediaItem> => {
  const model = opts?.modelId?.includes('/') ? opts.modelId : studioSelectedModel('audio');
  return generateStudioAudio(model, text, { voice: opts?.voiceId, format: opts?.outputFormat?.split('_')[0], operation:'voice' });
};
