"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Download, Share2 } from "lucide-react";
import { Button, cn } from "@betterinternship/components";
import {
  FacebookLogo,
  LinkedInLogo,
  TelegramLogo,
  WhatsAppLogo,
  XLogo,
} from "@/components/ui/brand-icons";
import type { Job } from "@/lib/db/db.types";
import {
  SHARE_TARGETS,
  sharePostFromJob,
  type ShareTargetId,
} from "@/lib/share-targets";
import { pubmatFileName, type usePubmatImage } from "./use-pubmat-image";

const TARGET_ICONS: Record<
  ShareTargetId,
  ComponentType<{ className?: string }>
> = {
  facebook: FacebookLogo,
  linkedin: LinkedInLogo,
  x: XLogo,
  whatsapp: WhatsAppLogo,
  telegram: TelegramLogo,
};
const iconButton =
  "flex size-9 shrink-0 items-center justify-center rounded-[0.33em] border border-gray-200 text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50";

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
    if (!ready || sharing) return;
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

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          disabled={!ready}
          onClick={onDownload}
          aria-label="Download poster"
          title="Download poster"
        >
          <Download aria-hidden="true" />
        </Button>
        <span className="mx-1 h-6 w-px bg-gray-200" aria-hidden="true" />
        {SHARE_TARGETS.map((target) => {
          const Icon = TARGET_ICONS[target.id];
          return (
            <a
              key={target.id}
              href={
                status !== "loading"
                  ? target.href(sharePostFromJob(job, link))
                  : undefined
              }
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share link on ${target.label}`}
              title={`Share link on ${target.label}`}
              aria-disabled={status === "loading"}
              className={cn(
                iconButton,
                status === "loading" && "pointer-events-none opacity-50",
              )}
            >
              <Icon className="size-5" />
            </a>
          );
        })}
        {canShareImage && (
          <Button
            disabled={!ready || sharing}
            onClick={() => void handleShare()}
          >
            <Share2 aria-hidden="true" />
            {sharing ? "Sharing…" : "Share image"}
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
