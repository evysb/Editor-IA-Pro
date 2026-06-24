import React from "react";
import {AbsoluteFill, Sequence, Img} from "remotion";
import {AnimatedTitle} from "../../components/text/AnimatedTitle";
import {GradientBackground} from "../../components/backgrounds/GradientBackground";
import {SafeArea} from "../../components/layout/SafeArea";
import {loadDefaultFonts, FONT_FAMILIES} from "../../presets/fonts";
import {Watermark} from "../../components/overlays/Watermark";
import {BRAND} from "../../presets/brand";

export interface TestimonialProps {
  quote?: string;
  author?: string;
  role?: string;
  /** Optional avatar image URL; the avatar block is omitted when unset. */
  avatarSrc?: string;
  /** Gradient stops for the background, passed through to GradientBackground. */
  backgroundColors?: string[];
  accentColor?: string;
}

/**
 * Centered customer-quote card (1920x1080). The quote mark, quote text, and
 * author block fade in as a staggered sequence to draw the eye top-to-bottom.
 */
export const Testimonial: React.FC<TestimonialProps> = ({
  quote = "Your testimonial quote here.",
  author = "Author Name",
  role,
  avatarSrc,
  backgroundColors = ["#0a0a0a", "#1a1a2e"],
  accentColor = "#8b5cf6",
}) => {
  loadDefaultFonts();

  return (
    <AbsoluteFill>
      <GradientBackground colors={backgroundColors} angle={135} />

      <SafeArea>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 120px",
          }}
        >
          {/* Decorative opening quote mark; appears first (frame 0). */}
          <Sequence from={0}>
            <div
              style={{
                fontSize: 120,
                color: accentColor,
                fontFamily: FONT_FAMILIES.elegant,
                opacity: 0.3,
                lineHeight: 0.8,
                marginBottom: -20,
              }}
            >
              &ldquo;
            </div>
          </Sequence>

          {/* Quote fades in 10f later. Hold is effectively infinite (999f) with no exit so it stays for any composition length. */}
          <Sequence from={10}>
            <AnimatedTitle
              text={quote}
              fontSize={36}
              fontWeight={400}
              fontFamily={FONT_FAMILIES.elegant}
              color="#ffffff"
              enterAnimation="fade"
              enterDuration={30}
              holdDuration={999}
              exitDuration={0}
              lineHeight={1.6}
            />
          </Sequence>

          {/* Author block enters last (frame 40), after the quote has settled. */}
          <Sequence from={40}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 40,
                gap: 16,
              }}
            >
              {avatarSrc && (
                <Img
                  src={avatarSrc}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    objectFit: "cover",
                    border: `2px solid ${accentColor}`,
                  }}
                />
              )}
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#ffffff",
                    fontFamily: FONT_FAMILIES.heading,
                  }}
                >
                  {author}
                </div>
                {role && (
                  <div
                    style={{
                      fontSize: 16,
                      color: accentColor,
                      fontFamily: FONT_FAMILIES.heading,
                      marginTop: 2,
                    }}
                  >
                    {role}
                  </div>
                )}
              </div>
            </div>
          </Sequence>
        </AbsoluteFill>
      </SafeArea>

      <Watermark text={BRAND.handle} corner="bottomRight" opacity={0.4} fontSize={14} color="#ffffff" />
    </AbsoluteFill>
  );
};
