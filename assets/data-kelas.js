/* ============================================================
   KELAS "BISNIS MULAI DARI NOL" — data kurikulum (Bekal)
   ------------------------------------------------------------
   7 chapter berurutan (materi mengajarkan kerangka bisnis standar
   — SWOT, IKIGAI, Porter's Five Forces, PESTLE, TAM/SAM/SOM,
   STP, AIDA, 7P, valuasi, dll — ditulis ulang dengan bahasa &
   contoh sendiri). Tiap sesi punya slot video (.mp4) utk diisi.

   Skema blok (dirender oleh kelas.html):
     {t:'lead'|'p'|'h', x}
     {t:'callout', k:'key'|'tip'|'warn'|'quote', judul, x}
     {t:'steps'|'list', items:[...]}
     {t:'diagram', kind:'flow'|'funnel'|'pyramid'|'cycle'|'bars'|'quad', judul, nodes, cap}
     {t:'table', head:[...], rows:[[...]], cap}
     {t:'formula', x, cap}
     {t:'img', src, cap} · {t:'video', src, poster, cap}
     {t:'books', items:[{judul,penulis,ket}]}
     {t:'quiz', q, opts:[...], a:idxBenar, exp}
   ============================================================ */
var KELAS_META = {
  judul: 'Bisnis Mulai dari Nol',
  batch: 'Batch 1',
  ringkas: '7 chapter membangun bisnis dari nol — fondasi founder & valuasi, inovasi ide, riset pasar, produk & USP, branding-sales-marketing, operasional lean, sampai metrik pertumbuhan. Belajar seperti kuliah online: teks, diagram, dan video.',
  catatan: 'Materi menjelaskan kerangka bisnis standar (Porter, PESTLE, IKIGAI, TAM/SAM/SOM, STP, AIDA, 7P, dll) dengan bahasa & contoh sendiri. Slot video tiap sesi akan diisi saat rekaman kelas diunggah.'
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
        {t:'video', src:'', poster:'', cap:'Video pengantar (akan diisi saat rekaman diunggah).'},
        {t:'lead', x:'Kelas ini untuk kamu yang <b>benar-benar mulai dari nol</b> — belum punya produk, modal terbatas, bahkan belum yakin mau jualan apa. Tujuannya bukan menghafal teori, melainkan membangun <b>fondasi yang benar</b> lalu bergerak sampai ada bukti pasar dan bisnis yang bisa dibesarkan.'},
        {t:'callout', k:'key', judul:'Prinsip kelas', x:'Belajar sambil mengeksekusi. Tiap chapter ditutup dengan satu <b>Tindakan</b> nyata. Jangan lompat sebelum tindakannya kamu kerjakan.'},
        {t:'h', x:'Peta perjalanan — 7 chapter'},
        {t:'list', items:[
          '<b>Chapter 1 — Fondasi Founder & Valuasi:</b> kenali diri, produk, tujuan; nilai & pitch bisnis.',
          '<b>Chapter 2 — Inovasi Ide Bisnis:</b> temukan & kembangkan ide yang cocok pasar.',
          '<b>Chapter 3 — Riset Pasar & Profil Pelanggan:</b> ukur pasar & pahami pelanggan.',
          '<b>Chapter 4 — Produk Unggul & USP:</b> bangun produk yang beda & bernilai.',
          '<b>Chapter 5 — Branding, Sales & Marketing:</b> perkenalkan & jual dengan efektif.',
          '<b>Chapter 6 — Operasional Lean:</b> jalankan bisnis rapi & efisien.',
          '<b>Chapter 7 — Skill Fondasi & Metrik Pertumbuhan:</b> ukur & besarkan bisnis.'
        ]},
        {t:'steps', items:[
          'Tonton/baca satu sesi sampai selesai — jangan sambil lalu.',
          'Kerjakan kotak <b>Tindakan</b> di akhir sesi.',
          'Tandai sesi <b>Selesai</b> — progресmu tersimpan otomatis di perangkat.',
          'Ulang sesi yang berat; paham lebih penting dari cepat.'
        ]},
        {t:'callout', k:'tip', judul:'Siapkan', x:'Satu buku catatan khusus kelas ini. Semua tugas ditulis di sana — itu jadi cetak biru bisnismu.'}
      ]
    }
  ]
},

