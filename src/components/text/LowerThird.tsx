import React from "react";
import {useCurrentFrame, useVideoConfig, interpolate, spring} from "remotion";
import {FONT_FAMILIES, loadGoogleFont} from "../../presets/fonts";

export interface LowerThirdProps {
  name: string;
  title?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  position?: "bottomLeft" | "bottomRight" | "bottomCenter";
  /** Length of the enter phase, in frames. */
  enterDuration?: number;
  /** Length of the fully-visible hold phase, in frames. */
  holdDuration?: number;
  /** Length of the exit phase, in frames. */
  exitDuration?: number;
  style?: React.CSSProperties;
}

/**
 * News-style lower third (name + optional title) that slides in from the left
 * on a spring, holds, then slides back out. Phase lengths are in frames; the
 * component unmounts once the full timeline has elapsed.
 */
export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  title,
  accentColor = "#6366f1",
  backgroundColor = "rgba(0, 0, 0, 0.85)",
  textColor = "#ffffff",
  fontFamily = FONT_FAMILIES.heading,
  position = "bottomLeft",
  enterDuration = 20,
  holdDuration = 90,
  exitDuration = 15,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fontName = fontFamily.replace(/'/g, "").split(",")[0].trim();
  loadGoogleFont(fontName);

  const totalDuration = enterDuration + holdDuration + exitDuration;
  const exitStart = enterDuration + holdDuration;

  if (frame > totalDuration) return null;

  // Clamp the spring's frame to enterDuration so it settles at rest (1) and
  // stays there through the hold phase.
  const enterProgress = spring({
    fps,
    frame: Math.min(frame, enterDuration),
    config: {damping: 14, stiffness: 120},
  });

  // 0 until the exit phase begins, then ramps 0 -> 1 across exitDuration.
  const exitProgress =
    frame >= exitStart
      ? interpolate(frame, [exitStart, exitStart + exitDuration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // Before exitStart the spring drives the slide-in; after, exitProgress drives
  // the slide-out. translateX is a percentage of the element's own width.
  const translateX = frame < exitStart
    ? interpolate(enterProgress, [0, 1], [-100, 0])
    : interpolate(exitProgress, [0, 1], [0, -100]);

  const opacity = frame < exitStart
    ? interpolate(enterProgress, [0, 1], [0, 1])
    : 1 - exitProgress;

  const positionStyles: React.CSSProperties = {
    bottomLeft: {bottom: 80, left: 60},
    bottomRight: {bottom: 80, right: 60},
    bottomCenter: {bottom: 80, left: "50%", transform: "translateX(-50%)"},
  }[position];

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyles,
        opacity,
        transform: position === "bottomCenter"
          ? `translateX(calc(-50% + ${translateX}%))`
          : `translateX(${translateX}%)`,
        ...style,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: accentColor,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          backgroundColor,
          padding: "16px 28px 16px 20px",
          marginLeft: 4,
          borderRadius: "0 6px 6px 0",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontFamily,
            fontWeight: 700,
            color: textColor,
            lineHeight: 1.2,
          }}
        >
          {name}
        </div>
        {title && (
          <div
            style={{
              fontSize: 18,
              fontFamily,
              fontWeight: 400,
              color: accentColor,
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
        )}
      </div>
    </div>
  );
};
