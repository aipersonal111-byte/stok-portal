# Stok Portal

Tek dosyalık, **çevrimdışı** çalışan stok takip uygulaması. Kurulum, sunucu veya internet gerekmez: `index.html` dosyasını tarayıcıda açmak yeterlidir.

**Ne yapar?**

| Akış | Açıklama |
|---|---|
| 🛒 **Ticari** | Alış (gelen) → Satış (giden) → Kalan |
| 🥩 **Ham** | Alış (gelen) → Üretimde kullanılan (giden) → Kalan |
| 🏭 **Mamül** | Üretilen (gelen) → Satılan (giden) → Kalan |

- **Üretim:** çok girdili, yan ürünlü; fire otomatik hesaplanır; randıman gösterilir. Girdi maliyeti mamüle ve yan ürüne dağıtılır.
- **Maliyet ve takribi kâr:** alışta birim fiyat girilirse hareketli ağırlıklı ortalama maliyet hesaplanır. Satış fiyatı girilmezse *ortalama maliyet × (1 + kâr oranı)* ile tahmin edilir (genel oran Ayarlar'da, ürün bazlı oran Kartlar'da). Tüm tahmini rakamlar "takribi" etiketlidir.
- **Zayiat / ikram**, **sipariş listesi** (asgari stok), **Stok durumu** (Devir + Gelen − Giden = Kalan, dönem seçilebilir).
- **Stok sayımı = sayım fişi:** farkların nedeni (ürün bazında/genel) ve zorunlu yazılı açıklama (izahat) ile kaydedilir; düzeltme hareketi olarak işlenir, geçmişe dokunulmaz; yazdırılabilir sayım raporu; sayım iptal edilebilir.
- **Hata düzeltme:** hareket düzenleme/silme, arşivden geri alma, üretim ve sayım iptali. Stoğu eksiye düşürecek işlemler engellenir.
- **Analiz:** takribi mali özet, üretim randımanı, kayıplar (zayiat, fire, sayım farkı – nedene göre), CSV (Excel) dışa aktarma.

## Hızlı başlangıç

1. `index.html` dosyasını indirin ve **Chrome** veya **Edge** ile açın (çift tıklamak yeterli).
2. **Ayarlar → Yedekleme → "Yedek klasörü seç"** ile bir klasör seçin. *(Windows/Chrome Masaüstü, Belgeler veya İndirilenler'in kendisini seçtirmez: içinde yeni bir klasör, örn. `StokYedek`, oluşturup onu seçin.)*
3. **Kartlar** sayfasında stok kartlarınızı açın (Ham / Mamül / Ticari), sonra **Alış → Üretim → Satış** ile çalışın.

İlk denemek için Panel'deki **"Örnek veriyle dene"** düğmesini kullanabilirsiniz (Ayarlar'dan tüm veriyi silerek temizlenir).

## Veri nerede, nasıl yedeklenir?

Veriler **bu bilgisayardaki tarayıcıda** saklanır (IndexedDB). Hiçbir sunucuya gönderilmez. Her değişiklikte (~0,4 sn sonra):

1. Tarayıcı ana kaydı güncellenir, ayrıca eşzamanlı bir yerel kopya yazılır.
2. Tarayıcı içinde döner anlık görüntüler tutulur (son 30).
3. Yedek klasörü seçilmişse dosyalar yazılır:
   - `stok_portal_guncel.json` — her değişiklikte güncellenir,
   - `gunluk_YYYYMMDD.json` — günün son hali (son 90 gün),
   - `anlik_YYYYMMDD_SSDD.json` — saatlik (son 48),
   - `oncesi_*.json` — geri yükleme / silme öncesi (son 20).

Yedekten dönmek: **Ayarlar → Yedekten aç…** veya listeden **Geri yükle**. İşlemden önce mevcut durumun görüntüsü otomatik alınır.

