"use client";

import { useRouter } from "next/navigation";
import { JobCard } from "@/components/shared/jobs";
import type { CebuPacificProfile } from "../data";

type ProfileListingsProps = {
  profile: CebuPacificProfile;
};

export function ProfileListings({ profile }: ProfileListingsProps) {
  const router = useRouter();
  const mergedListings = [
    ...profile.listings.super,
    ...profile.listings.normal,
  ];

  return (
    <section className="px-6 py-12 sm:px-8 sm:py-14 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <h2 className="mt-4 [font-family:var(--font-cebu-company-heading)] text-3xl font-black tracking-[-0.03em] text-[#1f68a9] sm:text-4xl">
            Opportunities from Cebu Pacific
          </h2>
        </div>

        <div className="mt-8 space-y-4 rounded-[0.33em] border border-[#2574BB]/18 bg-white p-4 shadow-[0_22px_50px_-40px_rgba(37,116,187,0.35)] sm:p-5">
          {mergedListings.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2 align-bottom">
              {mergedListings.map((job) => (
                <div key={job.id} className="">
                  <JobCard
                    job={job}
                    on_click={() => {
                      if (job.challenge) {
                        router.push("/super-listing/cebu-pacific");
                        return;
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
