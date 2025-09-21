"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Upload, CheckCircle2, UserCheck, ChevronLeft, ChevronRight, MailCheck, Loader2, FileText, ShieldCheck } from "lucide-react";
// shadcn/ui components (assumed available in your project)
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * CompleteProfileStepper
 * -------------------------------------------------------------
 * A 3-step onboarding component designed to sit inside a modal later.
 * Theme: BetterInternship (clean, bold headings, rounded cards, subtle grid)
 * Steps:
 *  1) Drop your resume (drag & drop or click to upload)
 *  2) Check your details (editable form prefilled from parsed resume)
 *  3) Activate your account (send verification + accept terms)
 *
 * Props are intentionally flexible so you can wire it to your existing hooks.
 */

export type ProfileDraft = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  university?: string;
  degree?: string;
  graduation?: string; // YYYY-MM
  skills?: string;
  summary?: string;
  linkedin?: string;
  portfolio?: string;
};

export type CompleteProfileStepperProps = {
  initialProfile?: ProfileDraft;
  /** Triggered when a resume file is chosen. Return parsed fields if you want to prefill step 2 */
  onResumeSelected?: (file: File) => Promise<Partial<ProfileDraft> | void> | Partial<ProfileDraft> | void;
  /** Called when user hits Finish */
  onComplete?: (finalProfile: ProfileDraft) => Promise<void> | void;
  /** Optional async to fire email/OTP. Should resolve true if sent. */
  onSendActivation?: () => Promise<boolean> | boolean;
  /** Optional label for the CTA button at the final step */
  finishLabel?: string;
};

const steps = [
  { id: 0, title: "Drop your resume", icon: Upload },
  { id: 1, title: "Check your details", icon: UserCheck },
  { id: 2, title: "Activate your account", icon: MailCheck },
] as const;

