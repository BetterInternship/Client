"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import anterioreLogo from "./logo.png";
import { HeroPanel } from "./components/HeroPanel";
import { OverviewPanel } from "./components/OverviewPanel";
import { HowToApplyPanel } from "./components/HowToApplyPanel";
import { ApplyPanel } from "./components/ApplyPanel";
import type {
  AnterioreSubmissionForm,
  OverviewContent,
  PanelKey,
  SubmissionStep,
} from "./components/types";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-anteriore-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-anteriore-mono",
});

const CHALLENGE_PDF_URL =
  "https://drive.google.com/file/d/1A7k32JC_jdpHV6vQpEtcFNH9UdwSZtVG/view?usp=sharing";
const CHALLENGE_VIDEO_URL = "https://www.youtube.com/embed/KUCGr_XDh5M";
const ANTERIORE_SITE_URL = "https://anteriore.com.ph/";
const HIRING_BADGE_TEXT = "No resume needed. Response in 24 hours";

const OVERVIEW_CONTENT: OverviewContent = {
  whoWeAre:
    "Anteriore is a startup that delivers tailor-made IT services that drive businesses forward.",
  opportunity:
    "You'll be working in a startup environment where you'll be given a lot of responsibilities. If you're serious about growth and aspire to become a strong CTO in the future, you'll thrive here.",
  workWith: {
    quote:
      "All the interns I've hired got 6 figure offers after their internships.",
    speaker: "Seaver",
    speakerTitle: "Founder of Anteriore",
  },
};

type AnterioreSubmissionResponse = {
  success: boolean;
  message?: string;
};

const INITIAL_FORM_STATE: AnterioreSubmissionForm = {
  email: "",
  fullName: "",
  facebookLink: "",
  submissionLink: "",
  submissionNotes: "",
};

const PANEL_TABS: Array<{
  key: PanelKey;
  label: string;
  step: string;
}> = [
  { key: "overview", label: "Overview", step: "1" },
  { key: "challenge", label: "How to apply", step: "2" },
];

const PANEL_TRANSITION_MS = 220;

