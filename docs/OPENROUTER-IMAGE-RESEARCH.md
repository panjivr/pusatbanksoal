# OpenRouter: audit API gambar

Diperiksa pada 6 Oktober 2026 menggunakan respons API publik resmi dan SDK resmi OpenRouter, commit `50486fa616c04f3d036d0c45166b80f9bff15e13`.

## Sumber resmi

- SDK dan dokumentasi gambar: https://github.com/OpenRouterTeam/typescript-sdk/blob/main/docs/sdks/images/README.mdx
- Schema permintaan: https://github.com/OpenRouterTeam/typescript-sdk/blob/main/src/models/imagegenerationrequest.ts
- Schema hasil: https://github.com/OpenRouterTeam/typescript-sdk/blob/main/src/models/imagegenerationresponse.ts
- Katalog chat/multimodal: https://openrouter.ai/api/v1/models
- Katalog gambar khusus: https://openrouter.ai/api/v1/images/models
- Endpoint Flux Klein: https://openrouter.ai/api/v1/images/models/black-forest-labs/flux.2-klein-4b/endpoints

## Penyebab bug

Kode awal hanya mengambil katalog chat dan mengirim seluruh gambar ke `/api/v1/chat/completions`. Ini cukup untuk Gemini multimodal, tetapi tidak untuk model gambar khusus yang terdaftar di `/api/v1/images/models`. Asumsi bahwa ID Replicate identik dengan OpenRouter juga salah. Contohnya katalog resmi memakai `black-forest-labs/flux.2-klein-4b` (titik dan 4B), serta `bytedance-seed/seedream-4.5`.

Saat diperiksa, katalog gambar khusus berisi 58 model. Flux dan Seedream tidak terdapat di katalog chat yang diperiksa, tetapi terdapat di katalog gambar khusus. Jumlah dan model dapat berubah; kode membaca katalog saat digunakan, tanpa mengunci daftar tersebut.

## Kontrak API

Untuk model chat gambar: `POST /api/v1/chat/completions`, pesan dengan `content` teks/gambar, `modalities`, dan hasil `choices[].message.images[].image_url.url`.

Untuk model gambar khusus: `POST /api/v1/images`, badan dengan `model`, `prompt`, `n`, `stream`, serta parameter yang sesuai seperti `aspect_ratio`, `resolution`, `output_format`. Referensi memakai `input_references` berisi `{type:"image_url",image_url:{url:"data:image/...;base64,..."}}`. Hasil non-streaming memakai `data[].b64_json` dan `data[].media_type`, bukan format chat.

`provider.allow_fallbacks` mengizinkan OpenRouter berpindah penyedia untuk model yang sama; ini berbeda dengan perpindahan model pada aplikasi. Saldo/kunci berlaku pada akun. Model yang berbeda tidak menambah saldo yang habis.

## Penerapan

Gabungkan kedua katalog, pertahankan jalur chat yang telah berfungsi untuk model multimodal, dan gunakan `/images` untuk model gambar khusus. Simpan ID model aktual pada catatan penggunaan. Periksa parameter, batas jumlah referensi, dan keluaran raster; jangan menghapus referensi agar permintaan lolos. Model dengan keluaran vektor khusus tidak dianggap menghasilkan PNG.

Pilihan model studio yang eksplisit tetap mendahului pilihan global. Nama Flux Klein dapat disesuaikan ke varian Flux Klein yang benar-benar terdaftar. Katalog saat audit menyediakan **4B**, sementara generator Replicate asal memakai **9B Base**: bobot modelnya berbeda dan hasil bisa berbeda. ID aktual OpenRouter ditampilkan pada status dan penggunaan. Model lain yang tidak tersedia tidak diganti diam-diam ke Gemini.

## Batas verifikasi

Katalog dan endpoint model benar-benar diakses melalui API publik tanpa key. Preflight browser `OPTIONS /api/v1/images` dan `/api/v1/images/models` juga benar-benar diuji: HTTP 204, `Access-Control-Allow-Origin: *`, serta dukungan header Authorization/Content-Type/HTTP-Referer/X-Title. Test fixture merekam sebagian metadata asli tersebut. Pengiriman dan rendering hasil pada tes browser memakai respons simulasi dengan kontrak API resmi. Itu tidak membuktikan izin, saldo, atau hasil generasi menggunakan key pengguna. Timeout, koneksi terputus setelah pengiriman, pembatalan, hasil kosong dan penolakan konten tidak memicu pengiriman berbayar ulang.

## Katalog dan biaya lintas media (6 Oktober 2026)

Permintaan terbaru mengharuskan seluruh generate Studio memakai OpenRouter. Katalog video resmi `/api/v1/videos/models` mengembalikan 29 model, termasuk video generation dan video upscale. SDK resmi menyediakan `videoGeneration.generate`, `getGeneration`, `getVideoContent`, serta endpoint TTS/STT tersendiri. Model chat dengan keluaran audio juga ditemukan pada katalog `/models`; endpoint `/audio/models`, `/speech/models`, dan `/transcription/models` tidak tersedia, sehingga tidak digunakan sebagai sumber pilihan.

Implementasi Studio memakai katalog chat untuk teks/audio, dua katalog gambar, dan katalog video. Harga gambar native diperoleh dari endpoint metadata tiap model. Contoh terverifikasi: Seedream 4.5 $0.04/output image; Flux 2 Klein 4B $0.014/output megapixel; GPT Image 2 output image $0.00003/token, input text $0.000005/token, input image $0.000008/token. Angka token tidak boleh ditampilkan sebagai tarif per gambar. Video menggunakan SKU durasi/resolusi/referensi; Flux Video Upscale mempunyai tarif megapixel-second, bukan harga tetap per video.

Sampel metadata publik disimpan di `src/services/fixtures/openrouter-image-prices.json` dan `openrouter-video-catalog.json`. UI mengambil metadata langsung; fixture hanya dipakai untuk pengujian. Tarif lagu/klip Lyria berasal dari deskripsi publik ($0.08/lagu atau $0.04/klip), meskipun kolom tarif token bernilai nol.

Fallback ke API penyedia langsung dinonaktifkan pada alur generate baru. Model eksplisit dipertahankan. Retry shot merupakan tindakan pengguna dan berpotensi ditagih kembali. Pengujian respons simulasi tidak digambarkan sebagai inferensi berbayar yang sudah berhasil.
