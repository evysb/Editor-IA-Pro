import React from "react";
import {AbsoluteFill, Series, useVideoConfig} from "remotion";
import {VideoClip} from "./VideoClip";

/** A keep range of the source video, in seconds. */
export interface Segment {
  startSeconds: number;
  endSeconds: number;
}

export interface JumpCutProps {
  src: string;
  /** Ranges to keep, played back-to-back; gaps between them are dropped. */
  segments: Segment[];
  /** Slack added to each side of a segment, in seconds, to avoid clipped words. */
  paddingSeconds?: number;
  volume?: number;
  fit?: "cover" | "contain" | "fill";
  muted?: boolean;
  style?: React.CSSProperties;
}

/**
 * Plays only the given segments of a video end-to-end, removing the gaps
 * (e.g. silence) between them. Each segment becomes one trimmed `VideoClip`
 * in a `Series`, so they play sequentially without overlap.
 */
export const JumpCut: React.FC<JumpCutProps> = ({
  src,
  segments,
  paddingSeconds = 0.1,
  volume = 1,
  fit = "cover",
  muted = false,
  style,
}) => {
  const {fps} = useVideoConfig();

  if (segments.length === 0) return null;

  return (
    <AbsoluteFill style={style}>
      <Series>
        {segments.map((segment, i) => {
          // Pad both sides, clamping the start at 0 so padding can't go negative.
          const start = Math.max(0, segment.startSeconds - paddingSeconds);
          const end = segment.endSeconds + paddingSeconds;
          const durationSeconds = end - start;
          const durationInFrames = Math.round(durationSeconds * fps);

          // Skip degenerate segments that round to zero (or negative) frames.
          if (durationInFrames <= 0) return null;

          return (
            <Series.Sequence key={i} durationInFrames={durationInFrames}>
              <VideoClip
                src={src}
                trimStartSeconds={start}
                trimEndSeconds={end}
                volume={volume}
                fit={fit}
                muted={muted}
              />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};

/**
 * Total frame count a `JumpCut` will occupy for the given segments and padding.
 * Mirrors the component's per-segment rounding exactly, so use it to set the
 * parent composition's durationInFrames.
 */
export const calculateJumpCutDuration = (
  segments: Segment[],
  fps: number,
  paddingSeconds = 0.1,
): number => {
  return segments.reduce((total, seg) => {
    const start = Math.max(0, seg.startSeconds - paddingSeconds);
    const end = seg.endSeconds + paddingSeconds;
    return total + Math.round((end - start) * fps);
  }, 0);
};
