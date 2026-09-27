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
        {t:'h', x:'Price Sensitivity'},
        {t:'p', x:'<b>Are they willing to pay or not?</b> Ukur seberapa banyak uang yang rela dikeluarkan pelanggan untuk produkmu. Ini melengkapi Conversion & Satisfaction — produk bisa disukai tapi belum tentu di harga yang kamu mau.'},
        {t:'callout', k:'tip', judul:'Contoh gabungan metrik dalam MVP', x:'Uji satu produk dengan 3 metrik sekaligus — <b>Satisfaction</b>, <b>NPS</b>, & <b>Price Sensitivity</b> — lalu terapkan metrik yang sama ke produk pembanding (A/B) agar keputusan berbasis data yang setara.'},
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
},

/* ============ CHAPTER 5 — MODEL BISNIS YANG MENGUNTUNGKAN ============ */
{
  id:'s5', judul:'Model Bisnis yang Menguntungkan', ikon:'i-layers', label:'Chapter 5',
  ringkas:'Rancang cara bisnismu membuat, menyampaikan, & menangkap nilai secara profitabel.',
  lessons:[
    { id:'s5l1', judul:'Apa itu model bisnis & jenisnya', durasi:'11 mnt',
      ringkas:'Model bisnis = cara membuat, menyampaikan, & menangkap value.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'callout', k:'warn', judul:'Kenapa penting', x:'Bisnis yang berinovasi pada <b>model bisnis</b> tumbuh jauh lebih cepat daripada yang hanya berinovasi pada produk/operasi. Banyak perusahaan jatuh karena tumbuh terlalu cepat tanpa model bisnis sehat (profit tak sebanding pengeluaran).'},
        {t:'lead', x:'<b>Model bisnis</b> = cara perusahaan merancang, mengelola, & menghasilkan keuntungan dari produk/layanannya. Ia menjelaskan bagaimana bisnis <b>membuat, menyampaikan, & menangkap value</b>.'},
        {t:'h', x:'Jenis model bisnis'},
        {t:'table', head:['Jenis','Arti','Contoh'], rows:[
          ['B2B','Menjual ke perusahaan lain','Produsen mesin → pabrik'],
          ['B2C','Menjual langsung ke konsumen akhir','Toko online → pembeli'],
          ['B2B2C','Ke perusahaan lain, lalu diteruskan ke konsumen','Produsen kosmetik → retail → konsumen'],
          ['B2A','Menjual ke lembaga pemerintah/publik','Perusahaan software → instansi']
        ], cap:'Top innovators rata-rata menggabungkan 3 model bisnis atau lebih.'},
        {t:'quiz', q:'Menjual produk ke retail yang lalu menjualnya ke konsumen adalah…', opts:['B2C','B2B2C','B2A'], a:1, exp:'B2B2C = business-to-business-to-consumer.'}
      ]
    },
    { id:'s5l2', judul:'3 pilar: Value Creation, Proposition & Capture', durasi:'13 mnt',
      ringkas:'Tiga nilai yang membentuk model bisnis.',
      blocks:[
        {t:'diagram', kind:'flow', judul:'Tiga pilar nilai', nodes:[
          {t:'Value Creation', d:'Menciptakan nilai (People, Partner, Aset)'},
          {t:'Value Proposition', d:'Menawarkan manfaat & menentukan harga'},
          {t:'Value Capture', d:'Mendapat & mempertahankan pelanggan'}
        ], cap:'Pahami bisnismu lewat ketiga nilai ini.'},
        {t:'h', x:'1) Value Creation — dari 3 komponen'},
        {t:'list', items:[
          '<b>People</b> — karyawan di aktivitas utama (pengadaan, logistik, marketing, sales) & sekunder (HR, manajemen).',
          '<b>Partner</b> — supplier & mitra strategis (mentor, brand).',
          '<b>Aset</b> — terlihat (bangunan, mesin) & tak terlihat (brand, kekayaan intelektual, nama baik).'
        ]},
        {t:'p', x:'Cara menciptakan nilai tambah: inovasi produk, efisiensi operasional, diferensiasi, & customization.'},
        {t:'h', x:'2) Value Proposition'},
        {t:'p', x:'Empat proposisi nilai sederhana: <b>lebih mudah</b> (usaha lebih sedikit), <b>lebih baik</b> (kualitas), <b>lebih cepat</b>, <b>lebih murah</b>.'},
        {t:'table', head:['Strategi harga','Cara'], rows:[
          ['Cost-based','Hitung biaya + margin'],
          ['Competitor-based','Benchmark ke harga pesaing'],
          ['Value-based','Harga optimal dari kesediaan bayar pelanggan (paling optimal)']
        ]},
        {t:'h', x:'3) Value Capture'},
        {t:'diagram', kind:'flow', judul:'Get–Keep–Growth', nodes:[
          {t:'Get', d:'Dapatkan pelanggan baru (iklan, sosmed)'},
          {t:'Keep', d:'Pertahankan (customer experience, loyalty)'},
          {t:'Growth', d:'Tumbuhkan (up-selling & cross-selling)'}
        ], cap:'Rangkum semuanya dalam Business Model Canvas.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Isi Business Model Canvas bisnismu — mulai dari value proposition, lalu segmen, saluran, revenue, & cost.'}
      ]
    },
    { id:'s5l3', judul:'Skala ekonomis, rantai pasok & 10 tipe inovasi', durasi:'13 mnt',
      ringkas:'Tekan biaya & inovasikan model bisnis agar makin profitabel.',
      blocks:[
        {t:'h', x:'Skala ekonomis'},
        {t:'p', x:'Biaya produksi per unit menurun saat volume produksi naik (produksi massal) — mis. beli bahan baku dalam jumlah besar dapat diskon.'},
        {t:'table', head:['Tipe','Penjelasan'], rows:[
          ['Teknikal','Bisnis besar mampu investasi teknologi hemat biaya'],
          ['Spesialisasi','Pembagian kerja lebih efisien dengan output tinggi'],
          ['Pembelian massal','Biaya rata-rata lebih rendah karena beli banyak'],
          ['Marketing','Campaign skala besar lebih efisien menghasilkan sales'],
          ['Risk bearing','Perusahaan besar lebih tahan penurunan ekonomi'],
          ['Financial','Perusahaan besar dapat suku bunga bank lebih baik']
        ]},
        {t:'h', x:'Rantai pasok (supply chain)'},
        {t:'p', x:'Alur dari pengadaan bahan baku → produksi → pengemasan → penyimpanan → transportasi → sampai ke pelanggan. Tingkatkan dengan: cek kapasitas gudang/inventory, pilih supplier tepat, bangun hubungan baik dengan supplier, rencanakan produksi berdasar permintaan, adopsi teknologi/tools, & rutin monitor-evaluasi.'},
        {t:'h', x:'10 tipe inovasi model bisnis'},
        {t:'list', items:[
          '<b>Profit model</b> — cara baru menghasilkan pendapatan.',
          '<b>Network</b> — kemitraan/jaringan yang saling menguntungkan.',
          '<b>Structure</b> — struktur organisasi (mis. flat/matriks).',
          '<b>Process</b> — proses produksi/pengiriman lebih efisien.',
          '<b>Product performance</b> — tingkatkan kinerja produk.',
          '<b>Product system</b> — perluas/kaitkan sistem produk.',
          '<b>Service</b> — layanan pelanggan lebih baik/baru.',
          '<b>Channel</b> — kembangkan saluran distribusi.',
          '<b>Brand</b> — bangun citra/merek.',
          '<b>Customer engagement</b> — tingkatkan interaksi & keterlibatan pelanggan.'
        ]},
        {t:'h', x:'Tingkatkan margin lewat layanan'},
        {t:'p', x:'Selain menekan biaya, margin bisa naik dengan menambah <b>nilai/kualitas layanan</b>: pelayanan yang lebih baik, garansi, personalisasi, dukungan purna jual, atau pengalaman yang membuat pelanggan rela membayar lebih. Layanan yang unggul menaikkan kesediaan bayar & mempertahankan pelanggan.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Pilih 2 dari 10 tipe inovasi yang paling bisa kamu terapkan tahun ini + 1 peningkatan layanan yang menaikkan margin.'}
      ]
    }
  ]
},

