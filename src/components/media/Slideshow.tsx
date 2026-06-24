import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

export interface SlideshowProps {
  images: string[];
  /** Crossfade length between slides, in frames. */
  transitionDuration?: number;
  fit?: "cover" | "contain";
  kenBurns?: boolean;
  style?: React.CSSProperties;
}

/**
 * Crossfading image slideshow that divides the composition duration evenly
 * across all images. Each slide overlaps the next by transitionDuration frames
 * and fades in over that window to produce the crossfade.
 */
export const Slideshow: React.FC<SlideshowProps> = ({
  images,
  transitionDuration = 15,
  fit = "cover",
  kenBurns = true,
  style,
}) => {
  const {durationInFrames} = useVideoConfig();

  if (images.length === 0) return null;

  const slideDuration = Math.floor(durationInFrames / images.length);

  return (
    <AbsoluteFill style={style}>
      {images.map((src, i) => {
        const from = i * slideDuration;
        // Non-final slides run one transition longer so they overlap the next
        // slide; the last slide just fills whatever frames remain.
        const duration = i === images.length - 1
          ? durationInFrames - from
          : slideDuration + transitionDuration;

        return (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <SlideImage
              src={src}
              fit={fit}
              kenBurns={kenBurns}
              index={i}
              slideDuration={slideDuration}
              transitionDuration={transitionDuration}
              isLast={i === images.length - 1}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

interface SlideImageProps {
  src: string;
  fit: "cover" | "contain";
  kenBurns: boolean;
  index: number;
  slideDuration: number;
  transitionDuration: number;
  isLast: boolean;
}

/** A single slide: handles its own crossfade-in and optional Ken Burns zoom. */
const SlideImage: React.FC<SlideImageProps> = ({
  src,
  fit,
  kenBurns,
  index,
  slideDuration,
  transitionDuration,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // Crossfade-in over the transition window. `frame` is local to this slide's
  // Sequence, so 0 is the moment this slide first appears.
  const fadeInOpacity = interpolate(frame, [0, transitionDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle Ken Burns zoom (up to 8%) spanning this slide's own duration.
  const kbProgress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = kenBurns ? 1 + kbProgress * 0.08 : 1;

  return (
    // First slide starts fully opaque (nothing to fade over); later slides
    // fade in to crossfade with the slide beneath them.
    <AbsoluteFill style={{opacity: index === 0 ? 1 : fadeInOpacity}}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};
