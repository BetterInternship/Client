import { JobDetails } from "@/components/shared/jobs";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/db/db.types";
import Link from "next/link";

interface ListingsDetailsPanelProps {
  selectedJob: Job | null;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onShare: () => void;
  onDelete: () => void;
  updateJob: (jobId: string, job: Partial<Job>) => Promise<any>;
  setIsEditing: (isEditing: boolean) => void;
}

export function ListingsDetailsPanel({
  selectedJob,
  isEditing,
  saving,
  onEdit,
  onSave,
  onCancel,
  onShare,
  onDelete,
  updateJob,
  setIsEditing,
}: ListingsDetailsPanelProps) {
  if (!selectedJob?.id) {
    return (
      <div className="h-full m-auto max-w-[1024px] mx-auto">
        <div className="flex flex-col items-center pt-[25vh] h-screen">
          <div className="opacity-35 mb-10">
            <div className="flex flex-row justify-center w-full mb-4">
              <h1 className="block text-6xl font-heading font-bold ">
                BetterInternship
              </h1>
            </div>
            <div className="flex flex-row justify-center w-full">
              <p className="block text-2xl tracking-tight">
                Better Internships Start Here
              </p>
            </div>
          </div>
          <div className="w-prose text-center border border-blue-500 border-opacity-50 text-blue-500 shadow-sm rounded-[0.33em] opacity-85 p-4 bg-white">
            Click on a job listing to view more details!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1024px] mx-auto">
      <JobDetails
        job={selectedJob}
        // @ts-ignore
        update_job={updateJob}
        actions={
          isEditing
            ? [
                <Button
                  key="save"
                  variant="default"
                  disabled={saving}
                  onClick={onSave}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>,
                <Button
                  key="cancel"
                  variant="outline"
                  scheme="destructive"
                  disabled={saving}
                  onClick={onCancel}
                >
                  Cancel
                </Button>,
              ]
            : [
              <Link href={{
                pathname:"/listings/edit",
                query: {jobId: selectedJob.id}
                }}>
                <Button
                  key="edit"
                  variant="outline"
                  disabled={saving}
                  // onClick={onEdit}
                >
                  Edit
                </Button>
              </Link>,
                // <Button
                //   key="share"
                //   variant="outline"
                //   disabled={saving}
                //   onClick={onShare}
                // >
                //   Share
                // </Button>,
                <Button
                  key="delete"
                  variant="outline"
                  disabled={saving}
                  className="text-red-500 border border-red-300 hover:bg-red-50 hover:text-red-500"
                  onClick={onDelete}
                >
                  Delete
                </Button>,
              ]
        }
      />
    </div>
  );
}
