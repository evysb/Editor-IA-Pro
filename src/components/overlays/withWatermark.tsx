import React from "react";
import {InvisibleWatermark} from "./InvisibleWatermark";

/**
 * Wrap a composition component so the invisible forensic watermark is rendered
 * on top of its output. Applying this in Root.tsx makes the watermark part of
 * every registered composition, so it cannot be forgotten and is only removable
 * by deliberately editing the source.
 *
 * The watermark is the last child, so it overlays (and therefore modulates) the
 * final composited frame.
 */
export function withWatermark<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  const Wrapped: React.FC<P> = (props) => (
    <>
      <Component {...props} />
      <InvisibleWatermark />
    </>
  );
  Wrapped.displayName = `withWatermark(${Component.displayName ?? Component.name ?? "Component"})`;
  return Wrapped;
}
