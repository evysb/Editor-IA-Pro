import React from "react";
import {Img, useCurrentFrame, useVideoConfig, spring, interpolate} from "remotion";

export interface ImageOverlayProps {
  src: string;
  /** Absolute position (CSS left/top): a number is px, a string is any CSS unit. */
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  enterAnimation?: "fade" | "scale" | "slideUp" | "slideDown";
  exitAnimation?: "fade" | "scale" | "slideUp" | "slideDown";
  /** Enter/exit animation lengths, in frames. */
  enterDuration?: number;
  exitDuration?: number;
  /** Maximum opacity at full visibility; multiplied into the animated opacity. */
  opacity?: number;
  style?: React.CSSProperties;
}

/**
 * Absolutely-positioned image overlay with spring-based enter and
 * interpolated exit animations. The enter and exit phases are mutually
 * exclusive, gated by the clip's frame position.
 */
export const ImageOverlay: React.FC<ImageOverlayProps> = ({
  src,
  x = "auto",
  y = "auto",
  width = "auto",
  height = "auto",
  enterAnimation = "fade",
  exitAnimation = "fade",
  enterDuration = 15,
  exitDuration = 10,
  opacity = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const exitStart = durationInFrames - exitDuration;

  // Enter phase: spring drives opacity and transform for the first enterDuration frames.
  let enterOpacity = 1;
  let enterTransform = "none";
  if (frame < enterDuration) {
    const progress = spring({fps, frame, config: {damping: 14, stiffness: 120}});
    enterOpacity = interpolate(progress, [0, 1], [0, 1]);
    switch (enterAnimation) {
      case "scale":
        enterTransform = `scale(${interpolate(progress, [0, 1], [0.5, 1])})`;
        break;
      case "slideUp":
        enterTransform = `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`;
        break;
      case "slideDown":
        enterTransform = `translateY(${interpolate(progress, [0, 1], [-40, 0])}px)`;
        break;
    }
  }

  // Exit phase: linear 0→1 progress over the trailing exitDuration frames.
  let exitOpacity = 1;
  let exitTransform = "none";
  if (frame >= exitStart && exitDuration > 0) {
    const progress = interpolate(frame, [exitStart, exitStart + exitDuration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    exitOpacity = 1 - progress;
    switch (exitAnimation) {
      case "scale":
        exitTransform = `scale(${interpolate(progress, [0, 1], [1, 0.5])})`;
        break;
      case "slideUp":
        exitTransform = `translateY(${interpolate(progress, [0, 1], [0, -40])}px)`;
        break;
      case "slideDown":
        exitTransform = `translateY(${interpolate(progress, [0, 1], [0, 40])}px)`;
        break;
    }
  }

  // Once exiting, the exit values win; otherwise the enter values apply.
  const isExiting = frame >= exitStart && exitDuration > 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: (isExiting ? exitOpacity : enterOpacity) * opacity,
        transform: isExiting ? exitTransform : enterTransform,
        ...style,
      }}
    >
      <Img
        src={src}
        style={{
          width,
          height,
          objectFit: "contain",
        }}
      />
    </div>
  );
};
