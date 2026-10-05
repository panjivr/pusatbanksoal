# Alat Markdown dan katalog fitur otomatis

`markdown-tools.html` memproses dokumen di browser tanpa server konversi atau layanan berbayar. Editor memakai CommonMark/GFM melalui Marked, pratinjau HTML disaring DOMPurify, konversi HTML melalui Turndown, metadata YAML melalui js-yaml CORE_SCHEMA, format melalui Prettier, dan perbandingan baris melalui jsdiff. Dependensi browser disertakan lokal dengan versi di `tooling/package-lock.json`.

## Acuan riset

- CommonMark 0.31.2, sintaks blok/inline, daftar, code fence, tautan, gambar, dan raw HTML: https://spec.commonmark.org/0.31.2/ . Sumber resmi yang dibaca: https://github.com/commonmark/commonmark-spec/blob/master/spec.txt
- GitHub Flavored Markdown: https://github.github.com/gfm/ . Ekstensi tabel pada implementasi resmi: https://github.com/github/cmark-gfm/blob/master/extensions/table.c
- WebVTT, cue dan timestamp: https://www.w3.org/TR/webvtt1/ . Sumber resmi: https://github.com/w3c/webvtt/blob/gh-pages/index.bs
- Transformers.js, Whisper, inference lokal, chunk/stride dan bahasa: https://github.com/huggingface/transformers.js dan dokumentasi source versi 3.7.2 yang terpasang di tooling. Model multilingual: https://huggingface.co/Xenova/whisper-tiny

## Cakupan

Editor dan pratinjau; heading/outline; GFM tabel, checklist, coretan dan code fence; YAML front matter; hitungan kata; undo/redo; cari/ganti literal; format; pemeriksaan struktur; daftar isi; ekstraksi ringkasan; diff; pisah per H2; gabung file sesuai urutan; pembuat tabel dan template. Import MD/TXT/HTML/DOCX/CSV/XLSX/JSON/SRT/VTT/gambar OCR/PDF/ZIP. Ekspor MD, HTML mandiri, TXT, DOCX, JSON, PDF melalui dialog cetak browser, serta ZIP dengan aset dan sumber.

Pratinjau tidak memuat gambar eksternal atau menjalankan HTML aktif. Raw source tetap tersedia dalam ekspor MD/JSON/ZIP. Gambar lokal ditambahkan sebagai aset, diarsipkan dalam ZIP, dan dapat ditanam ke HTML/DOCX. Tabel HTML sederhana termasuk tabel Word tanpa elemen TH dipertahankan sebagai tabel Markdown; tabel gabungan colspan/rowspan dipertahankan sebagai HTML dalam MD. DOCX mempertahankan struktur umum, bukan seluruh ekstensi Markdown atau tata letak kompleks. Mermaid, matematika LaTeX, footnote khusus, dan ekstensi aplikasi tertentu dipertahankan sebagai teks/code; tidak ada klaim render universal atau kesetaraan seluruh dialek Markdown.

## Umpan balik pemilihan file

Alat PDF, gambar dan Markdown menggunakan `assets/file-activity.mjs`. Pemilihan file dan tarik-lepas menampilkan nama, ukuran total, indikator bergerak serta status selesai/gagal. Pembacaan tetap lokal, tanpa unggahan server. Indikator tanpa persentase digunakan jika kemajuan belum dapat diukur. Antarmuka diberi kesempatan menggambar sebelum parsing; status menunggu pekerjaan asinkron selesai. Pemeriksaan perilaku tertunda, kegagalan, tarik-lepas dan layout: `scripts/check-file-activity.cjs`.

## Ukuran dokumen

Tidak ada batas buatan untuk ukuran file, jumlah halaman PDF, panjang dokumen, jumlah aset, atau jumlah file gabungan. File MD kosong tetap dapat diimpor dan diunduh. Pratinjau dokumen panjang hanya merender 100.000 karakter pertama; editor dan ekspor tetap menyimpan seluruh dokumen. Kapasitas memori, penyimpanan, codec, validitas file dan kemampuan perangkat tetap berlaku. Validasi keamanan arsip, sanitasi HTML dan pemeriksaan metadata tetap aktif.

## PDF ke Markdown

Struktur PDF tidak selalu menyimpan semantik heading/tabel/urutan baca. Hasil paket menyertakan `dokumen.md`, `sumber.pdf` dengan byte persis seperti input, PNG halaman, serta `informasi.json` yang memuat hash SHA-256, teks/koordinat, anotasi dan metadata. Ini mempertahankan sumber informasi tanpa menjanjikan konversi semantik tanpa kehilangan. File PDF terenkripsi dapat dibaca dengan password yang benar; password tidak disimpan dalam paket. Pilihan halaman hanya membatasi ekstraksi; PDF sumber tetap utuh. OCR opsional untuk halaman tanpa teks menggunakan model Indonesia/Inggris lokal dan perlu diperiksa.

PDF dibaca melalui potongan lokal PDF.js, halaman diproses bertahap dan dibersihkan setelah selesai. SHA-256 dihitung bertahap per 1 MB. Arsip dibuat melalui zip.js tanpa menggabungkan seluruh sumber menjadi satu buffer; sumber disimpan tanpa kompresi ulang, dengan dukungan ZIP64. Unduhan akhir berupa Blob tetap membutuhkan sumber daya browser.

