"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** What a visitor sees at an old address until the redirect lands, or for good without scripts. */
export function TopPageMovedNotice({ to }: { to: string }) {
  return (
    <p className="p-6 text-sm text-gray-600">
      This page has moved.{" "}
      <a href={to} className="underline">
        Continue
      </a>
    </p>
  );
}

/**
 * Sends a visitor from a renamed Top page's old address to its current one,
 * keeping the query string (notably ?week= from a printed QR, which the
 * stale-week banner reads). Done in the browser because the cached page
 * cannot see the query. Must be rendered inside a <Suspense> whose fallback
 * is a <TopPageMovedNotice>, which is what the cached HTML contains.
 */
export function TopPageMovedRedirect({ to }: { to: string }) {
  const router = useRouter();
  const search = useSearchParams().toString();
  const target = search ? `${to}?${search}` : to;

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return <TopPageMovedNotice to={target} />;
}
