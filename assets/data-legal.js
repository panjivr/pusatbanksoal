/* ============================================================
   Bekal — Legalitas & Pajak Usaha (data)
   Konten edukasi orisinal (bahasa sendiri). Angka & aturan
   diverifikasi dari sumber publik 2025–2026 (OSS, DJP/pajak.go.id,
   PP 55/2022 jo. PP 20/2026, PMK 131/2024). Bersifat panduan —
   selalu cek sumber resmi karena aturan bisa berubah.
   ============================================================ */

/* ---------- BADAN USAHA ---------- */
var LG_BADAN = [
  { id:'ud', nama:'Usaha Perseorangan / UD', ikon:'👤', hukum:false,
    pendiri:'1 orang', tj:'Tidak terbatas — harta pribadi & usaha jadi satu (bila rugi/utang, harta pribadi bisa terpakai).',
    modal:'Tidak ada minimum', pajak:'PPh Orang Pribadi (bisa PPh Final UMKM 0,5%)',
    dirikan:'Cukup daftar NIB di OSS (tanpa akta notaris). Beberapa daerah masih mengenal "Izin UD" tapi kini cukup NIB.',
    biaya:'Gratis–murah', waktu:'Hitungan jam–hari',
    cocok:'Usaha mikro/kecil yang baru mulai, satu pemilik, risiko rendah.',
    plus:['Paling mudah & murah','Cukup NIB (tanpa notaris)','Pajak sederhana (bisa 0,5% final & bebas s.d. Rp500 jt/th untuk OP)'],
    minus:['Tidak ada pemisahan harta (risiko ke harta pribadi)','Kredibilitas lebih rendah di mata bank/investor','Sulit ikut tender besar'] },

  { id:'ptp', nama:'PT Perorangan (Perseroan Perorangan)', ikon:'🧑‍💼', hukum:true,
    pendiri:'1 orang WNI (khusus UMK)', tj:'Terbatas — harta pribadi terlindungi, tanggung jawab sebatas modal disetor.',
    modal:'Ditentukan pendiri (kriteria UMK: modal usaha ≤ Rp5 M di luar tanah & bangunan).', pajak:'PPh Badan (0,5% final UMKM bila memenuhi syarat, lalu tarif normal + fasilitas Pasal 31E)',
    dirikan:'Cukup isi Surat Pernyataan Pendirian online di ahu.go.id (tanpa akta notaris), lalu daftar NIB di OSS.',
    biaya:'Murah (PNBP kecil)', waktu:'1–3 hari',
    cocok:'Solo founder UMK yang ingin badan hukum & perlindungan aset tanpa ribet/mahal.',
    plus:['Badan hukum = harta pribadi terlindungi','Cukup 1 orang, tanpa notaris','Murah & cepat','Naik kelas kredibilitas dibanding UD'],
    minus:['Khusus kriteria UMK (ada batas skala)','1 pemegang saham saja (sulit masuk investor tanpa ubah jadi PT biasa)','Kewajiban lapor keuangan tahunan'] },

  { id:'cv', nama:'CV (Persekutuan Komanditer)', ikon:'🤝', hukum:false,
    pendiri:'Minimal 2 orang (sekutu aktif + sekutu pasif)', tj:'Sekutu aktif: tidak terbatas (sampai harta pribadi). Sekutu pasif/komanditer: sebatas modal yang disetor.',
    modal:'Tidak ada minimum', pajak:'PPh Badan. Pembagian laba ke sekutu TIDAK dikenai PPh lagi (tak ada pajak dividen).',
    dirikan:'Akta notaris → daftar di SABU/AHU Kemenkumham → NIB di OSS.',
    biaya:'Menengah (butuh notaris, lebih murah dari PT)', waktu:'± 1–2 minggu',
    cocok:'2+ orang berpartner, butuh kredibilitas lebih dari UD tapi belum perlu badan hukum penuh.',
    plus:['Lebih kredibel dari UD/perseorangan','Tidak ada modal minimum','Pembagian laba ke sekutu tak kena pajak lagi (hemat vs dividen PT)','Proses lebih ringkas & murah dari PT'],
    minus:['Bukan badan hukum — sekutu aktif tanggung jawab sampai harta pribadi','Butuh min. 2 orang','Gaji sekutu aktif TIDAK boleh jadi biaya (non-deductible)'] },

  { id:'pt', nama:'PT (Perseroan Terbatas)', ikon:'🏢', hukum:true,
    pendiri:'Minimal 2 pemegang saham (bisa orang/badan)', tj:'Terbatas — harta pribadi pemegang saham terlindungi, sebatas saham yang dimiliki.',
    modal:'Modal dasar ditentukan pendiri (UU Cipta Kerja menghapus minimum Rp50 jt); tetap harus wajar dengan skala usaha.', pajak:'PPh Badan 22% (fasilitas Pasal 31E: diskon 50% s.d. omzet Rp4,8 M). Dividen ke pemegang saham bisa kena PPh (ada pengecualian bila diinvestasikan kembali).',
    dirikan:'Akta notaris → SK pengesahan badan hukum Kemenkumham → NIB di OSS.',
    biaya:'Lebih tinggi (notaris + PNBP)', waktu:'± 1–2 minggu',
    cocok:'Usaha yang ingin tumbuh besar, cari investor, ikut tender, atau butuh perlindungan aset maksimal.',
    plus:['Badan hukum = perlindungan aset kuat','Paling kredibel (bank, investor, tender, ekspor)','Mudah masuk investor (jual saham)','Gaji direktur = biaya (mengurangi pajak) & bisa lanjut ke banyak pemegang saham'],
    minus:['Paling mahal & administrasi paling banyak','Wajib laporan keuangan & RUPS','Potensi "pajak berganda" bila laba dibagikan sebagai dividen (walau banyak pengecualian)'] },

  { id:'firma', nama:'Firma (Fa)', ikon:'👥', hukum:false,
    pendiri:'Minimal 2 sekutu (semua aktif)', tj:'Tidak terbatas & tanggung renteng — semua sekutu bertanggung jawab penuh sampai harta pribadi.',
    modal:'Tidak ada minimum', pajak:'PPh Badan.',
    dirikan:'Akta notaris → daftar AHU → NIB di OSS.',
    biaya:'Menengah', waktu:'± 1–2 minggu',
    cocok:'Kongsi usaha di mana semua sekutu ikut aktif mengelola & saling percaya penuh.',
    plus:['Modal & pengelolaan gabungan','Relatif mudah dibentuk'],
    minus:['Semua sekutu tanggung jawab penuh (risiko tinggi)','Satu sekutu berbuat salah, semua kena'] },

  { id:'perdata', nama:'Persekutuan Perdata (Maatschap)', ikon:'⚖️', hukum:false,
    pendiri:'Minimal 2 orang', tj:'Tidak terbatas (sesuai porsi/kesepakatan).',
    modal:'Tidak ada minimum', pajak:'PPh (sesuai bentuk & kesepakatan).',
    dirikan:'Perjanjian (umumnya akta notaris) → daftar AHU.',
    biaya:'Menengah', waktu:'± 1–2 minggu',
    cocok:'Persekutuan profesi/keahlian — kantor hukum, akuntan, dokter, konsultan.',
    plus:['Cocok untuk praktik profesi bersama','Fleksibel'],
    minus:['Bukan badan hukum','Tanggung jawab bisa ke harta pribadi'] },

  { id:'yayasan', nama:'Yayasan', ikon:'🎗️', hukum:true,
    pendiri:'Pendiri + organ (Pembina, Pengurus, Pengawas)', tj:'Terbatas (badan hukum nirlaba).',
    modal:'Kekayaan awal yang dipisahkan (nominal ditentukan pendiri).', pajak:'Wajib NPWP; surplus untuk kegiatan sosial bisa dikecualikan dari objek pajak dengan syarat (mis. dana pendidikan yang ditanamkan kembali).',
    dirikan:'Akta notaris → SK badan hukum Kemenkumham.',
    biaya:'Menengah', waktu:'± 2–4 minggu',
    cocok:'Kegiatan sosial, pendidikan, keagamaan, kemanusiaan — BUKAN untuk cari untung dibagi ke pendiri.',
    plus:['Badan hukum untuk misi sosial/nirlaba','Bisa terima donasi/hibah','Kredibel untuk program sosial'],
    minus:['Laba/surplus TIDAK boleh dibagikan ke pendiri/pengurus','Pengawasan & tata kelola ketat'] },

  { id:'perkumpulan', nama:'Perkumpulan', ikon:'🫂', hukum:true,
    pendiri:'Berbasis anggota', tj:'Terbatas (badan hukum nirlaba berbasis anggota).',
    modal:'Iuran/kekayaan anggota.', pajak:'Wajib NPWP; ketentuan nirlaba.',
    dirikan:'Akta notaris → SK Kemenkumham.',
    biaya:'Menengah', waktu:'± 2–4 minggu',
    cocok:'Organisasi/komunitas berbasis anggota (asosiasi, paguyuban) dengan tujuan bersama non-profit.',
    plus:['Badan hukum untuk komunitas/asosiasi','Legal untuk kegiatan bersama anggota'],
    minus:['Nirlaba (bukan untuk bagi untung)','Tata kelola berbasis anggota'] },

  { id:'koperasi', nama:'Koperasi', ikon:'🌾', hukum:true,
    pendiri:'Minimal anggota sesuai jenis (asas kekeluargaan)', tj:'Terbatas (badan hukum).',
    modal:'Simpanan pokok & wajib anggota.', pajak:'PPh Badan; SHU ke anggota punya perlakuan khusus.',
    dirikan:'Rapat pendirian → akta notaris → pengesahan Kemenkop/Kemenkumham → NIB.',
    biaya:'Menengah', waktu:'± 2–4 minggu',
    cocok:'Usaha bersama anggota (simpan pinjam, produksi, konsumen) dengan asas gotong royong.',
    plus:['Dimiliki & untuk anggota (SHU dibagi adil)','Cocok usaha berbasis komunitas','Dukungan program pemerintah'],
    minus:['Butuh banyak anggota & rapat','Tata kelola demokratis (lebih lambat ambil keputusan)'] }
];

