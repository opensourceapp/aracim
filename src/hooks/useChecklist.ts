import { useState, useEffect, useCallback } from "react";
import { checklistData, totalItems } from "@/data/checklistData";
import type { ItemState, ChecklistState } from "@/types/checklist";

const STORAGE_KEY = "car-checklist-state";

function loadState(): ChecklistState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function useChecklist() {
  const [items, setItems] = useState<ChecklistState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggle = useCallback((key: string) => {
    setItems((prev) => {
      const next = { ...prev };
      if (next[key]?.status === "ok") {
        delete next[key];
      } else {
        next[key] = { status: "ok", updatedAt: Date.now() };
      }
      return next;
    });
  }, []);

  const markIssue = useCallback((key: string, note?: string) => {
    setItems((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: "issue",
        note: note ?? prev[key]?.note ?? "",
        photos: prev[key]?.photos ?? [],
        updatedAt: Date.now(),
      },
    }));
  }, []);

  const updateNote = useCallback((key: string, note: string) => {
    setItems((prev) => {
      if (!prev[key]) return prev;
      return { ...prev, [key]: { ...prev[key], note, updatedAt: Date.now() } };
    });
  }, []);

  const addPhoto = useCallback((key: string, photo: string) => {
    setItems((prev) => {
      if (!prev[key]) return prev;
      const photos = [...(prev[key].photos ?? []), photo];
      return { ...prev, [key]: { ...prev[key], photos, updatedAt: Date.now() } };
    });
  }, []);

  const removePhoto = useCallback((key: string, index: number) => {
    setItems((prev) => {
      if (!prev[key]) return prev;
      const photos = (prev[key].photos ?? []).filter((_, i) => i !== index);
      return { ...prev, [key]: { ...prev[key], photos, updatedAt: Date.now() } };
    });
  }, []);

  const reset = useCallback(() => {
    setItems({});
  }, []);

  const checkedCount = Object.values(items).filter((v) => v.status === "ok" || v.status === "issue").length;
  const issueCount = Object.values(items).filter((v) => v.status === "issue").length;
  const percentage = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  const isComplete = checkedCount === totalItems;

  const getSectionProgress = useCallback(
    (sectionIndex: number) => {
      const section = checklistData[sectionIndex];
      let ok = 0;
      let issues = 0;
      section.items.forEach((_, itemIndex) => {
        const state = items[`${sectionIndex}-${itemIndex}`];
        if (state?.status === "ok") ok++;
        if (state?.status === "issue") issues++;
      });
      return { ok, issues, total: section.items.length, done: ok + issues };
    },
    [items]
  );

  return {
    items,
    toggle,
    markIssue,
    updateNote,
    addPhoto,
    removePhoto,
    reset,
    checkedCount,
    issueCount,
    totalItems,
    percentage,
    isComplete,
    getSectionProgress,
  };
}
