import {fade} from "@remotion/transitions/fade";
import {slide} from "@remotion/transitions/slide";
import {wipe} from "@remotion/transitions/wipe";
import {clockWipe} from "@remotion/transitions/clock-wipe";
import {none} from "@remotion/transitions/none";
import {springTiming, linearTiming} from "@remotion/transitions";

/**
 * Ready-to-spread transition configs for `<TransitionSeries.Transition>`.
 * Each entry pairs a presentation (the visual effect) with a timing function;
 * durations are in frames. Spread a preset directly, e.g.
 * `<TransitionSeries.Transition {...TRANSITION_PRESETS.crossfade} />`.
 */
export const TRANSITION_PRESETS = {
  crossfade: {
    presentation: fade(),
    // High damping yields a near-linear, overshoot-free fade.
    timing: springTiming({config: {damping: 200}, durationInFrames: 30}),
  },
  fadeQuick: {
    presentation: fade(),
    timing: linearTiming({durationInFrames: 15}),
  },
  fadeSlow: {
    presentation: fade(),
    timing: linearTiming({durationInFrames: 45}),
  },
  slideLeft: {
    presentation: slide({direction: "from-left"}),
    // Low damping gives slides a slight bounce on arrival.
    timing: springTiming({config: {damping: 14, stiffness: 100}, durationInFrames: 30}),
  },
  slideRight: {
    presentation: slide({direction: "from-right"}),
    timing: springTiming({config: {damping: 14, stiffness: 100}, durationInFrames: 30}),
  },
  slideUp: {
    presentation: slide({direction: "from-top"}),
    timing: springTiming({config: {damping: 14, stiffness: 100}, durationInFrames: 30}),
  },
  slideDown: {
    presentation: slide({direction: "from-bottom"}),
    timing: springTiming({config: {damping: 14, stiffness: 100}, durationInFrames: 30}),
  },
  wipeLeft: {
    presentation: wipe({direction: "from-left"}),
    timing: linearTiming({durationInFrames: 30}),
  },
  wipeRight: {
    presentation: wipe({direction: "from-right"}),
    timing: linearTiming({durationInFrames: 30}),
  },
  clockwise: {
    // clockWipe needs the composition size to size its sweep; tuned for 1080p.
    presentation: clockWipe({width: 1920, height: 1080}),
    timing: linearTiming({durationInFrames: 30}),
  },
  cut: {
    // Instant hard cut: no presentation, zero-frame timing.
    presentation: none(),
    timing: linearTiming({durationInFrames: 0}),
  },
} as const;

/** Union of valid preset names (e.g. "crossfade" | "slideLeft" | ...). */
export type TransitionPresetKey = keyof typeof TRANSITION_PRESETS;
