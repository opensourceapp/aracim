# Checklist UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the basic checklist UI with a glassmorphism-based, mobile-first experience featuring 3-state items (unchecked/ok/issue with photo+note), multi-axis filtering, and PDF report export.

**Architecture:** Single-page elevated list with glass cards. Data layer uses enriched `ItemState` objects in localStorage. A separate `/rapor` route renders print-optimized report. All components are small, focused files composed in `Index.tsx`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix), Lucide icons, Vite, Vitest. No new dependencies. Path alias: `@/*` → `src/*`.

---

## File Structure

```
src/
├── types/
│   └── checklist.ts              ← NEW: ItemStatus, ItemState, VehicleInfo types
├── hooks/
│   ├── useChecklist.ts           ← MODIFY: expand from boolean to ItemState
│   ├── useFilters.ts             ← NEW: search + status + tag + category filtering
│   ├── useLongPress.ts           ← NEW: long-press gesture hook
│   └── useVehicleInfo.ts         ← NEW: vehicle info state + localStorage
├── components/
│   ├── ProgressRing.tsx          ← NEW: SVG animated circular progress
│   ├── ChecklistHeader.tsx       ← NEW: glassmorphism header + progress + vehicle chip
│   ├── FilterBar.tsx             ← NEW: search + multi-axis filter chips
│   ├── SectionCard.tsx           ← NEW: glass card section with mini progress
│   ├── ChecklistItem.tsx         ← NEW: 3-state item with long-press
│   ├── ItemDetail.tsx            ← NEW: issue mode note + photo panel
│   ├── PhotoCapture.tsx          ← NEW: camera input + thumbnail grid
│   ├── FloatingBar.tsx           ← NEW: sticky bottom bar with report button
│   ├── VehicleInfo.tsx           ← NEW: optional vehicle info inline form
│   ├── ConfettiEffect.tsx        ← NEW: completion celebration
│   └── ui/                       ← UNCHANGED (shadcn/ui)
├── pages/
│   ├── Index.tsx                 ← REWRITE: compose all components
│   └── Report.tsx                ← NEW: print-optimized report page
├── App.tsx                       ← MODIFY: add /rapor route
├── index.css                     ← MODIFY: glassmorphism theme + print styles
└── test/
    ├── setup.ts                  ← MODIFY: add localStorage mock
    ├── useChecklist.test.ts      ← NEW
    ├── useFilters.test.ts        ← NEW
    └── useLongPress.test.ts      ← NEW
```

---

### Task 1: Types and Data Layer Foundation

**Files:**
- Create: `src/types/checklist.ts`
- Modify: `src/hooks/useChecklist.ts`
- Create: `src/test/useChecklist.test.ts`
- Modify: `src/test/setup.ts`

- [ ] **Step 1: Create type definitions**

```typescript
// src/types/checklist.ts
export type ItemStatus = "unchecked" | "ok" | "issue";

export interface ItemState {
  status: ItemStatus;
  note?: string;
  photos?: string[];
  updatedAt?: number;
}

export interface VehicleInfo {
  brand?: string;
  model?: string;
  plate?: string;
  year?: string;
}

export type ChecklistState = Record<string, ItemState>;
```

- [ ] **Step 2: Add localStorage mock to test setup**

Add to `src/test/setup.ts`:

```typescript
// After the existing matchMedia mock, add:
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });
```

- [ ] **Step 3: Write failing tests for useChecklist**

