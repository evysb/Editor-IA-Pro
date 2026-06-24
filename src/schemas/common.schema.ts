import {z} from "zod";

/** Any CSS color string (hex, rgb/rgba, hsl, named). Not validated beyond being a string. */
export const ColorSchema = z.string().describe("CSS color value");

/** Enter/exit animation styles shared across text and overlay components. */
export const AnimationStyleSchema = z.enum([
  "fade",
  "slideUp",
  "slideDown",
  "slideLeft",
  "slideRight",
  "scale",
  "typewriter",
  "blur",
]);

/** Corner/center anchor used to place overlays within the frame. */
export const PositionSchema = z.enum([
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
  "center",
]);

/** Target social platform; drives canvas dimensions, fps, and safe-area defaults. */
export const PlatformSchema = z.enum([
  "tiktok",
  "instagram_reel",
  "instagram_post",
  "instagram_story",
  "youtube",
  "youtube_short",
  "twitter",
  "linkedin",
  "facebook",
]);

/** Named color palette selecting a coordinated set of background/text/accent colors. */
export const PaletteSchema = z.enum([
  "dark",
  "light",
  "vibrant",
  "warm",
  "cool",
  "neon",
]);
