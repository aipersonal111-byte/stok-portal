'use strict';
// Sürüm bilgisi. Yeni sürüm yayınlarken: SURUM, DEGISIKLIKLER, package.json ve CHANGELOG.md birlikte güncellenir.
const SURUM = '3.1.2';
const DB_SEMA = 2;           // veri biçimi sürümü: eski dosya, daha yeni biçimdeki veriyi bozmasın diye kontrol edilir
const DEGISIKLIKLER = [
  { s: '3.1.2', t: '2026-11-20', n: [
    'Yeni sürüm uyarısına "Yeni sürümü indir ve güncelle" düğmesi eklendi: önce yedek alır, GitHub\'dan yeni index.html\'i indirir ve doğrular, eski dosyanın üzerine yazdırır (veya indirir)',
    'Sürüm numarası 3.1.2 olarak düzenlendi',
  ] },
  { s: '1.1.0', t: '2026-11-13', n: [
    'Kullanıcı girişi, roller (Yönetici / Yetkili / Personel / İzleyici) ve kayıt günlüğü (kim, ne zaman, ne yaptı)',
    'Personel ve izleyici rollerinde maliyet, kâr ve ciro bilgileri gizlenir',
    'Yedek konumu (klasör veya tek dosya) seçilmeli: seçilmezse, bulunamazsa veya izin düşerse uyarı verilir; yedeksiz kapatmada onay istenir',
    'Sürüm güncelleme bildirimi: yeni sürüm açılınca "neler yeni", eski dosyanın yeni veriyi bozması engellenir, GitHub\'dan yeni sürüm denetimi',
  ] },
  { s: '1.0.0', t: '2026-11-12', n: ['İlk sürüm: stok, üretim, satış, zayiat, sayım fişi, takribi maliyet ve kâr, otomatik yedek.'] },
];
const surumKarsilastir = (a, b) => {
  const x = String(a || '0').split('.').map(Number), y = String(b || '0').split('.').map(Number);
  for (let i = 0; i < 3; i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d > 0 ? 1 : -1; }
  return 0;
};
