"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useSavedJobs } from "@/lib/api/student.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { Loader } from "@/components/ui/loader";
import { Card } from "@/components/ui/card";
import { JobHead } from "@/components/shared/jobs";
import { Job } from "@/lib/db/db.types";

export default function SavedJobsPage() {
  const { isAuthenticated, redirectIfNotLoggedIn } = useAuthContext();
  const savedJobs = useSavedJobs();

  redirectIfNotLoggedIn();

  return (
    <div className="container max-w-5xl p-10 pt-16 mx-auto">
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <div className="flex flex-row items-start gap-3 sm:gap-4 mb-2">
          <div className="w-8 h-8 mt-1 bg-destructive rounded-[0.25em] flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Saved Jobs
            </h1>
            <Badge>{savedJobs.data?.length} saved</Badge>
          </div>
        </div>
      </div>
      <hr />
      <br />

      {savedJobs.isPending || !isAuthenticated() ? (
        <Loader>Loading saved jobs...</Loader>
      ) : savedJobs.error ? (
        <Card className="max-w-md m-auto">
          <p className="text-red-600 mb-4 text-base sm:text-lg">
            Failed to load saved jobs: {savedJobs.error.message}
          </p>
        </Card>
      ) : savedJobs.data?.length === 0 ? (
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
          {savedJobs.data?.map((savedJob) => (
            <SavedJobCard
              savedJob={savedJob}
              handleUnsaveJob={async () =>
                await savedJobs.toggle(savedJob.id ?? "")
              }
              saving={savedJobs.isToggling}
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
