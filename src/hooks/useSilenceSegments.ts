import {useState, useEffect} from "react";
import {staticFile, delayRender, continueRender, cancelRender} from "remotion";
import type {Segment} from "../components/media/JumpCut";

/** Parsed silence-detection output. All durations are in seconds. */
export interface SilenceData {
  silenceSegments: Segment[];
  speechSegments: Segment[];
  totalDuration: number;
  speechDuration: number;
  silenceDuration: number;
}

/**
 * Segment as it may appear on disk, tolerating both naming conventions the
 * pipeline has emitted: bare `start`/`end` or explicit `startSeconds`/`endSeconds`.
 */
interface RawSegment {
  start?: number;
  end?: number;
  startSeconds?: number;
  endSeconds?: number;
}

// Prefer the explicit *Seconds fields, fall back to start/end, default to 0.
const normalizeSegment = (s: RawSegment): Segment => ({
  startSeconds: s.startSeconds ?? s.start ?? 0,
  endSeconds: s.endSeconds ?? s.end ?? 0,
});

/**
 * Loads silence-detection results (`silence.json`) from the public dir.
 *
 * Returns null until the fetch resolves. Pass null as the path to opt out:
 * the hook is still called every render (Rules of Hooks) but skips the fetch
 * and never blocks rendering. When a path is given, the load is gated with
 * delayRender so the render waits for the data and cancels on error.
 */
export const useSilenceSegments = (
  silencePath: string | null = "silence.json",
): SilenceData | null => {
  const [data, setData] = useState<SilenceData | null>(null);
  const [handle] = useState(() =>
    silencePath ? delayRender("Loading silence data") : null,
  );

  useEffect(() => {
    if (!silencePath || !handle) {
      return;
    }

    fetch(staticFile(silencePath))
      .then((r) => r.json())
      .then((result: any) => {
        setData({
          ...result,
          speechSegments: (result.speechSegments || []).map(normalizeSegment),
          silenceSegments: (result.silenceSegments || []).map(normalizeSegment),
        });
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [silencePath, handle]);

  return data;
};
