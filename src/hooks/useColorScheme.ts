import {PALETTES, type PaletteKey, type Palette} from "../presets/colors";

/** Resolves a named palette key to its color values; defaults to "dark". */
export const useColorScheme = (palette: PaletteKey = "dark"): Palette => {
  return PALETTES[palette];
};
