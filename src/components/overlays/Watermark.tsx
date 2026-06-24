import React from "react";
import {Img} from "remotion";

/** Which corner of the frame the watermark anchors to. */
export type WatermarkCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export interface WatermarkProps {
  /** Image URL for a logo watermark; takes precedence over {@link WatermarkProps.text} when both are set. */
  src?: string;
  /** Text watermark, used only when {@link WatermarkProps.src} is absent. */
  text?: string;
  corner?: WatermarkCorner;
  opacity?: number;
  /** Logo width/height in px (square); ignored for text watermarks. */
  size?: number;
  /** Inset from the anchored corner, in px. */
  margin?: number;
  color?: string;
  fontSize?: number;
  style?: React.CSSProperties;
}

/**
 * Static corner watermark rendering either a logo image or a text label.
 * Prefers the image when both `src` and `text` are provided; renders nothing
 * when neither is set.
 */
export const Watermark: React.FC<WatermarkProps> = ({
  src,
  text,
  corner = "bottomRight",
  opacity = 0.5,
  size = 80,
  margin = 30,
  color = "#ffffff",
  fontSize = 16,
  style,
}) => {
  const positionStyles: React.CSSProperties = {
    topLeft: {top: margin, left: margin},
    topRight: {top: margin, right: margin},
    bottomLeft: {bottom: margin, left: margin},
    bottomRight: {bottom: margin, right: margin},
  }[corner];

  return (
    <div
      style={{
        position: "absolute",
        opacity,
        ...positionStyles,
        ...style,
      }}
    >
      {src ? (
        <Img
          src={src}
          style={{width: size, height: size, objectFit: "contain"}}
        />
      ) : text ? (
        <span style={{color, fontSize, fontWeight: 600}}>{text}</span>
      ) : null}
    </div>
  );
};
