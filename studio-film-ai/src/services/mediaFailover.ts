/** Only a definite rejection before a media job is accepted permits resubmission. */
export class MediaSubmissionRejected extends Error {
  status: number; blocked: boolean;
  constructor(provider: string, status: number, blocked = false) { super(blocked ? `Permintaan ditolak kebijakan konten ${provider}.` : `Pengiriman ke ${provider} ditolak (HTTP ${status}).`); this.status=status;this.blocked=blocked; }
}
export const canFailoverMedia = (error: unknown): boolean => error instanceof MediaSubmissionRejected && !error.blocked && [401,403,404,429,500,502,503,504].includes(error.status);
export const runSafeMediaFailover = async <T>(first: () => Promise<T>, second: (() => Promise<T>) | null, enabled: boolean, onSwitch?: () => void): Promise<T> => {
  try { return await first(); } catch (error) { if (!enabled || !second || !canFailoverMedia(error)) throw error; onSwitch?.(); return second(); }
};
