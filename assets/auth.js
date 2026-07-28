/* PusatBankSoal.id — client-side account, session & activity engine.
   Prototype-grade: data lives in localStorage on this device (no server).
   Passwords are hashed (djb2) so they are not stored in plain text, but this
   is NOT a substitute for real server-side auth. Exposes window.PBS. */
(function () {
  var K_USERS = 'pbs_users', K_SESSION = 'pbs_session',
      K_HISTORY = 'pbs_history', K_ACTIVITY = 'pbs_activity';

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }
  function hash(str) {
    var h = 5381, i = str.length;
    while (i) h = (h * 33) ^ str.charCodeAt(--i);
    return (h >>> 0).toString(36);
  }
  function initials(name) {
    var p = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return 'PB';
    return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  var TARGETS = {
    cpns: 'CPNS', pppk: 'PPPK', snbt: 'SNBT/UTBK', kedinasan: 'Kedinasan',
    bumn: 'BUMN', 'tni-polri': 'TNI/POLRI'
  };

  var PBS = {
    users: function () { return read(K_USERS, []); },
    history: function () { return read(K_HISTORY, []); },
    activity: function () { return read(K_ACTIVITY, {}); },
    targetLabel: function (v) { return TARGETS[v] || v || 'Ujian'; },
    initials: initials,

    currentUser: function () {
      var email = null;
      try { email = localStorage.getItem(K_SESSION); } catch (e) {}
      if (!email) return null;
      var u = this.users().filter(function (x) { return x.email === email; })[0];
      return u || null;
    },

    register: function (d) {
      var name = (d.name || '').trim(), email = (d.email || '').trim().toLowerCase(),
          phone = (d.phone || '').trim(), pass = d.password || '', target = d.target || '';
      if (!name || !email || !phone || !pass || !target)
        return { ok: false, error: 'Semua kolom wajib diisi.' };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return { ok: false, error: 'Format email tidak valid.' };
      if (pass.length < 6)
        return { ok: false, error: 'Password minimal 6 karakter.' };
      var users = this.users();
      if (users.some(function (u) { return u.email === email; }))
        return { ok: false, error: 'Email sudah terdaftar. Silakan masuk.' };
      var user = {
        name: name, email: email, phone: phone, target: target,
        pass: hash(pass), joined: Date.now()
      };
      users.push(user);
      if (!write(K_USERS, users))
        return { ok: false, error: 'Penyimpanan browser tidak tersedia.' };
      try { localStorage.setItem(K_SESSION, email); } catch (e) {}
      return { ok: true, user: user };
    },

    login: function (email, pass) {
      email = (email || '').trim().toLowerCase();
      if (!email || !pass) return { ok: false, error: 'Email dan password wajib diisi.' };
      var u = this.users().filter(function (x) { return x.email === email; })[0];
      if (!u || u.pass !== hash(pass))
        return { ok: false, error: 'Email atau password salah.' };
      try { localStorage.setItem(K_SESSION, email); } catch (e) {}
      return { ok: true, user: u };
    },

    logout: function () {
      try { localStorage.removeItem(K_SESSION); } catch (e) {}
    },

    /* Redirect guests to auth. Returns the user, or null (after redirecting). */
    requireAuth: function () {
      var u = this.currentUser();
      if (!u) { window.location = 'auth.html'; return null; }
      return u;
    },

    /* Record that the user studied today (for streak + heatmap). */
    recordActivity: function (weight) {
      var a = this.activity(), t = today();
      a[t] = (a[t] || 0) + (weight || 1);
      write(K_ACTIVITY, a);
    },

    /* Current consecutive-day streak ending today or yesterday. */
    streak: function () {
      var a = this.activity(), n = 0, d = new Date();
      // allow the streak to still count if today not yet logged
      if (!a[d.toISOString().slice(0, 10)]) d.setDate(d.getDate() - 1);
      while (a[d.toISOString().slice(0, 10)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },

    /* Aggregate stats derived from real tryout history. */
    stats: function () {
      var h = this.history();
      if (!h.length) return { count: 0, avg: 0, best: 0, last: null, trend: 0 };
      var scores = h.map(function (x) { return Math.round(x.pct); });
      var avg = Math.round(scores.reduce(function (s, v) { return s + v; }, 0) / scores.length);
      // trend = latest vs average of the ones before it
      var trend = 0;
      if (h.length > 1) {
        var prev = scores.slice(1);
        var prevAvg = Math.round(prev.reduce(function (s, v) { return s + v; }, 0) / prev.length);
        trend = scores[0] - prevAvg;
      }
      return {
        count: h.length, avg: avg, best: Math.max.apply(null, scores),
        last: h[0], trend: trend
      };
    },

    /* Per-subtest mastery averaged across history (needs h.subs). */
    subMastery: function () {
      var h = this.history(), agg = {};
      h.forEach(function (rec) {
        if (!rec.subs) return;
        Object.keys(rec.subs).forEach(function (name) {
          var s = rec.subs[name];
          if (!agg[name]) agg[name] = { c: 0, t: 0 };
          agg[name].c += s.c; agg[name].t += s.t;
        });
      });
      return Object.keys(agg).map(function (name) {
        return { name: name, pct: Math.round((agg[name].c / agg[name].t) * 100), n: agg[name].t };
      }).sort(function (a, b) { return a.pct - b.pct; });
    },

    /* Rebuild the nav's right side to reflect session state. */
    mountNav: function () {
      var right = document.querySelector('.nav-right');
      if (!right) return;
      var toggle = right.querySelector('.nav-toggle');
      var u = this.currentUser();
      // remove everything except the mobile toggle
      Array.prototype.slice.call(right.children).forEach(function (c) {
        if (c !== toggle) right.removeChild(c);
      });
      var frag = document.createDocumentFragment();
      if (u) {
        var wrap = document.createElement('div');
        wrap.className = 'pbs-usermenu';
        wrap.innerHTML =
          '<button class="pbs-userbtn" aria-haspopup="true" aria-expanded="false">' +
            '<span class="avatar">' + initials(u.name) + '</span>' +
            '<span class="pbs-uname hide-sm">' + escapeHtml(u.name.split(' ')[0]) + '</span>' +
            '<svg class="i hide-sm"><use href="#i-chevron-down"></use></svg>' +
          '</button>' +
          '<div class="pbs-dropdown" role="menu">' +
            '<div class="pbs-dd-head"><div style="font-weight:600">' + escapeHtml(u.name) + '</div>' +
              '<div class="muted" style="font-size:12px">' + escapeHtml(u.email) + '</div></div>' +
            '<a role="menuitem" href="dashboard.html"><svg class="i"><use href="#i-chart"></use></svg> Dashboard</a>' +
            '<a role="menuitem" href="tryout.html"><svg class="i"><use href="#i-play"></use></svg> Mulai Tryout</a>' +
            '<a role="menuitem" href="analisis.html"><svg class="i"><use href="#i-sparkles"></use></svg> AI Analisis</a>' +
            '<button role="menuitem" class="pbs-logout"><svg class="i"><use href="#i-close"></use></svg> Keluar</button>' +
          '</div>';
        frag.appendChild(wrap);
      } else {
        var a = document.createElement('a');
        a.href = 'auth.html'; a.className = 'hide-sm';
        a.style.fontWeight = '600'; a.textContent = 'Masuk';
        var b = document.createElement('a');
        b.href = 'auth.html#daftar'; b.className = 'btn btn-primary btn-sm';
        b.textContent = 'Daftar Gratis';
        frag.appendChild(a); frag.appendChild(b);
      }
      right.insertBefore(frag, toggle || null);
      if (u) wireUserMenu(right);
    }
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function wireUserMenu(right) {
    var btn = right.querySelector('.pbs-userbtn');
    var dd = right.querySelector('.pbs-dropdown');
    var logout = right.querySelector('.pbs-logout');
    if (!btn || !dd) return;
    function close() { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) { if (!right.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    if (logout) logout.addEventListener('click', function () {
      PBS.logout();
      window.location = 'index.html';
    });
  }

  window.PBS = PBS;
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () { PBS.mountNav(); });
  else PBS.mountNav();
})();
