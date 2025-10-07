"use client";

import { useEffect, useMemo, useState } from "react";
import { OutsideTabPanel, OutsideTabs } from "@/components/ui/outside-tabs";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { Newspaper, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import {
  FormInput,
  FormDropdown,
  FormDatePicker,
  TimeInputNative,
} from "@/components/EditForm";
import { useProfileData } from "@/lib/api/student.data.api";
import { useDbRefs } from "@/lib/db/use-refs";
import { UserService } from "@/lib/api/services";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

type TabKey = "Forms Autofill" | "My Forms" | "Past Forms";
type Values = Record<string, string>;
type SyncValidator = (value: string, allValues: Values) => string | null;

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "time";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  maxLength?: number;
  pattern?: string;
  helper?: string;
  validators?: SyncValidator[];
};

type FormTemplate = {
  id: string;
  name: string;
  description?: string;
  customFields?: FieldDef[];
};

type PastForm = {
  id: string;
  name: string;
  company: string;
  createdAt: string;
  fileUrl?: string; // downloadable URL when ready
};

/* ──────────────────────────────────────────────
   Validation helpers
   ────────────────────────────────────────────── */

function validateField(def: FieldDef, value: string, all: Values): string {
  if (def.required && (!value || value.trim() === ""))
    return "This field is required.";
  if (def.maxLength && value && value.length > def.maxLength)
    return `Max ${def.maxLength} characters.`;
  if (def.type === "number" && value && !/^-?\d+(\.\d+)?$/.test(value))
    return "Enter a valid number.";
  if (def.type === "date" && value && !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return "Use YYYY-MM-DD.";
  if (def.type === "time" && value && !/^\d{2}:\d{2}$/.test(value))
    return "Use HH:MM (24-hour).";
  if (def.pattern) {
    try {
      const re = new RegExp(def.pattern);
      if (value && !re.test(value)) return "Invalid format.";
    } catch {}
  }
  for (const fn of def.validators ?? []) {
    const err = fn(value ?? "", all);
    if (err) return err;
  }
  return "";
}

function validateMany(
  schema: FieldDef[],
  values: Values
): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const def of schema) {
    const v = values[def.key] ?? "";
    const e = validateField(def, v, values);
    if (e) errs[def.key] = e;
  }
  return errs;
}

function isComplete(schema: FieldDef[], values: Values): boolean {
  for (const def of schema) {
    if (def.required) {
      const e = validateField(def, values[def.key] ?? "", values);
      if (e) return false;
    }
  }
  return true;
}

/* ──────────────────────────────────────────────
   Page
   ────────────────────────────────────────────── */
