import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useOwnedJobs } from "@/hooks/use-employer-api";
import { useModal } from "@/hooks/use-modal";
import { Job } from "@/lib/db/db.types";
import { cn, formatDateWithoutTime } from "@/lib/utils";
import { ArrowLeft, Edit, Info, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ListingsDeleteModal } from "../listings";
import { useListingsBusinessLogic } from "@/hooks/hire/listings/use-listings-business-logic";
import { useAppContext } from "@/lib/ctx-app";

export default function JobHeader({
  job,
  onJobUpdate,
} : {
  job: Job,
  onJobUpdate?: (updates: Partial<Job>) => void;
}) {
  const router = useRouter();
  const [exitingBack, setExitingBack] = useState(false);
  const { ownedJobs, update_job, delete_job } = useOwnedJobs();
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const { saving, clearSelectedJob } = useListingsBusinessLogic(ownedJobs);

  const {
    open: openDeleteModal,
    close: closeDeleteModal,
    Modal: DeleteModal,
  } = useModal("delete-modal");
  
  //goes back to job list
  const handleJobBack = () => {
    setExitingBack(true);
    router.push("/dashboard");
  };

  const handleJobDelete = () => {
    if (job) {
      setJobToDelete(job);
      openDeleteModal();
    }
  };

  const handleToggleActive = async () => {
    if (!job.id) return;

    const updates = { is_active: !job.is_active };
    const result = await update_job(job.id, updates);

    if (result.success && onJobUpdate) {
      onJobUpdate(updates);
    }
  };

  const { isMobile } = useAppContext();

  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <DeleteModal>
        {jobToDelete && (
          <ListingsDeleteModal
            job={jobToDelete}
            deleteJob={delete_job}
            clearJob={clearSelectedJob}
            close={closeDeleteModal}
          />
        )}
      </DeleteModal>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className={cn(
          "flex justify-between gap-4",
          isMobile
          ? "flex-col"
          : ""
        )}>
          <div className="flex gap-4">
            {/* back button */}
            <button
              onClick={handleJobBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="s-6" />
            </button>
            {/* job title */}
            <div className="flex flex-col min-w-0">
              <h3 className="text-lg font-semibold leading-tight truncate">
                {job?.title}
              </h3>
              <span className="text-xs text-gray-500">
                Created {formatDateWithoutTime(job?.created_at)}
              </span>
            </div>
            {/* active toggle */}
            <div className="flex items-center gap-2">
              <Toggle
                state={job.is_active}
                onClick={handleToggleActive}
              />
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded transition",
                  job.is_active
                    ? "bg-supportive text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {job.is_active ? "Active" : "Paused"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Link
                href={{
                  pathname: "/listings/details",
                  query: { jobId: job.id },
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                  className="hover:bg-primary/10 gap-1"
                >
                  <Info size={16} />
                  <span>Preview</span>
                </Button>
              </Link>
              <Link
                href={{
                  pathname: "/listings/edit",
                  query: { jobId: job.id },
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                  className="hover:bg-primary/10 gap-1"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                disabled={saving}
                className="hover:bg-destructive/10 hover:text-destructive gap-1"
                onClick={handleJobDelete}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}