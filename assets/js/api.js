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
  function getSession(){ try { return JSON.parse(localStorage.getItem(SES_KEY) || 'null'); } catch(e){ return null; } }
  function setSession(ses){ try { localStorage.setItem(SES_KEY, JSON.stringify(ses)); } catch(e){} }
  function clearSession(){ try { localStorage.removeItem(SES_KEY); } catch(e){} }
  function apiMode(){ return !!API_URL; }
  function sesiAdmin(){ const s = getSession(); return s && ['super_admin','pengurus_pusat'].includes(s.user && s.user.Role); }
  function sesiPengurus(){ const s = getSession(); return s && ['super_admin','pengurus_pusat','admin_korda'].includes(s.user && s.user.Role); }
  /* Tulis tembus ke backend bila admin masuk (Tahap 5). Kegagalan dicatat, tidak menggagalkan UI. */
  function tulisAPI(action, payload){
    const ses = getSession();
    if (!API_URL || !ses) return Promise.resolve(null);
    return apiCall(action, payload, ses.token).catch(e => { console.warn('Tulis API gagal:', action, e.message); return null; });
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
      try { cache = await apiCall('public.bootstrap'); return cache; } catch(e){ /* jatuh ke mode lokal */ }
    }
    try { const raw = localStorage.getItem(CMS_KEY); if (raw) { cache = JSON.parse(raw); return cache; } } catch(e){}
    try { const r = await fetch('/assets/data/berita.json'); cache = await r.json(); }
    catch(e){ cache = (typeof window !== 'undefined' && window.HISA_SEED) ? window.HISA_SEED : { kategori: [], berita: [], pengumuman: [] }; }
    return cache;
  }
  function save(){ try { localStorage.setItem(CMS_KEY, JSON.stringify(cache)); } catch(e){} }
  function isLocalMode(){ try { return !!localStorage.getItem(CMS_KEY); } catch(e){ return false; } }
  function resetLocal(){ try { localStorage.removeItem(CMS_KEY); } catch(e){} cache = null; }
  function uid(prefix){ return prefix + Date.now().toString(36).toUpperCase() + Math.floor(Math.random()*99); }
  /* --- kueri publik --- */
  function kategoriNama(id){ const k = (cache?.kategori || []).find(x => x.Kategori_ID === id); return k ? k.nama : ''; }
  function terbit(){ return [...(cache?.berita || [])].filter(b => b.status === 'terbit').sort((a,b) => (b.publish_at || '').localeCompare(a.publish_at || '')); }
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
    if (sesiAdmin()) tulisAPI('admin.berita.save', rec);
    return rec;
  }
  function hapusBerita(id){ cache.berita = cache.berita.filter(b => b.Berita_ID !== id); save(); if (sesiAdmin()) tulisAPI('admin.berita.delete', { Berita_ID: id }); }
  function upsertKategori(rec){
    if (!rec.Kategori_ID) rec.Kategori_ID = uid('KT');
    rec.slug = slugify(rec.slug || rec.nama);
    const i = cache.kategori.findIndex(k => k.Kategori_ID === rec.Kategori_ID);
    if (i >= 0) cache.kategori[i] = rec; else cache.kategori.push(rec);
    save();
    if (sesiAdmin()) tulisAPI('admin.kategori.save', rec);
    return rec;
  }
  function hapusKategori(id){ cache.kategori = cache.kategori.filter(k => k.Kategori_ID !== id); save(); if (sesiAdmin()) tulisAPI('admin.kategori.delete', { Kategori_ID: id }); }
  function upsertPengumuman(rec){
    if (!rec.Pengumuman_ID) { rec.Pengumuman_ID = uid('PG'); rec.published_at = new Date().toISOString().slice(0,10); }
    const i = cache.pengumuman.findIndex(p => p.Pengumuman_ID === rec.Pengumuman_ID);
    if (i >= 0) cache.pengumuman[i] = rec; else cache.pengumuman.unshift(rec);
    save();
    if (sesiAdmin()) tulisAPI('admin.pengumuman.save', rec);
    return rec;
  }
  function hapusPengumuman(id){ cache.pengumuman = cache.pengumuman.filter(p => p.Pengumuman_ID !== id); save(); if (sesiAdmin()) tulisAPI('admin.pengumuman.delete', { Pengumuman_ID: id }); }
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
      return `<img data-media="${esc(b.gambar_media_id)}" alt="${esc(b.alt_gambar || b.judul)}" style="width:100%;height:100%;object-fit:cover;display:block">`;
    if (b.gambar_utama_file_id && /^https?:\/\//i.test(b.gambar_utama_file_id))
      return `<img src="${esc(b.gambar_utama_file_id)}" alt="${esc(b.alt_gambar || b.judul)}" style="width:100%;height:100%;object-fit:cover">`;
    return `<span class="thumb-ph" style="background:${esc(b.gambar_grad || 'linear-gradient(135deg,#016767,#0E8A84)')}"><span><span data-ic="${esc(b.gambar_ikon || 'news')}"></span><br>${esc(label || b.judul)}</span></span>`;
  }
  return { esc, slugify, fmtDate, sanitize, load, save, isLocalMode, resetLocal, kategoriNama, apiCall, apiMode, getSession, setSession, clearSession, sesiAdmin, sesiPengurus,
           terbit, pengumumanAktif, upsertBerita, hapusBerita, upsertKategori, hapusKategori,
           upsertPengumuman, hapusPengumuman, exportJSON, importJSON, thumbHTML,
           mediaPut, mediaURL, mediaDel, hydrateMedia,
           get cache(){ return cache; } };
})();
