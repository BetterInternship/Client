/**
 * Picks black or white text, whichever contrasts more against `hex`, by WCAG
 * relative luminance (plan D10). 0.179 is the standard crossover point where
 * contrast-against-black equals contrast-against-white.
 */
export function pickForeground(hex: string): "#000000" | "#ffffff" {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const linear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const luminance =
    0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

  return luminance > 0.179 ? "#000000" : "#ffffff";
}
