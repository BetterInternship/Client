import { useState, type ReactNode } from "react";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@betterinternship/components";
import { Toggle } from "@/components/ui/toggle";
import {
  useEmployerApplications,
  useOwnedJobs,
} from "@/hooks/use-employer-api";
import { Job } from "@/lib/db/db.types";
import { cn } from "@betterinternship/components";
import {
  ArrowLeft,
  Edit,
  Info,
  MoreHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useListingsBusinessLogic } from "@/hooks/hire/listings/use-listings-business-logic";
import { useAppContext } from "@/lib/ctx-app";
import useModalRegistry from "@/components/modals/modal-registry";
import { useNotificationsRequiredModal } from "@/hooks/use-notifications-required-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function JobHeader({
  job,
  onJobUpdate,
  backHref,
  applicantActions,
  showJobTitle = true,
}: {
  job: Job;
  onJobUpdate?: (updates: Partial<Job>) => void;
  backHref?: string;
  applicantActions?: ReactNode;
  showJobTitle?: boolean;
}) {
  const router = useRouter();
  const { ownedJobs, update_job, delete_job, unpause_job } = useOwnedJobs();
  const { saving } = useListingsBusinessLogic(ownedJobs);
  const [reEnabling, setReEnabling] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const openNotificationsRequiredModal = useNotificationsRequiredModal();

  // Counts feed the close-listing warning (plan §4.3) — already loaded here,
  // no new endpoint needed.
  const { employer_applications } = useEmployerApplications();
  const jobApplications = employer_applications.filter(
    (app) => app.job_id === job.id && app.visibility === "visible",
  );
  const pendingCount = jobApplications.filter((app) => app.status === 0).length;
  const shortlistedCount = jobApplications.filter(
    (app) => app.status === 1,
  ).length;

  const handleBack = () => {
    if (backHref) return router.replace(backHref);
    router.back();
  };

  const performToggleActive = async () => {
    if (!job.id) return;
    setTogglingActive(true);
    try {
      const updates = { is_active: !job.is_active };
      const result = await update_job(job.id, updates);

      if (result.success && onJobUpdate) {
        onJobUpdate(updates);
      } else if (result.code === "notifications_required") {
        openNotificationsRequiredModal(handleToggleActive);
      } else if (!result.success) {
        toast.error(result.message || "Could not update this listing.");
      }
    } finally {
      setTogglingActive(false);
    }
  };

  const handleToggleActive = async () => {
    if (!job.id || job.paused) return;

    // Closing (active -> inactive) with unanswered applicants gets a warning
    // first — not a gate, and reopening never shows it (plan §4.3/D3).
    if (job.is_active && pendingCount > 0) {
      modalRegistry.closeListing.open({
        jobTitle: job.title ?? "this listing",
        pendingCount,
        shortlistedCount,
        isProcessing: togglingActive,
        onConfirm: () => {
          modalRegistry.closeListing.close();
          void performToggleActive();
        },
        onReviewFirst: () => {
          modalRegistry.closeListing.close();
          router.push(`/dashboard/manage?jobId=${job.id}&filter=pending`);
        },
      });
      return;
    }

    await performToggleActive();
  };

  const handleReEnable = async () => {
    if (!job.id) return;
    setReEnabling(true);
    try {
      const result = await unpause_job(job.id);
      if (result.success && onJobUpdate) {
        onJobUpdate({
          paused: false,
          pause_reason: null,
          paused_at: null,
          waiting_count: 0,
        });
      } else if (result.code === "notifications_required") {
        openNotificationsRequiredModal(handleReEnable);
      } else if (!result.success) {
        toast.error(result.message || "Could not reactivate this listing.");
      }
    } finally {
      setReEnabling(false);
    }
  };

  const { isMobile } = useAppContext();
  const pathname = usePathname();

  const modalRegistry = useModalRegistry();
  const handleDelete = () => {
    modalRegistry.deleteListing.open({
      job,
      // Deleting an already-inactive listing is not a transition and
      // notifies no one (D10), so the harder copy only names a count while
      // the listing is still active.
      pendingApplicantCount: job.is_active ? pendingCount : 0,
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
              toast.error(e.message || "Failed to delete job listing.");
            });
        }
      },
    });
  };

  const closeMenu = () => setActionsOpen(false);

  const desktopActionButtons = (
    <>
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
            "hover:bg-primary/[0.035] gap-1",
            pathname === "/listings/details"
              ? "bg-primary/10 text-primary"
              : "",
          )}
        >
          <Info size={16} />
          <span>Preview</span>
        </Button>
      </Link>
      {job.paused ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="pointer-events-none opacity-50">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/[0.035] gap-1"
              >
                <Edit size={16} />
                <span>Edit</span>
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Re-activate the listing first
          </TooltipContent>
        </Tooltip>
      ) : (
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
            className={cn(
              "hover:bg-primary/[0.035] gap-1",
              pathname === "/listings/edit" ? "bg-primary/10 text-primary" : "",
            )}
          >
            <Edit size={16} />
            <span>Edit</span>
          </Button>
        </Link>
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={saving}
        className="hover:bg-destructive/10 hover:text-destructive gap-1"
        onClick={handleDelete}
      >
        <Trash2 size={16} />
        <span>Delete</span>
      </Button>
    </>
  );

  const statusBadge = (
    <div className="flex items-center gap-2 shrink-0">
      <span
        className={cn(
          "text-xs px-2 py-1 rounded transition",
          job.is_active
            ? "bg-supportive text-white"
            : "bg-muted text-muted-foreground",
        )}
      >
        {job.is_active ? "Active" : job.paused ? "Inactive" : "Paused"}
      </span>
      {job.paused && !!job.waiting_count && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {job.waiting_count} student{job.waiting_count === 1 ? "" : "s"}{" "}
          waiting
        </span>
      )}
    </div>
  );

  // Mobile-only: the desktop keeps the buttons and toggle as separate,
  // always-visible controls (see desktopActionButtons + desktopToggle below).
  const mobileActionsMenu = (
    <Popover open={actionsOpen} onOpenChange={setActionsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 hover:bg-primary/10"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-56 rounded-[0.33em] border-gray-200 p-1 space-y-0.5"
      >
        <Link
          href={{ pathname: "/dashboard/manage", query: { jobId: job.id } }}
          className="block"
          onClick={closeMenu}
        >
          <Button
            variant="ghost"
            size="sm"
            disabled={saving}
            className={cn(
              "w-full justify-start gap-2",
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
          href={{ pathname: "/listings/details", query: { jobId: job.id } }}
          className="block"
          onClick={closeMenu}
        >
          <Button
            variant="ghost"
            size="sm"
            disabled={saving}
            className={cn(
              "w-full justify-start gap-2",
              pathname === "/listings/details"
                ? "bg-primary/10 text-primary"
                : "",
            )}
          >
            <Info size={16} />
            <span>Preview</span>
          </Button>
        </Link>
        {job.paused ? (
          <>
            <div className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-muted-foreground opacity-50">
              <Edit size={16} />
              <span>Edit</span>
            </div>
            <p className="px-2.5 pb-1 text-xs text-muted-foreground">
              Re-activate the listing first
            </p>
          </>
        ) : (
          <Link
            href={{ pathname: "/listings/edit", query: { jobId: job.id } }}
            className="block"
            onClick={closeMenu}
          >
            <Button
              variant="ghost"
              size="sm"
              disabled={saving}
              className={cn(
                "w-full justify-start gap-2",
                pathname === "/listings/edit"
                  ? "bg-primary/10 text-primary"
                  : "",
              )}
            >
              <Edit size={16} />
              <span>Edit</span>
            </Button>
          </Link>
        )}

        <div className="my-1 border-t border-gray-100" />

        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
          <span className="text-sm">Visible to students</span>
          <div className={cn(job.paused && "pointer-events-none opacity-50")}>
            <Toggle
              state={job.is_active}
              onClick={() => void handleToggleActive()}
              loading={togglingActive}
            />
          </div>
        </div>
        {job.paused && (
          <div className="px-2.5 pb-1.5">
            <Button
              size="xs"
              variant="outline"
              scheme="primary"
              disabled={reEnabling}
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                closeMenu();
                void handleReEnable();
              }}
            >
              {reEnabling ? "Re-activating..." : "Re-activate"}
            </Button>
          </div>
        )}

        <div className="my-1 border-t border-gray-100" />

        <Button
          variant="ghost"
          size="sm"
          disabled={saving}
          className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            closeMenu();
            handleDelete();
          }}
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </Button>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="sticky top-0 z-30 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        {isMobile ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="md"
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-0 transition-colors aspect-square"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                {showJobTitle && (
                  <div className="flex min-w-0 items-center">
                    <h3 className="text-lg font-semibold leading-tight whitespace-normal wrap-break-words wrap-anywhere">
                      {job?.title}
                    </h3>
                  </div>
                )}
              </div>
              {showJobTitle && (
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge}
                  {mobileActionsMenu}
                </div>
              )}
            </div>
            {applicantActions}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex justify-between gap-4">
              <Button
                size="md"
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex min-w-0 items-center self-stretch">
                <h3 className="text-lg font-semibold leading-tight truncate">
                  {job?.title}
                </h3>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        job.paused && "pointer-events-none opacity-50",
                      )}
                    >
                      <Toggle
                        state={job.is_active}
                        onClick={() => void handleToggleActive()}
                        loading={togglingActive}
                      />
                    </div>
                    {statusBadge}
                    {job.paused && (
                      <Button
                        size="xs"
                        variant="outline"
                        scheme="primary"
                        disabled={reEnabling}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleReEnable();
                        }}
                      >
                        {reEnabling ? "Re-activating..." : "Re-activate"}
                      </Button>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {job.paused
                    ? "Re-activate the listing first"
                    : "Toggle the visibility of the listing to students."}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-wrap gap-1">
              {applicantActions ?? desktopActionButtons}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
