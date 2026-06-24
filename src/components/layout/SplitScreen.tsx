import React from "react";
import {AbsoluteFill} from "remotion";

export interface SplitScreenProps {
  direction?: "horizontal" | "vertical";
  ratio?: number;
  gap?: number;
  children: React.ReactNode[];
  style?: React.CSSProperties;
}

/**
 * Tiles children into a multi-panel layout. Exactly two children render as a
 * resizable split (`ratio` = first panel's fraction, `direction` = split axis);
 * three or four render as a fixed 2x2 grid where `ratio`/`direction` are ignored.
 *
 * Extra children beyond the first four are dropped.
 */
export const SplitScreen: React.FC<SplitScreenProps> = ({
  direction = "horizontal",
  ratio = 0.5,
  gap = 0,
  children,
  style,
}) => {
  // Normalize children (flattens fragments, strips null) and cap at four panels
  const panels = React.Children.toArray(children).slice(0, 4);
  const isHorizontal = direction === "horizontal";

  if (panels.length === 2) {
    const firstSize = `${ratio * 100}%`;
    const secondSize = `${(1 - ratio) * 100}%`;

    return (
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          gap,
          ...style,
        }}
      >
        <div
          style={{
            width: isHorizontal ? firstSize : "100%",
            height: isHorizontal ? "100%" : firstSize,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {panels[0]}
        </div>
        <div
          style={{
            width: isHorizontal ? secondSize : "100%",
            height: isHorizontal ? "100%" : secondSize,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {panels[1]}
        </div>
      </AbsoluteFill>
    );
  }

  // Fallback for 1, 3, or 4 panels: a 2x2 grid (the 2-panel split returned above)
  return (
    <AbsoluteFill
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap,
        ...style,
      }}
    >
      {panels.map((panel, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          {panel}
        </div>
      ))}
    </AbsoluteFill>
  );
};