export default function CompleteProfileStepper({
  initialProfile,
  onResumeSelected,
  onComplete,
  onSendActivation,
  finishLabel = "Finish & Continue",
}: CompleteProfileStepperProps) {
  const [step, setStep] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [activationSent, setActivationSent] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [profile, setProfile] = useState<ProfileDraft>({
    firstName: initialProfile?.firstName ?? "",
    middleName: initialProfile?.middleName ?? "",
    lastName: initialProfile?.lastName ?? "",
    email: initialProfile?.email ?? "",
    phone: initialProfile?.phone ?? "",
    university: initialProfile?.university ?? "",
    degree: initialProfile?.degree ?? "",
    graduation: initialProfile?.graduation ?? "",
    skills: initialProfile?.skills ?? "",
    summary: initialProfile?.summary ?? "",
    linkedin: initialProfile?.linkedin ?? "",
    portfolio: initialProfile?.portfolio ?? "",
  });

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  // Handlers ---------------------------------------------------
  const handleFileChange = async (files?: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    setResumeFile(file);
    if (onResumeSelected) {
      setIsBusy(true);
      try {
        const parsed = await onResumeSelected(file);
        if (parsed) setProfile((p) => ({ ...p, ...parsed }));
      } finally {
        setIsBusy(false);
      }
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSendActivation = async () => {
    if (!onSendActivation) {
      setActivationSent(true);
      return;
    }
    setIsBusy(true);
    try {
      const ok = await onSendActivation();
      setActivationSent(!!ok);
    } finally {
      setIsBusy(false);
    }
  };

  const handleFinish = async () => {
    if (!acceptedTerms) return;
    if (onComplete) {
      setIsBusy(true);
      try {
        await onComplete(profile);
      } finally {
        setIsBusy(false);
      }
    }
  };

  // UI ---------------------------------------------------------
  return (
    <div className="w-full max-w-2xl mx-auto">
      <StepperHeader step={step} />

      <Card className="mt-4 shadow-sm border-border/60">
        <CardContent className="p-4 sm:p-6">
          {/* Progress */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{steps[step].title}</div>
            <div className="text-xs text-muted-foreground">{Math.round(progress)}%</div>
          </div>
          <div className="h-1.5 rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <Separator className="my-6" />

          {step === 0 && (
            <StepResume
              file={resumeFile}
              busy={isBusy}
              onFileChange={handleFileChange}
              onNext={next}
            />
          )}

          {step === 1 && (
            <StepDetails
              value={profile}
              onChange={setProfile}
              onBack={back}
              onNext={next}
            />
          )}

          {step === 2 && (
            <StepActivate
              accepted={acceptedTerms}
              setAccepted={setAcceptedTerms}
              sent={activationSent}
              onSend={handleSendActivation}
              onBack={back}
              onFinish={handleFinish}
              busy={isBusy}
              finishLabel={finishLabel}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// -------------------- Subcomponents ---------------------------
function StepperHeader({ step }: { step: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {steps.map((s, idx) => {
        const ActiveIcon = s.icon;
        const active = idx === step;
        const done = idx < step;
        return (
          <motion.div
            key={s.id}
            layout
            className={
              "flex items-center gap-2 rounded-2xl border p-3 " +
              (active
                ? "border-primary/60 bg-primary/5"
                : done
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-border/60")
            }
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-inner">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <ActiveIcon className={"h-5 w-5 " + (active ? "text-primary" : "text-muted-foreground")} />
              )}
            </div>
            <div className="text-sm font-medium leading-tight">
              {s.title}
              <div className="text-xs text-muted-foreground">Step {idx + 1}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function StepResume({
  file,
  busy,
  onFileChange,
  onNext,
}: {
  file: File | null;
  busy: boolean;
  onFileChange: (files?: FileList | null) => void | Promise<void>;
  onNext: () => void;
}) {
  return (
    <div>
      <div
        className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/70 bg-muted/30 p-8 text-center hover:bg-muted/50"
        onClick={() => (document.getElementById("resume-input") as HTMLInputElement)?.click()}
      >
        <Upload className="mb-3 h-8 w-8 text-primary" />
        <p className="text-base font-medium">Drop your resume (PDF/DOCX)</p>
        <p className="mt-1 text-sm text-muted-foreground">We’ll parse it to prefill your profile. You can edit next.</p>
        <input
          id="resume-input"
          type="file"
          accept=".pdf,.doc,.docx"
          className="sr-only"
          onChange={(e) => onFileChange(e.target.files)}
        />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Parsing…
          </div>
        )}
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between rounded-xl border bg-background p-3">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div className="text-sm">
              <div className="font-medium leading-none">{file.name}</div>
              <div className="text-muted-foreground text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          </div>
          <Badge variant="secondary">Ready</Badge>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button variant="secondary" disabled>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={!file || busy}>
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function StepDetails({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: ProfileDraft;
  onChange: (v: ProfileDraft) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <Field id="firstName" label="First name">
        <Input id="firstName" value={value.firstName} onChange={(e) => onChange({ ...value, firstName: e.target.value })} />
      </Field>
      <Field id="lastName" label="Last name">
        <Input id="lastName" value={value.lastName} onChange={(e) => onChange({ ...value, lastName: e.target.value })} />
      </Field>
      <Field id="middleName" label="Middle name (optional)">
        <Input id="middleName" value={value.middleName} onChange={(e) => onChange({ ...value, middleName: e.target.value })} />
      </Field>
      <Field id="email" label="Email">
        <Input id="email" type="email" value={value.email} onChange={(e) => onChange({ ...value, email: e.target.value })} />
      </Field>
      <Field id="phone" label="Phone number">
        <Input id="phone" value={value.phone} onChange={(e) => onChange({ ...value, phone: e.target.value })} />
      </Field>
      <Field id="university" label="University">
        <Input id="university" value={value.university} onChange={(e) => onChange({ ...value, university: e.target.value })} />
      </Field>
      <Field id="degree" label="Degree / Program">
        <Input id="degree" value={value.degree} onChange={(e) => onChange({ ...value, degree: e.target.value })} />
      </Field>
      <Field id="graduation" label="Graduation (YYYY-MM)">
        <Input id="graduation" placeholder="2026-06" value={value.graduation} onChange={(e) => onChange({ ...value, graduation: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <Field id="skills" label="Skills (comma‑separated)">
          <Input id="skills" placeholder="React, SQL, Canva" value={value.skills} onChange={(e) => onChange({ ...value, skills: e.target.value })} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field id="summary" label="About you (short summary)">
          <Textarea id="summary" rows={4} value={value.summary} onChange={(e) => onChange({ ...value, summary: e.target.value })} />
        </Field>
      </div>
      <Field id="linkedin" label="LinkedIn URL">
        <Input id="linkedin" placeholder="https://linkedin.com/in/username" value={value.linkedin} onChange={(e) => onChange({ ...value, linkedin: e.target.value })} />
      </Field>
      <Field id="portfolio" label="Portfolio / Website">
        <Input id="portfolio" placeholder="https://your.site" value={value.portfolio} onChange={(e) => onChange({ ...value, portfolio: e.target.value })} />
      </Field>

      <div className="sm:col-span-2 mt-4 flex items-center justify-between">
        <Button type="button" variant="secondary" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit">
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function StepActivate({
  accepted,
  setAccepted,
  sent,
  onSend,
  onBack,
  onFinish,
  busy,
  finishLabel,
}: {
  accepted: boolean;
  setAccepted: (v: boolean) => void;
  sent: boolean;
  onSend: () => void | Promise<void>;
  onBack: () => void;
  onFinish: () => void | Promise<void>;
  busy: boolean;
  finishLabel: string;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-background p-2 shadow-inner">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold">Verify & secure your account</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              We’ll send a verification link to your email. This helps keep your applications secure and lets employers reach you.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button type="button" onClick={onSend} disabled={busy || sent}>
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : sent ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Link sent
                  </>
                ) : (
                  <>
                    <MailCheck className="mr-2 h-4 w-4" /> Send verification link
                  </>
                )}
              </Button>
              {sent && <Badge variant="secondary">Check your inbox</Badge>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(Boolean(v))} />
        <Label htmlFor="terms" className="text-sm text-muted-foreground">
          I agree to the Terms and Privacy Policy.
        </Label>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="secondary" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="button" disabled={!accepted || busy} onClick={onFinish}>
          {finishLabel}
        </Button>
      </div>
    </div>
  );
}
