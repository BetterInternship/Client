"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  LoaderCircle,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { Button, cn } from "@betterinternship/components";
import { useAuthContext } from "@/app/hire/authctx";
import { PFP_UPDATED_EVENT } from "@/hooks/use-pfp";
import { EmployerService } from "@/lib/api/services";
import { FileUploadFormBuilder } from "@/lib/multipart-form";
import { readPubmatLogo, type PubmatLogo } from "@/lib/pubmat/company-logo";

type Picked = PubmatLogo & { name: string };
type SaveState = "idle" | "saving" | "saved" | "failed";

export function PubmatLogoPrompt({
  onContinue,
}: {
  onContinue: (logo: string | null) => void;
}) {
  const id = useId();
  const { user } = useAuthContext();
  const canSave = user?.role === "ADMIN";

  const input = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const [logo, setLogo] = useState<Picked>();
  const [save, setSave] = useState<SaveState>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [dragging, setDragging] = useState(false);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );

  // The company logo is a shared asset, so it is saved to the profile as soon
  // as it is picked — not on "Continue", which would lose an upload if the
  // modal closed at the wrong moment. Non-admins can't write it (the endpoint
  // is ADMIN-only); their pick still rides along on this poster.
  async function persist(picked: Picked, attempt: number) {
    if (!canSave) return;
    setSave("saving");
    try {
      const form = FileUploadFormBuilder.new("logo");
      form.file(picked.blob);
      const result = await EmployerService.updateMyPfp(form.build());
      if (!result?.success)
        throw new Error(result?.error ?? "The server didn’t accept the logo.");
      if (generation.current !== attempt) return;
      setSave("saved");
      // Every mounted pfp (header, account card) re-reads the new hash.
      window.dispatchEvent(new Event(PFP_UPDATED_EVENT));
    } catch {
      if (generation.current !== attempt) return;
      setSave("failed");
    }
  }

  async function choose(file: File | undefined) {
    if (!file) return;
    const attempt = ++generation.current;
    setError(undefined);
    setSave("idle");
    setBusy(true);
    try {
      const picked = await readPubmatLogo(file);
      if (generation.current !== attempt) return;
      const next = { ...picked, name: file.name };
      setLogo(next);
      setBusy(false);
      await persist(next, attempt);
    } catch (error) {
      if (generation.current === attempt) {
        setBusy(false);
        setError(
          error instanceof Error ? error.message : "Please try another image.",
        );
      }
    } finally {
      if (generation.current === attempt && input.current)
        input.current.value = "";
    }
  }

  const saving = save === "saving";
  const description = !logo
    ? undefined
    : save === "saved"
      ? "Saved to your company profile"
      : saving
        ? "Saving to your company profile…"
        : save === "failed"
          ? "Couldn’t save to your company profile"
          : canSave
            ? "Ready for your pubmat"
            : "Ready for this pubmat";

  return (
    <div className="space-y-6 py-3">
      <div className="space-y-3">
        <h3 className="max-w-sm text-xl font-semibold leading-snug tracking-tight text-gray-900">
          Help students recognize your company
        </h3>
        <p className="text-sm leading-relaxed text-gray-600">
          Add your logo so students can quickly see who’s hiring when your post
          is shared.
        </p>
      </div>

      <div className="space-y-3">
        <input
          ref={input}
          id={`${id}-file`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label="Choose a company logo"
          aria-describedby={`${id}-requirements`}
          disabled={busy}
          onChange={(event) => void choose(event.target.files?.[0])}
        />
        {logo ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-gray-50 p-1.5">
              <img
                src={logo.src}
                alt="Your company logo"
                className="max-h-full max-w-full object-contain"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {logo.name}
              </p>
              <p
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs",
                  save === "failed" ? "text-red-700" : "text-emerald-700",
                )}
                role={save === "failed" ? "alert" : "status"}
              >
                {saving ? (
                  <LoaderCircle
                    className="size-3.5 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : save === "failed" ? (
                  <TriangleAlert className="size-3.5" aria-hidden="true" />
                ) : (
                  <Check className="size-3.5" aria-hidden="true" />
                )}
                {description}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              disabled={busy || saving}
              onClick={() => input.current?.click()}
            >
              Change
            </Button>
          </div>
        ) : (
          <label
            htmlFor={`${id}-file`}
            onDragOver={(event) => {
              event.preventDefault();
              if (!busy) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              if (!busy) void choose(event.dataTransfer.files[0]);
            }}
            className={cn(
              "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/70 px-5 py-6 text-center hover:border-primary/50 hover:bg-primary/5",
              dragging && "border-primary bg-primary/5",
              busy && "pointer-events-none opacity-70",
            )}
          >
            {busy ? (
              <LoaderCircle
                className="mb-1 size-6 animate-spin text-primary motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Upload
                className="mb-1 size-6 text-gray-500"
                aria-hidden="true"
              />
            )}
            <span className="text-sm font-medium text-gray-900">
              {busy ? "Preparing your logo…" : "Choose a logo or drop it here"}
            </span>
            <span
              id={`${id}-requirements`}
              className="text-xs leading-relaxed text-gray-600"
            >
              PNG, JPG, or WebP · Up to 5 MB
              <br />
              Transparent PNG works best.
            </span>
          </label>
        )}
        {logo && !canSave && (
          <p className="text-xs leading-relaxed text-gray-600">
            Only company admins can save this to the company profile. It will
            still appear on your pubmat.
          </p>
        )}
        {logo && save === "failed" && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs leading-relaxed text-red-700">
            <p className="max-w-xs">
              Your logo still works for this poster. Update the company profile
              later from Account → Company.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0"
              disabled={!canSave || busy || saving}
              onClick={() => void persist(logo, generation.current)}
            >
              Save again
            </Button>
          </div>
        )}
        {error && (
          <p
            className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button
          type="button"
          className="w-full sm:flex-1"
          disabled={busy || saving}
          onClick={() => {
            if (!logo) input.current?.click();
            else onContinue(logo.src);
          }}
        >
          {saving
            ? "Saving your logo…"
            : logo
              ? "Continue to pubmat"
              : "Add company logo"}
          {!saving && <ArrowRight className="size-4" aria-hidden="true" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-gray-600 sm:flex-1"
          disabled={saving}
          onClick={() => onContinue(null)}
        >
          Continue without logo
        </Button>
      </div>
    </div>
  );
}
