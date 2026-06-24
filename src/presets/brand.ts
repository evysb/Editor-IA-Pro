/**
 * Brand identity and visual defaults shared across every composition.
 * Centralizes the name, social handle, color palette, and watermark so a
 * single edit here re-skins all templates and overlays consistently.
 */
export const BRAND = {
  name: "Claude Editor Pro",
  handle: "@wendymardigian-prog",
  tagline: "AI-Powered Video Editing",
  colors: {
    primary: "#8b5cf6",
    secondary: "#6366f1",
    bg: "#0a0a0a",
    text: "#ffffff",
    muted: "#a0a0a0",
  },
  watermark: {
    text: "@wendymardigian-prog",
    opacity: 0.6,
    fontSize: 16,
  },
} as const;
