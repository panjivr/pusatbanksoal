/* Bekal — barcode symbology encoders (vanilla ES5, no deps)
   1D linear: EAN-13, UPC-A, EAN-8, Code 39, ITF (Interleaved 2 of 5), Codabar
   2D matrix: Data Matrix (ECC200) — high density, "kotak sedikit info banyak"
   Each 1D encoder returns {dim:1, bits:"1010..", text:"<human readable>"}.
   Data Matrix returns {dim:2, w, h, data:Uint8Array (row-major 0/1)}.
   Encoders throw Error (pesan Bahasa Indonesia) on invalid input. */
(function () {
  'use strict';
  var BC = {};

  function digitsOnly(s) { return (s || '').replace(/\D/g, ''); }
  function checkMod10(body) { /* rightmost weight 3, then 1, ... */
    var sum = 0, w = 3;
    for (var i = body.length - 1; i >= 0; i--) { sum += parseInt(body.charAt(i), 10) * w; w = (w === 3) ? 1 : 3; }
    return (10 - (sum % 10)) % 10;
  }

  /* ---------- EAN/UPC digit encodings (7 modules each) ---------- */
  var L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
  var G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
  var R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
  var EAN13_PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];

  BC.ean13 = function (s) {
    var d = digitsOnly(s);
    if (d.length === 12) d += checkMod10(d);
    else if (d.length === 13) { if (parseInt(d.charAt(12), 10) !== checkMod10(d.slice(0, 12))) throw new Error('Digit cek EAN-13 tidak valid. Masukkan 12 digit dan biarkan kami menghitung digit ceknya.'); }
    else throw new Error('EAN-13 butuh 12 digit (digit cek dihitung otomatis) atau 13 digit lengkap.');
    var par = EAN13_PARITY[parseInt(d.charAt(0), 10)];
    var bits = '101';
    for (var i = 1; i <= 6; i++) bits += (par.charAt(i - 1) === 'L' ? L : G)[parseInt(d.charAt(i), 10)];
    bits += '01010';
    for (i = 7; i <= 12; i++) bits += R[parseInt(d.charAt(i), 10)];
    bits += '101';
    return { dim: 1, bits: bits, text: d };
  };

  BC.upca = function (s) {
    var d = digitsOnly(s);
    if (d.length === 11) d += checkMod10(d);
    else if (d.length === 12) { if (parseInt(d.charAt(11), 10) !== checkMod10(d.slice(0, 11))) throw new Error('Digit cek UPC-A tidak valid. Masukkan 11 digit dan digit cek dihitung otomatis.'); }
    else throw new Error('UPC-A butuh 11 digit (digit cek otomatis) atau 12 digit lengkap.');
    var bits = '101';
    for (var i = 0; i <= 5; i++) bits += L[parseInt(d.charAt(i), 10)];
    bits += '01010';
    for (i = 6; i <= 11; i++) bits += R[parseInt(d.charAt(i), 10)];
    bits += '101';
    return { dim: 1, bits: bits, text: d };
  };

  BC.ean8 = function (s) {
    var d = digitsOnly(s);
    if (d.length === 7) d += checkMod10(d);
    else if (d.length === 8) { if (parseInt(d.charAt(7), 10) !== checkMod10(d.slice(0, 7))) throw new Error('Digit cek EAN-8 tidak valid. Masukkan 7 digit dan digit cek dihitung otomatis.'); }
    else throw new Error('EAN-8 butuh 7 digit (digit cek otomatis) atau 8 digit lengkap.');
    var bits = '101';
    for (var i = 0; i <= 3; i++) bits += L[parseInt(d.charAt(i), 10)];
    bits += '01010';
    for (i = 4; i <= 7; i++) bits += R[parseInt(d.charAt(i), 10)];
    bits += '101';
    return { dim: 1, bits: bits, text: d };
  };

  /* ---------- Code 39 ---------- */
  var C39_ALPHA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';
  var C39_ENC = [0x034,0x121,0x061,0x160,0x031,0x130,0x070,0x025,0x124,0x064,
    0x109,0x049,0x148,0x019,0x118,0x058,0x00D,0x10C,0x04C,0x01C,
    0x103,0x043,0x142,0x013,0x112,0x052,0x007,0x106,0x046,0x016,
    0x181,0x0C1,0x1C0,0x091,0x190,0x0D0,0x085,0x184,0x0C4,0x0A8,
    0x0A2,0x08A,0x02A];
  var C39_START = 0x094; /* '*' */
  function c39bits(enc, wide) {
    var s = '', bar = true;
    for (var i = 0; i < 9; i++) {
      var w = ((enc >> (8 - i)) & 1) ? wide : 1;
      s += (bar ? '1' : '0').repeat ? (bar ? '1' : '0').repeat(w) : rep(bar ? '1' : '0', w);
      bar = !bar;
    }
    return s;
  }
  function rep(c, n) { var s = ''; while (n-- > 0) s += c; return s; }
  BC.code39 = function (s) {
    s = (s || '').toUpperCase();
    var wide = 3, bits = c39bits(C39_START, wide) + '0';
    for (var i = 0; i < s.length; i++) {
      var idx = C39_ALPHA.indexOf(s.charAt(i));
      if (idx < 0) throw new Error('Code 39 hanya mendukung A-Z, 0-9 dan - . spasi $ / + % — untuk teks bebas pakai QR atau Data Matrix.');
      bits += c39bits(C39_ENC[idx], wide) + '0'; /* narrow space gap */
    }
    bits += c39bits(C39_START, wide);
    return { dim: 1, bits: bits, text: '*' + s + '*' };
  };

  /* ---------- ITF (Interleaved 2 of 5) ---------- */
  var ITF = ['NNWWN','WNNNW','NWNNW','WWNNN','NNWNW','WNWNN','NWWNN','NNNWW','WNNWN','NWNWN'];
  BC.itf = function (s) {
    var d = digitsOnly(s), wide = 3;
    if (d.length === 0) throw new Error('Masukkan angka untuk ITF.');
    if (d.length % 2 !== 0) d = '0' + d; /* pad to even */
    var bits = '1010'; /* start: narrow bar/space x2 */
    for (var i = 0; i < d.length; i += 2) {
      var a = ITF[parseInt(d.charAt(i), 10)], b = ITF[parseInt(d.charAt(i + 1), 10)];
      for (var j = 0; j < 5; j++) {
        bits += rep('1', a.charAt(j) === 'W' ? wide : 1); /* bar from first digit */
        bits += rep('0', b.charAt(j) === 'W' ? wide : 1); /* space from second digit */
      }
    }
    bits += rep('1', wide) + '0' + '1'; /* stop: wide bar, narrow space, narrow bar */
    return { dim: 1, bits: bits, text: d };
  };

  /* ---------- Codabar ---------- */
  var CODABAR_ALPHA = '0123456789-$:/.+ABCD';
  var CODABAR_ENC = [0x003,0x006,0x009,0x060,0x012,0x042,0x021,0x024,0x030,0x048,
    0x00c,0x018,0x045,0x051,0x054,0x015,0x01A,0x029,0x00B,0x00E];
  function codabarBits(enc, wide) {
    var s = '', bar = true;
    for (var i = 0; i < 7; i++) {
      var w = ((enc >> (6 - i)) & 1) ? wide : 1;
      s += rep(bar ? '1' : '0', w); bar = !bar;
    }
    return s;
  }
  BC.codabar = function (s) {
    s = (s || '').toUpperCase();
    var body = s.replace(/^[ABCD]/, '').replace(/[ABCD]$/, '');
    var wide = 3;
    var start = 'A', stop = 'B';
    var seq = start + body + stop;
    var bits = '';
    for (var i = 0; i < seq.length; i++) {
      var idx = CODABAR_ALPHA.indexOf(seq.charAt(i));
      if (idx < 0) throw new Error('Codabar hanya mendukung 0-9 dan simbol - $ : / . + (huruf A-D sebagai start/stop).');
      if (i > 0) bits += '0'; /* narrow inter-char space */
      bits += codabarBits(CODABAR_ENC[idx], wide);
    }
    return { dim: 1, bits: bits, text: body };
  };

  /* ================= Data Matrix (ECC200) ================= */
  /* GF(256), primitive polynomial 0x12D, generator base a^1 */
  var GEXP = new Array(512), GLOG = new Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) { GEXP[i] = x; GLOG[x] = i; x <<= 1; if (x & 256) x ^= 0x12D; }
    for (i = 255; i < 512; i++) GEXP[i] = GEXP[i - 255];
  })();
  function gmul(a, b) { return (a === 0 || b === 0) ? 0 : GEXP[GLOG[a] + GLOG[b]]; }
  function rsCompute(data, nsym) {
    /* generator poly with roots a^1..a^nsym */
    var g = [1];
    for (var i = 1; i <= nsym; i++) {
      g.push(0);
      for (var j = g.length - 1; j > 0; j--) g[j] = g[j - 1] ^ gmul(g[j], GEXP[i]);
      g[0] = gmul(g[0], GEXP[i]);
    }
    var rem = new Array(nsym); for (i = 0; i < nsym; i++) rem[i] = 0;
    for (i = 0; i < data.length; i++) {
      var factor = data[i] ^ rem[0];
      rem.shift(); rem.push(0);
      for (j = 0; j < nsym; j++) rem[j] ^= gmul(g[nsym - 1 - j], factor);
    }
    return rem;
  }

  /* square ECC200 symbols (single interleave block): full, regionData, regions, dataCW, eccCW */
  var DM_SIZES = [
    [10, 8, 1, 3, 5], [12, 10, 1, 5, 7], [14, 12, 1, 8, 10], [16, 14, 1, 12, 12],
    [18, 16, 1, 18, 14], [20, 18, 1, 22, 18], [22, 20, 1, 30, 20], [24, 22, 1, 36, 24],
    [26, 24, 1, 44, 28], [32, 14, 2, 62, 36], [36, 16, 2, 86, 42], [40, 18, 2, 114, 48],
    [44, 20, 2, 144, 56], [48, 22, 2, 174, 68]];

  function dmEncodeAscii(text) {
    var cw = [], i = 0, n = text.length;
    function isD(c) { return c >= 48 && c <= 57; }
    while (i < n) {
      var c = text.charCodeAt(i);
      if (i + 1 < n && isD(c) && isD(text.charCodeAt(i + 1))) { cw.push(parseInt(text.substr(i, 2), 10) + 130); i += 2; continue; }
      if (c > 127) { cw.push(235); cw.push(((c - 128) & 0xff) + 1); i++; continue; }
      cw.push(c + 1); i++;
    }
    return cw;
  }
  function dmPad(cw, dataCW) {
    if (cw.length < dataCW) {
      cw.push(129); /* EOM */
      while (cw.length < dataCW) {
        var pos = cw.length + 1;
        var r = ((149 * pos) % 253) + 1;
        var v = 129 + r; if (v > 254) v -= 254;
        cw.push(v);
      }
    }
    return cw;
  }
  /* ECC200 default bit placement (ISO 16022 Annex F / ZXing DefaultPlacement) */
  function dmPlace(cw, ncols, nrows) {
    var bits = new Int8Array(nrows * ncols); for (var k = 0; k < bits.length; k++) bits[k] = -1;
    function has(r, c) { return bits[r * ncols + c] >= 0; }
    function bitOf(v, b) { return (v & (1 << (8 - b))) ? 1 : 0; }
    function mod(row, col, pos, b) {
      if (row < 0) { row += nrows; col += 4 - ((nrows + 4) % 8); }
      if (col < 0) { col += ncols; row += 4 - ((ncols + 4) % 8); }
      bits[row * ncols + col] = bitOf(cw[pos], b);
    }
    function utah(row, col, pos) {
      mod(row - 2, col - 2, pos, 1); mod(row - 2, col - 1, pos, 2);
      mod(row - 1, col - 2, pos, 3); mod(row - 1, col - 1, pos, 4);
      mod(row - 1, col, pos, 5); mod(row, col - 2, pos, 6);
      mod(row, col - 1, pos, 7); mod(row, col, pos, 8);
    }
    function corner1(pos) { mod(nrows - 1, 0, pos, 1); mod(nrows - 1, 1, pos, 2); mod(nrows - 1, 2, pos, 3); mod(0, ncols - 2, pos, 4); mod(0, ncols - 1, pos, 5); mod(1, ncols - 1, pos, 6); mod(2, ncols - 1, pos, 7); mod(3, ncols - 1, pos, 8); }
    function corner2(pos) { mod(nrows - 3, 0, pos, 1); mod(nrows - 2, 0, pos, 2); mod(nrows - 1, 0, pos, 3); mod(0, ncols - 4, pos, 4); mod(0, ncols - 3, pos, 5); mod(0, ncols - 2, pos, 6); mod(0, ncols - 1, pos, 7); mod(1, ncols - 1, pos, 8); }
    function corner3(pos) { mod(nrows - 3, 0, pos, 1); mod(nrows - 2, 0, pos, 2); mod(nrows - 1, 0, pos, 3); mod(0, ncols - 2, pos, 4); mod(0, ncols - 1, pos, 5); mod(1, ncols - 1, pos, 6); mod(2, ncols - 1, pos, 7); mod(3, ncols - 1, pos, 8); }
    function corner4(pos) { mod(nrows - 1, 0, pos, 1); mod(nrows - 1, ncols - 1, pos, 2); mod(0, ncols - 3, pos, 3); mod(0, ncols - 2, pos, 4); mod(0, ncols - 1, pos, 5); mod(1, ncols - 3, pos, 6); mod(1, ncols - 2, pos, 7); mod(1, ncols - 1, pos, 8); }
    var pos = 0, row = 4, col = 0;
    do {
      if (row === nrows && col === 0) corner1(pos++);
      if (row === nrows - 2 && col === 0 && (ncols % 4) !== 0) corner2(pos++);
      if (row === nrows - 2 && col === 0 && (ncols % 8) === 4) corner3(pos++);
      if (row === nrows + 4 && col === 2 && (ncols % 8) === 0) corner4(pos++);
      do {
        if (row < nrows && col >= 0 && !has(row, col)) utah(row, col, pos++);
        row -= 2; col += 2;
      } while (row >= 0 && col < ncols);
      row += 1; col += 3;
      do {
        if (row >= 0 && col < ncols && !has(row, col)) utah(row, col, pos++);
        row += 2; col -= 2;
      } while (row < nrows && col >= 0);
      row += 3; col += 1;
    } while (row < nrows || col < ncols);
    if (!has(nrows - 1, ncols - 1)) { bits[(nrows - 1) * ncols + (ncols - 1)] = 1; bits[(nrows - 2) * ncols + (ncols - 2)] = 1; }
    for (k = 0; k < bits.length; k++) if (bits[k] < 0) bits[k] = 0;
    return bits;
  }
  function dmBuild(placeBits, ncols, nrows, regionData, regions) {
    var fw = ncols + 2 * regions, fh = nrows + 2 * regions;
    var M = new Uint8Array(fw * fh);
    function S(x, y, v) { M[y * fw + x] = v ? 1 : 0; }
    var mY = 0, x, y;
    for (y = 0; y < nrows; y++) {
      if (y % regionData === 0) { for (x = 0; x < fw; x++) S(x, mY, (x % 2) === 0); mY++; }
      var mX = 0;
      for (x = 0; x < ncols; x++) {
        if (x % regionData === 0) { S(mX, mY, 1); mX++; }
        S(mX, mY, placeBits[y * ncols + x]); mX++;
        if (x % regionData === regionData - 1) { S(mX, mY, (y % 2) === 0); mX++; }
      }
      mY++;
      if (y % regionData === regionData - 1) { for (x = 0; x < fw; x++) S(x, mY, 1); mY++; }
    }
    return { w: fw, h: fh, data: M };
  }
  BC.datamatrix = function (s) {
    if (!s) throw new Error('Masukkan teks/angka untuk Data Matrix.');
    var cw = dmEncodeAscii(s);
    var sz = null;
    for (var i = 0; i < DM_SIZES.length; i++) if (cw.length <= DM_SIZES[i][3]) { sz = DM_SIZES[i]; break; }
    if (!sz) throw new Error('Data terlalu panjang untuk Data Matrix (maks ~174 byte / 348 digit). Untuk data besar gunakan QR Code.');
    var regionData = sz[1], regions = sz[2], dataCW = sz[3], eccCW = sz[4];
    cw = dmPad(cw, dataCW);
    var ecc = rsCompute(cw, eccCW);
    var full = cw.concat(ecc);
    var ncols = regionData * regions, nrows = regionData * regions;
    var placed = dmPlace(full, ncols, nrows);
    var m = dmBuild(placed, ncols, nrows, regionData, regions);
    return { dim: 2, w: m.w, h: m.h, data: m.data };
  };

  window.BEKAL_BC = BC;
})();
