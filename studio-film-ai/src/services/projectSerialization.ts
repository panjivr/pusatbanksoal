/** Emit bounded JSON pieces without creating one string containing every generated frame. */
export function* jsonChunks(value: any, active = new Set<object>()): Generator<string> {
    if (typeof value === 'string') {
        yield '"';
        for (let i = 0; i < value.length; i += 32768) yield JSON.stringify(value.slice(i, i + 32768)).slice(1, -1);
        yield '"'; return;
    }
    if (value == null || typeof value !== 'object') { yield JSON.stringify(value) ?? 'null'; return; }
    if (typeof value.toJSON === 'function') { yield* jsonChunks(value.toJSON(), active); return; }
    if (active.has(value)) throw new Error('Data proyek memiliki rujukan melingkar.');
    active.add(value);
    if (Array.isArray(value)) {
        yield '['; for (let i = 0; i < value.length; i++) { if (i) yield ','; yield* jsonChunks(value[i], active); } yield ']';
    } else {
        yield '{'; let first = true;
        for (const key of Object.keys(value)) { const child = value[key]; if (child === undefined || typeof child === 'function' || typeof child === 'symbol') continue; if (!first) yield ','; first = false; yield* jsonChunks(key, active); yield ':'; yield* jsonChunks(child, active); } yield '}';
    }
    active.delete(value);
}
export function projectJsonBlob(value: any) {
    const parts: string[] = []; let buffer = '';
    for (const chunk of jsonChunks(value)) {
        if (buffer.length + chunk.length > 65536) {parts.push(buffer);buffer='';}
        buffer += chunk;
    }
    if (buffer) parts.push(buffer);
    return new Blob(parts, {type:'application/json'});
}
/** Same content still produces the same signature, including changes to image data. */
export function projectFingerprint(value: any) {
    let a = 2166136261, b = 5381, size = 0;
    for (const part of jsonChunks(value)) { size += part.length; for (let i = 0; i < part.length; i++) { const c = part.charCodeAt(i); a = Math.imul(a ^ c, 16777619); b = Math.imul(b, 33) ^ c; } }
    return `${a >>> 0}:${b >>> 0}:${size}`;
}
