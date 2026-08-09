"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@betterinternship/components";
import { cn } from "@/lib/utils";
import { Loader2, Share2 } from "lucide-react";
import { Job } from "@/lib/db/db.types";
import { shareLinkQueryOptions } from "@/lib/api/student.data.api";
import useModalRegistry from "@/components/modals/modal-registry";

export const ShareJobButton = ({
  job,
  className,
  onOpen,
}: {
  job: Job;
  className?: string;
  // Called right before the dialog opens — e.g. to dismiss a mobile actions
  // sheet the button sits in, the way onCopied used to. Fires *after* the
  // mint settles (not on click) so the sheet — and this button's loader —
  // stays visible for the whole wait instead of closing immediately.
  onOpen?: () => void;
}) => {
  const modals = useModalRegistry();
  const queryClient = useQueryClient();
  const [minting, setMinting] = useState(false);

  const handleClick = async () => {
    if (minting || !job.id) return;
    setMinting(true);
    try {
      // Pre-mint so the modal opens with the link already in hand — no
      // in-modal loading flash. A `success: false` result (no thrown error)
      // still gets cached; the modal's own useShareLink() reads it and shows
      // the error + retry state (D13), so failures aren't handled here.
      await queryClient.fetchQuery(shareLinkQueryOptions(job.id));
    } catch {
      // Network-level failure — same deal, let the modal surface it.
    } finally {
      setMinting(false);
    }
    onOpen?.();
    modals.shareJob.open({ job });
  };

  return (
    <Button
      variant="outline"
      onClick={() => void handleClick()}
      disabled={minting}
      name="Share"
      scheme="default"
      size="md"
      className={cn("!p-4", className)}
    >
      {minting ? <Loader2 className="animate-spin" /> : <Share2 />}
      Share
    </Button>
  );
};