/* ---------- TINGKAT RISIKO OSS ---------- */
var LG_RISIKO = [
  { t:'Rendah', izin:'Cukup NIB', warna:'up', ket:'NIB langsung jadi legalitas & izin operasional. Bisa langsung jalan.' },
  { t:'Menengah Rendah', izin:'NIB + Sertifikat Standar (pernyataan mandiri)', warna:'up', ket:'Isi pernyataan mandiri pemenuhan standar di OSS; Sertifikat Standar terbit otomatis. Contoh: industri pangan rumahan (PIRT).' },
  { t:'Menengah Tinggi', izin:'NIB + Sertifikat Standar terverifikasi', warna:'warn', ket:'Ajukan pemenuhan standar; diverifikasi Kementerian/Lembaga/Pemda sebelum penuh beroperasi.' },
  { t:'Tinggi', izin:'NIB + Izin (+ Sertifikat Standar)', warna:'down', ket:'Butuh Izin yang diverifikasi penuh oleh pemerintah (mis. usaha berdampak besar ke lingkungan/keselamatan).' }
];

/* ---------- JENIS PAJAK ---------- */
var LG_PAJAK = [
  { nama:'PPh Final UMKM (PP 55/2022)', tarif:'0,5% dari omzet/bulan', siapa:'UMKM (OP & Badan) dengan omzet ≤ Rp4,8 M/tahun',
    ket:'Dihitung dari peredaran bruto (omzet), bukan laba. Untuk Orang Pribadi: omzet Rp500 juta pertama/tahun BEBAS pajak, dan tarif 0,5% kini berlaku permanen (PP 20/2026). Untuk Badan (PT/CV): TIDAK ada fasilitas bebas Rp500 juta, dan ada batas waktu pemakaian (PT 3 th, CV/Firma 4 th) sebelum pindah ke tarif normal.' },
  { nama:'PPh Badan (Pasal 17 & 31E)', tarif:'22% (efektif 11% untuk bagian omzet s.d. Rp4,8 M)', siapa:'PT, CV, Firma, dll (WP Badan) yang tidak/berhenti pakai 0,5% final',
    ket:'Tarif umum 22% dari laba kena pajak. Fasilitas Pasal 31E: WP Badan dengan omzet ≤ Rp50 M dapat diskon 50% (jadi 11%) untuk bagian laba dari omzet s.d. Rp4,8 M. PT terbuka (≥40% saham publik) bisa 19%.' },
  { nama:'PPh Pasal 21', tarif:'Progresif 5%–35% (TER bulanan)', siapa:'Gaji/upah karyawan (dipotong pemberi kerja)',
    ket:'Dipotong dari penghasilan karyawan, disetor & dilapor pemberi kerja. Mulai 2024 pakai Tarif Efektif Rata-rata (TER) bulanan lalu disetahunkan di Desember.' },
  { nama:'PPh Pasal 23', tarif:'2% (jasa/sewa selain tanah-bangunan) atau 15% (dividen/royalti/bunga)', siapa:'Pembayaran jasa, royalti, sewa, dividen ke pihak lain',
    ket:'Dipotong saat membayar jasa/royalti/sewa ke penyedia (yang punya NPWP). Tanpa NPWP, tarif naik 100%.' },
  { nama:'PPh Pasal 4 ayat (2) — Final', tarif:'Mis. sewa tanah/bangunan 10%, jasa konstruksi 1,75%–4%', siapa:'Penghasilan tertentu yang bersifat final',
    ket:'Bersifat final (tidak digabung penghasilan lain). Termasuk juga PPh Final UMKM 0,5%.' },
  { nama:'PPN (Pajak Pertambahan Nilai)', tarif:'Efektif 11% (barang/jasa umum) · 12% (barang mewah)', siapa:'Pengusaha Kena Pajak (PKP) — wajib bila omzet > Rp4,8 M/tahun',
    ket:'Tarif nominal 12% (PMK 131/2024), tapi untuk barang/jasa non-mewah DPP-nya 11/12 sehingga efektif 11%. Hanya dipungut jika kamu sudah PKP. Di bawah Rp4,8 M boleh non-PKP → tidak memungut PPN.' }
];

