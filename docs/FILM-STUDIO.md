# Studio Film AI Bekal

Adaptasi web dari [AI Video Production Editor](https://github.com/LudwigKienle/ai-video-production-editor), karya Ludwig Maximillian Kienle, pada commit `752cd43d3af6421d2bd6d4ce27f2d9815f7acba3`. Lisensi GPL-3.0-or-later, kode sumber, dan atribusi dipertahankan di `studio-film-ai/`. Ini merupakan adaptasi Bekal, bukan rilis resmi proyek asal.

## Pemakaian

Ruang kerja mencakup naskah, drama pendek, papan referensi, impor media, gambar/video AI, desain set, audio, linimasa, warna, tinjauan, dan ekspor. Proyek beserta media disimpan di IndexedDB browser melalui adaptor lokal. Tombol cadangan mengunduh JSON beserta media; berkas itu dapat dibuka kembali. Penyimpanan proyek lama memakai basis data tersendiri dan tidak dihapus.

Warna dan tema mengikuti token situs pada `assets/style.css` dan preferensi `pbs_theme`. Microdrama menggunakan permukaan yang sama dalam tema terang maupun gelap. Kontrol UI diterjemahkan saat build melalui katalog `src/bekal-id.json` dan `scripts/bekal-locale.cjs`. Terjemahan tidak mengubah teks proyek milik pengguna, ID ruang kerja, enum, nama model, parameter API, atau kunci JSON. Katalog dapat diperluas untuk istilah lanjutan dari proyek asal. Contoh naskah Microdrama berbahasa Indonesia; kurva EQ hanya ilustrasi panduan, bukan pemrosesan audio.

Pembuatan AI membutuhkan kunci penyedia dan dapat menimbulkan biaya. Kunci dikirim langsung ke penyedia, tidak melalui proxy publik. Ekspor WebM tersedia di browser. MP4/FFmpeg, plugin native, agen CLI, dan akses sistem desktop memerlukan aplikasi desktop.

## 9Router dan layanan cadangan

Buka menu akun, pilih **Pengaturan dan API key**, lalu bagian **Router AI dan layanan cadangan**. Isi alamat API HTTPS, nama model/kombo, dan kunci jika layanan mewajibkannya. Aktifkan layanan, uji koneksi, lalu simpan. Urutan layanan dapat dinaikkan atau diturunkan; layanan tambahan dapat ditambahkan.

9Router adalah layanan terpisah milik pengguna, bukan server yang otomatis terpasang di GitHub Pages. Acuan integrasi: [README resmi 9Router](https://github.com/decolua/9router#-api-reference), format OpenAI `/v1/chat/completions`, nama kombo sebagai `model`. Layanan harus mengizinkan CORS dari `https://pusatbanksoal.id`. HTTP hanya diizinkan untuk localhost; alamat localhost merujuk ke perangkat yang membuka situs. Tidak ada layanan berbayar atau kunci yang disediakan oleh deployment ini.

Permintaan teks dapat berpindah saat kunci ditolak, kuota habis, koneksi gagal, timeout, atau penyedia sibuk. Gemini tetap tersedia sebagai penyedia/cadangan native. Analisis gambar, panggilan alat, dan JSON memerlukan kemampuan yang sesuai pada model/kombo; centang hanya kemampuan yang didukung. Unggah video/audio Google, pencarian Google/Maps, pembuatan gambar/video, dan percakapan suara tidak diteruskan ke router teks. Penolakan kebijakan konten dan pembatalan pengguna tidak memicu perpindahan. JSON divalidasi sebelum dikembalikan ke logika proyek.

Untuk model video yang sama-sama tersedia di fal.ai dan Higgsfield, penyedia cadangan dapat dipakai jika kedua kunci tersedia dan pengiriman awal ditolak secara pasti. Setelah pekerjaan diterima, polling gagal/timeout atau pembatalan tidak mengirim pekerjaan baru agar tidak menggandakan biaya. Pengaturan ini dapat dinonaktifkan terpisah dari cadangan teks.

Konfigurasi dan API key disimpan di browser ini, terpisah dari cadangan proyek. Indikator pada layar menunjukkan layanan yang sedang dicoba, perpindahan, dan keberhasilan. Permintaan dapat dikirim ke layanan cadangan yang diaktifkan; biaya dan ketentuan mengikuti layanan tersebut.

## Pembuatan karakter dan media

Mode Otomatis tetap memakai ranking kreatif asal, dengan daftar kandidat dibatasi pada penyedia yang kuncinya tersedia. Karakter, konsep, dan papan adegan mengirim permintaan ke model yang dipilih, termasuk GPT Image 2, Seedream Pro/Edit, Krea, Ideogram, Flux, dan Z-Turbo. Kunci yang tersimpan belum membuktikan akses model, saldo, kuota, atau izin CORS; kegagalan satu model tidak menonaktifkan semua fitur AI.

Permintaan media Google mendapat waktu proses minimal 180 detik, terpisah dari batas teks router. Prompt media dan referensi diteruskan tanpa tambahan instruksi bahasa untuk teks. Jika model gambar pratinjau diganti dengan Gemini 2.5, opsi ukuran yang tidak didukung dibuang tanpa mengubah referensi atau rasio. Jawaban kosong tidak disimpan sebagai gambar; permintaan dengan referensi tidak diulang diam-diam tanpa referensi. Proses batch menghitung hasil berhasil, bukan jumlah klik atau permintaan gagal. Unduh hasil Veo mempertahankan parameter URL dan hanya mengirim kunci ke host API Google.

Jika izin ditolak, periksa API key, proyek, akses model, dan penagihan pada penyedia. Jika kuota habis atau jaringan/CORS menolak permintaan, layar menampilkan alasan yang dapat ditindaklanjuti. API router teks dan opsi Analisis gambar bukan API pembuatan gambar.

## Pengembangan dan deployment

Gunakan Node 24, npm 10+, dan Python 3. Instalasi web melewati hook Electron/FFmpeg yang hanya diperlukan desktop; pemeriksaan integritas npm tetap berjalan.

```sh
npm ci --prefix studio-film-ai --ignore-scripts --no-audit --no-fund
npm run --prefix studio-film-ai typecheck
npm run --prefix studio-film-ai test
npm run --prefix studio-film-ai build:web
python3 scripts/publish-film-studio.py
python3 scripts/sync-catalog.py
python3 scripts/check-site.py
```

Dev: `npm run --prefix studio-film-ai dev -- --host 127.0.0.1 --port 8010`, entri `/assets/studio-film-ai/studio.html`. Situs hasil build: `python3 -m http.server 8006 --bind 127.0.0.1` dari root repositori. Mulai ulang Vite setelah mengubah katalog terjemahan atau plugin lokal. `publish-film-studio.py` memasang build pada `film-studio.html`; `stage-pages.py` hanya memasukkan berkas runtime, tidak menyertakan dependensi atau kode development. GitHub Actions mengulangi instalasi, pemeriksaan tipe, tes, build, sinkronisasi katalog, dan deployment Pages.

## Pengujian

Gunakan Playwright dan Chromium yang tersedia; atur `NODE_PATH` jika paket berada di luar checkout.

```sh
node scripts/check-film-studio.cjs
node scripts/check-film-routing.cjs
node scripts/check-film-generation.cjs
PBS_SITE_BASE_URL=http://127.0.0.1:8006/ node scripts/check-responsive.cjs
PBS_SITE_BASE_URL=http://127.0.0.1:8006/ node scripts/check-file-tools.cjs
PBS_SITE_BASE_URL=http://127.0.0.1:8006/ node scripts/check-markdown-large.cjs
PBS_SITE_BASE_URL=http://127.0.0.1:8006/ node scripts/check-markdown-recovery.cjs
python3 scripts/check-catalog.py
python3 scripts/check-site.py
```

Tes routing dan generate memakai respons API simulasi, tanpa kunci asli atau biaya layanan. Tes editor mencakup impor media, simpan/muat ulang, pemulihan cadangan, ekspor WebM, dan ruang kerja responsif. Tes Node memastikan ID serta logika tab tidak berubah oleh terjemahan. Pengujian ukuran layar bukan klaim pengujian pada setiap perangkat fisik atau validasi seluruh API berbayar.


OpenRouter untuk gambar memakai satu kunci dan katalog model dengan keluaran gambar, termasuk Flux apabila tersedia di katalog. Aktifkan pilihan gambar di Pengaturan → Router AI, muat katalog, pilih model utama atau Otomatis, lalu Simpan router AI. Model utama OpenRouter berlaku pada tombol gambar Nano Banana/Gemini di konsep, referensi, poster, dan ruang gambar; model teks di kartu OpenRouter tetap terpisah. Mode otomatis mengutamakan pilihan studio. Referensi gambar tetap dikirim dan model tanpa dukungan masukan gambar dilewati. Nama model yang benar-benar berhasil dicatat pada penggunaan AI.

Jika cadangan aktif, OpenRouter boleh berpindah penyedia untuk model yang sama, lalu studio mencoba model katalog yang kompatibel setelah penolakan API yang jelas. Setelah seluruh pilihan sesuai habis, API Gemini langsung yang telah dikonfigurasi dapat dipakai. Kunci berbeda mengikuti urutan kartu; kunci duplikat dilewati. Penolakan autentikasi atau kredit menghentikan percobaan model lain pada kunci yang sama. Timeout, koneksi terputus setelah pengiriman, hasil kosong/tidak terbaca, pembatalan, dan penolakan konten tidak menghasilkan pengiriman ulang. Setiap percobaan model dapat memiliki tarif berbeda dan karakter visual bisa berubah; rasio/resolusi diteruskan tanpa menghapus referensi, tetapi dukungan akhirnya mengikuti model/penyedia. Video, audio, Imagen dan model penyedia langsung lainnya tetap mengikuti jalur semula.
