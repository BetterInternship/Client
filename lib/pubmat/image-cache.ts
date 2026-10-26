/**
 * Posters that have already been drawn, keyed by exactly what went into them.
 *
 * The point is to never draw the same poster twice: the thumbnail on the
 * listing page, the modal opened from it, swiping back to a slide that has been
 * handed back, and reopening the modal all ask for the same thing, and only the
 * first of them pays for it.
 *
 * Blobs, not object URLs. A slide still owns the URL it shows and revokes it on
 * unmount (use-pubmat-image.ts), so nothing here has to be refcounted or
 * revoked — and an entry is only the PNG bytes, a megabyte or so, not a decoded
 * 1080px bitmap.
 */

const LIMIT = 12;

const cache = new Map<string, Blob>();
const drawing = new Map<string, Promise<Blob>>();

/** The poster drawn from exactly this input, and nothing else. */
export function read(key: string): Blob | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  // Most recently used last, so the loop in `write` drops the coldest.
  cache.delete(key);
  cache.set(key, hit);
  return hit;
}

export function write(key: string, blob: Blob) {
  if (cache.has(key)) return;
  cache.set(key, blob);
  while (cache.size > LIMIT) {
    const coldest = cache.keys().next().value;
    if (coldest === undefined) break;
    cache.delete(coldest);
  }
}

/**
 * One draw per key, however many slides ask for it at once — the same listing
 * can be on screen twice (the notice's thumbnail and the modal it opens), and
 * two renders of one poster would cost twice as much and finish at different
 * moments.
 */
export function once(key: string, make: () => Promise<Blob>): Promise<Blob> {
  const running = drawing.get(key);
  if (running) return running;
  const started = make().finally(() => drawing.delete(key));
  drawing.set(key, started);
  return started;
}
