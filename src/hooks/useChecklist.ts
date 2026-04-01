import { useState, useEffect, useCallback } from "react";
import { checklistData, totalItems } from "@/data/checklistData";

const STORAGE_KEY = "car-checklist-state";

export function useChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = useCallback((key: string) => {
    setChecked((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setChecked({});
  }, []);

  const checkedCount = Object.keys(checked).length;
  const percentage = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  const isComplete = checkedCount === totalItems;

  const getSectionProgress = useCallback(
    (sectionIndex: number) => {
      const section = checklistData[sectionIndex];
      let count = 0;
      section.items.forEach((_, itemIndex) => {
        if (checked[`${sectionIndex}-${itemIndex}`]) count++;
      });
      return { checked: count, total: section.items.length };
    },
    [checked]
  );

  return { checked, toggle, reset, checkedCount, totalItems, percentage, isComplete, getSectionProgress };
}