/* ============ CHAPTER 6 — AKUISISI PELANGGAN & SALES FUNNEL ============ */
{
  id:'s6', judul:'Akuisisi Pelanggan & Sales Funnel', ikon:'i-store', label:'Chapter 6',
  ringkas:'Naikkan akuisisi lewat marketing funnel, loyalitas, tim sales, & KPI/OKR.',
  lessons:[
    { id:'s6l1', judul:'Marketing funnel & brand awareness', durasi:'13 mnt',
      ringkas:'Perjalanan pelanggan dari kenal sampai jadi pendukung.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'diagram', kind:'funnel', judul:'Marketing funnel', nodes:[
          {t:'Awareness', d:'Mengenal merek & nilaimu (offline/hyperlocal & online)'},
          {t:'Consideration', d:'Mencari info & membandingkan'},
          {t:'Conversion', d:'Memutuskan membeli'},
          {t:'Loyalty', d:'Membeli berulang & memilihmu'},
          {t:'Advocacy', d:'Merekomendasikan ke orang lain'}
        ], cap:'Tujuannya: ubah calon → pelanggan → pelanggan setia.'},
        {t:'h', x:'4 level brand awareness'},
        {t:'table', head:['Level','Kondisi','Strategi'], rows:[
          ['Recognition','Pernah melihat/mengenal merek','Visual kuat, jelas, mudah dibaca'],
          ['Recall','Ingat saat melihat merek','Repetisi, slogan, jingle'],
          ['Top of Mind','Merek pertama yang teringat','Jaga hubungan (mis. newsletter)'],
          ['Brand Preference','Lebih memilihmu dari pesaing','Layanan terbaik yang konsisten']
        ]},
        {t:'diagram', kind:'flow', judul:'Perjalanan keputusan konsumen', nodes:[
          {t:'Initial', d:'Kenali kebutuhan/keinginan'},
          {t:'Active Evaluation', d:'Riset, bandingkan, cari rekomendasi'},
          {t:'Closure', d:'Putuskan beli/tidak'},
          {t:'Buy', d:'Membeli produk yang dipilih'},
          {t:'Post-Purchase', d:'Evaluasi pengalaman'}
        ], cap:'Puas → rekomendasi & setia; tak puas → pindah merek. Di fase Consideration, tugasmu meyakinkan bahwa produkmu worth it & punya value pembeda.'}
      ]
    },
    { id:'s6l2', judul:'Loyalitas pelanggan & strategi B2C/B2B/B2A', durasi:'12 mnt',
      ringkas:'Pertahankan pelanggan — jauh lebih murah dari mencari baru.',
      blocks:[
        {t:'callout', k:'quote', judul:'', x:'75% orang tidak percaya iklan, tapi 92% percaya rekomendasi merek dari teman. Perusahaan rata-rata kehilangan 10–30% pelanggan tiap tahun bila tak dijaga.'},
        {t:'h', x:'Tingkatkan loyalitas lewat after-sales'},
        {t:'list', items:[
          'Free upgrade · minta testimoni · survei kepuasan.',
          'Kartu member & loyalty points (mis. 3× beli gratis produk).',
          'Layanan chat/CS yang selalu siap · pelatihan penggunaan produk · promo khusus.'
        ]},
        {t:'table', head:['Divisi','Strategi loyalitas'], rows:[
          ['Sales','Loyalty program & promo spesial pelanggan setia'],
          ['Customer Service','Ramah, sabar, penyelesaian cepat & efisien'],
          ['Marketing','Bangun komunitas khusus pelanggan setia'],
          ['Product Dev','Dengar masukan; akses eksklusif produk baru'],
          ['Operation','Retur lebih fleksibel; pastikan pengalaman memuaskan']
        ]},
        {t:'h', x:'Strategi per model'},
        {t:'list', items:[
          '<b>B2C</b> — prioritaskan <b>end-to-end customer experience</b> & kenyamanan belanja.',
          '<b>B2B</b> — alur: cari calon → nilai kecocokan → hubungi → pastikan minat → negosiasi → closing.',
          '<b>B2A</b> — kontrak dengan lembaga pemerintah/publik (mis. layanan berbasis langganan software).'
        ]},
        {t:'callout', k:'tip', judul:'Success Plan (sales deck)', x:'Sales deck jelas menuju win-win: judul, company profile, timeline, konteks masalah, business road map, sales goals & KPI, action plan, budget/pricing, & demo. Ukur retensi dengan CSAT, EBR/QBR.'}
      ]
    },
    { id:'s6l3', judul:'Tim sales, KPI & OKR', durasi:'12 mnt',
      ringkas:'Bisnis bukan hanya kamu — tim & target yang jelas kunci penjualan.',
      blocks:[
        {t:'h', x:'Tim sales yang solid'},
        {t:'p', x:'Tetapkan goals & ekspektasi jelas, berdayakan karyawan, beri kompensasi kompetitif, & bangun hubungan kuat dengan pelanggan. Alat ukur produktivitas: <b>CRM</b>, <b>sales enablement</b>, <b>training</b>, & platform <b>komunikasi & kolaborasi</b>.'},
        {t:'h', x:'KPI (Key Performance Indicator)'},
        {t:'table', head:['KPI','Arti'], rows:[
          ['Sales Revenue','Total pendapatan penjualan periode'],
          ['Sales Growth','(Penjualan kini − sebelumnya) ÷ sebelumnya'],
          ['Conversion Rate','Jumlah konversi ÷ total pengunjung'],
          ['CAC','(Total sales + marketing cost) ÷ pelanggan baru'],
          ['CLV','(Rata-rata pendapatan/th × lama hubungan) − biaya akuisisi']
        ]},
        {t:'h', x:'OKR (Objectives and Key Results)'},
        {t:'diagram', kind:'flow', judul:'Kanvas OKR', nodes:[
          {t:'Vision & Why', d:'Tujuan jangka panjang & alasannya'},
          {t:'Objective', d:'Tujuan spesifik & terukur'},
          {t:'Lead & Lag', d:'Tindakan (lead) & hasil akhir (lag)'},
          {t:'Key Results', d:'Ukuran spesifik keberhasilan OKR'}
        ], cap:'Tiap bulan tetapkan KPI & OKR jelas agar bisa belajar & memperbaiki.'},
        {t:'callout', k:'tip', judul:'Personalization = Value × Relevance × Timeliness × Trust', x:'Kurangi dengan Loss of Privacy (risiko data). Lengkapi dengan analisis 4C (Consumer, Company, Competitors, Collaborators) & 4P (Product, Price, Place, Promotion).'},
        {t:'quiz', q:'CAC dihitung dari…', opts:['Konversi ÷ pengunjung','(Total sales + marketing) ÷ pelanggan baru','Pendapatan × lama hubungan'], a:1, exp:'CAC = total biaya sales+marketing dibagi jumlah pelanggan baru.'}
      ]
    }
  ]
},

