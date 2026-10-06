import React, { useState, useEffect } from 'react';
import { readAiRouting, saveAiRouting, isOpenRouter, type AiRoute } from '../services/aiRouting';
import OpenRouterModelPicker from './OpenRouterModelPicker';
import { studioSelectedModel } from '../services/openRouterCatalog';
export default function AiRoutingSettings() {
  const [config,setConfig] = useState(readAiRouting), [status,setStatus] = useState('');
  const route = config.routes.find(isOpenRouter) || { id:'openrouter',name:'OpenRouter',baseUrl:'https://openrouter.ai/api/v1',model:'',apiKey:'',enabled:true,vision:true,tools:true,json:true };
  const update = (changes: Partial<AiRoute>) => setConfig(c => ({ ...c, imagesViaOpenRouter:true, preferGateway:true, routes:c.routes.some(isOpenRouter) ? c.routes.map(r => isOpenRouter(r) ? {...r,...changes} : r) : [...c.routes,{...route,...changes}] }));
  useEffect(() => { const handle = (event: Event) => { try { saveAiRouting({...config,imagesViaOpenRouter:true,preferGateway:true,mediaFallback:false}); } catch(e) { event.preventDefault(); setStatus(e instanceof Error ? e.message : 'Pengaturan belum tersimpan.'); } }; window.addEventListener('bekal-ai-save-settings',handle); return () => window.removeEventListener('bekal-ai-save-settings',handle); },[config]);
  const save = () => { try { saveAiRouting({...config,imagesViaOpenRouter:true,preferGateway:true,mediaFallback:false}); setStatus('Pengaturan OpenRouter tersimpan.'); } catch(e) { setStatus(e instanceof Error ? e.message : 'Pengaturan belum tersimpan.'); } };
  return <section className="ai-routing-settings">
    <h3>OpenRouter untuk seluruh generate AI</h3>
    <p className="pk-hint">Pilihan model diambil dari katalog resmi. Kunci disimpan di perangkat ini. Gambar, video, audio, dan teks memakai API OpenRouter; layanan langsung tidak menjadi cadangan.</p>
    <label className="ai-route-check"><input type="checkbox" checked={route.enabled} onChange={e => update({enabled:e.target.checked})} /> Aktifkan OpenRouter</label>
    <label className="pk-field"><span>API key OpenRouter</span><input type="password" className="app-input" autoComplete="off" value={route.apiKey} onChange={e => update({apiKey:e.target.value})} /></label>
    <h4>Biaya dan kualitas gambar</h4>
    <label className="pk-field"><span>Batas total megapiksel referensi yang dikirim</span><input className="app-input" type="number" min="0.25" max="32" step="0.25" value={config.referenceMegapixelLimit || 2} onChange={e=>setConfig(c=>({...c,referenceMegapixelLimit:Number(e.target.value)}))} /></label><p>Default 2 MP untuk seluruh referensi per permintaan. Salinan pengiriman diperkecil jika perlu; file asli tetap utuh. Batas ini mengurangi piksel masukan, bukan membatasi seluruh tagihan atau resolusi hasil.</p>
    <label className="ai-route-check"><input type="checkbox" checked={config.packImageReferences === true} onChange={e=>setConfig(c=>({...c,packImageReferences:e.target.checked}))} /> Gabungkan referensi berlebih menjadi panel (dapat memicu hasil kolase)</label>
    <label className="ai-route-check"><input type="checkbox" checked={config.allowPaidImageAutomation === true} onChange={e=>setConfig(c=>({...c,allowPaidImageAutomation:e.target.checked}))} /> Izinkan analisis AI tambahan dan hingga 3 render otomatis per shot</label><p>Default mati: generate shot tidak memanggil AI untuk menilai konteks atau merender ulang otomatis. Analisis manual tetap tersedia. Mengaktifkan opsi ini menambah transaksi dan biaya di luar satu hasil.</p>
    <h4>Model teks, naskah, dan asisten</h4>
    <OpenRouterModelPicker kind="text" value={route.model} onChange={id => update({model:id})} />
    <h4>Model gambar utama</h4>
    <OpenRouterModelPicker kind="image" value={config.openRouterImageModel || studioSelectedModel('image')} onChange={id => setConfig(c => ({...c,openRouterImageModel:id}))} />
    <h4>Model audio utama</h4>
    <OpenRouterModelPicker kind="audio" value={studioSelectedModel('audio')} onChange={() => setStatus('Model audio dipilih.')} />
    <label className="ai-route-check"><input type="checkbox" checked={config.fallback} onChange={e => setConfig(c => ({...c,fallback:e.target.checked}))} /> Coba model OpenRouter kompatibel lain setelah penolakan awal pada mode otomatis</label>
    <p>Gambar selalu memakai model yang kamu pilih, termasuk saat referensi tidak cocok. Perpindahan penyedia hanya berlaku di dalam model yang sama di OpenRouter.</p>
    <p className="pk-hint">Jika opsi model pengganti aktif, referensi dan pengaturan dipertahankan. Estimasi model pilihan tidak berlaku untuk model pengganti; tarif akhirnya dapat berbeda. Timeout, pembatalan, dan penolakan konten tidak memicu pengiriman ulang.</p>
    <p className="pk-hint">Model yang dipilih langsung pada shot tetap diutamakan. Saldo habis, hasil kosong, dan koneksi terputus tidak memicu pengiriman ulang ke API lain. Generate ulang dilakukan lewat tombol shot.</p>
    <button type="button" className="app-button app-primary" onClick={save}>Simpan router AI</button><p role="status">{status}</p>
  </section>;
}
