import { type ChangeEvent, type FormEvent } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { CheckCircle2, Loader2, LockKeyhole, Mail } from "lucide-react";
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
  registrationSent,
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
  | "registrationSent"
  | "turnstileSiteKey"
  | "unlockForm"
  | "unlockToken"
  | "unlockTokenFail"
  | "onRegisterUnlock"
  | "onUnlockFieldChange"
  | "onUnlockTokenError"
  | "onUnlockTokenSuccess"
>) {
  const updateField =
    (field: keyof SuperListingUnlockForm) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      onUnlockFieldChange(field, event.target.value);
    };

  if (registrationSent) {
    return (
      <div className="space-y-3 rounded-md border border-[#00A886]/18 bg-white/78 p-4 shadow-[0_18px_36px_-32px_rgba(5,35,56,0.35)]">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#00A886]" />
          <div className="space-y-1">
            <p className="[font-family:var(--font-paraluman-heading)] text-base font-bold tracking-[-0.02em] text-[#052338]">
              Check your email
            </p>
            <p className="[font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/78">
              We sent the GIA challenge unlock link to{" "}
              <span className="font-semibold text-[#052338]">
                {unlockForm.email || "your email"}
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-md border border-[#00A886]/18 bg-white/78 p-4 shadow-[0_18px_36px_-32px_rgba(5,35,56,0.35)]">
      <div className="flex items-start gap-3">
        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#00A886]" />
        <div className="space-y-1">
          <p className="[font-family:var(--font-paraluman-heading)] text-base font-bold tracking-[-0.02em] text-[#052338]">
            Unlock the challenge
          </p>
          <p className="[font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/78">
            Register your interest and we&apos;ll email the private challenge
            link. The product details and submit form unlock from that link.
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={(e) => void onRegisterUnlock(e)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="[font-family:var(--font-paraluman-heading)] text-sm font-bold tracking-[-0.02em] text-[#052338]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={unlockForm.fullName}
              onChange={updateField("fullName")}
              className="h-11 rounded-md border-[#052338]/14 bg-white text-[#052338] [font-family:var(--font-paraluman-body)] text-sm shadow-none focus-visible:ring-[#00B894]/20"
            />
          </div>
          <div className="space-y-2">
            <label className="[font-family:var(--font-paraluman-heading)] text-sm font-bold tracking-[-0.02em] text-[#052338]">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              required
              type="email"
              value={unlockForm.email}
              onChange={updateField("email")}
              className="h-11 rounded-md border-[#052338]/14 bg-white text-[#052338] [font-family:var(--font-paraluman-body)] text-sm shadow-none focus-visible:ring-[#00B894]/20"
            />
          </div>
        </div>

        {isDevelopment ? (
          <p className="border-t border-[#052338]/10 pt-4 [font-family:var(--font-paraluman-body)] text-sm text-[#00866f]">
            Captcha disabled in development. Use{" "}
            <span className="font-semibold">?unlockToken=dev-unlock</span> to
            preview the unlocked state.
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
          className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-[#052338] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-white transition-all duration-200 hover:bg-[#0D3B33]"
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

function LockedProductOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f7fffd]/42 px-4 backdrop-blur-[1px]">
      <div className="max-w-sm rounded-md border border-[#00A886]/20 bg-white p-4 text-center shadow-[0_18px_44px_-32px_rgba(5,35,56,0.55)]">
        <LockKeyhole className="mx-auto h-6 w-6 text-[#00A886]" />
        <p className="mt-2 [font-family:var(--font-paraluman-heading)] text-base font-bold tracking-[-0.02em] text-[#052338]">
          Product brief locked
        </p>
        <p className="mt-1 [font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/74">
          Register above and open the email link to reveal the GIA challenge.
        </p>
      </div>
    </div>
  );
}

function PlaceholderLine({
  className,
  widthClassName,
}: {
  className?: string;
  widthClassName: string;
}) {
  return (
    <div
      className={cn(
        "h-3 rounded-full bg-[#0d3b33]/18 shadow-[0_0_18px_rgba(0,168,134,0.12)]",
        widthClassName,
        className,
      )}
    />
  );
}

function LockedChallengePreview() {
  return (
    <div className="relative -mx-5 sm:-mx-6" aria-label="Locked challenge">
      <LockedProductOverlay />
      <div className="pointer-events-none select-none space-y-5 border-y border-[#00A886]/12 bg-[#E8FFF9]/50 px-5 py-5 blur-[7px] sm:px-6">
        <section className="space-y-4">
          <PlaceholderLine className="h-6" widthClassName="w-44" />
          <div className="space-y-3">
            <PlaceholderLine className="h-5" widthClassName="w-64 max-w-full" />
            <PlaceholderLine widthClassName="w-full" />
            <PlaceholderLine widthClassName="w-11/12" />
            <PlaceholderLine widthClassName="w-4/5" />
          </div>
          <div className="space-y-3 pt-2">
            <PlaceholderLine className="h-4" widthClassName="w-36" />
            <PlaceholderLine widthClassName="w-10/12" />
            <PlaceholderLine widthClassName="w-3/4" />
          </div>
          <div className="space-y-3 pt-2">
            <PlaceholderLine className="h-4" widthClassName="w-28" />
            <PlaceholderLine widthClassName="w-full" />
            <PlaceholderLine widthClassName="w-2/3" />
          </div>
        </section>

        <section className="space-y-4">
          <PlaceholderLine className="h-6" widthClassName="w-52" />
          <div className="space-y-3">
            <PlaceholderLine className="h-4" widthClassName="w-40" />
            <PlaceholderLine widthClassName="w-full" />
            <PlaceholderLine widthClassName="w-5/6" />
            <PlaceholderLine widthClassName="w-3/4" />
          </div>
          <div className="space-y-3">
            <PlaceholderLine className="h-4" widthClassName="w-36" />
            <PlaceholderLine widthClassName="w-11/12" />
            <PlaceholderLine widthClassName="w-4/5" />
            <PlaceholderLine widthClassName="w-2/3" />
          </div>
        </section>

        <section className="space-y-4">
          <PlaceholderLine className="h-6" widthClassName="w-44" />
          <PlaceholderLine widthClassName="w-full" />
          <PlaceholderLine widthClassName="w-10/12" />
          <PlaceholderLine widthClassName="w-3/5" />
        </section>
      </div>
    </div>
  );
}

function ChallengeDetails({ onGoToApply }: { onGoToApply: () => void }) {
  return (
    <div className="relative -mx-5 sm:-mx-6">
      <div className="space-y-5 border-y border-[#00A886]/12 bg-[#E8FFF9]/50 px-5 py-5 transition duration-300 sm:px-6">
        <section className="space-y-3">
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
                TikTok creators in the Philippines who don’t speak fluent
                analytics: people who see their metrics but don’t fully
                understand them.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-[#052338]">Use case:</p>
              <p>
                You feed her your Tiktok profile link. She gives you back a
                readable report with hook scores, audience signals, sentiment
                analysis, and suggestions on what to post next.
              </p>
            </div>
            <div className="pt-2 space-y-1">
              <p>Here is a sample of the report that GIA generates.</p>
              <div className="space-y-1">
                <a
                  href="/student/super-listing/sofi-ai/reference/output"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00A886] underline hover:text-[#00A886]/80 transition-colors block"
                >
                  Sample #1
                </a>
                <a
                  href="/student/super-listing/sofi-ai/reference/sample"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00A886] underline hover:text-[#00A886]/80 transition-colors block"
                >
                  Sample #2
                </a>
              </div>
            </div>
            <div className="pt-2 space-y-1">
              <p>
                Also, heres a sample landing page we made:{" "}
                <a
                  href="https://sofi-ai-gia.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00A886] underline hover:text-[#00A886]/80 transition-colors"
                >
                  https://sofi-ai-gia.netlify.app/
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>What You Will Build</SectionTitle>
          <div className="[font-family:var(--font-paraluman-body)] space-y-4 text-sm leading-6 text-[#184d45]/86 sm:text-[0.9rem]">
            <div className="space-y-2">
              <p className="font-semibold text-[#052338]">1. Landing Page</p>{" "}
              <p>
                We have an existing version of the landing page. Your task is to
                improve or redesign it.
              </p>
              <p>Think about:</p>
              <AsteriskList
                items={[
                  "How you would improve conversion.",
                  "How clearly the product is communicated.",
                  "What would make creators immediately understand the value.",
                ]}
              />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-[#052338]">2. Product Flow</p>{" "}
              <p>
                Design the end-to-end user experience for the actual product,
                from inputting a TikTok profile link to receiving and viewing
                the generated report.
              </p>
              <p>As you design, consider:</p>
              <AsteriskList
                items={[
                  "Is a PDF the best way to present the report? Or would a dashboard work better?",
                  "Should we be inputting the Tiktok profile link only? Are there any other details to input that would be useful?",
                  "Is anything missing in the current user flow?",
                  "Or, should this product exist at all? Do you have any suggestions on what we should be making instead?",
                ]}
                emphasizedItems={[
                  "Or, should this product exist at all? Do you have any suggestions on what we should be making instead?",
                ]}
              />
              <p>
                You have full flexibility in how you structure this experience.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>How we&apos;ll evaluate</SectionTitle>
          <div className="[font-family:var(--font-paraluman-body)] space-y-2 text-sm leading-6 text-[#184d45]/86 sm:text-[0.9rem]">
            <p>
              <span className="font-semibold text-[#052338]">1. Thinking:</span>{" "}
              How you approach the problem and make decisions.
            </p>
            <p>
              <span className="font-semibold text-[#052338]">2. Design:</span>{" "}
              Clarity, usability, and overall execution.
            </p>
            <p>
              <span className="font-semibold text-[#052338]">
                3. Communication:
              </span>{" "}
              How well you explain your work and ideas.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={onGoToApply}
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
  registrationSent,
  turnstileSiteKey,
  unlockEmail,
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

  return (
    <div className="[font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/86 sm:text-[0.9rem] space-y-5">
      <section className="space-y-3.5">
        <h1 className="[font-family:var(--font-paraluman-heading)] text-[1.45rem] font-bold leading-tight tracking-[-0.035em] text-[#052338] sm:text-[1.55rem]">
          Application Process
        </h1>
        <p>
          We&apos;re doing this differently. Instead of resumes, we want to see
          how you actually think and build.
        </p>
      </section>

      <section className="space-y-3">
        <SectionTitle>The Challenge</SectionTitle>
        <p>
          You&apos;ll design a new product that we&apos;re planning to release.
          We have a rough product vision, backend, and strategy. Your role is
          to:
        </p>
        <AsteriskList
          items={[
            "Bring it to life through design.",
            "Create a clear user flow.",
            "Give suggestions on how the product could be better.",
          ]}
        />
        <p>
          This does not need to be fully functional. What matters is your
          ability to create a clear, thoughtful vision, and to make us
          understand how it should look.
        </p>
        <p>
          We&apos;ll give you the direction and you are given the freedom to
          shape the user journey, make product and design decisions, and define
          how the experience should feel.
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
      ) : isUnlocked ? (
        <div className="flex items-start gap-3 rounded-md border border-[#00A886]/18 bg-white/78 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#00A886]" />
          <div className="space-y-1">
            <p className="[font-family:var(--font-paraluman-heading)] text-base font-bold tracking-[-0.02em] text-[#052338]">
              GIA challenge unlocked
            </p>
            <p className="[font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/78">
              {unlockEmail
                ? `Unlocked for ${unlockEmail}.`
                : "You can now view the product brief and submit your work."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {unlockMessage && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 [font-family:var(--font-paraluman-body)] text-sm text-red-700">
              {unlockMessage}
            </div>
          )}
          <UnlockRegistrationPanel
            isDevelopment={isDevelopment}
            isRegisteringUnlock={isRegisteringUnlock}
            registrationError={registrationError}
            registrationSent={registrationSent}
            turnstileSiteKey={turnstileSiteKey}
            unlockForm={unlockForm}
            unlockToken={unlockToken}
            unlockTokenFail={unlockTokenFail}
            onRegisterUnlock={onRegisterUnlock}
            onUnlockFieldChange={onUnlockFieldChange}
            onUnlockTokenError={onUnlockTokenError}
            onUnlockTokenSuccess={onUnlockTokenSuccess}
          />
        </>
      )}

      {isLocked ? (
        <LockedChallengePreview />
      ) : (
        <ChallengeDetails onGoToApply={onGoToApply} />
      )}
    </div>
  );
}
