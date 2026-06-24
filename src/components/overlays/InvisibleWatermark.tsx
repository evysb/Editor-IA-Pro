import React from "react";
import {AbsoluteFill} from "remotion";
import {
  WATERMARK_BLOCKS_X,
  WATERMARK_BLOCKS_Y,
  WATERMARK_STRENGTH,
  watermarkPattern,
} from "../../presets/watermark";

/**
 * Pre-rendered list of block rects. The pattern is static, so we build the SVG
 * children once at module load instead of on every frame. A +1 block paints a
 * white cell (nudges luminance up), a -1 block paints a black cell (nudges it
 * down); the parent's low opacity makes the shift imperceptible.
 */
const PATTERN = watermarkPattern();
const RECTS = Array.from(PATTERN, (sign, i) => (
  <rect
    key={i}
    x={i % WATERMARK_BLOCKS_X}
    y={Math.floor(i / WATERMARK_BLOCKS_X)}
    width={1}
    height={1}
    fill={sign > 0 ? "#ffffff" : "#000000"}
  />
));

export interface InvisibleWatermarkProps {
  /** Overlay alpha (0..1). Higher = more robust but more visible. Defaults to {@link WATERMARK_STRENGTH}. */
  strength?: number;
}

/**
 * Full-frame, near-invisible forensic watermark. Stretches the ±1 spread-spectrum
 * grid over the whole canvas at very low opacity so it modulates every output
 * pixel without being noticeable. Detection is handled offline by correlating a
 * rendered clip against the same pattern (scripts/detect-watermark.ts).
 *
 * Applied automatically to every composition via the withWatermark HOC, so it is
 * baked into all renders rather than opted into per video.
 */
export const InvisibleWatermark: React.FC<InvisibleWatermarkProps> = ({
  strength = WATERMARK_STRENGTH,
}) => {
  return (
    <AbsoluteFill style={{opacity: strength, pointerEvents: "none"}}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${WATERMARK_BLOCKS_X} ${WATERMARK_BLOCKS_Y}`}
        // Stretch the grid to fill any aspect ratio; keep cells hard-edged so
        // each maps cleanly to a detector block after downscaling.
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
      >
        {RECTS}
      </svg>
    </AbsoluteFill>
  );
};
