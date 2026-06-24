import {useCurrentFrame, useVideoConfig, interpolate, spring} from "remotion";

/** All durations are in frames. `type` controls the enter curve only. */
interface UseAnimationOptions {
  enterDuration?: number;
  holdDuration?: number;
  exitDuration?: number;
  type?: "spring" | "linear";
}

/** Per-frame animation state. Phase flags are mutually exclusive while visible. */
interface AnimationValues {
  opacity: number;
  enterProgress: number;
  exitProgress: number;
  isEntering: boolean;
  isHolding: boolean;
  isExiting: boolean;
  isVisible: boolean;
}

/**
 * Drives a three-phase enter/hold/exit animation off the current frame.
 *
 * Phases run back-to-back starting at frame 0: enter, then hold, then exit.
 * Returns opacity plus phase flags and progress (0..1) so components can map
 * them to transforms. Durations are in frames; `type` only affects the enter
 * curve (spring vs linear ease).
 */
export const useAnimation = ({
  enterDuration = 20,
  holdDuration = 60,
  exitDuration = 15,
  type = "spring",
}: UseAnimationOptions = {}): AnimationValues => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const exitStart = enterDuration + holdDuration;
  const totalDuration = exitStart + exitDuration;

  const isEntering = frame < enterDuration;
  const isExiting = frame >= exitStart && frame <= totalDuration;
  const isHolding = frame >= enterDuration && frame < exitStart;
  const isVisible = frame <= totalDuration;

  let enterProgress: number;
  if (type === "spring") {
    enterProgress = spring({
      fps,
      // Clamp the input frame so the spring settles and holds once the enter
      // phase ends, instead of continuing to evolve during hold/exit.
      frame: Math.min(frame, enterDuration),
      config: {damping: 14, stiffness: 120},
    });
  } else {
    enterProgress = interpolate(frame, [0, enterDuration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  const exitProgress = isExiting
    ? interpolate(frame, [exitStart, totalDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Exit fade-out takes precedence; otherwise fade in (spring can overshoot 1,
  // so clamp the enter value).
  const opacity = isExiting ? 1 - exitProgress : Math.min(enterProgress, 1);

  return {
    opacity,
    enterProgress,
    exitProgress,
    isEntering,
    isHolding,
    isExiting,
    isVisible,
  };
};
