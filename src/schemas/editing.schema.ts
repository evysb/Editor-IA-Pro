import {z} from "zod";

/** A single time range within the source video, expressed in seconds (not frames). */
export const SegmentSchema = z.object({
  startSeconds: z.number(),
  endSeconds: z.number(),
});

/** A trimmable video clip. Trim points and timing are in seconds; volume is 0..1. */
export const VideoClipSchema = z.object({
  src: z.string(),
  trimStartSeconds: z.number().optional().default(0),
  // Omit to play through to the natural end of the source.
  trimEndSeconds: z.number().optional(),
  fit: z.enum(["cover", "contain", "fill"]).optional().default("cover"),
  volume: z.number().min(0).max(1).optional().default(1),
  playbackRate: z.number().optional().default(1),
  muted: z.boolean().optional().default(false),
});

/** Word-level caption overlay driven by a transcription JSON file. */
export const CaptionOverlaySchema = z.object({
  captionsSource: z.string(),
  preset: z.enum(["classic", "bold", "outline", "glow", "box"]).optional().default("bold"),
  position: z.enum(["top", "center", "bottom"]).optional().default("bottom"),
  fontSize: z.number().optional().default(64),
  // Color of the currently spoken word.
  highlightColor: z.string().optional().default("#39E508"),
  textColor: z.string().optional().default("#ffffff"),
  // Group consecutive tokens onto one caption page when they fall within this window (ms).
  combineTokensWithinMs: z.number().optional().default(1200),
  // Shift all caption timings by this amount (ms); useful when captions come from a longer source than the clip.
  offsetMs: z.number().optional().default(0),
});

/** Assembles a video from kept speech segments, dropping the gaps between them. */
export const JumpCutSchema = z.object({
  src: z.string(),
  segments: z.array(SegmentSchema),
  // Extra seconds kept on each side of every segment so cuts don't clip the start/end of words.
  paddingSeconds: z.number().optional().default(0.1),
  volume: z.number().optional().default(1),
  fit: z.enum(["cover", "contain", "fill"]).optional().default("cover"),
});

/** All-in-one talking-head edit: source video plus optional captions, silence removal, lower third, CTA, and music. */
export const TalkingHeadEditSchema = z.object({
  videoSrc: z.string().optional().default("assets/video.mp4"),
  captionsPath: z.string().optional(),
  silencePath: z.string().optional(),
  removeSilence: z.boolean().optional().default(false),
  showCaptions: z.boolean().optional().default(true),
  captionPreset: z.enum(["classic", "bold", "outline", "glow", "box"]).optional().default("bold"),
  title: z.string().optional(),
  speakerName: z.string().optional(),
  speakerTitle: z.string().optional(),
  ctaText: z.string().optional(),
  backgroundMusic: z.string().optional(),
  // Background music level relative to speech (0..1); kept low by default to sit under the voice.
  musicVolume: z.number().optional().default(0.15),
});

/** Extracts a single highlight clip from longer content, with optional captions. Bounds are in seconds. */
export const PodcastClipSchema = z.object({
  videoSrc: z.string().optional().default("assets/video.mp4"),
  clipStartSeconds: z.number().optional().default(0),
  clipEndSeconds: z.number().optional().default(30),
  captionsPath: z.string().optional(),
  showCaptions: z.boolean().optional().default(true),
  captionPreset: z.enum(["classic", "bold", "outline", "glow", "box"]).optional().default("bold"),
  title: z.string().optional(),
});