/* ============ CHAPTER 7 — KEPEMIMPINAN & STRUKTUR TIM ============ */
{
  id:'s7', judul:'Kepemimpinan & Struktur Tim', ikon:'i-user', label:'Chapter 7',
  ringkas:'Bangun tim, budaya, & sistem agar bisnis bisa dibesarkan dengan sehat.',
  lessons:[
    { id:'s7l1', judul:'Struktur organisasi, budaya & SDM', durasi:'13 mnt',
      ringkas:'Kunci keberhasilan dimulai dari organisasi yang sehat.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'callout', k:'key', judul:'Prinsip', x:'Perlakukan karyawan seperti kamu ingin mereka memperlakukan pelanggan terbaikmu. Tiga aspek utama: <b>Human Resource, Process, & Finance</b>. <b>Kultur > proses.</b>'},
        {t:'h', x:'Jenis struktur organisasi'},
        {t:'table', head:['Struktur','Ciri','Kelemahan'], rows:[
          ['Fungsional','Dikelompokkan per fungsi (keuangan, marketing, produksi)','Komunikasi antar-departemen kurang'],
          ['Divisional','Dibagi per produk/wilayah/pasar','Duplikasi fungsi & biaya tinggi'],
          ['Matriks','Per proyek + fungsi; punya >1 atasan','Pengambilan keputusan kompleks']
        ]},
        {t:'p', x:'<b>Budaya</b> membentuk sikap & perilaku secara luas dan bertahan — 4 sifat: <b>shared, pervasive, enduring, implicit</b>. Ukur dengan <b>survei employee engagement</b> (anonim).'},
        {t:'h', x:'Manpower planning & rekrutmen'},
        {t:'diagram', kind:'flow', judul:'6 proses rekrutmen', nodes:[
          {t:'Planning', d:'Perencanaan kebutuhan'},
          {t:'Sourcing', d:'Cari kandidat'},
          {t:'Screening', d:'Penyaringan'},
          {t:'Selecting', d:'Memilih'},
          {t:'Hiring', d:'Mempekerjakan'},
          {t:'Onboarding', d:'Penyambutan & adaptasi'}
        ], cap:'Rekrut secara terstruktur — meningkatkan kualitas seleksi jauh lebih menguntungkan daripada sekadar memperbanyak kandidat.'},
        {t:'callout', k:'tip', judul:'Interview terstruktur', x:'Identifikasi skill yang dibutuhkan → buat rubrik penilaian → pilih teknik (pengalaman/kasus) → buat guideline → pilih pewawancara tepat → latihan terstruktur.'},
        {t:'h', x:'Socialization / Onboarding'},
        {t:'p', x:'Proses mengenalkan karyawan baru ke tugas, budaya, & rekan kerja. Empat langkah agar efektif: (1) beradaptasi dengan perkembangan zaman & tinggalkan kebiasaan lama, (2) bantu karyawan menemukan kelebihan & peluangnya, (3) fasilitasi mengenal lingkungan & rekan, (4) libatkan aktif untuk mengeksplor kelebihannya.'}
      ]
    },
    { id:'s7l2', judul:'Kepemimpinan, SOP & growth hacking', durasi:'12 mnt',
      ringkas:'Pimpin tim, standarkan proses, & kejar keunggulan biaya.',
      blocks:[
        {t:'h', x:'Gaya kepemimpinan'},
        {t:'table', head:['Gaya','Cocok untuk'], rows:[
          ['Practical Skills','Langsung mempraktikkan ide sebagai eksperimen ke tim'],
          ['Radical Honesty','Terbuka & apa adanya (atur cara menyampaikan agar tak menyinggung)'],
          ['Collaborative Problem Solving','Pengamat yang fokus menyelesaikan masalah tanpa tergesa']
        ]},
        {t:'p', x:'Nilai kinerja tim lewat tingkat pengaruh: <b>Primary</b> (learning & development, senior leadership, image & reputation), <b>Secondary</b> (terbuka pada saran & kritik), <b>Tertiary</b> (beri kepercayaan & dorong inisiatif tim).'},
        {t:'h', x:'Implementasi SOP'},
        {t:'steps', items:['Identifikasi proses.','Dokumentasikan (PIC, tugas, alat, hasil).','Tinjau & revisi (akurat, lengkap, konsisten).','Komunikasikan & latih.','Monitor & evaluasi efektivitas.','Tegakkan kepatuhan.']},
        {t:'h', x:'Growth Hacking: Cost Leadership'},
        {t:'p', x:'Capai keunggulan kompetitif dengan biaya produksi lebih rendah dari pesaing → bisa jual lebih murah & rebut pangsa pasar. Caranya: peramalan permintaan akurat, economies of scale, standardisasi, sasar pelanggan rata-rata, teknologi hemat biaya.'},
        {t:'h', x:'Kualitas, performa & kematangan organisasi'},
        {t:'p', x:'Fokus <b>kualitas di atas kuantitas</b>: layani pelanggan terbaik, pantau kualitas (standar & audit rutin), analisis data. Tingkat kematangan organisasi diukur dengan <b>CMMI</b> — Level 0 Incomplete → 1 Initial → 2 Managed → 3 Defined → 4 Quantitatively Managed → 5 Optimizing.'},
        {t:'quiz', q:'Level CMMI tertinggi (terus berkembang & cari peluang) adalah…', opts:['Managed','Defined','Optimizing'], a:2, exp:'Level 5 Optimizing — perbaikan berkelanjutan.'}
      ]
    },
    { id:'s7l3', judul:'Manajemen kinerja & keuangan', durasi:'12 mnt',
      ringkas:'Ukur kinerja dengan KPI/OKR & jaga kesehatan keuangan.',
      blocks:[
        {t:'p', x:'<b>Manajemen kinerja</b> = tetapkan tujuan, ukur kemajuan, beri umpan balik & dukungan, lalu tinjau & sesuaikan tujuan. Dipandu <b>KPI</b> (sales revenue, sales growth, conversion, CAC, CLV) & <b>OKR</b> (vision → objective → lead/lag measures → key results).'},
        {t:'h', x:'Manajemen keuangan'},
        {t:'list', items:[
          '<b>Manajemen arus kas</b> — kelola uang masuk/keluar; cegah kekurangan kas & kebangkrutan.',
          '<b>Metrik keuangan</b> — 3 yang paling sering: <b>Profit Margin</b> (persentase pendapatan yang jadi laba), <b>ROI</b> (efisiensi/profitabilitas investasi), <b>Revenue Growth</b> (pertumbuhan pendapatan vs periode sebelumnya). Tambahan: ROA, ROE, Quick Ratio, Cash Ratio, Payback Period, Inventory Turnover.',
          '<b>Income statement</b> — pendapatan, HPP, laba kotor, biaya operasional, laba operasi, bunga, pajak, laba bersih, EBIT, dividen.'
        ]},
        {t:'h', x:'Pajak (Indonesia)'},
        {t:'table', head:['Jenis','Dikenakan atas'], rows:[
          ['PPh 21','Penghasilan karyawan dari pemberi kerja'],
          ['PPh 22','Kegiatan usaha tertentu (perdagangan/jasa) & pengadaan barang/jasa'],
          ['PPh 23','Penghasilan seperti sewa atau royalti']
        ], cap:'Tiap jenis punya tarif & jangka pelaporan berbeda — pahami kewajibanmu.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Tetapkan 1 KPI + 1 OKR bulan ini, dan susun income statement sederhana bisnismu (pendapatan − biaya = laba).'}
      ]
    }
  ]
},

