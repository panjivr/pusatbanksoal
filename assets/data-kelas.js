/* ============================================================
   KELAS "BISNIS MULAI DARI NOL" — data kurikulum (Bekal)
   ------------------------------------------------------------
   7 chapter berurutan. Materi mengajarkan kerangka bisnis standar
   (SWOT/TOWS, IKIGAI, Lean Canvas, Porter's Five Forces, PESTLE,
   TAM/SAM/SOM, USP, Competitive Moat, Maslow, STP, AIDA, 7P,
   metrik keuangan & pertumbuhan, valuasi) — disusun dengan bahasa
   & contoh sendiri. Kedalaman penuh; tiap chapter punya slot video
   (.mp4) yang menyampaikan materi secara mendetail.

   Skema blok (dirender kelas.html):
     lead|p|h · callout(key|tip|warn|quote) · list|steps
     diagram(flow|funnel|pyramid|cycle|quad|bars) · table · formula
     video · img · books · quiz
   ============================================================ */
var KELAS_META = {
  judul: 'Bisnis Mulai dari Nol',
  batch: 'Batch 1',
  ringkas: '7 chapter membangun bisnis dari nol — fondasi founder & valuasi, inovasi ide, riset pasar, produk & USP, branding-sales-marketing, operasional lean, sampai metrik pertumbuhan. Belajar seperti kuliah online: teks, diagram, dan video.',
  catatan: 'Materi menjelaskan kerangka bisnis standar dengan bahasa & contoh sendiri. Slot video tiap sesi menyampaikan materi secara mendetail (diisi saat rekaman diunggah).'
};

var KELAS_DATA = [

/* ============ MODUL 0 — ORIENTASI ============ */
{
  id:'m0', judul:'Orientasi', ikon:'i-compass', label:'Mulai',
  ringkas:'Cara memakai kelas & peta 7 chapter.',
  lessons:[
    { id:'m0l1', judul:'Selamat datang & cara belajar', durasi:'6 mnt',
      ringkas:'Peta kelas dan cara menuntaskannya.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Video pengantar (diisi saat rekaman diunggah).'},
        {t:'lead', x:'Kelas ini untuk kamu yang <b>benar-benar mulai dari nol</b> — belum punya produk, modal terbatas, bahkan belum yakin mau jualan apa. Tujuannya membangun <b>fondasi yang benar</b> lalu bergerak sampai ada bukti pasar dan bisnis yang bisa dibesarkan.'},
        {t:'callout', k:'key', judul:'Prinsip kelas', x:'Belajar sambil mengeksekusi. Tiap chapter ditutup satu <b>Tindakan</b> nyata. Jangan lompat sebelum tindakannya kamu kerjakan.'},
        {t:'h', x:'Peta perjalanan — 7 chapter'},
        {t:'list', items:[
          '<b>Chapter 1 — Fondasi Founder & Valuasi:</b> kenali diri, siapkan internal & eksternal, nilai & pitch bisnis.',
          '<b>Chapter 2 — Inovasi Ide Bisnis:</b> temukan & kembangkan ide yang cocok pasar.',
          '<b>Chapter 3 — Riset Pasar & Profil Pelanggan:</b> ukur pasar & pahami pelanggan.',
          '<b>Chapter 4 — Produk Unggul & USP:</b> bangun produk kompetitif & profitable.',
          '<b>Chapter 5 — Branding, Sales & Marketing:</b> perkenalkan & jual dengan efektif.',
          '<b>Chapter 6 — Operasional Lean:</b> jalankan bisnis rapi & efisien.',
          '<b>Chapter 7 — Skill Fondasi & Metrik Pertumbuhan:</b> ukur & besarkan bisnis.'
        ]},
        {t:'steps', items:[
          'Tonton/baca satu sesi sampai selesai.',
          'Kerjakan kotak <b>Tindakan</b> di akhir sesi.',
          'Tandai sesi <b>Selesai</b> — progресmu tersimpan otomatis di perangkat.',
          'Ulang sesi yang berat; paham lebih penting dari cepat.'
        ]},
        {t:'callout', k:'tip', judul:'Siapkan', x:'Satu buku catatan khusus kelas ini. Semua tugas ditulis di sana — jadi cetak biru bisnismu.'}
      ]
    }
  ]
},

