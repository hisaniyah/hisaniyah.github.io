/* HISANIYAH — komponen bersama: ikon SVG, header, footer, pencarian.
   Satu sumber untuk semua halaman (hindari duplikasi markup). */
const ICONS = {
  shield: '<path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  landmark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="m12 2 9 5H3l9-5Z"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15v3"/><path d="M12 10v8"/><path d="M17 6v12"/></svg>',
  sitemap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="5" rx="1"/><rect x="2.5" y="16.5" width="6" height="5" rx="1"/><rect x="15.5" y="16.5" width="6" height="5" rx="1"/><path d="M12 7.5v4"/><path d="M5.5 16.5v-2.5h13v2.5"/><path d="M12 11.5v2.5"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
  news:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>',
  gallery:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>',
  tv:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="m17 2-5 5-5-5"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  chevD:'<svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  chevR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  arrowD:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  arrowR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 8.5v7l6-3.5-6-3.5Z"/></svg>',
  mega:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2V4Z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7V4Z"/></svg>',
  id:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="11" r="2.2"/><path d="M5.5 16.5c.6-1.4 1.4-2 2.5-2s1.9.6 2.5 2"/><path d="M14.5 9.5H18"/><path d="M14.5 13H18"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14l-3-3"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10.5 9-7 9 7"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-3.6 3.9-5.5 8-5.5s7.2 1.9 8 5.5"/></svg>',
  yt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 7.2a2.8 2.8 0 0 0-2-2C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 11.8a29 29 0 0 0 .5 4.6 2.8 2.8 0 0 0 2 2c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.6 29 29 0 0 0-.5-4.6ZM9.8 15.1V8.5l5.9 3.3-5.9 3.3Z"/></svg>',
  ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r=".6" fill="currentColor"/></svg>',
  fb:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5V6.8c0-.8.5-1 .9-1H17V2.5h-2.9C11.2 2.5 10 4.4 10 6.5v2H7.5V12H10v9.5h4V12h2.7l.4-3.5H14Z"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l1-1.2c.2-.3.4-.2.7-.1l2.1 1c.3.2.5.3.6.4 0 .1 0 .7-.2 1.2Z"/></svg>',
  tt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.4 2 1.8 3.6 3.9 3.9v3c-1.6 0-3-.5-3.9-1.3v6.6c0 3.4-2.6 5.8-5.8 5.8A5.7 5.7 0 0 1 5 15.3c0-3.2 2.6-5.8 5.9-5.7c.3 0 .7 0 1 .1v3.1c-.3-.1-.6-.2-1-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7c1.6 0 2.8-1.2 2.8-2.9V3h2.9Z"/></svg>'
};
function icon(name){ return ICONS[name] || ''; }

const NAV = [
  {label:'Beranda', href:'/'},
  {label:'Profil', href:'/profil/', drop:[
    {label:'Profil HISANIYAH', href:'/profil/'},
    {label:'Sejarah', href:'/sejarah/'},
    {label:'Visi dan Misi', href:'/visi-misi/'}
  ]},
  {label:'Kepengurusan', href:'/kepengurusan/', drop:[
    {label:'Pengurus Pusat', href:'/kepengurusan/'},
    {label:'Program & Kegiatan', href:'/program/'}
  ]},
  {label:'KORDA', href:'/korda/'},
  {label:'Program', href:'/program/'},
  {label:'Berita', href:'/berita/'},
  {label:'Galeri', href:'/galeri/'},
  {label:'HISANIYAH TV', href:'https://youtube.com/@hisaniyahtv', icon:'tv'}
];

function isActive(href){
  const p = location.pathname.replace(/\/+$/,'') || '/';
  const h = href.replace(/\/+$/,'') || '/';
  if(h === '/') return p === '/';
  return p === h || p.startsWith(h + '/');
}

