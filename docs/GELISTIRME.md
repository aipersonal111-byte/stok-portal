# Geliştirme notları

Bu belge, projeyi (insan veya yapay zekâ yardımıyla) güncellerken bozulmaması gereken kuralları özetler.

## Katmanlar

| Dosya | Sorumluluk | Kural |
|---|---|---|
| `src/motor.js` | Tüm iş mantığı (stok, maliyet, üretim, satış, sayım, rapor) | DOM'a ve depolamaya **dokunmaz**; `db` nesnesi üzerinde çalışır; her değişiklik `degisti()` çağırır |
| `src/depo.js` | IndexedDB, localStorage kopyası, klasör yedeği, çoklu sekme | `kaydetKancasi` ile `degisti()`'ne bağlanır; yazma hatası uygulamayı durdurmaz |
| `src/ui.js` | Sayfalar (`SAYFA.*` HTML üretir), canlı hesaplar (`live*`), olaylar (`ACT.*`) | Sayfa fonksiyonları saf HTML metni döndürür; kullanıcı girdisi `esc()` ile kaçışlanır |

## Veri modeli (`db`)

```
db = { v, firma, ayar:{kar}, kartlar:[], hr:[], sayimlar:[], sayac, gun }
kart  = { id, ad, kat, grup:'HAM'|'MAMUL'|'TICARI', birim, asgari, kar|null, aktif }
hr    = { id, t:'YYYY-MM-DD', kart, yon:'G'|'C'|'X', tip, mik, bm, fiyat|null, oran|null,
          kod, not, neden, sil, silNeden, silTs, ts }            // sayım satırlarında ayrıca sis, say
sayim = { id, kod:'SYM-…', t, not, izahat, ts, satirlar:[{kart,sis,say,fark,bm,neden}] }
```

- `yon`: `G` stoğa giriş, `C` stoktan çıkış, `X` stoğu etkilemez (yalnızca FİRE bilgi satırı).
- `tip`: `ALIS`, `URETIM_GIRDI`, `URETIM_CIKTI`, `YAN_URUN`, `FIRE`, `SATIS`, `ZAYIAT`, `SAYIM`.
- `kod`: üretim seansı `URT-…`, sayım fişi `SYM-…`. Aynı `kod`lu satırlar **bütün olarak** silinir/geri alınır (`genislet`).
- `sil=1`: arşivde; stok hesabına girmez. Kalıcı silme yoktur.

## Değişmez kurallar

1. **Maliyet:** hareketli ağırlıklı ortalama, tarih+id sırasıyla (`defter()`). Çıkışta o anki ortalama kullanılır.
2. **Stok eksiye düşmez:** yeni çıkış, silme, geri alma, düzenleme `bozulur()` ile denetlenir. *Yalnızca stoğu kötüleştirip eksiye düşüren* işlem engellenir (mevcut eksik bakiyeler başka işlemleri kilitlemez).
3. **Takribi gelir:** `fiyat` girilmişse gerçek; değilse `bm × (1 + oran/100)`, `oran` satış anında kayda yazılır.
4. **Sayım:** fark olan her kalem için neden zorunlu; fark varsa `IZAHAT_MIN` karakterlik izahat zorunlu. Sayım düzeltmesi geçmişi değiştirmez, yeni hareket ekler.
5. **Yedek:** her `degisti()` → `Kayit.planla()`. Eski sekme (`Kayit.eskiSekme`) asla yazmaz. Riskli işlemlerden önce `Kayit.oncesi()`.
6. **Şema değişirse** `dogrula()` içinde eski yedekleri yükseltin (yeni alanlara varsayılan verin); eski yedekler açılabilmelidir.

## Yeni sayfa eklemek

1. `SAYFALAR` listesine `[anahtar, ikon, ad]` ekleyin.
2. `SAYFA.anahtar = () => '…html…'` yazın.
3. Canlı hesap gerekiyorsa `live*` fonksiyonu yazıp `render()` ve `olaylariBagla()` içindeki eşlemelere ekleyin; fonksiyon, sayfanın farklı sekmelerinde alanı bulamazsa **sessizce dönmelidir**.
4. Düğmeler `data-act="ad"` ile `ACT.ad` fonksiyonuna bağlanır.

## Test

```bash
npm test
```

- `tests/test_motor.js` — motor mantığı (Node'da, DOM yok).
- `tests/test_ui.js` — `tests/minidom.js` sahte DOM'uyla sayfalar üretilir, alanlar doldurulur, düğmelere tıklanır.
- `tests/test_depo.js` — sahte IndexedDB / klasör / BroadcastChannel ile yedek katmanı.

Yeni özellik ekleyince ilgili testi de ekleyin; `index.html`'i `node build.js` ile yeniden üretip commit edin (CI `--check` ile denetler). Gerçek tarayıcıda görsel kontrol ve yazdırma testi elle yapılmalıdır.

## Sürümleme

`src/motor.js` başındaki `SURUM` sabitini, `package.json` sürümünü ve `CHANGELOG.md`'yi birlikte güncelleyin.
