/* ============================================================
   KELAS "SCALE UP BISNIS" — data kurikulum (Bekal)
   ------------------------------------------------------------
   Fokus membesarkan bisnis: inovasi ide lanjutan, MVP & Product-
   Market Fit, persiapan ekspansi ide, dan rencana ekspansi pasar.
   Kerangka bisnis standar (Lean build-measure-learn, MVP, A/B
   testing, SCAMPER, pivot, segmentasi/MASDA, market sizing,
   BEP/ROI, ekspansi vertikal/horizontal) — disusun dengan bahasa
   & contoh sendiri + grafik. Tiap chapter punya slot video.
   Kerangka materi diadaptasi dari program Sevenpreneur (7preneur).

   Skema blok (dirender kelas.js): lead|p|h · callout(key|tip|warn|
   quote) · list|steps · diagram(flow|funnel|pyramid|cycle|quad|
   bars) · table · formula · video · img · books · quiz
   ============================================================ */
var KELAS_META = {
  judul: 'Scale Up Bisnis',
  batch: 'Batch 1',
  ringkas: 'Kelas membesarkan bisnis — inovasi ide lanjutan, MVP & Product-Market Fit, persiapan ekspansi ide, sampai rencana ekspansi pasar (segmentasi, market sizing, BEP/ROI, vertikal/horizontal). Belajar seperti kuliah online: teks, diagram, dan video.',
  catatan: 'Materi menjelaskan kerangka bisnis standar dengan bahasa & contoh sendiri + grafik. Kerangka diadaptasi dari program Sevenpreneur (7preneur); penyampaian mendetail ada di video kelas.',
  kredit: 'Kerangka materi diadaptasi dari program Sevenpreneur (7preneur).'
};

var KELAS_DATA = [

/* ============ MODUL 0 — ORIENTASI ============ */
{
  id:'s0', judul:'Orientasi', ikon:'i-compass', label:'Mulai',
  ringkas:'Untuk siapa kelas ini & peta 4 chapter.',
  lessons:[
    { id:'s0l1', judul:'Selamat datang di Scale Up', durasi:'5 mnt',
      ringkas:'Kelas ini untuk bisnis yang sudah/hampir jalan & ingin dibesarkan.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Video pengantar (diisi saat rekaman diunggah).'},
        {t:'lead', x:'Kelas <b>Scale Up Bisnis</b> untuk kamu yang sudah punya ide/produk (atau bisnis yang mulai jalan) dan ingin <b>membesarkannya dengan risiko terukur</b>. Fokusnya: menguji produk ke pasar secara hemat, mencapai Product-Market Fit, lalu berekspansi dengan data.'},
        {t:'callout', k:'key', judul:'Prinsip', x:'Jangan membangun 100% produk hanya dari asumsi. Uji dulu (MVP), ukur, belajar — baru besarkan.'},
        {t:'h', x:'Peta 4 chapter'},
        {t:'list', items:[
          '<b>Chapter 1 — Inovasi Ide (lanjutan):</b> temukan & kembangkan ide, SCAMPER, brainstorming, pengakuan ide.',
          '<b>Chapter 2 — MVP & Product-Market Fit:</b> metode lean, jenis MVP, A/B testing, metrik pelanggan, pivot.',
          '<b>Chapter 3 — Persiapan Ekspansi Ide:</b> vertikal/horizontal, SCAMPER, ide berbasis market/historis/forecast/geografi.',
          '<b>Chapter 4 — Rencana Ekspansi Pasar:</b> segmentasi, analisis pesaing & tren, market sizing, BEP/ROI, strategi ekspansi.'
        ]},
        {t:'callout', k:'tip', judul:'Prasyarat', x:'Idealnya kamu sudah menyelesaikan kelas <a href="kelas.html">Bisnis Mulai dari Nol</a> atau sudah punya bisnis yang berjalan.'}
      ]
    }
  ]
},

