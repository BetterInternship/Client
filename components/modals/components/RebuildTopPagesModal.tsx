"use client";

import { toast } from "sonner";
import { Button } from "@betterinternship/components";
import { useRebuildTopPages } from "@/lib/api/god.api";

/**
 * Confirms a full rebuild of every Top page (God mode). Behind a modal on
 * purpose: one click re-fetches and re-renders every live university page, so
 * it must not be easy to trigger twice. The button stays disabled while the
 * request is in flight, and the server refuses a second run while one is going.
 */
export function RebuildTopPagesModal({ close }: { close: () => void }) {
  const rebuild = useRebuildTopPages();

  const handleRebuild = async () => {
    if (rebuild.isPending) return;

    const response = await rebuild.mutateAsync();
    if (!response.success) {
      toast.error(response.message || "Could not start the rebuild.");
      return;
    }

    toast.success(
      "Rebuild started. A summary is posted to Discord when it finishes.",
    );
    close();
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2 text-sm leading-relaxed text-gray-600">
        <p>
          This re-fetches the data behind every Top page and rebuilds each
          university&apos;s pages right away, instead of waiting for the next
          Wednesday sweep or Sunday rollover.
        </p>
        <p>
          It runs in the background and can take several minutes. Pages keep
          serving their current version until their new one is ready. You will
          see the result in the listings Discord channel.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          disabled={rebuild.isPending}
          onClick={close}
        >
          Cancel
        </Button>
        <Button
          scheme="primary"
          className="w-full sm:w-auto"
          disabled={rebuild.isPending}
          onClick={() => void handleRebuild()}
        >
          {rebuild.isPending ? "Starting…" : "Rebuild all pages"}
        </Button>
      </div>
    </div>
  );
}
