/* QR & Barcode Studio — Bekal
   Vanilla ES5. Reuses window.qrcode (assets/qr.js) for QR encoding,
   hand-rolls Code128 for 1D barcodes, and exports PNG/JPG/SVG/PDF
   plus embed snippets — all client-side, no dependency, no server. */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- UTF-8 so pasted text (aksen, emoji, dll) scans benar ---------- */
  function utf8Bytes(s) {
    var b = [], i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c < 0x80) b.push(c);
      else if (c < 0x800) { b.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F)); }
      else if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) {
        var c2 = s.charCodeAt(i + 1);
        var cp = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00); i++;
        b.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3F), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F));
      } else { b.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)); }
    }
    return b;
  }
  if (window.qrcode) { try { window.qrcode.stringToBytes = utf8Bytes; } catch (e) {} }

  /* ---------- Code128 (Set B) pattern table, index 0..106 ---------- */
  var C128 = [
    '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
    '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
    '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
    '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
    '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
    '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
    '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
    '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
    '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
    '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
    '114131','311141','411131','211412','211214','211232','2331112'];

  /* returns array of {b:bool, w:int} elements (starts & ends with a bar) */
  function encodeCode128B(text) {
    if (!text) throw new Error('Isi teks/angka dulu untuk barcode.');
    var vals = [104], sum = 104, pos = 1, i, code, v; /* 104 = Start B */
    for (i = 0; i < text.length; i++) {
      code = text.charCodeAt(i);
      if (code < 32 || code > 126) throw new Error('Code128 hanya mendukung karakter ASCII biasa (huruf, angka, simbol umum). Untuk teks/emoji pakai mode QR.');
      v = code - 32; vals.push(v); sum += v * pos; pos++;
    }
    vals.push(sum % 103);   /* checksum */
    vals.push(106);         /* Stop */
    var elems = [];
    for (i = 0; i < vals.length; i++) {
      var pat = C128[vals[i]];
      for (var j = 0; j < pat.length; j++) elems.push({ b: (j % 2 === 0), w: parseInt(pat.charAt(j), 10) });
    }
    return elems;
  }

  /* ---------- state ---------- */
  var st = {
    mode: 'qr', sym: 'code128', content: 'link', text: 'https://pusatbanksoal.id',
    fg: '#0b0e11', bg: '#ffffff', size: 512, margin: 4,
    ec: 'M', shape: 'kotak', frame: 'none', label: 'SCAN ME', logo: null
  };
  var LOGO_FRAC = { L: 0.14, M: 0.16, Q: 0.20, H: 0.24 };
  var SYM_META = {
    code128: { lb: 'Teks / kode (huruf & angka)', ph: 'mis. BEKAL-2026-XYZ', hint: 'Serba-guna: huruf, angka & simbol. Cocok untuk SKU, kode internal, tiket.' },
    datamatrix: { lb: 'Teks / link / kode', ph: 'mis. https://pusatbanksoal.id atau SN-000123', hint: '2D paling padat — banyak data dalam kotak kecil. Ideal untuk serial, part kecil, kemasan.' },
    pdf417: { lb: 'Teks / link / dokumen', ph: 'mis. https://pusatbanksoal.id/tryout', hint: '2D bertumpuk (stacked) berkapasitas besar. Dipakai di KTP, boarding pass, kartu identitas & dokumen.' },
    aztec: { lb: 'Teks / link / tiket', ph: 'mis. https://pusatbanksoal.id', hint: '2D ringkas tanpa zona kosong. Populer untuk e-ticket kereta & pesawat.' },
    ean13: { lb: '12–13 digit angka', ph: 'mis. 590123412345', hint: 'Barcode produk ritel global. 12 digit (cek otomatis) atau 13 digit lengkap.' },
    upca: { lb: '11–12 digit angka', ph: 'mis. 036000291452', hint: 'Barcode ritel Amerika Utara. 11 digit (cek otomatis) atau 12 digit.' },
    ean8: { lb: '7–8 digit angka', ph: 'mis. 9638507', hint: 'Versi ringkas EAN untuk kemasan kecil. 7 atau 8 digit.' },
    code39: { lb: 'Huruf besar & angka', ph: 'mis. ASET-001', hint: 'Industri/inventaris. Mendukung A-Z, 0-9 dan - . spasi $ / + %.' },
    itf: { lb: 'Angka (dibuat genap)', ph: 'mis. 12345678', hint: 'Interleaved 2 of 5 untuk karton & logistik. Jumlah digit dibuat genap otomatis.' },
    codabar: { lb: 'Angka & simbol', ph: 'mis. 12345670', hint: 'Perpustakaan, bank darah, lab. Mendukung 0-9 dan - $ : / . +.' }
  };
  var currentLayout = null;

  /* ---------- color helpers ---------- */
  function hex2rgb(h) {
    h = (h || '').replace('#', '').trim();
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    var n = parseInt(h, 16);
    if (isNaN(n) || h.length !== 6) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function pdfCol(hex) { var c = hex2rgb(hex) || { r: 0, g: 0, b: 0 }; return f3(c.r / 255) + ' ' + f3(c.g / 255) + ' ' + f3(c.b / 255); }
  function f3(n) { return (Math.round(n * 1000) / 1000).toString(); }

  function isFinder(r, c, n) {
    return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  }

  /* ---------- layout builders (pixel space, format-independent) ----------
     layout = { type, W, H, bg, fg, shape, cells:[{x,y,w,h}], finders:[{x,y,w,h}],
                logo:{x,y,w,h}|null, texts:[{x,y,size,text,align,color}],
                frame:{type,x,y,w,h,r,color}|null } */
  function layoutQR() {
    if (!window.qrcode) throw new Error('Modul QR gagal dimuat. Muat ulang halaman.');
    var ec = st.ec;
    if (st.logo && (ec === 'L' || ec === 'M')) ec = 'Q';
    var q;
    try { q = window.qrcode(0, ec); q.addData(st.text, 'Byte'); q.make(); }
    catch (e) { throw new Error('Teks terlalu panjang untuk satu QR. Persingkat isinya atau turunkan tingkat koreksi error.'); }
    var n = q.getModuleCount();
    var margin = st.margin;
    var total = n + margin * 2;
    var mod = Math.max(1, Math.floor(st.size / total));
    var codePx = mod * total;

    var pad = 0, labelH = 0, frame = null;
    if (st.frame === 'border') pad = Math.max(mod * 2, Math.round(codePx * 0.04));
    else if (st.frame === 'label') { pad = Math.round(codePx * 0.055); labelH = Math.round(codePx * 0.145); }
    var W = codePx + pad * 2, H = codePx + pad * 2 + labelH;
    var ox = pad, oy = pad;

    var cells = [], finders = [], r, c;
    for (r = 0; r < n; r++) for (c = 0; c < n; c++) {
      if (!q.isDark(r, c)) continue;
      var cell = { x: ox + (margin + c) * mod, y: oy + (margin + r) * mod, w: mod, h: mod };
      if (isFinder(r, c, n)) finders.push(cell); else cells.push(cell);
    }

    var logo = null;
    if (st.logo) {
      var lz = Math.round(codePx * (LOGO_FRAC[ec] || 0.18));
      logo = { x: ox + (codePx - lz) / 2, y: oy + (codePx - lz) / 2, w: lz, h: lz, pad: Math.max(mod, Math.round(lz * 0.08)) };
    }
    if (st.frame === 'border') frame = { type: 'border', x: pad * 0.4, y: pad * 0.4, w: W - pad * 0.8, h: H - pad * 0.8, r: Math.round(pad * 0.6), color: st.fg, sw: Math.max(2, Math.round(mod * 0.8)) };
    var texts = [];
    if (st.frame === 'label') {
      texts.push({ x: W / 2, y: codePx + pad * 2 + labelH / 2, size: Math.round(labelH * 0.5), text: (st.label || '').toUpperCase(), align: 'center', color: st.fg, bold: true });
    }
    return { type: 'qr', W: W, H: H, bg: st.bg, fg: st.fg, shape: st.shape, mod: mod, cells: cells, finders: finders, logo: logo, texts: texts, frame: frame };
  }

  function bitsFromElems(elems) {
    var s = '', i;
    for (i = 0; i < elems.length; i++) { var ch = elems[i].b ? '1' : '0'; for (var w = 0; w < elems[i].w; w++) s += ch; }
    return s;
  }
  function layoutBar() {
    var sym = st.sym || 'code128';
    if (sym === 'datamatrix' || sym === 'pdf417' || sym === 'aztec') return layout2D(sym);
    var bits, human;
    if (sym === 'code128') { bits = bitsFromElems(encodeCode128B(st.text)); human = st.text; }
    else {
      if (!window.BEKAL_BC || !window.BEKAL_BC[sym]) throw new Error('Simbologi belum termuat. Muat ulang halaman.');
      var r = window.BEKAL_BC[sym](st.text); bits = r.bits; human = r.text;
    }
    return build1D(bits, human);
  }
  function build1D(bits, human) {
    var N = bits.length, quiet = 10;
    var mw = Math.max(1, Math.floor(st.size / (N + quiet * 2)));
    var codeW = (N + quiet * 2) * mw;
    var barH = Math.max(mw * 20, Math.round(codeW * 0.30));
    var fontPx = Math.max(11, Math.round(mw * 8));
    var textH = Math.round(fontPx * 1.5);
    var pad = 0, labelH = 0, frame = null;
    if (st.frame === 'border') pad = Math.round(mw * 6);
    else if (st.frame === 'label') { pad = Math.round(mw * 5); labelH = Math.round(fontPx * 1.6); }
    var W = codeW + pad * 2;
    var top = pad + labelH;
    var H = top + barH + textH + pad;

    var cells = [], i = 0;
    while (i < N) {
      if (bits.charAt(i) === '1') { var j = i; while (j < N && bits.charAt(j) === '1') j++; cells.push({ x: pad + (quiet + i) * mw, y: top, w: (j - i) * mw, h: barH }); i = j; }
      else i++;
    }
    var texts = [{ x: W / 2, y: top + barH + textH * 0.58, size: fontPx, text: human, align: 'center', color: st.fg }];
    if (st.frame === 'label') texts.push({ x: W / 2, y: pad + labelH * 0.5, size: Math.round(fontPx * 0.95), text: (st.label || '').toUpperCase(), align: 'center', color: st.fg, bold: true });
    if (st.frame === 'border') frame = { type: 'border', x: pad * 0.4, y: pad * 0.4, w: W - pad * 0.8, h: H - pad * 0.8, r: Math.round(pad * 0.5), color: st.fg, sw: Math.max(2, Math.round(mw * 1.2)) };
    return { type: 'bar', W: W, H: H, bg: st.bg, fg: st.fg, shape: 'kotak', mod: mw, cells: cells, finders: [], logo: null, texts: texts, frame: frame };
  }
  function layout2D(sym) {
    sym = sym || 'datamatrix';
    if (!window.BEKAL_BC || !window.BEKAL_BC[sym]) throw new Error('Modul barcode 2D gagal dimuat. Muat ulang halaman.');
    var r = window.BEKAL_BC[sym](st.text); /* {w,h,data} */
    var margin = Math.max(st.margin, sym === 'pdf417' ? 2 : 1);
    var totalW = r.w + margin * 2, totalH = r.h + margin * 2;
    var mod = Math.max(1, Math.floor(st.size / Math.max(totalW, totalH)));
    var codeW = mod * totalW, codeH = mod * totalH;
    var pad = 0, labelH = 0, frame = null;
    if (st.frame === 'border') pad = Math.max(mod * 2, Math.round(codeW * 0.04));
    else if (st.frame === 'label') { pad = Math.round(codeW * 0.055); labelH = Math.round(codeW * 0.145); }
    var W = codeW + pad * 2, H = codeH + pad * 2 + labelH, ox = pad, oy = pad;
    var cells = [], x, y;
    for (y = 0; y < r.h; y++) for (x = 0; x < r.w; x++) if (r.data[y * r.w + x]) cells.push({ x: ox + (margin + x) * mod, y: oy + (margin + y) * mod, w: mod, h: mod });
    var texts = [];
    if (st.frame === 'label') texts.push({ x: W / 2, y: codeH + pad * 2 + labelH / 2, size: Math.round(labelH * 0.5), text: (st.label || '').toUpperCase(), align: 'center', color: st.fg, bold: true });
    if (st.frame === 'border') frame = { type: 'border', x: pad * 0.4, y: pad * 0.4, w: W - pad * 0.8, h: H - pad * 0.8, r: Math.round(pad * 0.6), color: st.fg, sw: Math.max(2, Math.round(mod * 0.8)) };
    return { type: 'dm', W: W, H: H, bg: st.bg, fg: st.fg, shape: 'kotak', mod: mod, cells: cells, finders: [], logo: null, texts: texts, frame: frame };
  }

  /* ---------- CANVAS renderer ---------- */
  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function drawCell(ctx, cell, shape) {
    var x = cell.x, y = cell.y, w = cell.w, h = cell.h;
    if (shape === 'titik') { ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.46, 0, Math.PI * 2); ctx.fill(); }
    else if (shape === 'membulat') { roundRectPath(ctx, x + w * 0.06, y + h * 0.06, w * 0.88, h * 0.88, w * 0.3); ctx.fill(); }
    else ctx.fillRect(x, y, w, h);
  }
  function drawCanvas(L) {
    var cv = $('qsOut'); if (!cv) return;
    cv.width = L.W; cv.height = L.H;
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, L.W, L.H);
    ctx.fillStyle = L.bg; ctx.fillRect(0, 0, L.W, L.H);
    /* modules */
    ctx.fillStyle = L.fg;
    var i;
    for (i = 0; i < L.cells.length; i++) drawCell(ctx, L.cells[i], L.shape);
    for (i = 0; i < L.finders.length; i++) ctx.fillRect(L.finders[i].x, L.finders[i].y, L.finders[i].w, L.finders[i].h);
    /* logo */
    if (L.logo && st.logo) {
      var g = L.logo, p = g.pad;
      ctx.fillStyle = L.bg;
      roundRectPath(ctx, g.x - p, g.y - p, g.w + p * 2, g.h + p * 2, (g.w + p * 2) * 0.18); ctx.fill();
      try {
        ctx.save();
        roundRectPath(ctx, g.x, g.y, g.w, g.h, g.w * 0.14); ctx.clip();
        var iw = st.logo.width, ih = st.logo.height, sc = Math.min(g.w / iw, g.h / ih);
        var dw = iw * sc, dh = ih * sc;
        ctx.drawImage(st.logo, g.x + (g.w - dw) / 2, g.y + (g.h - dh) / 2, dw, dh);
        ctx.restore();
      } catch (e) { ctx.restore(); }
    }
    /* frame */
    if (L.frame) {
      ctx.strokeStyle = L.frame.color; ctx.lineWidth = L.frame.sw;
      roundRectPath(ctx, L.frame.x, L.frame.y, L.frame.w, L.frame.h, L.frame.r); ctx.stroke();
    }
    /* texts */
    for (i = 0; i < L.texts.length; i++) {
      var t = L.texts[i];
      ctx.fillStyle = t.color; ctx.textAlign = t.align || 'center'; ctx.textBaseline = 'middle';
      ctx.font = (t.bold ? '700 ' : '600 ') + t.size + 'px Inter, Arial, sans-serif';
      ctx.fillText(t.text, t.x, t.y);
    }
  }
  function clearCanvas() { var cv = $('qsOut'); if (cv) { var c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height); } }

  /* ---------- SVG renderer ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function buildSVG(L) {
    var s = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + L.W + '" height="' + L.H + '" viewBox="0 0 ' + L.W + ' ' + L.H + '" shape-rendering="crispEdges">'];
    s.push('<rect width="' + L.W + '" height="' + L.H + '" fill="' + esc(L.bg) + '"/>');
    var i, c, path = [];
    if (L.shape === 'titik' && L.type === 'qr') {
      var circ = [];
      for (i = 0; i < L.cells.length; i++) { c = L.cells[i]; circ.push('<circle cx="' + (c.x + c.w / 2) + '" cy="' + (c.y + c.h / 2) + '" r="' + (c.w * 0.46) + '"/>'); }
      s.push('<g fill="' + esc(L.fg) + '">' + circ.join('') + '</g>');
    } else if (L.shape === 'membulat' && L.type === 'qr') {
      var rr = [];
      for (i = 0; i < L.cells.length; i++) { c = L.cells[i]; rr.push('<rect x="' + (c.x + c.w * 0.06) + '" y="' + (c.y + c.h * 0.06) + '" width="' + (c.w * 0.88) + '" height="' + (c.h * 0.88) + '" rx="' + (c.w * 0.3) + '"/>'); }
      s.push('<g fill="' + esc(L.fg) + '">' + rr.join('') + '</g>');
    } else {
      for (i = 0; i < L.cells.length; i++) { c = L.cells[i]; path.push('M' + c.x + ' ' + c.y + 'h' + c.w + 'v' + c.h + 'h' + (-c.w) + 'z'); }
      if (path.length) s.push('<path fill="' + esc(L.fg) + '" d="' + path.join('') + '"/>');
    }
    if (L.finders.length) {
      var fp = [];
      for (i = 0; i < L.finders.length; i++) { c = L.finders[i]; fp.push('M' + c.x + ' ' + c.y + 'h' + c.w + 'v' + c.h + 'h' + (-c.w) + 'z'); }
      s.push('<path fill="' + esc(L.fg) + '" d="' + fp.join('') + '"/>');
    }
    if (L.logo && st.logo) {
      var g = L.logo, p = g.pad;
      s.push('<rect x="' + (g.x - p) + '" y="' + (g.y - p) + '" width="' + (g.w + p * 2) + '" height="' + (g.h + p * 2) + '" rx="' + ((g.w + p * 2) * 0.18) + '" fill="' + esc(L.bg) + '"/>');
      var du = logoDataURL(g.w, g.h);
      if (du) s.push('<image x="' + g.x + '" y="' + g.y + '" width="' + g.w + '" height="' + g.h + '" preserveAspectRatio="xMidYMid meet" href="' + du + '"/>');
    }
    if (L.frame) s.push('<rect x="' + L.frame.x + '" y="' + L.frame.y + '" width="' + L.frame.w + '" height="' + L.frame.h + '" rx="' + L.frame.r + '" fill="none" stroke="' + esc(L.frame.color) + '" stroke-width="' + L.frame.sw + '"/>');
    for (i = 0; i < L.texts.length; i++) {
      var t = L.texts[i];
      s.push('<text x="' + t.x + '" y="' + t.y + '" font-family="Inter, Arial, sans-serif" font-size="' + t.size + '" font-weight="' + (t.bold ? 700 : 600) + '" fill="' + esc(t.color) + '" text-anchor="middle" dominant-baseline="middle">' + esc(t.text) + '</text>');
    }
    s.push('</svg>');
    return s.join('');
  }
  function logoDataURL(w, h) {
    if (!st.logo) return null;
    try {
      var tc = document.createElement('canvas'); tc.width = Math.max(2, Math.round(w)); tc.height = Math.max(2, Math.round(h));
      var x = tc.getContext('2d');
      var iw = st.logo.width, ih = st.logo.height, sc = Math.min(tc.width / iw, tc.height / ih);
      var dw = iw * sc, dh = ih * sc;
      x.drawImage(st.logo, (tc.width - dw) / 2, (tc.height - dh) / 2, dw, dh);
      return tc.toDataURL('image/png');
    } catch (e) { return null; }
  }

  /* ---------- PDF renderer (minimal vector PDF) ---------- */
  function buildPDF(L) {
    var Y = function (v) { return L.H - v; };
    var cs = [];
    /* background */
    cs.push(pdfCol(L.bg) + ' rg 0 0 ' + f3(L.W) + ' ' + f3(L.H) + ' re f');
    /* modules (rect for kotak/membulat/bar/finders, circle for titik) */
    cs.push(pdfCol(L.fg) + ' rg');
    var i, c;
    if (L.shape === 'titik' && L.type === 'qr') {
      for (i = 0; i < L.cells.length; i++) { c = L.cells[i]; pdfCircle(cs, c.x + c.w / 2, Y(c.y + c.h / 2), c.w * 0.46); }
      if (L.cells.length) cs.push('f');
    } else {
      for (i = 0; i < L.cells.length; i++) { c = L.cells[i]; cs.push(f3(c.x) + ' ' + f3(Y(c.y + c.h)) + ' ' + f3(c.w) + ' ' + f3(c.h) + ' re'); }
      if (L.cells.length) cs.push('f');
    }
    for (i = 0; i < L.finders.length; i++) { c = L.finders[i]; cs.push(f3(c.x) + ' ' + f3(Y(c.y + c.h)) + ' ' + f3(c.w) + ' ' + f3(c.h) + ' re'); }
    if (L.finders.length) cs.push('f');
    /* logo white pad + image */
    var img = null;
    if (L.logo && st.logo) {
      var g = L.logo, p = g.pad;
      cs.push(pdfCol(L.bg) + ' rg ' + f3(g.x - p) + ' ' + f3(Y(g.y + g.h + p)) + ' ' + f3(g.w + p * 2) + ' ' + f3(g.h + p * 2) + ' re f');
      img = logoJPEG(g.w, g.h);
      if (img) cs.push('q ' + f3(g.w) + ' 0 0 ' + f3(g.h) + ' ' + f3(g.x) + ' ' + f3(Y(g.y + g.h)) + ' cm /Im0 Do Q');
    }
    /* frame */
    if (L.frame) cs.push(pdfCol(L.frame.color) + ' RG ' + f3(L.frame.sw) + ' w ' + f3(L.frame.x) + ' ' + f3(Y(L.frame.y + L.frame.h)) + ' ' + f3(L.frame.w) + ' ' + f3(L.frame.h) + ' re S');
    /* texts */
    for (i = 0; i < L.texts.length; i++) {
      var t = L.texts[i], tw = t.text.length * t.size * 0.52;
      var tx = t.align === 'center' ? (t.x - tw / 2) : t.x;
      cs.push('BT /F1 ' + f3(t.size) + ' Tf ' + pdfCol(t.color) + ' rg ' + f3(tx) + ' ' + f3(Y(t.y) - t.size * 0.35) + ' Td (' + pdfStr(t.text) + ') Tj ET');
    }
    return assemblePDF(L.W, L.H, cs.join('\n'), img);
  }
  function pdfCircle(cs, cx, cy, r) {
    var k = 0.5523 * r;
    cs.push(f3(cx + r) + ' ' + f3(cy) + ' m');
    cs.push(f3(cx + r) + ' ' + f3(cy + k) + ' ' + f3(cx + k) + ' ' + f3(cy + r) + ' ' + f3(cx) + ' ' + f3(cy + r) + ' c');
    cs.push(f3(cx - k) + ' ' + f3(cy + r) + ' ' + f3(cx - r) + ' ' + f3(cy + k) + ' ' + f3(cx - r) + ' ' + f3(cy) + ' c');
    cs.push(f3(cx - r) + ' ' + f3(cy - k) + ' ' + f3(cx - k) + ' ' + f3(cy - r) + ' ' + f3(cx) + ' ' + f3(cy - r) + ' c');
    cs.push(f3(cx + k) + ' ' + f3(cy - r) + ' ' + f3(cx + r) + ' ' + f3(cy - k) + ' ' + f3(cx + r) + ' ' + f3(cy) + ' c');
  }
  function pdfStr(s) { return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7e]/g, ''); }
  function logoJPEG(w, h) {
    if (!st.logo) return null;
    try {
      var side = Math.max(64, Math.min(512, Math.round(w * 2)));
      var tc = document.createElement('canvas'); tc.width = side; tc.height = side;
      var x = tc.getContext('2d');
      x.fillStyle = st.bg; x.fillRect(0, 0, side, side);
      var iw = st.logo.width, ih = st.logo.height, sc = Math.min(side / iw, side / ih);
      var dw = iw * sc, dh = ih * sc;
      x.drawImage(st.logo, (side - dw) / 2, (side - dh) / 2, dw, dh);
      var durl = tc.toDataURL('image/jpeg', 0.92);
      var b64 = durl.split(',')[1], bin = atob(b64), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return { bytes: bytes, w: side, h: side };
    } catch (e) { return null; }
  }
  function assemblePDF(W, H, content, img) {
    var enc = function (s) { var a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 0xff; return a; };
    var parts = [], len = 0, offsets = {};
    function put(x) { if (typeof x === 'string') x = enc(x); parts.push(x); len += x.length; }
    function obj(num, body) { offsets[num] = len; put(num + ' 0 obj\n' + body + '\nendobj\n'); }
    var hasImg = !!img;
    var resFont = '/Font << /F1 5 0 R >>';
    var resXobj = hasImg ? ' /XObject << /Im0 6 0 R >>' : '';
    put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + f3(W) + ' ' + f3(H) + '] /Resources << ' + resFont + resXobj + ' >> /Contents 4 0 R >>');
    obj(4, '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream');
    obj(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    if (hasImg) {
      offsets[6] = len;
      put('6 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + img.w + ' /Height ' + img.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + img.bytes.length + ' >>\nstream\n');
      put(img.bytes);
      put('\nendstream\nendobj\n');
    }
    var xrefPos = len, count = hasImg ? 7 : 6;
    var xref = 'xref\n0 ' + count + '\n0000000000 65535 f \n';
    for (var n = 1; n < count; n++) { var o = '' + (offsets[n] || 0); while (o.length < 10) o = '0' + o; xref += o + ' 00000 n \n'; }
    put(xref);
    put('trailer\n<< /Size ' + count + ' /Root 1 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF');
    var out = new Uint8Array(len), pos = 0;
    for (var i = 0; i < parts.length; i++) { out.set(parts[i], pos); pos += parts[i].length; }
    return out;
  }

  /* ---------- download / clipboard / toast ---------- */
  var TWO_D = { datamatrix: 'Data Matrix', pdf417: 'PDF417', aztec: 'Aztec' };
  function baseName() { return st.mode === 'qr' ? 'qr-code' : (TWO_D[st.sym] ? st.sym : (st.sym === 'code128' ? 'barcode' : st.sym)); }
  function kindLabel() { return st.mode === 'qr' ? 'QR code' : (TWO_D[st.sym] || 'Barcode'); }
  function dl(data, filename, mime) {
    var blob = (data instanceof Blob) ? data : new Blob([data], { type: mime || 'application/octet-stream' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  var toastT;
  function toast(msg) {
    var t = $('qsSaved'); if (!t) return;
    if (msg) t.textContent = msg;
    t.classList.add('on'); clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('on'); }, 1600);
  }
  function copyText(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { toast('Tersalin ✓'); }, function () { fallbackCopy(txt); });
    } else fallbackCopy(txt);
  }
  function fallbackCopy(txt) {
    try {
      var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Tersalin ✓');
    } catch (e) { toast('Gagal menyalin'); }
  }

  /* ---------- render pipeline ---------- */
  function showErr(msg) { var e = $('qsErr'); if (e) { e.textContent = msg; e.style.display = 'block'; } }
  function clearErr() { var e = $('qsErr'); if (e) e.style.display = 'none'; }
  function render() {
    clearErr();
    var L;
    try { L = (st.mode === 'qr') ? layoutQR() : layoutBar(); }
    catch (e) { showErr(e.message || String(e)); clearCanvas(); currentLayout = null; return; }
    currentLayout = L;
    drawCanvas(L);
    updateEmbed(L);
  }
  function updateEmbed(L) {
    var ta = $('qsEmbed'); if (!ta) return;
    var du = previewDataURL(L);
    ta.value = '<img src="' + du + '" alt="' + esc(kindLabel()) + '" width="' + Math.min(320, L.W) + '">';
  }
  function previewDataURL(L) {
    try {
      var cap = 420, sc = Math.min(1, cap / L.W);
      var tc = document.createElement('canvas'); tc.width = Math.round(L.W * sc); tc.height = Math.round(L.H * sc);
      var x = tc.getContext('2d'); x.drawImage($('qsOut'), 0, 0, tc.width, tc.height);
      return tc.toDataURL('image/png');
    } catch (e) { try { return $('qsOut').toDataURL('image/png'); } catch (e2) { return ''; } }
  }

  /* ---------- exports ---------- */
  function doExport(kind) {
    if (!currentLayout) { toast('Belum ada kode'); return; }
    var L = currentLayout, cv = $('qsOut');
    if (kind === 'png') { cv.toBlob ? cv.toBlob(function (b) { dl(b, baseName() + '.png'); }, 'image/png') : dl(dataURItoBlob(cv.toDataURL('image/png')), baseName() + '.png'); toast('PNG diunduh ✓'); }
    else if (kind === 'jpg') { cv.toBlob ? cv.toBlob(function (b) { dl(b, baseName() + '.jpg'); }, 'image/jpeg', 0.95) : dl(dataURItoBlob(cv.toDataURL('image/jpeg', 0.95)), baseName() + '.jpg'); toast('JPG diunduh ✓'); }
    else if (kind === 'svg') { dl(buildSVG(L), baseName() + '.svg', 'image/svg+xml;charset=utf-8'); toast('SVG diunduh ✓'); }
    else if (kind === 'pdf') {
      try { dl(buildPDF(L), baseName() + '.pdf', 'application/pdf'); toast('PDF diunduh ✓'); }
      catch (e) { toast('Gagal membuat PDF'); }
    }
  }
  function dataURItoBlob(u) {
    var b = atob(u.split(',')[1]), m = u.split(',')[0].split(':')[1].split(';')[0], a = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    return new Blob([a], { type: m });
  }
  function doEmbed(kind) {
    if (!currentLayout) { toast('Belum ada kode'); return; }
    var L = currentLayout, snip;
    if (kind === 'svg') snip = buildSVG(L);
    else if (kind === 'img') snip = '<img src="' + previewDataURL(L) + '" alt="' + esc(kindLabel()) + '" width="' + Math.min(320, L.W) + '">';
    else { /* iframe */
      var svg = buildSVG(L).replace(/"/g, '&quot;');
      var dispW = Math.min(300, L.W), dispH = Math.round(dispW * (L.H / L.W));
      snip = '<iframe srcdoc="' + svg + '" width="' + dispW + '" height="' + dispH + '" style="border:0" title="' + esc(kindLabel()) + '"></iframe>';
    }
    var ta = $('qsEmbed'); if (ta) ta.value = snip;
    copyText(snip);
  }

  /* ---------- UI wiring ---------- */
  function setMode(m) {
    st.mode = m;
    var btns = document.querySelectorAll('#qsModes button'), i;
    for (i = 0; i < btns.length; i++) btns[i].classList.toggle('on', btns[i].getAttribute('data-mode') === m);
    var only = document.querySelectorAll('.qs-only-qr');
    for (i = 0; i < only.length; i++) only[i].classList.toggle('hide', m !== 'qr');
    var onlyB = document.querySelectorAll('.qs-only-bar');
    for (i = 0; i < onlyB.length; i++) onlyB[i].classList.toggle('hide', m !== 'bar');
    syncInputMode();
  }
  function syncInputMode() {
    updateContentVisibility();
    if (contentAllowed()) { setContentType(st.content); }
    else { var t = $('qsText'); if (t) t.removeAttribute('readonly'); applySym(); render(); }
  }
  function applySym() {
    var meta = SYM_META[st.sym] || SYM_META.code128;
    var lbl = $('qsInLabel'), inp = $('qsText'), hint = $('qsSymHint');
    if (lbl) lbl.textContent = meta.lb;
    if (inp) inp.setAttribute('placeholder', meta.ph);
    if (hint) hint.textContent = meta.hint;
  }

  /* ---------- content-type builders (link-style payloads) ---------- */
  var FIELDS = {
    wifi: [{ k: 'ssid', l: 'Nama WiFi (SSID)', t: 'text' }, { k: 'pass', l: 'Password', t: 'text' }, { k: 'enc', l: 'Keamanan', t: 'select', o: [['WPA', 'WPA/WPA2'], ['WEP', 'WEP'], ['nopass', 'Tanpa password']] }, { k: 'hidden', l: 'Jaringan tersembunyi', t: 'check' }],
    vcard: [{ k: 'name', l: 'Nama lengkap', t: 'text' }, { k: 'phone', l: 'Telepon', t: 'tel' }, { k: 'email', l: 'Email', t: 'email' }, { k: 'org', l: 'Organisasi', t: 'text' }, { k: 'title', l: 'Jabatan', t: 'text' }, { k: 'url', l: 'Website', t: 'text' }],
    whatsapp: [{ k: 'num', l: 'Nomor (mis. 62812xxxx)', t: 'tel' }, { k: 'msg', l: 'Pesan (opsional)', t: 'text' }],
    email: [{ k: 'to', l: 'Email tujuan', t: 'email' }, { k: 'subject', l: 'Subjek', t: 'text' }, { k: 'body', l: 'Isi pesan', t: 'textarea' }],
    sms: [{ k: 'num', l: 'Nomor', t: 'tel' }, { k: 'msg', l: 'Pesan', t: 'text' }],
    tel: [{ k: 'num', l: 'Nomor telepon', t: 'tel' }],
    geo: [{ k: 'lat', l: 'Lintang (latitude)', t: 'text' }, { k: 'lng', l: 'Bujur (longitude)', t: 'text' }],
    event: [{ k: 'title', l: 'Judul acara', t: 'text' }, { k: 'loc', l: 'Lokasi', t: 'text' }, { k: 'start', l: 'Mulai', t: 'datetime-local' }, { k: 'end', l: 'Selesai', t: 'datetime-local' }],
    social: [{ k: 'platform', l: 'Platform', t: 'select', o: [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'], ['twitter', 'X / Twitter'], ['facebook', 'Facebook'], ['linkedin', 'LinkedIn'], ['telegram', 'Telegram']] }, { k: 'user', l: 'Username (tanpa @)', t: 'text' }]
  };
  function wifiEsc(s) { return String(s || '').replace(/([\\;,:"])/g, '\\$1'); }
  function icalDate(v) { if (!v) return ''; return v.replace(/[-:]/g, '').replace('T', 'T') + (v.length <= 16 ? '00' : ''); }
  var SOCIAL_URL = { instagram: 'https://instagram.com/', tiktok: 'https://www.tiktok.com/@', youtube: 'https://youtube.com/@', twitter: 'https://x.com/', facebook: 'https://facebook.com/', linkedin: 'https://www.linkedin.com/in/', telegram: 'https://t.me/' };
  var BUILDERS = {
    wifi: function (f) { if (!f.ssid) return ''; var enc = f.enc || 'WPA'; return 'WIFI:T:' + (enc === 'nopass' ? 'nopass' : enc) + ';S:' + wifiEsc(f.ssid) + ';' + (enc === 'nopass' ? '' : 'P:' + wifiEsc(f.pass) + ';') + (f.hidden ? 'H:true;' : '') + ';'; },
    vcard: function (f) {
      var v = ['BEGIN:VCARD', 'VERSION:3.0'];
      if (f.name) v.push('N:' + f.name + '\nFN:' + f.name);
      if (f.org) v.push('ORG:' + f.org);
      if (f.title) v.push('TITLE:' + f.title);
      if (f.phone) v.push('TEL;TYPE=CELL:' + f.phone);
      if (f.email) v.push('EMAIL:' + f.email);
      if (f.url) v.push('URL:' + f.url);
      v.push('END:VCARD'); return (f.name || f.phone || f.email) ? v.join('\n') : '';
    },
    whatsapp: function (f) { var n = (f.num || '').replace(/\D/g, ''); if (!n) return ''; return 'https://wa.me/' + n + (f.msg ? '?text=' + encodeURIComponent(f.msg) : ''); },
    email: function (f) { if (!f.to) return ''; var q = []; if (f.subject) q.push('subject=' + encodeURIComponent(f.subject)); if (f.body) q.push('body=' + encodeURIComponent(f.body)); return 'mailto:' + f.to + (q.length ? '?' + q.join('&') : ''); },
    sms: function (f) { var n = (f.num || '').replace(/[^\d+]/g, ''); if (!n) return ''; return 'SMSTO:' + n + ':' + (f.msg || ''); },
    tel: function (f) { var n = (f.num || '').replace(/[^\d+]/g, ''); return n ? 'tel:' + n : ''; },
    geo: function (f) { if (!f.lat || !f.lng) return ''; return 'geo:' + f.lat + ',' + f.lng; },
    event: function (f) { if (!f.title) return ''; var v = ['BEGIN:VEVENT', 'SUMMARY:' + f.title]; if (f.loc) v.push('LOCATION:' + f.loc); if (f.start) v.push('DTSTART:' + icalDate(f.start)); if (f.end) v.push('DTEND:' + icalDate(f.end)); v.push('END:VEVENT'); return v.join('\n'); },
    social: function (f) { var b = SOCIAL_URL[f.platform || 'instagram']; var u = (f.user || '').replace(/^@/, ''); return u ? b + u : ''; }
  };
  function readFields(type) {
    var defs = FIELDS[type], vals = {}, i;
    for (i = 0; i < defs.length; i++) {
      var el = $('qf_' + defs[i].k); if (!el) continue;
      vals[defs[i].k] = (defs[i].t === 'check') ? el.checked : el.value;
    }
    return vals;
  }
  function renderFields(type) {
    var wrap = $('qsFields'); if (!wrap) return;
    var defs = FIELDS[type];
    if (!defs) { wrap.innerHTML = ''; return; }
    var html = '';
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i], id = 'qf_' + d.k;
      if (d.t === 'check') { html += '<label class="qs-check"><input type="checkbox" id="' + id + '"> ' + d.l + '</label>'; continue; }
      html += '<div class="qs-field"><label>' + d.l + '</label>';
      if (d.t === 'select') { html += '<select class="qs-sel" id="' + id + '">'; for (var j = 0; j < d.o.length; j++) html += '<option value="' + d.o[j][0] + '">' + d.o[j][1] + '</option>'; html += '</select>'; }
      else if (d.t === 'textarea') html += '<textarea class="qs-in" id="' + id + '" rows="2"></textarea>';
      else html += '<input type="' + (d.t === 'datetime-local' ? 'datetime-local' : 'text') + '" class="qs-in" id="' + id + '" ' + (d.t === 'tel' ? 'inputmode="tel"' : '') + '>';
      html += '</div>';
    }
    wrap.innerHTML = html;
    for (i = 0; i < defs.length; i++) (function (el) {
      if (!el) return;
      el.addEventListener('input', buildFromFields);
      el.addEventListener('change', buildFromFields);
    })($('qf_' + defs[i].k));
  }
  function buildFromFields() {
    var type = st.content, fn = BUILDERS[type];
    if (!fn) return;
    var payload = fn(readFields(type));
    st.text = payload;
    var t = $('qsText'); if (t) t.value = payload;
    render();
  }
  function setContentType(type) {
    st.content = type;
    var fields = $('qsFields'), t = $('qsText'), lbl = $('qsInLabel');
    var structured = (type !== 'link' && type !== 'text');
    if (structured) {
      renderFields(type);
      if (fields) fields.classList.remove('hide');
      if (t) { t.setAttribute('readonly', 'readonly'); }
      if (lbl) lbl.textContent = 'Hasil (otomatis di-encode)';
      buildFromFields();
    } else {
      if (fields) { fields.innerHTML = ''; fields.classList.add('hide'); }
      if (t) { t.removeAttribute('readonly'); if (st.mode !== 'qr') applySym(); else { if (lbl) lbl.textContent = (type === 'text' ? 'Teks' : 'Link atau teks'); t.setAttribute('placeholder', type === 'text' ? 'Ketik teks apa saja…' : 'Tempel link… mis. https://pusatbanksoal.id'); } st.text = t.value; }
      render();
    }
  }
  function contentAllowed() { return st.mode === 'qr' || (st.mode === 'bar' && TWO_D[st.sym]); }
  function updateContentVisibility() {
    var wrap = $('qsContentWrap'), fields = $('qsFields');
    var show = contentAllowed();
    if (wrap) wrap.classList.toggle('hide', !show);
    if (!show) { if (fields) fields.classList.add('hide'); }
    else if (st.content !== 'link' && st.content !== 'text') { if (fields) fields.classList.remove('hide'); }
  }
  function seg(id, attr, val, key) {
    var btns = document.querySelectorAll('#' + id + ' button'), i;
    for (i = 0; i < btns.length; i++) btns[i].classList.toggle('on', btns[i].getAttribute(attr) === val);
    st[key] = val;
    if (id === 'qsFrame') { var lf = $('qsLabelField'); if (lf) lf.style.display = (val === 'label') ? 'block' : 'none'; }
    render();
  }
  function syncColor(colorId, hexId, key) {
    var col = $(colorId), hx = $(hexId);
    if (col) col.addEventListener('input', function () { st[key] = col.value; if (hx) hx.value = col.value.toUpperCase(); render(); });
    if (hx) hx.addEventListener('input', function () {
      var v = hx.value.trim(); if (v.charAt(0) !== '#') v = '#' + v;
      if (hex2rgb(v)) { st[key] = v; if (col) col.value = v; render(); }
    });
  }

  function boot() {
    /* mode */
    var mbtns = document.querySelectorAll('#qsModes button'), i;
    for (i = 0; i < mbtns.length; i++) (function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); })(mbtns[i]);
    /* symbology */
    var symSel = $('qsSym');
    if (symSel) { st.sym = symSel.value; symSel.addEventListener('change', function () { st.sym = symSel.value; syncInputMode(); }); }
    /* text */
    var txt = $('qsText');
    if (txt) { st.text = txt.value; txt.addEventListener('input', function () { if (st.content === 'link' || st.content === 'text') { st.text = txt.value; render(); } }); }
    /* content type */
    var cSel = $('qsContent');
    if (cSel) { st.content = cSel.value; cSel.addEventListener('change', function () { setContentType(cSel.value); }); }
    /* colors */
    syncColor('qsFg', 'qsFgHex', 'fg'); syncColor('qsBg', 'qsBgHex', 'bg');
    /* size */
    var sz = $('qsSize');
    if (sz) sz.addEventListener('input', function () {
      st.size = parseInt(sz.value, 10);
      var v = $('qsSizeVal'), l = $('qsSizeLbl');
      if (v) v.textContent = st.size + 'px'; if (l) l.textContent = '(' + st.size + ' px)';
      render();
    });
    /* margin */
    var mg = $('qsMargin');
    if (mg) mg.addEventListener('input', function () { st.margin = parseInt(mg.value, 10); var v = $('qsMarginVal'); if (v) v.textContent = st.margin; render(); });
    /* segmented */
    bindSeg('qsEc', 'data-ec', 'ec'); bindSeg('qsShape', 'data-shape', 'shape'); bindSeg('qsFrame', 'data-frame', 'frame');
    /* label text */
    var lab = $('qsLabel'); if (lab) { st.label = lab.value; lab.addEventListener('input', function () { st.label = lab.value; render(); }); }
    /* logo */
    var lb = $('qsLogoBtn'), lf = $('qsLogoFile'), lc = $('qsLogoClear');
    if (lb && lf) lb.addEventListener('click', function () { lf.click(); });
    if (lf) lf.addEventListener('change', function () {
      var file = lf.files && lf.files[0]; if (!file) return;
      var rd = new FileReader();
      rd.onload = function () { var im = new Image(); im.onload = function () { st.logo = im; if (lc) lc.style.display = ''; if (lb) lb.textContent = '🖼️ Ganti logo…'; render(); }; im.src = rd.result; };
      rd.readAsDataURL(file);
    });
    if (lc) lc.addEventListener('click', function () { st.logo = null; lc.style.display = 'none'; if (lb) lb.textContent = '📁 Pilih logo…'; if (lf) lf.value = ''; render(); });
    /* exports */
    var ex = document.querySelectorAll('[data-exp]');
    for (i = 0; i < ex.length; i++) (function (b) { b.addEventListener('click', function () { doExport(b.getAttribute('data-exp')); }); })(ex[i]);
    var em = document.querySelectorAll('[data-embed]');
    for (i = 0; i < em.length; i++) (function (b) { b.addEventListener('click', function () { doEmbed(b.getAttribute('data-embed')); }); })(em[i]);

    updateContentVisibility();
    render();
  }
  function bindSeg(id, attr, key) {
    var btns = document.querySelectorAll('#' + id + ' button'), i;
    for (i = 0; i < btns.length; i++) (function (b) { b.addEventListener('click', function () { seg(id, attr, b.getAttribute(attr), key); }); })(btns[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
