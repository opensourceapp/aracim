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
    expect(progress.total).toBe(6);
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
