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
