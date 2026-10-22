import { Suspense } from "react";
import Link from "next/link";
import {
  fetchHomepageListings,
  type HomepageListing,
} from "@/components/landingStudent/homepage-listings.server";
import { getRefsData } from "@/lib/db/use-refs-backend";
import SearchClient from "./SearchClient";
import { SearchSkeleton } from "@/components/features/student/search/search-skeleton";

/**
 * The marketplace search page.
 *
 * Uses the same Search skeleton before hydration and during initial fetching.
 * Keeps real listing links as a no-JavaScript fallback, without showing a
 * different text-list layout to users while the interactive search loads.
 */
export const revalidate = 300;

const CLOSED_LABEL = "Just missed";

async function fetchFeaturedListings(): Promise<HomepageListing[]> {
  try {
    const refs = await getRefsData();
    const listings = await fetchHomepageListings(refs);
    return (listings.All ?? []).filter(
      (listing) => listing.postedLabel !== CLOSED_LABEL,
    );
  } catch {
    // Unlike the homepage, an outage here must not take down the search page.
    return [];
  }
}

function SearchFallback({ listings }: { listings: HomepageListing[] }) {
  return (
    <>
      <div
        data-search-loading-shell
        className="flex min-h-0 flex-1 overflow-hidden"
      >
        <SearchSkeleton />
      </div>
      <noscript>
        <style>{"[data-search-loading-shell] { display: none; }"}</style>
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-muted-foreground">
              Browse internships across the Philippines. Filter by field, work
              mode, workload and allowance, and apply in one click.
            </p>
            {listings.length > 0 && (
              <ul className="mt-4 divide-y">
                {listings.map((listing) => (
                  <li key={listing.id} className="py-3">
                    <Link href={listing.href} className="font-medium">
                      {listing.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {listing.companyName} · {listing.location}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </noscript>
    </>
  );
}

export default async function SearchPage() {
  const listings = await fetchFeaturedListings();

  return (
    <>
      <h1 className="sr-only">Internships in the Philippines</h1>
      <Suspense fallback={<SearchFallback listings={listings} />}>
        <SearchClient />
      </Suspense>
    </>
  );
}
