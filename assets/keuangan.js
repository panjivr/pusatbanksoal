/* ============================================================
   Bekal — Catatan Keuangan Harian (ES5, localStorage, no build)
   Pemasukan & pengeluaran pribadi: kategori lengkap, anggaran,
   statistik, tren, transaksi berulang, target menabung,
   ekspor CSV / Excel (.xlsx dengan saldo berjalan & drawdown).
   Data 100% lokal di perangkat.
   ============================================================ */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  var $ = function (id) { return document.getElementById(id); };
  if (!$('khForm')) return;

  var LS_TX = 'bekal_keuangan_tx_v1', LS_BUD = 'bekal_keuangan_budget_v1',
      LS_REC = 'bekal_keuangan_recur_v1', LS_GOAL = 'bekal_keuangan_goal_v1';

  var CATS = {
    out: [
      { k: 'makan', n: 'Makan & Minum', i: '🍽️' }, { k: 'rokok', n: 'Rokok', i: '🚬' },
      { k: 'bensin', n: 'Bensin & Transport', i: '⛽' }, { k: 'kopi', n: 'Kopi & Jajan', i: '☕' },
      { k: 'belanja', n: 'Belanja Harian', i: '🛒' }, { k: 'pulsa', n: 'Pulsa & Internet', i: '📱' },
      { k: 'tagihan', n: 'Tagihan (listrik/air)', i: '🧾' }, { k: 'sewa', n: 'Sewa / Kos', i: '🏠' },
      { k: 'kesehatan', n: 'Kesehatan', i: '💊' }, { k: 'pendidikan', n: 'Pendidikan', i: '📚' },
      { k: 'hiburan', n: 'Hiburan', i: '🎮' }, { k: 'pakaian', n: 'Pakaian', i: '👕' },
      { k: 'parkir', n: 'Parkir & Tol', i: '🅿️' }, { k: 'sedekah', n: 'Sedekah / Donasi', i: '🤲' },
      { k: 'cicilan', n: 'Cicilan / Utang', i: '💳' }, { k: 'anak', n: 'Anak & Keluarga', i: '👨‍👩‍👧' },
      { k: 'hewan', n: 'Hewan Peliharaan', i: '🐾' }, { k: 'olahraga', n: 'Olahraga & Gym', i: '🏋️' },
      { k: 'perawatan', n: 'Perawatan Diri', i: '💇' }, { k: 'transfer-out', n: 'Transfer / Kirim', i: '📤' },
      { k: 'lain-out', n: 'Lain-lain', i: '📦' }
    ],
    in: [
      { k: 'gaji', n: 'Gaji', i: '💼' }, { k: 'usaha', n: 'Usaha / Dagang', i: '🏪' },
      { k: 'freelance', n: 'Freelance / Proyek', i: '💻' }, { k: 'bonus', n: 'Bonus / THR', i: '🎁' },
      { k: 'hadiah', n: 'Hadiah / Kiriman', i: '🎀' }, { k: 'jual', n: 'Penjualan Barang', i: '🏷️' },
      { k: 'investasi', n: 'Investasi / Bunga', i: '📈' }, { k: 'uang-saku', n: 'Uang Saku', i: '🧧' },
      { k: 'refund', n: 'Refund / Kembalian', i: '↩️' }, { k: 'lain-in', n: 'Lain-lain', i: '💰' }
    ]
  };
  var SUMBER = ['Tunai', 'Bank', 'E-wallet', 'Lainnya'];
  var QUICK = [
    { n: 'Makan', k: 'makan', i: '🍽️' }, { n: 'Rokok', k: 'rokok', i: '🚬' }, { n: 'Bensin', k: 'bensin', i: '⛽' },
    { n: 'Kopi', k: 'kopi', i: '☕' }, { n: 'Parkir', k: 'parkir', i: '🅿️' }, { n: 'Pulsa', k: 'pulsa', i: '📱' }, { n: 'Belanja', k: 'belanja', i: '🛒' }
  ];

  /* ---------- state ---------- */
  var tx = [], budget = {}, recur = [], goal = null;
  try { tx = JSON.parse(localStorage.getItem(LS_TX) || '[]') || []; } catch (e) {}
  try { budget = JSON.parse(localStorage.getItem(LS_BUD) || '{}') || {}; } catch (e) {}
  try { recur = JSON.parse(localStorage.getItem(LS_REC) || '[]') || []; } catch (e) {}
  try { goal = JSON.parse(localStorage.getItem(LS_GOAL) || 'null'); } catch (e) {}
  var tipe = 'out', period = 'month', editId = null;

  function save() {
    try {
      localStorage.setItem(LS_TX, JSON.stringify(tx)); localStorage.setItem(LS_BUD, JSON.stringify(budget));
      localStorage.setItem(LS_REC, JSON.stringify(recur)); localStorage.setItem(LS_GOAL, JSON.stringify(goal));
    } catch (e) {}
    flash();
  }
  function flash() { var s = $('khSaved'); if (!s) return; s.classList.add('on'); setTimeout(function () { s.classList.remove('on'); }, 1100); }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function rp(n) { n = Math.round(n || 0); var neg = n < 0; n = Math.abs(n); return (neg ? '−Rp' : 'Rp') + (('' + n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')); }
  function digits(s) { return ('' + s).replace(/[^\d]/g, ''); }
  function grp(s) { s = digits(s); return s ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''; }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isoOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function isoToday() { return isoOf(new Date()); }
  function parseIso(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function catOf(t, k) { var arr = CATS[t] || []; for (var i = 0; i < arr.length; i++) if (arr[i].k === k) return arr[i]; return null; }
  function icoOf(k) { var c = catOf('out', k) || catOf('in', k); return c ? c.i : '📦'; }
  function nameOf(k) { var c = catOf('out', k) || catOf('in', k); return c ? c.n : k; }
  function monthKey(iso) { return iso.slice(0, 7); }
  var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  function dateLabel(iso) {
    var p = iso.split('-'), d = parseIso(iso);
    var s = HARI[d.getDay()] + ', ' + (+p[2]) + ' ' + BLN[+p[1] - 1] + ' ' + p[0];
    if (iso === isoToday()) return 'Hari ini · ' + s;
    var y = new Date(); y.setDate(y.getDate() - 1); if (iso === isoOf(y)) return 'Kemarin · ' + s;
    return s;
  }

  /* ---------- period ---------- */
  function inPeriod(iso) {
    if (period === 'all') return true;
    var t = isoToday();
    if (period === 'today') return iso === t;
    if (period === 'month') return monthKey(iso) === monthKey(t);
    if (period === 'week') { var now = new Date(), day = (now.getDay() + 6) % 7, start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day); var d = parseIso(iso); return d >= start && d <= now; }
    if (period === 'custom') { var f = $('khFrom').value, to = $('khTo').value; if (f && iso < f) return false; if (to && iso > to) return false; return true; }
    return true;
  }
  function periodTx() { return tx.filter(function (x) { return inPeriod(x.tanggal); }); }
  function periodName() { return { today: 'hari ini', week: 'minggu ini', month: 'bulan ini', all: 'semua', custom: 'rentang' }[period]; }

  /* ---------- selects ---------- */
  function fillKat() { $('khKat').innerHTML = CATS[tipe].map(function (c) { return '<option value="' + c.k + '">' + c.i + ' ' + esc(c.n) + '</option>'; }).join(''); }
  function fillStatic() {
    $('khSumber').innerHTML = SUMBER.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('');
    $('khTanggal').value = isoToday();
    $('khQuick').innerHTML = QUICK.map(function (q) { return '<button type="button" class="kh-qchip" data-quick="' + q.k + '">' + q.i + ' ' + esc(q.n) + '</button>'; }).join('');
    var all = CATS.out.concat(CATS.in);
    $('khFilterKat').innerHTML = '<option value="">Semua kategori</option>' + all.map(function (c) { return '<option value="' + c.k + '">' + c.i + ' ' + esc(c.n) + '</option>'; }).join('');
    $('khBudKat').innerHTML = CATS.out.map(function (c) { return '<option value="' + c.k + '">' + c.i + ' ' + esc(c.n) + '</option>'; }).join('');
    if ($('khRecKat')) $('khRecKat').innerHTML = CATS.out.concat(CATS.in).map(function (c) { return '<option value="' + c.k + '">' + c.i + ' ' + esc(c.n) + '</option>'; }).join('');
    if ($('khRecSumber')) $('khRecSumber').innerHTML = SUMBER.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('');
  }

  /* ---------- recurring (transaksi berulang) ---------- */
  function nextDate(d, freq) {
    var n = new Date(d.getTime());
    if (freq === 'harian') n.setDate(n.getDate() + 1);
    else if (freq === 'mingguan') n.setDate(n.getDate() + 7);
    else { var day = n.getDate(); n.setDate(1); n.setMonth(n.getMonth() + 1); var dim = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate(); n.setDate(Math.min(day, dim)); }
    return n;
  }
  function applyRecurring() {
    var today = isoToday(), added = 0;
    recur.forEach(function (r) {
      var cursor = r.lastRun ? nextDate(parseIso(r.lastRun), r.freq) : parseIso(r.mulai);
      var guard = 0;
      while (isoOf(cursor) <= today && guard < 500) {
        var iso = isoOf(cursor);
        if (iso >= r.mulai) {
          tx.push({ id: 'k' + Date.now() + '_' + Math.floor(Math.random() * 1e5) + '_' + guard, tipe: r.tipe, jumlah: r.jumlah, kategori: r.kategori, sumber: r.sumber, tanggal: iso, catatan: (r.catatan || '') + ' (berulang)', ts: Date.now(), recur: r.id });
          r.lastRun = iso; added++;
        }
        cursor = nextDate(cursor, r.freq);
        guard++;
      }
    });
    if (added) save();
    return added;
  }
  function renderRecur() {
    if (!$('khRecList')) return;
    if (!recur.length) { $('khRecList').innerHTML = '<div class="kh-empty">Belum ada transaksi berulang. Cocok untuk gaji, uang saku, cicilan, sewa/kos, atau langganan.</div>'; return; }
    $('khRecList').innerHTML = recur.map(function (r) {
      var freqL = { harian: 'tiap hari', mingguan: 'tiap minggu', bulanan: 'tiap bulan' }[r.freq];
      return '<div class="kh-item"><div class="kh-ic">' + icoOf(r.kategori) + '</div><div class="kh-it-body"><b>' + esc(nameOf(r.kategori)) + (r.catatan ? ' · <span style="color:var(--muted-strong);font-weight:500">' + esc(r.catatan) + '</span>' : '') + '</b><span>' + freqL + ' · mulai ' + r.mulai + ' · ' + esc(r.sumber) + '</span></div>' +
        '<div class="kh-it-amt ' + r.tipe + '">' + (r.tipe === 'in' ? '+' : '−') + rp(r.jumlah) + '</div>' +
        '<div class="kh-it-act"><button type="button" data-delrec="' + r.id + '" title="Hapus">🗑</button></div></div>';
    }).join('');
  }

  /* ---------- target menabung ---------- */
  function saldoTotal() { var s = 0; tx.forEach(function (x) { s += (x.tipe === 'in' ? 1 : -1) * x.jumlah; }); return s; }
  function renderGoal() {
    if (!$('khGoalWrap')) return;
    if (!goal || !goal.target) { $('khGoalWrap').innerHTML = '<div class="kh-empty">Belum ada target. Tetapkan target menabung untuk memantau progресmu.</div>'; return; }
    var cur = Math.max(0, saldoTotal()), pct = goal.target ? Math.min(100, Math.round(cur / goal.target * 100)) : 0, sisa = goal.target - cur;
    var extra = '';
    if (goal.deadline) {
      var months = Math.max(1, Math.ceil((parseIso(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)));
      extra = sisa > 0 ? ' · perlu nabung ± <b>' + rp(sisa / months) + '</b>/bulan (target ' + goal.deadline + ')' : ' · 🎉 target tercapai!';
    }
    $('khGoalWrap').innerHTML = '<div class="kh-bar"><div class="kh-bar-top"><span class="k">' + esc(goal.nama || 'Target menabung') + '</span>' +
      '<span class="v">' + rp(cur) + ' / ' + rp(goal.target) + ' · ' + pct + '% <button type="button" id="khGoalDel" style="background:none;border:0;color:var(--muted);cursor:pointer;font-size:13px">✕</button></span></div>' +
      '<div class="kh-bar-track"><div class="kh-bar-fill' + (pct >= 100 ? ' done' : '') + '" style="width:' + pct + '%"></div></div>' +
      '<p style="font-size:12.5px;color:var(--muted-strong);margin:8px 0 0;line-height:1.5">' + (sisa > 0 ? 'Kurang <b>' + rp(sisa) + '</b> lagi' : '🎉 Target tercapai!') + extra + '</p></div>';
    var del = $('khGoalDel'); if (del) del.addEventListener('click', function () { goal = null; save(); renderGoal(); });
  }

  /* ---------- summary cards ---------- */
  function renderCards() {
    var saldo = saldoTotal(), pin = 0, pout = 0;
    periodTx().forEach(function (x) { if (x.tipe === 'in') pin += x.jumlah; else pout += x.jumlah; });
    var sv = $('khSaldo'); sv.textContent = rp(saldo); sv.className = 'val ' + (saldo >= 0 ? 'pos' : 'neg');
    $('khIn').textContent = rp(pin); $('khOut').textContent = rp(pout);
    var lbl = '(' + periodName() + ')'; $('khPeriodLbl2').textContent = lbl; $('khPeriodLbl3').textContent = lbl;
  }

  /* ---------- breakdown ---------- */
  function renderBreakdown() {
    var map = {}, total = 0;
    periodTx().forEach(function (x) { if (x.tipe === 'out') { map[x.kategori] = (map[x.kategori] || 0) + x.jumlah; total += x.jumlah; } });
    var arr = []; for (var k in map) arr.push([k, map[k]]); arr.sort(function (a, b) { return b[1] - a[1]; });
    if (!arr.length) { $('khBreakdown').innerHTML = '<div class="kh-empty">Belum ada pengeluaran pada periode ini.</div>'; return; }
    $('khBreakdown').innerHTML = arr.map(function (r) {
      var pct = total ? Math.round(r[1] / total * 100) : 0;
      return '<div class="kh-bar"><div class="kh-bar-top"><span class="k">' + icoOf(r[0]) + ' ' + esc(nameOf(r[0])) + '</span><span class="v">' + rp(r[1]) + ' · ' + pct + '%</span></div>' +
        '<div class="kh-bar-track"><div class="kh-bar-fill" style="width:' + pct + '%"></div></div></div>';
    }).join('');
  }

  /* ---------- tren harian (chart) ---------- */
  function renderTrend() {
    if (!$('khTrend')) return;
    var p = periodTx();
    if (!p.length) { $('khTrend').innerHTML = '<div class="kh-empty">Belum ada data untuk grafik.</div>'; return; }
    var days = {}; p.forEach(function (x) { days[x.tanggal] = (days[x.tanggal] || 0) + (x.tipe === 'in' ? x.jumlah : -x.jumlah); });
    var keys = []; for (var d in days) keys.push(d); keys.sort();
    if (keys.length > 31) keys = keys.slice(keys.length - 31);
    var maxAbs = 1; keys.forEach(function (k) { maxAbs = Math.max(maxAbs, Math.abs(days[k])); });
    var W = Math.max(keys.length * 16, 40), H = 90, mid = H / 2, bw = 11;
    var bars = keys.map(function (k, i) {
      var v = days[k], h = Math.round(Math.abs(v) / maxAbs * (mid - 6)), x = i * 16 + 2;
      var y = v >= 0 ? mid - h : mid, col = v >= 0 ? 'var(--up)' : 'var(--down)';
      return '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + Math.max(h, 1) + '" rx="2" fill="' + col + '"><title>' + k + ': ' + (v >= 0 ? '+' : '') + rp(v) + '</title></rect>';
    }).join('');
    $('khTrend').innerHTML = '<div style="overflow-x:auto"><svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" style="display:block;min-width:100%"><line x1="0" y1="' + mid + '" x2="' + W + '" y2="' + mid + '" stroke="var(--hair-dark)" stroke-width="1"/>' + bars + '</svg></div>' +
      '<p style="font-size:11.5px;color:var(--muted);margin:6px 0 0">Saldo harian (hijau = surplus, merah = defisit) — maks ' + rp(maxAbs) + '. Sentuh batang untuk detail.</p>';
  }

  /* ---------- statistik + perbandingan bulan ---------- */
  function renderStats() {
    var p = periodTx(), out = 0, cnt = p.length, days = {}, catMap = {};
    p.forEach(function (x) { if (x.tipe === 'out') { out += x.jumlah; days[x.tanggal] = (days[x.tanggal] || 0) + x.jumlah; catMap[x.kategori] = (catMap[x.kategori] || 0) + x.jumlah; } });
    var nDays = 0, maxDay = null, maxDayV = 0; for (var d in days) { nDays++; if (days[d] > maxDayV) { maxDayV = days[d]; maxDay = d; } }
    var topCat = null, topV = 0; for (var c in catMap) if (catMap[c] > topV) { topV = catMap[c]; topCat = c; }
    var rows = [
      ['Jumlah transaksi', cnt + '×'],
      ['Rata-rata pengeluaran / hari aktif', rp(nDays ? out / nDays : 0)],
      ['Kategori terbesar', topCat ? (icoOf(topCat) + ' ' + nameOf(topCat) + ' (' + rp(topV) + ')') : '—'],
      ['Hari paling boros', maxDay ? (maxDay.split('-').reverse().join('/') + ' (' + rp(maxDayV) + ')') : '—']
    ];
    // month-over-month
    var t = new Date(), thisMk = monthKey(isoToday()); var lm = new Date(t.getFullYear(), t.getMonth() - 1, 1); var lastMk = monthKey(isoOf(lm));
    var mo = { thisOut: 0, lastOut: 0 }; tx.forEach(function (x) { if (x.tipe === 'out') { if (monthKey(x.tanggal) === thisMk) mo.thisOut += x.jumlah; else if (monthKey(x.tanggal) === lastMk) mo.lastOut += x.jumlah; } });
    if (mo.lastOut > 0) {
      var diff = mo.thisOut - mo.lastOut, pctd = Math.round(diff / mo.lastOut * 100);
      rows.push(['Pengeluaran vs bulan lalu', (diff <= 0 ? '↓ ' : '↑ ') + Math.abs(pctd) + '% (' + rp(Math.abs(diff)) + (diff <= 0 ? ' lebih hemat' : ' lebih boros') + ')']);
    }
    $('khStats').innerHTML = rows.map(function (r) { return '<div class="kh-stat-row"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('');
  }

  /* ---------- sumber ---------- */
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
      var lim = budget[k], used = spent[k] || 0, pct = lim ? Math.min(100, Math.round(used / lim * 100)) : 0, over = used > lim, sisa = lim - used;
      return '<div class="kh-bar"><div class="kh-bar-top"><span class="k">' + icoOf(k) + ' ' + esc(nameOf(k)) + '</span>' +
        '<span class="v">' + rp(used) + ' / ' + rp(lim) + ' · ' + (over ? 'lewat ' + rp(-sisa) : 'sisa ' + rp(sisa)) + ' <button type="button" data-delbud="' + k + '" style="background:none;border:0;color:var(--muted);cursor:pointer;font-size:13px">✕</button></span></div>' +
        '<div class="kh-bar-track"><div class="kh-bar-fill' + (over || pct >= 90 ? ' over' : '') + '" style="width:' + pct + '%"></div></div></div>';
    }).join('');
  }

  /* ---------- riwayat ---------- */
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
      html += '<div class="kh-daygroup"><div class="kh-dayhead"><b>' + dateLabel(curDay) + '</b><span>' + (dayIn ? '<b style="color:var(--up)">+' + rp(dayIn) + '</b>  ' : '') + (dayOut ? '<b style="color:var(--down)">−' + rp(dayOut) + '</b>' : '') + '</span></div>' + buff + '</div>';
      buff = ''; dayIn = 0; dayOut = 0;
    }
    list.forEach(function (x) {
      if (x.tanggal !== curDay) { flushDay(); curDay = x.tanggal; }
      if (x.tipe === 'in') dayIn += x.jumlah; else dayOut += x.jumlah;
      buff += '<div class="kh-item"><div class="kh-ic">' + icoOf(x.kategori) + '</div>' +
        '<div class="kh-it-body"><b>' + esc(nameOf(x.kategori)) + (x.catatan ? ' · <span style="color:var(--muted-strong);font-weight:500">' + esc(x.catatan) + '</span>' : '') + '</b><span>' + esc(x.sumber || '') + '</span></div>' +
        '<div class="kh-it-amt ' + x.tipe + '">' + (x.tipe === 'in' ? '+' : '−') + rp(x.jumlah) + '</div>' +
        '<div class="kh-it-act"><button type="button" data-edit="' + x.id + '" title="Ubah">✎</button><button type="button" data-del="' + x.id + '" title="Hapus">🗑</button></div></div>';
    });
    flushDay();
    $('khList').innerHTML = html;
  }

  function renderAll() { renderCards(); renderBreakdown(); renderTrend(); renderStats(); renderSources(); renderBudget(); renderList(); renderRecur(); renderGoal(); }

  /* ---------- form ---------- */
  function setTipe(t) {
    tipe = t;
    Array.prototype.forEach.call(document.querySelectorAll('.kh-tipe button'), function (b) { b.classList.toggle('on', b.getAttribute('data-tipe') === t); });
    fillKat();
    Array.prototype.forEach.call(document.querySelectorAll('#khQuick .kh-qchip'), function (c) { c.style.display = (t === 'out') ? '' : 'none'; });
  }
  $('khJumlah').addEventListener('input', function () { this.value = grp(this.value); });
  $('khBudAmt').addEventListener('input', function () { this.value = grp(this.value); });
  Array.prototype.forEach.call(document.querySelectorAll('.kh-tipe button'), function (b) { b.addEventListener('click', function () { setTipe(b.getAttribute('data-tipe')); }); });
  $('khQuick').addEventListener('click', function (e) { var b = e.target.closest('[data-quick]'); if (!b) return; setTipe('out'); $('khKat').value = b.getAttribute('data-quick'); $('khJumlah').focus(); });

  $('khForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var jml = parseInt(digits($('khJumlah').value), 10);
    if (!jml || jml <= 0) { $('khJumlah').focus(); return; }
    var rec = { tipe: tipe, jumlah: jml, kategori: $('khKat').value, sumber: $('khSumber').value, tanggal: $('khTanggal').value || isoToday(), catatan: ($('khCatatan').value || '').trim() };
    if (editId) { for (var i = 0; i < tx.length; i++) if (tx[i].id === editId) { rec.id = editId; rec.ts = tx[i].ts; tx[i] = rec; break; } exitEdit(); }
    else { rec.id = 'k' + Date.now() + Math.floor(Math.random() * 1000); rec.ts = Date.now(); tx.push(rec); }
    save(); resetForm(); renderAll();
  });
  function resetForm() { $('khJumlah').value = ''; $('khCatatan').value = ''; $('khTanggal').value = isoToday(); }
  function exitEdit() { editId = null; $('khSubmit').textContent = 'Tambah'; $('khFormTitle').textContent = '➕ Tambah transaksi'; $('khCancel').style.display = 'none'; }
  $('khCancel').addEventListener('click', function () { exitEdit(); resetForm(); });

  $('khList').addEventListener('click', function (e) {
    var ed = e.target.closest('[data-edit]'), dl = e.target.closest('[data-del]');
    if (ed) { startEdit(ed.getAttribute('data-edit')); return; }
    if (dl) { var id = dl.getAttribute('data-del'); if (window.confirm('Hapus transaksi ini?')) { tx = tx.filter(function (x) { return x.id !== id; }); save(); renderAll(); } }
  });
  function startEdit(id) {
    var r = null; for (var i = 0; i < tx.length; i++) if (tx[i].id === id) { r = tx[i]; break; } if (!r) return;
    editId = id; setTipe(r.tipe); $('khJumlah').value = grp('' + r.jumlah); $('khKat').value = r.kategori; $('khSumber').value = r.sumber || 'Tunai'; $('khTanggal').value = r.tanggal; $('khCatatan').value = r.catatan || '';
    $('khSubmit').textContent = 'Simpan perubahan'; $('khFormTitle').textContent = '✎ Ubah transaksi'; $('khCancel').style.display = '';
    $('khJumlah').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- period / filter ---------- */
  $('khPeriod').addEventListener('click', function (e) {
    var b = e.target.closest('[data-period]'); if (!b) return; period = b.getAttribute('data-period');
    Array.prototype.forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
    $('khCustomRange').style.display = (period === 'custom') ? '' : 'none';
    renderCards(); renderBreakdown(); renderTrend(); renderStats();
  });
  $('khFrom').addEventListener('change', function () { renderCards(); renderBreakdown(); renderTrend(); renderStats(); });
  $('khTo').addEventListener('change', function () { renderCards(); renderBreakdown(); renderTrend(); renderStats(); });
  $('khSearch').addEventListener('input', renderList);
  $('khFilterTipe').addEventListener('change', renderList);
  $('khFilterKat').addEventListener('change', renderList);

  /* ---------- budget ---------- */
  $('khBudSet').addEventListener('click', function () { var k = $('khBudKat').value, v = parseInt(digits($('khBudAmt').value), 10); if (!v || v <= 0) { $('khBudAmt').focus(); return; } budget[k] = v; $('khBudAmt').value = ''; save(); renderBudget(); });
  $('khBudget').addEventListener('click', function (e) { var b = e.target.closest('[data-delbud]'); if (!b) return; delete budget[b.getAttribute('data-delbud')]; save(); renderBudget(); });

  /* ---------- recurring UI ---------- */
  if ($('khRecAmt')) $('khRecAmt').addEventListener('input', function () { this.value = grp(this.value); });
  if ($('khRecAdd')) $('khRecAdd').addEventListener('click', function () {
    var v = parseInt(digits($('khRecAmt').value), 10); if (!v || v <= 0) { $('khRecAmt').focus(); return; }
    var kat = $('khRecKat').value, isIn = !!catOf('in', kat);
    recur.push({ id: 'r' + Date.now(), tipe: isIn ? 'in' : 'out', jumlah: v, kategori: kat, sumber: $('khRecSumber').value, freq: $('khRecFreq').value, mulai: $('khRecMulai').value || isoToday(), catatan: ($('khRecCat').value || '').trim(), lastRun: null });
    $('khRecAmt').value = ''; $('khRecCat').value = '';
    applyRecurring(); save(); renderAll();
  });
  if ($('khRecList')) $('khRecList').addEventListener('click', function (e) { var b = e.target.closest('[data-delrec]'); if (!b) return; if (window.confirm('Hapus jadwal berulang ini? (transaksi yang sudah tercatat tetap ada)')) { recur = recur.filter(function (r) { return r.id !== b.getAttribute('data-delrec'); }); save(); renderRecur(); } });

  /* ---------- goal UI ---------- */
  if ($('khGoalAmt')) $('khGoalAmt').addEventListener('input', function () { this.value = grp(this.value); });
  if ($('khGoalSet')) $('khGoalSet').addEventListener('click', function () {
    var v = parseInt(digits($('khGoalAmt').value), 10); if (!v || v <= 0) { $('khGoalAmt').focus(); return; }
    goal = { target: v, nama: ($('khGoalName').value || 'Target menabung').trim(), deadline: $('khGoalDate').value || '' };
    save(); renderGoal();
  });

  /* ---------- ekspor / impor ---------- */
  document.querySelector('.kh-actions').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.getAttribute('data-act');
    if (a === 'xlsx') exportXLSX();
    else if (a === 'csv') exportCSV();
    else if (a === 'json') exportJSON();
    else if (a === 'import') $('khFile').click();
    else if (a === 'print') printReport();
    else if (a === 'reset') { if (window.confirm('Hapus SEMUA catatan, anggaran, jadwal berulang & target? Tidak bisa dibatalkan.')) { tx = []; budget = {}; recur = []; goal = null; save(); renderAll(); } }
  });
  function dl(name, content, type) { try { var blob = (content instanceof Uint8Array) ? new Blob([content], { type: type }) : new Blob([content], { type: type }); var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function () { URL.revokeObjectURL(url); }, 3000); } catch (e) {} }

  function txSorted() { return tx.slice().sort(function (a, b) { if (a.tanggal !== b.tanggal) return a.tanggal < b.tanggal ? -1 : 1; return (a.ts || 0) - (b.ts || 0); }); }

  function exportCSV() {
    var rows = [['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Sumber', 'Pemasukan', 'Pengeluaran', 'Saldo Berjalan', 'Drawdown']];
    var bal = 0, peak = 0;
    txSorted().forEach(function (x) { bal += (x.tipe === 'in' ? 1 : -1) * x.jumlah; peak = Math.max(peak, bal); rows.push([x.tanggal, x.tipe === 'in' ? 'Pemasukan' : 'Pengeluaran', nameOf(x.kategori), (x.catatan || '').replace(/"/g, '""'), x.sumber || '', x.tipe === 'in' ? x.jumlah : '', x.tipe === 'out' ? x.jumlah : '', bal, bal - peak]); });
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + c + '"'; }).join(','); }).join('\r\n');
    dl('catatan-keuangan.csv', '﻿' + csv, 'text/csv;charset=utf-8');
  }
  function exportJSON() { dl('catatan-keuangan-backup.json', JSON.stringify({ tx: tx, budget: budget, recur: recur, goal: goal, exported: new Date().toISOString() }, null, 2), 'application/json'); }

  /* ===== XLSX (Excel asli) builder — ZIP store + CRC32 ===== */
  var _crcT = (function () { var t = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; } return t; })();
  function crc32(u8) { var c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = _crcT[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function utf8(str) { if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str); var u = unescape(encodeURIComponent(str)), a = new Uint8Array(u.length); for (var i = 0; i < u.length; i++) a[i] = u.charCodeAt(i); return a; }
  function zipStore(files) {
    var parts = [], central = [], offset = 0;
    function u16(n) { return [n & 255, (n >> 8) & 255]; }
    function u32(n) { return [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255]; }
    files.forEach(function (f) {
      var nb = utf8(f.name), crc = crc32(f.data), sz = f.data.length;
      var lh = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(sz), u32(sz), u16(nb.length), u16(0));
      parts.push(new Uint8Array(lh), nb, f.data);
      var cd = [].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(sz), u32(sz), u16(nb.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset));
      central.push(new Uint8Array(cd), nb);
      offset += lh.length + nb.length + sz;
    });
    var cStart = offset, cSize = 0; central.forEach(function (c) { cSize += c.length; });
    var end = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cSize), u32(cStart), u16(0)));
    var all = parts.concat(central); all.push(end);
    var total = 0; all.forEach(function (a) { total += a.length; });
    var out = new Uint8Array(total), pos = 0; all.forEach(function (a) { out.set(a, pos); pos += a.length; });
    return out;
  }
  function xmlesc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function colL(n) { var s = ''; n++; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
  function sheetXml(rows) {
    var body = '';
    for (var r = 0; r < rows.length; r++) {
      var cells = rows[r], row = '<row r="' + (r + 1) + '">';
      for (var c = 0; c < cells.length; c++) {
        var cell = cells[c]; if (cell === null || cell === undefined || cell === '') continue;
        var ref = colL(c) + (r + 1);
        if (typeof cell === 'number' && isFinite(cell)) row += '<c r="' + ref + '"><v>' + cell + '</v></c>';
        else row += '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' + xmlesc(String(cell)) + '</t></is></c>';
      }
      body += row + '</row>';
    }
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + body + '</sheetData></worksheet>';
  }
  function buildXlsx(sheets) {
    var files = [];
    var types = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
    sheets.forEach(function (s, i) { types += '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; });
    types += '</Types>';
    files.push({ name: '[Content_Types].xml', data: utf8(types) });
    files.push({ name: '_rels/.rels', data: utf8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>') });
    var wbS = '', wbR = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
    sheets.forEach(function (s, i) { var rid = 'rId' + (i + 1); wbS += '<sheet name="' + xmlesc(s.name) + '" sheetId="' + (i + 1) + '" r:id="' + rid + '"/>'; wbR += '<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; files.push({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: utf8(sheetXml(s.rows)) }); });
    wbR += '</Relationships>';
    files.push({ name: 'xl/workbook.xml', data: utf8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + wbS + '</sheets></workbook>') });
    files.push({ name: 'xl/_rels/workbook.xml.rels', data: utf8(wbR) });
    return zipStore(files);
  }
  function exportXLSX() {
    var trx = [['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Sumber', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Saldo Berjalan (Rp)', 'Drawdown (Rp)']];
    var bal = 0, peak = 0, maxDD = 0;
    txSorted().forEach(function (x) {
      bal += (x.tipe === 'in' ? 1 : -1) * x.jumlah; peak = Math.max(peak, bal); var dd = bal - peak; maxDD = Math.min(maxDD, dd);
      trx.push([x.tanggal, x.tipe === 'in' ? 'Pemasukan' : 'Pengeluaran', nameOf(x.kategori), x.catatan || '', x.sumber || '', x.tipe === 'in' ? x.jumlah : '', x.tipe === 'out' ? x.jumlah : '', bal, dd]);
    });
    // ringkasan
    var totIn = 0, totOut = 0, catOut = {}, byMonth = {};
    tx.forEach(function (x) { if (x.tipe === 'in') totIn += x.jumlah; else { totOut += x.jumlah; catOut[x.kategori] = (catOut[x.kategori] || 0) + x.jumlah; } var mk = monthKey(x.tanggal); byMonth[mk] = byMonth[mk] || { in: 0, out: 0 }; byMonth[mk][x.tipe === 'in' ? 'in' : 'out'] += x.jumlah; });
    var sum = [['RINGKASAN KEUANGAN'], [''], ['Total Pemasukan (Rp)', totIn], ['Total Pengeluaran (Rp)', totOut], ['Saldo Akhir (Rp)', totIn - totOut], ['Saldo Tertinggi / Peak (Rp)', peak], ['Drawdown Maksimum (Rp)', maxDD], ['Jumlah Transaksi', tx.length], [''], ['PENGELUARAN PER KATEGORI'], ['Kategori', 'Total (Rp)']];
    var ca = []; for (var k in catOut) ca.push([k, catOut[k]]); ca.sort(function (a, b) { return b[1] - a[1]; });
    ca.forEach(function (r) { sum.push([nameOf(r[0]), r[1]]); });
    sum.push([''], ['REKAP PER BULAN'], ['Bulan', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Selisih (Rp)']);
    var mks = []; for (var m in byMonth) mks.push(m); mks.sort();
    mks.forEach(function (m) { sum.push([m, byMonth[m].in, byMonth[m].out, byMonth[m].in - byMonth[m].out]); });
    var bytes = buildXlsx([{ name: 'Transaksi', rows: trx }, { name: 'Ringkasan', rows: sum }]);
    dl('catatan-keuangan.xlsx', bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  $('khFile').addEventListener('change', function () {
    var f = this.files && this.files[0]; if (!f) return; var rd = new FileReader();
    rd.onload = function () {
      try {
        var data = JSON.parse(rd.result); var inc = data.tx || (Array.isArray(data) ? data : []); if (!Array.isArray(inc)) throw 0;
        var merge = window.confirm('Gabungkan dengan data yang ada?\n\nOK = Gabung · Batal = Ganti total');
        if (merge) { var ids = {}; tx.forEach(function (x) { ids[x.id] = 1; }); inc.forEach(function (x) { if (x && x.id && !ids[x.id]) tx.push(x); }); if (data.budget) for (var k in data.budget) budget[k] = data.budget[k]; if (data.recur) recur = recur.concat(data.recur); }
        else { tx = inc; if (data.budget) budget = data.budget; if (data.recur) recur = data.recur; if (data.goal) goal = data.goal; }
        save(); renderAll(); window.alert('Impor berhasil.');
      } catch (e) { window.alert('File tidak valid (harus JSON cadangan).'); }
    };
    rd.readAsText(f); this.value = '';
  });
  function printReport() {
    var pin = 0, pout = 0, p = periodTx(); p.forEach(function (x) { if (x.tipe === 'in') pin += x.jumlah; else pout += x.jumlah; });
    var rows = p.slice().sort(function (a, b) { return a.tanggal < b.tanggal ? -1 : 1; }).map(function (x) { return '<tr><td>' + x.tanggal + '</td><td>' + (x.tipe === 'in' ? 'Masuk' : 'Keluar') + '</td><td>' + esc(nameOf(x.kategori)) + '</td><td>' + esc(x.catatan || '') + '</td><td style="text-align:right">' + rp(x.jumlah) + '</td></tr>'; }).join('');
    var w = window.open('', '_blank'); if (!w) return;
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Laporan Keuangan</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:20px}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#eee}.s{display:flex;gap:24px;margin:10px 0;flex-wrap:wrap}</style></head><body><h1>Laporan Keuangan (' + periodName() + ')</h1><div class="s"><div><b>Saldo total:</b> ' + rp(saldoTotal()) + '</div><div><b>Pemasukan:</b> ' + rp(pin) + '</div><div><b>Pengeluaran:</b> ' + rp(pout) + '</div></div><table><thead><tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Catatan</th><th>Jumlah</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">Tidak ada data</td></tr>') + '</tbody></table><p style="margin-top:16px;font-size:11px;color:#666">Dibuat dengan Bekal — pusatbanksoal.id</p></body></html>');
    w.document.close(); setTimeout(function () { w.print(); }, 300);
  }

  /* ---------- app-mode bottom nav (mobile) ---------- */
  function showScreen(s) { document.body.setAttribute('data-kh-screen', s); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); } }
  function installAppNav() {
    if (!(window.PBSNav && window.PBSNav.setTabs)) return;
    window.PBSNav.setTabs([
      { ic: '📊', lb: 'Ringkasan', act: function () { showScreen('ringkasan'); } },
      { ic: '📒', lb: 'Riwayat', act: function () { showScreen('riwayat'); } },
      { ic: '+', lb: 'Tambah', primary: true, act: function () { showScreen('tambah'); var j = $('khJumlah'); if (j) setTimeout(function () { j.focus(); }, 300); } },
      { ic: '🎯', lb: 'Kelola', act: function () { showScreen('kelola'); } },
      window.PBSNav.menuTab
    ], 0);
    showScreen('ringkasan');
  }

  /* ---------- boot ---------- */
  fillStatic(); setTipe('out');
  if ($('khRecMulai')) $('khRecMulai').value = isoToday();
  applyRecurring();
  renderAll();
  installAppNav();
})();
