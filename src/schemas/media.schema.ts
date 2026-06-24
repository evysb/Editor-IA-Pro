import {z} from "zod";

/** A video sized to the frame via object-fit. Volume is 0..1. */
export const FitVideoSchema = z.object({
  src: z.string(),
  fit: z.enum(["cover", "contain", "fill"]).optional().default("cover"),
  volume: z.number().min(0).max(1).optional().default(1),
  playbackRate: z.number().optional().default(1),
  muted: z.boolean().optional().default(false),
});

/** A still image sized to the frame, with an optional Ken Burns pan/zoom move. */
export const FitImageSchema = z.object({
  src: z.string(),
  fit: z.enum(["cover", "contain", "fill"]).optional().default("cover"),
  // Ken Burns motion direction; omit for a static image.
  kenBurns: z
    .enum(["zoomIn", "zoomOut", "panLeft", "panRight", "panUp", "panDown"])
    .optional(),
  // Fraction of the frame traversed/zoomed over the clip (0.1 = a subtle 10% move).
  kenBurnsIntensity: z.number().optional().default(0.1),
});

/** Crossfading image slideshow with optional Ken Burns on each slide. */
export const SlideshowSchema = z.object({
  images: z.array(z.string()),
  // Length of the crossfade between slides, in frames.
  transitionDuration: z.number().optional().default(15),
  fit: z.enum(["cover", "contain"]).optional().default("cover"),
  kenBurns: z.boolean().optional().default(true),
});
