/**
 * Canonical render dimensions and frame rate per target platform. Use these to
 * configure a Composition so output matches each platform's native spec.
 * Note: YouTube Short runs at 60fps while every other preset is 30fps.
 */
export const PLATFORMS = {
  tiktok: {width: 1080, height: 1920, fps: 30, name: "TikTok"},
  instagram_reel: {width: 1080, height: 1920, fps: 30, name: "Instagram Reel"},
  instagram_post: {width: 1080, height: 1080, fps: 30, name: "Instagram Post"},
  instagram_story: {width: 1080, height: 1920, fps: 30, name: "Instagram Story"},
  youtube: {width: 1920, height: 1080, fps: 30, name: "YouTube"},
  youtube_short: {width: 1080, height: 1920, fps: 60, name: "YouTube Short"},
  twitter: {width: 1080, height: 1080, fps: 30, name: "Twitter/X"},
  linkedin: {width: 1920, height: 1080, fps: 30, name: "LinkedIn"},
  facebook: {width: 1080, height: 1080, fps: 30, name: "Facebook"},
} as const;

export type PlatformKey = keyof typeof PLATFORMS;

/** Generic resolution presets by shape, for compositions not tied to one platform. */
export const ASPECT_RATIOS = {
  landscape: {width: 1920, height: 1080},
  portrait: {width: 1080, height: 1920},
  square: {width: 1080, height: 1080},
  cinematic: {width: 1920, height: 800},
  ultrawide: {width: 2560, height: 1080},
} as const;

/** Convert a duration in seconds to a whole frame count (rounded) at the given fps. */
export const secondsToFrames = (seconds: number, fps: number): number =>
  Math.round(seconds * fps);

/** Convert a frame count back to seconds at the given fps. */
export const framesToSeconds = (frames: number, fps: number): number =>
  frames / fps;
