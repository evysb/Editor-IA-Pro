/** CSS font-family stacks keyed by role, ready to drop into a `fontFamily` style. */
export const FONT_FAMILIES = {
  heading: "'Inter', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
  display: "'Poppins', sans-serif",
  elegant: "'Playfair Display', serif",
} as const;

export type FontFamilyKey = keyof typeof FONT_FAMILIES;

// Tracks families already injected so repeated calls don't add duplicate <link> tags.
const loadedFonts = new Set<string>();

/**
 * Inject a Google Fonts stylesheet <link> for the given family.
 * @param weights Semicolon-separated CSS font weights to request (Google Fonts
 *   css2 syntax); defaults to the full 400-900 range.
 * No-op during server-side rendering (no `document`) and on a family already loaded.
 */
export const loadGoogleFont = (fontFamily: string, weights = "400;500;600;700;800;900") => {
  if (typeof document === "undefined") return;
  if (loadedFonts.has(fontFamily)) return;

  // Google Fonts css2 expects spaces in family names encoded as "+".
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@${weights}&display=swap`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
  loadedFonts.add(fontFamily);
};

/** Preload every family referenced by FONT_FAMILIES; call once per composition. */
export const loadDefaultFonts = () => {
  loadGoogleFont("Inter");
  loadGoogleFont("Poppins");
  loadGoogleFont("Playfair Display");
  loadGoogleFont("JetBrains Mono", "400;500;700");
};
