/* ============================================================
   Bekal — Legalitas & Pajak: renderer, wizard & simulator (ES5)
   Butuh data-legal.js (LG_BADAN, LG_RISIKO, LG_PAJAK, LG_IZIN,
   LG_KALENDER, LG_GLOSARIUM).
   ============================================================ */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function rp(n){ n=Math.round(n||0); return 'Rp'+(''+n).replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
  function rpS(n){ n=n||0; if(n>=1e9) return 'Rp'+(n/1e9).toFixed((n%1e9)?1:0).replace('.',',')+' M'; if(n>=1e6) return 'Rp'+Math.round(n/1e6)+' jt'; return rp(n); }

  /* ---------- TABS ---------- */
  var bar = $('lgTabs');
  if (bar) {
    function showTab(t){
      Array.prototype.forEach.call(document.querySelectorAll('.lg-tab'), function(b){ var on=b.getAttribute('data-ltab')===t; b.classList.toggle('on',on); b.setAttribute('aria-selected', on?'true':'false'); });
      Array.prototype.forEach.call(document.querySelectorAll('.lg-panel'), function(p){ p.classList.toggle('on', p.getAttribute('data-lpanel')===t); });
    }
    bar.addEventListener('click', function(e){ var b=e.target.closest('.lg-tab'); if(b){ showTab(b.getAttribute('data-ltab')); window.scrollTo({top:0,behavior:'smooth'}); } });
    window.lgShowTab = showTab;
  }

  /* ---------- BADAN USAHA cards + tabel ---------- */
  if ($('lgBadan') && window.LG_BADAN) {
    $('lgBadan').innerHTML = LG_BADAN.map(function(b){
      return '<div class="lg-card" id="badan-'+b.id+'">'+
        '<div class="lg-card-h"><span class="lg-emo">'+b.ikon+'</span><div><h3>'+esc(b.nama)+'</h3>'+
        '<span class="lg-badge '+(b.hukum?'lg-yes':'lg-no')+'">'+(b.hukum?'Badan hukum':'Bukan badan hukum')+'</span></div></div>'+
        '<p class="lg-cocok"><b>Cocok untuk:</b> '+esc(b.cocok)+'</p>'+
        '<dl class="lg-kv">'+
        row('Pendiri', b.pendiri)+row('Tanggung jawab', b.tj)+row('Modal', b.modal)+
        row('Pajak', b.pajak)+row('Cara mendirikan', b.dirikan)+row('Biaya & waktu', b.biaya+' · '+b.waktu)+
        '</dl>'+
        '<div class="lg-pm"><div class="lg-plus"><h5>Kelebihan</h5><ul>'+b.plus.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div>'+
        '<div class="lg-minus"><h5>Perlu dipikirkan</h5><ul>'+b.minus.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div></div>'+
        '</div>';
    }).join('');
    function row(k,v){ return '<div class="lg-row"><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>'; }
    // comparison table
    if ($('lgBadanTable')) {
      var cols = LG_BADAN.filter(function(b){ return ['ud','ptp','cv','pt'].indexOf(b.id)>-1; });
      var h = '<div class="lg-tablewrap"><table class="lg-table"><thead><tr><th>Aspek</th>'+cols.map(function(c){return '<th>'+c.ikon+' '+esc(c.nama.split(' (')[0])+'</th>';}).join('')+'</tr></thead><tbody>';
      h += trow('Badan hukum?', cols.map(function(c){return c.hukum?'✅ Ya':'❌ Tidak';}));
      h += trow('Jumlah pendiri', cols.map(function(c){return esc(c.pendiri);}));
      h += trow('Perlindungan harta pribadi', cols.map(function(c){return c.hukum?'✅ Terlindungi':'⚠️ Tidak';}));
      h += trow('Notaris?', cols.map(function(c){return /notaris/i.test(c.dirikan)&&!/tanpa akta/i.test(c.dirikan)?'Ya':'Tidak';}));
      h += trow('Biaya', cols.map(function(c){return esc(c.biaya);}));
      h += trow('Jenis pajak', cols.map(function(c){return esc(c.pajak.split('.')[0]);}));
      h += '</tbody></table></div>';
      $('lgBadanTable').innerHTML = h;
      function trow(k,vals){ return '<tr><td class="lg-th">'+esc(k)+'</td>'+vals.map(function(v){return '<td>'+v+'</td>';}).join('')+'</tr>'; }
    }
  }

  /* ---------- RISIKO OSS ---------- */
  if ($('lgRisiko') && window.LG_RISIKO) {
    $('lgRisiko').innerHTML = LG_RISIKO.map(function(r){
      return '<div class="lg-risk lg-'+r.warna+'"><div class="lg-risk-h"><b>'+esc(r.t)+'</b><span>'+esc(r.izin)+'</span></div><p>'+esc(r.ket)+'</p></div>';
    }).join('');
  }

  /* ---------- PAJAK cards ---------- */
  if ($('lgPajak') && window.LG_PAJAK) {
    $('lgPajak').innerHTML = LG_PAJAK.map(function(p){
      return '<div class="lg-card lg-tax"><div class="lg-tax-h"><h3>'+esc(p.nama)+'</h3><span class="lg-tarif">'+esc(p.tarif)+'</span></div>'+
        '<p class="lg-siapa"><b>Untuk:</b> '+esc(p.siapa)+'</p><p class="lg-taxket">'+esc(p.ket)+'</p></div>';
    }).join('');
  }

  /* ---------- IZIN ---------- */
  if ($('lgIzin') && window.LG_IZIN) {
    $('lgIzin').innerHTML = LG_IZIN.map(function(z){
      return '<div class="lg-card lg-izin"><div class="lg-card-h"><span class="lg-emo">'+z.ikon+'</span><div><h3>'+esc(z.nama)+'</h3><span class="lg-badge lg-need">Wajib: '+esc(z.wajib)+'</span></div></div><p class="lg-taxket">'+esc(z.ket)+'</p></div>';
    }).join('');
  }

  /* ---------- KALENDER ---------- */
  if ($('lgKalender') && window.LG_KALENDER) {
    $('lgKalender').innerHTML = '<div class="lg-tablewrap"><table class="lg-table"><thead><tr><th>Jenis pajak</th><th>Batas setor</th><th>Batas lapor (SPT)</th></tr></thead><tbody>'+
      LG_KALENDER.map(function(k){ return '<tr><td class="lg-th">'+esc(k.pajak)+'</td><td>'+esc(k.setor)+'</td><td>'+esc(k.lapor)+'</td></tr>'; }).join('')+
      '</tbody></table></div>';
  }

  /* ---------- GLOSARIUM ---------- */
  if ($('lgGlosarium') && window.LG_GLOSARIUM) {
    $('lgGlosarium').innerHTML = LG_GLOSARIUM.map(function(g){
      return '<div class="lg-term"><b>'+esc(g[0])+'</b><span>'+esc(g[1])+'</span></div>';
    }).join('');
  }

  /* ---------- WIZARD: badan usaha mana? ---------- */
  var WQ = [
    { q:'Berapa orang pendiri usahanya?', o:[['Sendiri (1 orang)','solo'],['Berdua atau lebih (partner)','tim']] },
    { q:'Seberapa penting harta pribadimu terlindungi kalau usaha rugi/berutang?', o:[['Sangat penting (mau aman)','lindung'],['Belum prioritas / usaha masih kecil','santai']] },
    { q:'Rencana skala usaha?', o:[['Mikro/kecil dulu','kecil'],['Serius, mau besar / cari investor / ikut tender','besar']] },
    { q:'Tujuan utamanya?', o:[['Cari keuntungan (komersial)','profit'],['Sosial / nirlaba (yayasan/komunitas)','sosial']] }
  ];
  var wAns = {};
  function renderWizard(){
    var w=$('lgWizard'); if(!w) return;
    w.innerHTML = WQ.map(function(it,i){
      return '<div class="lg-wq"><p class="lg-wqt">'+(i+1)+'. '+esc(it.q)+'</p><div class="lg-wopts">'+
        it.o.map(function(o){ return '<button type="button" class="lg-wopt'+(wAns[i]===o[1]?' on':'')+'" data-wq="'+i+'" data-wv="'+o[1]+'">'+esc(o[0])+'</button>'; }).join('')+
        '</div></div>';
    }).join('') + '<div id="lgWizResult"></div>';
  }
  function wizResult(){
    if (Object.keys(wAns).length < WQ.length) { $('lgWizResult').innerHTML=''; return; }
    var rec, why;
    if (wAns[3]==='sosial') { rec='Yayasan / Perkumpulan'; why='Tujuanmu sosial/nirlaba, jadi badan hukum nirlaba paling tepat. Laba/surplus tidak dibagi ke pendiri, tapi untuk misi.'; }
    else if (wAns[0]==='solo') {
      if (wAns[1]==='lindung' || wAns[2]==='besar') { rec='PT Perorangan'; why='Kamu sendiri tapi mau harta pribadi terlindungi & lebih kredibel. PT Perorangan (khusus UMK) memberi badan hukum tanpa notaris, murah & cepat.'; }
      else { rec='Usaha Perseorangan (UD)'; why='Solo, skala kecil, belum butuh badan hukum. Mulai paling ringan dengan cukup NIB; naik kelas ke PT Perorangan kapan saja.'; }
    } else { // tim
      if (wAns[1]==='lindung' || wAns[2]==='besar') { rec='PT (Perseroan Terbatas)'; why='Ada partner, mau tumbuh besar/cari investor/ikut tender & lindungi aset. PT paling kredibel & mudah menampung banyak pemegang saham.'; }
      else { rec='CV (Persekutuan Komanditer)'; why='Ada partner, skala menengah, belum wajib badan hukum penuh. CV lebih murah dari PT, kredibel, & pembagian labanya tidak kena pajak dividen.'; }
    }
    $('lgWizResult').innerHTML = '<div class="lg-wres"><span class="lg-wres-lbl">Rekomendasi untukmu</span><b>'+esc(rec)+'</b><p>'+esc(why)+'</p>'+
      '<p class="lg-cap">Ini panduan awal, bukan nasihat hukum. Baca detail tiap badan usaha di tab "Badan Usaha" & pertimbangkan konsultasi notaris/konsultan pajak.</p></div>';
  }
  if ($('lgWizard')) {
    renderWizard();
    $('lgWizard').addEventListener('click', function(e){ var b=e.target.closest('[data-wq]'); if(!b) return; wAns[+b.getAttribute('data-wq')]=b.getAttribute('data-wv'); renderWizard(); wizResult(); });
  }

  /* ---------- SIMULATOR PAJAK ---------- */
  var simMode = 'umkm';
  function num(id){ var v=parseFloat(($(id)||{}).value); return isNaN(v)?0:v; }
  function simFields(){
    if (simMode==='umkm') return f('sOmzet','Omzet setahun (Rp)',600000000) + radio('sStatus',[['Orang Pribadi','op'],['Badan (PT/CV)','badan']],'op');
    if (simMode==='badan') return f('sOmzet','Omzet setahun (Rp)',3000000000) + f('sLaba','Laba bersih / penghasilan kena pajak setahun (Rp)',400000000);
    if (simMode==='ppn') return f('sOmzet','Omzet setahun (Rp)',6000000000) + f('sHarga','Harga jual satu transaksi (Rp, opsional)',1000000);
    if (simMode==='pph21') return f('sGaji','Gaji / penghasilan per bulan (Rp)',8000000) + radio('sPtkp',[['Belum kawin (TK/0)','tk0'],['Kawin (K/0)','k0'],['Kawin 2 anak (K/2)','k2']],'tk0');
    return '';
  }
  function f(id,label,val){ return '<label class="lg-cinput"><span>'+label+'</span><input type="number" id="'+id+'" value="'+val+'" min="0" inputmode="numeric"></label>'; }
  function radio(id,opts,def){ return '<div class="lg-cinput"><span>Status</span><div class="lg-radios" id="'+id+'">'+opts.map(function(o){return '<button type="button" class="lg-radio'+(o[1]===def?' on':'')+'" data-rv="'+o[1]+'">'+esc(o[0])+'</button>';}).join('')+'</div></div>'; }
  function orow(k,v,strong){ return '<div class="lg-orow"><span>'+k+'</span><b'+(strong?' class="lg-big"':'')+'>'+v+'</b></div>'; }

  function calc(){
    var out=$('lgSimOut'); if(!out) return; var h='';
    if (simMode==='umkm') {
      var omzet=num('sOmzet'), st=(radioVal('sStatus')||'op');
      if (omzet>4800000000) { h='<div class="lg-warn-box">Omzet di atas <b>Rp4,8 M</b> — tidak boleh pakai PPh Final 0,5%. Gunakan tarif <b>PPh Badan (Pasal 17 & 31E)</b> untuk badan, atau tarif progresif untuk orang pribadi. Coba mode "PPh Badan".</div>'; }
      else {
        var dpp = st==='op' ? Math.max(0, omzet-500000000) : omzet;
        var pajak = dpp*0.005;
        h = orow('Dasar kena pajak', rp(dpp) + (st==='op'?' <span class="lg-cap2">(omzet − Rp500 jt bebas)</span>':'')) +
            orow('PPh Final / tahun', rp(pajak), true) +
            orow('Rata-rata / bulan', rp(pajak/12)) +
            (st==='op' && omzet<=500000000 ? '<div class="lg-ok-box">🎉 Omzet ≤ Rp500 juta → <b>bebas PPh</b> (khusus orang pribadi). Tetap wajib lapor SPT Tahunan.</div>' : '') +
            (st==='badan' ? '<div class="lg-cap">Catatan: badan (PT/CV) tidak dapat fasilitas bebas Rp500 juta, dan hanya boleh pakai 0,5% untuk jangka waktu tertentu (PT 3 th, CV 4 th).</div>' : '');
      }
    } else if (simMode==='badan') {
      var om=num('sOmzet'), laba=num('sLaba'); var pph, det;
      if (om<=0) om=1;
      if (om<=4800000000) { pph=laba*0.11; det='Seluruh laba dapat fasilitas 31E (diskon 50%): 11% × laba.'; }
      else if (om<=50000000000) {
        var bagianFasilitas = laba*(4800000000/om);
        var bagianNormal = laba - bagianFasilitas;
        pph = bagianFasilitas*0.11 + bagianNormal*0.22;
        det = 'Sebagian laba (proporsi Rp4,8 M / omzet) kena 11%, sisanya 22%.';
      } else { pph=laba*0.22; det='Omzet > Rp50 M — tidak dapat fasilitas 31E, tarif penuh 22%.'; }
      h = orow('Tarif efektif', laba>0?((pph/laba*100).toFixed(1)+'%'):'—') +
          orow('PPh Badan / tahun', rp(pph), true) +
          orow('Rata-rata / bulan (angsuran PPh 25)', rp(pph/12)) +
          '<div class="lg-cap">'+det+' Fasilitas Pasal 31E berlaku untuk WP Badan dengan omzet ≤ Rp50 M.</div>';
    } else if (simMode==='ppn') {
      var o2=num('sOmzet'), harga=num('sHarga');
      var wajib = o2>4800000000;
      h = orow('Status PKP', wajib?'⚠️ WAJIB jadi PKP (pungut PPN)':'✅ Boleh non-PKP (tidak pungut PPN)', true) +
          '<div class="'+(wajib?'lg-warn-box':'lg-ok-box')+'">'+(wajib?'Omzet > Rp4,8 M/tahun → wajib dikukuhkan sebagai PKP dan memungut PPN dari pembeli.':'Omzet ≤ Rp4,8 M/tahun → belum wajib PKP. Boleh tidak memungut PPN (harga jualmu lebih kompetitif).')+'</div>';
      if (harga>0) h += orow('PPN 11% dari '+rp(harga), rp(harga*0.11)) + orow('Harga + PPN', rp(harga*1.11)) + '<div class="lg-cap">Barang/jasa umum efektif 11%. Barang mewah 12%. PPN hanya dipungut jika kamu PKP.</div>';
    } else if (simMode==='pph21') {
      var gaji=num('sGaji'), ptkpKey=(radioVal('sPtkp')||'tk0');
      var ptkp = ptkpKey==='k2'?72000000 : (ptkpKey==='k0'?58500000 : 54000000);
      var bruto = gaji*12;
      var biayaJab = Math.min(bruto*0.05, 6000000);
      var neto = bruto - biayaJab;
      var pkp = Math.max(0, neto - ptkp);
      var pph=0, sisa=pkp;
      var brackets=[[60000000,0.05],[190000000,0.15],[250000000,0.25],[4500000000,0.30],[Infinity,0.35]];
      for (var i=0;i<brackets.length && sisa>0;i++){ var amt=Math.min(sisa,brackets[i][0]); pph+=amt*brackets[i][1]; sisa-=amt; }
      h = orow('Penghasilan setahun', rp(bruto)) +
          orow('PTKP ('+ptkpKey.toUpperCase()+')', rp(ptkp)) +
          orow('Penghasilan Kena Pajak', rp(pkp)) +
          orow('PPh 21 / tahun', rp(pph), true) +
          orow('Potongan / bulan (± )', rp(pph/12)) +
          '<div class="lg-cap">Estimasi metode tahunan disederhanakan (biaya jabatan 5% maks Rp6 jt, tarif progresif Pasal 17). Angka riil pakai TER bulanan & komponen lain (BPJS, dll).</div>';
    }
    out.innerHTML = h;
  }
  function radioVal(id){ var el=$(id); if(!el) return null; var on=el.querySelector('.lg-radio.on'); return on?on.getAttribute('data-rv'):null; }
  function renderSim(){
    var box=$('lgSimFields'); if(!box) return; box.innerHTML=simFields();
    Array.prototype.forEach.call(box.querySelectorAll('input'), function(el){ el.addEventListener('input', calc); });
    Array.prototype.forEach.call(box.querySelectorAll('.lg-radios'), function(g){ g.addEventListener('click', function(e){ var b=e.target.closest('.lg-radio'); if(!b) return; Array.prototype.forEach.call(g.children,function(c){c.classList.remove('on');}); b.classList.add('on'); calc(); }); });
    calc();
  }
  if ($('lgSimTabs')) {
    $('lgSimTabs').addEventListener('click', function(e){ var b=e.target.closest('[data-smode]'); if(!b) return; simMode=b.getAttribute('data-smode'); Array.prototype.forEach.call(this.children,function(c){c.classList.toggle('on', c===b);}); renderSim(); });
    renderSim();
  }

  /* deep link #tab= */
  try { var h=(location.hash||'').replace('#',''); if(/^tab=/.test(h) && window.lgShowTab){ var t=h.split('=')[1]; if(document.querySelector('.lg-panel[data-lpanel="'+t+'"]')) window.lgShowTab(t); } } catch(e){}
})();
