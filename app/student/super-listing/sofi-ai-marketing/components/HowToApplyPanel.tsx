import { type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import type { SuperListingUnlockForm } from "./types";

type HowToApplyPanelProps = {
  isDevelopment: boolean;
  isRegisteringUnlock: boolean;
  isUnlockChecking: boolean;
  isUnlocked: boolean;
  registrationError: string;
  registrationSent: boolean;
  turnstileSiteKey?: string;
  unlockEmail: string;
  unlockForm: SuperListingUnlockForm;
  unlockMessage: string;
  unlockToken: string;
  unlockTokenFail: boolean;
  onGoToApply: () => void;
  onRegisterUnlock: (event: FormEvent<HTMLFormElement>) => void;
  onUnlockFieldChange: (
    field: keyof SuperListingUnlockForm,
    value: string,
  ) => void;
  onUnlockTokenError: () => void;
  onUnlockTokenSuccess: (token: string) => void;
};

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="[font-family:var(--font-paraluman-heading)] text-xl font-bold tracking-[-0.025em] text-[#052338]">
      {children}
    </h2>
  );
}

function AsteriskList({
  items,
  emphasizedItems = [],
}: {
  items: readonly string[];
  emphasizedItems?: readonly string[];
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span className="mt-0.5 shrink-0 [font-family:var(--font-paraluman-mono)] text-sm font-semibold leading-6 text-[#00A886]">
            *
          </span>
          <span
            className={emphasizedItems.includes(item) ? "font-bold" : undefined}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function UnlockRegistrationPanel({
  isDevelopment,
  isRegisteringUnlock,
  registrationError,
  turnstileSiteKey,
  unlockForm,
  unlockToken,
  unlockTokenFail,
  onRegisterUnlock,
  onUnlockFieldChange,
  onUnlockTokenError,
  onUnlockTokenSuccess,
}: Pick<
  HowToApplyPanelProps,
  | "isDevelopment"
  | "isRegisteringUnlock"
  | "registrationError"
  | "turnstileSiteKey"
  | "unlockForm"
  | "unlockToken"
  | "unlockTokenFail"
  | "onRegisterUnlock"
  | "onUnlockFieldChange"
  | "onUnlockTokenError"
  | "onUnlockTokenSuccess"
>) {
  const updateEmail = (event: ChangeEvent<HTMLInputElement>) => {
    onUnlockFieldChange("email", event.target.value);
  };

  return (
    <div className="space-y-5 rounded-md border border-[#00A886]/70 bg-white p-5 text-center shadow-[0_0_0_1px_rgba(0,168,134,0.18),0_0_34px_rgba(0,168,134,0.34),0_18px_42px_-30px_rgba(5,35,56,0.55)]">
      <div className="space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#00A886]/24 bg-[#E8FFF9] shadow-[0_0_28px_rgba(0,168,134,0.22)]">
          <LockKeyhole className="h-7 w-7 text-[#00A886]" />
        </div>
        <div className="space-y-1.5">
          <p className="[font-family:var(--font-paraluman-heading)] text-xl font-bold tracking-[-0.02em] text-[#052338]">
            You&apos;re up for the challenge?
          </p>
          <p className="[font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/78">
            Enter your email to unlock the brief now. We&apos;ll send the full
            link too.
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={(e) => void onRegisterUnlock(e)}>
        <div className="space-y-2 text-left">
          <label className="[font-family:var(--font-paraluman-heading)] text-sm font-bold tracking-[-0.02em] text-[#052338]">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            required
            type="email"
            value={unlockForm.email}
            onChange={updateEmail}
            className="h-11 rounded-md border-[#00A886]/45 bg-[#F7FFFD] text-[#052338] [font-family:var(--font-paraluman-body)] text-sm shadow-none focus-visible:border-[#00A886] focus-visible:ring-[#00A886]/24"
          />
        </div>

        {isDevelopment ? (
          <p className="border-t border-[#052338]/10 pt-4 [font-family:var(--font-paraluman-body)] text-sm text-[#00866f]">
            Captcha disabled in development. Use{" "}
            <span className="font-semibold">?view=challenge</span> to preview
            the unlocked state.
          </p>
        ) : !unlockToken ? (
          <div className="space-y-3 border-t border-[#052338]/10 pt-4">
            {!unlockTokenFail ? (
              <Loader>Validating browser...</Loader>
            ) : (
              <Badge type="destructive" className="mb-2">
                Unable to validate captcha. Please refresh and try again.
              </Badge>
            )}
            <Turnstile
              siteKey={turnstileSiteKey!}
              onSuccess={onUnlockTokenSuccess}
              onError={onUnlockTokenError}
            />
          </div>
        ) : (
          <div className="border-t border-[#052338]/10 pt-4 [font-family:var(--font-paraluman-body)] text-sm text-[#00866f]">
            Browser verification complete.
          </div>
        )}

        <Button
          type="submit"
          disabled={isRegisteringUnlock}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#00A886] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-white shadow-[0_0_22px_rgba(0,168,134,0.38)] transition-all duration-200 hover:bg-[#00866f]"
        >
          {isRegisteringUnlock ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending link
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send unlock link
            </>
          )}
        </Button>

        {registrationError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 [font-family:var(--font-paraluman-body)] text-sm text-red-700">
            {registrationError}
          </div>
        )}
      </form>
    </div>
  );
}

