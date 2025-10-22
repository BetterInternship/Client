"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z, ZodTypeAny } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import {
  RecipientDynamicForm,
  type RecipientFieldDef,
} from "@/components/features/student/forms/RecipientDynamicForm";
import { useDynamicFormSchema } from "@/lib/db/use-moa-backend";
import { UserService } from "@/lib/api/services";
import { useQuery } from "@tanstack/react-query";

type Audience = "entity" | "student-guardian" | "university";
type Party = "entity" | "student-guardian" | "university";
type Role = "entity" | "student-guardian" | "university";

function normalizeAudience(raw: string | null): Audience {
  const s = (raw || "").trim().toLowerCase();
  if (s === "guardian" || s === "student-guardian") return "student-guardian";
  if (s === "university" || s === "uni" || s === "college") return "university";
  return "entity";
}

function mapAudienceToRoleAndParty(aud: Audience): {
  role: Role;
  party: Party;
} {
  switch (aud) {
    case "entity":
      return { role: "entity", party: "entity" };
    case "student-guardian":
      return { role: "student-guardian", party: "student-guardian" };
    case "university":
      return { role: "university", party: "university" };
  }
}

export default function Page() {
  const params = useSearchParams();

  // URL params
  const audience = normalizeAudience(params.get("for"));
  const { role, party } = mapAudienceToRoleAndParty(audience);

  const formName = (params.get("form") || "").trim();
  const pendingDocumentId = (params.get("pending") || "").trim();
  const signatoryName = (params.get("name") || "").trim();
  const signatoryTitle = (params.get("title") || "").trim();

  // Optional header bits
  const studentName = params.get("student") || "The student";
  const templateHref = params.get("template") || "";

  // Pending document preview
  const {
    data: pendingRes,
    isLoading: loadingPending,
    error: pendingErr,
  } = useQuery({
    queryKey: ["pending-info", pendingDocumentId],
    queryFn: () => UserService.getPendingInformation(pendingDocumentId),
    staleTime: 60_000,
    enabled: !!pendingDocumentId,
  });

  const pendingInfo = (pendingRes as any)?.pendingInfo ?? null;
  const pendingUrl = pendingInfo?.latest_document_url;

  // Pull defs (validators already evaluated on backend)
  const {
    fields: defs,
    isLoading,
    error,
  } = useDynamicFormSchema(formName, { role });

  // Map internal defs -> RecipientFieldDef
  const fields: RecipientFieldDef[] = useMemo(
    () =>
      (defs ?? []).map((f) => ({
        id: f.id ?? f.name ?? crypto.randomUUID(),
        key: f.name ?? f.label ?? "",
        label: f.label ?? f.name ?? "",
        type: f.type ?? "text",
        section: f.section ?? null,
        placeholder: f.placeholder,
        helper: f.helper,
        maxLength: f.maxLength,
        options: Array.isArray(f.options)
          ? f.options.map((o) => ({
              value: o?.value,
              label: o?.label,
            }))
          : undefined,
        validators: (f.validators as unknown as ZodTypeAny[]) ?? [],
        params: f.params ?? undefined,
      })),
    [defs],
  );

  // local form state
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  // success modal state (forms-style)
  const [successOpen, setSuccessOpen] = useState(false);
  const [success, setSuccess] = useState<{
    title: string;
    body: string;
    href?: string;
  } | null>(null);

  const setField = (k: string, v: any) => setValues((p) => ({ ...p, [k]: v }));

  const validatorFns = useMemo(() => compileValidators(fields), [fields]);

  const validateNow = () => {
    const next = validateAll(fields, values, validatorFns);
    setErrors(next);
    return Object.values(next).every((m) => !m);
  };

  // Section titles per audience
  const sectionTitleMap = {
    entity: "Entity Information",
    university: "University Information",
    student: "Student Information",
    "student-guardian": "Guardian Information",
    internship: "Internship Information",
  };

  async function handleSubmit() {
    setSubmitted(true);

    if (!formName || !pendingDocumentId) return;
    if (!validateNow()) return;

    // Flatten the fields present on this page
    const flatValues: Record<string, string> = {};
    for (const f of fields) {
      const v = values[f.key];
      if (v === undefined || v === null) continue;
      const s = typeof v === "string" ? v : String(v);
      if (s !== "undefined") flatValues[f.key] = s;
    }

    try {
      setBusy(true);
      const res = await UserService.approveSignatory({
        pendingDocumentId,
        signatoryName,
        signatoryTitle,
        party,
        values: flatValues,
      });

      const data = (res as any)?.data ?? res;

      if (data?.signedDocumentUrl) {
        setSuccess({
          title: "Submitted & Signed",
          body: "This document is now fully signed. You can download the signed copy below.",
          href: data.signedDocumentUrl,
        });
      } else {
        setSuccess({
          title: "Details Submitted",
          body:
            data?.message ??
            "Thanks! Your details were submitted. We’ll notify you when the document is ready.",
        });
      }
      setSuccessOpen(true);
    } catch (e: any) {
      // Error as a blocking alert-style modal to keep UX consistent
      setSuccess({
        title: "Submission Failed",
        body:
          e?.message ?? "Something went wrong while submitting your details.",
      });
      setSuccessOpen(true);
    } finally {
      setBusy(false);
    }
  }

  // optional: scroll to first error
  useEffect(() => {
    if (!submitted) return;
    const first = Object.entries(errors).find(([, msg]) => !!msg)?.[0];
    if (first)
      document
        .querySelector(`[data-field="${first}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [submitted, errors]);

  return (
    <div className="container max-w-3xl px-4 sm:px-10 pt-8 sm:pt-16 mx-auto">
      <div className="space-y-6">
        {/* header */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-justify">
            {studentName} is requesting the following details for{" "}
            {templateHref ? (
              <Link
                href={templateHref}
                className="underline underline-offset-2 hover:text-primary"
                target="_blank"
              >
                the internship document
              </Link>
            ) : (
              "the internship document"
            )}
            .
          </h1>
        </div>

        {/* pending document preview */}
        {pendingDocumentId && (
          <Card className="p-4 text-sm">
            {loadingPending ? (
              <div className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading pending document…
              </div>
            ) : pendingErr ? (
              <div className="text-rose-600">
                Failed to load pending document.
              </div>
            ) : !pendingInfo ? (
              <div className="text-gray-600">
                No pending document data found.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm truncate">
                  Form name:{" "}
                  <span className="font-semibold">{pendingInfo.form_name}</span>
                </div>

                {pendingUrl ? (
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => window.open(pendingUrl, "_blank")}
                    aria-label="Open pending document"
                  >
                    Preview document
                  </Button>
                ) : (
                  <div className="text-gray-500 text-sm">
                    A preview link isn’t available for this document.
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        <p className="text-gray-600 text-sm">
          Please provide the required{" "}
          {audience === "entity"
            ? "entity"
            : audience === "student-guardian"
              ? "guardian"
              : "university"}{" "}
          details below.
        </p>

        {/* loading / error / empty / form */}
        {isLoading ? (
          <Card className="p-6 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading form…
            </span>
          </Card>
        ) : error ? (
          <Card className="p-6 text-sm text-rose-600">
            Failed to load fields.
          </Card>
        ) : fields.length === 0 ? (
          <Card className="p-6 text-sm text-gray-500">
            No fields available for this request.
          </Card>
        ) : (
          <Card className="p-4 sm:p-5 space-y-4">
            <RecipientDynamicForm
              formKey={`recipient:${audience}:${formName || "unknown"}`}
              fields={fields}
              values={values}
              onChange={setField}
              errors={errors}
              showErrors={submitted}
              sectionTitleMap={sectionTitleMap}
              emptyHint="All required fields for you have been completed."
            />

            <div className="flex justify-end pt-2">
              <Button onClick={handleSubmit} disabled={busy} aria-busy={busy}>
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </span>
                ) : (
                  "Submit & Sign"
                )}
              </Button>
            </div>
          </Card>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="size-4" />
          Your information is used only for internship documentation.
        </div>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="mb-2">
              <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
            </div>
            <DialogTitle className="text-lg">
              {success?.title ?? "Success"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {success?.body ?? "Your submission was successful."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex w-full gap-2 sm:justify-center">
            {success?.href && (
              <Button asChild>
                <Link
                  href={success.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open signed document
                </Link>
              </Button>
            )}
            <Button
              variant={success?.href ? "outline" : "default"}
              onClick={() => setSuccessOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────── helpers ───────── */

function compileValidators(defs: RecipientFieldDef[]) {
  const isEmpty = (v: any) =>
    v === undefined ||
    v === null ||
    (typeof v === "string" && v.trim() === "") ||
    (Array.isArray(v) && v.length === 0);

  const requiredCheckFor = (d: RecipientFieldDef) => {
    switch ((d.type || "text").toLowerCase()) {
      case "signature":
      case "checkbox":
        return (v: any) => (v === true ? null : "This field is required.");
      case "number":
        return (v: any) => {
          const s = v == null ? "" : String(v).trim();
          if (s === "") return "This field is required.";
          const n = Number(s);
          return Number.isFinite(n) ? null : "Enter a valid number.";
        };
      case "date":
        return (v: any) =>
          typeof v === "number" && v > 0 ? null : "Please select a date.";
      case "time":
        return (v: any) => {
          const s = v == null ? "" : String(v).trim();
          return s ? null : "Please select a time.";
        };
      case "select":
      case "reference":
        return (v: any) => {
          const s = v == null ? "" : String(v).trim();
          return s ? null : "Please choose an option.";
        };
      default:
        return (v: any) => (!isEmpty(v) ? null : "This field is required.");
    }
  };

  const map: Record<string, ((v: any) => string | null)[]> = {};

  for (const d of defs) {
    const fns: ((v: any) => string | null)[] = [];
    fns.push(requiredCheckFor(d));

    for (const schema of d.validators ?? []) {
      const zschema = schema as ZodTypeAny;
      fns.push((value: any) => {
        const res = zschema.safeParse(value);
        if (res.success) return null;
        const issues = (res.error as any)?.issues as
          | { message: string }[]
          | undefined;
        return issues?.map((i) => i.message).join("\n") ?? res.error.message;
      });
    }

    map[d.key] = fns;
  }

  return map;
}

function validateAll(
  defs: RecipientFieldDef[],
  values: Record<string, any>,
  validatorFns: Record<string, ((v: any) => string | null)[]>,
) {
  const next: Record<string, string> = {};
  for (const d of defs) {
    const fns = validatorFns[d.key] ?? [];
    const val = values[d.key];
    const firstErr = fns.map((fn) => fn(val)).find(Boolean) ?? "";
    next[d.key] = firstErr || "";
  }
  return next;
}
