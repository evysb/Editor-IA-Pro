import {useCurrentFrame} from "remotion";
import type {CaptionWord} from "../components/text/WordByWordCaption";

/** A single caption token with millisecond timing, as produced by Whisper. */
export interface CaptionEntry {
  text: string;
  startMs: number;
  endMs: number;
}

/**
 * Converts millisecond-timed captions (e.g. Whisper output) into frame-based
 * CaptionWords for the given fps, so they can be matched against the current
 * frame. Boundaries are rounded to the nearest frame.
 */
export const captionsToWords = (
  captions: CaptionEntry[],
  fps: number,
): CaptionWord[] => {
  return captions.map((c) => ({
    text: c.text,
    startFrame: Math.round((c.startMs / 1000) * fps),
    endFrame: Math.round((c.endMs / 1000) * fps),
  }));
};

/**
 * Returns the text of the caption active at the current frame, or null when no
 * word covers it. Frame ranges are inclusive on both ends; if they overlap, the
 * first matching word wins.
 */
export const useCurrentCaption = (words: CaptionWord[]): string | null => {
  const frame = useCurrentFrame();

  const active = words.find(
    (w) => frame >= w.startFrame && frame <= w.endFrame,
  );

  return active?.text ?? null;
};
