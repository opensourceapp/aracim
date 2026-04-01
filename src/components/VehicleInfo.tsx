import { X } from "lucide-react";
import type { VehicleInfo as VehicleInfoType } from "@/types/checklist";

interface VehicleInfoProps {
  info: VehicleInfoType;
  onUpdate: (partial: Partial<VehicleInfoType>) => void;
  onClose: () => void;
}

export function VehicleInfo({ info, onUpdate, onClose }: VehicleInfoProps) {
  return (
    <div className="mx-4 mt-3 glass rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary-white">Araç Bilgisi</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <X className="h-4 w-4 text-muted-white" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={info.brand ?? ""}
          onChange={(e) => onUpdate({ brand: e.target.value })}
          placeholder="Marka"
          className="rounded-lg glass px-3 py-2 text-sm text-primary-white placeholder:text-muted-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
        <input
          type="text"
          value={info.model ?? ""}
          onChange={(e) => onUpdate({ model: e.target.value })}
          placeholder="Model"
          className="rounded-lg glass px-3 py-2 text-sm text-primary-white placeholder:text-muted-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
        <input
          type="text"
          value={info.plate ?? ""}
          onChange={(e) => onUpdate({ plate: e.target.value })}
          placeholder="Plaka"
          className="rounded-lg glass px-3 py-2 text-sm text-primary-white placeholder:text-muted-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
        <input
          type="text"
          value={info.year ?? ""}
          onChange={(e) => onUpdate({ year: e.target.value })}
          placeholder="Yıl"
          className="rounded-lg glass px-3 py-2 text-sm text-primary-white placeholder:text-muted-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
      </div>
    </div>
  );
}
