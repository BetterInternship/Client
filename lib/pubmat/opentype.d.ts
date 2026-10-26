declare module "@shuding/opentype.js" {
  export interface Glyph {
    index: number;
    getMetrics(): { xMin: number; xMax: number; yMin: number; yMax: number };
  }
  export interface Font {
    unitsPerEm: number;
    stringToGlyphs(text: string): Glyph[];
    forEachGlyph(
      text: string,
      x: number,
      y: number,
      size: number,
      options: { kerning: boolean },
      callback: (glyph: Glyph, x: number, y: number) => void,
    ): void;
    getPath(
      text: string,
      x: number,
      y: number,
      size: number,
      options: { kerning: boolean },
    ): { toPathData(precision: number): string };
  }
  export function parse(data: ArrayBuffer): Font;
}
