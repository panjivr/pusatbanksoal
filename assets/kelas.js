/* Kelas "Bisnis Mulai dari Nol" — engine kuliah online (ES5, tanpa build)
   Merender KELAS_DATA jadi: sidebar bab/sesi, penampil blok kaya (teks,
   diagram, tabel, kuis, video), progres tersimpan di localStorage. */
(function () {
  'use strict';
  if (typeof KELAS_DATA === 'undefined') return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var LS = (typeof window !== 'undefined' && window.KELAS_LS) ? window.KELAS_LS : 'bekal_kelas_progress_v1';
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  /* ---- progres ---- */
  function loadProg(){ try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch(e){ return {}; } }
  function saveProg(p){ try { localStorage.setItem(LS, JSON.stringify(p)); } catch(e){} }
  var prog = loadProg();

  /* ---- daftar sesi datar (untuk prev/next) ---- */
  var FLAT = [];
  KELAS_DATA.forEach(function(m){ m.lessons.forEach(function(l){ FLAT.push({m:m, l:l}); }); });
  function lessonIndex(id){ for(var i=0;i<FLAT.length;i++){ if(FLAT[i].l.id===id) return i; } return 0; }
  function totalLessons(){ return FLAT.length; }
  function doneCount(){ var n=0; FLAT.forEach(function(f){ if(prog[f.l.id]) n++; }); return n; }

  /* ============ RENDER BLOK ============ */
  function diagram(b){
    var k=b.kind, nodes=b.nodes||[], h='';
    var head = (b.judul?'<div class="kd-title">'+esc(b.judul)+'</div>':'');
    if(k==='flow'){
      h='<div class="kd-flow">'+nodes.map(function(n,i){
        return '<div class="kd-step"><div class="kd-num">'+(i+1)+'</div><div class="kd-body"><b>'+esc(n.t)+'</b>'+(n.d?'<span>'+esc(n.d)+'</span>':'')+'</div></div>'+
          (i<nodes.length-1?'<div class="kd-arrow" aria-hidden="true">→</div>':'');
      }).join('')+'</div>';
    } else if(k==='funnel'){
      h='<div class="kd-funnel">'+nodes.map(function(n,i){
        var w=100-i*(60/Math.max(1,nodes.length-1));
        return '<div class="kd-frow"><div class="kd-fbar" style="width:'+w+'%"><b>'+esc(n.t)+'</b></div>'+(n.d?'<span class="kd-fd">'+esc(n.d)+'</span>':'')+'</div>';
      }).join('')+'</div>';
    } else if(k==='pyramid'){
      var arr=nodes.slice().reverse();
      h='<div class="kd-pyramid">'+arr.map(function(n,i){
        var w=45+i*(55/Math.max(1,arr.length-1));
        return '<div class="kd-prow"><div class="kd-ptri" style="width:'+w+'%"><b>'+esc(n.t)+'</b></div>'+(n.d?'<span class="kd-fd">'+esc(n.d)+'</span>':'')+'</div>';
      }).join('')+'</div>';
    } else if(k==='cycle'){
      h='<div class="kd-cycle">'+nodes.map(function(n,i){
        return '<div class="kd-cnode"><div class="kd-cdot">'+(i+1)+'</div><div class="kd-body"><b>'+esc(n.t)+'</b>'+(n.d?'<span>'+esc(n.d)+'</span>':'')+'</div></div>'+
          (i<nodes.length-1?'<div class="kd-arrow" aria-hidden="true">↻</div>':'<div class="kd-arrow" aria-hidden="true">⟳</div>');
      }).join('')+'</div>';
    } else if(k==='quad'){
      h='<div class="kd-quad">'+nodes.map(function(n){
        return '<div class="kd-qcell"><b>'+esc(n.t)+'</b>'+(n.d?'<span>'+esc(n.d)+'</span>':'')+'</div>';
      }).join('')+'</div>';
    } else if(k==='bars'){
      h='<div class="kd-bars">'+nodes.map(function(n){
        var v=Math.max(4,Math.min(100,n.v||0));
        return '<div class="kd-brow"><span class="kd-blabel">'+esc(n.t)+'</span><span class="kd-btrack"><span class="kd-bfill" style="width:'+v+'%"></span></span>'+(n.d?'<span class="kd-bval">'+esc(n.d)+'</span>':'')+'</div>';
      }).join('')+'</div>';
    }
    return '<figure class="kd">'+head+h+(b.cap?'<figcaption>'+esc(b.cap)+'</figcaption>':'')+'</figure>';
  }

  function quiz(b, key){
    var opts=b.opts.map(function(o,i){
      return '<button type="button" class="kq-opt" data-q="'+key+'" data-i="'+i+'">'+esc(o)+'</button>';
    }).join('');
    return '<div class="kq" data-a="'+b.a+'" data-key="'+key+'">'+
      '<div class="kq-q"><svg class="i" aria-hidden="true"><use href="#i-list"></use></svg> '+esc(b.q)+'</div>'+
      '<div class="kq-opts">'+opts+'</div>'+
      '<div class="kq-exp" hidden><b>Pembahasan:</b> '+esc(b.exp||'')+'</div></div>';
  }

  function block(b, i){
    switch(b.t){
      case 'lead': return '<p class="k-lead">'+b.x+'</p>';
      case 'p': return '<p class="k-p">'+b.x+'</p>';
      case 'h': return '<h3 class="k-h">'+esc(b.x)+'</h3>';
      case 'list': return '<ul class="k-list">'+b.items.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
      case 'steps': return '<ol class="k-steps">'+b.items.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol>';
      case 'callout':
        var ic={key:'i-check',tip:'i-sparkles',warn:'i-bolt',quote:'i-book'}[b.k]||'i-check';
        return '<div class="k-call k-'+esc(b.k)+'">'+
          (b.k==='quote'?'':'<div class="k-call-h"><svg class="i" aria-hidden="true"><use href="#'+ic+'"></use></svg>'+(b.judul?'<b>'+esc(b.judul)+'</b>':'')+'</div>')+
          '<div class="k-call-b">'+b.x+'</div></div>';
      case 'table':
        var th=(b.head||[]).map(function(x){return '<th>'+x+'</th>';}).join('');
        var tr=(b.rows||[]).map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}).join('');
        return '<figure class="k-tablewrap"><table class="k-table">'+(th?'<thead><tr>'+th+'</tr></thead>':'')+'<tbody>'+tr+'</tbody></table>'+(b.cap?'<figcaption>'+esc(b.cap)+'</figcaption>':'')+'</figure>';
      case 'formula':
        return '<div class="k-formula"><code>'+esc(b.x)+'</code>'+(b.cap?'<span>'+esc(b.cap)+'</span>':'')+'</div>';
      case 'diagram': return diagram(b);
      case 'quiz': return quiz(b, 'q'+i);
      case 'books':
        return '<div class="k-books">'+b.items.map(function(bk){
          return '<div class="k-bookcard"><span class="k-bic"><svg class="i" aria-hidden="true"><use href="#i-book"></use></svg></span>'+
            '<div><b>'+esc(bk.judul)+'</b><em>'+esc(bk.penulis)+'</em>'+(bk.ket?'<span>'+esc(bk.ket)+'</span>':'')+'</div></div>';
        }).join('')+'</div>';
      case 'video':
        if(b.src){
          return '<figure class="k-video"><video controls preload="metadata"'+(b.poster?' poster="'+esc(b.poster)+'"':'')+' src="'+esc(b.src)+'"></video>'+(b.cap?'<figcaption>'+esc(b.cap)+'</figcaption>':'')+'</figure>';
        }
        return '<figure class="k-video k-video-soon"><div class="k-vsoon"><svg class="i" aria-hidden="true"><use href="#i-play"></use></svg><span>Video materi menyusul</span></div>'+(b.cap?'<figcaption>'+esc(b.cap)+'</figcaption>':'')+'</figure>';
      case 'img':
        if(b.src) return '<figure class="k-img"><img loading="lazy" src="'+esc(b.src)+'" alt="'+esc(b.cap||'')+'">'+(b.cap?'<figcaption>'+esc(b.cap)+'</figcaption>':'')+'</figure>';
        return '';
      default: return '';
    }
  }

  /* ============ RENDER SIDEBAR ============ */
  function renderNav(activeId){
    var pct = Math.round(doneCount()/Math.max(1,totalLessons())*100);
    var bar = '<div class="kl-prog"><div class="kl-prog-top"><span>Progres</span><b>'+doneCount()+'/'+totalLessons()+'</b></div><div class="kl-bar"><span style="width:'+pct+'%"></span></div></div>';
    var html = KELAS_DATA.map(function(m){
      var items = m.lessons.map(function(l){
        var done = prog[l.id] ? ' done' : '';
        var act = (l.id===activeId) ? ' active' : '';
        return '<a href="#'+l.id+'" class="kl-item'+done+act+'" data-id="'+l.id+'">'+
          '<span class="kl-check"><svg class="i" aria-hidden="true"><use href="#i-check"></use></svg></span>'+
          '<span class="kl-tx">'+esc(l.judul)+'<em>'+esc(l.durasi||'')+'</em></span></a>';
      }).join('');
      return '<div class="kl-mod"><div class="kl-mhead"><span class="kl-mic"><svg class="i" aria-hidden="true"><use href="#'+(m.ikon||'i-book')+'"></use></svg></span>'+
        '<div><small>'+esc(m.label||'')+'</small><b>'+esc(m.judul)+'</b></div></div>'+
        '<div class="kl-items">'+items+'</div></div>';
    }).join('');
    return bar + html;
  }

  /* ============ RENDER SESI ============ */
  function renderLesson(id){
    var idx = lessonIndex(id), cur = FLAT[idx];
    var m = cur.m, l = cur.l;
    var body = l.blocks.map(function(b,i){ return block(b,i); }).join('');
    var done = !!prog[l.id];
    var prev = idx>0 ? FLAT[idx-1].l : null;
    var next = idx<FLAT.length-1 ? FLAT[idx+1].l : null;
    var html =
      '<div class="k-crumb">'+esc(m.label||'')+(m.label?' · ':'')+esc(m.judul)+'</div>'+
      '<h1 class="k-title">'+esc(l.judul)+'</h1>'+
      (l.ringkas?'<p class="k-sub">'+esc(l.ringkas)+'</p>':'')+
      '<article class="k-content">'+body+'</article>'+
      '<div class="k-actions">'+
        '<button type="button" id="kDone" class="btn '+(done?'btn-ghost':'btn-primary')+'" data-id="'+l.id+'">'+
          '<svg class="i" aria-hidden="true"><use href="#i-check"></use></svg> '+(done?'Ditandai selesai':'Tandai selesai')+'</button>'+
      '</div>'+
      '<nav class="k-pager">'+
        (prev?'<a href="#'+prev.id+'" class="k-pg k-prev"><small>Sebelumnya</small><b>'+esc(prev.judul)+'</b></a>':'<span></span>')+
        (next?'<a href="#'+next.id+'" class="k-pg k-next"><small>Selanjutnya</small><b>'+esc(next.judul)+'</b></a>':'<span></span>')+
      '</nav>';
    return html;
  }

  /* ============ WIRING ============ */
  var elNav = $('#klNav'), elMain = $('#klMain');
  function currentIdFromHash(){
    var h=(location.hash||'').replace('#','');
    for(var i=0;i<FLAT.length;i++){ if(FLAT[i].l.id===h) return h; }
    return FLAT[0].l.id;
  }
  function show(id){
    elMain.innerHTML = renderLesson(id);
    elNav.innerHTML = renderNav(id);
    if (elMain.scrollIntoView) window.scrollTo(0,0);
    var act = elNav.querySelector('.kl-item.active');
    if(act && act.scrollIntoView) act.scrollIntoView({block:'nearest'});
    // tutup drawer di mobile
    document.body.classList.remove('kl-open');
  }
  document.addEventListener('click', function(e){
    var done = e.target.closest && e.target.closest('#kDone');
    if(done){ var id=done.getAttribute('data-id'); prog[id]=!prog[id]; saveProg(prog); show(currentIdFromHash()); return; }
    var opt = e.target.closest && e.target.closest('.kq-opt');
    if(opt){
      var box = opt.closest('.kq'); if(box.getAttribute('data-answered')) return;
      box.setAttribute('data-answered','1');
      var a = parseInt(box.getAttribute('data-a'),10), i = parseInt(opt.getAttribute('data-i'),10);
      Array.prototype.forEach.call(box.querySelectorAll('.kq-opt'), function(o,oi){
        o.disabled = true;
        if(oi===a) o.classList.add('correct');
        else if(oi===i) o.classList.add('wrong');
      });
      var exp = box.querySelector('.kq-exp'); if(exp) exp.hidden=false;
      return;
    }
    var burger = e.target.closest && e.target.closest('[data-kl-toggle]');
    if(burger){ document.body.classList.toggle('kl-open'); return; }
    var link = e.target.closest && e.target.closest('.kl-item');
    if(link){ /* biarkan hashchange yang menangani */ }
  });
  window.addEventListener('hashchange', function(){ show(currentIdFromHash()); });
  show(currentIdFromHash());
})();
