"use client";

import { Button } from "@betterinternship/components";
import { StatusNotice } from "@betterinternship/components/status-notice";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import { useApplicationsData } from "@/lib/api/student.data.api";
import { useAuthContext } from "@/lib/ctx-auth";
import type { Job } from "@/lib/db/db.types";
import { useModalRegistry } from "@/components/modals/modal-registry";

export function RedditReviewBanner({ job }: { job: Job }) {
  const auth = useAuthContext();
  const applications = useApplicationsData();
  const modals = useModalRegistry();
  const application = applications.data.find(
    (entry) => entry.job_id === job.id,
  );

  if (
    !auth.isAuthenticated() ||
    applications.isPending ||
    applications.error ||
    !job.id ||
    !application?.id
  )
    return null;

  return (
    <StatusNotice
      aria-label="Discuss this company on Reddit"
      title="Have a question or comment?"
      description="Ask a question or share your experience on r/InternshipsPH."
      media={
        <span className="flex size-full items-center justify-center rounded-[0.33em] bg-sky-100 text-sky-700">
          <MessageSquare className="size-5" aria-hidden="true" />
        </span>
      }
      variant="primary"
      className="flex-wrap border-sky-200 bg-sky-50 hover:bg-sky-100/70"
      action={
        <Button
          type="button"
          variant="default"
          scheme="default"
          className="shrink-0 rounded-[0.33em] border-sky-700 bg-sky-700 text-white hover:border-sky-800 hover:bg-sky-800"
          onClick={() => {
            if (!application.id) return;
            modals.redditDiscussion.open({ job });
          }}
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          Discuss on Reddit
        </Button>
      }
    />
  );
}