/* ============ CHAPTER 1 — INOVASI IDE (LANJUTAN) ============ */
{
  id:'s1', judul:'Inovasi Ide untuk Scale-up', ikon:'i-sparkles', label:'Chapter 1',
  ringkas:'Menemukan & mengembangkan ide baru untuk membesarkan bisnis.',
  lessons:[
    { id:'s1l1', judul:'Masalah = kesempatan', durasi:'9 mnt',
      ringkas:'Kenapa ide lahir dari masalah, & cara menilai kelayakannya.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'callout', k:'quote', judul:'', x:'“Ide tidak berbentuk jelas. Mereka baru menjadi jelas saat kamu mengerjakannya. Kamu hanya perlu memulai.”'},
        {t:'lead', x:'Tidak ada ide yang sempurna — pembedanya adalah <b>pelaksanaan</b>. Ide lahir dari <b>masalah</b>. Contoh klasik: mobil lahir karena transportasi kuda melelahkan & tidak efisien; platform edukasi finansial lahir karena literasi keuangan rendah saat minat investasi naik.'},
        {t:'callout', k:'tip', judul:'Sikap berbisnis', x:'Jangan optimis atau pesimis membabi buta. Jadilah <b>realistis & oportunis</b> — melihat peluang <i>dan</i> risiko dengan jelas.'},
        {t:'h', x:'Evaluasi kelayakan ide (ala Harvard Business Review)'},
        {t:'list', items:[
          'Seberapa banyak orang mengalami masalah ini? (ukuran pasar)',
          'Pasar sedang menurun, stabil, atau naik? (prospek)',
          'Bagaimana idemu menyelesaikan masalah itu? (benar-benar dibutuhkan?)',
          'Adakah kompetitor menawarkan hal sama? (lawan di pasar)',
          'Siapa target pelanggannya? (pastikan pelanggannya ada)'
        ]},
        {t:'callout', k:'key', judul:'Tindakan', x:'Tulis 10 masalah di sekitarmu minggu ini, lingkari 3 yang paling sering & menyakitkan.'}
      ]
    },
    { id:'s1l2', judul:'Kembangkan ide: Inside-out, Outside-in, Hybrid', durasi:'12 mnt',
      ringkas:'Tiga cara mengembangkan ide bisnis.',
      blocks:[
        {t:'diagram', kind:'flow', judul:'Tiga pendekatan pengembangan ide', nodes:[
          {t:'Low-Hanging Fruit', d:'Inside-out — dari kekuatan/keresahan pribadi'},
          {t:'Market Gap', d:'Outside-in — dari celah pasar yang belum terisi'},
          {t:'Hybrid', d:'Gabungan keduanya'}
        ], cap:'Pilih sesuai sumber daya, waktu, & kondisi pasarmu.'},
        {t:'h', x:'1) Low-Hanging Fruit (Inside-out)'},
        {t:'p', x:'Ambil “buah terdekat” — kerjakan yang paling mudah & efisien dulu, dari kekuatan/keresahanmu. Bisa dipakai untuk semua aspek: marketing, problem-solving, sales, pengembangan. Contoh: menargetkan ulang pelanggan lama (lebih murah dari mencari baru), atau fokus memperbaiki produk yang ada sebelum bikin banyak produk baru.'},
        {t:'callout', k:'tip', judul:'Pertanyaan inside-out', x:'Apa yang kita kuasai & sukai? Apa yang merepresentasikan kita? Bagaimana memanfaatkan kekuatan & menutup kelemahan?'},
        {t:'h', x:'2) Market Gap (Outside-in)'},
        {t:'p', x:'Amati pasar & kenali konsumen dulu, lalu tawarkan solusi atas kebutuhan yang belum terpenuhi. Membantu tahu apakah pasar sudah jenuh atau masih tumbuh. Cara mencari celah:'},
        {t:'steps', items:['Cari pangsa pasar spesifik (niche).','Tiru & ciptakan ulang bisnis dari luar negeri.','Tanya langsung ke pelanggan — merekalah yang paling paham kebutuhannya.']},
        {t:'callout', k:'tip', judul:'Pertanyaan outside-in', x:'Di mana pasar pertumbuhan tersedia? Bagaimana memanfaatkan peluangnya? Apa trennya & bagaimana menghadapinya?'},
        {t:'h', x:'Hasil yang diharapkan'},
        {t:'table', head:['Orientasi','Fokus'], rows:[
          ['Solution-centric','Menyelesaikan masalah & memenuhi kebutuhan pelanggan'],
          ['Monetization-centric','Memaksimalkan pendapatan & profit']
        ], cap:'Idealnya <b>gabungan keduanya</b> — hanya fokus solusi bisa bangkrut; hanya fokus profit tak berkontribusi.'},
        {t:'quiz', q:'Solution-centric & Monetization-centric adalah…', opts:['Cara mengembangkan ide','Hasil yang diharapkan dari ide','Jenis brainstorming'], a:1, exp:'Keduanya adalah orientasi hasil, bukan cara mengembangkan ide.'}
      ]
    },
    { id:'s1l3', judul:'Brainstorming, Six Thinking Hats & pengakuan ide', durasi:'11 mnt',
      ringkas:'Munculkan ide, nilai dari 6 sudut, lalu uji keyakinannya.',
      blocks:[
        {t:'table', head:['Tipe brainstorming','Cara kerja'], rows:[
          ['Reverse','“Apa yang menyebabkan masalah ini?” lalu balik ke solusi'],
          ['Stop-and-Go','Kumpulkan ide dulu, evaluasi belakangan'],
          ['Brainwriting','Ideasi individual, semua dicatat'],
          ['Rapid Ideation','Tiap anggota menulis ide dalam waktu terbatas']
        ]},
        {t:'h', x:'Six Thinking Hats (Edward de Bono)'},
        {t:'diagram', kind:'quad', judul:'Enam topi berpikir', nodes:[
          {t:'🟢 Hijau · 🟡 Kuning', d:'Kreativitas/solusi · optimisme & sisi positif'},
          {t:'🔴 Merah · ⚫ Hitam', d:'Emosi/intuisi · risiko & peringatan'},
          {t:'⚪ Putih', d:'Data & fakta (mis. berapa besar pasarnya)'},
          {t:'🔵 Biru', d:'Moderator — langkah selanjutnya apa'}
        ], cap:'Bagi tiap anggota tim satu warna topi, lalu simpulkan dari semua sudut pandang.'},
        {t:'h', x:'Pengakuan atas ide (Idea Conviction)'},
        {t:'p', x:'Ide yang menurutmu terbaik belum tentu cocok dengan sekitarmu. Cari “pengakuan” untuk membuktikan seberapa yakin idemu berhasil — cara termudah: <b>tanya orang di sekitarmu</b>. Ini menjaga fokus & komitmen saat kesulitan datang.'},
        {t:'diagram', kind:'flow', judul:'Idea Conviction', nodes:[
          {t:'Right mindset', d:'Pola pikir yang tepat'},
          {t:'Right problem', d:'Masalah yang tepat'},
          {t:'Right solution', d:'Solusi yang tepat'}
        ], cap:'Tiga “tepat” yang memperkuat keyakinan pada ide.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Pilih 1 masalah, lakukan Reverse Brainstorming, lalu minta pendapat 3 orang untuk menguji keyakinan idemu.'}
      ]
    }
  ]
},

