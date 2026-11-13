# Sürüm geçmişi

## 1.0.0
İlk sürüm (tek dosyalık `index.html`).

- Stok kartları: Ürün + Kategori + Grup (Ham / Mamül / Ticari), birim, asgari stok, ürün bazlı kâr oranı. Kart numarayla tutulur; ad/grup/birim değişince geçmiş otomatik izler.
- Alış (birim fiyatlı), Üretim (çok girdi, yan ürün, otomatik fire, randıman), Satış (fiyatlı veya takribi), Zayiat/İkram.
- Hareketli ağırlıklı ortalama maliyet; takribi satış fiyatı ve takribi mali özet (genel + ürün bazlı kâr oranı).
- Stok durumu: devir / gelen / giden / kalan, dönem seçimi, stok değeri, takribi satış değeri, sipariş listesi.
- Stok sayımı = sayım fişi: ürün bazında ve genel fark nedeni, onay öncesi inceleme, zorunlu yazılı açıklama (izahat), düzeltme hareketleri, sayım geçmişi, sayım iptali, yazdırılabilir sayım raporu.
- Hareket düzenleme/silme, arşiv ve geri alma, üretim iptali; stoğu eksiye düşüren işlemler engellenir.
- Analiz: mali özet, üretim randımanı, kayıplar (zayiat, fire, sayım — nedene göre). CSV dışa aktarma.
- Veri güvenliği: IndexedDB + yerel kopya + döner görüntüler + klasöre otomatik dosya yedeği (güncel / günlük / saatlik / işlem öncesi), çoklu sekme koruması, yedekten geri yükleme.
