import React from "react";
import {AbsoluteFill, Sequence, staticFile} from "remotion";
import {VideoClip} from "../../components/media/VideoClip";
import {CaptionOverlay, type CaptionPreset} from "../../components/text/CaptionOverlay";
import {AnimatedTitle} from "../../components/text/AnimatedTitle";
import {ProgressBar} from "../../components/overlays/ProgressBar";
import {SafeArea} from "../../components/layout/SafeArea";
import {Watermark} from "../../components/overlays/Watermark";
import {loadDefaultFonts} from "../../presets/fonts";
import {BRAND} from "../../presets/brand";

export interface PodcastClipProps {
  /** Source under public/, resolved via staticFile (default "assets/video.mp4"). */
  videoSrc?: string;
  /** Clip in/out points in seconds; also used to offset caption timing. */
  clipStartSeconds?: number;
  clipEndSeconds?: number;
  captionsPath?: string;
  showCaptions?: boolean;
  captionPreset?: CaptionPreset;
  title?: string;
  accentColor?: string;
}

/**
 * Extracts a short, captioned clip from longer footage (e.g. a podcast episode).
 * Trims the video to [clipStartSeconds, clipEndSeconds], overlays captions, an
 * optional intro title, a progress bar, and the brand watermark.
 */
export const PodcastClip: React.FC<PodcastClipProps> = ({
  videoSrc = "assets/video.mp4",
  clipStartSeconds = 0,
  clipEndSeconds = 30,
  captionsPath,
  showCaptions = true,
  captionPreset = "bold",
  title,
  accentColor = "#6366f1",
}) => {
  loadDefaultFonts();

  const src = staticFile(videoSrc);
  // Captions are timed against the full source, so shift them back by the clip's start.
  const offsetMs = clipStartSeconds * 1000;

  return (
    <AbsoluteFill>
      <VideoClip
        src={src}
        trimStartSeconds={clipStartSeconds}
        trimEndSeconds={clipEndSeconds}
      />

      {showCaptions && captionsPath && (
        <CaptionOverlay
          captionsSource={captionsPath}
          preset={captionPreset}
          position="bottom"
          offsetMs={offsetMs}
        />
      )}

      {title && (
        <Sequence from={0} durationInFrames={90}>
          <SafeArea>
            <AbsoluteFill style={{justifyContent: "flex-start", alignItems: "center", paddingTop: 60}}>
              <AnimatedTitle
                text={title}
                fontSize={42}
                fontWeight={700}
                color="#ffffff"
                enterAnimation="slideDown"
                exitAnimation="fade"
                enterDuration={15}
                holdDuration={50}
                exitDuration={15}
                textShadow="0 2px 10px rgba(0,0,0,0.8)"
              />
            </AbsoluteFill>
          </SafeArea>
        </Sequence>
      )}

      <ProgressBar color={accentColor} height={3} />

      <Watermark text={BRAND.handle} corner="topRight" opacity={0.5} fontSize={14} color="#ffffff" margin={30} />
    </AbsoluteFill>
  );
};
