/* Editor foto KTA — pratinjau + geser + zoom + potong rasio potret (100:128).
   cropFoto(file) -> Promise<base64 JPEG tanpa awalan data: | null bila dibatalkan>.
   Dipakai halaman Akun Saya dan halaman ubah data alumni. Tanpa pustaka luar. */
(function () {
  var FW = 600, FH = 768;               /* bingkai kerja = rasio slot foto KTA */
  var OUT_W = 600, OUT_H = 768;         /* ukuran hasil unggahan */

  var CSS = [
    '.fc-overlay{position:fixed;inset:0;background:rgba(1,38,38,.6);z-index:9999;display:grid;place-items:center;padding:14px}',
    '.fc-card{background:#fff;border-radius:18px;padding:18px;width:min(94vw,384px);box-shadow:0 24px 60px rgba(0,0,0,.35);font-family:"Plus Jakarta Sans",Arial,sans-serif}',
    '.fc-card h3{margin:0 0 4px;font-size:18px;font-weight:800;color:#123}',
    '.fc-card p{margin:0 0 12px;font-size:13.5px;color:#5b6b6b}',
    '.fc-frame{border-radius:14px;overflow:hidden;border:2px solid #d7e6e6;background:#0b4f4f;touch-action:none;cursor:grab}',
    '.fc-frame:active{cursor:grabbing}',
    '.fc-frame canvas{display:block;width:100%;height:auto}',
    '.fc-zoom{display:flex;align-items:center;gap:10px;margin:14px 2px 4px}',
    '.fc-zoom span{font-size:17px;font-weight:800;color:#016767;width:16px;text-align:center}',
    '.fc-zoom input{flex:1;accent-color:#FE880D;height:28px}',
    '.fc-btns{display:flex;gap:10px;margin-top:12px}',
    '.fc-btns button{flex:1;padding:12px 10px;border-radius:999px;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer}',
    '.fc-batal{background:#fff;border:2px solid #016767;color:#016767}',
    '.fc-pakai{background:#FE880D;border:2px solid #FE880D;color:#fff}'
  ].join('\n');

  function pastikanGaya() {
    if (document.getElementById('fc-style')) return;
    var s = document.createElement('style');
    s.id = 'fc-style'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function cropFoto(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { buka(img, url, resolve); };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  function buka(img, url, resolve) {
    pastikanGaya();
    var selesai = false;
    function tutup(hasil) {
      if (selesai) return; selesai = true;
      URL.revokeObjectURL(url);
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
      resolve(hasil);
    }

    var overlay = document.createElement('div');
    overlay.className = 'fc-overlay';
    overlay.innerHTML =
      '<div class="fc-card" role="dialog" aria-label="Atur foto">' +
      '<h3>Atur Foto</h3>' +
      '<p>Geser foto untuk memposisikan wajah, gunakan penggeser atau cubit untuk memperbesar. Bagian di dalam bingkai inilah yang tampil di kartu.</p>' +
      '<div class="fc-frame"><canvas width="' + FW + '" height="' + FH + '"></canvas></div>' +
      '<div class="fc-zoom"><span>−</span><input type="range" min="100" max="300" value="100" aria-label="Perbesar foto"><span>+</span></div>' +
      '<div class="fc-btns"><button type="button" class="fc-batal">Batal</button>' +
      '<button type="button" class="fc-pakai">Pakai Foto Ini</button></div>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    var canvas = overlay.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var slider = overlay.querySelector('input[type=range]');
    var cover = Math.max(FW / img.naturalWidth, FH / img.naturalHeight);
    var zoom = 1, offX = 0, offY = 0;

    function clampGeser() {
      var dw = img.naturalWidth * cover * zoom, dh = img.naturalHeight * cover * zoom;
      var mx = Math.max(0, (dw - FW) / 2), my = Math.max(0, (dh - FH) / 2);
      offX = Math.min(mx, Math.max(-mx, offX));
      offY = Math.min(my, Math.max(-my, offY));
    }
    function gambar() {
      clampGeser();
      var dw = img.naturalWidth * cover * zoom, dh = img.naturalHeight * cover * zoom;
      ctx.fillStyle = '#0b4f4f'; ctx.fillRect(0, 0, FW, FH);
      ctx.drawImage(img, (FW - dw) / 2 + offX, (FH - dh) / 2 + offY, dw, dh);
    }
    gambar();

    /* geser: mouse + sentuh (Pointer Events), cubit dua jari untuk zoom */
    var penunjuk = new Map();
    var jarakAwal = 0, zoomAwal = 1;
    var frame = overlay.querySelector('.fc-frame');
    function faktor() { return FW / frame.getBoundingClientRect().width; }
    frame.addEventListener('pointerdown', function (e) {
      frame.setPointerCapture(e.pointerId);
      penunjuk.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (penunjuk.size === 2) {
        var p = Array.from(penunjuk.values());
        jarakAwal = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        zoomAwal = zoom;
      }
    });
    frame.addEventListener('pointermove', function (e) {
      if (!penunjuk.has(e.pointerId)) return;
      var lama = penunjuk.get(e.pointerId);
      penunjuk.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (penunjuk.size === 1) {
        offX += (e.clientX - lama.x) * faktor();
        offY += (e.clientY - lama.y) * faktor();
        gambar();
      } else if (penunjuk.size === 2) {
        var p = Array.from(penunjuk.values());
        var jarak = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        if (jarakAwal > 0) {
          zoom = Math.min(3, Math.max(1, zoomAwal * jarak / jarakAwal));
          slider.value = Math.round(zoom * 100);
          gambar();
        }
      }
    });
    function lepas(e) { penunjuk.delete(e.pointerId); }
    frame.addEventListener('pointerup', lepas);
    frame.addEventListener('pointercancel', lepas);
    frame.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoom = Math.min(3, Math.max(1, zoom + (e.deltaY < 0 ? 0.08 : -0.08)));
      slider.value = Math.round(zoom * 100);
      gambar();
    }, { passive: false });
    slider.addEventListener('input', function () { zoom = slider.value / 100; gambar(); });

    overlay.querySelector('.fc-batal').addEventListener('click', function () { tutup(null); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) tutup(null); });
    overlay.querySelector('.fc-pakai').addEventListener('click', function () {
      var out = document.createElement('canvas');
      out.width = OUT_W; out.height = OUT_H;
      var octx = out.getContext('2d');
      var dw = img.naturalWidth * cover * zoom, dh = img.naturalHeight * cover * zoom;
      octx.drawImage(img, (FW - dw) / 2 + offX, (FH - dh) / 2 + offY, dw, dh);
      tutup(out.toDataURL('image/jpeg', 0.85).split(',')[1]);
    });
  }

  window.cropFoto = cropFoto;
})();
