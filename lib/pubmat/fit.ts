/**
 * Text measuring for the pubmat layouts. satori draws text but can't
 * report how wide it came out, so a layout that wants "the biggest size that
 * still fits in two lines" has to work that out itself — here, from Inter's
 * real advance widths rather than a flat per-character guess, which is off by
 * a lot between "WWW" and "iii".
 *
 * The tables are advance / unitsPerEm for printable ASCII (space to ~), read
 * from the merged Inter files in public/fonts/pubmat with fontTools (hmtx,
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

// Unbounded, same way (unitsPerEm 1000, from public/fonts/pubmat). Far wider
// than Inter: it averages ~0.85em a character against Inter's ~0.6.
const U700 = [
  0.248, 0.323, 0.506, 0.857, 0.812, 1.294, 0.94, 0.275, 0.39, 0.39, 0.536,
  0.62, 0.302, 0.371, 0.3, 0.459, 0.925, 0.52, 0.835, 0.839, 0.861, 0.807,
  0.857, 0.753, 0.892, 0.857, 0.328, 0.33, 0.62, 0.62, 0.62, 0.705, 1.046,
  0.957, 0.883, 0.934, 0.926, 0.794, 0.771, 0.964, 0.938, 0.347, 0.806, 0.87,
  0.764, 1.236, 0.972, 0.965, 0.814, 0.965, 0.85, 0.843, 0.818, 0.878, 0.935,
  1.36, 0.87, 0.923, 0.808, 0.433, 0.459, 0.433, 0.62, 0.482, 0.374, 0.826,
  0.814, 0.762, 0.828, 0.734, 0.589, 0.813, 0.779, 0.317, 0.317, 0.743, 0.317,
  1.208, 0.789, 0.792, 0.815, 0.815, 0.553, 0.748, 0.603, 0.777, 0.769, 1.14,
  0.719, 0.777, 0.694, 0.472, 0.313, 0.472, 0.62,
];

const U900 = [
  0.236, 0.352, 0.562, 0.877, 0.843, 1.349, 0.982, 0.306, 0.43, 0.43, 0.548,
  0.62, 0.33, 0.384, 0.328, 0.485, 0.946, 0.552, 0.865, 0.862, 0.899, 0.828,
  0.878, 0.785, 0.918, 0.878, 0.35, 0.35, 0.62, 0.62, 0.62, 0.739, 1.066, 0.996,
  0.907, 0.949, 0.946, 0.812, 0.791, 0.976, 0.956, 0.378, 0.824, 0.895, 0.781,
  1.275, 0.995, 0.976, 0.837, 0.977, 0.876, 0.87, 0.84, 0.889, 0.968, 1.39,
  0.922, 0.957, 0.83, 0.468, 0.485, 0.468, 0.62, 0.482, 0.412, 0.852, 0.834,
  0.787, 0.855, 0.75, 0.623, 0.836, 0.807, 0.35, 0.35, 0.782, 0.35, 1.244, 0.82,
  0.81, 0.834, 0.834, 0.585, 0.786, 0.635, 0.807, 0.806, 1.168, 0.767, 0.818,
  0.723, 0.514, 0.332, 0.514, 0.62,
];

type Weight = 700 | 800 | 900;
type Face = "inter" | "unbounded";

const TABLES: Record<Face, Partial<Record<Weight, number[]>>> = {
  inter: { 700: W700, 800: W800 },
  unbounded: { 700: U700, 900: U900 },
};

/**
 * Width of `text` in px at `size`, with `tracking` px of letter-spacing a char.
 * `weight` has to be one the face has a table for (Inter 700/800, Unbounded
 * 700/900).
 */
export function textWidth(
  text: string,
  size: number,
  weight: Weight,
  tracking = 0,
  face: Face = "inter",
) {
  const table = TABLES[face][weight] ?? TABLES[face][700]!;
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
  face: Face = "inter",
) {
  const space = textWidth(" ", size, weight, tracking, face);
  let lines = 1;
  let line = 0;
  for (const word of text.split(" ").filter(Boolean)) {
    const width = textWidth(word, size, weight, tracking, face);
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
    face = "inter",
    weight = 800,
  }: {
    width: number;
    maxLines: number;
    maxSize: number;
    minSize: number;
    maxHeight: number;
    /** Letter-spacing, in em — the layouts set the title at -0.035em. */
    tracking?: number;
    lineHeight?: number;
    /** The typeface and weight the title is set in. */
    face?: Face;
    weight?: Weight;
  },
) {
  // A little under the box, to cover satori wrapping a hair differently.
  const usable = width * 0.98;
  const words = title.split(" ").filter(Boolean);
  for (let size = Math.round(maxSize); size > minSize; size -= 2) {
    const px = tracking * size;
    const longest = Math.max(
      ...words.map((w) => textWidth(w, size, weight, px, face)),
    );
    if (longest > usable) continue;
    const lines = wrapLines(title, size, weight, usable, px, face);
    if (lines <= maxLines && lines * size * lineHeight <= maxHeight)
      return size;
  }
  return minSize;
}
