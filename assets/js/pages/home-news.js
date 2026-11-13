/* Beranda — render Berita & Pengumuman dari lapisan data CMS (Tahap 3).
   Isi statis pada HTML adalah cadangan; fungsi ini menimpanya dengan data terkini. */
(async () => {
  await HisaData.load();
  const items = HisaData.terbit();
  const { esc, fmtDate } = HisaData;
  const link = b => `/berita/detail/?slug=${encodeURIComponent(b.slug)}`;
  /* --- Unggulan + slider HP --- */
  const slides = items.slice(0, 4);
  const dotsBox = document.getElementById('m-dots');
  if (slides.length && dotsBox) {
    let cur = 0, timer = null;
    const show = i => {
      cur = i; const b = slides[i];
      document.getElementById('feat-cat').textContent = HisaData.kategoriNama(b.Kategori_ID) || 'Berita';
      document.getElementById('feat-date').textContent = fmtDate(b.publish_at);
      document.getElementById('feat-title').textContent = b.judul;
      document.getElementById('feat-ex').textContent = b.ringkasan;
      document.getElementById('feat-thumb').href = link(b);
      document.querySelector('.featured .link-more').href = link(b);
      const holder = document.getElementById('feat-thumb');
      holder.innerHTML = HisaData.thumbHTML(b);
      holder.querySelectorAll('[data-ic]').forEach(el => { el.innerHTML = icon(el.dataset.ic); });
      HisaData.hydrateMedia(holder);
      dotsBox.querySelectorAll('button').forEach((d, j) => d.classList.toggle('active', j === i));
    };
    dotsBox.innerHTML = '';
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.setAttribute('aria-label', 'Berita ' + (i + 1));
      if (i === 0) d.classList.add('active');
      d.addEventListener('click', () => { show(i); restart(); });
      dotsBox.appendChild(d);
    });
    const restart = () => { clearInterval(timer); if (matchMedia('(max-width:820px)').matches) timer = setInterval(() => show((cur + 1) % slides.length), 6000); };
    show(0); restart();
    addEventListener('resize', restart);
  }
  /* --- Daftar 3 berita berikutnya --- */
  const list = document.getElementById('news-list');
  if (list) list.innerHTML = items.slice(1, 4).map(b => `
    <a class="news-item" href="${link(b)}">
      <span class="thumb">${HisaData.thumbHTML(b, '')}</span>
      <span><span class="meta-date">${icon('calendar')}${esc(fmtDate(b.publish_at))}</span><h4>${esc(b.judul)}</h4></span>
    </a>`).join('') || '<p style="color:var(--ink-soft);font-weight:600">Belum ada berita lain.</p>';
  /* --- Pengumuman --- */
  HisaData.hydrateMedia(list);
  /* --- Pengumuman --- */
  const ann = document.getElementById('announce-list');
  if (ann) ann.innerHTML = HisaData.pengumumanAktif().map(pg => `
    <a class="announce-item" href="${esc(pg.target_href || '/berita/')}">
      <span class="ic">${icon(pg.ikon || 'mega')}</span>
      <span><h4>${esc(pg.judul)}</h4><p>${esc(pg.isi)}</p></span>
      <span class="chev">${icon('chevR')}</span>
    </a>`).join('') || '<p style="padding:14px 18px;color:var(--ink-soft);font-weight:600">Belum ada pengumuman.</p>';
})();