export default function FormsPage() {
  const profile = useProfileData();
  const { colleges } = useDbRefs();
  const [entities, setEntities] = useState<{ id: string, display_name: string }[]>([]);

  useEffect(() => {
    UserService.getEntityList().then(response => {
      // @ts-ignore
      setEntities(response.entities)
    })
  }, [])
  
  const [tab, setTab] = useState<TabKey>("Forms Autofill");
  const [autofill, setAutofill] = useState<Values>({});
  const [autofillErrors, setAutofillErrors] = useState<Record<string, string>>(
    {}
  );
  const [lastSavedAutofill, setLastSavedAutofill] = useState<Values>({});
  const [isSavingAutofill, setIsSavingAutofill] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const isAutofillDirty = useMemo(
    () => JSON.stringify(autofill) !== JSON.stringify(lastSavedAutofill),
    [autofill, lastSavedAutofill]
  );

  // tiny mock “API” delay to make it believable
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const collegeOptions = useMemo(
    () => (colleges ?? []).map((c) => ({ value: String(c.id), label: c.name })),
    [colleges]
  );

  const requiredAutofillKeys = [
    "student_id",
    "guardian_name",
    "address",
    "college",
  ] as const;

  const autofillComplete = useMemo(
    () => requiredAutofillKeys.every((k) => (autofill[k] ?? "").trim() !== ""),
    [autofill]
  );

  // Past forms
  const [pastForms, setPastForms] = useState<PastForm[]>([]);

  const availableForms = FORM_TEMPLATES;

  // Modal state
  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  // Demo: global banner while generating (adds realism)
  const [isGeneratingGlobal, setIsGeneratingGlobal] = useState(false);

  function openGenerate(formId: string) {
    setSelectedFormId(formId);

    const defs =
      FORM_TEMPLATES.find((t) => t.id === formId)?.customFields ?? [];
    const initialCustom: Values = {};
    defs.forEach((d) => (initialCustom[d.key] = ""));

    openGlobalModal(
      "generate-form",
      <GenerateFormModal
        title={FORM_TEMPLATES.find((t) => t.id === formId)?.name ?? "Form"}
        description={FORM_TEMPLATES.find((t) => t.id === formId)?.description}
        entities={entities}
        customDefs={defs}
        initialEntityId=""
        initialCustom={initialCustom}
        onCancel={() => closeGlobalModal("generate-form")}
        onGenerate={async (companyId, customValues) => {
          // validate before submit
          const errs = validateMany(defs, customValues);
          if (Object.keys(errs).length > 0 || !companyId) return;
          if (!profile.data?.id) return alert("Not logged in.");

          try {
            setIsGeneratingGlobal(true);
            const response = await UserService.generateStudentMoa({
              employer_id: companyId,
              user_id: profile.data?.id,
              student_signatory_name: `${profile.data?.first_name} ${profile.data?.last_name}`
            });
            const fileUrl = `https://storage.googleapis.com/better-internship-public-bucket/${response.verificationCode}.pdf`;
            const entityName =
              entities?.find((c) => c.id === companyId)?.display_name ?? "Company";
            const formName =
              FORM_TEMPLATES.find((f) => f.id === formId)?.name ?? "Form";

            setPastForms((prev) => [
              {
                id: `pf-${Math.random().toString(36).slice(2, 8)}`,
                name: formName,
                company: entityName,
                createdAt: new Date().toISOString().slice(0, 10),
                fileUrl,
              },
              ...prev,
            ]);

            window.open(fileUrl, "_blank")
            closeGlobalModal("generate-form");
          } finally {
            setIsGeneratingGlobal(false);
          }
        }}
      />,
      {
        allowBackdropClick: false,
        closeOnEsc: true,
        panelClassName: "max-w-none w-[98vw] sm:w-[50svw]",
      }
    );
  }

  async function saveAutofill() {
    // client-side validation first
    const nextErrors: Record<string, string> = {};
    requiredAutofillKeys.forEach((k) => {
      if (!autofill[k] || !autofill[k].trim())
        nextErrors[k] = "This field is required.";
    });
    setAutofillErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // nothing to save
    if (!isAutofillDirty) return;

    try {
      setIsSavingAutofill(true);
      // simulate network + write time
      await wait(900 + Math.random() * 600);

      // success
      setLastSavedAutofill(autofill);
      setLastSavedAt(Date.now());
      // console.log("Saved Forms Autofill:", autofill);
    } finally {
      setIsSavingAutofill(false);
    }
  }

  function setAutofillField(key: string, val: string) {
    setAutofill((prev) => ({ ...prev, [key]: val }));
    if (requiredAutofillKeys.includes(key as any)) {
      setAutofillErrors((e) => ({
        ...e,
        [key]: val?.trim() ? "" : "This field is required.",
      }));
    }
  }

  const gateMyAndPast = !autofillComplete;

  /* Download */
  function handleDownload(p: PastForm) {
    if (p.fileUrl) {
      window.open(p.fileUrl, "_blank", "noopener,noreferrer");
    } else {
      // toast.info("This file is not available yet.");
      console.log("No file yet for", p);
    }
  }

  return (
    <div className="container max-w-6xl px-4 sm:px-10 pt-6 sm:pt-16 mx-auto">
      <div className="mb-6 sm:mb-8 animate-fade-in space-y-5">
        {/* Header */}
        <div>
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={Newspaper} />
            <HeaderText>Forms</HeaderText>
          </div>
          <div className="flex-1 flex-row">
            <p className="text-gray-600 text-sm sm:text-base mb-2">
              Automatically generate the internship forms you need using your
              saved details.
            </p>
          </div>
        </div>

        {/* Global generating banner */}
        {isGeneratingGlobal && (
          <Card className="p-3 border-emerald-200 bg-emerald-50 flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-emerald-600" />
            <span className="text-sm text-emerald-800">
              Building your PDF… This may take a moment.
            </span>
          </Card>
        )}

        {/* Warning */}
        {gateMyAndPast && (
          <WarningCard
            title="Action needed"
            message={
              <>
                Please complete your{" "}
                <span className="font-medium">Autofill profile</span> below to
                generate forms. Your details will be used to prefill documents.
              </>
            }
          />
        )}

        {/* Tabs */}
        <OutsideTabs
          value={tab}
          onChange={(v) => setTab(v as TabKey)}
          tabs={[
            { key: "Forms Autofill", label: "Forms Autofill" },
            { key: "My Forms", label: "My Forms" },
            { key: "Past Forms", label: "Past Forms" },
          ]}
        >
          {/* Forms Autofill */}
          <OutsideTabPanel when="Forms Autofill" activeKey={tab}>
            <div className="text-lg font-semibold mb-3">Autofill Profile</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student ID */}
              <div className="space-y-1.5">
                <FormInput
                  label="Student ID"
                  required
                  value={autofill.student_id ?? ""}
                  setter={(v) => setAutofillField("student_id", v)}
                  className="w-full"
                  maxLength={64}
                />
                {!!autofillErrors.student_id && (
                  <p className="text-xs text-red-600">
                    {autofillErrors.student_id}
                  </p>
                )}
              </div>

              {/* Guardian Name */}
              <div className="space-y-1.5">
                <FormInput
                  label="Guardian Name"
                  required
                  value={autofill.guardian_name ?? ""}
                  setter={(v) => setAutofillField("guardian_name", v)}
                  className="w-full"
                />
                {!!autofillErrors.guardian_name && (
                  <p className="text-xs text-red-600">
                    {autofillErrors.guardian_name}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <FormInput
                  label="Address"
                  required
                  value={autofill.address ?? ""}
                  setter={(v) => setAutofillField("address", v)}
                  className="w-full"
                />
                {!!autofillErrors.address && (
                  <p className="text-xs text-red-600">
                    {autofillErrors.address}
                  </p>
                )}
              </div>

              {/* College */}
              <div className="space-y-1.5">
                <FormDropdown
                  label="College"
                  required
                  value={autofill.college ?? ""}
                  options={collegeOptions.map((o) => ({
                    id: o.value,
                    name: o.label,
                  }))}
                  setter={(v) => setAutofillField("college", String(v ?? ""))}
                  className="w-full"
                />
                {!!autofillErrors.college && (
                  <p className="text-xs text-red-600">
                    {autofillErrors.college}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-gray-500 flex items-center gap-2">
                {autofillComplete ? (
                  isAutofillDirty ? (
                    <span>Unsaved changes</span>
                  ) : lastSavedAt ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Saved{" "}
                      {new Date(lastSavedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  ) : (
                    <span className="text-emerald-600">
                      Ready — Autofill complete.
                    </span>
                  )
                ) : (
                  <>Complete all required fields to unlock generation.</>
                )}
              </div>

              <Button
                size="sm"
                onClick={saveAutofill}
                disabled={
                  !autofillComplete || !isAutofillDirty || isSavingAutofill
                }
                className={
                  !autofillComplete || !isAutofillDirty ? "opacity-60" : ""
                }
              >
                {isSavingAutofill ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </span>
                ) : isAutofillDirty ? (
                  "Save changes"
                ) : (
                  "Saved"
                )}
              </Button>
            </div>
          </OutsideTabPanel>

          {/* My Forms */}
          <OutsideTabPanel when="My Forms" activeKey={tab}>
            <div
              className={cn(
                gateMyAndPast && "opacity-60 pointer-events-none select-none"
              )}
            >
              <ul className="grid grid-cols-1 gap-3">
                {availableForms.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{f.name}</div>
                      {f.description && (
                        <div className="text-sm text-gray-500 mt-0.5">
                          {f.description}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => openGenerate(f.id)}
                    >
                      Generate
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </OutsideTabPanel>

          {/* Past Forms */}
          <OutsideTabPanel when="Past Forms" activeKey={tab}>
            <div
              className={cn(
                gateMyAndPast && "opacity-60 pointer-events-none select-none"
              )}
            >
              {pastForms.length === 0 ? (
                <p className="text-sm text-gray-600">No past forms yet.</p>
              ) : (
                <ul className="space-y-3">
                  {pastForms.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-lg border p-4 flex flex-col sm:flex-row justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {p.name} ·{" "}
                          <span className="text-gray-600">{p.company}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Generated on {p.createdAt}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-between sm:justify-end">
                        <Badge className="text-xs">
                          PDF
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => handleDownload(p)}
                          disabled={!p.fileUrl}
                        >
                          {p.fileUrl ? "Download" : "Processing…"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </OutsideTabPanel>
        </OutsideTabs>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Generate Modal
   ────────────────────────────────────────────── */

function GenerateFormModal({
  title,
  description,
  entities,
  customDefs,
  initialEntityId,
  initialCustom,
  onCancel,
  onGenerate,
}: {
  title: string;
  description?: string;
  entities: { id: string; display_name: string }[];
  customDefs: FieldDef[];
  initialEntityId: string;
  initialCustom: Values;
  onCancel: () => void;
  onGenerate: (companyId: string, customValues: Values) => Promise<void> | void;
}) {
  const [entityId, setEntityId] = useState<string>(initialEntityId);
  const [custom, setCustom] = useState<Values>(initialCustom);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasErrors = Object.values(errors).some(Boolean);
  const canGenerate =
    !!entityId &&
    isComplete(customDefs, custom) &&
    !hasErrors &&
    !isSubmitting;

  const setCustomField = (k: string, v: string) => {
    setCustom((prev) => {
      const next = { ...prev, [k]: v } as any;
      const def = customDefs.find((d) => d.key === k);
      if (def) {
        const e = validateField(def, v ?? "", next);
        setErrors((prevErr) => {
          const ne = { ...prevErr };
          if (e) ne[k] = e;
          else delete ne[k];
          return ne;
        });
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    try {
      setIsSubmitting(true);
      await onGenerate(entityId, custom);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-auto">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="size-4 text-gray-400" />
          <h3 className="text-lg font-semibold">Generate {title}</h3>
        </div>
        <p className="text-sm text-gray-600">
          {description ??
            "Choose a company and fill any additional details for this template."}
        </p>
      </div>

      <div className="space-y-3">
        {/* Company */}
        <FormDropdown
          label="Company"
          value={entityId}
          options={entities.map((c) => ({ id: c.id, name: c.display_name }))}
          setter={(v) => setEntityId(String(v ?? ""))}
        />

        {/* Custom fields */}
        {customDefs.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {customDefs.map((def) => (
              <FieldRenderer
                key={def.key}
                def={def}
                value={custom[def.key] ?? ""}
                onChange={(v) => setCustomField(def.key, v)}
                error={errors[def.key]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} disabled={!canGenerate}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Generating...
            </span>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Field renderer
   ────────────────────────────────────────────── */

function FieldRenderer({
  def,
  value,
  onChange,
  error,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const required = def.required ?? false;

  if (def.type === "select") {
    const options =
      (def.options ?? []).map((o) => ({ id: o.value, name: o.label })) ?? [];
    return (
      <div className="space-y-1.5">
        <FormDropdown
          label={def.label}
          required={required}
          value={value}
          options={options}
          setter={(v) => onChange(String(v ?? ""))}
          className="w-full"
        />
        {def.helper && <p className="text-xs text-gray-500">{def.helper}</p>}
        {!!error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (def.type === "date") {
    const ms = dateStrToMs(value);

    // Disable dates before today+7
    let disabledDays: any | undefined;
    if (def.key === "internship_start_date") {
      const t = new Date();
      const min = new Date(
        t.getFullYear(),
        t.getMonth(),
        t.getDate(),
        0,
        0,
        0,
        0
      );
      min.setDate(min.getDate() + 7);
      disabledDays = { before: min };
    }

    return (
      <div className="space-y-1.5">
        <FormDatePicker
          label={def.label}
          date={ms}
          setter={(nextMs) => onChange(msToDateStr(nextMs))}
          className="w-full"
          contentClassName="z-[1100]"
          placeholder="Select date"
          autoClose
          disabledDays={disabledDays}
          format={(d) =>
            d.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          }
        />
        {def.helper && <p className="text-xs text-gray-500">{def.helper}</p>}
        {!!error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (def.type === "time") {
    return (
      <div className="space-y-1.5">
        <TimeInputNative
          label={def.label}
          value={value} // "HH:MM"
          onChange={(v) => onChange(v?.toString() ?? "")}
          helper={def.helper}
        />
        {!!error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  // Text/number as plain input
  const inputType =
    def.type === "number" ? "text" : def.type === "text" ? "text" : "text";
  const inputMode = def.type === "number" ? "numeric" : undefined;

  return (
    <div className="space-y-1.5">
      <FormInput
        label={def.label}
        required={required}
        value={value ?? ""}
        setter={(v) => onChange(v)}
        type={inputType as any}
        inputMode={inputMode as any}
        placeholder={def.placeholder}
        maxLength={def.maxLength}
        className="w-full"
      />
      {def.helper && <p className="text-xs text-gray-500">{def.helper}</p>}
      {!!error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ──────────────────────────────────────────────
   UI bits
   ────────────────────────────────────────────── */

function WarningCard({
  title,
  message,
}: {
  title: string;
  message: React.ReactNode;
}) {
  const tone = {
    card: "bg-red-50 border-red-200",
    heading: "text-red-900",
    subtext: "text-red-700",
    pill: "bg-transparent border-red-700 text-red-700",
  };

  return (
    <Card
      className={cn(
        "p-4 space-y-3 border transition-colors duration-300 ease-out",
        tone.card
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className={cn("text-base font-semibold", tone.heading)}>
            {title}
          </h3>
          <Badge className={cn("text-xs", tone.pill)}>Required</Badge>
        </div>
      </div>

      <div
        className={cn(
          "text-xs sm:text-sm leading-relaxed text-justify",
          tone.subtext
        )}
      >
        {message}
      </div>
      <p className={cn("text-sm font-semibold", tone.heading)}>
        Form generation is currently disabled.
      </p>
    </Card>
  );
}

/* ──────────────────────────────────────────────
   Date helpers
   ────────────────────────────────────────────── */

const dateStrToMs = (s?: string) => {
  if (!s) return undefined;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;
  const [_, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d), 0, 0, 0, 0).getTime();
};

const msToDateStr = (ms?: number) => {
  if (ms == null) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/* ──────────────────────────────────────────────
   Mock Data
   ────────────────────────────────────────────── */

const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "student-moa",
    name: "Student MOA",
    description: "Standard student-company MOA",
    customFields: [
      {
        key: "dlsu_coordinator_name",
        label: "DLSU Coordinator Name",
        type: "text",
        required: true,
      },
      {
        key: "internship_total_hours",
        label: "Internship Total Duration Hours",
        type: "number",
        required: true,
        placeholder: "e.g., 320",
      },
      {
        key: "internship_start_date",
        label: "Internship Start Date",
        type: "date",
        required: true,
        helper: "Must be at least 7 days from today.",
        validators: [
          (start) => {
            if (!start) return null;
            // parse "YYYY-MM-DD" to local midnight
            const [y, m, d] = start.split("-").map(Number);
            const startDate = new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);

            // today at local midnight + 7 days
            const today = new Date();
            const min = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              0,
              0,
              0,
              0
            );
            min.setDate(min.getDate() + 7);

            if (startDate < min) {
              return "Start date must be at least 7 days from today.";
            }
            return null;
          },
        ],
      },
      {
        key: "internship_end_date",
        label: "Internship End Date",
        type: "date",
        required: true,
        validators: [
          (end, all) => {
            const start = all["internship_start_date"];
            if (start && end && start > end)
              return "End Date must be after Start Date.";
            return null;
          },
        ],
      },
      {
        key: "internship_clock_in_time",
        label: "Internship Clock In Time",
        type: "time",
        required: true,
      },
      {
        key: "internship_clock_out_time",
        label: "Internship Clock Out Time",
        type: "time",
        required: true,
        validators: [
          (out, all) => {
            const inn = all["internship_clock_in_time"];
            if (inn && out && inn >= out)
              return "Clock Out must be after Clock In.";
            return null;
          },
        ],
      },
    ],
  },
];

