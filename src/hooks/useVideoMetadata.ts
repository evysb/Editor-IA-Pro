import {useState, useEffect} from "react";
import {staticFile, delayRender, continueRender, cancelRender} from "remotion";

/** Video metadata from the analysis pipeline. `duration` is in seconds. */
export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  videoCodec: string;
  audioCodec: string;
  hasAudio: boolean;
}

/**
 * Loads probed video metadata (`video-metadata.json`) from the public dir.
 *
 * Returns null until the fetch resolves. The load is gated with delayRender so
 * the render waits for the data and cancels on error.
 */
export const useVideoMetadata = (
  metadataPath: string = "video-metadata.json",
): VideoMetadata | null => {
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [handle] = useState(() => delayRender("Loading video metadata"));

  useEffect(() => {
    fetch(staticFile(metadataPath))
      .then((r) => r.json())
      .then((data: VideoMetadata) => {
        setMetadata(data);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [metadataPath, handle]);

  return metadata;
};
