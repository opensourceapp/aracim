import { useCallback } from "react";
import { Check, AlertTriangle, Lightbulb, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLongPress } from "@/hooks/useLongPress";
import { ItemDetail } from "@/components/ItemDetail";
import type { ItemTag } from "@/data/checklistData";
import type { ItemState } from "@/types/checklist";

interface ChecklistItemProps {
  itemKey: string;
  text: string;
  tag: ItemTag;
  state: ItemState | undefined;
  onToggle: (key: string) => void;
  onMarkIssue: (key: string, note?: string) => void;
  onUpdateNote: (key: string, note: string) => void;
  onAddPhoto: (key: string, photo: string) => void;
  onRemovePhoto: (key: string, index: number) => void;
}

export function ChecklistItem({
  itemKey,
  text,
  tag,
  state,
  onToggle,
  onMarkIssue,
  onUpdateNote,
  onAddPhoto,
  onRemovePhoto,
}: ChecklistItemProps) {
  const status = state?.status ?? "unchecked";
  const isIssue = status === "issue";
  const isOk = status === "ok";

  const handleClick = useCallback(() => {
    onToggle(itemKey);
  }, [itemKey, onToggle]);

  const handleLongPress = useCallback(() => {
    onMarkIssue(itemKey);
  }, [itemKey, onMarkIssue]);

  const pressHandlers = useLongPress(handleClick, handleLongPress);

  return (
    <div
      className={cn(
        "px-4 py-3 min-h-[48px] transition-all duration-200 select-none",
        isOk && "glow-green bg-emerald-500/5",
        isIssue && "glow-amber bg-amber-500/5",
      )}
    >
      <div
        {...pressHandlers}
        className="flex items-center gap-3 cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") handleClick(); }}
      >
        <div className={cn(
          "h-6 w-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200",
          isOk && "bg-emerald-500 border-emerald-500 animate-check-pop",
          isIssue && "bg-amber-500 border-amber-500 animate-check-pop",
          !isOk && !isIssue && "border-white/30",
        )}>
          {isOk && <Check className="h-3.5 w-3.5 text-white" />}
          {isIssue && <AlertCircle className="h-3.5 w-3.5 text-white" />}
        </div>

        <span className={cn(
          "flex-1 text-sm transition-all duration-200",
          isOk && "text-emerald-300/80 line-through",
          isIssue && "text-amber-300",
          !isOk && !isIssue && "text-secondary-white",
        )}>
          {text}
        </span>

        {tag === "critical" && (
          <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
            <AlertTriangle className="h-2.5 w-2.5" />
            Kritik
          </span>
        )}
        {tag === "tip" && (
          <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
            <Lightbulb className="h-2.5 w-2.5" />
            İpucu
          </span>
        )}
      </div>

      {isIssue && (
        <div className="ml-9 mt-1 animate-in slide-in-from-top-1 duration-300">
          <ItemDetail
            note={state?.note ?? ""}
            photos={state?.photos ?? []}
            onNoteChange={(note) => onUpdateNote(itemKey, note)}
            onAddPhoto={(photo) => onAddPhoto(itemKey, photo)}
            onRemovePhoto={(index) => onRemovePhoto(itemKey, index)}
          />
        </div>
      )}
    </div>
  );
}
