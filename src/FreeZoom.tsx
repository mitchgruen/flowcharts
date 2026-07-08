import type { ReactNode } from "react";
import { useFreeZoom } from "./useFreeZoom";

export function FreeZoom({
  children,
  initialScale = 1,
}: {
  children: ReactNode;
  initialScale?: number;
}) {
  const { containerRef, scale, offset, handlers } = useFreeZoom(initialScale);

  return (
    <div
      ref={containerRef}
      {...handlers}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {children}
      </div>
    </div>
  );
}
