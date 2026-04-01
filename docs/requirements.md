# Project Requirements

Build a mobile-first new car delivery checklist web app using Next.js and React. The app will be used on a mobile browser (Chrome) at a car dealership.

## What it does
- Displays a checklist grouped into sections
- User taps a row to check/uncheck an item
- Progress is shown at the top (percentage + count)
- All state is saved in localStorage — no backend needed
- A success message appears when everything is checked
- A "reset" button clears all progress (with confirmation)

## Checklist data (Turkish)

Section: Evraklar ve belgeler
- Fatura ve ruhsat asıllarını teslim alın [critical]
- Garanti belgesi ve servis kitabı
- Araç kullanım kılavuzu (Türkçe)
- 2. set anahtar + KESSY anahtarlık kartı [critical]
- Egzoz muayene / homologasyon belgeleri
- Kasko ve trafik sigortası poliçesi fotokopisi

Section: Dış gövde ve çevre kontrolü
- Tüm panel yüzeylerini farklı açılardan inceleyin [critical]
- Cam yüzeyleri: çatlak ve taş vuruğu yok [critical]
- Kapı kenarları ve menteşeler
- Ön ve arka tampon bütünlüğü
- 4 lastik aynı marka ve model mi?
- Lastik diş derinliği 4 tekerde eşit
- Jant yüzeyleri: çizik veya darbe izi yok
- Stepne / tamir kiti ve kriko yerinde [tip]
- LED far grupları ve stop lambaları hasarsız
- Yan ayna kapakları ve gövde rengi uyumu

Section: İç mekan ve döşeme kontrolü
- Koltuk döşemeleri: leke, çizik, yırtık yok [critical]
- Halı ve paspas seti tam ve hasarsız
- Tavan döşemesi: leke veya sarkmış nokta yok
- Direksiyon simidi: çizik veya boya izi yok
- Gösterge paneli çatlak veya hava kabarcığı yok
- Multimedya dokunmatik ekran: iz veya çatlak yok
- Ambiyans aydınlatması çalışıyor mu?
- Ön kapı LED Škoda yazısı yanıyor mu?
- Tüm USB-C girişler çalışıyor mu? [tip]

Section: Elektronik ve teknoloji
- Apple CarPlay / Android Auto bağlanıyor mu? [tip]
- Kablosuz şarj ünitesi çalışıyor mu?
- Bluetooth ses bağlantısı
- Tüm cam açma/kapama motorları çalışıyor
- Isıtmalı aynalar çalışıyor mu?
- Geri görüş kamerası ve park sensörleri
- Yağmur sensörü çalışıyor mu?
- Far sensörü (otomatik açılma) çalışıyor mu?
- Lastik basınç uyarısı (TPMS) yanmıyor [critical]
- Start-Stop sistemi aktif mi?

Section: Motor kaputu ve sıvı kontrolleri
- Motor yağı seviyesi min-max arası [critical]
- Soğutma suyu rezervuarı seviyesi
- Silecek suyu dolu mu?
- Fren hidroliği seviyesi
- Motor altında yağ veya su sızıntısı yok [critical]
- Akü terminalleri temiz ve sıkı
- BSG kayışı ve hortumlar gözle sağlam görünüyor

Section: Motor çalıştırma ve kısa test
- Soğuk motor uyarı lambası sönüyor mu? [critical]
- Herhangi bir arıza lambası yanmıyor [critical]
- DSG şanzıman D/R/N/S geçişleri sorunsuz
- Autohold çalışıyor mu?
- Elektrik park freni açılıp kapanıyor mu?
- Klima soğutuyor ve ısıtıyor mu?
- mHEV start-stop kapanış/açılışı sessiz [tip]
- Frenler düzgün çalışıyor
- Direksiyon düz konumda araç çekilmiyor
- Vites kutusu aşırı titreme veya sarsıntı yok

Section: Teslim öncesi son kontroller
- Yakıt deposu tam dolu mu? [critical]
- Kilometre sayacı gerçekten düşük mü?
- Sigorta ve kasko başlangıç tarihi doğru mu?
- Bayi teslim tutanağını imzalatın [critical]
- İlk servis zamanını öğrenin [tip]
- Acil durum çağrı sistemi (eCall) aktif mi?

## Tags
[critical] = highlight in amber/orange
[tip] = highlight in blue
Items without a tag = default style