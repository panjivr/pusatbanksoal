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
  { nama:'Izin/Sertifikat Sektoral', wajib:'Tergantung bidang', ikon:'📋',
    ket:'Sesuai KBLI & sektor: mis. sertifikat laik sehat (rumah makan), izin PSE (aplikasi/platform digital), SIUJK (konstruksi), izin apotek/klinik (kesehatan), dll. Muncul otomatis sebagai kewajiban di OSS sesuai risiko usahamu.' }
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

if (typeof window !== 'undefined') {
  window.LG_BADAN = LG_BADAN; window.LG_RISIKO = LG_RISIKO; window.LG_PAJAK = LG_PAJAK;
  window.LG_IZIN = LG_IZIN; window.LG_KALENDER = LG_KALENDER; window.LG_GLOSARIUM = LG_GLOSARIUM;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LG_BADAN:LG_BADAN, LG_RISIKO:LG_RISIKO, LG_PAJAK:LG_PAJAK, LG_IZIN:LG_IZIN, LG_KALENDER:LG_KALENDER, LG_GLOSARIUM:LG_GLOSARIUM };
}
