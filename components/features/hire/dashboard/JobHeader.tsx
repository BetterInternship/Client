import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useOwnedJobs } from "@/hooks/use-employer-api";
import { Job } from "@/lib/db/db.types";
import { cn, formatDateWithoutTime } from "@/lib/utils";
import { ArrowLeft, Edit, Info, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useListingsBusinessLogic } from "@/hooks/hire/listings/use-listings-business-logic";
import { useAppContext } from "@/lib/ctx-app";
import useModalRegistry from "@/components/modals/modal-registry";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function JobHeader({
  job,
  onJobUpdate,
}: {
  job: Job;
  onJobUpdate?: (updates: Partial<Job>) => void;
}) {
  const router = useRouter();
  const { ownedJobs, update_job, delete_job } = useOwnedJobs();
  const { saving } = useListingsBusinessLogic(ownedJobs);

  const handleToggleActive = async () => {
    if (!job.id) return;

    const updates = { is_active: !job.is_active };
    const result = await update_job(job.id, updates);

    if (result.success && onJobUpdate) {
      onJobUpdate(updates);
    }
  };

  const { isMobile } = useAppContext();
  const pathname = usePathname();

  const modalRegistry = useModalRegistry();

  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto px-4 md:px-6 py-3">
        <div
          className={cn(
            "flex items-center justify-between gap-4",
            isMobile ? "flex-col items-start" : "",
          )}
        >
          <div className="flex justify-between gap-4">
            {/* back button */}
            <Button
              size="md"
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="sm:hidden md:block">Back</span>
            </Button>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Toggle
                    state={job.is_active}
                    onClick={() => void handleToggleActive()}
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
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Toggle the visibility of the listing to students.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex gap-1 flex-wrap">
            <Link
              href={{
                pathname: "/dashboard/manage",
                query: { jobId: job.id },
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                disabled={saving}
                className={cn(
                  "hover:bg-primary/10 gap-1",
                  pathname === "/dashboard/manage"
                    ? "bg-primary/10 text-primary"
                    : "",
                )}
              >
                <Users size={16} />
                <span>Applicants</span>
              </Button>
            </Link>
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
                className={cn(
                  "hover:bg-primary/10 gap-1",
                  pathname === "/listings/details"
                    ? "bg-primary/10 text-primary"
                    : "",
                )}
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
              onClick={() => {
                modalRegistry.deleteListing.open({
                  job,
                  isProcessing: saving,
                  onConfirm: () => {
                    if (job.id) {
                      void delete_job(job.id)
                        .then(() => {
                          modalRegistry.deleteListing.close();
                          router.push("/dashboard");
                          toast.success("Deleted job listing successfully.");
                        })
                        .catch((e: Error) => {
                          modalRegistry.deleteListing.close();
                          toast.error(
                            e.message || "Failed to delete job listing.",
                          );
                        });
                    }
                  },
                });
              }}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
