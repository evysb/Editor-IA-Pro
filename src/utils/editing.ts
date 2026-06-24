import type {Segment} from "../components/media/JumpCut";

/**
 * Builds a jump-cut list from detected speech segments: pads each segment so
 * cuts don't clip the start/end of words, then drops segments too short to be
 * worth keeping. All values are in seconds.
 *
 * @param options.paddingSeconds   Added to each side of every segment (default 0.1s).
 *                                  The start is floored at 0 so padding can't go negative.
 * @param options.minSegmentSeconds Segments shorter than this after padding are removed (default 0.3s).
 */
export const buildCutList = (
  speechSegments: Segment[],
  options: {paddingSeconds?: number; minSegmentSeconds?: number} = {},
): Segment[] => {
  const {paddingSeconds = 0.1, minSegmentSeconds = 0.3} = options;

  return speechSegments
    .map((seg) => ({
      startSeconds: Math.max(0, seg.startSeconds - paddingSeconds),
      endSeconds: seg.endSeconds + paddingSeconds,
    }))
    .filter((seg) => seg.endSeconds - seg.startSeconds >= minSegmentSeconds);
};

/**
 * Merges segments whose gap is within `gapThresholdSeconds` (default 0.3s) into
 * single continuous segments, so brief pauses don't produce jarring micro-cuts.
 * Input is sorted by start time first; the original array is not mutated.
 */
export const mergeSegments = (
  segments: Segment[],
  gapThresholdSeconds: number = 0.3,
): Segment[] => {
  if (segments.length === 0) return [];

  const sorted = [...segments].sort((a, b) => a.startSeconds - b.startSeconds);
  const merged: Segment[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const current = sorted[i];

    if (current.startSeconds - last.endSeconds <= gapThresholdSeconds) {
      // Extend the running segment; max() guards against a segment fully
      // contained within the previous one (which would otherwise shorten it).
      last.endSeconds = Math.max(last.endSeconds, current.endSeconds);
    } else {
      merged.push({...current});
    }
  }

  return merged;
};

/** Sums the durations of all segments, in seconds (gaps between them excluded). */
export const calculateTotalDuration = (segments: Segment[]): number =>
  segments.reduce((sum, seg) => sum + (seg.endSeconds - seg.startSeconds), 0);

/**
 * Re-times captions when extracting a sub-clip: subtracts `offsetMs` (the clip's
 * start, in milliseconds) from every timestamp so they're relative to the clip.
 * Captions that fall entirely before the clip start are discarded.
 */
export const offsetCaptions = <T extends {startMs: number; endMs: number}>(
  captions: T[],
  offsetMs: number,
): T[] =>
  captions
    .map((c) => ({
      ...c,
      startMs: c.startMs - offsetMs,
      endMs: c.endMs - offsetMs,
    }))
    // Drop captions that started before the clip (negative start) so partial
    // words at the cut point don't appear; endMs > 0 is a redundant safety check.
    .filter((c) => c.startMs >= 0 && c.endMs > 0);
