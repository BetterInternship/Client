/**
 * Plain, non-hook ref-name lookups. Extracted out of use-refs.tsx (a
 * "use client" module) so server-only callers — Route Handlers, Server
 * Components — can resolve ref ids to names too, fed by getRefsData()
 * (use-refs-backend.ts) instead of the RefsContext provider tree, which
 * only exists inside the client boundary.
 */

export const createRefHelpers = <
  ID extends string | number,
  T extends { id: ID; name: string },
>(
  data: T[],
) => {
  const get = (id: ID | null | undefined): T | null => {
    if (!id && id !== 0) return null;
    const found = data.find((d) => d.id === id);
    return found ?? null;
  };

  const toName = (
    id: ID | null | undefined,
    def: string | null | undefined = "Not specified",
  ): string => {
    if (!id && id !== 0) return def ?? "";
    const found = data.find((d) => d.id === id);
    return found?.name ?? def ?? "";
  };

  const getByName = (name: string | null | undefined): T | null => {
    if (!name) return null;
    const found = data.find((d) => d.name === name);
    return found ?? null;
  };

  return {
    get,
    toName,
    getByName,
  };
};
