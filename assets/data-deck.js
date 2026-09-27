/* ============================================================
   Bekal — SCALE-UP BLUEPRINT & PITCH DECK (generator isian)
   Template akhir untuk "Scale Up Bisnis".
   Gabungan Individual Assignment 1 (Pitch Deck) & 2 (Segmentasi/Ekspansi).
   ============================================================ */
(function () {
  var META = {
    judul: 'Scale-Up Blueprint & Pitch Deck',
    tag: 'BEKAL — SCALE UP',
    sub: 'Rangkum seluruh rencana bisnismu jadi pitch deck yang siap dipresentasikan.',
    ls: 'bekal_blueprint_scaleup_v1',
    kredit: 'Kerangka diadaptasi dari program Sevenpreneur (7preneur).',
    back: { href: 'scaleup.html', label: 'Scale Up Bisnis' }
  };

  var DATA = [
    /* ---------- COVER ---------- */
    { id: 'd0', no: 'Mulai', judul: 'Cover & Tagline', ikon: 'i-flag', cover: true,
      intro: 'Pitch deck adalah presentasi singkat yang merangkum seluruh rencana bisnismu. Slide cover hanya memuat nama & tagline.',
      sections: [ { fields: [
        { t: 'text', k: '_biz', label: 'Nama bisnis', ph: 'Nama bisnismu' },
        { t: 'text', k: '_owner', label: 'Namamu (founder)', ph: 'Nama lengkap' },
        { t: 'text', k: '_shortdesc', label: 'Deskripsi 5–7 kata tentang bisnis', ph: 'mis. Katering sehat harian untuk pekerja kantoran' },
        { t: 'text', k: '_tagline', label: 'Tagline / jargon (5–7 kata)', ph: 'Kalimat yang menggambarkan bisnismu' }
      ] } ] },

    /* ---------- VISI MISI ---------- */
    { id: 'd1', no: 'Bagian 1', judul: 'Visi & Misi', ikon: 'i-target',
      intro: '<em>(Opsional)</em> Arah jangka panjang & langkah untuk mencapainya.',
      sections: [ { fields: [
        { t: 'area', k: 'visi', label: 'Visi', rows: 2, hint: 'Cita-cita besar bisnismu.' },
        { t: 'area', k: 'misi', label: 'Misi', rows: 3, hint: 'Langkah nyata untuk mewujudkan visi.' }
      ] } ] },

    /* ---------- PROBLEM & SOLUTION ---------- */
    { id: 'd2', no: 'Bagian 2', judul: 'Problem & Solution', ikon: 'i-bolt',
      intro: 'Inti dari peluang bisnismu.',
      sections: [
        { judul: 'Problem (Peluang Bisnis)', desc: 'Masalah yang kamu temukan & belum banyak diselesaikan pihak lain. Buat 3–4 pernyataan singkat yang membuktikan kamu paham kondisi pasar.',
          fields: [ { t: 'table', k: 'problem', addable: true, rows: 3, cols: ['No', 'Pernyataan masalah / kondisi pasar'], rowLabels: null, big: true } ] },
        { judul: 'Solution', desc: 'Jelaskan produk/layananmu & bagaimana ia mengatasi masalah di atas.',
          fields: [ { t: 'area', k: 'solution', label: 'Solusi yang kamu tawarkan', rows: 4 } ] }
      ] },

    /* ---------- VALIDATION & MARKET SIZE ---------- */
    { id: 'd3', no: 'Bagian 3', judul: 'Validasi & Ukuran Pasar', ikon: 'i-search',
      intro: 'Buktikan bahwa ada permintaan untuk produkmu.',
      sections: [
        { judul: 'Market Validation', desc: 'Apakah ada kebutuhan untuk produkmu di target market? Bisa pakai data kompetitor/produk serupa.',
          fields: [
            { t: 'area', k: 'validation', label: 'Bukti validasi pasar', rows: 3, hint: 'mis. kompetitor sejenis punya 5.000 pelanggan/hari, 1.400 review, 10 cabang.' },
            { t: 'table', k: 'valproof', label: 'Angka validasi (opsional)', addable: true, rows: 2, cols: ['Metrik', 'Angka'] }
          ] },
        { judul: 'Market Size — TAM / SAM / SOM', desc: '<b>TAM</b> = total pasar. <b>SAM</b> = pasar yang bisa dijangkau produkmu. <b>SOM</b> = pasar realistis yang bisa membeli (dari sisi ekonomi, lokasi, pemasaran).',
          fields: [ { t: 'table', k: 'market', rowLabels: ['TAM (total addressable market)', 'SAM (serviceable available market)', 'SOM (serviceable obtainable market)'], cols: ['Level', 'Total populasi', 'Segmenmu / nilai'] } ] }
      ] },

    /* ---------- PRODUCTS ---------- */
    { id: 'd4', no: 'Bagian 4', judul: 'The Products', ikon: 'i-layers',
      intro: 'Elaborasi produk/layanan yang kamu kembangkan.',
      sections: [
        { judul: 'Deskripsi & Manfaat', fields: [
          { t: 'area', k: 'prod_desc', label: 'Penjelasan singkat produk (poin-poin)', rows: 3 },
          { t: 'table', k: 'prod_feat', label: 'Fitur / Manfaat', addable: true, rows: 3, cols: ['Fitur', 'Manfaat untuk pelanggan'] }
        ] },
        { judul: '3 Level of Product', desc: '<b>Core</b> = manfaat utama. <b>Actual</b> = wujud/kualitas. <b>Augmented</b> = paket total + nilai tambah.',
          fields: [ { t: 'table', k: 'prod_lvl', big: true, rowLabels: ['Core Product', 'Actual Product', 'Augmented Product'], cols: ['Level', 'Penjelasan'] } ] }
      ] },

    /* ---------- BUSINESS MODEL ---------- */
    { id: 'd5', no: 'Bagian 5', judul: 'Business Model', ikon: 'i-money',
      intro: 'Bagaimana kamu menghasilkan pendapatan (income). Fokus pada model & potensi gross profit — tak perlu detail tiap rencana.',
      sections: [ { fields: [
        { t: 'choice', k: 'bm_type', label: 'Tipe model bisnis', opts: ['B2C (ke pelanggan)', 'B2B (ke bisnis)', 'B2B2C', 'B2A (ke pemerintah)', 'Gabungan'] },
        { t: 'area', k: 'bm_desc', label: 'Cara menghasilkan pendapatan', rows: 3, hint: 'mis. ambil komisi 10% dari klien; atau tarif rata-rata Rp50.000/pelanggan + loyalty point.' },
        { t: 'area', k: 'bm_profit', label: 'Potensi gross profit (laba kotor)', rows: 2 }
      ] } ] },

    /* ---------- KOMPETITOR & KEUNGGULAN ---------- */
    { id: 'd6', no: 'Bagian 6', judul: 'Kompetitor & Keunggulan', ikon: 'i-scan',
      intro: 'Petakan posisimu di antara pesaing.',
      sections: [
        { judul: 'Peta Kompetitor', desc: 'Bandingkan pada 2 indikator (boleh diubah sesuai lini usahamu, mis. harga & kualitas layanan).',
          fields: [ { t: 'table', k: 'comp', addable: true, rows: 4, cols: ['Kompetitor', 'Indikator A (mis. harga)', 'Indikator B (mis. kualitas)'] } ] },
        { judul: 'Grafik Posisi (Positioning Map)', desc: 'Tentukan 2 sumbu, lalu posisikan bisnismu vs kompetitor.',
          fields: [
            { t: 'text', k: 'pos_x', label: 'Sumbu X' },
            { t: 'text', k: 'pos_y', label: 'Sumbu Y' },
            { t: 'table', k: 'pos_map', addable: true, rows: 3, cols: ['Bisnis', 'Nilai X', 'Nilai Y'] }
          ] },
        { judul: 'Competitive Advantage', desc: 'Keunikan yang jadi leverage-mu — fokus pada layanan/jasa yang kompetitor tidak punya.',
          fields: [ { t: 'area', k: 'advantage', label: 'Keunggulan kompetitifmu', rows: 3 } ] }
      ] },

    /* ---------- SEGMENTASI & PERSONA (Assignment 2) ---------- */
    { id: 'd7', no: 'Bagian 7', judul: 'Segmentasi & Persona', ikon: 'i-users',
      intro: 'Kenali pelangganmu lebih dalam (Individual Assignment 2).',
      sections: [
        { judul: 'MASDA Analysis', desc: '<b>M</b>easurable, <b>A</b>ccessible, <b>S</b>ubstantial, <b>A</b>ctionable, <b>D</b>ifferentiable — setelah punya 2–3 segmen, pilih yang paling menjanjikan.',
          fields: [
            { t: 'table', k: 'masda', rowLabels: ['Measurable (terukur, punya daya beli)', 'Accessible (mudah dijangkau)', 'Substantial (pasar cukup besar)', 'Actionable (bisa dieksekusi)', 'Differentiable (bisa dibedakan)'], cols: ['Requirement', 'Segment 1', 'Segment 2'] },
            { t: 'area', k: 'masda_conc', label: 'Kesimpulan: segmen terpilih', rows: 2 }
          ] },
        { judul: 'Segmentasi Tepat', desc: 'Bagi berdasar Demografi, Geografis, Psikografis, dan Sikap (Behavioural).',
          fields: [ { t: 'table', k: 'seg', big: true, rowLabels: ['Demographic (umur, gender, pekerjaan, pendapatan)', 'Geographic (kota, negara, komplek)', 'Psychographic (lifestyle, personality, interest, kelas sosial)', 'Behavioural (nongkrong di mana, brand loyalty, spending habit)'], cols: ['Dimensi', 'Segmen terpilih'] } ] },
        { judul: 'User Persona', desc: 'Gambaran satu pelanggan ideal.',
          fields: [
            { t: 'text', k: 'persona_name', label: 'Nama persona', ph: 'mis. Mas Bambang' },
            { t: 'text', k: 'persona_bio', label: 'Umur · Asal · Pekerjaan', ph: 'mis. 28 th · Jakarta · Freelance' },
            { t: 'area', k: 'persona_about', label: 'About (gambaran singkat)', rows: 2 },
            { t: 'area', k: 'persona_motiv', label: 'Motivations (motivasi)', rows: 2 },
            { t: 'area', k: 'persona_behav', label: 'Behaviours (perilaku)', rows: 2 }
          ] },
        { judul: 'Customer Pain Points', desc: 'Masalah spesifik yang dialami pelanggan. Identifikasi lewat feedback, survey, & observasi.',
          fields: [ { t: 'area', k: 'painpoints', label: 'Pain points pelangganmu', rows: 3 } ] }
      ] },

    /* ---------- GO-TO-MARKET & TIM ---------- */
    { id: 'd8', no: 'Bagian 8', judul: 'Go-to-Market & Tim', ikon: 'i-mic',
      intro: 'Cara masuk pasar & orang di balik bisnis.',
      sections: [
        { judul: 'Strategi Adopsi / Go-to-Market', desc: 'Media/channel marketing yang akan kamu pakai, langkah demi langkah. Bisa memuat ide marketing & partnership.',
          fields: [ { t: 'area', k: 'gtm', label: 'Strategi go-to-market', rows: 4 } ] },
        { judul: 'Struktur Tim', desc: 'Sertakan bio singkat tiap orang, fokus pada pengalaman relevan.',
          fields: [ { t: 'table', k: 'team', addable: true, rows: 3, cols: ['Nama', 'Peran', 'Bio singkat / pengalaman relevan'] } ] },
        { judul: 'Testimonials & Publikasi', desc: '<em>(Opsional)</em> Kalau sudah ada, masukkan kutipan pelanggan atau pemberitaan.',
          fields: [
            { t: 'area', k: 'testi', label: 'Testimoni pelanggan', rows: 2 },
            { t: 'area', k: 'press', label: 'Publikasi berita / media', rows: 2 }
          ] }
      ] },

    /* ---------- FINANCIAL ---------- */
    { id: 'd9', no: 'Bagian 9', judul: 'Financial', ikon: 'i-chart',
      intro: 'Proyeksi keuangan bisnismu 3–5 tahun ke depan (silakan modifikasi).',
      sections: [
        { judul: 'Proyeksi Keuangan', fields: [
          { t: 'table', k: 'fin', rowLabels: ['Laba Kotor', 'Harga Pokok Penjualan (COGS)', 'Laba Bersih', 'Profit Margin'], cols: ['Aktivitas', 'Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4', 'Tahun 5'] },
          { t: 'area', k: 'fin_note', label: 'Catatan / target ideal finansial', rows: 3, hint: 'mis. ingin laba kotor Rp2 M/bulan; mengincar suntikan dana investor Rp1 M di tahun ke-2.' }
        ] }
      ] },

    /* ---------- EKSPANSI ---------- */
    { id: 'd10', no: 'Bagian 10', judul: 'Rencana Ekspansi', ikon: 'i-trend',
      intro: 'Berdasar pain points & pemetaan bisnis, tentukan langkah ekspansimu.',
      sections: [ { fields: [
        { t: 'choice', k: 'exp_type', label: 'Arah ekspansi', opts: ['Horizontal (produk/pasar baru sejenis)', 'Vertikal (kuasai rantai pasok hulu/hilir)', 'Kombinasi'] },
        { t: 'area', k: 'exp_desc', label: 'Contoh & rencana ekspansi', rows: 4 }
      ] } ] },

    /* ---------- FONDASI OPSIONAL ---------- */
    { id: 'd11', no: 'Opsional', judul: 'Fondasi Diri (SWOT/TOWS)', ikon: 'i-shield',
      intro: '<em>Tugas opsional</em> — sangat disarankan bila belum punya bisnis, untuk memperkuat fondasi.',
      sections: [
        { judul: 'SWOT', desc: '<b>S</b>trength & <b>W</b>eakness (internal), <b>O</b>pportunity & <b>T</b>hreat (eksternal).',
          fields: [ { t: 'table', k: 'swot', big: true, rowLabels: ['Strength (kekuatan)', 'Weakness (kelemahan)', 'Opportunity (peluang)', 'Threat (ancaman)'], cols: ['Aspek', 'Uraian'] } ] },
        { judul: 'TOWS (strategi dari SWOT)', desc: 'Ubah analisis SWOT jadi tindakan.',
          fields: [ { t: 'table', k: 'tows', big: true, rowLabels: ['SO — pakai kekuatan untuk raih peluang', 'WO — kurangi kelemahan lewat peluang', 'ST — pakai kekuatan untuk hadapi ancaman', 'WT — hindari ancaman dengan kurangi kelemahan'], cols: ['Strategi', 'Rencana aksi'] } ] },
        { judul: 'Personal Development Plan (SMART)', desc: 'Apa yang perlu kamu kembangkan untuk menjalankan bisnis ini?',
          fields: [ { t: 'table', k: 'pdp', big: true, rowLabels: ['Specific (spesifik)', 'Measurable (terukur)', 'Actionable (ada tindakan)', 'Realistic (realistis)', 'Time-bound (jangka waktu)'], cols: ['SMART', 'Rencana'] } ] },
        { judul: 'Short & Long-term Goals', fields: [
          { t: 'area', k: 'goal_short', label: 'Short-term goals (minggu–bulan)', rows: 2 },
          { t: 'area', k: 'goal_long', label: 'Long-term goals (tahunan)', rows: 2 }
        ] },
        { judul: 'Selesai!', desc: 'Klik <b>Simpan PDF</b> untuk mengunduh pitch deck-mu. Selamat, semoga membantu! 🚀', fields: [] }
      ] }
  ];

  window.BP_META = META;
  window.BP_DATA = DATA;
  if (typeof module !== 'undefined' && module.exports) module.exports = { BP_META: META, BP_DATA: DATA };
})();
