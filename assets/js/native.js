/* Jembatan aplikasi Android (Capacitor) — tidak berpengaruh di website biasa.
   - Menandai <html> dengan kelas 'di-aplikasi'.
   - Mendaftarkan token notifikasi (FCM) ke backend bila plugin tersedia & ada sesi.
   - Login Google di dalam WebView diblokir Google; pada halaman Masuk di aplikasi,
     tombol diarahkan membuka browser sistem (alur aman yang diizinkan Google). */
(function(){
  const CAP = window.Capacitor;
  if (!CAP || !CAP.isNativePlatform || !CAP.isNativePlatform()) return;
  document.documentElement.classList.add('di-aplikasi');
  const Plugins = CAP.Plugins || {};

  async function daftarkanToken(token){
    try {
      localStorage.setItem('hisa_fcm_token', token);
      if (window.HisaData && HisaData.getSession()) {
        await HisaData.apiCall('perangkat.daftar', { fcm_token: token, platform: 'android' });
      }
    } catch(e){}
  }
  if (Plugins.PushNotifications) {
    const PN = Plugins.PushNotifications;
    PN.addListener('registration', t => daftarkanToken(t.value));
    PN.addListener('registrationError', () => {});
    PN.requestPermissions().then(r => { if (r.receive === 'granted') PN.register(); }).catch(() => {});
    // sesi mungkin baru ada setelah masuk: coba lagi saat halaman akun/admin dibuka
    setTimeout(() => { const t = localStorage.getItem('hisa_fcm_token'); if (t) daftarkanToken(t); }, 4000);
  }

  if (location.pathname.startsWith('/pendataan/masuk') && Plugins.Browser) {
    document.addEventListener('DOMContentLoaded', () => {
      const btnBox = document.getElementById('gis-btn');
      const st = document.getElementById('login-status');
      if (btnBox) {
        btnBox.innerHTML = '<button class="btn btn-teal" id="btn-login-browser" style="padding:13px 24px">Masuk dengan Google (di browser)</button>';
        if (st) st.textContent = 'Demi keamanan, Google meminta proses masuk dilakukan di browser HP Anda. Setelah masuk di browser, data akun Anda tetap sama.';
        document.getElementById('btn-login-browser').addEventListener('click', () => {
          Plugins.Browser.open({ url: 'https://hisaniyah.or.id/pendataan/masuk/' });
        });
      }
    });
  }
})();