/* ============ CHAPTER 8 — REKOMENDASI BUKU ============ */
{
  id:'s8', judul:'Rekomendasi Buku', ikon:'i-book', label:'Chapter 8',
  ringkas:'Bacaan lanjutan untuk memperdalam tiap bidang scale-up.',
  lessons:[
    { id:'s8l1', judul:'Daftar bacaan pilihan', durasi:'5 mnt',
      ringkas:'Buku per bidang untuk melanjutkan belajar.',
      blocks:[
        {t:'p', x:'Perdalam tiap bidang scale-up lewat bacaan berikut, dikelompokkan per tema.'},
        {t:'h', x:'Manajemen SDM & Tim'},
        {t:'books', items:[
          {judul:'The One Minute Manager', penulis:'Kenneth Blanchard & Spencer Johnson', ket:'Teknik manajemen sederhana lewat cerita pendek.'},
          {judul:'The Talent Delusion', penulis:'Tomas Chamorro-Premuzic', ket:'Mengukur & mengembangkan talenta secara jujur.'},
          {judul:'The Culture Code', penulis:'Daniel Coyle', ket:'Rahasia membangun kelompok yang sangat efektif.'},
          {judul:'Managing Oneself', penulis:'Peter F. Drucker', ket:'Mengelola diri sebelum mengelola orang lain.'}
        ]},
        {t:'h', x:'Kewirausahaan & Model Bisnis'},
        {t:'books', items:[
          {judul:'The Personal MBA', penulis:'Josh Kaufman', ket:'Peta lengkap dunia bisnis, dari marketing sampai strategi.'},
          {judul:'Zero to One', penulis:'Peter Thiel', ket:'Menciptakan sesuatu yang benar-benar baru.'},
          {judul:'The Art of Possibility', penulis:'Rosamund & Benjamin Zander', ket:'Melihat peluang dari sudut pandang baru.'}
        ]},
        {t:'h', x:'Marketing & Sales'},
        {t:'books', items:[
          {judul:'DotCom Secrets', penulis:'Russell Brunson', ket:'Strategi membangun sales funnel online yang menarik & mempertahankan pelanggan.'},
          {judul:'Never Lose a Customer Again', penulis:'Joey Coleman', ket:'Membangun loyalitas pelanggan yang kuat dalam 100 hari.'},
          {judul:'Building a StoryBrand', penulis:'Donald Miller', ket:'7 poin storytelling merek yang menjual.'}
        ]},
        {t:'h', x:'Kepemimpinan'},
        {t:'books', items:[
          {judul:'The 21 Irrefutable Laws of Leadership', penulis:'John C. Maxwell', ket:'21 hukum kepemimpinan + ilustrasi kasus nyata.'},
          {judul:'Start With Why', penulis:'Simon Sinek', ket:'Konsep Golden Circle: Why–How–What.'},
          {judul:'Good to Great', penulis:'Jim Collins', ket:'Langkah perusahaan mencapai keunggulan jangka panjang.'},
          {judul:'Leaders Eat Last', penulis:'Simon Sinek', ket:'Memimpin dengan mengutamakan tim.'}
        ]},
        {t:'callout', k:'tip', judul:'Cara memakai', x:'Pilih satu buku sesuai chapter yang paling ingin kamu perkuat sekarang — jangan baca semua sekaligus.'}
      ]
    }
  ]
}

];

if (typeof module !== 'undefined' && module.exports) { module.exports = { KELAS_META:KELAS_META, KELAS_DATA:KELAS_DATA }; }