function renderHeader(){
  const items = NAV.map(n=>{
    const active = isActive(n.href) ? ' class="active"' : '';
    const drop = n.drop ? `<div class="drop">${n.drop.map(d=>`<a href="${d.href}">${d.label}</a>`).join('')}</div>` : '';
    const caret = n.drop ? icon('chevD') : '';
    const ic = n.icon ? `<span style="display:inline-flex;width:19px;height:19px">${icon(n.icon)}</span>` : '';
    return `<li class="${n.drop?'has-drop':''}"><a href="${n.href}"${active}>${ic}${n.label}${caret}</a>${drop}</li>`;
  }).join('');
  const mobile = NAV.map(n=>{
    const sub = n.drop ? n.drop.map(d=>`<a class="sub" href="${d.href}">${d.label}</a>`).join('') : '';
    return `<a href="${n.href}">${n.label}</a>${sub}`;
  }).join('');
  return `
  <header class="site-header">
    <div class="header-in">
      <a class="brand" href="/" aria-label="HISANIYAH — Beranda">
        <span class="brand-badge"><img src="/assets/img/logo-hisaniyah-trans-512.png" alt="Logo resmi HISANIYAH" width="60" height="60"></span>
        <span class="brand-text"><strong>HISANIYAH</strong><span>Himpunan Santri-Alumni<br>K.H Yahya Syabrawi</span></span>
      </a>
      <span class="brand-div" aria-hidden="true"></span>
      <nav class="main-nav" aria-label="Navigasi utama"><ul>${items}</ul></nav>
      <div class="header-actions">
        <button class="search-btn" id="btn-search" aria-label="Cari di website">${icon('search')}</button>
        <a class="akun-chip" data-akun-chip href="/pendataan/masuk/" style="display:none"></a>
        <a class="cta-daftar" href="/pendataan/">${icon('users')}<span>Pendataan Alumni</span></a>
        <button class="burger" id="btn-burger" aria-label="Buka menu">${icon('menu')}</button>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu"><button class="m-search" id="m-search">${icon('search')}<span>Pencarian</span></button>${mobile}
      <a class="cta-daftar" href="/pendataan/">${icon('users')}<span>Pendataan Alumni</span></a>
    </div>
  </header>
  <div class="search-overlay" id="search-overlay" role="dialog" aria-modal="true" aria-label="Pencarian">
    <button class="search-close" id="search-close" aria-label="Tutup pencarian">${icon('close')}</button>
    <div class="search-box">
      <h2>Cari di HISANIYAH</h2>
      <div class="search-field"><input type="search" id="search-input" placeholder="Ketik kata kunci: berita, korda, program…" aria-label="Kata kunci pencarian"><button class="btn btn-orange" id="search-go" style="padding:11px 22px">Cari</button></div>
      <div class="search-results" id="search-results"></div>
    </div>
  </div>`;
}

function renderFooter(){
  return `
  <footer class="site-footer">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">
          <span class="brand-badge"><img src="/assets/img/logo-hisaniyah-trans-512.png" alt="Logo resmi HISANIYAH" width="52" height="52"></span>
          <span><strong>HISANIYAH</strong><span>Himpunan Santri-Alumni<br>K.H Yahya Syabrawi</span></span>
        </div>
        <p>Wadah silaturahmi, sinergi, dan pengabdian para santri dan alumni untuk kemaslahatan umat dan almamater.</p>
        <div class="socials">
          <a href="https://youtube.com/@hisaniyahtv" aria-label="YouTube HISANIYAH TV">${icon('yt')}</a>
          <a href="https://www.instagram.com/hisaniyah.tv" aria-label="Instagram HISANIYAH">${icon('ig')}</a>
          <a href="https://www.facebook.com/share/19a8uf34xT/" aria-label="Facebook HISANIYAH">${icon('fb')}</a>
          <a href="https://www.tiktok.com/@hisaniyah.tv" aria-label="TikTok HISANIYAH">${icon('tt')}</a>
        </div>
      </div>
      <div>
        <h3>Navigasi</h3>
        <ul>
          <li><a href="/">Beranda</a></li>
          <li><a href="/profil/">Profil HISANIYAH</a></li>
          <li><a href="/sejarah/">Sejarah</a></li>
          <li><a href="/visi-misi/">Visi dan Misi</a></li>
          <li><a href="/kepengurusan/">Kepengurusan</a></li>
          <li><a href="/korda/">KORDA</a></li>
        </ul>
      </div>
      <div>
        <h3>Layanan Alumni</h3>
        <ul>
          <li><a href="/pendataan/">Pendataan Alumni</a></li>
          <li><a href="/kebijakan-privasi/">Kebijakan Privasi</a></li>
          <li><a href="/program/">Program &amp; Kegiatan</a></li>
          <li><a href="/berita/">Berita &amp; Artikel</a></li>
          <li><a href="/galeri/">Galeri Kegiatan</a></li>
          <li><a href="https://youtube.com/@hisaniyahtv">HISANIYAH TV</a></li>
        </ul>
      </div>
      <div>
        <h3>Kontak Resmi</h3>
        <ul class="footer-contact">
          <li>${icon('pin')}<span>Sekretariat HISANIYAH<br>Jl. Sumber Ilmu No. 127, Ganjaran,<br>Gondanglegi, Malang, Jawa Timur 65174</span></li>
          <li>${icon('mail')}<span>info@hisaniyah.or.id</span></li>
          <li>${icon('clock')}<span>Layanan sekretariat mengikuti agenda organisasi</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">© <span id="year"></span> HISANIYAH — Himpunan Santri-Alumni K.H. Yahya Syabrawi. Seluruh hak cipta dilindungi.</div>
  </footer>`;
}

