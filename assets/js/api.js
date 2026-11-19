/* HISANIYAH — lapisan data CMS (Tahap 3).
   Kontrak data mengikuti skema Sheet (database/SKEMA.md) agar pada Tahap 4
   adapter ini tinggal diganti pemanggilan API Apps Script tanpa mengubah UI.
   Mode saat ini: UJI LOKAL — data tersimpan di localStorage peramban ini;
   bila kosong, memakai data awal /assets/data/berita.json. */
const CMS_KEY = 'hisaniyah_cms_v1';
const HisaData = (() => {
  let cache = null;
  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function slugify(s){ return String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90) || 'berita'; }
  const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  function fmtDate(iso){ if(!iso) return ''; const d = new Date(iso + (iso.length===10 ? 'T00:00:00' : '')); if (isNaN(d)) return iso; return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; }
  /* Sanitasi HTML isi artikel: hanya tag & atribut aman */
  function sanitize(html){
    const allowed = {P:1,BR:1,STRONG:1,B:1,EM:1,I:1,U:1,H2:1,H3:1,H4:1,UL:1,OL:1,LI:1,BLOCKQUOTE:1,A:['href','title'],IMG:['src','alt']};
    const tpl = document.createElement('template'); tpl.innerHTML = String(html || '');
    const els = [...tpl.content.querySelectorAll('*')].reverse(); // anak dulu, baru induk
    els.forEach(el => {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'IFRAME') { el.remove(); return; }
      const rule = allowed[el.tagName];
      if (!rule) { el.replaceWith(...el.childNodes); return; }
      [...el.attributes].forEach(at => { if (Array.isArray(rule) ? !rule.includes(at.name) : true) el.removeAttribute(at.name); });
      if (el.tagName === 'A') { const h = el.getAttribute('href') || ''; if (!/^(https?:|mailto:|\/)/i.test(h)) el.removeAttribute('href'); el.setAttribute('rel','noopener'); }
      if (el.tagName === 'IMG') { const src = el.getAttribute('src') || ''; if (!/^(https?:|\/)/i.test(src)) el.remove(); }
    });
    return tpl.innerHTML;
  }
  const API_URL = (typeof window !== 'undefined' && window.HISA_API_URL) || '';
  const SES_KEY = 'hisa_session';
  /* Cache data PUBLIK antar-halaman (Fase A optimasi, 17 Nov 2026): hanya hasil
     public.bootstrap (berita/kategori/pengumuman/master) — TANPA token & data pribadi.
     TTL 5 menit; bila server gagal/timeout, cache lama dipakai sebagai cadangan. */
  const PUB_KEY = 'hisa_pub_v1';
  const PUB_TTL = 5 * 60 * 1000;
  const API_TIMEOUT = 6000;
  function pubCacheRead(){ try { const raw = localStorage.getItem(PUB_KEY); if (!raw) return null; const o = JSON.parse(raw); return (o && o.data && o.ts) ? o : null; } catch(e){ return null; } }
  function pubCacheWrite(data){ try { localStorage.setItem(PUB_KEY, JSON.stringify({ ts: Date.now(), data: data })); } catch(e){} }
  function pubCacheClear(){ try { localStorage.removeItem(PUB_KEY); } catch(e){} }
  function withTimeout(p, ms){ return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('Batas waktu terlampaui')), ms))]); }
  function getSession(){ try { return JSON.parse(localStorage.getItem(SES_KEY) || 'null'); } catch(e){ return null; } }
  function setSession(ses){ try { localStorage.setItem(SES_KEY, JSON.stringify(ses)); } catch(e){} }
  function clearSession(){ try { localStorage.removeItem(SES_KEY); } catch(e){} }
  function apiMode(){ return !!API_URL; }
  function sesiAdmin(){ const s = getSession(); return s && ['super_admin','pengurus_pusat'].includes(s.user && s.user.Role); }
  function sesiPengurus(){ const s = getSession(); return s && ['super_admin','pengurus_pusat','admin_korda'].includes(s.user && s.user.Role); }
  function sesiCMS(){ const s = getSession(); return s && ['super_admin','pengurus_pusat','penulis'].includes(s.user && s.user.Role); }
  /* Tulis tembus ke backend bila admin masuk (Tahap 5). Kegagalan dicatat, tidak menggagalkan UI. */
  function tulisAPI(action, payload, ketat){
    const ses = getSession();
    if (!API_URL || !ses) return ketat ? Promise.reject(new Error('Tidak ada sesi server')) : Promise.resolve(null);
    pubCacheClear(); // data publik berubah -> cache antar-halaman tidak boleh basi
    const p = apiCall(action, payload, ses.token);
    return ketat ? p : p.catch(e => { console.warn('Tulis API gagal:', action, e.message); return null; });
  }
  async function apiCall(action, payload, token){
    if (!token) { const ses = getSession(); token = ses ? ses.token : ''; }
    const r = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token: token || '', payload: payload || {} }) });
    const j = await r.json();
    if (!j.success) throw new Error(j.error || 'API gagal');
    return j.data;
  }
  async function load(){
    if (cache) return cache;
    if (API_URL) {
      const pc = pubCacheRead();
      if (pc && (Date.now() - pc.ts) < PUB_TTL) { cache = pc.data; return cache; }
      try { cache = await withTimeout(apiCall('public.bootstrap'), API_TIMEOUT); pubCacheWrite(cache); return cache; }
      catch(e){ if (pc) { cache = pc.data; return cache; } /* jatuh ke mode lokal */ }
    }
    try { const raw = localStorage.getItem(CMS_KEY); if (raw) { cache = JSON.parse(raw); return cache; } } catch(e){}
    try { const r = await fetch('/assets/data/berita.json'); cache = await r.json(); }
    catch(e){ cache = (typeof window !== 'undefined' && window.HISA_SEED) ? window.HISA_SEED : { kategori: [], berita: [], pengumuman: [] }; }
    return cache;
  }
  function save(){ try { localStorage.setItem(CMS_KEY, JSON.stringify(cache)); } catch(e){} }
  function isLocalMode(){ try { return !!localStorage.getItem(CMS_KEY); } catch(e){ return false; } }
  function resetLocal(){ try { localStorage.removeItem(CMS_KEY); } catch(e){} pubCacheClear(); cache = null; }
  function uid(prefix){ return prefix + Date.now().toString(36).toUpperCase() + Math.floor(Math.random()*99); }
  /* --- kueri publik --- */
  function kategoriNama(id){ const k = (cache?.kategori || []).find(x => x.Kategori_ID === id); return k ? k.nama : ''; }
  /* Perapian huruf besar-kecil nama (keputusan tuan besar 19 Nov 2026) — cermin
     aturan backend rapikanNama_; menjadi pengaman tampilan KTA bila masih ada
     data lama yang belum terrapikan di database. */
  const GELAR_DEPAN_KTA = { kh:'KH.', h:'H.', hj:'Hj.', ust:'Ust.', ustadz:'Ustadz', ustadzah:'Ustadzah', gus:'Gus', dr:'Dr.', drs:'Drs.', dra:'Dra.', prof:'Prof.', kyai:'Kyai', nyai:'Nyai', ir:'Ir.' };
  const GELAR_BELAKANG_KTA = { sag:'S.Ag', mag:'M.Ag', spd:'S.Pd', mpd:'M.Pd', spdi:'S.Pd.I', mpdi:'M.Pd.I', sh:'S.H', mh:'M.H', shi:'S.H.I', mhi:'M.H.I', se:'S.E', me:'M.E', ssos:'S.Sos', msos:'M.Sos', skom:'S.Kom', mkom:'M.Kom', ssi:'S.Si', msi:'M.Si', shum:'S.Hum', mhum:'M.Hum', sfil:'S.Fil', mfil:'M.Fil', ma:'M.A', msc:'M.Sc', lc:'Lc', amd:'A.Md', spsi:'S.Psi', skm:'S.K.M', mkes:'M.Kes', mm:'M.M', st:'S.T', mt:'M.T', mkn:'M.Kn' };
  function kunciNamaKTA(t){ return String(t || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function kapitalKataKTA(p){ let seen = false; return p.split('').map(ch => { if (/\p{L}/u.test(ch)) { const r = seen ? ch.toLowerCase() : ch.toUpperCase(); seen = true; return r; } return ch; }).join(''); }
  function rapikanKataKTA(kata){ if (!kata) return kata; if (kata.includes('.')) return kata.split('.').map(s => s ? rapikanKataKTA(s) : s).join('.'); return kata.split('-').map(p => kapitalKataKTA(p.replace(/’/g, "'"))).join('-'); }
  function rapikanNama(nama){
    const s = String(nama ?? '').replace(/\s+/g, ' ').trim().replace(/,(?=\S)/g, ', ');
    if (!s) return s;
    const mentah = s.split(' '); const tokens = []; let i = 0;
    while (i < mentah.length) {
      const t = mentah[i];
      if (/^[A-Za-z]\.?,?$/.test(t)) {
        let j = i + 1, gab = kunciNamaKTA(t);
        while (j < mentah.length && (gab + kunciNamaKTA(mentah[j])) in GELAR_BELAKANG_KTA) { gab += kunciNamaKTA(mentah[j]); j += 1; }
        if (j > i + 1) { tokens.push(gab + (mentah.slice(i, j).some(x => x.endsWith(',')) ? ',' : '')); i = j; continue; }
      }
      tokens.push(t); i += 1;
    }
    const idxKoma = tokens.findIndex(t => t.endsWith(','));
    return tokens.map((t, k) => {
      const koma = t.endsWith(','); const inti = koma ? t.slice(0, -1) : t; const key = kunciNamaKTA(inti);
      const zonaGelar = idxKoma >= 0 && k > idxKoma; const terakhir = k === tokens.length - 1;
      let baru;
      if (key in GELAR_BELAKANG_KTA && (zonaGelar || inti.includes('.') || inti === key || terakhir)) baru = GELAR_BELAKANG_KTA[key] + (terakhir && !koma ? '' : '.');
      else if (key in GELAR_DEPAN_KTA && !zonaGelar) baru = GELAR_DEPAN_KTA[key];
      else baru = rapikanKataKTA(inti);
      return baru + (koma ? ',' : '');
    }).join(' ');
  }
  function terbit(){ return [...(cache?.berita || [])].filter(b => b.status === 'terbit').sort((a,b) => (b.publish_at || '').localeCompare(a.publish_at || '')); }
  /* Berita Populer (keputusan tuan besar 17 Nov 2026): terbanyak ditayangkan
     dalam 7 hari terakhir; kekurangan diisi dari 30 hari terakhir; berita yang
     sedang dibaca dikecualikan. Selama belum ada data tayang sama sekali,
     kembali ke urutan lama (unggulan dulu, lalu terbaru). Angka tayang hanya
     dipakai mengurutkan — tidak pernah ditampilkan ke publik. */
  function populer(excludeId, n){
    n = n || 5;
    const items = terbit().filter(b => b.Berita_ID !== excludeId);
    const adaTayang = items.some(b => (b.tayang_7 || 0) > 0 || (b.tayang_30 || 0) > 0);
    if (!adaTayang) {
      return [...items].sort((a,b) => (b.unggulan ? 1 : 0) - (a.unggulan ? 1 : 0) || (b.publish_at || '').localeCompare(a.publish_at || '')).slice(0, n);
    }
    const byPublish = (a,b) => (b.publish_at || '').localeCompare(a.publish_at || '');
    const out = [...items].sort((a,b) => (b.tayang_7 || 0) - (a.tayang_7 || 0) || byPublish(a,b)).filter(b => (b.tayang_7 || 0) > 0).slice(0, n);
    if (out.length < n) {
      const sisa30 = items.filter(b => !out.includes(b)).sort((a,b) => (b.tayang_30 || 0) - (a.tayang_30 || 0) || byPublish(a,b));
      for (const b of sisa30) { if (out.length >= n) break; if ((b.tayang_30 || 0) > 0) out.push(b); }
    }
    if (out.length < n) {
      for (const b of items) { if (out.length >= n) break; if (!out.includes(b)) out.push(b); }
    }
    return out;
  }
  function pengumumanAktif(){ return (cache?.pengumuman || []).filter(p => p.is_published); }
  /* --- CRUD admin --- */
  function upsertBerita(rec){
    if (!rec.Berita_ID) { rec.Berita_ID = uid('BR'); rec.created_at = new Date().toISOString().slice(0,10); }
    rec.updated_at = new Date().toISOString().slice(0,10);
    let base = slugify(rec.slug || rec.judul); let slug = base; let n = 2;
    while (cache.berita.some(b => b.slug === slug && b.Berita_ID !== rec.Berita_ID)) slug = base + '-' + (n++);
    rec.slug = slug;
    const i = cache.berita.findIndex(b => b.Berita_ID === rec.Berita_ID);
    if (i >= 0) cache.berita[i] = rec; else cache.berita.unshift(rec);
    save();
    // PERBAIKAN 19 Nov 2026: kembalikan janji tulis server (mode ketat)
    // agar pemanggil (editor berita) bisa MENUNGGU kepastian tersimpan
    // sebelum menyatakan berhasil. Sebelumnya fire-and-forget lalu halaman
    // berpindah seketika: kiriman batal di jalan, toast tetap "diterbitkan".
    if (sesiCMS()) return tulisAPI('admin.berita.save', rec, true).then(() => rec);
    return Promise.resolve(rec);
  }
  function hapusBerita(id){ cache.berita = cache.berita.filter(b => b.Berita_ID !== id); save(); if (sesiCMS()) tulisAPI('admin.berita.delete', { Berita_ID: id }); }
  function upsertKategori(rec){
    if (!rec.Kategori_ID) rec.Kategori_ID = uid('KT');
    rec.slug = slugify(rec.slug || rec.nama);
    const i = cache.kategori.findIndex(k => k.Kategori_ID === rec.Kategori_ID);
    if (i >= 0) cache.kategori[i] = rec; else cache.kategori.push(rec);
    save();
    if (sesiCMS()) tulisAPI('admin.kategori.save', rec);
    return rec;
  }
  function hapusKategori(id){ cache.kategori = cache.kategori.filter(k => k.Kategori_ID !== id); save(); if (sesiCMS()) tulisAPI('admin.kategori.delete', { Kategori_ID: id }); }
  function upsertPengumuman(rec){
    if (!rec.Pengumuman_ID) { rec.Pengumuman_ID = uid('PG'); rec.published_at = new Date().toISOString().slice(0,10); }
    const i = cache.pengumuman.findIndex(p => p.Pengumuman_ID === rec.Pengumuman_ID);
    if (i >= 0) cache.pengumuman[i] = rec; else cache.pengumuman.unshift(rec);
    save();
    if (sesiCMS()) tulisAPI('admin.pengumuman.save', rec);
    return rec;
  }
  function hapusPengumuman(id){ cache.pengumuman = cache.pengumuman.filter(p => p.Pengumuman_ID !== id); save(); if (sesiCMS()) tulisAPI('admin.pengumuman.delete', { Pengumuman_ID: id }); }
  function exportJSON(){ return JSON.stringify(cache, null, 1); }
  function importJSON(text){ const obj = JSON.parse(text); if (!obj || !Array.isArray(obj.berita) || !Array.isArray(obj.kategori)) throw new Error('Format berkas tidak sesuai'); cache = obj; save(); }
  /* ===== Media gambar (mode uji lokal: IndexedDB peramban) =====
     Pada Tahap 4, fungsi yang sama diganti unggahan ke Google Drive organisasi
     (folder WEB Hisaniyah > Media) lewat API; gambar_media_id diganti
     gambar_utama_file_id berisi ID berkas Drive. */
  const _mediaURLs = {};
  function _idb(){ return new Promise((res, rej) => { const r = indexedDB.open('hisaniyah_media', 1); r.onupgradeneeded = () => r.result.createObjectStore('images'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
  async function mediaPut(blob){ const db = await _idb(); const id = 'MED' + Date.now().toString(36) + Math.floor(Math.random() * 9999);
    return new Promise((res, rej) => { const tx = db.transaction('images', 'readwrite'); tx.objectStore('images').put(blob, id); tx.oncomplete = () => res(id); tx.onerror = () => rej(tx.error); }); }
  async function mediaURL(id){ if (!id) return ''; if (_mediaURLs[id]) return _mediaURLs[id];
    try { const db = await _idb(); const blob = await new Promise((res, rej) => { const rq = db.transaction('images').objectStore('images').get(id); rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); });
      if (!blob) return ''; const u = URL.createObjectURL(blob); _mediaURLs[id] = u; return u; } catch(e){ return ''; } }
  async function mediaDel(id){ if (!id) return; try { const db = await _idb(); await new Promise(res => { const tx = db.transaction('images', 'readwrite'); tx.objectStore('images').delete(id); tx.oncomplete = res; tx.onerror = res; }); } catch(e){} }
  async function hydrateMedia(root){ const els = (root || document).querySelectorAll('img[data-media]'); for (const el of els) { const u = await mediaURL(el.getAttribute('data-media')); if (u) el.src = u; } }
  /* Gambar utama: foto unggahan, URL langsung, atau penahan gradasi sesuai data */
  function thumbHTML(b, label){
    if (b.gambar_media_id)
      return `<img data-media="${esc(b.gambar_media_id)}" alt="${esc(b.alt_gambar || b.judul)}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block">`;
    if (b.gambar_utama_file_id && /^https?:\/\//i.test(b.gambar_utama_file_id))
      return `<img src="${esc(b.gambar_utama_file_id)}" alt="${esc(b.alt_gambar || b.judul)}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover">`;
    return `<span class="thumb-ph" style="background:${esc(b.gambar_grad || 'linear-gradient(135deg,#016767,#0E8A84)')}"><span><span data-ic="${esc(b.gambar_ikon || 'news')}"></span><br>${esc(label || b.judul)}</span></span>`;
  }
  return { esc, slugify, fmtDate, sanitize, load, save, isLocalMode, resetLocal, kategoriNama, rapikanNama, apiCall, apiMode, getSession, setSession, clearSession, sesiAdmin, sesiPengurus, sesiCMS, clearPubCache: pubCacheClear,
           terbit, populer, pengumumanAktif, upsertBerita, hapusBerita, upsertKategori, hapusKategori,
           upsertPengumuman, hapusPengumuman, exportJSON, importJSON, thumbHTML,
           mediaPut, mediaURL, mediaDel, hydrateMedia,
           get cache(){ return cache; } };
})();
