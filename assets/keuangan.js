/* ============================================================
   Bekal — Catatan Keuangan Harian (ES5, localStorage, no build)
   Pencatat pemasukan & pengeluaran pribadi: kategori lengkap,
   anggaran bulanan, statistik, ekspor. Data lokal di perangkat.
   ============================================================ */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  var $ = function (id) { return document.getElementById(id); };
  if (!$('khForm')) return;

  var LS_TX = 'bekal_keuangan_tx_v1', LS_BUD = 'bekal_keuangan_budget_v1';

  var CATS = {
    out: [
      { k: 'makan', n: 'Makan & Minum', i: '🍽️' },
      { k: 'rokok', n: 'Rokok', i: '🚬' },
      { k: 'bensin', n: 'Bensin & Transport', i: '⛽' },
      { k: 'kopi', n: 'Kopi & Jajan', i: '☕' },
      { k: 'belanja', n: 'Belanja Harian', i: '🛒' },
      { k: 'pulsa', n: 'Pulsa & Internet', i: '📱' },
      { k: 'tagihan', n: 'Tagihan (listrik/air)', i: '🧾' },
      { k: 'sewa', n: 'Sewa / Kos', i: '🏠' },
      { k: 'kesehatan', n: 'Kesehatan', i: '💊' },
      { k: 'pendidikan', n: 'Pendidikan', i: '📚' },
      { k: 'hiburan', n: 'Hiburan', i: '🎮' },
      { k: 'pakaian', n: 'Pakaian', i: '👕' },
      { k: 'parkir', n: 'Parkir & Tol', i: '🅿️' },
      { k: 'sedekah', n: 'Sedekah / Donasi', i: '🤲' },
      { k: 'cicilan', n: 'Cicilan / Utang', i: '💳' },
      { k: 'anak', n: 'Anak & Keluarga', i: '👨‍👩‍👧' },
      { k: 'hewan', n: 'Hewan Peliharaan', i: '🐾' },
      { k: 'lain-out', n: 'Lain-lain', i: '📦' }
    ],
    in: [
      { k: 'gaji', n: 'Gaji', i: '💼' },
      { k: 'usaha', n: 'Usaha / Dagang', i: '🏪' },
      { k: 'freelance', n: 'Freelance / Proyek', i: '💻' },
      { k: 'bonus', n: 'Bonus / THR', i: '🎁' },
      { k: 'hadiah', n: 'Hadiah / Kiriman', i: '🎀' },
      { k: 'jual', n: 'Penjualan Barang', i: '🏷️' },
      { k: 'investasi', n: 'Investasi / Bunga', i: '📈' },
      { k: 'lain-in', n: 'Lain-lain', i: '💰' }
    ]
  };
  var SUMBER = ['Tunai', 'Bank', 'E-wallet', 'Lainnya'];
  var QUICK = [
    { n: 'Makan', k: 'makan', i: '🍽️' }, { n: 'Rokok', k: 'rokok', i: '🚬' },
    { n: 'Bensin', k: 'bensin', i: '⛽' }, { n: 'Kopi', k: 'kopi', i: '☕' },
    { n: 'Parkir', k: 'parkir', i: '🅿️' }, { n: 'Pulsa', k: 'pulsa', i: '📱' }, { n: 'Belanja', k: 'belanja', i: '🛒' }
  ];

  /* ---------- state ---------- */
  var tx = [], budget = {};
  try { tx = JSON.parse(localStorage.getItem(LS_TX) || '[]') || []; } catch (e) { tx = []; }
  try { budget = JSON.parse(localStorage.getItem(LS_BUD) || '{}') || {}; } catch (e) { budget = {}; }
  var tipe = 'out', period = 'month', editId = null;

  function save() {
    try { localStorage.setItem(LS_TX, JSON.stringify(tx)); localStorage.setItem(LS_BUD, JSON.stringify(budget)); } catch (e) {}
    flash();
  }
  function flash() { var s = $('khSaved'); if (!s) return; s.classList.add('on'); setTimeout(function () { s.classList.remove('on'); }, 1100); }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function rp(n) { n = Math.round(n || 0); var neg = n < 0; n = Math.abs(n); return (neg ? '−Rp' : 'Rp') + (('' + n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')); }
  function digits(s) { return (('' + s).replace(/[^\d]/g, '')); }
  function grp(s) { s = digits(s); return s ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''; }
  function isoToday() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function catOf(t, k) { var arr = CATS[t] || []; for (var i = 0; i < arr.length; i++) if (arr[i].k === k) return arr[i]; return { k: k, n: k, i: t === 'in' ? '💰' : '📦' }; }
  function anyCat(k) { return catOf('out', k).n !== k ? catOf('out', k) : catOf('in', k); }
  function icoOf(k) { var c = catOf('out', k); if (c.n !== k) return c.i; c = catOf('in', k); return c.i; }
  function nameOf(k) { var c = catOf('out', k); if (c.n !== k) return c.n; c = catOf('in', k); return c.n !== k ? c.n : k; }
  function dateLabel(iso) {
    var parts = iso.split('-'); var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    var hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var bln = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    var t = isoToday();
    if (iso === t) return 'Hari ini · ' + hari[d.getDay()] + ', ' + (+parts[2]) + ' ' + bln[+parts[1] - 1];
    return hari[d.getDay()] + ', ' + (+parts[2]) + ' ' + bln[+parts[1] - 1] + ' ' + parts[0];
  }
  function monthKey(iso) { return iso.slice(0, 7); }

  /* ---------- period filter ---------- */
  function inPeriod(iso) {
    if (period === 'all') return true;
    var t = isoToday();
    if (period === 'today') return iso === t;
    if (period === 'month') return monthKey(iso) === monthKey(t);
    if (period === 'week') {
      var now = new Date(); var day = (now.getDay() + 6) % 7; // Monday=0
      var start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      var d = new Date(iso); return d >= start && d <= now;
    }
    if (period === 'custom') {
      var f = $('khFrom').value, to = $('khTo').value;
      if (f && iso < f) return false; if (to && iso > to) return false; return true;
    }
    return true;
  }
  function periodTx() { return tx.filter(function (x) { return inPeriod(x.tanggal); }); }
  function periodName() { return { today: 'hari ini', week: 'minggu ini', month: 'bulan ini', all: 'semua', custom: 'rentang' }[period]; }

  /* ---------- populate selects ---------- */
  function fillKat() {
    var sel = $('khKat'); var arr = CATS[tipe];
    sel.innerHTML = arr.map(function (c) { return '<option value="' + c.k + '">' + c.i + ' ' + esc(c.n) + '</option>'; }).join('');
  }
  function fillStatic() {
    $('khSumber').innerHTML = SUMBER.map(function (s) { return '<option value="' + s + '">' + esc(s) + '</option>'; }).join('');
    $('khTanggal').value = isoToday();
    $('khQuick').innerHTML = QUICK.map(function (q) { return '<button type="button" class="kh-qchip" data-quick="' + q.k + '">' + q.i + ' ' + esc(q.n) + '</button>'; }).join('');
    var all = CATS.out.concat(CATS.in);
    $('khFilterKat').innerHTML = '<option value="">Semua kategori</option>' + all.map(function (c) { return '<option value="' + c.k + '">' + c.i + ' ' + esc(c.n) + '</option>'; }).join('');
    $('khBudKat').innerHTML = CATS.out.map(function (c) { return '<option value="' + c.k + '">' + c.i + ' ' + esc(c.n) + '</option>'; }).join('');
  }

  /* ---------- render summary cards ---------- */
  function renderCards() {
    var saldo = 0; tx.forEach(function (x) { saldo += (x.tipe === 'in' ? 1 : -1) * x.jumlah; });
    var pin = 0, pout = 0; periodTx().forEach(function (x) { if (x.tipe === 'in') pin += x.jumlah; else pout += x.jumlah; });
    var sv = $('khSaldo'); sv.textContent = rp(saldo); sv.className = 'val ' + (saldo >= 0 ? 'pos' : 'neg');
    $('khIn').textContent = rp(pin); $('khOut').textContent = rp(pout);
    var lbl = '(' + periodName() + ')'; $('khPeriodLbl2').textContent = lbl; $('khPeriodLbl3').textContent = lbl;
  }

  /* ---------- breakdown by category (expense, period) ---------- */
  function renderBreakdown() {
    var map = {}, total = 0;
    periodTx().forEach(function (x) { if (x.tipe === 'out') { map[x.kategori] = (map[x.kategori] || 0) + x.jumlah; total += x.jumlah; } });
    var arr = []; for (var k in map) arr.push([k, map[k]]);
    arr.sort(function (a, b) { return b[1] - a[1]; });
    if (!arr.length) { $('khBreakdown').innerHTML = '<div class="kh-empty">Belum ada pengeluaran pada periode ini.</div>'; return; }
    $('khBreakdown').innerHTML = arr.map(function (r) {
      var pct = total ? Math.round(r[1] / total * 100) : 0;
      return '<div class="kh-bar"><div class="kh-bar-top"><span class="k">' + icoOf(r[0]) + ' ' + esc(nameOf(r[0])) + '</span><span class="v">' + rp(r[1]) + ' · ' + pct + '%</span></div>' +
        '<div class="kh-bar-track"><div class="kh-bar-fill" style="width:' + pct + '%"></div></div></div>';
    }).join('');
  }

  /* ---------- statistik ---------- */
  function renderStats() {
    var p = periodTx(), out = 0, cnt = p.length, days = {}, catMap = {};
    p.forEach(function (x) { if (x.tipe === 'out') { out += x.jumlah; days[x.tanggal] = (days[x.tanggal] || 0) + x.jumlah; catMap[x.kategori] = (catMap[x.kategori] || 0) + x.jumlah; } });
    var nDays = 0, maxDay = null, maxDayV = 0; for (var d in days) { nDays++; if (days[d] > maxDayV) { maxDayV = days[d]; maxDay = d; } }
    var topCat = null, topV = 0; for (var c in catMap) if (catMap[c] > topV) { topV = catMap[c]; topCat = c; }
    var avg = nDays ? out / nDays : 0;
    var rows = [
      ['Jumlah transaksi', cnt + 'x'],
      ['Rata-rata pengeluaran / hari aktif', rp(avg)],
      ['Kategori terbesar', topCat ? (icoOf(topCat) + ' ' + nameOf(topCat) + ' (' + rp(topV) + ')') : '—'],
      ['Hari paling boros', maxDay ? (maxDay.split('-').reverse().join('/') + ' (' + rp(maxDayV) + ')') : '—']
    ];
    $('khStats').innerHTML = rows.map(function (r) { return '<div class="kh-stat-row"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('');
  }

  /* ---------- saldo per sumber (all-time) ---------- */
  function renderSources() {
    var map = {}; SUMBER.forEach(function (s) { map[s] = 0; });
    tx.forEach(function (x) { var s = x.sumber || 'Lainnya'; if (map[s] === undefined) map[s] = 0; map[s] += (x.tipe === 'in' ? 1 : -1) * x.jumlah; });
    var rows = ''; for (var s in map) rows += '<div class="kh-stat-row"><span>' + esc(s) + '</span><b style="color:var(--' + (map[s] >= 0 ? 'up' : 'down') + ')">' + rp(map[s]) + '</b></div>';
    $('khSources').innerHTML = rows;
  }

  /* ---------- anggaran ---------- */
  function renderBudget() {
    var mk = monthKey(isoToday()), spent = {};
    tx.forEach(function (x) { if (x.tipe === 'out' && monthKey(x.tanggal) === mk) spent[x.kategori] = (spent[x.kategori] || 0) + x.jumlah; });
    var keys = []; for (var k in budget) if (budget[k] > 0) keys.push(k);
    if (!keys.length) { $('khBudget').innerHTML = '<div class="kh-empty">Belum ada anggaran. Pilih kategori &amp; tetapkan batas bulanan di atas.</div>'; return; }
    keys.sort();
    $('khBudget').innerHTML = keys.map(function (k) {
      var lim = budget[k], used = spent[k] || 0, pct = lim ? Math.min(100, Math.round(used / lim * 100)) : 0, over = used > lim;
      var sisa = lim - used;
      return '<div class="kh-bar"><div class="kh-bar-top"><span class="k">' + icoOf(k) + ' ' + esc(nameOf(k)) + '</span>' +
        '<span class="v">' + rp(used) + ' / ' + rp(lim) + ' · ' + (over ? 'lewat ' + rp(-sisa) : 'sisa ' + rp(sisa)) + ' <button type="button" data-delbud="' + k + '" style="background:none;border:0;color:var(--muted);cursor:pointer;font-size:13px">✕</button></span></div>' +
        '<div class="kh-bar-track"><div class="kh-bar-fill' + (over || pct >= 90 ? ' over' : '') + '" style="width:' + pct + '%"></div></div></div>';
    }).join('');
  }

  /* ---------- riwayat / jurnal ---------- */
  function renderList() {
    var q = ($('khSearch').value || '').toLowerCase(), ft = $('khFilterTipe').value, fk = $('khFilterKat').value;
    var list = tx.filter(function (x) {
      if (ft && x.tipe !== ft) return false;
      if (fk && x.kategori !== fk) return false;
      if (q) { var hay = (nameOf(x.kategori) + ' ' + (x.catatan || '') + ' ' + (x.sumber || '')).toLowerCase(); if (hay.indexOf(q) < 0) return false; }
      return true;
    });
    list.sort(function (a, b) { if (a.tanggal !== b.tanggal) return a.tanggal < b.tanggal ? 1 : -1; return (b.ts || 0) - (a.ts || 0); });
    if (!list.length) { $('khList').innerHTML = '<div class="kh-empty">Belum ada transaksi. Tambahkan lewat form di atas ⬆️</div>'; return; }
    var html = '', curDay = null, dayIn = 0, dayOut = 0, buff = '';
    function flushDay() {
      if (curDay === null) return;
      var net = dayIn - dayOut;
      html += '<div class="kh-daygroup"><div class="kh-dayhead"><b>' + dateLabel(curDay) + '</b><span>' + (dayIn ? '+' + rp(dayIn) + '  ' : '') + (dayOut ? '−' + rp(dayOut) : '') + (dayIn && dayOut ? '  = ' + rp(net) : '') + '</span></div>' + buff + '</div>';
      buff = ''; dayIn = 0; dayOut = 0;
    }
    list.forEach(function (x) {
      if (x.tanggal !== curDay) { flushDay(); curDay = x.tanggal; }
      if (x.tipe === 'in') dayIn += x.jumlah; else dayOut += x.jumlah;
      buff += '<div class="kh-item"><div class="kh-ic">' + icoOf(x.kategori) + '</div>' +
        '<div class="kh-it-body"><b>' + esc(nameOf(x.kategori)) + (x.catatan ? ' · <span style="color:var(--muted-strong);font-weight:500">' + esc(x.catatan) + '</span>' : '') + '</b><span>' + esc(x.sumber || '') + '</span></div>' +
        '<div class="kh-it-amt ' + x.tipe + '">' + (x.tipe === 'in' ? '+' : '−') + rp(x.jumlah).replace('Rp', 'Rp') + '</div>' +
        '<div class="kh-it-act"><button type="button" data-edit="' + x.id + '" title="Ubah">✎</button><button type="button" data-del="' + x.id + '" title="Hapus">🗑</button></div></div>';
    });
    flushDay();
    $('khList').innerHTML = html;
  }

  function renderAll() { renderCards(); renderBreakdown(); renderStats(); renderSources(); renderBudget(); renderList(); }

  /* ---------- form ---------- */
  function setTipe(t) {
    tipe = t;
    Array.prototype.forEach.call(document.querySelectorAll('.kh-tipe button'), function (b) { b.classList.toggle('on', b.getAttribute('data-tipe') === t); });
    fillKat();
    Array.prototype.forEach.call(document.querySelectorAll('#khQuick .kh-qchip'), function (c) { c.style.display = (t === 'out') ? '' : 'none'; });
  }
  $('khJumlah').addEventListener('input', function () { var c = this.selectionStart, before = this.value.length; this.value = grp(this.value); });
  $('khBudAmt').addEventListener('input', function () { this.value = grp(this.value); });
  Array.prototype.forEach.call(document.querySelectorAll('.kh-tipe button'), function (b) { b.addEventListener('click', function () { setTipe(b.getAttribute('data-tipe')); }); });
  $('khQuick').addEventListener('click', function (e) { var b = e.target.closest('[data-quick]'); if (!b) return; setTipe('out'); $('khKat').value = b.getAttribute('data-quick'); $('khJumlah').focus(); });

  $('khForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var jml = parseInt(digits($('khJumlah').value), 10);
    if (!jml || jml <= 0) { $('khJumlah').focus(); return; }
    var rec = { tipe: tipe, jumlah: jml, kategori: $('khKat').value, sumber: $('khSumber').value, tanggal: $('khTanggal').value || isoToday(), catatan: ($('khCatatan').value || '').trim() };
    if (editId) {
      for (var i = 0; i < tx.length; i++) if (tx[i].id === editId) { rec.id = editId; rec.ts = tx[i].ts; tx[i] = rec; break; }
      exitEdit();
    } else {
      rec.id = 'k' + Date.now() + Math.floor(Math.random() * 1000); rec.ts = Date.now(); tx.push(rec);
    }
    save(); resetForm(); renderAll();
  });
  function resetForm() { $('khJumlah').value = ''; $('khCatatan').value = ''; $('khTanggal').value = isoToday(); }
  function exitEdit() { editId = null; $('khSubmit').textContent = 'Tambah'; $('khFormTitle').textContent = '➕ Tambah transaksi'; $('khCancel').style.display = 'none'; }
  $('khCancel').addEventListener('click', function () { exitEdit(); resetForm(); });

  /* ---------- list actions ---------- */
  $('khList').addEventListener('click', function (e) {
    var ed = e.target.closest('[data-edit]'), dl = e.target.closest('[data-del]');
    if (ed) { startEdit(ed.getAttribute('data-edit')); return; }
    if (dl) {
      var id = dl.getAttribute('data-del');
      if (window.confirm('Hapus transaksi ini?')) { tx = tx.filter(function (x) { return x.id !== id; }); save(); renderAll(); }
    }
  });
  function startEdit(id) {
    var r = null; for (var i = 0; i < tx.length; i++) if (tx[i].id === id) { r = tx[i]; break; } if (!r) return;
    editId = id; setTipe(r.tipe); $('khJumlah').value = grp('' + r.jumlah); $('khKat').value = r.kategori; $('khSumber').value = r.sumber || 'Tunai'; $('khTanggal').value = r.tanggal; $('khCatatan').value = r.catatan || '';
    $('khSubmit').textContent = 'Simpan perubahan'; $('khFormTitle').textContent = '✎ Ubah transaksi'; $('khCancel').style.display = '';
    $('khJumlah').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- period ---------- */
  $('khPeriod').addEventListener('click', function (e) {
    var b = e.target.closest('[data-period]'); if (!b) return;
    period = b.getAttribute('data-period');
    Array.prototype.forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    $('khCustomRange').style.display = (period === 'custom') ? '' : 'none';
    renderCards(); renderBreakdown(); renderStats();
  });
  $('khFrom').addEventListener('change', function () { renderCards(); renderBreakdown(); renderStats(); });
  $('khTo').addEventListener('change', function () { renderCards(); renderBreakdown(); renderStats(); });

  /* ---------- filters ---------- */
  $('khSearch').addEventListener('input', renderList);
  $('khFilterTipe').addEventListener('change', renderList);
  $('khFilterKat').addEventListener('change', renderList);

  /* ---------- budget ---------- */
  $('khBudSet').addEventListener('click', function () {
    var k = $('khBudKat').value, v = parseInt(digits($('khBudAmt').value), 10);
    if (!v || v <= 0) { $('khBudAmt').focus(); return; }
    budget[k] = v; $('khBudAmt').value = ''; save(); renderBudget();
  });
  $('khBudget').addEventListener('click', function (e) {
    var b = e.target.closest('[data-delbud]'); if (!b) return;
    delete budget[b.getAttribute('data-delbud')]; save(); renderBudget();
  });

  /* ---------- actions: export/import/print/reset ---------- */
  document.querySelector('.kh-actions').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var a = b.getAttribute('data-act');
    if (a === 'csv') exportCSV();
    else if (a === 'json') exportJSON();
    else if (a === 'import') $('khFile').click();
    else if (a === 'print') printReport();
    else if (a === 'reset') { if (window.confirm('Hapus SEMUA catatan & anggaran? Tindakan ini tidak bisa dibatalkan.')) { tx = []; budget = {}; save(); renderAll(); } }
  });
  function dl(name, content, type) {
    try { var blob = new Blob([content], { type: type }); var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function () { URL.revokeObjectURL(url); }, 2000); } catch (e) {}
  }
  function exportCSV() {
    var rows = [['Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Sumber', 'Catatan']];
    tx.slice().sort(function (a, b) { return a.tanggal < b.tanggal ? -1 : 1; }).forEach(function (x) {
      rows.push([x.tanggal, x.tipe === 'in' ? 'Pemasukan' : 'Pengeluaran', nameOf(x.kategori), x.jumlah, x.sumber || '', (x.catatan || '').replace(/"/g, '""')]);
    });
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + c + '"'; }).join(','); }).join('\n');
    dl('catatan-keuangan.csv', '﻿' + csv, 'text/csv;charset=utf-8');
  }
  function exportJSON() { dl('catatan-keuangan-backup.json', JSON.stringify({ tx: tx, budget: budget, exported: new Date().toISOString() }, null, 2), 'application/json'); }
  $('khFile').addEventListener('change', function () {
    var f = this.files && this.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var data = JSON.parse(rd.result);
        var inc = data.tx || (Array.isArray(data) ? data : []);
        if (!Array.isArray(inc)) throw 0;
        var mode = window.confirm('Gabungkan dengan data yang ada?\n\nOK = Gabung · Batal = Ganti total');
        if (mode) { var ids = {}; tx.forEach(function (x) { ids[x.id] = 1; }); inc.forEach(function (x) { if (x && x.id && !ids[x.id]) tx.push(x); }); }
        else { tx = inc; }
        if (data.budget && !mode) budget = data.budget; else if (data.budget) { for (var k in data.budget) budget[k] = data.budget[k]; }
        save(); renderAll(); window.alert('Impor berhasil.');
      } catch (e) { window.alert('File tidak valid.'); }
    };
    rd.readAsText(f); this.value = '';
  });
  function printReport() {
    var saldo = 0, pin = 0, pout = 0; tx.forEach(function (x) { saldo += (x.tipe === 'in' ? 1 : -1) * x.jumlah; });
    var p = periodTx(); p.forEach(function (x) { if (x.tipe === 'in') pin += x.jumlah; else pout += x.jumlah; });
    var rows = p.slice().sort(function (a, b) { return a.tanggal < b.tanggal ? -1 : 1; }).map(function (x) {
      return '<tr><td>' + x.tanggal + '</td><td>' + (x.tipe === 'in' ? 'Masuk' : 'Keluar') + '</td><td>' + esc(nameOf(x.kategori)) + '</td><td>' + esc(x.catatan || '') + '</td><td style="text-align:right">' + rp(x.jumlah) + '</td></tr>';
    }).join('');
    var w = window.open('', '_blank'); if (!w) return;
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Laporan Keuangan</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:20px}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#eee}.s{display:flex;gap:24px;margin:10px 0}</style></head><body>' +
      '<h1>Laporan Keuangan (' + periodName() + ')</h1><div class="s"><div><b>Saldo total:</b> ' + rp(saldo) + '</div><div><b>Pemasukan:</b> ' + rp(pin) + '</div><div><b>Pengeluaran:</b> ' + rp(pout) + '</div></div>' +
      '<table><thead><tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Catatan</th><th>Jumlah</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">Tidak ada data</td></tr>') + '</tbody></table>' +
      '<p style="margin-top:16px;font-size:11px;color:#666">Dibuat dengan Bekal — pusatbanksoal.id</p></body></html>');
    w.document.close(); setTimeout(function () { w.print(); }, 300);
  }

  /* ---------- boot ---------- */
  fillStatic(); setTipe('out'); renderAll();
})();
