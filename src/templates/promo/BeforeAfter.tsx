import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from "remotion";
import {loadDefaultFonts} from "../../presets/fonts";

/**
 * Props for the {@link BeforeAfter} template. `children` is a fixed two-element
 * tuple: index 0 is the "before" content, index 1 is the "after" content. The
 * color/label fields style the corner badges.
 */
export interface BeforeAfterProps {
  beforeLabel?: string;
  afterLabel?: string;
  beforeColor?: string;
  afterColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  children: [React.ReactNode, React.ReactNode];
}

/**
 * Side-by-side comparison template (1920x1080) that reveals the "after" content
 * with a vertical wipe sweeping right-to-left across the midpoint of the
 * composition. Both layers fill the frame and are masked via complementary
 * clip-paths driven by the same wipe progress, so the divider line tracks the
 * exact seam between them.
 */
export const BeforeAfter: React.FC<BeforeAfterProps> = ({
  beforeLabel = "Before",
  afterLabel = "After",
  beforeColor = "#ef4444",
  afterColor = "#10b981",
  backgroundColor = "#0a0a0a",
  accentColor = "#ffffff",
  children,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  loadDefaultFonts();

  // Drive the wipe over a 30-frame window centered on the composition midpoint;
  // clamp so the result holds at 0 before and 100 after (0..100 = percent wiped).
  const midpoint = Math.floor(durationInFrames / 2);
  const wipeProgress = interpolate(
    frame,
    [midpoint - 15, midpoint + 15],
    [0, 100],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  return (
    <AbsoluteFill style={{backgroundColor}}>
      <AbsoluteFill
        style={{
          clipPath: `inset(0 ${wipeProgress}% 0 0)`,
        }}
      >
        {children[0]}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            backgroundColor: beforeColor,
            color: accentColor,
            padding: "8px 20px",
            borderRadius: 8,
            fontSize: 20,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {beforeLabel}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          clipPath: `inset(0 0 0 ${100 - wipeProgress}%)`,
        }}
      >
        {children[1]}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            backgroundColor: afterColor,
            color: accentColor,
            padding: "8px 20px",
            borderRadius: 8,
            fontSize: 20,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {afterLabel}
        </div>
      </AbsoluteFill>

      {/* Render the seam line only mid-wipe; hidden once fully before/after. */}
      {wipeProgress > 0 && wipeProgress < 100 && (
        <div
          style={{
            position: "absolute",
            left: `${100 - wipeProgress}%`,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: accentColor,
            boxShadow: "0 0 20px rgba(255,255,255,0.5)",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