/* ---------- IZIN KHUSUS ---------- */
var LG_IZIN = [
  { nama:'NIB (Nomor Induk Berusaha)', wajib:'Semua usaha', ikon:'🆔',
    ket:'Identitas berusaha dari OSS. Sekaligus berfungsi sebagai TDP, Angka Pengenal Importir (API), dan akses kepabeanan. Wajib untuk semua, prasyarat izin lain.' },
  { nama:'PIRT / SPP-IRT', wajib:'Pangan olahan industri rumah tangga', ikon:'🍪',
    ket:'Sertifikat Produksi Pangan Industri Rumah Tangga untuk makanan/minuman kemasan tahan lama buatan rumahan. Diajukan lewat OSS (risiko menengah rendah), butuh NIB dulu + ikut Penyuluhan Keamanan Pangan. Untuk produk tertentu yang lebih berisiko wajib BPOM, bukan PIRT.' },
  { nama:'Izin Edar BPOM (MD/ML)', wajib:'Pangan olahan pabrikan / impor', ikon:'🏭',
    ket:'MD untuk produksi dalam negeri skala pabrik, ML untuk produk impor. Diperlukan bila produk di luar cakupan PIRT (mis. produksi massal, klaim tertentu, atau kategori berisiko).' },
  { nama:'Sertifikat Halal (BPJPH)', wajib:'Makanan, minuman, & produk terkait', ikon:'🕌',
    ket:'Diwajibkan bertahap oleh UU Jaminan Produk Halal. Untuk UMK ada jalur SELF-DECLARE gratis (program SEHATI) bagi produk berisiko rendah. Urus lewat ptsp.halal.go.id / SIHALAL.' },
  { nama:'PSE (Penyelenggara Sistem Elektronik)', wajib:'Usaha digital (aplikasi, web, e-commerce)', ikon:'💻',
    ket:'Wajib daftar PSE ke Kominfo (Komdigi) bagi yang mengoperasikan aplikasi/website/platform yang mengumpulkan atau mengolah data pengguna, transaksi, atau layanan digital. Didaftarkan lewat OSS/portal PSE. Tidak daftar bisa berujung pemblokiran.' },
  { nama:'Izin Lingkungan (SPPL / UKL-UPL / AMDAL)', wajib:'Sesuai dampak lingkungan', ikon:'🌿',
    ket:'SPPL (surat pernyataan) untuk usaha berdampak kecil; UKL-UPL untuk dampak sedang; AMDAL untuk dampak besar (pabrik, tambang). Ditentukan otomatis oleh KBLI & skala di OSS. Usaha rumahan/kecil umumnya cukup SPPL.' },
  { nama:'PBG (Persetujuan Bangunan Gedung)', wajib:'Bangunan usaha (menggantikan IMB)', ikon:'🏗️',
    ket:'PBG menggantikan IMB untuk mendirikan/mengubah bangunan usaha (toko, gudang, pabrik, ruko). Plus SLF (Sertifikat Laik Fungsi) sebelum bangunan dipakai. Diurus di sistem SIMBG. Sewa tempat? Pastikan bangunannya sudah ber-PBG.' },
  { nama:'Sertifikat Laik Sehat / Higiene', wajib:'Rumah makan, kafe, produksi pangan', ikon:'🧼',
    ket:'Bukti tempat usaha pangan memenuhi standar higiene & sanitasi, diterbitkan Dinas Kesehatan setempat. Sering diminta untuk restoran, katering, & depot air minum.' },
  { nama:'SNI (Standar Nasional Indonesia)', wajib:'Produk tertentu (wajib) / sukarela', ikon:'🏅',
    ket:'Beberapa produk wajib SNI (mis. mainan anak, helm, air minum kemasan, produk listrik). Untuk produk lain SNI bersifat sukarela tapi menambah kepercayaan & syarat masuk ritel modern/ekspor.' }
];

