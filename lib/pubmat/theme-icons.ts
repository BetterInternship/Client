/** Frozen Lucide 0.454.0 icons used in the approved PNG proof (ISC license).
 * These are library artwork, not independently drawn or substituted glyphs.
 */
const ICON_PATHS = {
  location:
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  setup:
    '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  pay: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
} as const;

export function detailIcon(field: keyof typeof ICON_PATHS, color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="44" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[field]}</svg>`;
}
