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
import { ArrowUpRight, Loader2 } from "lucide-react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

const CHALLENGE_ITEMS = [
  {
    title: "Scout Signal Early",
    body: "Find AI-native builders before they become obvious. Prioritize quality of insight over quantity.",
  },
  {
    title: "Build Community Gravity",
    body: "Design and run lightweight initiatives that attract serious founders and keep them engaged.",
  },
  {
    title: "Scale The Accelerator",
    body: "Identify one bottleneck in the accelerator workflow and ship an improvement with measurable impact.",
  },
];

const SUBMISSION_REQUIREMENTS = [
  "Your scouting framework or thesis (short write-up or deck).",
  "A sample list of high-signal builders you would prioritize.",
  "A concrete idea you would implement to make the accelerator better.",
];

type FffSubmissionPayload = {
  fullName: string;
  email: string;
  portfolioUrl: string;
  linkedinUrl: string;
  whyFit: string;
};

type FffSubmissionResponse = {
  success: boolean;
  message?: string;
};

const INITIAL_FORM_STATE: FffSubmissionPayload = {
  fullName: "",
  email: "",
  portfolioUrl: "",
  linkedinUrl: "",
  whyFit: "",
};

export default function FFFPage() {
  const [form, setForm] = useState<FffSubmissionPayload>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const challengeRef = useRef<HTMLElement | null>(null);

  const endpoint = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!base) return "/api/super-listings/fff-submission";
    return `${base}/super-listings/fff-submission`;
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
    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as FffSubmissionResponse;

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
        "relative min-h-full overflow-x-hidden bg-white text-black",
        headingFont.variable,
        monoFont.variable,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,0,0,0.08),transparent_36%),radial-gradient(circle_at_85%_0%,rgba(0,0,0,0.06),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

      <header className="sticky top-0 z-50 flex items-center justify-between px-6 pb-2 pt-4 sm:px-8 lg:px-10">
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

      <section className="relative mx-auto flex min-h-[calc(100svh-73px)] w-full max-w-6xl flex-col justify-center px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="text-left">
            <p className="[font-family:var(--font-fff-mono)] text-xs uppercase tracking-[0.24em] text-black/70">
              Startup Accelerator Intern
            </p>
            <h1 className="mt-5 [font-family:var(--font-fff-heading)] text-[clamp(2.4rem,9vw,5.8rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
              Scout.
              <br />
              Network.
              <br />
              Scale.
            </h1>
            <p className="mt-7 max-w-2xl [font-family:var(--font-fff-mono)] text-sm leading-7 text-black/65 sm:text-[15px]">
              s16vc and Ellipsis Ventures are building the successor to YC,
              backed by founders and execs from Miro, Pitch, and WeTransfer.
              This internship is for builders who move fast, spot signal early,
              and can help compound leverage for the whole ecosystem.
            </p>
          </div>

          <div className="mx-auto w-full max-w-xl space-y-4">
            {RESPONSIBILITIES.map((item) => (
              <div key={item.title} className="group relative">
                <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#000_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                <div className="relative border border-black/20 bg-white p-5 shadow-sm transition-all group-hover:-translate-y-1">
                  <p className="[font-family:var(--font-fff-heading)] text-2xl font-black uppercase tracking-[-0.03em]">
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
              className="relative h-14 rounded-none border border-black bg-black px-9 [font-family:var(--font-fff-heading)] text-sm font-black uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-1 hover:bg-black/90"
            >
              Join Challenge
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section
        ref={challengeRef}
        className="relative mx-auto flex min-h-[calc(100svh-73px)] w-full max-w-6xl flex-col justify-center px-6 py-10 sm:px-8 lg:px-10"
      >
        <div className="relative">
          <div className="relative border-2 border-black bg-white">
            <div className="border-b-2 border-black bg-black px-6 py-6 sm:px-8 sm:py-8">
              <p className="[font-family:var(--font-fff-mono)] text-xs uppercase tracking-[0.2em] text-white/80">
                Challenge
              </p>
              <h2 className="mt-3 [font-family:var(--font-fff-heading)] text-3xl font-black uppercase tracking-[-0.04em] text-white sm:text-5xl">
                What You Need To Ship
              </h2>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                {CHALLENGE_ITEMS.map((item) => (
                  <div key={item.title} className="group relative h-full">
                    <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#000_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                    <div className="relative flex h-full flex-col border border-black/25 bg-white p-5 transition-all group-hover:-translate-y-1">
                      <p className="mt-2 [font-family:var(--font-fff-heading)] text-xl font-black uppercase tracking-[-0.03em]">
                        {item.title}
                      </p>
                      <p className="mt-2 flex-1 [font-family:var(--font-fff-mono)] text-sm leading-6 text-black/65">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="group relative mt-6">
                <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#000_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                <div className="relative border border-black/20 bg-white p-5 transition-all group-hover:-translate-y-1">
                  <p className="[font-family:var(--font-fff-mono)] text-xs uppercase tracking-[0.17em] text-black/65">
                    Submission Requirements
                  </p>
                  <ul className="mt-4 space-y-2 [font-family:var(--font-fff-mono)] text-sm text-black/80">
                    {SUBMISSION_REQUIREMENTS.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="group relative inline-block">
                  <div className="pointer-events-none absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[repeating-linear-gradient(135deg,#000_0_2px,transparent_2px_6px)] opacity-0 transition-all group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:opacity-25" />
                  <Button
                    type="button"
                    size="lg"
                    onClick={openSubmitModal}
                    className="relative h-14 rounded-none border border-black bg-black px-9 [font-family:var(--font-fff-heading)] text-sm font-black uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-1 hover:bg-black/90"
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
        <DialogContent className="w-[min(980px,calc(100vw-1.5rem))] max-w-none overflow-hidden rounded-none border-black/20 bg-white p-0 [&>button]:bg-white [&>button]:text-black [&>button]:opacity-100 [&>button]:hover:opacity-70">
          <div className="relative max-h-[88svh] overflow-auto">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(0,0,0,0.08),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(0,0,0,0.06),transparent_35%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:34px_34px] opacity-30" />

            <div className="relative border-b border-black/20 px-6 py-6 sm:px-8 sm:py-8">
              <p className="[font-family:var(--font-fff-mono)] text-xs uppercase tracking-[0.2em] text-black/70">
                Candidate Submission
              </p>
              <h2 className="mt-3 pr-10 [font-family:var(--font-fff-heading)] text-3xl font-black uppercase tracking-[-0.04em] text-black sm:text-5xl">
                Throw Your Hat In
              </h2>
              <p className="mt-2 [font-family:var(--font-fff-mono)] text-xs uppercase tracking-[0.15em] text-black/65">
                If this sounds like you, ship your pitch.
              </p>
            </div>

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
                    className="h-12 rounded-none border-black/25 bg-white [font-family:var(--font-fff-mono)] text-black placeholder:text-black/35 focus:border-black"
                  />
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    placeholder="Email address"
                    className="h-12 rounded-none border-black/25 bg-white [font-family:var(--font-fff-mono)] text-black placeholder:text-black/35 focus:border-black"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    value={form.portfolioUrl}
                    onChange={updateField("portfolioUrl")}
                    placeholder="Portfolio or project URL (optional)"
                    className="h-12 rounded-none border-black/25 bg-white [font-family:var(--font-fff-mono)] text-black placeholder:text-black/35 focus:border-black"
                  />
                  <Input
                    value={form.linkedinUrl}
                    onChange={updateField("linkedinUrl")}
                    placeholder="LinkedIn URL (optional)"
                    className="h-12 rounded-none border-black/25 bg-white [font-family:var(--font-fff-mono)] text-black placeholder:text-black/35 focus:border-black"
                  />
                </div>

                <Textarea
                  required
                  value={form.whyFit}
                  onChange={updateField("whyFit")}
                  placeholder="Why are you a strong fit for this internship?"
                  className="min-h-36 rounded-none border-black/25 bg-white [font-family:var(--font-fff-mono)] text-sm text-black placeholder:text-black/35 focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-0"
                />

                <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                  <p className="[font-family:var(--font-fff-mono)] text-xs leading-5 text-black/65">
                    We will send the confirmation to your email and include the
                    BetterInternship team in CC.
                  </p>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="h-12 rounded-none border border-black bg-black px-7 [font-family:var(--font-fff-heading)] text-sm font-bold uppercase tracking-[0.09em] text-white transition-colors hover:bg-black/90"
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
        </DialogContent>
      </Dialog>
    </main>
  );
}
