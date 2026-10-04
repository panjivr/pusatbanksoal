/* ============================================================
   Bekal — Blueprint Generator engine (ES5, no build step)
   Renders BP_DATA (a fill-in workbook) into an autosaving form
   and exports a clean PDF via the browser print dialog.
   Reused by blueprint.html (Bisnis dari Nol) & deck.html (Scale Up)
   via window.BP_DATA / window.BP_META.
   ============================================================ */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  var META = window.BP_META || {};
  var DATA = window.BP_DATA || [];
  var LS = META.ls || 'bekal_blueprint_v1';

  var navEl = document.getElementById('bpNav');
  var mainEl = document.getElementById('bpMain');
  if (!navEl || !mainEl) return;

  /* ---------- state ---------- */
  var state = {};
  try { state = JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch (e) { state = {}; }
  var cur = 0;
  var saveT = null;
  function save() {
    if (saveT) clearTimeout(saveT);
    saveT = setTimeout(function () {
      try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {}
      flash();
    }, 300);
  }
  function flash() {
    var s = document.getElementById('bpSaved');
    if (!s) return;
    s.classList.add('on');
    setTimeout(function () { s.classList.remove('on'); }, 1200);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }

  /* ---------- field key helpers ---------- */
  function cellKey(k, r, c) { return k + '~' + r + '~' + c; }
  function rowsKey(k) { return k + '~n'; }
  function tableRows(f) {
    if (f.rowLabels) return f.rowLabels.length;
    var n = state[rowsKey(f.k)];
    return (typeof n === 'number' && n > 0) ? n : (f.rows || 2);
  }

  /* ---------- progress ---------- */
  function fieldLeaves(f) {
    // returns [filledCount, totalCount] of leaf inputs for progress
    if (f.t === 'note' || f.t === 'sub') return [0, 0];
    if (f.t === 'text' || f.t === 'area') {
      var v = state[f.k]; return [v && String(v).trim() ? 1 : 0, 1];
    }
    if (f.t === 'choice' || f.t === 'scale') {
      var v2 = state[f.k]; return [(v2 !== undefined && v2 !== '' && v2 !== null) ? 1 : 0, 1];
    }
    if (f.t === 'check') {
      var a = state[f.k]; return [(a && a.length) ? 1 : 0, 1];
    }
    if (f.t === 'table') {
      var rows = tableRows(f), cols = f.cols.length, start = f.rowLabels ? 1 : 0;
      var tot = 0, fill = 0;
      for (var r = 0; r < rows; r++) {
        for (var c = start; c < cols; c++) {
          tot++;
          var cv = state[cellKey(f.k, r, c)];
          if (cv && String(cv).trim()) fill++;
        }
      }
      return [fill, tot || 1];
    }
    return [0, 0];
  }
  function chapProgress(ch) {
    var f = 0, t = 0;
    ch.sections.forEach(function (sec) {
      (sec.fields || []).forEach(function (fl) {
        var p = fieldLeaves(fl); f += p[0]; t += p[1];
      });
    });
    return { f: f, t: t, pct: t ? Math.round(f / t * 100) : 0 };
  }
  function totalProgress() {
    var f = 0, t = 0;
    DATA.forEach(function (ch) { var p = chapProgress(ch); f += p.f; t += p.t; });
    return { f: f, t: t, pct: t ? Math.round(f / t * 100) : 0 };
  }

  /* ---------- sidebar ---------- */
  function icon(id) { return '<svg class="i" aria-hidden="true"><use href="#' + (id || 'i-doc') + '"></use></svg>'; }
  function renderNav() {
    var tp = totalProgress();
    var h = '';
    h += '<div class="bp-prog"><div class="bp-prog-top"><span>Progres isian</span><b>' + tp.pct + '%</b></div>';
    h += '<div class="bp-bar"><span style="width:' + tp.pct + '%"></span></div></div>';
    h += '<div class="bp-navlist">';
    for (var i = 0; i < DATA.length; i++) {
      var ch = DATA[i], p = chapProgress(ch);
      var done = p.t > 0 && p.f >= p.t;
      h += '<a href="#" class="bp-navitem' + (i === cur ? ' active' : '') + (done ? ' done' : '') + '" data-go="' + i + '">';
      h += '<span class="bp-navic">' + icon(ch.ikon) + '</span>';
      h += '<span class="bp-navtx"><small>' + esc(ch.no || ('Bagian ' + (i + 1))) + '</small><b>' + esc(ch.judul) + '</b></span>';
      h += '<span class="bp-navpct">' + p.pct + '%</span></a>';
    }
    h += '</div>';
    h += '<div class="bp-navcta"><button type="button" class="btn btn-primary btn-sm bp-full" data-print>' + icon('i-file-text') + ' Simpan PDF</button>';
    h += '<button type="button" class="btn btn-ghost btn-sm bp-full" data-preview>' + icon('i-scan') + ' Pratinjau</button></div>';
    navEl.innerHTML = h;
  }

  /* ---------- field renderers ---------- */
  function fHint(f) { return f.hint ? '<p class="bp-hint">' + f.hint + '</p>' : ''; }
  function fEg(f) { return f.eg ? '<p class="bp-eg"><b>Contoh:</b> ' + esc(f.eg) + '</p>' : ''; }
  function lbl(f) { return f.label ? '<label class="bp-lbl">' + esc(f.label) + '</label>' : ''; }

  function renderField(f) {
    var h = '';
    if (f.t === 'note') {
      return '<div class="bp-note' + (f.k2 === 'term' ? ' bp-term' : '') + '">' +
        (f.judul ? '<div class="bp-note-h">' + icon(f.k2 === 'term' ? 'i-book' : 'i-bolt') + '<b>' + esc(f.judul) + '</b></div>' : '') +
        '<div class="bp-note-b">' + f.x + '</div></div>';
    }
    if (f.t === 'sub') { return '<h4 class="bp-sub">' + esc(f.x) + '</h4>'; }

    h += '<div class="bp-field" data-fk="' + esc(f.k) + '">';
    h += lbl(f) + fHint(f);
    var v = state[f.k];

    if (f.t === 'text') {
      h += '<input class="bp-in" type="text" data-k="' + esc(f.k) + '" value="' + esc(v || '') + '" placeholder="' + esc(f.ph || '') + '">';
    } else if (f.t === 'area') {
      h += '<textarea class="bp-in bp-area" rows="' + (f.rows || 3) + '" data-k="' + esc(f.k) + '" placeholder="' + esc(f.ph || '') + '">' + esc(v || '') + '</textarea>';
    } else if (f.t === 'choice') {
      h += '<div class="bp-opts">';
      f.opts.forEach(function (o, i) {
        var val = (typeof o === 'object') ? o.v : o;
        var tx = (typeof o === 'object') ? o.t : o;
        var on = String(v) === String(val);
        h += '<button type="button" class="bp-opt' + (on ? ' on' : '') + '" data-choice="' + esc(f.k) + '" data-v="' + esc(val) + '">' + esc(tx) + '</button>';
      });
      h += '</div>';
    } else if (f.t === 'check') {
      var arr = (v && v.length) ? v : [];
      h += '<div class="bp-opts">';
      f.opts.forEach(function (o) {
        var on = arr.indexOf(o) > -1;
        h += '<button type="button" class="bp-opt bp-chk' + (on ? ' on' : '') + '" data-check="' + esc(f.k) + '" data-v="' + esc(o) + '">' +
          '<span class="bp-chkbox">' + icon('i-check') + '</span>' + esc(o) + '</button>';
      });
      h += '</div>';
      if (f.other) h += '<input class="bp-in" style="margin-top:8px" type="text" data-k="' + esc(f.k) + '_lain" value="' + esc(state[f.k + '_lain'] || '') + '" placeholder="Lainnya, isi sendiri…">';
    } else if (f.t === 'scale') {
      var mn = f.min || 1, mx = f.max || 5;
      h += '<div class="bp-scale">';
      h += '<span class="bp-scale-lo">' + esc(f.loLabel || '') + '</span><div class="bp-scale-dots">';
      for (var n = mn; n <= mx; n++) {
        h += '<button type="button" class="bp-dot' + (String(v) === String(n) ? ' on' : '') + '" data-scale="' + esc(f.k) + '" data-v="' + n + '">' + n + '</button>';
      }
      h += '</div><span class="bp-scale-hi">' + esc(f.hiLabel || '') + '</span></div>';
    } else if (f.t === 'table') {
      h += renderTable(f);
    }
    h += fEg(f);
    h += '</div>';
    return h;
  }

  function renderTable(f) {
    var rows = tableRows(f), cols = f.cols, start = f.rowLabels ? 1 : 0;
    var h = '<div class="bp-tablewrap"><table class="bp-table"><thead><tr>';
    cols.forEach(function (c) { h += '<th>' + esc(c) + '</th>'; });
    h += '</tr></thead><tbody>';
    for (var r = 0; r < rows; r++) {
      h += '<tr>';
      for (var c = 0; c < cols.length; c++) {
        if (f.rowLabels && c === 0) {
          h += '<th scope="row" class="bp-rowlbl">' + esc(f.rowLabels[r]) + '</th>';
        } else {
          var ck = cellKey(f.k, r, c);
          var big = f.big;
          if (big) h += '<td><textarea class="bp-in bp-cell" rows="2" data-k="' + esc(ck) + '">' + esc(state[ck] || '') + '</textarea></td>';
          else h += '<td><input class="bp-in bp-cell" type="text" data-k="' + esc(ck) + '" value="' + esc(state[ck] || '') + '"></td>';
        }
      }
      h += '</tr>';
    }
    h += '</tbody></table></div>';
    if (f.addable) {
      h += '<div class="bp-tableact"><button type="button" class="bp-addrow" data-addrow="' + esc(f.k) + '">+ Tambah baris</button>';
      if (rows > (f.rows || 2)) h += '<button type="button" class="bp-delrow" data-delrow="' + esc(f.k) + '">− Hapus baris</button>';
      h += '</div>';
    }
    return h;
  }

  /* ---------- main panel ---------- */
  function renderMain() {
    var ch = DATA[cur];
    if (!ch) return;
    var h = '';
    h += '<div class="bp-crumb">' + esc(ch.no || ('Bagian ' + (cur + 1))) + '</div>';
    h += '<h2 class="bp-title">' + esc(ch.judul) + '</h2>';
    if (ch.intro) h += '<p class="bp-introp">' + ch.intro + '</p>';
    (ch.sections || []).forEach(function (sec) {
      h += '<section class="bp-sec">';
      if (sec.judul) h += '<h3 class="bp-sech">' + esc(sec.judul) + '</h3>';
      if (sec.desc) h += '<p class="bp-secdesc">' + sec.desc + '</p>';
      (sec.fields || []).forEach(function (f) { h += renderField(f); });
      h += '</section>';
    });
    // pager
    h += '<div class="bp-pager">';
    if (cur > 0) h += '<a href="#" class="bp-pg bp-prev" data-go="' + (cur - 1) + '"><small>Sebelumnya</small><b>' + esc(DATA[cur - 1].judul) + '</b></a>'; else h += '<span></span>';
    if (cur < DATA.length - 1) h += '<a href="#" class="bp-pg bp-next" data-go="' + (cur + 1) + '"><small>Selanjutnya</small><b>' + esc(DATA[cur + 1].judul) + '</b></a>';
    else h += '<button type="button" class="bp-pg bp-next bp-finish" data-print><small>Selesai</small><b>Simpan sebagai PDF →</b></button>';
    h += '</div>';
    mainEl.innerHTML = h;
    mainEl.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function go(i) {
    cur = Math.max(0, Math.min(DATA.length - 1, i));
    renderNav(); renderMain();
    closeDrawer();
  }

  /* ---------- events ---------- */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    var k = t.getAttribute('data-k');
    if (k == null) return;
    state[k] = t.value;
    save();
    // light progress refresh (sidebar pct)
    scheduleNav();
  });
  var navT = null;
  function scheduleNav() { if (navT) clearTimeout(navT); navT = setTimeout(renderNav, 350); }

  document.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== document && t.getAttribute) {
      if (t.hasAttribute('data-go')) { e.preventDefault(); go(parseInt(t.getAttribute('data-go'), 10)); return; }
      if (t.hasAttribute('data-choice')) { e.preventDefault(); state[t.getAttribute('data-choice')] = t.getAttribute('data-v'); save(); renderMain(); scheduleNav(); return; }
      if (t.hasAttribute('data-scale')) { e.preventDefault(); state[t.getAttribute('data-scale')] = t.getAttribute('data-v'); save(); renderMain(); scheduleNav(); return; }
      if (t.hasAttribute('data-check')) {
        e.preventDefault();
        var ck = t.getAttribute('data-check'), cv = t.getAttribute('data-v');
        var arr = (state[ck] && state[ck].length) ? state[ck].slice() : [];
        var idx = arr.indexOf(cv);
        if (idx > -1) arr.splice(idx, 1); else arr.push(cv);
        state[ck] = arr; save(); renderMain(); scheduleNav(); return;
      }
      if (t.hasAttribute('data-addrow')) {
        e.preventDefault();
        var ak = t.getAttribute('data-addrow');
        var f = findField(ak); if (f) { state[rowsKey(ak)] = tableRows(f) + 1; save(); renderMain(); } return;
      }
      if (t.hasAttribute('data-delrow')) {
        e.preventDefault();
        var dk = t.getAttribute('data-delrow');
        var f2 = findField(dk); if (f2) { var nn = tableRows(f2) - 1; state[rowsKey(dk)] = Math.max(f2.rows || 2, nn); save(); renderMain(); } return;
      }
      if (t.hasAttribute('data-print')) { e.preventDefault(); doPrint(); return; }
      if (t.hasAttribute('data-preview')) { e.preventDefault(); doPreview(); return; }
      if (t.hasAttribute('data-closedoc')) { e.preventDefault(); closeDoc(); return; }
      if (t.hasAttribute('data-reset')) { e.preventDefault(); doReset(); return; }
      t = t.parentNode;
    }
  });

  function findField(k) {
    for (var i = 0; i < DATA.length; i++) {
      var secs = DATA[i].sections || [];
      for (var j = 0; j < secs.length; j++) {
        var fs = secs[j].fields || [];
        for (var m = 0; m < fs.length; m++) if (fs[m].k === k) return fs[m];
      }
    }
    return null;
  }

  function doReset() {
    if (!window.confirm('Hapus semua isian blueprint ini? Tindakan ini tidak bisa dibatalkan.')) return;
    state = {};
    try { localStorage.removeItem(LS); } catch (e) {}
    go(0);
  }

  /* ---------- drawer (mobile) ---------- */
  function closeDrawer() { document.body.classList.remove('bp-open'); }
  var tgl = document.querySelector('[data-bp-toggle]');
  if (tgl) tgl.addEventListener('click', function () { document.body.classList.toggle('bp-open'); });
  document.addEventListener('click', function (e) {
    if (document.body.classList.contains('bp-open') && !e.target.closest('#bpNav') && !e.target.closest('[data-bp-toggle]')) {
      if (e.target.closest('.bp-navitem')) return;
      closeDrawer();
    }
  });

  /* ---------- document / PDF build ---------- */
  function valText(k) { var v = state[k]; return (v == null) ? '' : String(v); }
  function docField(f) {
    if (f.t === 'note' || f.t === 'sub') return '';
    var h = '';
    var label = f.label || '';
    if (f.t === 'text' || f.t === 'area') {
      var v = valText(f.k);
      h += '<div class="doc-f"><div class="doc-lbl">' + esc(label) + '</div><div class="doc-val' + (v.trim() ? '' : ' empty') + '">' + (v.trim() ? nl2br(v) : '—') + '</div></div>';
    } else if (f.t === 'choice') {
      var cv = valText(f.k), tx = cv;
      f.opts.forEach(function (o) { if (typeof o === 'object' && String(o.v) === cv) tx = o.t; });
      h += '<div class="doc-f"><div class="doc-lbl">' + esc(label) + '</div><div class="doc-val' + (cv ? '' : ' empty') + '">' + (cv ? esc(tx) : '—') + '</div></div>';
    } else if (f.t === 'scale') {
      var sv = valText(f.k);
      h += '<div class="doc-f"><div class="doc-lbl">' + esc(label) + '</div><div class="doc-val' + (sv ? '' : ' empty') + '">' + (sv ? (esc(sv) + ' / ' + (f.max || 5)) : '—') + '</div></div>';
    } else if (f.t === 'check') {
      var arr = (state[f.k] && state[f.k].length) ? state[f.k].slice() : [];
      if (state[f.k + '_lain']) arr.push(state[f.k + '_lain']);
      h += '<div class="doc-f"><div class="doc-lbl">' + esc(label) + '</div><div class="doc-val' + (arr.length ? '' : ' empty') + '">' + (arr.length ? esc(arr.join(' · ')) : '—') + '</div></div>';
    } else if (f.t === 'table') {
      h += docTable(f);
    }
    return h;
  }
  function docTable(f) {
    var rows = tableRows(f), cols = f.cols, start = f.rowLabels ? 1 : 0;
    var any = false;
    var body = '';
    for (var r = 0; r < rows; r++) {
      var tr = '<tr>';
      for (var c = 0; c < cols.length; c++) {
        if (f.rowLabels && c === 0) { tr += '<th>' + esc(f.rowLabels[r]) + '</th>'; }
        else { var cv = valText(cellKey(f.k, r, c)); if (cv.trim()) any = true; tr += '<td>' + (cv.trim() ? nl2br(cv) : '') + '</td>'; }
      }
      tr += '</tr>'; body += tr;
    }
    var head = '<tr>'; cols.forEach(function (c) { head += '<th>' + esc(c) + '</th>'; }); head += '</tr>';
    return '<div class="doc-f">' + (f.label ? '<div class="doc-lbl">' + esc(f.label) + '</div>' : '') +
      '<table class="doc-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
  }

  function buildDoc() {
    var name = valText('_biz') || '(Nama Bisnismu)';
    var owner = valText('_owner');
    var h = '';
    h += '<div class="doc-page doc-cover">';
    h += '<div class="doc-brand">' + esc(META.tag || 'BEKAL') + '</div>';
    h += '<h1 class="doc-h1">' + esc(META.judul || 'Rencana Bisnis') + '</h1>';
    h += '<div class="doc-bizname">' + esc(name) + '</div>';
    if (owner) h += '<div class="doc-owner">oleh ' + esc(owner) + '</div>';
    if (META.sub) h += '<p class="doc-tagline">' + esc(META.sub) + '</p>';
    h += '<div class="doc-cover-foot">' + esc(META.kredit || '') + '</div>';
    h += '</div>';
    DATA.forEach(function (ch, i) {
      if (ch.cover) return;
      h += '<div class="doc-chap">';
      h += '<div class="doc-chaplabel">' + esc(ch.no || ('Bagian ' + (i + 1))) + '</div>';
      h += '<h2 class="doc-h2">' + esc(ch.judul) + '</h2>';
      (ch.sections || []).forEach(function (sec) {
        h += '<div class="doc-sec">';
        if (sec.judul) h += '<h3 class="doc-h3">' + esc(sec.judul) + '</h3>';
        (sec.fields || []).forEach(function (f) { h += docField(f); });
        h += '</div>';
      });
      h += '</div>';
    });
    h += '<div class="doc-end">' + esc(META.kredit || '') + ', dibuat dengan Bekal · pusatbanksoal.id</div>';
    return h;
  }

  function ensureDoc() {
    var d = document.getElementById('bpDoc');
    if (!d) { d = document.createElement('div'); d.id = 'bpDoc'; document.body.appendChild(d); }
    d.innerHTML = '<div class="doc-toolbar no-print"><button type="button" class="btn btn-primary btn-sm" data-print>Simpan / Cetak PDF</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-closedoc>Tutup pratinjau</button></div>' +
      '<div class="doc-sheet">' + buildDoc() + '</div>';
    return d;
  }
  function doPreview() { ensureDoc(); document.body.classList.add('bp-doc-open'); window.scrollTo(0, 0); }
  function closeDoc() { document.body.classList.remove('bp-doc-open'); }
  function doPrint() {
    ensureDoc();
    document.body.classList.add('bp-doc-open');
    setTimeout(function () { window.print(); }, 120);
  }

  /* ---------- header actions ---------- */
  var pb = document.querySelector('[data-print-top]');
  if (pb) pb.addEventListener('click', doPrint);

  /* ---------- boot ---------- */
  go(0);
})();
