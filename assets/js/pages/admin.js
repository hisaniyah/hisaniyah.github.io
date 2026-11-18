/* Kerangka panel admin CMS — dipakai semua halaman /pendataan/admin */
const ADMIN_NAV = [
  {label:'Dashboard CMS', href:'/pendataan/admin/', icon:'chart', match:'/pendataan/admin/', cms:true},
  {label:'Berita', href:'/pendataan/admin/berita/', icon:'news', match:'/pendataan/admin/berita/', cms:true},
  {label:'Pengumuman', href:'/pendataan/admin/pengumuman/', icon:'mega', match:'/pendataan/admin/pengumuman/', cms:true},
  {label:'Foto Pimpinan', href:'/pendataan/admin/pimpinan/', icon:'gallery', match:'/pendataan/admin/pimpinan/', cms:true, super:true},
  {label:'Statistik Alumni', href:'/pendataan/admin/pengurus/', icon:'chart', match:'/pendataan/admin/pengurus/'},
  {label:'Data Alumni', href:'/pendataan/admin/pengurus/alumni/', icon:'users', match:'/pendataan/admin/pengurus/alumni/'},
  {label:'Pengguna & Peran', href:'/pendataan/admin/pengurus/pengguna/', icon:'user', match:'/pendataan/admin/pengurus/pengguna/'},
  {label:'KORDA & Angkatan', href:'/pendataan/admin/pengurus/wilayah/', icon:'pin', match:'/pendataan/admin/pengurus/wilayah/', pusat:true}
];
function renderAdminShell(activeMatch){
  const top = document.getElementById('admin-top');
  if (top) top.innerHTML = `<div class="admin-top-in">
    <button class="admin-burger" id="admin-burger" type="button" aria-label="Buka menu"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
    <span class="brand-badge"><img src="/assets/img/logo-hisaniyah-trans-256.webp" alt="Logo HISANIYAH"></span>
    <span><strong>HISANIYAH</strong><small>Admin CMS</small></span>
    <a class="view" href="/" target="_blank" rel="noopener">${icon('arrowR')} Lihat Website</a></div>`;
  const side = document.getElementById('admin-side');
  if (side) {
    let ses = null; try { ses = JSON.parse(localStorage.getItem('hisa_session') || 'null'); } catch(e){}
    const role = ses && ses.user ? ses.user.Role : '';
    const pusat = ['super_admin','pengurus_pusat'].includes(role);
    const tampil = ADMIN_NAV.filter(n => {
      if (!role) return true;
      if (n.cms && role === 'admin_korda') return false;
      if (n.pusat && !pusat) return false;
      if (n.super && role !== 'super_admin') return false;
      return true;
    });
    let html = '<p class="nav-label">Menu Utama</p>'
      + `<a href="/pendataan/akun/">${icon('home')}Dashboard</a>`
      + `<a href="/pendataan/akun/?view=data">${icon('users')}Data Alumni</a>`
      + `<a href="/pendataan/akun/?view=kta">${icon('id')}KTA Alumni</a>`
      + `<a href="/pendataan/akun/?view=akun">${icon('user')}Akun</a>`;
    let grup = '';
    tampil.forEach(n => {
      const g = n.href.includes('/pengurus/') ? 'pengurus' : 'cms';
      if (g !== grup) { grup = g; html += `<p class="nav-label">${g === 'cms' ? 'Menu CMS' : 'Menu Pengurus'}</p>`; }
      html += `<a href="${n.href}"${n.match === activeMatch ? ' class="active"' : ''}>${icon(n.icon)}${n.label}</a>`;
    });
    side.innerHTML = html;
    const burger = document.getElementById('admin-burger');
    if (burger) {
      let ov = document.querySelector('.admin-overlay');
      if (!ov) { ov = document.createElement('div'); ov.className = 'admin-overlay'; document.body.appendChild(ov); }
      burger.addEventListener('click', () => { side.classList.add('open'); ov.classList.add('tampil'); });
      ov.addEventListener('click', () => { side.classList.remove('open'); ov.classList.remove('tampil'); });
    }
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
