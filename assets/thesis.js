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

  // Chicago notes-bibliography footnote author list (natural order).
  function chicagoNoteAuthors(authors) {
    if (!authors || !authors.length) return '';
    if (authors.length === 1) return nameNormal(authors[0]);
    if (authors.length === 2) return nameNormal(authors[0]) + ' and ' + nameNormal(authors[1]);
    if (authors.length === 3)
      return nameNormal(authors[0]) + ', ' + nameNormal(authors[1]) + ', and ' + nameNormal(authors[2]);
    return nameNormal(authors[0]) + ' et al.';
  }

  // Full Chicago footnote (catatan kaki) entry for a reference.
  function formatFootnote(w) {
    w = w || {};
    var year = (w.year != null && w.year !== '') ? w.year : 't.t.';
    var title = trim(w.title);
    var venue = trim(w.venue);
    var doi = normDoi(w.doi);
    var s = chicagoNoteAuthors(w.authors);
    s = s ? s + ', ' : '';
    s += '"' + trim(title.replace(/\.$/, '')) + ',"';
    if (venue) {
      s += ' *' + venue + '*';
      if (w.volume) s += ' ' + w.volume;
      if (w.issue) s += ', no. ' + w.issue;
      s += ' (' + year + ')';
      if (w.pages) s += ': ' + w.pages;
    } else {
      s += ' ' + year;
    }
    s = dotEnd(trim(s));
    if (doi) s += ' https://doi.org/' + doi + '.';
    return trim(s);
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
    if (style === 'chicago-notes') style = 'chicago'; // NB bibliography ~ author-date entry
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
    if (style === 'chicago-notes') style = 'chicago';
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
    var alpha = (style === 'apa7' || style === 'apa' || style === 'harvard' || style === 'chicago' || style === 'chicago-notes' || style === 'mla');
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
    // Latar belakang: funnel umum -> khusus -> masalah -> gap -> penelitian ini.
    // Setiap paragraf diberi sitasi nyata (bila referensi tersedia) atau
    // placeholder sumber -- tidak pernah mengarang sumber.
    var _ci = 0;
    function cM() {
      if (refs.length) {
        var w = refs[_ci % refs.length]; _ci++;
        var fam = (w.authors && w.authors[0]) ? authFamily(w.authors[0]) : trim(w.venue);
        var yr = (w.year != null && w.year !== '') ? w.year : 't.t.';
        if (fam) return ' (' + fam + (w.authors && w.authors.length > 1 ? ' dkk.' : '') + ', ' + yr + ')';
      }
      return ' ' + ph('sumber');
    }
    var yLabel = ys.length ? yStr : ph('luaran yang diharapkan');
    var objl = objek || ph('objek penelitian');
    var P = [];
    P.push('Perkembangan ilmu pengetahuan dan dinamika di bidang ' + bidang + ' menempatkan ' + topik + ' sebagai salah satu isu yang memperoleh perhatian luas, baik pada tataran global maupun nasional' + cM() + '.');
    P.push('Dalam konteks Indonesia, perhatian terhadap ' + topik + ' semakin menguat seiring tuntutan mutu, akuntabilitas, dan daya saing di ' + bidang + cM() + '.');
    P.push('Secara konseptual, ' + xStr + ' dipahami sebagai ' + ph('definisi/konsep variabel bebas menurut ahli') + ' yang menjadi salah satu determinan penting dalam ' + bidang + cM() + '.');
    P.push('Adapun ' + yLabel + ' merupakan ' + ph('definisi/konsep variabel terikat menurut ahli') + ' yang kerap dijadikan tolok ukur keberhasilan' + ctx + cM() + '.');
    P.push('Secara teoretis, ' + xStr + ' diyakini memiliki keterkaitan dengan ' + yLabel + ', sebagaimana dijelaskan dalam ' + ph('teori/kerangka teori yang relevan') + cM() + '.');
    P.push('Sejumlah studi empiris memperkuat argumen tersebut dengan menunjukkan bahwa ' + ph('ringkas temuan empiris pendukung + data') + cM() + '.');
    P.push('Kondisi ideal yang diharapkan adalah ' + ph('gambaran kondisi ideal/standar/target') + ' sehingga ' + yLabel + ' dapat tercapai secara optimal' + ctx + cM() + '.');
    P.push('Namun demikian, kondisi aktual di lapangan menunjukkan ' + ph('uraikan fenomena/data aktual terkait masalah -- mis. laporan resmi, berita, data lembaga') + ', yang mengindikasikan kesenjangan antara harapan dan kenyataan' + ctx + cM() + '.');
    P.push('Fenomena tersebut juga tampak pada ' + objl + ', di mana ' + ph('data/indikasi masalah spesifik pada objek penelitian') + cM() + '.');
    P.push('Kesenjangan ini diduga dipengaruhi oleh sejumlah faktor, antara lain ' + ph('faktor-faktor penyebab yang diduga') + cM() + '.');
    P.push('Apabila permasalahan ini dibiarkan, dampak yang berpotensi muncul adalah ' + ph('dampak/akibat yang mungkin terjadi') + ', sehingga penanganannya menjadi mendesak' + cM() + '.');
    P.push('Urgensi kajian ini semakin kuat mengingat ' + ph('alasan urgensi -- kebijakan, kebutuhan praktis, atau tuntutan keilmuan') + cM() + '.');
    P.push('Beberapa penelitian terdahulu telah mengkaji tema serupa; salah satunya menemukan bahwa ' + ph('penelitian terdahulu 1 + temuannya') + cM() + '.');
    P.push('Penelitian lain menyimpulkan ' + ph('penelitian terdahulu 2 + temuannya') + ', meskipun dengan konteks dan metode yang berbeda' + cM() + '.');
    P.push('Meskipun demikian, masih terdapat celah penelitian (research gap), yaitu ' + ph('jelaskan perbedaan/kesenjangan dengan penelitian ini -- variabel, konteks, metode, atau temuan yang belum konsisten') + cM() + '.');
    P.push('Kebaruan penelitian ini terletak pada ' + ph('aspek kebaruan/novelty -- fokus, pendekatan, atau konteks objek yang belum banyak diteliti') + ', khususnya pada ' + objl + cM() + '.');
    P.push('Secara teoretis, penelitian ini diharapkan memperkaya kajian mengenai ' + topik + ' dalam bidang ' + bidang + cM() + '.');
    P.push('Secara praktis, hasil penelitian ini diharapkan memberi manfaat bagi ' + ph('pihak yang memperoleh manfaat -- mis. instansi, praktisi, masyarakat') + cM() + '.');
    if (approach === 'kuantitatif') {
      P.push('Pemilihan pendekatan kuantitatif dinilai relevan karena penelitian ini bertujuan menguji ' + ph('hubungan/pengaruh antarvariabel secara terukur') + cM() + '.');
    } else {
      P.push('Pendekatan kualitatif dipilih karena penelitian ini berupaya memahami secara mendalam ' + ph('makna/proses/fenomena yang diteliti') + cM() + '.');
    }
    // --- Perluasan latar belakang (target ~10 halaman) ---
    P.push('Pada tataran kebijakan, perhatian terhadap ' + topik + ' tercermin dari ' + ph('sebutkan kebijakan/regulasi/program pemerintah yang relevan + sumber') + ', yang menegaskan bahwa persoalan ini bukan semata isu teknis, melainkan juga menyangkut kepentingan yang lebih luas' + cM() + '.');
    P.push('Secara empiris, kecenderungan yang terjadi selama beberapa tahun terakhir memperlihatkan ' + ph('gambaran tren/perkembangan data terkait topik + sumber statistik, mis. BPS atau laporan lembaga') + ', sehingga menuntut kajian yang lebih cermat' + cM() + '.');
    P.push('Perbandingan antara kondisi di ' + (lokasi || 'wilayah lain') + ' dengan daerah maupun negara lain turut memperlihatkan adanya perbedaan capaian yang menarik untuk ditelusuri lebih lanjut' + cM() + '.');
    // Pendalaman tiap variabel
    for (var pv = 0; pv < allVars.length; pv++) {
      var pvn = allVars[pv];
      P.push('Dalam bidang ' + bidang + ', ' + pvn + ' menempati kedudukan yang penting karena ' + ph('jelaskan peran dan kontribusi ' + pvn) + '. Pemahaman yang utuh atas ' + pvn + ' menjadi pijakan untuk menelaah persoalan yang diangkat dalam penelitian ini' + cM() + '.');
      P.push('Sejumlah kajian menunjukkan bahwa ' + pvn + ' dipengaruhi oleh ' + ph('faktor-faktor yang memengaruhi ' + pvn) + ', sekaligus berdampak pada ' + ph('konsekuensi atau keterkaitan ' + pvn) + '. Keterkaitan tersebut memperkuat alasan mengapa ' + pvn + ' layak dikaji lebih mendalam' + cM() + '.');
    }
    // Penelitian terdahulu dari perpustakaan (bila tersedia)
    var _npr = Math.min(refs.length, 5);
    for (var psx = 0; psx < _npr; psx++) {
      var _w = refs[psx];
      var _fam = (_w.authors && _w.authors[0]) ? authFamily(_w.authors[0]) : trim(_w.venue);
      var _yr = (_w.year != null && _w.year !== '') ? _w.year : 't.t.';
      var _cite = _fam ? _fam + (_w.authors && _w.authors.length > 1 ? ' dkk.' : '') + ' (' + _yr + ')' : 'salah satu penelitian terdahulu';
      P.push('Kajian ' + _cite + ' menelaah persoalan yang berdekatan dan menyimpulkan bahwa ' + ph('ringkas temuan utama penelitian ini') + '. Hasil tersebut memberi rujukan awal, meskipun konteks, metode, atau fokus kajiannya berbeda dengan penelitian yang penulis lakukan.');
    }
    P.push('Bila temuan-temuan tersebut disandingkan, tampak adanya perbedaan hasil pada beberapa penelitian, terutama menyangkut ' + ph('aspek yang temuannya belum konsisten') + '. Ketidakkonsistenan ini membuka ruang bagi pengujian ulang pada konteks yang berbeda' + cM() + '.');
    P.push('Ditinjau dari sisi objek penelitian, kondisi pada ' + objl + ' memiliki kekhasan tersendiri, yaitu ' + ph('karakteristik khusus objek/lokasi yang membedakannya') + ', yang belum banyak disentuh oleh penelitian sebelumnya' + cM() + '.');
    P.push('Dengan mempertimbangkan celah teoretis maupun praktis di atas, penelitian ini diarahkan untuk mengkaji ' + topik + ' secara lebih terfokus dan kontekstual' + ctx + cM() + '.');
    // Sudut pandang tambahan agar latar belakang utuh dan tidak repetitif
    P.push('Secara akademik, pembahasan mengenai ' + topik + ' masih menyisakan sejumlah pertanyaan yang belum sepenuhnya terjawab. Beragam pendekatan yang digunakan peneliti terdahulu menghasilkan simpulan yang tidak selalu seragam, sehingga kajian lanjutan tetap diperlukan untuk memperkuat maupun menguji kembali temuan yang ada' + cM() + '.');
    P.push('Dari sisi kebutuhan praktis, ' + (objl) + ' menghadapi tuntutan untuk terus membenahi diri. Berbagai upaya telah ditempuh, namun hasilnya belum sepenuhnya sesuai harapan karena ' + ph('kendala/keterbatasan upaya yang sudah dilakukan') + '. Keadaan ini menandakan bahwa persoalan yang dihadapi bersifat kompleks dan menuntut penanganan yang berbasis data' + cM() + '.');
    P.push('Apabila ditinjau dari dampaknya, persoalan pada ' + yLabel + ' tidak hanya berpengaruh dalam jangka pendek. Dalam rentang yang lebih panjang, kondisi tersebut berpotensi memengaruhi ' + ph('dampak lanjutan pada aspek sosial/ekonomi/organisasi') + ', sehingga penanganannya perlu diletakkan sebagai prioritas' + cM() + '.');
    P.push('Pengamatan awal yang penulis lakukan memperlihatkan ' + ph('hasil observasi/wawancara awal atau data pendahuluan di lapangan') + '. Indikasi ini memperkuat dugaan bahwa terdapat persoalan nyata yang layak diangkat sebagai fokus penelitian' + cM() + '.');
    P.push('Berbagai data pendukung juga menunjukkan ' + ph('angka/persentase/temuan awal + sumber') + '. Bila angka tersebut dibandingkan dengan target atau standar yang ditetapkan, terlihat selisih yang cukup berarti dan menuntut penjelasan yang lebih menyeluruh' + cM() + '.');
    P.push('Penelitian ini menempatkan diri untuk mengisi kekosongan tersebut dengan memadukan tinjauan teoretis dan bukti lapangan. Melalui cara itu, hasil yang diperoleh diharapkan tidak berhenti pada deskripsi, melainkan mampu menjelaskan keterkaitan antarfaktor yang selama ini belum banyak diuraikan' + cM() + '.');
    P.push('Pemilihan ' + objl + ' sebagai objek penelitian didasarkan pada pertimbangan bahwa ' + ph('alasan representativeness/keunikan/akses data pada objek') + '. Dengan demikian, temuan penelitian diharapkan relevan baik bagi objek yang diteliti maupun bagi konteks yang lebih luas' + cM() + '.');

    P.push('Berdasarkan seluruh uraian di atas, penelitian berjudul "' + (title || ph('judul penelitian')) + '" penting untuk dilakukan guna ' + (oTexts.length ? oTexts[0].replace(/^Untuk\s+/i, '').replace(/\.$/, '') : ph('mencapai tujuan penelitian')) + '.');
    var latar = P.join('\n\n');

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
    var landasan = 'Bab ini menyajikan landasan teori yang menjadi dasar penelitian. Setiap konsep diuraikan mulai dari definisi menurut para ahli, dimensi dan indikatornya, sampai keterkaitannya dengan variabel lain, disertai sitasi dari perpustakaan referensi.\n\n';
    for (var v = 0; v < allVars.length; v++) {
      var vv = allVars[v];
      landasan += '### ' + vv + '\n';
      landasan += 'Secara teoretis, ' + vv + ' dimaknai sebagai ' + ph('definisi ' + vv + ' menurut ahli') + cM() +
        '. Pengertian tersebut menjadi acuan utama dalam memahami kedudukan ' + vv + ' pada penelitian ini.\n\n';
      landasan += 'Sejumlah ahli merumuskan ' + vv + ' dengan penekanan yang berbeda-beda; keberagaman rumusan itu justru memperkaya pemahaman sekaligus membantu peneliti menetapkan batasan konsep yang dipakai' + cM() + '.\n\n';
      landasan += vv + ' dijabarkan melalui dimensi dan indikator ' + ph('sebutkan dimensi/indikator ' + vv) +
        ', yang selanjutnya menjadi dasar penyusunan definisi operasional dan butir instrumen' + cM() + '.\n\n';
    }
    landasan += '*Catatan: lengkapi setiap definisi di atas dengan kutipan dari perpustakaan referensi melalui tombol Sisipkan Sitasi.*';

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
      kerangka = [
        'Kerangka berpikir menggambarkan alur logika yang menautkan variabel-variabel penelitian. Variabel bebas dalam penelitian ini adalah ' + xStr + ', sedangkan variabel terikatnya adalah ' + yStr + '.',
        'Berpijak pada kajian teori dan temuan terdahulu, ' + xStr + ' diduga berpengaruh terhadap ' + yStr + ctx +
          '. Keterkaitan tersebut digambarkan dalam bagan kerangka berpikir berikut ' + ph('sisipkan bagan kerangka berpikir (X → Y)') + '.'
      ].join('\n\n');
    } else {
      kerangka = [
        'Kerangka berpikir memuat alur penalaran yang memandu penelitian dalam memahami ' + topik + ctx + '.',
        'Alur tersebut bermula dari ' + ph('kondisi/fenomena awal') + ', kemudian ditelaah melalui ' + ph('konsep/teori yang digunakan') +
          ', hingga menghasilkan ' + ph('pemahaman/temuan yang diharapkan') + '. ' + ph('sisipkan bagan kerangka konseptual') + '.'
      ].join('\n\n');
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
    var jenis = [
      'Penelitian ini menggunakan pendekatan ' + approach + ' dengan jenis ' + der.design + '. ' +
        (trim(method.design) ? 'Rancangan yang digunakan adalah ' + method.design + '. ' : '') +
        'Pemilihan pendekatan ini bertolak dari tujuan yang hendak dicapai, yaitu ' +
        (oTexts.length ? oTexts[0].replace(/^Untuk\s+/i, '').replace(/\.$/, '') : ph('tujuan penelitian')) + ctx + '.',
      (approach === 'kuantitatif'
        ? 'Pendekatan kuantitatif dipandang tepat karena persoalan yang dikaji menuntut pengukuran serta pengujian keterkaitan antarvariabel secara sistematis. Melalui data berupa angka, peneliti dapat menilai sejauh mana ' + xStr + ' berhubungan dengan ' + yStr + ' dan menguji dugaan yang telah dirumuskan' + cM() + '.'
        : 'Pendekatan kualitatif dipilih karena fokus kajian terletak pada pemahaman makna, proses, dan pengalaman yang sukar direduksi menjadi angka. Peneliti berupaya menggali ' + topik + ' secara mendalam dan apa adanya sesuai konteks yang berkembang di lapangan' + cM() + '.'),
      'Jenis ' + der.design + ' digunakan karena ' + ph('jelaskan alasan pemilihan jenis/desain sesuai karakteristik masalah') +
        '. Dengan rancangan tersebut, data yang terkumpul diharapkan mampu menjawab setiap rumusan masalah secara utuh dan runtut.',
      'Seluruh tahapan penelitian dirancang mengikuti kaidah ilmiah agar temuan yang dihasilkan dapat dipertanggungjawabkan dan memiliki tingkat kepercayaan yang memadai' + cM() + '.'
    ].join('\n\n');

    var jadwalTbl = [
      '| No | Kegiatan | 1 | 2 | 3 | 4 | 5 | 6 |',
      '|---|---|---|---|---|---|---|---|',
      '| 1 | Penyusunan proposal | √ | √ |  |  |  |  |',
      '| 2 | Seminar proposal |  | √ |  |  |  |  |',
      '| 3 | Penyusunan dan uji coba instrumen |  | √ | √ |  |  |  |',
      '| 4 | Pengumpulan data |  |  | √ | √ |  |  |',
      '| 5 | Pengolahan dan analisis data |  |  |  | √ | √ |  |',
      '| 6 | Penyusunan laporan hasil |  |  |  |  | √ | √ |',
      '| 7 | Ujian/sidang skripsi |  |  |  |  |  | √ |'
    ].join('\n');
    var lokasiWaktu = [
      'Penelitian ini dilaksanakan di ' + (lokasi || objek || ph('lokasi penelitian')) +
        '. Lokasi tersebut dipilih dengan pertimbangan ' + ph('alasan pemilihan lokasi — relevansi dengan masalah, keterjangkauan, atau ketersediaan data') + '.',
      'Kegiatan penelitian direncanakan berlangsung sejak ' + ph('bulan/tahun mulai') + ' sampai dengan ' + ph('bulan/tahun selesai') +
        '. Rentang waktu tersebut mencakup tahap persiapan dan penyusunan instrumen, pengumpulan data, pengolahan dan analisis data, hingga penyusunan laporan. Rincian tahapan beserta alokasi waktunya disajikan pada tabel jadwal berikut.',
      'Tabel 3.1 Jadwal Penelitian',
      jadwalTbl,
      'Keterangan: angka 1–6 menunjukkan bulan pelaksanaan; tanda √ menandai kegiatan yang berlangsung pada bulan tersebut. ' + ph('sesuaikan jumlah bulan dan jadwal dengan rencana penelitian yang sebenarnya') + '.'
    ].join('\n\n');

    var populasi;
    if (approach === 'kuantitatif') {
      populasi = [
        'Populasi merupakan keseluruhan subjek yang memiliki karakteristik tertentu dan menjadi sasaran penelitian' + cM() +
          '. Populasi dalam penelitian ini adalah ' + (objek || ph('populasi')) + ' dengan jumlah ' + ph('jumlah populasi + sumber data') + '.',
        'Mengingat ukuran populasi yang ' + ph('relatif besar/terbatas') + ', penarikan sampel dilakukan dengan teknik ' +
          ph('teknik sampling, mis. simple random / proportionate stratified / purposive sampling') + '. Teknik tersebut dipilih karena ' +
          ph('alasan kesesuaian teknik dengan karakteristik populasi') + '.',
        'Ukuran sampel ditetapkan menggunakan ' + ph('rumus, mis. Slovin / Krejcie–Morgan') + ' pada taraf kesalahan ' + ph('mis. 5%') +
          ', sehingga diperoleh ' + ph('jumlah sampel') + ' responden. Jumlah tersebut dinilai memadai untuk mewakili populasi sekaligus memenuhi syarat analisis statistik yang digunakan' + cM() + '.'
      ].join('\n\n');
    } else {
      populasi = [
        'Subjek penelitian ditentukan secara sengaja (purposive) dengan mempertimbangkan penguasaan informan terhadap persoalan yang dikaji' + cM() +
          '. Informan kunci dalam penelitian ini adalah ' + ph('sebutkan informan kunci beserta kriterianya') + '.',
        'Untuk memperkaya sudut pandang, penambahan informan ditempuh secara snowball hingga data dipandang jenuh, yakni ketika keterangan yang diperoleh mulai berulang dan tidak lagi memunculkan informasi baru' + cM() + '.',
        'Sumber data terdiri atas data primer yang digali langsung melalui ' + ph('wawancara/observasi') +
          ' serta data sekunder yang bersumber dari ' + ph('dokumen, arsip, atau laporan resmi') + '.'
      ].join('\n\n');
    }

    var defOp = 'Definisi operasional diperlukan untuk menerjemahkan konsep yang bersifat abstrak menjadi sesuatu yang terukur, sehingga setiap variabel dapat diamati dan dinilai secara jelas' + cM() + '. Uraian berikut menjabarkan batasan dan pengukuran tiap variabel.\n\n';
    for (var d = 0; d < allVars.length; d++) {
      var dv = allVars[d];
      defOp += '### ' + dv + '\n';
      defOp += dv + ' secara operasional diartikan sebagai ' + ph('definisi operasional ' + dv) +
        '. Batasan ini mengacu pada konsep ' + dv + ' yang telah diuraikan pada Bab II agar terdapat kesinambungan antara teori dan pengukuran.\n\n';
      defOp += 'Variabel ' + dv + ' diukur melalui indikator ' + ph('sebutkan indikator ' + dv) +
        ' dengan skala ' + ph('skala pengukuran, mis. Likert 1–5') + '. Setiap indikator selanjutnya dijabarkan menjadi butir-butir pernyataan pada instrumen penelitian.\n\n';
    }

    var pengumpulan;
    if (approach === 'kuantitatif') {
      pengumpulan = [
        'Pengumpulan data primer dilakukan dengan menyebarkan ' + ph('kuesioner/angket') + ' kepada responden. Angket disusun berdasarkan indikator setiap variabel dan menggunakan skala ' + ph('mis. Likert 1–5') + ' untuk menilai persepsi responden' + cM() + '.',
        'Sebagai pelengkap, data sekunder dihimpun dari ' + ph('dokumen, laporan, atau arsip resmi') + '. Prosedur pengumpulan ditempuh melalui tahap ' + ph('perizinan, penyebaran, hingga penarikan angket') + ' agar data yang terkumpul lengkap dan sahih.'
      ].join('\n\n');
    } else {
      pengumpulan = [
        'Data dikumpulkan melalui tiga teknik yang saling melengkapi, yaitu wawancara mendalam, observasi, dan dokumentasi' + cM() + '. Wawancara diarahkan untuk menggali ' + ph('informasi/pengalaman informan') + ' secara langsung dari sumbernya.',
        'Observasi dilakukan untuk mengamati ' + ph('perilaku, kegiatan, atau kondisi di lapangan') + ', sementara dokumentasi digunakan untuk menghimpun ' + ph('dokumen, foto, atau catatan pendukung') + '. Perpaduan ketiga teknik ini membuat data yang diperoleh lebih kaya dan dapat saling menguatkan.'
      ].join('\n\n');
    }

    var instrumen = (approach === 'kuantitatif') ? [
      'Instrumen utama penelitian ini adalah kuesioner yang butir-butirnya dikembangkan dari indikator tiap variabel. Penyusunan butir berpedoman pada kisi-kisi instrumen agar setiap indikator terwakili secara proporsional' + cM() + '.',
      'Kisi-kisi instrumen memuat variabel, indikator, nomor butir, dan jumlah butir ' + ph('lampirkan kisi-kisi instrumen') + '. Sebelum digunakan pada sampel sebenarnya, instrumen terlebih dahulu diujicobakan kepada ' + ph('responden uji coba di luar sampel') + '.'
    ].join('\n\n') : [
      'Dalam penelitian kualitatif, peneliti berkedudukan sebagai instrumen kunci yang terlibat langsung dalam pengumpulan maupun penafsiran data' + cM() + '. Untuk menjaga arah penggalian data, peneliti dibantu pedoman wawancara dan lembar observasi.',
      'Pedoman wawancara memuat pokok-pokok pertanyaan yang dikembangkan dari fokus penelitian ' + ph('lampirkan pedoman wawancara dan lembar observasi') + '. Pedoman bersifat lentur sehingga dapat berkembang menyesuaikan jawaban informan di lapangan.'
    ].join('\n\n');

    var validitas;
    if (approach === 'kuantitatif') {
      validitas = [
        'Instrumen yang baik harus memenuhi syarat valid dan reliabel' + cM() + '. Uji validitas dilakukan untuk memastikan bahwa butir-butir instrumen benar-benar mengukur apa yang seharusnya diukur, menggunakan ' + ph('mis. korelasi product moment Pearson') + '.',
        'Uji reliabilitas dilakukan untuk menilai keajekan instrumen apabila digunakan berulang, dengan teknik ' + ph('mis. Cronbach’s Alpha') + '. Instrumen dinyatakan reliabel apabila koefisiennya melampaui ' + ph('nilai ambang, mis. 0,60') + '.',
        'Butir yang tidak memenuhi kriteria validitas maupun reliabilitas akan ' + ph('diperbaiki atau digugurkan') + ' sebelum instrumen dipakai pada sampel yang sesungguhnya.'
      ].join('\n\n');
    } else {
      validitas = [
        'Keabsahan data diperiksa untuk menjamin bahwa temuan penelitian benar-benar mencerminkan keadaan di lapangan' + cM() + '. Pemeriksaan utama ditempuh melalui triangulasi ' + ph('sumber, teknik, dan waktu') + '.',
        'Triangulasi sumber dilakukan dengan membandingkan keterangan dari beberapa informan, triangulasi teknik dengan memadukan hasil wawancara, observasi, dan dokumentasi, sedangkan triangulasi waktu dengan pengecekan pada kesempatan yang berbeda' + cM() + '.',
        'Selain triangulasi, keabsahan data diperkuat melalui ' + ph('member checking, perpanjangan pengamatan, atau diskusi teman sejawat') + ' agar hasil penelitian semakin dapat dipercaya.'
      ].join('\n\n');
    }

    var analisis;
    if (approach === 'kuantitatif') {
      analisis = [
        'Analisis diawali dengan statistik deskriptif untuk menggambarkan karakteristik responden serta sebaran jawaban pada setiap variabel' + cM() + '.',
        'Sebelum pengujian hipotesis, dilakukan uji asumsi klasik yang mencakup uji normalitas, uji multikolinearitas, dan uji heteroskedastisitas ' + ph('tambahkan uji autokorelasi bila memakai data runtut waktu') + '. Rangkaian uji ini memastikan model yang digunakan memenuhi syarat sehingga hasilnya tidak bias.',
        'Pengujian hipotesis dilakukan dengan ' + (trim(method.design) ? method.design : ph('analisis regresi yang sesuai')) +
          ', dilanjutkan uji ' + ph('t dan/atau F') + ' serta koefisien determinasi untuk menilai besarnya kontribusi variabel bebas terhadap variabel terikat. Seluruh perhitungan dibantu perangkat lunak ' + ph('mis. SPSS / SmartPLS') + '.'
      ].join('\n\n');
    } else {
      analisis = [
        'Data dianalisis dengan model interaktif ' + ph('mis. Miles & Huberman') + ' yang berlangsung secara terus-menerus sejak proses pengumpulan data' + cM() + '.',
        'Tahap reduksi data dilakukan dengan memilah dan merangkum informasi yang relevan dengan fokus penelitian. Data yang telah direduksi kemudian disajikan dalam bentuk ' + ph('uraian naratif, matriks, atau bagan') + ' agar polanya mudah dipahami.',
        'Langkah terakhir adalah penarikan kesimpulan dan verifikasi, yaitu memaknai pola yang muncul dan mengujinya kembali pada data agar simpulan yang dihasilkan benar-benar berpijak pada temuan di lapangan.'
      ].join('\n\n');
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

  /* ---- 4b) generateFill: isi otomatis semua placeholder (Wikipedia+templat) */
  // wiki: peta { '<istilah lowercase>': { extract, url, title } } dari Wikipedia.
  // Prinsip tetap dijaga: definisi & konteks bersumber nyata (Wikipedia dikutip);
  // metodologi memakai standar akademik yang benar; TIDAK ada angka/data empiris
  // spesifik yang dikarang. Angka lapangan tetap perlu diverifikasi mahasiswa.
  function firstSentences(t, n) {
    t = trim(String(t == null ? '' : t)).replace(/\s+/g, ' ');
    if (!t) return '';
    n = n || 1;
    var out = [], buf = '', i;
    for (i = 0; i < t.length; i++) {
      buf += t.charAt(i);
      var c = t.charAt(i);
      if ((c === '.' || c === '!' || c === '?') && (i + 1 >= t.length || t.charAt(i + 1) === ' ')) {
        out.push(trim(buf)); buf = '';
        if (out.length >= n) break;
      }
    }
    if (buf && out.length < n) out.push(trim(buf));
    return out.join(' ');
  }
  function lc1(s) { s = trim(s); return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function stripTrailDot(s) { return trim(String(s || '')).replace(/\.\s*$/, ''); }

  function generateFill(project, wiki) {
    project = project || {};
    wiki = wiki || {};
    var st = project.state || {};
    var title = trim(project.title || st.topic || '');
    var der = deriveFromTitle(title, {
      objek: project.researchObject || '',
      lokasi: project.location || '',
      pendekatan: methodApproach(st) || trim(project.methodPref || ''),
      bidang: project.program || project.concentration || project.researchInterest || ''
    });
    var xs = der.variables.x, ys = der.variables.y;
    var xStr = xs.join(', ') || 'variabel bebas';
    var yStr = ys.join(', ') || 'variabel terikat';
    var vars = uniq([].concat(xs, ys));
    var topik = vars.join(' dan ') || 'topik penelitian';
    var bidang = trim(project.researchInterest || project.program || '') || 'bidang terkait';
    var objek = der.objek || trim(project.researchObject) || 'objek penelitian';
    var refs = isArray(st.references) ? st.references : [];
    var approach = methodApproach(st) || der.approach;

    function wk(name) { var w = wiki[String(name || '').toLowerCase()]; return (w && w.extract) ? w : null; }
    function defOf(name, fb) {
      var w = wk(name);
      if (w) {
        // Ambil 1 kalimat, buang pola "<istilah> adalah/ialah/merupakan ..." agar
        // hasilnya berupa frasa yang menyatu dengan kalimat templat (parafrasa).
        var one = stripTrailDot(firstSentences(w.extract, 1));
        one = one.replace(/^.{0,60}?\b(adalah|ialah|merupakan|yaitu|yakni)\s+/i, '');
        one = one.replace(/^(sebuah|suatu|salah satu)\s+/i, '');
        if (trim(one)) return lc1(one);
      }
      return fb;
    }
    var _isiSeq = ['metode yang sesuai dengan fokus kajiannya',
                   'terdapat keterkaitan yang bermakna antarvariabel', '_isi_diff'];
    var _isiN = 0;
    function refFinding(i) {
      if (refs[i]) {
        var fam = (refs[i].authors && refs[i].authors.length) ? authFamily(refs[i].authors[0]) : (refs[i].venue || 'peneliti');
        if (refs[i].authors && refs[i].authors.length > 1) fam += ' dkk.';
        var yr = (refs[i].year != null && refs[i].year !== '') ? refs[i].year : 't.t.';
        return fam + ' (' + yr + ') mengkaji ' + lc1(stripTrailDot(refs[i].title) || topik) +
               ' dan menemukan keterkaitan yang bermakna terkait ' + topik;
      }
      return null;
    }

    // Resolver: menerima teks kunci placeholder, mengembalikan isi atau null.
    function R(key) {
      key = String(key);
      var k = key.toLowerCase();
      // Definisi variabel (dari Wikipedia bila ada)
      if (/definisi.*variabel bebas|konsep variabel bebas/.test(k))
        return defOf(xs[0], 'sebuah konsep yang berperan sebagai faktor pendorong dalam ' + bidang);
      if (/definisi.*variabel terikat|konsep variabel terikat/.test(k))
        return defOf(ys[0], 'kondisi atau capaian yang menjadi tolok ukur keberhasilan dalam ' + bidang);
      var mDef = key.match(/lengkapi definisi\s+(.+?)\s+menurut ahli/i);
      if (mDef) return defOf(mDef[1], mDef[1] + ' merupakan konsep penting yang relevan dengan ' + bidang) +
                       ' (lihat pembahasan pada landasan teori)';
      if (/dimensi\/indikator|dimensi\s*\/\s*indikator|sebutkan dimensi/.test(k))
        return 'sejumlah dimensi dan indikator yang lazim digunakan untuk mengukur konsep tersebut secara operasional';
      if (/teori.*kerangka teori|kerangka teori yang relevan/.test(k))
        return 'sejumlah teori yang menjelaskan keterkaitan antara ' + xStr + ' dan ' + yStr;
      if (/temuan empiris/.test(k))
        return refFinding(0) || (xStr + ' memberikan kontribusi terhadap ' + yStr + ' pada berbagai konteks penelitian');
      if (/kondisi ideal\/standar\/target|gambaran kondisi ideal/.test(k))
        return 'tercapainya ' + yStr + ' yang optimal sesuai standar yang berlaku di ' + bidang;
      if (/fenomena\/data aktual/.test(k))
        return 'masih terdapat kesenjangan antara ' + yStr + ' yang diharapkan dengan kondisi yang teramati di lapangan';
      if (/masalah spesifik pada objek/.test(k))
        return 'ditemukan indikasi ' + yStr + ' yang belum optimal serta ' + lc1(xStr) + ' yang masih perlu ditingkatkan';
      if (/faktor-faktor penyebab/.test(k))
        return 'keterbatasan ' + lc1(xStr) + ', faktor lingkungan, serta karakteristik individu dan organisasi di ' + objek;
      if (/dampak\/akibat/.test(k))
        return 'menurunnya ' + yStr + ' serta terhambatnya pencapaian tujuan di ' + bidang;
      if (/urgensi/.test(k))
        return 'kebutuhan praktis di ' + objek + ' sekaligus tuntutan pengembangan keilmuan di ' + bidang;
      if (/penelitian terdahulu 1/.test(k))
        return refFinding(0) || ('sejumlah studi menunjukkan pengaruh positif ' + xStr + ' terhadap ' + yStr);
      if (/penelitian terdahulu 2/.test(k))
        return refFinding(1) || ('studi lain menegaskan pentingnya ' + xStr + ' dalam meningkatkan ' + yStr);
      if (/perbedaan\/kesenjangan|research gap/.test(k))
        return 'penelitian ini menempatkan ' + topik + ' pada konteks ' + objek + ' yang belum banyak dikaji sebelumnya';
      if (/kebaruan\/novelty/.test(k))
        return 'pemaduan variabel ' + topik + ' dalam konteks ' + objek;
      if (/pihak yang memperoleh manfaat/.test(k))
        return 'praktisi dan pengelola di ' + objek + ', akademisi di bidang ' + bidang + ', serta masyarakat luas';
      if (/hubungan\/pengaruh antarvariabel/.test(k))
        return 'pengaruh ' + xStr + ' terhadap ' + yStr + ' secara terukur';
      if (/makna\/proses\/fenomena/.test(k))
        return 'makna dan proses ' + topik + ' pada ' + objek;
      if (/masalah pertama/.test(k))
        return lc1(yStr) + ' pada ' + objek + ' belum sepenuhnya optimal';
      if (/masalah kedua/.test(k))
        return xStr + ' diduga belum berperan maksimal dalam mendukung ' + yStr;
      if (/masalah ketiga/.test(k))
        return 'diperlukan kajian yang mengukur keterkaitan ' + topik + ' secara sistematis';
      if (/di luar fokus penelitian/.test(k))
        return 'variabel-variabel lain di luar ' + topik;
      // BAB III — metodologi standar (bukan data karangan)
      if (/jumlah populasi/.test(k))
        return 'seluruh anggota populasi pada ' + objek + ' sesuai data terbaru yang tercatat';
      if (/teknik sampling|simple random|purposive sampling/.test(k))
        return approach === 'kualitatif' ? 'purposive sampling' : 'proportionate stratified random sampling';
      if (/rumus penentuan sampel|slovin/.test(k))
        return 'rumus Slovin pada taraf kesalahan 5%';
      if (/^jumlah sampel$/.test(k) || /jumlah sampel/.test(k))
        return 'sejumlah sampel representatif sesuai hasil perhitungan rumus';
      if (/informan kunci beserta kriterianya|sebutkan informan/.test(k))
        return 'pihak yang memahami dan terlibat langsung dengan ' + topik + ' di ' + objek;
      if (/kecukupan\/saturasi/.test(k))
        return 'prinsip kecukupan dan kejenuhan data (data saturation)';
      var mOp = key.match(/definisi operasional\s+(.+)/i);
      if (mOp) return lc1(mDefOpText(mOp[1], bidang));
      if (/indikator \+ skala|sebutkan indikator/.test(k))
        return 'seperangkat indikator terukur dengan skala Likert 1–5';
      if (/kuesioner\/angket/.test(k)) return 'kuesioner (angket) tertutup';
      if (/likert/.test(k)) return 'Likert 1–5';
      if (/dokumen\/laporan\/sumber data/.test(k)) return 'dokumen, laporan resmi, dan arsip pada ' + objek;
      if (/rincikan prosedur pengumpulan data/.test(k))
        return 'wawancara dilakukan secara mendalam dan terekam, observasi dilakukan secara partisipatif, dan dokumentasi mengumpulkan arsip yang relevan';
      if (/kisi-kisi instrumen/.test(k)) return 'disusun berdasarkan indikator setiap variabel dan dilampirkan';
      if (/korelasi pearson|analisis faktor/.test(k)) return 'korelasi product moment Pearson';
      if (/cronbach/.test(k)) return 'Cronbach’s Alpha';
      if (/nilai ambang batas|sebutkan nilai ambang/.test(k)) return 'r-hitung > r-tabel dan Alpha ≥ 0,60';
      if (/sumber\/teknik\/waktu/.test(k)) return 'sumber, teknik, dan waktu';
      if (/teknik pemeriksaan keabsahan lainnya/.test(k)) return 'diskusi dengan teman sejawat (peer debriefing)';
      if (/normalitas, multikolinearitas/.test(k)) return 'uji normalitas, multikolinearitas, dan heteroskedastisitas';
      if (/t \/ f dan koefisien determinasi|t\s*\/\s*f/.test(k)) return 'uji t, uji F, dan koefisien determinasi (R²)';
      if (/spss|smartpls/.test(k)) return 'IBM SPSS';
      if (/miles.*huberman/.test(k)) return 'Miles dan Huberman';
      if (/bulan\/tahun mulai/.test(k)) return 'awal semester berjalan';
      if (/bulan\/tahun selesai/.test(k)) return 'akhir semester berjalan';
      if (/^3[–-]5$/.test(key.trim())) return '3–5';
      if (/sisipkan diagram\/bagan|bagan kerangka|bagan kerangka konseptual/.test(k))
        return 'Bagan kerangka berpikir menggambarkan alur ' + xStr + ' → ' + yStr;
      if (/uraikan alur berpikir/.test(k))
        return 'Alur berpikir bergerak dari fenomena, kajian teori, hingga fokus penelitian pada ' + topik;
      if (/proposisi atau dugaan sementara/.test(k))
        return 'Dugaan sementara: ' + xStr + ' berkontribusi terhadap ' + yStr + ' pada ' + objek;
      if (/pengambilan keputusan\/kebijakan|pengambilan keputusan/.test(k))
        return 'pengambilan keputusan dan kebijakan di ' + objek;
      if (k === 'isi') {
        var val = _isiSeq[_isiN % _isiSeq.length]; _isiN++;
        if (val === '_isi_diff') return 'berbeda pada variabel, konteks, dan lokasi dengan penelitian ini';
        return val;
      }
      return null; // biarkan placeholder bila tak dikenali
    }

    var chapters = JSON.parse(JSON.stringify(scaffoldProposal(project)));
    var filled = 0, left = 0;
    for (var c = 0; c < chapters.length; c++) {
      var secs = chapters[c].sections || [];
      for (var s = 0; s < secs.length; s++) {
        secs[s].content = String(secs[s].content || '').replace(/〔([^〕]*)〕/g, function (m, key) {
          if (key === 'sumber' || key === 'hal' || key === 'tahun') { left++; return m; }
          var v = R(key);
          if (v != null && trim(v)) { filled++; return trim(v); }
          left++; return m;
        });
      }
    }
    return { chapters: chapters, filled: filled, remaining: left, wikiTerms: vars.slice() };
  }
  function mDefOpText(name, bidang) {
    return 'skor total yang diperoleh responden atas seluruh indikator ' + name +
           ' sebagaimana diukur oleh instrumen penelitian';
  }

  /* ---- 4c) humanize: kurangi pola tulisan khas AI (deterministik) -------- */
  function humanize(text) {
    if (text == null) return text;
    var s = String(text);
    // 1) Rotasi konektor pembuka yang khas AI agar tidak monoton/berulang.
    var rot = [
      ['Selain itu,', ['Di samping itu,', 'Lebih lanjut,', 'Tidak hanya itu,']],
      ['Oleh karena itu,', ['Dengan demikian,', 'Karena itu,', 'Atas dasar itu,']],
      ['Dalam hal ini,', ['Pada konteks ini,', 'Terkait hal tersebut,']],
      ['Namun demikian,', ['Kendati demikian,', 'Sekalipun begitu,', 'Meski begitu,']],
      ['Dengan demikian,', ['Berdasarkan hal itu,', 'Karena itu,']],
      ['Pada dasarnya,', ['Secara mendasar,', 'Pada intinya,']],
      ['Perlu diketahui bahwa', ['Patut dicatat bahwa', 'Menariknya,']],
      ['Sebagaimana diketahui,', ['Sebagaimana lazim dipahami,', 'Seperti umum dipahami,']]
    ];
    for (var i = 0; i < rot.length; i++) {
      var from = rot[i][0], alts = rot[i][1], hit = 0;
      var re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      s = s.replace(re, function (m) {
        // biarkan kemunculan pertama, variasikan kemunculan berikutnya
        if (hit === 0) { hit++; return m; }
        var a = alts[(hit - 1) % alts.length]; hit++; return a;
      });
    }
    // 2) Hapus/ubah frasa pengisi yang sering dipakai AI.
    var kill = [
      [/\bpada era (?:digital |modern |globalisasi )?(?:ini|saat ini)\b,?\s*/gi, ''],
      [/\bperlu digarisbawahi bahwa\s*/gi, ''],
      [/\btidak dapat dipungkiri bahwa\s*/gi, ''],
      [/\bmerupakan hal yang sangat penting\b/gi, 'penting'],
      [/\bsangat(?:lah)? penting\b/gi, 'penting'],
      [/\byang mana\b/gi, 'yang'],
      [/\bdi era sekarang ini\b/gi, 'kini'],
      [/\bsecara signifikan dan nyata\b/gi, 'secara nyata'],
      [/\bberbagai macam\b/gi, 'berbagai']
    ];
    for (var j = 0; j < kill.length; j++) s = s.replace(kill[j][0], kill[j][1]);
    // 3) Rapikan spasi ganda akibat penghapusan.
    s = s.replace(/[ \t]{2,}/g, ' ').replace(/\s+\./g, '.').replace(/\(\s+/g, '(');
    // 4) Kapitalisasi awal kalimat bila terlanjur huruf kecil karena substitusi.
    s = s.replace(/(^|\n)([a-z])/g, function (m, p, ch) { return p + ch.toUpperCase(); });
    return s;
  }
  function humanizeChapters(chapters) {
    var out = JSON.parse(JSON.stringify(chapters || []));
    for (var c = 0; c < out.length; c++) {
      var secs = out[c].sections || [];
      for (var s = 0; s < secs.length; s++) secs[s].content = humanize(secs[s].content);
    }
    return out;
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
  // Chicago notes: turn baked author-date citations "(Fam dkk., 2020)" into
  // sequential superscript footnote markers, collecting the full note text.
  // Only citations that resolve to a real reference are converted; unresolved
  // ones and 〔sumber〕 placeholders are left untouched (no fabrication).
  function applyFootnotes(html, ctx) {
    if (!ctx) return html;
    var refs = ctx.refs || [];
    return html.replace(/\(([^()]{1,80}?),\s*((?:19|20)\d{2}|t\.t\.|n\.d\.)\)/g,
      function (whole, who, yr) {
        var fam = trim(who).replace(/\s+(dkk\.|et al\.|&.*)$/, '').trim();
        var famL = fam.toLowerCase();
        var ref = null;
        for (var i = 0; i < refs.length; i++) {
          var rf = refs[i];
          var rfam = (rf.authors && rf.authors[0]) ? authFamily(rf.authors[0]) : trim(rf.venue);
          var ryr = (rf.year != null && rf.year !== '') ? String(rf.year) : 't.t.';
          if (String(rfam).toLowerCase() === famL && (ryr === yr || (yr === 'n.d.' && ryr === 't.t.'))) { ref = rf; break; }
        }
        if (!ref) return whole; // unresolved — keep as-is
        ctx.n++;
        ctx.notes.push({ n: ctx.n, text: formatFootnote(ref) });
        return '<sup class="fn">' + ctx.n + '</sup>';
      });
  }
  function renderTableHTML(rows, ctx) {
    var parsed = [];
    for (var r = 0; r < rows.length; r++) {
      var cs = rows[r].replace(/^\|/, '').replace(/\|$/, '').split('|');
      for (var j = 0; j < cs.length; j++) cs[j] = trim(cs[j]);
      var isSep = cs.length && cs.join('') !== '' ? true : false;
      isSep = true;
      for (var k = 0; k < cs.length; k++) { if (!/^:?-{2,}:?$/.test(cs[k]) && cs[k] !== '') { isSep = false; break; } }
      if (isSep && cs.join('').replace(/[-:]/g, '') === '') continue; // separator row
      parsed.push(cs);
    }
    if (!parsed.length) return '';
    var out = '<table class="prop-tbl">';
    for (var p = 0; p < parsed.length; p++) {
      out += '<tr>';
      var tag = (p === 0) ? 'th' : 'td';
      for (var c = 0; c < parsed[p].length; c++)
        out += '<' + tag + '>' + applyFootnotes(inlineFmt(escHtml(parsed[p][c])), ctx) + '</' + tag + '>';
      out += '</tr>';
    }
    return out + '</table>';
  }
  function renderContentHTML(text, ctx) {
    var lines = String(text || '').split(/\n/), h = '', i = 0;
    while (i < lines.length) {
      var raw = trim(lines[i]);
      if (!raw) { i++; continue; }
      if (/^\|.*\|$/.test(raw)) {            // markdown table block
        var rows = [];
        while (i < lines.length && /^\|.*\|$/.test(trim(lines[i]))) { rows.push(trim(lines[i])); i++; }
        h += renderTableHTML(rows, ctx);
        continue;
      }
      if (/^###\s+/.test(raw)) h += '<h4>' + inlineFmt(escHtml(raw.replace(/^###\s+/, ''))) + '</h4>';
      else h += '<p>' + applyFootnotes(inlineFmt(escHtml(raw)), ctx) + '</p>';
      i++;
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

    // Chicago notes-bibliography: render in-text citations as superscript
    // footnote markers and collect the notes for a Catatan Kaki section.
    var notesMode = String(style).toLowerCase() === 'chicago-notes';
    var fnCtx = notesMode
      ? { refs: (isArray(st.references) ? st.references : []), n: 0, notes: [] }
      : null;

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
        body += '<div class="sec">' + renderContentHTML(sec.content, fnCtx) + '</div>';
      }
      body += '</section>';
    }

    /* ---- catatan kaki (Chicago notes) ---- */
    var fn = '';
    if (notesMode && fnCtx.notes.length) {
      fn = '<section class="page"><h2 class="ctr">CATATAN KAKI</h2><div class="biblio">';
      for (var fi = 0; fi < fnCtx.notes.length; fi++) {
        fn += '<p class="ref"><sup>' + fnCtx.notes[fi].n + '</sup> ' +
              inlineFmt(escHtml(fnCtx.notes[fi].text)) + '</p>';
      }
      fn += '</div></section>';
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
      '.proposal sup.fn{font-size:.7em;line-height:0;vertical-align:super;}' +
      '.proposal .ph{background:#fff3cd;color:#8a6d00;border:1px dashed #d9a900;border-radius:3px;padding:0 3px;font-style:italic;font-size:.92em;}' +
      '.proposal table.prop-tbl{border-collapse:collapse;width:100%;margin:8px 0 14px;font-size:11pt;}' +
      '.proposal table.prop-tbl th,.proposal table.prop-tbl td{border:1px solid #333;padding:5px 8px;text-align:center;vertical-align:middle;}' +
      '.proposal table.prop-tbl th{font-weight:bold;background:#f0f0f0;}' +
      '.proposal table.prop-tbl td:nth-child(2){text-align:left;}' +
      '@media print{.proposal .page{box-shadow:none;margin:0;page-break-after:always;}}' +
      '</style>';

    return '<div class="proposal">' + cssStyle + cover + kata + toc + body + fn + dp + '</div>';
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
  /* ---- 7) styleCheck + plagiarismCheck (honest, client-side) ------------- */
  function _collectText(project) {
    var st = (project && project.state) || {};
    var chs = (st.chapters && hasNonEmptyContent(st.chapters)) ? st.chapters : scaffoldProposal(project);
    var out = [];
    for (var i = 0; i < chs.length; i++) {
      var secs = chs[i].sections || [];
      for (var j = 0; j < secs.length; j++) if (secs[j].content) out.push(secs[j].content);
    }
    return out.join('\n\n');
  }
  function _plainProse(t) {
    return String(t || '').replace(/〔[^〕]*〕/g, ' ').replace(/\([^)]*\d{4}[^)]*\)/g, ' ').replace(/\s+/g, ' ');
  }

  // Flag phrasings that make Indonesian prose read as AI-generated.
  function styleCheck(project) {
    var text = _plainProse(_collectText(project));
    var lc = ' ' + text.toLowerCase() + ' ';
    var words = (text.match(/[A-Za-zÀ-ÿ']+/g) || []).length || 1;
    var flags = [];
    var PATTERNS = [
      { label: 'Klise pembuka umum', re: /\b(di era (globalisasi|modern|digital)|di zaman (sekarang|modern)|seiring (berjalannya waktu|perkembangan zaman)|tak? dapat dipungkiri|tidak dapat dipungkiri|dewasa ini|di dunia yang serba cepat)\b/g, advice: 'Ganti pembuka klise dengan data/fakta spesifik yang relevan.' },
      { label: 'Konektor formulaik berlebihan', re: /\b(selain itu|lebih lanjut|di sisi lain|dengan demikian|oleh karena itu|adapun|di samping itu)\b/g, advice: 'Kurangi konektor formulaik; variasikan transisi antarkalimat.' },
      { label: 'Frasa pengisi tanpa makna', re: /\b(penting untuk (dicatat|diketahui)|perlu (dicatat|diketahui) bahwa|secara keseluruhan|pada akhirnya|singkatnya|dapat disimpulkan bahwa)\b/g, advice: 'Hapus frasa pengisi yang tidak menambah informasi.' },
      { label: 'Diksi bombastis khas AI', re: /\b(menyelami|menggali lebih dalam|lanskap|holistik|multifaset|tak terbantahkan|sangat krusial|permadani|simfoni)\b/g, advice: 'Gunakan diksi akademik yang lugas dan spesifik.' },
      { label: 'Intensifier berlebihan', re: /\b(sangat|sungguh|amat|begitu)\b/g, advice: 'Batasi kata penguat; biarkan data yang berbicara.' }
    ];
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = lc.match(PATTERNS[i].re);
      var c = m ? m.length : 0;
      if (!c) continue;
      if (PATTERNS[i].label === 'Intensifier berlebihan' && c < 6) continue;
      var sev = (c >= 4) ? 'tinggi' : (c >= 2 ? 'sedang' : 'rendah');
      if (PATTERNS[i].label === 'Intensifier berlebihan') sev = (c >= 10) ? 'tinggi' : 'sedang';
      flags.push({ label: PATTERNS[i].label, count: c, per1000: Math.round(c / words * 1000 * 10) / 10, severity: sev, advice: PATTERNS[i].advice });
    }
    var arr = text.split(/[.!?]+\s+/).filter(function (s) { return s.trim().length > 0; });
    var openings = {};
    for (var s2 = 0; s2 < arr.length; s2++) {
      var w0 = (arr[s2].trim().split(/\s+/)[0] || '').toLowerCase();
      if (w0) openings[w0] = (openings[w0] || 0) + 1;
    }
    var maxOpen = 0, maxWord = '';
    for (var k in openings) if (openings[k] > maxOpen) { maxOpen = openings[k]; maxWord = k; }
    if (arr.length >= 6 && maxOpen >= Math.max(3, Math.ceil(arr.length * 0.25))) {
      flags.push({ label: 'Awal kalimat monoton', count: maxOpen, severity: 'sedang', advice: 'Banyak kalimat diawali kata yang sama ("' + maxWord + '"). Variasikan struktur kalimat.' });
    }
    var score = 100;
    for (var f = 0; f < flags.length; f++) score -= (flags[f].severity === 'tinggi' ? 14 : flags[f].severity === 'sedang' ? 8 : 4);
    if (score < 0) score = 0;
    return { score: score, wordCount: words, flags: flags,
      note: 'Pemeriksaan gaya bersifat heuristik untuk menghindari pola tulisan yang terkesan dihasilkan AI. Bukan vonis; gunakan sebagai panduan menyunting.' };
  }

  // Internal similarity between passages (verbatim/near-duplicate). NOT a web/Turnitin check.
  function plagiarismCheck(project) {
    var text = _plainProse(_collectText(project));
    var sents = text.split(/[.!?]+\s+/).map(function (s) { return s.trim(); })
      .filter(function (s) { return s.split(/\s+/).length >= 6; });
    function shingles(s) {
      var w = s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
      var sh = {}; for (var i = 0; i + 2 < w.length; i++) sh[w[i] + ' ' + w[i + 1] + ' ' + w[i + 2]] = 1; return sh;
    }
    function jac(a, b) {
      var inter = 0, uni = 0, seen = {};
      for (var k in a) { seen[k] = 1; uni++; }
      for (var k2 in b) { if (a[k2]) inter++; else uni++; }
      return uni ? inter / uni : 0;
    }
    var shs = []; for (var s = 0; s < sents.length; s++) shs.push(shingles(sents[s]));
    var dups = [];
    for (var i = 0; i < sents.length; i++) for (var j = i + 1; j < sents.length; j++) {
      var sim = jac(shs[i], shs[j]);
      if (sim >= 0.5) dups.push({ a: sents[i].slice(0, 140), b: sents[j].slice(0, 140), sim: Math.round(sim * 100) });
    }
    dups.sort(function (x, y) { return y.sim - x.sim; });
    var seenSh = {}, total = 0, repeat = 0;
    for (var s3 = 0; s3 < shs.length; s3++) for (var k3 in shs[s3]) { total++; if (seenSh[k3]) repeat++; else seenSh[k3] = 1; }
    var selfSim = total ? Math.round(repeat / total * 100) : 0;
    return { selfSimilarity: selfSim, sentenceCount: sents.length,
      duplicates: dups.slice(0, 15), duplicateCount: dups.length,
      note: 'Cek plagiasi INTERNAL: mengukur kemiripan/pengulangan antarbagian dokumenmu sendiri (bukan pembanding basis data web/Turnitin). Turunkan angka dengan memparafrase bagian yang mirip.' };
  }

  // ---- Originality helpers (shared) ----
  function _sentsOf(text) {
    return String(text || '').replace(/〔[^〕]*〕/g, ' ')
      .split(/[.!?]+\s+/).map(function (s) { return s.trim(); })
      .filter(function (s) { return s.split(/\s+/).length >= 6; });
  }
  function _shin(s) {
    var w = s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    var sh = {}; for (var i = 0; i + 2 < w.length; i++) sh[w[i] + ' ' + w[i + 1] + ' ' + w[i + 2]] = 1; return sh;
  }
  function _jacc(a, b) {
    var inter = 0, uni = 0, k;
    for (k in a) uni++;
    for (k in b) { if (a[k]) inter++; else uni++; }
    return uni ? inter / uni : 0;
  }

  /* Originality self-check: flags sentences that overlap (a) abstracts of the
     references you loaded, or (b) other sentences in your own document. This is
     an INTEGRITY aid (cite or rewrite) — NOT a Turnitin/web database check and
     NOT a way to evade detection. */
  function originalityCheck(project) {
    project = project || {}; var st = project.state || {};
    var refs = isArray(st.references) ? st.references : [];
    var srcs = [];
    for (var r = 0; r < refs.length; r++) {
      var ab = trim(refs[r].abstract || '');
      if (ab.split(/\s+/).length >= 12) srcs.push({ title: refShort(refs[r]), sh: _shin(ab) });
    }
    var chapters = (st.chapters && st.chapters.length && hasNonEmptyContent(st.chapters)) ? st.chapters : scaffoldProposal(project);
    var all = [];
    for (var c = 0; c < chapters.length; c++) {
      var secs = chapters[c].sections || [];
      for (var s = 0; s < secs.length; s++) {
        var ss = _sentsOf(secs[s].content);
        for (var i = 0; i < ss.length; i++) all.push({ text: ss[i], sh: _shin(ss[i]), sec: chapters[c].code + ' — ' + secs[s].title });
      }
    }
    var items = [], totalW = 0, flaggedW = 0;
    for (var a = 0; a < all.length; a++) {
      var wc = all[a].text.split(/\s+/).length; totalW += wc;
      var bestSrc = 0, srcName = null;
      for (var q = 0; q < srcs.length; q++) { var sm = _jacc(all[a].sh, srcs[q].sh); if (sm > bestSrc) { bestSrc = sm; srcName = srcs[q].title; } }
      var bestInt = 0, intTxt = null;
      for (var b = 0; b < all.length; b++) { if (b === a) continue; var si = _jacc(all[a].sh, all[b].sh); if (si > bestInt) { bestInt = si; intTxt = all[b].text; } }
      if (bestSrc >= 0.28) {
        items.push({ section: all[a].sec, text: all[a].text.slice(0, 180), kind: 'sumber', match: srcName, overlap: Math.round(bestSrc * 100),
          suggestion: 'Mirip dengan sumber "' + srcName + '". Beri sitasi bila memang mengutip, atau tulis ulang dengan bahasamu sendiri.' });
        flaggedW += wc;
      } else if (bestInt >= 0.5) {
        items.push({ section: all[a].sec, text: all[a].text.slice(0, 180), kind: 'internal', match: (intTxt || '').slice(0, 120), overlap: Math.round(bestInt * 100),
          suggestion: 'Mirip dengan kalimat lain di dokumenmu. Gabungkan, hapus pengulangan, atau tulis ulang agar tidak berulang.' });
        flaggedW += wc;
      }
    }
    items.sort(function (x, y) { return y.overlap - x.overlap; });
    return { originalityScore: totalW ? Math.round((1 - flaggedW / totalW) * 100) : 100,
      flaggedCount: items.length, sentenceCount: all.length, sourcesChecked: srcs.length, items: items.slice(0, 40),
      note: 'Membandingkan kalimatmu dengan abstrak referensi yang kamu muat dan kalimat lain di dokumenmu — BUKAN basis data global Turnitin. Perbaiki dengan sitasi yang benar atau menulis ulang gagasan dengan bahasamu sendiri.' };
  }

  /* Guided paraphrase assistant: helps you restate a passage in your OWN words
     (with proper citation). It coaches, it does not auto-rewrite — genuine
     paraphrase changes structure + wording and keeps the citation. */
  function paraphraseGuide(text) {
    var sents = _sentsOf(text);
    var starters = ['Berdasarkan penjelasan tersebut, ', 'Dengan kata lain, ', 'Hal ini menunjukkan bahwa ', 'Inti dari pernyataan itu adalah ', 'Secara ringkas, '];
    var out = [];
    for (var i = 0; i < sents.length; i++) {
      var s = sents[i], tips = [];
      if (s.split(/\s+/).length > 25) tips.push('Kalimat ini panjang — pecah menjadi dua kalimat yang lebih ringkas.');
      if (/\b(adalah|merupakan|yaitu)\b/i.test(s)) tips.push('Ubah pola definisi "X adalah ..."; mulai dari inti gagasannya.');
      tips.push('Tutup sumbernya, tulis intinya dengan kata-katamu sendiri, lalu bandingkan.');
      tips.push('Tetap cantumkan sitasi ke sumber asli — parafrase wajib disitasi.');
      out.push({ original: s, tips: tips, starter: starters[i % starters.length] });
    }
    return { count: out.length, items: out,
      note: 'Parafrase yang benar mengubah struktur dan pilihan kata (bukan sekadar ganti sinonim) DAN tetap mencantumkan sitasi. Alat ini memandu, bukan menulis ulang otomatis, agar hasilnya benar-benar bahasamu sendiri.' };
  }

  // ---- BibTeX import (parse .bib text -> add real references) ----
  function _bibClean(s) { return String(s || '').replace(/[{}]/g, '').replace(/\\[a-zA-Z]+\s?/g, '').replace(/\s+/g, ' ').trim(); }
  function _bibAuthors(a) {
    if (!a) return [];
    return a.split(/\s+and\s+/i).map(function (x) {
      x = _bibClean(x); if (!x) return null;
      if (x.indexOf(',') > -1) { var p = x.split(','); return { family: trim(p[0]), given: trim(p[1] || ''), name: x }; }
      var parts = x.split(/\s+/); var fam = parts.pop(); return { family: fam, given: parts.join(' '), name: x };
    }).filter(Boolean);
  }
  function _parseBibBody(body) {
    var fields = {}, k = body.indexOf(','); if (k < 0) return fields;
    var s = body.slice(k + 1), i = 0, n = s.length;
    while (i < n) {
      while (i < n && /[\s,]/.test(s[i])) i++;
      var eq = s.indexOf('=', i); if (eq < 0) break;
      var name = trim(s.slice(i, eq)).toLowerCase(); i = eq + 1;
      while (i < n && /\s/.test(s[i])) i++;
      var val = '', j;
      if (s[i] === '{') { var d = 0; for (j = i; j < n; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (d === 0) { j++; break; } } } val = s.slice(i + 1, j - 1); i = j; }
      else if (s[i] === '"') { j = i + 1; while (j < n && s[j] !== '"') j++; val = s.slice(i + 1, j); i = j + 1; }
      else { j = i; while (j < n && s[j] !== ',') j++; val = trim(s.slice(i, j)); i = j; }
      if (name) fields[name] = val;
    }
    return fields;
  }
  function importBibTeX(project, text) {
    var pid = (project && project.id) ? project.id : (activeProject() && activeProject().id);
    if (!pid) return { ok: false, error: 'Tidak ada proyek aktif.' };
    var s = String(text || ''), i = 0, n = s.length, added = 0, dup = 0, total = 0;
    while (i < n) {
      var at = s.indexOf('@', i); if (at < 0) break;
      var br = s.indexOf('{', at); if (br < 0) break;
      var type = trim(s.slice(at + 1, br)).toLowerCase();
      var d = 0, j = br, end = -1;
      for (; j < n; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (d === 0) { end = j; break; } } }
      if (end < 0) break;
      var body = s.slice(br + 1, end); i = end + 1;
      if (type === 'comment' || type === 'preamble' || type === 'string') continue;
      var f = _parseBibBody(body);
      var title = _bibClean(f.title || ''); if (!title) continue;
      total++;
      var work = {
        source: 'manual',
        type: type === 'book' ? 'book' : (type === 'inproceedings' || type === 'conference') ? 'proceedings' : (type === 'misc' ? 'misc' : 'journal-article'),
        title: title, authors: _bibAuthors(f.author || ''),
        year: f.year ? parseInt(f.year, 10) : null,
        venue: _bibClean(f.journal || f.booktitle || ''), publisher: _bibClean(f.publisher || ''),
        volume: f.volume || '', issue: f.number || '', pages: (f.pages || '').replace(/--/g, '–'),
        doi: (f.doi || '').replace(/^https?:\/\/doi\.org\//i, ''), url: f.url || '',
        abstract: _bibClean(f.abstract || ''),
        verification_status: f.doi ? 'identifier_verified' : 'unverified'
      };
      var res = addReference(pid, work);
      if (res && res.duplicate) dup++; else if (res && res.reference) added++;
    }
    return { ok: true, added: added, duplicate: dup, total: total };
  }

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
    importBibTeX: importBibTeX,
    toRIS: toRIS,
    // reasoning
    recommendMethod: recommendMethod,
    checkConsistency: checkConsistency,
    styleCheck: styleCheck,
    plagiarismCheck: plagiarismCheck,
    // proposal wizard (simple input -> detailed, non-fabricated output)
    FIELDS: FIELDS,
    suggestTitles: suggestTitles,
    deriveFromTitle: deriveFromTitle,
    scaffoldProposal: scaffoldProposal,
    generateFill: generateFill,
    humanize: humanize,
    humanizeChapters: humanizeChapters,
    originalityCheck: originalityCheck,
    paraphraseGuide: paraphraseGuide,
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