/* ============ CHAPTER 2 — MVP & PRODUCT-MARKET FIT ============ */
{
  id:'s2', judul:'MVP & Product-Market Fit', ikon:'i-bolt', label:'Chapter 2',
  ringkas:'Uji produk ke pasar secara hemat, capai PMF, atau pivot.',
  lessons:[
    { id:'s2l1', judul:'Metode Lean: Build–Measure–Learn', durasi:'11 mnt',
      ringkas:'Kembangkan produk secara ramping & berpusat pelanggan.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'callout', k:'warn', judul:'Fakta', x:'Sekitar <b>42% bisnis gagal karena produknya tidak dibutuhkan pasar</b>. Pelajaran dari raksasa yang jatuh: gagal menyesuaikan diri dengan perubahan kebutuhan pasar.'},
        {t:'p', x:'<b>Metode Lean</b> berfokus pada pelanggan & mengurangi pemborosan (waste): pahami kebutuhan pelanggan, buat produk seefisien mungkin. Intinya siklus berulang:'},
        {t:'diagram', kind:'cycle', judul:'Siklus Lean', nodes:[
          {t:'Build (Bangun)', d:'Buat MVP — produk fitur minimal yang menjawab asumsi'},
          {t:'Measure (Ukur)', d:'A/B testing & kumpulkan metrik pelanggan'},
          {t:'Learn (Belajar)', d:'Asumsi valid/tidak → cocok pasar (PMF) atau pivot'}
        ], cap:'Ulangi terus agar produk & bisnis makin efisien.'},
        {t:'table', head:['Istilah','Arti'], rows:[
          ['MVP','Cara mengetes produk/inovasi baru untuk hasil maksimal dengan biaya minim'],
          ['A/B Testing','Membandingkan 2–3 produk untuk cari yang performa terbaik'],
          ['Metrik','Pengolahan data untuk mengukur kecocokan produk dengan pelanggan'],
          ['PMF','Produk yang sudah diterima pasar — populer, dibutuhkan, disenangi']
        ]},
        {t:'quiz', q:'Tiga langkah metode lean adalah…', opts:['Build, Measure, Improve','Build, Measure, Learn','Build, Improve, Eliminate'], a:1, exp:'Build → Measure → Learn (bangun, ukur, belajar).'}
      ]
    },
    { id:'s2l2', judul:'Minimum Viable Product & jenisnya', durasi:'13 mnt',
      ringkas:'Uji asumsi dengan produk sekecil mungkin.',
      blocks:[
        {t:'lead', x:'<b>MVP</b> = produk fitur minimal untuk mendapat feedback build-measure-learn secepat & semurah mungkin. Moto: <b>“berpikir besar untuk jangka panjang, mulai dengan langkah kecil untuk jangka pendek.”</b> Mulai dengan menentukan <b>hipotesis</b> bisnismu.'},
        {t:'h', x:'Lima jenis MVP'},
        {t:'table', head:['Jenis','Cara','Contoh'], rows:[
          ['Smoke Test','Buat prototype/mock-up untuk cek minat sebelum launching','Brand fashion uji sampel ke target pelanggan'],
          ['Sell Before You Build','Jual/pre-order sebelum produk benar-benar dibuat','Buka pre-order dari sebuah produk'],
          ['Concierge','Layani pelanggan manual dulu sebelum bangun produk penuh','CEO menelepon pelanggan satu per satu'],
          ['Wizard of Oz','Kesan produk berfungsi penuh, tapi di belakang dikerjakan manual','Layanan pakai SMS/email sebelum ada platform online'],
          ['Single Feature','Fokus satu fitur utama untuk diuji ke pasar','Platform yang awalnya hanya satu layanan inti']
        ], cap:'Pilih yang paling murah membuktikan asumsimu.'},
        {t:'callout', k:'tip', judul:'Studi kasus (ilustrasi)', x:'Usaha bakso ingin merilis “bakso siap santap”. Hipotesis: laku karena orang ingin makanan yang bisa dibawa ke mana saja + layanan pre-order. Uji lewat MVP <b>Sell Before You Build</b> (pre-order).'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Tulis 1 hipotesis produkmu, lalu pilih 1 jenis MVP paling murah untuk mengujinya minggu ini.'}
      ]
    },
    { id:'s2l3', judul:'A/B Testing & metrik pelanggan', durasi:'13 mnt',
      ringkas:'Bandingkan produk & ukur respons dengan angka.',
      blocks:[
        {t:'p', x:'<b>A/B Testing (split test)</b> membandingkan 2–3 produk untuk tahu mana yang performanya lebih baik — menghindari bias asumsi founder. Contoh: asumsi “desain A pasti lebih laku”, tapi setelah diuji ternyata pelanggan lebih suka desain B → asumsi salah.'},
        {t:'h', x:'Metrik pelanggan penting'},
        {t:'table', head:['Metrik','Fungsi'], rows:[
          ['Conversion Rate','Berapa pengunjung yang benar-benar membeli'],
          ['Satisfaction Rate','Tingkat kepuasan atas produk/fitur/layanan'],
          ['Retention Rate','Berapa pelanggan lama yang bertahan (beli berulang)'],
          ['CAC','Biaya mendapatkan satu pelanggan baru'],
          ['CLTV','Total nilai satu pelanggan selama jadi pelanggan']
        ]},
        {t:'formula', x:'Conversion Rate = (jumlah yang membeli ÷ jumlah calon pembeli) × 100%', cap:'Contoh: 100 calon, 20 beli → 20%.'},
        {t:'formula', x:'CAC = total biaya pemasaran ÷ jumlah pelanggan baru', cap:'Makin kecil makin efisien.'},
        {t:'formula', x:'CLTV = (rata-rata belanja per periode) − (biaya memperoleh & mempertahankan)', cap:'Contoh: belanja Rp200rb/bln × 12 = Rp2,4jt; biaya Rp1jt → CLTV Rp1,4jt/tahun.'},
        {t:'callout', k:'tip', judul:'Kepuasan (survei sederhana)', x:'Tanya (skala 1–10): seberapa enak/berguna produk ini? seberapa mungkin merekomendasikan? worth it dengan harganya? Jumlahkan skor ÷ jumlah responden. Bandingkan antar-produk yang diuji.'},
        {t:'quiz', q:'Metrik yang mengukur pelanggan membeli <i>berulang</i> adalah…', opts:['Conversion Rate','Retention Rate','CAC'], a:1, exp:'Retention Rate = persentase pelanggan lama yang bertahan/beli berulang.'}
      ]
    },
    { id:'s2l4', judul:'Product-Market Fit & Pivot', durasi:'11 mnt',
      ringkas:'Validasi hasil uji: lanjut scaling atau berbelok arah.',
      blocks:[
        {t:'diagram', kind:'flow', judul:'Setelah pengujian', nodes:[
          {t:'Hipotesis VALID', d:'Produkmu paling diminati → sudah PMF → scaling/improve'},
          {t:'Hipotesis INVALID', d:'Hasil kurang baik → belum fit → siap-siap pivot'}
        ], cap:'Keputusan diambil dari data A/B testing & metrik, bukan perasaan.'},
        {t:'h', x:'Pivot'},
        {t:'p', x:'<b>Pivot</b> = perubahan besar pada strategi bisnis setelah tahu produkmu belum product-market fit. Caranya: ulangi dari hipotesis → A/B testing → metrik.'},
        {t:'callout', k:'warn', judul:'Tanda harus pivot', x:'Target pelanggan tidak memuji/membeli berulang · investor tidak tertarik · pasar produkmu terlalu luas atau terlalu sempit.'},
        {t:'h', x:'Jenis pivot'},
        {t:'list', items:[
          '<b>Market segment</b> — ganti segmen pasar.',
          '<b>Customer problem</b> — ganti masalah yang diselesaikan.',
          '<b>Business model</b> — ubah cara menghasilkan uang.',
          '<b>Teknologi</b> — pindah ke teknologi lain.',
          '<b>Team</b> — ubah komposisi tim.',
          '<b>Fitur produk</b> — perbesar/perkecil fokus fitur.'
        ]},
        {t:'callout', k:'key', judul:'Tindakan', x:'Nilai hasil uji produkmu: jika valid, rancang langkah scaling; jika belum, tentukan 1 jenis pivot yang paling masuk akal.'}
      ]
    }
  ]
},

