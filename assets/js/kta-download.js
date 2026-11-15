/* Unduh KTA — menggambar kartu anggota ke canvas lalu mengunduhnya sebagai PNG.
   Desain meniru persis .kartu-anggota (akun.css), digambar pada skala 2x (1120x706 px). */
(function () {
  var S = 2, W = 560, H = 353;
  var ORANYE = '#FE880D';

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function muatGambar(src, cors) {
    return new Promise(function (resolve) {
      var img = new Image();
      if (cors) img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  /* Foto diambil lewat backend sebagai base64 (berkas Drive tidak bisa dimuat
     lintas-asal ke canvas); cadangan terakhir: muat URL langsung, lalu inisial. */
  async function muatFoto(d) {
    if (!d.foto) return null;
    if (d.alumni && window.HisaData && HisaData.apiCall) {
      try {
        var r = await HisaData.apiCall('alumni.foto.data', { Alumni_ID: d.alumni });
        if (r && r.ada && r.base64) {
          var im = await muatGambar('data:' + (r.mime || 'image/jpeg') + ';base64,' + r.base64, false);
          if (im) return im;
        } else if (r && !r.ada) return null;
      } catch (e) {}
    }
    return muatGambar(d.foto, true);
  }

  function gambarContain(ctx, img, x, y, w, h) {
    var s = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function gambarCover(ctx, img, x, y, w, h) {
    var s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function bungkusTeks(ctx, teks, lebarMax, maksBaris) {
    var kata = String(teks || '').split(/\s+/).filter(Boolean);
    var baris = [], cur = '';
    kata.forEach(function (k) {
      var coba = cur ? cur + ' ' + k : k;
      if (ctx.measureText(coba).width <= lebarMax || !cur) cur = coba;
      else { baris.push(cur); cur = k; }
    });
    if (cur) baris.push(cur);
    return baris.slice(0, maksBaris);
  }

  async function gambarKTA(d) {
    var cv = document.createElement('canvas');
    cv.width = W * S; cv.height = H * S;
    var ctx = cv.getContext('2d');
    ctx.scale(S, S);
    ctx.textBaseline = 'top';
    try {
      await Promise.race([
        Promise.all([
          document.fonts.load('800 29px "Plus Jakarta Sans"'),
          document.fonts.load('800 11px "Plus Jakarta Sans"'),
          document.fonts.load('600 10px "Plus Jakarta Sans"')
        ]),
        new Promise(function (r) { setTimeout(r, 1500); })
      ]);
    } catch (e) {}
    var F = '"Plus Jakarta Sans", Arial, sans-serif';

    var hasil = await Promise.all([
      muatGambar('/assets/img/logo-hisaniyah-trans-256.png', false),
      muatFoto(d),
      muatGambar('https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=6&data=' +
        encodeURIComponent('https://hisaniyah.or.id/verifikasi/?kode=' + (d.kode || '')), true)
    ]);
    var logo = hasil[0], foto = hasil[1], qr = hasil[2];
    if (!qr) qr = await muatGambar('https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=6&data=' +
      encodeURIComponent('https://hisaniyah.or.id/verifikasi/?kode=' + (d.kode || '')), true);

    /* ===== latar ===== */
    rr(ctx, 0, 0, W, H, 20); ctx.save(); ctx.clip();
    var a = 120 * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a);
    var L = (Math.abs(W * dx) + Math.abs(H * dy)) / 2, cx = W / 2, cy = H / 2;
    var g = ctx.createLinearGradient(cx - dx * L, cy - dy * L, cx + dx * L, cy + dy * L);
    g.addColorStop(0, '#014545'); g.addColorStop(0.45, '#015C5C');
    g.addColorStop(0.72, '#016767'); g.addColorStop(1, '#027C78');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var rg = ctx.createRadialGradient(625, 25, 0, 625, 25, 105);
    rg.addColorStop(0, 'rgba(254,136,13,0.38)'); rg.addColorStop(0.7, 'rgba(254,136,13,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

    var PADX = 24;
    /* ===== kepala kartu ===== */
    var headY = 22, logoUk = 46;
    ctx.fillStyle = '#fff'; rr(ctx, PADX, headY, logoUk, logoUk, 12); ctx.fill();
    if (logo) gambarContain(ctx, logo, PADX + 5, headY + 5, logoUk - 10, logoUk - 10);
    var garisX = PADX + logoUk + 12;
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(garisX, headY, 2, logoUk);
    var teksX = garisX + 12;
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    try { ctx.letterSpacing = '2px'; } catch (e) {}
    ctx.font = '800 19px ' + F;
    ctx.fillText('HISANIYAH', teksX, headY + 3);
    try { ctx.letterSpacing = '1.1px'; } catch (e) {}
    ctx.font = '600 10px ' + F; ctx.fillStyle = '#EAF6F5';
    ctx.fillText('HIMPUNAN SANTRI-ALUMNI K.H. YAHYA SYABRAWI', teksX, headY + 29);
    try { ctx.letterSpacing = '0px'; } catch (e) {}
    /* pil KARTU ANGGOTA */
    ctx.font = '800 10.5px ' + F;
    try { ctx.letterSpacing = '1.1px'; } catch (e) {}
    var lebarPil = ctx.measureText('KARTU ANGGOTA').width + 26 + 8;
    var pilH = 27, pilX = W - PADX - lebarPil, pilY = headY + (logoUk - pilH) / 2;
    ctx.fillStyle = ORANYE; rr(ctx, pilX, pilY, lebarPil, pilH, pilH / 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.fillText('KARTU ANGGOTA', pilX + lebarPil / 2, pilY + 8);
    ctx.textAlign = 'left';
    try { ctx.letterSpacing = '0px'; } catch (e) {}
    /* garis bawah kepala */
    var headBawah = headY + logoUk + 14;
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(PADX, headBawah, W - PADX * 2, 2);

    /* ===== badan kartu ===== */
    var bodyTop = headBawah + 14, bodyBottom = H - 28, bodyMid = (bodyTop + bodyBottom) / 2;
    /* foto */
    var fotoW = 100, fotoH = 128, fotoX = PADX, fotoY = bodyMid - fotoH / 2;
    ctx.save(); rr(ctx, fotoX + 3, fotoY + 3, fotoW - 6, fotoH - 6, 11); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(fotoX + 3, fotoY + 3, fotoW - 6, fotoH - 6);
    if (foto) gambarCover(ctx, foto, fotoX + 3, fotoY + 3, fotoW - 6, fotoH - 6);
    else {
      var inisial = String(d.nama || 'A').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
      ctx.fillStyle = '#fff'; ctx.font = '800 30px ' + F; ctx.textAlign = 'center';
      try { ctx.letterSpacing = '1px'; } catch (e) {}
      ctx.fillText(inisial, fotoX + fotoW / 2, fotoY + fotoH / 2 - 19);
      ctx.textAlign = 'left';
      try { ctx.letterSpacing = '0px'; } catch (e) {}
    }
    ctx.restore();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    rr(ctx, fotoX + 1.5, fotoY + 1.5, fotoW - 3, fotoH - 3, 12.5); ctx.stroke();

    /* info (di antara dua garis tegak) */
    var infoX = fotoX + fotoW + 16 + 16;         /* garis kiri + padding */
    var qrBlokW = 104, qrX = W - PADX - qrBlokW;
    var infoKanan = qrX - 16;                    /* garis kanan */
    var infoLebar = infoKanan - 16 - infoX;
    var nama = String(d.nama || '-');
    var fsNama = nama.length > 28 ? 19 : (nama.length > 18 ? 24 : 29);
    var lhNama = nama.length > 28 ? 1.3 : 1.2;
    ctx.font = '800 ' + fsNama + 'px ' + F;
    var barisNama = bungkusTeks(ctx, nama, infoLebar, 2);
    var meta = [d.angkatan, d.korda].filter(Boolean);
    var tinggiInfo = 14 + 3 + barisNama.length * fsNama * lhNama + 14 + 14 + 3 + 28 +
      (meta.length ? 10 + meta.length * 22.5 : 0);
    var y = bodyMid - tinggiInfo / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(infoX - 16, y, 2, tinggiInfo);
    ctx.fillRect(infoKanan, y, 2, tinggiInfo);
    ctx.font = '800 11px ' + F; ctx.fillStyle = ORANYE;
    try { ctx.letterSpacing = '2px'; } catch (e) {}
    ctx.fillText('NAMA ANGGOTA', infoX, y); y += 14 + 3;
    try { ctx.letterSpacing = '0px'; } catch (e) {}
    ctx.font = '800 ' + fsNama + 'px ' + F; ctx.fillStyle = '#fff';
    barisNama.forEach(function (b) { ctx.fillText(b, infoX, y); y += fsNama * lhNama; });
    y += 14;
    ctx.font = '800 11px ' + F; ctx.fillStyle = ORANYE;
    try { ctx.letterSpacing = '2px'; } catch (e) {}
    ctx.fillText('NOMOR ANGGOTA', infoX, y); y += 14 + 3;
    try { ctx.letterSpacing = '1.5px'; } catch (e) {}
    ctx.font = '800 23px ' + F; ctx.fillStyle = '#fff';
    ctx.fillText(String(d.nomor || '-'), infoX, y); y += 28;
    try { ctx.letterSpacing = '0px'; } catch (e) {}
    if (meta.length) {
      y += 10;
      ctx.font = '400 15px ' + F; ctx.fillStyle = '#fff';
      meta.forEach(function (m) { ctx.fillText(String(m), infoX, y); y += 22.5; });
    }

    /* QR */
    var qrUk = 104, capBaris = ['Pindai untuk', 'verifikasi'];
    var blokH = qrUk + 7 + capBaris.length * 13;
    var qrY = bodyMid - blokH / 2;
    ctx.fillStyle = '#fff'; rr(ctx, qrX, qrY, qrUk, qrUk, 14); ctx.fill();
    if (qr) ctx.drawImage(qr, qrX + 6, qrY + 6, qrUk - 12, qrUk - 12);
    ctx.font = '400 10.5px ' + F; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    capBaris.forEach(function (b, i) { ctx.fillText(b, qrX + qrUk / 2, qrY + qrUk + 7 + i * 13); });
    ctx.textAlign = 'left';

    /* garis oranye bawah */
    ctx.fillStyle = ORANYE; ctx.fillRect(0, H - 8, W, 8);
    ctx.restore();
    return cv;
  }

  async function unduhKTA(btn) {
    var d = {
      alumni: btn.getAttribute('data-alumni') || '',
      nama: btn.getAttribute('data-nama') || '',
      nomor: btn.getAttribute('data-nomor') || '',
      angkatan: btn.getAttribute('data-angkatan') || '',
      korda: btn.getAttribute('data-korda') || '',
      foto: btn.getAttribute('data-foto') || '',
      kode: btn.getAttribute('data-kode') || ''
    };
    var labelAsli = btn.textContent;
    btn.disabled = true; btn.textContent = 'Menyiapkan gambar…';
    try {
      var cv = await gambarKTA(d);
      var namaBerkas = 'KTA-' + (d.nomor || 'anggota').replace(/[^\w-]+/g, '') + '.png';
      if (cv.toBlob) {
        cv.toBlob(function (blob) {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = namaBerkas;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
          btn.disabled = false; btn.textContent = labelAsli;
        }, 'image/png');
      } else {
        var a2 = document.createElement('a');
        a2.href = cv.toDataURL('image/png'); a2.download = namaBerkas;
        document.body.appendChild(a2); a2.click(); a2.remove();
        btn.disabled = false; btn.textContent = labelAsli;
      }
    } catch (e) {
      btn.disabled = false; btn.textContent = labelAsli;
      alert('Maaf, gambar KTA gagal dibuat. Silakan coba lagi.');
    }
  }

  window.unduhKTA = unduhKTA;
  window.gambarKTA = gambarKTA;
})();
