import { useAuthContext } from "@/lib/ctx-auth";
import { useJobStatus } from "@/lib/api/student.data.api";
import { Button } from "@betterinternship/components";
import { Heart } from "lucide-react";
import { Job } from "@/lib/db/db.types";
import { cn } from "@betterinternship/components";
import { useJobActions } from "@/lib/api/student.actions.api";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { googleLoginUrl } from "@/lib/api/urls";

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
      window.location.href = googleLoginUrl();
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
      disabled={disabled || (iconOnly && jobActions.toggleSave.isPending)}
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
