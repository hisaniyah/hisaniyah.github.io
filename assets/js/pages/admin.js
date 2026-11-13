/* Kerangka panel admin CMS — dipakai semua halaman /pendataan/admin */
const ADMIN_NAV = [
  {label:'Dashboard CMS', href:'/pendataan/admin/', icon:'chart', match:'/pendataan/admin/', cms:true},
  {label:'Berita', href:'/pendataan/admin/berita/', icon:'news', match:'/pendataan/admin/berita/', cms:true},
  {label:'Kategori', href:'/pendataan/admin/kategori/', icon:'gallery', match:'/pendataan/admin/kategori/', cms:true},
  {label:'Pengumuman', href:'/pendataan/admin/pengumuman/', icon:'mega', match:'/pendataan/admin/pengumuman/', cms:true},
  {label:'Statistik Pengurus', href:'/pendataan/admin/pengurus/', icon:'chart', match:'/pendataan/admin/pengurus/'},
  {label:'Verifikasi Alumni', href:'/pendataan/admin/pengurus/verifikasi/', icon:'shield', match:'/pendataan/admin/pengurus/verifikasi/'},
  {label:'Data Alumni', href:'/pendataan/admin/pengurus/alumni/', icon:'users', match:'/pendataan/admin/pengurus/alumni/'},
  {label:'Pengguna & Peran', href:'/pendataan/admin/pengurus/pengguna/', icon:'user', match:'/pendataan/admin/pengurus/pengguna/'},
  {label:'KORDA & Angkatan', href:'/pendataan/admin/pengurus/wilayah/', icon:'pin', match:'/pendataan/admin/pengurus/wilayah/', pusat:true}
];
function renderAdminShell(activeMatch){
  const top = document.getElementById('admin-top');
  if (top) top.innerHTML = `<div class="admin-top-in">
    <span class="brand-badge"><img src="/assets/img/logo-hisaniyah-trans-512.png" alt="Logo HISANIYAH"></span>
    <span><strong>HISANIYAH</strong><small>Admin CMS</small></span>
    <a class="view" href="/" target="_blank" rel="noopener">${icon('arrowR')} Lihat Website</a></div>
    <div class="mode-banner" id="mode-banner">MODE UJI LOKAL — perubahan tersimpan di peramban ini dan langsung tampil di website. Login admin &amp; penyimpanan server (Google Sheets via Apps Script) diaktifkan pada Tahap 4–6.</div>`;
  const side = document.getElementById('admin-side');
  if (side) {
    let ses = null; try { ses = JSON.parse(localStorage.getItem('hisa_session') || 'null'); } catch(e){}
    const role = ses && ses.user ? ses.user.Role : '';
    const pusat = ['super_admin','pengurus_pusat'].includes(role);
    const tampil = ADMIN_NAV.filter(n => {
      if (!role) return true;
      if (n.cms && role === 'admin_korda') return false;
      if (n.pusat && !pusat) return false;
      return true;
    });
    side.innerHTML = tampil.map(n =>
      `<a href="${n.href}"${n.match === activeMatch ? ' class="active"' : ''}>${icon(n.icon)}${n.label}</a>`).join('');
  }
}
function toast(msg){
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}
document.addEventListener('DOMContentLoaded', () => {
  const msg = sessionStorage.getItem('hisa_toast');
  if (msg) { sessionStorage.removeItem('hisa_toast'); setTimeout(() => toast(msg), 350); }
});

/* Gerbang admin (Tahap 5): pada mode API, panel hanya untuk pengurus yang masuk.
   Tanpa sesi -> arahkan masuk; sesi non-pengurus -> tertolak. */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await HisaData.load();
    if (!HisaData.apiMode()) return;
    const mb = document.getElementById('mode-banner');
    if (mb) mb.textContent = 'TERHUBUNG KE DATABASE HISANIYAH — perubahan tersimpan di server organisasi.';
    const ses = HisaData.getSession();
    const main = document.querySelector('.admin-main');
    if (!main) return;
    const halamanPengurus = location.pathname.includes('/admin/pengurus');
    if (!ses) {
      main.innerHTML = '<h1>Panel Admin CMS</h1><div class="panel"><h2>Masuk dulu sebagai pengurus</h2><p style="color:var(--ink-soft);margin-bottom:14px">Panel ini sekarang terhubung ke database HISANIYAH. Masuk dengan akun Google pengurus untuk melanjutkan.</p><a class="btn btn-teal" href="/pendataan/masuk/">Masuk dengan Google</a></div>';
    } else if (!HisaData.sesiPengurus()) {
      main.innerHTML = '<h1>Panel Admin CMS</h1><div class="panel"><h2>Akses ditolak</h2><p style="color:var(--ink-soft)">Akun ' + HisaData.esc(ses.user.Email) + ' bukan pengurus.</p></div>';
    } else if (!halamanPengurus && !HisaData.sesiAdmin()) {
      if (ses.user.Role === 'admin_korda') location.href = '/pendataan/admin/pengurus/';
      main.innerHTML = '<h1>Panel Pengurus</h1><div class="panel"><h2>Khusus Pengurus Pusat</h2><p style="color:var(--ink-soft)">CMS berita dikelola Pengurus Pusat. Sebagai Admin KORDA, gunakan menu Pengurus di samping.</p></div>';
    } else {
      const info = document.createElement('p');
      info.style.cssText = 'color:var(--ink-soft);font-weight:600;margin-bottom:14px';
      info.textContent = 'Masuk sebagai ' + ses.user.Nama + ' (' + ses.user.Role + ') — perubahan CMS tersimpan ke database.';
      main.prepend(info);
    }
  } catch(e){}
});
