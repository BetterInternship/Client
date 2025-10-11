"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Job } from "@/lib/db/db.types";

export type MassApplyResultsData = {
  ok: Job[];
  skipped: { job: Job; reason: string }[];
  failed: { job: Job; error: string }[];
};

export function MassApplyResults({
  data,
  onClose,
  onClearSelection,
}: {
  data: MassApplyResultsData;
  onClose: () => void;
  onClearSelection: () => void;
}) {
  return (
    <div className="mx-auto space-y-4 ">
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-green-700">Applied</span>
          <span className="font-medium">{data.ok.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-amber-700">Skipped</span>
          <span className="font-medium">{data.skipped.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-red-700">Failed</span>
          <span className="font-medium">{data.failed.length}</span>
        </div>
      </div>

      {data.skipped.length > 0 && (
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-2">Skipped</div>
          <ul className="space-y-1 text-sm text-gray-700 max-h-40 overflow-auto">
            {data.skipped.map(({ job, reason }) => (
              <li key={`skip-${job.id}`}>
                <span className="font-medium">{job.title}</span>{" "}
                <span className="text-gray-500">— {reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.failed.length > 0 && (
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-2">Failed</div>
          <ul className="space-y-1 text-sm text-gray-700 max-h-40 overflow-auto">
            {data.failed.map(({ job, error }) => (
              <li key={`fail-${job.id}`}>
                <span className="font-medium">{job.title}</span>{" "}
                <span className="text-gray-500">— {error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="outline" onClick={onClearSelection}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear selection
        </Button>
      </div>
    </div>
  );
}
