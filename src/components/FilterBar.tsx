import { Search, X, AlertTriangle, Lightbulb, CheckCircle2, CircleDashed, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { checklistData } from "@/data/checklistData";
import type { StatusFilter } from "@/hooks/useFilters";
import type { ItemTag } from "@/data/checklistData";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  tagFilter: ItemTag;
  onTagFilterChange: (value: ItemTag) => void;
  categoryFilters: Set<number>;
  onCategoryToggle: (index: number) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  statusCounts: { unchecked: number; ok: number; issue: number };
}

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  tagFilter,
  onTagFilterChange,
  categoryFilters,
  onCategoryToggle,
  onClearFilters,
  hasActiveFilters,
  statusCounts,
}: FilterBarProps) {
  return (
    <div className="px-4 py-3 space-y-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-white" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Madde ara..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl glass text-sm text-primary-white placeholder:text-muted-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-white" />
          </button>
        )}
      </div>

      {/* Status filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {([
          { value: "all" as StatusFilter, label: "Tümü", icon: null, count: null },
          { value: "unchecked" as StatusFilter, label: "Bekleyen", icon: CircleDashed, count: statusCounts.unchecked },
          { value: "ok" as StatusFilter, label: "Tamam", icon: CheckCircle2, count: statusCounts.ok },
          { value: "issue" as StatusFilter, label: "Sorunlu", icon: AlertCircle, count: statusCounts.issue },
        ] as const).map(({ value, label, icon: Icon, count }) => (
          <button
            key={value}
            onClick={() => onStatusFilterChange(statusFilter === value ? "all" : value)}
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all",
              statusFilter === value
                ? value === "ok"
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                  : value === "issue"
                    ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                    : "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40"
                : "glass text-muted-white"
            )}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {label}
            {count !== null && <span className="opacity-70">{count}</span>}
          </button>
        ))}
      </div>

      {/* Tag + Category filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onTagFilterChange(tagFilter === "critical" ? null : "critical")}
          className={cn(
            "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all",
            tagFilter === "critical"
              ? "bg-red-500/20 text-red-300 ring-1 ring-red-500/40"
              : "glass text-muted-white"
          )}
        >
          <AlertTriangle className="h-3 w-3" />
          Kritik
        </button>
        <button
          onClick={() => onTagFilterChange(tagFilter === "tip" ? null : "tip")}
          className={cn(
            "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all",
            tagFilter === "tip"
              ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40"
              : "glass text-muted-white"
          )}
        >
          <Lightbulb className="h-3 w-3" />
          İpucu
        </button>

        <div className="w-px bg-white/10 mx-1 self-stretch" />

        {checklistData.map((section, index) => {
          const shortTitle = section.title.split(" ").slice(0, 2).join(" ");
          const isActive = categoryFilters.has(index);
          return (
            <button
              key={index}
              onClick={() => onCategoryToggle(index)}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all",
                isActive
                  ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40"
                  : "glass text-muted-white"
              )}
            >
              {shortTitle}
            </button>
          );
        })}
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          <X className="h-3 w-3" />
          Filtreleri temizle
        </button>
      )}
    </div>
  );
}
