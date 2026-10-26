/** The twelve approved v7 backgrounds. Source PNG bytes are never rewritten. */
export const PUBMAT_THEMES = {
  "01-cream-blue-workspace": { label: "Cream workspace", washOpacity: 0.16 },
  "02-blue-paper-plane": { label: "Blue paper plane", washOpacity: 0 },
  "03-sunlit-cream-desk": { label: "Sunlit desk", washOpacity: 0 },
  "04-lavender-lanyard": { label: "Lavender", washOpacity: 0 },
  "05-forest-workspace": { label: "Forest workspace", washOpacity: 0.63 },
  "06-blue-grid": { label: "Blue grid", washOpacity: 0.12 },
  "07-warm-office": { label: "Warm office", washOpacity: 0.39999999999999997 },
  "08-fresh-green-botanical": {
    label: "Fresh botanical",
    washOpacity: 0.4799999999999999,
  },
  "09-apricot-workspace": { label: "Apricot workspace", washOpacity: 0.36 },
  // Preserve the native proof's exact opacity precision at 8-bit rounding edges.
  "10-blue-office": { label: "Blue office", washOpacity: 0.5199999999999999 },
  "11-blush-workspace": { label: "Blush workspace", washOpacity: 0 },
  "12-yellow-workspace": { label: "Yellow workspace", washOpacity: 0.28 },
} as const;

export type PubmatTheme = keyof typeof PUBMAT_THEMES;
export function isPubmatTheme(value: string): value is PubmatTheme {
  return Object.prototype.hasOwnProperty.call(PUBMAT_THEMES, value);
}

export const PUBMAT_SIZE = 1080;
export const PUBMAT_CTA = "Scan the QR to apply";
export const PUBMAT_QR = {
  x: 674,
  y: 674,
  size: 330,
  quietModules: 4,
} as const;

export function themeColors(theme: PubmatTheme) {
  const dark = theme === "05-forest-workspace";
  return {
    dark,
    supporting: dark ? "#FFFFFF" : "#071537",
    title: dark ? "#75A6FF" : "#0865EE",
    wash: dark ? "#08251D" : "#FFFFFF",
    footerOpacity: dark ? 0.86 : 0.82,
  };
}
