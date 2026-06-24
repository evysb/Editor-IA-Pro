/**
 * Configuration and key material for the invisible (forensic) watermark.
 *
 * The watermark is an additive spread-spectrum pattern: the frame is divided
 * into a BLOCKS_X x BLOCKS_Y grid and each block is nudged up or down in
 * luminance by a tiny amount according to a deterministic ±1 pattern derived
 * from {@link WATERMARK_KEY}. The shift is far below the threshold of casual
 * perception, but because the same pattern is added to every frame, a detector
 * can average many frames to cancel the moving content and recover the pattern
 * by correlation (see scripts/detect-watermark.ts).
 *
 * SECURITY NOTE: this file lives in a public repository, so the key below is
 * visible to everyone. That is fine for *proving* a clip came from this tool,
 * but anyone who reads the code can regenerate and subtract the pattern. For a
 * watermark an adversary cannot reconstruct, replace WATERMARK_KEY with a
 * private value you do NOT publish (e.g. inject it at build time) and keep the
 * detector's copy in sync.
 */

/** Horizontal block count of the watermark grid. More blocks = more detector samples. */
export const WATERMARK_BLOCKS_X = 48;
/** Vertical block count of the watermark grid. */
export const WATERMARK_BLOCKS_Y = 27;

/**
 * Default per-block luminance modulation, expressed as an alpha (0..1) of a
 * black/white overlay. ~0.02 keeps the pattern imperceptible on typical
 * content while still surviving H.264 re-encoding. Raise for more robustness
 * at the cost of faint visibility on flat/gradient areas.
 */
export const WATERMARK_STRENGTH = 0.02;

/** Seed that determines the pattern. Keep secret for true forensic strength (see file note). */
export const WATERMARK_KEY = "claude-editor-pro:wendymardigian-prog:v1";

/** Human-readable provenance string recorded alongside the signature. */
export const WATERMARK_PAYLOAD = "Claude Editor Pro — wendymardigian-prog";

/** Hash a string into a 32-bit seed (xmur3) for the PRNG below. */
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** Small, fast, fully deterministic PRNG (mulberry32) so the render and detector agree. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build the deterministic ±1 spread-spectrum pattern keyed by {@link WATERMARK_KEY}.
 * Row-major, length BLOCKS_X * BLOCKS_Y. The pattern is zero-mean (so it does
 * not correlate with real image content) and identical on the render and
 * detection sides, which is what makes correlation-based recovery possible.
 */
export function watermarkPattern(): Int8Array {
  const seedFn = xmur3(WATERMARK_KEY);
  const rand = mulberry32(seedFn());
  const count = WATERMARK_BLOCKS_X * WATERMARK_BLOCKS_Y;
  const pattern = new Int8Array(count);
  for (let i = 0; i < count; i++) {
    pattern[i] = rand() < 0.5 ? -1 : 1;
  }
  return pattern;
}
