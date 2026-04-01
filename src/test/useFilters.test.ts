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
    const items = result.current.getFilteredItems(0);
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
    expect(items.length).toBe(5);
  });

  it("filters by tag: critical", () => {
    const { result } = renderHook(() => useFilters(emptyState));
    act(() => result.current.setTagFilter("critical"));
    const items = result.current.getFilteredItems(0);
    expect(items.every((item) => item.tag === "critical")).toBe(true);
  });

  it("filters by category (section index)", () => {
    const { result } = renderHook(() => useFilters(emptyState));
    act(() => result.current.toggleCategoryFilter(0));
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
    expect(items[0].originalIndex).toBeDefined();
    expect(typeof items[0].originalIndex).toBe("number");
  });
});
