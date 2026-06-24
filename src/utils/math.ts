import {interpolate, spring} from "remotion";

/** Clamp a value between min and max */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Linear interpolation between `a` and `b` by factor `t` (0 = a, 1 = b). */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/**
 * Remaps `value` from the input range to the output range. The normalized
 * position is clamped to [0, 1], so values outside the input range saturate at
 * the output bounds rather than extrapolating.
 */
export const remap = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => {
  const t = (value - inMin) / (inMax - inMin);
  return lerp(outMin, outMax, clamp(t, 0, 1));
};

/**
 * Returns opacity (0 → 1) for a fade-in starting at `startFrame` and lasting
 * `duration` frames. Clamped on both ends, so it stays at 0 before and 1 after.
 * All arguments are in frames.
 */
export const fadeIn = (
  frame: number,
  startFrame: number,
  duration: number,
): number =>
  interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/**
 * Returns opacity (1 → 0) for a fade-out starting at `startFrame` and lasting
 * `duration` frames. Clamped on both ends. All arguments are in frames.
 */
export const fadeOut = (
  frame: number,
  startFrame: number,
  duration: number,
): number =>
  interpolate(frame, [startFrame, startFrame + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/**
 * Spring-driven slide-in: returns an offset that eases from `distance` to 0
 * (apply it as a translate). The sign of `distance` picks the direction the
 * element travels from. `duration` is accepted for call-site consistency but
 * the spring's settling time is governed by its damping/stiffness config.
 *
 * @param distance Starting offset in pixels; element rests at 0.
 * @param fps      Composition frame rate, required for frame-correct spring timing.
 */
export const slideIn = (
  frame: number,
  startFrame: number,
  duration: number,
  distance: number,
  fps: number,
): number => {
  const progress = spring({
    fps,
    frame: frame - startFrame,
    config: {damping: 12, stiffness: 100},
  });
  return interpolate(progress, [0, 1], [distance, 0]);
};

/**
 * Three-phase opacity envelope: fade in over `enterDuration`, stay fully opaque
 * for `holdDuration`, then fade out over `exitDuration`. `frame` is measured
 * from the start of the element's own timeline (0 = first frame), and all
 * durations are in frames. Returns opacity in [0, 1].
 */
export const enterHoldExit = (
  frame: number,
  enterDuration: number,
  holdDuration: number,
  exitDuration: number,
): number => {
  // Exit begins once enter and hold phases have both elapsed.
  const exitStart = enterDuration + holdDuration;
  if (frame < enterDuration) {
    return interpolate(frame, [0, enterDuration], [0, 1], {
      extrapolateRight: "clamp",
    });
  }
  if (frame < exitStart) {
    return 1;
  }
  return interpolate(frame, [exitStart, exitStart + exitDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};
