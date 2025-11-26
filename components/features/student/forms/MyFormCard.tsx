"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  User,
  Building2,
  Users,
  UserIcon,
  Loader,
  DownloadIcon,
} from "lucide-react";

export default function MyFormCard({
  title,
  requestedAt,
  status, // "Complete" | "Pending action"
  getDownloadUrl,
  waitingFor,
}: {
  title: string;
  requestedAt?: string | Date;
  status: "Complete" | "Pending action" | (string & {});
  getDownloadUrl?: () => Promise<string>;
  waitingFor?: (string | { email?: string; party: PartyKey })[]; // accepts both legacy string array and new object array
}) {
  const [downloading, setDownloading] = useState(false);

  const requested =
    requestedAt instanceof Date
      ? requestedAt.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : requestedAt
        ? new Date(requestedAt).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

  const isComplete = status === "Complete";

  // Badge style + text based on status
  type ButtonVariant =
    | "default"
    | "ghost"
    | "link"
    | "outline"
    | null
    | undefined;
  const { badgeText, badgeType, downloadLabel, buttonDisabled, buttonVariant } =
    useMemo(() => {
      if (isComplete) {
        return {
          badgeText: "Complete",
          badgeType: "supportive" as const,
          downloadLabel: "Download form",
          buttonDisabled: false,
          buttonVariant: "default" as ButtonVariant,
        };
      }
      return {
        badgeText: "Pending responses...",
        badgeType: "warning" as const,
        downloadLabel: "Waiting for action",
        buttonDisabled: true,
        buttonVariant: "outline" as ButtonVariant,
      };
    }, [isComplete]);

  const disabled = downloading || buttonDisabled;

  const handleDownload = async () => {
    const targetUrl = await getDownloadUrl?.();
    if (!targetUrl) return;
    try {
      setDownloading(true);
      const a = document.createElement("a");
      a.href = targetUrl;
      a.download = ""; // let the browser choose the filename
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="sm:flex flex-col sm:items-start sm:justify-between p-4 sm:p-5">
      <div className="sm:flex sm:flex-col gap-0 items-start">
        <div className="font-medium truncate" title={title}>
          {title}
        </div>

        {requested && (
          <div className="text-xs text-muted-foreground">
            Requested: {requested}
          </div>
        )}

        <div className="text-xs text-muted-foreground flex flex-col items-left gap-1 mt-3">
          <PartyPills items={waitingFor ?? []} />
        </div>

        <Button
          className="p-0 flex w-full mt-5 sm:w-auto gap-0 bg-transparent border-transparent hover:cursor-pointer hover:opacity-80 hover:bg-transparent transition-all"
          onClick={() => void handleDownload()}
          aria-busy={downloading}
          disabled={disabled}
          size="xs"
        >
          <Badge
            className="pointer-events-none shrink-0 rounded-r-none"
            type={badgeType}
          >
            {badgeText}
          </Badge>
          <Badge
            className="w-full sm:w-8 rounded-l-none opacity-80 pointer-events-none"
            type={disabled ? "accent" : "supportive"}
          >
            {downloading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
            ) : disabled ? (
              <Loader className="w-3 h-3" />
            ) : (
              <DownloadIcon className="w-3 h-3" />
            )}
          </Badge>
        </Button>
      </div>
    </Card>
  );
}

/* ───────────────────── Helpers ───────────────────── */

type PartyKey = "student-guardian" | "entity" | (string & {});
const PARTY_MAP: Record<string, { order: number; Icon: React.ElementType }> = {
  university: { Icon: Loader, order: 3 },
  "student-guardian": { Icon: Loader, order: 2 },
  entity: { Icon: Loader, order: 1 },
};

function PartyPills({
  items,
}: {
  items: (string | { email?: string; party: PartyKey })[];
  max?: number;
}) {
  if (!Array.isArray(items) || items.length === 0) return null;

  // normalize legacy string entries to objects { party, email? }
  const normalized = items.map((it) =>
    typeof it === "string" ? { party: it, email: undefined } : it,
  );

  return (
    <div className="flex flex-col flex-wrap items-left gap-1.5">
      {normalized.map(({ party, email }, idx) => {
        return (
          <span
            key={`${party}-${email ?? idx}`}
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-4 text-muted-foreground"
          >
            <Loader className="h-3.5 w-3.5" />
            <span className="truncate">{email ? <>{email}</> : null}</span>
          </span>
        );
      })}
    </div>
  );
}
