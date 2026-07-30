/* PusatBankSoal.id — "Riset & Skripsi" (Thesis Intelligence) engine.
   Client-side only, no backend, no build step, ES5-safe. Exposes window.THESIS.

   PRODUCT PRINCIPLE: NO FABRICATED CITATION, NO FABRICATED DATA, NO
   UNSUPPORTED CLAIM. Every reference is real API data (OpenAlex / Crossref)
   or explicit user input. Citation strings are DETERMINISTIC formatting of
   normalized fields. Method recommendation and consistency findings are
   transparent rule-based heuristics — never authoritative claims, never
   invented journal ranks/metrics/results.

   Persistence: localStorage, scoped per signed-in account (window.PBS).
   Loads safely in Node (document/window guarded) for self-testing. */
(function () {
  'use strict';

  /* ---- environment shims (browser or Node) ------------------------------ */
  var g = (typeof window !== 'undefined') ? window
        : (typeof global !== 'undefined') ? global : this;
  var hasDoc = (typeof document !== 'undefined');

  function LS() {
    // localStorage in browser; undefined in bare Node unless a shim is set.
    try { if (typeof localStorage !== 'undefined') return localStorage; } catch (e) {}
    if (g && g.localStorage) return g.localStorage;
    return null;
  }

  var K_PROJECTS = 'pbs_thesis_projects',
      K_ACTIVE   = 'pbs_thesis_active',
      K_CACHE    = 'pbs_thesis_cache';

  var MAILTO = 'hello@pusatbanksoal.id';
  var CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

  /* ---- storage helpers -------------------------------------------------- */
  function read(key, fallback) {
    var ls = LS();
    if (!ls) return fallback;
    try { var v = ls.getItem(key); return v ? (JSON.parse(v) || fallback) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    var ls = LS();
    if (!ls) return false;
    try { ls.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  /* ---- misc utils ------------------------------------------------------- */
  function now() { return new Date().toISOString(); }

  function uid(prefix) {
    var t = Date.now().toString(36);
    var r = Math.floor(Math.random() * 0x7fffffff).toString(36);
    return (prefix || 'id') + '_' + t + r;
  }

  function owner() {
    try {
      if (g.PBS && typeof g.PBS.currentUser === 'function') {
        var u = g.PBS.currentUser();
        if (u && u.email) return u.email;
      }
    } catch (e) {}
    return 'guest';
  }

  function isStr(x) { return typeof x === 'string'; }
  function trim(x) { return String(x == null ? '' : x).replace(/^\s+|\s+$/g, ''); }

  function normTitle(t) {
    return trim(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/^\s+|\s+$/g, '');
  }
  function normDoi(d) {
    if (!d) return '';
    return trim(d).toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, '');
  }

  /* deep-merge plain objects (arrays are replaced, not merged) */
  function deepMerge(target, patch) {
    if (!patch || typeof patch !== 'object') return target;
    for (var k in patch) {
      if (!patch.hasOwnProperty(k)) continue;
      var pv = patch[k];
      if (pv && typeof pv === 'object' && !isArray(pv) &&
          target[k] && typeof target[k] === 'object' && !isArray(target[k])) {
        deepMerge(target[k], pv);
      } else {
        target[k] = pv;
      }
    }
    return target;
  }
  function isArray(x) { return Object.prototype.toString.call(x) === '[object Array]'; }

  /* ====================================================================== */
  /* CHAPTERS PRESET                                                         */
  /* ====================================================================== */
  function defaultChapters(type) {
    // Indonesian S1 (undergraduate) default outline. `type` reserved for
    // future presets (thesis/tesis/disertasi); default covers skripsi S1.
    return [
      { code: 'BAB I', title: 'Pendahuluan', sections: [
        { title: 'Latar Belakang Masalah', content: '', citationIds: [] },
        { title: 'Rumusan Masalah', content: '', citationIds: [] },
        { title: 'Tujuan Penelitian', content: '', citationIds: [] },
        { title: 'Manfaat Penelitian', content: '', citationIds: [] },
        { title: 'Batasan Penelitian', content: '', citationIds: [] }
      ] },
      { code: 'BAB II', title: 'Tinjauan Pustaka', sections: [
        { title: 'Landasan Teori', content: '', citationIds: [] },
        { title: 'Penelitian Terdahulu', content: '', citationIds: [] },
        { title: 'Kerangka Pemikiran', content: '', citationIds: [] },
        { title: 'Hipotesis', content: '', citationIds: [] }
      ] },
      { code: 'BAB III', title: 'Metode Penelitian', sections: [
        { title: 'Jenis dan Pendekatan Penelitian', content: '', citationIds: [] },
        { title: 'Populasi dan Sampel', content: '', citationIds: [] },
        { title: 'Teknik Pengumpulan Data', content: '', citationIds: [] },
        { title: 'Teknik Analisis Data', content: '', citationIds: [] }
      ] },
      { code: 'DAFTAR PUSTAKA', title: 'Daftar Pustaka', sections: [] }
    ];
  }

  /* ====================================================================== */
  /* PROJECTS                                                                */
  /* ====================================================================== */
  function allProjects() { return read(K_PROJECTS, []); }
  function saveAll(list) { return write(K_PROJECTS, list); }

  function listProjects() {
    var me = owner();
    var mine = allProjects().filter(function (p) { return p.owner === me; });
    mine.sort(function (a, b) {
      return (b.createdAt || '') < (a.createdAt || '') ? -1
           : (b.createdAt || '') > (a.createdAt || '') ? 1 : 0;
    });
    return mine;
  }

  function getProject(id) {
    var list = allProjects();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function activeProject() {
    var id = read(K_ACTIVE, null);
    if (!id) return null;
    var p = getProject(id);
    if (p && p.owner === owner()) return p;
    return null;
  }

  function setActive(id) { return write(K_ACTIVE, id); }

  function newState() {
    return {
      topic: '',
      titleAnalysis: null,
      gaps: [],
      questions: [],      // {id,text,rationale}
      objectives: [],     // {id,text,questionId}
      hypotheses: [],
      method: { family: '', design: '', confidence: null, reasons: [], notes: '' },
      constructs: [],
      references: [],     // Reference[]
      evidence: [],       // {id,referenceId,page,quote,claim,note}
      chapters: defaultChapters('skripsi'),
      universityProfile: {}
    };
  }

  var OPTIONAL_FIELDS = ['type', 'degree', 'university', 'faculty', 'program',
    'concentration', 'academicYear', 'city', 'nim', 'supervisor1', 'supervisor2',
    'researchInterest', 'researchObject', 'location', 'methodPref'];

  function createProject(fields) {
    fields = fields || {};
    var title = trim(fields.title);
    if (!title) return { ok: false, error: 'Judul/topik proyek wajib diisi.' };

    var p = {
      id: uid('prj'),
      owner: owner(),
      title: title,
      citationStyle: fields.citationStyle || 'apa7',
      language: fields.language || 'id',
      createdAt: now(),
      updatedAt: now(),
      state: newState()
    };
    for (var i = 0; i < OPTIONAL_FIELDS.length; i++) {
      var f = OPTIONAL_FIELDS[i];
      p[f] = (fields[f] != null) ? fields[f] : '';
    }
    p.state.topic = title;

    var list = allProjects();
    list.push(p);
    saveAll(list);
    setActive(p.id);
    return { ok: true, project: p };
  }

  function updateProject(id, patch) {
    var list = allProjects();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        deepMerge(list[i], patch || {});
        list[i].updatedAt = now();
        saveAll(list);
        return { ok: true, project: list[i] };
      }
    }
    return { ok: false, error: 'Proyek tidak ditemukan.' };
  }

  function deleteProject(id) {
    var list = allProjects();
    var out = list.filter(function (p) { return p.id !== id; });
    saveAll(out);
    if (read(K_ACTIVE, null) === id) write(K_ACTIVE, null);
    return { ok: true };
  }

  /* ====================================================================== */
  /* REFERENCES                                                              */
  /* ====================================================================== */
  function normalizeReference(work) {
    work = work || {};
    return {
      id: work.id && /^ref_/.test(work.id) ? work.id : uid('ref'),
      source: work.source || 'manual',
      title: trim(work.title),
      authors: isArray(work.authors) ? work.authors : [],
      year: work.year != null ? work.year : null,
      venue: work.venue || '',
      publisher: work.publisher || '',
      volume: work.volume || '',
      issue: work.issue || '',
      pages: work.pages || '',
      doi: normDoi(work.doi),
      url: work.url || (work.doi ? 'https://doi.org/' + normDoi(work.doi) : ''),
      abstract: work.abstract || '',
      type: work.type || '',
      openAlexId: work.openAlexId || '',
      openAccess: !!work.openAccess,
      citationCount: (typeof work.citationCount === 'number') ? work.citationCount : null,
      verification_status: work.verification_status || 'unverified',
      tags: isArray(work.tags) ? work.tags : [],
      createdAt: now()
    };
  }

  function findDuplicate(refs, work) {
    var doi = normDoi(work.doi);
    var oa = work.openAlexId || '';
    var nt = normTitle(work.title);
    for (var i = 0; i < refs.length; i++) {
      var r = refs[i];
      if (doi && normDoi(r.doi) === doi) return r;
      if (oa && r.openAlexId && r.openAlexId === oa) return r;
      if (nt && normTitle(r.title) === nt) return r;
    }
    return null;
  }

  // Locate a project inside a fresh list read so mutations can be persisted
  // together (getProject alone returns a throwaway copy from storage).
  function withProject(pid, fn) {
    var list = allProjects();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === pid) {
        var res = fn(list[i]);
        list[i].updatedAt = now();
        saveAll(list);
        return res;
      }
    }
    return null;
  }

  function addReference(pid, work) {
    var res = withProject(pid, function (p) {
      var refs = p.state.references;
      var dup = findDuplicate(refs, work || {});
      if (dup) return { ok: true, reference: dup, duplicate: true, _skip: true };
      var ref = normalizeReference(work);
      refs.push(ref);
      return { ok: true, reference: ref, duplicate: false };
    });
    return res || { ok: false, error: 'Proyek tidak ditemukan.' };
  }

  function updateReference(pid, refId, patch) {
    var res = withProject(pid, function (p) {
      var refs = p.state.references;
      for (var i = 0; i < refs.length; i++) {
        if (refs[i].id === refId) {
          deepMerge(refs[i], patch || {});
          return { ok: true, reference: refs[i] };
        }
      }
      return { ok: false, error: 'Referensi tidak ditemukan.' };
    });
    return res || { ok: false, error: 'Proyek tidak ditemukan.' };
  }

  function removeReference(pid, refId) {
    var res = withProject(pid, function (p) {
      p.state.references = p.state.references.filter(function (r) { return r.id !== refId; });
      return { ok: true };
    });
    return res || { ok: false, error: 'Proyek tidak ditemukan.' };
  }

  /* ====================================================================== */
  /* CACHE (in-memory + localStorage, 24h TTL)                              */
  /* ====================================================================== */
  var memCache = {};

  function cacheGet(key) {
    var e = memCache[key];
    if (!e) {
      var store = read(K_CACHE, {});
      e = store[key];
    }
    if (!e) return null;
    if (Date.now() - e.t > CACHE_TTL) return null;
    return e.v;
  }
  function cacheSet(key, val) {
    var entry = { t: Date.now(), v: val };
    memCache[key] = entry;
    var store = read(K_CACHE, {});
    store[key] = entry;
    // prune expired to keep it small
    for (var k in store) {
      if (store.hasOwnProperty(k) && (Date.now() - store[k].t > CACHE_TTL)) delete store[k];
    }
    write(K_CACHE, store);
  }

  /* ====================================================================== */
  /* RESEARCH PROVIDERS (real network via fetch)                            */
  /* ====================================================================== */
  function ensureFetch() {
    if (typeof fetch === 'undefined') {
      return null;
    }
    return fetch;
  }

  function authorsFromOpenAlex(authorships) {
    var out = [];
    if (!isArray(authorships)) return out;
    for (var i = 0; i < authorships.length; i++) {
      var a = authorships[i] && authorships[i].author;
      var name = a && a.display_name ? a.display_name : '';
      if (!name) continue;
      var parts = splitName(name);
      out.push({ name: name, given: parts.given, family: parts.family });
    }
    return out;
  }

  // Heuristic split of a "Given Middle Family" display name. Deterministic;
  // used only for citation formatting, never fabricated data.
  function splitName(name) {
    var n = trim(name);
    if (!n) return { given: '', family: '' };
    var parts = n.split(/\s+/);
    if (parts.length === 1) return { given: '', family: parts[0] };
    var family = parts.pop();
    return { given: parts.join(' '), family: family };
  }

  function mapOpenAlexWork(w) {
    w = w || {};
    var doi = w.doi ? normDoi(w.doi) : '';
    var venue = '';
    if (w.primary_location && w.primary_location.source && w.primary_location.source.display_name) {
      venue = w.primary_location.source.display_name;
    }
    var oaId = '';
    if (w.ids && w.ids.openalex) oaId = w.ids.openalex;
    else if (w.id) oaId = w.id;
    return normalizeReference({
      source: 'openalex',
      title: w.title || w.display_name || '',
      authors: authorsFromOpenAlex(w.authorships),
      year: (typeof w.publication_year === 'number') ? w.publication_year : null,
      venue: venue,
      doi: doi,
      url: doi ? 'https://doi.org/' + doi : (oaId || ''),
      openAlexId: oaId,
      openAccess: !!(w.open_access && w.open_access.is_oa),
      citationCount: (typeof w.cited_by_count === 'number') ? w.cited_by_count : null,
      type: w.type || '',
      verification_status: 'metadata_verified'
    });
  }

  function searchOpenAlex(query, opts) {
    opts = opts || {};
    var q = trim(query);
    var per = opts.perPage || opts.per_page || 10;
    var ckey = 'openalex::' + per + '::' + q.toLowerCase();
    return new Promise(function (resolve, reject) {
      if (!q) { resolve([]); return; }
      var cached = cacheGet(ckey);
      if (cached) { resolve(cached); return; }
      var f = ensureFetch();
      if (!f) { reject(new Error('fetch tidak tersedia di lingkungan ini.')); return; }
      var url = 'https://api.openalex.org/works?search=' + encodeURIComponent(q) +
                '&per_page=' + encodeURIComponent(per) +
                '&mailto=' + encodeURIComponent(MAILTO);
      f(url).then(function (res) {
        if (!res.ok) throw new Error('OpenAlex HTTP ' + res.status);
        return res.json();
      }).then(function (data) {
        var items = (data && isArray(data.results)) ? data.results : [];
        var mapped = items.map(mapOpenAlexWork);
        cacheSet(ckey, mapped);
        resolve(mapped);
      })['catch'](function (err) {
        reject(new Error('Gagal mengambil data OpenAlex: ' + err.message));
      });
    });
  }

  function authorsFromCrossref(arr) {
    var out = [];
    if (!isArray(arr)) return out;
    for (var i = 0; i < arr.length; i++) {
      var a = arr[i] || {};
      var given = a.given || '';
      var family = a.family || a.name || '';
      var name = trim((given ? given + ' ' : '') + family);
      if (!name) continue;
      out.push({ name: name, given: given, family: (a.family || '') });
    }
    return out;
  }

  function crossrefYear(issued) {
    try {
      var dp = issued && issued['date-parts'] && issued['date-parts'][0];
      if (dp && dp.length) return dp[0];
    } catch (e) {}
    return null;
  }

  function mapCrossrefItem(m) {
    m = m || {};
    var title = (isArray(m.title) && m.title.length) ? m.title[0] : (m.title || '');
    var venue = (isArray(m['container-title']) && m['container-title'].length)
              ? m['container-title'][0] : '';
    var doi = m.DOI ? normDoi(m.DOI) : '';
    return normalizeReference({
      source: 'crossref',
      title: title,
      authors: authorsFromCrossref(m.author),
      year: crossrefYear(m.issued),
      venue: venue,
      publisher: m.publisher || '',
      volume: m.volume || '',
      issue: m.issue || '',
      pages: m.page || '',
      doi: doi,
      url: m.URL || (doi ? 'https://doi.org/' + doi : ''),
      type: m.type || '',
      citationCount: (typeof m['is-referenced-by-count'] === 'number')
                     ? m['is-referenced-by-count'] : null,
      verification_status: 'metadata_verified'
    });
  }

  function searchCrossref(query, opts) {
    opts = opts || {};
    var q = trim(query);
    var rows = opts.rows || opts.perPage || 10;
    var ckey = 'crossref::' + rows + '::' + q.toLowerCase();
    return new Promise(function (resolve, reject) {
      if (!q) { resolve([]); return; }
      var cached = cacheGet(ckey);
      if (cached) { resolve(cached); return; }
      var f = ensureFetch();
      if (!f) { reject(new Error('fetch tidak tersedia di lingkungan ini.')); return; }
      var url = 'https://api.crossref.org/works?query=' + encodeURIComponent(q) +
                '&rows=' + encodeURIComponent(rows) +
                '&mailto=' + encodeURIComponent(MAILTO);
      f(url).then(function (res) {
        if (!res.ok) throw new Error('Crossref HTTP ' + res.status);
        return res.json();
      }).then(function (data) {
        var items = (data && data.message && isArray(data.message.items))
                  ? data.message.items : [];
        var mapped = items.map(mapCrossrefItem);
        cacheSet(ckey, mapped);
        resolve(mapped);
      })['catch'](function (err) {
        reject(new Error('Gagal mengambil data Crossref: ' + err.message));
      });
    });
  }

  function verifyDOI(doi) {
    var d = normDoi(doi);
    return new Promise(function (resolve, reject) {
      if (!d) { resolve(null); return; }
      var f = ensureFetch();
      if (!f) { reject(new Error('fetch tidak tersedia di lingkungan ini.')); return; }
      var url = 'https://api.crossref.org/works/' + d;
      f(url).then(function (res) {
        if (res.status === 404) { resolve(null); return null; }
        if (!res.ok) throw new Error('Crossref HTTP ' + res.status);
        return res.json();
      }).then(function (data) {
        if (!data) return; // 404 already resolved
        var m = data.message;
        if (!m) { resolve(null); return; }
        var ref = mapCrossrefItem(m);
        ref.verification_status = 'identifier_verified';
        resolve(ref);
      })['catch'](function (err) {
        reject(new Error('Gagal memverifikasi DOI: ' + err.message));
      });
    });
  }

  /* ====================================================================== */
  /* CITATIONS (deterministic formatting)                                   */
  /* ====================================================================== */
  function initialsOf(given) {
    var g2 = trim(given);
    if (!g2) return '';
    var parts = g2.split(/\s+/);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i].charAt(0);
      if (c) out.push(c.toUpperCase() + '.');
    }
    return out.join(' ');
  }

  function authFamily(a) {
    if (!a) return '';
    if (a.family) return a.family;
    return splitName(a.name || '').family;
  }
  function authGiven(a) {
    if (!a) return '';
    if (a.given) return a.given;
    return splitName(a.name || '').given;
  }

  // APA7 author list: "Family, I. I., & Family, I. I."
  function apaAuthors(authors) {
    if (!authors || !authors.length) return '';
    var parts = [];
    for (var i = 0; i < authors.length; i++) {
      var fam = authFamily(authors[i]);
      var ini = initialsOf(authGiven(authors[i]));
      parts.push(ini ? (fam + ', ' + ini) : fam);
    }
    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(', ') + ', & ' + parts[parts.length - 1];
  }

  // Harvard author list: "Family, I.I. and Family, I.I."
  function harvardAuthors(authors) {
    if (!authors || !authors.length) return '';
    var parts = [];
    for (var i = 0; i < authors.length; i++) {
      var fam = authFamily(authors[i]);
      var ini = initialsOf(authGiven(authors[i])).replace(/ /g, '');
      parts.push(ini ? (fam + ', ' + ini) : fam);
    }
    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
  }

  // IEEE author list: "A. B. Author, C. D. Author"
  function ieeeAuthors(authors) {
    if (!authors || !authors.length) return '';
    var parts = [];
    for (var i = 0; i < authors.length; i++) {
      var ini = initialsOf(authGiven(authors[i]));
      var fam = authFamily(authors[i]);
      parts.push(ini ? (ini + ' ' + fam) : fam);
    }
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts[0] + ' and ' + parts[1];
    return parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1];
  }

  // Vancouver author list: "Family II, Family II" (initials no dots, glued)
  function vancouverAuthors(authors) {
    if (!authors || !authors.length) return '';
    var parts = [];
    for (var i = 0; i < authors.length; i++) {
      var fam = authFamily(authors[i]);
      var ini = initialsOf(authGiven(authors[i])).replace(/[.\s]/g, '');
      parts.push(ini ? (fam + ' ' + ini) : fam);
    }
    return parts.join(', ');
  }

  function nameInverted(a) { var f = authFamily(a), g = trim(authGiven(a)); return g ? (f + ', ' + g) : f; }
  function nameNormal(a) { var f = authFamily(a), g = trim(authGiven(a)); return g ? (g + ' ' + f) : f; }

  // Chicago (author-date) author list: "Last, First, and First Last"
  function chicagoAuthors(authors) {
    if (!authors || !authors.length) return '';
    if (authors.length === 1) return nameInverted(authors[0]);
    var parts = [nameInverted(authors[0])];
    for (var i = 1; i < authors.length; i++) parts.push(nameNormal(authors[i]));
    return parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1];
  }

  // MLA author list: "Last, First", 2 → "..., and First Last", 3+ → "..., et al."
  function mlaAuthors(authors) {
    if (!authors || !authors.length) return '';
    if (authors.length === 1) return nameInverted(authors[0]);
    if (authors.length === 2) return nameInverted(authors[0]) + ', and ' + nameNormal(authors[1]);
    return nameInverted(authors[0]) + ', et al.';
  }

  function volIssuePages_apa(w) {
    var s = '';
    if (w.volume) {
      s += w.volume;
      if (w.issue) s += '(' + w.issue + ')';
    }
    if (w.pages) s += (s ? ', ' : '') + w.pages;
    return s;
  }

  function dotEnd(s) {
    s = trim(s);
    if (!s) return '';
    return /[.?!]$/.test(s) ? s : s + '.';
  }

  function formatBibliography(w, style) {
    w = w || {};
    style = (style || 'apa7').toLowerCase();
    var year = (w.year != null && w.year !== '') ? w.year : 'n.d.';
    var title = trim(w.title);
    var venue = trim(w.venue);
    var doi = normDoi(w.doi);
    var doiUrl = doi ? 'https://doi.org/' + doi : '';

    if (style === 'apa7' || style === 'apa') {
      var s = apaAuthors(w.authors);
      s = s ? dotEnd(s) + ' ' : '';
      s += '(' + year + '). ';
      s += dotEnd(title) + ' ';
      if (venue) {
        s += '*' + venue + '*';
        var vip = volIssuePages_apa(w);
        if (vip) s += ', ' + vip;
        s += '. ';
      }
      if (doiUrl) s += doiUrl;
      return trim(s);
    }

    if (style === 'ieee') {
      // entry only; the [n] index is added by the caller/buildBibliography
      var e = ieeeAuthors(w.authors);
      e = e ? e + ', ' : '';
      e += '"' + trim(title.replace(/\.$/, '')) + ',"';
      if (venue) e += ' *' + venue + '*,';
      if (w.volume) e += ' vol. ' + w.volume + ',';
      if (w.issue) e += ' no. ' + w.issue + ',';
      if (w.pages) e += ' pp. ' + w.pages + ',';
      e += ' ' + year + '.';
      if (doi) e += ' doi: ' + doi + '.';
      return trim(e);
    }

    if (style === 'harvard') {
      var h = harvardAuthors(w.authors);
      h = h ? h + ' ' : '';
      h += '(' + year + ') ';
      h += "'" + trim(title.replace(/\.$/, '')) + "', ";
      if (venue) {
        h += '*' + venue + '*';
        if (w.volume) h += ', ' + w.volume;
        if (w.issue) h += '(' + w.issue + ')';
        if (w.pages) h += ', pp. ' + w.pages;
        h += '. ';
      }
      if (doiUrl) h += 'Available at: ' + doiUrl + '.';
      return trim(h);
    }

    if (style === 'vancouver') {
      var v = vancouverAuthors(w.authors);
      v = v ? dotEnd(v) + ' ' : '';
      v += dotEnd(title) + ' ';
      if (venue) {
        v += venue + '. ';
        v += year;
        if (w.volume) v += ';' + w.volume;
        if (w.issue) v += '(' + w.issue + ')';
        if (w.pages) v += ':' + w.pages;
        v += '.';
      } else {
        v += year + '.';
      }
      if (doi) v += ' doi:' + doi + '.';
      return trim(v);
    }

    if (style === 'chicago') {
      // Chicago author-date: Author. Year. "Title." *Venue* Vol (Issue): Pages. URL.
      var c = chicagoAuthors(w.authors);
      c = c ? dotEnd(c) + ' ' : '';
      c += year + '. ';
      c += '"' + trim(title.replace(/\.$/, '')) + '." ';
      if (venue) {
        c += '*' + venue + '*';
        if (w.volume) c += ' ' + w.volume;
        if (w.issue) c += ' (' + w.issue + ')';
        if (w.pages) c += ': ' + w.pages;
        c += '. ';
      }
      if (doiUrl) c += doiUrl + '.';
      return trim(c);
    }

    if (style === 'mla') {
      // MLA Works Cited: Author. "Title." *Venue*, vol. X, no. Y, Year, pp. Z. URL.
      var m = mlaAuthors(w.authors);
      m = m ? dotEnd(m) + ' ' : '';
      m += '"' + trim(title.replace(/\.$/, '')) + '." ';
      if (venue) {
        m += '*' + venue + '*';
        if (w.volume) m += ', vol. ' + w.volume;
        if (w.issue) m += ', no. ' + w.issue;
        m += ', ' + year;
        if (w.pages) m += ', pp. ' + w.pages;
        m += '. ';
      } else {
        m += year + '. ';
      }
      if (doiUrl) m += doiUrl + '.';
      return trim(m);
    }

    // fallback: APA
    return formatBibliography(w, 'apa7');
  }

  function formatInText(w, style, page) {
    w = w || {};
    style = (style || 'apa7').toLowerCase();
    var year = (w.year != null && w.year !== '') ? w.year : 'n.d.';
    var fam = (w.authors && w.authors.length) ? authFamily(w.authors[0]) : (w.venue || 'Anonim');
    if (w.authors && w.authors.length > 2) fam = authFamily(w.authors[0]) + ' et al.';
    else if (w.authors && w.authors.length === 2)
      fam = authFamily(w.authors[0]) + ' & ' + authFamily(w.authors[1]);

    if (style === 'apa7' || style === 'apa') {
      return page ? '(' + fam + ', ' + year + ', p. ' + page + ')'
                  : '(' + fam + ', ' + year + ')';
    }
    if (style === 'harvard') {
      return page ? '(' + fam + ', ' + year + ', p. ' + page + ')'
                  : '(' + fam + ', ' + year + ')';
    }
    if (style === 'chicago') {
      // Chicago author-date: (Author Year, page)
      var aa = w.authors || [], af;
      if (!aa.length) af = w.venue || 'Anonim';
      else if (aa.length === 1) af = authFamily(aa[0]);
      else if (aa.length === 2) af = authFamily(aa[0]) + ' and ' + authFamily(aa[1]);
      else if (aa.length === 3) af = authFamily(aa[0]) + ', ' + authFamily(aa[1]) + ', and ' + authFamily(aa[2]);
      else af = authFamily(aa[0]) + ' et al.';
      return page ? '(' + af + ' ' + year + ', ' + page + ')' : '(' + af + ' ' + year + ')';
    }
    if (style === 'mla') {
      // MLA author-page: (Author page) / (Author)
      var mf = (w.authors && w.authors.length) ? authFamily(w.authors[0]) : (w.venue || 'Anonim');
      if (w.authors && w.authors.length > 2) mf = authFamily(w.authors[0]) + ' et al.';
      else if (w.authors && w.authors.length === 2) mf = authFamily(w.authors[0]) + ' and ' + authFamily(w.authors[1]);
      return page ? '(' + mf + ' ' + page + ')' : '(' + mf + ')';
    }
    // IEEE / Vancouver are numeric — the running number is assigned by the
    // caller against buildBibliography() order; return '' as a placeholder.
    return '';
  }

  function firstFamily(w) {
    if (w && w.authors && w.authors.length) return authFamily(w.authors[0]).toLowerCase();
    return trim(w && w.title).toLowerCase();
  }

  function buildBibliography(refs, style) {
    refs = isArray(refs) ? refs.slice() : [];
    style = (style || 'apa7').toLowerCase();
    var alpha = (style === 'apa7' || style === 'apa' || style === 'harvard' || style === 'chicago' || style === 'mla');
    if (alpha) {
      refs.sort(function (a, b) {
        var fa = firstFamily(a), fb = firstFamily(b);
        return fa < fb ? -1 : fa > fb ? 1 : 0;
      });
    }
    // IEEE / Vancouver: keep insertion order.
    var out = [];
    for (var i = 0; i < refs.length; i++) {
      out.push({ refId: refs[i].id, entry: formatBibliography(refs[i], style) });
    }
    return out;
  }

  /* ====================================================================== */
  /* EXPORTS                                                                 */
  /* ====================================================================== */
  function bibKey(w) {
    var fam = (w.authors && w.authors.length) ? authFamily(w.authors[0]) : 'anon';
    fam = String(fam).replace(/[^A-Za-z0-9]/g, '') || 'anon';
    var year = (w.year != null && w.year !== '') ? w.year : 'nd';
    return fam.toLowerCase() + year;
  }
  function bibtexAuthors(authors) {
    if (!authors || !authors.length) return '';
    var parts = [];
    for (var i = 0; i < authors.length; i++) {
      var fam = authFamily(authors[i]), giv = authGiven(authors[i]);
      parts.push(giv ? (fam + ', ' + giv) : fam);
    }
    return parts.join(' and ');
  }
  function bibtexEscape(s) {
    return String(s == null ? '' : s);
  }

  function toBibTeX(refs) {
    refs = isArray(refs) ? refs : [];
    var lines = [];
    var seen = {};
    for (var i = 0; i < refs.length; i++) {
      var w = refs[i];
      var isArticle = !!trim(w.venue);
      var type = isArticle ? 'article' : 'misc';
      var key = bibKey(w);
      while (seen[key]) key += 'a';
      seen[key] = true;
      var f = [];
      f.push('  author = {' + bibtexEscape(bibtexAuthors(w.authors)) + '}');
      f.push('  title = {' + bibtexEscape(w.title) + '}');
      if (w.year != null && w.year !== '') f.push('  year = {' + w.year + '}');
      if (w.venue) f.push('  journal = {' + bibtexEscape(w.venue) + '}');
      if (w.publisher) f.push('  publisher = {' + bibtexEscape(w.publisher) + '}');
      if (w.volume) f.push('  volume = {' + w.volume + '}');
      if (w.issue) f.push('  number = {' + w.issue + '}');
      if (w.pages) f.push('  pages = {' + String(w.pages).replace(/-/g, '--') + '}');
      if (w.doi) f.push('  doi = {' + normDoi(w.doi) + '}');
      if (w.url) f.push('  url = {' + w.url + '}');
      lines.push('@' + type + '{' + key + ',\n' + f.join(',\n') + '\n}');
    }
    return lines.join('\n\n');
  }

  function toRIS(refs) {
    refs = isArray(refs) ? refs : [];
    var out = [];
    for (var i = 0; i < refs.length; i++) {
      var w = refs[i];
      var ty = trim(w.venue) ? 'JOUR' : 'GEN';
      var b = [];
      b.push('TY  - ' + ty);
      var a = w.authors || [];
      for (var j = 0; j < a.length; j++) {
        var fam = authFamily(a[j]), giv = authGiven(a[j]);
        b.push('AU  - ' + (giv ? (fam + ', ' + giv) : fam));
      }
      if (w.title) b.push('TI  - ' + w.title);
      if (w.year != null && w.year !== '') b.push('PY  - ' + w.year);
      if (w.venue) b.push('JO  - ' + w.venue);
      if (w.publisher) b.push('PB  - ' + w.publisher);
      if (w.volume) b.push('VL  - ' + w.volume);
      if (w.issue) b.push('IS  - ' + w.issue);
      if (w.pages) {
        var pp = String(w.pages).split('-');
        b.push('SP  - ' + trim(pp[0]));
        if (pp.length > 1) b.push('EP  - ' + trim(pp[1]));
      }
      if (w.doi) b.push('DO  - ' + normDoi(w.doi));
      if (w.url) b.push('UR  - ' + w.url);
      if (w.abstract) b.push('AB  - ' + w.abstract);
      b.push('ER  - ');
      out.push(b.join('\n'));
    }
    return out.join('\n\n');
  }

  /* ====================================================================== */
  /* METHOD RECOMMENDER (rule-based, transparent)                           */
  /* ====================================================================== */
  function recommendMethod(answers) {
    answers = answers || {};
    var goal = answers.goal || '';
    var dataType = answers.dataType || '';
    var hasHyp = !!answers.hasHypothesis;

    var reasons = [], requirements = [], risks = [], alternatives = [];
    var family = '', design = '', confidence = 0.5;

    if (dataType === 'mixed') {
      family = 'Mixed Methods';
      design = 'Convergent parallel';
      confidence = 0.6;
      reasons.push('Data yang direncanakan bersifat campuran (numerik + teks).');
      requirements.push('Instrumen kuantitatif (kuesioner) dan kualitatif (wawancara/observasi).');
      requirements.push('Rencana integrasi/triangulasi data kuantitatif dan kualitatif.');
      risks.push('Beban pengumpulan & analisis data lebih besar untuk skripsi S1.');
      alternatives.push({ family: 'Quantitative', design: 'Survey' });
      alternatives.push({ family: 'Qualitative', design: 'Case study' });
    } else if (dataType === 'numeric') {
      family = 'Quantitative';
      confidence = 0.6;
      reasons.push('Data yang direncanakan bersifat numerik.');
      if (goal === 'relationship') {
        design = 'Correlational';
        confidence = 0.75;
        reasons.push('Tujuan menguji hubungan antar variabel -> desain korelasional.');
        requirements.push('Definisi operasional & instrumen berskala untuk tiap variabel.');
        requirements.push('Sampel memadai + uji asumsi (normalitas, linearitas).');
      } else if (goal === 'compare') {
        design = 'Comparative / (quasi-)experimental';
        confidence = 0.7;
        reasons.push('Tujuan membandingkan kelompok -> desain komparatif/eksperimen.');
        requirements.push('Kelompok pembanding dan kontrol variabel pengganggu.');
        risks.push('Randomisasi penuh sering sulit di lapangan (pertimbangkan kuasi-eksperimen).');
      } else if (goal === 'measure') {
        design = 'Descriptive survey';
        confidence = 0.65;
        reasons.push('Tujuan mengukur/mendeskripsikan -> survei deskriptif.');
        requirements.push('Instrumen tervalidasi & reliabel; teknik sampling jelas.');
      } else {
        design = 'Survey';
        reasons.push('Data numerik tanpa tujuan spesifik -> survei umum.');
      }
      if (hasHyp) { confidence = Math.min(0.9, confidence + 0.1);
        reasons.push('Terdapat hipotesis eksplisit -> mendukung pendekatan kuantitatif.'); }
    } else if (dataType === 'text') {
      family = 'Qualitative';
      confidence = 0.6;
      reasons.push('Data yang direncanakan bersifat tekstual/naratif.');
      if (goal === 'explore') {
        design = 'Case study';
        confidence = 0.75;
        reasons.push('Tujuan mengeksplorasi fenomena -> studi kasus.');
      } else if (goal === 'develop') {
        design = 'Grounded theory';
        confidence = 0.7;
        reasons.push('Tujuan membangun teori/model -> grounded theory.');
      } else {
        design = 'Thematic / phenomenology';
        reasons.push('Data tekstual -> analisis tematik / fenomenologi.');
      }
      requirements.push('Panduan wawancara/observasi & strategi pemilihan informan.');
      requirements.push('Strategi keabsahan data (triangulasi, member checking).');
      if (hasHyp) risks.push('Hipotesis formal jarang cocok untuk desain kualitatif — pertimbangkan proposisi.');
    } else {
      // unknown data type -> infer from goal only, low confidence
      family = (goal === 'explore' || goal === 'develop') ? 'Qualitative' : 'Quantitative';
      design = 'Belum dapat ditentukan';
      confidence = 0.35;
      reasons.push('Jenis data belum ditentukan; rekomendasi bersifat sementara.');
      requirements.push('Tentukan jenis data (numerik/teks/campuran) untuk rekomendasi lebih pasti.');
    }

    if (!design) design = 'Umum';
    risks.push('Rekomendasi ini heuristik & harus dikonfirmasi dengan dosen pembimbing.');

    return {
      family: family,
      design: design,
      confidence: Math.round(confidence * 100) / 100,
      reasons: reasons,
      requirements: requirements,
      risks: risks,
      alternatives: alternatives
    };
  }

  /* ====================================================================== */
  /* CONSISTENCY CHECKER (deterministic)                                    */
  /* ====================================================================== */
  function checkConsistency(project) {
    var findings = [];
    if (!project || !project.state) return findings;
    var st = project.state;
    var questions = st.questions || [];
    var objectives = st.objectives || [];
    var method = st.method || {};
    var refs = st.references || [];
    var chapters = st.chapters || [];

    function push(type, rule, message, location) {
      findings.push({ type: type, rule: rule, message: message, location: location });
    }

    // build lookups
    var qHasObjective = {};
    for (var i = 0; i < objectives.length; i++) {
      var o = objectives[i];
      if (o.questionId) qHasObjective[o.questionId] = true;
      // objective without a question
      if (!o.questionId) {
        push('warning', 'objective_no_question',
          'Tujuan penelitian tidak terhubung ke rumusan masalah manapun.',
          'objectives:' + (o.id || i));
      } else {
        var found = false;
        for (var k = 0; k < questions.length; k++) if (questions[k].id === o.questionId) { found = true; break; }
        if (!found) push('warning', 'objective_orphan_question',
          'Tujuan merujuk ke rumusan masalah yang tidak ada.',
          'objectives:' + (o.id || i));
      }
    }
    // question without objective
    for (var q = 0; q < questions.length; q++) {
      if (!qHasObjective[questions[q].id]) {
        push('warning', 'question_no_objective',
          'Rumusan masalah belum memiliki tujuan penelitian yang sesuai.',
          'questions:' + (questions[q].id || q));
      }
    }
    // method empty while questions exist
    var methodEmpty = !trim(method.family) && !trim(method.design);
    if (methodEmpty && questions.length) {
      push('critical', 'method_empty',
        'Sudah ada rumusan masalah namun metode penelitian belum ditentukan.',
        'method');
    }
    // citationIds referencing missing refId + references empty while chapters cite
    var refIds = {};
    for (var r = 0; r < refs.length; r++) refIds[refs[r].id] = true;
    var totalCitationsInChapters = 0;
    for (var c = 0; c < chapters.length; c++) {
      var secs = chapters[c].sections || [];
      for (var s = 0; s < secs.length; s++) {
        var cids = secs[s].citationIds || [];
        for (var ci = 0; ci < cids.length; ci++) {
          totalCitationsInChapters++;
          if (!refIds[cids[ci]]) {
            push('critical', 'citation_missing_reference',
              'Sitasi merujuk ke referensi yang tidak ada di daftar pustaka.',
              (chapters[c].code || 'BAB') + ' / ' + (secs[s].title || ('section ' + s)));
          }
        }
      }
    }
    if (!refs.length && totalCitationsInChapters > 0) {
      push('critical', 'references_empty',
        'Bab memuat sitasi namun daftar referensi masih kosong.',
        'references');
    }
    // title changed after chapters drafted (timestamps)
    var hasDraft = false;
    for (var cc = 0; cc < chapters.length; cc++) {
      var ss = chapters[cc].sections || [];
      for (var sj = 0; sj < ss.length; sj++) {
        if (trim(ss[sj].content)) { hasDraft = true; break; }
      }
      if (hasDraft) break;
    }
    if (hasDraft && project.updatedAt && st.titleAnalysis && st.titleAnalysis.at) {
      if (project.title && st.titleAnalysis.title &&
          normTitle(project.title) !== normTitle(st.titleAnalysis.title)) {
        push('info', 'title_changed_after_draft',
          'Judul berubah setelah bab mulai ditulis — periksa kembali keselarasan isi.',
          'title');
      }
    }

    return findings;
  }

  /* ====================================================================== */
  /* PROPOSAL WIZARD (simple input -> detailed, non-fabricated output)       */
  /* ------------------------------------------------------------------      */
  /* Everything below is either (a) deterministic template prose weaving in   */
  /* the student's OWN inputs, or (b) an explicit 〔placeholder〕 marking where */
  /* real facts/data/sources must be supplied. Never invents citations,      */
  /* statistics, participant data, or findings.                              */
  /* ====================================================================== */

  // Wrap text as a clearly-marked placeholder for real content.
  function ph(s) { return '〔' + s + '〕'; } // 〔 … 〕

  /* ---- 1) FIELDS: choice catalogs for the wizard UI --------------------- */
  var FIELDS = {
    bidang: [
      { value: 'manajemen',   label: 'Manajemen' },
      { value: 'akuntansi',   label: 'Akuntansi' },
      { value: 'ekonomi',     label: 'Ekonomi' },
      { value: 'pendidikan',  label: 'Pendidikan' },
      { value: 'informatika', label: 'Informatika / Ilmu Komputer' },
      { value: 'teknik',      label: 'Teknik' },
      { value: 'hukum',       label: 'Hukum' },
      { value: 'psikologi',   label: 'Psikologi' },
      { value: 'kesehatan',   label: 'Kesehatan / Keperawatan' },
      { value: 'komunikasi',  label: 'Ilmu Komunikasi' },
      { value: 'sosial',      label: 'Sosial & Politik' },
      { value: 'pertanian',   label: 'Pertanian' },
      { value: 'lainnya',     label: 'Lainnya' }
    ],
    jenjang: [
      { value: 's1', label: 'S1 (Sarjana / Skripsi)' },
      { value: 'd3', label: 'D3 (Tugas Akhir)' },
      { value: 's2', label: 'S2 (Tesis)' }
    ],
    pendekatan: [
      { value: 'kuantitatif', label: 'Kuantitatif (angka, uji statistik)' },
      { value: 'kualitatif',  label: 'Kualitatif (naratif, makna, kasus)' }
    ],
    tujuanRiset: [
      { value: 'pengaruh',     label: 'Menguji pengaruh/hubungan antar-variabel' },
      { value: 'perbandingan', label: 'Membandingkan dua kelompok/kondisi' },
      { value: 'deskripsi',    label: 'Mendeskripsikan suatu keadaan/fenomena' },
      { value: 'eksplorasi',   label: 'Mengeksplorasi fenomena secara mendalam' },
      { value: 'pengembangan', label: 'Mengembangkan produk/model (R&D)' }
    ],
    jenisData: [
      { value: 'numerik',  label: 'Numerik (angka/skala)' },
      { value: 'teks',     label: 'Teks (wawancara/dokumen)' },
      { value: 'campuran', label: 'Campuran (numerik + teks)' }
    ],
    citationStyles: [
      { value: 'apa7',      label: 'APA 7th' },
      { value: 'ieee',      label: 'IEEE' },
      { value: 'harvard',   label: 'Harvard' },
      { value: 'vancouver', label: 'Vancouver' }
    ]
  };

  /* ---- small text helpers shared by the wizard -------------------------- */
  function splitVars(s) {
    s = trim(s);
    if (!s) return [];
    var parts = s.split(/\s*,\s*|\s+dan\s+|\s+serta\s+/i);
    var out = [];
    for (var i = 0; i < parts.length; i++) { var p = trim(parts[i]); if (p) out.push(p); }
    return out;
  }
  // join non-empty word segments with single spaces (graceful slot omission)
  function joinSeg() {
    var o = [];
    for (var i = 0; i < arguments.length; i++) { var a = trim(arguments[i]); if (a) o.push(a); }
    return o.join(' ').replace(/\s+/g, ' ');
  }
  function asList(v) { return isArray(v) ? v : (trim(v) ? splitVars(v) : []); }
  function uniq(arr) {
    var seen = {}, out = [];
    for (var i = 0; i < arr.length; i++) {
      var v = trim(arr[i]); if (!v) continue;
      var k = v.toLowerCase(); if (seen[k]) continue; seen[k] = 1; out.push(v);
    }
    return out;
  }
  // "pada {objek} di {lokasi}" tail, omitting empty slots.
  function ctxTail(objek, lokasi) {
    objek = trim(objek); lokasi = trim(lokasi);
    if (objek) return ' pada ' + objek + (lokasi ? ' di ' + lokasi : '');
    if (lokasi) return ' di ' + lokasi;
    return '';
  }

  /* ---- 2) suggestTitles: pure recombination of the student's words ------ */
  function suggestTitles(inp) {
    inp = inp || {};
    var X = asList(inp.x).join(' dan ');
    var Y = asList(inp.y).join(' dan ');
    var objek = trim(inp.objek), lokasi = trim(inp.lokasi);
    var tuj = trim(inp.tujuanRiset || inp.tujuan || '').toLowerCase();
    var pOb = objek ? 'pada ' + objek : '';
    var pLo = lokasi ? 'di ' + lokasi : '';
    var out = [];
    function add(title, pattern) {
      title = trim(title).replace(/\s+/g, ' ');
      if (title) out.push({ title: title, pattern: pattern });
    }
    if (tuj === 'perbandingan') {
      add(joinSeg('Perbandingan', X, Y ? 'dan ' + Y : '', pOb, pLo),
        'Perbandingan {X} dan {Y} pada {objek} di {lokasi}');
      add(joinSeg('Analisis Perbandingan', X, pOb, pLo),
        'Analisis Perbandingan {X} pada {objek} di {lokasi}');
      add(joinSeg('Studi Komparatif', X, Y ? 'dan ' + Y : '', pOb),
        'Studi Komparatif {X} dan {Y} pada {objek}');
    } else if (tuj === 'deskripsi') {
      add(joinSeg('Analisis', X, pOb, pLo), 'Analisis {X} pada {objek} di {lokasi}');
      add(joinSeg('Gambaran', X, pOb, pLo), 'Gambaran {X} pada {objek} di {lokasi}');
      add(joinSeg('Deskripsi', X, pOb), 'Deskripsi {X} pada {objek}');
    } else if (tuj === 'eksplorasi') {
      add(joinSeg('Eksplorasi', X, pOb, pLo), 'Eksplorasi {X} pada {objek} di {lokasi}');
      add(joinSeg('Studi Kasus', X, pOb, pLo), 'Studi Kasus {X} pada {objek} di {lokasi}');
      add(joinSeg('Kajian Mendalam mengenai', X, pOb), 'Kajian Mendalam {X} pada {objek}');
    } else if (tuj === 'pengembangan') {
      add(joinSeg('Pengembangan', X, Y ? 'untuk ' + Y : '', pOb),
        'Pengembangan {X} untuk {Y} pada {objek}');
      add(joinSeg('Perancangan', X, pOb, pLo), 'Perancangan {X} pada {objek} di {lokasi}');
      add(joinSeg('Rancang Bangun', X, Y ? 'untuk ' + Y : '', pOb),
        'Rancang Bangun {X} untuk {Y} pada {objek}');
    } else { // default: pengaruh
      add(joinSeg('Pengaruh', X, Y ? 'terhadap ' + Y : '', pOb, pLo),
        'Pengaruh {X} terhadap {Y} pada {objek} di {lokasi}');
      add(joinSeg('Analisis Pengaruh', X, Y ? 'terhadap ' + Y : '', pOb),
        'Analisis Pengaruh {X} terhadap {Y} pada {objek}');
      add(joinSeg('Pengaruh', X, Y ? 'terhadap ' + Y : '',
        objek ? '(Studi ' + ('pada ' + objek + (lokasi ? ' di ' + lokasi : '')) + ')' : ''),
        'Pengaruh {X} terhadap {Y} (Studi pada {objek} di {lokasi})');
    }
    // dedupe by title, cap 6
    var seen = {}, res = [];
    for (var i = 0; i < out.length; i++) {
      var key = out[i].title.toLowerCase();
      if (seen[key]) continue; seen[key] = 1; res.push(out[i]);
    }
    return res.slice(0, 6);
  }

  /* ---- 3) deriveFromTitle: heuristic Indonesian parse -> RQ/OBJ/etc ----- */
  function deriveFromTitle(title, inp) {
    inp = inp || {};
    var t = trim(title);
    var objek = trim(inp.objek), lokasi = trim(inp.lokasi);
    var work = t, m;

    // Peel off " di {lokasi}" then " pada {objek}" from the tail.
    m = work.match(/\s+di\s+(.+)$/i);
    if (m) { if (!lokasi) lokasi = trim(m[1]); work = trim(work.slice(0, m.index)); }
    m = work.match(/\s+pada\s+(.+)$/i);
    if (m) { if (!objek) objek = trim(m[1]); work = trim(work.slice(0, m.index)); }

    var x = [], y = [], type = 'deskripsi', rel = false;
    if ((m = work.match(/pengaruh\s+(.+?)\s+terhadap\s+(.+)$/i))) {
      x = splitVars(m[1]); y = splitVars(m[2]); type = 'pengaruh'; rel = true;
    } else if ((m = work.match(/hubungan\s+(?:antara\s+)?(.+?)\s+(?:dengan|dan)\s+(.+)$/i))) {
      x = splitVars(m[1]); y = splitVars(m[2]); type = 'hubungan'; rel = true;
    } else if ((m = work.match(/(?:perbandingan|komparatif|komparasi)\s+(.+?)(?:\s+(?:dan|dengan)\s+(.+))?$/i))) {
      x = splitVars(m[1]); if (m[2]) x = x.concat(splitVars(m[2])); type = 'perbandingan';
    } else if ((m = work.match(/(?:pengembangan|perancangan|rancang\s+bangun)\s+(.+?)(?:\s+untuk\s+(.+))?$/i))) {
      x = splitVars(m[1]); if (m[2]) y = splitVars(m[2]); type = 'pengembangan';
    } else {
      var core = work.replace(/^(analisis|gambaran|deskripsi|studi(?:\s+kasus)?|kajian|eksplorasi|penerapan|implementasi|efektivitas|evaluasi)\s+/i, '');
      x = splitVars(core);
      type = /eksplor|studi\s+kasus|kajian\s+mendalam/i.test(work) ? 'eksplorasi' : 'deskripsi';
    }
    // Explicit user variables override the parse.
    if (inp.x != null && trim(asList(inp.x).join(''))) x = asList(inp.x);
    if (inp.y != null && trim(asList(inp.y).join(''))) y = asList(inp.y);
    x = uniq(x); y = uniq(y);

    // Approach: honor explicit choice, else infer from research goal.
    var approach = trim(inp.pendekatan || inp.approach || '').toLowerCase();
    if (approach !== 'kuantitatif' && approach !== 'kualitatif') {
      approach = (type === 'pengaruh' || type === 'hubungan' || type === 'perbandingan')
        ? 'kuantitatif' : 'kualitatif';
    }

    var design;
    if (type === 'pengaruh' || type === 'hubungan') design = 'Kuantitatif asosiatif/korelasional';
    else if (type === 'perbandingan') design = 'Kuantitatif komparatif';
    else if (type === 'pengembangan') design = 'Penelitian dan Pengembangan (R&D)';
    else if (type === 'eksplorasi') design = 'Kualitatif eksploratif (studi kasus)';
    else design = (approach === 'kuantitatif') ? 'Kuantitatif deskriptif' : 'Kualitatif deskriptif';

    var ctx = ctxTail(objek, lokasi);
    var xStr = x.join(', ');
    var yStr = y.join(' dan ');
    var keywords = uniq([].concat(x, y, objek ? [objek] : [], inp.bidang ? [inp.bidang] : []));

    var questions = [], objectives = [];
    function addQO(qText, oText, qid) {
      var q = { id: qid || uid('rq'), text: qText };
      var o = { id: uid('obj'), text: oText, questionId: q.id };
      questions.push(q); objectives.push(o);
    }

    var yTarget = yStr || ph('variabel terikat');
    if (type === 'pengaruh' || type === 'hubungan') {
      var verb = (type === 'hubungan') ? 'berhubungan dengan' : 'berpengaruh terhadap';
      var averb = (type === 'hubungan') ? 'hubungan' : 'pengaruh';
      // descriptive rumusan for each variable first (Indonesian thesis convention)
      for (var dq = 0; dq < (x.length || 1); dq++) {
        var dxq = x[dq] || ph('variabel bebas');
        addQO('Bagaimana gambaran ' + dxq + ctx + '?', 'Untuk mendeskripsikan ' + dxq + ctx + '.');
      }
      addQO('Bagaimana gambaran ' + yTarget + ctx + '?', 'Untuk mendeskripsikan ' + yTarget + ctx + '.');
      for (var i = 0; i < (x.length || 1); i++) {
        var xi = x[i] || ph('variabel bebas');
        addQO(
          'Apakah ' + xi + ' ' + verb + ' ' + yTarget + ctx + '?',
          'Untuk menguji dan menganalisis ' + averb + ' ' + xi + ' terhadap ' + yTarget + ctx + '.'
        );
      }
      if (x.length > 1) {
        addQO(
          'Apakah ' + xStr + ' secara simultan ' + verb + ' ' + yTarget + ctx + '?',
          'Untuk menguji ' + averb + ' ' + xStr + ' secara simultan terhadap ' + yTarget + ctx + '.'
        );
      }
    } else if (type === 'perbandingan') {
      addQO(
        'Apakah terdapat perbedaan ' + (xStr || ph('variabel')) + ' antar kelompok yang dibandingkan' + ctx + '?',
        'Untuk menganalisis perbedaan ' + (xStr || ph('variabel')) + ' antar kelompok yang dibandingkan' + ctx + '.'
      );
    } else if (type === 'pengembangan') {
      addQO(
        'Bagaimana mengembangkan ' + (xStr || ph('produk/model')) + (yStr ? ' untuk ' + yStr : '') + ctx + '?',
        'Untuk mengembangkan ' + (xStr || ph('produk/model')) + (yStr ? ' untuk ' + yStr : '') + ctx + '.'
      );
      addQO(
        'Bagaimana kelayakan ' + (xStr || ph('produk/model')) + ' yang dikembangkan' + ctx + '?',
        'Untuk menguji kelayakan ' + (xStr || ph('produk/model')) + ' yang dikembangkan' + ctx + '.'
      );
    } else { // deskripsi / eksplorasi
      var q1v = (type === 'eksplorasi') ? 'Bagaimana ' : 'Bagaimana gambaran ';
      for (var k = 0; k < (x.length || 1); k++) {
        var xk = x[k] || ph('fokus penelitian');
        addQO(
          q1v + xk + ctx + '?',
          'Untuk mendeskripsikan ' + xk + ctx + '.'
        );
      }
      if (type === 'eksplorasi') {
        addQO(
          'Faktor-faktor apa yang memengaruhi ' + (xStr || ph('fokus penelitian')) + ctx + '?',
          'Untuk mengeksplorasi faktor-faktor yang memengaruhi ' + (xStr || ph('fokus penelitian')) + ctx + '.'
        );
      }
    }

    // ensure >= 3 rumusan masalah (Indonesian thesis convention)
    var qFocus = xStr || objek || ph('fokus penelitian');
    var qTarget = yStr || objek || ph('objek penelitian');
    var topUps = [
      ['Faktor-faktor apa saja yang memengaruhi ' + qFocus + ctx + '?',
       'Untuk mengidentifikasi faktor-faktor yang memengaruhi ' + qFocus + ctx + '.'],
      ['Bagaimana upaya yang dapat dilakukan untuk mengoptimalkan ' + qFocus + ctx + '?',
       'Untuk merumuskan upaya optimalisasi ' + qFocus + ctx + '.'],
      ['Bagaimana implikasi ' + qFocus + ' terhadap ' + qTarget + ctx + '?',
       'Untuk menganalisis implikasi ' + qFocus + ' terhadap ' + qTarget + ctx + '.']
    ];
    for (var tu = 0; tu < topUps.length && questions.length < 3; tu++) {
      addQO(topUps[tu][0], topUps[tu][1]);
    }

    var hypotheses = [];
    if (approach === 'kuantitatif' && rel) {
      for (var h = 0; h < (x.length || 1); h++) {
        var xh = x[h] || ph('variabel bebas');
        hypotheses.push({
          id: uid('hyp'),
          text: 'Terdapat pengaruh yang signifikan antara ' + xh + ' terhadap ' + yTarget + ctx + '.'
        });
      }
      if (x.length > 1) {
        hypotheses.push({
          id: uid('hyp'),
          text: 'Terdapat pengaruh yang signifikan antara ' + xStr + ' secara simultan terhadap ' + yTarget + ctx + '.'
        });
      }
    }

    var topik = uniq([].concat(x, y)).join(' dan ') || ph('topik penelitian');
    var bidang = trim(inp.bidang) || ph('bidang keilmuan');
    var benefits = {
      teoritis: [
        'Hasil penelitian ini diharapkan dapat memperkaya khazanah keilmuan ' + bidang +
          ', khususnya kajian mengenai ' + topik + '.',
        'Penelitian ini dapat menjadi rujukan dan bahan pembanding bagi penelitian selanjutnya yang berkaitan dengan ' + topik + '.'
      ],
      praktis: [
        'Bagi ' + (objek || ph('objek penelitian')) + ', hasil penelitian ini diharapkan menjadi bahan pertimbangan dalam ' +
          ph('pengambilan keputusan/kebijakan terkait') + '.',
        'Bagi peneliti, penelitian ini menjadi sarana penerapan ilmu yang diperoleh selama perkuliahan.',
        'Bagi pembaca, penelitian ini diharapkan menambah wawasan mengenai ' + topik + '.'
      ]
    };

    return {
      variables: { x: x, y: y },
      keywords: keywords,
      approach: approach,
      design: design,
      type: type,
      objek: objek,
      lokasi: lokasi,
      questions: questions,
      objectives: objectives,
      hypotheses: hypotheses,
      benefits: benefits
    };
  }

  /* ---- 4) scaffoldProposal: full S1 proposal chapters (templated) ------- */
  function methodApproach(st) {
    var fam = trim((st && st.method && st.method.family) || '').toLowerCase();
    if (fam.indexOf('quant') >= 0 || fam === 'kuantitatif' || fam.indexOf('mixed') >= 0) return 'kuantitatif';
    if (fam.indexOf('qual') >= 0 || fam === 'kualitatif') return 'kualitatif';
    return '';
  }
  function numList(arr) {
    var o = [];
    for (var i = 0; i < arr.length; i++) o.push((i + 1) + '. ' + arr[i]);
    return o.join('\n');
  }
  function textsOf(arr) {
    var o = [];
    for (var i = 0; i < (arr || []).length; i++) o.push(arr[i].text);
    return o;
  }
  function refShort(ref) {
    var fam = (ref.authors && ref.authors.length) ? authFamily(ref.authors[0]) : (ref.venue || 'Anonim');
    if (ref.authors && ref.authors.length > 1) fam += ' dkk.';
    var yr = (ref.year != null && ref.year !== '') ? ref.year : ph('tahun');
    return fam + ' (' + yr + '). ' + (trim(ref.title) || ph('judul'));
  }

  function scaffoldProposal(project) {
    project = project || {};
    var st = project.state || {};
    var title = trim(project.title || st.topic || '');

    var der = deriveFromTitle(title, {
      objek: project.researchObject || '',
      lokasi: project.location || '',
      pendekatan: methodApproach(st) || trim(project.methodPref || ''),
      bidang: project.program || project.concentration || project.researchInterest || ''
    });

    var approach = methodApproach(st) || der.approach;
    var method = st.method || {};
    var refs = isArray(st.references) ? st.references : [];

    // Prefer content the student already produced; else use derived defaults.
    var questions = (st.questions && st.questions.length) ? st.questions : der.questions;
    var objectives = (st.objectives && st.objectives.length) ? st.objectives : der.objectives;
    var hypotheses = (st.hypotheses && st.hypotheses.length) ? st.hypotheses : der.hypotheses;

    var xs = der.variables.x, ys = der.variables.y;
    var allVars = uniq([].concat(xs, ys));
    if (!allVars.length) allVars = [ph('konstruk/variabel utama')];

    var objek = der.objek || trim(project.researchObject);
    var lokasi = der.lokasi || trim(project.location);
    var ctx = ctxTail(objek, lokasi);
    var xStr = xs.join(', ') || ph('variabel bebas');
    var yStr = ys.join(', ') || ph('variabel terikat');
    var topik = uniq([].concat(xs, ys)).join(' dan ') || ph('topik penelitian');
    var bidang = trim(project.researchInterest || project.program || '') || ph('bidang keilmuan');

    var qTexts = textsOf(questions);
    var oTexts = textsOf(objectives);
    var hTexts = textsOf(hypotheses);

    // -------- BAB I --------------------------------------------------------
    var latar = '';
    latar += 'Kajian mengenai ' + topik + ' menempati posisi penting dalam bidang ' + bidang +
      ' dewasa ini. Secara umum, ' + xStr + ' diyakini memiliki peran strategis terhadap ' +
      (ys.length ? yStr : ph('luaran yang diharapkan')) + '.\n\n';
    latar += 'Namun demikian, kondisi di lapangan menunjukkan ' +
      ph('uraikan fenomena/data aktual terkait masalah + sumber (mis. laporan resmi, berita, data lembaga)') +
      '. Kondisi tersebut mengindikasikan adanya kesenjangan antara harapan dan kenyataan' + ctx + '.\n\n';
    latar += 'Masalah utama yang menjadi fokus penelitian ini adalah ' +
      ph('rumusan masalah inti disertai data pendukung') + '. Apabila dibiarkan, hal ini berpotensi menimbulkan ' +
      ph('dampak/akibat yang mungkin terjadi') + '.\n\n';
    latar += 'Beberapa penelitian terdahulu telah mengkaji tema serupa, antara lain ' +
      ph('sebutkan penelitian terdahulu + temuannya + sumber dari perpustakaan referensi') +
      '. Meskipun demikian, masih terdapat celah penelitian (research gap), yaitu ' +
      ph('jelaskan perbedaan/kesenjangan dengan penelitian ini') + '.\n\n';
    latar += 'Berdasarkan uraian tersebut, penelitian berjudul “' + (title || ph('judul penelitian')) +
      '” penting untuk dilakukan guna ' +
      (oTexts.length ? oTexts[0].replace(/^Untuk\s+/i, '').replace(/\.$/, '') : ph('mencapai tujuan penelitian')) + '.';

    var identifikasi = 'Berdasarkan latar belakang di atas, dapat diidentifikasi beberapa masalah, antara lain: ' +
      '(1) ' + ph('masalah pertama + data pendukung') + '; ' +
      '(2) ' + ph('masalah kedua') + '; ' +
      '(3) ' + ph('masalah ketiga') + '. ' +
      'Masalah-masalah tersebut perlu dikaji lebih lanjut terkait ' + topik + ctx + '.';

    var batasan = 'Agar penelitian lebih terarah dan mendalam, ruang lingkup dibatasi pada kajian ' + topik + ctx +
      '. Penelitian ini berfokus pada ' + (objek || ph('objek penelitian')) +
      ' dan tidak membahas ' + ph('aspek/variabel lain yang berada di luar fokus penelitian') + '.';

    var rumusan = qTexts.length
      ? 'Berdasarkan latar belakang di atas, rumusan masalah dalam penelitian ini adalah sebagai berikut:\n\n' + numList(qTexts)
      : 'Rumusan masalah penelitian: ' + ph('susun rumusan masalah dalam bentuk pertanyaan penelitian') + '.';

    var tujuan = oTexts.length
      ? 'Sejalan dengan rumusan masalah, tujuan penelitian ini adalah sebagai berikut:\n\n' + numList(oTexts)
      : 'Tujuan penelitian: ' + ph('rumuskan tujuan penelitian sesuai rumusan masalah') + '.';

    var manfaat = '### Manfaat Teoritis\n' + numList(der.benefits.teoritis) +
      '\n\n### Manfaat Praktis\n' + numList(der.benefits.praktis);

    var sistematika =
      'Untuk memberikan gambaran menyeluruh, penulisan proposal ini disusun dengan sistematika sebagai berikut:\n\n' +
      'BAB I PENDAHULUAN, memuat latar belakang, identifikasi masalah, batasan masalah, rumusan masalah, tujuan penelitian, manfaat penelitian, dan sistematika penulisan.\n' +
      'BAB II TINJAUAN PUSTAKA, memuat landasan teori, penelitian terdahulu, kerangka berpikir, dan hipotesis.\n' +
      'BAB III METODE PENELITIAN, memuat jenis dan pendekatan penelitian, lokasi dan waktu, populasi dan sampel, definisi operasional variabel, teknik pengumpulan data, instrumen penelitian, uji validitas dan reliabilitas, serta teknik analisis data.\n' +
      'DAFTAR PUSTAKA, memuat seluruh sumber rujukan yang digunakan.';

    // -------- BAB II -------------------------------------------------------
    var landasan = 'Bab ini menyajikan landasan teori yang menjadi dasar penelitian. Setiap konsep berikut perlu dilengkapi definisi dari ahli beserta sitasi dari perpustakaan referensi.\n\n';
    for (var v = 0; v < allVars.length; v++) {
      var vv = allVars[v];
      landasan += '### ' + vv + '\n';
      landasan += vv + ' dalam penelitian ini dipahami sebagai ' +
        ph('lengkapi definisi ' + vv + ' menurut ahli + sitasi dari perpustakaan') +
        '. Konsep ini diukur/ditinjau melalui dimensi dan indikator ' +
        ph('sebutkan dimensi/indikator + sumber') + '.\n\n';
    }
    landasan += '*Catatan: sisipkan sitasi dari perpustakaan referensi pada setiap sub-bab teori di atas.*';

    var terdahulu = 'Penelitian terdahulu digunakan sebagai pembanding dan penunjuk posisi (state of the art) penelitian ini. ' +
      'Rangkum minimal ' + ph('3–5') + ' penelitian relevan dalam bentuk tabel dengan kolom: No, Nama & Tahun, Judul, Metode, Hasil, dan Perbedaan dengan penelitian ini.\n\n';
    if (refs.length) {
      var lim = Math.min(refs.length, 5);
      for (var rr = 0; rr < lim; rr++) {
        terdahulu += (rr + 1) + '. ' + refShort(refs[rr]) +
          ' [Metode: ' + ph('isi') + '; Hasil: ' + ph('isi') + '; Perbedaan: ' + ph('isi') + ']\n';
      }
    } else {
      terdahulu += ph('lengkapi dengan penelitian terdahulu dari perpustakaan referensi (gunakan Auto-Search)') + '\n';
    }

    var kerangka;
    if (approach === 'kuantitatif' && ys.length) {
      kerangka = 'Kerangka berpikir menggambarkan keterkaitan antar variabel. Variabel bebas dalam penelitian ini adalah ' +
        xStr + ', sedangkan variabel terikatnya adalah ' + yStr + '. Secara skematis, ' + xStr +
        ' diduga memengaruhi ' + yStr + ctx + '. ' + ph('sisipkan diagram/bagan kerangka berpikir (X → Y)') + '.';
    } else {
      kerangka = 'Kerangka berpikir menggambarkan alur pemikiran penelitian mengenai ' + topik + ctx +
        '. ' + ph('uraikan alur berpikir dan sisipkan bagan kerangka konseptual') + '.';
    }

    var hipotesis;
    if (hTexts.length) {
      hipotesis = 'Berdasarkan kerangka berpikir dan kajian teori, hipotesis penelitian dirumuskan sebagai berikut:\n\n' +
        numList(hTexts);
    } else {
      hipotesis = 'Penelitian ini menggunakan pendekatan ' + approach +
        ' sehingga tidak merumuskan hipotesis statistik. ' +
        ph('jika diperlukan, susun proposisi atau dugaan sementara') + '.';
    }

    // -------- BAB III ------------------------------------------------------
    var jenis = 'Penelitian ini menggunakan pendekatan ' + approach + ' dengan jenis ' + der.design + '. ' +
      (trim(method.design) ? 'Desain penelitian yang digunakan adalah ' + method.design + '. ' : '') +
      'Pemilihan pendekatan ini didasarkan pada tujuan penelitian, yaitu ' +
      (oTexts.length ? oTexts[0].replace(/^Untuk\s+/i, '').replace(/\.$/, '') : ph('tujuan penelitian')) + '.';

    var lokasiWaktu = 'Penelitian ini dilaksanakan di ' + (lokasi || objek || ph('lokasi penelitian')) +
      '. Adapun waktu penelitian direncanakan berlangsung dari ' + ph('bulan/tahun mulai') +
      ' sampai dengan ' + ph('bulan/tahun selesai') + '.';

    var populasi;
    if (approach === 'kuantitatif') {
      populasi = 'Populasi dalam penelitian ini adalah ' + (objek || ph('populasi')) + ' yang berjumlah ' +
        ph('jumlah populasi + sumber data') + '. Teknik pengambilan sampel menggunakan ' +
        ph('sebutkan teknik sampling, mis. simple random / purposive sampling') +
        '. Ukuran sampel ditentukan menggunakan ' + ph('rumus penentuan sampel, mis. Slovin / Krejcie-Morgan') +
        ' sehingga diperoleh ' + ph('jumlah sampel') + ' responden.';
    } else {
      populasi = 'Subjek/informan penelitian dipilih menggunakan teknik ' +
        ph('purposive sampling / snowball sampling') + '. Informan terdiri atas ' +
        ph('sebutkan informan kunci beserta kriterianya') +
        '. Jumlah informan disesuaikan dengan ' + ph('prinsip kecukupan/saturasi data') + '.';
    }

    var defOp = 'Definisi operasional menjelaskan variabel penelitian secara terukur agar dapat diamati dan diukur.\n\n';
    for (var d = 0; d < allVars.length; d++) {
      var dv = allVars[d];
      defOp += '### ' + dv + '\n';
      defOp += dv + ' didefinisikan secara operasional sebagai ' + ph('definisi operasional ' + dv) +
        ', dan diukur melalui indikator ' + ph('sebutkan indikator + skala pengukuran') + '.\n\n';
    }

    var pengumpulan;
    if (approach === 'kuantitatif') {
      pengumpulan = 'Data primer dikumpulkan melalui penyebaran ' + ph('kuesioner/angket') +
        ' dengan skala ' + ph('mis. Likert 1–5') + '. Data sekunder diperoleh dari ' +
        ph('dokumen/laporan/sumber data') + '.';
    } else {
      pengumpulan = 'Data dikumpulkan melalui wawancara mendalam, observasi, dan dokumentasi terhadap ' +
        (objek || ph('subjek penelitian')) + '. ' + ph('rincikan prosedur pengumpulan data untuk tiap teknik') + '.';
    }

    var instrumen = 'Instrumen utama dalam penelitian ini adalah ' +
      (approach === 'kuantitatif'
        ? 'kuesioner yang disusun berdasarkan indikator setiap variabel'
        : 'peneliti sendiri sebagai instrumen kunci, dibantu pedoman wawancara dan lembar observasi') +
      '. Kisi-kisi instrumen ' + ph('lampirkan kisi-kisi instrumen penelitian') + '.';

    var validitas;
    if (approach === 'kuantitatif') {
      validitas = 'Instrumen diuji validitasnya menggunakan ' + ph('mis. korelasi Pearson / analisis faktor') +
        ' dan reliabilitasnya menggunakan ' + ph('mis. Cronbach’s Alpha') +
        '. Instrumen dinyatakan layak apabila memenuhi kriteria ' + ph('sebutkan nilai ambang batas') + '.';
    } else {
      validitas = 'Keabsahan data diuji melalui triangulasi ' + ph('sumber/teknik/waktu') +
        ', member checking, serta ' + ph('teknik pemeriksaan keabsahan lainnya') + '.';
    }

    var analisis;
    if (approach === 'kuantitatif') {
      analisis = 'Data dianalisis menggunakan ' + (trim(method.design) ? method.design : 'analisis statistik yang sesuai') +
        '. Tahapan analisis meliputi uji asumsi klasik (' +
        ph('normalitas, multikolinearitas, heteroskedastisitas') + '), ' +
        (hTexts.length ? 'analisis regresi untuk menguji hipotesis, ' : '') +
        'serta uji ' + ph('t / F dan koefisien determinasi') + ' dengan bantuan perangkat ' +
        ph('mis. SPSS / SmartPLS') + '.';
    } else {
      analisis = 'Data dianalisis menggunakan model interaktif ' + ph('mis. Miles & Huberman') +
        ' yang meliputi tahap reduksi data, penyajian data, dan penarikan kesimpulan/verifikasi.';
    }

    function S(title, content) { return { title: title, content: content, citationIds: [] }; }

    return [
      { code: 'BAB I', title: 'Pendahuluan', sections: [
        S('Latar Belakang Masalah', latar),
        S('Identifikasi Masalah', identifikasi),
        S('Batasan Masalah', batasan),
        S('Rumusan Masalah', rumusan),
        S('Tujuan Penelitian', tujuan),
        S('Manfaat Penelitian', manfaat),
        S('Sistematika Penulisan', sistematika)
      ] },
      { code: 'BAB II', title: 'Tinjauan Pustaka', sections: [
        S('Landasan Teori', landasan),
        S('Penelitian Terdahulu', terdahulu),
        S('Kerangka Berpikir', kerangka),
        S('Hipotesis', hipotesis)
      ] },
      { code: 'BAB III', title: 'Metode Penelitian', sections: (approach === 'kuantitatif') ? [
        S('Jenis dan Pendekatan Penelitian', jenis),
        S('Lokasi dan Waktu Penelitian', lokasiWaktu),
        S('Populasi dan Sampel', populasi),
        S('Definisi Operasional Variabel', defOp),
        S('Teknik Pengumpulan Data', pengumpulan),
        S('Instrumen Penelitian', instrumen),
        S('Uji Validitas dan Reliabilitas', validitas),
        S('Teknik Analisis Data', analisis)
      ] : [
        S('Jenis dan Pendekatan Penelitian', jenis),
        S('Lokasi dan Waktu Penelitian', lokasiWaktu),
        S('Sumber Data dan Subjek Penelitian', populasi),
        S('Teknik Pengumpulan Data', pengumpulan),
        S('Instrumen Penelitian', instrumen),
        S('Keabsahan Data', validitas),
        S('Teknik Analisis Data', analisis)
      ] },
      { code: 'DAFTAR PUSTAKA', title: 'Daftar Pustaka', sections: [] }
    ];
  }

  /* ---- 5) autoSearch: merge OpenAlex + Crossref, rank, annotate --------- */
  function typeLabelOf(t) {
    t = trim(t).toLowerCase();
    if (/book-chapter|chapter|bab/.test(t)) return 'Bab Buku';
    if (/book|monograph|buku/.test(t)) return 'Buku';
    if (/proceed|conference|prosiding/.test(t)) return 'Prosiding';
    if (/thesis|dissertation|disertasi|tesis/.test(t)) return 'Tesis/Disertasi';
    if (/report|laporan/.test(t)) return 'Laporan';
    if (/journal|article|artikel|paper/.test(t) || t === '') return 'Artikel Jurnal';
    return 'Publikasi';
  }

  function autoSearch(project, opts) {
    opts = opts || {};
    var limit = opts.limit || 12;
    var st = (project && project.state) || {};
    var kws = isArray(opts.keywords) ? opts.keywords
            : (isArray(st.keywords) ? st.keywords : []);
    var base = trim(opts.query || (project && project.title) || st.topic || '');
    var query = trim(base + ' ' + (kws.join(' ')));
    var perPage = Math.max(limit, 10);

    // Reflect each provider promise so one failing never rejects the whole run.
    function safe(p) {
      return p.then(function (v) { return isArray(v) ? v : []; },
                    function () { return []; });
    }
    var pOA, pCR;
    try { pOA = safe(searchOpenAlex(query, { perPage: perPage })); }
    catch (e) { pOA = Promise.resolve([]); }
    try { pCR = safe(searchCrossref(query, { rows: perPage })); }
    catch (e2) { pCR = Promise.resolve([]); }

    var qToks = query.toLowerCase().split(/\s+/);
    var yearNow = new Date().getFullYear();

    return Promise.all([pOA, pCR]).then(function (rs) {
      var merged = rs[0].concat(rs[1]);
      // dedupe reusing the existing DOI/OpenAlexId/title logic
      var kept = [];
      for (var i = 0; i < merged.length; i++) {
        if (findDuplicate(kept, merged[i])) continue;
        kept.push(merged[i]);
      }
      // annotate + score (relevance x2, recency, light citation weight)
      for (var j = 0; j < kept.length; j++) {
        var r = kept[j];
        r.pdfUrl = (r.oaUrl || '') || (r.openAccess && r.url ? r.url : '');
        r.typeLabel = typeLabelOf(r.type);
        var title = (r.title || '').toLowerCase(), rel = 0;
        for (var t = 0; t < qToks.length; t++) {
          if (qToks[t].length > 2 && title.indexOf(qToks[t]) >= 0) rel++;
        }
        var rec = (typeof r.year === 'number') ? Math.max(0, 1 - (yearNow - r.year) / 50) : 0;
        var cit = (typeof r.citationCount === 'number') ? Math.min(1, r.citationCount / 500) : 0;
        r._score = rel * 2 + rec + cit * 0.5;
      }
      kept.sort(function (a, b) { return (b._score || 0) - (a._score || 0); });
      return kept.slice(0, limit);
    })['catch'](function () { return []; }); // never fabricate on total failure
  }

  /* ---- 6) buildProposalHTML: complete printable document body ----------- */
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function inlineFmt(s) {
    // turn 〔…〕 into a visible placeholder chip and *italic* into <em>
    s = s.replace(/〔([^〕]*)〕/g, '<span class="ph">〔$1〕</span>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return s;
  }
  function renderContentHTML(text) {
    var lines = String(text || '').split(/\n/), h = '';
    for (var i = 0; i < lines.length; i++) {
      var raw = trim(lines[i]);
      if (!raw) continue;
      if (/^###\s+/.test(raw)) h += '<h4>' + inlineFmt(escHtml(raw.replace(/^###\s+/, ''))) + '</h4>';
      else h += '<p>' + inlineFmt(escHtml(raw)) + '</p>';
    }
    return h;
  }
  function romanOf(code) {
    var m = String(code || '').match(/BAB\s+([IVXLC]+)/i);
    if (!m) return 0;
    var map = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8 };
    return map[m[1].toUpperCase()] || 0;
  }

  function buildProposalHTML(project, style) {
    project = project || {};
    var st = project.state || {};
    style = (style || project.citationStyle || 'apa7');

    var chapters = (st.chapters && st.chapters.length &&
                    hasNonEmptyContent(st.chapters)) ? st.chapters : scaffoldProposal(project);

    function orDash(s) {
      s = trim(s);
      return s ? escHtml(s) : '<span class="ph">〔—〕</span>';
    }
    var title = trim(project.title || st.topic || '');
    var tahun = trim(project.academicYear || '') || String(new Date().getFullYear());

    /* ---- cover ---- */
    var cover =
      '<section class="page cover">' +
        '<p class="cover-kind">PROPOSAL ' + escHtml((project.type || 'SKRIPSI').toUpperCase()) + '</p>' +
        '<h1 class="cover-title">' + (title ? escHtml(title.toUpperCase()) : '<span class="ph">〔JUDUL PENELITIAN〕</span>') + '</h1>' +
        '<p class="cover-sub">Diajukan untuk memenuhi salah satu syarat memperoleh gelar ' +
          orDash(project.degree || 'Sarjana') + '</p>' +
        '<div class="cover-logo">〔logo〕</div>' +
        '<div class="cover-author">' +
          '<p><strong>Oleh:</strong></p>' +
          '<p>' + orDash(project.studentName || project.author || project.name) + '</p>' +
          '<p>NIM: ' + orDash(project.nim) + '</p>' +
        '</div>' +
        '<div class="cover-inst">' +
          '<p>' + orDash(project.program) + '</p>' +
          '<p>' + orDash(project.faculty) + '</p>' +
          '<p>' + orDash(project.university) + '</p>' +
          '<p>' + orDash(project.city) + '</p>' +
          '<p>' + escHtml(tahun) + '</p>' +
        '</div>' +
      '</section>';

    /* ---- kata pengantar ---- */
    var kata =
      '<section class="page">' +
        '<h2 class="ctr">KATA PENGANTAR</h2>' +
        '<p>Puji syukur penulis panjatkan ke hadirat Tuhan Yang Maha Esa atas segala rahmat dan karunia-Nya sehingga proposal penelitian yang berjudul “' +
          (title ? escHtml(title) : '<span class="ph">〔judul〕</span>') +
          '” ini dapat diselesaikan.</p>' +
        '<p>Penulis menyadari bahwa penyusunan proposal ini tidak lepas dari bantuan berbagai pihak. Oleh karena itu, penulis menyampaikan terima kasih kepada ' +
          '<span class="ph">〔sebutkan pihak: dosen pembimbing, keluarga, dan pihak terkait〕</span>.</p>' +
        '<p>Penulis menyadari proposal ini masih jauh dari sempurna. Kritik dan saran yang membangun sangat diharapkan demi perbaikan penelitian selanjutnya.</p>' +
        '<p class="right">' + orDash(project.city) + ', ' + escHtml(tahun) + '<br>Penulis</p>' +
      '</section>';

    /* ---- daftar isi ---- */
    var toc = '<section class="page"><h2 class="ctr">DAFTAR ISI</h2><div class="toc">';
    for (var c = 0; c < chapters.length; c++) {
      var ch = chapters[c];
      var n = romanOf(ch.code);
      var chLabel = (ch.code || '') + (ch.title ? '  ' + ch.title.toUpperCase() : '');
      toc += '<div class="toc-row toc-chapter"><span>' + escHtml(chLabel) +
             '</span><span class="toc-pg">' + ph('hal') + '</span></div>';
      var secs = ch.sections || [];
      for (var s = 0; s < secs.length; s++) {
        var num = n ? (n + '.' + (s + 1) + ' ') : '';
        toc += '<div class="toc-row toc-section"><span>' + escHtml(num + secs[s].title) +
               '</span><span class="toc-pg">' + ph('hal') + '</span></div>';
      }
    }
    toc = toc.replace(/〔hal〕/g, '<span class="ph">〔hal〕</span>');
    toc += '</div></section>';

    /* ---- chapters ---- */
    var body = '';
    for (var ci = 0; ci < chapters.length; ci++) {
      var cc = chapters[ci];
      if (/DAFTAR PUSTAKA/i.test(cc.code || '')) continue; // rendered separately
      var cn = romanOf(cc.code);
      body += '<section class="page chapter">';
      body += '<h2 class="ctr">' + escHtml(cc.code || '') + '<br>' +
              escHtml((cc.title || '').toUpperCase()) + '</h2>';
      var css = cc.sections || [];
      for (var si = 0; si < css.length; si++) {
        var sec = css[si];
        var hn = cn ? (cn + '.' + (si + 1) + '  ') : '';
        body += '<h3>' + escHtml(hn + sec.title) + '</h3>';
        body += '<div class="sec">' + renderContentHTML(sec.content) + '</div>';
      }
      body += '</section>';
    }

    /* ---- daftar pustaka (real refs only, via existing formatter) ---- */
    var refs = isArray(st.references) ? st.references : [];
    var dp = '<section class="page"><h2 class="ctr">DAFTAR PUSTAKA</h2><div class="biblio">';
    if (refs.length) {
      var bib = buildBibliography(refs, style);
      var numbered = /ieee|vancouver/i.test(style);
      for (var b = 0; b < bib.length; b++) {
        var prefix = '';
        if (/ieee/i.test(style)) prefix = '[' + (b + 1) + '] ';
        else if (/vancouver/i.test(style)) prefix = (b + 1) + '. ';
        dp += '<p class="ref">' + escHtml(prefix) + inlineFmt(escHtml(bib[b].entry)) + '</p>';
      }
      void numbered;
    } else {
      dp += '<p class="ph">〔lengkapi daftar pustaka dengan referensi nyata dari perpustakaan (gunakan Auto-Search / DOI)〕</p>';
    }
    dp += '</div></section>';

    var sp = String((project && project.lineSpacing) || '1.5');
    if (['1.15', '1.5', '2', '2.0'].indexOf(sp) === -1) sp = '1.5';
    var cssStyle =
      '<style>' +
      '.proposal{font-family:"Times New Roman",Georgia,serif;color:#111;line-height:' + sp + ';font-size:12pt;max-width:820px;margin:0 auto;}' +
      '.proposal .page{background:#fff;padding:48px 56px;margin:0 auto 24px;box-shadow:0 1px 4px rgba(0,0,0,.15);}' +
      '.proposal h2,.proposal h3,.proposal h4{font-weight:bold;}' +
      '.proposal h2.ctr{text-align:center;font-size:14pt;margin:0 0 20px;line-height:1.4;}' +
      '.proposal h3{font-size:12pt;margin:18px 0 6px;}' +
      '.proposal h4{font-size:12pt;margin:12px 0 4px;font-style:italic;}' +
      '.proposal p{margin:0 0 10px;text-align:justify;text-indent:0;}' +
      '.proposal .sec p{text-indent:2em;}' +
      '.proposal .cover{text-align:center;min-height:60vh;}' +
      '.proposal .cover-kind{font-weight:bold;letter-spacing:2px;margin-top:12px;}' +
      '.proposal .cover-title{font-size:16pt;font-weight:bold;text-transform:uppercase;margin:28px 20px;line-height:1.5;}' +
      '.proposal .cover-sub{font-style:italic;margin:16px 40px;}' +
      '.proposal .cover-logo{margin:28px 0;color:#888;}' +
      '.proposal .cover-author p,.proposal .cover-inst p{margin:2px 0;}' +
      '.proposal .cover-inst{margin-top:28px;font-weight:bold;}' +
      '.proposal .right,.proposal p.right{text-align:right;text-indent:0;}' +
      '.proposal .toc-row{display:flex;justify-content:space-between;gap:8px;border-bottom:1px dotted #bbb;padding:3px 0;}' +
      '.proposal .toc-chapter{font-weight:bold;margin-top:8px;}' +
      '.proposal .toc-section{padding-left:18px;}' +
      '.proposal .toc-pg{flex:0 0 auto;}' +
      '.proposal .biblio .ref{padding-left:2em;text-indent:-2em;text-align:left;}' +
      '.proposal .ph{background:#fff3cd;color:#8a6d00;border:1px dashed #d9a900;border-radius:3px;padding:0 3px;font-style:italic;font-size:.92em;}' +
      '@media print{.proposal .page{box-shadow:none;margin:0;page-break-after:always;}}' +
      '</style>';

    return '<div class="proposal">' + cssStyle + cover + kata + toc + body + dp + '</div>';
  }

  // true if any chapter section already has authored content (else re-scaffold)
  function hasNonEmptyContent(chapters) {
    for (var i = 0; i < (chapters || []).length; i++) {
      var secs = chapters[i].sections || [];
      for (var j = 0; j < secs.length; j++) if (trim(secs[j].content)) return true;
    }
    return false;
  }

  /* ====================================================================== */
  /* PUBLIC API                                                              */
  /* ====================================================================== */
  var THESIS = {
    // projects
    uid: uid,
    listProjects: listProjects,
    getProject: getProject,
    activeProject: activeProject,
    setActive: setActive,
    createProject: createProject,
    updateProject: updateProject,
    deleteProject: deleteProject,
    defaultChapters: defaultChapters,
    // references
    addReference: addReference,
    updateReference: updateReference,
    removeReference: removeReference,
    normalizeReference: normalizeReference,
    // providers
    searchOpenAlex: searchOpenAlex,
    searchCrossref: searchCrossref,
    verifyDOI: verifyDOI,
    // citations
    formatBibliography: formatBibliography,
    formatInText: formatInText,
    buildBibliography: buildBibliography,
    // exports
    toBibTeX: toBibTeX,
    toRIS: toRIS,
    // reasoning
    recommendMethod: recommendMethod,
    checkConsistency: checkConsistency,
    // proposal wizard (simple input -> detailed, non-fabricated output)
    FIELDS: FIELDS,
    suggestTitles: suggestTitles,
    deriveFromTitle: deriveFromTitle,
    scaffoldProposal: scaffoldProposal,
    autoSearch: autoSearch,
    buildProposalHTML: buildProposalHTML,
    // meta
    _keys: { projects: K_PROJECTS, active: K_ACTIVE, cache: K_CACHE }
  };

  if (g) g.THESIS = THESIS;
  if (typeof module !== 'undefined' && module.exports) module.exports = THESIS;

  // avoid unused-var lint for hasDoc in some envs
  void hasDoc;
})();
