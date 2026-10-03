/* Bekal — Transfer Teks (QR Beam)
   Pindah teks antar perangkat lewat QR, tanpa server. Pengirim mengubah
   teks jadi QR (beranimasi bila panjang); penerima memindai dengan kamera
   lalu menyusun ulang teksnya. 100% di sisi klien.
   Protokol frame: "BKT1|<sid>|<idx>|<total>|<base64slice>". QR non-BKT1
   diperlakukan sebagai teks langsung (jadi sekaligus pemindai QR umum). */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var SLICE = 300; /* base64 chars per frame — kecil agar QR mudah dipindai */

  /* ---------- base64 <-> UTF-8 ---------- */
  function textToB64(t) {
    var bytes = new TextEncoder().encode(t), bin = '', CH = 0x8000;
    for (var i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(bin);
  }
  function b64ToText(b) {
    var bin = atob(b), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  /* ---------- protocol ---------- */
  function encodeFrames(text, sliceLen) {
    sliceLen = sliceLen || SLICE;
    var b64 = textToB64(text);
    var sid = Math.random().toString(36).slice(2, 6);
    var total = Math.max(1, Math.ceil(b64.length / sliceLen));
    var frames = [];
    for (var i = 0; i < total; i++) frames.push('BKT1|' + sid + '|' + i + '|' + total + '|' + b64.substr(i * sliceLen, sliceLen));
    return { sid: sid, total: total, frames: frames, bytes: b64.length };
  }
  var col = { sid: null, total: 0, slices: null, count: 0 };
  function resetCollector() { col = { sid: null, total: 0, slices: null, count: 0 }; }
  function feed(raw) {
    if (!raw) return { done: false, got: 0, total: 0 };
    if (raw.indexOf('BKT1|') !== 0) return { done: true, text: raw, got: 1, total: 1, plain: true };
    var p = raw.split('|');
    if (p.length < 5) return { done: false, got: col.count, total: col.total };
    var sid = p[1], idx = parseInt(p[2], 10), total = parseInt(p[3], 10), slice = p.slice(4).join('|');
    if (col.sid !== sid) col = { sid: sid, total: total, slices: {}, count: 0 };
    if (!(idx in col.slices)) { col.slices[idx] = slice; col.count++; }
    if (col.count >= col.total) {
      var b = ''; for (var i = 0; i < col.total; i++) { if (col.slices[i] == null) return { done: false, got: col.count, total: col.total }; b += col.slices[i]; }
      var text; try { text = b64ToText(b); } catch (e) { return { done: false, got: col.count, total: col.total, error: 'Gagal menyusun teks' }; }
      return { done: true, text: text, got: col.count, total: col.total };
    }
    return { done: false, got: col.count, total: col.total };
  }
  window.QRBeam = { encodeFrames: encodeFrames, feed: feed, reset: resetCollector };

  /* ---------- QR render (reuse window.qrcode) ---------- */
  function drawQR(canvas, text, px) {
    if (!window.qrcode) return;
    var q = window.qrcode(0, 'M');
    q.addData(text); q.make();
    var n = q.getModuleCount(), margin = 4, total = n + margin * 2;
    var mod = Math.max(2, Math.floor((px || 320) / total));
    var size = total * mod;
    canvas.width = size; canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) ctx.fillRect((margin + c) * mod, (margin + r) * mod, mod, mod);
  }

  /* ================= DOM wiring ================= */
  var send = { frames: [], idx: 0, timer: null };
  var recv = { stream: null, loop: null, detector: null, scanning: false, busy: false, jsqrLoading: null };

  function setTab(which) {
    var send$ = $('panelSend'), recv$ = $('panelRecv');
    var ts = $('tbSend'), tr = $('tbRecv');
    if (which === 'recv') {
      if (send$) send$.classList.add('hide'); if (recv$) recv$.classList.remove('hide');
      if (tr) tr.classList.add('on'); if (ts) ts.classList.remove('on');
      stopSend();
    } else {
      if (recv$) recv$.classList.add('hide'); if (send$) send$.classList.remove('hide');
      if (ts) ts.classList.add('on'); if (tr) tr.classList.remove('on');
      stopCam();
      renderSend();
    }
  }

  /* ---- sender ---- */
  function speedMs() { var s = $('tbSpeed'); return s ? (1000 / parseInt(s.value, 10)) : 180; }
  function renderSend() {
    if (send.timer) { clearInterval(send.timer); send.timer = null; }
    var text = $('tbText') ? $('tbText').value : '';
    var cv = $('tbQR'), info = $('tbFrameInfo'), empty = $('tbEmpty');
    if (!text) {
      if (cv) cv.style.display = 'none';
      if (empty) empty.style.display = 'block';
      if (info) info.textContent = '';
      return;
    }
    if (empty) empty.style.display = 'none';
    if (cv) cv.style.display = 'block';
    var enc = encodeFrames(text, SLICE);
    send.frames = enc.frames; send.idx = 0;
    drawSendFrame();
    if (enc.total > 1) send.timer = setInterval(function () { send.idx = (send.idx + 1) % send.frames.length; drawSendFrame(); }, speedMs());
    var kb = (enc.bytes / 1024).toFixed(1);
    if (info) info.textContent = enc.total > 1
      ? 'Teks dibagi ' + enc.total + ' bagian — QR berputar otomatis. Biarkan layar ini terbuka & arahkan kamera perangkat lain ke sini.'
      : 'QR siap dipindai. Arahkan kamera perangkat lain ke sini.';
  }
  function drawSendFrame() {
    var cv = $('tbQR'); if (!cv) return;
    drawQR(cv, send.frames[send.idx], 320);
    var cnt = $('tbFrameCount');
    if (cnt) cnt.textContent = send.frames.length > 1 ? ('Bagian ' + (send.idx + 1) + ' / ' + send.frames.length) : '';
  }
  function stopSend() { if (send.timer) { clearInterval(send.timer); send.timer = null; } }

  /* ---- receiver ---- */
  function showErr(msg) { var e = $('tbErr'); if (e) { e.textContent = msg; e.style.display = 'block'; } }
  function clearErr() { var e = $('tbErr'); if (e) e.style.display = 'none'; }
  function loadJsQR() {
    if (window.jsQR) return Promise.resolve(true);
    if (recv.jsqrLoading) return recv.jsqrLoading;
    recv.jsqrLoading = new Promise(function (resolve) {
      var s = document.createElement('script'); s.src = 'assets/jsqr.js';
      s.onload = function () { resolve(true); };
      s.onerror = function () { resolve(false); };
      document.head.appendChild(s);
    });
    return recv.jsqrLoading;
  }
  function friendlyCamErr(e) {
    var n = e && e.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') return 'Izin kamera ditolak. Aktifkan izin kamera untuk situs ini di pengaturan browser, lalu coba lagi.';
    if (n === 'NotFoundError' || n === 'DevicesNotFoundError') return 'Kamera tidak ditemukan di perangkat ini. Coba pakai HP, atau gunakan perangkat ini sebagai pengirim (tab Kirim).';
    if (n === 'NotReadableError') return 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi kamera lain lalu coba lagi.';
    return 'Tidak bisa membuka kamera: ' + (e && e.message ? e.message : 'error tak dikenal') + '.';
  }
  function startCam() {
    clearErr();
    var result = $('tbResult'); if (result) result.value = '';
    var again = $('tbAgain'); if (again) again.style.display = 'none';
    if (!window.isSecureContext && location.protocol !== 'file:') { showErr('Kamera hanya berjalan lewat HTTPS. Buka halaman ini di https://pusatbanksoal.id.'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { showErr('Browser ini tidak mendukung akses kamera. Coba Chrome/Safari terbaru.'); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then(function (stream) {
      recv.stream = stream;
      var v = $('tbVideo'); v.setAttribute('playsinline', ''); v.srcObject = stream;
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
      window.QRBeam.reset(); recv.scanning = true;
      if ('BarcodeDetector' in window) { try { recv.detector = new window.BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { recv.detector = null; } }
      var begin = function () { setScanUI(true); scanInfo('Mengarahkan ke QR…'); scanTick(); };
      if (recv.detector) begin(); else loadJsQR().then(function (ok) { if (!ok) { showErr('Gagal memuat pemindai. Periksa koneksi lalu coba lagi.'); stopCam(); return; } begin(); });
    }, function (e) { showErr(friendlyCamErr(e)); });
  }
  function setScanUI(on) {
    var s = $('tbStart'), st = $('tbStop'), vwrap = $('tbCamWrap');
    if (s) s.style.display = on ? 'none' : '';
    if (st) st.style.display = on ? '' : 'none';
    if (vwrap) vwrap.classList.toggle('live', on);
  }
  function scanInfo(msg) { var e = $('tbScanInfo'); if (e) e.textContent = msg; }
  var scanCanvas;
  function scanTick() {
    if (!recv.scanning) return;
    var v = $('tbVideo');
    if (v && v.readyState >= 2 && v.videoWidth && !recv.busy) {
      if (!scanCanvas) scanCanvas = document.createElement('canvas');
      var cw = 400, ch = Math.max(1, Math.round(cw * (v.videoHeight / v.videoWidth)));
      scanCanvas.width = cw; scanCanvas.height = ch;
      var ctx = scanCanvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(v, 0, 0, cw, ch);
      if (recv.detector) {
        recv.busy = true;
        recv.detector.detect(scanCanvas).then(function (codes) {
          recv.busy = false;
          if (codes && codes.length) for (var i = 0; i < codes.length; i++) if (handle(codes[i].rawValue)) return;
        }, function () { recv.busy = false; });
      } else if (window.jsQR) {
        var img = ctx.getImageData(0, 0, cw, ch);
        var res = window.jsQR(img.data, cw, ch, { inversionAttempts: 'dontInvert' });
        if (res && res.data) handle(res.data);
      }
    }
    recv.loop = setTimeout(scanTick, 110);
  }
  function handle(raw) {
    var r = window.QRBeam.feed(raw);
    if (r.error) { scanInfo(r.error); return false; }
    if (r.done) { finishRecv(r.text); return true; }
    scanInfo('Terpindai ' + r.got + ' / ' + r.total + ' bagian…');
    return false;
  }
  function finishRecv(text) {
    stopCam();
    var result = $('tbResult'); if (result) result.value = text;
    scanInfo('✓ Berhasil! Teks diterima (' + text.length + ' karakter).');
    var again = $('tbAgain'); if (again) again.style.display = '';
    try { navigator.vibrate && navigator.vibrate(120); } catch (e) {}
  }
  function stopCam() {
    recv.scanning = false;
    if (recv.loop) { clearTimeout(recv.loop); recv.loop = null; }
    if (recv.stream) { try { recv.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} recv.stream = null; }
    var v = $('tbVideo'); if (v) { try { v.srcObject = null; } catch (e) {} }
    setScanUI(false);
  }

  function copyResult() {
    var result = $('tbResult'); if (!result || !result.value) return;
    var txt = result.value;
    function ok() { var t = $('tbCopied'); if (t) { t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 1500); } }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, function () { result.select(); try { document.execCommand('copy'); ok(); } catch (e) {} });
    else { result.select(); try { document.execCommand('copy'); ok(); } catch (e) {} }
  }

  function boot() {
    var ts = $('tbSend'), tr = $('tbRecv');
    if (ts) ts.addEventListener('click', function () { setTab('send'); });
    if (tr) tr.addEventListener('click', function () { setTab('recv'); });
    var txt = $('tbText');
    if (txt) txt.addEventListener('input', renderSend);
    var sp = $('tbSpeed'); if (sp) sp.addEventListener('input', function () { if ($('tbText').value) renderSend(); });
    var start = $('tbStart'); if (start) start.addEventListener('click', startCam);
    var stop = $('tbStop'); if (stop) stop.addEventListener('click', function () { stopCam(); scanInfo('Dihentikan.'); });
    var again = $('tbAgain'); if (again) again.addEventListener('click', function () { var r = $('tbResult'); if (r) r.value = ''; again.style.display = 'none'; startCam(); });
    var copy = $('tbCopy'); if (copy) copy.addEventListener('click', copyResult);
    var paste = $('tbPaste'); if (paste) paste.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(function (t) { if ($('tbText')) { $('tbText').value = t; renderSend(); } }, function () {});
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) { stopSend(); stopCam(); } else { var rp = $('panelRecv'); if (rp && !rp.classList.contains('hide')) { /* wait for user */ } else renderSend(); } });
    setTab('send');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
