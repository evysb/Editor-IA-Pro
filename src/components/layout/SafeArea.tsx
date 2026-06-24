import React from "react";
import {AbsoluteFill} from "remotion";

export interface SafeAreaProps {
  children: React.ReactNode;
  paddingHorizontal?: number;
  paddingVertical?: number;
  style?: React.CSSProperties;
}

/**
 * Insets its children by platform-safe padding so content clears device chrome
 * and crop-prone edges. Padding values are in pixels in the composition space.
 */
export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  paddingHorizontal = 60,
  paddingVertical = 60,
  style,
}) => {
  return (
    <AbsoluteFill
      style={{
        padding: `${paddingVertical}px ${paddingHorizontal}px`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
