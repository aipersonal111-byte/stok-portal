
// ============================ DEPO BAŞLA ============================
/* Katmanlar (hepsi her değişiklikte, ~0,4 sn sonra):
   1) IndexedDB ana kayıt   2) localStorage senkron kopya   3) IndexedDB döner anlık görüntüler
   4) Seçilen klasöre dosya: stok_portal_guncel.json (her değişiklik), gunluk_*.json (gün sonu hali),
      anlik_*.json (saatlik, son 48), oncesi_*.json (riskli işlem öncesi)                           */
const Depo = {
  db: null, ok: false, hata: '',
  async ac() {
    if (typeof indexedDB === 'undefined') throw new Error('IndexedDB desteklenmiyor');
    this.db = await new Promise((res, rej) => {
      const r = indexedDB.open('sos_stok_v1', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
        if (!d.objectStoreNames.contains('snap')) d.createObjectStore('snap', { keyPath: 'ts' });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
      r.onblocked = () => rej(new Error('Veritabanı başka sekme tarafından kilitli'));
    });
    this.ok = true;
  },
  p(req) { return new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); }); },
  st(ad, mod) { return this.db.transaction(ad, mod).objectStore(ad); },
  kvAl(k) { return this.p(this.st('kv', 'readonly').get(k)); },
  kvKoy(k, v) { return this.p(this.st('kv', 'readwrite').put(v, k)); },
  snapKoy(ts, json, etiket) { return this.p(this.st('snap', 'readwrite').put({ ts, json, etiket, boyut: json.length })); },
  snapListe() { return this.p(this.st('snap', 'readonly').getAll()).then(l => l.sort((a, b) => b.ts - a.ts)); },
  snapSil(ts) { return this.p(this.st('snap', 'readwrite').delete(ts)); },
  async snapTemizle(tut) { const l = await this.snapListe(); for (const x of l.slice(tut)) await this.snapSil(x.ts); },
};

const Klasor = {
  destek: typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function',
  h: null, durum: 'yok', ad: '', hata: '', sonYazma: 0, _anlik: 0, _gunluk: 0,
  async baslat() {
    if (!this.destek || !Depo.ok) return;
    try { this.h = (await Depo.kvAl('dir')) || null; } catch (e) { this.h = null; }
    if (this.h) { this.ad = this.h.name; await this.izinKontrol(); }
  },
  async izinKontrol() {
    try { this.durum = (await this.h.queryPermission({ mode: 'readwrite' })) === 'granted' ? 'tamam' : 'izin'; }
    catch (e) { this.durum = 'hata'; this.hata = String(e.message || e); }
  },
  async sec() {
    const h = await window.showDirectoryPicker({ mode: 'readwrite', id: 'sosstok' });
    this.h = h; this.ad = h.name; this.durum = 'tamam'; this.hata = '';
    await Depo.kvKoy('dir', h);
  },
  async izinVer() {
    try { this.durum = (await this.h.requestPermission({ mode: 'readwrite' })) === 'granted' ? 'tamam' : 'izin'; }
    catch (e) { this.durum = 'hata'; this.hata = String(e.message || e); }
  },
  async dosyaYaz(ad, metin) {
    const fh = await this.h.getFileHandle(ad, { create: true });
    const w = await fh.createWritable();          // atomik: kapanışta yer değiştirir
    await w.write(metin); await w.close();
  },
  async listele() {
    const out = [];
    for await (const [ad, h] of this.h.entries()) {
      if (h.kind === 'file' && /^(stok_portal|anlik|gunluk|oncesi).*\.json$/.test(ad)) {
        const f = await h.getFile(); out.push({ ad, boyut: f.size, degisim: f.lastModified });
      }
    }
    return out.sort((a, b) => b.degisim - a.degisim);
  },
  async oku(ad) { const fh = await this.h.getFileHandle(ad); return (await fh.getFile()).text(); },
  async temizle(onek, tut) {
    const l = (await this.listele()).filter(x => x.ad.startsWith(onek));
    for (const x of l.slice(tut)) { try { await this.h.removeEntry(x.ad); } catch (e) { /* yoksay */ } }
  },
  async yaz(json, zorla) {
    if (this.durum !== 'tamam') return false;
    try {
      const d = new Date(), gun = iso(d).replace(/-/g, ''), hm = String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
      await this.dosyaYaz('stok_portal_guncel.json', json);
      if (zorla || Date.now() - this._gunluk > 5 * 60e3) { await this.dosyaYaz(`gunluk_${gun}.json`, json); this._gunluk = Date.now(); await this.temizle('gunluk_', 90); }
      if (zorla || Date.now() - this._anlik > 60 * 60e3) { await this.dosyaYaz(`anlik_${gun}_${hm}.json`, json); this._anlik = Date.now(); await this.temizle('anlik_', 48); }
      this.sonYazma = Date.now(); this.hata = '';
      return true;
    } catch (e) {
      this.hata = String(e.message || e);
      this.durum = (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) ? 'izin' : 'hata';
      return false;
    }
  },
};

