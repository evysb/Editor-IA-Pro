import {useState, useEffect, useMemo} from "react";
import {staticFile, delayRender, continueRender, cancelRender} from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokPage,
} from "@remotion/captions";

export interface TranscriptionData {
  captions: Caption[];
  pages: TikTokPage[];
  isLoading: boolean;
}

/**
 * Loads a word-level transcription (`captions.json`) and groups it into
 * TikTok-style pages for on-screen captions.
 *
 * @param combineTokensWithinMs Tokens closer than this gap (milliseconds) are
 *   merged onto the same page; larger values yield fewer, denser pages.
 *
 * Blocks the render via delayRender until the fetch resolves (cancels on
 * error). `isLoading` stays true and `captions`/`pages` are empty arrays until
 * then, so consumers can render without null checks.
 */
export const useTranscription = (
  captionsPath: string = "captions.json",
  combineTokensWithinMs: number = 1200,
): TranscriptionData => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading transcription"));

  useEffect(() => {
    fetch(staticFile(captionsPath))
      .then((r) => r.json())
      .then((data: Caption[]) => {
        setCaptions(data);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [captionsPath, handle]);

  // Re-page only when the captions or the grouping window change.
  const pages = useMemo(() => {
    if (!captions) return [];
    return createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: combineTokensWithinMs,
    }).pages;
  }, [captions, combineTokensWithinMs]);

  return {
    captions: captions || [],
    pages,
    isLoading: !captions,
  };
};
