"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Loader,
  DownloadIcon,
  CheckCircle,
  Minus,
} from "lucide-react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

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
  waitingFor?: (string | { email?: string })[];
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
  const { badgeText, badgeType, buttonDisabled } = useMemo(() => {
    if (isComplete) {
      return {
        badgeText: "Complete",
        badgeType: "supportive" as const,
        buttonDisabled: false,
      };
    }
    return {
      badgeText: "Pending responses...",
      badgeType: "warning" as const,
      buttonDisabled: true,
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
          <SignatoryPills items={waitingFor ?? []} isComplete={isComplete} />
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
              <Loader className="w-3 h-3 animate-spin" />
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
function SignatoryPills({
  items,
  isComplete,
}: {
  items: (
    | string
    | {
        email?: string;
        title?: string;
        signed?: boolean;
        party?: string;
        order?: number;
      }
  )[];
  isComplete: boolean;
  max?: number;
}) {
  if (!Array.isArray(items) || items.length === 0) return null;

  console.log(items);

  const orders: Record<string, number> = {
    entity: 0,
    "student-guardian": 1,
    university: 2,
  };
  // normalize legacy string entries to objects { party, email? }
  const normalized = items.map((it) =>
    typeof it === "string"
      ? {
          party: it,
          title: it,
          email: undefined,
          signed: false,
          order: orders?.[it] ?? 0,
        }
      : { ...it, order: it.party ? (orders[it.party] ?? 0) : 0 },
  );

  return (
    <div className="flex flex-col flex-wrap items-left gap-1.5">
      {normalized
        .filter((s) => s.email || s.title)
        .toSorted((a, b) => a.order - b.order)
        .map(({ email, title, signed }, idx) => {
          console.log(idx);
          return (
            <span
              key={`${email ?? idx}`}
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-4 text-muted-foreground"
            >
              {signed || isComplete ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : idx === 0 ? (
                <span className="text-warning font-semibold">
                  Currently waiting for:
                </span>
              ) : (
                <span className="font-semibold">Pending signature:</span>
              )}
              <span className="truncate">
                {idx === 0 ? (
                  <AnimatedShinyText>
                    {email ? <>{email ?? title}</> : null}
                  </AnimatedShinyText>
                ) : email ? (
                  <>{email ?? title}</>
                ) : null}
              </span>
            </span>
          );
        })}
    </div>
  );
}
