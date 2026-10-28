import { useAuthContext } from "@/lib/ctx-student-auth";
import { useJobStatus } from "@/lib/api/student.data.api";
import { Button } from "@betterinternship/components";
import { Heart } from "lucide-react";
import { Job } from "@/lib/db/db.types";
import { cn } from "@betterinternship/components";
import { useJobActions } from "@/lib/api/student.actions.api";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { consumeJobLoginIntent, startStudentLogin } from "@/lib/student-login";

export const SaveJobButton = ({
  job,
  disabled,
  iconOnly = false,
  className,
  animateSave = false,
}: {
  job: Job;
  disabled?: boolean;
  iconOnly?: boolean;
  className?: string;
  /** Scoped motion opt-in: other listing surfaces keep their current behavior. */
  animateSave?: boolean;
}) => {
  const jobs = useJobStatus();
  const auth = useAuthContext();
  const jobActions = useJobActions();
  const saved = jobs.isJobSaved(job.id ?? "");
  const heartRef = useRef<SVGSVGElement>(null);
  const [confirmedSave, setConfirmedSave] = useState<{
    id: string | null | undefined;
    sequence: number;
  } | null>(null);
  const playedSequence = useRef(0);
  useEffect(() => {
    if (
      disabled ||
      !job.id ||
      !auth.isAuthenticated() ||
      jobs.isPending ||
      jobs.error ||
      jobActions.toggleSave.isPending
    )
      return;
    if (!consumeJobLoginIntent("save", job.id)) return;
    // The endpoint toggles: never turn an already-saved listing into an unsave.
    if (saved) return;
    void jobActions.toggleSave
      .mutateAsync(job.id)
      .then((response) => {
        if (response.success === false)
          throw new Error(response.message ?? "Save failed");
        toast.success("Listing saved.");
      })
      .catch(() =>
        toast.error("Couldn't save your listing. Please select Save to retry."),
      );
  }, [
    auth,
    disabled,
    job.id,
    jobs.isPending,
    jobs.error,
    saved,
    jobActions.toggleSave,
  ]);

  useEffect(() => {
    if (
      !animateSave ||
      !saved ||
      confirmedSave?.id !== job.id ||
      !confirmedSave ||
      playedSequence.current === confirmedSave.sequence
    )
      return;
    playedSequence.current = confirmedSave.sequence;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = heartRef.current?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.16)" },
        { transform: "scale(1)" },
      ],
      { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
    return () => animation?.cancel();
  }, [animateSave, saved, job.id, confirmedSave]);

  const handleSave = async () => {
    if (!auth.isAuthenticated()) {
      startStudentLogin({ action: "save", jobId: job.id });
      return;
    }
    // Start the delight only after our own request succeeds and the saved
    // query confirms it. Hydration/refetches must not replay the animation.
    const response = await jobActions.toggleSave.mutateAsync(job.id ?? "");
    if (animateSave && response.success === false)
      throw new Error(response.message ?? "Save failed");
    if (animateSave && !saved)
      setConfirmedSave((previous) => ({
        id: job.id,
        sequence: (previous?.sequence ?? 0) + 1,
      }));
  };

  return (
    <Button
      variant={iconOnly ? "ghost" : "outline"}
      onClick={() => {
        if (!disabled) {
          void handleSave().catch(() =>
            toast.error(
              "Couldn't update your saved listing. Please try again.",
            ),
          );
        }
      }}
      size={iconOnly ? "icon" : "md"}
      className={cn(iconOnly ? "h-11 w-11 shrink-0 !p-0" : "!p-4", className)}
      disabled={disabled || jobActions.toggleSave.isPending}
      aria-label={
        iconOnly
          ? jobs.isJobSaved(job.id ?? "")
            ? `Remove ${job.title ?? "listing"} from saved`
            : `Save ${job.title ?? "listing"}`
          : undefined
      }
      aria-pressed={iconOnly ? jobs.isJobSaved(job.id ?? "") : undefined}
      aria-busy={iconOnly ? jobActions.toggleSave.isPending : undefined}
      scheme={jobs.isJobSaved(job.id ?? "") ? "destructive" : "default"}
    >
      <Heart
        ref={heartRef}
        style={
          animateSave
            ? { transformBox: "fill-box", transformOrigin: "center" }
            : undefined
        }
        aria-hidden="true"
        className={cn(
          "w-4 h-4",
          jobs.isJobSaved(job.id ?? "") ? "fill-current" : "",
        )}
      />
      {!iconOnly &&
        (jobs.isJobSaved(job.id ?? "")
          ? jobActions.toggleSave.isPending
            ? "Unsaving..."
            : "Saved"
          : jobActions.toggleSave.isPending
            ? "Saving..."
            : "Save")}
    </Button>
  );
};