const Kayit = {
  bekleyen: false, zaman: null, kuyruk: Promise.resolve(), sonKayit: 0, sonSnap: 0, eskiSekme: false, hata: '', sonIndirme: 0,
  planla() {
    if (this.eskiSekme) return;
    this.bekleyen = true; durumGuncelle();
    clearTimeout(this.zaman);
    this.zaman = setTimeout(() => this.flush(), 400);
  },
  flush(neden) { this.kuyruk = this.kuyruk.then(() => this._flush(neden)).catch(() => {}); return this.kuyruk; },
  senkron() {                                   // sayfa kapanırken: senkron kopya (eski sekme asla yazmaz)
    if (this.eskiSekme) return;
    try { localStorage.setItem('sos_db', JSON.stringify(db)); } catch (e) { /* yoksay */ }
  },
  async _flush(neden) {
    if (this.eskiSekme || (!this.bekleyen && neden !== 'zorla')) return;
    this.bekleyen = false;
    db.gun = Date.now();
    const json = JSON.stringify(db);
    let hata = '';
    try { localStorage.setItem('sos_db', json); } catch (e) { /* kota: IDB yeterli */ }
    if (Depo.ok) {
      try {
        await Depo.kvKoy('db', json);
        if (neden === 'zorla' || Date.now() - this.sonSnap > 10 * 60e3) {
          await Depo.snapKoy(Date.now(), json, neden === 'zorla' ? 'Elle' : 'Otomatik'); this.sonSnap = Date.now();
          await Depo.snapTemizle(30);
        }
      } catch (e) { hata = 'Tarayıcı kaydı yazılamadı: ' + (e.message || e); }
    } else hata = 'Tarayıcı veritabanı yok; yalnızca klasör/dosya yedeği geçerli.';
    if (Klasor.durum === 'tamam') { await Klasor.yaz(json, neden === 'zorla'); }
    this.hata = hata; this.sonKayit = Date.now();
    try { if (bc) bc.postMessage({ gun: db.gun }); } catch (e) { /* yoksay */ }
    durumGuncelle(); bannerGuncelle();
  },
  async oncesi(etiket) {                        // riskli işlemden (içe aktarma, sıfırlama) önce görüntü
    const json = JSON.stringify(db), d = new Date();
    try { if (Depo.ok) { await Depo.snapKoy(Date.now(), json, etiket); await Depo.snapTemizle(30); } } catch (e) { /* yoksay */ }
    if (Klasor.durum === 'tamam') { try { await Klasor.dosyaYaz(`oncesi_${iso(d).replace(/-/g, '')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}.json`, json); await Klasor.temizle('oncesi_', 20); } catch (e) { /* yoksay */ } }
  },
};
kaydetKancasi = () => Kayit.planla();

const bc = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('sos_stok_v1') : null;
if (bc) bc.onmessage = e => { if (e.data && e.data.gun > db.gun) { Kayit.eskiSekme = true; bannerGuncelle(); durumGuncelle(); } };

async function yukle() {
  let a = null, b = null;
  try { await Depo.ac(); const s = await Depo.kvAl('db'); if (s) a = JSON.parse(s); } catch (e) { Depo.hata = String(e.message || e); }
  try { const s = localStorage.getItem('sos_db'); if (s) b = JSON.parse(s); } catch (e) { /* yoksay */ }
  const adaylar = [a, b].filter(x => x && dogrula(x)).sort((x, y) => (y.gun || 0) - (x.gun || 0));
  db = adaylar[0] || bosDb();
  dv++; memo.clear();
  await Klasor.baslat();
  try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { /* yoksay */ }
}

function dosyaIndir(ad, metin, mime) {
  const blob = new Blob([metin], { type: mime || 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = ad;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
const zamanDamga = () => { const d = new Date(); return iso(d).replace(/-/g, '') + '_' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0'); };

/** Yedek metnini doğrular ve özetler (uygulamadan önce onay penceresi için). */
function yedekCoz(metin) {
  let o; try { o = JSON.parse(metin); } catch (e) { return { hata: 'Dosya geçerli bir JSON değil.' }; }
  if (!dogrula(o)) return { hata: 'Bu dosya bir Stok Portal yedeği değil.' };
  return { o, kart: o.kartlar.length, hr: o.hr.length, gun: o.gun, firma: o.firma };
}
async function yedekUygula(o, etiket) {
  await Kayit.oncesi('Geri yükleme öncesi — ' + etiket);
  db = o; dv++; memo.clear();
  Kayit.bekleyen = true; await Kayit.flush('zorla');
}
// ============================ DEPO BİTİŞ ============================
