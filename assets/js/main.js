/* HISANIYAH — inisialisasi bersama semua halaman */
document.addEventListener('DOMContentLoaded', () => {
  const h = document.getElementById('site-header');
  const f = document.getElementById('site-footer');
  if (h) h.innerHTML = renderHeader();
  if (f) f.innerHTML = renderFooter();
  document.body.insertAdjacentHTML('beforeend', renderBottomNav());
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const burger = document.getElementById('btn-burger');
  const mobile = document.getElementById('mobile-menu');
  if (burger && mobile) burger.addEventListener('click', () => {
    const open = mobile.classList.toggle('open');
    burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  });

  /* Pencarian */
  const overlay = document.getElementById('search-overlay');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  function runSearch(){
    const q = (input.value || '').trim().toLowerCase();
    const found = SEARCH_INDEX.filter(x => !q || (x.t + ' ' + x.d).toLowerCase().includes(q));
    results.innerHTML = found.length
      ? found.map(x => `<a href="${x.href}"><span>${x.t}<small>${x.d}</small></span>${icon('arrowR')}</a>`).join('')
      : '<p style="color:#BFE6E3;font-weight:600">Tidak ada hasil untuk kata kunci tersebut.</p>';
  }
  function openSearch(){ overlay.classList.add('open'); runSearch(); setTimeout(()=>input.focus(), 40); }
  function closeSearch(){ overlay.classList.remove('open'); }
  const btnSearch = document.getElementById('btn-search');
  if (btnSearch) btnSearch.addEventListener('click', openSearch);
  const mSearch = document.getElementById('m-search');
  if (mSearch) mSearch.addEventListener('click', () => { mobile.classList.remove('open'); openSearch(); });
  const btnClose = document.getElementById('search-close');
  if (btnClose) btnClose.addEventListener('click', closeSearch);
  const btnGo = document.getElementById('search-go');
  if (btnGo) btnGo.addEventListener('click', runSearch);
  if (input) input.addEventListener('input', runSearch);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
});

/* Pencatat tayang statistik bawaan (19 Nov 2026): satu catatan kecil per
   tayang halaman publik, dilepas tanpa menunggu respons. Anti dobel: satu
   halaman dihitung "unik" maksimal 1x per hari per perangkat (localStorage).
   Tanpa data pribadi — hanya path, slug berita, dan penanda unik. Halaman
   portal/admin tidak dicatat (main.js tidak dimuat di sana). */
document.addEventListener('DOMContentLoaded', () => {
  try {
    const url = window.HISA_API_URL;
    if (!url) return;
    let path = location.pathname;
    if (path === '/index.html') path = '/';
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    if (path.startsWith('/pendataan')) return;
    let slug = '';
    const m = path.match(/^\/berita\/([^\/]+)$/);
    if (m) slug = decodeURIComponent(m[1]);
    if (path === '/berita/detail') slug = new URLSearchParams(location.search).get('slug') || '';
    const tgl = new Date();
    const kunci = 'hisa_stat_' + tgl.getFullYear() + '-' + String(tgl.getMonth() + 1).padStart(2, '0') + '-' + String(tgl.getDate()).padStart(2, '0') + '_' + path;
    let unik = false;
    try { if (!localStorage.getItem(kunci)) { unik = true; localStorage.setItem(kunci, '1'); } } catch (e) {}
    const body = JSON.stringify({ action: 'public.statistik.catat', token: '', payload: { path: path, slug: slug, unik: unik } });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'text/plain;charset=utf-8' }));
    } else {
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, keepalive: true }).catch(() => {});
    }
  } catch (e) {}
});

/* Tombol bagikan artikel (21 Nov 2026): "Salin tautan" (data-salin) dan
   "Bagikan" bawaan HP (data-bagikan-asli) pada halaman berita statis &
   dinamis. Tanpa penanda ini, klik berjalan seperti biasa. */
document.addEventListener('click', (e) => {
  if (!e.target.closest) return;
  const salin = e.target.closest('[data-salin]');
  const asli = e.target.closest('[data-bagikan-asli]');
  if (!salin && !asli) return;
  function toastBagikan(msg) {
    let el = document.querySelector('.share-toast');
    if (!el) { el = document.createElement('div'); el.className = 'share-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('tampil');
    clearTimeout(el._tb);
    el._tb = setTimeout(() => el.classList.remove('tampil'), 2200);
  }
  function salinManual(teks) {
    try {
      const ta = document.createElement('textarea');
      ta.value = teks; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove(); return true;
    } catch (_) { return false; }
  }
  function salinTeks(teks) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(teks).catch(() => salinManual(teks));
    }
    return Promise.resolve(salinManual(teks));
  }
  if (salin) { salinTeks(salin.getAttribute('data-salin')).then(() => toastBagikan('Tautan disalin')); return; }
  const url = asli.getAttribute('data-url');
  const judul = asli.getAttribute('data-judul') || document.title;
  if (navigator.share) {
    navigator.share({ title: judul, text: judul + ' \u2014 HISANIYAH', url: url }).catch(() => {});
  } else {
    salinTeks(url).then(() => toastBagikan('Tautan disalin'));
  }
});
