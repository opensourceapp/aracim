import { ProgressRing } from "@/components/ProgressRing";
import { Car } from "lucide-react";

interface ChecklistHeaderProps {
  percentage: number;
  checkedCount: number;
  issueCount: number;
  totalItems: number;
  isComplete: boolean;
  hasVehicleInfo: boolean;
  onVehicleInfoClick: () => void;
}

export function ChecklistHeader({
  percentage,
  checkedCount,
  issueCount,
  totalItems,
  isComplete,
  hasVehicleInfo,
  onVehicleInfoClick,
}: ChecklistHeaderProps) {
  return (
    <div className="sticky top-0 z-20 glass-strong rounded-b-2xl">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-4">
          <ProgressRing percentage={percentage} isComplete={isComplete} />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-primary-white tracking-tight">
              Araç Teslim Kontrol
            </h1>
            <p className="text-sm text-muted-white mt-0.5">
              <span className="text-primary-white font-semibold">{checkedCount}</span>
              <span> / {totalItems} tamamlandı</span>
              {issueCount > 0 && (
                <span className="text-amber-400 ml-2">
                  · {issueCount} sorunlu
                </span>
              )}
            </p>
            <button
              onClick={onVehicleInfoClick}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full glass hover:bg-white/15 transition-colors"
            >
              <Car className="h-3.5 w-3.5" />
              {hasVehicleInfo ? "Araç Bilgisi" : "Araç Ekle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