/* ============ CHAPTER 1 — FONDASI FOUNDER & VALUASI ============ */
{
  id:'m1', judul:'Fondasi Founder & Valuasi', ikon:'i-user', label:'Chapter 1',
  ringkas:'Inti bisnis adalah foundernya. Kenali diri & produk, lalu pahami cara menilai (valuasi) & mem-pitch bisnis.',
  lessons:[
    { id:'m1l1', judul:'Bisnis vs dagang & bisnis yang hebat', durasi:'9 mnt',
      ringkas:'Beda bisnis dengan sekadar berdagang, dan tolok ukur bisnis baik.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'lead', x:'<b>Bisnis</b> adalah organisasi yang mencari keuntungan lewat penjualan barang/jasa — dan berbeda dari sekadar <b>berdagang</b> (tukar barang untuk untung sesaat).'},
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
        {t:'callout', k:'warn', judul:'Pelajaran', x:'Perusahaan yang dulu mendominasi bisa jatuh karena <b>tidak adaptif</b> terhadap perubahan. Bisnis hebat terus menyesuaikan diri.'},
        {t:'quiz', q:'Penanda utama “bisnis hebat” adalah…', opts:['Sekadar berumur panjang','Memberi dampak nyata bagi stakeholder & adaptif','Untung besar sekali lalu tutup'], a:1, exp:'Tolok ukurnya dampak berkelanjutan bagi stakeholder.'}
      ]
    },
    { id:'m1l2', judul:'Mengenal diri: SWOT diri, IKIGAI & 3P', durasi:'11 mnt',
      ringkas:'Inti bisnis adalah kamu. Petakan kekuatan-kelemahan & temukan alasan bergerak.',
      blocks:[
        {t:'lead', x:'Inti setiap bisnis adalah <b>foundernya</b>. Sebelum menilai pasar, kenali diri — kekuatan <i>dan</i> kelemahan, keadaan internal <i>dan</i> lingkungan eksternal.'},
        {t:'diagram', kind:'quad', judul:'SWOT untuk dirimu', nodes:[
          {t:'Strength', d:'Apa kelebihanmu?'},
          {t:'Weakness', d:'Apa kelemahan yang perlu disiasati?'},
          {t:'Opportunity', d:'Peluang di sekitarmu?'},
          {t:'Threat', d:'Ancaman/risiko yang mengintai?'}
        ], cap:'Contoh: chef lulusan Italia (kuat masak Italia, lemah masakan lokal) di daerah tanpa resto Italia (peluang) tapi selera warga belum tentu cocok (ancaman). Apa keputusanmu?'},
        {t:'h', x:'IKIGAI — alasan untuk bergerak'},
        {t:'diagram', kind:'cycle', judul:'4 pertanyaan IKIGAI', nodes:[
          {t:'Kamu sukai', d:'Apa yang kamu cintai?'},
          {t:'Kamu kuasai', d:'Apa yang kamu jago?'},
          {t:'Dunia butuh', d:'Apa yang dibutuhkan orang?'},
          {t:'Dibayar', d:'Untuk apa orang mau bayar?'}
        ], cap:'Irisan keempatnya = arah usaha yang selaras dengan dirimu & pasar.'},
        {t:'callout', k:'tip', judul:'3P sebagai kompas', x:'<b>Passion</b> (kerja untuk yang kamu pedulikan) · <b>Purpose</b> (jadi lebih besar dari diri sendiri) · <b>Pleasure</b> (kejar hasil jangka pendek).'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Tulis SWOT dirimu (3 poin tiap kuadran) & jawab 4 pertanyaan IKIGAI. Simpan — jadi penyaring ide di Chapter 2.'}
      ]
    },
    { id:'m1l3', judul:'3 level produk & rencana SMART', durasi:'10 mnt',
      ringkas:'Pahami lapisan produkmu & susun target yang benar-benar bisa dijalankan.',
      blocks:[
        {t:'h', x:'Tiga level produk/jasa'},
        {t:'diagram', kind:'pyramid', judul:'Lapisan nilai produk', nodes:[
          {t:'Core', d:'Manfaat inti — alasan utama orang beli (sumber pendapatan)'},
          {t:'Actual', d:'Wujud nyata: kualitas, desain, fitur'},
          {t:'Augmented', d:'Paket total: garansi, layanan purna jual, poin loyalti'}
        ], cap:'Contoh IKEA: core=kebutuhan rumah tangga; actual=meja/kursi/lemari; augmented=bantuan rakit, pengalaman belanja, kafe.'},
        {t:'h', x:'Rencana pengembangan diri — SMART'},
        {t:'table', head:['Huruf','Arti','Pertanyaan'], rows:[
          ['S','Specific','Apa persisnya yang mau dicapai?'],
          ['M','Measurable','Bagaimana mengukurnya (angka)?'],
          ['A','Actionable','Apa langkah nyatanya?'],
          ['R','Realistic','Masuk akal dengan sumber dayamu?'],
          ['T','Time-bound','Kapan tenggatnya?']
        ], cap:'Contoh: “Buka 3 cabang di kota X dalam 4 bulan, modal Rp50 juta, 15 karyawan, resep dari cabang pertama.”'},
        {t:'list', items:[
          '<b>Jangka pendek</b> (minggu–bulan): mis. “pahami keuangan pribadi dengan ikut kelas minggu depan.”',
          '<b>Jangka panjang</b> (tahunan): mis. “luncurkan perusahaan sendiri dalam 5 tahun.”'
        ]},
        {t:'quiz', q:'Bagian “M” pada SMART berarti…', opts:['Motivasi tinggi','Measurable — bisa diukur','Maksimal usaha'], a:1, exp:'M = Measurable; target harus punya ukuran.'}
      ]
    },
    { id:'m1l4', judul:'Valuasi: menilai berapa bisnismu layak', durasi:'13 mnt',
      ringkas:'Empat cara menaksir nilai sebuah bisnis sebelum menggalang dana.',
      blocks:[
        {t:'p', x:'<b>Fundraising</b> = proses bisnis mendapatkan dana dari investor (biasanya menawarkan saham/obligasi). Sebelumnya kamu perlu tahu <b>valuasi</b> — nilai bisnismu — agar tidak salah menawar.'},
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
        {t:'table', head:['Metode','Cocok untuk'], rows:[
          ['Asset-based','Bisnis dengan aset nyata besar'],
          ['Market multiple','Ada pembanding sejenis'],
          ['DCF','Proyeksi arus kas jelas'],
          ['EV/EBITDA','Sudah profit operasional']
        ], cap:'Sering dipakai beberapa metode lalu dibandingkan.'},
        {t:'quiz', q:'Rumus Asset-Based Valuation…', opts:['Total Harta − Total Hutang','Valuasi ÷ Metrik','Arus kas didiskon'], a:0, exp:'Asset-based = total harta − total hutang.'}
      ]
    },
    { id:'m1l5', judul:'Cara pitch yang menarik investor', durasi:'11 mnt',
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
        {t:'callout', k:'tip', judul:'Perkuat tim', x:'Studi menunjukkan bisnis dengan <b>lebih dari satu founder</b> punya tingkat bertahan lebih tinggi. Tunjukkan tim yang saling melengkapi.'},
        {t:'list', items:[
          '<b>Mulai dari masalah</b>, bukan fitur — investor beli peluang.',
          '<b>Tunjukkan traksi</b> sekecil apa pun.',
          '<b>Perjelas “ask”</b>: butuh dana berapa, untuk apa, target apa.',
          'Untuk awal, pertimbangkan <b>angel investor</b>.'
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
        {t:'p', x:'Peluang muncul saat ada <b>celah</b> antara supply & demand. Contoh: saat stok masker menipis padahal permintaan melonjak, produsen kain cepat memproduksi masker massal.'},
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
        {t:'callout', k:'key', judul:'Tindakan', x:'Pilih 1 masalah dari sesi lalu. Brainwriting 10 solusi, saring pakai topi Kuning (peluang) & Hitam (risiko). Lalu minta pendapat 3 orang sekitar untuk “pengakuan” ide.'}
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
        {t:'callout', k:'warn', judul:'Kenapa wajib riset & validasi?', x:'Tanpa riset & validasi, kegagalan hampir pasti. Riset mengidentifikasi peluang, mengurangi risiko, mengenal target pelanggan, dan memberi keyakinan mengambil keputusan.'},
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
        {t:'p', x:'<b>Riset harga:</b> survei harga pesaing, tanya pelanggan, dan tetapkan berbasis <b>nilai</b> — lihat urgensi & manfaat dari sudut pelanggan, lalu sesuaikan kemampuan bayar.'},
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
  ringkas:'Bangun produk yang benar-benar beda & bernilai lewat USP dan value proposition.',
  lessons:[
    { id:'m4l1', judul:'Unique Selling Proposition (USP)', durasi:'11 mnt',
      ringkas:'Atribut yang membuat produkmu beda & dipilih.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'lead', x:'<b>USP (Unique Selling Proposition)</b> adalah atribut yang <b>membedakan</b> produk/jasamu dari pesaing — alasan spesifik kenapa orang memilihmu. Kuncinya: <b>unik & spesifik</b>.'},
        {t:'h', x:'Cara menemukan USP'},
        {t:'steps', items:[
          'Pahami pelanggan & masalah yang paling mereka pedulikan.',
          'Pahami produkmu: apa kelebihan nyatanya dibanding pesaing?',
          'Cari “winning zone” — titik di mana kamu unggul <b>dan</b> pelanggan peduli, sementara pesaing lemah.'
        ]},
        {t:'diagram', kind:'quad', judul:'Menemukan winning zone', nodes:[
          {t:'Yang kamu kuat', d:'Kelebihan yang benar-benar kamu punya'},
          {t:'Yang pelanggan peduli', d:'Hal yang mereka nilai penting'},
          {t:'Yang pesaing lemah', d:'Celah yang belum digarap pesaing'},
          {t:'Winning zone', d:'Irisan ketiganya = USP-mu'}
        ], cap:'USP paling kuat berada di irisan “kamu kuat × pelanggan peduli × pesaing lemah”.'},
        {t:'callout', k:'warn', judul:'Hindari', x:'USP yang umum (“kualitas bagus, harga murah”) bukan pembeda — hampir semua klaim begitu. USP harus <b>spesifik</b> dan sulit ditiru.'},
        {t:'quiz', q:'Ciri USP yang baik…', opts:['Umum & menyenangkan semua orang','Unik, spesifik, & sulit ditiru','Sama seperti pesaing tapi lebih murah'], a:1, exp:'USP harus unik & spesifik agar jadi alasan nyata memilihmu.'}
      ]
    },
    { id:'m4l2', judul:'USP vs Value Proposition & Maslow', durasi:'10 mnt',
      ringkas:'Beda “keunikan jual” dengan “janji nilai”, dan menautkannya ke kebutuhan manusia.',
      blocks:[
        {t:'table', head:['','USP','Value Proposition'], rows:[
          ['Fokus','Faktor <b>keunikan</b> yang membedakan','<b>Janji nilai</b> total yang diterima pelanggan'],
          ['Sudut','“Kenapa beda dari pesaing”','“Manfaat apa yang kamu dapat”'],
          ['Contoh','Pengiriman 1 jam sampai','Belanja praktis, hemat waktu, tanpa antre']
        ], cap:'USP menajamkan pembeda; value proposition merangkum keseluruhan nilai.'},
        {t:'h', x:'Tautkan ke kebutuhan (Maslow)'},
        {t:'p', x:'Semakin dalam produkmu menjawab kebutuhan manusia, semakin kuat nilainya. Hierarki Maslow membantu memetakan “kebutuhan apa yang kamu penuhi”.'},
        {t:'diagram', kind:'pyramid', judul:'Hierarki kebutuhan (Maslow)', nodes:[
          {t:'Fisiologis', d:'Makan, minum, tempat tinggal'},
          {t:'Rasa aman', d:'Keamanan, kesehatan, kepastian'},
          {t:'Sosial', d:'Pertemanan, rasa memiliki'},
          {t:'Penghargaan', d:'Status, pengakuan, gengsi'},
          {t:'Aktualisasi', d:'Pengembangan diri, makna'}
        ], cap:'Produk yang menyentuh kebutuhan lebih dari satu tingkat biasanya lebih bernilai.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Tulis 1 kalimat USP + 1 kalimat value proposition produkmu, lalu tandai tingkat kebutuhan Maslow yang kamu penuhi.'}
      ]
    }
  ]
},

/* ============ CHAPTER 5 — BRANDING, SALES & MARKETING ============ */
{
  id:'m5', judul:'Branding, Sales & Marketing', ikon:'i-store', label:'Chapter 5',
  ringkas:'Perkenalkan & jual produk dengan efektif — dari STP, konten viral, sampai funnel.',
  lessons:[
    { id:'m5l1', judul:'Branding vs Marketing vs Sales & STP', durasi:'12 mnt',
      ringkas:'Bedakan tiga konsep inti & petakan pelanggan dengan STP.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'callout', k:'warn', judul:'Kenapa penting?', x:'Produk bagus tanpa pemasaran tetap sepi. Sebagian bisnis gagal karena pemasaran yang lemah — kemampuan menjual adalah keterampilan wajib founder.'},
        {t:'table', head:['Konsep','Definisi','Fokus'], rows:[
          ['Branding','Membangun citra & identitas merek','Persepsi, nilai, pengalaman merek'],
          ['Marketing','Mengenalkan produk ke pasar','Kebutuhan konsumen, strategi promosi'],
          ['Sales','Mengubah calon jadi pembeli','Penjualan, negosiasi, kepuasan']
        ]},
        {t:'h', x:'STP — Segmenting, Targeting, Positioning'},
        {t:'diagram', kind:'flow', judul:'Alur STP', nodes:[
          {t:'Segmenting', d:'Bagi pelanggan jadi kelompok (demografi, psikografi, geografi, perilaku)'},
          {t:'Targeting', d:'Pilih segmen paling menarik (ukuran, pertumbuhan, profit, kecocokan)'},
          {t:'Positioning', d:'Tanam citra unik di benak pelanggan'}
        ], cap:'Tipe positioning: berbasis layanan, kenyamanan, harga, atau kualitas. Visualkan dengan perceptual map.'},
        {t:'quiz', q:'Memilih segmen paling potensial untuk dilayani = tahap…', opts:['Segmenting','Targeting','Positioning'], a:1, exp:'Targeting = memilih segmen; Positioning = menanam citra.'}
      ]
    },
    { id:'m5l2', judul:'Strategi & kanal pemasaran', durasi:'12 mnt',
      ringkas:'Outbound vs inbound, ATL/BTL/TTL, dan pilihan kanal.',
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
          '<b>OOH/DOOH</b> — iklan luar ruang (baliho / layar digital) di lokasi ramai.'
        ]},
        {t:'h', x:'Kanal pemasaran'},
        {t:'table', head:['Kanal','Contoh'], rows:[
          ['Direct','Komunitas, affiliate, display ads, email marketing'],
          ['Indirect','Word of mouth, community building, event, speaking'],
          ['Gabungan','Marketing online (e-commerce, sosmed), advertisement']
        ], cap:'UGC (konten dari pengguna) & KOL (influencer) memperkuat kepercayaan. Pilih KOL berdasar tujuan, audiens, kredibilitas, konten, budget, & metrik.'},
        {t:'callout', k:'tip', judul:'Winning strategy penjualan', x:'Formula 10/30/60: fokuskan 60% upaya ke pelanggan yang sudah ada, 30% ke yang cocok target, 10% ke pasar umum — mempertahankan lebih murah daripada mencari baru.'}
      ]
    },
    { id:'m5l3', judul:'Konten viral (STEPPS) & funnel (AIDA)', durasi:'13 mnt',
      ringkas:'Rumus konten menyebar & memandu pelanggan sampai membeli.',
      blocks:[
        {t:'h', x:'STEPPS Framework (Jonah Berger) — kenapa konten menyebar'},
        {t:'list', items:[
          '<b>Social Currency</b> — konten yang membuat pembagi terlihat “keren”/update tren.',
          '<b>Triggers</b> — pemicu di lingkungan yang mengingatkan orang pada produkmu.',
          '<b>Emotions</b> — emosi kuat (kagum, gembira) mendorong berbagi.',
          '<b>Public</b> — mudah dilihat & ditiru publik; hindari hal sensitif.',
          '<b>Practical Value</b> — informatif & berguna.',
          '<b>Stories</b> — dibungkus cerita agar mudah diserap & diingat.'
        ]},
        {t:'h', x:'Marketing Funnel & AIDA'},
        {t:'diagram', kind:'funnel', judul:'Perjalanan pelanggan', nodes:[
          {t:'Awareness', d:'Mengenal produkmu'},
          {t:'Consideration', d:'Mencari info & membandingkan'},
          {t:'Conversion', d:'Memutuskan membeli'},
          {t:'Loyalty', d:'Beli berulang'},
          {t:'Advocacy', d:'Merekomendasikan ke orang lain'}
        ], cap:'AIDA (Attention → Interest → Desire → Action) adalah versi ringkas untuk merancang pesan tiap tahap.'},
        {t:'h', x:'7P Marketing Mix (winning strategy)'},
        {t:'list', items:[
          '<b>Product</b> · <b>Price</b> · <b>Place</b> · <b>Promotion</b> — bauran klasik.',
          '<b>People</b> — orang yang menjalankan & melayani.',
          '<b>Process</b> — alur dari pesanan sampai pengiriman.',
          '<b>Physical Evidence</b> — bukti fisik/visual yang memengaruhi persepsi.'
        ]},
        {t:'callout', k:'key', judul:'Tindakan', x:'Rancang 1 ide konten memakai minimal 3 elemen STEPPS, dan petakan pesanmu ke tahap AIDA.'}
      ]
    }
  ]
},