/* ---------- MEREK & HAKI ---------- */
var LG_HAKI = [
  { nama:'Merek (Brand/Trademark)', ikon:'🏷️', lindungi:'Nama usaha, logo, slogan',
    masa:'10 tahun (bisa diperpanjang tiap 10 th)', biaya:'UMK Rp500 rb/kelas · Umum Rp2,8 jt/kelas (online)', dimana:'merek.dgip.go.id (DJKI)',
    ket:'PALING PENTING untuk usaha. Mendaftarkan merek = kamu pemilik sah nama/logo itu; orang lain tak boleh pakai. Tanpa daftar, brand-mu bisa "dicuri"/didaftarkan orang lain lebih dulu. Cek dulu ketersediaan nama di pangkalan data DJKI, daftar per "kelas" barang/jasa (Klasifikasi Nice). UMK dapat tarif khusus (lampirkan surat pernyataan UMK bermaterai).' },
  { nama:'Hak Cipta (Copyright)', ikon:'©️', lindungi:'Karya cipta: tulisan, musik, foto, video, software, desain grafis, konten',
    masa:'Umumnya seumur hidup pencipta + 70 tahun', biaya:'Pencatatan relatif murah (tarif PNBP)', dimana:'e-hakcipta.dgip.go.id (DJKI)',
    ket:'Perlindungan muncul OTOMATIS sejak karya diciptakan — tapi mencatatkannya di DJKI memberi bukti kuat bila ada sengketa. Cocok untuk konten kreator, penulis, musisi, developer, & desainer.' },
  { nama:'Paten', ikon:'🔬', lindungi:'Invensi/teknologi baru (produk atau proses)',
    masa:'Paten biasa 20 th · Paten sederhana 10 th', biaya:'Lebih mahal + proses panjang (ada tarif UMK)', dimana:'DJKI (dgip.go.id)',
    ket:'Untuk penemuan teknologi/alat/metode yang benar-benar baru & bisa diterapkan di industri. Proses pemeriksaan lama & butuh dokumen teknis; sering pakai konsultan.' },
  { nama:'Desain Industri', ikon:'✏️', lindungi:'Tampilan/bentuk/pola/ornamen produk',
    masa:'10 tahun (tidak diperpanjang)', biaya:'Tarif PNBP (ada tarif UMK)', dimana:'DJKI',
    ket:'Melindungi desain visual produk (mis. bentuk botol, pola kemasan, desain furnitur) agar tak ditiru.' },
  { nama:'Rahasia Dagang', ikon:'🤐', lindungi:'Informasi rahasia bisnis: resep, formula, metode, data pelanggan',
    masa:'Selama kerahasiaannya terjaga (tanpa perlu daftar)', biaya:'Tidak ada (cukup jaga kerahasiaan + NDA)', dimana:'Tidak didaftarkan',
    ket:'Dilindungi UU selama kamu benar-benar merahasiakannya (mis. resep bumbu). Kuatkan dengan perjanjian kerahasiaan (NDA) untuk karyawan/mitra.' }
];

/* ---------- KARYAWAN & BPJS ---------- */
var LG_KARYAWAN = [
  { nama:'BPJS Ketenagakerjaan', ikon:'🛡️', wajib:'Wajib bagi pemberi kerja',
    ket:'Wajib mendaftarkan karyawan. Program & iuran (dari upah): <b>JKK</b> (Jaminan Kecelakaan Kerja) 0,24%–1,74% sesuai tingkat risiko — ditanggung perusahaan; <b>JKM</b> (Jaminan Kematian) 0,3% — perusahaan; <b>JHT</b> (Jaminan Hari Tua) 5,7% = 3,7% perusahaan + 2% pekerja; <b>JP</b> (Jaminan Pensiun) 3% = 2% perusahaan + 1% pekerja (batas upah 2026 ± Rp10,55 jt); plus <b>JKP</b> (Jaminan Kehilangan Pekerjaan).' },
  { nama:'BPJS Kesehatan', ikon:'🏥', wajib:'Wajib bagi pemberi kerja & pekerja',
    ket:'Iuran 5% dari upah: 4% ditanggung perusahaan + 1% dipotong dari pekerja (ada batas atas & bawah upah). Menanggung suami/istri & maks 3 anak.' },
  { nama:'Kontrak Kerja (PKWT vs PKWTT)', ikon:'📝', wajib:'Wajib tertulis',
    ket:'<b>PKWT</b> = karyawan kontrak (waktu/proyek tertentu; ada kompensasi akhir kontrak). <b>PKWTT</b> = karyawan tetap (boleh ada masa percobaan maks 3 bulan). Buat perjanjian jelas: gaji, jam kerja, hak & kewajiban.' },
  { nama:'Upah Minimum (UMP/UMK)', ikon:'💵', wajib:'Tidak boleh di bawahnya',
    ket:'Upah minimum ditetapkan tiap tahun per provinsi (UMP) & kabupaten/kota (UMK). Tidak boleh membayar di bawah UMK yang berlaku di wilayahmu. Untuk usaha mikro-kecil ada pengaturan khusus lewat kesepakatan.' },
  { nama:'THR Keagamaan', ikon:'🎁', wajib:'Wajib tahunan',
    ket:'Tunjangan Hari Raya wajib dibayar paling lambat 7 hari sebelum hari raya. Karyawan masa kerja ≥12 bulan: 1x gaji; kurang dari itu: proporsional (masa kerja/12 × gaji).' },
  { nama:'WLKP & K3', ikon:'📋', wajib:'Kewajiban administratif',
    ket:'<b>WLKP</b> (Wajib Lapor Ketenagakerjaan) dilaporkan online tiap tahun via wajiblapor.kemnaker.go.id. Terapkan juga <b>K3</b> (Keselamatan & Kesehatan Kerja) sesuai risiko usaha, serta hak cuti (tahunan 12 hari setelah 1 th, cuti melahirkan, dll).' }
];

/* ---------- PAJAK DAERAH (UU HKPD) ---------- */
var LG_PAJAKDAERAH = [
  { nama:'PBJT Makanan & Minuman (dulu "Pajak Restoran"/PB1)', tarif:'Maks 10%', ket:'Untuk restoran, kafe, katering, rumah makan. Dipungut dari pelanggan (ditambahkan di struk). Ada batas omzet minimal kena pajak yang diatur tiap daerah.' },
  { nama:'PBJT Jasa Perhotelan', tarif:'Maks 10%', ket:'Hotel, losmen, vila, homestay, kos > 10 kamar (sesuai perda).' },
  { nama:'PBJT Jasa Parkir', tarif:'Maks 10%', ket:'Penyediaan tempat parkir berbayar.' },
  { nama:'PBJT Kesenian & Hiburan', tarif:'Maks 10% (khusus diskotek/karaoke/kelab/bar/spa 40%–75%)', ket:'Tempat hiburan, tontonan, permainan. Hiburan tertentu bertarif jauh lebih tinggi.' },
  { nama:'PBB-P2 (Bumi & Bangunan)', tarif:'Maks 0,5%', ket:'Pajak tahunan atas tanah & bangunan yang kamu miliki/kuasai (rumah, ruko, tempat usaha).' },
  { nama:'BPHTB (Perolehan Hak Tanah/Bangunan)', tarif:'Maks 5%', ket:'Dibayar saat membeli/menerima tanah atau bangunan (dari nilai transaksi dikurangi NPOPTKP).' },
  { nama:'Pajak Reklame', tarif:'Maks 25%', ket:'Untuk memasang papan nama/iklan/spanduk usaha di ruang publik.' },
  { nama:'Pajak Air Tanah', tarif:'Maks 20%', ket:'Bila usaha memakai air tanah (sumur bor) untuk operasional.' }
];

