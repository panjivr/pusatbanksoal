# Perbaikan ukuran payload gambar OpenRouter

HTTP 413 menandakan penolakan ukuran permintaan, bukan kunci API tidak valid. Referensi sebelumnya dikirim sebagai base64 asli tanpa pengendalian ukuran gabungan.

Jalur bersama `/images` dan `/chat/completions` sekarang menyiapkan salinan pengiriman dengan anggaran konservatif 6 MiB. Referensi besar diperkecil secara proporsional menggunakan WebP dengan alpha; file proyek tidak diubah, referensi tidak dibuang, teks dan model tetap dipertahankan. Gambar kecil tetap dikirim utuh. Anggaran ini merupakan kebijakan transport studio, bukan klaim batas resmi seluruh penyedia.

Penolakan HTTP 413, termasuk jawaban HTML, mengizinkan satu percobaan lagi pada model yang sama dengan anggaran 2 MiB, hanya jika payload berubah. Penolakan berulang menghasilkan pesan yang menjelaskan ukuran referensi. Jaringan terputus, hasil ambigu dan penolakan kebijakan tidak memicu pengiriman ulang tambahan. Tidak ada perpindahan model karena 413.

Validasi: tes unit penolakan HTML 413; uji Chromium empat referensi besar untuk format native/chat, ukuran gabungan, model tetap sama, file asli utuh dan alpha tetap ada. Pengujian memakai respons simulasi, tanpa generate berbayar. Batas jumlah referensi dan kemampuan tiap model tetap berlaku.
