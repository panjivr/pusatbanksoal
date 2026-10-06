import { projectFingerprint } from './projectSerialization.ts';
export type VideoJob = { id?: string; model: string; status: string; updatedAt: number };
const prefix = 'bekal-openrouter-video-job-v1:';
export const videoRequestKey = (request: unknown) => prefix + projectFingerprint(request);
export const readVideoJob = (key: string): VideoJob | null => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { const job = JSON.parse(raw); if (typeof job.model === 'string' && typeof job.status === 'string' && (!job.id || validVideoJobId(job.id))) return job; } catch { /* keep damaged records: don't risk a second submission */ }
  throw new Error('Catatan video tidak dapat dibaca. Periksa Activity OpenRouter sebelum generate ulang.');
};
export const writeVideoJob = (key: string, job: VideoJob) => { localStorage.setItem(key, JSON.stringify(job)); };
export const validVideoJobId = (id: unknown): id is string => typeof id === 'string' && id.length > 0 && id.length <= 512 && !/[\s\x00-\x1f\x7f/\\?#]/.test(id) && id !== '.' && id !== '..';
