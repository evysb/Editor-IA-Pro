import React from "react";
import {AbsoluteFill} from "remotion";
import {BeforeAfter} from "../templates/promo/BeforeAfter";
import {GradientBackground} from "../components/backgrounds/GradientBackground";
import {AnimatedTitle} from "../components/text/AnimatedTitle";

/**
 * Demo for the BeforeAfter template: a red "old way" scene revealed into a
 * green "new way" scene by the template's wipe. The two children are the
 * before/after halves; the wipe — not the titles — drives the reveal, so each
 * title fades in once (holdDuration 999, exitDuration 0) and then stays put.
 */
export const BeforeAfterDemo: React.FC = () => {
  return (
    <BeforeAfter beforeLabel="Before" afterLabel="After">
      <AbsoluteFill style={{backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center"}}>
        <AnimatedTitle text="The Old Way" fontSize={56} color="#ef4444" enterAnimation="fade" enterDuration={15} holdDuration={999} exitDuration={0} />
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <GradientBackground colors={["#0f0f23", "#1a1a3e"]} />
        <AnimatedTitle text="The New Way" fontSize={56} color="#10b981" enterAnimation="fade" enterDuration={15} holdDuration={999} exitDuration={0} />
      </AbsoluteFill>
    </BeforeAfter>
  );
};