/* ============ CHAPTER 1 — FONDASI FOUNDER & VALUASI ============ */
{
  id:'m1', judul:'Fondasi Founder & Valuasi', ikon:'i-user', label:'Chapter 1',
  ringkas:'Inti bisnis adalah foundernya. Siapkan diri secara internal & eksternal, lalu pahami cara menilai (valuasi) & mem-pitch bisnis.',
  lessons:[
    { id:'m1l1', judul:'Bisnis vs dagang & bisnis yang hebat', durasi:'9 mnt',
      ringkas:'Beda bisnis dengan berdagang, dan tolok ukur bisnis baik.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'lead', x:'<b>Bisnis</b> adalah organisasi yang mencari keuntungan lewat penjualan barang/jasa — berbeda dari sekadar <b>berdagang</b> (tukar barang untuk untung sesaat).'},
        {t:'table', head:['Berdagang','Bisnis'], rows:[
          ['Tukar-menukar barang untuk untung','Ada inovasi & pengembangan produk'],
          ['Berhenti di transaksi','Ada pemasaran & branding'],
          ['Sulit dibesarkan','Bisa di-<i>scale up</i> & memberi dampak']
        ], cap:'Bisnis punya inovasi, pemasaran, branding, dan bisa dibesarkan.'},
        {t:'h', x:'Kapan bisnis disebut hebat?'},
        {t:'p', x:'Bukan sekadar berumur panjang atau untung besar, tapi memberi <b>dampak (impact)</b> bagi para <b>pemangku kepentingan (stakeholder)</b>.'},
        {t:'diagram', kind:'quad', judul:'Peta stakeholder', nodes:[
          {t:'Internal', d:'Pemilik, manajer, karyawan, pemegang saham'},
          {t:'Eksternal', d:'Pelanggan, pemasok, kreditur, pemerintah, masyarakat'},
          {t:'Dampak ke dalam', d:'Beri ruang tumbuh & sejahtera bagi tim'},
          {t:'Dampak ke luar', d:'Selesaikan masalah pelanggan & masyarakat'}
        ], cap:'Makin luas & positif dampaknya, makin baik bisnisnya.'},
        {t:'callout', k:'warn', judul:'Pelajaran', x:'Perusahaan yang dulu mendominasi bisa jatuh karena <b>tidak adaptif</b> pada perubahan. Bisnis hebat terus menyesuaikan diri.'},
        {t:'quiz', q:'Penanda utama “bisnis hebat” adalah…', opts:['Sekadar berumur panjang','Memberi dampak nyata bagi stakeholder & adaptif','Untung besar sekali lalu tutup'], a:1, exp:'Tolok ukurnya dampak berkelanjutan bagi stakeholder.'}
      ]
    },
    { id:'m1l2', judul:'Mengenal diri: SWOT diri, IKIGAI & 3P', durasi:'11 mnt',
      ringkas:'Inti bisnis adalah kamu. Petakan kekuatan-kelemahan & temukan alasan bergerak.',
      blocks:[
        {t:'lead', x:'Inti setiap bisnis adalah <b>foundernya</b>. Sebelum menilai pasar, kenali diri — kekuatan <i>dan</i> kelemahan, keadaan internal <i>dan</i> lingkungan eksternal. Fakta: banyak orang tidak bekerja sesuai bidang yang mereka inginkan; makin penting mengenali diri sebelum melangkah.'},
        {t:'diagram', kind:'quad', judul:'SWOT untuk dirimu', nodes:[
          {t:'Strength', d:'Apa kelebihanmu?'},
          {t:'Weakness', d:'Apa kelemahan yang perlu disiasati?'},
          {t:'Opportunity', d:'Peluang di sekitarmu?'},
          {t:'Threat', d:'Ancaman/risiko yang mengintai?'}
        ], cap:'Contoh: chef lulusan Italia (kuat masak Italia, lemah masakan lokal), di daerah tanpa resto Italia (peluang) tapi selera warga belum tentu cocok (ancaman). Apa keputusanmu?'},
        {t:'h', x:'IKIGAI — alasan untuk bergerak'},
        {t:'diagram', kind:'cycle', judul:'4 pertanyaan IKIGAI', nodes:[
          {t:'Kamu sukai', d:'Apa yang kamu cintai?'},
          {t:'Kamu kuasai', d:'Apa yang kamu jago?'},
          {t:'Dunia butuh', d:'Apa yang dibutuhkan orang?'},
          {t:'Dibayar', d:'Untuk apa orang mau bayar?'}
        ], cap:'Irisan keempatnya = arah usaha yang selaras dengan dirimu & pasar.'},
        {t:'callout', k:'tip', judul:'3P sebagai kompas', x:'<b>Passion</b> (kerja untuk yang kamu pedulikan) · <b>Purpose</b> (jadi lebih besar dari diri sendiri) · <b>Pleasure</b> (kejar hasil jangka pendek).'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Tulis SWOT dirimu (3 poin tiap kuadran) & jawab 4 pertanyaan IKIGAI.'}
      ]
    },
    { id:'m1l3', judul:'Tipe founder & rencana SMART', durasi:'10 mnt',
      ringkas:'Kenali tipe pengusaha & susun target yang benar-benar bisa dijalankan.',
      blocks:[
        {t:'p', x:'Setiap pengusaha punya sifat berbeda — <b>tidak ada yang salah</b>. Mengenali tipe dirimu memudahkan menentukan peran & mencari partner yang melengkapi.'},
        {t:'diagram', kind:'flow', judul:'Tiga tipe umum pendiri', nodes:[
          {t:'Perancang', d:'Idealis, suka menciptakan solusi & inovasi produk'},
          {t:'Penghubung', d:'Pandai membangun koneksi & membaca pasar/pelanggan'},
          {t:'Penjaga', d:'Memastikan seluruh proses bisnis rapi & teratur'}
        ], cap:'Kombinasi tipe yang saling melengkapi membuat tim lebih kuat.'},
        {t:'h', x:'Rencana pengembangan diri — SMART'},
        {t:'table', head:['Huruf','Arti','Pertanyaan'], rows:[
          ['S','Specific','Apa persisnya yang mau dicapai?'],
          ['M','Measurable','Bagaimana mengukurnya (angka)?'],
          ['A','Actionable','Apa langkah nyatanya?'],
          ['R','Realistic','Masuk akal dengan sumber dayamu?'],
          ['T','Time-bound','Kapan tenggatnya?']
        ], cap:'Contoh: “Buka 3 cabang di kota X dalam 4 bulan, modal Rp50 juta, 15 karyawan, resep dari cabang pertama.”'},
        {t:'list', items:[
          '<b>Tujuan jangka pendek</b> (minggu–bulan): mis. “pahami keuangan pribadi dengan ikut kelas minggu depan.”',
          '<b>Tujuan jangka panjang</b> (tahunan): mis. “luncurkan perusahaan sendiri dalam 5 tahun.”'
        ]},
        {t:'quiz', q:'Bagian “M” pada SMART berarti…', opts:['Motivasi tinggi','Measurable — bisa diukur','Maksimal usaha'], a:1, exp:'M = Measurable; target harus punya ukuran.'}
      ]
    },
    { id:'m1l4', judul:'Persiapan internal founder', durasi:'14 mnt',
      ringkas:'Keuangan pribadi, permodalan, waktu, risiko, & ketajaman bisnis.',
      blocks:[
        {t:'lead', x:'Sebelum bisnis jalan, siapkan <b>empat hal internal</b>: keuangan pribadi, manajemen waktu, manajemen risiko, dan ketajaman bisnis.'},
        {t:'h', x:'1) Keuangan pribadi'},
        {t:'callout', k:'warn', judul:'Pengusaha = tidak ada gaji tetap', x:'Karena pendapatan tidak pasti, jaga hal berikut:'},
        {t:'list', items:[
          '<b>Arus kas aman</b> — pengeluaran harus selalu lebih kecil dari pendapatan.',
          '<b>Dana darurat</b> — siapkan <b>3–6 bulan</b> rata-rata pengeluaran (mis. butuh Rp5jt/bln → siapkan Rp15–30jt). Pasca-krisis, bisa ditingkatkan sampai 12 bulan.',
          '<b>Pisahkan</b> keuangan pribadi dengan bisnis.',
          '<b>Berpikir logis</b>, jangan impulsif.'
        ]},
        {t:'h', x:'3 tipe permodalan'},
        {t:'table', head:['Tipe','Penjelasan'], rows:[
          ['Bootstrap (dana pribadi)','Pakai tabungan/sumber daya sendiri'],
          ['Loan (pinjaman)','Pinjam ke pihak lain, mis. bank + bunga'],
          ['Equity (saham)','Tambah modal dari pihak lain dengan menukar saham (mis. Venture Capital)']
        ], cap:'Tips: perbanyak investasi pasif (reksa dana, obligasi, saham) yang tak perlu diperjualbelikan berkala.'},
        {t:'h', x:'2) Manajemen waktu'},
        {t:'p', x:'Waktu membuat pengusaha <b>efektif</b>. Susun to-do-list dengan <b>Action Priority Matrix</b> (memilah tugas berdasarkan usaha vs dampak), dan visualkan timeline dengan <b>Gantt chart</b> atau tabel waktu harian (bisa pakai kalender digital).'},
        {t:'diagram', kind:'quad', judul:'Action Priority Matrix', nodes:[
          {t:'Quick Wins', d:'Dampak tinggi, usaha rendah → kerjakan dulu'},
          {t:'Major Projects', d:'Dampak tinggi, usaha tinggi → rencanakan'},
          {t:'Fill-ins', d:'Dampak rendah, usaha rendah → sisipan'},
          {t:'Thankless Tasks', d:'Dampak rendah, usaha tinggi → hindari'}
        ], cap:'Prioritaskan yang dampaknya besar dengan usaha wajar.'},
        {t:'h', x:'3) Manajemen risiko'},
        {t:'p', x:'Tanyakan: “Apa risiko yang mungkin terjadi & bagaimana menghadapinya?” Risiko bisa berupa <b>finansial, keamanan, reputasi</b>, dll. Tujuannya <b>meminimalkan</b>, bukan menghindari sepenuhnya.'},
        {t:'h', x:'4) Ketajaman bisnis'},
        {t:'p', x:'Kepekaan yang <b>bisa dilatih</b> dari pengalaman, mencakup <b>skill, pengetahuan, & kemampuan</b>. Berguna saat mengambil keputusan dengan mempertimbangkan aspek internal & eksternal (mis. bagi tugas dengan partner sesuai kekuatan masing-masing).'},
        {t:'callout', k:'tip', judul:'Tahap skill pengusaha', x:'<b>Early</b>: pitching, cari funding, strategi marketing, cari keunikan produk. <b>Mid</b>: pencatatan & analisa keuangan, kelola sumber daya. <b>Late</b>: analisa rasio keuangan, evaluasi, perbaikan masalah, buat dashboard — plus semua skill tahap sebelumnya.'}
      ]
    },
    { id:'m1l5', judul:'Persiapan eksternal founder', durasi:'12 mnt',
      ringkas:'Kebutuhan modal, partner, mentor, & kompetitor.',
      blocks:[
        {t:'h', x:'1) Kebutuhan modal'},
        {t:'p', x:'Permodalan untuk membangun bisnismu. Tujuannya menghitung uang keluar pertama & memudahkan menghitung profitabilitas. Catat rapi: <b>sumber modal, jumlah, & detail kesepakatan</b>.'},
        {t:'table', head:['Sumber','Jumlah','Kesepakatan'], rows:[
          ['Utang ke orang tua','Rp3.000.000','Dikembalikan, bunga 0%'],
          ['Utang ke teman','Rp1.000.000','Bunga 1%, jatuh tempo bulan tertentu'],
          ['<b>Total modal awal</b>','<b>Rp4.000.000</b>','—']
        ], cap:'Contoh tabel kebutuhan modal sederhana.'},
        {t:'h', x:'2) Partner bisnis'},
        {t:'p', x:'Partner bisa <b>melengkapi skill</b>-mu sekaligus jadi bentuk manajemen risiko. Data mendukung:'},
        {t:'list', items:[
          'Bisnis dengan <b>banyak founder</b> punya tingkat bertahan <b>~30% lebih tinggi</b> daripada solo founder (National Bureau of Economic Research).',
          'Studi First Round Capital: bisnis multi-founder <b>mengungguli</b> solo founder hingga <b>103%</b>.'
        ]},
        {t:'callout', k:'warn', judul:'Catatan', x:'Tapi <b>tidak semua bisnis wajib</b> punya partner — sesuaikan kebutuhan.'},
        {t:'h', x:'3) Mentor'},
        {t:'p', x:'Orang yang mau membagi pengalaman & pengetahuannya. Langkah mencari mentor:'},
        {t:'steps', items:[
          'Cari orang yang kamu kagumi & sudah berhasil.',
          'Cari kesamaan denganmu.',
          'Mulai pembicaraan, perkenalkan diri, usahakan bertemu.',
          'Prinsip memberi & menerima.',
          'Pilih yang mau tumbuh & mendukungmu.',
          'Punya manajemen konflik yang baik.',
          'Punya visi yang sama.'
        ]},
        {t:'callout', k:'tip', judul:'Ingat', x:'Tidak ada mentor “terbaik” — yang ada <b>cocok-cocokan</b>.'},
        {t:'h', x:'4) Kompetitor'},
        {t:'p', x:'Bandingkan produk/jasamu dengan pesaing yang sudah ada. Ini membantu memahami <b>potensi pasar</b> & <b>diferensiasi</b> apa yang bisa kamu lakukan. Gunakan <b>position map</b> untuk memetakan posisimu terhadap pesaing.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Isi tabel kebutuhan modalmu, tulis 1 kandidat mentor, dan buat position map sederhana vs 2 pesaing.'}
      ]
    },
    { id:'m1l6', judul:'Dari SWOT ke TOWS (aksi)', durasi:'11 mnt',
      ringkas:'Ubah hasil SWOT jadi langkah nyata dengan matriks TOWS.',
      blocks:[
        {t:'lead', x:'<b>SWOT</b> memetakan keadaan internal (Strength, Weakness) & eksternal (Opportunity, Threat). <b>TOWS</b> melangkah lebih jauh: memasangkan keempatnya jadi <b>aksi</b>. Mudahnya — SWOT tahap pengenalan diri, TOWS tahap tindakan.'},
        {t:'diagram', kind:'quad', judul:'Matriks TOWS', nodes:[
          {t:'S–O (Maksi-Maksi)', d:'Pakai kekuatan untuk memaksimalkan peluang'},
          {t:'W–O (Mini-Maksi)', d:'Kurangi kelemahan dengan memanfaatkan peluang'},
          {t:'S–T (Maksi-Mini)', d:'Pakai kekuatan untuk mengurangi ancaman'},
          {t:'W–T (Mini-Mini)', d:'Hindari ancaman dengan mengurangi kelemahan'}
        ], cap:'Setiap sel menghasilkan langkah konkret yang bisa dieksekusi.'},
        {t:'h', x:'Contoh: usaha ayam goreng'},
        {t:'table', head:['SWOT','Isi'], rows:[
          ['Strength','Harga terjangkau; konsep trendy sesuai anak muda'],
          ['Weakness','Masalah pendanaan; pasokan ayam sering telat'],
          ['Opportunity','Permintaan tinggi; sedikit pesaing yang go-digital'],
          ['Threat','Kompetitor punya banyak konsumen loyal & produk serupa']
        ]},
        {t:'list', items:[
          '<b>S–O:</b> tambah modal untuk stok lebih banyak; go-digital lewat layanan pesan-antar.',
          '<b>W–O:</b> pakai sistem pre-order online; penetrasi ke area permintaan tertinggi.',
          '<b>S–T:</b> gencarkan marketing offline (banner/kemitraan lokal); pakai sistem referral/loyalti.',
          '<b>W–T:</b> diversifikasi pemasok & menu; cari angel investor untuk pendanaan awal.'
        ]},
        {t:'callout', k:'key', judul:'Tindakan', x:'Susun SWOT bisnismu, lalu turunkan minimal 1 aksi untuk tiap sel TOWS.'}
      ]
    },
    { id:'m1l7', judul:'Lean Canvas & proses bisnis', durasi:'10 mnt',
      ringkas:'Petakan seluruh model & alur bisnis dalam satu halaman.',
      blocks:[
        {t:'lead', x:'Bisnis yang <b>lean</b> fokus menyelesaikan masalah sambil <b>merampingkan operasi & menekan biaya</b> — meningkatkan efisiensi, produktivitas, & profitabilitas. Salah satu alatnya: <b>Lean Canvas</b> (satu halaman untuk seluruh model bisnis).'},
        {t:'table', head:['Blok Lean Canvas','Pertanyaan'], rows:[
          ['Masalah','Masalah utama pelanggan?'],
          ['Segmen pelanggan','Untuk siapa?'],
          ['Unique Value Proposition','Kenapa beda & layak dipilih?'],
          ['Solusi','Fitur/produk yang menjawab masalah'],
          ['Saluran','Cara menjangkau pelanggan'],
          ['Revenue Stream','Dari mana pendapatan berasal'],
          ['Cost Structure','Seluruh biaya tetap & variabel'],
          ['Key Metrics','Angka kunci yang dipantau'],
          ['Unfair Advantage','Keunggulan yang sulit ditiru']
        ], cap:'Kamu perlu tahu seluruh proses internal & eksternal untuk mengisinya.'},
        {t:'h', x:'Business Process Mapping'},
        {t:'p', x:'Seorang founder perlu paham <b>flowchart</b> sederhana — diagram yang mewakili alur kerja: tiap bentuk = satu langkah, panah = arah proses. Ini bagian dari Business Process Mapping.'},
        {t:'diagram', kind:'flow', judul:'Cara membuat process mapping', nodes:[
          {t:'Identifikasi', d:'Tentukan proses bisnisnya'},
          {t:'Kumpulkan info', d:'Semua data terkait'},
          {t:'Buat chart', d:'Gambarkan alurnya'},
          {t:'Optimalkan', d:'Perbaiki agar efisien'}
        ], cap:'Detail operasional dibahas lebih lanjut di Chapter 6.'}
      ]
    },
    { id:'m1l8', judul:'Raising funds & valuasi', durasi:'14 mnt',
      ringkas:'Menggalang dana & empat cara menaksir nilai bisnis.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi valuasi (menyusul).'},
        {t:'callout', k:'warn', judul:'Kenapa penting', x:'Salah satu penyebab bisnis gagal adalah <b>kekurangan dana</b>. Menggalang dana yang tepat jadi salah satu penyelamat.'},
        {t:'p', x:'<b>Raising funds</b> = proses bisnis mendapatkan dana dari investor (untuk launch, marketing, operasional, growth), biasanya menawarkan saham/obligasi.'},
        {t:'callout', k:'tip', judul:'Sebelum cari investor', x:'Mulai kecil (bootstrap) · uji ide ke 3F (friends, family, fools) · pastikan model bisnis terbukti · buat analisis pasar detail · lakukan validasi produk.'},
        {t:'h', x:'Apa itu valuasi?'},
        {t:'p', x:'Memberi “harga” pada sebuah objek (perusahaan, properti, dll). Founder perlu menghitungnya agar tidak salah menawar dan kedua pihak diuntungkan. Empat metode umum:'},
        {t:'h', x:'1) Asset-Based Valuation'},
        {t:'formula', x:'Valuasi = Total Harta − Total Hutang', cap:'Contoh: harta Rp70jt − hutang Rp20jt → Rp50 juta.'},
        {t:'h', x:'2) Market Multiple Valuation'},
        {t:'steps', items:[
          'Cari valuasi & metrik perusahaan sejenis (mis. GMV).',
          'Hitung pengali: <b>Valuation Multiple = Valuasi ÷ Metrik</b>.',
          'Kalikan pengali itu dengan metrik bisnismu.'
        ]},
        {t:'h', x:'3) Discounted Cash Flow (DCF)'},
        {t:'p', x:'Menaksir nilai dari <b>arus kas masa depan</b> yang di-diskon ke nilai sekarang: proyeksikan arus kas beberapa tahun, tentukan tingkat diskonto, jumlahkan nilai sekarangnya.'},
        {t:'h', x:'4) Enterprise Multiple (EV/EBITDA)'},
        {t:'p', x:'Membandingkan nilai perusahaan (Enterprise Value) terhadap EBITDA; lazim untuk bisnis yang sudah menghasilkan laba operasional.'},
        {t:'quiz', q:'Rumus Asset-Based Valuation…', opts:['Total Harta − Total Hutang','Valuasi ÷ Metrik','Arus kas didiskon'], a:0, exp:'Asset-based = total harta − total hutang.'}
      ]
    },
    { id:'m1l9', judul:'Cara pitch yang menarik investor', durasi:'11 mnt',
      ringkas:'Kerangka presentasi agar investor cepat paham & tertarik.',
      blocks:[
        {t:'lead', x:'Pitch baik membuat investor cepat paham <b>masalah, solusi, ukuran peluang, dan kenapa kamu</b>. Ringkas, berbasis data, jujur.'},
        {t:'diagram', kind:'flow', judul:'Alur cerita pitch', nodes:[
          {t:'Masalah', d:'Rasa sakit nyata & besar'},
          {t:'Solusi', d:'Produkmu menyelesaikannya'},
          {t:'Pasar', d:'TAM/SAM/SOM'},
          {t:'Model', d:'Dari mana uang masuk'},
          {t:'Bukti', d:'Traksi: penjualan, pengguna'},
          {t:'Tim & Ask', d:'Siapa kamu & butuh dana berapa'}
        ], cap:'Susun ceritanya mengalir, bukan tumpukan angka.'},
        {t:'list', items:[
          '<b>Mulai dari masalah</b>, bukan fitur — investor beli peluang.',
          '<b>Tunjukkan traksi</b> sekecil apa pun.',
          '<b>Perjelas “ask”</b>: butuh dana berapa, untuk apa, target apa.',
          'Untuk awal, pertimbangkan <b>angel investor</b> atau 3F.'
        ]},
        {t:'callout', k:'key', judul:'Tindakan', x:'Susun draf pitch 6 slide mengikuti alur di atas. Satu kalimat kuat per slide.'}
      ]
    }
  ]
},

