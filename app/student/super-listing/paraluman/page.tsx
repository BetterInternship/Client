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
import { ArrowUpRight, Loader2 } from "lucide-react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import paralumanLogo from "./logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SuperListingBadge } from "@/components/shared/jobs";
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
  name: "Anna Mae YU Lamentillo",
  role: "Paraluman CEO",
  imageSrc:
    "https://images.gmanews.tv/webpics/2024/10/Untitled_design_(28)_2024_10_03_15_20_56.jpg",
  profileUrl: "https://www.annamaeyulamentillo.com/",
};

const CHALLENGE_PDF_URL =
  "https://drive.google.com/file/d/1Tdbc4EdhBkY3lOInAvE3YSaKhSQyWPwx/view?usp=sharing";

type ParalumanSubmissionForm = {
  email: string;
  submissionLink: string;
  submissionNotes: string;
};

type ParalumanSubmissionResponse = {
  success: boolean;
  message?: string;
};

const INITIAL_FORM_STATE: ParalumanSubmissionForm = {
  email: "",
  submissionLink: "",
  submissionNotes: "",
};

export default function ParalumanPage() {
  const isDevelopment = process.env.NODE_ENV === "development";

  const [form, setForm] = useState<ParalumanSubmissionForm>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState("");
  const [tokenFail, setTokenFail] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const challengeRef = useRef<HTMLElement | null>(null);

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

  const endpoint = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!base) return "/api/super-listings/fff-submission";
    return `${base}/super-listings/fff-submission`;
  }, []);

  const updateField =
    (field: keyof ParalumanSubmissionForm) =>
    (
      event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
    ) => {
      setForm((previous) => ({ ...previous, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResultMessage("");
    setIsError(false);

    if (!isDevelopment && !token) {
      setIsError(true);
      setResultMessage("Please complete the browser verification first.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend currently expects FFF fields; map new Paraluman fields safely.
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Paraluman Candidate",
          email: form.email,
          portfolioUrl: form.submissionLink,
          linkedinUrl: "",
          whyFit:
            form.submissionNotes.trim() ||
            `Submission link: ${form.submissionLink}`,
          "cf-token": isDevelopment ? "dev-bypass" : token,
        }),
      });

      const data = (await response.json()) as ParalumanSubmissionResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not send your submission.");
      }

      setForm(INITIAL_FORM_STATE);
      setResultMessage("Submission sent. Please check your email.");
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

  const scrollToChallenge = () => {
    challengeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const hasChallengePdf = CHALLENGE_PDF_URL.trim().length > 0;

  return (
    <main
      className={cn(
        "relative isolate h-full min-h-screen bg-white text-black",
        headingFont.variable,
        monoFont.variable,
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_16%_18%,rgba(147,51,234,0.14),transparent_35%),radial-gradient(circle_at_84%_2%,rgba(76,29,149,0.12),transparent_33%),radial-gradient(circle_at_50%_90%,rgba(168,85,247,0.08),transparent_40%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-45" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(122deg,rgba(147,51,234,0.08)_0%,transparent_34%,rgba(192,132,252,0.08)_54%,transparent_74%)] opacity-55" />

      <div
        ref={scrollContainerRef}
        className="relative h-full overflow-x-hidden overflow-y-auto"
      >
        <div ref={topSentinelRef} aria-hidden className="h-px w-full" />

        <header
          className={cn(
            "sticky top-0 z-[9999] flex items-center justify-between px-6 pb-2 pt-2 transition-all duration-300 sm:px-8 lg:px-10",
            isAtTop
              ? "border-b border-transparent bg-transparent shadow-none backdrop-blur-0"
              : "backdrop-blur-md",
          )}
        >
          <div className="flex items-center gap-3 sm:gap-4">
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
            <span className="text-xl font-black text-black/30 sm:text-2xl">
              x
            </span>
            <Link
              href="https://www.paraluman.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center transition-opacity duration-200 hover:opacity-80 mt-1 sm:mt-2"
            >
              <Image
                src={paralumanLogo}
                alt="Paraluman"
                className="h-auto w-[clamp(8.5rem,12vw,12rem)]"
                priority
              />
            </Link>
          </div>
        </header>

        <section className="relative mx-auto flex min-h-[calc(100svh-73px)] w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-4xl">
            <div className="relative text-center">
              <SuperListingBadge
                compact
                className="justify-center [font-family:var(--font-paraluman-mono)] text-[11px] font-semibold uppercase tracking-[0.12em]"
              />

              <h1 className="mt-8 [font-family:var(--font-paraluman-heading)] text-[clamp(2.5rem,9vw,5.5rem)] font-black uppercase leading-[0.88] tracking-[-0.05em]">
                <span className="block">
                  <Link
                    href="https://www.paraluman.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-block transition-transform duration-200 "
                  >
                    <Image
                      src={paralumanLogo}
                      alt="Paraluman"
                      className="mx-auto h-auto w-[clamp(19rem,44vw,30rem)] transition-[filter] duration-200 group-hover:brightness-75"
                      priority
                    />
                  </Link>
                </span>
                <span className="block">is challenging you</span>
              </h1>

              <div className="mt-6 inline-flex items-center rounded-lg border-2 border-purple-600 bg-white px-5 py-2">
                <span className="[font-family:var(--font-paraluman-heading)] text-[clamp(0.9rem,2vw,1.1rem)] font-black uppercase tracking-[0.08em] text-purple-700">
                  Web Dev Interns
                </span>
              </div>

              <div className="mt-8 mx-auto max-w-2xl space-y-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/65 sm:text-[15px]">
                <p>
                  <span className="font-semibold text-purple-700">
                    Paraluman
                  </span>{" "}
                  is a youth-led Philippine news platform making every story
                  accessible in both English and Filipino.
                </p>
                <p>
                  We are looking for a{" "}
                  <span className="font-semibold text-purple-700">
                    web development intern
                  </span>{" "}
                  to build and improve how articles are created, processed, and
                  published on the platform.
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-3">
              <div className="group relative inline-block">
                <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#a855f7_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                <Button
                  size="lg"
                  type="button"
                  onClick={scrollToChallenge}
                  className="relative h-16 rounded-none border-2 border-purple-700 bg-gradient-to-r from-purple-600 to-purple-800 px-11 [font-family:var(--font-paraluman-heading)] text-base font-black uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-1 hover:from-purple-700 hover:to-purple-900"
                >
                  View Challenge
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="[font-family:var(--font-paraluman-mono)] text-xs  text-black/65">
                No resume needed
              </p>
            </div>
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
          <div className="space-y-6">
            <div className="flex ">
              <div className="border border-purple-300 bg-white px-4 py-2">
                <p className="[font-family:var(--font-paraluman-mono)] text-xs uppercase tracking-[0.2em] text-purple-700">
                  Work with
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <div className="relative h-44 w-44 overflow-hidden rounded-xl border border-purple-200 shadow-[0_14px_28px_-18px_rgba(109,40,217,0.45)] sm:h-52 sm:w-52">
                <Image
                  src={CEO_PROFILE.imageSrc}
                  alt={CEO_PROFILE.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="pb-1 text-left">
                <Link
                  href={CEO_PROFILE.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 [font-family:var(--font-paraluman-heading)] text-3xl font-black uppercase tracking-tight text-purple-900 underline underline-offset-4 hover:text-purple-700 sm:text-4xl"
                >
                  {CEO_PROFILE.name}
                  <ArrowUpRight className="h-6 w-6" />
                </Link>
                <p className="[font-family:var(--font-paraluman-mono)] mt-2 text-xs uppercase tracking-[0.18em] text-black/60">
                  {CEO_PROFILE.role}
                </p>
              </div>
            </div>

            <div className="ml-auto max-w-4xl border-2 border-purple-300 bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 p-6 text-white shadow-[0_24px_50px_-28px_rgba(109,40,217,0.9)] sm:p-8">
              <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.4rem,3.2vw,2.4rem)] font-black leading-tight tracking-[-0.03em] text-white">
                Even though you are just an intern, you'll be working with the
                impact makers of this country.
              </p>
              <p className="mt-3 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-purple-50/95 sm:text-[15px]">
                What you build will be used by real readers.
              </p>
            </div>
          </div>
        </section>

        <section
          ref={challengeRef}
          className="relative mx-auto flex min-h-[calc(100svh-73px)] w-full max-w-6xl flex-col justify-center px-6 py-10 sm:px-8 lg:px-10"
        >
          <div>
            <SuperListingBadge
              compact
              className="mb-4 [font-family:var(--font-paraluman-mono)] text-[11px] font-semibold uppercase tracking-[0.12em]"
            />
          </div>

          <div className="relative">
            <div className="relative border-2 border-purple-600 bg-gradient-to-b from-purple-50 via-purple-50/70 to-white shadow-[0_20px_45px_-30px_rgba(168,85,247,0.8)]">
              <div className="border-b-2 border-purple-600 bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-6 sm:px-8 sm:py-8">
                <h2 className="[font-family:var(--font-paraluman-mono)] text-xs font-semibold uppercase tracking-[0.2em] text-purple-100">
                  Challenge
                </h2>
                <p className="mt-3 max-w-4xl [font-family:var(--font-paraluman-heading)] text-xl font-black uppercase leading-[1.1] tracking-[-0.02em] text-white sm:text-[2.1rem]">
                  A system that publishes a news article in English and Filipino
                  at the same time.
                </p>

                {hasChallengePdf ? (
                  <div className="group relative mt-5 w-full">
                    <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#a855f7_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                    <Link
                      href={CHALLENGE_PDF_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex w-full items-center justify-between border-2 border-white bg-white px-5 py-3 [font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[0.1em] text-purple-800 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.65)] transition-all hover:-translate-y-1 hover:bg-purple-50"
                    >
                      <span>View challenge details</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 flex w-full items-center justify-between border border-white/60 bg-white/20 px-5 py-3 [font-family:var(--font-paraluman-mono)] text-[11px] uppercase tracking-[0.12em] text-purple-100/90">
                    <span>View full challenge brief</span>
                    <span>Link coming soon</span>
                  </div>
                )}
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="relative border-2 border-purple-200 bg-white p-5">
                  <p className="[font-family:var(--font-paraluman-mono)] text-xs uppercase tracking-[0.17em] text-purple-700">
                    Submission
                  </p>

                  <form
                    className="mt-4 grid gap-4"
                    onSubmit={(e) => void handleSubmit(e)}
                  >
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={updateField("email")}
                      placeholder="Email address"
                      className="h-12 rounded-none border-purple-200 bg-white [font-family:var(--font-paraluman-mono)] text-black placeholder:text-black/35 focus:border-purple-600"
                    />

                    <Input
                      required
                      value={form.submissionLink}
                      onChange={updateField("submissionLink")}
                      placeholder="Submission link (GitHub, Loom, or demo URL)"
                      className="h-12 rounded-none border-purple-200 bg-white [font-family:var(--font-paraluman-mono)] text-black placeholder:text-black/35 focus:border-purple-600"
                    />

                    <Textarea
                      value={form.submissionNotes}
                      onChange={updateField("submissionNotes")}
                      placeholder="Submission notes (optional)"
                      className="min-h-28 rounded-none border-purple-200 bg-white [font-family:var(--font-paraluman-mono)] text-sm text-black placeholder:text-black/35 focus-visible:ring-1 focus-visible:ring-purple-600 focus-visible:ring-offset-0"
                    />

                    {isDevelopment ? (
                      <p className="[font-family:var(--font-paraluman-mono)] text-xs text-purple-700">
                        Captcha is disabled in development mode.
                      </p>
                    ) : !token ? (
                      <div className="relative my-1 flex w-full flex-col items-center">
                        {!tokenFail ? (
                          <Loader>Validating browser...</Loader>
                        ) : (
                          <Badge type="destructive" className="m-4">
                            Unable to validate captcha.
                          </Badge>
                        )}
                        <Turnstile
                          siteKey={
                            process.env.NEXT_PUBLIC_SERVER_API_KEY_TURNSTILE!
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
                      <p className="[font-family:var(--font-paraluman-mono)] text-xs text-emerald-700">
                        Browser verification complete.
                      </p>
                    )}

                    <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                      <p className="[font-family:var(--font-paraluman-mono)] text-xs leading-5 text-black/65">
                        We will send a confirmation to your email.
                      </p>

                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="h-12 rounded-none border-2 border-purple-700 bg-gradient-to-r from-purple-600 to-purple-800 px-7 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.09em] text-white transition-colors hover:from-purple-700 hover:to-purple-900"
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
                  </form>

                  {resultMessage && (
                    <p
                      className={cn(
                        "mt-5 border px-4 py-3 [font-family:var(--font-paraluman-mono)] text-sm",
                        isError
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-emerald-300 bg-emerald-50 text-emerald-700",
                      )}
                    >
                      {resultMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
