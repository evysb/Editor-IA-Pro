import React from "react";
import {useCurrentFrame} from "remotion";
import {FONT_FAMILIES, loadGoogleFont} from "../../presets/fonts";

export interface TypewriterTextProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  cursorColor?: string;
  showCursor?: boolean;
  /** Frames per character — higher is slower. */
  typingSpeed?: number;
  /** Frames to wait before typing begins. */
  startDelay?: number;
  style?: React.CSSProperties;
}

/**
 * Reveals text one character at a time, driven by the current frame, with an
 * optional blinking cursor. The cursor blinks while typing (and before typing
 * starts) and disappears once the full text is shown.
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  fontSize = 48,
  fontFamily = FONT_FAMILIES.mono,
  fontWeight = 400,
  color = "#ffffff",
  cursorColor = "#6366f1",
  showCursor = true,
  typingSpeed = 2,
  startDelay = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  const fontName = fontFamily.replace(/'/g, "").split(",")[0].trim();
  loadGoogleFont(fontName);

  // Frames elapsed since typing should start; stays 0 throughout the delay.
  const adjustedFrame = Math.max(0, frame - startDelay);
  const charsToShow = Math.min(
    Math.floor(adjustedFrame / typingSpeed),
    text.length,
  );
  const displayText = text.slice(0, charsToShow);
  const isTyping = charsToShow < text.length && adjustedFrame > 0;

  // Square-wave blink toggling every 8 frames; only visible while typing or
  // waiting to start, so a fully-typed line ends without a trailing cursor.
  const cursorOpacity =
    showCursor && (isTyping || adjustedFrame === 0)
      ? Math.round(frame / 8) % 2 === 0
        ? 1
        : 0
      : 0;

  return (
    <div
      style={{
        fontSize,
        fontFamily,
        fontWeight,
        color,
        whiteSpace: "pre-wrap",
        ...style,
      }}
    >
      {displayText}
      {showCursor && (
        <span
          style={{
            color: cursorColor,
            opacity: cursorOpacity,
            fontWeight: 100,
          }}
        >
          |
        </span>
      )}
    </div>
  );
};
