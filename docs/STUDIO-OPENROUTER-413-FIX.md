# Perbaikan ukuran payload gambar OpenRouter

HTTP 413 menandakan penolakan ukuran permintaan, bukan kunci API tidak valid. Referensi sebelumnya dikirim sebagai base64 asli tanpa pengendalian ukuran gabungan.

Jalur bersama `/images` dan `/chat/completions` sekarang menyiapkan salinan pengiriman dengan anggaran konservatif 6 MiB. Referensi besar diperkecil secara proporsional menggunakan WebP dengan alpha; file proyek tidak diubah, referensi tidak dibuang, teks dan model tetap dipertahankan. Gambar kecil tetap dikirim utuh. Anggaran ini merupakan kebijakan transport studio, bukan klaim batas resmi seluruh penyedia.

Penolakan HTTP 413, termasuk jawaban HTML, mengizinkan satu percobaan lagi pada model yang sama dengan anggaran 2 MiB, hanya jika payload berubah. Penolakan berulang menghasilkan pesan yang menjelaskan ukuran referensi. Jaringan terputus, hasil ambigu dan penolakan kebijakan tidak memicu pengiriman ulang tambahan. Tidak ada perpindahan model karena 413.

Validasi: tes unit penolakan HTML 413; uji Chromium empat referensi besar untuk format native/chat, ukuran gabungan, model tetap sama, file asli utuh dan alpha tetap ada. Pengujian memakai respons simulasi, tanpa generate berbayar. Batas jumlah referensi dan kemampuan tiap model tetap berlaku.

## Model pilihan dikunci

Atas permintaan pengguna, pemilihan eksplisit model gambar kini mengirim semua referensi tanpa memblokirnya berdasarkan metadata kecocokan input, jumlah referensi, rasio atau resolusi. Model gambar dalam katalog tetap dapat dipilih saat referensi tidak cocok. OpenRouter menentukan apakah masukan diterima; penolakan berhenti pada model pilihan dan tidak diteruskan ke Gemini atau model lain, termasuk bila preferensi fallback lama masih tersimpan. Mode pemilihan otomatis internal tetap menyaring kandidat berdasarkan kemampuan katalog. Pembatasan ukuran transport dan perlindungan pengiriman ulang tetap berlaku.

## 7 Oktober: papan adegan dan HTTP 400

Lebar tombol kartu shot, judul dan deskripsi kini dibatasi ke track grid. Grid dan inspector memiliki min-width nol dan tidak melebar karena ukuran intrinsik konten. Uji Chromium delapan shot dengan teks panjang lulus pada lebar 360, 768, 1280, 1920 px, tanpa overflow horizontal atau perpotongan kartu/panel.

Untuk native image models, jumlah referensi di atas batas katalog dikemas dalam contact sheet bernomor, mempertahankan semua gambar sumber dalam salinan pengiriman. Rasio yang tidak didukung menggunakan rasio katalog terdekat; resolusi yang tidak didukung menggunakan opsi katalog. Model tidak diganti. Ini dapat memengaruhi detail visual/rasio hasil dan bukan jaminan penyedia menerima seluruh permintaan. Pesan HTTP 400 kini menyertakan alasan validasi dari API dengan kredensial dan URL disamarkan. Generate berbayar tidak dipakai dalam pengujian.
