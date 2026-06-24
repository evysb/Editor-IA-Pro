import React from "react";
import {useCurrentFrame, useVideoConfig, interpolate, spring} from "remotion";
import {FONT_FAMILIES, loadGoogleFont} from "../../presets/fonts";

export interface CountdownTimerProps {
  /** Frame at which the countdown hits zero; the displayed seconds derive from (startFrom - frame) / fps. */
  startFrom: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  accentColor?: string;
  showLabel?: boolean;
  label?: string;
  style?: React.CSSProperties;
}

/**
 * Large numeric countdown that displays whole seconds remaining until
 * {@link CountdownTimerProps.startFrom} and pulses on each tick. Unmounts once
 * the target frame has passed.
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  startFrom,
  fontSize = 120,
  fontFamily = FONT_FAMILIES.display,
  color = "#ffffff",
  accentColor = "#6366f1",
  showLabel = false,
  label = "Starting in",
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fontName = fontFamily.replace(/'/g, "").split(",")[0].trim();
  loadGoogleFont(fontName);

  // ceil so the count shows e.g. "3" for the whole second before it becomes "2".
  const secondsRemaining = Math.max(0, Math.ceil((startFrom - frame) / fps));

  if (frame > startFrom) return null;

  // Re-trigger the spring at every second boundary (frame % fps === 0) so the
  // number pops as it changes.
  const frameInSecond = frame % fps;
  const scale = spring({
    fps,
    frame: frameInSecond,
    config: {damping: 8, stiffness: 200},
  });

  // Map the 0 -> 1 spring to a 1.2x -> 1x settle for the per-tick pulse.
  const scaleValue = interpolate(scale, [0, 1], [1.2, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {showLabel && (
        <div
          style={{
            fontSize: fontSize * 0.25,
            fontFamily,
            fontWeight: 400,
            color: accentColor,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          fontSize,
          fontFamily,
          fontWeight: 900,
          color,
          transform: `scale(${scaleValue})`,
          textShadow: `0 0 40px ${accentColor}`,
        }}
      >
        {secondsRemaining}
      </div>
    </div>
  );
};
