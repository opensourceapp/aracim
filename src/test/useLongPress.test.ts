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