/* ---------- INSENTIF & MODAL ---------- */
var LG_INSENTIF = [
  { nama:'KUR (Kredit Usaha Rakyat)', ikon:'🏦', tag:'Pembiayaan murah',
    ket:'Pinjaman modal bersubsidi bunga <b>6%/tahun</b>. Jenis: <b>Super Mikro</b> (≤ Rp10 jt), <b>Mikro</b> (Rp10–100 jt, umumnya tanpa agunan tambahan), <b>Kecil</b> (Rp100–500 jt, biasanya pakai agunan). Tenor s.d. 5 tahun. Syarat umum: WNI, usaha produktif berjalan ≥6 bulan, tidak sedang menerima kredit produktif lain (kecuali KUR sebelumnya). Diajukan lewat bank penyalur (BRI, Mandiri, BNI, dll).' },
  { nama:'PPh Final UMKM 0,5%', ikon:'🧾', tag:'Insentif pajak',
    ket:'Tarif pajak sangat rendah (0,5% dari omzet) untuk usaha ≤ Rp4,8 M/tahun. Untuk orang pribadi kini permanen (PP 20/2026).' },
  { nama:'Bebas PPh omzet ≤ Rp500 juta', ikon:'🎁', tag:'Insentif pajak (OP)',
    ket:'Orang pribadi UMKM: omzet Rp500 juta pertama per tahun tidak dikenai PPh. Tetap wajib lapor SPT.' },
  { nama:'Tarif merek & izin UMK', ikon:'🏷️', tag:'Keringanan UMK',
    ket:'Biaya daftar merek UMK jauh lebih murah (Rp500 rb/kelas vs Rp2,8 jt umum). Perizinan OSS untuk UMK juga dipermudah (banyak cukup NIB/pernyataan mandiri).' },
  { nama:'Super Tax Deduction', ikon:'📈', tag:'Skala menengah–besar',
    ket:'Pengurangan pajak untuk kegiatan vokasi (magang/pelatihan) & penelitian-pengembangan (litbang). Berguna bila usahamu sudah membina SDM/riset.' },
  { nama:'Tax Holiday / Tax Allowance', ikon:'🏭', tag:'Investasi besar',
    ket:'Pembebasan/pengurangan PPh Badan untuk investasi besar di industri pionir atau bidang tertentu. Relevan untuk usaha skala besar/PMA.' }
];

/* ---------- SANKSI & DENDA ---------- */
var LG_SANKSI = [
  { hal:'Telat lapor SPT Masa PPh', sanksi:'Denda Rp100.000 per SPT' },
  { hal:'Telat lapor SPT Masa PPN', sanksi:'Denda Rp500.000 per SPT' },
  { hal:'Telat lapor SPT Tahunan Orang Pribadi', sanksi:'Denda Rp100.000' },
  { hal:'Telat lapor SPT Tahunan Badan', sanksi:'Denda Rp1.000.000' },
  { hal:'Telat / kurang bayar pajak', sanksi:'Bunga per bulan (tarif acuan + uplift, ditetapkan bulanan; maks 24 bulan)' },
  { hal:'Beroperasi tanpa NIB/izin wajib', sanksi:'Sanksi administratif: teguran → denda → penghentian → pencabutan izin' },
  { hal:'Tidak daftarkan karyawan BPJS', sanksi:'Teguran, denda, & tak dapat layanan publik tertentu' }
];

/* ---------- KALENDER / DEADLINE ---------- */
var LG_KALENDER = [
  { pajak:'PPh Final UMKM 0,5%', setor:'Tgl 15 bulan berikutnya', lapor:'Dianggap lapor saat setor (via billing/Coretax)' },
  { pajak:'PPh Pasal 21 / Unifikasi', setor:'Tgl 15 bulan berikutnya', lapor:'Tgl 20 bulan berikutnya (SPT Masa)' },
  { pajak:'PPh Pasal 23 / 4(2)', setor:'Tgl 15 bulan berikutnya', lapor:'Tgl 20 bulan berikutnya (SPT Masa Unifikasi)' },
  { pajak:'PPN (bila PKP)', setor:'Akhir bulan berikutnya', lapor:'Akhir bulan berikutnya (SPT Masa PPN)' },
  { pajak:'SPT Tahunan Orang Pribadi', setor:'Sebelum lapor (bila kurang bayar)', lapor:'31 Maret tahun berikutnya' },
  { pajak:'SPT Tahunan Badan (PT/CV)', setor:'Sebelum lapor (bila kurang bayar)', lapor:'30 April tahun berikutnya' }
];

/* ---------- GLOSARIUM ---------- */
var LG_GLOSARIUM = [
  ['OSS','Online Single Submission — sistem perizinan berusaha terpadu (oss.go.id).'],
  ['NIB','Nomor Induk Berusaha — "KTP" usahamu dari OSS.'],
  ['KBLI','Klasifikasi Baku Lapangan Usaha Indonesia — kode 5 digit jenis usaha yang menentukan izin & risiko.'],
  ['RBA','Risk-Based Approach — perizinan berbasis tingkat risiko usaha.'],
  ['NPWP','Nomor Pokok Wajib Pajak. Untuk orang pribadi kini memakai NIK.'],
  ['PKP','Pengusaha Kena Pajak — status wajib memungut PPN (omzet > Rp4,8 M/th).'],
  ['SPT','Surat Pemberitahuan — laporan pajak (Masa = bulanan, Tahunan = setahun).'],
  ['Coretax','Sistem administrasi pajak DJP terbaru (berlaku sejak 1 Jan 2025).'],
  ['PP','Peraturan Pemerintah.'],
  ['UMK','Usaha Mikro & Kecil (kriteria modal/omzet tertentu).'],
  ['Peredaran bruto','Istilah pajak untuk omzet/total penjualan.'],
  ['Deductible','Biaya yang boleh mengurangi laba kena pajak.']
];

