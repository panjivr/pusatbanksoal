/* wiki.js — pengambil pengetahuan dari Wikipedia (gratis, sisi klien, CORS).
 * Tidak butuh API key, tidak berbayar. Memakai endpoint publik Wikimedia yang
 * mengirim header CORS (origin=*). Dipakai untuk mengisi definisi/konteks nyata
 * pada generator skripsi, lalu dikutip sebagai sumber (bukan mengarang).
 *
 * API publik:
 *   WIKI.fetchTerms(terms, cb)  -> cb(map) di mana map['<term lower>'] =
 *                                  { title, extract, url } (hanya yang ketemu)
 *   WIKI.summary(term, cb)      -> cb(entry|null)
 *
 * Sumber:
 *   REST summary : https://id.wikipedia.org/api/rest_v1/page/summary/<judul>
 *   Search       : https://id.wikipedia.org/w/api.php?...&origin=*
 */
(function (global) {
  'use strict';

  var HOST = 'https://id.wikipedia.org';
  var REST = HOST + '/api/rest_v1/page/summary/';
  var API = HOST + '/w/api.php';

  function getJSON(url) {
    // fetch bila ada; jika tidak, XHR. Kembalikan Promise.
    if (global.fetch) {
      return global.fetch(url, { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    }
    return new Promise(function (resolve) {
      try {
        var x = new XMLHttpRequest();
        x.open('GET', url, true);
        x.onreadystatechange = function () {
          if (x.readyState === 4) {
            if (x.status >= 200 && x.status < 300) {
              try { resolve(JSON.parse(x.responseText)); } catch (e) { resolve(null); }
            } else resolve(null);
          }
        };
        x.send();
      } catch (e) { resolve(null); }
    });
  }

  // Cari judul artikel terbaik untuk sebuah istilah (memakai opensearch).
  function searchTitle(term) {
    var url = API + '?action=opensearch&limit=1&namespace=0&format=json&origin=*&search=' +
      encodeURIComponent(term);
    return getJSON(url).then(function (data) {
      // opensearch => [term, [titles], [descs], [urls]]
      if (isArr(data) && isArr(data[1]) && data[1].length) return data[1][0];
      return null;
    });
  }

  function summaryByTitle(title) {
    var url = REST + encodeURIComponent(title.replace(/\s/g, '_')) + '?redirect=true';
    return getJSON(url).then(function (d) {
      if (!d || d.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') return null;
      var extract = clean(d.extract || '');
      if (!extract) return null;
      var pageUrl = (d.content_urls && d.content_urls.desktop && d.content_urls.desktop.page) ||
        (HOST + '/wiki/' + encodeURIComponent((d.title || title).replace(/\s/g, '_')));
      return { title: d.title || title, extract: extract, url: pageUrl };
    });
  }

  // Ambil ringkasan satu istilah: coba langsung, lalu via pencarian judul.
  function summary(term, cb) {
    term = String(term || '').trim();
    if (!term) { if (cb) cb(null); return Promise.resolve(null); }
    var p = summaryByTitle(term).then(function (r) {
      if (r) return r;
      return searchTitle(term).then(function (t) { return t ? summaryByTitle(t) : null; });
    }).catch(function () { return null; });
    if (cb) p.then(cb);
    return p;
  }

  // Ambil banyak istilah paralel; kembalikan peta { '<lower>': entry }.
  function fetchTerms(terms, cb) {
    terms = isArr(terms) ? terms : [];
    var jobs = [];
    for (var i = 0; i < terms.length; i++) jobs.push(summary(terms[i]));
    var p = Promise.all(jobs).then(function (res) {
      var map = {};
      for (var j = 0; j < terms.length; j++) {
        if (res[j]) map[String(terms[j]).toLowerCase()] = res[j];
      }
      return map;
    });
    if (cb) p.then(cb);
    return p;
  }

  function clean(s) {
    return String(s || '').replace(/\s+/g, ' ').replace(/\([^)]*\)/g, function (m) {
      // buang keterangan pengucapan/etimologi yang mengganggu bila terlalu panjang
      return m.length > 40 ? '' : m;
    }).trim();
  }
  function isArr(a) { return Object.prototype.toString.call(a) === '[object Array]'; }

  global.WIKI = { summary: summary, fetchTerms: fetchTerms, searchTitle: searchTitle };
})(typeof window !== 'undefined' ? window : this);
