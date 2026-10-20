"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@betterinternship/components";
import { CircleDollarSign, FileText, List, UsersRound } from "lucide-react";
import { shareLinkQueryOptions } from "@/lib/api/student.data.api";
import { useAuthContext } from "@/lib/ctx-auth";
import type { Job } from "@/lib/db/db.types";
import { buildRedditDiscussionUrl } from "@/lib/reddit-discussion";

export function RedditDiscussionModal({
  job,
  onComplete,
}: {
  job: Job;
  onComplete: () => void;
}) {
  const auth = useAuthContext();
  const queryClient = useQueryClient();
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(false);
  const pendingTab = useRef<Window | null>(null);
  const isAuthenticated = auth.isAuthenticated();
  const authenticated = useRef(isAuthenticated);

  useEffect(() => {
    authenticated.current = isAuthenticated;
    if (!isAuthenticated) pendingTab.current?.close();
  }, [isAuthenticated]);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      pendingTab.current?.close();
      pendingTab.current = null;
    };
  }, []);

  const company = job.employer?.name?.trim() || "this company";
  const questions = [
    {
      label: "Work culture",
      icon: UsersRound,
      prompt: `Hi! I'd love to learn more about the work culture at ${company}. What's the work environment like, and how do team members typically work together? Any past experiences?`,
    },
    {
      label: "Application process",
      icon: FileText,
      prompt: `Hi! Has anyone tried applying to ${company}? What's the application process like? Is there anything I should prepare? What should I expect after submitting my application?`,
    },
    {
      label: "Compensation",
      icon: CircleDollarSign,
      prompt:
        "Hi! May I ask if this internship offers an allowance or other benefits? I'd appreciate any details you guys could share, especially if you've worked with them before!",
    },
    {
      label: "Role expectations",
      icon: List,
      prompt: `Hi! Has anyone worked for ${company}? Could you share more about the day-to-day responsibilities of this role? What were the expectations they had for you as an intern?`,
    },
  ];

  const openDraft = async (question: string) => {
    if (opening || pendingTab.current || !job.id || !auth.isAuthenticated())
      return;
    // Reserve the tab directly in the click handler to avoid popup blocking.
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setError(
        "Please allow popups to open Reddit in a new tab, then try again.",
      );
      return;
    }
    tab.opener = null;
    tab.document.title = "Preparing Reddit draft…";
    pendingTab.current = tab;
    setOpening(true);
    setError(null);
    try {
      const result = await queryClient.fetchQuery(
        shareLinkQueryOptions(job.id),
      );
      if (!result.success || !result.url)
        throw new Error("Missing listing link");
      const url = buildRedditDiscussionUrl({
        companyName: job.employer?.name,
        jobTitle: job.title,
        listingUrl: result.url,
        question,
      });
      if (!active.current || !authenticated.current || tab.closed) {
        tab.close();
        return;
      }
      tab.location.replace(url);
      // Detach before closing the portal so unmount cleanup preserves Reddit.
      pendingTab.current = null;
      onComplete();
    } catch {
      tab.close();
      void queryClient.invalidateQueries({
        queryKey: shareLinkQueryOptions(job.id).queryKey,
        exact: true,
        refetchType: "none",
      });
      if (active.current)
        setError("We couldn’t load the listing link. Please try again.");
    } finally {
      if (pendingTab.current === tab) pendingTab.current = null;
      if (active.current) setOpening(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-primary">Ask about...</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {questions.map(({ label, icon: Icon, prompt }) => (
          <Button
            key={label}
            type="button"
            variant="outline"
            scheme="default"
            className="h-12 w-full justify-start gap-3 rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-left font-normal text-gray-700 transition-colors hover:border-primary/35 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary"
            disabled={opening}
            onClick={() => void openDraft(prompt)}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>
      {opening && (
        <p role="status" className="text-sm text-gray-600">
          Preparing your Reddit draft…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