```typescript
// src/test/useChecklist.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChecklist } from "@/hooks/useChecklist";

beforeEach(() => {
  localStorage.clear();
});

describe("useChecklist", () => {
  it("starts with all items unchecked", () => {
    const { result } = renderHook(() => useChecklist());
    expect(result.current.checkedCount).toBe(0);
    expect(result.current.issueCount).toBe(0);
    expect(result.current.percentage).toBe(0);
  });

  it("toggles item to ok status", () => {
    const { result } = renderHook(() => useChecklist());
    act(() => result.current.toggle("0-0"));
    expect(result.current.items["0-0"]?.status).toBe("ok");
    expect(result.current.checkedCount).toBe(1);
  });

  it("toggles ok item back to unchecked", () => {
    const { result } = renderHook(() => useChecklist());
    act(() => result.current.toggle("0-0"));
    act(() => result.current.toggle("0-0"));
    expect(result.current.items["0-0"]).toBeUndefined();
  });

  it("marks item as issue with note", () => {
    const { result } = renderHook(() => useChecklist());
    act(() => result.current.markIssue("1-2", "Çizik var"));
    expect(result.current.items["1-2"]?.status).toBe("issue");
    expect(result.current.items["1-2"]?.note).toBe("Çizik var");
    expect(result.current.issueCount).toBe(1);
  });

  it("adds photo to issue item", () => {
    const { result } = renderHook(() => useChecklist());
    act(() => result.current.markIssue("1-2", "Çizik var"));
    act(() => result.current.addPhoto("1-2", "data:image/jpeg;base64,abc123"));
    expect(result.current.items["1-2"]?.photos).toHaveLength(1);
  });

  it("removes photo from issue item", () => {
    const { result } = renderHook(() => useChecklist());
    act(() => result.current.markIssue("1-2", "Sorun"));
    act(() => result.current.addPhoto("1-2", "data:image/jpeg;base64,abc123"));
    act(() => result.current.removePhoto("1-2", 0));
    expect(result.current.items["1-2"]?.photos).toHaveLength(0);
  });

  it("updates note on existing issue", () => {
    const { result } = renderHook(() => useChecklist());
    act(() => result.current.markIssue("1-2", "Eski not"));
    act(() => result.current.updateNote("1-2", "Yeni not"));
    expect(result.current.items["1-2"]?.note).toBe("Yeni not");
  });

  it("resets all items", () => {
    const { result } = renderHook(() => useChecklist());
    act(() => result.current.toggle("0-0"));
    act(() => result.current.markIssue("1-2", "Sorun"));
    act(() => result.current.reset());
    expect(result.current.checkedCount).toBe(0);
    expect(result.current.issueCount).toBe(0);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useChecklist());
    act(() => result.current.toggle("0-0"));
    const stored = JSON.parse(localStorage.getItem("car-checklist-state") || "{}");
    expect(stored["0-0"]?.status).toBe("ok");
  });

  it("restores from localStorage", () => {
    localStorage.setItem("car-checklist-state", JSON.stringify({
      "0-0": { status: "ok", updatedAt: Date.now() },
    }));
    const { result } = renderHook(() => useChecklist());
    expect(result.current.items["0-0"]?.status).toBe("ok");
    expect(result.current.checkedCount).toBe(1);
  });

  it("computes section progress", () => {
    const { result } = renderHook(() => useChecklist());
    act(() => result.current.toggle("0-0"));
    act(() => result.current.toggle("0-1"));
    const progress = result.current.getSectionProgress(0);
    expect(progress.ok).toBe(2);
    expect(progress.total).toBe(6); // Evraklar section has 6 items
  });

  it("counts issues in section progress", () => {
    const { result } = renderHook(() => useChecklist());
    act(() => result.current.markIssue("0-0", "Eksik"));
    const progress = result.current.getSectionProgress(0);
    expect(progress.issues).toBe(1);
  });

  it("computes isComplete when all items are ok or issue", () => {
    const { result } = renderHook(() => useChecklist());
    expect(result.current.isComplete).toBe(false);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd /home/cevheri/projects/react/aracim && npm test -- src/test/useChecklist.test.ts`
Expected: FAIL — the new API (items, markIssue, addPhoto, etc.) doesn't exist yet.

- [ ] **Step 5: Rewrite useChecklist hook**

```typescript
// src/hooks/useChecklist.ts
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd /home/cevheri/projects/react/aracim && npm test -- src/test/useChecklist.test.ts`
Expected: All 13 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/types/checklist.ts src/hooks/useChecklist.ts src/test/useChecklist.test.ts src/test/setup.ts
git commit -m "feat: add 3-state checklist data layer with photo/note support"
```

---

### Task 2: Filter System Hook

**Files:**
- Create: `src/hooks/useFilters.ts`
- Create: `src/test/useFilters.test.ts`

- [ ] **Step 1: Write failing tests for useFilters**

```typescript
// src/test/useFilters.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilters } from "@/hooks/useFilters";
import { checklistData } from "@/data/checklistData";
import type { ChecklistState } from "@/types/checklist";