/* ============ CHAPTER 2 — INOVASI IDE BISNIS ============ */
{
  id:'m2', judul:'Inovasi Ide Bisnis', ikon:'i-sparkles', label:'Chapter 2',
  ringkas:'Menemukan & mengembangkan ide baru yang cocok pasar.',
  lessons:[
    { id:'m2l1', judul:'Masalah adalah kesempatan', durasi:'9 mnt',
      ringkas:'Kenapa ide lahir dari masalah, dan cara menilai kelayakannya.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'lead', x:'Tidak ada ide yang sempurna. Setiap perusahaan besar berawal dari ide sederhana — pembedanya adalah <b>PELAKSANAAN</b>. Ide selalu lahir dari <b>masalah</b>.'},
        {t:'callout', k:'quote', judul:'', x:'Roda lahir karena orang kesulitan memindahkan barang berat. Layanan ojek daring lahir karena akses transportasi sulit. Masalah = kesempatan dalam berbisnis.'},
        {t:'h', x:'Menilai kelayakan ide (ala Harvard Business Review)'},
        {t:'list', items:[
          '<b>Masalah</b> apa yang akan kamu selesaikan?',
          '<b>Keuntungan</b> apa yang didapat pelanggan?',
          '<b>Kompetitor</b> — siapa yang sudah bermain?',
          '<b>Kondisi pasar</b> — tumbuh atau jenuh?'
        ]},
        {t:'callout', k:'key', judul:'Tindakan', x:'Tulis 10 masalah yang kamu temui minggu ini. Lingkari 3 yang paling sering & menyakitkan.'}
      ]
    },
    { id:'m2l2', judul:'Kembangkan ide: Low-Hanging Fruit vs Market Gap', durasi:'12 mnt',
      ringkas:'Dua cara mengembangkan ide: dari dalam diri, atau dari celah pasar.',
      blocks:[
        {t:'diagram', kind:'flow', judul:'Dua pendekatan', nodes:[
          {t:'Low-Hanging Fruit', d:'Inside-out: dari kekuatan/keresahan pribadi'},
          {t:'Market Gap', d:'Outside-in: dari celah yang belum terpenuhi'}
        ], cap:'Keduanya sah — pilih sesuai sumber daya & waktumu.'},
        {t:'h', x:'1) Low-Hanging Fruit Theory'},
        {t:'p', x:'Ambil “buah terdekat” — ide yang mudah diproses karena berangkat dari <b>kegemaran/keresahan pribadi</b>. Hemat biaya & personal. Contoh: buka jasa cuci motor karena tahu kendaraan pasti kotor & banyak orang malas mencuci sendiri.'},
        {t:'h', x:'2) Market Gap Theory'},
        {t:'p', x:'Peluang muncul saat ada <b>celah</b> antara supply & demand yang belum terpenuhi. Contoh: saat stok masker menipis padahal permintaan melonjak, produsen kain cepat memproduksi masker massal.'},
        {t:'steps', items:['Cari pangsa pasar yang <b>spesifik</b>.','Amati & adaptasi bisnis dari luar negeri.','Tanya langsung ke calon pelanggan.']},
        {t:'callout', k:'warn', judul:'Perhatikan', x:'Market Gap butuh <b>lebih banyak waktu & usaha</b>, tapi bila pasar belum jenuh potensinya besar.'},
        {t:'table', head:['Orientasi hasil','Fokus'], rows:[
          ['Solution-centric','Menyelesaikan masalah & kebutuhan pelanggan'],
          ['Monetization-centric','Memaksimalkan keuntungan / pendapatan']
        ], cap:'Ide kuat menyeimbangkan keduanya.'},
        {t:'quiz', q:'“Usaha dari hobi/keresahan pribadi” adalah…', opts:['Market Gap','Low-Hanging Fruit','Red Ocean'], a:1, exp:'Berangkat dari diri (inside-out) = Low-Hanging Fruit.'}
      ]
    },
    { id:'m2l3', judul:'Brainstorming & Six Thinking Hats', durasi:'11 mnt',
      ringkas:'Teknik memunculkan banyak ide, lalu menilai dari 6 sudut pandang.',
      blocks:[
        {t:'p', x:'<b>Brainstorming</b> = memunculkan banyak ide kreatif dalam waktu singkat (diperkenalkan Alex Osborn, 1953). Empat tipe umum:'},
        {t:'table', head:['Tipe','Cara kerja'], rows:[
          ['Reverse','Balik masalahnya — fokus pada yang ingin dicapai'],
          ['Stop-and-Go','Evaluasi setelah semua ide terkumpul'],
          ['Brainwriting','Ideasi individual, semua dicatat'],
          ['Rapid Ideation','Tim menulis sebanyak mungkin dalam waktu terbatas']
        ]},
        {t:'h', x:'Six Thinking Hats (Edward de Bono, 1985)'},
        {t:'list', items:[
          '🟢 <b>Hijau</b> — inovasi & solusi kreatif.',
          '🔴 <b>Merah</b> — emosi & intuisi.',
          '🟡 <b>Kuning</b> — optimisme; sisi positif & peluang.',
          '⚫ <b>Hitam</b> — kehati-hatian; risiko & kelemahan.',
          '🔵 <b>Biru</b> — moderator; mengatur diskusi.',
          '⚪ <b>Putih</b> — data & fakta hasil observasi.'
        ]},
        {t:'callout', k:'key', judul:'Tindakan', x:'Pilih 1 masalah, brainwriting 10 solusi, saring pakai topi Kuning (peluang) & Hitam (risiko). Lalu minta pendapat 3 orang sekitar untuk “pengakuan” ide.'}
      ]
    }
  ]
},