export default function AnteriorePage() {
  const isDevelopment = process.env.NODE_ENV === "development";

  const [form, setForm] = useState<AnterioreSubmissionForm>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState("");
  const [tokenFail, setTokenFail] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelKey>("overview");
  const [renderPanel, setRenderPanel] = useState<PanelKey>("overview");
  const [panelPhase, setPanelPhase] = useState<"in" | "out">("in");
  const [submissionStep, setSubmissionStep] = useState<SubmissionStep>(1);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const panelSectionRef = useRef<HTMLElement | null>(null);
  const submissionPanelRef = useRef<HTMLDivElement | null>(null);
  const panelTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (activePanel === renderPanel) return;

    setPanelPhase("out");

    if (panelTransitionTimerRef.current) {
      clearTimeout(panelTransitionTimerRef.current);
    }

    panelTransitionTimerRef.current = setTimeout(() => {
      setRenderPanel(activePanel);
      requestAnimationFrame(() => setPanelPhase("in"));
    }, PANEL_TRANSITION_MS);

    return () => {
      if (panelTransitionTimerRef.current) {
        clearTimeout(panelTransitionTimerRef.current);
      }
    };
  }, [activePanel, renderPanel]);

  useEffect(() => {
    return () => {
      if (panelTransitionTimerRef.current) {
        clearTimeout(panelTransitionTimerRef.current);
      }
    };
  }, []);

  const endpoint = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!base) return "/api/super-listings/submission/anteriore";
    return `${base}/super-listings/submission/anteriore`;
  }, []);

  const onFieldChange = (
    field: keyof AnterioreSubmissionForm,
    value: string,
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const openPanel = (panel: PanelKey, shouldScroll = false) => {
    setActivePanel(panel);
    if (panel === "submission") {
      setSubmissionStep(1);
    }

    if (!shouldScroll) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panelSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };

  const openChallengePanel = () => {
    openPanel("challenge");
  };

  const goToStepTwo = () => {
    setResultMessage("");
    setIsError(false);

    if (!form.submissionLink.trim()) {
      setIsError(true);
      setResultMessage("Application link is required before proceeding.");
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

      const data = (await response.json()) as AnterioreSubmissionResponse;

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

  const hasChallengeVideo = CHALLENGE_VIDEO_URL.trim().length > 0;

  return (
    <main
      className={cn(
        "relative isolate h-full min-h-screen bg-white text-black",
        headingFont.variable,
        monoFont.variable,
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_16%_18%,rgba(39,75,125,0.14),transparent_35%),radial-gradient(circle_at_84%_2%,rgba(27,52,88,0.12),transparent_33%),radial-gradient(circle_at_50%_90%,rgba(39,75,125,0.08),transparent_40%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-45" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(122deg,rgba(39,75,125,0.08)_0%,transparent_34%,rgba(39,75,125,0.08)_54%,transparent_74%)] opacity-55" />

      <div
        ref={scrollContainerRef}
        className="relative h-full overflow-x-hidden overflow-y-auto pb-24 sm:pb-0"
      >
        <header
          className={cn(
            "top-0 z-[9999] flex items-center justify-between border-b border-transparent bg-transparent px-4 py-3 shadow-none backdrop-blur-0 transition-all duration-300 sm:px-8 lg:px-10",
          )}
        >
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
              href={ANTERIORE_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity duration-200 hover:opacity-75"
            >
              <Image
                src={anterioreLogo}
                alt="Anteriore"
                className="h-7 w-auto [filter:brightness(0)_saturate(100%)_invert(21%)_sepia(17%)_saturate(1612%)_hue-rotate(184deg)_brightness(88%)_contrast(93%)] sm:h-8"
                priority
              />
            </Link>
          </div>
        </header>

        <section className="sticky top-0 z-40 px-4 py-2 sm:px-8 sm:py-3 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-[0.45em] border-2 border-[#274b7d]/35 bg-white/92 p-1 shadow-[0_14px_34px_-26px_rgba(39,75,125,0.45)] backdrop-blur-sm">
              <div className="relative flex items-stretch overflow-hidden rounded-[0.32em] bg-[#eaf0f8]">
                {PANEL_TABS.map((tab, index) => {
                  const isActive = activePanel === tab.key;
                  const isFirst = index === 0;
                  const isLast = index === PANEL_TABS.length - 1;
                  const tabClipPath = isFirst
                    ? "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)"
                    : isLast
                      ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%)"
                      : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)";
                  const tabZIndex = isActive ? 20 : index + 1;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => openPanel(tab.key)}
                      style={{ clipPath: tabClipPath, zIndex: tabZIndex }}
                      className={cn(
                        "relative flex min-h-10 flex-1 items-center justify-center overflow-hidden px-1.5 py-2 text-center [font-family:var(--font-anteriore-mono)] font-semibold uppercase transition-[background,color,box-shadow] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] after:pointer-events-none after:absolute after:inset-0 after:bg-white/20 after:opacity-0 after:transition-opacity after:duration-180 active:after:opacity-100 sm:min-h-[2.625rem] sm:px-2",
                        !isFirst && "-ml-3 sm:-ml-4",
                        isActive
                          ? "bg-gradient-to-r from-[#274b7d] via-[#22416d] to-[#1b3458] text-white shadow-[0_10px_20px_-14px_rgba(39,75,125,0.75)]"
                          : "bg-[#eaf0f8] text-black/70 hover:bg-[#dde7f3] hover:text-black",
                      )}
                    >
                      <span className="inline-flex w-full items-center justify-center gap-1 whitespace-nowrap text-[9px] tracking-[0.02em] sm:gap-2 sm:text-xs sm:tracking-[0.06em]">
                        <span className="inline-block min-w-[1.50em] text-center opacity-70">
                          {tab.step}
                        </span>
                        <span className="text-center">{tab.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section ref={panelSectionRef} className="relative">
          <div className="px-6 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="mx-auto max-w-5xl">
              <div
                className={cn(
                  "transition-all duration-[220ms] ease-out",
                  panelPhase === "out"
                    ? "translate-y-1 opacity-0"
                    : "translate-y-0 opacity-100",
                )}
              >
                {renderPanel === "overview" && (
                  <>
                    <div
                      className={cn(
                        "transition-all duration-[220ms] ease-out",
                        panelPhase === "out"
                          ? "translate-y-1 opacity-0"
                          : "translate-y-0 opacity-100",
                      )}
                    >
                      <HeroPanel
                        hiringBadgeText={HIRING_BADGE_TEXT}
                        siteUrl={ANTERIORE_SITE_URL}
                        onHowToApply={openChallengePanel}
                        showHowToApplyButton={activePanel === "overview"}
                      />
                    </div>
                    <OverviewPanel
                      hasChallengeVideo={hasChallengeVideo}
                      challengeVideoUrl={CHALLENGE_VIDEO_URL}
                      content={OVERVIEW_CONTENT}
                      onGoToApply={openChallengePanel}
                    />
                  </>
                )}

                {renderPanel === "challenge" && (
                  <HowToApplyPanel challengePdfUrl={CHALLENGE_PDF_URL} />
                )}

                {renderPanel === "submission" && (
                  <div ref={submissionPanelRef} className="w-full space-y-6">
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
        </section>
      </div>
    </main>
  );
}
