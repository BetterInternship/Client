"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Building2, Users } from "lucide-react";

export default function MyFormCard({
  title,
  requestedAt,
  status, // "Complete" | "Pending action"
  getDownloadUrl,
  waitingFor, // e.g., [{ email: "x@y.com", party: "student-guardian" }]
}: {
  title: string;
  requestedAt?: string | Date;
  status: "Complete" | "Pending action" | string;
  getDownloadUrl?: () => Promise<string>;
  waitingFor?: { email: string; party: PartyKey }[];
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
        badgeText: "Pending action",
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
    <Card className="sm:flex sm:items-center sm:justify-between p-4 sm:p-5">
      <div className="space-y-1 sm:space-y-0 min-w-0">
        <div className="sm:flex gap-3 items-center">
          <Badge type={badgeType} className="pointer-events-none shrink-0">
            {badgeText}
          </Badge>
          <div className="font-medium truncate" title={title}>
            {title}
          </div>
        </div>

        {requested && (
          <div className="text-xs text-muted-foreground">
            Requested: {requested}
          </div>
        )}

        {!isComplete && waitingFor?.length ? (
          <div className="text-xs text-muted-foreground sm:flex items-center gap-2 pt-1">
            <div className="whitespace-nowrap">Waiting for action:</div>
            <PartyPills items={waitingFor} />
          </div>
        ) : null}
      </div>

      <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
        <Button
          className="w-full sm:w-auto"
          onClick={() => void handleDownload()}
          disabled={disabled}
          aria-busy={downloading}
          variant={buttonVariant}
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

/* ───────────────────── Helpers ───────────────────── */

type PartyKey = "student-guardian" | "entity" | string;

const PARTY_MAP: Record<string, { label: string; Icon: React.ElementType }> = {
  "student-guardian": { label: "Guardian", Icon: Users },
  entity: { label: "Entity", Icon: Building2 },
};

function prettyParty(p: PartyKey) {
  const meta = PARTY_MAP[p] ?? {
    label: String(p).replace(/[-_]/g, " "),
    Icon: User,
  };
  return meta;
}

function PartyPills({
  items,
}: {
  items: { email: string; party: PartyKey }[];
  max?: number;
}) {
  if (!items?.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map(({ party, email }) => {
        const { label, Icon } = prettyParty(party);
        return (
          // TODO: ! Go back to this styling. Kinda dont like it rn
          <span
            key={`${party}-${email}`}
            title={`${label} — ${email}`}
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-4 text-muted-foreground"
          >
            <Icon className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">
              <span className="text-primary font-semibold">{label}</span> -{" "}
              {email}
            </span>
          </span>
        );
      })}
    </div>
  );
}