/* ============ CHAPTER 3 — RISET PASAR & PROFIL PELANGGAN ============ */
{
  id:'m3', judul:'Riset Pasar & Profil Pelanggan', ikon:'i-search', label:'Chapter 3',
  ringkas:'Ukur pasar, pahami pelanggan, analisis pesaing sebelum menghabiskan modal.',
  lessons:[
    { id:'m3l1', judul:'Kenali industri: Porter’s Five Forces & PESTLE', durasi:'12 mnt',
      ringkas:'Dua kerangka menilai daya tarik & risiko industri.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'callout', k:'warn', judul:'Kenapa wajib riset & validasi?', x:'Tanpa riset & validasi, kegagalan hampir pasti. Riset mengidentifikasi peluang, mengurangi risiko, mengenal target pelanggan, & memberi keyakinan mengambil keputusan.'},
        {t:'h', x:'Porter’s Five Forces'},
        {t:'list', items:[
          '<b>Barrier of Entry</b> — semudah apa pemain baru masuk? Makin mudah, makin rentan.',
          '<b>Threat of Substitution</b> — adakah pengganti? Makin banyak, makin turun nilai jualmu.',
          '<b>Bargaining Power of Supplier</b> — banyak pemasok = kamu leluasa memilih.',
          '<b>Bargaining Power of Buyer</b> — banyak kompetitor = pembeli leluasa; posisimu melemah.',
          '<b>Rivalry</b> — seketat apa persaingan antar pemain.'
        ]},
        {t:'h', x:'PESTLE (faktor makro)'},
        {t:'table', head:['Faktor','Yang dinilai'], rows:[
          ['Political','Pengaruh kebijakan pemerintah'],
          ['Economical','Nilai tukar, pertumbuhan ekonomi, daya beli'],
          ['Social','Tren & perilaku masyarakat'],
          ['Technological','Peran teknologi & otomasi'],
          ['Legal','Undang-undang & regulasi'],
          ['Environmental','Faktor lingkungan']
        ]},
        {t:'quiz', q:'“Seberapa mudah pemain baru masuk” = gaya Porter mana?', opts:['Barrier of Entry','Bargaining Power of Buyer','Threat of Substitution'], a:0, exp:'Barrier of Entry — makin rendah, makin mudah pesaing baru muncul.'}
      ]
    },
    { id:'m3l2', judul:'Metode riset & ukuran pasar (TAM/SAM/SOM)', durasi:'13 mnt',
      ringkas:'Tiga jenis riset, mengukur besar pasar, & menilai kejenuhan.',
      blocks:[
        {t:'diagram', kind:'flow', judul:'Alur riset yang valid', nodes:[
          {t:'Secondary', d:'Data dari sumber yang sudah ada'},
          {t:'Tertiary', d:'Rangkum/simpulkan ulang data sekunder'},
          {t:'Primary', d:'Validasi langsung: wawancara, survei, observasi'}
        ], cap:'Mulai sekunder & tersier, tutup dengan primer agar valid.'},
        {t:'diagram', kind:'funnel', judul:'TAM · SAM · SOM', nodes:[
          {t:'TAM', d:'Total Addressable Market — seluruh potensi permintaan'},
          {t:'SAM', d:'Serviceable Available Market — yang bisa kamu layani'},
          {t:'SOM', d:'Serviceable Obtainable Market — yang realistis kamu raih'}
        ], cap:'Hitung Top-Down (internasional→nasional→sektor) atau Bottom-Up (data bisnismu→SAM→TAM).'},
        {t:'formula', x:'TAM = jumlah calon pembeli × harga maksimum produk'},
        {t:'formula', x:'SAM = target segmen dari TAM × harga maksimum'},
        {t:'formula', x:'SOM = pangsa pasar tahun lalu × SAM tahun ini'},
        {t:'h', x:'Saturasi: Blue Ocean vs Red Ocean'},
        {t:'table', head:['','Blue Ocean','Red Ocean'], rows:[
          ['Persaingan','Sedikit/belum ada','Sangat ketat'],
          ['Produk','Unik & baru','Serupa'],
          ['Harga','Bisa premium','Perang harga'],
          ['Contoh','Kategori belum ramai','Kopi, boba, nasi goreng, fashion']
        ], cap:'Bisnis baru lebih aman menghindari samudra merah yang jenuh.'},
        {t:'p', x:'<b>Riset harga:</b> survei harga pesaing, tanya pelanggan, & tetapkan berbasis <b>nilai</b> — lihat urgensi & manfaat dari sudut pelanggan, lalu sesuaikan kemampuan bayar.'},
        {t:'quiz', q:'Urutan pasar dari terluas ke tersempit…', opts:['SOM→SAM→TAM','TAM→SAM→SOM','SAM→TAM→SOM'], a:1, exp:'TAM > SAM > SOM.'}
      ]
    },
    { id:'m3l3', judul:'Profil pelanggan, pain point & pesaing', durasi:'12 mnt',
      ringkas:'Kenali pelanggan sedetail mungkin & bandingkan dengan pesaing.',
      blocks:[
        {t:'h', x:'Profil & segmentasi pelanggan'},
        {t:'table', head:['Segmentasi','Dasar'], rows:[
          ['Demographic','Umur, gender, income, pendidikan, lokasi'],
          ['Behavioral','Frekuensi & besar belanja, produk favorit'],
          ['Geographic','Wilayah/lokasi geografis'],
          ['Psychographic','Nilai, gaya hidup, minat']
        ]},
        {t:'h', x:'Customer pain points (4 kategori)'},
        {t:'list', items:[
          '<b>Productivity</b> — ingin lebih efisien/hemat waktu.',
          '<b>Support</b> — sulit dapat bantuan saat membeli.',
          '<b>Financial</b> — merasa terlalu mahal / biaya tersembunyi.',
          '<b>Process</b> — ingin proses beli lebih sederhana.'
        ]},
        {t:'h', x:'Analisis pesaing'},
        {t:'table', head:['Jenis','Definisi','Contoh'], rows:[
          ['Direct','Produk/jasa sama','Dua gerai burger'],
          ['Indirect','Beda produk, target sama','Pizza vs burger']
        ]},
        {t:'diagram', kind:'quad', judul:'Analisis 4P pesaing', nodes:[
          {t:'Product', d:'Fitur, kualitas, kelemahan'},
          {t:'Price', d:'Model & tingkat harga'},
          {t:'Promotion', d:'Kanal iklan & USP'},
          {t:'Place', d:'Tempat & cara menjual'}
        ], cap:'Lengkapi dengan SWOT & positioning untuk menemukan keunggulanmu.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Buat 1 profil pelanggan ideal + 3 pain point-nya, lalu bandingkan 2 pesaing pakai 4P. Setelah sinyal positif, siapkan MVP untuk validasi pasar.'}
      ]
    }
  ]
},

