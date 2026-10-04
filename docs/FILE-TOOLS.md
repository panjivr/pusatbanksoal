# Alat PDF dan gambar

Dua pusat alat di `pdf-tools.html` dan `image-tools.html` menyediakan 30 operasi PDF dan 26 operasi gambar. Semua pemrosesan dokumen berlangsung di browser, tanpa API berbayar, unggahan dokumen, atau server konversi. Modul besar dimuat saat diperlukan. File/password tidak disimpan dalam localStorage. OCR Indonesia/Inggris, worker, font, dan library disertakan lokal.

## Referensi dan batas riset

Referensi pengguna: https://www.ilovepdf.com/ dan https://www.iloveimg.com/. Akses langsung kedua situs diblokir oleh proxy lingkungan ini (403), sehingga tidak ada klaim audit langsung seluruh UI atau paket premium. Dokumentasi SDK resmi iLovePDF https://github.com/ilovepdf/ilovepdf-nodejs menjadi referensi operasi gabung, pisah, kompres, konversi Office, gambar, nomor halaman, watermark, putar, buka password, dan pemulihan struktur. Implementasi ini memakai rancangan dan kode sendiri, dengan fokus pemrosesan lokal yang diminta pengguna.

Cakupan kategori: pengaturan halaman PDF; kompresi; konversi dokumen/gambar; OCR; anotasi/tanda tangan visual; pengamanan AES-256; pengubahan ukuran gambar; efek warna; penyamaran; latar warna polos; kolase; GIF animasi; sprite; palet; pembersihan metadata.

Konversi PDF ke Word mengekstrak teks, Excel mengelompokkan posisi teks, dan PowerPoint membuat slide gambar. Word ke PDF menghasilkan raster halaman, Excel ke PDF menampilkan data lembar pertama. Tata letak Office kompleks tidak dijanjikan setara aplikasi desktop. OCR perlu diperiksa ulang. Pemulihan hanya berlaku untuk struktur yang masih bisa dibaca. Crop PDF tidak menghapus data tersembunyi: gunakan Tutup Data untuk informasi sensitif. Tanda tangan berupa visual, tanpa sertifikat digital. Perbesaran gambar memakai interpolasi; hapus latar memakai warna pilihan, tanpa AI. SVG hasil berisi bitmap, bukan tracing vektor. GIF animasi dipertahankan saat format hasil GIF dipilih; format lain mengambil frame pertama. TIFF input mengambil halaman pertama. HEIC tidak ditawarkan. PDF/A, konversi PPTX ke PDF, pemisahan objek latar otomatis dan peningkatan detail AI belum tersedia.

## Pengembangan dan pemeriksaan

Situs statis: `python -m http.server 8000 --bind 127.0.0.1` dari akar checkout. Build ulang vendor: `npm ci --prefix tooling`, kemudian `npm run --prefix tooling build`. Tidak diperlukan build untuk menjalankan versi yang sudah disertakan.

`python scripts/sync-seo.py` menyinkronkan metadata, katalog landing dan sitemap. `python scripts/check-site.py` memeriksa tautan/metadata. `scripts/check-file-tools.cjs` memproses fixture nyata, memeriksa geometri/piksel, enkripsi/password, format keluaran, OCR searchable dan GIF. Jalankan dengan Playwright dan Chromium terpasang, `PBS_SITE_BASE_URL` dapat mengganti URL server. `scripts/check-responsive.cjs` mencakup seluruh halaman pada delapan viewport dan dua tema.

Batas UI: 20 file, 50 MB per file, 100 MB total. Render PDF maksimal 50 halaman per proses, 12 MP per halaman. Gambar maksimal 24 MP, animasi maksimal 16 MP total. Proses CPU sinkron dapat menunda pembatalan sampai operasi aktif selesai; OCR worker dihentikan saat dibatalkan. Batas ini mengurangi risiko memori, bukan jaminan untuk setiap perangkat. Halaman harus tetap terbuka selama pemrosesan.

## Lisensi

Dependency dipin melalui `tooling/package-lock.json`. Lisensi vendor berada di `assets/vendor/licenses`, font Noto di `assets/vendor/fonts/OFL.txt`, model OCR di `assets/vendor/ocr-data/LICENSE` beserta sumber/hash. Font statis Noto Sans Regular: https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf. Semua unduhan memakai TLS dan npm memverifikasi integrity lockfile.

## Hasil verifikasi

Seluruh 30 operasi PDF dan 26 operasi gambar memproses fixture nyata. Pemeriksaan juga mencakup dekripsi AES-256, password salah, teks/piksel redaksi, lapisan teks OCR, dimensi gambar, timing dan retensi frame GIF, serta roundtrip JPG/PNG/WebP/GIF/TIFF/SVG. Pemeriksaan statis lulus untuk 27 halaman dan 22 fitur publik. Seluruh 432 kombinasi halaman/viewport/tema lulus di Chromium, termasuk 320 px, lanskap HP, tablet, 1920 px dan 2560 px. Alur situs lama lulus 21 pemeriksaan fungsional. Ini validasi Chromium lokal, bukan klaim pengujian seluruh model perangkat atau browser fisik.
