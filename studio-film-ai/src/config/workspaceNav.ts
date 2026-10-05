import type React from 'react';
import type { Workspace } from '../types';
import { UIMode, getWorkspaceDisplayLabel, getWorkspaceGroupDisplayLabel } from './uiModes';
import {
  ScriptIcon,
  BoxIcon,
  UploadIcon,
  EditIcon,
  TrimIcon,
  ColorIcon,
  ExportIcon,
  ImageIcon,
  VideoIcon,
  SparklesIcon,
  UserCircleIcon,
  BrainCircuitIcon,
  ClipboardCheckIcon,
  ListIcon,
  LayersIcon,
  MusicNoteIcon,
  MapIcon,
  GridIcon,
  ClapperboardIcon,
  BrainIcon,
  WandSparklesIcon,
  LandscapeIcon,
  CameraIcon,
  FilmIcon,
  PaletteIcon,
  ApertureIcon,
} from '../components/icons';

export type WorkspaceNavIcon = React.FC<{ className?: string }>;

export type WorkspaceNavItem = {
  id: Workspace;
  name: string;
  description: string;
  icon: WorkspaceNavIcon;
};

export type WorkspaceNavGroup = {
  id: string;
  name: string;
  description: string;
  icon: WorkspaceNavIcon;
  items: WorkspaceNavItem[];
};

export const WORKSPACE_NAV_GROUPS: WorkspaceNavGroup[] = [
  {
    id: 'PROJECTS',
    name: 'Proyek',
    description: 'Arahan, aset, dan riset',
    icon: ScriptIcon,
    items: [
      { id: 'PROJECT', name: 'Proyek', description: 'Cerita, adegan, dan rencana produksi', icon: ClapperboardIcon },
      { id: 'MICRODRAMA', name: 'Drama pendek', description: 'Pembuatan serial vertikal 9:16', icon: FilmIcon },
      { id: 'ASSET_LIBRARY', name: 'Pustaka Media', description: 'Media dan paket yang bisa digunakan ulang', icon: BoxIcon },
      { id: 'MOODBOARD', name: 'Papan referensi', description: 'Arahan dan referensi visual', icon: PaletteIcon },
      { id: 'NOTEBOOKLM', name: 'Riset', description: 'Catatan sumber dan konteks', icon: BrainIcon },
      { id: 'TEAM', name: 'Tim', description: 'Kolaborasi, ruang bersama, dan percakapan', icon: UserCircleIcon },
      { id: 'PLUGINS', name: 'Plugin', description: 'Paket, LUT, dan plugin aplikasi', icon: LayersIcon },
    ],
  },
  {
    id: 'CREATE',
    name: 'Produksi',
    description: 'Buat dan impor media',
    icon: SparklesIcon,
    items: [
      { id: 'IMPORT', name: 'Unggah Media', description: 'Impor rekaman dan audio', icon: UploadIcon },
      { id: 'DESIGN', name: 'Konsep visual', description: 'Susun judul dan materi media sosial', icon: ImageIcon },
      { id: 'IMAGE_GEN', name: 'Gambar AI', description: 'Buat gambar dan referensi', icon: WandSparklesIcon },
      { id: 'VIDEO_GEN', name: 'Video AI', description: 'Buat klip bergerak', icon: VideoIcon },
      { id: 'NODES', name: 'Alur node', description: 'Susun alur AI lanjutan', icon: LayersIcon },
      { id: 'SET_DESIGN', name: 'Set Design', description: 'Atur properti dan kamera', icon: CameraIcon },
      { id: 'SCENE_MAP', name: 'Scene Map', description: 'Petakan urutan dan lokasi adegan', icon: GridIcon },
      { id: 'WORLD_GEN', name: 'Dunia 3D', description: 'Kembangkan dunia dan latar cerita', icon: LandscapeIcon },
      { id: 'AVATAR', name: 'Avatar', description: 'Karakter dan pembawa acara', icon: UserCircleIcon },
      { id: 'SOUND', name: 'Audio', description: 'Voice, music, and effects', icon: MusicNoteIcon },
    ],
  },
  {
    id: 'EDITING',
    name: 'Edit',
    description: 'Cut, enhance, finish',
    icon: EditIcon,
    items: [
      { id: 'EDIT', name: 'Timeline Video', description: 'Assemble the main timeline', icon: EditIcon },
      { id: 'PHOTO', name: 'Foto', description: 'Retouch and prepare stills', icon: ApertureIcon },
      { id: 'UPSCALE', name: 'Perbesar resolusi', description: 'Improve resolution and detail', icon: SparklesIcon },
      { id: 'COMPOSITING', name: 'Composite', description: 'Layer, key, and blend shots', icon: LayersIcon },
      { id: 'TRIM', name: 'Potong durasi', description: 'Tighten selected clips', icon: TrimIcon },
      { id: 'POST', name: 'Warna Video', description: 'Grade and polish the look', icon: ColorIcon },
    ],
  },
  {
    id: 'REVIEW',
    name: 'Tinjau',
    description: 'Check quality and requests',
    icon: BrainCircuitIcon,
    items: [
      { id: 'ANALYSIS', name: 'Analisis', description: 'Find pacing and quality issues', icon: BrainCircuitIcon },
      { id: 'REVIEW', name: 'Director', description: 'Approve and annotate work', icon: ClipboardCheckIcon },
      { id: 'REQUESTS', name: 'Permintaan Revisi', description: 'Handle change requests', icon: ListIcon },
    ],
  },
  {
    id: 'DELIVERY',
    name: 'Ekspor',
    description: 'Render and deliver',
    icon: ExportIcon,
    items: [{ id: 'EXPORT', name: 'Ekspor Video', description: 'Choose format and render', icon: ExportIcon }],
  },
];