/* ---------- PANDUAN LANGKAH-DEMI-LANGKAH ---------- */
var LG_PANDUAN = [
  { id:'oss', judul:'Daftar NIB di OSS', ikon:'🆔', ket:'Dapatkan izin dasar usaha (NIB) secara online & gratis.',
    langkah:[
      { t:'Siapkan berkas', d:'NIK/KTP, email &amp; nomor HP aktif, NPWP (bila ada), titik lokasi usaha, dan perkiraan modal usaha.' },
      { t:'Buat akun OSS', d:'Buka oss.go.id → Daftar → pilih skala (UMK perseorangan / badan usaha) → verifikasi lewat email/HP.' },
      { t:'Isi data usaha', d:'Masuk, klik "Perizinan Berusaha" → isi data pelaku usaha, bidang usaha, dan lokasi.' },
      { t:'Pilih KBLI', d:'Masukkan kode KBLI yang sesuai kegiatan usahamu (boleh lebih dari satu). Sistem menampilkan tingkat risiko.' },
      { t:'Terbitkan NIB', d:'Centang pernyataan mandiri, proses, lalu NIB terbit &amp; bisa diunduh. Untuk risiko rendah, NIB = izin operasional.' },
      { t:'Lengkapi izin lanjutan', d:'Bila risikonya menengah/tinggi, penuhi Sertifikat Standar / Izin sesuai instruksi OSS.' }
    ] },
  { id:'merek', judul:'Daftar Merek di DJKI', ikon:'🏷️', ket:'Lindungi nama & logo brand-mu agar tak bisa diklaim orang lain.',
    langkah:[
      { t:'Cek ketersediaan', d:'Buka merek.dgip.go.id → Penelusuran → pastikan nama/logo belum didaftarkan pihak lain di kelas yang sama.' },
      { t:'Siapkan berkas', d:'Logo (format sesuai ketentuan), data pemohon, tanda tangan, dan Surat Pernyataan UMK bermaterai (untuk tarif UMK). Lihat tab Template.' },
      { t:'Buat akun & ajukan', d:'Daftar akun di merek.dgip.go.id → ajukan permohonan → pilih kelas barang/jasa (Klasifikasi Nice).' },
      { t:'Bayar PNBP', d:'UMK ± Rp500 rb/kelas, umum ± Rp2,8 jt/kelas. Bayar via kode billing.' },
      { t:'Proses pemeriksaan', d:'Ada masa pengumuman &amp; pemeriksaan substantif (beberapa bulan). Pantau status di akun.' },
      { t:'Sertifikat terbit', d:'Bila disetujui, sertifikat merek terbit &amp; berlaku 10 tahun (bisa diperpanjang).' }
    ] },
  { id:'npwp', judul:'Buat NPWP & Akun Pajak (Coretax)', ikon:'🧾', ket:'Siapkan identitas & akun untuk bayar/lapor pajak.',
    langkah:[
      { t:'Orang pribadi', d:'NIK kini berfungsi sebagai NPWP. Aktifkan/validasi di akun pajak. Badan: daftar NPWP badan setelah akta/NIB terbit.' },
      { t:'Aktifkan akun', d:'Masuk ke coretaxdjp.pajak.go.id (atau djponline.pajak.go.id) dengan email/HP aktif.' },
      { t:'Ambil EFIN bila perlu', d:'EFIN dipakai untuk aktivasi layanan elektronik — ajukan sekali ke KPP/online.' },
      { t:'Kukuhkan PKP (bila omzet > Rp4,8 M)', d:'Agar bisa buat e-Faktur &amp; memungut PPN.' }
    ] },
  { id:'bpjs', judul:'Daftarkan Karyawan ke BPJS', ikon:'🛡️', ket:'Wajib saat mempekerjakan orang.',
    langkah:[
      { t:'Daftar badan usaha', d:'Daftarkan usaha sebagai pemberi kerja di BPJS Ketenagakerjaan (bpjsketenagakerjaan.go.id) &amp; BPJS Kesehatan (bpjs-kesehatan.go.id).' },
      { t:'Daftarkan karyawan', d:'Input data karyawan &amp; upah. Sistem menghitung iuran tiap program.' },
      { t:'Bayar iuran rutin', d:'Setor iuran bulanan (sebagian dipotong dari gaji, sebagian ditanggung perusahaan). Cek estimasi di Simulasi → Iuran BPJS.' },
      { t:'Lapor perubahan', d:'Perbarui bila ada karyawan masuk/keluar atau perubahan upah.' }
    ] },
  { id:'kur', judul:'Ajukan KUR (Modal Usaha)', ikon:'🏦', ket:'Pinjaman modal bunga rendah (6%/tahun).',
    langkah:[
      { t:'Pastikan syarat', d:'WNI, usaha produktif berjalan ≥6 bulan, tidak sedang menerima kredit produktif lain, punya NIB/legalitas.' },
      { t:'Siapkan berkas', d:'KTP, KK, NIB/izin usaha, catatan penjualan/keuangan, &amp; rencana penggunaan dana.' },
      { t:'Pilih bank penyalur', d:'BRI, Mandiri, BNI, BSI, dll. Ajukan online atau ke kantor cabang.' },
      { t:'Survei & pencairan', d:'Petugas menilai usaha; bila disetujui dana cair. Pilih plafon &amp; tenor (s.d. 5 tahun) sesuai kemampuan.' }
    ] },
  { id:'pajak', judul:'Bayar & Lapor Pajak', ikon:'💳', ket:'Rutin bulanan & tahunan agar tak kena denda.',
    langkah:[
      { t:'Hitung pajak', d:'Mis. PPh Final UMKM = 0,5% × omzet bulan itu. Gunakan tab Simulasi.' },
      { t:'Buat kode billing', d:'Di Coretax/DJP Online, buat ID Billing untuk jenis pajak yang mau dibayar.' },
      { t:'Bayar', d:'Lewat bank / e-wallet / kantor pos. Simpan bukti (NTPN/BPN).' },
      { t:'Lapor SPT', d:'Lapor SPT Masa (bulanan) &amp; SPT Tahunan (OP 31 Maret, Badan 30 April). Nihil pun tetap lapor.' }
    ] }
];

