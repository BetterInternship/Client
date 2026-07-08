"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/db/db.types";

export function PausedListingsBanner({
  jobs,
  onUnpauseAll,
}: {
  jobs: Job[];
  onUnpauseAll: () => Promise<unknown>;
}) {
  const [reEnabling, setReEnabling] = useState(false);
  const pausedCount = jobs.filter((job) => job.paused).length;

  if (!pausedCount) return null;

  const handleReEnableAll = async () => {
    setReEnabling(true);
    try {
      await onUnpauseAll();
    } finally {
      setReEnabling(false);
    }
  };

  return (
    <Banner className="mb-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />
          <span>
            <span className="font-medium">
              {pausedCount} of your listing{pausedCount !== 1 ? "s" : ""}
            </span>{" "}
            {pausedCount !== 1 ? "were" : "was"} paused due to inactivity.
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          scheme="primary"
          disabled={reEnabling}
          onClick={handleReEnableAll}
        >
          {reEnabling ? "Re-enabling..." : "Re-enable all"}
        </Button>
      </div>
    </Banner>
  );
}
