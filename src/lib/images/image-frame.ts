import type { CSSProperties } from "react";

/** Pan/zoom frame from the catalog API (same contract as banners). */
export type ImageFrameInput = {
  image_zoom?: number | null;
  image_x?: number | null;
  image_y?: number | null;
} | null | undefined;

/** CSS transform for Mini App cover crops. Returns undefined when the frame is identity. */
export function imageFrameStyle(frame: ImageFrameInput): CSSProperties | undefined {
  const zoom = frame?.image_zoom ?? 1;
  const x = frame?.image_x ?? 0;
  const y = frame?.image_y ?? 0;
  if (zoom === 1 && x === 0 && y === 0) return undefined;
  return { transform: `translate(${x}%, ${y}%) scale(${zoom})` };
}
