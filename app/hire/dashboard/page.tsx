// Main dashboard page - uses clean architecture with focused hooks and context
// Wraps everything in DashboardProvider for shared state management
"use client";

import { motion } from "framer-motion";
import ContentLayout from "@/components/features/hire/content-layout";
import { JobsContent } from "@/components/features/hire/dashboard/JobsContent";
import { ShowUnverifiedBanner } from "@/components/ui/banner";
import { Loader } from "@/components/ui/loader";
import { useEmployerApplications, useOwnedJobs, useProfile } from "@/hooks/use-employer-api";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../authctx";
import { Job } from "@/lib/db/db.types";
import { FadeIn } from "@/components/animata/fade";
import { useModal } from "@/hooks/use-modal";
import { getNotificationPermission, requestNotificationPermission, checkNotificationSupport, shouldShowNotification, sendNotification } from "@/lib/notification-service";

function DashboardContent() {
  const { isMobile } = useMobile();
  const { isAuthenticated, redirectIfNotLoggedIn, loading } = useAuthContext();
  const profile = useProfile();
  const applications = useEmployerApplications();
  const { ownedJobs, update_job, delete_job } = useOwnedJobs();
  const activeJobs = ownedJobs.filter((job) => job.is_active)
  const inactiveJobs = ownedJobs.filter((job) => !job.is_active)

  const [isLoading, setLoading] = useState(true);
  const hasRequestedNotifRef = useRef(false);

  redirectIfNotLoggedIn();

  const handleUpdateJob = async (jobId: string, updates: Partial<Job>) => {
    const result = await update_job(jobId, updates);
    return result;
  }

  const {
    open: openNotifPermsModal,
    close: closeNotifPermsModal,
    Modal: NotifPermsModal,
  } = useModal("notif-perms-modal");

  useEffect(() => {
    const requestPermission = async () => {
      if (checkNotificationSupport()) {
        const currentPermission = getNotificationPermission();
  
        if (currentPermission === 'default') {
          openNotifPermsModal();
          const permission = await requestNotificationPermission();
          closeNotifPermsModal();
        }
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
      if (ownedJobs) {
        setLoading(true)
  
        const timer = setTimeout(() => {
        setLoading(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [ownedJobs]);

  if (loading || !isAuthenticated()) {
    return (
      <ContentLayout>
        <Loader>Loading dashboard...</Loader>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <NotifPermsModal>
        <div className="p-8 pt-0 h-full">
          <div className="text-lg mb-4">
            <Bell size={48} />
            <span>Please grant notification access so we can send you chat notifications.</span>
          </div>
        </div>
      </NotifPermsModal>
      <div className={cn("flex-1 flex flex-col w-full py-4", isMobile ? "px-1" : "px-4")}>
        <h3 className="text-primary tracking-tighter">Welcome back, {profile.data?.name}</h3>
        <div className="flex flex-col flex-1">
              <div>
                <div className="flex gap-4 mb-4">
                  <span className="text-gray-500 pb-2"><span className="text-primary font-bold">{activeJobs.length}</span> active listing{activeJobs.length !== 1 ? "s" : ""}</span>
                  <span className="text-gray-500 pb-2"><span className="text-primary font-bold">{inactiveJobs.length}</span> inactive listing{inactiveJobs.length !== 1 ? "s" : ""}</span>
                </div>
                <JobsContent
                  applications={applications.employer_applications}
                  jobs={ownedJobs}
                  employerId={profile.data?.id || ""}
                  updateJob={handleUpdateJob}
                  isLoading={isLoading}
                />
                {isMobile && (
                  <Link href="listings/create">
                    <button
                      aria-label="Create new listing"
                      className="fixed bottom-8 right-2 bg-primary rounded-full p-5 z-10 shadow-xl z-[1000]"
                    >
                      <Plus className="h-5 w-5 text-white"/>
                    </button>
                  </Link>
                )}
              </div>
        </div>
      </div>
    </ContentLayout>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
