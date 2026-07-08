import { useEffect, useRef, useState } from "react";

type View = { scale: number; x: number; y: number };

export function useFreeZoom(initialScale = 1) {
  // x/y and scale are combined so the wheel handler can update both
  // atomically when re-anchoring the zoom to the cursor position.
  const [view, setView] = useState<View>(() => ({
    scale: initialScale,
    x: (window.innerWidth * (1 - initialScale)) / 2,
    y: (window.innerHeight * (1 - initialScale)) / 2,
  }));
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      // Prevent the browser's native pinch-to-zoom (trackpad pinch fires as
      // a ctrl+wheel event), which would zoom the whole page instead of
      // just the chart and drag fixed-position elements along with it.
      e.preventDefault();

      const rect = el!.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      setView((prev) => {
        const scale = Math.min(
          4,
          Math.max(0.25, prev.scale - e.deltaY * 0.0075),
        );
        const ratio = scale / prev.scale;
        // Keep the content point under the cursor fixed on screen: solve
        // for the new offset given the new scale and the old cursor/offset.
        return {
          scale,
          x: cursorX - ratio * (cursorX - prev.x),
          y: cursorY - ratio * (cursorY - prev.y),
        };
      });
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  function handlePointerDown(e: React.PointerEvent) {
    dragStart.current = { x: e.clientX - view.x, y: e.clientY - view.y };
  }

  function handlePointerMove(e: React.PointerEvent) {
    const start = dragStart.current;
    if (!start) return;
    setView((prev) => ({
      ...prev,
      x: e.clientX - start.x,
      y: e.clientY - start.y,
    }));
  }

  function handlePointerUp() {
    dragStart.current = null;
  }

  return {
    containerRef,
    scale: view.scale,
    offset: { x: view.x, y: view.y },
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
    },
  };
}
