import { useAuthContext } from "@/lib/ctx-auth";
import { useSavedJobsData } from "@/lib/api/student.data.api";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Job } from "@/lib/db/db.types";
import { cn } from "@/lib/utils";
import { useJobActions } from "@/lib/api/student.actions.api";

export const SaveJobButton = ({ job }: { job: Job }) => {
  const auth = useAuthContext();
  const savedJobs = useSavedJobsData();
  const jobActions = useJobActions();

  const handleSave = async () => {
    if (!auth.isAuthenticated()) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      return;
    }
    await jobActions.toggleSave.mutateAsync(job.id ?? "");
  };

  return (
    <Button
      variant="outline"
      onClick={() => handleSave()}
      size={"md"}
      className="text-md"
      scheme={savedJobs.isJobSaved(job.id ?? "") ? "destructive" : "default"}
    >
      <Heart
        className={cn(
          "w-4 h-4",
          savedJobs.isJobSaved(job.id ?? "") ? "fill-current" : ""
        )}
      />
      {savedJobs.isJobSaved(job.id ?? "")
        ? jobActions.toggleSave.isPending
          ? "Unsaving..."
          : "Saved"
        : jobActions.toggleSave.isPending
        ? "Saving..."
        : "Save"}
    </Button>
  );
};
