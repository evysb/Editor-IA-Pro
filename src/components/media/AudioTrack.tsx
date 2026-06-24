import React from "react";
import {useVideoConfig, interpolate} from "remotion";
import {Audio} from "@remotion/media";

export interface AudioTrackProps {
  src: string;
  /** Base volume before fades/ducking, 0–1. */
  volume?: number;
  /** Fade-in/out ramps, in seconds; converted to frames internally. */
  fadeInDurationSeconds?: number;
  fadeOutDurationSeconds?: number;
  /** Time ranges (seconds) where volume drops to duckVolume, e.g. over speech. */
  duckDuringSegments?: Array<{startSeconds: number; endSeconds: number}>;
  /** Reduced volume applied during ducked segments. */
  duckVolume?: number;
  loop?: boolean;
  /** Trim offsets into the source audio, in seconds. */
  trimStartSeconds?: number;
  trimEndSeconds?: number;
}

/**
 * Background audio track with timeline-driven fade-in/out and speech ducking.
 * Wraps `@remotion/media` `Audio`, converting all second-based inputs to frames
 * since Remotion timing is frame-native.
 */
export const AudioTrack: React.FC<AudioTrackProps> = ({
  src,
  volume = 0.3,
  fadeInDurationSeconds = 1,
  fadeOutDurationSeconds = 2,
  duckDuringSegments,
  duckVolume = 0.1,
  loop = true,
  trimStartSeconds = 0,
  trimEndSeconds,
}) => {
  const {fps, durationInFrames} = useVideoConfig();

  const fadeInFrames = Math.round(fadeInDurationSeconds * fps);
  const fadeOutFrames = Math.round(fadeOutDurationSeconds * fps);
  const trimBefore = Math.round(trimStartSeconds * fps);
  const trimAfter = trimEndSeconds !== undefined
    ? Math.round(trimEndSeconds * fps)
    : undefined;

  // Per-frame volume envelope: fade-in × fade-out, then overridden by ducking.
  const volumeCallback = (frame: number): number => {
    let vol = volume;
    if (frame < fadeInFrames) {
      vol *= interpolate(frame, [0, fadeInFrames], [0, 1], {
        extrapolateRight: "clamp",
      });
    }

    const fadeOutStart = durationInFrames - fadeOutFrames;
    if (frame >= fadeOutStart) {
      vol *= interpolate(frame, [fadeOutStart, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }

    // Ducking takes precedence over the fade envelope while inside a segment.
    if (duckDuringSegments) {
      const currentSeconds = frame / fps;
      const isDucking = duckDuringSegments.some(
        (seg) => currentSeconds >= seg.startSeconds && currentSeconds <= seg.endSeconds,
      );
      if (isDucking) {
        vol = duckVolume;
      }
    }

    return vol;
  };

  return (
    <Audio
      src={src}
      volume={volumeCallback}
      loop={loop}
      trimBefore={trimBefore}
      trimAfter={trimAfter}
    />
  );
};
