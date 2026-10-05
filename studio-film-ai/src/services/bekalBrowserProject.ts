// Bekal browser adapter for the upstream project contract. No Electron API is exposed.
import type { ElectronProjectApi } from '../types';
export const isBekalBrowser = typeof window !== 'undefined' && !window.electron?.project;
const DB = 'bekal-video-editor';
type Stored = {
    path: string;
    name: string;
    project?: any;
    files: Record<string, Blob>;
    mtime: number;
};
let connection: Promise<IDBDatabase> | undefined;
const open = () => connection ??= new Promise<IDBDatabase>((resolve, reject) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore('projects', { keyPath: 'path' }); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(new Error('Penyimpanan browser tidak tersedia. Izinkan penyimpanan situs.')); });
async function get(path: string): Promise<Stored | undefined> { const db = await open(); return new Promise((resolve, reject) => { const r = db.transaction('projects').objectStore('projects').get(path); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
async function mutate(path: string, change: (row: Stored) => void) { const db = await open(); return new Promise<void>((resolve, reject) => { const tx = db.transaction('projects', 'readwrite'), store = tx.objectStore('projects'), r = store.get(path); r.onsuccess = () => { try {
    const row: Stored = r.result || { path, name: 'Proyek Baru', files: {}, mtime: Date.now() };
    change(row);
    row.mtime = Date.now();
    store.put(row);
}
catch (e) {
    tx.abort();
    reject(e);
} }; tx.oncomplete = () => resolve(); tx.onabort = tx.onerror = () => reject(tx.error || new Error('Proyek gagal disimpan. Periksa ruang penyimpanan browser.')); }); }
export async function listBrowserProjects(): Promise<Stored[]> { const db = await open(); return new Promise((resolve, reject) => { const r = db.transaction('projects').objectStore('projects').getAll(); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
const urls = new Map<string, string>();
export function browserAssetUrl(path: string, asset: string) { const url = urls.get(path + '/' + asset); if (!url)
    throw new Error('Media proyek tidak ditemukan: ' + asset); return url; }
function expose(row: Stored) { for (const [name, blob] of Object.entries(row.files)) {
    const key = row.path + '/' + name, old = urls.get(key);
    if (old)
        URL.revokeObjectURL(old);
    urls.set(key, URL.createObjectURL(blob));
} }
function bytes(data: ArrayBuffer | string, encoding?: string): Blob { if (typeof data !== 'string')
    return new Blob([data]); if (encoding === 'utf8')
    return new Blob([data], { type: 'text/plain' }); const binary = atob(data), arr = Uint8Array.from(binary, c => c.charCodeAt(0)); return new Blob([arr]); }
function mimeFor(name: string) { const ext = name.split('.').pop()?.toLowerCase(); return ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', webm: 'video/webm', mp4: 'video/mp4', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', json: 'application/json' } as Record<string, string>)[ext || ''] || 'application/octet-stream'; }
async function choose(allowCreate: boolean): Promise<string | null> { const rows = (await listBrowserProjects()).filter(p => p.project); return new Promise(resolve => { const dialog = document.createElement('dialog'); dialog.className = 'bekal-project-dialog app-modal'; dialog.innerHTML = '<form method="dialog"><h2>Proyek di perangkat ini</h2><p>Proyek dan media disimpan di browser. Unduh cadangan untuk menyimpannya di perangkat lain.</p><label>Pilih proyek<select name="project"><option value="">Pilih proyek tersimpan</option></select></label>' + (allowCreate ? '<label>Nama proyek baru<input name="title" placeholder="Contoh: Cerita di Kampung" autocomplete="off"></label>' : '') + '<p role="alert"></p><div><button value="cancel" type="submit">Batal</button><button value="open" type="submit">Buka proyek</button>' + (allowCreate ? '<button value="create" type="submit">Buat proyek</button>' : '') + '</div></form>'; const select = dialog.querySelector('select')!; for (const row of rows) {
    const option = document.createElement('option');
    option.value = row.path;
    option.textContent = row.project?.name || row.name;
    select.appendChild(option);
} dialog.querySelector('form')!.addEventListener('submit', async (e) => { e.preventDefault(); const action = (e as SubmitEvent).submitter?.getAttribute('value'); if (action === 'cancel') {
    dialog.close();
    return;
} if (action === 'open' && select.value) {
    dialog.dataset.path = select.value;
    dialog.close();
    return;
} const title = dialog.querySelector<HTMLInputElement>('input')?.value.trim(); if (action === 'create' && title) {
    const path = 'browser/' + crypto.randomUUID();
    await mutate(path, row => { row.name = title; });
    dialog.dataset.path = path;
    dialog.close();
    return;
} dialog.querySelector('[role=alert]')!.textContent = 'Pilih proyek atau isi nama proyek baru.'; }); dialog.addEventListener('close', () => { const path = dialog.dataset.path || null; dialog.remove(); resolve(path); }, { once: true }); document.body.appendChild(dialog); dialog.showModal(); }); }
export async function downloadBrowserProject(path: string) { const row = await get(path); if (!row?.project)
    throw new Error('Simpan proyek sebelum mengunduh cadangan.'); const assets = []; for (const [relativePath, blob] of Object.entries(row.files)) {
    const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
    assets.push({ relativePath, data, mime: blob.type });
} const blob = new Blob([JSON.stringify({ format: 'bekal-video-project', version: 1, project: row.project, assets })], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (row.project.name || row.name || 'proyek') + '.bekal-film.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 60000); }
export async function importBrowserProject(file: File) { const bundle = JSON.parse(await file.text()); if (bundle.format !== 'bekal-video-project' || bundle.version !== 1 || !bundle.project || !Array.isArray(bundle.assets))
    throw new Error('Cadangan proyek tidak valid.'); const path = 'browser/' + crypto.randomUUID(); const files: Record<string, Blob> = {}; for (const asset of bundle.assets) {
    if (typeof asset.relativePath !== 'string' || asset.relativePath.includes('..') || asset.relativePath.startsWith('/') || typeof asset.data !== 'string')
        throw new Error('Jalur media tidak valid.');
    files[asset.relativePath] = new Blob([await bytes(asset.data).arrayBuffer()], { type: asset.mime || mimeFor(asset.relativePath) });
} await mutate(path, row => { row.project = bundle.project; row.name = bundle.project.name; row.files = files; }); return path; }
export const browserProjectApi: ElectronProjectApi = {
    selectFolder: () => choose(true), selectFile: () => choose(false),
    probeFolder: async ({ folderPath }) => ({ exists: !!(await get(folderPath))?.project }),
    initFolder: async ({ folderPath }) => { await mutate(folderPath, () => { }); return { ok: true }; },
    saveProject: async ({ folderPath, project, assets = [] }) => { await mutate(folderPath, row => { row.project = structuredClone(project); row.name = project.name || row.name; for (const a of assets)
        row.files[a.relativePath] = a.encoding ? bytes(a.data, a.encoding) : new Blob([a.data], { type: mimeFor(a.relativePath) }); row.files['project.json'] = new Blob([JSON.stringify(project)], { type: 'application/json' }); }); localStorage.setItem('bekal-editor-last-project', folderPath); return { ok: true }; },
    loadProject: async ({ folderPath }) => { const row = await get(folderPath); if (!row?.project)
        throw new Error('Proyek belum disimpan.'); expose(row); localStorage.setItem('bekal-editor-last-project', folderPath); return { project: structuredClone(row.project) }; },
    statProject: async ({ folderPath }) => { const row = await get(folderPath); return { exists: !!row?.project, mtimeMs: row?.mtime, size: row?.files['project.json']?.size }; },
    statProjectPath: async ({ folderPath, relativePath }) => { const row = await get(folderPath); return { exists: !!row?.files[relativePath], mtimeMs: row?.mtime, size: row?.files[relativePath]?.size }; },
    readProjectFile: async ({ folderPath, relativePath }) => { const blob = (await get(folderPath))?.files[relativePath]; return blob ? new Uint8Array(await blob.arrayBuffer()) : null; },
    writeProjectFile: async ({ folderPath, relativePath, data, encoding }) => { const blob = bytes(data, encoding); await mutate(folderPath, row => { row.files[relativePath] = blob; if (relativePath === 'project.json')
        row.project = JSON.parse(data); }); return { ok: true }; },
    deleteProjectFile: async ({ folderPath, relativePath }) => { await mutate(folderPath, row => { delete row.files[relativePath]; }); return { ok: true }; },
    openFolder: async ({ folderPath }) => { await downloadBrowserProject(folderPath); return { ok: true, error: null }; },
    exportVideo: async () => ({ ok: false, error: 'Ekspor FFmpeg memerlukan aplikasi desktop. Gunakan ekspor WebM di browser.' }),
    onExportProgress: () => { }, removeExportProgressListener: () => { },
};
export async function browserProjectName(path: string) { return (await get(path))?.name || 'Proyek Baru'; }
