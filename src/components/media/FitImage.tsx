import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

/** Direction of the Ken Burns camera move applied across the clip. */
export type KenBurnsDirection = "zoomIn" | "zoomOut" | "panLeft" | "panRight" | "panUp" | "panDown";

export interface FitImageProps {
  src: string;
  fit?: "cover" | "contain" | "fill";
  /** Enables a Ken Burns move; omit for a static image. */
  kenBurns?: KenBurnsDirection;
  /** Move amount as a fraction of frame size (0.1 = 10% zoom/pan over the clip). */
  kenBurnsIntensity?: number;
  style?: React.CSSProperties;
}

/**
 * Full-frame image with an optional Ken Burns (slow zoom/pan) effect.
 * The move is driven by the clip's frame position, so it spans the whole
 * composition duration regardless of fps.
 */
export const FitImage: React.FC<FitImageProps> = ({
  src,
  fit = "cover",
  kenBurns,
  kenBurnsIntensity = 0.1,
  style,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // 0→1 across the clip; drives the Ken Burns move. Clamped so it holds at 1
  // if the image outlives durationInFrames.
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Pans pre-scale by intensity so the translated edge never reveals empty space.
  let transform = "";
  if (kenBurns) {
    const intensity = kenBurnsIntensity;
    switch (kenBurns) {
      case "zoomIn":
        transform = `scale(${1 + progress * intensity})`;
        break;
      case "zoomOut":
        transform = `scale(${1 + intensity - progress * intensity})`;
        break;
      case "panLeft":
        transform = `scale(${1 + intensity}) translateX(${-progress * intensity * 100}%)`;
        break;
      case "panRight":
        transform = `scale(${1 + intensity}) translateX(${progress * intensity * 100}%)`;
        break;
      case "panUp":
        transform = `scale(${1 + intensity}) translateY(${-progress * intensity * 100}%)`;
        break;
      case "panDown":
        transform = `scale(${1 + intensity}) translateY(${progress * intensity * 100}%)`;
        break;
    }
  }

  const objectFit =
    fit === "cover" ? "cover" : fit === "contain" ? "contain" : "fill";

  return (
    <AbsoluteFill style={{overflow: "hidden", ...style}}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          transform,
        }}
      />
    </AbsoluteFill>
  );
};
