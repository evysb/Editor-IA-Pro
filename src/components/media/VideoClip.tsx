import React from "react";
import {AbsoluteFill, useVideoConfig} from "remotion";
import {Video} from "@remotion/media";

export interface VideoClipProps {
  src: string;
  /** Trim offsets into the source video, in seconds (converted to frames). */
  trimStartSeconds?: number;
  trimEndSeconds?: number;
  fit?: "cover" | "contain" | "fill";
  /** Constant level (0–1) or a per-frame envelope function. */
  volume?: number | ((frame: number) => number);
  playbackRate?: number;
  muted?: boolean;
  style?: React.CSSProperties;
}

/**
 * Full-frame video clip with seconds-based trimming, wrapping `@remotion/media`
 * `Video`. Exposes trim points in seconds; the underlying `trimBefore`/`trimAfter`
 * props are in frames, so they are converted here using the composition fps.
 */
export const VideoClip: React.FC<VideoClipProps> = ({
  src,
  trimStartSeconds = 0,
  trimEndSeconds,
  fit = "cover",
  volume = 1,
  playbackRate = 1,
  muted = false,
  style,
}) => {
  const {fps} = useVideoConfig();

  const trimBefore = Math.round(trimStartSeconds * fps);
  const trimAfter = trimEndSeconds !== undefined
    ? Math.round(trimEndSeconds * fps)
    : undefined;

  const objectFit =
    fit === "cover" ? "cover" : fit === "contain" ? "contain" : "fill";

  return (
    <AbsoluteFill style={style}>
      <Video
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
        trimBefore={trimBefore}
        trimAfter={trimAfter}
      />
    </AbsoluteFill>
  );
};
