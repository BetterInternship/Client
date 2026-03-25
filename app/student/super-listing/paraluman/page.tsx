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
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

const CHALLENGE_WORKFLOW = [
  {
    title: "Input",
    body: "Submit English article",
  },
  {
    title: "Generate",
    body: "Create Filipino version",
  },
  {
    title: "Review",
    body: "Approve before publish",
  },
  {
    title: "Publish",
    body: "Release both versions",
  },
];

const REQUIRED_FEATURES = [
  "Login system",
  "Submit & view articles",
  "See Filipino translation",
  "Approve/reject versions",
  "View published results",
];

const DELIVERABLES = [
  "1-page design note",
  "Working prototype",
  "Demo login credentials",
];

const EVALUATION_CRITERIA = ["Clarity", "Practicality", "Flow", "Tradeoffs"];

type ParalumanSubmissionPayload = {
  fullName: string;
  email: string;
  portfolioUrl: string;
  linkedinUrl: string;
  whyFit: string;
};

type ParalumanSubmissionResponse = {
  success: boolean;
  message?: string;
};

const INITIAL_FORM_STATE: ParalumanSubmissionPayload = {
  fullName: "",
  email: "",
  portfolioUrl: "",
  linkedinUrl: "",
  whyFit: "",
};

export default function ParalumanPage() {
  const [form, setForm] =
    useState<ParalumanSubmissionPayload>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
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
    if (!base) return "/api/super-listings/paraluman-submission";
    return `${base}/super-listings/paraluman-submission`;
  }, []);

  const updateField =
    (field: keyof ParalumanSubmissionPayload) =>
    (
      event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
    ) => {
      setForm((previous) => ({ ...previous, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResultMessage("");
    setIsError(false);
    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, "cf-token": token }),
      });

      const data = (await response.json()) as ParalumanSubmissionResponse;

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

  const openSubmitModal = () => {
    setResultMessage("");
    setIsError(false);
    setSubmitModalOpen(true);
  };

  const scrollToChallenge = () => {
    challengeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

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
              ×
            </span>
            <span className="[font-family:var(--font-paraluman-heading)] text-[clamp(0.88rem,2.4vw,1.4rem)] font-black uppercase tracking-tight text-black">
              Paraluman News
            </span>
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
                <span className="block">Build the</span>
                <span className="block bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Future of
                </span>
                <span className="block">Journalism</span>
              </h1>

              <div className="mt-6 inline-flex items-center rounded-lg border-2 border-purple-600 bg-white px-5 py-2">
                <span className="[font-family:var(--font-paraluman-heading)] text-[clamp(0.9rem,2vw,1.1rem)] font-black uppercase tracking-[0.08em] text-purple-700">
                  Multilingual Publishing Challenge
                </span>
              </div>

              <div className="mt-8 mx-auto max-w-2xl space-y-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/65 sm:text-[15px]">
                <p>
                  Make{" "}
                  <span className="font-semibold text-purple-700">
                    journalism accessible across languages
                  </span>
                  . Build a real system that publishes articles in English and
                  Filipino simultaneously, with human review at every step.
                </p>
                <p className="font-semibold text-purple-800">
                  Build something real. Ship it.
                </p>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
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
            <div className="pointer-events-none absolute inset-0 translate-x-[10px] translate-y-[10px] bg-[repeating-linear-gradient(135deg,#a855f7_0_2px,transparent_2px_7px)] opacity-15" />
            <div className="relative border-2 border-purple-600 bg-white shadow-[0_20px_45px_-30px_rgba(168,85,247,0.8)]">
              <div className="border-b-2 border-purple-600 bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-6 sm:px-8 sm:py-8">
                <h2 className="mt-3 [font-family:var(--font-paraluman-heading)] text-3xl font-black uppercase tracking-[-0.04em] text-white sm:text-5xl">
                  What You Build
                </h2>
                <p className="mt-3 max-w-3xl [font-family:var(--font-paraluman-mono)] text-sm leading-6 text-purple-100">
                  A system that publishes a news article in English and Filipino
                  at the same time.
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid gap-4 md:grid-cols-4">
                  {CHALLENGE_WORKFLOW.map((item) => (
                    <div key={item.title} className="group relative h-full">
                      <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#a855f7_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                      <div className="relative flex h-full flex-col border-2 border-purple-200 bg-white p-5 transition-all group-hover:-translate-y-1">
                        <p className="mt-2 [font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[-0.03em] text-purple-700">
                          {item.title}
                        </p>
                        <p className="mt-2 flex-1 [font-family:var(--font-paraluman-mono)] text-sm leading-6 text-black/65">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#a855f7_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                    <div className="relative border-2 border-purple-200 bg-white p-5 transition-all group-hover:-translate-y-1">
                      <p className="[font-family:var(--font-paraluman-mono)] text-xs uppercase tracking-[0.17em] text-purple-700">
                        Deliverables
                      </p>
                      <ul className="mt-4 space-y-2 [font-family:var(--font-paraluman-mono)] text-sm text-black/80">
                        {DELIVERABLES.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#a855f7_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                    <div className="relative border-2 border-purple-200 bg-white p-5 transition-all group-hover:-translate-y-1">
                      <p className="[font-family:var(--font-paraluman-mono)] text-xs uppercase tracking-[0.17em] text-purple-700">
                        Prototype Must Allow
                      </p>
                      <ul className="mt-4 space-y-2 [font-family:var(--font-paraluman-mono)] text-sm text-black/80">
                        {REQUIRED_FEATURES.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#a855f7_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                    <div className="relative border-2 border-purple-200 bg-white p-5 transition-all group-hover:-translate-y-1">
                      <p className="[font-family:var(--font-paraluman-mono)] text-xs uppercase tracking-[0.17em] text-purple-700">
                        Evaluation Criteria
                      </p>
                      <p className="mt-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80">
                        {EVALUATION_CRITERIA.join(" • ")}
                      </p>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#a855f7_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                    <div className="relative border-2 border-purple-200 bg-white p-5 transition-all group-hover:-translate-y-1">
                      <p className="[font-family:var(--font-paraluman-mono)] text-xs uppercase tracking-[0.17em] text-purple-700">
                        Constraint
                      </p>
                      <p className="mt-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80">
                        Small team. Limited budget. Keep it simple.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-lg border-l-4 border-purple-600 bg-purple-50 p-6">
                  <p className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80">
                    <span className="font-semibold text-purple-800">
                      The Challenge:
                    </span>{" "}
                    How do you make reliable journalism accessible across
                    languages—without slowing it down?
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <div className="group relative inline-block">
                    <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#a855f7_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                    <Button
                      type="button"
                      size="lg"
                      onClick={openSubmitModal}
                      className="relative h-14 rounded-none border-2 border-purple-700 bg-gradient-to-r from-purple-600 to-purple-800 px-9 [font-family:var(--font-paraluman-heading)] text-sm font-black uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-1 hover:from-purple-700 hover:to-purple-900"
                    >
                      Submit
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Dialog
        open={submitModalOpen}
        onOpenChange={(open) => {
          setSubmitModalOpen(open);
          if (!open) {
            setResultMessage("");
            setIsError(false);
          }
        }}
      >
        <DialogContent className="w-[min(980px,calc(100vw-1.5rem))] max-w-none overflow-hidden rounded-none border-purple-200 bg-white p-0 [&>button]:bg-white [&>button]:text-black [&>button]:opacity-100 [&>button]:hover:opacity-70">
          <div className="relative max-h-[88svh] overflow-auto">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(147,51,234,0.08),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(76,29,149,0.06),transparent_35%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:34px_34px] opacity-30" />

            <div className="relative border-b border-purple-200 px-6 py-6 sm:px-8 sm:py-8">
              <p className="[font-family:var(--font-paraluman-mono)] text-xs uppercase tracking-[0.2em] text-purple-700">
                Candidate Submission
              </p>
              <h2 className="mt-3 pr-10 [font-family:var(--font-paraluman-heading)] text-3xl font-black uppercase tracking-[-0.04em] text-black sm:text-5xl">
                Ship Your Proposal
              </h2>
            </div>

            {token ? (
              <div className="relative p-6 sm:p-8">
                <form
                  className="grid gap-4"
                  onSubmit={(e) => void handleSubmit(e)}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      required
                      value={form.fullName}
                      onChange={updateField("fullName")}
                      placeholder="Full name"
                      className="h-12 rounded-none border-purple-200 bg-white [font-family:var(--font-paraluman-mono)] text-black placeholder:text-black/35 focus:border-purple-600"
                    />
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={updateField("email")}
                      placeholder="Email address"
                      className="h-12 rounded-none border-purple-200 bg-white [font-family:var(--font-paraluman-mono)] text-black placeholder:text-black/35 focus:border-purple-600"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      value={form.portfolioUrl}
                      onChange={updateField("portfolioUrl")}
                      placeholder="Portfolio or project URL (optional)"
                      className="h-12 rounded-none border-purple-200 bg-white [font-family:var(--font-paraluman-mono)] text-black placeholder:text-black/35 focus:border-purple-600"
                    />
                    <Input
                      value={form.linkedinUrl}
                      onChange={updateField("linkedinUrl")}
                      placeholder="LinkedIn URL (optional)"
                      className="h-12 rounded-none border-purple-200 bg-white [font-family:var(--font-paraluman-mono)] text-black placeholder:text-black/35 focus:border-purple-600"
                    />
                  </div>

                  <Textarea
                    required
                    value={form.whyFit}
                    onChange={updateField("whyFit")}
                    placeholder="Tell us about your proposal and why you're the right person to build it."
                    className="min-h-36 rounded-none border-purple-200 bg-white [font-family:var(--font-paraluman-mono)] text-sm text-black placeholder:text-black/35 focus-visible:ring-1 focus-visible:ring-purple-600 focus-visible:ring-offset-0"
                  />

                  <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                    <p className="[font-family:var(--font-paraluman-mono)] text-xs leading-5 text-black/65">
                      We will send the confirmation to your email.
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
            ) : (
              <div className="relative flex w-full flex-col items-center my-2">
                {!tokenFail ? (
                  <Loader>Validating browser...</Loader>
                ) : (
                  <Badge type="destructive" className="m-4">
                    Something went wrong.
                  </Badge>
                )}
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_SERVER_API_KEY_TURNSTILE!}
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
