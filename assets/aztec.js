/* Bekal — Aztec Code encoder (ISO/IEC 24778). Extends window.BEKAL_BC.
   Vanilla ES5. Uses Binary-Shift high-level encoding (handles any byte,
   ideal for links) + base-1 Reed-Solomon over GF(2^wordSize). Supports
   compact (1-4 layers) and full (1-32 layers) symbols with reference
   grid. Returns {dim:2, w, h, data:Uint8Array}. Ported from the ZXing
   reference layout. */
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

  /* ---- Galois fields for Aztec RS (generatorBase = 1) ---- */
  function GF(prim, size) {
    var exp = new Array(size * 2), log = new Array(size), x = 1, i;
    for (i = 0; i < size - 1; i++) { exp[i] = x; log[x] = i; x <<= 1; if (x & size) x ^= prim; }
    for (i = size - 1; i < size * 2; i++) exp[i] = exp[i - (size - 1)];
    return { exp: exp, log: log, mul: function (a, b) { return (a === 0 || b === 0) ? 0 : exp[log[a] + log[b]]; } };
  }
  var GFS = { 4: GF(19, 16), 6: GF(67, 64), 8: GF(301, 256), 10: GF(1033, 1024), 12: GF(4201, 4096) };
  function rs(data, eccLen, wordSize) {
    var gf = GFS[wordSize];
    /* generator with roots a^1..a^eccLen (base 1) */
    var g = [1];
    for (var i = 1; i <= eccLen; i++) {
      g.push(0);
      for (var j = g.length - 1; j > 0; j--) g[j] = g[j - 1] ^ gf.mul(g[j], gf.exp[i]);
      g[0] = gf.mul(g[0], gf.exp[i]);
    }
    var res = new Array(eccLen); for (i = 0; i < eccLen; i++) res[i] = 0;
    for (i = 0; i < data.length; i++) {
      var factor = data[i] ^ res[0];
      res.shift(); res.push(0);
      for (j = 0; j < eccLen; j++) res[j] ^= gf.mul(g[eccLen - 1 - j], factor);
    }
    return res;
  }

  /* ---- bit buffer ---- */
  function Bits() { this.b = []; }
  Bits.prototype.append = function (val, len) { for (var i = len - 1; i >= 0; i--) this.b.push((val >> i) & 1); };
  Bits.prototype.size = function () { return this.b.length; };
  Bits.prototype.get = function (i) { return this.b[i]; };

  /* ---- high-level: Binary Shift only (works for any bytes / links) ---- */
  function encodeHigh(bytes) {
    var bb = new Bits(), n = bytes.length, i = 0;
    while (i < n) {
      var remain = n - i, chunk = Math.min(remain, 2047);
      /* Binary shift from Upper mode: code 31 in 5 bits */
      bb.append(31, 5);
      if (chunk <= 31) bb.append(chunk, 5);
      else { bb.append(0, 5); bb.append(chunk - 31, 11); }
      for (var k = 0; k < chunk; k++) bb.append(bytes[i + k], 8);
      i += chunk;
    }
    return bb;
  }

  /* ---- bit stuffing to wordSize ---- */
  function stuffBits(bits, wordSize) {
    var out = new Bits(), n = bits.size(), mask = (1 << wordSize) - 2;
    for (var i = 0; i < n; i += wordSize) {
      var word = 0;
      for (var j = 0; j < wordSize; j++) { if (i + j >= n || bits.get(i + j)) word |= (1 << (wordSize - 1 - j)); }
      if ((word & mask) === mask) { out.append(word & mask, wordSize); i--; }
      else if ((word & mask) === 0) { out.append(word | 1, wordSize); i--; }
      else out.append(word, wordSize);
    }
    return out;
  }

  var WORD_SIZE = [4, 6, 6, 8, 8, 8, 8, 8, 8, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];

  function totalBitsInLayer(layers, compact) { return ((compact ? 88 : 112) + 16 * layers) * layers; }

  function toWords(bits, wordSize) {
    var w = [], n = bits.size();
    for (var i = 0; i < n; i += wordSize) { var v = 0; for (var j = 0; j < wordSize; j++) v = (v << 1) | bits.get(i + j); w.push(v); }
    return w;
  }

  function generateModeMessage(compact, layers, dataWords) {
    var mm = new Bits();
    if (compact) { mm.append(layers - 1, 2); mm.append(dataWords - 1, 6); }
    else { mm.append(layers - 1, 5); mm.append(dataWords - 1, 11); }
    var words = toWords(mm, 4);
    var eccLen = compact ? 5 : 6;
    var ecc = rs(words, eccLen, 4);
    var all = words.concat(ecc);
    var out = new Bits();
    for (var i = 0; i < all.length; i++) out.append(all[i], 4);
    return out;
  }

  function drawBullsEye(M, size, center, ringCount) {
    function set(x, y) { M.set(x, y, 1); }
    for (var i = 0; i < ringCount; i += 2) {
      for (var j = center - i; j <= center + i; j++) { set(j, center - i); set(center + i, j); set(j, center + i); set(center - i, j); }
    }
    /* orientation marks at the mode-message ring corners */
    set(center - ringCount, center - ringCount);
    set(center - ringCount + 1, center - ringCount);
    set(center - ringCount, center - ringCount + 1);
    set(center + ringCount, center - ringCount);
    set(center + ringCount, center - ringCount + 1);
    set(center + ringCount, center + ringCount - 1);
  }

  function Matrix(size) {
    this.size = size; this.d = new Uint8Array(size * size);
  }
  Matrix.prototype.set = function (x, y, v) { if (x >= 0 && y >= 0 && x < this.size && y < this.size) this.d[y * this.size + x] = v ? 1 : 0; };

  BC.aztec = function (s, opt) {
    if (!s) throw new Error('Masukkan teks/link untuk Aztec.');
    var bytes = utf8(s);
    var bits = encodeHigh(bytes);
    var eccBits = Math.floor(bits.size() * 23 / 100) + 11;

    /* choose smallest symbol that fits */
    var chosen = null, order = [true, false], oi, layers, compact;
    for (oi = 0; oi < order.length && !chosen; oi++) {
      compact = order[oi];
      var maxL = compact ? 4 : 32, fieldMax = compact ? 64 : 2048;
      for (layers = 1; layers <= maxL; layers++) {
        var wordSize = WORD_SIZE[layers];
        var stuffed = stuffBits(bits, wordSize);
        var totalBits = totalBitsInLayer(layers, compact);
        if (stuffed.size() + eccBits > totalBits) continue;
        var dataWords = stuffed.size() / wordSize;
        if (dataWords - 1 >= fieldMax) continue;
        chosen = { compact: compact, layers: layers, wordSize: wordSize, stuffed: stuffed, totalBits: totalBits, dataWords: dataWords };
        break;
      }
    }
    if (!chosen) throw new Error('Data terlalu panjang untuk Aztec. Gunakan QR atau PDF417 untuk data besar.');

    compact = chosen.compact; layers = chosen.layers;
    var wordSize = chosen.wordSize, totalWords = Math.floor(chosen.totalBits / wordSize);
    var messageWords = toWords(chosen.stuffed, wordSize);
    var eccWords = totalWords - messageWords.length;
    var checks = rs(messageWords, eccWords, wordSize);
    var allWords = messageWords.concat(checks);
    /* message bits: leading (totalBits % wordSize) zero pad bits, then words MSB first */
    var msg = new Bits();
    var lead = chosen.totalBits % wordSize;
    for (var pz = 0; pz < lead; pz++) msg.b.push(0);
    for (var w = 0; w < allWords.length; w++) msg.append(allWords[w], wordSize);

    var modeMessage = generateModeMessage(compact, layers, messageWords.length);

    var baseMatrixSize = (compact ? 11 : 14) + layers * 4;
    var alignmentMap = new Array(baseMatrixSize), matrixSize, i;
    if (compact) { matrixSize = baseMatrixSize; for (i = 0; i < baseMatrixSize; i++) alignmentMap[i] = i; }
    else {
      matrixSize = baseMatrixSize + 1 + 2 * (Math.floor((Math.floor(baseMatrixSize / 2) - 1) / 15));
      var origCenter = Math.floor(baseMatrixSize / 2), center0 = Math.floor(matrixSize / 2);
      for (i = 0; i < origCenter; i++) {
        var newOffset = i + Math.floor(i / 15);
        alignmentMap[origCenter - i - 1] = center0 - newOffset - 1;
        alignmentMap[origCenter + i] = center0 + newOffset + 1;
      }
    }
    var M = new Matrix(matrixSize);

    /* draw data spiral */
    var rowOffset = 0;
    for (i = 0; i < layers; i++) {
      var rowSize = (layers - i) * 4 + (compact ? 9 : 12);
      for (var j = 0; j < rowSize; j++) {
        var columnOffset = j * 2;
        for (var k = 0; k < 2; k++) {
          if (msg.get(rowOffset + columnOffset + k)) M.set(alignmentMap[i * 2 + k], alignmentMap[i * 2 + j], 1);
          if (msg.get(rowOffset + rowSize * 2 + columnOffset + k)) M.set(alignmentMap[i * 2 + j], alignmentMap[baseMatrixSize - 1 - i * 2 - k], 1);
          if (msg.get(rowOffset + rowSize * 4 + columnOffset + k)) M.set(alignmentMap[baseMatrixSize - 1 - i * 2 - k], alignmentMap[baseMatrixSize - 1 - i * 2 - j], 1);
          if (msg.get(rowOffset + rowSize * 6 + columnOffset + k)) M.set(alignmentMap[baseMatrixSize - 1 - i * 2 - j], alignmentMap[i * 2 + k], 1);
        }
      }
      rowOffset += rowSize * 8;
    }

    /* mode message ring */
    var center = Math.floor(matrixSize / 2);
    if (compact) {
      for (i = 0; i < 7; i++) {
        var off = center - 3 + i;
        if (modeMessage.get(i)) M.set(off, center - 5, 1);
        if (modeMessage.get(i + 7)) M.set(center + 5, off, 1);
        if (modeMessage.get(20 - i)) M.set(off, center + 5, 1);
        if (modeMessage.get(27 - i)) M.set(center - 5, off, 1);
      }
    } else {
      for (i = 0; i < 10; i++) {
        var off2 = center - 5 + i + Math.floor(i / 5);
        if (modeMessage.get(i)) M.set(off2, center - 7, 1);
        if (modeMessage.get(i + 10)) M.set(center + 7, off2, 1);
        if (modeMessage.get(29 - i)) M.set(off2, center + 7, 1);
        if (modeMessage.get(39 - i)) M.set(center - 7, off2, 1);
      }
    }

    /* bullseye + orientation */
    drawBullsEye(M, matrixSize, center, compact ? 5 : 7);

    /* full: reference grid */
    if (!compact) {
      for (i = 0, j = 0; i < Math.floor(baseMatrixSize / 2) - 1; i += 15, j += 16) {
        for (var kk = (center & 1); kk < matrixSize; kk += 2) {
          M.set(center - j, kk, 1); M.set(center + j, kk, 1); M.set(kk, center - j, 1); M.set(kk, center + j, 1);
        }
      }
    }

    return { dim: 2, w: matrixSize, h: matrixSize, data: M.d };
  };
})();
