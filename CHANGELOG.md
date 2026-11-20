# Sürüm geçmişi

## 3.1.4
- **Açılış dayanıklılığı:** tarayıcı veritabanı, yedek konumu denetimi veya kalıcı depolama isteği takılırsa zaman aşımıyla devam edilir; başlangıç hatasında "Yükleniyor" yerine hata nedeni gösterilir.

## 3.1.3
- **Güncelleme deposu gömüldü** (`aipersonal111-byte/stok-portal`, dal `main`): kullanıcının depo adı yazması gerekmez; Ayarlar → Sürüm'deki alan boşsa varsayılan kullanılır, doluysa o geçerli olur.

## 3.1.2
- **Güncelleme düğmesi:** yeni sürüm uyarısında "Yeni sürümü indir ve güncelle" düğmesi. Önce yedek alır, GitHub'daki `index.html`'i indirip sürümünü doğrular, eski dosyanın üzerine yazdırır (desteklemeyen tarayıcıda indirir).
- Sürüm numarası 3.1.2 olarak düzenlendi (önceki 1.1.0).

## 1.1.0
- **Kullanıcı girişi ve roller** (Yönetici / Yetkili / Personel / İzleyici), isteğe bağlı; ilk kurulumda tek seferlik kurtarma kodu; PBKDF2 şifre saklama; 5 hatalı denemede geçici bekleme; hareketsizlikte otomatik kilit; zorunlu şifre değişikliği; son aktif yönetici koruması.
- **Kayıt günlüğü** (kim, ne zaman, ne yaptı): giriş/çıkış/hatalı giriş, tüm stok işlemleri, düzenleme/silme/geri alma, kart, ayar, kullanıcı, yedek, sürüm. Hareket satırları kullanıcı adıyla işaretlenir.
- **Personel ve izleyici için maliyet, kâr, ciro gizleme**; yetkisiz işlemler motorda da reddedilir.
- **Yedek konumu:** klasör veya tek dosya seçimi; seçilmezse/bulunamazsa/izin düşerse veri tarayıcıda tutulur ve uyarılır (açılış penceresi, kalıcı banner, üst çubuk, 10 dk hatırlatma, yedeksiz kapatmada onay, "Yedeği indir"); konum geri gelince otomatik yeniden bağlanma.
- **Sürüm güncelleme bildirimi:** yükseltme öncesi otomatik görüntü + "neler yeni"; daha yeni veri biçimini koruma; GitHub/`version.json` ile yeni sürüm denetimi.
- Ayarlar sayfası sekmelere ayrıldı (Genel, Yedekleme, Sürüm, Kullanıcılar, Günlük). Veri biçimi v2 (eski v1 yedekler otomatik yükseltilir).

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
