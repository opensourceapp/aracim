import { useState, useCallback, useMemo } from "react";
import { checklistData, type ItemTag } from "@/data/checklistData";
import type { ChecklistState } from "@/types/checklist";

export type StatusFilter = "all" | "unchecked" | "ok" | "issue";

export interface FilteredItem {
  text: string;
  tag: ItemTag;
  originalIndex: number;
}

export function useFilters(items: ChecklistState) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tagFilter, setTagFilter] = useState<ItemTag>(null);
  const [categoryFilters, setCategoryFilters] = useState<Set<number>>(new Set());

  const toggleCategoryFilter = useCallback((sectionIndex: number) => {
    setCategoryFilters((prev) => {
      const next = new Set(prev);
      if (next.has(sectionIndex)) {
        next.delete(sectionIndex);
      } else {
        next.add(sectionIndex);
      }
      return next;
    });
  }, []);

  const isSectionVisible = useCallback(
    (sectionIndex: number) => {
      if (categoryFilters.size === 0) return true;
      return categoryFilters.has(sectionIndex);
    },
    [categoryFilters]
  );

  const getFilteredItems = useCallback(
    (sectionIndex: number): FilteredItem[] => {
      const section = checklistData[sectionIndex];
      return section.items
        .map((item, index) => ({ ...item, originalIndex: index }))
        .filter((item) => {
          if (search && !item.text.toLowerCase().includes(search.toLowerCase())) {
            return false;
          }
          if (statusFilter !== "all") {
            const state = items[`${sectionIndex}-${item.originalIndex}`];
            const itemStatus = state?.status ?? "unchecked";
            if (itemStatus !== statusFilter) return false;
          }
          if (tagFilter && item.tag !== tagFilter) {
            return false;
          }
          return true;
        });
    },
    [search, statusFilter, tagFilter, items]
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setTagFilter(null);
    setCategoryFilters(new Set());
  }, []);

  const hasActiveFilters = search !== "" || statusFilter !== "all" || tagFilter !== null || categoryFilters.size > 0;

  const statusCounts = useMemo(() => {
    let unchecked = 0;
    let ok = 0;
    let issue = 0;
    checklistData.forEach((section, sectionIndex) => {
      section.items.forEach((_, itemIndex) => {
        const state = items[`${sectionIndex}-${itemIndex}`];
        const status = state?.status ?? "unchecked";
        if (status === "ok") ok++;
        else if (status === "issue") issue++;
        else unchecked++;
      });
    });
    return { unchecked, ok, issue };
  }, [items]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    tagFilter,
    setTagFilter,
    categoryFilters,
    toggleCategoryFilter,
    isSectionVisible,
    getFilteredItems,
    clearFilters,
    hasActiveFilters,
    statusCounts,
  };
}
