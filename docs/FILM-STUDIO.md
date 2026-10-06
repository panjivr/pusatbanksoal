# Studio Film AI Bekal

Adaptasi web dari [AI Video Production Editor](https://github.com/LudwigKienle/ai-video-production-editor), karya Ludwig Maximillian Kienle, pada commit `752cd43d3af6421d2bd6d4ce27f2d9815f7acba3`. Lisensi GPL-3.0-or-later, kode sumber, dan atribusi dipertahankan di `studio-film-ai/`.

## Proyek dan penyimpanan

Naskah, karakter, referensi, pakaian, kontinuitas, papan adegan, linimasa, penyesuaian warna lokal, tinjauan, dan ekspor menggunakan struktur proyek yang sudah ada. IndexedDB menyimpan proyek dan media di browser. Cadangan baru berformat `.bekal-film`, berisi manifest proyek dan media biner tanpa penggabungan base64. Cadangan JSON versi lama tetap bisa dibuka. Unduh cadangan menyimpan perubahan terakhir terlebih dahulu, dengan status proses dan penguncian agar simpan otomatis tidak berjalan bersamaan. Kredensial serta data penyedia lama tidak dihapus, tetapi panel generate baru hanya memakai OpenRouter.

Tema mengikuti `assets/style.css`. Katalog terjemahan diterapkan saat build; ID model, nama properti, parameter API, serta isi proyek pengguna tetap dipertahankan. Ekspor WebM tersedia di browser. MP4/FFmpeg, plugin native, dan agen CLI membutuhkan aplikasi desktop.

## OpenRouter

Isi dan aktifkan API key pada Pengaturan. Pilih model teks untuk naskah, analisis, dan asisten. Kunci media juga dapat disimpan tanpa memilih model teks. Tombol **Simpan router AI** maupun **Simpan** pada dialog menyimpan konfigurasi router. Kunci tidak ditanam dalam aset situs.

Pilihan gambar, konsep karakter, papan adegan, pemasaran, relight, retouch, video, avatar, audio, dan peningkatan resolusi video memakai katalog resmi. Model gambar dan video dipilih langsung dengan ID OpenRouter, bukan ID Replicate/fal.ai. Pilihan model yang tersimpan dapat dibaca kembali setelah memuat ulang proyek. Model yang sudah hilang dari katalog tidak dikirim ke penyedia lain.

- Teks: `GET /api/v1/models`, `POST /api/v1/chat/completions`; JSON dan panggilan alat diperiksa terhadap kemampuan model.
- Gambar: gabungan katalog chat dan `GET /api/v1/images/models`. Model native memakai `POST /api/v1/images`; model chat multimodal memakai chat completions. Referensi, rasio, dan resolusi divalidasi sebelum submit.
- Video: `GET /api/v1/videos/models`, `POST /api/v1/videos`, polling `GET /api/v1/videos/{id}`, unduhan `GET /api/v1/videos/{id}/content`. Bingkai awal/akhir memakai `frame_images`; resolusi dan durasi mengikuti kemampuan model.
- Peningkatan resolusi video: model katalog dengan `upscale_factor`; video sumber dikirim melalui `input_references`, bukan sebagai bingkai gambar.
- Audio: model chat dengan keluaran audio dari katalog, memakai chat completions dan respons `message.audio.data`.

Referensi yang tidak didukung tidak dibuang otomatis. Model tertentu mempunyai batas jumlah referensi atau durasi. Parameter di luar batas menghasilkan pesan agar pengguna memilih parameter/model yang sesuai. LoRA belum didukung jalur gambar ini.

Generate tidak beralih ke Gemini, Replicate, fal.ai, atau layanan langsung lain. Mode gambar otomatis dapat mencoba model OpenRouter kompatibel setelah penolakan awal. Pilihan model eksplisit dipertahankan; provider fallback di dalam OpenRouter tetap menggunakan model yang sama. Saldo habis menghentikan percobaan pada kunci tersebut. Pembatalan, penolakan konten, hasil kosong, dan koneksi yang terputus setelah submit tidak mengirim ulang otomatis.

Pembuatan dunia 3D dan keluaran HDR/ACES dari layanan lama tidak tersedia melalui katalog yang sudah diverifikasi. Panel menjelaskan ketersediaannya; aset lama, impor, penampil, dan editor lokal tetap dapat digunakan.

## Estimasi biaya

Tarif berasal dari metadata OpenRouter, tanpa konstanta harga lokal. Harga native gambar diambil dari `/images/models/{id}/endpoints`; video memakai `pricing_skus`; teks/audio memakai tarif token atau tarif lagu/klip yang disebutkan dalam deskripsi katalog.

Harga per gambar dikalikan jumlah gambar yang belum selesai. Contoh tarif $0.01 dan 8 gambar menghasilkan $0.08. Jika penyedia memiliki tarif berbeda, UI menampilkan rentang estimasi. Tarif megapiksel memakai perkiraan dimensi/resolusi atau asumsi 1 megapiksel jika dimensi bawaan tidak dinyatakan. Tarif token memakai asumsi token yang terlihat dan dapat diubah. Tarif tidak diketahui ditandai, bukan dihitung sebagai nol. Harga video mengikuti durasi, resolusi, dan masukan referensi.

Daftar dapat dicari dan diurutkan menurut harga terendah/tertinggi. Estimasi bukan batas pengeluaran. Analisis tambahan, perbaikan kontinuitas otomatis, dan generate ulang dapat menambah biaya. Tagihan akhir harus diperiksa pada Activity OpenRouter.

## Generate ulang

Kegagalan gambar disimpan pada shot terkait. Tombol **Generate ulang shot** tampil pada thumbnail dan panel shot. Tombol memakai prompt, referensi, dan alur kontinuitas yang sama; hanya shot tersebut diproses. Gambar serta versi shot lain tidak dihapus.

## Validasi

`npm run --prefix studio-film-ai test`, `build:web`, dan `scripts/check-film-openrouter-catalog.cjs` memeriksa harga, pengurutan, batch, retry shot, serta protokol gambar/video/audio. Pengujian browser menggunakan respons penyedia simulasi dan metadata katalog yang diperiksa pada 6 Oktober 2026. Pengujian ini tidak membuktikan bahwa saldo, izin model, atau hasil inferensi akun tertentu sudah berhasil. Kunci produksi diperlukan untuk pengujian berbayar sebenarnya.

Analisis audio dan video meneruskan berkas lokal sebagai masukan audio atau video OpenRouter sesuai kemampuan model teks yang dipilih. Tidak ada unggahan ke Google melalui alur transkripsi video ini.

Penyimpanan JSON dan tanda perubahan proyek diproses per potongan, bukan satu string yang memuat semua frame. Uji regresi mencakup media 128 MiB, 160 shot, versi gambar, pemulihan cadangan lama, dan penolakan cadangan terpotong. Audit tampilan memeriksa batas layar dan kontrol yang tertutup dengan hit testing, dalam tema terang dan gelap. Panel model serta tombol Alat AI mengikuti tata letak halaman.
