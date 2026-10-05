import { Workspace } from '../types';

export type UIMode = 'beginner' | 'advanced' | 'pro';

export const UI_MODE_STORAGE_KEY = 'ui_mode_v1';
export const DEFAULT_UI_MODE: UIMode = 'beginner';

export const UI_MODE_META: Record<UIMode, { label: string; description: string; emoji: string }> = {
    beginner: {
        label: 'Dasar',
        description: 'Alat utama untuk mulai membuat video.',
        emoji: '🎬',
    },
    advanced: {
        label: 'Lengkap',
        description: 'Pilihan alat untuk produksi sehari-hari.',
        emoji: '🎯',
    },
    pro: {
        label: 'Pro',
        description: 'Semua ruang kerja dan kontrol produksi.',
        emoji: '⚡',
    },
};

const MODE_WORKSPACES: Record<UIMode, Workspace[]> = {
    beginner: [
        'PROJECT',
        'MICRODRAMA',
        'IMPORT',
        'DESIGN',
        'IMAGE_GEN',
        'VIDEO_GEN',
        'EDIT',
        'SOUND',
        'EXPORT',
        'PLUGINS',
        'TEAM',
    ],
    advanced: [
        'PROJECT',
        'MICRODRAMA',
        'ASSET_LIBRARY',
        'MOODBOARD',
        'NOTEBOOKLM',
        'PLUGINS',
        'TEAM',
        'IMPORT',
        'DESIGN',
        'IMAGE_GEN',
        'VIDEO_GEN',
        'NODES',
        'SCENE_MAP',
        'AVATAR',
        'SOUND',
        'EDIT',
        'PHOTO',
        'UPSCALE',
        'COMPOSITING',
        'TRIM',
        'POST',
        'ANALYSIS',
        'REVIEW',
        'REQUESTS',
        'EXPORT',
    ],
    pro: [
        'PROJECT',
        'MICRODRAMA',
        'ASSET_LIBRARY',
        'MOODBOARD',
        'NOTEBOOKLM',
        'PLUGINS',
        'TEAM',
        'IMPORT',
        'DESIGN',
        'IMAGE_GEN',
        'VIDEO_GEN',
        'NODES',
        'SET_DESIGN',
        'SCENE_MAP',
        'WORLD_GEN',
        'AVATAR',
        'SOUND',
        'EDIT',
        'PHOTO',
        'UPSCALE',
        'COMPOSITING',
        'TRIM',
        'POST',
        'ANALYSIS',
        'REVIEW',
        'REQUESTS',
        'EXPORT',
    ],
};

const BEGINNER_LABELS: Partial<Record<Workspace, string>> = {
    PROJECT: 'Proyek Saya',
    MICRODRAMA: 'Serial Pendek 9:16',
    IMPORT: 'Unggah Media',
    DESIGN: 'Design',
    IMAGE_GEN: 'Gambar AI',
    VIDEO_GEN: 'Video AI',
    EDIT: 'Edit Video',
    SOUND: 'Musik',
    EXPORT: 'Ekspor',
};

const ADVANCED_LABELS: Partial<Record<Workspace, string>> = {
    IMAGE_GEN: 'Gambar AI',
    VIDEO_GEN: 'Video AI',
    COMPOSITING: 'Comp',
    ANALYSIS: 'QC',
};

const BEGINNER_GROUP_LABELS: Record<string, string> = {
    PROJECTS: 'Mulai',
    CREATE: 'Buat',
    EDITING: 'Edit',
    REVIEW: 'Review',
    DELIVERY: 'Selesai',
};

const ADVANCED_GROUP_LABELS: Record<string, string> = {
    PROJECTS: 'Project',
    CREATE: 'Produksi',
    EDITING: 'Post',
    REVIEW: 'Review',
    DELIVERY: 'Ekspor',
};

export const normalizeUIMode = (value: unknown): UIMode => {
    if (value === 'beginner' || value === 'advanced' || value === 'pro') {
        return value;
    }
    return DEFAULT_UI_MODE;
};

export const getAllowedWorkspacesForMode = (mode: UIMode): Workspace[] => {
    return MODE_WORKSPACES[mode];
};

export const filterWorkspacesForRole = (workspaces: Workspace[], isDirector: boolean): Workspace[] => {
    return workspaces.filter((workspace) => {
        if (workspace === 'REVIEW') return isDirector;
        if (workspace === 'REQUESTS') return !isDirector;
        return true;
    });
};

export const getWorkspaceDisplayLabel = (workspace: Workspace, fallback: string, mode: UIMode): string => {
    if (mode === 'beginner') {
        return BEGINNER_LABELS[workspace] || fallback;
    }
    if (mode === 'advanced') {
        return ADVANCED_LABELS[workspace] || fallback;
    }
    return fallback;
};

export const getWorkspaceGroupDisplayLabel = (groupId: string, fallback: string, mode: UIMode): string => {
    if (mode === 'beginner') {
        return BEGINNER_GROUP_LABELS[groupId] || fallback;
    }
    if (mode === 'advanced') {
        return ADVANCED_GROUP_LABELS[groupId] || fallback;
    }
    return fallback;
};