/* ============ CHAPTER 6 — OPERASIONAL LEAN ============ */
{
  id:'m6', judul:'Operasional Lean', ikon:'i-layers', label:'Chapter 6',
  ringkas:'Jalankan bisnis rapi & efisien — proses, organisasi, keuangan, legal & pajak.',
  lessons:[
    { id:'m6l1', judul:'Business Process Mapping & flowchart', durasi:'11 mnt',
      ringkas:'Memetakan aktivitas bisnis agar efisien & bisa diperbaiki.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'p', x:'<b>Business Process Mapping</b> memvisualkan aktivitas bisnis: apa, siapa, kapan, bagaimana. Terbagi <b>Core Function</b> (langsung menghasilkan produk) & <b>Supporting Function</b> (mendukung: standarisasi, kualitas, komunikasi, pelatihan).'},
        {t:'diagram', kind:'flow', judul:'4 tahap sebuah proses', nodes:[
          {t:'Input', d:'Data, bahan, SDM, alat, kebijakan'},
          {t:'Process', d:'Aktivitas mengubah input jadi output'},
          {t:'Output', d:'Produk/jasa/informasi akhir'},
          {t:'Feedback', d:'Tanggapan untuk perbaikan'}
        ], cap:'Flowchart memakai simbol: kotak = aktivitas, oval = mulai/selesai, segitiga/wajik = keputusan.'},
        {t:'h', x:'5 fungsi operasional dasar'},
        {t:'list', items:[
          '<b>Planning</b> — rancang strategi & sasaran.',
          '<b>Organizing</b> — bagi tugas & sumber daya.',
          '<b>Staffing</b> — rekrut & kembangkan tim.',
          '<b>Leading</b> — arahkan & motivasi.',
          '<b>Controlling</b> — pantau & evaluasi terhadap KPI.'
        ]},
        {t:'quiz', q:'“Tanggapan untuk perbaikan proses” disebut…', opts:['Input','Output','Feedback'], a:2, exp:'Feedback menutup siklus agar proses terus membaik.'}
      ]
    },
    { id:'m6l2', judul:'Organisasi & SDM dasar', durasi:'9 mnt',
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
        {t:'h', x:'Basic Human Resources'},
        {t:'p', x:'Di UMKM umumnya <i>small</i> (1–5 orang) & <i>medium</i> (5–20 orang). <b>Kapan merekrut?</b> saat tim kelebihan beban, permintaan naik, keuangan sulit dikelola, atau bisnis tumbuh cepat.'},
        {t:'list', items:[
          '<b>Tentukan gaji</b> lewat riset rata-rata industri, tanggung jawab, & kemampuan bayar.',
          '<b>Rekrut</b> dengan job description jelas, sumber terpercaya, seleksi (wawancara/tes).',
          '<b>Pendekatan proaktif</b> (preventif, jangka panjang) vs <b>reaktif</b> (menangani masalah yang muncul).'
        ]},
        {t:'callout', k:'tip', judul:'Strategic Operating Framework', x:'Selaraskan strategi, tujuan, nilai, struktur, budaya, & SDM agar semua bergerak ke arah yang sama.'}
      ]
    },
    { id:'m6l3', judul:'Keuangan, legal & pajak', durasi:'12 mnt',
      ringkas:'Dasar akuntansi, badan usaha, dan kewajiban pajak.',
      blocks:[
        {t:'h', x:'Cash Basis vs Accrual'},
        {t:'table', head:['Metode','Kapan dicatat','Untuk siapa'], rows:[
          ['Cash basis','Saat uang diterima/dibayar','Disarankan untuk bisnis kecil — sederhana, jelas cash in/out'],
          ['Accrual','Saat transaksi terjadi (walau belum dibayar)','Bisnis lebih besar/kompleks']
        ]},
        {t:'h', x:'Unit dasar akuntansi'},
        {t:'list', items:[
          '<b>Aktiva</b> (aset) · <b>Kewajiban</b> (hutang) · <b>Ekuitas</b> (aset − kewajiban).',
          '<b>Pendapatan</b> · <b>Biaya</b> · <b>COGS</b> (harga pokok penjualan) · <b>Laba/Rugi</b> · <b>Arus Kas</b>.'
        ]},
        {t:'h', x:'Badan usaha'},
        {t:'table', head:['Bentuk','Catatan'], rows:[
          ['Perusahaan Dagang','Keuangan pribadi & bisnis bercampur; minim perlindungan hukum'],
          ['CV','Masih menyatu dengan pribadi, tapi memisahkan keuangan lebih baik'],
          ['Firma','Perjanjian antar-partner'],
          ['PT','Memisahkan tegas keuangan & entitas; pemegang saham terlindungi']
        ], cap:'Lengkapi: izin usaha, akta pendirian, NPWP, NIB, dan dokumen legal lain (mis. sertifikat halal untuk F&B).'},
        {t:'p', x:'<b>Jenis pajak</b> yang umum: pajak penghasilan, pajak penjualan, pajak properti, pajak ketenagakerjaan, cukai, serta impor/ekspor.'},
        {t:'callout', k:'key', judul:'Tindakan', x:'Buat flowchart 1 proses inti bisnismu (mis. dari pesanan sampai kirim) & pilih bentuk badan usaha yang paling cocok.'}
      ]
    }
  ]
},

