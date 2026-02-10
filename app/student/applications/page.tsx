"use client";

// React imports
import React from "react";
import Link from "next/link";
import { BookA } from "lucide-react";

// UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Hooks (preserving existing implementations)
import { useApplicationsData } from "@/lib/api/student.data.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { useDbRefs } from "@/lib/db/use-refs";
import { formatTimeAgo } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { Card } from "@/components/ui/card";
import { JobHead } from "@/components/shared/jobs";
import { UserApplication } from "@/lib/db/db.types";
import { HeaderText, HeaderIcon } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { PageError } from "@/components/ui/error";

export default function ApplicationsPage() {
  const { redirectIfNotLoggedIn } = useAuthContext();
  const applications = useApplicationsData();
  redirectIfNotLoggedIn();

  return (
    <div className="h-full overflow-y-auto py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={BookA}></HeaderIcon>
            <HeaderText>My Applications</HeaderText>
          </div>
          <div className="flex-1 flex-row">
            <p className="text-gray-600 text-sm sm:text-base mb-2">
              Track your internship applications and their status
            </p>
            <Badge>
              {applications.data.length}{" "}
              {applications.data.length === 1 ? "application" : "applications"}
            </Badge>
          </div>
        </div>
        <Separator className="mt-4 mb-8" />

        {applications.isPending ? (
          <Loader>Loading your applications...</Loader>
        ) : applications.error ? (
          <PageError
            title="Failed to load applications"
            description={applications.error.message}
          />
        ) : applications.data.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <Card className="max-w-md m-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Ready to start your internship journey? Browse our job listings
                and submit your first application.
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
            {applications?.data.map((application) => (
              <ApplicationCard application={application} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ApplicationCard = ({ application }: { application: UserApplication }) => {
  const { to_app_status_name } = useDbRefs();

  return (
    <Card key={application.id} className="hover:shadow-lg transition-all">
      <div className="flex flex-col gap-1">
        <JobHead
          title={application.job?.title}
          employer={application.employer?.name}
        />
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <Badge type="accent">
            Applied {formatTimeAgo(application.applied_at ?? "")}
          </Badge>
          <Badge type="accent">{to_app_status_name(application.status)}</Badge>
          {(!application.job?.is_active || application.job?.is_deleted) && (
            <Badge type="destructive">Job no longer available.</Badge>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-3 border-t border-gray-100">
          <Link href={`/search/${application.job?.id}`}>
            <Button
              disabled={
                !application.job?.is_active || application.job?.is_deleted
              }
              size="sm"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
