import ReactMarkdown from "react-markdown";
import { JobApplicationRequirements, JobBadges } from "../shared/jobs";
import { useApplications, useSavedJobs } from "@/lib/api/student.api";
import { ModalComponent, ModalHandle } from "@/hooks/use-modal";
import { ArrowLeft, Building, Heart } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { RefObject } from "react";
import { Button } from "../ui/button";
import { Job } from "@/lib/db/db.types";
import { useAuthContext } from "@/lib/ctx-auth";

export const JobModal = ({
  job,
  handleApply,
  ref,
}: {
  job: Job | null;
  handleApply: () => void;
  ref?: RefObject<ModalHandle | null>;
}) => {
  const router = useRouter();
  const savedJobs = useSavedJobs();
  const applications = useApplications();
  const auth = useAuthContext();

  const handleSave = async (job: Job) => {
    if (!auth.isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    await savedJobs.toggle(job.id ?? "");
  };

  return (
    <ModalComponent ref={ref}>
      <div className="h-full flex flex-col bg-white overflow-hidden">
        {/* Fixed Header with Close Button */}
        <div className="flex flex-col justify-start items-start p-4 border-b bg-white flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => ref?.current?.close()}
            className="h-8 w-8 p-0 ml-[-8px] mb-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
          {/* Fixed Job Header - Non-scrollable */}
          {job && (
            <div className=" bg-white flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Building className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">{job.employer?.name}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Listed on {formatDate(job.created_at ?? "")}
              </p>
              <JobBadges job={job} />
            </div>
          )}
        </div>

        {/* Scrollable Content Area - MUST be properly configured */}
        <div
          className="flex-1 overflow-y-scroll overscroll-contain pb-32"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {job && (
            <div className="p-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">
                  Description
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed">
                  <ReactMarkdown>{job.description}</ReactMarkdown>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">
                  Requirements
                </h2>
                <JobApplicationRequirements job={job} />
                <div className="prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed">
                  <ReactMarkdown>{job.requirements}</ReactMarkdown>
                </div>
              </div>
              <div className="pb-20"></div>
            </div>
          )}
        </div>

        {/* Fixed Action Buttons at Bottom - Always Visible and Prominent */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 p-4">
          <div className="flex gap-3">
            <Button
              disabled={applications.appliedJob(job?.id ?? "")}
              onClick={handleApply}
              className={cn(
                "flex-1 h-14 transition-all duration-300",
                applications.appliedJob(job?.id ?? "")
                  ? "bg-supportive text-white"
                  : "bg-primary  text-white"
              )}
            >
              {applications.appliedJob(job?.id ?? "") ? "Applied" : "Apply Now"}
            </Button>

            <Button
              variant="outline"
              onClick={() => job && handleSave(job)}
              scheme={
                savedJobs.isJobSaved(job?.id ?? "") ? "destructive" : "default"
              }
              className="h-14 w-14"
            >
              <Heart
                className={cn(
                  "w-6 h-6",
                  savedJobs.isJobSaved(job?.id ?? "") ? "fill-current" : ""
                )}
              />
            </Button>
          </div>
        </div>
      </div>
    </ModalComponent>
  );
};