Hasil konversi PDF tidak lagi memicu unduhan otomatis. Tautan paket ditampilkan dan diunduh melalui klik pengguna. Sebelum memasang pratinjau, hasil lengkap disimpan ke IndexedDB lokal (`bekal-markdown-results`), lalu dipulihkan saat halaman dibuka kembali. Pengguna dapat menghapus salinan melalui tombol; kegagalan penyimpanan/kuota tidak menghalangi unduhan pada sesi aktif. Password tidak disimpan. Pratinjau hanya memuat tiga gambar pertama secara lazy; gambar berikutnya ditampilkan melalui tombol masing-masing, sementara paket ekspor tetap berisi semua aset. `scripts/check-markdown-recovery.cjs` memeriksa PDF gambar sekitar 38 MB, tidak adanya navigasi/unduhan otomatis, pemulihan setelah reload, keutuhan sumber, unduhan manual, dan penghapusan salinan.

## Video/audio

Transkrip SRT/VTT/TXT dan teks tempel dapat dibuat menjadi ringkasan ekstraktif serta transkrip lengkap dalam rentang pilihan. Ringkasan memilih kalimat sumber, tidak menghasilkan fakta baru. Cuplikan video JPG diberi timestamp; ini bukan analisis AI seluruh visual. File subtitle sumber disertakan saat ekspor ZIP. Media asli dapat disertakan secara opsional. Tidak ada pembatasan buatan untuk ukuran atau durasi media. Kolom durasi kosong memproses seluruh media; rentang waktu dapat dipilih untuk mengurangi pekerjaan. Codec dan memori dekode tergantung browser. Audio diproses sebagai mono 16 kHz, resampling melalui OfflineAudioContext, dan dapat diekspor sebagai WAV.

Transkripsi otomatis menggunakan Whisper Tiny multilingual q8 melalui Transformers.js di dedicated Worker dengan ONNX/WASM lokal dan satu thread, tanpa mengirim audio ke server. Model diunduh dari Hugging Face saat pertama digunakan (sekitar 100 MB termasuk kebutuhan model; ukuran dapat berbeda) dan dapat tersimpan dalam cache browser. Paket WASM lokal berada di `assets/vendor/onnx`. Pengguna memulai unduhan/transkripsi lewat tombol khusus. Pembatalan menghentikan worker. Akurasi model kecil, khususnya nama/angka/bahasa daerah, harus diperiksa. Tidak mengunduh URL YouTube atau melakukan inference melalui API berbayar.

**Batas verifikasi:** lingkungan pengembangan mengembalikan proxy 403 untuk huggingface.co, sehingga model penuh dan akurasi inference Whisper belum diuji end-to-end di lingkungan ini. Worker yang memuat pipeline, kegagalan unduhan, fallback transkrip dan pembatalan diuji. Jalur transkrip, dekode WAV dan cuplikan video diuji dengan file nyata. Pengujian inference penuh membutuhkan browser dengan akses Hugging Face dan domain penyimpanan model (misalnya cdn-lfs.huggingface.co, cas-bridge.xethub.hf.co). File media tetap diproses lokal.

## Katalog otomatis

`python3 scripts/sync-catalog.py` menemukan halaman HTML publik baru yang memiliki main, title, description, dan bukan `robots=noindex`, menambahkannya ke `assets/features.json`, lalu membangun **peta fitur yang terlihat di landing**, ikon dan menu Alat Praktis, JSON-LD, metadata, serta sitemap. Halaman internal/private tidak didaftarkan. `feature:group` dan `feature:icon` pada metadata halaman baru opsional; default grup `studio` dan ikon `file-text`. Grup yang didukung: belajar, kampus, usaha, studio/alat. Ubah name/landing_description/icon/new di registry untuk kontrol editorial. URL unik wajib.

Workflow deploy menjalankan sinkronisasi ini dan `scripts/check-site.py` sebelum mengunggah artefak GitHub Pages. Direktori landing juga memuat seluruh operasi dari assets/file-tools.json dan assets/markdown-tools.json, dengan pencarian dan ikon. Fitur baru ditemukan dari halaman publik secara otomatis pada deploy; perubahan dalam aplikasi yang tidak mempunyai halaman publik/keterangan fitur tetap memerlukan entri registry yang sesuai. Tidak ada tebakan atas setiap tombol internal. Sinkronisasi hasil build tidak membuat commit balik ke repository.

## Pengembangan

Situs statis dapat dijalankan langsung tanpa npm/build. Untuk rebuild vendor: `ONNXRUNTIME_NODE_INSTALL_CUDA=skip npm ci --prefix tooling`, lalu `npm run --prefix tooling build`. Flag resmi ONNX hanya melewati paket GPU Node yang tidak dipakai aplikasi browser; verifikasi TLS/npm integrity tetap aktif.

Pemeriksaan: `python3 scripts/check-catalog.py`, `python3 scripts/check-site.py`, serta Playwright `scripts/check-markdown.cjs`, `scripts/check-markdown-ui.cjs`, `scripts/check-markdown-media.cjs`, dan `scripts/check-markdown-large.cjs`. Pengujian besar memeriksa PDF lebih dari 100 MB dengan 61 halaman, keutuhan sumber dan aset, PDF kecil, dokumen lebih dari dua juta karakter, unduhan MD kosong, serta audio lebih dari sepuluh menit. Gunakan `PBS_SITE_BASE_URL` untuk URL server dan Chromium yang terpasang. `scripts/check-responsive.cjs` memeriksa 28 halaman, delapan viewport dan dua tema (448 kombinasi). Pengujian browser saat ini di Chromium, bukan semua perangkat fisik.
