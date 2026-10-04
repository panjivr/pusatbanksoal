/* Bekal — Transfer Teks & File
   Dua cara:
   A) HUBUNGKAN (teks & file, sampai ~100 MB): dua perangkat dipasangkan
      lewat QR (berisi topik acak + kunci AES-256). Sinyal WebRTC (SDP/ICE)
      dipertukarkan via relay publik (ntfy.sh) dalam keadaan terenkripsi,
      lalu data mengalir LANGSUNG antar perangkat (WebRTC DataChannel, P2P,
      terenkripsi DTLS) — file tidak melewati server mana pun.
   B) TEKS KILAT (offline): teks -> QR (beranimasi bila panjang); perangkat
      lain memindai dengan kamera & menyusun ulang. Tanpa internet.
   Kunci enkripsi hanya ada di QR, tidak pernah dikirim ke jaringan. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var SLICE = 300;
  var RELAY_HTTP = 'https://ntfy.sh/', RELAY_WS = 'wss://ntfy.sh/';
  var CHUNK = 16384, BP_HIGH = 8 * 1024 * 1024, BP_LOW = 2 * 1024 * 1024;
  var ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }];

  /* ---------- base64 / utf8 ---------- */
  function textToB64(t) { var b = new TextEncoder().encode(t), s = '', CH = 0x8000; for (var i = 0; i < b.length; i += CH) s += String.fromCharCode.apply(null, b.subarray(i, i + CH)); return btoa(s); }
  function b64ToText(b) { var bin = atob(b), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new TextDecoder().decode(a); }
  function bytesToB64(bytes) { var s = '', CH = 0x8000; for (var i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH)); return btoa(s); }
  function b64ToBytes(b) { var bin = atob(b), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }
  function b64url(bytes) { return bytesToB64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64urlToBytes(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return b64ToBytes(s); }
  function hex(bytes) { var s = ''; for (var i = 0; i < bytes.length; i++) { var h = bytes[i].toString(16); s += h.length < 2 ? '0' + h : h; } return s; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fmtSize(n) { if (n < 1024) return n + ' B'; if (n < 1048576) return (n / 1024).toFixed(1) + ' KB'; if (n < 1073741824) return (n / 1048576).toFixed(1) + ' MB'; return (n / 1073741824).toFixed(2) + ' GB'; }

  /* ---------- BKT1 beam protocol ---------- */
  function encodeFrames(text, sliceLen) {
    sliceLen = sliceLen || SLICE; var b64 = textToB64(text), sid = Math.random().toString(36).slice(2, 6);
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
      var t; try { t = b64ToText(b); } catch (e) { return { done: false, error: 'Gagal menyusun teks' }; }
      return { done: true, text: t, got: col.count, total: col.total };
    }
    return { done: false, got: col.count, total: col.total };
  }
  window.QRBeam = { encodeFrames: encodeFrames, feed: feed, reset: resetCollector };

  /* ---------- crypto (AES-GCM 256) ---------- */
  function importAes(raw) { return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']); }
  function encryptText(keyBytes, text) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return importAes(keyBytes).then(function (k) { return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, new TextEncoder().encode(text)); })
      .then(function (ct) { return bytesToB64(iv) + '.' + bytesToB64(new Uint8Array(ct)); });
  }
  function decryptText(keyBytes, payload) {
    var p = payload.split('.'); if (p.length !== 2) return Promise.reject('fmt');
    var iv = b64ToBytes(p[0]), ct = b64ToBytes(p[1]);
    return importAes(keyBytes).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, k, ct); })
      .then(function (pt) { return new TextDecoder().decode(new Uint8Array(pt)); });
  }
  window.QRBeamCrypto = { encryptText: encryptText, decryptText: decryptText };

  /* ---------- relay (ntfy) ---------- */
  function relayPublish(topic, body) { return fetch(RELAY_HTTP + encodeURIComponent(topic), { method: 'POST', body: body, headers: { 'X-Priority': 'min', 'X-Title': 'Bekal' } }); }
  function relaySubscribe(topic, onMsg, onState) {
    var ws = new WebSocket(RELAY_WS + encodeURIComponent(topic) + '/ws');
    ws.onopen = function () { onState && onState('open'); };
    ws.onmessage = function (e) { try { var j = JSON.parse(e.data); if (j.event === 'message' && j.message) onMsg(j.message); } catch (x) {} };
    ws.onclose = function () { onState && onState('close'); };
    ws.onerror = function () { onState && onState('error'); };
    return ws;
  }

  /* ---------- QR render + jsQR + scanner ---------- */
  function drawQR(canvas, text, px) {
    if (!window.qrcode || !canvas) return;
    var q = window.qrcode(0, 'M'); q.addData(text); q.make();
    var n = q.getModuleCount(), margin = 4, total = n + margin * 2, mod = Math.max(2, Math.floor((px || 300) / total)), size = total * mod;
    canvas.width = size; canvas.height = size;
    var ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.fillStyle = '#000';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) ctx.fillRect((margin + c) * mod, (margin + r) * mod, mod, mod);
  }
  var jsqrLoading = null;
  function loadJsQR() {
    if (window.jsQR) return Promise.resolve(true);
    if (jsqrLoading) return jsqrLoading;
    jsqrLoading = new Promise(function (res) { var s = document.createElement('script'); s.src = 'assets/jsqr.js'; s.onload = function () { res(true); }; s.onerror = function () { res(false); }; document.head.appendChild(s); });
    return jsqrLoading;
  }
  function friendlyCamErr(e) {
    var n = e && e.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') return 'Izin kamera ditolak. Aktifkan izin kamera lalu coba lagi.';
    if (n === 'NotFoundError' || n === 'DevicesNotFoundError') return 'Kamera tidak ditemukan. Pakai perangkat berkamera (HP) untuk memindai.';
    if (n === 'NotReadableError') return 'Kamera dipakai aplikasi lain. Tutup aplikasi kamera lalu coba lagi.';
    return 'Tidak bisa membuka kamera: ' + (e && e.message ? e.message : 'error') + '.';
  }
  function Scanner(video) { this.v = video; this.stream = null; this.loop = null; this.det = null; this.busy = false; this.onRaw = null; this.active = false; this.canvas = document.createElement('canvas'); }
  Scanner.prototype.start = function (onRaw, onErr) {
    var self = this; this.onRaw = onRaw;
    if (!window.isSecureContext && location.protocol !== 'file:') { onErr && onErr('Kamera butuh HTTPS. Buka di https://pusatbanksoal.id.'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { onErr && onErr('Browser tak mendukung kamera. Coba Chrome/Safari terbaru.'); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then(function (stream) {
      self.stream = stream; self.v.setAttribute('playsinline', ''); self.v.srcObject = stream; var p = self.v.play(); if (p && p.catch) p.catch(function () {});
      self.active = true;
      if ('BarcodeDetector' in window) { try { self.det = new window.BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { self.det = null; } }
      var go = function () { self.tick(); };
      if (self.det) go(); else loadJsQR().then(function (ok) { if (!ok) { onErr && onErr('Gagal memuat pemindai.'); self.stop(); return; } go(); });
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

  /* ================= A) CONNECT (WebRTC, text + file) ================= */
  function Conn(key, topic, role, cb) {
    this.key = key; this.topic = topic; this.role = role; this.cb = cb;
    this.peerId = Math.random().toString(36).slice(2, 10);
    this.pc = null; this.dc = null; this.ws = null; this.remoteSet = false; this.iceQ = []; this.recvFile = null; this.closed = false;
  }
  Conn.prototype.status = function (m, kind) { if (this.cb.status) this.cb.status(m, kind); };
  Conn.prototype.start = function () {
    var self = this;
    this.pc = new RTCPeerConnection({ iceServers: ICE });
    this.pc.onicecandidate = function (e) { if (e.candidate) self.signal('ice', e.candidate.toJSON ? e.candidate.toJSON() : e.candidate); };
    this.pc.onconnectionstatechange = function () {
      var s = self.pc ? self.pc.connectionState : 'closed';
      if (s === 'failed') self.status('Gagal menyambung langsung, jaringan mungkin membatasi koneksi P2P. Coba pakai hotspot HP atau jaringan lain.', 'error');
      else if (s === 'disconnected') self.status('Koneksi terputus.', 'warn');
    };
    this.ws = relaySubscribe(this.topic, function (m) { self.onSignal(m); }, function (ev) {
      if (ev === 'open') self.status(self.role === 'host' ? 'Siap ✓, pindai QR ini dari perangkat satunya.' : 'Menyambungkan…');
      else if ((ev === 'close' || ev === 'error') && !self.closed && !self.dcOpen) self.status('Menyambung ulang ke relay…', 'warn');
    });
    if (this.role === 'guest') {
      this.dc = this.pc.createDataChannel('bekal', { ordered: true }); this.setupDC(this.dc);
      this.pc.createOffer().then(function (o) { return self.pc.setLocalDescription(o).then(function () { self.signal('offer', { type: o.type, sdp: o.sdp }); }); }).catch(function () {});
    } else {
      this.pc.ondatachannel = function (e) { self.dc = e.channel; self.setupDC(self.dc); };
    }
  };
  Conn.prototype.signal = function (type, data) {
    var self = this, payload = JSON.stringify({ from: this.peerId, type: type, data: data });
    encryptText(this.key, payload).then(function (ct) { relayPublish(self.topic, 'SIG|' + ct).catch(function () {}); });
  };
  Conn.prototype.onSignal = function (raw) {
    if (!raw || raw.indexOf('SIG|') !== 0) return; var self = this;
    decryptText(this.key, raw.slice(4)).then(function (js) { var m; try { m = JSON.parse(js); } catch (e) { return; } if (m.from === self.peerId) return; self.handle(m); }, function () {});
  };
  Conn.prototype.handle = function (m) {
    var self = this;
    if (m.type === 'offer' && this.role === 'host') {
      this.pc.setRemoteDescription(new RTCSessionDescription(m.data)).then(function () { self.remoteSet = true; self.drainIce(); return self.pc.createAnswer(); })
        .then(function (a) { return self.pc.setLocalDescription(a).then(function () { self.signal('answer', { type: a.type, sdp: a.sdp }); }); }).catch(function () {});
    } else if (m.type === 'answer' && this.role === 'guest') {
      this.pc.setRemoteDescription(new RTCSessionDescription(m.data)).then(function () { self.remoteSet = true; self.drainIce(); }).catch(function () {});
    } else if (m.type === 'ice') {
      var c = new RTCIceCandidate(m.data);
      if (this.remoteSet) this.pc.addIceCandidate(c).catch(function () {}); else this.iceQ.push(c);
    }
  };
  Conn.prototype.drainIce = function () { var self = this; this.iceQ.forEach(function (c) { self.pc.addIceCandidate(c).catch(function () {}); }); this.iceQ = []; };
  Conn.prototype.setupDC = function (dc) {
    var self = this; dc.binaryType = 'arraybuffer';
    dc.onopen = function () { self.dcOpen = true; self.status('Terhubung ✓', 'ok'); if (self.cb.open) self.cb.open(); if (self.ws) { try { self.ws.close(); } catch (e) {} self.ws = null; } };
    dc.onclose = function () { if (self.cb.closed) self.cb.closed(); };
    dc.onmessage = function (e) { self.onData(e.data); };
  };
  Conn.prototype.onData = function (data) {
    var self = this;
    if (typeof data === 'string') {
      var m; try { m = JSON.parse(data); } catch (e) { return; }
      if (m.k === 't') { if (self.cb.text) self.cb.text(m.v); }
      else if (m.k === 'fs') { self.recvFile = { id: m.id, name: m.name, size: m.size, mime: m.mime, chunks: [], received: 0 }; if (self.cb.fileStart) self.cb.fileStart(self.recvFile); }
      else if (m.k === 'fe') { if (self.recvFile) { var blob = new Blob(self.recvFile.chunks, { type: self.recvFile.mime || 'application/octet-stream' }); if (self.cb.fileDone) self.cb.fileDone(self.recvFile, blob); self.recvFile = null; } }
    } else if (self.recvFile) {
      self.recvFile.chunks.push(data); self.recvFile.received += data.byteLength;
      if (self.cb.fileProgress) self.cb.fileProgress('recv', self.recvFile.received, self.recvFile.size, self.recvFile);
    }
  };
  Conn.prototype.sendText = function (text) { if (this.dc && this.dc.readyState === 'open') this.dc.send(JSON.stringify({ k: 't', v: text })); };
  Conn.prototype.sendFile = function (file, onProg, onDone) {
    var self = this, dc = this.dc; if (!dc || dc.readyState !== 'open') return;
    var id = Math.random().toString(36).slice(2, 8), offset = 0;
    dc.send(JSON.stringify({ k: 'fs', id: id, name: file.name, size: file.size, mime: file.type }));
    function pump() {
      if (self.closed || dc.readyState !== 'open') return;
      if (offset >= file.size) { dc.send(JSON.stringify({ k: 'fe', id: id })); onDone && onDone(); return; }
      if (dc.bufferedAmount > BP_HIGH) { dc.bufferedAmountLowThreshold = BP_LOW; dc.onbufferedamountlow = function () { dc.onbufferedamountlow = null; pump(); }; return; }
      var slice = file.slice(offset, offset + CHUNK);
      slice.arrayBuffer().then(function (buf) { try { dc.send(buf); } catch (e) { setTimeout(pump, 50); return; } offset += buf.byteLength; onProg && onProg(offset, file.size); pump(); });
    }
    pump();
  };
  Conn.prototype.close = function () { this.closed = true; try { if (this.dc) this.dc.close(); } catch (e) {} try { if (this.pc) this.pc.close(); } catch (e) {} try { if (this.ws) this.ws.close(); } catch (e) {} this.pc = null; this.ws = null; };

  /* ---- connect UI ---- */
  var conn = null, joinScanner = null;
  function cStatus(msg, kind) { var e = $('ttLiveStatus') || $('ttHostStatus'); }
  function setConnStatus(msg, kind) {
    var host = $('ttHostStatus'), live = $('ttLiveStatus');
    if (live && !$('ttLive').classList.contains('hide')) { live.textContent = msg; live.className = 'tt-status' + (kind ? ' ' + kind : ''); }
    else if (host) { host.textContent = msg; host.className = 'tt-status' + (kind ? ' ' + kind : ''); }
  }
  function startHost() {
    var key = crypto.getRandomValues(new Uint8Array(32)), topic = 'bekal-' + hex(crypto.getRandomValues(new Uint8Array(10)));
    showConn('host');
    drawQR($('ttQR'), 'BKTR2|' + topic + '|' + b64url(key), 280);
    setConnStatus('Menghubungkan ke relay aman…');
    conn = new Conn(key, topic, 'host', connCallbacks());
    try { conn.start(); } catch (e) { setConnStatus('Gagal memulai koneksi. Periksa internet.', 'error'); }
  }
  function startJoin() {
    showConn('join');
    var err = $('ttJoinErr'); if (err) err.style.display = 'none';
    if (!joinScanner) joinScanner = new Scanner($('ttVideo'));
    var wrap = $('ttJoinCam'); if (wrap) wrap.classList.add('live');
    joinScanner.start(function (raw) {
      if (raw.indexOf('BKTR2|') === 0) { onJoinPair(raw); return true; }
      if (err) { err.textContent = 'QR ini bukan QR sambungan. Pindai QR dari perangkat yang menampilkannya.'; err.style.display = 'block'; }
      return false;
    }, function (e) { if (err) { err.textContent = e; err.style.display = 'block'; } });
  }
  function onJoinPair(raw) {
    var p = raw.split('|'); var topic = p[1], key;
    try { key = b64urlToBytes(p[2]); } catch (e) { return; }
    if (joinScanner) joinScanner.stop(); var wrap = $('ttJoinCam'); if (wrap) wrap.classList.remove('live');
    showConn('live'); setConnStatus('Menyambungkan…');
    conn = new Conn(key, topic, 'guest', connCallbacks());
    conn.start();
  }
  function connCallbacks() {
    return {
      status: setConnStatus,
      open: function () { showConn('live'); setConnStatus('Terhubung ✓, kirim teks & file dua arah.', 'ok'); },
      text: function (t) { addLogText('in', t); },
      fileStart: function (f) { f._el = addFileProgress('in', f.name, f.size); },
      fileProgress: function (dir, got, total, f) { if (f && f._el) updateProgress(f._el, got, total); },
      fileDone: function (f, blob) { finishIncomingFile(f._el, f.name, blob); try { navigator.vibrate && navigator.vibrate(80); } catch (e) {} },
      closed: function () { setConnStatus('Koneksi ditutup.', 'warn'); }
    };
  }
  function sendLiveText() {
    var ta = $('ttText'); if (!ta || !ta.value || !conn) return;
    conn.sendText(ta.value); addLogText('out', ta.value); ta.value = '';
  }
  function sendLiveFile(file) {
    if (!file || !conn) return;
    var el = addFileProgress('out', file.name, file.size);
    conn.sendFile(file, function (got, total) { updateProgress(el, got, total); }, function () { markSent(el, file.name); });
  }
  function addLogText(dir, text) {
    var log = $('ttLog'); if (!log) return;
    var d = document.createElement('div'); d.className = 'tt-item ' + dir;
    d.innerHTML = '<div class="tt-item-h">' + (dir === 'in' ? '↓ Teks diterima' : '↑ Teks terkirim') + '</div><div class="tt-item-txt">' + esc(text) + '</div>' + (dir === 'in' ? '<button type="button" class="tt-mini" data-copy>Salin</button>' : '');
    log.insertBefore(d, log.firstChild);
    if (dir === 'in') { var btn = d.querySelector('[data-copy]'); if (btn) btn.addEventListener('click', function () { copyStr(text); }); }
  }
  function addFileProgress(dir, name, size) {
    var log = $('ttLog'); if (!log) return null;
    var d = document.createElement('div'); d.className = 'tt-item ' + dir;
    d.innerHTML = '<div class="tt-item-h">' + (dir === 'in' ? '↓ Menerima file' : '↑ Mengirim file') + '</div><div class="tt-file"><span class="tt-file-ic">📄</span><span class="tt-file-nm">' + esc(name) + '</span><span class="tt-file-sz">' + fmtSize(size) + '</span></div><div class="tt-bar"><i style="width:0%"></i></div><div class="tt-file-act"></div>';
    log.insertBefore(d, log.firstChild); return d;
  }
  function updateProgress(el, got, total) { if (!el) return; var i = el.querySelector('.tt-bar i'); if (i) i.style.width = (total ? Math.min(100, Math.round(got / total * 100)) : 0) + '%'; }
  function finishIncomingFile(el, name, blob) {
    if (!el) return; updateProgress(el, 1, 1);
    var url = URL.createObjectURL(blob);
    var h = el.querySelector('.tt-item-h'); if (h) h.textContent = '↓ File diterima';
    var act = el.querySelector('.tt-file-act');
    if (act) { var a = document.createElement('a'); a.href = url; a.download = name; a.className = 'tt-mini pri'; a.textContent = '⬇ Unduh'; act.appendChild(a); }
  }
  function markSent(el, name) { if (!el) return; updateProgress(el, 1, 1); var h = el.querySelector('.tt-item-h'); if (h) h.textContent = '↑ File terkirim ✓'; }
  function stopConn() { if (joinScanner) joinScanner.stop(); if (conn) { conn.close(); conn = null; } }
  function showConn(which) {
    var map = { role: 'ttRole', host: 'ttHostPanel', join: 'ttJoinPanel', live: 'ttLive' };
    for (var k in map) { var el = $(map[k]); if (el) el.classList.toggle('hide', k !== which); }
  }

  /* ================= B) BEAM (offline) ================= */
  var send = { frames: [], idx: 0, timer: null }, recvScanner = null;
  function speedMs() { var s = $('tbSpeed'); return s ? (1000 / parseInt(s.value, 10)) : 180; }
  function renderSend() {
    if (send.timer) { clearInterval(send.timer); send.timer = null; }
    var text = $('tbText') ? $('tbText').value : '', cv = $('tbQR'), info = $('tbFrameInfo'), empty = $('tbEmpty');
    if (!text) { if (cv) cv.style.display = 'none'; if (empty) empty.style.display = 'block'; if (info) info.textContent = ''; return; }
    if (empty) empty.style.display = 'none'; if (cv) cv.style.display = 'block';
    var enc = encodeFrames(text, SLICE); send.frames = enc.frames; send.idx = 0; drawSendFrame();
    if (enc.total > 1) send.timer = setInterval(function () { send.idx = (send.idx + 1) % send.frames.length; drawSendFrame(); }, speedMs());
    if (info) info.textContent = enc.total > 1 ? 'Teks dibagi ' + enc.total + ' bagian, QR berputar otomatis. Arahkan kamera perangkat lain ke sini.' : 'QR siap dipindai.';
  }
  function drawSendFrame() { var cv = $('tbQR'); if (!cv) return; drawQR(cv, send.frames[send.idx], 300); var cnt = $('tbFrameCount'); if (cnt) cnt.textContent = send.frames.length > 1 ? ('Bagian ' + (send.idx + 1) + ' / ' + send.frames.length) : ''; }
  function stopSend() { if (send.timer) { clearInterval(send.timer); send.timer = null; } }
  function startRecv() {
    var err = $('tbErr'); if (err) err.style.display = 'none';
    var result = $('tbResult'); if (result) result.value = '';
    var again = $('tbAgain'); if (again) again.style.display = 'none';
    window.QRBeam.reset();
    if (!recvScanner) recvScanner = new Scanner($('tbVideo'));
    recvScanner.start(function (raw) {
      var r = window.QRBeam.feed(raw);
      if (r.error) { setScanInfo(r.error); return false; }
      if (r.done) { finishRecv(r.text); return true; }
      setScanInfo('Terpindai ' + r.got + ' / ' + r.total + ' bagian…'); return false;
    }, function (e) { if (err) { err.textContent = e; err.style.display = 'block'; } setRecvUI(false); });
    setRecvUI(true); setScanInfo('Mengarahkan ke QR…');
  }
  function setScanInfo(m) { var e = $('tbScanInfo'); if (e) e.textContent = m; }
  function setRecvUI(on) { var s = $('tbStart'), st = $('tbStop'), w = $('tbCamWrap'); if (s) s.style.display = on ? 'none' : ''; if (st) st.style.display = on ? '' : 'none'; if (w) w.classList.toggle('live', on); }
  function finishRecv(text) { stopRecv(); var r = $('tbResult'); if (r) r.value = text; setScanInfo('✓ Teks diterima (' + text.length + ' karakter).'); var again = $('tbAgain'); if (again) again.style.display = ''; try { navigator.vibrate && navigator.vibrate(120); } catch (e) {} }
  function stopRecv() { if (recvScanner) recvScanner.stop(); setRecvUI(false); }
  function setBeamTab(which) {
    var s = $('ttBeamSend'), r = $('ttBeamRecv'), bs = $('ttBeamSendBtn'), br = $('ttBeamRecvBtn');
    if (which === 'recv') { if (s) s.classList.add('hide'); if (r) r.classList.remove('hide'); if (br) br.classList.add('on'); if (bs) bs.classList.remove('on'); stopSend(); }
    else { if (r) r.classList.add('hide'); if (s) s.classList.remove('hide'); if (bs) bs.classList.add('on'); if (br) br.classList.remove('on'); stopRecv(); renderSend(); }
  }

  /* ---------- clipboard ---------- */
  function copyStr(txt) {
    function ok() { var t = $('tbCopied'); if (t) { t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 1400); } }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, function () { fallback(); });
    else fallback();
    function fallback() { try { var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.left = '-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); ok(); } catch (e) {} }
  }

  /* ================= navigation ================= */
  function showScreen(which) {
    stopConn(); stopSend(); stopRecv();
    $('ttChoose').classList.toggle('hide', which !== 'choose');
    $('ttConnect').classList.toggle('hide', which !== 'connect');
    $('ttBeam').classList.toggle('hide', which !== 'beam');
    if (which === 'connect') showConn('role');
    if (which === 'beam') setBeamTab('send');
  }

  function boot() {
    var gc = $('ttGoConnect'), gb = $('ttGoBeam');
    if (gc) gc.addEventListener('click', function () { showScreen('connect'); });
    if (gb) gb.addEventListener('click', function () { showScreen('beam'); });
    var backs = document.querySelectorAll('[data-back]');
    for (var i = 0; i < backs.length; i++) backs[i].addEventListener('click', function () { showScreen('choose'); });
    /* connect */
    var h = $('ttHost'), j = $('ttJoin'); if (h) h.addEventListener('click', startHost); if (j) j.addEventListener('click', startJoin);
    var st = $('ttSendText'); if (st) st.addEventListener('click', sendLiveText);
    var fi = $('ttFile'); if (fi) fi.addEventListener('change', function () { for (var k = 0; k < fi.files.length; k++) sendLiveFile(fi.files[k]); fi.value = ''; });
    var fb = $('ttFileBtn'); if (fb) fb.addEventListener('click', function () { if (fi) fi.click(); });
    var dc = $('ttDisconnect'); if (dc) dc.addEventListener('click', function () { stopConn(); showConn('role'); });
    var hb = $('ttHostBack'); if (hb) hb.addEventListener('click', function () { stopConn(); showConn('role'); });
    var jb = $('ttJoinBack'); if (jb) jb.addEventListener('click', function () { stopConn(); showConn('role'); });
    /* beam */
    var bs = $('ttBeamSendBtn'), br = $('ttBeamRecvBtn');
    if (bs) bs.addEventListener('click', function () { setBeamTab('send'); });
    if (br) br.addEventListener('click', function () { setBeamTab('recv'); });
    var txt = $('tbText'); if (txt) txt.addEventListener('input', renderSend);
    var sp = $('tbSpeed'); if (sp) sp.addEventListener('input', function () { if ($('tbText') && $('tbText').value) renderSend(); });
    var paste = $('tbPaste'); if (paste) paste.addEventListener('click', function () { if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(function (t) { if ($('tbText')) { $('tbText').value = t; renderSend(); } }, function () {}); });
    var start = $('tbStart'); if (start) start.addEventListener('click', startRecv);
    var stop = $('tbStop'); if (stop) stop.addEventListener('click', function () { stopRecv(); setScanInfo('Dihentikan.'); });
    var again = $('tbAgain'); if (again) again.addEventListener('click', function () { var r = $('tbResult'); if (r) r.value = ''; again.style.display = 'none'; startRecv(); });
    var copy = $('tbCopy'); if (copy) copy.addEventListener('click', function () { var r = $('tbResult'); if (r && r.value) copyStr(r.value); });

    document.addEventListener('visibilitychange', function () { if (document.hidden) { stopSend(); stopRecv(); } });
    showScreen('choose');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* test/debug hook (harmless in production; mirrors UI actions) */
  window.__tt = { startHost: startHost, joinRaw: onJoinPair, conn: function () { return conn; }, sendFile: sendLiveFile };
})();
