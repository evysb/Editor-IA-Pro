import React from "react";
import {AbsoluteFill, Sequence} from "remotion";
import {AnimatedTitle} from "../../components/text/AnimatedTitle";
import {GradientBackground} from "../../components/backgrounds/GradientBackground";
import {ParticleField} from "../../components/backgrounds/ParticleField";
import {SafeArea} from "../../components/layout/SafeArea";
import {Watermark} from "../../components/overlays/Watermark";
import {loadDefaultFonts} from "../../presets/fonts";
import {BRAND} from "../../presets/brand";

export interface YouTubeShortProps {
  title?: string;
  /** Optional second line; rendered only when provided, below the title. */
  subtitle?: string;
  backgroundColors?: string[];
  /** Tints the title's text shadow. */
  accentColor?: string;
}

/**
 * Ready-made 1080x1920 YouTube Short title card: gradient backdrop with floating
 * particles, an entering title, and an optional subtitle.
 *
 * Note: YouTube Shorts run at 60fps. Title/subtitle use holdDuration={999} and
 * exitDuration={0} so they enter once and stay on screen for the entire composition
 * rather than animating out — this card is meant to sit under other content.
 */
export const YouTubeShort: React.FC<YouTubeShortProps> = ({
  title = "Your Title Here",
  subtitle,
  backgroundColors = ["#0c1222", "#162032"],
  accentColor = "#ef4444",
}) => {
  loadDefaultFonts();

  return (
    <AbsoluteFill>
      <GradientBackground colors={backgroundColors} angle={180} />
      <ParticleField count={30} color="rgba(255,255,255,0.1)" speed={0.5} />

      <SafeArea paddingHorizontal={60} paddingVertical={200}>
        <Sequence from={0}>
          <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
            <AnimatedTitle
              text={title}
              fontSize={60}
              fontWeight={900}
              color="#ffffff"
              enterAnimation="scale"
              enterDuration={20}
              holdDuration={999}
              exitDuration={0}
              textShadow={`0 4px 20px ${accentColor}50`}
            />
            {subtitle && (
              <div style={{marginTop: 20}}>
                <AnimatedTitle
                  text={subtitle}
                  fontSize={30}
                  fontWeight={400}
                  color="rgba(255,255,255,0.7)"
                  enterAnimation="slideUp"
                  enterDuration={25}
                  holdDuration={999}
                  exitDuration={0}
                />
              </div>
            )}
          </AbsoluteFill>
        </Sequence>
      </SafeArea>

      <Watermark text={BRAND.handle} corner="topRight" opacity={0.5} fontSize={14} color="#ffffff" margin={40} />
    </AbsoluteFill>
  );
};
