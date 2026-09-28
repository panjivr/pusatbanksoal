/* ============================================================
   Bekal — KBLI (referensi cepat) — kurasi kode umum KBLI 2020.
   CATATAN: daftar ini ringkas untuk membantu pemula menemukan
   arah kode. Kode/judul bisa diperbarui (mis. konversi KBLI 2025)
   — selalu verifikasi final di OSS (oss.go.id) sebelum mendaftar.
   ============================================================ */
var KBLI_DATA = [
  /* Kuliner */
  { k:'56101', j:'Restoran', s:'Kuliner' },
  { k:'56102', j:'Rumah / Warung Makan', s:'Kuliner' },
  { k:'56103', j:'Kedai Makanan', s:'Kuliner' },
  { k:'56104', j:'Penyediaan Makanan Keliling / Tempat Tidak Tetap', s:'Kuliner' },
  { k:'56210', j:'Jasa Boga / Katering untuk Event', s:'Kuliner' },
  { k:'56290', j:'Penyediaan Makanan Lainnya', s:'Kuliner' },
  { k:'56301', j:'Bar', s:'Kuliner' },
  { k:'56303', j:'Rumah Minum / Kafe', s:'Kuliner' },
  { k:'56304', j:'Kedai Minuman (kopi, teh, boba, jus)', s:'Kuliner' },
  { k:'10710', j:'Industri Produk Roti dan Kue', s:'Industri Makanan' },
  { k:'10740', j:'Industri Makaroni, Mie & Produk Sejenisnya', s:'Industri Makanan' },
  { k:'10750', j:'Industri Makanan & Masakan Olahan (frozen/siap saji)', s:'Industri Makanan' },
  { k:'10761', j:'Industri Pengolahan Kopi', s:'Industri Makanan' },
  { k:'10794', j:'Industri Kerupuk, Keripik, Peyek & Sejenisnya', s:'Industri Makanan' },
  /* Ritel & dagang */
  { k:'47111', j:'Perdagangan Eceran Berbagai Barang Utamanya Makanan/Minuman (Minimarket/Kelontong)', s:'Perdagangan' },
  { k:'47190', j:'Perdagangan Eceran Berbagai Macam Barang Lainnya', s:'Perdagangan' },
  { k:'47711', j:'Perdagangan Eceran Pakaian', s:'Perdagangan' },
  { k:'47713', j:'Perdagangan Eceran Alas Kaki (Sepatu/Sandal)', s:'Perdagangan' },
  { k:'47714', j:'Perdagangan Eceran Perlengkapan Pakaian & Aksesoris', s:'Perdagangan' },
  { k:'47722', j:'Perdagangan Eceran Kosmetik', s:'Perdagangan' },
  { k:'47591', j:'Perdagangan Eceran Furnitur', s:'Perdagangan' },
  { k:'47919', j:'Perdagangan Eceran Online / Melalui Media (Online Shop)', s:'Perdagangan' },
  /* Fashion & manufaktur */
  { k:'14111', j:'Industri Pakaian Jadi (Konveksi) dari Tekstil', s:'Manufaktur' },
  { k:'31001', j:'Industri Furnitur dari Kayu', s:'Manufaktur' },
  /* Jasa perawatan/otomotif */
  { k:'96200', j:'Aktivitas Penatu (Laundry)', s:'Jasa' },
  { k:'96122', j:'Salon Kecantikan', s:'Jasa' },
  { k:'96121', j:'Aktivitas Pangkas Rambut (Barbershop)', s:'Jasa' },
  { k:'45201', j:'Reparasi & Perawatan Mobil (Bengkel)', s:'Otomotif' },
  { k:'45202', j:'Pencucian & Salon Mobil (Cuci Mobil)', s:'Otomotif' },
  { k:'45403', j:'Pemeliharaan & Reparasi Sepeda Motor', s:'Otomotif' },
  /* Digital & kreatif */
  { k:'62019', j:'Aktivitas Pemrograman Komputer Lainnya (Software/Web)', s:'Digital & Kreatif' },
  { k:'62090', j:'Aktivitas Teknologi Informasi & Jasa Komputer Lainnya', s:'Digital & Kreatif' },
  { k:'63122', j:'Portal Web / Platform Digital Tujuan Komersial', s:'Digital & Kreatif' },
  { k:'73100', j:'Periklanan (Advertising)', s:'Digital & Kreatif' },
  { k:'74100', j:'Aktivitas Perancangan Khusus (Desain Grafis/Interior)', s:'Digital & Kreatif' },
  { k:'74201', j:'Aktivitas Fotografi', s:'Digital & Kreatif' },
  { k:'82300', j:'Penyelenggaraan Event, Konvensi & Pameran (EO)', s:'Digital & Kreatif' },
  /* Jasa lain */
  { k:'81210', j:'Aktivitas Kebersihan Umum Bangunan (Cleaning Service)', s:'Jasa' },
  { k:'70209', j:'Aktivitas Konsultasi Manajemen Lainnya', s:'Jasa' },
  { k:'85499', j:'Jasa Pendidikan Lainnya (Kursus/Bimbel)', s:'Pendidikan' },
  /* Properti */
  { k:'55900', j:'Penyediaan Akomodasi Lainnya (Kos/Guest House)', s:'Properti' },
  { k:'68110', j:'Real Estat yang Dimiliki Sendiri atau Disewakan', s:'Properti' },
  /* Pertanian/peternakan */
  { k:'01461', j:'Budidaya Ayam Ras Pedaging (Broiler)', s:'Pertanian & Peternakan' }
];

if (typeof window !== 'undefined') window.KBLI_DATA = KBLI_DATA;
if (typeof module !== 'undefined' && module.exports) module.exports = { KBLI_DATA: KBLI_DATA };
