"use client";

import { JobsContent } from "@/components/features/hire/dashboard/JobsContent";
import { Loader } from "@/components/ui/loader";
import {
  useEmployerApplications,
  useOwnedJobs,
  useProfile,
} from "@/hooks/use-employer-api";
import { useAuthContext } from "../authctx";
import { Job } from "@/lib/db/db.types";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EmployerService } from "@/lib/api/services";
import {
  PageContainer,
  PageHeader,
} from "@betterinternship/components/page-header";
import { StatusNotice } from "@betterinternship/components/status-notice";
import { Button } from "@betterinternship/components";
import { Pause, Plus } from "lucide-react";
import { IomPartnershipCta } from "@/components/features/hire/iom-partnership-cta";

const NORMAL_LISTING_CREATE_PATH = "/listings/create";
const MAGIC_LINK_NEXT_PATHS = new Set([
  "dashboard",
  "listings/create",
  "account",
  "account?tab=notifications",
]);

function MagicLinkContinuation({
  autoLinkToken,
  next,
}: {
  autoLinkToken: string;
  next: string | null;
}) {
  const { loading, user } = useAuthContext();
  const queryClient = useQueryClient();
  const router = useRouter();
  const redeemed = useRef(false);

  useEffect(() => {
    if (loading || redeemed.current) return;
    redeemed.current = true;

    if (!user) {
      router.replace("/login");
      return;
    }

    const target = MAGIC_LINK_NEXT_PATHS.has(next ?? "")
      ? `/${next}`
      : "/dashboard";

    void (async () => {
      try {
        await EmployerService.autoLinkIomAccount(autoLinkToken);
      } finally {
        await queryClient.invalidateQueries({
          queryKey: ["my-employer-profile"],
        });
        router.replace(target);
      }
    })();
  }, [autoLinkToken, loading, next, queryClient, router, user]);

  return (
    <PageContainer>
      <Loader>Finishing account setup...</Loader>
    </PageContainer>
  );
}

function DashboardContent() {
  const { isAuthenticated, redirectIfNotLoggedIn, user } = useAuthContext();
  const router = useRouter();
  const profile = useProfile();
  const applications = useEmployerApplications();
  const { ownedJobs, update_job, unpause_job, unpause_all_jobs, loading } =
    useOwnedJobs();
  const activeJobs = ownedJobs.filter((job) => job.is_active);
  const inactiveJobs = ownedJobs.filter((job) => !job.is_active);
  const pausedJobs = ownedJobs.filter((job) => job.paused).length;
  const [reEnabling, setReEnabling] = useState(false);

  redirectIfNotLoggedIn();

  const handleAddListingClick = () => {
    router.push(NORMAL_LISTING_CREATE_PATH);
  };

  const handleUpdateJob = async (jobId: string, updates: Partial<Job>) => {
    const result = await update_job(jobId, updates);
    return result;
  };

  if (loading || !isAuthenticated()) {
    return (
      <PageContainer>
        <Loader>Loading dashboard...</Loader>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-2">
      {profile.data && (
        <IomPartnershipCta
          profile={profile.data}
          recruiterEmail={user?.email}
        />
      )}
      <PageHeader
        title="Job listings"
        description={`${activeJobs.length} active listings, ${inactiveJobs.length} inactive listings`}
        actionsClassName="self-center"
      >
        <Button
          asChild
          size="icon"
          className="sm:h-8 sm:w-auto sm:px-[1em] sm:py-[0.33em]"
        >
          <Link href={NORMAL_LISTING_CREATE_PATH} aria-label="Add listing">
            <Plus />
            <span className="hidden sm:inline">Add listing</span>
          </Link>
        </Button>
      </PageHeader>
      {pausedJobs !== 0 && (
        <StatusNotice
          icon={Pause}
          title="Paused listings"
          description={`You have ${pausedJobs} paused listing${pausedJobs !== 1 ? "s" : ""}.`}
          variant="warning"
          action={
            <Button
              size="sm"
              variant="outline"
              scheme="primary"
              disabled={reEnabling}
              onClick={() => {
                setReEnabling(true);
                void unpause_all_jobs();
                setReEnabling(false);
              }}
            >
              {reEnabling ? "Re-activating..." : "Re-activate all"}
            </Button>
          }
        />
      )}
      <JobsContent
        applications={applications.employer_applications}
        jobs={ownedJobs}
        employerId={profile.data?.id || ""}
        updateJob={handleUpdateJob}
        onReactivate={unpause_job}
        onAddListingClick={handleAddListingClick}
        isLoading={loading}
      />
    </PageContainer>
  );
}

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const autoLinkToken = searchParams.get("auto_link");

  if (autoLinkToken) {
    return (
      <MagicLinkContinuation
        autoLinkToken={autoLinkToken}
        next={searchParams.get("next")}
      />
    );
  }

  return <DashboardContent />;
}

export default function Dashboard() {
  return (
    <Suspense fallback={<Loader>Loading dashboard...</Loader>}>
      <DashboardPageContent />
    </Suspense>
  );
}
