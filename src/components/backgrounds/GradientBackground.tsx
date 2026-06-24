import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";

export interface GradientBackgroundProps {
  colors: readonly string[] | string[];
  /** Linear gradient angle in degrees (ignored when type is "radial"). */
  angle?: number;
  /** When true, the angle rotates over time; degrees added per frame is animateSpeed. */
  animateAngle?: boolean;
  animateSpeed?: number;
  type?: "linear" | "radial";
  style?: React.CSSProperties;
}

/**
 * Full-screen linear or radial gradient background, with an optional
 * frame-driven angle rotation for subtle motion. Colors are spread evenly
 * across the gradient.
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  colors,
  angle = 135,
  animateAngle = false,
  animateSpeed = 1,
  type = "linear",
  style,
}) => {
  const frame = useCurrentFrame();

  const currentAngle = animateAngle
    ? angle + frame * animateSpeed
    : angle;

  // Distribute colors evenly: first at 0%, last at 100%.
  const colorStops = colors
    .map((color, i) => {
      const position = (i / (colors.length - 1)) * 100;
      return `${color} ${position}%`;
    })
    .join(", ");

  const gradient =
    type === "radial"
      ? `radial-gradient(circle, ${colorStops})`
      : `linear-gradient(${currentAngle}deg, ${colorStops})`;

  return (
    <AbsoluteFill
      style={{
        background: gradient,
        ...style,
      }}
    />
  );
};
