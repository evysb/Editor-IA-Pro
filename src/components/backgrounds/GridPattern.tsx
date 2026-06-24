import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";

export interface GridPatternProps {
  type?: "dots" | "lines" | "crosses";
  /** Distance in pixels between grid elements. Also the scroll wrap period when animated. */
  spacing?: number;
  /** Element size in pixels: dot radius, cross half-length, or line thickness basis. */
  size?: number;
  color?: string;
  opacity?: number;
  /** When true, the grid scrolls diagonally; pixels moved per frame is animateSpeed. */
  animate?: boolean;
  animateSpeed?: number;
  style?: React.CSSProperties;
}

/**
 * Full-screen dot, line, or cross grid rendered as SVG, sized to the
 * composition. When animated it scrolls diagonally; the offset wraps at
 * `spacing` so the motion loops seamlessly.
 */
export const GridPattern: React.FC<GridPatternProps> = ({
  type = "dots",
  spacing = 40,
  size = 2,
  color = "rgba(255,255,255,0.15)",
  opacity = 1,
  animate = false,
  animateSpeed = 0.5,
  style,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  // Wrap the scroll offset within one cell so motion repeats seamlessly.
  const offset = animate ? (frame * animateSpeed) % spacing : 0;

  // Overdraw by one cell on each axis so scrolled-in elements never pop at the edges.
  const cols = Math.ceil(width / spacing) + 2;
  const rows = Math.ceil(height / spacing) + 2;

  const elements: React.ReactNode[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing - spacing + offset;
      const y = row * spacing - spacing + offset;

      if (type === "dots") {
        elements.push(
          <circle key={`${row}-${col}`} cx={x} cy={y} r={size} fill={color} />,
        );
      } else if (type === "crosses") {
        elements.push(
          <g key={`${row}-${col}`}>
            <line
              x1={x - size * 2}
              y1={y}
              x2={x + size * 2}
              y2={y}
              stroke={color}
              strokeWidth={size * 0.5}
            />
            <line
              x1={x}
              y1={y - size * 2}
              x2={x}
              y2={y + size * 2}
              stroke={color}
              strokeWidth={size * 0.5}
            />
          </g>,
        );
      }
    }
  }

  if (type === "lines") {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing - spacing + offset;
      elements.push(
        <line
          key={`v-${col}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={color}
          strokeWidth={size * 0.5}
        />,
      );
    }
    for (let row = 0; row < rows; row++) {
      const y = row * spacing - spacing + offset;
      elements.push(
        <line
          key={`h-${row}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={color}
          strokeWidth={size * 0.5}
        />,
      );
    }
  }

  return (
    <AbsoluteFill style={{opacity, ...style}}>
      <svg width={width} height={height}>
        {elements}
      </svg>
    </AbsoluteFill>
  );
};
