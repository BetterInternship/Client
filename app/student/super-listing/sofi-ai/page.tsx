"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { OverviewPanel } from "./components/OverviewPanel";
import { HowToApplyPanel } from "./components/HowToApplyPanel";
import { ApplyPanel } from "./components/ApplyPanel";
import { JobDetailsRail } from "./components/JobDetailsRail";
import doodlePack from "../../companies/sofi-ai/doodle-pack.png";
import type {
  PanelKey,
  SofiAiSubmissionForm,
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

const CHALLENGE_PDF_URL = "https://sofitech.ai/";
const SOFI_AI_LOGO_URL =
  "https://sofitech.ai/_next/static/media/sofi-ai-chat-support-automation-logo-vector.80ec9e4e.png";

type SofiAiSubmissionResponse = {
  success: boolean;
  message?: string;
};

const INITIAL_FORM_STATE: SofiAiSubmissionForm = {
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
  { key: "challenge", label: "Application" },
];

const DOODLE_SPRITES = {
  sparkle: { row: 0, col: 1 },
  arrow: { row: 0, col: 3 },
  circleAccent: { row: 1, col: 1 },
  wavyLine: { row: 2, col: 1 },
} as const;

type DoodleName = keyof typeof DOODLE_SPRITES;

function Doodle({ name, className }: { name: DoodleName; className?: string }) {
  const { row, col } = DOODLE_SPRITES[name];
  const x = (col / 3) * 100 + 8;
  const y = (row / 2) * 100 + 12;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-[1] block aspect-[384/341] overflow-hidden bg-transparent bg-no-repeat select-none",
        className,
      )}
    >
      <span
        className="block h-full w-full bg-no-repeat"
        style={{
          backgroundImage: `url(${doodlePack.src})`,
          backgroundPosition: `${x}% ${y}%`,
          backgroundSize: "400% 300%",
        }}
      />
    </span>
  );
}

export default function SofiAiSuperListingPage() {
  const isDevelopment = process.env.NODE_ENV === "development";

  const [form, setForm] = useState<SofiAiSubmissionForm>(INITIAL_FORM_STATE);
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
    if (!base) return "/api/super-listings/submission/sofi-ai";
    return `${base}/super-listings/submission/sofi-ai`;
  }, []);

  const onFieldChange = (field: keyof SofiAiSubmissionForm, value: string) => {
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

    if (shouldScroll) {
      scrollToPanelSection();
    }
  };

  const openChallengePanel = () => {
    openPanel("challenge", true);
  };

  const openSubmissionPanel = () => {
    setActivePanel("challenge");
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

      const data = (await response.json()) as SofiAiSubmissionResponse;

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
        "relative isolate min-h-screen overflow-x-hidden bg-[#f7fffd] text-[#052338]",
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
      )}
    >
      <header className="sticky top-0 z-50 border-b border-[#052338]/8 bg-white/92 px-5 py-3 backdrop-blur sm:px-8">
        <div className="relative mx-auto flex h-8 max-w-5xl items-center justify-center">
          <Link
            href="/companies/sofi-ai"
            className="absolute left-0 inline-flex h-8 w-8 items-center justify-center text-[#052338]/45 transition-colors duration-200 hover:text-[#052338]"
            aria-label="Back to Sofi AI company page"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="inline-flex items-center gap-2">
            <Image
              src="/BetterInternshipLogo.png"
              alt="BetterInternship logo"
              width={32}
              height={32}
              className="h-7 w-7"
              priority
            />
            <span className="[font-family:var(--font-paraluman-heading)] text-sm font-bold text-[#052338]/45">
              &times;
            </span>
            <Image
              src={SOFI_AI_LOGO_URL}
              alt="Sofi AI logo"
              width={150}
              height={46}
              className="h-auto w-14 grayscale brightness-0 contrast-150"
              priority
            />
          </div>
        </div>
      </header>

      <div className="pointer-events-none fixed inset-0 -z-20 bg-[#f7fffd]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(13,59,51,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,59,51,0.055)_1px,transparent_1px)] bg-[size:44px_44px] opacity-40" />
      <div className="pointer-events-none fixed -right-28 top-0 -z-10 h-96 w-96 rounded-full bg-[#BFFFF3]/32 blur-3xl" />
      <Doodle
        name="circleAccent"
        className="-left-16 top-36 hidden w-36 opacity-30 sm:block lg:left-6 lg:top-40"
      />
      <Doodle
        name="sparkle"
        className="right-4 top-32 hidden w-24 opacity-35 sm:block lg:right-14"
      />
      <Doodle
        name="arrow"
        className="-right-16 top-[23rem] hidden w-44 opacity-25 lg:block"
      />
      <Doodle
        name="wavyLine"
        className="bottom-12 right-8 hidden w-44 opacity-30 lg:block"
      />

      <section
        ref={panelSectionRef}
        className="relative z-10 px-5 pb-20 sm:px-8"
      >
        <div className="mx-auto max-w-5xl">
          <div className=" pt-8">
            <h1 className="[font-family:var(--font-paraluman-heading)] text-[2.35rem] font-bold leading-[1.02] tracking-[-0.055em] text-[#052338] sm:text-[3rem] lg:text-[3.4rem]">
              UI/UX Intern
            </h1>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[16.25rem_minmax(0,1fr)] lg:gap-12">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <JobDetailsRail />
            </div>

            <div className="min-w-0">
              <div className="rounded-[0.75em] border border-[rgba(0,80,60,0.055)] bg-white/55 px-6 shadow-[0_18px_48px_-42px_rgba(5,35,56,0.28)] backdrop-blur-[2px]">
                <div className="border-b border-[#052338]/12">
                  <div className="flex gap-7 overflow-x-auto">
                    {PANEL_TABS.map((tab) => {
                      const isActive = activePanel === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => openPanel(tab.key)}
                          className={cn(
                            "relative inline-flex h-11 shrink-0 items-center [font-family:var(--font-paraluman-heading)] text-sm font-semibold transition-colors duration-200",
                            isActive
                              ? "text-[#00A886]"
                              : "text-[#052338]/45 hover:text-[#052338]",
                          )}
                          aria-pressed={isActive}
                        >
                          {tab.label}
                          <span
                            className={cn(
                              "absolute bottom-[-1px] left-0 h-px w-full transition-opacity duration-200",
                              isActive
                                ? "bg-[#00A886] opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-8 sm:pt-9">
                  {activePanel === "overview" && (
                    <div id="sofi-ai-overview-anchor" className="w-full">
                      <OverviewPanel onGoToApply={openChallengePanel} />
                    </div>
                  )}

                  {activePanel === "challenge" && (
                    <div className="space-y-12">
                      <HowToApplyPanel
                        challengePdfUrl={CHALLENGE_PDF_URL}
                        onGoToApply={openSubmissionPanel}
                      />
                      <div ref={submissionPanelRef} className="pt-10">
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