const emptyState: ChecklistState = {};

describe("useFilters", () => {
  it("returns all items when no filters active", () => {
    const { result } = renderHook(() => useFilters(emptyState));
    const total = checklistData.reduce((s, sec) => s + sec.items.length, 0);
    const filtered = checklistData.reduce(
      (s, _, i) => s + result.current.getFilteredItems(i).length,
      0
    );
    expect(filtered).toBe(total);
  });

  it("filters by search text", () => {
    const { result } = renderHook(() => useFilters(emptyState));
    act(() => result.current.setSearch("fatura"));
    const items = result.current.getFilteredItems(0); // Evraklar section
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.text.toLowerCase().includes("fatura"))).toBe(true);
  });

  it("filters by status: ok", () => {
    const state: ChecklistState = { "0-0": { status: "ok", updatedAt: 1 } };
    const { result } = renderHook(() => useFilters(state));
    act(() => result.current.setStatusFilter("ok"));
    const items = result.current.getFilteredItems(0);
    expect(items.length).toBe(1);
    expect(items[0].text).toBe(checklistData[0].items[0].text);
  });

  it("filters by status: issue", () => {
    const state: ChecklistState = { "0-0": { status: "issue", note: "test", updatedAt: 1 } };
    const { result } = renderHook(() => useFilters(state));
    act(() => result.current.setStatusFilter("issue"));
    const items = result.current.getFilteredItems(0);
    expect(items.length).toBe(1);
  });

  it("filters by status: unchecked", () => {
    const state: ChecklistState = { "0-0": { status: "ok", updatedAt: 1 } };
    const { result } = renderHook(() => useFilters(state));
    act(() => result.current.setStatusFilter("unchecked"));
    const items = result.current.getFilteredItems(0);
    // Section 0 has 6 items, 1 is ok, so 5 unchecked
    expect(items.length).toBe(5);
  });

  it("filters by tag: critical", () => {
    const { result } = renderHook(() => useFilters(emptyState));
    act(() => result.current.setTagFilter("critical"));
    const items = result.current.getFilteredItems(0); // Evraklar
    expect(items.every((item) => item.tag === "critical")).toBe(true);
  });

  it("filters by category (section index)", () => {
    const { result } = renderHook(() => useFilters(emptyState));
    act(() => result.current.toggleCategoryFilter(0));
    // Section 0 is active, section 1 should be hidden
    expect(result.current.isSectionVisible(0)).toBe(true);
    expect(result.current.isSectionVisible(1)).toBe(false);
  });

  it("combines multiple filters", () => {
    const state: ChecklistState = {
      "0-0": { status: "ok", updatedAt: 1 },
      "0-3": { status: "ok", updatedAt: 1 },
    };
    const { result } = renderHook(() => useFilters(state));
    act(() => result.current.setStatusFilter("ok"));
    act(() => result.current.setTagFilter("critical"));
    // Section 0: items 0 and 3 are "ok". Item 0 has tag "critical", item 3 has tag "critical"
    const items = result.current.getFilteredItems(0);
    expect(items.every((item) => item.tag === "critical")).toBe(true);
    expect(items.length).toBe(2);
  });

  it("clears all filters", () => {
    const { result } = renderHook(() => useFilters(emptyState));
    act(() => result.current.setSearch("test"));
    act(() => result.current.setStatusFilter("ok"));
    act(() => result.current.clearFilters());
    expect(result.current.search).toBe("");
    expect(result.current.statusFilter).toBe("all");
    expect(result.current.tagFilter).toBeNull();
  });

  it("returns item original index in getFilteredItems", () => {
    const { result } = renderHook(() => useFilters(emptyState));
    act(() => result.current.setTagFilter("critical"));
    const items = result.current.getFilteredItems(0);
    // Each returned item should have originalIndex
    expect(items[0].originalIndex).toBeDefined();
    expect(typeof items[0].originalIndex).toBe("number");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/cevheri/projects/react/aracim && npm test -- src/test/useFilters.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement useFilters hook**

```typescript
// src/hooks/useFilters.ts
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
          // Search filter
          if (search && !item.text.toLowerCase().includes(search.toLowerCase())) {
            return false;
          }
          // Status filter
          if (statusFilter !== "all") {
            const state = items[`${sectionIndex}-${item.originalIndex}`];
            const itemStatus = state?.status ?? "unchecked";
            if (itemStatus !== statusFilter) return false;
          }
          // Tag filter
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

  // Counts for status filter chips
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/cevheri/projects/react/aracim && npm test -- src/test/useFilters.test.ts`
Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFilters.ts src/test/useFilters.test.ts
git commit -m "feat: add multi-axis filter hook (search, status, tag, category)"
```

---

### Task 3: Long-Press Gesture Hook

**Files:**
- Create: `src/hooks/useLongPress.ts`
- Create: `src/test/useLongPress.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/test/useLongPress.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLongPress } from "@/hooks/useLongPress";

beforeEach(() => {
  vi.useFakeTimers();
});

describe("useLongPress", () => {
  it("returns onTouchStart, onTouchEnd, onMouseDown, onMouseUp handlers", () => {
    const { result } = renderHook(() => useLongPress(() => {}, () => {}));
    expect(result.current.onTouchStart).toBeDefined();
    expect(result.current.onTouchEnd).toBeDefined();
    expect(result.current.onMouseDown).toBeDefined();
    expect(result.current.onMouseUp).toBeDefined();
  });

  it("calls onClick for short press", () => {
    const onClick = vi.fn();
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onClick, onLongPress));

    result.current.onMouseDown();
    vi.advanceTimersByTime(200);
    result.current.onMouseUp();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("calls onLongPress after 500ms hold", () => {
    const onClick = vi.fn();
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onClick, onLongPress));

    result.current.onMouseDown();
    vi.advanceTimersByTime(500);

    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();

    result.current.onMouseUp();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not fire onClick after long press release", () => {
    const onClick = vi.fn();
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onClick, onLongPress));

    result.current.onMouseDown();
    vi.advanceTimersByTime(500);
    result.current.onMouseUp();

    expect(onClick).not.toHaveBeenCalled();
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/cevheri/projects/react/aracim && npm test -- src/test/useLongPress.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement useLongPress**

```typescript
// src/hooks/useLongPress.ts
import { useRef, useCallback } from "react";

const LONG_PRESS_DURATION = 500;

export function useLongPress(onClick: () => void, onLongPress: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);

  const start = useCallback(() => {
    longPressedRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      onLongPress();
      if (navigator.vibrate) navigator.vibrate(50);
    }, LONG_PRESS_DURATION);
  }, [onLongPress]);

  const end = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!longPressedRef.current) {
      onClick();
    }
    longPressedRef.current = false;
  }, [onClick]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    longPressedRef.current = false;
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: end,
    onTouchCancel: cancel,
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/cevheri/projects/react/aracim && npm test -- src/test/useLongPress.test.ts`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useLongPress.ts src/test/useLongPress.test.ts
git commit -m "feat: add long-press gesture hook with haptic feedback"
```

---

### Task 4: Vehicle Info Hook

**Files:**
- Create: `src/hooks/useVehicleInfo.ts`

- [ ] **Step 1: Implement useVehicleInfo**

```typescript
// src/hooks/useVehicleInfo.ts
import { useState, useEffect, useCallback } from "react";
import type { VehicleInfo } from "@/types/checklist";

const STORAGE_KEY = "car-vehicle-info";

function loadVehicleInfo(): VehicleInfo {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function useVehicleInfo() {
  const [info, setInfo] = useState<VehicleInfo>(loadVehicleInfo);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  }, [info]);

  const update = useCallback((partial: Partial<VehicleInfo>) => {
    setInfo((prev) => ({ ...prev, ...partial }));
  }, []);

  const clear = useCallback(() => {
    setInfo({});
  }, []);

  const hasInfo = Boolean(info.brand || info.model || info.plate || info.year);

  return { info, update, clear, hasInfo };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useVehicleInfo.ts
git commit -m "feat: add vehicle info hook with localStorage persistence"
```

---

### Task 5: Glassmorphism Theme and CSS Foundation

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Rewrite index.css with glassmorphism theme**

Replace the entire contents of `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 263 70% 50%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 263 70% 50%;
    --radius: 0.75rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply antialiased;
    -webkit-tap-highlight-color: transparent;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    min-height: 100vh;
    min-height: 100dvh;
    color: rgba(255, 255, 255, 0.8);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  #root {
    min-height: 100vh;
    min-height: 100dvh;
  }
}

