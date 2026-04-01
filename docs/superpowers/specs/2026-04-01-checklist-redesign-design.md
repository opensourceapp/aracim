# Araç Teslim Kontrol Listesi — UI Redesign Spec

## Özet

Mevcut basit checklist ekranını modern, glassmorphism tabanlı, mobil-uygulama tadında bir deneyime dönüştürme. Müşteri odaklı (araç satın alan kişiler), offline çalışan, fotoğraf/not destekli, PDF rapor üretebilen bir SPA.

## Kullanıcı Profili

- **Kim:** Araç satın alan müşteri (teknik bilgisi olmayabilir)
- **Nerede:** Bayide, araç başında, telefon elinde
- **Nasıl:** Serbest navigasyon — istediği bölüme istediği sıradan erişir, filtreler

## Kararlar

| Karar | Seçim |
|-------|-------|
| Kullanıcı | Müşteri (araç alıcısı) |
| Item etkileşimi | Checkbox + sorunlu mod (not + fotoğraf) |
| Navigasyon | Serbest liste (wizard yok) |
| Rapor | PDF dışa aktarma + paylaşım |
| Görsel ton | Glassmorphism / Modern (dark gradient) |
| Araç bilgisi | Opsiyonel (zorunlu değil) |
| Yaklaşım | Elevated List — tek sayfa, glass kartlar, inline genişleme |

## 1. Genel Yapı

Tek sayfa, 4 katman (yukarıdan aşağıya):

1. **Glassmorphism sticky header** — blur backdrop, büyük animated progress ring, opsiyonel araç bilgisi chip'i
2. **Filter bar** — arama kutusu + durum/etiket/kategori filtreleri (kombine çalışır)
3. **Section list** — glass kartlar içinde checklist maddeleri
4. **Floating bottom bar** — "Rapor Oluştur" butonu + genel ilerleme yüzdesi

## 2. Filtreleme Sistemi

3 filtreleme ekseni, birlikte çalışır:

