import React from "react";
import {AbsoluteFill} from "remotion";

export interface ColorWashProps {
  color: string;
  /** Reserved for a future two-color wash; currently unused. */
  toColor?: string;
  opacity?: number;
  style?: React.CSSProperties;
}

/** Full-screen solid color background. Use as the bottom layer in an AbsoluteFill stack. */
export const ColorWash: React.FC<ColorWashProps> = ({
  color,
  toColor,
  opacity = 1,
  style,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity,
        ...style,
      }}
    />
  );
};
