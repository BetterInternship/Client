"use client";

import { DB_STATUS_MAP, UI_STATUS_MAP } from "@/lib/consts/application";
import ContentLayout from "@/components/features/hire/content-layout";
import { ApplicantPage } from "@/components/features/hire/dashboard/ApplicantPage";
import { type ActionItem } from "@/components/ui/action-item";
import { useEmployerApplications } from "@/hooks/use-employer-api";
import { UserService } from "@/lib/api/services";
import { EmployerApplication } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ApplicantPageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const jobId = searchParams.get("jobId");
  const isDummyProfile = searchParams.get("dummy") === "1";
  const [loading, setLoading] = useState(true);
  const applications = useEmployerApplications();
  const { app_statuses } = useDbRefs();

  const { triggerAction } = useApplicationActions(applications.review);

  const dummyApplication: EmployerApplication = {
    id: "dummy-super-application",
    user_id: "",
    job_id: jobId ?? "dummy-super-job",
    status: 0,
    applied_at: "2026-03-09T00:00:00.000Z",
    cover_letter:
      "I am excited to apply and contribute with thoughtful solutions.",
    challenge_submission:
      "This is a sample challenge submission used for previewing super listing flows.",
    job: {
      title: "Super Listing - Sample Role",
      internship_preferences: {
        require_cover_letter: true,
      },
    },
    user: {
      id: "dummy-super-user",
      first_name: "Sample",
      last_name: "Applicant",
      phone_number: "+63 900 000 0000",
      edu_verification_email: "sample.applicant@school.edu",
      degree: "BS Computer Science",
      bio: "I build practical products and enjoy solving product and UX problems.",
      github_link: "https://github.com/sample-applicant",
      portfolio_link: "https://sample-applicant.dev",
      linkedin_link: "https://linkedin.com/in/sample-applicant",
      internship_preferences: {
        internship_type: "credited",
        expected_start_date: 1751328000000,
        expected_duration_hours: 400,
      },
      expected_graduation_date: 1767225600000,
    },
  };

  let userApplication = applications?.employer_applications.find(
    (a) => userId === a.user_id,
  );
  let otherApplications = applications?.employer_applications.filter(
    (a) => userId === a.user_id,
  );

  if (jobId) {
    userApplication = applications?.employer_applications.find(
      (a) => userId === a.user_id && a.job_id === jobId,
    );
    otherApplications = applications?.employer_applications.filter(
      (a) => userId === a.user_id && a.id !== userApplication?.id,
    );
  }

  if (isDummyProfile) {
    userApplication = dummyApplication;
    otherApplications = [];
  }

  useEffect(() => {
    const fetchUserData = async () => {
      if (isDummyProfile) {
        setLoading(false);
        return;
      }
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        await UserService.getUserById(userId);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [isDummyProfile, userId]);

  if (!app_statuses) return null;

  const unique_app_statuses = app_statuses.reduce(
    (acc: { id: number; name: string }[], cur: { id: number; name: string }) =>
      acc.find((a) => a.name === cur.name) ? acc : [...acc, cur],
    [],
  );

  const getStatuses = (applicationId: string) => {
    return unique_app_statuses
      .filter((status) => status.id !== 7 && status.id !== 5 && status.id !== 0)
      .map((status): ActionItem => {
        const config = DB_STATUS_MAP[status.id];
        const uiProps = UI_STATUS_MAP.get(config?.key || "pending");

        return {
          id: status.id.toString(),
          label: status.name,
          icon: uiProps?.icon,
          onClick: () =>
            triggerAction(
              config?.action || "CHANGE_STATUS",
              [application],
              status.id,
            ),
          destructive: uiProps?.destructive,
        };
      });
  };

  return (
    <ContentLayout>
      <div className="w-full h-full">
        <ApplicantPage
          application={userApplication}
          jobID={jobId || ""}
          statuses={
            isDummyProfile ? [] : getStatuses(userApplication?.id || "")
          }
          userApplications={otherApplications}
          onArchive={() => {
            if (!userApplication) return;
            if (userApplication.visibility === "archived") {
              triggerAction("UNARCHIVE", [userApplication]);
            } else {
              triggerAction("ARCHIVE", [userApplication]);
            }
          }}
          onDelete={() => {
            if (!userApplication) return;
            if (userApplication) triggerAction("DELETE", [userApplication]);
          }}
        />
      </div>
    </ContentLayout>
  );
}

export default function ApplicantInfo() {
  return (
    <Suspense>
      <ApplicantPageContent />
    </Suspense>
  );
}