/* ============ CHAPTER 4 — PRODUK UNGGUL & USP ============ */
{
  id:'m4', judul:'Produk Unggul & USP', ikon:'i-bolt', label:'Chapter 4',
  ringkas:'Bangun produk yang kompetitif (beda & bernilai) sekaligus profitable.',
  lessons:[
    { id:'m4l1', judul:'Jadi kompetitif: USP & winning zone', durasi:'12 mnt',
      ringkas:'Do it better or do it differently — temukan keunikan yang dipedulikan pasar.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'lead', x:'Untuk kompetitif: <b>lakukan lebih baik</b> atau <b>lakukan berbeda</b>. <b>USP (Unique Selling Proposition)</b> adalah atribut yang <b>membedakan</b> produkmu & memberi nilai tambah bagi pelanggan. Kuncinya: <b>unik & spesifik</b>.'},
        {t:'diagram', kind:'quad', judul:'Winning zone', nodes:[
          {t:'Winning zone', d:'Kamu unggul & pelanggan peduli — pembeda jelas'},
          {t:'Risky', d:'Kamu & pesaing sama-sama kuat — medan tempur, butuh eksekusi superior'},
          {t:'Losing zone', d:'Pesaing memenuhi kebutuhan lebih baik — kamu kalah'},
          {t:'Who cares', d:'Unggul di hal yang pelanggan tak pedulikan — buang waktu'}
        ], cap:'Sasar “winning zone”: yang kamu kuat × yang pelanggan peduli × yang pesaing lemah.'},
        {t:'h', x:'Cara menemukan USP'},
        {t:'steps', items:[
          'Identifikasi kebutuhan pelanggan.',
          'Pahami produkmu — kelebihan & kekurangannya.',
          'Identifikasi kompetitor produkmu.'
        ]},
        {t:'h', x:'3 tipe USP'},
        {t:'table', head:['Tipe','Fokus','Contoh'], rows:[
          ['Functional','Fungsi/kegunaan produk','Jaket agar tak kedinginan'],
          ['Economic','Hemat / cost-effective','Mobil dengan harga murah'],
          ['Emotional','Rasa/emosi saat membeli','Brand mewah menimbulkan rasa bangga']
        ]},
        {t:'callout', k:'warn', judul:'USP vs Value Proposition', x:'<b>USP</b> = hal <b>unik</b> yang membedakan dari pesaing. <b>VP (Value Proposition)</b> = hal <b>umum</b> yang dimiliki hampir semua usaha sejenis (memberi tahu apa produknya & kenapa penting). USP menajamkan pembeda; VP merangkum nilai dasar.'},
        {t:'quiz', q:'Ciri USP yang baik…', opts:['Umum & menyenangkan semua orang','Unik & spesifik','Sama seperti pesaing tapi lebih murah'], a:1, exp:'USP harus unik & spesifik agar jadi alasan nyata memilihmu.'}
      ]
    },
    { id:'m4l2', judul:'Kaitkan ke kebutuhan: Maslow', durasi:'10 mnt',
      ringkas:'Jual solusi berdasarkan tingkat kebutuhan manusia.',
      blocks:[
        {t:'p', x:'Setelah USP ditemukan, kaitkan dengan <b>kebutuhan dasar</b> pelanggan. Hierarki Maslow membagi kebutuhan manusia jadi lima tingkat — jual solusi yang menjawab tingkat tertentu.'},
        {t:'diagram', kind:'pyramid', judul:'Hierarki kebutuhan Maslow', nodes:[
          {t:'Fisiologis', d:'Makan, minum, pakaian, tempat tinggal — mis. restoran cepat saji'},
          {t:'Rasa aman', d:'Kesehatan, perlindungan, kepastian — mis. asuransi'},
          {t:'Sosial', d:'Diterima & dicintai komunitas — mis. media sosial'},
          {t:'Penghargaan', d:'Status, pengakuan — mis. produk mewah simbol status'},
          {t:'Aktualisasi diri', d:'Pengembangan diri & visi besar — mis. platform kursus'}
        ], cap:'Produk yang menyentuh lebih dari satu tingkat biasanya lebih bernilai. Contoh Nike memenuhi fisiologis, rasa aman/nyaman, & aktualisasi diri atlet.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Tulis 1 kalimat USP produkmu, lalu tandai tingkat kebutuhan Maslow yang kamu penuhi.'}
      ]
    },
    { id:'m4l3', judul:'Competitive Moat — parit pertahanan', durasi:'11 mnt',
      ringkas:'Apa yang membuat bisnismu sulit direbut pesaing.',
      blocks:[
        {t:'lead', x:'<b>Moat</b> (parit) = keunggulan kompetitif yang membuat pesaing sulit merebut pasarmu — ibarat kastil dikelilingi parit. Intinya: <b>apa yang membuat bisnismu tak mudah dicuri/diganggu</b>.'},
        {t:'diagram', kind:'quad', judul:'Empat jenis moat', nodes:[
          {t:'Intellectual Property', d:'Paten, merek dagang, hak cipta yang melindungi bisnis'},
          {t:'Network Effects', d:'Makin banyak pengguna, makin sulit ditembus pesaing'},
          {t:'Economies of Scale', d:'Produksi skala besar menekan biaya per unit'},
          {t:'Brand Strength', d:'Merek kuat & tepercaya lebih mudah menarik pelanggan'}
        ], cap:'Contoh Apple: produk saling terkait (network), rantai pasok efisien (skala), merek sangat kuat, & kekayaan intelektual terdaftar.'},
        {t:'callout', k:'warn', judul:'Pentingnya kekayaan intelektual', x:'Ada kasus sengketa merek besar (mis. rebutan nama merek ayam geprek) yang berujung kekalahan karena nama dipakai tanpa hak. Pelajaran: <b>daftarkan merek</b>-mu agar tak jadi masalah besar di kemudian hari.'},
        {t:'callout', k:'key', judul:'Kesimpulan bisnis kompetitif', x:'Di tahap awal, jangan dulu pusing harga/profit — fokus buat <b>good product</b>: (1) solusi untuk kebutuhan manusia, (2) nilai & keunikan (USP), (3) parit pertahanan (moat).'}
      ]
    },
    { id:'m4l4', judul:'Produk yang profitable', durasi:'12 mnt',
      ringkas:'3 level produk, unit economics, & rantai nilai produksi.',
      blocks:[
        {t:'h', x:'3 level produk (Core–Actual–Augmented)'},
        {t:'diagram', kind:'pyramid', judul:'Lapisan nilai produk', nodes:[
          {t:'Core', d:'Manfaat inti — alasan utama beli (sumber pendapatan utama)'},
          {t:'Actual', d:'Wujud nyata: kualitas, desain, fitur'},
          {t:'Augmented', d:'Paket total: garansi, purna jual, poin loyalti'}
        ], cap:'Contoh IKEA: core=kebutuhan rumah tangga; actual=meja/kursi/lemari; augmented=bantuan rakit, pengalaman belanja, kafe. Makin besar bisnis, makin lebar variasinya.'},
        {t:'h', x:'Unit economics'},
        {t:'p', x:'Keuntungan bersih dari <b>setiap unit</b> produk setelah dikurangi biaya produksi & operasional. Menggambarkan seberapa efisien bisnis menghasilkan untung per unit — fondasi sebelum menggenjot volume.'},
        {t:'h', x:'Empat penopang penciptaan produk'},
        {t:'table', head:['Aspek','Arti'], rows:[
          ['Economies of Scale','Biaya per unit turun saat jumlah produksi naik'],
          ['Supply Chain','Alur bahan mentah → produksi → packaging → pengiriman (supplier, manufaktur, distributor, retailer)'],
          ['Barrier of Production','Seberapa sulit produk dibuat & bertahan/berkembang di pasar'],
          ['Feedback Loop','Bagaimana & kapan produk diiterasi ulang sesuai keinginan pelanggan & pasar']
        ], cap:'Empat hal ini menentukan produk bisa profitable & bertahan.'},
        {t:'quiz', q:'“Biaya per unit turun saat produksi naik” disebut…', opts:['Supply Chain','Economies of Scale','Feedback Loop'], a:1, exp:'Itu Economies of Scale (skala ekonomi).'}
      ]
    }
  ]
},

