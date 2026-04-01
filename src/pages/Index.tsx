import { useState } from "react";
import { checklistData } from "@/data/checklistData";
import { useChecklist } from "@/hooks/useChecklist";
import { Check, ChevronDown, ChevronRight, RotateCcw, AlertTriangle, Lightbulb, PartyPopper } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const Index = () => {
  const { checked, toggle, reset, checkedCount, totalItems, percentage, isComplete, getSectionProgress } = useChecklist();
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const toggleSection = (index: number) => {
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-foreground">Araç Teslim Kontrol Listesi</h1>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md">
                  <RotateCcw className="h-4 w-4" />
                  Sıfırla
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tüm ilerleme sıfırlansın mı?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlem geri alınamaz. Tüm işaretlemeler kaldırılacak.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction onClick={reset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Sıfırla
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke={isComplete ? "hsl(142, 71%, 45%)" : "hsl(var(--primary))"}
                  strokeWidth="3"
                  strokeDasharray={`${percentage * 0.9742} 97.42`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                {percentage}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{checkedCount}</span> / {totalItems} tamamlandı
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isComplete ? "bg-green-500" : "bg-primary"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {isComplete && (
        <div className="mx-4 mt-4 rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <PartyPopper className="h-8 w-8 text-green-600 shrink-0" />
          <div>
            <p className="font-bold text-green-800">Tüm kontroller tamamlandı! 🎉</p>
            <p className="text-sm text-green-700">Araç teslime hazır.</p>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="mt-2">
        {checklistData.map((section, sectionIndex) => {
          const progress = getSectionProgress(sectionIndex);
          const isCollapsed = collapsed[sectionIndex];
          const sectionDone = progress.checked === progress.total;

          return (
            <div key={sectionIndex} className="border-b border-border">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(sectionIndex)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-muted/50 hover:bg-muted active:bg-muted transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className={cn("text-sm font-semibold text-foreground text-left flex-1", sectionDone && "text-green-700")}>
                  {section.title}
                </span>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  sectionDone
                    ? "bg-green-100 text-green-700"
                    : "bg-secondary text-muted-foreground"
                )}>
                  {progress.checked}/{progress.total}
                </span>
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div>
                  {section.items.map((item, itemIndex) => {
                    const key = `${sectionIndex}-${itemIndex}`;
                    const isChecked = !!checked[key];

                    return (
                      <button
                        key={key}
                        onClick={() => toggle(key)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-left transition-colors active:bg-muted/60",
                          item.tag === "critical" && "border-l-3 border-l-amber-500",
                          item.tag === "tip" && "border-l-3 border-l-blue-400",
                          itemIndex < section.items.length - 1 && "border-b border-border/50"
                        )}
                      >
                        {/* Checkbox */}
                        <div className={cn(
                          "h-5 w-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-200",
                          isChecked
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/40"
                        )}>
                          {isChecked && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                        </div>

                        {/* Text */}
                        <span className={cn(
                          "flex-1 text-sm transition-all duration-200",
                          isChecked ? "line-through text-muted-foreground" : "text-foreground"
                        )}>
                          {item.text}
                        </span>

                        {/* Tag Badge */}
                        {item.tag === "critical" && (
                          <span className="shrink-0 flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                            <AlertTriangle className="h-3 w-3" />
                            Kritik
                          </span>
                        )}
                        {item.tag === "tip" && (
                          <span className="shrink-0 flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">
                            <Lightbulb className="h-3 w-3" />
                            İpucu
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