> ⚠️ **Tarayıcı verisini (site verilerini) silmeyin.** Silerseniz yedek klasörü son kurtarma yoludur.
> ⚠️ **Aynı adresten kullanın.** Veri, uygulamanın açıldığı adrese bağlıdır. `index.html`'i dosyadan açıp sonra GitHub Pages'e (veya tersine) geçerseniz yeni adres boş görünür: eski adreste **Ayarlar → Yedeği indir**, yeni adreste **Yedekten aç…** yapın.
> ⚠️ İki sekmede/pencerede birden açmayın; ikinci sekmede değişiklik olursa eski sekme verinin üzerine yazmamak için kaydı durdurur ve uyarır.

**Tarayıcı desteği:** Klasöre otomatik yedek için Chrome/Edge gerekir. Firefox/Safari'de uygulama çalışır, ancak klasöre otomatik yazamaz; düzenli olarak "Yedeği indir (JSON)" kullanın.

## GitHub'a koymak ve yayınlamak

**Veri depoya girmez:** `.gitignore`, yedek dosyalarını ve eski veritabanlarını dışarıda tutar. Yine de `stok_portal_*.json`, `anlik_*`, `gunluk_*` gibi dosyaları depoya **elle eklemeyin**.

İsteğe bağlı GitHub Pages ile yayınlama (kendi adresinizden açmak için): *Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`*. Adres `https://<kullanıcı>.github.io/<depo>/` olur. Ücretsiz hesapta Pages için depo herkese açık olmalıdır (uygulama kodu açık olur; verileriniz yine yalnızca kendi tarayıcınızdadır). Hassas işletme verisi için dosyayı yerelden (`file://`) kullanmak daha az yüzey bırakır.

## Geliştirme

Kaynak `src/` altında parçalıdır; `index.html` bunlardan üretilir ve **depoya dahildir** (indirip çalıştırmak için).

```bash
node build.js        # src/ → index.html
node build.js --check  # index.html güncel mi? (CI bunu çalıştırır)
npm test             # motor + arayüz + yedekleme testleri (bağımlılık yok, Node ≥ 18)
```

```
src/head.html   CSS ve sayfa iskeleti
src/motor.js    stok, maliyet, üretim, satış, sayım, rapor mantığı (saf JS)
src/depo.js     IndexedDB, klasöre otomatik yedek, döner yedekler, çoklu sekme koruması
src/ui.js       sayfalar, canlı hesaplar, pencereler, olaylar
src/tail.html   sayfa sonu
tests/          Node testleri + küçük sahte DOM (gerçek tarayıcı gerekmez)
docs/GELISTIRME.md  mimari ve değişmez kurallar
```

Ayrıntılı mimari notları: [`docs/GELISTIRME.md`](docs/GELISTIRME.md). Sürüm geçmişi: [`CHANGELOG.md`](CHANGELOG.md).

## Test durumu — dürüst not

Testler mantığı (stok/maliyet/üretim/sayım/silme-geri alma), arayüz akışlarını (sahte bir DOM ile sayfaları üretip tablolara değer girip düğmelere "tıklayarak") ve yedek katmanını (sahte IndexedDB ve klasör ile: izin kaybı, yeniden açılış, döner silme, çoklu sekme, geri yükleme) doğrular. **Gerçek tarayıcıda otomatik test yoktur**: görsel düzen, yazdırma çıktısı ve Chrome'un klasör izni davranışı elle denenmelidir. Bulduğunuz sorunları ekran görüntüsüyle iletin.

## Bilinen sınırlar

- Tek kullanıcı / tek bilgisayar. Çok kullanıcılı veya birden çok cihazda eşzamanlı kullanım için sunucu gerekir (kapsam dışı).
- Reçete/menü bazlı otomatik stok düşümü yoktur (bilinçli olarak çıkarıldı).
- Ondalık için virgül kullanın: `1250` veya `1,25`. Nokta ondalık sayılır (`1.250` = 1,25).
- Satış anında girilmeyen fiyatlar için kaydedilen kâr oranı sonradan değişmez; genel oranı değiştirmek geçmiş satışların takribi gelirini değiştirmez.
