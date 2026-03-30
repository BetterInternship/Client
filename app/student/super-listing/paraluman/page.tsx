"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check, Loader2, Zap } from "lucide-react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import paralumanLogo from "./logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { Turnstile } from "@marsidev/react-turnstile";
import { Badge } from "@/components/ui/badge";
import { useMobile } from "@/hooks/use-mobile";

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

const CEO_PROFILE = {
  name: "Anna Mae YU Lamentillo",
  role: "Paraluman CEO, \nFormer Undersecretary of DICT,\nFormer Chairperson of Build, Build, Build program",
  imageSrc:
    "https://images.gmanews.tv/webpics/2024/10/Untitled_design_(28)_2024_10_03_15_20_56.jpg",
  profileUrl: "https://www.annamaeyulamentillo.com/",
};

const CHALLENGE_PDF_URL =
  "https://drive.google.com/file/d/1Tdbc4EdhBkY3lOInAvE3YSaKhSQyWPwx/view?usp=sharing";
const CHALLENGE_VIDEO_URL = "";
const HIRING_BADGE_TEXT = "No resume needed | Response in 24 hours";

type ParalumanSubmissionForm = {
  email: string;
  fullName: string;
  facebookLink: string;
  submissionLink: string;
  submissionNotes: string;
};

type ParalumanSubmissionResponse = {
  success: boolean;
  message?: string;
};

type PanelKey = "overview" | "challenge" | "submission";
type SubmissionStep = 1 | 2;

const INITIAL_FORM_STATE: ParalumanSubmissionForm = {
  email: "",
  fullName: "",
  facebookLink: "",
  submissionLink: "",
  submissionNotes: "",
};

const PANEL_TABS: Array<{ key: PanelKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "challenge", label: "Challenge" },
  { key: "submission", label: "Submission" },
];

