import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/db/db.types";
import { useRouter } from "next/navigation";

interface DeleteModalFormProps {
  job: Job;
  deleteJob: (jobId: string) => Promise<void>;
  clearJob: () => void;
  close: () => void;
}

export function ListingsDeleteModal({
  job,
  deleteJob,
  clearJob,
  close,
}: DeleteModalFormProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!job.id) return close();
    setDeleting(true);
    await deleteJob(job.id);
    clearJob();
    setDeleting(false);
    close();
    router.push("/dashboard");
  };

  return (
    <div className="p-8 pt-0 h-full">
      <div className="text-lg mb-4">
        Are you sure you want to delete{" "}
        <span className="font-bold line-clamp-2 truncate break-words whitespace-pre-wrap">
          "{job.title}" <span className="font-normal">?</span>
        </span>
      </div>
      <div className="w-full flex flex-row items-end justify-end space-x-2">
        <Button
          variant="outline"
          scheme="destructive"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
        <Button variant="outline" disabled={deleting} onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
