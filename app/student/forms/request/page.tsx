"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  RecipientDynamicForm,
  type RecipientFieldDef,
} from "@/components/features/student/forms/RecipientDynamicForm";

/**
 * This renders the custom form for outside recipients (guardian or company).
 * It is driven by URL params only (for now).
 * ex.
 *    http://localhost:3000/forms/request <- by default this is for company, can also append ?for=company
 *    http://localhost:3000/forms/request?for=guardian
 *    http://localhost:3000/forms/request?for=guardian&form=student-moa&student=Juan%20Dela%20Cruz&template=/Guardian_Consent.pdf
 * @returns
 */
export default function Page() {
  const params = useSearchParams();

  const rawFor = (params.get("for") || "").trim().toLowerCase();
  const audience = rawFor === "guardian" ? "guardian" : "company";

  // optional header
  const studentName = params.get("student") || "The student";
  const templateHref = params.get("template") || "";

  // feed fields // TODO: we get the fields hir chuseyo
  const fields = useMemo(() => buildFakeFields(audience), [audience]);

  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const setField = (k: string, v: any) => setValues((p) => ({ ...p, [k]: v }));

  const validatorFns = useMemo(() => compileValidators(fields), [fields]);

  const validateNow = () => {
    const next = validateAll(fields, values, validatorFns);
    setErrors(next);
    return Object.values(next).every((m) => !m);
  };

  // neutralize section titles
  const sectionTitleMap =
    audience === "guardian"
      ? {
          student: "Applicant Details",
          guardian: "Guardian Details",
          entity: null,
          university: null,
        }
      : {
          entity: "Company Details",
          student: null,
          guardian: null,
          university: null,
        };

  async function handleSubmit() {
    setSubmitted(true);
    if (!validateNow()) return;

    const payload = groupBySectionUsingNames(fields, values);
    try {
      setBusy(true);
      // TODO: api call hir
      console.log("[SUBMIT]", { audience, payload });
      alert("Submitted! Check console for payload.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container max-w-3xl px-4 sm:px-10 pt-8 sm:pt-16 mx-auto">
      <div className="space-y-6">
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
            {audience === "company" ? "company" : "guardian"} details below.
          </p>
        </div>

        {/* Form card */}
        <Card className="p-4 sm:p-5 space-y-4">
          <RecipientDynamicForm
            formKey={`recipient:${audience}`}
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
                "Submit"
              )}
            </Button>
          </div>
        </Card>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="size-4" />
          Your information is used only for internship documentation.
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── helpers ───────────────────────── */

function compileValidators(defs: RecipientFieldDef[]) {
  const map: Record<string, ((v: any) => string | null)[]> = {};
  for (const d of defs) {
    const schemas = (d.validators ?? []) as z.ZodTypeAny[];
    map[d.key] = schemas.map((schema) => (value: any) => {
      const res = schema.safeParse(value);
      if (res.success) return null;
      const issues = (res.error as any)?.issues as
        | { message: string }[]
        | undefined;
      return issues?.map((i) => i.message).join("\n") ?? res.error.message;
    });
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

function groupBySectionUsingNames(
  defs: RecipientFieldDef[],
  values: Record<string, any>,
) {
  const out: Record<string, Record<string, any>> = {};
  for (const d of defs) {
    const sec = d.section ?? "details";
    const val = values[d.key];
    if (val === undefined) continue;
    (out[sec] ||= {})[d.key] = val;
  }
  return out;
}

/** Fake field factory – replace with your API output later */
function buildFakeFields(
  audience: "guardian" | "company",
): RecipientFieldDef[] {
  if (audience === "guardian") {
    return [
      {
        id: "g1",
        key: "guardian_full_name",
        label: "Guardian Full Name",
        type: "text",
        section: "guardian",
        validators: [z.string().min(1, "Required")],
      },
      {
        id: "g2",
        key: "guardian_email",
        label: "Guardian Email",
        type: "text",
        section: "guardian",
        validators: [z.string().email("Enter a valid email")],
      },
      {
        id: "g3",
        key: "guardian_contact",
        label: "Guardian Contact Number",
        type: "text",
        section: "guardian",
        validators: [z.string().min(7, "Enter a valid contact number")],
      },
    ];
  }

  return [
    {
      id: "e1",
      key: "entity_legal_name",
      label: "Company Legal Name",
      type: "text",
      section: "entity",
      validators: [z.string().min(1, "Required")],
    },
    {
      id: "e2",
      key: "entity_address",
      label: "Company Address",
      type: "text",
      section: "entity",
      validators: [z.string().min(1, "Required")],
    },
    {
      id: "e3",
      key: "entity_representative",
      label: "Company Representative",
      type: "text",
      section: "entity",
      validators: [z.string().min(1, "Required")],
    },
    {
      id: "e4",
      key: "entity_rep_position",
      label: "Representative Position",
      type: "text",
      section: "entity",
      validators: [z.string().min(1, "Required")],
    },
    {
      id: "e5",
      key: "entity_type",
      label: "Company Type",
      type: "select",
      section: "entity",
      options: [
        { id: "partnership", name: "Partnership" },
        { id: "corporation", name: "Corporation" },
        { id: "government-agency", name: "Government Agency" },
      ],
      validators: [z.string().min(1, "Required")],
    },
  ];
}
