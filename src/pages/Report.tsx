import { useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Share2 } from "lucide-react";
import { checklistData, totalItems } from "@/data/checklistData";
import type { ChecklistState, VehicleInfo as VehicleInfoType } from "@/types/checklist";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

const Report = () => {
  const navigate = useNavigate();
  const items: ChecklistState = loadFromStorage("car-checklist-state", {});
  const vehicle: VehicleInfoType = loadFromStorage("car-vehicle-info", {});

  const okCount = Object.values(items).filter((v) => v.status === "ok").length;
  const issueCount = Object.values(items).filter((v) => v.status === "issue").length;
  const uncheckedCount = totalItems - okCount - issueCount;

  const issueItems: { sectionTitle: string; text: string; note?: string; photos?: string[] }[] = [];
  checklistData.forEach((section, sectionIndex) => {
    section.items.forEach((item, itemIndex) => {
      const state = items[`${sectionIndex}-${itemIndex}`];
      if (state?.status === "issue") {
        issueItems.push({
          sectionTitle: section.title,
          text: item.text,
          note: state.note,
          photos: state.photos,
        });
      }
    });
  });

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Araç Teslim Kontrol Raporu",
        text: `Kontrol: ${okCount} tamam, ${issueCount} sorunlu, ${uncheckedCount} atlandı`,
      });
    }
  };

  const today = new Date().toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen min-h-[100dvh]">
      {/* Header (no-print) */}
      <div className="sticky top-0 z-10 glass-strong p-4 flex items-center gap-3 no-print">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-xl glass hover:bg-white/15 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-primary-white" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-primary-white">Kontrol Raporu</h1>
        <button
          onClick={handleShare}
          className="p-2 rounded-xl glass hover:bg-white/15 transition-colors"
        >
          <Share2 className="h-5 w-5 text-primary-white" />
        </button>
        <button
          onClick={handlePrint}
          className="p-2 rounded-xl glass hover:bg-white/15 transition-colors"
        >
          <Printer className="h-5 w-5 text-primary-white" />
        </button>
      </div>

      {/* Report Content */}
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Title (print-only) */}
        <div className="print-only text-center mb-6">
          <h1 className="text-2xl font-bold">Araç Teslim Kontrol Raporu</h1>
        </div>

        {/* Date & Vehicle */}
        <div className="glass rounded-2xl p-4">
          <p className="text-sm text-muted-white">Tarih: <span className="text-primary-white font-medium">{today}</span></p>
          {vehicle.brand && (
            <p className="text-sm text-muted-white mt-1">
              Araç: <span className="text-primary-white font-medium">
                {[vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(" ")}
              </span>
            </p>
          )}
          {vehicle.plate && (
            <p className="text-sm text-muted-white mt-1">
              Plaka: <span className="text-primary-white font-medium">{vehicle.plate}</span>
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-primary-white mb-3">Özet</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-emerald-500/15 p-3">
              <p className="text-2xl font-bold text-emerald-300">{okCount}</p>
              <p className="text-xs text-emerald-300/70">Tamam</p>
            </div>
            <div className="rounded-xl bg-amber-500/15 p-3">
              <p className="text-2xl font-bold text-amber-300">{issueCount}</p>
              <p className="text-xs text-amber-300/70">Sorunlu</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-2xl font-bold text-muted-white">{uncheckedCount}</p>
              <p className="text-xs text-muted-white">Atlandı</p>
            </div>
          </div>
        </div>

        {/* Issues Detail */}
        {issueItems.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-amber-300 mb-3">Sorunlu Maddeler</h2>
            <div className="space-y-4">
              {issueItems.map((item, index) => (
                <div key={index} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <p className="text-xs text-muted-white">{item.sectionTitle}</p>
                  <p className="text-sm text-primary-white font-medium mt-0.5">{item.text}</p>
                  {item.note && (
                    <p className="text-sm text-secondary-white mt-1 italic">"{item.note}"</p>
                  )}
                  {item.photos && item.photos.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {item.photos.map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={photo}
                          alt={`Sorun fotoğrafı ${photoIndex + 1}`}
                          className="w-24 h-20 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OK Items by Section */}
        <div className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-primary-white mb-3">Bölüm Özeti</h2>
          <div className="space-y-2">
            {checklistData.map((section, sectionIndex) => {
              let ok = 0;
              let issues = 0;
              section.items.forEach((_, itemIndex) => {
                const state = items[`${sectionIndex}-${itemIndex}`];
                if (state?.status === "ok") ok++;
                if (state?.status === "issue") issues++;
              });
              return (
                <div key={sectionIndex} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-secondary-white">{section.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-300">{ok} ✓</span>
                    {issues > 0 && <span className="text-xs text-amber-300">{issues} ⚠</span>}
                    <span className="text-xs text-muted-white">/ {section.items.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
