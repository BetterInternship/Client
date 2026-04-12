"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import { OverviewPanel } from "./components/OverviewPanel";
import { HowToApplyPanel } from "./components/HowToApplyPanel";
import { ApplyPanel } from "./components/ApplyPanel";
import { HeroPanel } from "./components/HeroPanel";
import { JobDetailsRail } from "./components/JobDetailsRail";
import cebuPacificLogo from "./logo.png";
import type {
  PanelKey,
  CebuPacificSubmissionForm,
  SubmissionStep,
} from "./components/types";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-paraluman-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-paraluman-mono",
});

const bodyFont = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-paraluman-body",
});

const CHALLENGE_PDF_URL = "https://www.cebupacificair.com/";

type CebuPacificSubmissionResponse = {
  success: boolean;
  message?: string;
};

const INITIAL_FORM_STATE: CebuPacificSubmissionForm = {
  email: "",
  fullName: "",
  facebookLink: "",
  submissionLink: "",
  submissionNotes: "",
};

const PANEL_TABS: Array<{
  key: PanelKey;
  label: string;
}> = [
  { key: "overview", label: "Overview" },
  { key: "challenge", label: "Challenge" },
  { key: "submission", label: "Submit" },
];

export default function CebuPacificPage() {
  const isDevelopment = process.env.NODE_ENV === "development";

  const [form, setForm] =
    useState<CebuPacificSubmissionForm>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState("");
  const [tokenFail, setTokenFail] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelKey>("overview");
  const [submissionStep, setSubmissionStep] = useState<SubmissionStep>(1);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const panelSectionRef = useRef<HTMLElement | null>(null);
  const submissionPanelRef = useRef<HTMLDivElement | null>(null);

  const endpoint = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!base) return "/api/super-listings/submission/cebu-pacific";
    return `${base}/super-listings/submission/cebu-pacific`;
  }, []);

  const onFieldChange = (
    field: keyof CebuPacificSubmissionForm,
    value: string,
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const scrollToPanelSection = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panelSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };

  const openPanel = (panel: PanelKey, shouldScroll = false) => {
    setActivePanel(panel);
    setResultMessage("");
    setIsError(false);

    if (panel === "submission") {
      setSubmissionStep(1);
    }

    if (shouldScroll) {
      scrollToPanelSection();
    }
  };

  const openChallengePanel = () => {
    openPanel("challenge", true);
  };

  const openSubmissionPanel = () => {
    setActivePanel("submission");
    setSubmissionStep(1);
    setResultMessage("");
    setIsError(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        submissionPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };

  const goToStepTwo = () => {
    setResultMessage("");
    setIsError(false);

    if (!form.submissionLink.trim()) {
      setIsError(true);
      setResultMessage(
        "Challenge submission link is required before proceeding.",
      );
      return;
    }

    setSubmissionStep(2);
    requestAnimationFrame(() => {
      submissionPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const goToNextStep = () => {
    if (submissionStep === 1) {
      goToStepTwo();
    }
  };

  const goToPreviousStep = () => {
    setResultMessage("");
    setIsError(false);
    setSubmissionStep((previous) =>
      previous > 1 ? ((previous - 1) as SubmissionStep) : 1,
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResultMessage("");
    setIsError(false);

    if (submissionStep !== 2) {
      setIsError(true);
      setResultMessage("Please complete all steps before submitting.");
      return;
    }

    if (
      !form.email.trim() ||
      !form.fullName.trim() ||
      !form.facebookLink.trim()
    ) {
      setIsError(true);
      setResultMessage("Please complete your personal information.");
      return;
    }

    if (!isDevelopment && !token) {
      setIsError(true);
      setResultMessage("Please complete the browser verification first.");
      return;
    }

    const combinedNotes = [
      form.submissionNotes.trim()
        ? `Notes: ${form.submissionNotes.trim()}`
        : "",
      `Full Name: ${form.fullName.trim()}`,
      `Facebook Link: ${form.facebookLink.trim()}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          submissionLink: form.submissionLink.trim(),
          submissionNotes: combinedNotes,
          "cf-token": isDevelopment ? "dev-bypass" : token,
        }),
      });

      const data = (await response.json()) as CebuPacificSubmissionResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not send your application.");
      }

      const submittedEmailAddress = form.email.trim();
      setForm(INITIAL_FORM_STATE);
      setSubmissionStep(1);
      setSubmittedEmail(submittedEmailAddress);
      setHasSubmitted(true);
      setResultMessage("");
    } catch (error) {
      setIsError(true);
      setResultMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your application.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={cn(
        "relative isolate min-h-screen bg-[#f7fbff] text-black",
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_8%_12%,rgba(37,116,187,0.15),transparent_38%),radial-gradient(circle_at_88%_8%,rgba(243,217,138,0.15),transparent_34%),radial-gradient(circle_at_50%_92%,rgba(37,116,187,0.08),transparent_44%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.045)_1px,transparent_1px)] bg-[size:46px_46px] opacity-28" />

      <header className="top-0 z-[9999] flex items-center justify-between border-b border-transparent bg-transparent px-4 py-3 shadow-none backdrop-blur-0 transition-all duration-300 sm:px-8 lg:px-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="transition-opacity duration-200 hover:opacity-70"
          >
            <Image
              src="/BetterInternshipLogo.png"
              alt="BetterInternship"
              width={40}
              height={40}
              className="h-10 w-10 sm:h-12 sm:w-12"
            />
          </Link>

          <span className="text-xs font-semibold uppercase text-black/45">
            x
          </span>

          <Link
            href="https://www.cebupacificair.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-1 py-0.5 transition-opacity duration-200 hover:opacity-75"
          >
            <Image
              src={cebuPacificLogo}
              alt="Cebu Pacific"
              className="h-7 w-auto sm:h-8"
              priority
            />
          </Link>
        </div>
      </header>

      <section className="px-4 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          <HeroPanel
            onOpenChallenge={openChallengePanel}
            onOpenSubmission={openSubmissionPanel}
          />
        </div>
      </section>

      <section ref={panelSectionRef} className="px-4 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-5 px-0 pb-2">
            {PANEL_TABS.map((tab) => {
              const isActive = activePanel === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => openPanel(tab.key)}
                  className={cn(
                    "relative inline-flex min-h-11 items-center justify-center py-2 [font-family:var(--font-paraluman-heading)] text-sm font-medium tracking-[-0.02em] transition-colors duration-200",
                    isActive
                      ? "text-[#173f69]"
                      : "text-[#234e78]/70 hover:text-[#173f69]",
                  )}
                  aria-pressed={isActive}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 h-px w-full transition-opacity duration-200",
                      isActive
                        ? "bg-[#173f69] opacity-100"
                        : "bg-transparent opacity-0",
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div className="border border-[#2574BB]/10 bg-white shadow-[0_28px_70px_-48px_rgba(19,70,111,0.32)]">
            <div className="grid gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-10 lg:px-8">
              <JobDetailsRail />

              <div className="min-w-0 border-t border-[#2574BB]/10 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                {activePanel === "overview" && (
                  <div id="cebu-overview-anchor" className="w-full">
                    <OverviewPanel onGoToApply={openChallengePanel} />
                  </div>
                )}

                {activePanel === "challenge" && (
                  <HowToApplyPanel
                    challengePdfUrl={CHALLENGE_PDF_URL}
                    onGoToApply={openSubmissionPanel}
                  />
                )}

                {activePanel === "submission" && (
                  <div ref={submissionPanelRef} className="w-full">
                    <ApplyPanel
                      form={form}
                      submissionStep={submissionStep}
                      hasSubmitted={hasSubmitted}
                      submittedEmail={submittedEmail}
                      isSubmitting={isSubmitting}
                      isError={isError}
                      resultMessage={resultMessage}
                      isDevelopment={isDevelopment}
                      token={token}
                      tokenFail={tokenFail}
                      turnstileSiteKey={
                        process.env.NEXT_PUBLIC_SERVER_API_KEY_TURNSTILE
                      }
                      onFieldChange={onFieldChange}
                      onNextStep={goToNextStep}
                      onBackStep={goToPreviousStep}
                      onSubmit={(event) => {
                        void handleSubmit(event);
                      }}
                      onBackToOverview={() => openPanel("overview", true)}
                      onTokenSuccess={(t) => {
                        setToken(t);
                        setTokenFail(false);
                      }}
                      onTokenError={() => {
                        setToken("");
                        setTokenFail(true);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
