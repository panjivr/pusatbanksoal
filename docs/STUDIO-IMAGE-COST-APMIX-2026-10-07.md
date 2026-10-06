# Biaya gambar dan riset APMIX, 7 Oktober 2026

## Sumber resmi OpenRouter

GET https://openrouter.ai/api/v1/images/models/black-forest-labs/flux.2-flex/endpoints berhasil dibaca. Black Forest Labs mengenakan $0,06 per megapiksel input_image dan $0,06 per megapiksel output_image. Katalog mendukung sampai 8 referensi, rasio dan output PNG/JPEG; tidak mengumumkan pengaturan resolusi. Biaya $0,50 setara total sekitar 8,33 MP masukan + keluaran. Ini menjelaskan kemungkinan tarif pada screenshot, bukan verifikasi dimensi/tagihan pengguna. Log screenshot menunjukkan biaya $0,50 untuk transaksi FLUX sendiri dan transaksi Gemini terpisah.

Estimasi lama salah menampilkan asumsi keluaran 1 MP sebagai $0,06/hasil saat jumlah/MP referensi sebenarnya tidak diketahui. Tarif input MP sebelumnya tidak dihitung. Sekarang UI menampilkan tarif input + output, tidak memberikan total bila ukuran belum diketahui, dan menyediakan kalkulator asumsi MP dengan jumlah hasil. Metadata harga endpoint menjadi acuan utama; metadata token yang tidak lengkap tidak menjadi pengganti.

## Perubahan perilaku

Salinan referensi memiliki batas total 2 MP secara default, dapat diatur 0,25–32 MP. Referensi identik dideduplikasi. Ukuran file terkompresi kecil tidak berarti biaya megapiksel kecil. File proyek tetap utuh; pengurangan resolusi input bisa mengurangi detail. Batas ini membatasi piksel salinan input, bukan tagihan akhir atau ukuran keluaran yang dipilih penyedia.

Penggabungan referensi menjadi panel kini opsional dan default mati: model dapat meniru panel dan label menjadi kolase. Instruksi native meminta satu adegan utuh. Model yang dipilih tidak diganti, dan tidak ada referensi unik yang dibuang. Jika jumlah referensi melebihi kemampuan model tanpa panel, penyedia bisa menolak.

Opsi baru analisis/render tambahan default mati, termasuk untuk proyek yang menyimpan pilihan kontinuitas lama. Keputusan konteks shot sebelumnya, pencarian konteks gambar, penilaian dan hingga tiga render kontinuitas memerlukan opsi ini aktif. Tombol analisis manual tetap tersedia; algoritma kontinuitas dipertahankan. Render video otomatis tambahan juga mengikuti izin ini.

## APMIX

Screenshot resmi pengguna menunjukkan base URL OpenAI-compatible https://api.apmix.ai/v1 dan model gratis teks claude-sonnet-4-6-free. Tidak ada bukti dukungan image generation pada screenshot. Akses https://apmix.ai/docs, halaman utama, llms.txt dan endpoint models ditolak proxy jaringan lingkungan (HTTP 403 tunnel). Tidak ada endpoint gambar, nama model, skema payload, harga atau respons gambar yang berhasil diverifikasi. Integrasi gambar belum dibuat dengan endpoint tebakan. Pengguna diminta menyalin dokumentasi image generation tanpa API key. Ini merupakan prasyarat yang masih diperlukan untuk integrasi.

Validasi lokal: kalkulator input/output MP, total 8 hasil, data harga tidak lengkap, budget piksel dan deduplikasi di Chromium, file asli tetap utuh, kedua endpoint gambar dan pemulihan 413. Tidak ada panggilan generate berbayar.
