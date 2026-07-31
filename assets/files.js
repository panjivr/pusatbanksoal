/* files.js — pembaca berkas sisi klien tanpa dependensi (gratis).
 * Membaca DOCX & XLSX (format ZIP) memakai DecompressionStream bawaan
 * peramban, plus CSV. Dipakai Skripsi Doctor & Analisis Data.
 *
 * API (semua async kecuali CSV):
 *   FILES.readDocx(arrayBuffer)  -> Promise<string>            (teks dokumen)
 *   FILES.readXlsx(arrayBuffer)  -> Promise<{headers, rows}>   (rows: array of array)
 *   FILES.readCsv(text)          -> {headers, rows}
 *   FILES.readFile(file)         -> Promise<{kind, text?, headers?, rows?}>
 */
(function (global) {
  'use strict';

  function dv(u8) { return new DataView(u8.buffer, u8.byteOffset, u8.byteLength); }

  function inflateRaw(bytes) {
    if (!bytes || !bytes.length) return Promise.resolve(new Uint8Array(0));
    if (typeof DecompressionStream === 'undefined')
      return Promise.reject(new Error('Peramban tidak mendukung DecompressionStream.'));
    var ds = new DecompressionStream('deflate-raw');
    var writer = ds.writable.getWriter();
    writer.write(bytes); writer.close();
    var reader = ds.readable.getReader(), chunks = [], total = 0;
    return (function pump() {
      return reader.read().then(function (r) {
        if (r.done) {
          var out = new Uint8Array(total), off = 0;
          for (var i = 0; i < chunks.length; i++) { out.set(chunks[i], off); off += chunks[i].length; }
          return out;
        }
        chunks.push(r.value); total += r.value.length; return pump();
      });
    })();
  }

  // Parse ZIP central directory -> { name: Uint8Array (compressed), method, offset(local) }.
  function zipIndex(u8) {
    var view = dv(u8), n = u8.length, i;
    // cari End Of Central Directory (0x06054b50) dari belakang
    var eocd = -1;
    for (i = n - 22; i >= 0 && i >= n - 22 - 65557; i--) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('Berkas ZIP tidak valid.');
    var count = view.getUint16(eocd + 10, true);
    var cdOff = view.getUint32(eocd + 16, true);
    var entries = [], p = cdOff;
    for (i = 0; i < count; i++) {
      if (view.getUint32(p, true) !== 0x02014b50) break;
      var method = view.getUint16(p + 10, true);
      var compSize = view.getUint32(p + 20, true);
      var fnLen = view.getUint16(p + 28, true);
      var exLen = view.getUint16(p + 30, true);
      var cmLen = view.getUint16(p + 32, true);
      var lho = view.getUint32(p + 42, true);
      var name = utf8(u8.subarray(p + 46, p + 46 + fnLen));
      entries.push({ name: name, method: method, compSize: compSize, lho: lho });
      p += 46 + fnLen + exLen + cmLen;
    }
    return { u8: u8, view: view, entries: entries };
  }

  function entryBytes(zip, entry) {
    var view = zip.view, lho = entry.lho;
    if (view.getUint32(lho, true) !== 0x04034b50) throw new Error('Header lokal ZIP rusak.');
    var fnLen = view.getUint16(lho + 26, true);
    var exLen = view.getUint16(lho + 28, true);
    var start = lho + 30 + fnLen + exLen;
    var data = zip.u8.subarray(start, start + entry.compSize);
    if (entry.method === 0) return Promise.resolve(data.slice());
    if (entry.method === 8) return inflateRaw(data);
    return Promise.reject(new Error('Metode kompresi ZIP tidak didukung.'));
  }

  function readEntryText(zip, name) {
    var e = null;
    for (var i = 0; i < zip.entries.length; i++) if (zip.entries[i].name === name) { e = zip.entries[i]; break; }
    if (!e) return Promise.resolve('');
    return entryBytes(zip, e).then(function (b) { return utf8(b); });
  }

  function utf8(u8) {
    if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(u8);
    var s = ''; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    try { return decodeURIComponent(escape(s)); } catch (e) { return s; }
  }
  function decodeEntities(s) {
    return String(s).replace(/&#x([0-9a-fA-F]+);/g, function (m, h) { return String.fromCharCode(parseInt(h, 16)); })
      .replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(parseInt(d, 10)); })
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  }

  function readDocx(ab) {
    return Promise.resolve().then(function () {
      var zip = zipIndex(new Uint8Array(ab));
      return readEntryText(zip, 'word/document.xml');
    }).then(function (xml) {
      if (!xml) throw new Error('document.xml tidak ditemukan (bukan DOCX?).');
      // pisah per paragraf <w:p>, ambil teks <w:t>, sisipkan tab pada <w:tab/>
      var paras = xml.split(/<w:p[\s>]/).map(function (chunk) {
        var withTabs = chunk.replace(/<w:tab\b[^>]*\/?>/g, '\t');
        var m = withTabs.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
        return m.map(function (t) { return t.replace(/<[^>]+>/g, ''); }).join('');
      });
      return decodeEntities(paras.join('\n')).replace(/\n{3,}/g, '\n\n').trim();
    });
  }

  function colToIndex(ref) {
    var m = String(ref || '').match(/^([A-Z]+)/); if (!m) return 0;
    var s = m[1], n = 0; for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
    return n - 1;
  }

  function readXlsx(ab) {
    var zip;
    return Promise.resolve().then(function () {
      zip = zipIndex(new Uint8Array(ab));
      return readEntryText(zip, 'xl/sharedStrings.xml');
    }).then(function (ssXml) {
      var shared = [];
      if (ssXml) {
        var sis = ssXml.match(/<si>[\s\S]*?<\/si>/g) || [];
        for (var i = 0; i < sis.length; i++) {
          var ts = sis[i].match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];
          shared.push(decodeEntities(ts.map(function (t) { return t.replace(/<[^>]+>/g, ''); }).join('')));
        }
      }
      // temukan sheet pertama
      var sheetName = 'xl/worksheets/sheet1.xml';
      for (var j = 0; j < zip.entries.length; j++) {
        if (/^xl\/worksheets\/sheet\d+\.xml$/.test(zip.entries[j].name)) { sheetName = zip.entries[j].name; break; }
      }
      return readEntryText(zip, sheetName).then(function (sheet) { return { shared: shared, sheet: sheet }; });
    }).then(function (d) {
      var rowsXml = d.sheet.match(/<row\b[\s\S]*?<\/row>/g) || [];
      var rows = [], maxCol = 0;
      for (var r = 0; r < rowsXml.length; r++) {
        var cells = rowsXml[r].match(/<c\b[\s\S]*?(?:\/>|<\/c>)/g) || [];
        var row = [];
        for (var c = 0; c < cells.length; c++) {
          var cell = cells[c];
          var refM = cell.match(/r="([A-Z]+\d+)"/);
          var idx = refM ? colToIndex(refM[1]) : row.length;
          var isStr = /t="s"/.test(cell);
          var isInline = /t="(inlineStr|str)"/.test(cell);
          var vM = cell.match(/<v>([\s\S]*?)<\/v>/);
          var val = '';
          if (isInline) { var im = cell.match(/<t[^>]*>([\s\S]*?)<\/t>/); val = im ? decodeEntities(im[1]) : ''; }
          else if (vM) { val = isStr ? (d.shared[parseInt(vM[1], 10)] || '') : decodeEntities(vM[1]); }
          row[idx] = val;
          if (idx + 1 > maxCol) maxCol = idx + 1;
        }
        rows.push(row);
      }
      // normalisasi panjang & buang baris kosong di akhir
      for (var k = 0; k < rows.length; k++) for (var m2 = 0; m2 < maxCol; m2++) if (rows[k][m2] == null) rows[k][m2] = '';
      while (rows.length && rows[rows.length - 1].join('').trim() === '') rows.pop();
      var headers = rows.length ? rows.shift() : [];
      return { headers: headers, rows: rows };
    });
  }

  function readCsv(text) {
    var s = String(text || '').replace(/\r\n?/g, '\n');
    var rows = [], row = [], cur = '', inQ = false, i;
    for (i = 0; i < s.length; i++) {
      var ch = s[i];
      if (inQ) {
        if (ch === '"') { if (s[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
        else cur += ch;
      } else {
        if (ch === '"') inQ = true;
        else if (ch === ',' || ch === ';' || ch === '\t') { row.push(cur); cur = ''; }
        else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
        else cur += ch;
      }
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    while (rows.length && rows[rows.length - 1].join('').trim() === '') rows.pop();
    var headers = rows.length ? rows.shift() : [];
    return { headers: headers, rows: rows };
  }

  function readFile(file) {
    var name = (file && file.name || '').toLowerCase();
    return file.arrayBuffer().then(function (ab) {
      if (/\.docx$/.test(name)) return readDocx(ab).then(function (t) { return { kind: 'docx', text: t }; });
      if (/\.xlsx$/.test(name)) return readXlsx(ab).then(function (d) { return { kind: 'xlsx', headers: d.headers, rows: d.rows }; });
      if (/\.csv$/.test(name) || /\.tsv$/.test(name)) { var d2 = readCsv(utf8(new Uint8Array(ab))); return { kind: 'csv', headers: d2.headers, rows: d2.rows }; }
      // fallback: teks polos
      return { kind: 'text', text: utf8(new Uint8Array(ab)) };
    });
  }

  global.FILES = { readDocx: readDocx, readXlsx: readXlsx, readCsv: readCsv, readFile: readFile };
})(typeof window !== 'undefined' ? window : this);
