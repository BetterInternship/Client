"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function MyFormCard({
  title,
  requestedAt,
  status,
  pendingUrl,
  signedUrl,
}: {
  title: string;
  requestedAt?: string;
  status: "Pending" | "Signed";
  pendingUrl?: string;
  signedUrl?: string;
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
  const targetUrl = isSigned ? signedUrl : pendingUrl;
  const disabled = downloading;

  const handleDownload = async () => {
    if (!targetUrl) return;
    try {
      setDownloading(true);
      const a = document.createElement("a");
      a.href = targetUrl;
      a.download = "";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="sm:flex sm:justify-between items-center">
      <div className="py-3 px-4">
        <div className="font-medium">{title}</div>
        {requested && (
          <div className="text-xs text-muted-foreground">
            Requested: {requested}
          </div>
        )}
        <div className="text-xs text-muted-foreground">Status: {status}</div>
      </div>

      <div className="flex gap-2 w-full sm:w-auto p-3 sm:p-0">
        <Button
          className="w-full sm:w-auto"
          onClick={handleDownload}
          disabled={disabled}
          aria-busy={downloading}
        >
          Download
        </Button>
      </div>
    </Card>
  );
}
