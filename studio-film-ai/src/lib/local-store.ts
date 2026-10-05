// Implements the query subset used by this application against local IndexedDB.
// The original database/component contracts are retained; no external account is required.
type Row = Record<string, unknown>;
type State = Record<string, Row[]>;
type Result = {
    data: Row[] | Row | null;
    error: Error | null;
};
const defaults: Record<string, Row> = {
    projects: { title: '', language: 'id-ID', genre: '', audience: '', tone: '', logline: '', series_promise: '', premise: { wants: '', needs: '', obstacle: '', question: '' }, visual_style: { genre_visual: '', lighting: '', color: '', texture: '', prohibited: '' }, target_episodes: 60, episode_seconds: 60, image_model: 'Midjourney / Runway Gen-4', video_model: 'Veo 3.1' },
    characters: { canonical_name: '', role: 'protagonist', age: null, gender: '', identity: {}, performance: {}, forbidden_drift: '' },
    wardrobes: { character_id: null, name: '', description: '', notes: '' },
    locations: { name: '', layout: '', materials: '', hero_objects: '', palette: '', lighting: '', forbidden_changes: '' },
    props: { name: '', description: '', state: '', narrative_function: '' },
    episodes: { number: 1, title: '', hook: '', context: '', conflict: '', escalation: '', reversal: '', consequence: '', cliffhanger: '', cliffhanger_visual: '', status: 'draft' },
    scenes: { scene_number: 1, location_id: null, time_of_day: '', objective: '', conflict: '', entry_state: '', exit_state: '', notes: '' },
    shots: { shot_number: 1, shot_size: 'MCU', camera_angle: 'eye level', lens_mm: 50, camera_move: 'locked-off', character_id: null, wardrobe_id: null, action: '', performance: '', dialogue: '', audio: '', lighting: '', blocking: '', duration: 4, notes: '', qc_status: 'pending', qc_notes: '' },
    keyframes: { seed: 1, params: { expression: 'neutral', light_side: 'left', intensity: .6 }, approved: false },
    canvas_nodes: { kind: 'note', title: '', body: '', meta: {}, status: 'draft', x: 0, y: 0, shot_id: null, character_id: null, scene_id: null, episode_id: null },
    canvas_edges: {},
};
const links: [
    string,
    string,
    string,
    'cascade' | 'null'
][] = [
    ...Object.keys(defaults).filter(t => t !== 'projects').map(t => [t, 'project_id', 'projects', 'cascade'] as [
        string,
        string,
        string,
        'cascade'
    ]),
    ['wardrobes', 'character_id', 'characters', 'null'], ['scenes', 'episode_id', 'episodes', 'cascade'], ['scenes', 'location_id', 'locations', 'null'],
    ['shots', 'scene_id', 'scenes', 'cascade'], ['shots', 'character_id', 'characters', 'null'], ['shots', 'wardrobe_id', 'wardrobes', 'null'],
    ['keyframes', 'shot_id', 'shots', 'cascade'], ['canvas_nodes', 'shot_id', 'shots', 'null'], ['canvas_nodes', 'scene_id', 'scenes', 'null'],
    ['canvas_nodes', 'episode_id', 'episodes', 'null'], ['canvas_nodes', 'character_id', 'characters', 'null'],
    ['canvas_edges', 'source_id', 'canvas_nodes', 'cascade'], ['canvas_edges', 'target_id', 'canvas_nodes', 'cascade'],
];
let database: Promise<IDBDatabase> | undefined;
function open() { return database ||= new Promise<IDBDatabase>((resolve, reject) => { const req = indexedDB.open('bekal-cinematic-studio', 1); req.onupgradeneeded = () => req.result.createObjectStore('state'); req.onsuccess = () => resolve(req.result); req.onerror = () => { database = undefined; reject(new Error('Penyimpanan browser tidak tersedia. Izinkan penyimpanan situs agar proyek bisa disimpan.')); }; }); }
function empty(): State { return Object.fromEntries(Object.keys(defaults).map(t => [t, []])); }
function remove(state: State, table: string, ids: Set<unknown>) { state[table] = state[table].filter(r => !ids.has(r.id)); for (const [child, field, parent, mode] of links) {
    if (parent !== table)
        continue;
    const affected = state[child].filter(r => ids.has(r[field]));
    if (mode === 'cascade')
        remove(state, child, new Set(affected.map(r => r.id)));
    else
        for (const row of affected)
            row[field] = null;
} }
function validate(state: State) { for (const [table, field, parent] of links)
    for (const row of state[table])
        if (row[field] != null && !state[parent].some(p => p.id === row[field]))
            throw new Error(`Data ${table}.${field} tidak memiliki induk yang valid.`); for (const table of Object.keys(state)) {
    const ids = new Set();
    for (const r of state[table]) {
        if (ids.has(r.id))
            throw Error('ID berulang.');
        ids.add(r.id);
    }
} const ep = new Set(); for (const row of state.episodes) {
    const key = `${row.project_id}:${row.number}`;
    if (ep.has(key))
        throw Error('Nomor episode sudah dipakai dalam proyek ini.');
    ep.add(key);
} const frames = new Set(); for (const row of state.keyframes) {
    if (frames.has(row.shot_id))
        throw Error('Keyframe shot sudah tersedia.');
    frames.add(row.shot_id);
} }
class Query implements PromiseLike<Result> {
    private mode: 'read' | 'insert' | 'update' | 'delete' | 'upsert' = 'read';
    private values: Row[] = [];
    private filters: ((r: Row) => boolean)[] = [];
    private sorting: [
        string,
        boolean
    ][] = [];
    private one = false;
    private conflict = 'id';
    private promise: Promise<Result> | undefined;
    constructor(private table: string) { }
    select() { return this; }
    insert(value: Row | Row[]) { this.mode = 'insert'; this.values = Array.isArray(value) ? value : [value]; return this; }
    upsert(value: Row | Row[], options?: {
        onConflict?: string;
    }) { this.mode = 'upsert'; this.values = Array.isArray(value) ? value : [value]; this.conflict = options?.onConflict || 'id'; return this; }
    update(value: Row) { this.mode = 'update'; this.values = [value]; return this; }
    delete() { this.mode = 'delete'; return this; }
    eq(key: string, value: unknown) { this.filters.push(r => r[key] === value); return this; }
    in(key: string, values: unknown[]) { this.filters.push(r => values.includes(r[key])); return this; }
    or(expression: string) { const parts = expression.split(',').map(part => { const m = part.match(/^([a-z_]+)\.eq\.(.+)$/); if (!m)
        throw Error('Filter lokal belum didukung.'); return [m[1], m[2]]; }); this.filters.push(r => parts.some(([k, v]) => String(r[k]) === v)); return this; }
    order(key: string, options?: {
        ascending?: boolean;
    }) { this.sorting.push([key, options?.ascending !== false]); return this; }
    single() { this.one = true; return this; }
    then<T = Result, U = never>(ok?: ((value: Result) => T | PromiseLike<T>) | null, bad?: ((reason: unknown) => U | PromiseLike<U>) | null): PromiseLike<T | U> { return (this.promise ||= this.execute()).then(ok, bad); }
    private async execute(): Promise<Result> { try {
        if (!(this.table in defaults))
            throw Error('Tabel tidak dikenal.');
        const db = await open();
        return await new Promise<Result>((resolve, reject) => { const tx = db.transaction('state', this.mode === 'read' ? 'readonly' : 'readwrite'), store = tx.objectStore('state'), req = store.get('current'); let result: Result = { data: [], error: null }; tx.oncomplete = () => resolve(result); tx.onerror = tx.onabort = () => reject(tx.error || result.error || Error('Data belum tersimpan.')); req.onsuccess = () => { try {
            const state: State = req.result || empty(), matches = (r: Row) => this.filters.every(fn => fn(r));
            let rows = state[this.table].filter(matches);
            if (this.mode === 'insert' || this.mode === 'upsert') {
                rows = this.values.map(value => { const existing = this.mode === 'upsert' ? state[this.table].find(r => r[this.conflict] === value[this.conflict]) : undefined; if (existing) {
                    Object.assign(existing, structuredClone(value));
                    return existing;
                } const row = { ...structuredClone(defaults[this.table]), id: crypto.randomUUID(), created_at: new Date().toISOString(), ...structuredClone(value) }; state[this.table].push(row); return row; });
            }
            else if (this.mode === 'update') {
                for (const row of rows)
                    Object.assign(row, structuredClone(this.values[0]));
            }
            else if (this.mode === 'delete') {
                remove(state, this.table, new Set(rows.map(r => r.id)));
            }
            for (const [field, asc] of [...this.sorting].reverse())
                rows = [...rows].sort((a, b) => a[field] === b[field] ? 0 : (a[field] == null ? -1 : b[field] == null ? 1 : a[field]! < b[field]! ? -1 : 1) * (asc ? 1 : -1));
            if (this.mode !== 'read') {
                validate(state);
                store.put(state, 'current');
            }
            if (this.one && rows.length !== 1)
                throw Error('Data yang diminta tidak ditemukan atau berulang.');
            result = { data: structuredClone(this.one ? rows[0] : rows), error: null };
        }
        catch (e) {
            result = { data: null, error: e instanceof Error ? e : new Error(String(e)) };
            tx.abort();
        } }; });
    }
    catch (e) {
        return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    } }
}
export const localClient = { from: (table: string) => new Query(table) };
