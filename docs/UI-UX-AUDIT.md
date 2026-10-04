# Audit UI, responsivitas, dan SEO Bekal

Tanggal: 4 Oktober 2026.

Audit mencakup 25 halaman HTML. Perbaikan berfokus pada tampilan, bahasa, navigasi fitur, aksesibilitas dasar, dan struktur SEO. URL fitur, ID aplikasi, atribut data, nilai formulir, event handler, perhitungan, autentikasi lokal, penyimpanan, dan protokol transfer dipertahankan.

## Temuan dan perbaikan

- Halaman transfer sebelumnya membatasi pilihan mode dan panel sekitar 560 piksel. Pilihan mode sekarang berjajar di desktop dan memakai lebar konten. Panel aktif memakai area kerja dengan panduan di sampingnya; HP memakai satu kolom.
- Kontainer konten dan navigasi kini memiliki lebar yang konsisten, dengan padding yang menyesuaikan layar. Teks pengantar tetap dibatasi panjang barisnya agar mudah dibaca.
- Landing page sebelumnya menyebut 14 alat, menyembunyikan penjelasan fitur di HP, dan belum mengenalkan transfer file dengan jelas. Semua 20 fitur publik sekarang terhubung dari landing page, termasuk pengecekan sertifikat. Ada akses cepat ke kirim file, QR, dan catatan keuangan.
- Menu tetap memakai empat kelompok: Belajar, Kampus & Karier, Usaha, serta Alat Praktis. Istilah seperti Business Blueprint dan Studio Bisnis diganti pada antarmuka utama menjadi Rencana Bisnis dan Kalkulator Usaha. Fitur tetap berada di URL yang sama.
- Bahasa pengantar dan metadata dibuat lebih singkat dan jelas. Pemisah em dash dalam kalimat tampilan diganti; tanda rentang, simbol matematika, dan placeholder hasil kosong tidak dihapus.
- Pada HP, deskripsi fitur tetap terlihat, kontrol utama lebih mudah disentuh, dan ukuran teks formulir mengurangi risiko zoom otomatis. Menu bawah yang sudah ada tetap digunakan.
- Tautan langsung ke isi, indikator fokus keyboard, landmark utama, dan 54 asosiasi label/nama kontrol ditambahkan. Kontras teks sekunder diperbaiki untuk tema terang dan gelap.
- Kartu Kerja Remote dengan minimum 310 piksel membuat halaman melebar pada layar 320 piksel. Minimum kartu kini mengikuti lebar area yang tersedia.
- Judul materi kelas memakai h2 agar tidak menduplikasi h1 halaman.

## SEO statis

`assets/features.json` adalah daftar pusat 20 fitur publik. `scripts/sync-seo.py` menyelaraskan judul, deskripsi, Open Graph, Twitter Card, WebPage, breadcrumb, katalog fitur di landing page, dan sitemap. HTML hasilnya dapat dibaca crawler tanpa menjalankan JavaScript. Tidak ada layanan SEO eksternal, kredensial baru, atau perubahan server yang diperlukan.

FAQ terstruktur hanya dibuat dari pertanyaan dan jawaban yang benar-benar tersedia pada halaman. Schema FAQ lama yang tidak memiliki konten yang terlihat dihapus. Halaman utama memakai canonical `/`, sesuai sitemap. Halaman admin, akun, progres pribadi, dan workspace skripsi tetap `noindex` dan tidak ada di sitemap. Robots mengizinkan crawler membaca arahan `noindex`; ini bukan pengganti autentikasi.

Setelah mengubah daftar atau deskripsi fitur:

```bash
python3 scripts/sync-seo.py --lastmod YYYY-MM-DD
python3 scripts/check-site.py
```

Isi `YYYY-MM-DD` dengan tanggal perubahan konten. Generator ini tidak mengubah logika fitur atau mengharuskan build untuk menjalankan situs.

## Validasi

- Pemeriksaan statis lulus untuk 25 halaman: tautan dan aset lokal, metadata, canonical, JSON-LD, breadcrumb, katalog landing page, serta sitemap dengan 21 URL publik termasuk beranda.
- Generator SEO dan FAQ telah dijalankan berulang dengan tanggal yang sama; hasilnya identik.
- Audit Chromium lulus untuk 400 kombinasi: 25 halaman, delapan viewport, dua tema. Viewport: 320×800, 390×844, 768×1024, 820×390, 1024×768, 1440×900, 1920×1080, dan 2560×1440. Tidak ada overflow halaman yang tidak disengaja atau error JavaScript saat startup. Area tabel yang memang dapat digeser dan drawer tertutup dikecualikan dari pemeriksaan overflow.
- Sebanyak 21 pemeriksaan fungsi lulus di HP, tablet, dan desktop: navigasi; jawaban, navigasi, nilai, dan riwayat CAT; pilihan mode transfer, pembacaan QR, penggabungan teks Unicode beberapa bagian dan enkripsi; pembuatan/pembacaan QR; transaksi dan total keuangan tersimpan; perhitungan laba usaha; serta penyelesaian materi kelas.
- Perbandingan struktur 36 skrip yang terdampak memastikan identifier, operasi, cabang, dan konstanta angka tetap sama. Perubahan literal berisi teks tampilan atau markup judul. ID, nilai awal formulir, atribut data, dan handler pada 25 halaman juga dibandingkan dengan versi awal.
- Screenshot desktop dan HP untuk transfer serta landing page ditinjau secara visual.

Untuk mengulang pemeriksaan browser, jalankan server statis dari direktori repository, lalu gunakan Playwright dan Chromium yang tersedia di lingkungan pengembangan:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
# Dari terminal lain, ketika Playwright tersedia untuk Node:
node scripts/check-ui.cjs
node scripts/check-responsive.cjs
```

Di lingkungan Codex saat audit, modul Playwright tersedia melalui `NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules`. Skrip mendukung `PBS_SITE_BASE_URL` dan `PBS_CHROMIUM_PATH` untuk lingkungan lain. Tidak ada dependensi npm yang ditambahkan ke aplikasi.

## Batas validasi dan publikasi

Ukuran layar diuji melalui Chromium, bukan seluruh perangkat fisik atau semua versi Safari/Firefox. Pemeriksaan browser memblokir layanan eksternal agar hasil fitur lokal tidak bergantung pada jaringan. Kamera fisik, koneksi P2P melalui relay, API riset, sumber lowongan, dan ekspor PDF di semua browser belum diuji end-to-end. Mekanisme tersebut tidak diubah.

Perubahan berada di checkout dan belum dipublikasikan ke situs produksi. Setelah deploy melalui workflow GitHub Pages yang sudah ada, sitemap dapat dikirim di Google Search Console dan URL penting dapat diperiksa. Indexing, peringkat Google, dan penyebutan oleh mesin jawaban AI tidak dijamin oleh metadata atau schema.