/* ============ CHAPTER 3 — PERSIAPAN EKSPANSI IDE ============ */
{
  id:'s3', judul:'Persiapan Ekspansi Ide', ikon:'i-layers', label:'Chapter 3',
  ringkas:'Siapkan ide bisnis untuk diperbesar — vertikal, horizontal, & berbasis data.',
  lessons:[
    { id:'s3l1', judul:'Ekspansi vertikal vs horizontal', durasi:'10 mnt',
      ringkas:'Dua arah memperbesar bisnis.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'diagram', kind:'quad', judul:'Dua arah ekspansi', nodes:[
          {t:'Vertikal', d:'Perkuat inti bisnis — perluas produksi/distribusi produk yang ada'},
          {t:'Horizontal', d:'Perluas lewat produk/layanan tambahan di luar produk utama'},
          {t:'Contoh vertikal', d:'Buka cabang baru + aplikasi pesan-antar sendiri'},
          {t:'Contoh horizontal', d:'Tambah lini minuman & appetizer di samping produk utama'}
        ], cap:'Pilih arah sesuai kekuatan inti & peluang pasar.'},
        {t:'p', x:'Ekspansi <b>vertikal</b> memperkuat & memperdalam bisnis inti (produksi/distribusi). Ekspansi <b>horizontal</b> memperlebar dengan menambah layanan/produk baru untuk audiens yang sama.'},
        {t:'quiz', q:'Menambah lini produk baru di luar produk utama adalah ekspansi…', opts:['Vertikal','Horizontal','Pivot'], a:1, exp:'Horizontal = memperlebar lewat layanan/produk tambahan.'}
      ]
    },
    { id:'s3l2', judul:'SCAMPER — inovasi dari yang sudah ada', durasi:'11 mnt',
      ringkas:'Tujuh cara menghasilkan ide baru dari ide lama.',
      blocks:[
        {t:'p', x:'<b>SCAMPER</b> = teknik kreatif menghasilkan inovasi dengan mengajukan pertanyaan atas produk/proses yang sudah ada.'},
        {t:'table', head:['Huruf','Arti','Pertanyaan'], rows:[
          ['S','Substitute','Ganti komponen/bahan dengan yang lain?'],
          ['C','Combine','Gabungkan 2+ ide/produk jadi satu yang lebih baik?'],
          ['A','Adapt','Adaptasi ide yang ada untuk konteks/audiens berbeda?'],
          ['M','Modify','Ubah ukuran/bentuk/warna/properti?'],
          ['P','Put to other use','Manfaatkan untuk tujuan/pengguna lain?'],
          ['E','Eliminate','Hilangkan fitur yang tak berguna agar lebih efektif?'],
          ['R','Reverse','Balik/atur ulang urutan atau kebiasaan?']
        ], cap:'Jawab tiap huruf untuk memunculkan varian ide baru.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Ambil 1 produkmu, jalankan 7 pertanyaan SCAMPER, catat minimal 3 ide pengembangan.'}
      ]
    },
    { id:'s3l3', judul:'Ide berbasis market, historis, forecast & geografi', durasi:'12 mnt',
      ringkas:'Kembangkan ide dari data — bukan tebakan.',
      blocks:[
        {t:'h', x:'1) Berdasarkan market (tren saat ini)'},
        {t:'p', x:'Lihat karakteristik pasar, tren, preferensi konsumen, & situasi ekonomi sekarang. Caranya: analisa pasar (riset/survei kualitatif & kuantitatif, pantau tren sosial media) + pakai tools pencari tren (mis. Google Trends). Contoh: cek tren kata kunci makanan kekinian 12 bulan terakhir & per kota untuk tahu di mana permintaan tertinggi.'},
        {t:'h', x:'2) Berdasarkan data historis'},
        {t:'p', x:'Lihat tren masa lalu. Tools: Google Analytics, alat visualisasi data, survei. Contoh: temukan bahwa masyarakat suatu kota menyukai jajanan sehat rendah kalori 5 tahun terakhir + belum ada pesaing → peluang ide baru.'},
        {t:'h', x:'3) Berdasarkan forecast (perkiraan masa depan)'},
        {t:'p', x:'Gunakan data & analisis untuk memperkirakan masa depan — pakai data dari sumber tepercaya (mis. lembaga riset pasar) atau buat forecast sendiri. Contoh: data menunjukkan bisnis kustomisasi fashion diperkirakan tumbuh beberapa persen per tahun → menjanjikan untuk ekspansi.'},
        {t:'h', x:'4) Berdasarkan geografi'},
        {t:'p', x:'Perhatikan karakteristik wilayah: kondisi sosial-ekonomi, budaya, lingkungan. Contoh: daerah dengan banyak tempat gym cocok untuk bisnis makanan sehat.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Pilih 1 metode (market/historis/forecast/geografi), cari 1 data pendukung nyata untuk ide ekspansimu.'}
      ]
    }
  ]
},

