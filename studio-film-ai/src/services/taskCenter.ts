/**
 * Task Center — a tiny in-memory registry of long-running work (generations,
 * uploads, analyses) so the toolbar can show progress for everything at once.
 *
 * Services call `startTask()` and update the handle as they poll; UI code
 * subscribes with `subscribeTasks()` / `useTaskCenter()`.
 */

export type TaskKind = 'image' | 'video' | 'audio' | '3d' | 'analysis' | 'upload' | 'export' | 'agent' | 'other';
export type TaskStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled';

export type TaskRecord = {
  generation?: {selectedModel:string;model:string;provider:string;jobId?:string;cost?:number;totalTokens?:number};
  id: string;
  label: string;
  kind: TaskKind;
  provider?: string;
  status: TaskStatus;
  /** 0-1, or null when indeterminate. */
  progress: number | null;
  message?: string;
  startedAt: number;
  updatedAt: number;
  finishedAt?: number;
  /** Rough expected duration in ms, used to animate indeterminate jobs. */
  estimatedMs?: number;
  error?: string;
  cancel?: () => void;
};

export type TaskHandle = {
  id: string;
  update: (patch: Partial<Pick<TaskRecord, 'progress' | 'message' | 'label' | 'estimatedMs' | 'status' | 'generation'>>) => void;
  complete: (message?: string) => void;
  fail: (error: unknown) => void;
  cancel: () => void;
};

type Listener = (tasks: TaskRecord[]) => void;

const tasks = new Map<string, TaskRecord>();
const listeners = new Set<Listener>();
const DONE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_HISTORY = 500;

let counter = 0;
const nextId = () => `task-${Date.now().toString(36)}-${(counter += 1).toString(36)}`;

const snapshot = () => Array.from(tasks.values()).sort((a, b) => {
  const rank = (task: TaskRecord) => (task.status === 'running' || task.status === 'queued' ? 0 : 1);
  return rank(a) - rank(b) || b.updatedAt - a.updatedAt;
});

const HISTORY_KEY = 'bekal-studio-operation-history-v1';
const safeText = (value?: string) => value?.replace(/(?:sk-or-v1-|sk-)[A-Za-z0-9_-]+/g, '[kunci disembunyikan]').replace(/Bearer\s+[^\s]+/gi, 'Bearer [disembunyikan]');
try {
  const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  if (Array.isArray(saved)) for (const entry of saved.slice(-MAX_HISTORY)) {
    if (!entry || typeof entry.id !== 'string' || typeof entry.label !== 'string') continue;
    const interrupted = entry.status === 'running' || entry.status === 'queued';
    tasks.set(entry.id, { ...entry, cancel:undefined, ...(interrupted ? {status:'failed',message:'Sesi sebelumnya terputus. Video dengan ID tersimpan dapat dilanjutkan; periksa Activity sebelum generate ulang.',finishedAt:Date.now()} : {}) });
  }
} catch { /* storage may be disabled */ }
const emit = () => {
  const list = snapshot();
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.map(({cancel,...entry}) => ({...entry,label:safeText(entry.label),message:safeText(entry.message),error:safeText(entry.error)})))); } catch { /* task progress must keep working if local storage is full */ }
  listeners.forEach((listener) => {
    try {
      listener(list);
    } catch (error) {
      console.error('Task listener failed', error);
    }
  });
};

const prune = () => {
  const now = Date.now();
  const finished = snapshot().filter((task) => task.status !== 'running' && task.status !== 'queued');
  finished.forEach((task, index) => {
    if (index >= MAX_HISTORY || (task.finishedAt && now - task.finishedAt > DONE_TTL_MS)) {
      tasks.delete(task.id);
    }
  });
};

const patchTask = (id: string, patch: Partial<TaskRecord>) => {
  const current = tasks.get(id);
  if (!current || current.status === 'cancelled') return;
  tasks.set(id, { ...current, ...patch, updatedAt: Date.now() });
  emit();
};

