/* PusatBankSoal.id — Franchise & Peluang Bisnis: UI logic (vanilla, no deps)
 * Bergantung pada assets/data-franchise.js (FR_DATA, FR_CITIES, FR_BORING, FR_IDE, FR_TIERS, FR_CATS)
 */
(function () {
  'use strict';
  if (typeof FR_DATA === 'undefined') return;

  var $ = function (id) { return document.getElementById(id); };
  var byId = {}; FR_DATA.forEach(function (f) { byId[f.id] = f; });
  var TIER = {}; FR_TIERS.forEach(function (t) { TIER[t.id] = t; });

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function parseNum(v) { var s = String(v == null ? '' : v).replace(/[^\d.-]/g, ''); var n = parseFloat(s); return isFinite(n) ? n : 0; }
  function fmtInt(x) { return isFinite(x) ? Math.round(x).toLocaleString('id-ID') : '—'; }
  function rp(x) { return isFinite(x) ? 'Rp ' + fmtInt(x) : '—'; }
  function pct(x) { return isFinite(x) ? (Math.round(x * 10) / 10) + '%' : '—'; }
  // Ringkas rupiah: 1.500.000 -> "Rp 1,5 jt", 300.000.000 -> "Rp 300 jt", 1.000.000.000 -> "Rp 1 M"
  function rpShort(x) {
    if (!isFinite(x)) return '—';
    if (x >= 1e9) { var m = x / 1e9; return 'Rp ' + (m % 1 ? m.toFixed(1).replace('.', ',') : m) + ' M'; }
    if (x >= 1e6) { var j = x / 1e6; return 'Rp ' + (j % 1 ? j.toFixed(1).replace('.', ',') : Math.round(j)) + ' jt'; }
    if (x >= 1e3) return 'Rp ' + Math.round(x / 1e3) + 'rb';
    return 'Rp ' + fmtInt(x);
  }
  function invRange(f) {
    if (f.invMin === f.invMax) return rpShort(f.invMin);
    return rpShort(f.invMin) + ' – ' + rpShort(f.invMax);
  }
  // Estimasi ROI tahunan (%) untuk sorting/kartu (pakai titik tengah omzet & modal)
  function estRoi(f) {
    var O = (f.omzetMin + f.omzetMax) / 2, M = (f.invMin + f.invMax) / 2;
    var laba = O * f.gm / 100 - f.fixEst - O * (f.royPct || 0) / 100;
    return M > 0 ? laba * 12 / M * 100 : 0;
  }
  // Tampilan ROI: modal kecil bisa hasilkan ROI sangat tinggi secara matematis;
  // ditampilkan berpagar agar tidak terkesan "terlalu indah" — angka pastinya ada di kalkulator.
  function roiDisplay(f) { var r = estRoi(f); return r > 200 ? '>200%' : pct(r); }

  /* ---------- favorites (shortlist) ---------- */
  var FAVKEY = 'fr_fav_v1';
  function getFavs() { try { return JSON.parse(localStorage.getItem(FAVKEY) || '[]'); } catch (e) { return []; } }
  function setFavs(a) { try { localStorage.setItem(FAVKEY, JSON.stringify(a)); } catch (e) {} }
  function isFav(id) { return getFavs().indexOf(id) >= 0; }
  function toggleFav(id) {
    var a = getFavs(), i = a.indexOf(id);
    if (i >= 0) a.splice(i, 1); else a.push(id);
    setFavs(a); return i < 0;
  }

  /* ---------- tabs ---------- */
  function showTab(t) {
    var tabs = $('frSub').querySelectorAll('.fr-tab');
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-tab') === t;
      tabs[i].classList.toggle('on', on);
      tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }
    var pans = document.querySelectorAll('.fr-panel');
    for (var j = 0; j < pans.length; j++) pans[j].classList.toggle('on', pans[j].getAttribute('data-panel') === t);
    var a = $('frSub').querySelector('.fr-tab.on');
    if (a) { var n = $('frSub'); n.scrollLeft = a.offsetLeft - n.clientWidth / 2 + a.clientWidth / 2; }
    if (t === 'kota') renderKota();
    if (t === 'shortlist') renderShortlist();
    if (t === 'hitung') calcHitung();
  }
  $('frSub').addEventListener('click', function (e) { var b = e.target.closest('.fr-tab'); if (b) showTab(b.getAttribute('data-tab')); });
  $('frSub').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var tabs = Array.prototype.slice.call(this.querySelectorAll('.fr-tab'));
    var i = tabs.indexOf(this.querySelector('.fr-tab.on')); if (i < 0) return;
    i = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    showTab(tabs[i].getAttribute('data-tab')); tabs[i].focus(); e.preventDefault();
  });
  Array.prototype.forEach.call(document.querySelectorAll('.fr-panel'), function (p) { p.setAttribute('role', 'tabpanel'); });

  /* ---------- populate selects ---------- */
  (function () {
    var cat = $('frCat'); cat.innerHTML = '<option value="">Semua kategori</option>' +
      Object.keys(FR_CATS).map(function (k) { return '<option value="' + k + '">' + esc(FR_CATS[k]) + '</option>'; }).join('');
    var tier = $('frTier'); tier.innerHTML = '<option value="">Semua tingkat modal</option>' +
      FR_TIERS.map(function (t) { return '<option value="' + t.id + '">' + esc(t.label) + ' (' + esc(t.range) + ')</option>'; }).join('');
    var chips = $('frTierChips');
    chips.innerHTML = '<button class="fr-chip on" data-tier="">Semua</button>' +
      FR_TIERS.map(function (t) { return '<button class="fr-chip" data-tier="' + t.id + '">' + esc(t.label) + ' · ' + esc(t.range) + '</button>'; }).join('');
    var pickOpts = '<option value="">— pilih / isi manual —</option>' + FR_DATA.map(function (f) {
      return '<option value="' + f.id + '">' + esc(f.nama) + ' (' + esc(TIER[f.tier].label) + ')</option>';
    }).join('');
    $('hcPick').innerHTML = pickOpts;
    $('ktPick').innerHTML = pickOpts;
  })();

  /* ---------- JELAJAH grid ---------- */
  function currentList() {
    var q = ($('frSearch').value || '').toLowerCase().trim();
    var cat = $('frCat').value, tier = $('frTier').value, sort = $('frSort').value;
    var out = FR_DATA.filter(function (f) {
      if (cat && f.kategori !== cat) return false;
      if (tier && f.tier !== tier) return false;
      if (q) {
        var hay = (f.nama + ' ' + FR_CATS[f.kategori] + ' ' + (f.asal || '')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    out.sort(function (a, b) {
      if (sort === 'inv-asc') return a.invMin - b.invMin;
      if (sort === 'inv-desc') return b.invMin - a.invMin;
      if (sort === 'roi-desc') return estRoi(b) - estRoi(a);
      return a.nama.localeCompare(b.nama, 'id');
    });
    return out;
  }
  function cardHtml(f) {
    var fav = isFav(f.id);
    return '<article class="fr-card" tabindex="0" role="button" data-id="' + f.id + '" aria-label="' + esc(f.nama) + '">' +
      '<button class="fr-fav' + (fav ? ' on' : '') + '" data-fav="' + f.id + '" title="Simpan ke shortlist" aria-label="Simpan ke shortlist"><svg class="i" aria-hidden="true"><use href="#i-bookmark"></use></svg></button>' +
      '<div class="top"><div><div class="nm">' + esc(f.nama) + '</div><div class="cat">' + esc(FR_CATS[f.kategori]) + ' · ' + esc(f.asal || '') + '</div></div>' +
      '<span class="fr-tier tier-' + f.tier + '">' + esc(TIER[f.tier].label) + '</span></div>' +
      '<div><div class="inv">' + invRange(f) + '</div><div class="invl">Estimasi investasi awal</div></div>' +
      '<div class="met"><span>Omzet/bln <b>' + rpShort(f.omzetMin) + '–' + rpShort(f.omzetMax) + '</b></span>' +
      '<span>Est. ROI <b>' + roiDisplay(f) + '/th</b></span></div>' +
      '</article>';
  }
  function renderGrid() {
    var list = currentList();
    $('frCount').textContent = list.length;
    var g = $('frGrid');
    g.innerHTML = list.length ? list.map(cardHtml).join('') : '<div class="fr-empty">Tidak ada franchise yang cocok dengan filter. Coba ubah kata kunci atau tingkat modal.</div>';
  }
  ['frSearch', 'frCat', 'frTier', 'frSort'].forEach(function (id) {
    $(id).addEventListener('input', function () {
      if (id === 'frCat' || id === 'frTier') syncChips();
      renderGrid();
    });
  });
  function syncChips() {
    var t = $('frTier').value;
    Array.prototype.forEach.call($('frTierChips').children, function (c) { c.classList.toggle('on', c.getAttribute('data-tier') === t); });
  }
  $('frTierChips').addEventListener('click', function (e) {
    var b = e.target.closest('.fr-chip'); if (!b) return;
    $('frTier').value = b.getAttribute('data-tier'); syncChips(); renderGrid();
  });
  $('frGrid').addEventListener('click', function (e) {
    var favBtn = e.target.closest('[data-fav]');
    if (favBtn) { e.stopPropagation(); var on = toggleFav(favBtn.getAttribute('data-fav')); favBtn.classList.toggle('on', on); return; }
    var card = e.target.closest('.fr-card'); if (card) openDetail(card.getAttribute('data-id'));
  });
  $('frGrid').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest('.fr-card'); if (card) { e.preventDefault(); openDetail(card.getAttribute('data-id')); }
  });

  /* ---------- DETAIL ---------- */
  function listBox(title, arr) {
    return '<div class="fr-lbox"><h5>' + esc(title) + '</h5><ul>' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
  }
  function openDetail(id) {
    var f = byId[id]; if (!f) return;
    var fav = isFav(id);
    var html = '<div class="fr-detail" id="frDetailCard">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">' +
      '<div><h2>' + esc(f.nama) + '</h2><div class="sub">' + esc(FR_CATS[f.kategori]) + ' · asal ' + esc(f.asal || '-') + (f.sejak ? ' · sejak ' + f.sejak : '') + ' · <span class="fr-tier tier-' + f.tier + '">' + esc(TIER[f.tier].label) + ' ' + esc(TIER[f.tier].range) + '</span></div></div>' +
      '<div style="display:flex;gap:8px"><button class="fr-dclose" data-detfav="' + f.id + '">' + (fav ? '★ Tersimpan' : '☆ Simpan') + '</button><button class="fr-dclose" id="frDetClose">Tutup ✕</button></div>' +
      '</div>' +
      '<div class="fr-dgrid">' +
      dbox('Investasi awal', invRange(f), true) +
      dbox('Omzet/bulan (est.)', rpShort(f.omzetMin) + ' – ' + rpShort(f.omzetMax)) +
      dbox('Margin kotor (est.)', pct(f.gm)) +
      dbox('Est. ROI', roiDisplay(f) + ' / th') +
      dbox('Kebutuhan lokasi', esc(f.luas)) +
      dbox('Karyawan', esc(f.karyawan)) +
      '</div>' +
      '<div class="fr-cols" style="margin-top:16px">' +
      '<div class="fr-lbox"><h5>Biaya & skema</h5>' +
      drow('Franchise / kemitraan fee', f.fee) +
      drow('Royalti', f.royalti) +
      drow('Kontrak', f.kontrak) +
      drow('Kebutuhan daya listrik', f.daya) +
      drow('Titik impas (BEP)', f.bepText) +
      (f.situs ? drow('Situs resmi', f.situs) : '') +
      '</div>' +
      listBox('Kelebihan', f.kelebihan) +
      '</div>' +
      '<div class="fr-cols" style="margin-top:14px">' +
      listBox('Perlu diwaspadai', f.kekurangan) +
      '<div class="fr-lbox"><h5>Catatan</h5><p style="color:var(--muted-strong);font-size:13px;line-height:1.55;margin:0">' + esc(f.catatan) + '</p></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">' +
      '<button class="btn btn-primary btn-sm" data-hitung="' + f.id + '">🧮 Hitung kelayakan (BEP/ROI)</button>' +
      '<button class="btn btn-ghost btn-sm" data-kota="' + f.id + '">📍 Cek kota yang cocok</button>' +
      '</div>' +
      '<p class="fr-cap" style="margin-top:12px;font-size:11.5px">Angka adalah kisaran referensi (2024–2025), bukan penawaran resmi. Verifikasi ke pihak franchisor.</p>' +
      '</div>';
    var box = $('frDetail'); box.innerHTML = html;
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('frDetClose').addEventListener('click', function () { box.innerHTML = ''; });
    box.querySelector('[data-detfav]').addEventListener('click', function () {
      var on = toggleFav(f.id); this.textContent = on ? '★ Tersimpan' : '☆ Simpan';
      var g = $('frGrid').querySelector('[data-fav="' + f.id + '"]'); if (g) g.classList.toggle('on', on);
    });
    box.querySelector('[data-hitung]').addEventListener('click', function () { prefillHitung(f.id); showTab('hitung'); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    box.querySelector('[data-kota]').addEventListener('click', function () { $('ktPick').value = f.id; prefillKota(); showTab('kota'); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  function dbox(k, v, pri) { return '<div class="fr-dbox"><div class="k">' + esc(k) + '</div><div class="v' + (pri ? ' pri' : '') + '">' + v + '</div></div>'; }
  function drow(k, v) { return '<div class="fr-drow"><span>' + esc(k) + '</span><b>' + esc(v) + '</b></div>'; }

  /* ---------- HITUNG (BEP/ROI) ---------- */
  function prefillHitung(id) {
    var f = byId[id]; if (!f) return;
    $('hcPick').value = id;
    $('hcModal').value = fmtInt(Math.round((f.invMin + f.invMax) / 2));
    $('hcOmzet').value = fmtInt(Math.round((f.omzetMin + f.omzetMax) / 2));
    $('hcGm').value = f.gm;
    $('hcFix').value = fmtInt(f.fixEst);
    $('hcRoy').value = f.royPct || 0;
    $('hcTicket').value = fmtInt(f.ticket);
    calcHitung();
  }
  $('hcPick').addEventListener('change', function () { if (this.value) prefillHitung(this.value); });
  ['hcModal', 'hcOmzet', 'hcGm', 'hcFix', 'hcRoy', 'hcTicket'].forEach(function (id) {
    $(id).addEventListener('input', calcHitung);
  });
  function calcHitung() {
    var M = parseNum($('hcModal').value), O = parseNum($('hcOmzet').value), gm = parseNum($('hcGm').value),
      F = parseNum($('hcFix').value), r = parseNum($('hcRoy').value), T = parseNum($('hcTicket').value);
    var res = $('hcRes'), verd = $('hcVerdict');
    if (!O && !M) { res.innerHTML = '<p class="fr-cap" style="margin:0">Isi angka di atas (atau pilih franchise) untuk melihat laba, BEP, balik modal, dan ROI.</p>'; verd.style.display = 'none'; return; }
    var labaKotor = O * gm / 100, royAmt = O * r / 100, laba = labaKotor - F - royAmt;
    var denom = (gm - r) / 100, bepOmzet = denom > 0 ? F / denom : Infinity;
    var payback = laba > 0 ? M / laba : Infinity;
    var roiTh = M > 0 ? laba * 12 / M * 100 : 0;
    var txBep = T > 0 ? bepOmzet / T / 30 : NaN;
    var txNow = T > 0 ? O / T / 30 : NaN;
    res.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">' +
      dbox('Laba bersih / bulan', '<span style="color:' + (laba >= 0 ? 'var(--up)' : 'var(--down)') + '">' + rp(laba) + '</span>', false) +
      dbox('BEP omzet / bulan', isFinite(bepOmzet) ? rp(bepOmzet) : '—', false) +
      dbox('Balik modal (payback)', isFinite(payback) ? (payback <= 0 ? '—' : (payback < 12 ? Math.round(payback) + ' bln' : (Math.round(payback / 12 * 10) / 10) + ' th')) : 'tak balik', false) +
      dbox('ROI tahunan', pct(roiTh), true) +
      '</div>' +
      '<div class="fr-res" style="margin-top:12px;background:var(--elevated)">' +
      '<div class="fr-drow"><span>Laba kotor / bulan (setelah biaya produk)</span><b>' + rp(labaKotor) + '</b></div>' +
      '<div class="fr-drow"><span>− Biaya tetap / bulan</span><b>' + rp(F) + '</b></div>' +
      '<div class="fr-drow"><span>− Royalti (' + pct(r) + ' omzet)</span><b>' + rp(royAmt) + '</b></div>' +
      '<div class="fr-drow"><span>= Laba bersih / bulan</span><b style="color:' + (laba >= 0 ? 'var(--up)' : 'var(--down)') + '">' + rp(laba) + '</b></div>' +
      (isFinite(txBep) ? '<div class="fr-drow"><span>Transaksi/hari agar BEP (± ' + rp(T) + '/transaksi)</span><b>' + fmtInt(txBep) + '/hari</b></div>' : '') +
      (isFinite(txNow) ? '<div class="fr-drow"><span>Transaksi/hari pada omzet ini</span><b>' + fmtInt(txNow) + '/hari</b></div>' : '') +
      '</div>';
    // verdict
    var cls, label, note, score;
    if (laba <= 0) { cls = 'bad'; label = 'Belum untung'; note = 'Pada asumsi ini biaya belum tertutup. Naikkan omzet/margin atau tekan biaya tetap.'; score = Math.max(5, Math.round(30 + roiTh)); }
    else if (payback <= 18 && roiTh >= 40) { cls = 'ok'; label = 'Sangat layak'; note = 'Balik modal cepat & ROI tinggi. Tetap validasi omzet dengan survei lokasi.'; score = Math.min(96, Math.round(60 + roiTh / 3)); }
    else if (payback <= 36 && roiTh >= 20) { cls = 'ok'; label = 'Layak'; note = 'Balik modal & ROI wajar untuk usaha ini. Pastikan omzet realistis.'; score = Math.min(85, Math.round(50 + roiTh / 3)); }
    else { cls = 'warn'; label = 'Perlu dicermati'; note = 'ROI/payback belum ideal. Cek ulang asumsi omzet, sewa, dan gaji.'; score = Math.max(20, Math.min(60, Math.round(35 + roiTh / 2))); }
    verd.className = 'fr-verdict ' + cls;
    verd.style.display = 'flex';
    verd.innerHTML = '<div><div class="vb">' + label + '</div><div style="color:var(--muted-strong);font-size:12.5px;margin-top:3px;max-width:60ch">' + note + '</div></div><div class="score">' + score + '<span style="font-size:11px;color:var(--muted)">/100</span></div>';
  }

  /* ---------- KOTA (daya beli) ---------- */
  function prefillKota() {
    var f = byId[$('ktPick').value];
    if (f) { $('ktPrice').value = fmtInt(f.ticket); $('ktSeg').value = f.tier === 'korporat' || f.tier === 'besar' ? 'mid' : (f.ticket >= 25000 ? 'mid' : 'mass'); }
    renderKota();
  }
  $('ktPick').addEventListener('change', prefillKota);
  ['ktPrice', 'ktSeg'].forEach(function (id) { $(id).addEventListener('input', renderKota); });
  function cityScore(c, price, seg) {
    var disc = c.umk / 30 * 0.15;
    var afford = clamp01(disc / (Math.max(price, 1) * 4));
    var normUMK = clamp01(c.umk / 5700000);
    var size = c.size / 5;
    var costFriend = 1 - (c.cost / 5) * 0.6;
    var bpf, w;
    if (seg === 'premium') { bpf = 0.7 * normUMK + 0.3 * afford; w = [0.55, 0.25, 0.20]; }
    else if (seg === 'mid') { bpf = 0.5 * afford + 0.5 * normUMK; w = [0.45, 0.35, 0.20]; }
    else { bpf = afford; w = [0.45, 0.40, 0.15]; }
    var s = 100 * (w[0] * bpf + w[1] * size + w[2] * costFriend);
    return Math.max(0, Math.min(100, Math.round(s)));
  }
  function renderKota() {
    var f = byId[$('ktPick').value];
    var price = parseNum($('ktPrice').value) || (f ? f.ticket : 15000);
    var seg = $('ktSeg').value;
    $('ktNote').innerHTML = (f ? '<b style="color:var(--on-dark)">' + esc(f.nama) + '</b> · ' : '') +
      'Harga jual acuan <b style="color:var(--on-dark)">' + rp(price) + '</b> · segmen <b style="color:var(--on-dark)">' +
      (seg === 'premium' ? 'Premium' : seg === 'mid' ? 'Menengah' : 'Massal') + '</b>. Peringkat kota (kisaran, untuk penyaringan awal):';
    var ranked = FR_CITIES.map(function (c) { return { c: c, s: cityScore(c, price, seg) }; })
      .sort(function (a, b) { return b.s - a.s; });
    $('ktRank').innerHTML = ranked.map(function (o, i) {
      var s = o.s, badge = s >= 65 ? '<span class="fr-badge fr-ok">Cocok</span>' : s >= 45 ? '<span class="fr-badge fr-warn">Cukup</span>' : '<span class="fr-badge fr-bad">Hati-hati</span>';
      var col = s >= 65 ? 'var(--up)' : s >= 45 ? '#f5a623' : 'var(--down)';
      return '<div class="fr-crow">' +
        '<div class="fr-crank">' + (i + 1) + '</div>' +
        '<div><div class="fr-cname">' + esc(o.c.nama) + '</div><div class="fr-cmeta">' + esc(o.c.prov) + ' · UMK ≈ ' + rpShort(o.c.umk) + '</div></div>' +
        '<div class="fr-cbar"><div class="fr-cfill" style="width:' + s + '%;background:' + col + '"></div></div>' +
        '<div style="display:flex;align-items:center;gap:8px"><span class="fr-cscore" style="color:' + col + '">' + s + '</span>' + badge + '</div>' +
        '</div>';
    }).join('');
  }

  /* ---------- BORING ---------- */
  (function () {
    $('boringList').innerHTML = FR_BORING.map(function (b) {
      return '<div class="fr-item"><div class="nm">' + esc(b.nama) + '</div>' +
        '<span class="tag">Repeat order: ' + esc(b.repeat) + '</span>' +
        '<p>' + esc(b.why) + '</p>' +
        '<div class="kv"><span>Modal</span><b>' + esc(b.modal) + '</b></div>' +
        '<div class="kv"><span>Margin</span><b>' + esc(b.margin) + '</b></div>' +
        '<ul><li><b style="color:var(--down)">Risiko:</b> ' + esc(b.risiko) + '</li>' +
        '<li><b style="color:var(--up)">Tips:</b> ' + esc(b.tips) + '</li></ul>' +
        '</div>';
    }).join('');
  })();

  /* ---------- IDE (non-franchise) ---------- */
  var IDE_KEYS = ['minim', 'menengah', 'banyak', 'ratusan'];
  (function () {
    $('ideChips').innerHTML = IDE_KEYS.map(function (k, i) {
      return '<button class="fr-chip' + (i === 0 ? ' on' : '') + '" data-ide="' + k + '">' + esc(FR_IDE[k].label) + ' · ' + esc(FR_IDE[k].range) + '</button>';
    }).join('');
    renderIde('minim');
    $('ideChips').addEventListener('click', function (e) {
      var b = e.target.closest('.fr-chip'); if (!b) return;
      Array.prototype.forEach.call(this.children, function (c) { c.classList.remove('on'); });
      b.classList.add('on'); renderIde(b.getAttribute('data-ide'));
    });
  })();
  function renderIde(k) {
    var g = FR_IDE[k];
    var html = '<div class="fr-sectlabel">' + esc(g.label) + ' <span style="color:var(--muted);font-size:13px;font-weight:600">(' + esc(g.range) + ')</span></div>' +
      '<p class="fr-cap" style="margin-top:2px">' + esc(g.desc) + '</p>' +
      '<div class="fr-list">' + g.items.map(function (it) {
        return '<div class="fr-item"><div class="nm">' + esc(it.nama) + '</div>' +
          '<p>' + esc(it.catatan) + '</p>' +
          '<div class="kv"><span>Modal</span><b>' + esc(it.modal) + '</b></div>' +
          '<div class="kv"><span>Margin (est.)</span><b>' + esc(it.margin) + '</b></div>' +
          '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">' + it.contoh.map(function (c) { return '<span class="tag" style="margin:0">' + esc(c) + '</span>'; }).join('') + '</div>' +
          '</div>';
      }).join('') + '</div>';
    $('ideWrap').innerHTML = html;
  }

  /* ---------- SHORTLIST ---------- */
  function renderShortlist() {
    var favs = getFavs().map(function (id) { return byId[id]; }).filter(Boolean);
    var w = $('slWrap');
    if (!favs.length) { w.innerHTML = '<div class="fr-empty">Belum ada yang disimpan. Buka tab <b>Jelajah</b> lalu klik ikon 🔖 di kartu franchise untuk menambah ke shortlist.</div>'; return; }
    w.innerHTML = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;min-width:640px;font-size:13.5px">' +
      '<thead><tr style="text-align:left;color:var(--muted);font-size:12px">' +
      ['Franchise', 'Tingkat', 'Investasi', 'Omzet/bln (est.)', 'Margin', 'Est. ROI', ''].map(function (h) { return '<th style="padding:8px 10px;border-bottom:1px solid var(--hair-dark);font-weight:600">' + h + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      favs.map(function (f) {
        return '<tr>' +
          '<td style="padding:9px 10px;border-bottom:1px solid var(--hair-soft)"><b style="color:var(--on-dark);cursor:pointer" data-open="' + f.id + '">' + esc(f.nama) + '</b><div style="color:var(--muted);font-size:11.5px">' + esc(FR_CATS[f.kategori]) + '</div></td>' +
          '<td style="padding:9px 10px;border-bottom:1px solid var(--hair-soft)"><span class="fr-tier tier-' + f.tier + '">' + esc(TIER[f.tier].label) + '</span></td>' +
          '<td style="padding:9px 10px;border-bottom:1px solid var(--hair-soft);font-family:var(--num)">' + invRange(f) + '</td>' +
          '<td style="padding:9px 10px;border-bottom:1px solid var(--hair-soft);font-family:var(--num)">' + rpShort(f.omzetMin) + '–' + rpShort(f.omzetMax) + '</td>' +
          '<td style="padding:9px 10px;border-bottom:1px solid var(--hair-soft);font-family:var(--num)">' + pct(f.gm) + '</td>' +
          '<td style="padding:9px 10px;border-bottom:1px solid var(--hair-soft);font-family:var(--num);color:var(--primary)">' + roiDisplay(f) + '</td>' +
          '<td style="padding:9px 10px;border-bottom:1px solid var(--hair-soft)"><button class="fr-dclose" data-rm="' + f.id + '" title="Hapus dari shortlist">✕</button></td>' +
          '</tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="fr-cap" style="margin-top:12px">Klik nama untuk lihat detail. Bandingkan investasi, omzet, dan ROI untuk memilih yang paling pas dengan modal &amp; targetmu.</p>';
    w.addEventListener('click', shortlistClick);
  }
  function shortlistClick(e) {
    var rm = e.target.closest('[data-rm]');
    if (rm) { toggleFav(rm.getAttribute('data-rm')); renderShortlist(); var g = $('frGrid').querySelector('[data-fav="' + rm.getAttribute('data-rm') + '"]'); if (g) g.classList.remove('on'); return; }
    var op = e.target.closest('[data-open]');
    if (op) { showTab('jelajah'); openDetail(op.getAttribute('data-open')); }
  }

  /* ---------- init ---------- */
  renderGrid();
  renderIde('minim');
  // deep link: franchise.html?f=<id> atau #tab=<name>
  try {
    var qp = new URLSearchParams(location.search);
    var fid = qp.get('f');
    if (fid && byId[fid]) openDetail(fid);
    var h = (location.hash || '').replace('#', '');
    if (/^tab=/.test(h)) { var t = h.split('=')[1]; if (document.querySelector('.fr-panel[data-panel="' + t + '"]')) showTab(t); }
  } catch (e) {}
})();
