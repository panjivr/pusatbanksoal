# PusatBankSoal.id

Prototipe web **AI Education Intelligence Platform** — tryout, bank soal, dan analisis nilai untuk CPNS, PPPK, Kedinasan, SNBT/UTBK, BUMN, TNI/POLRI, dan ujian lainnya.

Dibangun sebagai situs statis (HTML + CSS + JS vanilla, tanpa build step) dengan design system bertema gelap terinspirasi Binance.

## Halaman

| File | Isi |
|------|-----|
| `index.html` | Landing page: hero, kategori ujian, fitur, sorotan AI analisis, leaderboard, harga, FAQ |
| `tryout.html` | Daftar tryout & **simulator CAT** interaktif (timer, navigasi soal, skor, pembahasan, deteksi pindah tab) |
| `dashboard.html` | Dashboard belajar: KPI, grafik skor (SVG), radar kemampuan, analisis kelemahan AI, misi harian, heatmap konsistensi |
| `analisis.html` | AI Analisis Nilai: upload dokumen, prediksi peluang lolos, **simulasi peningkatan nilai** interaktif, rekomendasi kampus & jurusan |
| `assets/style.css` | Design system (token warna, tipografi, komponen) |

## Menjalankan

Cukup buka `index.html` di browser, atau jalankan server statis:

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

Tidak ada dependensi. Semua interaksi (ujian CAT, simulasi nilai, chart) berjalan dengan JavaScript bawaan browser.

## Deploy (GitHub Pages + domain pusatbanksoal.id)

Kode & workflow sudah siap. Langkah sekali-jalan oleh pemilik repo:

1. **Aktifkan GitHub Pages:** Settings → Pages → Build and deployment → Source → pilih **GitHub Actions**.
   (Jika deploy gagal `Resource not accessible by integration`, cek juga Settings → Actions → General → Workflow permissions → **Read and write permissions**.)
2. **Jalankan ulang workflow:** tab Actions → "Deploy to GitHub Pages" → Run workflow (atau push commit baru).
3. **Set DNS di registrar (DomaiNesia → DNS Management):**
   - A `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - AAAA `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - CNAME `www` → `panjivr.github.io`
4. Di Settings → Pages, isi Custom domain = `pusatbanksoal.id` (file `CNAME` sudah menyetelnya) lalu centang **Enforce HTTPS** setelah sertifikat terbit.

URL sementara sebelum domain aktif: `https://panjivr.github.io/pusatbanksoal/`
