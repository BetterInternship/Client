"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ClipboardCopy,
  Download,
  Link2,
  PencilLine,
  Share2,
} from "lucide-react";
import { Button } from "@betterinternship/components";
import type { Job } from "@/lib/db/db.types";
import { sharePostFromJob } from "@/lib/share-targets";
import { useAppContext } from "@/lib/ctx-app";
import { pubmatFileName, type usePubmatImage } from "./use-pubmat-image";
import { ShareMenu, type ShareMenuItem } from "./pubmat-share-menu";

/**
 * Shares a listing's poster. The big Share button opens one menu of everything
 * a post needs: the poster with its caption (through the device's share sheet,
 * on phones), the poster alone, the file, and the link.
 *
 * File sharing is distinct from link sharing: never silently drop the poster.
 */
export function PubmatActions({
  job,
  link,
  image,
  status,
  onDownload,
  onEdit,
  alignRight = false,
  editing = false,
}: {
  job: Job;
  link: string;
  image: ReturnType<typeof usePubmatImage>["image"];
  status: ReturnType<typeof usePubmatImage>["status"];
  onDownload: () => Promise<void>;
  onEdit?: () => void;
  alignRight?: boolean;
  editing?: boolean;
}) {
  const { isMobile } = useAppContext();
  const [canShareImage, setCanShareImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [prepared, setPrepared] = useState<{ key: string; file: File }>();
  const ready = status === "ready" && !!image;

  useEffect(() => {
    setMessage("");
    setCanShareImage(false);
    if (!image || !navigator.share || !navigator.canShare) return;
    try {
      const file = new File([], pubmatFileName(job), {
        type: "image/png",
      });
      setCanShareImage(navigator.canShare({ files: [file] }));
    } catch {
      // The share sheet still opens with the caption alone.
    }
  }, [image, job]);

  const prepareFile = useCallback(async () => {
    if (!image) return;
    const blob = await image.getPng();
    const file = new File([blob], pubmatFileName(job), { type: "image/png" });
    setPrepared({ key: image.key, file });
    return file;
  }, [image, job]);
  const prepareOnOpen = useCallback(() => {
    if (canShareImage)
      void prepareFile().catch(() => {
        setMessage("Couldn’t prepare the poster. Please try again.");
      });
  }, [canShareImage, prepareFile]);

  const handleDownload = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await onDownload();
    } catch {
      setMessage("Couldn’t download the poster. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleCopyPoster = async () => {
    if (!ready || !image || busy) return;
    setMessage("");
    setBusy(true);
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": image.getPng() }),
      ]);
      setMessage("Poster copied. Paste it into your post.");
    } catch {
      // Firefox before 127, or a browser that won't write images.
      try {
        await onDownload();
        setMessage(
          "Your browser couldn’t copy the image, so the poster was downloaded instead.",
        );
      } catch {
        setMessage("Couldn’t copy or download the poster. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  // Phones have the device share sheet, which takes the poster file itself.
  // A browser that can't attach files still gets the caption and link.
  const handleShareAsPost = async () => {
    if (!ready || !image || busy) return;
    if (!navigator.share) {
      await handleCopyPoster();
      return;
    }
    const post = sharePostFromJob(job, link);
    const caption = `${post.text} ${post.url}`;
    setMessage("");
    setBusy(true);
    try {
      // Native sharing needs a fresh user gesture. Normally prepared when the
      // menu opens; if not ready yet, the next tap uses the prepared snapshot.
      if (canShareImage && prepared?.key !== image.key) {
        await prepareFile();
        setMessage("Poster ready. Tap Share as post again.");
        return;
      }
      await navigator.share(
        canShareImage
          ? {
              title: job.title ?? undefined,
              text: caption,
              files: [prepared!.file],
            }
          : { title: job.title ?? undefined, text: caption },
      );
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setMessage("Couldn’t open the share sheet. Copy the poster instead.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setMessage("Listing link copied.");
    } catch {
      setMessage("Couldn’t copy the link. Please try again.");
    }
  };

  const shareAsPost: ShareMenuItem = {
    id: "post",
    label: "Share as post",
    icon: <Share2 />,
    primary: true,
    disabled: !ready,
    onSelect: () => void handleShareAsPost(),
  };

  const items: ShareMenuItem[] = [
    // The device share sheet is a phone thing: a desktop browser that has one
    // only hands over a link, so the poster itself is the useful action there.
    ...(isMobile ? [shareAsPost] : []),
    {
      id: "poster",
      label: "Copy poster",
      icon: <ClipboardCopy />,
      primary: !isMobile,
      disabled: !ready,
      onSelect: () => void handleCopyPoster(),
    },
    {
      id: "download",
      label: "Download poster",
      icon: <Download />,
      disabled: !ready,
      onSelect: () => void handleDownload(),
    },
    {
      id: "link",
      label: "Copy link",
      icon: <Link2 />,
      onSelect: () => void handleCopyLink(),
    },
  ];

  return (
    <div
      className={`flex ${alignRight ? "lg:w-auto" : "w-full"} flex-col items-center gap-2`}
    >
      <div className="flex items-center justify-center gap-2">
        {onEdit && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onEdit}
              aria-label={editing ? "Discard edit" : "Edit"}
              className="h-10 gap-2 px-4 text-gray-600"
            >
              <PencilLine aria-hidden="true" />
              <span className="whitespace-nowrap">
                {editing ? "Discard edit" : "Edit"}
              </span>
            </Button>
          </>
        )}
        <ShareMenu
          items={items}
          busy={busy}
          disabled={!ready}
          onOpen={prepareOnOpen}
        />
      </div>
      {message && (
        <p role="status" className="text-center text-xs text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}
