// src/ altındaki parçaları tek dosyalık index.html'e birleştirir.
//   node build.js          -> index.html üretir
//   node build.js --check  -> index.html'in güncel olup olmadığını denetler (CI için)
const fs = require('fs'), path = require('path');
const parcalar = ['head.html', 'motor.js', 'depo.js', 'ui.js', 'tail.html'];
const cikti = parcalar.map(p => fs.readFileSync(path.join(__dirname, 'src', p), 'utf8')).join('');
const betik = cikti.match(/<script>([\s\S]*)<\/script>/);
try { new Function(betik[1]); } catch (e) { console.error('JavaScript sözdizimi hatası:', e.message); process.exit(1); }
const hedef = path.join(__dirname, 'index.html');
if (process.argv.includes('--check')) {
  const mevcut = fs.existsSync(hedef) ? fs.readFileSync(hedef, 'utf8') : '';
  if (mevcut !== cikti) { console.error('index.html güncel değil: "node build.js" çalıştırıp index.html dosyasını da commit edin.'); process.exit(1); }
  console.log('index.html güncel.');
} else {
  fs.writeFileSync(hedef, cikti);
  console.log('index.html üretildi (' + cikti.length + ' bayt)');
}
