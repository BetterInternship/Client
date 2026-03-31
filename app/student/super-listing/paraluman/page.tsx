"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  FolderOpen,
  Globe,
  Loader2,
  Video,
  Zap,
} from "lucide-react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import paralumanLogo from "./logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { Turnstile } from "@marsidev/react-turnstile";
import { Badge } from "@/components/ui/badge";

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
  name: "Anna Mae Yu Lamentillo",
  role: "Paraluman CEO, \nFormer Undersecretary of DICT,\nFormer Chairperson of Build, Build, Build program",
  imageSrc:
    "https://images.gmanews.tv/webpics/2024/10/Untitled_design_(28)_2024_10_03_15_20_56.jpg",
  profileUrl: "https://www.annamaeyulamentillo.com/",
};

const CHALLENGE_PDF_URL =
  "https://drive.google.com/file/d/1Tdbc4EdhBkY3lOInAvE3YSaKhSQyWPwx/view?usp=sharing";
const CHALLENGE_VIDEO_URL = "";
const HIRING_BADGE_TEXT = "No resume needed | Response in 24 hours";

const GOOGLE_DRIVE_FILE_ID_PATTERNS = [/\/file\/d\/([^/?]+)/, /[?&]id=([^&]+)/];

const getGoogleDriveFileId = (url: string) => {
  for (const pattern of GOOGLE_DRIVE_FILE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

const appendPdfViewerHash = (url: string) => {
  const [base, hash] = url.split("#", 2);
  const viewerHash = "toolbar=0&navpanes=0&scrollbar=1";
  return `${base}#${hash ? `${hash}&${viewerHash}` : viewerHash}`;
};

const getChallengeEmbedUrl = (url: string) => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";

  if (trimmedUrl.includes("drive.google.com")) {
    const fileId = getGoogleDriveFileId(trimmedUrl);
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  return appendPdfViewerHash(trimmedUrl);
};

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
  { key: "submission", label: "Apply" },
];

export default function ParalumanPage() {
  const isDevelopment = process.env.NODE_ENV === "development";

  const [form, setForm] = useState<ParalumanSubmissionForm>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState("");
  const [tokenFail, setTokenFail] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelKey>("overview");
  const [submissionStep, setSubmissionStep] = useState<SubmissionStep>(1);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const panelSectionRef = useRef<HTMLElement | null>(null);
  const submissionPanelRef = useRef<HTMLDivElement | null>(null);

  const endpoint = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!base) return "/api/super-listings/submission/paraluman";
    return `${base}/super-listings/submission/paraluman`;
  }, []);
  const challengeEmbedUrl = useMemo(
    () => getChallengeEmbedUrl(CHALLENGE_PDF_URL),
    [],
  );

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
        throw new Error(data.message || "Could not send your application.");
      }

      setForm(INITIAL_FORM_STATE);
      setSubmissionStep(1);
      setResultMessage("Application sent to your email.");
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

  const hasChallengePdf = challengeEmbedUrl.length > 0;
  const hasChallengeVideo = CHALLENGE_VIDEO_URL.trim().length > 0;

  return (
    <main
      className={cn(
        "relative isolate h-full min-h-screen bg-[#f6f4fb] text-black",
        headingFont.variable,
        monoFont.variable,
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_16%_18%,rgba(114,6,140,0.14),transparent_35%),radial-gradient(circle_at_84%_2%,rgba(114,6,140,0.12),transparent_33%),radial-gradient(circle_at_50%_90%,rgba(114,6,140,0.08),transparent_40%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-45" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(122deg,rgba(114,6,140,0.08)_0%,transparent_34%,rgba(114,6,140,0.08)_54%,transparent_74%)] opacity-55" />

      <div
        ref={scrollContainerRef}
        className="relative h-full overflow-x-hidden overflow-y-auto pb-24 sm:pb-0"
      >
        <header
          className={cn(
            " top-0 z-[9999] flex items-center justify-between px-6 py-3 transition-all duration-300 sm:px-8 lg:px-10 border-b border-transparent bg-transparent shadow-none backdrop-blur-0",
          )}
        >
          {" "}
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

        <section className="sticky top-0 z-40 px-4 py-2 sm:px-8 sm:py-3 lg:px-10">
          <div className="mx-auto max-w-lg rounded-[0.33em] border border-[rgba(114,6,140,0.3)] bg-white/80 p-2 shadow-[0_12px_30px_-24px_rgba(114,6,140,0.6)] backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
            <div className="relative">
              <div className="grid grid-cols-3 gap-1">
                {PANEL_TABS.map((tab) => {
                  const isActive = activePanel === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => openPanel(tab.key)}
                      className={cn(
                        "relative w-full overflow-hidden rounded-[0.33em] px-2.5 py-2 text-center [font-family:var(--font-paraluman-mono)] text-[10px] font-semibold uppercase tracking-[0.06em] transition-all duration-200 transform-gpu active:scale-[0.97] after:pointer-events-none after:absolute after:inset-0 after:rounded-[0.33em] after:bg-white/20 after:opacity-0 after:transition-opacity after:duration-150 active:after:opacity-100 sm:px-2.5 sm:py-2 sm:text-xs md:px-2.5 md:py-2 md:text-xs md:tracking-[0.06em]",
                        isActive
                          ? "bg-gradient-to-r from-[#72068c] to-[#5a0570] text-white shadow-[0_8px_16px_-12px_rgba(114,6,140,0.75)]"
                          : "text-black/70 hover:bg-white/70 hover:text-black",
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative px-6 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl space-y-8 text-center sm:space-y-10">
            {/* Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold super-header-badge super-badge-gold text-amber-950 shadow-[0_8px_20px_-14px_rgba(217,119,6,0.45)]">
                <Zap className="h-4 w-4" />
                <span>{HIRING_BADGE_TEXT}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Logo */}
              <div>
                <Image
                  src={paralumanLogo}
                  alt="Paraluman"
                  className="mx-auto h-auto w-[clamp(16rem,55vw,30rem)]"
                  priority
                />
              </div>

              {/* Headline */}
              <div className="inline-block rounded-[0.33em] border-2 border-[#72068c] bg-white px-5 py-2.5 sm:px-6 sm:py-3">
                <h1 className="[font-family:var(--font-paraluman-heading)] text-[clamp(1rem,4vw,1.8rem)] font-black uppercase tracking-[-0.02em] text-[#72068c]">
                  looking for: web dev interns
                </h1>
              </div>
            </div>
          </div>
        </section>

        <section ref={panelSectionRef} className="relative">
          {activePanel === "overview" && (
            <div className="px-6 sm:px-8 lg:px-10">
              <div className="flex flex-col mx-auto max-w-5xl space-y-4 items-center ">
                <p className="max-w-3xl [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/70 sm:text-base text-center">
                  <span className="font-semibold text-[#72068c]">
                    Paraluman
                  </span>{" "}
                  is a youth-led Philippine news platform making every story
                  accessible in both English and Filipino.
                  <span className="mt-8 block">
                    Join our team to build and{" "}
                    <span className="font-bold text-[#72068c]">
                      improve how articles are created, processed, and published
                    </span>{" "}
                    to reach thousands of readers.
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="px-6 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="mx-auto max-w-5xl">
              {activePanel === "overview" && (
                <div className="space-y-16 pt-14 sm:pt-20">
                  {hasChallengeVideo && (
                    <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[rgba(114,6,140,0.3)] bg-black pt-[56.25%] shadow-lg">
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
                    <div className="inline-block rounded-[0.33em] border border-[rgba(114,6,140,0.4)] bg-white px-4 py-2">
                      <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#72068c]">
                        The Opportunity
                      </p>
                    </div>
                    <div className="max-w-3xl rounded-[0.33em] bg-gradient-to-br from-[#72068c] via-[#5a0570] to-[#4a0460] p-8 text-white shadow-lg">
                      <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.4rem,3vw,2rem)] font-black leading-tight text-white">
                        Even though you are just an intern, you will be working
                        with the impact makers of this country.
                      </p>
                      <p className="mt-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-white/85 sm:text-base">
                        What you build will be used by real readers across the
                        Philippines.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8 pt-12">
                    <div className="flex">
                      <div className="inline-block rounded-[0.33em] border border-[rgba(114,6,140,0.4)] bg-white px-4 py-2">
                        <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#72068c]">
                          Work With
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-6 text-left sm:flex-row sm:items-end">
                      <div className="relative h-52 w-52 flex-shrink-0 overflow-hidden rounded-[0.33em] border-2 border-[rgba(114,6,140,0.3)] shadow-xl sm:h-72 sm:w-72">
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
                          <span className="bg-gradient-to-r from-[#72068c] to-[#5a0570] bg-clip-text text-transparent transition-colors">
                            {CEO_PROFILE.name}
                          </span>
                          <ArrowUpRight className="h-5 w-5 text-[#72068c] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Link>
                        <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-black/65 sm:text-lg">
                          {CEO_PROFILE.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePanel === "challenge" && (
                <div className="space-y-6 pt-6 sm:pt-10">
                  <div className="flex flex-col gap-4 rounded-[0.33em] border-2 border-[rgba(114,6,140,0.2)] bg-white/80 p-5 shadow-[0_18px_45px_-35px_rgba(114,6,140,0.65)] sm:flex-row sm:items-end sm:justify-between sm:p-6">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <h2 className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.5rem,3vw,2.2rem)] font-black uppercase tracking-[-0.03em] text-[#72068c]">
                          Challenge Brief
                        </h2>
                        <p className="max-w-3xl [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/70 sm:text-base">
                          Read the challenge below. Have a submission ready?
                          send an application now!
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={openSubmissionPanel}
                      className="inline-flex h-11 w-full items-center justify-center rounded-[0.33em] border-2 border-[#72068c] bg-gradient-to-r from-[#72068c] to-[#5a0570] px-6 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:shadow-lg sm:w-auto"
                    >
                      Apply Now
                    </Button>
                  </div>

                  {hasChallengePdf ? (
                    <div className="-mx-6 -mb-12 overflow-hidden border-y-2 border-[rgba(114,6,140,0.22)] bg-white shadow-[0_30px_80px_-50px_rgba(114,6,140,0.75)] sm:mx-0 sm:mb-0 sm:rounded-[0.33em] sm:border-2">
                      <iframe
                        src={challengeEmbedUrl}
                        title="Paraluman challenge brief"
                        className="h-[70vh] min-h-[32rem] w-full bg-white"
                        loading="lazy"
                      >
                        Challenge brief could not be loaded.
                      </iframe>
                    </div>
                  ) : (
                    <div className="rounded-[0.33em] border-2 border-dashed border-[rgba(114,6,140,0.28)] bg-white/70 px-6 py-10 text-center">
                      <p className="[font-family:var(--font-paraluman-mono)] text-sm text-black/60">
                        The challenge brief is not available yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activePanel === "submission" && (
                <div ref={submissionPanelRef} className="w-full space-y-6">
                  <div className="rounded-[0.33em] border-2 border-[rgba(114,6,140,0.3)] bg-gradient-to-br from-[rgba(114,6,140,0.05)] to-white p-4 sm:p-8">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="[font-family:var(--font-paraluman-mono)]  font-black uppercase  text-[#72068c]">
                        Apply
                      </p>

                      <div className="w-full sm:w-64 sm:text-right">
                        <p className="[font-family:var(--font-paraluman-mono)] text-[10px] font-semibold uppercase  text-black/55">
                          Step {submissionStep} -{" "}
                          {submissionStep === 1
                            ? "Submission Link"
                            : "Personal Info"}
                        </p>
                        <div className="mt-2 grid w-full grid-cols-2 gap-1.5 sm:ml-auto sm:w-40">
                          <span
                            className={cn(
                              "h-1.5 w-full rounded-full transition-colors",
                              submissionStep >= 1
                                ? "bg-[#72068c]"
                                : "bg-black/15",
                            )}
                          />
                          <span
                            className={cn(
                              "h-1.5 w-full rounded-full transition-colors",
                              submissionStep >= 2
                                ? "bg-[#72068c]"
                                : "bg-black/15",
                            )}
                          />
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
                              Application Link *
                            </label>
                            <Input
                              required
                              value={form.submissionLink}
                              onChange={updateField("submissionLink")}
                              className="h-11 border-2 border-[rgba(114,6,140,0.3)] bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                            />
                            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 [font-family:var(--font-paraluman-mono)] text-[10px] text-black/55 sm:text-[11px]">
                              <span className="inline-flex items-center gap-1">
                                <FolderOpen className="h-3 w-3 shrink-0" />
                                Google Drive
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <FileText className="h-3 w-3 shrink-0" />
                                Google Docs
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Globe className="h-3 w-3 shrink-0" />
                                Live Demo
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Video className="h-3 w-3 shrink-0" />
                                YouTube
                              </span>
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                              Application Notes (Optional)
                            </label>
                            <Textarea
                              value={form.submissionNotes}
                              onChange={updateField("submissionNotes")}
                              className="min-h-28 border-2 border-[rgba(114,6,140,0.3)] bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
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
                              className="h-11 border-2 border-[rgba(114,6,140,0.3)] bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
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
                              className="h-11 border-2 border-[rgba(114,6,140,0.3)] bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
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
                              className="h-11 border-2 border-[rgba(114,6,140,0.3)] bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                            />
                          </div>

                          {isDevelopment ? (
                            <p className="rounded-[0.33em] bg-[rgba(114,6,140,0.1)] px-3 py-2 [font-family:var(--font-paraluman-mono)] text-xs text-[#72068c]">
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

                      <div className="flex flex-col gap-3 border-t-2 border-[rgba(114,6,140,0.15)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="[font-family:var(--font-paraluman-mono)] text-xs text-black/60">
                          We will send a confirmation to your email
                        </p>

                        {submissionStep === 1 ? (
                          <Button
                            type="button"
                            onClick={goToStepTwo}
                            className="inline-flex w-full items-center justify-center gap-2 border-2 border-[#72068c] bg-gradient-to-r from-[#72068c] to-[#5a0570]  [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:shadow-lg sm:w-auto"
                          >
                            Next Step
                          </Button>
                        ) : (
                          <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setSubmissionStep(1)}
                              className="inline-flex h-11 w-1/3 items-center justify-center gap-1.5 rounded-[0.33em] border-2 border-[rgba(114,6,140,0.35)] bg-white/90 px-3 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.08em] text-[#72068c] transition-colors hover:bg-white sm:w-auto"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              Back
                            </Button>
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="inline-flex h-11 w-2/3 items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#72068c] bg-gradient-to-r from-[#72068c] to-[#5a0570] px-6 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 sm:min-w-36 sm:w-auto"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Sending
                                </>
                              ) : (
                                "Apply"
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
    </main>
  );
}
