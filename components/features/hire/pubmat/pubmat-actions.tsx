"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import {
  Download,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";
import { Button, cn } from "@betterinternship/components";
import type { Job } from "@/lib/db/db.types";
import {
  SHARE_TARGETS,
  sharePostFromJob,
  type ShareTargetId,
} from "@/lib/share-targets";
import { pubmatFileName, type usePubmatImage } from "./use-pubmat-image";

// lucide has no X logo.
const XLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TARGET_ICONS: Record<
  ShareTargetId,
  ComponentType<{ className?: string }>
> = {
  facebook: Facebook,
  linkedin: Linkedin,
  x: XLogo,
  whatsapp: MessageCircle,
  telegram: Send,
  email: Mail,
};

const iconButton =
  "flex size-9 shrink-0 items-center justify-center rounded-[0.33em] border border-gray-200 text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50";

/**
 * What to do with a pubmat once it's drawn: download it, or share the listing
 * to a platform (lib/share-targets.ts) — each a plain link to that platform's
 * own post screen with the text already filled in.
 *
 * Those links can't carry a file, so the image goes along another way: copied
 * to the clipboard when a platform is picked, to paste into the post, and
 * attached to the device's own share sheet where it allows files. The copy has
 * to happen inside the click, so the platforms wait for the draw to finish; if
 * the draw fails they still work, with the link alone.
 */
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
  const [imageCopy, setImageCopy] = useState<"copied" | "failed">();
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare("share" in navigator), []);

  const post = sharePostFromJob(job, link);
  const platformsReady = status !== "loading";

  // Email can't take a pasted image, so only the others get it copied.
  const handleTarget = (id: ShareTargetId) => {
    if (!image || id === "email") return;
    navigator.clipboard
      .write([new ClipboardItem({ "image/png": image.blob })])
      .then(() => setImageCopy("copied"))
      .catch(() => setImageCopy("failed"));
  };

  const handleNativeShare = () => {
    const file = image
      ? new File([image.blob], pubmatFileName(job), { type: "image/png" })
      : undefined;
    // With a file, the link rides in the text: targets that take images often
    // drop a separate `url`.
    if (file && navigator.canShare?.({ files: [file] })) {
      void navigator.share({
        title: job.title ?? undefined,
        text: `${post.text} ${post.url}`,
        files: [file],
      });
      return;
    }
    void navigator.share({ title: job.title ?? undefined, url: post.url });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button disabled={status !== "ready"} onClick={onDownload}>
          <Download />
        </Button>

        <span className="mx-1 h-6 w-px bg-gray-200" aria-hidden />

        {SHARE_TARGETS.map((target) => {
          const Icon = TARGET_ICONS[target.id];
          return (
            <a
              key={target.id}
              // No href until the draw is done, which leaves the button inert.
              href={platformsReady ? target.href(post) : undefined}
              target={target.id === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={`Share on ${target.label}`}
              title={target.label}
              aria-disabled={!platformsReady}
              onClick={() => handleTarget(target.id)}
              className={cn(
                iconButton,
                !platformsReady && "pointer-events-none opacity-50",
              )}
            >
              <Icon className="size-4" />
            </a>
          );
        })}

        {canShare && (
          <button
            type="button"
            aria-label="More ways to share"
            title="More"
            disabled={!platformsReady}
            onClick={handleNativeShare}
            className={cn(iconButton, "cursor-pointer disabled:opacity-50")}
          >
            <Share2 className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