/* ---------- TEMPLATE DOKUMEN (draf umum, sesuaikan kebutuhan) ---------- */
var LG_TEMPLATE = [
  { id:'umk', nama:'Surat Pernyataan UMK', ket:'Untuk mendapatkan tarif UMK saat daftar merek/izin.', file:'surat-pernyataan-umk.txt',
    isi:'SURAT PERNYATAAN USAHA MIKRO KECIL (UMK)\n\nYang bertanda tangan di bawah ini:\nNama\t\t: {{NAMA}}\nNIK\t\t: {{NIK}}\nAlamat\t\t: {{ALAMAT}}\nNama Usaha\t: {{NAMA_USAHA}}\nJabatan\t\t: Pemilik\n\nDengan ini menyatakan dengan sebenar-benarnya bahwa usaha saya termasuk dalam kategori Usaha Mikro Kecil (UMK) sesuai ketentuan peraturan perundang-undangan yang berlaku.\n\nSurat pernyataan ini saya buat dengan sadar, tanpa paksaan, dan untuk digunakan sebagai kelengkapan permohonan {{KEPERLUAN}}. Apabila di kemudian hari pernyataan ini tidak benar, saya bersedia menanggung akibat hukumnya.\n\n{{KOTA}}, {{TANGGAL}}\nYang menyatakan,\n\n\n(materai Rp10.000)\n{{NAMA}}' },
  { id:'pkwt', nama:'Perjanjian Kerja (PKWT)', ket:'Kontrak karyawan waktu tertentu.', file:'perjanjian-kerja-pkwt.txt',
    isi:'PERJANJIAN KERJA WAKTU TERTENTU (PKWT)\n\nPada hari ini {{TANGGAL}}, yang bertanda tangan di bawah ini:\n\n1. {{NAMA_PERUSAHAAN}}, diwakili oleh {{NAMA_PEMBERI_KERJA}} selaku {{JABATAN_PEMBERI}}, beralamat di {{ALAMAT_PERUSAHAAN}} — selanjutnya disebut PIHAK PERTAMA (Pemberi Kerja).\n2. {{NAMA_KARYAWAN}}, NIK {{NIK_KARYAWAN}}, beralamat di {{ALAMAT_KARYAWAN}} — selanjutnya disebut PIHAK KEDUA (Pekerja).\n\nKedua pihak sepakat mengadakan perjanjian kerja dengan ketentuan:\n\nPasal 1 — Jabatan & Tugas\nPihak Kedua bekerja sebagai {{POSISI}} dengan tugas {{URAIAN_TUGAS}}.\n\nPasal 2 — Jangka Waktu\nPerjanjian berlaku {{DURASI}}, terhitung {{TGL_MULAI}} sampai {{TGL_SELESAI}}.\n\nPasal 3 — Waktu Kerja\nHari & jam kerja: {{JAM_KERJA}}.\n\nPasal 4 — Upah & Hak\nUpah sebesar Rp{{UPAH}} per bulan, dibayar setiap {{TGL_GAJIAN}}. Pihak Kedua diikutsertakan dalam BPJS Ketenagakerjaan & BPJS Kesehatan sesuai ketentuan, serta berhak atas THR keagamaan.\n\nPasal 5 — Kewajiban Pekerja\nMenjalankan tugas dengan baik, menjaga nama baik & rahasia perusahaan, serta menaati peraturan yang berlaku.\n\nPasal 6 — Berakhirnya Perjanjian\nPerjanjian berakhir sesuai jangka waktu, atau lebih awal sesuai ketentuan peraturan ketenagakerjaan. Pihak Kedua berhak atas kompensasi akhir PKWT sesuai aturan.\n\nPasal 7 — Penutup\nHal yang belum diatur diselesaikan secara musyawarah & mengacu pada peraturan perundang-undangan.\n\nDemikian perjanjian ini dibuat rangkap dua bermaterai cukup.\n\nPIHAK PERTAMA\t\t\tPIHAK KEDUA\n\n\n{{NAMA_PEMBERI_KERJA}}\t\t{{NAMA_KARYAWAN}}' },
  { id:'nda', nama:'Perjanjian Kerahasiaan (NDA)', ket:'Melindungi rahasia dagang/informasi bisnis.', file:'perjanjian-kerahasiaan-nda.txt',
    isi:'PERJANJIAN KERAHASIAAN (NON-DISCLOSURE AGREEMENT)\n\nPada tanggal {{TANGGAL}}, para pihak:\n1. {{PIHAK_1}} — Pihak yang mengungkapkan informasi (Pengungkap).\n2. {{PIHAK_2}} — Pihak yang menerima informasi (Penerima).\n\nPasal 1 — Informasi Rahasia\nMeliputi seluruh informasi bisnis, teknis, keuangan, resep/formula, data pelanggan, strategi, dan dokumen yang diungkapkan Pengungkap kepada Penerima, baik lisan maupun tertulis.\n\nPasal 2 — Kewajiban\nPenerima wajib: (a) menjaga kerahasiaan informasi; (b) tidak mengungkapkan ke pihak ketiga tanpa izin tertulis; (c) memakai informasi hanya untuk tujuan {{TUJUAN}}.\n\nPasal 3 — Pengecualian\nKewajiban tidak berlaku atas informasi yang telah menjadi milik publik bukan karena kelalaian Penerima, atau wajib dibuka berdasarkan hukum.\n\nPasal 4 — Jangka Waktu\nKewajiban kerahasiaan berlaku selama {{DURASI}} sejak tanggal perjanjian, termasuk setelah kerja sama berakhir.\n\nPasal 5 — Akibat Pelanggaran\nPelanggaran menimbulkan tanggung jawab ganti rugi sesuai peraturan yang berlaku.\n\nDemikian perjanjian dibuat rangkap dua bermaterai cukup.\n\nPENGUNGKAP\t\t\tPENERIMA\n\n\n{{PIHAK_1}}\t\t\t{{PIHAK_2}}' },
  { id:'kerjasama', nama:'Perjanjian Kerja Sama Usaha', ket:'Kesepakatan kemitraan / bagi hasil.', file:'perjanjian-kerja-sama.txt',
    isi:'SURAT PERJANJIAN KERJA SAMA USAHA\n\nPada tanggal {{TANGGAL}}, para pihak:\n1. {{PIHAK_1}}, {{PERAN_1}} — PIHAK PERTAMA.\n2. {{PIHAK_2}}, {{PERAN_2}} — PIHAK KEDUA.\n\nsepakat bekerja sama dalam usaha {{NAMA_USAHA}} dengan ketentuan:\n\nPasal 1 — Bentuk Kerja Sama\n{{DESKRIPSI_KERJASAMA}}.\n\nPasal 2 — Modal & Kontribusi\nPihak Pertama menyetor {{KONTRIBUSI_1}}. Pihak Kedua menyetor {{KONTRIBUSI_2}}.\n\nPasal 3 — Pembagian Hasil\nKeuntungan/kerugian dibagi dengan porsi {{PORSI}} (mis. 60:40) setelah dikurangi biaya operasional.\n\nPasal 4 — Hak & Kewajiban\n{{HAK_KEWAJIBAN}}.\n\nPasal 5 — Jangka Waktu & Evaluasi\nBerlaku {{DURASI}} dan dievaluasi setiap {{PERIODE_EVALUASI}}.\n\nPasal 6 — Penyelesaian Sengketa\nDiselesaikan secara musyawarah; bila gagal, sesuai hukum yang berlaku.\n\nDemikian perjanjian dibuat rangkap dua bermaterai cukup.\n\nPIHAK PERTAMA\t\t\tPIHAK KEDUA\n\n\n{{PIHAK_1}}\t\t\t{{PIHAK_2}}' },
  { id:'invoice', nama:'Invoice / Faktur', ket:'Tagihan penjualan ke pelanggan/klien.', file:'invoice.txt',
    isi:'INVOICE\n\n{{NAMA_USAHA}}\n{{ALAMAT_USAHA}} — {{KONTAK}}\n\nNo. Invoice\t: {{NO_INVOICE}}\nTanggal\t\t: {{TANGGAL}}\nJatuh Tempo\t: {{JATUH_TEMPO}}\n\nKepada\t\t: {{NAMA_PELANGGAN}}\nAlamat\t\t: {{ALAMAT_PELANGGAN}}\n\n---------------------------------------------\nNo | Deskripsi | Qty | Harga | Subtotal\n1  | {{ITEM_1}} | {{QTY_1}} | {{HARGA_1}} | {{SUB_1}}\n2  | {{ITEM_2}} | {{QTY_2}} | {{HARGA_2}} | {{SUB_2}}\n---------------------------------------------\nSubtotal\t: Rp{{SUBTOTAL}}\nPPN (bila PKP)\t: Rp{{PPN}}\nTOTAL\t\t: Rp{{TOTAL}}\n\nPembayaran ke: {{BANK}} a.n. {{NAMA_REKENING}} No. {{NO_REKENING}}\n\nTerima kasih atas kepercayaan Anda.' },
  { id:'kwitansi', nama:'Kwitansi', ket:'Bukti terima pembayaran.', file:'kwitansi.txt',
    isi:'KWITANSI\n\nNo\t\t: {{NO}}\nTelah terima dari\t: {{DARI}}\nUang sejumlah\t: Rp{{JUMLAH}} ({{TERBILANG}})\nUntuk pembayaran\t: {{KEPERLUAN}}\n\n{{KOTA}}, {{TANGGAL}}\nPenerima,\n\n\n(materai bila > Rp5 juta)\n{{NAMA_PENERIMA}}' },
  { id:'kuasa', nama:'Surat Kuasa', ket:'Memberi wewenang mengurus sesuatu atas nama Anda.', file:'surat-kuasa.txt',
    isi:'SURAT KUASA\n\nYang bertanda tangan di bawah ini:\nNama\t: {{PEMBERI}}\nNIK\t: {{NIK_PEMBERI}}\nAlamat\t: {{ALAMAT_PEMBERI}}\nselanjutnya disebut PEMBERI KUASA.\n\nDengan ini memberi kuasa kepada:\nNama\t: {{PENERIMA}}\nNIK\t: {{NIK_PENERIMA}}\nAlamat\t: {{ALAMAT_PENERIMA}}\nselanjutnya disebut PENERIMA KUASA.\n\n--------- KHUSUS ---------\nUntuk mengurus/menandatangani/mengambil {{KEPERLUAN}} di {{INSTANSI}} atas nama Pemberi Kuasa.\n\nDemikian surat kuasa ini dibuat untuk digunakan sebagaimana mestinya.\n\n{{KOTA}}, {{TANGGAL}}\nPenerima Kuasa,\t\t\tPemberi Kuasa,\n\n\n{{PENERIMA}}\t\t\t(materai Rp10.000)\n\t\t\t\t{{PEMBERI}}' },
  { id:'domisili', nama:'Surat Keterangan Domisili Usaha', ket:'Keterangan lokasi usaha (bila diminta; sebagian daerah).', file:'surat-domisili-usaha.txt',
    isi:'SURAT KETERANGAN DOMISILI USAHA\n\nYang bertanda tangan di bawah ini, {{JABATAN_PEJABAT}} {{WILAYAH}}, menerangkan bahwa:\n\nNama Usaha\t: {{NAMA_USAHA}}\nPemilik\t\t: {{NAMA_PEMILIK}}\nBidang Usaha\t: {{BIDANG}}\nAlamat Usaha\t: {{ALAMAT_USAHA}}\n\nbenar berdomisili dan menjalankan kegiatan usaha di alamat tersebut di wilayah kami.\n\nSurat keterangan ini dibuat untuk keperluan {{KEPERLUAN}}.\n\n{{KOTA}}, {{TANGGAL}}\n{{JABATAN_PEJABAT}},\n\n\n{{NAMA_PEJABAT}}\n\nCatatan: Beberapa daerah tidak lagi mewajibkan SKDU karena sudah tergantikan NIB. Konfirmasi ke kelurahan/OSS setempat.' }
];

