"use client";

import { useState } from "react";
import { Button } from "@betterinternship/components";
import { CircleDollarSign, FileText, List, UsersRound } from "lucide-react";
import { useAuthContext } from "@/lib/ctx-auth";
import type { Job } from "@/lib/db/db.types";
import { buildRedditDiscussionUrl } from "@/lib/reddit-discussion";
import { useApplicationsData } from "@/lib/api/student.data.api";
import { useApplicationActions } from "@/lib/api/student.actions.api";

export function RedditDiscussionModal({
  job,
  onComplete,
}: {
  job: Job;
  onComplete: () => void;
}) {
  const auth = useAuthContext();
  const applications = useApplicationsData();
  const actions = useApplicationActions();
  const [error, setError] = useState<string | null>(null);

  const company = job.employer?.name?.trim() || "this company";
  const questions = [
    {
      label: "Work culture",
      icon: UsersRound,
      title: `What is the work culture like at ${company}?`,
      prompt: `Hi! I'd love to learn more about the work culture at ${company}. What's the work environment like, and how do team members typically work together? Any past experiences?`,
    },
    {
      label: "Application process",
      icon: FileText,
      title: `What is the application process like at ${company}?`,
      prompt: `Hi! Has anyone tried applying to ${company}? What's the application process like? Is there anything I should prepare? What should I expect after submitting my application?`,
    },
    {
      label: "Compensation",
      icon: CircleDollarSign,
      title: `Does ${company} offer an internship allowance or other benefits?`,
      prompt:
        "Hi! May I ask if this internship offers an allowance or other benefits? I'd appreciate any details you guys could share, especially if you've worked with them before!",
    },
    {
      label: "Role expectations",
      icon: List,
      title: `What are the day-to-day responsibilities for interns at ${company}?`,
      prompt: `Hi! Has anyone worked for ${company}? Could you share more about the day-to-day responsibilities of this role? What were the expectations they had for you as an intern?`,
    },
  ];

  const openDraft = (title: string, question: string) => {
    if (!auth.isAuthenticated()) return;
    // Reserve the tab directly in the click handler to avoid popup blocking.
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setError(
        "Please allow popups to open Reddit in a new tab, then try again.",
      );
      return;
    }
    tab.opener = null;
    setError(null);
    try {
      const url = buildRedditDiscussionUrl({
        title,
        question,
      });
      tab.location.replace(url);
      const application = applications.data.find(
        (entry) => entry.job_id === job.id,
      );
      if (application?.id) {
        actions.redditReviewClick.mutate({
          applicationId: application.id,
          title,
        });
      }
      onComplete();
    } catch {
      tab.close();
      setError("We couldn’t prepare the Reddit draft. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-primary">Ask about...</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {questions.map(({ label, icon: Icon, title, prompt }) => (
          <Button
            key={label}
            type="button"
            variant="outline"
            scheme="default"
            className="h-12 w-full justify-start gap-3 rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-left font-normal text-gray-700 transition-colors hover:border-primary/35 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => openDraft(title, prompt)}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