function SampleReportLinks() {
  return (
    <div className="space-y-1">
      <a
        href="https://drive.google.com/file/d/1_lPgIcGMRIQmQWWexLXBkByZ82nB8kMv/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-[#00A886] underline transition-colors hover:text-[#00A886]/80"
      >
        Sample #1
      </a>
      <a
        href="https://drive.google.com/file/d/16Nail8GPx_crCHCZAjBABTJwBs7oUWfK/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-[#00A886] underline transition-colors hover:text-[#00A886]/80"
      >
        Sample #2
      </a>
    </div>
  );
}

function ChallengeDetails({
  isLocked,
  unlockPanel,
  onGoToApply,
}: {
  isLocked: boolean;
  unlockPanel?: ReactNode;
  onGoToApply: () => void;
}) {
  return (
    <div className="relative -mx-5 sm:-mx-6">
      <div
        className={cn(
          "space-y-5 border-y border-[#00A886]/12 bg-[#E8FFF9]/50 px-5 py-5 transition-all duration-700 ease-out sm:px-6",
          !isLocked &&
            "animate-[sofi-unlock-reveal_900ms_cubic-bezier(0.22,1,0.36,1)]",
        )}
      >
        <section
          className={cn(
            "space-y-3 transition-all duration-700 ease-out",
            isLocked && "blur-[1px]",
          )}
        >
          <SectionTitle>The Product</SectionTitle>
          <div className="space-y-3">
            <div>
              <p className="[font-family:var(--font-paraluman-mono)] text-xl font-semibold uppercase text-[#00A886]">
                GIA: Generative Influencer Analyst
              </p>
            </div>
            <p>
              GIA is a web-based analytics platform powered by SOFI AI. She
              helps TikTok creators understand their content in a simple, human
              way without needing to be technical.
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-[#052338]">User Profile:</p>
              <p>
                TikTok creators in the Philippines who don&apos;t speak fluent
                analytics: people who see their metrics but don&apos;t fully
                understand them.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-[#052338]">Use case:</p>
              <p>
                You feed her your TikTok profile link. She gives you back a
                readable report with hook scores, audience signals, sentiment
                analysis, and suggestions on what to post next.
              </p>
            </div>
            <div className="pt-2 space-y-1">
              <p>Here is a sample of the report that GIA generates.</p>
              <SampleReportLinks />
            </div>
            <div className="pt-2 space-y-1">
              <p>
                Also, here&apos;s a sample landing page we made:{" "}
                <a
                  href="https://sofi-ai-gia.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-[#00A886] underline transition-colors hover:text-[#00A886]/80",
                    isLocked && "pointer-events-none inline-block blur-[5px]",
                  )}
                >
                  https://sofi-ai-gia.netlify.app/
                </a>
              </p>
            </div>
          </div>
        </section>

        {unlockPanel}

        <section
          className={cn(
            "space-y-3 transition-all duration-700 ease-out",
            isLocked && "pointer-events-none blur-[6px]",
          )}
        >
          <SectionTitle>What You Will Make</SectionTitle>
          <div className="[font-family:var(--font-paraluman-body)] space-y-4 text-sm leading-6 text-[#184d45]/86 sm:text-[0.9rem]">
            <div className="space-y-2">
              <p className="font-semibold text-[#052338]">
                1. Marketing Proposal (Slide Deck or Presentation)
              </p>{" "}
              <p>
                Create a marketing strategy for GIA and present it as a slide
                deck or any format that works best for you. You will be
                presenting this in the video pitch.
              </p>
              <p>Think about:</p>
              <AsteriskList
                items={[
                  "Who exactly is the target audience and how do you reach them.",
                  "What channels and platforms make the most sense.",
                  "What the message is: how would you explain GIA to a creator in one sentence.",
                  "How you would measure success.",
                  "Give sample pubmats and social media posts.",
                ]}
              />
              <p>You have full flexibility in how you structure this.</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-[#052338]">
                2. Video Pitch (3-5 minutes)
              </p>{" "}
              <p>
                Present your marketing proposal on camera. This is important: we
                want to see how you communicate.
              </p>
              <AsteriskList
                items={[
                  "Introduce yourself with your face on camera and webcam visible throughout.",
                  "Walk us through your marketing proposal.",
                  "Explain your thinking and the decisions you made.",
                  "Upload as an unlisted YouTube video.",
                ]}
              />
            </div>
          </div>
        </section>

        <section
          className={cn(
            "space-y-3 transition-all duration-700 ease-out",
            isLocked && "pointer-events-none blur-[6px]",
          )}
        >
          <SectionTitle>How we&apos;ll evaluate</SectionTitle>
          <div className="[font-family:var(--font-paraluman-body)] space-y-2 text-sm leading-6 text-[#184d45]/86 sm:text-[0.9rem]">
            <p>
              <span className="font-semibold text-[#052338]">1. Thinking:</span>{" "}
              How you approach the problem and make strategic decisions.
            </p>
            <p>
              <span className="font-semibold text-[#052338]">
                2. Marketing:
              </span>{" "}
              Clarity, creativity, and overall execution of your proposal.
            </p>
            <p>
              <span className="font-semibold text-[#052338]">
                3. Communication:
              </span>{" "}
              How well you present and explain your ideas.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={isLocked ? undefined : onGoToApply}
              disabled={isLocked}
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#052338] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-white transition-all duration-200 hover:bg-[#0D3B33]"
            >
              Submit work
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export function HowToApplyPanel({
  isDevelopment,
  isRegisteringUnlock,
  isUnlockChecking,
  isUnlocked,
  registrationError,
  registrationSent: _registrationSent,
  turnstileSiteKey,
  unlockForm,
  unlockMessage,
  unlockToken,
  unlockTokenFail,
  onGoToApply,
  onRegisterUnlock,
  onUnlockFieldChange,
  onUnlockTokenError,
  onUnlockTokenSuccess,
}: HowToApplyPanelProps) {
  const isLocked = !isUnlocked;
  const unlockPanel = isLocked ? (
    <div className="relative z-20 space-y-3">
      {unlockMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center [font-family:var(--font-paraluman-body)] text-sm text-red-700">
          {unlockMessage}
        </div>
      )}
      <UnlockRegistrationPanel
        isDevelopment={isDevelopment}
        isRegisteringUnlock={isRegisteringUnlock}
        registrationError={registrationError}
        turnstileSiteKey={turnstileSiteKey}
        unlockForm={unlockForm}
        unlockToken={unlockToken}
        unlockTokenFail={unlockTokenFail}
        onRegisterUnlock={onRegisterUnlock}
        onUnlockFieldChange={onUnlockFieldChange}
        onUnlockTokenError={onUnlockTokenError}
        onUnlockTokenSuccess={onUnlockTokenSuccess}
      />
    </div>
  ) : undefined;

  return (
    <div className="[font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/86 sm:text-[0.9rem]">
      <style>{`
        @keyframes sofi-unlock-reveal {
          0% {
            opacity: 0.62;
            filter: blur(10px);
            transform: translateY(10px);
            box-shadow: 0 0 0 rgba(0, 168, 134, 0);
          }
          48% {
            opacity: 1;
            filter: blur(1.5px);
            transform: translateY(0);
            box-shadow: 0 0 44px rgba(0, 168, 134, 0.22);
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
            box-shadow: 0 0 0 rgba(0, 168, 134, 0);
          }
        }
      `}</style>
      <div className="relative">
        <div className={cn("space-y-5", isLocked && "select-none")}>
          <section className="space-y-3.5">
            <h1 className="[font-family:var(--font-paraluman-heading)] text-[1.45rem] font-bold leading-tight tracking-[-0.035em] text-[#052338] sm:text-[1.55rem]">
              Application Process
            </h1>
            <p>
              We&apos;re doing this differently. Instead of resumes, we want to
              see how you actually think and execute.
            </p>
          </section>

          <section className="space-y-3">
            <SectionTitle>The Challenge</SectionTitle>
            <p>
              You&apos;ll create a marketing proposal for GIA, a product
              we&apos;re actively preparing to launch. We already have the
              product, and the core strategy. Your role is to:
            </p>
            <AsteriskList
              items={[
                "Build a marketing plan for GIA to reach the right audience through a clear marketing strategy.",
                "Build a compelling pitch that shows you understand the product and the market.",
                "Give suggestions on how we can grow faster.",
              ]}
            />
            <p>
              This does not need to be a finished campaign. What matters is your
              ability to think strategically, communicate clearly, and show us
              how you&apos;d get GIA in front of TikTok creators.
            </p>
            <p>
              We&apos;ll give you direction. How you execute is up to you. You
              are given the freedom to shape the marketing approach, make
              creative decisions, and define how the story should be told.
            </p>
            <p>
              Use any tools you want, including AI, references, or your own
              workflow.
            </p>
          </section>

          {isUnlockChecking ? (
            <div className="rounded-md border border-[#00A886]/18 bg-white/78 p-4">
              <Loader>Checking unlock link...</Loader>
            </div>
          ) : null}

          <ChallengeDetails
            isLocked={isLocked}
            unlockPanel={unlockPanel}
            onGoToApply={onGoToApply}
          />
        </div>
      </div>
    </div>
  );
}