/* Indeks pencarian statis (Tahap 2). Pada Tahap 3–4 digantikan data CMS/API. */
const SEARCH_INDEX = [
  {t:'Beranda HISANIYAH', d:'Halaman utama website resmi', href:'/'},
  {t:'Profil HISANIYAH', d:'Profil dan sambutan organisasi', href:'/profil/'},
  {t:'Sejarah HISANIYAH', d:'Perjalanan organisasi dari masa ke masa', href:'/sejarah/'},
  {t:'Visi dan Misi', d:'Visi, misi, dan tujuan organisasi', href:'/visi-misi/'},
  {t:'Kepengurusan', d:'Struktur pengurus pusat HISANIYAH', href:'/kepengurusan/'},
  {t:'KORDA — Koordinator Daerah', d:'Daftar koordinator daerah dan wilayah', href:'/korda/'},
  {t:'Program & Kegiatan', d:'Program kerja dan agenda kegiatan', href:'/program/'},
  {t:'Berita & Artikel', d:'Portal berita dan artikel HISANIYAH', href:'/berita/'},
  {t:'Galeri Kegiatan', d:'Dokumentasi foto kegiatan', href:'/galeri/'},
  {t:'HISANIYAH TV', d:'Kanal YouTube resmi HISANIYAH', href:'https://youtube.com/@hisaniyahtv'},
  {t:'Pendataan Alumni', d:'Pendaftaran dan pengelolaan data alumni', href:'/pendataan/'},
  {t:'Seminar Keilmuan HISANIYAH', d:'Berita — tema Peran Alumni dalam Penguatan Umat', href:'/berita/'},
  {t:'Silaturahmi Akbar Alumni Se-Jawa Timur', d:'Berita kegiatan alumni', href:'/berita/'},
  {t:'Pembentukan KORDA Baru di Malang', d:'Berita organisasi', href:'/berita/'}
];

/* Navigasi bawah khusus tampilan HP (mengikuti contoh resmi) */
const BOTTOM_NAV = [
  {label:'Beranda', href:'/', icon:'home', match:['/']},
  {label:'Berita', href:'/berita/', icon:'news', match:['/berita/']},
  {label:'HISANIYAH TV', href:'https://youtube.com/@hisaniyahtv', icon:'tv', match:['/tv/']},
  {label:'Alumni', href:'/pendataan/', icon:'users', match:['/pendataan/']},
  {label:'Akun', href:'/pendataan/akun/', icon:'user', match:['/pendataan/akun','/pendataan/masuk']}
];
function renderBottomNav(){
  const path = location.pathname;
  const items = BOTTOM_NAV.map(n=>{
    const active = n.match.some(m => m === '/' ? path === '/' : path.startsWith(m)) ? ' class="active"' : '';
    return `<a href="${n.href}"${active}>${icon(n.icon)}<span>${n.label}</span></a>`;
  }).join('');
  return `<nav class="bottom-nav" aria-label="Navigasi bawah">${items}</nav>`;
}

/* Chip akun pada header: tampil bila ada sesi masuk */
document.addEventListener('DOMContentLoaded', () => {
  try {
    const ses = JSON.parse(localStorage.getItem('hisa_session') || 'null');
    document.querySelectorAll('[data-akun-chip]').forEach(el => {
      if (ses && ses.user) {
        el.href = '/pendataan/akun/';
        el.innerHTML = (ses.user.Foto ? `<img src="${ses.user.Foto}" alt="" style="width:26px;height:26px;border-radius:50%">` : '') + `<span>${String(ses.user.Nama || 'Akun').split(' ')[0]}</span>`;
        el.style.display = 'inline-flex'; el.style.alignItems = 'center'; el.style.gap = '8px'; el.style.fontWeight = '700';
      }
    });
  } catch(e){}
});
