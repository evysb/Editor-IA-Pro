import React from "react";
import {AbsoluteFill, Sequence, staticFile} from "remotion";
import {VideoClip} from "../../components/media/VideoClip";
import {JumpCut} from "../../components/media/JumpCut";
import {CaptionOverlay, type CaptionPreset} from "../../components/text/CaptionOverlay";
import {AnimatedTitle} from "../../components/text/AnimatedTitle";
import {LowerThird} from "../../components/text/LowerThird";
import {CallToAction} from "../../components/overlays/CallToAction";
import {ProgressBar} from "../../components/overlays/ProgressBar";
import {AudioTrack} from "../../components/media/AudioTrack";
import {useSilenceSegments} from "../../hooks/useSilenceSegments";
import {buildCutList, mergeSegments} from "../../utils/editing";
import {Watermark} from "../../components/overlays/Watermark";
import {loadDefaultFonts} from "../../presets/fonts";
import {BRAND} from "../../presets/brand";

export interface TalkingHeadEditProps {
  /** Source under public/, resolved via staticFile (default "assets/video.mp4"). */
  videoSrc?: string;
  captionsPath?: string;
  /** silence.json from the detect-silence pipeline; required for removeSilence. */
  silencePath?: string;
  /** When true (and silence data is present), jump-cut out the silent gaps. */
  removeSilence?: boolean;
  showCaptions?: boolean;
  captionPreset?: CaptionPreset;
  title?: string;
  /** Intro title on-screen duration, in frames. */
  titleDuration?: number;
  speakerName?: string;
  speakerTitle?: string;
  ctaText?: string;
  /** CTA on-screen duration in frames; used to back it off from the end. */
  ctaDuration?: number;
  backgroundMusic?: string;
  /** Music level (0–1); kept low so it sits under speech. */
  musicVolume?: number;
  accentColor?: string;
}

/**
 * All-in-one talking-head editor: optionally removes silence via jump cuts,
 * then layers captions, an intro title, a speaker lower third, an end CTA,
 * ducked background music, a progress bar, and the brand watermark.
 */
export const TalkingHeadEdit: React.FC<TalkingHeadEditProps> = ({
  videoSrc = "assets/video.mp4",
  captionsPath,
  silencePath,
  removeSilence = false,
  showCaptions = true,
  captionPreset = "bold",
  title,
  titleDuration = 90,
  speakerName,
  speakerTitle,
  ctaText,
  ctaDuration = 90,
  backgroundMusic,
  musicVolume = 0.15,
  accentColor = "#6366f1",
}) => {
  loadDefaultFonts();

  // Null-safe: the hook returns null until silence.json loads (or when no path is given).
  const silenceData = useSilenceSegments(silencePath ?? null);

  // Turn detected speech into cut segments: pad each by 0.15s, then merge any
  // separated by < 0.3s so micro-gaps don't produce jarring extra cuts.
  const segments = silenceData
    ? mergeSegments(
        buildCutList(silenceData.speechSegments, {paddingSeconds: 0.15}),
        0.3,
      )
    : [];

  const src = staticFile(videoSrc);

  return (
    <AbsoluteFill>
      {/* Jump-cut assembly when removing silence; otherwise the untouched clip. */}
      {removeSilence && segments.length > 0 ? (
        <JumpCut src={src} segments={segments} paddingSeconds={0} />
      ) : (
        <VideoClip src={src} />
      )}

      {showCaptions && captionsPath && (
        <CaptionOverlay
          captionsSource={captionsPath}
          preset={captionPreset}
          position="bottom"
        />
      )}

      {title && (
        <Sequence from={0} durationInFrames={titleDuration}>
          <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
            <AnimatedTitle
              text={title}
              fontSize={56}
              fontWeight={800}
              color="#ffffff"
              enterAnimation="scale"
              exitAnimation="fade"
              enterDuration={20}
              holdDuration={titleDuration - 40}
              exitDuration={15}
              textShadow={`0 4px 20px ${accentColor}40`}
            />
          </AbsoluteFill>
        </Sequence>
      )}

      {/* Lower third overlaps the tail of the title (or appears early if no title). */}
      {speakerName && (
        <Sequence from={title ? titleDuration - 10 : 15} durationInFrames={150}>
          <LowerThird
            name={speakerName}
            title={speakerTitle}
            accentColor={accentColor}
            enterDuration={20}
            holdDuration={90}
            exitDuration={15}
          />
        </Sequence>
      )}

      {/* Delay the CTA so it lands ~ctaDuration frames before the end: estimate
          total frames from the kept segments (summed seconds * 30 fps) when cutting
          silence, else assume ~200 frames, then subtract the CTA's own length. */}
      {ctaText && (
        <Sequence from={0}>
          <CallToAction
            text={ctaText}
            backgroundColor={accentColor}
            enterDelay={Math.max(0, (removeSilence && segments.length > 0
              ? segments.reduce((sum, s) => sum + (s.endSeconds - s.startSeconds), 0) * 30
              : 200) - ctaDuration)}
          />
        </Sequence>
      )}

      {backgroundMusic && (
        <AudioTrack
          src={staticFile(backgroundMusic)}
          volume={musicVolume}
          fadeInDurationSeconds={2}
          fadeOutDurationSeconds={3}
          loop
        />
      )}

      <ProgressBar color={accentColor} height={3} />

      <Watermark text={BRAND.handle} corner="topRight" opacity={0.5} fontSize={14} color="#ffffff" margin={30} />
    </AbsoluteFill>
  );
};
