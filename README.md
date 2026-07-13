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