export type ResolveWorkspaceNavParams = {
  activeWorkspace: Workspace;
  uiMode: UIMode;
  allowedWorkspaces?: Workspace[];
  showReview?: boolean;
  showRequests?: boolean;
};

export type ResolvedWorkspaceNav = {
  groups: WorkspaceNavGroup[];
  items: WorkspaceNavItem[];
  activeGroup: WorkspaceNavGroup | undefined;
  activeItem: WorkspaceNavItem | undefined;
  activeIndex: number;
  nextItem: WorkspaceNavItem | undefined;
  previousItem: WorkspaceNavItem | undefined;
};

/**
 * Filters the static nav tree to what the current mode/role can see and
 * resolves the active + neighbouring entries. Shared by the sidebar and the
 * toolbar breadcrumb so both always agree.
 */
export const resolveWorkspaceNav = ({
  activeWorkspace,
  uiMode,
  allowedWorkspaces,
  showReview = true,
  showRequests = true,
}: ResolveWorkspaceNavParams): ResolvedWorkspaceNav => {
  const allowed = allowedWorkspaces ? new Set(allowedWorkspaces) : null;

  const groups = WORKSPACE_NAV_GROUPS
    .map((group) => {
      const items = group.items
        .filter((item) => {
          if (allowed && !allowed.has(item.id)) return false;
          if (!showReview && item.id === 'REVIEW') return false;
          if (!showRequests && item.id === 'REQUESTS') return false;
          return true;
        })
        .map((item) => ({
          ...item,
          name: getWorkspaceDisplayLabel(item.id, item.name, uiMode),
        }));
      return {
        ...group,
        name: getWorkspaceGroupDisplayLabel(group.id, group.name, uiMode),
        items,
      };
    })
    .filter((group) => group.items.length > 0);

  const items = groups.flatMap((group) => group.items);
  const activeGroup = groups.find((group) => group.items.some((item) => item.id === activeWorkspace));
  const activeItem = activeGroup?.items.find((item) => item.id === activeWorkspace);
  const activeIndex = items.findIndex((item) => item.id === activeWorkspace);

  return {
    groups,
    items,
    activeGroup,
    activeItem,
    activeIndex,
    nextItem: activeIndex >= 0 ? items[activeIndex + 1] : undefined,
    previousItem: activeIndex > 0 ? items[activeIndex - 1] : undefined,
  };
};