/* ============ CHAPTER 5 — BRANDING, SALES & MARKETING ============ */
{
  id:'m5', judul:'Branding, Sales & Marketing', ikon:'i-store', label:'Chapter 5',
  ringkas:'Perkenalkan & jual produk dengan efektif — dari STP, kanal, konten viral, sampai funnel.',
  lessons:[
    { id:'m5l1', judul:'Branding vs Marketing vs Sales & STP', durasi:'12 mnt',
      ringkas:'Bedakan tiga konsep inti & petakan pelanggan dengan STP.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'callout', k:'warn', judul:'Kenapa penting?', x:'Produk bagus tanpa pemasaran tetap sepi. Sebagian bisnis gagal karena pemasaran lemah — menjual adalah keterampilan wajib founder.'},
        {t:'table', head:['Konsep','Definisi','Fokus'], rows:[
          ['Branding','Membangun citra & identitas merek','Persepsi, nilai, pengalaman merek'],
          ['Marketing','Mengenalkan produk ke pasar','Kebutuhan konsumen, strategi promosi'],
          ['Sales','Mengubah calon jadi pembeli','Penjualan, negosiasi, kepuasan']
        ]},
        {t:'h', x:'STP — Segmenting, Targeting, Positioning'},
        {t:'diagram', kind:'flow', judul:'Alur STP', nodes:[
          {t:'Segmenting', d:'Bagi pelanggan (demografi, psikografi, geografi, perilaku)'},
          {t:'Targeting', d:'Pilih segmen paling menarik (ukuran, pertumbuhan, profit, kecocokan)'},
          {t:'Positioning', d:'Tanam citra unik di benak pelanggan'}
        ], cap:'Pertimbangan targeting: ukuran & pertumbuhan segmen, profit margin, kompetitor, kanal distribusi, kesesuaian tujuan & sumber daya.'},
        {t:'p', x:'<b>Tipe positioning:</b> berbasis layanan, kenyamanan, harga, atau kualitas. Visualkan posisimu vs pesaing dengan <b>perceptual map</b> (dua sumbu).'},
        {t:'quiz', q:'Memilih segmen paling potensial untuk dilayani = tahap…', opts:['Segmenting','Targeting','Positioning'], a:1, exp:'Targeting = memilih segmen; Positioning = menanam citra.'}
      ]
    },
    { id:'m5l2', judul:'Strategi & kanal pemasaran', durasi:'13 mnt',
      ringkas:'Outbound vs inbound, ATL/BTL/TTL, OOH/DOOH, UGC & KOL, kanal.',
      blocks:[
        {t:'table', head:['Strategi','Cara kerja','Contoh'], rows:[
          ['Outbound','Aktif menjangkau (proaktif)','Iklan TV/radio, cold call, email blast, baliho'],
          ['Inbound','Menarik lewat konten relevan','Artikel, video, webinar, e-book'],
          ['Hyperlocal','Fokus komunitas/area sekitar','Promo lingkungan, event lokal']
        ]},
        {t:'h', x:'ATL / BTL / TTL & OOH/DOOH'},
        {t:'list', items:[
          '<b>ATL</b> (Above The Line) — media massa (TV, radio, billboard); jangkauan luas, mahal, untuk brand awareness.',
          '<b>BTL</b> (Below The Line) — aktivitas langsung (promosi, event, sampling); target spesifik, biaya lebih terukur.',
          '<b>TTL</b> (Through The Line) — kombinasi ATL & BTL.',
          '<b>OOH</b> — iklan luar ruang (baliho/spanduk) di lokasi ramai; <b>DOOH</b> — versi digital (layar LED, video wall).'
        ]},
        {t:'h', x:'UGC & KOL'},
        {t:'p', x:'<b>UGC (User Generated Content)</b> — konten dari pengguna (review, testimoni, diskusi) memperkuat kepercayaan. <b>KOL (Key Opinion Leader)</b> — kerja sama dengan influencer. Pilih KOL berdasar: tujuan, kecocokan audiens, kredibilitas, kualitas konten, budget, & metrik (mis. engagement rate).'},
        {t:'h', x:'Kanal pemasaran'},
        {t:'table', head:['Kanal','Contoh'], rows:[
          ['Langsung (Direct)','Komunitas, affiliate program, display ads, email marketing'],
          ['Tidak langsung (Indirect)','Word of mouth, community building, offline event, speaking engagement'],
          ['Gabungan','Marketing online (e-commerce, sosmed) + advertisement (online/offline)']
        ], cap:'Direct = kendali penuh tapi mahal. Indirect = jangkauan luas tapi kendali kurang. Gabungan = keterlibatan & awareness lebih kuat.'},
        {t:'callout', k:'tip', judul:'Winning strategy penjualan', x:'Formula <b>10/30/60</b>: fokuskan 60% upaya ke pelanggan yang sudah ada, 30% ke yang cocok target, 10% ke pasar umum — mempertahankan lebih murah daripada mencari baru.'}
      ]
    },
    { id:'m5l3', judul:'Konten viral (STEPPS) & funnel (AIDA)', durasi:'13 mnt',
      ringkas:'Rumus konten menyebar & memandu pelanggan sampai membeli.',
      blocks:[
        {t:'h', x:'STEPPS Framework (Jonah Berger) — kenapa konten menyebar'},
        {t:'list', items:[
          '<b>Social Currency</b> — konten yang membuat pembagi terlihat “keren”/update tren.',
          '<b>Triggers</b> — pemicu di lingkungan yang mengingatkan orang pada produkmu (top of mind).',
          '<b>Emotions</b> — emosi kuat (kagum, gembira) mendorong berbagi.',
          '<b>Public</b> — mudah dilihat & ditiru publik; hindari hal sensitif.',
          '<b>Practical Value</b> — informatif & berguna.',
          '<b>Stories</b> — dibungkus cerita agar mudah diserap & diingat.'
        ]},
        {t:'h', x:'Go-To-Market: kenali hambatan masuk'},
        {t:'list', items:[
          '<b>Predatory pricing</b> — pemain lama sengaja pasang harga sangat rendah untuk mengusir pesaing.',
          '<b>Limit pricing</b> — harga rendah + volume tinggi menyulitkan pemain baru untung.',
          '<b>Switching cost</b> — semudah/sesulit apa pelanggan pindah ke produk lain.'
        ]},
        {t:'h', x:'Marketing Funnel & AIDA'},
        {t:'diagram', kind:'funnel', judul:'Perjalanan pelanggan', nodes:[
          {t:'Awareness', d:'Mengenal produkmu'},
          {t:'Consideration', d:'Mencari info & membandingkan'},
          {t:'Conversion', d:'Memutuskan membeli'},
          {t:'Loyalty', d:'Beli berulang'},
          {t:'Advocacy', d:'Merekomendasikan ke orang lain'}
        ], cap:'AIDA (Attention → Interest → Desire → Action) = versi ringkas untuk merancang pesan tiap tahap. Catatan: funnel B2B & B2C berbeda — B2C dibantu rekomendasi teman/keluarga, B2B berinteraksi langsung dengan sales sejak awal.'},
        {t:'h', x:'7P Marketing Mix (winning strategy)'},
        {t:'list', items:[
          '<b>Product</b> · <b>Price</b> · <b>Place</b> · <b>Promotion</b> — bauran klasik.',
          '<b>People</b> — orang yang menjalankan & melayani.',
          '<b>Process</b> — alur dari pesanan sampai pengiriman.',
          '<b>Physical Evidence</b> — bukti fisik/visual yang memengaruhi persepsi.'
        ]},
        {t:'callout', k:'key', judul:'Tindakan', x:'Rancang 1 ide konten memakai minimal 3 elemen STEPPS, & petakan pesanmu ke tahap AIDA.'}
      ]
    }
  ]
},

