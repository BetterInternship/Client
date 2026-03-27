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
import anterioreLogo from "./logo.png";
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
  variable: "--font-anteriore-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-anteriore-mono",
});

const CHALLENGE_PDF_URL = "";

type AnterioreSubmissionForm = {
  email: string;
  submissionLink: string;
  submissionNotes: string;
};

type AnterioreSubmissionResponse = {
  success: boolean;
  message?: string;
};

const INITIAL_FORM_STATE: AnterioreSubmissionForm = {
  email: "",
  submissionLink: "",
  submissionNotes: "",
};

export default function AnteriorePage() {
  const isDevelopment = process.env.NODE_ENV === "development";

  const [form, setForm] = useState<AnterioreSubmissionForm>(INITIAL_FORM_STATE);
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
    if (!base) return "/api/super-listings/submission/anteriore";
    return `${base}/super-listings/submission/anteriore`;
  }, []);

  const updateField =
    (field: keyof AnterioreSubmissionForm) =>
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
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          "cf-token": isDevelopment ? "dev-bypass" : token,
        }),
      });

      const data = (await response.json()) as AnterioreSubmissionResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not send your submission.");
      }

      setForm(INITIAL_FORM_STATE);
      setResultMessage(
        "Submission sent to your email with the BetterInternship team in CC.",
      );
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
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_16%_18%,rgba(39,75,125,0.14),transparent_35%),radial-gradient(circle_at_84%_2%,rgba(27,52,88,0.12),transparent_33%),radial-gradient(circle_at_50%_90%,rgba(39,75,125,0.08),transparent_40%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-45" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(122deg,rgba(39,75,125,0.08)_0%,transparent_34%,rgba(39,75,125,0.08)_54%,transparent_74%)] opacity-55" />

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
            <Image
              src={anterioreLogo}
              alt="Anteriore"
              className="h-auto w-[clamp(8rem,13vw,11rem)] [filter:brightness(0)_saturate(100%)_invert(21%)_sepia(17%)_saturate(1612%)_hue-rotate(184deg)_brightness(88%)_contrast(93%)]"
            />
          </div>
        </header>

        <section className="relative mx-auto flex min-h-[calc(100svh-73px)] w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-4xl text-left">
            <SuperListingBadge variant="gold" />

            <h1 className="mt-8 [font-family:var(--font-anteriore-heading)] text-[clamp(2.5rem,9vw,5.5rem)] font-black uppercase leading-[0.88] tracking-[-0.05em]">
              <span className="block text-[#274b7d]">Anteriore is</span>
              <span className="block">challenging you</span>
            </h1>

            <div className="mt-6 inline-flex items-center rounded-lg border-2 border-[#274b7d] bg-white px-5 py-2">
              <span className="[font-family:var(--font-anteriore-heading)] text-[clamp(0.9rem,2vw,1.1rem)] uppercase tracking-[0.08em] text-[#274b7d]">
                Looking for: {""}
                <span className="font-black">Web Dev Interns</span>
              </span>
            </div>

            <div className="mt-8 max-w-2xl">
              <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/65 sm:text-[15px]">
                Anteriore is a startup that delivers tailor-made IT services
                that drive businesses forward.
              </p>
            </div>

            <div className="mt-12 grid gap-12 lg:grid-cols-[2fr_1.2fr]">
              <div></div>

              <div className="w-full max-w-sm">
                <div className="relative border-2 border-[#274b7d] bg-gradient-to-br from-[#274b7d]/8 to-[#1b3458]/5 p-6 shadow-[0_12px_35px_-25px_rgba(39,75,125,0.75)]">
                  <div className="absolute -top-4 -left-3 text-5xl font-black leading-none text-[#274b7d]/20">
                    "
                  </div>
                  <div className="relative z-10 space-y-3">
                    <p className="[font-family:var(--font-anteriore-heading)] text-base font-black leading-tight text-[#274b7d]">
                      All the interns I've hired got 6 figure offers after their
                      internships.
                    </p>
                    <p className="[font-family:var(--font-anteriore-heading)] text-xs font-semibold tracking-[0.05em] text-[#1b3458]">
                      - Seaver
                      <span className="text-black/50">
                        , Founder of Anteriore
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="flex flex-col items-end gap-3">
                <div className="group relative inline-block">
                  <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#274b7d_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                  <Button
                    size="lg"
                    type="button"
                    onClick={scrollToChallenge}
                    className="relative h-16 rounded-none border-2 border-[#274b7d] bg-gradient-to-r from-[#274b7d] to-[#1b3458] px-11 [font-family:var(--font-anteriore-heading)] text-base font-black uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-1 hover:from-[#203e68] hover:to-[#162c49]"
                  >
                    View Challenge
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="[font-family:var(--font-anteriore-mono)] text-xs text-black/65">
                  No resume needed
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="relative mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-10">
          <div className="space-y-6">
            <div className="border border-[#274b7d]/30 bg-white px-4 py-2 w-fit">
              <p className="[font-family:var(--font-anteriore-mono)] text-xs uppercase tracking-[0.2em] text-[#274b7d] font-semibold">
                The opportunity
              </p>
            </div>

            <div className="overflow-hidden border-2 border-[#274b7d]/30 bg-white shadow-[0_24px_50px_-28px_rgba(39,75,125,0.45)]">
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.youtube.com/embed/KUCGr_XDh5M"
                  title="Anteriore Founder Video"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="max-w-4xl border-2 border-[#274b7d]/30 bg-gradient-to-br from-[#203e68] via-[#1b3458] to-[#162c49] p-6 text-white shadow-[0_24px_50px_-28px_rgba(39,75,125,0.9)] sm:p-8">
              <p className="[font-family:var(--font-anteriore-heading)] text-[clamp(1.2rem,2.6vw,1.9rem)] font-black leading-tight tracking-[-0.02em] text-white">
                You'll be working in a startup environment where you'll be given
                a lot of responsibilities. If you're serious about growth and
                aspire to become a strong CTO in the future, you'll thrive here.
              </p>
            </div>
          </div>
        </section>

        <section
          ref={challengeRef}
          className="relative mx-auto flex min-h-[calc(100svh-73px)] w-full max-w-6xl flex-col justify-center px-6 py-10 sm:px-8 lg:px-10"
        >
          <div>
            <SuperListingBadge className="mb-4" variant="gold" />
          </div>

          <div className="relative">
            <div className="relative border-2 border-[#274b7d] bg-gradient-to-b from-[#274b7d]/8 via-[#274b7d]/5 to-white shadow-[0_20px_45px_-30px_rgba(39,75,125,0.8)]">
              <div className="border-b-2 border-[#274b7d] bg-gradient-to-r from-[#203e68] to-[#162c49] px-6 py-6 sm:px-8 sm:py-8">
                <h2 className="[font-family:var(--font-anteriore-mono)] text-xs font-semibold uppercase tracking-[0.2em] text-[#dbe7f5]">
                  Challenge
                </h2>
                <p className="mt-3 max-w-4xl [font-family:var(--font-anteriore-heading)] text-xl font-black uppercase leading-[1.1] tracking-[-0.02em] text-white sm:text-[2.1rem]">
                  Challenge details will be in the PDF.
                </p>

                {hasChallengePdf ? (
                  <div className="group relative mt-5 w-full">
                    <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#274b7d_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                    <Link
                      href={CHALLENGE_PDF_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex w-full items-center justify-between border-2 border-white bg-white px-5 py-3 [font-family:var(--font-anteriore-heading)] text-sm font-black uppercase tracking-[0.1em] text-[#1f3e67] shadow-[0_10px_24px_-14px_rgba(0,0,0,0.65)] transition-all hover:-translate-y-1 hover:bg-[#274b7d]/8"
                    >
                      <span>View challenge details</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 flex w-full items-center justify-between border border-white/60 bg-white/20 px-5 py-3 [font-family:var(--font-anteriore-mono)] text-[11px] uppercase tracking-[0.12em] text-[#dbe7f5]/90">
                    <span>View full challenge brief</span>
                    <span>Link coming soon</span>
                  </div>
                )}
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="relative border-2 border-[#274b7d]/20 bg-white p-5">
                  <p className="[font-family:var(--font-anteriore-mono)] text-xs uppercase tracking-[0.17em] text-[#274b7d]">
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
                      className="h-12 rounded-none border-[#274b7d]/20 bg-white [font-family:var(--font-anteriore-mono)] text-black placeholder:text-black/35 focus:border-[#274b7d]"
                    />

                    <Input
                      required
                      value={form.submissionLink}
                      onChange={updateField("submissionLink")}
                      placeholder="Submission link (GitHub, Loom, or demo URL)"
                      className="h-12 rounded-none border-[#274b7d]/20 bg-white [font-family:var(--font-anteriore-mono)] text-black placeholder:text-black/35 focus:border-[#274b7d]"
                    />

                    <Textarea
                      value={form.submissionNotes}
                      onChange={updateField("submissionNotes")}
                      placeholder="Submission notes (optional)"
                      className="min-h-28 rounded-none border-[#274b7d]/20 bg-white [font-family:var(--font-anteriore-mono)] text-sm text-black placeholder:text-black/35 focus-visible:ring-1 focus-visible:ring-[#274b7d] focus-visible:ring-offset-0"
                    />

                    {isDevelopment ? (
                      <p className="[font-family:var(--font-anteriore-mono)] text-xs text-[#274b7d]">
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
                      <p className="[font-family:var(--font-anteriore-mono)] text-xs text-emerald-700">
                        Browser verification complete.
                      </p>
                    )}

                    <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                      <p className="[font-family:var(--font-anteriore-mono)] text-xs leading-5 text-black/65">
                        We will send a confirmation to your email.
                      </p>

                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="h-12 rounded-none border-2 border-[#274b7d] bg-gradient-to-r from-[#274b7d] to-[#1b3458] px-7 [font-family:var(--font-anteriore-heading)] text-sm font-bold uppercase tracking-[0.09em] text-white transition-colors hover:from-[#203e68] hover:to-[#162c49]"
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
                        "mt-5 border px-4 py-3 [font-family:var(--font-anteriore-mono)] text-sm",
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
