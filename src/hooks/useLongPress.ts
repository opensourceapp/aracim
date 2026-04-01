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