/* ============ CHAPTER 4 — RENCANA EKSPANSI PASAR ============ */
{
  id:'s4', judul:'Rencana Ekspansi Pasar', ikon:'i-chart', label:'Chapter 4',
  ringkas:'Analisa pasar dengan benar sebelum masuk pasar baru.',
  lessons:[
    { id:'s4l1', judul:'Segmentasi pasar & MASDA', durasi:'12 mnt',
      ringkas:'Bagi pasar jadi kelompok agar strategi lebih tepat sasaran.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'callout', k:'warn', judul:'Kenapa penting', x:'Ekspansi bisa gagal saat kamu tidak paham kondisi pasar baru. Segmentasi adalah langkah awal memilih segmen baru yang tepat.'},
        {t:'p', x:'<b>Segmentasi pasar</b> = membagi pasar jadi kelompok konsumen dengan kebutuhan/perilaku serupa, agar strategi pemasaran lebih tepat sasaran.'},
        {t:'table', head:['Segmentasi','Dasar'], rows:[
          ['Demographic','Umur, gender, pekerjaan, pendapatan'],
          ['Geographic','Kota, negara, kompleks'],
          ['Psychographic','Lifestyle, personality, interest, kelas sosial'],
          ['Behavioral','Tempat nongkrong, brand loyalty, kebiasaan belanja']
        ]},
        {t:'callout', k:'tip', judul:'Kenali “decision maker”', x:'Contoh: warung sarapan dekat SD — segmen utamanya bukan hanya siswa, tapi <b>orang tua</b> (pembuat keputusan & pemberi uang saku). Menarik mereka = otomatis menarik anak-anaknya.'},
        {t:'p', x:'Kerangka pelengkap segmentasi/analisis pasar sering disingkat <b>MASDA</b> — kombinasi analisis pasar (segmentasi, pesaing, tren, ukuran) untuk mengambil keputusan ekspansi.'}
      ]
    },
    { id:'s4l2', judul:'Analisis pesaing & tren pasar', durasi:'12 mnt',
      ringkas:'Kenali pesaing & arah pasar sebelum melangkah.',
      blocks:[
        {t:'h', x:'Competitors Analysis'},
        {t:'p', x:'Pelajari pesaing secara mendalam: posisi & kekuatan mereka, strategi pemasaran, kekuatan & kelemahan produk/layanan. Dari sini kamu menemukan <b>pembeda unik (USP)</b> — dari sisi harga, pelayanan, variasi produk, dll. Contoh: brand rice bowl dengan menu khas nusantara; toko furnitur yang produknya bisa dipasang sendiri + ada restoran.'},
        {t:'h', x:'Market Trend Analysis'},
        {t:'callout', k:'quote', judul:'', x:'Tren = pola konsumen. Tren bisa jadi kompas yang menentukan arah bisnis.'},
        {t:'list', items:[
          'Tren pola kebutuhan & keinginan target pelanggan.',
          'Pergeseran persepsi terhadap nilai suatu produk.',
          'Tren perubahan biaya dalam industri.',
          'Evolusi (perubahan besar) dalam industri.'
        ]},
        {t:'p', x:'Analisis tren membantumu tahu apa yang diinginkan pasar sekarang & apakah tren itu bertahan jangka panjang — sekaligus mengantisipasi perubahan pasar.'},
        {t:'quiz', q:'“Tren = pola konsumen” dipakai untuk…', opts:['Menentukan arah bisnis & antisipasi perubahan pasar','Menghitung pajak','Merekrut karyawan'], a:0, exp:'Analisis tren jadi kompas arah bisnis & antisipasi perubahan.'}
      ]
    },
    { id:'s4l3', judul:'Market sizing, BEP & ROI', durasi:'13 mnt',
      ringkas:'Ukur potensi pasar & kelayakan finansial ekspansi.',
      blocks:[
        {t:'h', x:'Market Sizing'},
        {t:'p', x:'Mengestimasi ukuran pasar yang bisa dicapai: pahami potensi pasar, identifikasi pesaing, tentukan pangsa yang realistis. Langkahnya: perkirakan jumlah pelanggan di segmenmu → pertimbangkan perbedaan tiap kelompok → berapa harga yang bersedia mereka bayar.'},
        {t:'h', x:'Break-Even Point (BEP)'},
        {t:'p', x:'Titik impas — tingkat penjualan agar total pendapatan menutup total biaya sebelum mulai untung.'},
        {t:'formula', x:'BEP (bulan) = Modal awal ÷ (Pendapatan per bulan − Total biaya per bulan)', cap:'Contoh: modal 90jt ÷ (36jt − 8jt) ≈ 3,21 bulan.'},
        {t:'h', x:'Return on Investment (ROI)'},
        {t:'formula', x:'ROI = (Hasil − Biaya Investasi) ÷ Biaya Investasi × 100%', cap:'Contoh: hasil 53jt, investasi 40jt → (53−40)/40 = 32,5%.'},
        {t:'callout', k:'tip', judul:'Baca hasilnya', x:'BEP cepat + ROI positif = proyeksi ekspansi sehat. Hitung dulu sebelum buka cabang/lini baru.'},
        {t:'h', x:'Strategi ekspansi'},
        {t:'p', x:'Pilih arah (vertikal/horizontal) berdasarkan <b>permintaan pasar, persaingan, sumber daya, & toleransi risiko</b>. Strategi yang tepat memperluas basis pelanggan & menjaga daya saing.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Hitung BEP & ROI kasar untuk rencana ekspansimu; tentukan strategi vertikal/horizontal yang paling sesuai. Pakai <a href="bisnis.html">Studio Bisnis</a> untuk menghitungnya.'}
      ]
    }
  ]
}

];

if (typeof module !== 'undefined' && module.exports) { module.exports = { KELAS_META:KELAS_META, KELAS_DATA:KELAS_DATA }; }
