import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

// Deterministic PRNG: same seed always yields the same value, so particle
// layout stays identical across renders and frames (required for stable video).
// Returns a fractional value in [0, 1).
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

// Build a fixed particle set. Distinct seed offsets per attribute keep
// position, size, speed, and opacity uncorrelated.
const generateParticles = (count: number, width: number, height: number): Particle[] => {
  return Array.from({length: count}, (_, i) => ({
    x: seededRandom(i * 3 + 1) * width,
    y: seededRandom(i * 3 + 2) * height,
    size: 2 + seededRandom(i * 3 + 3) * 4,
    speed: 0.2 + seededRandom(i * 3 + 4) * 0.8,
    opacity: 0.2 + seededRandom(i * 3 + 5) * 0.6,
  }));
};

export interface ParticleFieldProps {
  count?: number;
  color?: string;
  /** Global speed multiplier on top of each particle's own random speed. */
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  style?: React.CSSProperties;
}

/**
 * Full-screen field of drifting particles rendered as SVG. Layout is seeded
 * and deterministic, so it renders identically every time. Particles wrap
 * around the edges, giving an endless scroll in the chosen direction.
 */
export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 50,
  color = "rgba(255,255,255,0.5)",
  speed = 1,
  direction = "up",
  style,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const particles = React.useMemo(
    () => generateParticles(count, width, height),
    [count, width, height],
  );

  return (
    <AbsoluteFill style={style}>
      <svg width={width} height={height}>
        {particles.map((p, i) => {
          const movement = frame * p.speed * speed;
          let cx = p.x;
          let cy = p.y;

          // Wrap each particle within the canvas. For up/left (negative travel)
          // the extra "+ size) % size" guards against JS modulo returning a
          // negative remainder, keeping coordinates in [0, size).
          switch (direction) {
            case "up":
              cy = ((p.y - movement) % height + height) % height;
              break;
            case "down":
              cy = (p.y + movement) % height;
              break;
            case "left":
              cx = ((p.x - movement) % width + width) % width;
              break;
            case "right":
              cx = (p.x + movement) % width;
              break;
          }

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={p.size}
              fill={color}
              opacity={p.opacity}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