/* ============ CHAPTER 7 — SKILL FONDASI & METRIK PERTUMBUHAN ============ */
{
  id:'m7', judul:'Skill Fondasi & Metrik Pertumbuhan', ikon:'i-chart', label:'Chapter 7',
  ringkas:'Ukur bisnis dengan metrik yang tepat lalu besarkan secara terukur.',
  lessons:[
    { id:'m7l1', judul:'Metrik kunci: CAC, CLTV, churn & retensi', durasi:'12 mnt',
      ringkas:'Angka-angka yang menentukan sehat-tidaknya pertumbuhan.',
      blocks:[
        {t:'video', src:'', poster:'', cap:'Rekaman sesi (menyusul).'},
        {t:'callout', k:'quote', judul:'', x:'“Life is change. Growth is optional.” Pertumbuhan tidak otomatis — ia dikelola lewat metrik yang tepat.'},
        {t:'h', x:'Metrik performa bisnis'},
        {t:'table', head:['Metrik','Arti'], rows:[
          ['CAC (Customer Acquisition Cost)','Biaya mendapatkan satu pelanggan baru'],
          ['CLTV (Customer Lifetime Value)','Total nilai yang diberikan satu pelanggan sepanjang “hidup”-nya'],
          ['Churn Rate','Persentase pelanggan yang berhenti dalam periode'],
          ['Retention Rate','Persentase pelanggan yang bertahan']
        ], cap:'Sehat bila CLTV jauh lebih besar dari CAC, dan churn rendah.'},
        {t:'callout', k:'tip', judul:'Retensi > akuisisi', x:'Mempertahankan pelanggan lama umumnya jauh lebih murah daripada mencari baru. Naikkan retensi sebelum menggenjot akuisisi.'},
        {t:'quiz', q:'Bisnis sehat idealnya…', opts:['CAC jauh lebih besar dari CLTV','CLTV jauh lebih besar dari CAC','CAC = CLTV, churn tinggi'], a:1, exp:'Nilai seumur hidup pelanggan (CLTV) harus melampaui biaya mendapatkannya (CAC).'}
      ]
    },
    { id:'m7l2', judul:'North Star Metric & irama evaluasi', durasi:'11 mnt',
      ringkas:'Satu metrik utama + kebiasaan meninjau harian/mingguan/bulanan.',
      blocks:[
        {t:'lead', x:'<b>North Star Metric</b> = satu angka utama yang paling mencerminkan nilai yang kamu berikan ke pelanggan. Ia menyatukan arah seluruh tim.'},
        {t:'p', x:'Contoh sederhana: untuk toko online, bisa “jumlah pesanan selesai per minggu”; untuk aplikasi, “pengguna aktif yang kembali”. Pilih yang benar-benar menandakan pelanggan mendapat manfaat — bukan sekadar angka besar tanpa makna.'},
        {t:'h', x:'Irama evaluasi metrik'},
        {t:'table', head:['Rentang','Contoh yang dipantau'], rows:[
          ['Harian','Klik, chat masuk, penjualan harian'],
          ['Mingguan','Retensi, CAC rata-rata, engagement'],
          ['Bulanan','Pertumbuhan pendapatan, churn, CLTV']
        ], cap:'Buat KPI yang bisa dieksekusi; tinjau berkala & sesuaikan strategi.'},
        {t:'diagram', kind:'cycle', judul:'Siklus bertumbuh', nodes:[
          {t:'Tetapkan North Star', d:'Satu metrik utama'},
          {t:'Buat KPI', d:'Turunan yang bisa dikerjakan'},
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
        {t:'p', x:'Kelas ini hanya pintu masuk. Perdalam tiap bidang lewat bacaan berikut — dikelompokkan per tema.'},
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
        {t:'callout', k:'tip', judul:'Cara memakai', x:'Pilih satu buku sesuai bab yang paling ingin kamu perkuat sekarang — jangan baca semua sekaligus.'}
      ]
    }
  ]
}

];

if (typeof module !== 'undefined' && module.exports) { module.exports = { KELAS_META:KELAS_META, KELAS_DATA:KELAS_DATA }; }
