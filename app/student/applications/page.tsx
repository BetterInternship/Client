"use client";

// React imports
import React from "react";
import Link from "next/link";
import { BookA } from "lucide-react";

// UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Hooks (preserving existing implementations)
import { useApplications } from "@/lib/api/student.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { useDbRefs } from "@/lib/db/use-refs";
import { formatTimeAgo } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { Card } from "@/components/ui/card";
import { JobHead } from "@/components/shared/jobs";
import { UserApplication } from "@/lib/db/db.types";

export default function ApplicationsPage() {
  const { redirectIfNotLoggedIn } = useAuthContext();
  const applications = useApplications();
  redirectIfNotLoggedIn();

  return (
    <div className="container max-w-5xl p-10 pt-16 mx-auto">
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <div className="flex flex-row items-start gap-3 sm:gap-4 mb-2">
          <div className="w-8 h-8 mt-1 bg-primary rounded-[0.25em] flex items-center justify-center flex-shrink-0">
            <BookA className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight">
              My Applications
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mb-2">
              Track your internship applications and their status
            </p>
            <Badge>
              {applications.data.length}{" "}
              {applications.data.length === 1 ? "application" : "applications"}
            </Badge>
          </div>
        </div>
      </div>
      <hr />
      <br />

      {applications.isPending ? (
        <Loader>Loading your applications...</Loader>
      ) : applications.error ? (
        <div className="text-center py-16 animate-fade-in">
          <Card className="max-w-md m-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load applications
            </h3>
            <p className="text-red-600 mb-4">{applications.error.message}</p>
          </Card>
        </div>
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
  );
}

const ApplicationCard = ({ application }: { application: UserApplication }) => {
  const { to_app_status_name } = useDbRefs();
  console.log("application", application);

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
