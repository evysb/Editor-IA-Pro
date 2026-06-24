#!/usr/bin/env npx tsx
/**
 * Detect the invisible forensic watermark in a rendered video (or a folder of
 * frame images) and report whether it was produced by this tool.
 *
 * Usage:
 *   npx tsx scripts/detect-watermark.ts out/video.mp4
 *   npx tsx scripts/detect-watermark.ts path/to/frames-dir
 *
 * How it works: the watermark adds a fixed, key-derived ±1 luminance pattern to
 * every frame (see src/presets/watermark.ts). We downscale each frame to the
 * watermark's block grid, average the blocks over all frames to cancel the
 * moving content, remove smooth gradients with a row/column model, then
 * correlate the residual with the expected pattern. A high z-score means the
 * pattern is present. A wrong-key pattern is correlated too as a control — it
 * should score near zero.
 */
import {execFileSync} from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import sharp from "sharp";
import {
  WATERMARK_BLOCKS_X,
  WATERMARK_BLOCKS_Y,
  WATERMARK_PAYLOAD,
  watermarkPattern,
} from "../src/presets/watermark";

const BX = WATERMARK_BLOCKS_X;
const BY = WATERMARK_BLOCKS_Y;
const N = BX * BY;
const MAX_FRAMES = 600;
const DETECT_THRESHOLD = 5; // z-score; under the null hypothesis z ~ N(0,1)

/** Decode an image file into a BX*BY grayscale block grid (0..255), stretched to fill. */
async function readBlocks(file: string): Promise<Float64Array> {
  const {data} = await sharp(file)
    .greyscale()
    .resize(BX, BY, {fit: "fill", kernel: "cubic"})
    .raw()
    .toBuffer({resolveWithObject: true});
  const out = new Float64Array(N);
  for (let i = 0; i < N; i++) out[i] = data[i];
  return out;
}

/** Average the block grids of many frames into one mean grid. */
async function meanGrid(files: string[]): Promise<Float64Array> {
  const acc = new Float64Array(N);
  for (const f of files) {
    const g = await readBlocks(f);
    for (let i = 0; i < N; i++) acc[i] += g[i];
  }
  for (let i = 0; i < N; i++) acc[i] /= files.length;
  return acc;
}

/**
 * Remove image content from the mean grid: subtract the additive row/column
 * model (which absorbs smooth gradients and global brightness), leaving mostly
 * the high-frequency watermark pattern.
 */
function detrend(M: Float64Array): Float64Array {
  const rowMean = new Float64Array(BY);
  const colMean = new Float64Array(BX);
  let global = 0;
  for (let y = 0; y < BY; y++) {
    for (let x = 0; x < BX; x++) {
      const v = M[y * BX + x];
      rowMean[y] += v;
      colMean[x] += v;
      global += v;
    }
  }
  for (let y = 0; y < BY; y++) rowMean[y] /= BX;
  for (let x = 0; x < BX; x++) colMean[x] /= BY;
  global /= N;
  const R = new Float64Array(N);
  for (let y = 0; y < BY; y++) {
    for (let x = 0; x < BX; x++) {
      R[y * BX + x] = M[y * BX + x] - rowMean[y] - colMean[x] + global;
    }
  }
  return R;
}

/** Detection z-score of residual R against a ±1 pattern. Under the null, z ~ N(0,1). */
function correlate(R: Float64Array, pattern: Int8Array): {z: number; rho: number} {
  let dot = 0;
  let energy = 0;
  for (let i = 0; i < N; i++) {
    dot += R[i] * pattern[i];
    energy += R[i] * R[i];
  }
  if (energy === 0) return {z: 0, rho: 0};
  return {z: dot / Math.sqrt(energy), rho: dot / Math.sqrt(energy * N)};
}

/** A different-key ±1 pattern, used as a negative control. */
function wrongPattern(): Int8Array {
  const p = new Int8Array(N);
  let h = 0x12345678;
  for (let i = 0; i < N; i++) {
    h = (Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) + i) | 0;
    p[i] = (h & 1) === 0 ? -1 : 1;
  }
  return p;
}

/** Evenly sample at most MAX_FRAMES paths from the list. */
function sample(files: string[]): string[] {
  if (files.length <= MAX_FRAMES) return files;
  const step = files.length / MAX_FRAMES;
  return Array.from({length: MAX_FRAMES}, (_, i) => files[Math.floor(i * step)]);
}

async function main() {
  const input = process.argv[2];
  if (!input || !fs.existsSync(input)) {
    console.error("Usage: npx tsx scripts/detect-watermark.ts <video.mp4 | frames-dir>");
    process.exit(1);
  }

  let frameDir: string;
  let cleanup = false;
  if (fs.statSync(input).isDirectory()) {
    frameDir = input;
  } else {
    // Extract frames straight into the watermark grid size, grayscale, using the
    // ffmpeg that ships with Remotion (same as the other pipeline scripts).
    frameDir = fs.mkdtempSync(path.join(os.tmpdir(), "wm-detect-"));
    cleanup = true;
    console.log("Extracting frames...");
    execFileSync(
      "npx",
      [
        "remotion",
        "ffmpeg",
        "-y",
        "-i",
        input,
        "-vf",
        `scale=${BX}:${BY}:flags=area,format=gray`,
        path.join(frameDir, "f_%05d.png"),
      ],
      {stdio: ["ignore", "ignore", "inherit"]},
    );
  }

  const files = sample(
    fs
      .readdirSync(frameDir)
      .filter((f) => /\.(png|jpe?g)$/i.test(f))
      .sort()
      .map((f) => path.join(frameDir, f)),
  );
  if (files.length === 0) {
    console.error("No frames found.");
    process.exit(1);
  }

  const R = detrend(await meanGrid(files));
  const real = correlate(R, watermarkPattern());
  const control = correlate(R, wrongPattern());
  if (cleanup) fs.rmSync(frameDir, {recursive: true, force: true});

  const detected = real.z > DETECT_THRESHOLD;
  console.log("");
  console.log(`Frames analyzed : ${files.length}`);
  console.log(`Watermark z      : ${real.z.toFixed(2)}  (corr ${real.rho.toFixed(4)})`);
  console.log(`Control z (wrong): ${control.z.toFixed(2)}  (corr ${control.rho.toFixed(4)})`);
  console.log("");
  if (detected) {
    console.log(`✓ WATERMARK DETECTED — provenance: ${WATERMARK_PAYLOAD}`);
    process.exit(0);
  } else {
    console.log("✗ No watermark detected (z below threshold).");
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