- **Arama** — madde metni içinde free-text arama
- **Durum filtresi** — Tümü / Bekleyen / Tamam / Sorunlu (chip'ler, sayılarla)
- **Etiket filtresi** — Kritik / İpucu
- **Kategori filtresi** — 7 bölümden seç/kaldır (çoklu seçim)

Filtreler kombine: "Dış Gövde + Bekleyen + Kritik" → sadece dış gövdedeki kontrol edilmemiş kritik maddeleri gösterir.

## 3. Checklist Item Etkileşimi

Her maddenin 3 durumu:

| Durum | Görünüm | Geçiş |
|-------|---------|-------|
| `unchecked` | Boş daire, beyaz/40% metin | Tıklama → `ok` |
| `ok` | Yeşil check + glow, tam beyaz metin | Tıklama → `unchecked` |
| `issue` | Amber uyarı + glow, genişlemiş panel | Long-press ile giriş, tıklama → `unchecked` |

**Etkileşim akışı:**
- **Tek tıklama** → `unchecked` ↔ `ok` (hızlı toggle, en sık kullanım)
- **Long-press (500ms)** → `issue` moduna geç, hafif titreşim (`navigator.vibrate(50)`)
- **Issue modunda:** not textarea (debounced autosave) + fotoğraf ekleme (kamera/galeri)
- **Fotoğraflar:** `<input type="file" accept="image/*" capture="environment">`, base64 olarak localStorage'da, thumbnail grid olarak gösterilir

## 4. Veri Yapısı

Mevcut `Record<string, boolean>` → zengin yapıya:

```typescript
type ItemStatus = "unchecked" | "ok" | "issue";

interface ItemState {
  status: ItemStatus;
  note?: string;
  photos?: string[];    // base64 thumbnail
  updatedAt?: number;   // timestamp
}

interface VehicleInfo {
  brand?: string;
  model?: string;
  plate?: string;
  year?: string;
}

// localStorage keys:
// "car-checklist-state" → Record<string, ItemState>
// "car-vehicle-info" → VehicleInfo
```

Mevcut `checklistData.ts` ve tipleri (`ChecklistSection`, `ChecklistItem`, `ItemTag`) olduğu gibi kalır.

## 5. Rapor Oluşturma

**Route:** `/rapor`

**İçerik:**
- Tarih + araç bilgisi (girilmişse)
- Özet: X tamam / Y sorunlu / Z atlandı
- Sorunlu maddeler detaylı (not + fotoğraflar inline)
- Tamam maddeler kategoriye göre özet

**Teknik:**
- CSS `@media print` ile print-optimized görünüm
- `window.print()` ile PDF üretimi (ek kütüphane yok)
- Web Share API (`navigator.share()`) ile native paylaşım
- Aynı localStorage verisinden okur

**Erişim:** Floating bar'daki "Rapor Oluştur" butonu → `/rapor` sayfasına navigate

## 6. Görsel Tasarım Sistemi

### Renk Paleti

```
Arka plan:     linear-gradient(135deg, #0f0c29, #302b63, #24243e)
Cam kartlar:   bg-white/8-12%, border-white/15-20%, backdrop-blur-16-20px
Tamam:         #22c55e (emerald) + soft green glow
Sorunlu:       #f59e0b (amber) + soft amber glow
Bekleyen:      white/40%
Kritik badge:  #ef4444 (red)
İpucu badge:   #3b82f6 (blue)
Primary:       #8b5cf6 → #6366f1 gradient (violet→indigo)
Progress:      conic gradient violet → indigo → emerald
Metin:         white/95% (başlık), white/80% (normal), white/50% (ikincil)
```

### Mikro-animasyonlar

- Check: scale 0→1.2→1 + yeşil pulse (200ms)
- Sorunlu geçiş: amber glow fade-in + aşağı genişleme (300ms ease-out)
- Bölüm açma/kapama: smooth height (accordion)
- Progress ring: spring animasyonu
- Tamamlanma: confetti efekti + yeşil gradient header

### Tipografi & Boşluk

- Font: sistem fontu (`-apple-system, system-ui`)
- Touch target: minimum 48px
- Kart arası: 12px (gap-3)
- Kart içi: 16px (p-4)

## 7. Bileşen Yapısı

```
src/
├── pages/
│   ├── Index.tsx              ← ana sayfa (bileşenleri birleştirir)
│   └── Report.tsx             ← rapor sayfası (/rapor)
├── components/
│   ├── ChecklistHeader.tsx    ← glassmorphism header + progress ring + araç chip
│   ├── FilterBar.tsx          ← arama + durum/etiket/kategori filtreleri
│   ├── SectionCard.tsx        ← cam efektli bölüm kartı + mini progress
│   ├── ChecklistItem.tsx      ← tek madde: 3 durum, long-press, genişleme
│   ├── ItemDetail.tsx         ← sorunlu modda not + fotoğraf alanı
│   ├── PhotoCapture.tsx       ← fotoğraf çekme/seçme + thumbnail grid
│   ├── ProgressRing.tsx       ← SVG animated circular progress
│   ├── FloatingBar.tsx        ← alttaki sabit bar
│   ├── VehicleInfo.tsx        ← opsiyonel araç bilgi formu
│   ├── ConfettiEffect.tsx     ← tamamlanma kutlama efekti
│   └── ui/                    ← shadcn/ui (dokunulmaz)
├── hooks/
│   ├── useChecklist.ts        ← genişletilmiş (ItemState, fotoğraf, not)
│   ├── useFilters.ts          ← arama + çoklu filtre mantığı
│   ├── useLongPress.ts        ← long-press gesture hook
│   └── useVehicleInfo.ts      ← araç bilgisi state + localStorage
├── data/
│   └── checklistData.ts       ← mevcut (değişmez)
├── lib/
│   └── utils.ts               ← mevcut
└── types/
    └── checklist.ts           ← ItemStatus, ItemState, VehicleInfo tipleri
```

## 8. Routing

```
/       → Index (checklist ana ekranı)
/rapor  → Report (PDF rapor görünümü)
```

App.tsx'teki mevcut catch-all `*` route'unun üstüne eklenir.

## 9. Offline Desteği

- Tüm veri localStorage'da — zaten offline çalışır
- Fotoğraflar base64 olarak localStorage'da (büyük dosyalarda uyarı gösterilir, max ~2MB/fotoğraf)
- Ek bir service worker veya cache API gerekmez (statik SPA, Vite build)

## 10. Kapsam Dışı

- Backend / API entegrasyonu
- Kullanıcı hesapları / authentication
- Çoklu araç geçmişi (tek seferlik kontrol)
- Dark/light mode toggle (sadece dark glassmorphism theme)
- Uygulama mağazası dağıtımı (PWA olarak kullanılır)
