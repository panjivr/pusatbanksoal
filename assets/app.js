/* PusatBankSoal.id — shared UI engine: SVG icon sprite + motion (ui-ux-pro-max guided) */
(function () {
  // ---- Inline SVG icon sprite (Lucide-style, 24x24, stroke=currentColor) ----
  // Pages reference icons via: <svg class="i"><use href="#i-name"></use></svg>
  var SPRITE = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' +
    sym('i-check','<polyline points="20 6 9 17 4 12"/>') +
    sym('i-arrow-right','<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>') +
    sym('i-chevron-right','<polyline points="9 18 15 12 9 6"/>') +
    sym('i-chevron-down','<polyline points="6 9 12 15 18 9"/>') +
    sym('i-menu','<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>') +
    sym('i-close','<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>') +
    sym('i-bolt','<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>') +
    sym('i-sparkles','<path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5 10.1 7.6 12 3z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"/>') +
    sym('i-brain','<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8V15a3 3 0 0 0 4 2.8A3 3 0 0 0 12 20V4a3 3 0 0 0-3-1z"/><path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 1 5.8V15a3 3 0 0 1-4 2.8A3 3 0 0 1 12 20"/>') +
    sym('i-book','<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><line x1="19" y1="17" x2="6" y2="17"/>') +
    sym('i-target','<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>') +
    sym('i-trophy','<path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="10" y1="17" x2="14" y2="17"/>') +
    sym('i-fire','<path d="M12 3s4 3.5 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.7-2.5C7 10 6 12 6 14a6 6 0 0 0 12 0c0-5-6-11-6-11z"/>') +
    sym('i-chart','<line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="12" width="3" height="6"/><rect x="11" y="8" width="3" height="10"/><rect x="16" y="4" width="3" height="14"/>') +
    sym('i-trend','<polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/>') +
    sym('i-shield','<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z"/><polyline points="9 12 11 14 15 10"/>') +
    sym('i-users','<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-3-5.2"/>') +
    sym('i-user','<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>') +
    sym('i-clock','<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>') +
    sym('i-calendar','<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="3" x2="8" y2="6"/><line x1="16" y1="3" x2="16" y2="6"/>') +
    sym('i-star','<polygon points="12 3 14.9 9.2 21.5 9.9 16.5 14.4 18 21 12 17.5 6 21 7.5 14.4 2.5 9.9 9.1 9.2 12 3"/>') +
    sym('i-bookmark','<path d="M6 3h12v18l-6-4-6 4V3z"/>') +
    sym('i-play','<polygon points="7 4 20 12 7 20 7 4"/>') +
    sym('i-doc','<path d="M6 2h8l5 5v15H6V2z"/><polyline points="14 2 14 7 19 7"/><line x1="9" y1="12" x2="16" y2="12"/><line x1="9" y1="16" x2="16" y2="16"/>') +
    sym('i-upload','<path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/><polyline points="8 8 12 4 16 8"/><line x1="12" y1="4" x2="12" y2="16"/>') +
    sym('i-search','<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>') +
    sym('i-bell','<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/>') +
    sym('i-cog','<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.5 2h-5l-.4 2.6a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h5l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/>') +
    sym('i-grad','<path d="M2 9l10-4 10 4-10 4L2 9z"/><path d="M6 11v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"/><line x1="22" y1="9" x2="22" y2="15"/>') +
    sym('i-map-pin','<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>') +
    sym('i-money','<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/>') +
    sym('i-ticket','<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><line x1="12" y1="6" x2="12" y2="18" stroke-dasharray="2 2"/>') +
    sym('i-lock','<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>') +
    sym('i-mail','<rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>') +
    sym('i-chat','<path d="M4 5h16v11H8l-4 4V5z"/>') +
    sym('i-list','<line x1="8" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="8" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>') +
    sym('i-layers','<polygon points="12 3 21 8 12 13 3 8 12 3"/><polyline points="3 13 12 18 21 13"/>') +
    sym('i-globe','<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>') +
    sym('i-flag','<path d="M5 21V4h11l-1.5 4L16 12H5"/>') +
    sym('i-shield-check','<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z"/><polyline points="9 12 11 14 15 10"/>') +
    sym('i-refresh','<polyline points="21 4 21 10 15 10"/><path d="M20 14a8 8 0 1 1-2-8l3 4"/>') +
    '</svg>';
  function sym(id, inner){ return '<symbol id="'+id+'" viewBox="0 0 24 24">'+inner+'</symbol>'; }

  function inject(){
    if (!document.getElementById('pbs-sprite')) {
      var d = document.createElement('div'); d.id = 'pbs-sprite'; d.innerHTML = SPRITE;
      document.body.insertBefore(d, document.body.firstChild);
    }
    initReveal(); initCounters(); initNav(); initYear();
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Reveal on scroll ----
  function initReveal(){
    var els = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function(e){ io.observe(e); });
  }

  // ---- Animated counters: <span data-count="2000000" data-suffix="+"> ----
  function initCounters(){
    var els = document.querySelectorAll('[data-count]');
    function fmt(n){ return n.toLocaleString('id-ID'); }
    function run(el){
      var target = parseFloat(el.getAttribute('data-count'));
      var pre = el.getAttribute('data-prefix') || '';
      var suf = el.getAttribute('data-suffix') || '';
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      if (reduce) { el.textContent = pre + (dec ? target.toFixed(dec) : fmt(target)) + suf; return; }
      var dur = 1400, start = null;
      function step(ts){
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = pre + (dec ? val.toFixed(dec) : fmt(Math.floor(val))) + suf;
        if (p < 1) requestAnimationFrame(step); else el.textContent = pre + (dec ? target.toFixed(dec) : fmt(target)) + suf;
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting){ run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach(function(e){ io.observe(e); });
  }

  // ---- Mobile nav toggle (replaces inline onclick) ----
  function initNav(){
    var t = document.querySelector('[data-nav-toggle]');
    var links = document.getElementById('navLinks');
    if (t && links) t.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ---- Current year ----
  function initYear(){
    document.querySelectorAll('[data-year]').forEach(function(e){ e.textContent = new Date().getFullYear(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();
