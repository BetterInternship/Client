"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MyFormCard({
  title,
  requestedAt,
  status, // "Pending" | "Signed"
  getDownloadUrl,
}: {
  title: string;
  requestedAt?: string;
  status: string;
  pendingUrl?: string | null;
  signedUrl?: string | null;
  getDownloadUrl?: () => Promise<string>;
}) {
  const [downloading, setDownloading] = useState(false);

  const requested = requestedAt
    ? new Date(requestedAt).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const isSigned = status === "Signed";

  // Badge style + text based on status
  const { badgeText, badgeType, downloadLabel } = useMemo(() => {
    if (isSigned) {
      return {
        badgeText: "Signed",
        badgeType: "supportive" as const,
        downloadLabel: "Download signed form",
      };
    }
    return {
      badgeText: "Waiting for signature/s",
      badgeType: "warning" as const,
      downloadLabel: "Download unsigned form",
    };
  }, [isSigned]);

  const disabled = downloading;

  const handleDownload = async () => {
    const targetUrl = await getDownloadUrl?.();
    if (!targetUrl) return;
    try {
      setDownloading(true);
      const a = document.createElement("a");
      a.href = targetUrl;
      a.download = ""; // let the browser choose filename
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="sm:flex sm:items-center sm:justify-between">
      <div className="space-y-1 sm:space-y-0 min-w-0">
        <div className="sm:flex gap-3">
          <Badge type={badgeType} className="pointer-events-none shrink-0">
            {badgeText}
          </Badge>
          <div className="font-medium" title={title}>
            {title}
          </div>
        </div>

        {requested && (
          <div className="text-xs text-muted-foreground">
            Requested: {requested}
          </div>
        )}
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          className="w-full sm:w-auto"
          onClick={() => void handleDownload()}
          disabled={disabled}
          aria-busy={downloading}
        >
          {downloading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {downloadLabel}
            </span>
          ) : (
            downloadLabel
          )}
        </Button>
      </div>
    </Card>
  );
}
