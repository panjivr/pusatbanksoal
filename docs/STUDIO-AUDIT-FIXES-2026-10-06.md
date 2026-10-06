# Perbaikan berdasarkan audit Studio Film AI, 6 Oktober 2026

Laporan unggahan pengguna dipakai sebagai temuan, bukan instruksi untuk mengganti kebijakan produk. Generate tetap menggunakan OpenRouter sesuai permintaan terakhir pengguna. Callback API langsung tidak diaktifkan (A02): satu kunci OpenRouter tidak memberikan kemampuan khusus semua API native.

## Perbaikan

- A01: pilihan model tetap ketat secara default. Pengaturan baru mengizinkan alternatif model gambar kompatibel, dengan pilihan awal didahulukan. Hanya penolakan pasti yang bisa memicu perpindahan. Saldo/key ditolak menghentikan percobaan pada key yang sama; timeout, hasil kosong, kebijakan konten, dan pembatalan tidak memicu generate ulang.
- A03: service memvalidasi payload final (jumlah referensi, rasio, resolusi) sebelum membuat tugas. Pesan mencantumkan parameter aktual dan batas referensi. Picker Gambar AI memasukkan referensi tag karakter. Picker Concept/Storyboard belum memprediksi seluruh referensi kontekstual yang ditambahkan secara asinkron; estimasi referensi di sana masih perlu penyatuan lebih lanjut.
- A04/A05: katalog audio menggabungkan output audio dan speech. Speech memakai `/audio/speech` dan berkas biner; chat audio menggunakan SSE `delta.audio`. Stream terpotong tidak dijadikan hasil sukses. Model suara/musik/SFX dibedakan berdasarkan dukungan yang dinyatakan katalog; input narasi tidak ditambahkan instruksi yang akan ikut dibacakan. Durasi musik dalam prompt masih berupa arahan, bukan jaminan durasi terstruktur.
- A06/A20/A21: parameter animasi avatar mengikuti picker. Mode sinkronisasi bibir/transfer gerakan yang belum diimplementasikan berhenti sebelum request, tidak mengabaikan input. Pilihan suara mengambil `supported_voices` OpenRouter, bukan daftar ElevenLabs. Opsi shim tidak lagi diabaikan.
- A07/A08/A12/A14: Foto inpaint/outpaint, sudut karakter/outfit, pakaian dan base swimwear memakai model gambar OpenRouter pilihan. Edit bermasker membuat snapshot sumber dan mask sebelum await; komposit lokal menjaga piksel di luar mask. Pemilihan rasio edit mendekati rasio sumber berdasarkan dukungan model; hasil akhir mempertahankan ukuran canvas sumber.
- A09: setiap gambar/video berhasil langsung masuk daftar versi sebelum review/refine. Jika tahap berikutnya gagal, hasil yang telah berhasil tetap tersedia. Algoritma penilaian dan pemilihan best attempt tetap dipertahankan pada proses yang selesai.
- A10/A32: ID video diperlakukan sebagai segmen path opaque, tidak diwajibkan prefix undocumented. Sebelum POST, status pengiriman ditulis; sesudah submit, ID pekerjaan disimpan. Request yang sama melanjutkan polling/download melalui ID yang tersimpan, tanpa POST baru. Pengiriman yang kehilangan respons tanpa ID tidak otomatis diulang. Pemulihan bergantung pada penyimpanan browser dan payload yang sama; belum ada layar daftar recovery lintas proyek.
- A11/A18: capability video berasal dari katalog. Model prompt-only dapat dijalankan tanpa frame; frame yang tidak didukung atau input audio/motion yang belum diimplementasikan ditolak sebelum generate. Bingkai storyboard tidak otomatis dikirim ke model prompt-only.
- A13: preferensi model proyek lama tanpa ID katalog dimigrasikan ke pilihan OpenRouter perangkat, atau kosong agar pengguna memilih model.
- A15/A16/A17: kunci per shot mencegah request bertumpuk. Batch video melanjutkan shot lain dan melaporkan jumlah berhasil/gagal/dilewati serta nomor gagal. Batch gambar melaporkan jumlah berhasil/gagal/dilewati dan nomor gagal. Payload video memakai rasio efektif shot, termasuk override.
- A19: relight mempunyai rasio/resolusi sendiri dengan callback picker.
- A25/A35: pembacaan sumber upscale berada di dalam try/finally. Metadata tidak mengklaim target resolusi yang tidak dikirim. Upscale tetap berdasarkan faktor yang dikirim; target resolusi UI lama perlu penyederhanaan lebih lanjut.
- A26/A27: tombol Activity membatalkan melalui registry; status cancelled tidak dapat ditimpa settlement. Transport generate gambar/video/audio mendapat sinyal abort. Pembatalan lokal tidak mengklaim membatalkan remote job. Riwayat disimpan lokal, hingga 500 tugas selama tujuh hari, dapat diunduh sebagai JSON; kredensial yang cocok pola disamarkan. Ini bukan log permanen tanpa batas.
- A28/A31/A33/A37/A38: metadata native gambar mengatasi metadata duplikat general. Error HTTP200 in-band menggunakan kode error actual. Penghitung gambar hanya queued/running. Media/tugas mencatat model actual, selected model, provider, job ID video dan usage/cost jika respons menyediakan. Estimasi tetap dibedakan dari biaya actual dan belum termasuk review/refine.

## Batas yang masih memerlukan implementasi terpisah

Nodes, Compositing, Set Design, stems dan Dunia 3D specialized (A22/A23/A24), video reference-to-video (A29), dan pembersihan seluruh cabang legacy Auto/ComfyUI/upscale (A34/A36) belum dimigrasikan menyeluruh. Operasi khusus tidak dianggap tersedia hanya karena pengguna memiliki key OpenRouter. Laporan ini tidak menyatakan seluruh 38 temuan telah selesai.

## Validasi

Tes Node, typecheck/build produksi, browser dengan respons API simulasi, pemeriksaan responsif, serta regresi penyimpanan/backup dijalankan untuk perubahan ini. Tidak ada generate berbayar yang dilakukan dalam task ini. `scripts/check-film-audit-fixes.cjs` menguji recovery unduhan dengan satu POST, ID opaque, TTS, SSE, pembatalan dan piksel mask. `scripts/check-film-openrouter-catalog.cjs` menggunakan protokol audio streaming baru.