if (typeof window !== 'undefined') {
  window.LG_BADAN = LG_BADAN; window.LG_RISIKO = LG_RISIKO; window.LG_PAJAK = LG_PAJAK;
  window.LG_IZIN = LG_IZIN; window.LG_KALENDER = LG_KALENDER; window.LG_GLOSARIUM = LG_GLOSARIUM;
  window.LG_HAKI = LG_HAKI; window.LG_KARYAWAN = LG_KARYAWAN; window.LG_PAJAKDAERAH = LG_PAJAKDAERAH;
  window.LG_INSENTIF = LG_INSENTIF; window.LG_SANKSI = LG_SANKSI;
  window.LG_PANDUAN = LG_PANDUAN; window.LG_TEMPLATE = LG_TEMPLATE;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LG_BADAN:LG_BADAN, LG_RISIKO:LG_RISIKO, LG_PAJAK:LG_PAJAK, LG_IZIN:LG_IZIN, LG_KALENDER:LG_KALENDER, LG_GLOSARIUM:LG_GLOSARIUM, LG_HAKI:LG_HAKI, LG_KARYAWAN:LG_KARYAWAN, LG_PAJAKDAERAH:LG_PAJAKDAERAH, LG_INSENTIF:LG_INSENTIF, LG_SANKSI:LG_SANKSI, LG_PANDUAN:LG_PANDUAN, LG_TEMPLATE:LG_TEMPLATE };
}
