/** Finished SVG previews are shared; object URLs belong to the mounted view. */
const cache = new Map<string, string>();
const drawing = new Map<
  string,
  { promise: Promise<string>; controller: AbortController; users: number }
>();
const LIMIT = 12;

export function read(key: string) {
  const hit = cache.get(key);
  if (hit === undefined) return undefined;
  cache.delete(key);
  cache.set(key, hit);
  return hit;
}

export function write(key: string, svg: string) {
  cache.delete(key);
  cache.set(key, svg);
  while (cache.size > LIMIT) cache.delete(cache.keys().next().value!);
}

/** Cancel shared work only after its last interested view releases it. */
export function acquire(
  key: string,
  make: (signal: AbortSignal) => Promise<string>,
) {
  let entry = drawing.get(key);
  if (!entry) {
    const controller = new AbortController();
    const created = { controller, users: 0, promise: Promise.resolve("") };
    created.promise = Promise.resolve()
      .then(() => make(controller.signal))
      .finally(() => {
        if (drawing.get(key) === created) drawing.delete(key);
      });
    entry = created;
    drawing.set(key, created);
  }
  const current = entry;
  current.users++;
  let released = false;
  return {
    promise: current.promise,
    release: () => {
      if (released) return;
      released = true;
      current.users--;
      if (!current.users && drawing.get(key) === current) {
        drawing.delete(key);
        current.controller.abort();
      }
    },
  };
}
