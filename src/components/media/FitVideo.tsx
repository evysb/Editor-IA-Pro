import React from "react";
import {AbsoluteFill, OffthreadVideo} from "remotion";

export interface FitVideoProps {
  src: string;
  fit?: "cover" | "contain" | "fill";
  /** Constant level (0–1) or a per-frame envelope function. */
  volume?: number | ((frame: number) => number);
  playbackRate?: number;
  muted?: boolean;
  style?: React.CSSProperties;
}

/**
 * Full-frame video that fills the composition via object-fit.
 * Uses `OffthreadVideo` so frames are decoded deterministically during render.
 */
export const FitVideo: React.FC<FitVideoProps> = ({
  src,
  fit = "cover",
  volume = 1,
  playbackRate = 1,
  muted = false,
  style,
}) => {
  const objectFit =
    fit === "cover" ? "cover" : fit === "contain" ? "contain" : "fill";

  return (
    <AbsoluteFill style={style}>
      <OffthreadVideo
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
        }}
        // Pass through a volume function as-is; otherwise wrap the constant so
        // `muted` forces silence.
        volume={typeof volume === "function" ? volume : () => (muted ? 0 : volume)}
        playbackRate={playbackRate}
        muted={muted}
      />
    </AbsoluteFill>
  );
};