/* ============ CHAPTER 6 — OPERASIONAL LEAN ============ */
{
  id:'m6', judul:'Operasional Lean', ikon:'i-layers', label:'Chapter 6',
  ringkas:'Jalankan bisnis rapi & efisien — proses, organisasi, keuangan, legal & pajak.',
  lessons:[
    { id:'m6l1', judul:'Fungsi operasional & process mapping', durasi:'12 mnt',
      ringkas:'Lima fungsi operasional dasar & cara memetakan proses.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'h', x:'5 fungsi operasional dasar'},
        {t:'list', items:[
          '<b>Planning</b> — rancang strategi & sasaran dari visi/misi.',
          '<b>Organizing</b> — bagi tugas, wewenang, & sumber daya.',
          '<b>Staffing</b> — rekrut, kembangkan, & pertahankan tim.',
          '<b>Leading</b> — arahkan & motivasi tim ke tujuan sama.',
          '<b>Controlling</b> — pantau & evaluasi kinerja terhadap KPI.'
        ]},
        {t:'h', x:'Business Process Mapping'},
        {t:'p', x:'Memvisualkan aktivitas bisnis: apa, siapa, kapan, bagaimana. Terbagi <b>Core Function</b> (langsung menghasilkan produk) & <b>Supporting Function</b> (mendukung: standarisasi proses, tingkatkan kualitas, komunikasi, & pelatihan).'},
        {t:'diagram', kind:'flow', judul:'4 tahap sebuah proses', nodes:[
          {t:'Input', d:'Data, bahan, SDM, alat, kebijakan'},
          {t:'Process', d:'Aktivitas mengubah input jadi output'},
          {t:'Output', d:'Produk/jasa/informasi akhir'},
          {t:'Feedback', d:'Tanggapan untuk perbaikan'}
        ], cap:'Flowchart pakai simbol: kotak = aktivitas, oval = mulai/selesai, wajik = keputusan.'},
        {t:'callout', k:'tip', judul:'Standarisasi lewat SOP', x:'Buat SOP tiap langkah proses → kurangi ketergantungan pada orang tertentu, jaga konsistensi, & permudah pengukuran kinerja.'},
        {t:'quiz', q:'“Tanggapan untuk perbaikan proses” disebut…', opts:['Input','Output','Feedback'], a:2, exp:'Feedback menutup siklus agar proses terus membaik.'}
      ]
    },
    { id:'m6l2', judul:'Organisasi & SDM dasar', durasi:'10 mnt',
      ringkas:'Struktur organisasi & kapan/bagaimana merekrut.',
      blocks:[
        {t:'h', x:'Jenis organisasi'},
        {t:'list', items:[
          '<b>Profit</b> — dimiliki individu/pemegang saham untuk laba.',
          '<b>Non-Profit (NGO)</b> — untuk kepentingan tertentu, bukan laba.',
          '<b>Pemerintah</b> — menjalankan fungsi publik.',
          '<b>Koperasi</b> — dimiliki & dikendalikan anggota.',
          '<b>Hybrid</b> — gabungan beberapa jenis.'
        ]},
        {t:'callout', k:'tip', judul:'Strategic Operating Framework', x:'Selaraskan strategi, tujuan, nilai, struktur, budaya, & SDM agar semua bergerak ke arah yang sama.'},
        {t:'h', x:'Basic Human Resources'},
        {t:'p', x:'Di UMKM umumnya <i>small</i> (1–5 orang) & <i>medium</i> (5–20 orang). <b>Kapan merekrut?</b> saat tim kelebihan beban, permintaan naik, keuangan sulit dikelola, atau bisnis tumbuh cepat.'},
        {t:'list', items:[
          '<b>Tentukan gaji</b> lewat riset rata-rata industri, tanggung jawab, & kemampuan bayar.',
          '<b>Rekrut</b> dengan job description jelas, sumber terpercaya, seleksi (wawancara/tes), plus pelatihan & kompensasi wajar.',
          '<b>Pendekatan proaktif</b> (preventif, jangka panjang) vs <b>reaktif</b> (menangani masalah yang muncul).'
        ]}
      ]
    },
    { id:'m6l3', judul:'Keuangan, legal & pajak', durasi:'12 mnt',
      ringkas:'Dasar akuntansi, badan usaha, dan kewajiban pajak.',
      blocks:[
        {t:'h', x:'Cash Basis vs Accrual'},
        {t:'table', head:['Metode','Kapan dicatat','Untuk'], rows:[
          ['Cash basis','Saat uang diterima/dibayar','Bisnis kecil — sederhana, jelas cash in/out'],
          ['Accrual','Saat transaksi terjadi (walau belum dibayar)','Bisnis lebih besar/kompleks']
        ]},
        {t:'h', x:'Unit dasar akuntansi'},
        {t:'list', items:[
          '<b>Aktiva</b> (aset) · <b>Kewajiban</b> (hutang) · <b>Ekuitas</b> (aset − kewajiban).',
          '<b>Pendapatan</b> · <b>Biaya</b> · <b>COGS/HPP</b> · <b>Laba/Rugi</b> · <b>Arus Kas</b>.',
          'Prinsip akuntansi: kesetaraan, keberlanjutan, pengakuan pendapatan, & konsistensi.'
        ]},
        {t:'h', x:'Badan usaha'},
        {t:'table', head:['Bentuk','Catatan'], rows:[
          ['Perusahaan Dagang','Keuangan pribadi & bisnis bercampur; minim perlindungan hukum'],
          ['CV','Masih menyatu dengan pribadi, tapi memisahkan keuangan lebih baik'],
          ['Firma','Perjanjian antar-partner'],
          ['PT','Memisahkan tegas keuangan & entitas; pemegang saham terlindungi']
        ], cap:'Lengkapi: izin usaha, akta pendirian, NPWP, NIB, paten, & dokumen legal lain (mis. sertifikat halal untuk F&B).'},
        {t:'p', x:'<b>Jenis pajak</b> umum: pajak penghasilan, pajak penjualan, pajak properti, pajak ketenagakerjaan, cukai, serta impor/ekspor.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Buat flowchart 1 proses inti bisnismu (pesanan → kirim) & pilih bentuk badan usaha yang paling cocok.'}
      ]
    }
  ]
},

