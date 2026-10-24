"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, cn } from "@betterinternship/components";
import { Loader2, Share2 } from "lucide-react";
import { Job } from "@/lib/db/db.types";
import { shareLinkQueryOptions } from "@/lib/api/student.data.api";
import useModalRegistry from "@/components/modals/modal-registry";

/**
 * A listing's Share action. Opens its pubmat — preview, download, and a button
 * per platform — rather than the plain link sheet. The pubmat's QR is the
 * listing's short share link, so it's minted first (which reuses an existing
 * one); if that fails the plain sheet opens instead, since it's what shows the
 * error and retry. Styled like the listing header's other actions unless told
 * otherwise.
 *
 * @component
 */
export const SharePubmatButton = ({
  job,
  className,
  disabled,
  variant = "ghost",
  size = "sm",
  scheme,
}: {
  job: Job;
  className?: string;
  disabled?: boolean;
  variant?: "ghost" | "outline";
  size?: "sm" | "md";
  scheme?: "primary";
}) => {
  const modals = useModalRegistry();
  const queryClient = useQueryClient();
  const [minting, setMinting] = useState(false);

  const handleClick = async () => {
    if (minting || !job.id) return;
    setMinting(true);
    let link: string | undefined;
    try {
      link = (await queryClient.fetchQuery(shareLinkQueryOptions(job.id)))?.url;
    } catch {
      // Network-level failure — the plain sheet surfaces it.
    } finally {
      setMinting(false);
    }
    if (link) modals.pubmat.open({ job, link });
    else modals.shareJob.open({ job });
  };

  return (
    <Button
      variant={variant}
      size={size}
      scheme={scheme}
      disabled={disabled || minting}
      onClick={() => void handleClick()}
      className={cn(
        "gap-1",
        variant === "ghost" && "hover:bg-primary/[0.035]",
        className,
      )}
    >
      {minting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Share2 size={16} />
      )}
      <span>Share</span>
    </Button>
  );
};
