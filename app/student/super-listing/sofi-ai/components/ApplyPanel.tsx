"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import confetti from "canvas-confetti";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SofiAiSubmissionForm } from "./types";

type ApplyPanelProps = {
  form: SofiAiSubmissionForm;
  hasSubmitted: boolean;
  submittedEmail: string;
  isSubmitting: boolean;
  isError: boolean;
  resultMessage: string;
  isDevelopment: boolean;
  token: string;
  tokenFail: boolean;
  turnstileSiteKey?: string;
  onFieldChange: (field: keyof SofiAiSubmissionForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBackToOverview: () => void;
  onTokenSuccess: (token: string) => void;
  onTokenError: () => void;
};

function AsteriskList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span className="mt-0.5 shrink-0 [font-family:var(--font-paraluman-mono)] text-sm font-semibold leading-6 text-[#00A886]">
            *
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ApplyPanel({
  form,
  hasSubmitted,
  submittedEmail,
  isSubmitting,
  isError,
  resultMessage,
  isDevelopment,
  token,
  tokenFail,
  turnstileSiteKey,
  onFieldChange,
  onSubmit,
  onBackToOverview,
  onTokenSuccess,
  onTokenError,
}: ApplyPanelProps) {
  const prefersReduce = useReducedMotion();
  const hasCelebratedRef = useRef(false);

  useEffect(() => {
    if (!hasSubmitted) {
      hasCelebratedRef.current = false;
      return;
    }

    if (hasCelebratedRef.current || prefersReduce) return;
    if (typeof window === "undefined") return;

    hasCelebratedRef.current = true;

    type ConfettiFn = (
      options?: Record<string, unknown>,
    ) => Promise<null> | null;
    const fireConfetti = confetti as unknown as ConfettiFn;

    void fireConfetti({
      particleCount: 90,
      spread: 74,
      startVelocity: 34,
      origin: { y: 0.65 },
      colors: ["#00A886", "#00B894", "#8cf5e4", "#ffffff"],
    });

    window.setTimeout(() => {
      void fireConfetti({
        particleCount: 60,
        spread: 60,
        startVelocity: 28,
        origin: { x: 0.75, y: 0.68 },
        colors: ["#00A886", "#8cf5e4", "#ffffff"],
      });
    }, 180);
  }, [hasSubmitted, prefersReduce]);

  const updateField =
    (field: keyof SofiAiSubmissionForm) =>
    (
      event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
    ) => {
      onFieldChange(field, event.target.value);
    };

  if (hasSubmitted) {
    return (
      <motion.div
        initial={prefersReduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        className="text-[#052338]"
      >
        <div className="max-w-2xl space-y-4">
          <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-bold tracking-[-0.035em] text-[#052338]">
            Submission sent
          </p>
          <p className="max-w-2xl [font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/82 sm:text-[0.9rem]">
            Thank you for applying. We sent a confirmation to{" "}
            <span className="font-semibold text-[#052338]">
              {submittedEmail || "your email"}
            </span>
            . You will receive a response within 24 hours.
          </p>
          <div className="pt-1">
            <Button
              type="button"
              onClick={onBackToOverview}
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#052338] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-white transition-all duration-200 hover:bg-[#0D3B33]"
            >
              Back to overview
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="text-[#052338]">
      <div className="max-w-2xl">
        <div className="space-y-2">
          <h2 className="[font-family:var(--font-paraluman-heading)] text-[1.45rem] font-bold leading-tight tracking-[-0.035em] sm:text-[1.55rem]">
            Submit your challenge output.
          </h2>
          <p className="[font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/82 sm:text-[0.9rem]">
            Again,{" "}
            <span className="font-bold text-[#00866f]">
              no resume needed. Response within 24 hours.
            </span>
          </p>
        </div>

        <div className="mt-6 space-y-5 border-t border-[#052338]/10 pt-5 [font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/86">
          <div className="space-y-2.5">
            <p className="[font-family:var(--font-paraluman-heading)] text-base font-bold tracking-[-0.025em] text-[#052338]">
              Deployed Website or Prototype
            </p>
            <AsteriskList
              items={[
                "Shows the product experience.",
                "Clear and logical user flow.",
                "Doesn't need to be fully functional, as long as you can explain it.",
              ]}
            />
          </div>

          <div className="space-y-2.5">
            <p className="[font-family:var(--font-paraluman-heading)] text-base font-bold tracking-[-0.025em] text-[#052338]">
              1-3 Minute Video
            </p>
            <AsteriskList
              items={[
                "Pitch yourself.",
                "Walk us through your design.",
                "Explain your thinking and decisions.",
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 max-w-2xl">
        <div>
            <form className="space-y-5" onSubmit={(e) => void onSubmit(e)}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="[font-family:var(--font-paraluman-heading)] text-sm font-bold tracking-[-0.02em] text-[#052338]">
                    Full Name *
                  </label>
                  <Input
                    required
                    value={form.fullName}
                    onChange={updateField("fullName")}
                    className="h-11 rounded-md border-[#052338]/14 bg-white text-[#052338] [font-family:var(--font-paraluman-body)] text-sm shadow-none focus-visible:ring-[#00B894]/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="[font-family:var(--font-paraluman-heading)] text-sm font-bold tracking-[-0.02em] text-[#052338]">
                    Email *
                  </label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    className="h-11 rounded-md border-[#052338]/14 bg-white text-[#052338] [font-family:var(--font-paraluman-body)] text-sm shadow-none focus-visible:ring-[#00B894]/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="[font-family:var(--font-paraluman-heading)] text-sm font-bold tracking-[-0.02em] text-[#052338]">
                    Deployed Website / Prototype Link *
                  </label>
                  <p className="[font-family:var(--font-paraluman-body)] text-xs leading-5 text-[#052338]/42">
                    Figma, Framer, Webflow, or any shareable URL. Make sure view
                    access is on.
                  </p>
                  <Input
                    required
                    value={form.submissionLink}
                    onChange={updateField("submissionLink")}
                    className="h-11 rounded-md border-[#052338]/14 bg-white text-[#052338] [font-family:var(--font-paraluman-body)] text-sm shadow-none focus-visible:ring-[#00B894]/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="[font-family:var(--font-paraluman-heading)] text-sm font-bold tracking-[-0.02em] text-[#052338]">
                    Video Submission Link *
                  </label>
                  <p className="[font-family:var(--font-paraluman-body)] text-xs leading-5 text-[#052338]/42">
                    Loom, YouTube (unlisted), Google Drive &mdash; any link we
                    can watch. Keep it 1-3 minutes.
                  </p>
                  <Input
                    required
                    value={form.videoSubmissionLink}
                    onChange={updateField("videoSubmissionLink")}
                    className="h-11 rounded-md border-[#052338]/14 bg-white text-[#052338] [font-family:var(--font-paraluman-body)] text-sm shadow-none focus-visible:ring-[#00B894]/20"
                  />
                </div>
              </div>

              {isDevelopment ? (
                <p className="border-t border-[#052338]/10 pt-4 [font-family:var(--font-paraluman-body)] text-sm text-[#00866f]">
                  Captcha disabled in development.
                </p>
              ) : !token ? (
                <div className="space-y-3 border-t border-[#052338]/10 pt-4">
                  {!tokenFail ? (
                    <Loader>Validating browser...</Loader>
                  ) : (
                    <Badge type="destructive" className="mb-2">
                      Unable to validate captcha. Please refresh and try again.
                    </Badge>
                  )}
                  <Turnstile
                    siteKey={turnstileSiteKey!}
                    onSuccess={onTokenSuccess}
                    onError={onTokenError}
                  />
                </div>
              ) : (
                <div className="border-t border-[#052338]/10 pt-4 [font-family:var(--font-paraluman-body)] text-sm text-[#00866f]">
                  Browser verification complete.
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-[#052338] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-white transition-all duration-200 hover:bg-[#0D3B33]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting
                    </>
                  ) : (
                    "Submit challenge"
                  )}
                </Button>
              </div>

              {resultMessage && (
                <div
                  className={cn(
                    "rounded-md border px-4 py-3 [font-family:var(--font-paraluman-body)] text-sm",
                    isError
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700",
                  )}
                >
                  {resultMessage}
                </div>
              )}
            </form>
        </div>
      </div>
    </div>
  );
}
