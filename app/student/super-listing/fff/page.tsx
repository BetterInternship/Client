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
  variable: "--font-fff-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-fff-mono",
});

const RESPONSIBILITIES = [
  {
    title: "Scout",
    body: "Identify the top 1% of AI-native builders before anyone else.",
  },
  {
    title: "Network",
    body: "Help build a founder community you would actually want to join.",
  },
  {
    title: "Scale",
    body: "Solve problems that make the accelerator itself better over time.",
  },
];

const CHALLENGE_PDF_URL =
  "https://drive.google.com/file/d/1dRzxouQEAr4BzugNCJ-4hKE9t8K3jL4O/view?usp=sharing";

type FffSubmissionPayload = {
  email: string;
  submissionLink: string;
  submissionNotes: string;
};

type FffSubmissionResponse = {
  success: boolean;
  message?: string;
};

const INITIAL_FORM_STATE: FffSubmissionPayload = {
  email: "",
  submissionLink: "",
  submissionNotes: "",
};

export default function FFFPage() {
  const isDevelopment = process.env.NODE_ENV === "development";

  const [form, setForm] = useState<FffSubmissionPayload>(INITIAL_FORM_STATE);
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
    if (!base) return "/api/super-listings/submission/fff";
    return `${base}/super-listings/submission/fff`;
  }, []);

  const updateField =
    (field: keyof FffSubmissionPayload) =>
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

      const data = (await response.json()) as FffSubmissionResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not send your submission.");
      }

      setForm(INITIAL_FORM_STATE);
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
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_16%_18%,rgba(0,0,0,0.12),transparent_35%),radial-gradient(circle_at_84%_2%,rgba(0,0,0,0.09),transparent_33%),radial-gradient(circle_at_50%_90%,rgba(0,0,0,0.07),transparent_40%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-45" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(122deg,rgba(0,0,0,0.09)_0%,transparent_34%,rgba(0,0,0,0.07)_54%,transparent_74%)] opacity-55" />
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
            <span className="[font-family:var(--font-fff-heading)] text-xl font-black text-black/30 sm:text-2xl">
              x
            </span>
            <Link
              href="https://fff-hub.com/"
              target="_blank"
              className="transition-opacity duration-200 hover:opacity-70"
            >
              <span className="[font-family:var(--font-fff-heading)] text-[clamp(0.88rem,2.4vw,1.4rem)] font-black uppercase tracking-tight text-black">
                Founders For Founders
              </span>
            </Link>
          </div>
        </header>

        <section className="relative mx-auto flex min-h-[calc(100svh-73px)] w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative text-left">
              <SuperListingBadge
                compact
                className="[font-family:var(--font-fff-mono)] text-[11px] font-semibold uppercase tracking-[0.12em]"
              />
              <h1 className="mt-6 [font-family:var(--font-fff-heading)] text-[clamp(2.9rem,9vw,6.2rem)] font-black uppercase leading-[0.86] tracking-[-0.05em]">
                <span className="block">Scout.</span>
                <span className="block text-black/80">Network.</span>
                <span className="block">Scale.</span>
              </h1>
              <div className="mt-5 inline-flex items-center border border-black bg-white px-3 py-1.5">
                <span className="[font-family:var(--font-fff-heading)] text-[clamp(0.95rem,2.2vw,1.2rem)] uppercase tracking-[0.08em] text-black">
                  Startup Accelerator Intern
                </span>
              </div>
              <div className="mt-7 max-w-2xl space-y-4 [font-family:var(--font-fff-mono)] text-sm leading-7 text-black/65 sm:text-[15px]">
                <p>
                  <Link
                    href="https://www.s16vc.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-black underline underline-offset-2"
                  >
                    s16vc
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>{" "}
                  x{" "}
                  <Link
                    href="https://www.ellipsis-venture.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-black underline underline-offset-2"
                  >
                    Ellipsis Ventures
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>{" "}
                  is building a new startup accelerator designed to outbuild
                  legacy programs. Backed by founders from Miro, Pitch,
                  Supercell, and WeTransfer.
                </p>
                <p>
                  The hard part is not building the accelerator. It is finding
                  the right founders.
                </p>
                <div className="pt-1">
                  <p className="font-semibold text-black/85">
                    In this role, you will drive developer evangelism by SCOUT,
                    NETWORK, SCALE.
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-xl space-y-4">
              {RESPONSIBILITIES.map((item, index) => (
                <div
                  key={item.title}
                  className={cn(
                    "group relative",
                    index === 1 && "md:translate-x-4",
                    index === 2 && "md:translate-x-8",
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#000_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                  <div className="relative border border-black/20 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.55)] transition-all group-hover:-translate-y-1">
                    <p className="[font-family:var(--font-fff-mono)] text-[10px] uppercase tracking-[0.22em] text-black/55">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 [font-family:var(--font-fff-heading)] text-2xl font-black uppercase tracking-[-0.03em]">
                      {item.title}
                    </p>
                    <p className="mt-2 [font-family:var(--font-fff-mono)] text-sm leading-6 text-black/65">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-end">
            <div className="group relative inline-block">
              <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#000_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
              <Button
                size="lg"
                type="button"
                onClick={scrollToChallenge}
                className="relative h-16 rounded-none border border-black bg-black px-11 [font-family:var(--font-fff-heading)] text-base font-black uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-1 hover:bg-black/90"
              >
                View Challenge
                <ArrowUpRight className="h-4 w-4" />
              </Button>
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
              className="mb-4 [font-family:var(--font-fff-mono)] text-[11px] font-semibold uppercase tracking-[0.12em]"
            />
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 translate-x-[10px] translate-y-[10px] bg-[repeating-linear-gradient(135deg,#000_0_2px,transparent_2px_7px)] opacity-15" />
            <div className="relative border-2 border-black bg-white shadow-[0_20px_45px_-30px_rgba(0,0,0,0.8)]">
              <div className="border-b-2 border-black bg-black px-6 py-6 sm:px-8 sm:py-8">
                <h2 className="[font-family:var(--font-fff-mono)] text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  Challenge
                </h2>
                <p className="mt-3 max-w-4xl [font-family:var(--font-fff-heading)] text-xl font-black uppercase leading-[1.1] tracking-[-0.02em] text-white sm:text-[2.1rem]">
                  Find us the builders.
                </p>

                {hasChallengePdf ? (
                  <div className="group relative mt-5 w-full">
                    <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#000_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                    <Link
                      href={CHALLENGE_PDF_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 flex w-full items-center justify-between rounded-none border-2 border-white bg-white px-5 py-3 [font-family:var(--font-fff-heading)] text-sm font-black uppercase tracking-[0.1em] text-black shadow-[0_10px_24px_-14px_rgba(0,0,0,0.65)] transition-all hover:-translate-y-1 hover:bg-white"
                    >
                      <span>View challenge details</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 flex w-full items-center justify-between rounded-none border border-white/60 bg-white/20 px-5 py-3 [font-family:var(--font-fff-mono)] text-[11px] uppercase tracking-[0.12em] text-white/90">
                    <span>View full challenge brief</span>
                    <span>Link coming soon</span>
                  </div>
                )}
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="relative border border-black/20 bg-white p-5">
                  <p className="[font-family:var(--font-fff-mono)] text-xs uppercase tracking-[0.17em] text-black/65">
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
                      className="h-12 rounded-none border-black/25 bg-white [font-family:var(--font-fff-mono)] text-black placeholder:text-black/35 focus:border-black"
                    />

                    <Input
                      required
                      value={form.submissionLink}
                      onChange={updateField("submissionLink")}
                      placeholder="Submission link (GitHub, Loom, or demo URL)"
                      className="h-12 rounded-none border-black/25 bg-white [font-family:var(--font-fff-mono)] text-black placeholder:text-black/35 focus:border-black"
                    />

                    <Textarea
                      value={form.submissionNotes}
                      onChange={updateField("submissionNotes")}
                      placeholder="Submission notes (optional)"
                      className="min-h-28 rounded-none border-black/25 bg-white [font-family:var(--font-fff-mono)] text-sm text-black placeholder:text-black/35 focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-0"
                    />

                    {isDevelopment ? (
                      <p className="[font-family:var(--font-fff-mono)] text-xs text-black/70">
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
                      <p className="[font-family:var(--font-fff-mono)] text-xs text-emerald-700">
                        Browser verification complete.
                      </p>
                    )}

                    <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                      <p className="[font-family:var(--font-fff-mono)] text-xs leading-5 text-black/65">
                        We will send a confirmation to your email.
                      </p>

                      <div className="group relative inline-block">
                        <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#000_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="relative h-12 rounded-none border border-black bg-black px-7 [font-family:var(--font-fff-heading)] text-sm font-bold uppercase tracking-[0.09em] text-white transition-all hover:-translate-y-1 hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-black"
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
                    </div>
                  </form>

                  {resultMessage && (
                    <p
                      className={cn(
                        "mt-5 border px-4 py-3 [font-family:var(--font-fff-mono)] text-sm",
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
