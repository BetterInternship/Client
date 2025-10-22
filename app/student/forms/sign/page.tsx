"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z, ZodTypeAny } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  RecipientDynamicForm,
  type RecipientFieldDef,
} from "@/components/features/student/forms/RecipientDynamicForm";
import { useDynamicFormSchema } from "@/lib/db/use-moa-backend";
import { UserService } from "@/lib/api/services";

type Audience = "entity" | "student-guardian" | "university";
type Party = "entity" | "student-guardian" | "university";
type Role = "entity" | "student-guardian" | "university";

function normalizeAudience(raw: string | null): Audience {
  const s = (raw || "").trim().toLowerCase();
  if (s === "guardian" || s === "student-guardian") return "student-guardian";
  if (s === "university" || s === "uni" || s === "college") return "university";
  // default to entity
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
  const pendingDocumentId = (params.get("pending") || "").trim(); // required to submit
  const signatoryName = (params.get("name") || "").trim();
  const signatoryTitle = (params.get("title") || "").trim();

  // Optional header bits
  const studentName = params.get("student") || "The student";
  const templateHref = params.get("template") || "";

  // Pull defs (evaluated validators already included)
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
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const setField = (k: string, v: any) => setValues((p) => ({ ...p, [k]: v }));

  const validatorFns = useMemo(() => compileValidators(fields), [fields]);

  const validateNow = () => {
    const next = validateAll(fields, values, validatorFns);
    setErrors(next);
    return Object.values(next).every((m) => !m);
  };

  // Section titles per audience
  const sectionTitleMap = {
    "entity": "Entity Information",
    "university": "University Information",
    "student": "Student Information",
    "student-guardian": "Guardian Information",
    "internship": "Internship Information",
  };

  async function handleSubmit() {
    setSubmitted(true);
    setServerMsg(null);
    setSignedUrl(null);

    if (!formName) {
      setServerMsg("Missing form name.");
      return;
    }
    if (!pendingDocumentId) {
      setServerMsg("Missing pending document id.");
      return;
    }
    if (!validateNow()) return;

    // Flatten only the fields present on this page to strings
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
        party, // "entity" | "student-guardian" | "university"
        values: flatValues,
      });

      const data = (res as any)?.data ?? res;
      if (data?.signedDocumentUrl) {
        setSignedUrl(data.signedDocumentUrl);
        setServerMsg("Document fully signed. You can download it below.");
      } else if (data?.message) {
        setServerMsg(data.message);
      } else {
        setServerMsg("Submitted successfully.");
      }
    } catch (e: any) {
      setServerMsg(e?.message ?? "Submission failed.");
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
          <p className="text-gray-600 text-sm">
            Please provide the required{" "}
            {audience === "entity"
              ? "entity"
              : audience === "student-guardian"
                ? "guardian"
                : "university"}{" "}
            details below.
          </p>
        </div>

        {/* notices */}
        {serverMsg && (
          <Card className="p-4 text-sm">
            <div className="space-y-1">
              <div>{serverMsg}</div>
              {signedUrl && (
                <div className="pt-1">
                  <Link
                    href={signedUrl}
                    target="_blank"
                    className="underline underline-offset-2 text-primary"
                  >
                    Open signed document
                  </Link>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* loading / error / empty / form */}
        {isLoading ? (
          <Card className="p-6 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading form…
            </span>
          </Card>
        ) : error ? (
          <Card className="p-6 text-sm text-red-600">
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
    // Treat everything as required for recipients unless validators explicitly allow empty.
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
        // we store dates as ms; 0/undefined = empty
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

    // 1) Default required check
    fns.push(requiredCheckFor(d));

    // 2) Zod validators from backend
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
