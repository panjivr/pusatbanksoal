/* Bekal — Transfer Teks
   Dua cara memindahkan teks antar perangkat:
   1) LEWAT KAMERA (offline, tanpa server): teks -> QR (beranimasi bila
      panjang); perangkat lain memindai dengan kamera & menyusun ulang.
      Frame: "BKT1|<sid>|<idx>|<total>|<base64slice>".
   2) HP -> PC (online, untuk PC tanpa kamera): PC menampilkan QR berisi
      topik acak + kunci AES-256; HP memindai, mengenkripsi teks, lalu
      mengirim lewat relay publik (ntfy.sh). PC menerima ciphertext &
      mendekripsi. Relay hanya melihat data terenkripsi. Kunci hanya ada
      di QR, tidak pernah dikirim ke jaringan (end-to-end encrypted).
      Pesan online: "BKTM1|<sid>|<idx>|<total>|<slice payload terenkripsi>". */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var SLICE = 300;
  var RELAY_HTTP = 'https://ntfy.sh/', RELAY_WS = 'wss://ntfy.sh/';

  /* ---------- base64 / utf8 ---------- */
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
  function bytesToB64(bytes) { var bin = '', CH = 0x8000; for (var i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH)); return btoa(bin); }
  function b64ToBytes(b) { var bin = atob(b), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }
  function b64url(bytes) { return bytesToB64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64urlToBytes(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return b64ToBytes(s); }
  function hex(bytes) { var s = ''; for (var i = 0; i < bytes.length; i++) { var h = bytes[i].toString(16); s += h.length < 2 ? '0' + h : h; } return s; }

  /* ---------- BKT1 beam protocol (offline) ---------- */
  function encodeFrames(text, sliceLen) {
    sliceLen = sliceLen || SLICE;
    var b64 = textToB64(text), sid = Math.random().toString(36).slice(2, 6);
    var total = Math.max(1, Math.ceil(b64.length / sliceLen)), frames = [];
    for (var i = 0; i < total; i++) frames.push('BKT1|' + sid + '|' + i + '|' + total + '|' + b64.substr(i * sliceLen, sliceLen));
    return { sid: sid, total: total, frames: frames, bytes: b64.length };
  }
  var col = { sid: null, total: 0, slices: null, count: 0 };
  function resetCollector() { col = { sid: null, total: 0, slices: null, count: 0 }; }
  function feed(raw) {
    if (!raw) return { done: false, got: 0, total: 0 };
    if (raw.indexOf('BKT1|') !== 0) return { done: true, text: raw, got: 1, total: 1, plain: true };
    var p = raw.split('|'); if (p.length < 5) return { done: false, got: col.count, total: col.total };
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

  /* ---------- online message protocol (BKTM1) ---------- */
  function chunkMsg(payload, sliceLen) {
    sliceLen = sliceLen || 2000;
    var sid = Math.random().toString(36).slice(2, 7), n = Math.max(1, Math.ceil(payload.length / sliceLen)), f = [];
    for (var i = 0; i < n; i++) f.push('BKTM1|' + sid + '|' + i + '|' + n + '|' + payload.substr(i * sliceLen, sliceLen));
    return f;
  }
  var ocol = { sid: null, total: 0, slices: null, count: 0 };
  function onlineReset() { ocol = { sid: null, total: 0, slices: null, count: 0 }; }
  function onlineFeed(raw) {
    if (!raw || raw.indexOf('BKTM1|') !== 0) return { done: false };
    var p = raw.split('|'); if (p.length < 5) return { done: false };
    var sid = p[1], idx = parseInt(p[2], 10), total = parseInt(p[3], 10), slice = p.slice(4).join('|');
    if (ocol.sid !== sid) ocol = { sid: sid, total: total, slices: {}, count: 0 };
    if (!(idx in ocol.slices)) { ocol.slices[idx] = slice; ocol.count++; }
    if (ocol.count >= ocol.total) {
      var b = ''; for (var i = 0; i < ocol.total; i++) { if (ocol.slices[i] == null) return { done: false, got: ocol.count, total: ocol.total }; b += ocol.slices[i]; }
      return { done: true, payload: b, total: ocol.total };
    }
    return { done: false, got: ocol.count, total: ocol.total };
  }

  window.QRBeam = { encodeFrames: encodeFrames, feed: feed, reset: resetCollector, chunkMsg: chunkMsg, onlineFeed: onlineFeed, onlineReset: onlineReset };

  /* ---------- crypto (AES-GCM 256, WebCrypto) ---------- */
  function importAes(rawBytes) { return crypto.subtle.importKey('raw', rawBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']); }
  function encryptText(keyBytes, text) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return importAes(keyBytes).then(function (key) { return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(text)); })
      .then(function (ct) { return bytesToB64(iv) + '.' + bytesToB64(new Uint8Array(ct)); });
  }
  function decryptText(keyBytes, payload) {
    var parts = payload.split('.'); if (parts.length !== 2) return Promise.reject('format');
    var iv = b64ToBytes(parts[0]), ct = b64ToBytes(parts[1]);
    return importAes(keyBytes).then(function (key) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct); })
      .then(function (pt) { return new TextDecoder().decode(new Uint8Array(pt)); });
  }
  window.QRBeamCrypto = { encryptText: encryptText, decryptText: decryptText };

  /* ---------- relay (ntfy, no account) ---------- */
  function relayPublish(topic, body) { return fetch(RELAY_HTTP + encodeURIComponent(topic), { method: 'POST', body: body, headers: { 'X-Priority': 'min', 'X-Title': 'Bekal' } }); }
  function relaySubscribe(topic, onMsg, onState) {
    var ws = new WebSocket(RELAY_WS + encodeURIComponent(topic) + '/ws');
    ws.onopen = function () { onState && onState('open'); };
    ws.onmessage = function (e) { try { var j = JSON.parse(e.data); if (j.event === 'message' && j.message) onMsg(j.message); } catch (x) {} };
    ws.onclose = function () { onState && onState('close'); };
    ws.onerror = function () { onState && onState('error'); };
    return ws;
  }

  /* ---------- QR render ---------- */
  function drawQR(canvas, text, px) {
    if (!window.qrcode || !canvas) return;
    var q = window.qrcode(0, 'M'); q.addData(text); q.make();
    var n = q.getModuleCount(), margin = 4, total = n + margin * 2, mod = Math.max(2, Math.floor((px || 320) / total)), size = total * mod;
    canvas.width = size; canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size); ctx.fillStyle = '#000000';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) ctx.fillRect((margin + c) * mod, (margin + r) * mod, mod, mod);
  }

  /* ---------- jsQR lazy loader ---------- */
  var jsqrLoading = null;
  function loadJsQR() {
    if (window.jsQR) return Promise.resolve(true);
    if (jsqrLoading) return jsqrLoading;
    jsqrLoading = new Promise(function (resolve) {
      var s = document.createElement('script'); s.src = 'assets/jsqr.js';
      s.onload = function () { resolve(true); }; s.onerror = function () { resolve(false); };
      document.head.appendChild(s);
    });
    return jsqrLoading;
  }
  function friendlyCamErr(e) {
    var n = e && e.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') return 'Izin kamera ditolak. Aktifkan izin kamera untuk situs ini lalu coba lagi.';
    if (n === 'NotFoundError' || n === 'DevicesNotFoundError') return 'Kamera tidak ditemukan. Gunakan perangkat berkamera (HP) untuk memindai.';
    if (n === 'NotReadableError') return 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi kamera lain lalu coba lagi.';
    return 'Tidak bisa membuka kamera: ' + (e && e.message ? e.message : 'error tak dikenal') + '.';
  }

  /* ---------- reusable camera scanner ---------- */
  function Scanner(video) { this.v = video; this.stream = null; this.loop = null; this.det = null; this.busy = false; this.onRaw = null; this.active = false; this.canvas = document.createElement('canvas'); }
  Scanner.prototype.start = function (onRaw, onErr) {
    var self = this; this.onRaw = onRaw;
    if (!window.isSecureContext && location.protocol !== 'file:') { onErr && onErr('Kamera hanya berjalan lewat HTTPS. Buka halaman ini di https://pusatbanksoal.id.'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { onErr && onErr('Browser ini tidak mendukung akses kamera. Coba Chrome/Safari terbaru.'); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then(function (stream) {
      self.stream = stream; self.v.setAttribute('playsinline', ''); self.v.srcObject = stream;
      var p = self.v.play(); if (p && p.catch) p.catch(function () {});
      self.active = true;
      if ('BarcodeDetector' in window) { try { self.det = new window.BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { self.det = null; } }
      var go = function () { self.tick(); };
      if (self.det) go(); else loadJsQR().then(function (ok) { if (!ok) { onErr && onErr('Gagal memuat pemindai. Periksa koneksi lalu coba lagi.'); self.stop(); return; } go(); });
    }, function (e) { onErr && onErr(friendlyCamErr(e)); });
  };
  Scanner.prototype.tick = function () {
    if (!this.active) return; var self = this, v = this.v;
    if (v && v.readyState >= 2 && v.videoWidth && !this.busy) {
      var cw = 400, ch = Math.max(1, Math.round(cw * (v.videoHeight / v.videoWidth)));
      this.canvas.width = cw; this.canvas.height = ch;
      var ctx = this.canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(v, 0, 0, cw, ch);
      if (this.det) { this.busy = true; this.det.detect(this.canvas).then(function (codes) { self.busy = false; if (codes) for (var i = 0; i < codes.length; i++) if (self.onRaw(codes[i].rawValue)) return; }, function () { self.busy = false; }); }
      else if (window.jsQR) { var img = ctx.getImageData(0, 0, cw, ch); var r = window.jsQR(img.data, cw, ch, { inversionAttempts: 'dontInvert' }); if (r && r.data) this.onRaw(r.data); }
    }
    this.loop = setTimeout(function () { self.tick(); }, 110);
  };
  Scanner.prototype.stop = function () {
    this.active = false;
    if (this.loop) { clearTimeout(this.loop); this.loop = null; }
    if (this.stream) { try { this.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} this.stream = null; }
    if (this.v) { try { this.v.srcObject = null; } catch (e) {} }
  };

  /* ================= SENDER (offline Kirim) ================= */
  var send = { frames: [], idx: 0, timer: null };
  function speedMs() { var s = $('tbSpeed'); return s ? (1000 / parseInt(s.value, 10)) : 180; }
  function renderSend() {
    if (send.timer) { clearInterval(send.timer); send.timer = null; }
    var text = $('tbText') ? $('tbText').value : '';
    var cv = $('tbQR'), info = $('tbFrameInfo'), empty = $('tbEmpty');
    if (!text) { if (cv) cv.style.display = 'none'; if (empty) empty.style.display = 'block'; if (info) info.textContent = ''; return; }
    if (empty) empty.style.display = 'none'; if (cv) cv.style.display = 'block';
    var enc = encodeFrames(text, SLICE); send.frames = enc.frames; send.idx = 0; drawSendFrame();
    if (enc.total > 1) send.timer = setInterval(function () { send.idx = (send.idx + 1) % send.frames.length; drawSendFrame(); }, speedMs());
    if (info) info.textContent = enc.total > 1
      ? 'Teks dibagi ' + enc.total + ' bagian — QR berputar otomatis. Biarkan layar ini terbuka & arahkan kamera perangkat lain ke sini.'
      : 'QR siap dipindai. Arahkan kamera perangkat lain ke sini.';
  }
  function drawSendFrame() {
    var cv = $('tbQR'); if (!cv) return; drawQR(cv, send.frames[send.idx], 320);
    var cnt = $('tbFrameCount'); if (cnt) cnt.textContent = send.frames.length > 1 ? ('Bagian ' + (send.idx + 1) + ' / ' + send.frames.length) : '';
  }
  function stopSend() { if (send.timer) { clearInterval(send.timer); send.timer = null; } }

  /* ================= RECEIVER (offline Terima, camera) ================= */
  var recvScanner = null;
  function recvErr(msg) { var e = $('tbErr'); if (e) { e.textContent = msg; e.style.display = 'block'; } }
  function recvClearErr() { var e = $('tbErr'); if (e) e.style.display = 'none'; }
  function scanInfo(msg) { var e = $('tbScanInfo'); if (e) e.textContent = msg; }
  function startRecv() {
    recvClearErr();
    var result = $('tbResult'); if (result) result.value = '';
    var again = $('tbAgain'); if (again) again.style.display = 'none';
    window.QRBeam.reset();
    if (!recvScanner) recvScanner = new Scanner($('tbVideo'));
    recvScanner.start(function (raw) {
      var r = window.QRBeam.feed(raw);
      if (r.error) { scanInfo(r.error); return false; }
      if (r.done) { finishRecv(r.text); return true; }
      scanInfo('Terpindai ' + r.got + ' / ' + r.total + ' bagian…'); return false;
    }, function (err) { recvErr(err); setRecvUI(false); });
    setRecvUI(true); scanInfo('Mengarahkan ke QR…');
  }
  function setRecvUI(on) {
    var s = $('tbStart'), st = $('tbStop'), vwrap = $('tbCamWrap');
    if (s) s.style.display = on ? 'none' : ''; if (st) st.style.display = on ? '' : 'none';
    if (vwrap) vwrap.classList.toggle('live', on);
  }
  function finishRecv(text) {
    stopRecv();
    var result = $('tbResult'); if (result) result.value = text;
    scanInfo('✓ Berhasil! Teks diterima (' + text.length + ' karakter).');
    var again = $('tbAgain'); if (again) again.style.display = '';
    try { navigator.vibrate && navigator.vibrate(120); } catch (e) {}
  }
  function stopRecv() { if (recvScanner) recvScanner.stop(); setRecvUI(false); }

  /* ================= ONLINE: HP -> PC (relay, E2E) ================= */
  var pc = { topic: null, key: null, ws: null, active: false };
  function pcStatus(msg) { var e = $('olPCStatus'); if (e) e.textContent = msg; }
  function connectPC() {
    pc.ws = relaySubscribe(pc.topic, onPCMsg, function (ev) {
      if (ev === 'open') pcStatus('Siap ✓ — pindai QR ini dari HP, lalu kirim teksnya.');
      else if ((ev === 'close' || ev === 'error') && pc.active) { pcStatus('Koneksi relay terputus, menyambung ulang…'); setTimeout(function () { if (pc.active) { try { connectPC(); } catch (e) {} } }, 2000); }
    });
  }
  function startPC() {
    pc.key = crypto.getRandomValues(new Uint8Array(32));
    pc.topic = 'bekal-' + hex(crypto.getRandomValues(new Uint8Array(10)));
    pc.active = true; onlineReset();
    drawQR($('olQR'), 'BKTR1|' + pc.topic + '|' + b64url(pc.key), 260);
    var res = $('olResult'); if (res) res.value = '';
    pcStatus('Menghubungkan ke relay aman…');
    showOnline('pc');
    try { connectPC(); } catch (e) { pcStatus('Gagal konek relay. Periksa koneksi internet.'); }
  }
  function onPCMsg(msg) {
    var r = onlineFeed(msg);
    if (r.done) {
      decryptText(pc.key, r.payload).then(function (text) {
        var res = $('olResult'); if (res) res.value = text;
        pcStatus('✓ Teks diterima (' + text.length + ' karakter). HP bisa kirim lagi kapan saja.');
        onlineReset(); try { navigator.vibrate && navigator.vibrate(120); } catch (e) {}
      }, function () { pcStatus('Gagal mendekripsi — kemungkinan dari sesi/kunci yang berbeda.'); onlineReset(); });
    } else if (r.total) pcStatus('Menerima… ' + r.got + ' / ' + r.total + ' bagian');
  }
  function stopPC() { pc.active = false; if (pc.ws) { try { pc.ws.close(); } catch (e) {} pc.ws = null; } }

  var phone = { topic: null, key: null, scanner: null };
  function phoneStatus(msg) { var e = $('olPhoneStatus'); if (e) e.textContent = msg; }
  function phoneScanErr(msg) { var e = $('olScanErr'); if (e) { e.textContent = msg; e.style.display = 'block'; } }
  function startPhone() {
    var se = $('olScanErr'); if (se) se.style.display = 'none';
    var sendUI = $('olSendUI'); if (sendUI) sendUI.classList.add('hide');
    var scanUI = $('olScanUI'); if (scanUI) scanUI.classList.remove('hide');
    showOnline('phone');
    if (!phone.scanner) phone.scanner = new Scanner($('olVideo'));
    var wrap = $('olCamWrap'); if (wrap) wrap.classList.add('live');
    phone.scanner.start(function (raw) {
      if (raw.indexOf('BKTR1|') === 0) { onPair(raw); return true; }
      phoneScanErr('QR ini bukan QR "Terima di komputer". Pindai QR dari tab PC.'); return false;
    }, function (err) { phoneScanErr(err); });
  }
  function onPair(raw) {
    var p = raw.split('|'); phone.topic = p[1];
    try { phone.key = b64urlToBytes(p[2]); } catch (e) { phoneScanErr('QR tidak valid.'); return; }
    if (phone.scanner) phone.scanner.stop();
    var wrap = $('olCamWrap'); if (wrap) wrap.classList.remove('live');
    var scanUI = $('olScanUI'); if (scanUI) scanUI.classList.add('hide');
    var sendUI = $('olSendUI'); if (sendUI) sendUI.classList.remove('hide');
    phoneStatus('Terhubung ✓ ke komputer. Ketik / tempel teks lalu kirim.');
    if ($('olText') && $('olText').value) sendOnline();
  }
  function sendOnline() {
    var text = $('olText') ? $('olText').value : '';
    if (!text) { phoneStatus('Isi teksnya dulu.'); return; }
    if (!phone.topic || !phone.key) { phoneStatus('Belum terhubung. Pindai QR dari komputer dulu.'); return; }
    phoneStatus('Mengenkripsi…');
    encryptText(phone.key, text).then(function (payload) {
      var frames = chunkMsg(payload, 2000), i = 0;
      function next() {
        if (i >= frames.length) { phoneStatus('✓ Terkirim ke komputer (' + text.length + ' karakter).'); return; }
        relayPublish(phone.topic, frames[i]).then(function () { i++; phoneStatus(frames.length > 1 ? ('Mengirim ' + i + ' / ' + frames.length + '…') : 'Mengirim…'); setTimeout(next, 250); },
          function () { phoneStatus('Gagal mengirim. Cek koneksi internet HP lalu coba lagi.'); });
      }
      next();
    }, function () { phoneStatus('Gagal mengenkripsi.'); });
  }
  function stopPhone() { if (phone.scanner) phone.scanner.stop(); var wrap = $('olCamWrap'); if (wrap) wrap.classList.remove('live'); }

  function showOnline(which) {
    var role = $('olRole'), olpc = $('olPC'), olph = $('olPhone');
    if (role) role.classList.toggle('hide', which !== 'role');
    if (olpc) olpc.classList.toggle('hide', which !== 'pc');
    if (olph) olph.classList.toggle('hide', which !== 'phone');
  }

  /* ================= tabs ================= */
  function setTab(which) {
    var panels = { send: $('panelSend'), recv: $('panelRecv'), online: $('panelOnline') };
    var tabs = { send: $('tbSend'), recv: $('tbRecv'), online: $('tbOnline') };
    for (var k in panels) if (panels[k]) panels[k].classList.toggle('hide', k !== which);
    for (var t in tabs) if (tabs[t]) tabs[t].classList.toggle('on', t === which);
    /* stop everything not active */
    stopSend(); stopRecv(); stopPhone(); stopPC();
    if (which === 'send') renderSend();
    else if (which === 'online') showOnline('role');
  }

  /* ================= boot ================= */
  function boot() {
    var ts = $('tbSend'), tr = $('tbRecv'), to = $('tbOnline');
    if (ts) ts.addEventListener('click', function () { setTab('send'); });
    if (tr) tr.addEventListener('click', function () { setTab('recv'); });
    if (to) to.addEventListener('click', function () { setTab('online'); });
    var txt = $('tbText'); if (txt) txt.addEventListener('input', renderSend);
    var sp = $('tbSpeed'); if (sp) sp.addEventListener('input', function () { if ($('tbText') && $('tbText').value) renderSend(); });
    var paste = $('tbPaste'); if (paste) paste.addEventListener('click', function () { if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(function (t) { if ($('tbText')) { $('tbText').value = t; renderSend(); } }, function () {}); });
    var start = $('tbStart'); if (start) start.addEventListener('click', startRecv);
    var stop = $('tbStop'); if (stop) stop.addEventListener('click', function () { stopRecv(); scanInfo('Dihentikan.'); });
    var again = $('tbAgain'); if (again) again.addEventListener('click', function () { var r = $('tbResult'); if (r) r.value = ''; again.style.display = 'none'; startRecv(); });
    var copy = $('tbCopy'); if (copy) copy.addEventListener('click', function () { copyFrom('tbResult'); });

    /* online */
    var bePC = $('olBePC'), bePhone = $('olBePhone');
    if (bePC) bePC.addEventListener('click', startPC);
    if (bePhone) bePhone.addEventListener('click', startPhone);
    var pcReset = $('olPCReset'); if (pcReset) pcReset.addEventListener('click', function () { stopPC(); startPC(); });
    var pcBack = $('olPCBack'); if (pcBack) pcBack.addEventListener('click', function () { stopPC(); showOnline('role'); });
    var phBack = $('olPhoneBack'); if (phBack) phBack.addEventListener('click', function () { stopPhone(); showOnline('role'); });
    var olRescan = $('olRescan'); if (olRescan) olRescan.addEventListener('click', startPhone);
    var olSend = $('olSend'); if (olSend) olSend.addEventListener('click', sendOnline);
    var olPaste = $('olPaste'); if (olPaste) olPaste.addEventListener('click', function () { if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(function (t) { if ($('olText')) $('olText').value = t; }, function () {}); });
    var olCopy = $('olCopy'); if (olCopy) olCopy.addEventListener('click', function () { copyFrom('olResult'); });

    document.addEventListener('visibilitychange', function () { if (document.hidden) { stopSend(); stopRecv(); stopPhone(); } });
    setTab('send');
  }
  function copyFrom(id) {
    var el = $(id); if (!el || !el.value) return; var txt = el.value;
    function ok() { var t = $('tbCopied'); if (t) { t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 1500); } }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, function () { el.select(); try { document.execCommand('copy'); ok(); } catch (e) {} });
    else { el.select(); try { document.execCommand('copy'); ok(); } catch (e) {} }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
