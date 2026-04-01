import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChecklistItem } from "@/components/ChecklistItem";
import type { FilteredItem } from "@/hooks/useFilters";
import type { ItemState } from "@/types/checklist";

interface SectionCardProps {
  title: string;
  sectionIndex: number;
  items: FilteredItem[];
  itemStates: Record<string, ItemState>;
  progress: { ok: number; issues: number; total: number; done: number };
  onToggle: (key: string) => void;
  onMarkIssue: (key: string, note?: string) => void;
  onUpdateNote: (key: string, note: string) => void;
  onAddPhoto: (key: string, photo: string) => void;
  onRemovePhoto: (key: string, index: number) => void;
}

export function SectionCard({
  title,
  sectionIndex,
  items,
  itemStates,
  progress,
  onToggle,
  onMarkIssue,
  onUpdateNote,
  onAddPhoto,
  onRemovePhoto,
}: SectionCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sectionDone = progress.done === progress.total;
  const progressPercent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className={cn("glass rounded-2xl overflow-hidden transition-all duration-300", sectionDone && "glow-green")}>
      {/* Section header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-white shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-white shrink-0" />
        )}
        <span className={cn(
          "text-sm font-semibold text-left flex-1",
          sectionDone ? "text-emerald-300" : "text-primary-white"
        )}>
          {title}
        </span>
        <div className="flex items-center gap-2">
          {progress.issues > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              {progress.issues} sorun
            </span>
          )}
          <span className={cn(
            "text-xs font-medium px-2.5 py-0.5 rounded-full",
            sectionDone
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-white/10 text-muted-white"
          )}>
            {progress.done}/{progress.total}
          </span>
        </div>
      </button>

      {/* Mini progress bar */}
      <div className="h-0.5 bg-white/5">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            sectionDone ? "bg-emerald-500" : "bg-gradient-to-r from-violet-500 to-indigo-500"
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Items */}
      {!collapsed && (
        <div className="divide-y divide-white/5">
          {items.map((item) => {
            const key = `${sectionIndex}-${item.originalIndex}`;
            return (
              <ChecklistItem
                key={key}
                itemKey={key}
                text={item.text}
                tag={item.tag}
                state={itemStates[key]}
                onToggle={onToggle}
                onMarkIssue={onMarkIssue}
                onUpdateNote={onUpdateNote}
                onAddPhoto={onAddPhoto}
                onRemovePhoto={onRemovePhoto}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