/* ============ CHAPTER 7 — SKILL FONDASI & METRIK PERTUMBUHAN ============ */
{
  id:'m7', judul:'Skill Fondasi & Metrik Pertumbuhan', ikon:'i-chart', label:'Chapter 7',
  ringkas:'Ukur bisnis dengan metrik yang tepat lalu besarkan secara terukur.',
  lessons:[
    { id:'m7l1', judul:'Business dashboard & metrik keuangan', durasi:'13 mnt',
      ringkas:'Melacak angka kunci keuangan bisnis.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'callout', k:'quote', judul:'', x:'“Life is change. Growth is optional.” Pertumbuhan tidak otomatis — ia dikelola lewat metrik yang tepat.'},
        {t:'p', x:'<b>Business dashboard</b> melacak metrik keuangan (pendapatan/pengeluaran) & operasional (produksi, kepuasan pelanggan, produktivitas). Alurnya: kumpulkan data → breakdown jadi key metrics → pelaporan & tracking. Tool umum: spreadsheet (gratis) sampai alat visualisasi data (berbayar).'},
        {t:'h', x:'Metrik keuangan kunci'},
        {t:'table', head:['Metrik','Definisi'], rows:[
          ['Pendapatan (Revenue)','Uang dari penjualan pada periode tertentu'],
          ['Gross Profit Margin','Selisih pendapatan & biaya produksi (relatif ke pendapatan)'],
          ['Net Profit Margin','Laba setelah semua biaya termasuk pajak'],
          ['ROI','Efektivitas investasi menghasilkan keuntungan'],
          ['Break-Even Point','Titik pendapatan = biaya'],
          ['Debt-to-Equity','Rasio utang terhadap ekuitas'],
          ['Current / Quick Ratio','Kemampuan bayar utang jangka pendek']
        ]},
        {t:'formula', x:'Gross Profit Margin = (Pendapatan − Biaya Produksi) ÷ Pendapatan × 100%', cap:'Contoh: pendapatan 10 M, biaya produksi 6 M → 40%.'},
        {t:'formula', x:'Net Profit Margin = Laba Bersih ÷ Pendapatan × 100%', cap:'Laba bersih = pendapatan − semua biaya (produksi, operasional, pajak).'},
        {t:'formula', x:'ROI = (Hasil − Biaya Investasi) ÷ Biaya Investasi × 100%', cap:'Contoh: beli 10 jt, jual 12 jt + dividen 0,5 jt → 25%.'},
        {t:'quiz', q:'Gross Profit Margin membandingkan…', opts:['Laba kotor terhadap pendapatan','Utang terhadap ekuitas','Aset lancar terhadap utang'], a:0, exp:'Gross Profit Margin = laba kotor ÷ pendapatan × 100%.'}
      ]
    },
    { id:'m7l2', judul:'Metrik performa bisnis', durasi:'12 mnt',
      ringkas:'CAC, CLTV, churn, NPS, conversion, & kawan-kawan.',
      blocks:[
        {t:'table', head:['Metrik','Definisi'], rows:[
          ['MRR','Pendapatan langganan bulanan berulang'],
          ['CAC','Biaya mendapatkan satu pelanggan baru'],
          ['CLTV','Total nilai satu pelanggan selama jadi pelanggan'],
          ['Churn Rate','Persentase pelanggan yang berhenti dalam periode'],
          ['NPS','Kemungkinan pelanggan merekomendasikan produk'],
          ['Active Users','Jumlah pengguna aktif pada periode tertentu'],
          ['Conversion Rate','Persentase pengunjung yang mengambil tindakan'],
          ['GMV','Total nilai produk terjual lewat platform'],
          ['Engagement Rate','Persentase pengguna yang berinteraksi'],
          ['Market Share','Pangsa pasar yang dimiliki bisnis']
        ], cap:'Sehat bila CLTV jauh lebih besar dari CAC, & churn rendah.'},
        {t:'formula', x:'NPS = %Promotor (skor 9–10) − %Detraktor (skor 0–8)', cap:'Contoh: 70 responden, 60 promotor & 10 detraktor → 85,7% − 14,3% = 71,4.'},
        {t:'formula', x:'Conversion Rate = Jumlah pembeli ÷ total pengunjung × 100%', cap:'Contoh: 10.000 pengunjung, 500 beli → 5%.'},
        {t:'callout', k:'tip', judul:'Retensi > akuisisi', x:'Mempertahankan pelanggan lama umumnya jauh lebih murah daripada mencari baru. Naikkan retensi sebelum menggenjot akuisisi.'},
        {t:'quiz', q:'Bisnis sehat idealnya…', opts:['CAC jauh lebih besar dari CLTV','CLTV jauh lebih besar dari CAC','CAC = CLTV, churn tinggi'], a:1, exp:'Nilai seumur hidup pelanggan (CLTV) harus melampaui biaya mendapatkannya (CAC).'}
      ]
    },
    { id:'m7l3', judul:'North Star Metric & tracking', durasi:'12 mnt',
      ringkas:'Satu metrik utama + irama pemantauan harian/mingguan/bulanan.',
      blocks:[
        {t:'lead', x:'<b>North Star Metric</b> (One Metric That Matters) = satu angka utama yang paling mencerminkan nilai inti bisnismu bagi pelanggan. Ia menyatukan fokus tim pada tujuan jangka panjang.'},
        {t:'table', head:['Perusahaan','North Star Metric'], rows:[
          ['Penyewaan penginapan','Jumlah malam yang dipesan'],
          ['Media sosial','Pengguna aktif harian'],
          ['Platform tanya-jawab','Jumlah pertanyaan yang dijawab'],
          ['Aplikasi pesan','Jumlah pesan terkirim'],
          ['Super-app','% repeat order tiap produk']
        ], cap:'Pilih yang menandakan pelanggan benar-benar mendapat manfaat — bukan angka besar tanpa makna.'},
        {t:'h', x:'Tracking: irama pemantauan'},
        {t:'table', head:['Rentang','Contoh yang dipantau'], rows:[
          ['Harian','Penjualan, stok, DAU, traffic, komplain/feedback'],
          ['Mingguan','Performa penjualan, progress proyek, performa karyawan'],
          ['Bulanan','Pendapatan & pengeluaran, MAU, tingkat retensi, efektivitas pemasaran']
        ], cap:'Tracking bisa berbasis analisa (finansial/operasional) & berbasis sistem (manual/otomatis).'},
        {t:'diagram', kind:'cycle', judul:'Siklus bertumbuh', nodes:[
          {t:'Tetapkan North Star', d:'Satu metrik utama'},
          {t:'Buat KPI', d:'Turunan yang bisa dieksekusi'},
          {t:'Ukur & evaluasi', d:'Harian/mingguan/bulanan'},
          {t:'Sesuaikan', d:'Perbaiki strategi & ulangi'}
        ], cap:'Pertumbuhan datang dari perputaran ukur → belajar → perbaiki yang konsisten.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Tentukan 1 North Star Metric bisnismu + 3 KPI turunan, lalu jadwalkan waktu tetap tiap minggu untuk meninjaunya.'}
      ]
    }
  ]
},

/* ============ BONUS — REKOMENDASI BUKU ============ */
{
  id:'m8', judul:'Rekomendasi Buku', ikon:'i-book', label:'Bonus',
  ringkas:'Bacaan lanjutan untuk memperdalam tiap bidang.',
  lessons:[
    { id:'m8l1', judul:'Daftar bacaan pilihan', durasi:'5 mnt',
      ringkas:'Buku per bidang untuk melanjutkan belajar.',
      blocks:[
        {t:'p', x:'Kelas ini hanya pintu masuk. Perdalam tiap bidang lewat bacaan berikut, dikelompokkan per tema.'},
        {t:'h', x:'Manajemen SDM'},
        {t:'books', items:[
          {judul:'The One Minute Manager', penulis:'Kenneth Blanchard & Spencer Johnson', ket:'Teknik manajemen sederhana lewat cerita pendek.'},
          {judul:'The Talent Delusion', penulis:'Tomas Chamorro-Premuzic', ket:'Mengukur & mengembangkan talenta secara jujur.'},
          {judul:'Managing Oneself', penulis:'Peter F. Drucker', ket:'Mengelola diri sebelum mengelola orang lain.'}
        ]},
        {t:'h', x:'Kewirausahaan'},
        {t:'books', items:[
          {judul:'The Art of Possibility', penulis:'Rosamund & Benjamin Zander', ket:'Melihat peluang dari sudut pandang baru.'},
          {judul:'The Personal MBA', penulis:'Josh Kaufman', ket:'Peta lengkap dunia bisnis, dari marketing sampai strategi.'},
          {judul:'Zero to One', penulis:'Peter Thiel', ket:'Menciptakan sesuatu yang benar-benar baru.'}
        ]},
        {t:'h', x:'Marketing'},
        {t:'books', items:[
          {judul:'Building a StoryBrand', penulis:'Donald Miller', ket:'7 poin storytelling merek yang menjual.'},
          {judul:'Steal Like an Artist', penulis:'Austin Kleon', ket:'Merangkai ide kreatif dari karya yang ada.'}
        ]},
        {t:'h', x:'Kepemimpinan'},
        {t:'books', items:[
          {judul:'Start With Why', penulis:'Simon Sinek', ket:'Konsep Golden Circle: Why–How–What.'},
          {judul:'Leaders Eat Last', penulis:'Simon Sinek', ket:'Memimpin dengan mengutamakan tim.'},
          {judul:'Good to Great', penulis:'Jim Collins', ket:'Langkah perusahaan mencapai keunggulan jangka panjang.'},
          {judul:'Leading Change', penulis:'John Kotter', ket:'Delapan langkah memimpin perubahan.'},
          {judul:'How to Win Friends and Influence People', penulis:'Dale Carnegie', ket:'Membangun hubungan & memengaruhi secara positif.'},
          {judul:'Steve Jobs', penulis:'Walter Isaacson', ket:'Biografi pemimpin yang mengandalkan inovasi.'}
        ]},
        {t:'callout', k:'tip', judul:'Cara memakai', x:'Pilih satu buku sesuai chapter yang paling ingin kamu perkuat sekarang — jangan baca semua sekaligus.'},
        {t:'h', x:'Langkah terakhir: susun blueprint bisnismu'},
        {t:'callout', k:'key', judul:'The Business Blueprint', x:'Sudah tuntas 7 chapter? Sekarang tuangkan bisnismu ke dalam <b>Business Blueprint</b> — template isian akhir yang merangkum semua materi jadi satu dokumen: fondasi diri, ideasi, riset pasar, produk & USP, marketing, operasional, sampai rencana peluncuran. Tiap kolom ada penjelasan istilah & contoh, isianmu tersimpan otomatis, dan bisa <b>diunduh sebagai PDF</b> siap presentasi.<br><br><a class="btn btn-primary btn-sm" href="blueprint.html">Buka Business Blueprint Generator →</a>'}
      ]
    }
  ]
}

];

if (typeof module !== 'undefined' && module.exports) { module.exports = { KELAS_META:KELAS_META, KELAS_DATA:KELAS_DATA }; }
