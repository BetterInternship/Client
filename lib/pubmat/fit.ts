/**
 * Text measuring for the pubmat layouts. next/og (satori) draws text but can't
 * report how wide it came out, so a layout that wants "the biggest size that
 * still fits in two lines" has to work that out itself — here, from Inter's
 * real advance widths rather than a flat per-character guess, which is off by
 * a lot between "WWW" and "iii".
 *
 * The tables are advance / unitsPerEm for printable ASCII (space to ~), read
 * from the merged Inter files in lib/pubmat/fonts with fontTools (hmtx,
 * unitsPerEm 2048). Kerning is ignored, which only ever overestimates a little
 * — the safe side. Anything outside ASCII is treated as a wide "n".
 */

const W700 = [
  0.237, 0.338, 0.552, 0.649, 0.655, 1.016, 0.672, 0.339, 0.377, 0.377, 0.559,
  0.679, 0.334, 0.468, 0.334, 0.388, 0.674, 0.431, 0.63, 0.646, 0.676, 0.622,
  0.649, 0.582, 0.651, 0.649, 0.334, 0.343, 0.679, 0.679, 0.679, 0.56, 1.016,
  0.747, 0.662, 0.74, 0.722, 0.607, 0.587, 0.75, 0.747, 0.281, 0.584, 0.719,
  0.565, 0.932, 0.762, 0.771, 0.648, 0.777, 0.657, 0.655, 0.667, 0.732, 0.747,
  1.038, 0.738, 0.731, 0.664, 0.377, 0.388, 0.377, 0.487, 0.476, 0.365, 0.581,
  0.63, 0.588, 0.63, 0.596, 0.398, 0.632, 0.623, 0.271, 0.271, 0.58, 0.271,
  0.913, 0.623, 0.613, 0.63, 0.63, 0.407, 0.56, 0.366, 0.623, 0.6, 0.85, 0.58,
  0.602, 0.573, 0.469, 0.372, 0.469, 0.679,
];

const W800 = [
  0.219, 0.358, 0.586, 0.655, 0.66, 1.029, 0.683, 0.354, 0.382, 0.382, 0.583,
  0.686, 0.353, 0.471, 0.353, 0.4, 0.692, 0.441, 0.638, 0.657, 0.688, 0.634,
  0.662, 0.588, 0.664, 0.662, 0.353, 0.36, 0.686, 0.686, 0.686, 0.579, 1.036,
  0.77, 0.665, 0.744, 0.723, 0.61, 0.585, 0.752, 0.749, 0.286, 0.59, 0.738,
  0.565, 0.943, 0.766, 0.773, 0.652, 0.782, 0.662, 0.66, 0.677, 0.727, 0.77,
  1.059, 0.761, 0.752, 0.679, 0.382, 0.4, 0.382, 0.493, 0.484, 0.382, 0.588,
  0.638, 0.595, 0.638, 0.601, 0.41, 0.639, 0.635, 0.283, 0.283, 0.593, 0.283,
  0.927, 0.635, 0.619, 0.638, 0.638, 0.42, 0.573, 0.382, 0.635, 0.615, 0.863,
  0.594, 0.618, 0.581, 0.486, 0.388, 0.486, 0.686,
];

type Weight = 700 | 800;

/** Width of `text` in px at `size`, with `tracking` px of letter-spacing a char. */
export function textWidth(
  text: string,
  size: number,
  weight: Weight,
  tracking = 0,
) {
  const table = weight === 800 ? W800 : W700;
  let width = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    const em =
      code >= 32 && code <= 126
        ? table[code - 32]
        : table["n".charCodeAt(0) - 32] * 1.1;
    width += em * size + tracking;
  }
  return width;
}

/** How many lines `text` takes when wrapped at word breaks into `maxWidth`. */
export function wrapLines(
  text: string,
  size: number,
  weight: Weight,
  maxWidth: number,
  tracking = 0,
) {
  const space = textWidth(" ", size, weight, tracking);
  let lines = 1;
  let line = 0;
  for (const word of text.split(" ").filter(Boolean)) {
    const width = textWidth(word, size, weight, tracking);
    if (line === 0) line = width;
    else if (line + space + width <= maxWidth) line += space + width;
    else {
      lines++;
      line = width;
    }
  }
  return lines;
}

/**
 * The biggest title size, at most `maxSize`, that sets in `maxLines` lines of
 * `width` without any one word overrunning it and within `maxHeight` — so a
 * long title gets smaller rather than taller. Falls back to `minSize`, where
 * the layout's line clamp ends whatever still doesn't fit with an ellipsis.
 */
export function fitTitle(
  title: string,
  {
    width,
    maxLines,
    maxSize,
    minSize,
    maxHeight,
    tracking = -0.035,
    lineHeight = 1.1,
  }: {
    width: number;
    maxLines: number;
    maxSize: number;
    minSize: number;
    maxHeight: number;
    /** Letter-spacing, in em — the layouts set the title at -0.035em. */
    tracking?: number;
    lineHeight?: number;
  },
) {
  // A little under the box, to cover satori wrapping a hair differently.
  const usable = width * 0.98;
  const words = title.split(" ").filter(Boolean);
  for (let size = Math.round(maxSize); size > minSize; size -= 2) {
    const px = tracking * size;
    const longest = Math.max(...words.map((w) => textWidth(w, size, 800, px)));
    if (longest > usable) continue;
    const lines = wrapLines(title, size, 800, usable, px);
    if (lines <= maxLines && lines * size * lineHeight <= maxHeight)
      return size;
  }
  return minSize;
}
