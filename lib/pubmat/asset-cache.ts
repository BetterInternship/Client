/** Small bounded cache for prepared assets. Failed work is never retained. */
export function assetCache<T>(limit: number, maxAge = 5 * 60_000) {
  const entries = new Map<string, { value: Promise<T>; time: number }>();
  return (key: string, load: () => Promise<T>) => {
    const hit = entries.get(key);
    if (hit && Date.now() - hit.time < maxAge) {
      entries.delete(key);
      entries.set(key, hit);
      return hit.value;
    }
    const entry = { value: Promise.resolve().then(load), time: Date.now() };
    entries.set(key, entry);
    while (entries.size > limit) entries.delete(entries.keys().next().value!);
    entry.value = entry.value.catch((error) => {
      if (entries.get(key) === entry) entries.delete(key);
      throw error;
    });
    return entry.value;
  };
}
