"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useJobsData } from "@/lib/api/student.data.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { Loader } from "@/components/ui/loader";
import { Card } from "@/components/ui/card";
import { JobHead } from "@/components/shared/jobs";
import { Job } from "@/lib/db/db.types";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { PageError } from "@/components/ui/error";
import { useJobActions } from "@/lib/api/student.actions.api";

export default function SavedJobsPage() {
  const { isAuthenticated, redirectIfNotLoggedIn } = useAuthContext();
  const jobs = useJobsData();
  const jobActions = useJobActions();

  redirectIfNotLoggedIn();

  return (
    <div className="container max-w-5xl p-10 pt-16 mx-auto">
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <div>
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={Heart} />
            <HeaderText>Saved Jobs</HeaderText>
          </div>
          <Badge>{jobs.savedJobs?.length} saved</Badge>
        </div>
      </div>
      <Separator className="mt-4 mb-8" />

      {jobs.isPending || !isAuthenticated() ? (
        <Loader>Loading saved jobs...</Loader>
      ) : jobs.error ? (
        <PageError
          title="Failed to load saved jobs."
          description={jobs.error.message}
        />
      ) : jobs.savedJobs.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <Card className="max-w-md m-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No saved jobs yet
            </h3>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Save jobs by clicking the heart icon on job listings to see them
              here.
            </p>
            <Link href="/search">
              <Button className="bg-primary hover:bg-primary/90">
                Browse Jobs
              </Button>
            </Link>
          </Card>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.savedJobs.map((savedJob) => (
            <SavedJobCard
              savedJob={savedJob}
              handleUnsaveJob={async () =>
                await jobActions.toggleSave.mutateAsync(savedJob.id ?? "")
              }
              saving={jobActions.toggleSave.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const SavedJobCard = ({
  savedJob,
  handleUnsaveJob,
  saving,
}: {
  savedJob: Job;
  handleUnsaveJob: () => void;
  saving: boolean;
}) => {
  return (
    <Card key={savedJob.id}>
      <div className="flex flex-col gap-1">
        <JobHead title={savedJob.title} employer={savedJob.employer?.name} />
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mt-2 mb-4">
          {savedJob.description}
        </p>
        <div className="flex flex-row items-center gap-3 pt-3 border-t border-gray-100">
          <Link href={`/search/${savedJob.id}`}>
            <Button>View Details</Button>
          </Link>
          <Button
            variant="outline"
            scheme="destructive"
            disabled={saving}
            onClick={() => handleUnsaveJob()}
          >
            Unsave
          </Button>
        </div>
      </div>
    </Card>
  );
};
