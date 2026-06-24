import {AbsoluteFill, Sequence} from "remotion";
import {AnimatedTitle} from "../components/text/AnimatedTitle";
import {LowerThird} from "../components/text/LowerThird";
import {GradientBackground} from "../components/backgrounds/GradientBackground";
import {ParticleField} from "../components/backgrounds/ParticleField";
import {Watermark} from "../components/overlays/Watermark";
import {BRAND} from "../presets/brand";
import {loadDefaultFonts} from "../presets/fonts";

/**
 * Brand showcase reel built from the title/background/overlay primitives.
 * Two acts on one timeline: an intro (title, subtitle, handle staggered over
 * frames 0-150) and a closing scene (frames 160-290). The gradient, particles,
 * and watermark sit outside any Sequence so they persist for the whole clip.
 *
 * All durations below are in frames; Sequence `from` values are the staggered
 * entry points that overlap the enter/hold/exit phases of each title.
 */
export const ShowcaseComposition: React.FC = () => {
  // Fonts must be requested at render time; titles below depend on them.
  loadDefaultFonts();

  return (
    <AbsoluteFill>
      {/* Persistent backdrop: rendered first so everything layers on top. */}
      <GradientBackground
        colors={[BRAND.colors.bg, "#1a1a3e"]}
        angle={135}
        animateAngle
        animateSpeed={0.5}
      />
      <ParticleField count={30} color={`${BRAND.colors.primary}25`} speed={0.3} />

      {/* Act 1, frames 0-150: brand name, subtitle, and handle stagger in. */}
      <Sequence from={0} durationInFrames={150}>
        <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
          <AnimatedTitle
            text={BRAND.name}
            fontSize={96}
            fontWeight={800}
            color={BRAND.colors.text}
            enterAnimation="scale"
            exitAnimation="blur"
            enterDuration={25}
            holdDuration={80}
            exitDuration={20}
            textShadow={`0 4px 30px ${BRAND.colors.primary}80`}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={30} durationInFrames={120}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 100,
          }}
        >
          <AnimatedTitle
            text={BRAND.tagline}
            fontSize={36}
            fontWeight={400}
            color={BRAND.colors.muted}
            enterAnimation="slideUp"
            exitAnimation="fade"
            enterDuration={20}
            holdDuration={60}
            exitDuration={15}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={60} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 180,
          }}
        >
          <AnimatedTitle
            text={BRAND.handle}
            fontSize={28}
            fontWeight={600}
            color={BRAND.colors.primary}
            enterAnimation="fade"
            exitAnimation="fade"
            enterDuration={15}
            holdDuration={40}
            exitDuration={15}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Act 2, frames 160-290: closing line plus an overlapping lower third. */}
      <Sequence from={160} durationInFrames={130}>
        <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
          <AnimatedTitle
            text="Built with Remotion + Claude Code"
            fontSize={64}
            fontWeight={700}
            color={BRAND.colors.text}
            enterAnimation="typewriter"
            exitAnimation="slideLeft"
            enterDuration={40}
            holdDuration={50}
            exitDuration={15}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={170} durationInFrames={110}>
        <LowerThird
          name="wendymardigian-prog"
          title={BRAND.handle}
          accentColor={BRAND.colors.primary}
          enterDuration={20}
          holdDuration={60}
          exitDuration={15}
        />
      </Sequence>

      {/* Persistent overlay: outside any Sequence, so it shows for every frame. */}
      <Watermark
        text={BRAND.handle}
        corner="bottomRight"
        opacity={BRAND.watermark.opacity}
        fontSize={BRAND.watermark.fontSize}
        color={BRAND.colors.muted}
      />
    </AbsoluteFill>
  );
};
