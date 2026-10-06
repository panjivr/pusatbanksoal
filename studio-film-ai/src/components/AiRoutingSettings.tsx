import React, { useState } from 'react';
import { AiRouteError, defaultAiRouting, gatewayGenerate, isOpenRouter, resolveOpenRouterRoute, normalizeAiBaseUrl, readAiRouting, saveAiRouting, type AiRoute } from '../services/aiRouting';

const AiRoutingSettings: React.FC = () => {
  const [config, setConfig] = useState(readAiRouting);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const update = (id: string, patch: Partial<AiRoute>) => { setConfig(c => ({ ...c, routes: c.routes.map(r => r.id === id ? { ...r, ...patch } : r) })); setMessage('Ada perubahan yang belum disimpan.'); };
  const move = (index: number, direction: number) => setConfig(c => { const routes = [...c.routes]; [routes[index], routes[index + direction]] = [routes[index + direction], routes[index]]; return { ...c, routes }; });
  const save = () => { try { saveAiRouting(config); setConfig(readAiRouting()); setMessage('Konfigurasi tersimpan. Urutan di bawah menjadi urutan layanan cadangan.'); } catch (e) { setMessage(e instanceof Error ? e.message : 'Konfigurasi belum tersimpan.'); } };
  const test = async (route: AiRoute) => {
    if (!route.baseUrl.trim() || !route.model.trim()) { setMessage('Isi alamat API dan model/kombo sebelum menguji.'); return; }
    setBusy(route.id); setMessage(`Menguji ${route.name}...`);
    try {
      normalizeAiBaseUrl(route.baseUrl);
      const resolved = await resolveOpenRouterRoute(route);
      await gatewayGenerate(resolved, { model: 'text', contents: 'Jawab hanya: Siap.' }, Math.min(config.timeoutSeconds, 20));
      if (isOpenRouter(route)) {
        if (resolved.tools) {
          const probe = await gatewayGenerate(resolved, { model: 'text', contents: 'Panggil fungsi cek_koneksi dengan nilai siap true. Jangan menjalankan fungsi lain.', config: {
            tools: [{ functionDeclarations: [{ name: 'cek_koneksi', parameters: { type: 'object', properties: { siap: { type: 'boolean' } }, required: ['siap'] } }] }],
            toolConfig: { functionCallingConfig: { mode: 'ANY' } },
          } }, Math.min(config.timeoutSeconds, 20));
          if (probe.functionCalls?.[0]?.name !== 'cek_koneksi' || probe.functionCalls[0].args.siap !== true) throw new AiRouteError('Model menjawab teks, tetapi uji panggilan alat belum berhasil. Coba model lain.', 422);
        }
        const jsonProbe = await gatewayGenerate(resolved, { model: 'text', contents: 'Keluarkan JSON dengan siap bernilai true.', config: { responseMimeType: 'application/json', responseSchema: { type: 'OBJECT', properties: { siap: { type: 'BOOLEAN' } }, required: ['siap'] } } }, Math.min(config.timeoutSeconds, 20));
        if (JSON.parse(jsonProbe.text).siap !== true) throw new AiRouteError('Uji JSON belum memberikan hasil yang diminta. Coba model lain.', 422);
        update(route.id, { tools: resolved.tools, json: resolved.json, vision: resolved.vision });
        setMessage(`${route.name} berhasil diuji untuk teks dan JSON${resolved.tools ? ', serta panggilan alat editor' : '. Model ini tidak mendukung panggilan alat editor'}. Simpan konfigurasi untuk menggunakannya.`);
      } else setMessage(`${route.name} berhasil menjawab. Simpan konfigurasi untuk menggunakannya.`);
    } catch (e) { setMessage(e instanceof AiRouteError || e instanceof Error ? e.message : 'Koneksi belum berhasil.'); }
    finally { setBusy(null); }
  };
  return <section className="ai-routing-settings" aria-labelledby="ai-routing-title">
    <h3 id="ai-routing-title">Router AI dan layanan cadangan</h3>
    <p className="pk-hint">Hubungkan 9Router melalui API yang kompatibel dengan OpenAI. Masukkan nama model atau kombo dari dashboard 9Router. Kombo dapat mengatur pergantian model dan akun di 9Router.</p>
    <p className="pk-hint">9Router berjalan sebagai layanan terpisah milikmu. Gunakan alamat HTTPS yang dapat diakses browser dan mengizinkan CORS dari pusatbanksoal.id. Alamat localhost merujuk ke perangkat yang sedang membuka web ini.</p>
    <label className="ai-route-check"><input type="checkbox" checked={config.preferGateway} onChange={e => setConfig(c => ({ ...c, preferGateway: e.target.checked }))} /> Utamakan router, gunakan Gemini sebagai cadangan</label>
    <label className="ai-route-check"><input type="checkbox" checked={config.fallback} onChange={e => setConfig(c => ({ ...c, fallback: e.target.checked }))} /> Pindah otomatis saat kunci tidak valid, kuota habis, koneksi gagal, atau layanan sibuk</label>
    <label className="ai-route-check"><input type="checkbox" checked={config.mediaFallback} onChange={e => setConfig(c => ({ ...c, mediaFallback: e.target.checked }))} /> Gunakan penyedia cadangan untuk model video yang sama jika pengiriman awal ditolak</label>
    <p className="pk-hint">Cadangan video berlaku untuk model katalog yang tersedia di fal.ai dan Higgsfield, jika kedua kunci sudah diisi. Pekerjaan yang sudah diterima, sedang diproses, dibatalkan, atau ditolak kebijakan konten tidak dikirim ulang.</p>
    <label className="pk-field"><span>Batas waktu tiap layanan (detik)</span><input className="app-input" type="number" min="10" max="120" value={config.timeoutSeconds} onChange={e => setConfig(c => ({ ...c, timeoutSeconds: Math.max(10, Math.min(120, Number(e.target.value) || 45)) }))} /></label>
    <p className="pk-hint">Perpindahan otomatis mengirim permintaan ke layanan berikutnya yang kamu aktifkan. Biaya mengikuti penyedia. Permintaan yang ditolak kebijakan konten tidak diteruskan. Untuk membuat gambar lewat OpenRouter, pilih OpenRouter (gambar) pada pengaturan penyedia Google. Video, audio, dan siaran langsung memakai API penyedia media. Opsi Analisis gambar hanya untuk membaca gambar, bukan membuat gambar. Batas waktu media Google minimal 180 detik; batas di atas berlaku untuk teks.</p>
    {config.routes.map((route, index) => <fieldset className="ai-route-card" key={route.id}>
      <legend>{index + 1}. {route.name}</legend>
      <div className="ai-route-actions">
        <label className="ai-route-check"><input type="checkbox" checked={route.enabled} onChange={e => update(route.id, { enabled: e.target.checked })} /> Aktifkan</label>
        <button type="button" className="app-button app-secondary" aria-label={`Naikkan prioritas ${route.name}`} disabled={index === 0 || Boolean(busy)} onClick={() => move(index, -1)}>Naik</button>
        <button type="button" className="app-button app-secondary" aria-label={`Turunkan prioritas ${route.name}`} disabled={index === config.routes.length - 1 || Boolean(busy)} onClick={() => move(index, 1)}>Turun</button>
        {route.id.startsWith('custom-') && <button type="button" className="app-button app-secondary" onClick={() => setConfig(c => ({ ...c, routes: c.routes.filter(r => r.id !== route.id) }))}>Hapus</button>}
      </div>
      <div className="ai-route-fields">
        <label className="pk-field"><span>Nama layanan</span><input className="app-input" value={route.name} onChange={e => update(route.id, { name: e.target.value })} /></label>
        <label className="pk-field"><span>Alamat API</span><input className="app-input" type="url" placeholder="https://router.domainmu.id/v1" value={route.baseUrl} onChange={e => update(route.id, { baseUrl: e.target.value })} /></label>
        <label className="pk-field"><span>Model atau nama kombo</span><input className="app-input" placeholder="Nama persis dari dashboard penyedia" value={route.model} onChange={e => update(route.id, { model: e.target.value })} /></label>
        <label className="pk-field"><span>API key (jika diwajibkan layanan)</span><input className="app-input" type="password" autoComplete="off" spellCheck={false} value={route.apiKey} onChange={e => update(route.id, { apiKey: e.target.value })} /></label>
      </div>
      {isOpenRouter(route) ? <p className="pk-hint">Untuk OpenRouter, isi ID model lengkap, misalnya google/gemini-2.5-flash. Kemampuan model diperiksa otomatis saat digunakan. Uji koneksi juga memeriksa JSON dan panggilan alat jika didukung. <a href="https://openrouter.ai/models" target="_blank" rel="noreferrer">Lihat katalog model</a></p>
      : <p className="pk-hint">Aktifkan kemampuan berikut hanya jika model/kombo mendukungnya. Model teks biasa tidak menerima gambar atau panggilan alat.</p>}
      <div className="ai-route-actions">
        {([['vision', 'Analisis gambar'], ['tools', 'Panggilan alat'], ['json', 'Keluaran JSON']] as const).map(([key, label]) => <label key={key} className="ai-route-check"><input type="checkbox" checked={route[key]} disabled={isOpenRouter(route)} onChange={e => update(route.id, { [key]: e.target.checked })} /> {label}</label>)}
        <button type="button" className="app-button app-secondary" disabled={Boolean(busy)} onClick={() => void test(route)}>{busy === route.id ? 'Menguji...' : 'Uji koneksi'}</button>
      </div>
    </fieldset>)}
    <div className="ai-route-actions">
      <button type="button" className="app-button app-secondary" onClick={() => setConfig(c => ({ ...c, routes: [...c.routes, { ...defaultAiRouting().routes[3], id: `custom-${crypto.randomUUID()}`, name: 'Layanan tambahan' }] }))}>Tambah layanan cadangan</button>
      <button type="button" className="app-button app-primary" onClick={save}>Simpan router AI</button>
    </div>
    <p className="pk-hint" role="status" aria-live="polite">{message}</p>
    <p className="pk-hint">Kunci disimpan hanya di browser ini dan dikirim langsung ke alamat API masing-masing. Kunci tidak dimasukkan ke cadangan proyek. <a href="https://github.com/decolua/9router" target="_blank" rel="noreferrer">Panduan 9Router</a></p>
  </section>;
};
export default AiRoutingSettings;
