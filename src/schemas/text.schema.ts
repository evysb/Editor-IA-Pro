import {z} from "zod";
import {ColorSchema, AnimationStyleSchema} from "./common.schema";

/**
 * Animated headline with separate enter/hold/exit phases.
 * All three durations are in frames, not seconds.
 */
export const AnimatedTitleSchema = z.object({
  text: z.string(),
  fontSize: z.number().optional().default(64),
  fontFamily: z.string().optional(),
  fontWeight: z.number().optional().default(700),
  color: ColorSchema.optional().default("#ffffff"),
  textAlign: z.enum(["left", "center", "right"]).optional().default("center"),
  enterAnimation: AnimationStyleSchema.optional().default("fade"),
  exitAnimation: AnimationStyleSchema.optional().default("fade"),
  enterDuration: z.number().optional().default(20),
  holdDuration: z.number().optional().default(60),
  exitDuration: z.number().optional().default(15),
});

/**
 * News-style lower third (name + optional title) with enter/hold/exit phases.
 * All three durations are in frames, not seconds.
 */
export const LowerThirdSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  accentColor: ColorSchema.optional().default("#6366f1"),
  backgroundColor: ColorSchema.optional().default("rgba(0, 0, 0, 0.85)"),
  textColor: ColorSchema.optional().default("#ffffff"),
  position: z
    .enum(["bottomLeft", "bottomRight", "bottomCenter"])
    .optional()
    .default("bottomLeft"),
  enterDuration: z.number().optional().default(20),
  holdDuration: z.number().optional().default(90),
  exitDuration: z.number().optional().default(15),
});
