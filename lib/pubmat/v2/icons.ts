// Native kit shapes; license in public/pubmat/v2/LICENSE.txt.
const outline =
  'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
const shapes: Record<string, string> = {
  "location.svg": `<g ${outline} stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></g>`,
  "work-setup.svg": `<g ${outline} stroke-width="2"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></g>`,
  "compensation.svg": `<g ${outline} stroke-width="1.8"><ellipse cx="8" cy="15" rx="6" ry="3"/><path d="M2 15v4c0 1.66 2.69 3 6 3s6-1.34 6-3v-4M2 18c0 1.66 2.69 3 6 3s6-1.34 6-3"/><ellipse cx="16" cy="5" rx="6" ry="3"/><path d="M10 5v5c0 1.66 2.69 3 6 3s6-1.34 6-3V5M10 8c0 1.66 2.69 3 6 3s6-1.34 6-3"/></g>`,
  "location-filled.svg":
    '<path fill="currentColor" fill-rule="evenodd" d="M12 1.5a8 8 0 0 0-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 0 0-8-8Zm0 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"/>',
  "work-setup-filled.svg":
    '<path fill="currentColor" d="m1 10 11-9 11 9-2 2-1-1v11h-6v-8h-4v8H4V11l-1 1-2-2Z"/>',
};
export function selectedIcon(asset: string, color: string) {
  const shape = shapes[asset.split("/").pop()!];
  if (!shape) throw new Error("Unknown poster icon.");
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${shape.replace(/currentColor/g, color)}</svg>`)}`;
}
