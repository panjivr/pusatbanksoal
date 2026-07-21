/* PusatBankSoal.id — Certificate generator (self-contained SVG + PNG export) */
(function () {
  var W = 1000, H = 707;
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function barcode(id, x, y, h, maxw){
    var s = (String(id) || 'PBS').replace(/[^A-Za-z0-9]/g,'').toUpperCase() || 'PBS';
    var out = '', cx = x, i = 0;
    while (cx < x + maxw - 4 && i < 400){
      var c = s.charCodeAt(i % s.length) + i * 7;
      var bw = 1.4 + (c % 4);
      out += '<rect x="'+cx.toFixed(1)+'" y="'+y+'" width="'+bw.toFixed(1)+'" height="'+h+'" fill="#0b0e11"/>';
      cx += bw + (1.4 + ((c >> 2) % 3));
      i++;
    }
    return out;
  }

  function make(o){
    var id = esc(o.id), name = esc(o.name || 'Peserta'), test = esc(o.testName || 'Tryout'),
        date = esc(o.date || ''), big = esc(o.scoreBig), cap = esc(o.scoreCaption || 'SKOR'),
        pred = esc(o.predikat || ''), pct = esc(o.percentile || '');
    var idClean = (String(o.id) || '').replace(/[^A-Za-z0-9]/g,'').toUpperCase();

    return '' +
'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" font-family="Inter, Arial, Helvetica, sans-serif">' +
  '<defs>' +
    '<linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#2dbdb6"/><stop offset="0.4" stop-color="#8b5cf6"/>' +
      '<stop offset="0.7" stop-color="#fcd535"/><stop offset="1" stop-color="#2dbdb6"/>' +
    '</linearGradient>' +
    '<radialGradient id="glow" cx="0.5" cy="0.42" r="0.55">' +
      '<stop offset="0" stop-color="#fcd535" stop-opacity="0.14"/><stop offset="1" stop-color="#fcd535" stop-opacity="0"/>' +
    '</radialGradient>' +
    '<path id="sealArc" d="M 838 470 m -64 0 a 64 64 0 1 1 128 0 a 64 64 0 1 1 -128 0" fill="none"/>' +
  '</defs>' +
  // canvas
  '<rect width="'+W+'" height="'+H+'" fill="#0b0e11"/>' +
  '<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="url(#glow)"/>' +
  // decorative frames
  '<rect x="18" y="18" width="'+(W-36)+'" height="'+(H-36)+'" fill="none" stroke="#fcd535" stroke-width="2.5"/>' +
  '<rect x="30" y="30" width="'+(W-60)+'" height="'+(H-60)+'" fill="none" stroke="#3a3a1f" stroke-width="1"/>' +
  '<rect x="36" y="36" width="'+(W-72)+'" height="'+(H-72)+'" fill="none" stroke="#2b3139" stroke-width="1"/>' +
  // corner flourishes
  cornerSet() +
  // header
  '<g transform="translate(500,86)" text-anchor="middle">' +
    '<rect x="-118" y="-24" width="30" height="30" rx="6" fill="#fcd535"/>' +
    '<text x="-103" y="-2" text-anchor="middle" font-size="19" font-weight="800" fill="#181a20">P</text>' +
    '<text x="-78" y="-1" text-anchor="start" font-size="19" font-weight="800" fill="#ffffff">Pusat<tspan fill="#fcd535">BankSoal</tspan></text>' +
  '</g>' +
  '<text x="500" y="150" text-anchor="middle" font-size="46" font-weight="800" letter-spacing="4" fill="#ffffff">SERTIFIKAT HASIL</text>' +
  '<text x="500" y="188" text-anchor="middle" font-size="20" font-weight="600" letter-spacing="8" fill="#fcd535">TRYOUT ' + esc(String(o.badge || 'RESMI').toUpperCase()) + '</text>' +
  '<line x1="360" y1="206" x2="640" y2="206" stroke="#2b3139" stroke-width="1"/>' +
  // score block
  '<text x="500" y="248" text-anchor="middle" font-size="13" font-weight="600" letter-spacing="4" fill="#707a8a">' + cap + '</text>' +
  '<text x="500" y="360" text-anchor="middle" font-size="130" font-weight="800" fill="#fcd535" font-family="Inter, Arial, sans-serif">' + big + '</text>' +
  '<text x="500" y="398" text-anchor="middle" font-size="18" font-weight="700" letter-spacing="2" fill="#ffffff">' + esc(pred) + (pct ? '  ·  ' + esc(pct) : '') + '</text>' +
  // recipient
  '<text x="500" y="452" text-anchor="middle" font-size="12" letter-spacing="3" fill="#707a8a">DIBERIKAN KEPADA</text>' +
  '<text x="500" y="486" text-anchor="middle" font-size="30" font-weight="700" fill="#ffffff">' + name + '</text>' +
  '<text x="500" y="514" text-anchor="middle" font-size="14" fill="#929aa5">' + test + '</text>' +
  // hologram (left)
  '<g transform="translate(120,430)">' +
    '<rect x="-46" y="-56" width="92" height="120" rx="10" fill="url(#holo)" opacity="0.85"/>' +
    '<rect x="-46" y="-56" width="92" height="120" rx="10" fill="none" stroke="#ffffff" stroke-opacity="0.3"/>' +
    '<circle cx="0" cy="-6" r="26" fill="#0b0e11" opacity="0.55"/>' +
    '<path d="M -11 -6 l 7 8 l 15 -16" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<text x="0" y="42" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="1" fill="#0b0e11">AUTHENTIC</text>' +
  '</g>' +
  // seal (right)
  '<g>' +
    '<circle cx="838" cy="470" r="64" fill="none" stroke="#fcd535" stroke-width="2"/>' +
    '<circle cx="838" cy="470" r="52" fill="#1e2329"/>' +
    '<circle cx="838" cy="470" r="52" fill="none" stroke="#3a3a1f" stroke-width="1"/>' +
    '<text font-size="10.5" font-weight="700" letter-spacing="2" fill="#fcd535"><textPath href="#sealArc" startOffset="4%">• PUSATBANKSOAL.ID • TERVERIFIKASI •</textPath></text>' +
    '<path d="M 826 468 l 8 9 l 17 -19" fill="none" stroke="#fcd535" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<text x="838" y="500" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="2" fill="#929aa5">OFFICIAL SEAL</text>' +
  '</g>' +
  // meta + barcode
  '<line x1="60" y1="560" x2="940" y2="560" stroke="#2b3139" stroke-width="1"/>' +
  '<text x="70" y="588" font-size="12" fill="#707a8a">CERTIFICATE ID</text>' +
  '<text x="70" y="608" font-size="15" font-weight="700" fill="#ffffff" font-family="IBM Plex Mono, monospace">' + id + '</text>' +
  '<text x="70" y="636" font-size="12" fill="#707a8a">TANGGAL TERBIT</text>' +
  '<text x="70" y="656" font-size="14" font-weight="600" fill="#eaecef">' + date + '</text>' +
  // barcode area
  '<rect x="372" y="590" width="256" height="52" rx="4" fill="#ffffff"/>' +
  barcode(idClean, 384, 598, 36, 232) +
  '<text x="500" y="637" text-anchor="middle" font-size="10" letter-spacing="2" fill="#0b0e11" font-family="IBM Plex Mono, monospace">' + esc(idClean) + '</text>' +
  // signature
  '<text x="930" y="600" text-anchor="end" font-size="26" fill="#eaecef" font-style="italic" font-family="Georgia, serif">Verified</text>' +
  '<line x1="760" y1="612" x2="930" y2="612" stroke="#2b3139" stroke-width="1"/>' +
  '<text x="930" y="632" text-anchor="end" font-size="11" fill="#707a8a">Certification Officer</text>' +
  '<text x="930" y="648" text-anchor="end" font-size="11" fill="#707a8a">PusatBankSoal.id Authority</text>' +
  // ribbon
  '<rect x="360" y="668" width="280" height="22" rx="11" fill="#1e2329" stroke="#3a3a1f"/>' +
  '<text x="500" y="683" text-anchor="middle" font-size="10" font-weight="700" letter-spacing="3" fill="#fcd535">SECURE • VERIFIED • TRUSTED</text>' +
'</svg>';
  }

  function cornerSet(){
    function c(x,y,sx,sy){
      return '<g transform="translate('+x+','+y+') scale('+sx+','+sy+')" fill="none" stroke="#fcd535" stroke-width="2">' +
        '<path d="M 0 34 L 0 8 Q 0 0 8 0 L 34 0"/>' +
        '<path d="M 12 30 L 12 16 Q 12 12 16 12 L 30 12" stroke="#3a3a1f"/>' +
      '</g>';
    }
    return c(40,40,1,1) + c(960,40,-1,1) + c(40,667,1,-1) + c(960,667,-1,-1);
  }

  function svgDataUri(svg){ return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

  function downloadPNG(svg, filename){
    var img = new Image();
    img.onload = function(){
      var scale = 2, cv = document.createElement('canvas');
      cv.width = W * scale; cv.height = H * scale;
      var ctx = cv.getContext('2d');
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.drawImage(img, 0, 0, W, H);
      try {
        cv.toBlob(function(blob){
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = filename || 'sertifikat-pusatbanksoal.png';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
        }, 'image/png');
      } catch (e) {
        var a2 = document.createElement('a'); a2.href = cv.toDataURL('image/png');
        a2.download = filename || 'sertifikat.png'; a2.click();
      }
    };
    img.onerror = function(){ window.open(svgDataUri(svg), '_blank'); };
    img.src = svgDataUri(svg);
  }

  function show(o){
    var svg = make(o);
    var ov = document.createElement('div');
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-label', 'Sertifikat hasil tryout');
    ov.style.cssText = 'position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.82);backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow:auto;padding:24px 16px';
    var wrap = document.createElement('div');
    wrap.style.cssText = 'width:100%;max-width:900px;margin:auto';
    var frame = document.createElement('div');
    frame.style.cssText = 'width:100%;border-radius:12px;overflow:hidden;box-shadow:0 24px 80px -20px rgba(0,0,0,.8);border:1px solid #2b3139';
    frame.innerHTML = svg;
    var svgEl = frame.querySelector('svg');
    if (svgEl) { svgEl.style.width = '100%'; svgEl.style.height = 'auto'; svgEl.style.display = 'block'; }
    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:18px';
    bar.innerHTML =
      '<button class="btn btn-primary" data-cert="dl"><svg class="i"><use href="#i-doc"></use></svg> Unduh Sertifikat (PNG)</button>' +
      '<button class="btn btn-secondary" data-cert="new"><svg class="i"><use href="#i-refresh"></use></svg> Ubah Nama</button>' +
      '<button class="btn btn-ghost" data-cert="close">Tutup</button>';
    wrap.appendChild(frame); wrap.appendChild(bar); ov.appendChild(wrap);
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    function close(){ ov.remove(); document.body.style.overflow = ''; }
    bar.querySelector('[data-cert="dl"]').addEventListener('click', function(){
      downloadPNG(svg, 'sertifikat-' + (String(o.id) || 'pbs').replace(/[^A-Za-z0-9]/g,'') + '.png');
    });
    bar.querySelector('[data-cert="new"]').addEventListener('click', function(){
      var nm = window.prompt('Masukkan nama untuk sertifikat:', o.name || '');
      if (nm !== null) { close(); o.name = nm.trim() || o.name; show(o); }
    });
    bar.querySelector('[data-cert="close"]').addEventListener('click', close);
    ov.addEventListener('click', function(e){ if (e.target === ov) close(); });
  }

  function genId(){
    var y = new Date().getFullYear();
    var r = Math.floor(1000 + Math.random() * 9000);
    var s = Math.floor(100 + Math.random() * 900);
    return 'PBS-' + y + '-' + r + '-' + s;
  }

  window.PBSCert = { make: make, show: show, downloadPNG: downloadPNG, genId: genId };
})();
