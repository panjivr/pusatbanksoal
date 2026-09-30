/* Bekal — PDF417 stacked 2D barcode. Extends window.BEKAL_BC.
   Vanilla ES5. Uses the ISO 15438 codeword pattern table in
   assets/pdf417-data.js (window.P417DATA). Returns
   {dim:2, w, h, data:Uint8Array (row-major 0/1)}. */
(function () {
  'use strict';
  var BC = window.BEKAL_BC || (window.BEKAL_BC = {});

  function utf8(s) {
    var b = [], i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c < 0x80) b.push(c);
      else if (c < 0x800) b.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F));
      else if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) {
        var c2 = s.charCodeAt(i + 1); var cp = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00); i++;
        b.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3F), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F));
      } else b.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F));
    }
    return b;
  }
  var TEXT_LATCH = 900, BYTE_LATCH = 901, BYTE_LATCH_ALT = 924, NUMERIC_LATCH = 902, PAD = 900;
  var SUB_PREF = ['LOWER', 'UPPER', 'MIXED', 'PUNCT'];

  function optimalFn(c) {
    if (c >= 48 && c <= 57) return 'num';
    if (window.P417DATA.CHARS['' + c]) return 'text';
    return 'byte';
  }
  function splitChunks(data) {
    var out = [], cur = null, fn = null, i;
    for (i = 0; i < data.length; i++) {
      var f = optimalFn(data[i]);
      if (f !== fn) { if (cur) out.push({ fn: fn, data: cur }); cur = []; fn = f; }
      cur.push(data[i]);
    }
    if (cur) out.push({ fn: fn, data: cur });
    return out;
  }
  function getSubmode(c) {
    var m = window.P417DATA.CHARS['' + c];
    for (var i = 0; i < SUB_PREF.length; i++) if (m[SUB_PREF[i]] != null) return SUB_PREF[i];
    return null;
  }
  function compactText(data) {
    var D = window.P417DATA, interim = [], submode = 'UPPER', i;
    for (i = 0; i < data.length; i++) {
      var c = data[i], m = D.CHARS['' + c];
      if (!m || m[submode] == null) {
        var prev = submode; submode = getSubmode(c);
        var sw = D.SWITCH[prev][submode]; for (var k = 0; k < sw.length; k++) interim.push(sw[k]);
      }
      interim.push(D.CHARS['' + c][submode]);
    }
    var words = [];
    for (i = 0; i < interim.length; i += 2) {
      var a = interim[i], b = (i + 1 < interim.length) ? interim[i + 1] : 29;
      words.push(30 * a + b);
    }
    return words;
  }
  function compactBytes(data) {
    var words = [], i, j;
    for (i = 0; i < data.length; i += 6) {
      var chunk = data.slice(i, i + 6);
      if (chunk.length === 6) {
        var val = 0; for (j = 0; j < 6; j++) val = val * 256 + chunk[j];
        var w = [0, 0, 0, 0, 0];
        for (j = 4; j >= 0; j--) { w[j] = val % 900; val = Math.floor(val / 900); }
        for (j = 0; j < 5; j++) words.push(w[j]);
      } else { for (j = 0; j < chunk.length; j++) words.push(chunk[j]); }
    }
    return words;
  }
  function compactNumbers(data) {
    var words = [], i, j;
    for (i = 0; i < data.length; i += 44) {
      var chunk = data.slice(i, i + 44), s = '1';
      for (j = 0; j < chunk.length; j++) s += String.fromCharCode(chunk[j]);
      var val = BigInt(s), b900 = [];
      while (val > 0n) { b900.unshift(Number(val % 900n)); val = val / 900n; }
      if (b900.length === 0) b900 = [0];
      for (j = 0; j < b900.length; j++) words.push(b900[j]);
    }
    return words;
  }
  function highCompact(data) {
    var chunks = splitChunks(data), out = [], i;
    for (i = 0; i < chunks.length; i++) {
      var ch = chunks[i], addSwitch = (i > 0 || ch.fn !== 'text');
      if (addSwitch) {
        if (ch.fn === 'text') out.push(TEXT_LATCH);
        else if (ch.fn === 'byte') out.push(ch.data.length % 6 === 0 ? BYTE_LATCH_ALT : BYTE_LATCH);
        else out.push(NUMERIC_LATCH);
      }
      var w = ch.fn === 'text' ? compactText(ch.data) : ch.fn === 'byte' ? compactBytes(ch.data) : compactNumbers(ch.data);
      for (var k = 0; k < w.length; k++) out.push(w[k]);
    }
    return out;
  }
  function computeEC(words, level) {
    var factors = window.P417DATA.EC[level], count = Math.pow(2, level + 1);
    var ec = new Array(count); for (var i = 0; i < count; i++) ec[i] = 0;
    for (i = 0; i < words.length; i++) {
      var temp = (words[i] + ec[count - 1]) % 929;
      for (var x = count - 1; x >= 0; x--) {
        var word = x > 0 ? ec[x - 1] : 0;
        ec[x] = (word + 929 - (temp * factors[x]) % 929) % 929;
      }
    }
    var res = []; for (i = count - 1; i >= 0; i--) res.push(ec[i] > 0 ? 929 - ec[i] : 0);
    return res;
  }
  function leftCW(row, rows, cols, sec) {
    var t = row % 3, x;
    if (t === 0) x = Math.floor((rows - 1) / 3);
    else if (t === 1) x = sec * 3 + (rows - 1) % 3;
    else x = cols - 1;
    return 30 * Math.floor(row / 3) + x;
  }
  function rightCW(row, rows, cols, sec) {
    var t = row % 3, x;
    if (t === 0) x = cols - 1;
    else if (t === 1) x = Math.floor((rows - 1) / 3);
    else x = sec * 3 + (rows - 1) % 3;
    return 30 * Math.floor(row / 3) + x;
  }
  function bitsOf(val, w) { var s = ''; for (var i = w - 1; i >= 0; i--) s += ((val >> i) & 1); return s; }

  BC.pdf417 = function (s, opt) {
    if (!window.P417DATA) throw new Error('Tabel PDF417 belum termuat. Muat ulang halaman.');
    if (!s) throw new Error('Masukkan teks/link untuk PDF417.');
    opt = opt || {};
    var data = utf8(s);
    var dataWords = highCompact(data);
    var dataCount = dataWords.length;
    var sec = opt.sec != null ? opt.sec : (dataCount <= 40 ? 2 : dataCount <= 160 ? 3 : dataCount <= 320 ? 4 : dataCount <= 863 ? 5 : 6);
    var ecCount = Math.pow(2, sec + 1);
    var cols = opt.cols || Math.max(1, Math.min(12, Math.round(Math.sqrt(dataCount + ecCount + 1))));
    while (cols > 1 && Math.ceil((dataCount + ecCount + 1) / cols) < 3) cols--;
    var total = dataCount + ecCount + 1, mod = total % cols;
    var padding = []; if (mod > 0) { for (var p = 0; p < cols - mod; p++) padding.push(PAD); }
    var lenDesc = dataCount + padding.length + 1;
    if (lenDesc > 928) throw new Error('Data terlalu panjang untuk PDF417. Persingkat isinya atau gunakan QR.');
    var extended = [lenDesc].concat(dataWords, padding);
    var ec = computeEC(extended, sec);
    var cw = extended.concat(ec);
    var numRows = cw.length / cols;
    if (numRows < 3) throw new Error('Data terlalu pendek untuk PDF417. Tambahkan isi atau gunakan QR/Data Matrix.');
    if (numRows > 90) throw new Error('Data terlalu panjang untuk PDF417. Gunakan QR untuk data besar.');

    var START = 0x1fea8, STOP = 0x3fa29, D = window.P417DATA;
    var rowH = 3;
    var rowsBits = [];
    for (var r = 0; r < numRows; r++) {
      var t = r % 3;
      var left = leftCW(r, numRows, cols, sec), right = rightCW(r, numRows, cols, sec);
      var line = bitsOf(START, 17) + bitsOf(D.CODES[t][left], 17);
      for (var c = 0; c < cols; c++) line += bitsOf(D.CODES[t][cw[r * cols + c]], 17);
      line += bitsOf(D.CODES[t][right], 17) + bitsOf(STOP, 18);
      rowsBits.push(line);
    }
    var W = rowsBits[0].length, H = numRows * rowH;
    var grid = new Uint8Array(W * H);
    for (r = 0; r < numRows; r++) {
      for (var y = 0; y < rowH; y++) {
        var rr = r * rowH + y, ln = rowsBits[r];
        for (var x = 0; x < W; x++) grid[rr * W + x] = (ln.charAt(x) === '1') ? 1 : 0;
      }
    }
    return { dim: 2, w: W, h: H, data: grid, aspect: 'wide' };
  };
})();
