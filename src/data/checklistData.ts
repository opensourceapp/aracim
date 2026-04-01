export type ItemTag = "critical" | "tip" | null;

export interface ChecklistItem {
  text: string;
  tag: ItemTag;
}

export interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

export const checklistData: ChecklistSection[] = [
  {
    title: "Evraklar ve belgeler",
    items: [
      { text: "Fatura ve ruhsat asıllarını teslim alın", tag: "critical" },
      { text: "Garanti belgesi ve servis kitabı", tag: null },
      { text: "Araç kullanım kılavuzu (Türkçe)", tag: null },
      { text: "2. set anahtar + KESSY anahtarlık kartı", tag: "critical" },
      { text: "Egzoz muayene / homologasyon belgeleri", tag: null },
      { text: "Kasko ve trafik sigortası poliçesi fotokopisi", tag: null },
    ],
  },
  {
    title: "Dış gövde ve çevre kontrolü",
    items: [
      { text: "Tüm panel yüzeylerini farklı açılardan inceleyin", tag: "critical" },
      { text: "Cam yüzeyleri: çatlak ve taş vuruğu yok", tag: "critical" },
      { text: "Kapı kenarları ve menteşeler", tag: null },
      { text: "Ön ve arka tampon bütünlüğü", tag: null },
      { text: "4 lastik aynı marka ve model mi?", tag: null },
      { text: "Lastik diş derinliği 4 tekerde eşit", tag: null },
      { text: "Jant yüzeyleri: çizik veya darbe izi yok", tag: null },
      { text: "Stepne / tamir kiti ve kriko yerinde", tag: "tip" },
      { text: "LED far grupları ve stop lambaları hasarsız", tag: null },
      { text: "Yan ayna kapakları ve gövde rengi uyumu", tag: null },
    ],
  },
  {
    title: "İç mekan ve döşeme kontrolü",
    items: [
      { text: "Koltuk döşemeleri: leke, çizik, yırtık yok", tag: "critical" },
      { text: "Halı ve paspas seti tam ve hasarsız", tag: null },
      { text: "Tavan döşemesi: leke veya sarkmış nokta yok", tag: null },
      { text: "Direksiyon simidi: çizik veya boya izi yok", tag: null },
      { text: "Gösterge paneli çatlak veya hava kabarcığı yok", tag: null },
      { text: "Multimedya dokunmatik ekran: iz veya çatlak yok", tag: null },
      { text: "Ambiyans aydınlatması çalışıyor mu?", tag: null },
      { text: "Ön kapı LED Škoda yazısı yanıyor mu?", tag: null },
      { text: "Tüm USB-C girişler çalışıyor mu?", tag: "tip" },
    ],
  },
  {
    title: "Elektronik ve teknoloji",
    items: [
      { text: "Apple CarPlay / Android Auto bağlanıyor mu?", tag: "tip" },
      { text: "Kablosuz şarj ünitesi çalışıyor mu?", tag: null },
      { text: "Bluetooth ses bağlantısı", tag: null },
      { text: "Tüm cam açma/kapama motorları çalışıyor", tag: null },
      { text: "Isıtmalı aynalar çalışıyor mu?", tag: null },
      { text: "Geri görüş kamerası ve park sensörleri", tag: null },
      { text: "Yağmur sensörü çalışıyor mu?", tag: null },
      { text: "Far sensörü (otomatik açılma) çalışıyor mu?", tag: null },
      { text: "Lastik basınç uyarısı (TPMS) yanmıyor", tag: "critical" },
      { text: "Start-Stop sistemi aktif mi?", tag: null },
    ],
  },
  {
    title: "Motor kaputu ve sıvı kontrolleri",
    items: [
      { text: "Motor yağı seviyesi min-max arası", tag: "critical" },
      { text: "Soğutma suyu rezervuarı seviyesi", tag: null },
      { text: "Silecek suyu dolu mu?", tag: null },
      { text: "Fren hidroliği seviyesi", tag: null },
      { text: "Motor altında yağ veya su sızıntısı yok", tag: "critical" },
      { text: "Akü terminalleri temiz ve sıkı", tag: null },
      { text: "BSG kayışı ve hortumlar gözle sağlam görünüyor", tag: null },
    ],
  },
  {
    title: "Motor çalıştırma ve kısa test",
    items: [
      { text: "Soğuk motor uyarı lambası sönüyor mu?", tag: "critical" },
      { text: "Herhangi bir arıza lambası yanmıyor", tag: "critical" },
      { text: "DSG şanzıman D/R/N/S geçişleri sorunsuz", tag: null },
      { text: "Autohold çalışıyor mu?", tag: null },
      { text: "Elektrik park freni açılıp kapanıyor mu?", tag: null },
      { text: "Klima soğutuyor ve ısıtıyor mu?", tag: null },
      { text: "mHEV start-stop kapanış/açılışı sessiz", tag: "tip" },
      { text: "Frenler düzgün çalışıyor", tag: null },
      { text: "Direksiyon düz konumda araç çekilmiyor", tag: null },
      { text: "Vites kutusu aşırı titreme veya sarsıntı yok", tag: null },
    ],
  },
  {
    title: "Teslim öncesi son kontroller",
    items: [
      { text: "Yakıt deposu tam dolu mu?", tag: "critical" },
      { text: "Kilometre sayacı gerçekten düşük mü?", tag: null },
      { text: "Sigorta ve kasko başlangıç tarihi doğru mu?", tag: null },
      { text: "Bayi teslim tutanağını imzalatın", tag: "critical" },
      { text: "İlk servis zamanını öğrenin", tag: "tip" },
      { text: "Acil durum çağrı sistemi (eCall) aktif mi?", tag: null },
    ],
  },
];

export const totalItems = checklistData.reduce((sum, s) => sum + s.items.length, 0);