export const startTask = (input: {
  label: string;
  kind?: TaskKind;
  provider?: string;
  message?: string;
  estimatedMs?: number;
  progress?: number | null;
  cancel?: () => void;
}): TaskHandle => {
  const id = nextId();
  const now = Date.now();
  tasks.set(id, {
    id,
    label: input.label,
    kind: input.kind || 'other',
    provider: input.provider,
    status: 'running',
    progress: input.progress ?? null,
    message: input.message,
    startedAt: now,
    updatedAt: now,
    estimatedMs: input.estimatedMs,
    cancel: input.cancel,
  });
  prune();
  emit();
  return {
    id,
    update: (patch) => patchTask(id, patch),
    complete: (message) => patchTask(id, { status: 'done', progress: 1, message: message || 'Done', finishedAt: Date.now() }),
    fail: (error) => patchTask(id, {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error || 'Failed'),
      message: error instanceof Error ? error.message : String(error || 'Failed'),
      finishedAt: Date.now(),
    }),
    cancel: () => {
      const current = tasks.get(id);
      patchTask(id, { status: 'cancelled', message: 'Dibatalkan. Pekerjaan di penyedia mungkin tetap berjalan.', finishedAt: Date.now() });
      current?.cancel?.();
    },
  };
};

/** Wraps a promise-returning job so success/failure is recorded automatically. */
export const trackTask = async <T>(
  input: Parameters<typeof startTask>[0],
  job: (task: TaskHandle) => Promise<T>,
): Promise<T> => {
  const task = startTask(input);
  try {
    const result = await job(task);
    const generation = (result as any)?.aiGeneration;
    if (generation) task.update({generation});
    task.complete(generation ? `Selesai: ${generation.model}${typeof generation.cost === 'number' ? `, biaya tercatat $${generation.cost}` : ', biaya akhir lihat Activity OpenRouter'}.` : undefined);
    return result;
  } catch (error) {
    task.fail(error);
    throw error;
  }
};

export const subscribeTasks = (listener: Listener) => {
  listeners.add(listener);
  listener(snapshot());
  return () => {
    listeners.delete(listener);
  };
};

export const getTasks = () => snapshot();

export const dismissTask = (id: string) => {
  const task = tasks.get(id);
  if (!task || task.status === 'running' || task.status === 'queued') return;
  tasks.delete(id);
  emit();
};

export const clearFinishedTasks = () => {
  snapshot().forEach((task) => {
    if (task.status !== 'running' && task.status !== 'queued') tasks.delete(task.id);
  });
  emit();
};

/** Estimated progress for indeterminate jobs: eases toward 90% over the expected duration. */
export const estimateProgress = (task: TaskRecord, now = Date.now()) => {
  if (task.status === 'done') return 1;
  if (typeof task.progress === 'number') return Math.min(1, Math.max(0, task.progress));
  const expected = task.estimatedMs || 60_000;
  const elapsed = now - task.startedAt;
  return Math.min(0.92, 1 - Math.exp(-elapsed / expected));
};

export const summarizeTasks = (list: TaskRecord[]) => {
  const active = list.filter((task) => task.status === 'running' || task.status === 'queued');
  const failed = list.filter((task) => task.status === 'failed');
  return { active, failed, activeCount: active.length, failedCount: failed.length };
};

export const cancelTask = (id: string) => {
  const current = tasks.get(id);
  if (!current || !['running','queued'].includes(current.status)) return;
  patchTask(id, { status:'cancelled', message:'Dibatalkan. Pekerjaan di penyedia mungkin tetap berjalan.', finishedAt:Date.now() });
  current.cancel?.();
};

export const taskHistoryBlob = () => new Blob([JSON.stringify(snapshot().map(({cancel,...entry}) => ({...entry,label:safeText(entry.label),message:safeText(entry.message),error:safeText(entry.error)})),null,2)], {type:'application/json'});