@layer components {
  .glass {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .glass-strong {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .glow-green {
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.3);
  }

  .glow-amber {
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
  }

  .glow-violet {
    box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
  }

  .text-primary-white {
    color: rgba(255, 255, 255, 0.95);
  }

  .text-secondary-white {
    color: rgba(255, 255, 255, 0.8);
  }

  .text-muted-white {
    color: rgba(255, 255, 255, 0.5);
  }
}

@layer utilities {
  .border-l-3 {
    border-left-width: 3px;
  }
}

/* Check animation */
@keyframes checkPop {
  0% { transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.animate-check-pop {
  animation: checkPop 0.2s ease-out;
}

/* Confetti keyframes */
@keyframes confetti-fall {
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

/* Print styles */
@media print {
  body {
    background: white !important;
    color: black !important;
  }

  .glass, .glass-strong {
    background: white !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 1px solid #e5e7eb !important;
  }

  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .print-break-before {
    break-before: page;
  }

  img {
    max-width: 200px !important;
    max-height: 150px !important;
  }
}

.print-only {
  display: none;
}
```

- [ ] **Step 2: Update tailwind.config.ts**

Add the `glass` animation keyframes and gradient background utilities to `tailwind.config.ts`. Replace the `keyframes` and `animation` sections in `theme.extend`:

```typescript
// In tailwind.config.ts, replace the keyframes and animation sections:
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "check-pop": {
          "0%": { transform: "scale(0)" },
          "70%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "check-pop": "check-pop 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
```

- [ ] **Step 3: Verify dev server starts**

Run: `cd /home/cevheri/projects/react/aracim && npx vite build 2>&1 | tail -5`
Expected: Build succeeds without CSS errors.

- [ ] **Step 4: Commit**

```bash
git add src/index.css tailwind.config.ts
git commit -m "feat: add glassmorphism dark theme with print styles"
```

---

### Task 6: ProgressRing Component

**Files:**
- Create: `src/components/ProgressRing.tsx`

- [ ] **Step 1: Implement ProgressRing**

```tsx
// src/components/ProgressRing.tsx
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  isComplete?: boolean;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 6,
  isComplete = false,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? "#22c55e" : "url(#progressGradient)"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-primary-white">
        {percentage}%
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProgressRing.tsx
git commit -m "feat: add animated SVG progress ring component"
```

---

### Task 7: ChecklistHeader Component

**Files:**
- Create: `src/components/ChecklistHeader.tsx`

- [ ] **Step 1: Implement ChecklistHeader**

```tsx
// src/components/ChecklistHeader.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ChecklistHeader.tsx
git commit -m "feat: add glassmorphism checklist header with progress ring"
```

---

### Task 8: FilterBar Component

**Files:**
- Create: `src/components/FilterBar.tsx`

- [ ] **Step 1: Implement FilterBar**

```tsx
// src/components/FilterBar.tsx
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
        {/* Tag filters */}
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

        {/* Category filters */}
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

      {/* Clear all filters */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FilterBar.tsx
git commit -m "feat: add multi-axis filter bar with search and category chips"
```

---

### Task 9: PhotoCapture and ItemDetail Components

**Files:**
- Create: `src/components/PhotoCapture.tsx`
- Create: `src/components/ItemDetail.tsx`

- [ ] **Step 1: Implement PhotoCapture**

```tsx
// src/components/PhotoCapture.tsx
import { useRef } from "react";
import { Camera, X } from "lucide-react";

interface PhotoCaptureProps {
  photos: string[];
  onAdd: (photo: string) => void;
  onRemove: (index: number) => void;
}

export function PhotoCapture({ photos, onAdd, onRemove }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Fotoğraf boyutu 2MB'dan küçük olmalı.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        onAdd(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {photos.map((photo, index) => (
        <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden group">
          <img src={photo} alt={`Fotoğraf ${index + 1}`} className="w-full h-full object-cover" />
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(index); }}
            className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      ))}
      <button
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        className="w-16 h-16 rounded-lg glass flex items-center justify-center hover:bg-white/15 transition-colors"
      >
        <Camera className="h-5 w-5 text-muted-white" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
```

- [ ] **Step 2: Implement ItemDetail**

```tsx
// src/components/ItemDetail.tsx
import { useState, useEffect } from "react";
import { PhotoCapture } from "@/components/PhotoCapture";

interface ItemDetailProps {
  note: string;
  photos: string[];
  onNoteChange: (note: string) => void;
  onAddPhoto: (photo: string) => void;
  onRemovePhoto: (index: number) => void;
}

export function ItemDetail({ note, photos, onNoteChange, onAddPhoto, onRemovePhoto }: ItemDetailProps) {
  const [localNote, setLocalNote] = useState(note);

  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localNote !== note) {
        onNoteChange(localNote);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localNote, note, onNoteChange]);

  return (
    <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
      <textarea
        value={localNote}
        onChange={(e) => setLocalNote(e.target.value)}
        placeholder="Sorunu açıklayın..."
        rows={2}
        className="w-full rounded-lg glass px-3 py-2 text-sm text-primary-white placeholder:text-muted-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
      />
      <PhotoCapture photos={photos} onAdd={onAddPhoto} onRemove={onRemovePhoto} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PhotoCapture.tsx src/components/ItemDetail.tsx
git commit -m "feat: add photo capture and issue detail panel components"
```

---

### Task 10: ChecklistItem Component

**Files:**
- Create: `src/components/ChecklistItem.tsx`

- [ ] **Step 1: Implement ChecklistItem**

```tsx
// src/components/ChecklistItem.tsx
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
        {/* Status indicator */}
        <div className={cn(
          "h-6 w-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200",
          isOk && "bg-emerald-500 border-emerald-500 animate-check-pop",
          isIssue && "bg-amber-500 border-amber-500 animate-check-pop",
          !isOk && !isIssue && "border-white/30",
        )}>
          {isOk && <Check className="h-3.5 w-3.5 text-white" />}
          {isIssue && <AlertCircle className="h-3.5 w-3.5 text-white" />}
        </div>

        {/* Text */}
        <span className={cn(
          "flex-1 text-sm transition-all duration-200",
          isOk && "text-emerald-300/80 line-through",
          isIssue && "text-amber-300",
          !isOk && !isIssue && "text-secondary-white",
        )}>
          {text}
        </span>

        {/* Tag badge */}
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

      {/* Issue detail panel */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ChecklistItem.tsx
git commit -m "feat: add 3-state checklist item with long-press and inline detail"
```

---

### Task 11: SectionCard Component

**Files:**
- Create: `src/components/SectionCard.tsx`

- [ ] **Step 1: Implement SectionCard**

```tsx
// src/components/SectionCard.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SectionCard.tsx
git commit -m "feat: add glassmorphism section card with mini progress bar"
```

---

### Task 12: FloatingBar, VehicleInfo, and ConfettiEffect Components

**Files:**
- Create: `src/components/FloatingBar.tsx`
- Create: `src/components/VehicleInfo.tsx`
- Create: `src/components/ConfettiEffect.tsx`

- [ ] **Step 1: Implement FloatingBar**

```tsx
// src/components/FloatingBar.tsx
import { useNavigate } from "react-router-dom";
import { FileText, RotateCcw } from "lucide-react";
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

interface FloatingBarProps {
  percentage: number;
  onReset: () => void;
}

export function FloatingBar({ percentage, onReset }: FloatingBarProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="glass-strong rounded-2xl p-3 flex items-center gap-3 max-w-lg mx-auto">
        {/* Report button */}
        <button
          onClick={() => navigate("/rapor")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-[0.98]"
        >
          <FileText className="h-4 w-4" />
          Rapor Oluştur
        </button>

        {/* Progress indicator */}
        <span className="text-sm font-bold text-primary-white min-w-[3rem] text-center">
          %{percentage}
        </span>

        {/* Reset button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="p-2.5 rounded-xl glass hover:bg-white/15 transition-colors">
              <RotateCcw className="h-4 w-4 text-muted-white" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-strong border-white/20 text-primary-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-primary-white">Tüm ilerleme sıfırlansın mı?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-white">
                Bu işlem geri alınamaz. Tüm işaretlemeler, notlar ve fotoğraflar silinecek.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="glass text-secondary-white border-white/20">İptal</AlertDialogCancel>
              <AlertDialogAction onClick={onReset} className="bg-red-500/80 text-white hover:bg-red-500">
                Sıfırla
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement VehicleInfo**

```tsx
// src/components/VehicleInfo.tsx
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
```

- [ ] **Step 3: Implement ConfettiEffect**

```tsx
// src/components/ConfettiEffect.tsx
import { useEffect, useRef } from "react";

const COLORS = ["#8b5cf6", "#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899"];
const PARTICLE_COUNT = 50;

export function ConfettiEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * canvas.height * 0.5,
      w: 4 + Math.random() * 6,
      h: 4 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 1,
    }));

    let animationId: number;
    let elapsed = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      elapsed++;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotationSpeed;
        if (elapsed > 60) p.opacity -= 0.01;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < 180) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/FloatingBar.tsx src/components/VehicleInfo.tsx src/components/ConfettiEffect.tsx
git commit -m "feat: add floating bar, vehicle info form, and confetti effect"
```

---

### Task 13: Rewrite Index.tsx (Main Page)

**Files:**
- Rewrite: `src/pages/Index.tsx`

- [ ] **Step 1: Rewrite Index.tsx**

```tsx
// src/pages/Index.tsx
import { useState } from "react";
import { checklistData } from "@/data/checklistData";
import { useChecklist } from "@/hooks/useChecklist";
import { useFilters } from "@/hooks/useFilters";
import { useVehicleInfo } from "@/hooks/useVehicleInfo";
import { ChecklistHeader } from "@/components/ChecklistHeader";
import { FilterBar } from "@/components/FilterBar";
import { SectionCard } from "@/components/SectionCard";
import { FloatingBar } from "@/components/FloatingBar";
import { VehicleInfo } from "@/components/VehicleInfo";
import { ConfettiEffect } from "@/components/ConfettiEffect";

const Index = () => {
  const checklist = useChecklist();
  const filters = useFilters(checklist.items);
  const vehicle = useVehicleInfo();
  const [showVehicleInfo, setShowVehicleInfo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti once when completed
  const handleToggle = (key: string) => {
    checklist.toggle(key);
    // Check if this toggle completes everything (next tick for state update)
    setTimeout(() => {
      const count = Object.values(checklist.items).filter(
        (v) => v.status === "ok" || v.status === "issue"
      ).length;
      // +1 because the toggle just happened and state may not have updated yet
      if (count + 1 === checklist.totalItems && !showConfetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }, 0);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] pb-28">
      {showConfetti && <ConfettiEffect />}

      <ChecklistHeader
        percentage={checklist.percentage}
        checkedCount={checklist.checkedCount}
        issueCount={checklist.issueCount}
        totalItems={checklist.totalItems}
        isComplete={checklist.isComplete}
        hasVehicleInfo={vehicle.hasInfo}
        onVehicleInfoClick={() => setShowVehicleInfo(!showVehicleInfo)}
      />

      {showVehicleInfo && (
        <VehicleInfo
          info={vehicle.info}
          onUpdate={vehicle.update}
          onClose={() => setShowVehicleInfo(false)}
        />
      )}

      <FilterBar
        search={filters.search}
        onSearchChange={filters.setSearch}
        statusFilter={filters.statusFilter}
        onStatusFilterChange={filters.setStatusFilter}
        tagFilter={filters.tagFilter}
        onTagFilterChange={filters.setTagFilter}
        categoryFilters={filters.categoryFilters}
        onCategoryToggle={filters.toggleCategoryFilter}
        onClearFilters={filters.clearFilters}
        hasActiveFilters={filters.hasActiveFilters}
        statusCounts={filters.statusCounts}
      />

      {/* Success Banner */}
      {checklist.isComplete && (
        <div className="mx-4 mb-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-bold text-emerald-300">Tüm kontroller tamamlandı!</p>
            <p className="text-sm text-emerald-300/70">Araç teslime hazır.</p>
          </div>
        </div>
      )}

      {/* Section Cards */}
      <div className="px-4 space-y-3">
        {checklistData.map((section, sectionIndex) => {
          if (!filters.isSectionVisible(sectionIndex)) return null;
          const filteredItems = filters.getFilteredItems(sectionIndex);
          if (filteredItems.length === 0) return null;

          return (
            <SectionCard
              key={sectionIndex}
              title={section.title}
              sectionIndex={sectionIndex}
              items={filteredItems}
              itemStates={checklist.items}
              progress={checklist.getSectionProgress(sectionIndex)}
              onToggle={handleToggle}
              onMarkIssue={checklist.markIssue}
              onUpdateNote={checklist.updateNote}
              onAddPhoto={checklist.addPhoto}
              onRemovePhoto={checklist.removePhoto}
            />
          );
        })}
      </div>

      <FloatingBar
        percentage={checklist.percentage}
        onReset={checklist.reset}
      />
    </div>
  );
};

export default Index;
```

- [ ] **Step 2: Run build to verify no compile errors**

Run: `cd /home/cevheri/projects/react/aracim && npx vite build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "feat: rewrite Index page with glassmorphism UI and all components"
```

---

### Task 14: Report Page

**Files:**
- Create: `src/pages/Report.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement Report page**

```tsx
// src/pages/Report.tsx
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
```

- [ ] **Step 2: Add report route to App.tsx**

In `src/App.tsx`, add the import and route. The file should become:

```tsx
// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Report from "./pages/Report.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/aracim">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rapor" element={<Report />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

- [ ] **Step 3: Build and verify**

Run: `cd /home/cevheri/projects/react/aracim && npx vite build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Report.tsx src/App.tsx
git commit -m "feat: add print-optimized report page with PDF export and share"
```

---

### Task 15: Run All Tests and Final Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

Run: `cd /home/cevheri/projects/react/aracim && npm test`
Expected: All tests pass (useChecklist, useFilters, useLongPress, plus existing example test).

- [ ] **Step 2: Run lint**

Run: `cd /home/cevheri/projects/react/aracim && npm run lint`
Expected: No errors. Fix any that appear.

- [ ] **Step 3: Run production build**

Run: `cd /home/cevheri/projects/react/aracim && npm run build`
Expected: Build succeeds, output in `dist/`.

- [ ] **Step 4: Commit any lint fixes if needed**

```bash
git add -A
git commit -m "fix: lint fixes"
```

- [ ] **Step 5: Start dev server and verify manually**

Run: `cd /home/cevheri/projects/react/aracim && npm run dev`
Manual checks:
1. Page loads with dark gradient background and glass cards
2. Tapping an item toggles green check
3. Long-pressing an item opens amber issue panel with note + photo
4. Search filters items in real-time
5. Status/tag/category chips filter correctly and combine
6. Vehicle info chip opens inline form
7. Floating bar shows progress and "Rapor Oluştur" navigates to /rapor
8. Report page shows summary, issues, and section breakdown
9. Print button opens browser print dialog
10. Reset clears all state after confirmation