export default function ParalumanPage() {
  const isDevelopment = process.env.NODE_ENV === "development";
  const { isMobile } = useMobile();

  const [form, setForm] = useState<ParalumanSubmissionForm>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState("");
  const [tokenFail, setTokenFail] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [activePanel, setActivePanel] = useState<PanelKey>("overview");
  const [submissionStep, setSubmissionStep] = useState<SubmissionStep>(1);
  const [isSubmissionInView, setIsSubmissionInView] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const panelSectionRef = useRef<HTMLElement | null>(null);
  const submissionPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const root = scrollContainerRef.current;
    if (!sentinel || !root) return;

    setIsAtTop(root.scrollTop <= 1);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtTop(entry.isIntersecting);
      },
      {
        root,
        threshold: 1,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const root = scrollContainerRef.current;
    const target = submissionPanelRef.current;

    if (!isMobile || !root || !target) {
      setIsSubmissionInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSubmissionInView(entry.isIntersecting);
      },
      {
        root,
        threshold: 0.2,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [activePanel, isMobile, submissionStep]);

  const endpoint = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!base) return "/api/super-listings/submission/paraluman";
    return `${base}/super-listings/submission/paraluman`;
  }, []);

  const updateField =
    (field: keyof ParalumanSubmissionForm) =>
    (
      event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
    ) => {
      setForm((previous) => ({ ...previous, [field]: event.target.value }));
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

  const openSubmissionPanel = () => {
    setActivePanel("submission");
    setSubmissionStep(1);

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
      setResultMessage("Submission link is required before proceeding.");
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

      const data = (await response.json()) as ParalumanSubmissionResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not send your submission.");
      }

      setForm(INITIAL_FORM_STATE);
      setSubmissionStep(1);
      setResultMessage("Submission sent to your email.");
    } catch (error) {
      setIsError(true);
      setResultMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your submission.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChallengePdf = CHALLENGE_PDF_URL.trim().length > 0;
  const hasChallengeVideo = CHALLENGE_VIDEO_URL.trim().length > 0;
  const showMobileStickySubmit =
    isMobile && activePanel !== "submission" && !isSubmissionInView;

  return (
    <main
      className={cn(
        "relative isolate h-full min-h-screen bg-[#f6f4fb] text-black",
        headingFont.variable,
        monoFont.variable,
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_16%_18%,rgba(147,51,234,0.14),transparent_35%),radial-gradient(circle_at_84%_2%,rgba(76,29,149,0.12),transparent_33%),radial-gradient(circle_at_50%_90%,rgba(168,85,247,0.08),transparent_40%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-45" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(122deg,rgba(147,51,234,0.08)_0%,transparent_34%,rgba(192,132,252,0.08)_54%,transparent_74%)] opacity-55" />

      <div
        ref={scrollContainerRef}
        className="relative h-full overflow-x-hidden overflow-y-auto pb-24 sm:pb-0"
      >
        <div ref={topSentinelRef} aria-hidden className="h-px w-full" />

        <header
          className={cn(
            " top-0 z-[9999] flex items-center justify-between px-6 py-3 transition-all duration-300 sm:px-8 lg:px-10 border-b border-transparent bg-transparent shadow-none backdrop-blur-0",
          )}
        >
          {/* <header
          className={cn(
            " top-0 z-[9999] flex items-center justify-between px-6 py-3 transition-all duration-300 sm:px-8 lg:px-10",
            isAtTop
              ? "border-b border-transparent bg-transparent shadow-none backdrop-blur-0"
              : "border-b border-purple-200/50 bg-white/80 shadow-sm backdrop-blur-md",
          )}
        > */}
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
        </header>

        <section className="relative px-6 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-5 flex justify-center">
              <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold super-header-badge super-badge-gold text-amber-950 shadow-[0_8px_20px_-14px_rgba(217,119,6,0.45)] sm:px-4 sm:text-sm md:text-base">
                <Zap className="h-4 w-4" />
                <span className="tracking-wide">{HIRING_BADGE_TEXT}</span>
              </div>
            </div>

            <h1 className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.7rem,9vw,4.6rem)] font-black uppercase leading-[1.1] tracking-[-0.02em] text-black">
              <span className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <span>Join</span>
                <Image
                  src={paralumanLogo}
                  alt="Paraluman"
                  className="h-auto w-[clamp(8.5rem,34vw,19rem)]"
                  priority
                />
                <span>as a</span>
              </span>
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Web Development Intern
              </span>
            </h1>
          </div>
        </section>

        <section className="sticky top-0 z-40 px-4 py-2 sm:px-8 sm:py-3 lg:px-10">
          <div className="mx-auto max-w-5xl rounded-[0.33em] border border-purple-200/70 bg-white/80 p-1 shadow-[0_12px_30px_-24px_rgba(109,40,217,0.6)] backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
            <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3">
              {PANEL_TABS.map((tab) => {
                const isActive = activePanel === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() =>
                      tab.key === "challenge" && hasChallengePdf
                        ? window.open(
                            CHALLENGE_PDF_URL,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        : openPanel(tab.key)
                    }
                    className={cn(
                      "min-w-[7.75rem] rounded-[0.33em] px-3 py-2.5 text-center [font-family:var(--font-paraluman-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 sm:min-w-0 sm:px-3 sm:py-3 sm:text-sm md:text-base md:tracking-[0.12em]",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-[0_10px_20px_-14px_rgba(109,40,217,0.85)]"
                        : "text-purple-800/70 hover:bg-purple-100/70 hover:text-purple-900",
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section ref={panelSectionRef} className="relative">
          {activePanel === "overview" && (
            <div className="border-b-2 border-purple-100 px-6 py-8 sm:px-8 lg:px-10">
              <div className="flex flex-col mx-auto max-w-5xl space-y-4  items-center ">
                <p className="max-w-3xl [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/70 sm:text-base text-center">
                  <span className="font-semibold text-purple-700">
                    Paraluman
                  </span>{" "}
                  is a youth-led Philippine news platform making every story
                  accessible in both English and Filipino. Join our team to
                  build and improve how articles are created, processed, and
                  published to reach thousands of readers.
                </p>

                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  {hasChallengePdf && (
                    <div className="group relative isolate block w-full sm:w-auto">
                      <div className="pointer-events-none absolute inset-0 z-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#a855f7_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                      <Link
                        href={CHALLENGE_PDF_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 flex h-14 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-purple-700 bg-white px-10 [font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[0.12em] text-purple-800 transition-all hover:-translate-y-1 hover:bg-purple-50 sm:inline-flex sm:w-auto"
                      >
                        View Challenge
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}

                  <div className="group relative block w-full sm:w-auto">
                    <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#a855f7_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                    <Button
                      size="lg"
                      type="button"
                      onClick={openSubmissionPanel}
                      className="relative flex h-14 w-full rounded-[0.33em] border-2 border-purple-700 bg-gradient-to-r from-purple-600 to-purple-800 px-10 [font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-1 hover:from-purple-700 hover:to-purple-900 sm:inline-flex sm:w-auto"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="mx-auto max-w-5xl">
              {activePanel === "overview" && (
                <div className="space-y-16">
                  {hasChallengeVideo && (
                    <div className="relative overflow-hidden rounded-[0.33em] border-2 border-purple-200 bg-black pt-[56.25%] shadow-lg">
                      <iframe
                        src={CHALLENGE_VIDEO_URL}
                        title="Paraluman challenge video"
                        className="absolute inset-0 h-full w-full"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="inline-block border border-purple-300 bg-white px-4 py-2 rounded-[0.33em]">
                      <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.2em] text-purple-700">
                        The Opportunity
                      </p>
                    </div>
                    <div className="max-w-3xl rounded-[0.33em] bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 p-8 shadow-lg">
                      <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.4rem,3vw,2rem)] font-black leading-tight text-white">
                        Even though you are just an intern, you will be working
                        with the impact makers of this country.
                      </p>
                      <p className="mt-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-purple-100 sm:text-base">
                        What you build will be used by real readers across the
                        Philippines.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8 border-t-2 border-purple-100 pt-12">
                    <div className="flex">
                      <div className="inline-block border border-purple-300 bg-white px-4 py-2 rounded-[0.33em]">
                        <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.2em] text-purple-700">
                          Work With
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-6 text-left sm:flex-row sm:items-end">
                      <div className="relative h-52 w-52 flex-shrink-0 overflow-hidden rounded-[0.33em] border-2 border-purple-200 shadow-xl sm:h-72 sm:w-72">
                        <Image
                          src={CEO_PROFILE.imageSrc}
                          alt={CEO_PROFILE.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="max-w-md align-bottom">
                        <Link
                          href={CEO_PROFILE.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 [font-family:var(--font-paraluman-heading)] text-2xl font-black uppercase tracking-tight sm:text-3xl"
                        >
                          <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent transition-colors group-hover:from-purple-800 group-hover:to-black">
                            {CEO_PROFILE.name}
                          </span>
                          <ArrowUpRight className="h-5 w-5 text-purple-700 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Link>
                        <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-black/65 sm:text-lg">
                          {CEO_PROFILE.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePanel === "submission" && (
                <div ref={submissionPanelRef} className="w-full space-y-6">
                  <div className="rounded-[0.33em] border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 sm:p-8">
                    <div className="mb-6 space-y-4">
                      <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.2em] text-purple-700">
                        Submit Your Work
                      </p>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-[0.33em] border text-sm font-bold",
                              submissionStep === 1
                                ? "border-purple-700 bg-purple-700 text-white"
                                : "border-emerald-600 bg-emerald-600 text-white",
                            )}
                          >
                            {submissionStep === 1 ? (
                              "1"
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                          <span className="[font-family:var(--font-paraluman-mono)] text-[10px] font-semibold uppercase tracking-[0.08em] text-black/70 sm:text-xs sm:tracking-[0.12em]">
                            Submission
                          </span>
                        </div>

                        <div className="h-6 w-px bg-purple-200 sm:h-px sm:w-auto sm:flex-1" />

                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-[0.33em] border text-sm font-bold",
                              submissionStep === 2
                                ? "border-purple-700 bg-purple-700 text-white"
                                : "border-purple-300 bg-white text-purple-500",
                            )}
                          >
                            2
                          </div>
                          <span className="[font-family:var(--font-paraluman-mono)] text-[10px] font-semibold uppercase tracking-[0.08em] text-black/70 sm:text-xs sm:tracking-[0.12em]">
                            Personal Info
                          </span>
                        </div>
                      </div>
                    </div>

                    <form
                      className="space-y-5"
                      onSubmit={(e) => void handleSubmit(e)}
                    >
                      {submissionStep === 1 && (
                        <>
                          <div className="space-y-2">
                            <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                              Submission Link *
                            </label>
                            <Input
                              required
                              value={form.submissionLink}
                              onChange={updateField("submissionLink")}
                              placeholder="https://github.com/yourname/project or demo URL"
                              className="h-11 border-2 border-purple-200 bg-white focus:border-purple-600 focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                            />
                            <p className="[font-family:var(--font-paraluman-mono)] text-xs text-black/50">
                              GitHub repo, live demo, Loom video, or project
                              link.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                              Submission Notes (Optional)
                            </label>
                            <Textarea
                              value={form.submissionNotes}
                              onChange={updateField("submissionNotes")}
                              placeholder="Tell us about your approach, challenges, or key learnings..."
                              className="min-h-28 border-2 border-purple-200 bg-white focus:border-purple-600 focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                            />
                          </div>
                        </>
                      )}

                      {submissionStep === 2 && (
                        <>
                          <div className="space-y-2">
                            <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                              Email Address *
                            </label>
                            <Input
                              required
                              type="email"
                              value={form.email}
                              onChange={updateField("email")}
                              placeholder="name@example.com"
                              className="h-11 border-2 border-purple-200 bg-white focus:border-purple-600 focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                              Full Name *
                            </label>
                            <Input
                              required
                              value={form.fullName}
                              onChange={updateField("fullName")}
                              placeholder="Your full name"
                              className="h-11 border-2 border-purple-200 bg-white focus:border-purple-600 focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                              Facebook Link *
                            </label>
                            <Input
                              required
                              value={form.facebookLink}
                              onChange={updateField("facebookLink")}
                              placeholder="https://facebook.com/yourprofile"
                              className="h-11 border-2 border-purple-200 bg-white focus:border-purple-600 focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                            />
                          </div>

                          {isDevelopment ? (
                            <p className="rounded-[0.33em] bg-purple-100 px-3 py-2 [font-family:var(--font-paraluman-mono)] text-xs text-purple-700">
                              Captcha disabled in development
                            </p>
                          ) : !token ? (
                            <div className="space-y-3">
                              {!tokenFail ? (
                                <Loader>Validating browser...</Loader>
                              ) : (
                                <Badge type="destructive" className="mb-2">
                                  Unable to validate captcha. Please refresh and
                                  try again.
                                </Badge>
                              )}
                              <Turnstile
                                siteKey={
                                  process.env
                                    .NEXT_PUBLIC_SERVER_API_KEY_TURNSTILE!
                                }
                                onSuccess={(t) => {
                                  setToken(t);
                                  setTokenFail(false);
                                }}
                                onError={() => {
                                  setToken("");
                                  setTokenFail(true);
                                }}
                              />
                            </div>
                          ) : (
                            <div className="rounded-[0.33em] bg-emerald-100 px-3 py-2 [font-family:var(--font-paraluman-mono)] text-xs text-emerald-700">
                              Browser verification complete
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex flex-col gap-3 border-t-2 border-purple-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="[font-family:var(--font-paraluman-mono)] text-xs text-black/60">
                          We will send a confirmation to your email
                        </p>

                        {submissionStep === 1 ? (
                          <Button
                            type="button"
                            onClick={goToStepTwo}
                            className="inline-flex w-full items-center justify-center gap-2 border-2 border-purple-700 bg-gradient-to-r from-purple-600 to-purple-800 px-8 py-3 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:from-purple-700 hover:to-purple-900 hover:shadow-lg sm:w-auto"
                          >
                            Next Step
                          </Button>
                        ) : (
                          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setSubmissionStep(1)}
                              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 sm:w-auto"
                            >
                              Back
                            </Button>
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="inline-flex w-full items-center justify-center gap-2 border-2 border-purple-700 bg-gradient-to-r from-purple-600 to-purple-800 px-8 py-3 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:from-purple-700 hover:to-purple-900 hover:shadow-lg disabled:opacity-50 sm:w-auto"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Sending
                                </>
                              ) : (
                                "Submit"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      {resultMessage && (
                        <div
                          className={cn(
                            "rounded-[0.33em] border-2 px-4 py-3 [font-family:var(--font-paraluman-mono)] text-sm",
                            isError
                              ? "border-red-300 bg-red-50 text-red-700"
                              : "border-emerald-300 bg-emerald-50 text-emerald-700",
                          )}
                        >
                          {resultMessage}
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {showMobileStickySubmit && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-purple-200 bg-white/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur sm:hidden">
          <Button
            type="button"
            onClick={openSubmissionPanel}
            className="h-12 w-full rounded-[0.33em] border-2 border-purple-700 bg-gradient-to-r from-purple-600 to-purple-800 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.09em] text-white"
          >
            Submit
          </Button>
        </div>
      )}
    </main>
  );
}

