"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@betterinternship/components";
import { ArrowUpRight } from "lucide-react";
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
  const role = job.title?.trim() || "this internship";
  const questions = [
    `Has anyone applied for ${role} at ${company}? What was the application process like?`,
    `What should I expect during the interview for ${role} at ${company}? Any preparation tips?`,
    `Has anyone interned at ${company}? What were the work culture and mentorship like?`,
    `What are the day-to-day responsibilities for ${role} at ${company}?`,
    `How long does ${company} usually take to respond after an internship application or interview?`,
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
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Choose a question about {company}. You can edit your draft on Reddit
        before posting.
      </p>
      <div className="space-y-2">
        {questions.map((question) => (
          <Button
            key={question}
            type="button"
            variant="outline"
            scheme="default"
            className="h-auto w-full justify-between gap-3 whitespace-normal px-4 py-3 text-left font-normal"
            disabled={opening}
            onClick={() => void openDraft(question)}
          >
            <span>{question}</span>
            <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
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
