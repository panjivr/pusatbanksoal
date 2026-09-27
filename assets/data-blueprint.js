/* ============================================================
   Bekal — THE BUSINESS BLUEPRINT (generator isian)
   Template akhir untuk "Kelas Bisnis dari Nol".
   Kerangka 7 chapter Framework Sevenpreneur (7preneur).
   ============================================================ */
(function () {
  var META = {
    judul: 'The Business Blueprint',
    tag: 'BEKAL BLUEPRINT PROGRAM',
    sub: 'Rancang bisnis pertamamu secara holistik — dari fondasi diri sampai rencana peluncuran.',
    ls: 'bekal_blueprint_binol_v1',
    kredit: 'Kerangka diadaptasi dari Framework Sevenpreneur (7preneur).',
    back: { href: 'kelas.html', label: 'Kelas Bisnis dari Nol' }
  };

  var DATA = [
    /* ---------- COVER / IDENTITAS ---------- */
    { id: 'c0', no: 'Mulai', judul: 'Identitas Bisnis', ikon: 'i-flag', cover: true,
      intro: '“Entrepreneurs are made, not born.” Isi identitas bisnismu dulu — nama ini akan muncul di seluruh dokumen & di cover PDF akhir.',
      sections: [
        { fields: [
          { t: 'text', k: '_biz', label: 'Nama bisnis', ph: 'mis. Seblak Teh Magda', eg: 'Seblak Teh Magda' },
          { t: 'text', k: '_owner', label: 'Namamu (founder)', ph: 'Nama lengkap' },
          { t: 'text', k: '_tagline', label: 'Tagline / jargon (5–7 kata)', hint: 'Kalimat pendek yang menggambarkan bisnismu.', ph: 'mis. Pedas nagih, bikin balik lagi' },
          { t: 'area', k: '_desc', label: 'Deskripsi singkat bisnis', rows: 2, ph: 'Satu–dua kalimat: kamu jual apa, untuk siapa.' }
        ] }
      ] },

    /* ---------- CHAPTER 1 — FOUNDATION ---------- */
    { id: 'c1', no: 'Chapter 1', judul: 'Foundation', ikon: 'i-shield',
      intro: 'Developing the business core: <b>YOU</b>. Sebagus apa pun ide, semua percuma kalau the man behind tidak punya grit. Kenali dirimu dulu.',
      sections: [
        { judul: 'Personal SWOT', desc: 'Analisis diri sebagai (calon) entrepreneur. <b>Internal</b> = dari dalam dirimu; <b>Eksternal</b> = dari lingkungan sekitar.',
          fields: [
            { t: 'table', k: 'swot_self', big: true, rowLabels: ['Strength (kelebihan internal)', 'Weakness (kekurangan internal)', 'Opportunity (peluang eksternal)', 'Threat (ancaman eksternal)'], cols: ['Aspek', 'Uraian'] }
          ] },
        { judul: 'Short-term Goals (SMART)', desc: 'Target jangka pendek (mingguan–bulanan). <b>SMART</b> = Specific, Measurable, Achievable, Relevant, Time-bound.',
          fields: [ { t: 'table', k: 'goals_short', addable: true, rows: 2, cols: ['Goal', 'Action Plan (SMART)'], eg: 'Kumpulkan modal Rp5 jt dalam 1 bulan lewat pre-order.' } ] },
        { judul: 'Long-term Goals (SMART)', desc: 'Target jangka panjang (tahunan).',
          fields: [ { t: 'table', k: 'goals_long', addable: true, rows: 2, cols: ['Goal', 'Action Plan (SMART)'] } ] },
        { judul: '3 Level of Product & Services', desc: '<b>Core</b> = manfaat utama alasan orang beli. <b>Actual</b> = wujud/kualitas/desain produknya. <b>Augmented</b> = paket total + nilai tambah (garansi, loyalty, layanan).',
          fields: [
            { t: 'area', k: 'lvl_core', label: 'Core Product', rows: 2, eg: 'IKEA: menjual kebutuhan rumah tangga.' },
            { t: 'area', k: 'lvl_actual', label: 'Actual Product', rows: 2, eg: 'Meja lipat stainless, kursi goyang, lemari 3 pintu.' },
            { t: 'area', k: 'lvl_augmented', label: 'Augmented Product', rows: 2, eg: 'Bantuan rakit, experience belanja, meatballs, es krim.' }
          ] },
        { judul: 'Risk Management', desc: 'Tulis risiko yang mungkin terjadi & rencana mitigasinya, agar tidak kaget saat masalah datang.',
          fields: [ { t: 'table', k: 'risk', addable: true, rows: 3, cols: ['Risiko yang dihadapi', 'Rencana mitigasi'] } ] },
        { judul: 'External Preparation — Modal', desc: 'Rincikan sumber modal awalmu.',
          fields: [
            { t: 'table', k: 'modal', addable: true, rows: 3, cols: ['Sumber modal', 'Jumlah (Rp)', 'Detail / persetujuan'] },
            { t: 'text', k: 'modal_total', label: 'Total modal awal (Rp)' }
          ] }
      ] },

    /* ---------- CHAPTER 2 — IDEATION ---------- */
    { id: 'c2', no: 'Chapter 2', judul: 'Ideation', ikon: 'i-bolt',
      intro: 'Menemukan & menguji ide. Dua sumber ide populer: <b>Low Hanging Fruit</b> (manfaatkan yang sudah kamu punya) dan <b>Market Gap</b> (isi celah/masalah yang belum terselesaikan).',
      sections: [
        { judul: 'Finding the Idea', fields: [
          { t: 'area', k: 'idea_have', label: 'Apa yang kamu miliki saat ini (skill/aset/relasi)?', rows: 2 },
          { t: 'area', k: 'idea_problem', label: 'Masalah apa yang ada di sekitarmu?', rows: 2 },
          { t: 'area', k: 'idea_solution', label: 'Solusi apa yang diberikan idemu?', rows: 2 },
          { t: 'area', k: 'idea_innov', label: 'Inovasi apa yang bisa kamu ciptakan?', rows: 2 },
          { t: 'text', k: 'idea_pick', label: 'Ide bisnis yang kamu pilih' },
          { t: 'choice', k: 'idea_type', label: 'Ide ini termasuk kategori?', opts: ['Low Hanging Fruit', 'Market Gap Theory'] },
          { t: 'area', k: 'idea_reason', label: 'Alasan kategori itu & kenapa kamu memilihnya', rows: 3 }
        ] },
        { judul: 'SCAMPER', desc: 'Teknik memodifikasi ide: <b>S</b>ubstitute, <b>C</b>ombine, <b>A</b>dapt, <b>M</b>odify, <b>P</b>ut to other use, <b>E</b>liminate, <b>R</b>everse/Rearrange.',
          fields: [ { t: 'table', k: 'scamper', rowLabels: ['S — Substitute (ganti)', 'C — Combine (gabungkan)', 'A — Adapt (sesuaikan)', 'M — Modify (ubah)', 'P — Put to other use (fungsi lain)', 'E — Eliminate (hilangkan)', 'R — Reverse/Rearrange (balik/atur ulang)'], cols: ['Elemen', 'Ide penerapan'], big: true } ] },
        { judul: 'Expected Outcome', desc: '<b>Monetization-centric</b> = fokus menghasilkan uang. <b>Solution-centric</b> = fokus menyelesaikan masalah. Bisa gabungan keduanya.',
          fields: [
            { t: 'choice', k: 'outcome', label: 'Expected outcome yang kamu pilih', opts: ['Monetization Centric', 'Solution Centric', 'Gabungan keduanya'] },
            { t: 'area', k: 'outcome_plus', label: 'Plus (kelebihan pilihan ini)', rows: 2 },
            { t: 'area', k: 'outcome_minus', label: 'Minus (kekurangan pilihan ini)', rows: 2 }
          ] },
        { judul: 'Idea Conviction', desc: 'Ukur keyakinanmu terhadap ide (1 = belum sama sekali, 5 = sudah mantap).',
          fields: [
            { t: 'scale', k: 'conv_riset', label: 'Sudah melakukan perencanaan & riset mendalam?', loLabel: 'Belum', hiLabel: 'Lengkap' },
            { t: 'area', k: 'conv_riset_x', label: 'Jelaskan apa yang sudah kamu lakukan', rows: 2 },
            { t: 'scale', k: 'conv_skala', label: 'Sudah mencoba ide dengan skala kecil?', loLabel: 'Belum', hiLabel: 'Sudah' },
            { t: 'area', k: 'conv_skala_x', label: 'Jelaskan', rows: 2 },
            { t: 'scale', k: 'conv_konsul', label: 'Sudah berkonsultasi dengan ahli/orang sekitar?', loLabel: 'Belum', hiLabel: 'Sudah' },
            { t: 'area', k: 'conv_konsul_x', label: 'Jelaskan', rows: 2 },
            { t: 'scale', k: 'conv_passion', label: 'Ide sudah sesuai nilai & passion hidupmu?', loLabel: 'Tidak', hiLabel: 'Sangat' },
            { t: 'area', k: 'conv_passion_x', label: 'Jelaskan alasanmu', rows: 2 },
            { t: 'choice', k: 'conv_final', label: 'Ide ini menyelesaikan masalah & bisa dimonetisasi?', opts: ['Menyelesaikan masalah & bisa dimonetisasi', 'Menyelesaikan masalah, tapi belum bisa dimonetisasi', 'Belum menyelesaikan masalah, tapi bisa dimonetisasi', 'Belum menyelesaikan masalah & belum bisa dimonetisasi'] }
          ] }
      ] },

    /* ---------- CHAPTER 3 — RESEARCH & VALIDATION ---------- */
    { id: 'c3', no: 'Chapter 3', judul: 'Research & Validation', ikon: 'i-search',
      intro: 'Ukur daya tarik pasar & validasi idemu dengan data.',
      sections: [
        { judul: 'Market Size — TAM / SAM / SOM', desc: '<b>TAM</b> = total seluruh pasar. <b>SAM</b> = porsi pasar yang bisa kamu layani. <b>SOM</b> = pasar realistis yang bisa kamu rebut.',
          fields: [
            { t: 'table', k: 'tam', label: 'TAM (Jumlah potensi pembeli × harga rata-rata)', rowLabels: ['Jumlah potensi user (A)', 'Harga rata-rata (B)', 'TAM = A × B'], cols: ['Komponen', 'Nilai'] },
            { t: 'table', k: 'sam', label: 'SAM (Target segmen dari TAM × harga rata-rata)', rowLabels: ['Target segmen (A)', 'Harga rata-rata (B)', 'SAM = A × B'], cols: ['Komponen', 'Nilai'] },
            { t: 'table', k: 'som', label: 'SOM (pangsa pasar yang realistis diraih)', rowLabels: ['Estimasi pangsa pasar target / (Market share × SAM)', 'SOM'], cols: ['Komponen', 'Nilai'] }
          ] },
        { judul: "Industry Rivalry — Porter's 5 Forces", desc: 'Peta tekanan persaingan di industrimu.',
          fields: [ { t: 'table', k: 'porter', big: true, rowLabels: ['1. Industry Competition (persaingan)', '2. Threat of New Entrants (pendatang baru)', '3. Threat of Substitution (produk pengganti)', '4. Bargaining Power of Supplier', '5. Bargaining Power of Buyer'], cols: ['Force', 'Analisis untuk bisnismu'] } ] },
        { judul: 'Customer Pain Points', desc: 'Masalah yang dirasakan calon pelangganmu — semakin dalam kamu paham, semakin tepat produkmu.',
          fields: [
            { t: 'area', k: 'pain_process', label: 'Process Pain Point', hint: 'Masalah dari sisi perjalanan mengakses produkmu (co: birokrasi rumit, ribet).', rows: 2 },
            { t: 'area', k: 'pain_support', label: 'Support Pain Point', hint: 'Masalah dari sisi dukungan/komunikasi (co: admin lambat balas).', rows: 2 },
            { t: 'area', k: 'pain_prod', label: 'Productivity Pain Point', hint: 'Masalah operasional/produktivitas (co: owner terlalu sibuk).', rows: 2 },
            { t: 'area', k: 'pain_fin', label: 'Financial Pain Point', hint: 'Masalah biaya (co: terlalu mahal).', rows: 2 }
          ] },
        { judul: 'Customer Gains', desc: 'Keuntungan yang diharapkan pelanggan.',
          fields: [
            { t: 'area', k: 'gain_req', label: 'Required Gains (yang dibutuhkan)', rows: 2 },
            { t: 'area', k: 'gain_exp', label: 'Expected Gains (yang diharapkan)', rows: 2 },
            { t: 'area', k: 'gain_des', label: 'Desired Gains (nilai tambah yang diinginkan)', rows: 2 },
            { t: 'area', k: 'gain_unexp', label: 'Unexpected Gains (di luar ekspektasi)', rows: 2 }
          ] },
        { judul: 'Competitive Landscape', desc: '<b>Direct</b> = produk sama persis. <b>Indirect</b> = beda produk tapi memenuhi kebutuhan yang sama.',
          fields: [
            { t: 'table', k: 'comp_direct', label: 'Direct Competitor', addable: true, rows: 3, cols: ['Kompetitor langsung', 'Channel (di mana mereka jual)'] },
            { t: 'table', k: 'comp_indirect', label: 'Indirect Competitor', addable: true, rows: 3, cols: ['Kompetitor tidak langsung', 'Channel'] }
          ] }
      ] },

    /* ---------- CHAPTER 4 — PRODUCT ---------- */
    { id: 'c4', no: 'Chapter 4', judul: 'Product', ikon: 'i-layers',
      intro: 'Merancang produk unggul & unique selling point-nya.',
      sections: [
        { judul: 'Unique Selling Point (USP)', desc: 'USP lahir dari irisan: apa yang <b>diinginkan konsumen</b> ∩ apa yang <b>brand-mu kuasai</b> ∩ yang <b>tidak dimiliki kompetitor</b>.',
          fields: [
            { t: 'area', k: 'usp_want', label: 'Apa yang diinginkan konsumen?', rows: 2 },
            { t: 'area', k: 'usp_brand', label: 'Apa yang brand-mu lakukan dengan baik?', rows: 2 },
            { t: 'area', k: 'usp_comp', label: 'Apa yang kompetitor lakukan dengan baik?', rows: 2 },
            { t: 'area', k: 'usp_final', label: 'USP-mu (kesimpulan)', rows: 2 },
            { t: 'choice', k: 'usp_type', label: 'Tipe USP produkmu', opts: ['Functional Value', 'Economic Value', 'Emotional Value'], hint: 'Functional = manfaat fungsi; Economic = hemat/untung; Emotional = perasaan/gengsi.' },
            { t: 'area', k: 'usp_eg', label: 'Berikan contohnya', rows: 2 }
          ] },
        { judul: "Maslow's Hierarchy of Needs", desc: 'Kebutuhan mana yang dipenuhi produkmu? (kosongkan bila tak relevan)',
          fields: [ { t: 'table', k: 'maslow', big: true, rowLabels: ['1. Physiological (dasar)', '2. Safety (rasa aman)', '3. Belongingness & Love', '4. Esteem (harga diri)', '5. Self-Actualization'], cols: ['Level', 'Bagaimana produkmu memenuhinya'] } ] },
        { judul: 'Supply Chain', desc: '<b>Continuous Flow</b> = permintaan stabil. <b>Fast Chain</b> = produk tren cepat berubah. <b>Flexible</b> = permintaan fluktuatif.',
          fields: [
            { t: 'choice', k: 'supply', label: 'Model supply chain yang kamu pakai', opts: ['Continuous Flow Model', 'Fast Chain Model', 'Flexible Model'] },
            { t: 'area', k: 'supply_why', label: 'Alasan memilih model itu', rows: 2 }
          ] },
        { judul: 'Unit Economics', desc: 'Hitung ekonomi per satu unit produk (silakan modifikasi).',
          fields: [ { t: 'table', k: 'unit_eco', rowLabels: ['Material Cost', 'Cost to Produce', 'Cost of Sales', 'Product Margin', 'Total'], cols: ['Komponen', 'Nilai (Rp)'] } ] },
        { judul: 'R&D — Titik Mulai Produk', desc: 'Dari mana kamu memulai produk?',
          fields: [
            { t: 'choice', k: 'rnd', label: 'Tipe barang untuk memulai', opts: ['Mulai dari 0 (buat sendiri)', 'Barang setengah jadi', 'Barang jadi'] },
            { t: 'area', k: 'rnd_why', label: 'Kenapa jenis itu cocok untuk bisnismu?', rows: 2 }
          ] }
      ] },

    /* ---------- CHAPTER 5 — SALES & MARKETING ---------- */
    { id: 'c5', no: 'Chapter 5', judul: 'Sales & Marketing', ikon: 'i-mic',
      intro: 'Branding, marketing, dan sales — dari mengenali pelanggan sampai funnel.',
      sections: [
        { judul: 'Branding, Marketing & Sales', fields: [
          { t: 'area', k: 'bms_brand', label: 'Apa yang membedakan merekmu dari pesaing?', rows: 2 },
          { t: 'area', k: 'bms_mkt', label: 'Bagaimana kamu mengomunikasikan nilai produk ke pasar?', rows: 2 },
          { t: 'area', k: 'bms_sales', label: 'Bagaimana meyakinkan calon konsumen untuk membeli?', rows: 2 }
        ] },
        { judul: 'Customer Segmentation', desc: 'Bagi calon pelanggan ke beberapa kelompok agar mudah dijangkau.',
          fields: [ { t: 'table', k: 'seg', rowLabels: ['Segment 1', 'Segment 2', 'Segment 3'], cols: ['Segmen', 'Usia', 'Perilaku', 'Geografi', 'Gender', 'Pendapatan', 'Edukasi'] } ] },
        { judul: 'MASDA Analysis', desc: 'Nilai tiap segmen: <b>M</b>easurable, <b>A</b>ccessible, <b>S</b>ubstantial, <b>A</b>ctionable, <b>D</b>ifferentiable. Isi ✔/✘ atau catatan. Pilih segmen yang memenuhi semua aspek.',
          fields: [
            { t: 'table', k: 'masda', rowLabels: ['Measurable (terukur)', 'Accessible (terjangkau)', 'Substantial (cukup besar)', 'Actionable (bisa dieksekusi)', 'Differentiable (bisa dibedakan)'], cols: ['Requirement', 'Segment 1', 'Segment 2', 'Segment 3'] },
            { t: 'area', k: 'masda_conc', label: 'Kesimpulan: segmen mana yang dipilih & kenapa', rows: 2 }
          ] },
        { judul: 'Customer Targeting', desc: 'Analisis untuk memastikan segmen target layak digarap.',
          fields: [ { t: 'table', k: 'target', big: true, rowLabels: ['1. Ukuran segmen', '2. Tingkat pertumbuhan', '3. Profit margin', '4. Kompetitor', '5. Channel distribusi', '6. Kesamaan tujuan', '7. Sumber daya tersedia', '8. Kemampuan/skill', '9. Kesesuaian strategi'], cols: ['Kriteria', 'Analisis'] } ] },
        { judul: 'Brand Positioning & STP', desc: 'Perceptual map: posisikan brand-mu vs kompetitor pada 2 sumbu (mis. X=kualitas, Y=harga). Lalu simpulkan STP.',
          fields: [
            { t: 'text', k: 'pos_x', label: 'Sumbu X (mis. kualitas)' },
            { t: 'text', k: 'pos_y', label: 'Sumbu Y (mis. harga)' },
            { t: 'area', k: 'pos_stmt', label: 'Pernyataan posisi', hint: 'Brand saya memiliki kualitas ___ dengan harga ___ sehingga cocok dengan segmen ___ karena ___.', rows: 2 },
            { t: 'table', k: 'stp', big: true, rowLabels: ['Segmentation (demografi/psikografi/perilaku)', 'Targeting', 'Positioning'], cols: ['STP', 'Kesimpulan bisnismu'] }
          ] },
        { judul: 'Product Communication', desc: 'Pilih media promosi yang akan kamu pakai.',
          fields: [ { t: 'check', k: 'promo', other: true, opts: ['Periklanan (pasang iklan)', 'Promosi penjualan (diskon)', 'Acara & pengalaman (event)', 'Pemasaran langsung (DM/telepon/email)', 'Word of mouth (testimoni)', 'Penjualan pribadi (tatap muka)'] } ] },
        { judul: 'Marketing Funnel', desc: 'Perjalanan pelanggan: dari kenal sampai jadi pendukung.',
          fields: [ { t: 'table', k: 'funnel', big: true, rowLabels: ['Awareness (kenal)', 'Consideration (pertimbangan)', 'Conversion (pembelian)', 'Loyalty (loyal)', 'Advocacy (merekomendasikan)'], cols: ['Tahap', 'Strategimu'] } ] }
      ] },

    /* ---------- CHAPTER 6 — BUSINESS OPERATIONS ---------- */
    { id: 'c6', no: 'Chapter 6', judul: 'Business Operations', ikon: 'i-cog',
      intro: 'Merapikan proses, struktur, dan cara mengukur kinerja.',
      sections: [
        { judul: 'Business Process Mapping', desc: 'Gambarkan alur input → proses → output bisnismu.',
          fields: [ { t: 'table', k: 'process', addable: true, rows: 3, cols: ['Input', 'Proses', 'Output'] } ] },
        { judul: 'Struktur Organisasi', desc: 'Fungsional (per fungsi), Divisional (per produk/wilayah), atau Matriks (proyek + fungsi).',
          fields: [ { t: 'area', k: 'org', label: 'Susunan tim & peran (tulis bebas)', rows: 4, hint: 'Contoh: CEO — kamu; Operasional — A; Marketing — B; Keuangan — C.' } ] },
        { judul: 'OKR (Objectives & Key Results)', desc: '<b>Objective</b> = tujuan besar kualitatif. <b>Key Result</b> = ukuran hasil yang terukur.',
          fields: [ { t: 'table', k: 'okr', addable: true, rows: 3, cols: ['Objective', 'Key Result', 'Target/Pencapaian'] } ] },
        { judul: 'Key Performance Indicator (opsional)', desc: 'Metrik utama untuk memantau kesehatan bisnis.',
          fields: [ { t: 'table', k: 'kpi', addable: true, rows: 4, cols: ['KPI', 'Unit pengukuran', 'Target'] } ] }
      ] },

    /* ---------- CHAPTER 7 — LAUNCH & GROW ---------- */
    { id: 'c7', no: 'Chapter 7', judul: 'Launch & Grow', ikon: 'i-trend',
      intro: 'Menyusun target & rencana implementasi. Pecah goal jadi taktik dan task per minggu.',
      sections: [
        { judul: 'Goal 1', desc: 'Spesifik, terukur, tercapai, realistis, tepat waktu (SMART).',
          fields: [
            { t: 'text', k: 'g1', label: 'Goal 1' },
            { t: 'table', k: 'g1t', addable: true, rows: 3, cols: ['Taktik', 'Task', 'Target minggu/tanggal'] }
          ] },
        { judul: 'Goal 2', fields: [
          { t: 'text', k: 'g2', label: 'Goal 2' },
          { t: 'table', k: 'g2t', addable: true, rows: 3, cols: ['Taktik', 'Task', 'Target minggu/tanggal'] }
        ] },
        { judul: 'Goal 3', fields: [
          { t: 'text', k: 'g3', label: 'Goal 3' },
          { t: 'table', k: 'g3t', addable: true, rows: 3, cols: ['Taktik', 'Task', 'Target minggu/tanggal'] }
        ] },
        { judul: 'Selesai!', desc: 'Klik <b>Simpan PDF</b> untuk mengunduh blueprint bisnismu. Build a great business, be an entrepreneur. 🚀',
          fields: [] }
      ] }
  ];

  window.BP_META = META;
  window.BP_DATA = DATA;
  if (typeof module !== 'undefined' && module.exports) module.exports = { BP_META: META, BP_DATA: DATA };
})();
