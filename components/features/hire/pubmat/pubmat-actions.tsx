"use client";

import { useEffect, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";
import { Button } from "@betterinternship/components";
import type { Job } from "@/lib/db/db.types";
import { sharePostFromJob } from "@/lib/share-targets";
import { pubmatFileName, type usePubmatImage } from "./use-pubmat-image";

/** File sharing is distinct from link sharing: never silently drop the poster. */
export function PubmatActions({
  job,
  link,
  image,
  status,
  onDownload,
}: {
  job: Job;
  link: string;
  image: ReturnType<typeof usePubmatImage>["image"];
  status: ReturnType<typeof usePubmatImage>["status"];
  onDownload: () => void;
}) {
  const [canShareImage, setCanShareImage] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("");
  const ready = status === "ready" && !!image;

  useEffect(() => {
    setMessage("");
    setCanShareImage(false);
    if (!image || !navigator.share || !navigator.canShare) return;
    try {
      const file = new File([image.blob], pubmatFileName(job), {
        type: "image/png",
      });
      setCanShareImage(navigator.canShare({ files: [file] }));
    } catch {
      // Download remains available when the browser cannot share files.
    }
  }, [image, job]);

  const handleShare = async () => {
    if (!ready || sharing || !canShareImage) return;
    const file = new File([image.blob], pubmatFileName(job), {
      type: "image/png",
    });
    const post = sharePostFromJob(job, link);
    setMessage("");
    setSharing(true);
    try {
      await navigator.share({
        title: job.title ?? undefined,
        text: `${post.text} ${post.url}`,
        files: [file],
      });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setMessage(
          "Couldn’t share the image. Download the poster and upload it instead.",
        );
      }
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setMessage("Listing link copied.");
    } catch {
      setMessage("Couldn’t copy the link. Please try again.");
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          expandIcon
          disabled={!ready}
          onClick={onDownload}
          aria-label="Download poster"
          title="Download poster"
        >
          <Download aria-hidden="true" />
          <span className="button-label">Download</span>
        </Button>
        <Button
          variant="outline"
          expandIcon
          onClick={() => void handleCopy()}
          aria-label="Copy listing link"
          title="Copy listing link"
        >
          <Copy aria-hidden="true" />
          <span className="button-label">Copy link</span>
        </Button>
        {canShareImage && (
          <Button
            variant="outline"
            expandIcon
            aria-label="Share image"
            title="Share image"
            disabled={!ready || sharing}
            onClick={() => void handleShare()}
          >
            <Share2 aria-hidden="true" />
            <span className="button-label">Share</span>
          </Button>
        )}
      </div>
      {message && (
        <p role="status" className="text-center text-xs text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}
