import React from "react";
import {AbsoluteFill} from "remotion";

/** Which corner the PiP overlay anchors to. */
export type PipCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export interface PictureInPictureProps {
  main: React.ReactNode;
  pip: React.ReactNode;
  corner?: PipCorner;
  pipWidth?: number;
  pipHeight?: number;
  margin?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
}

/**
 * Layers a smaller picture-in-picture overlay over full-bleed main content,
 * pinned to a chosen corner. Typical use is a webcam feed over screen capture.
 *
 * `pipWidth`/`pipHeight`/`margin` are in pixels within the composition's
 * coordinate space. The overlay always renders above `main`.
 */
export const PictureInPicture: React.FC<PictureInPictureProps> = ({
  main,
  pip,
  corner = "bottomRight",
  pipWidth = 360,
  pipHeight = 240,
  margin = 24,
  borderRadius = 12,
  borderColor = "rgba(255,255,255,0.2)",
  borderWidth = 2,
  shadow = true,
  style,
}) => {
  const positionStyles: React.CSSProperties = {
    topLeft: {top: margin, left: margin},
    topRight: {top: margin, right: margin},
    bottomLeft: {bottom: margin, left: margin},
    bottomRight: {bottom: margin, right: margin},
  }[corner];

  return (
    <AbsoluteFill style={style}>
      <AbsoluteFill>{main}</AbsoluteFill>

      {/* Rendered after main so it layers on top */}
      <div
        style={{
          position: "absolute",
          width: pipWidth,
          height: pipHeight,
          borderRadius,
          overflow: "hidden",
          border: `${borderWidth}px solid ${borderColor}`,
          boxShadow: shadow ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
          ...positionStyles,
        }}
      >
        {pip}
      </div>
    </AbsoluteFill>
  );
};
