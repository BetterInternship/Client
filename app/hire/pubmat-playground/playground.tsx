"use client";

import { PubmatCreator } from "@/components/features/hire/pubmat/pubmat-creator";
import type { Job } from "@/lib/db/db.types";

const SAMPLE_JOB: Job = {
  title: "Brand Marketing Intern",
  employer: { name: "Northstar Media" },
  location: "Makati City",
  internship_preferences: { job_setup_ids: [1] },
  allowance: 0,
  salary: "15000",
  is_active: true,
};

/** The production editor, with only a development-only outline toggle added. */
export function PubmatPlayground() {
  return (
    <main className="mx-auto max-w-7xl space-y-5 p-5">
      <header>
        <h1 className="text-xl font-semibold">
          Poster playground · development only
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          The same poster editor, carousel, and exports used on the hire site.
          Edits here affect sample data only.
        </p>
      </header>
      <PubmatCreator
        job={SAMPLE_JOB}
        link="https://betterinternship.com/"
        maxPreviewSize={480}
        initiallyEditing
        sideBySide
        playgroundTools
      />
    </main>
  );
}
