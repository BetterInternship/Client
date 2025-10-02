"use client";

import { useMemo, useState } from "react";
import { OutsideTabPanel, OutsideTabs } from "@/components/ui/outside-tabs";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { Newspaper, AlertTriangle } from "lucide-react";
import { EmployerAuthService } from "@/lib/api/hire.api";
import { FormInput, FormDropdown, FormDatePicker } from "@/components/EditForm";

type TabKey = "Forms Autofill" | "My Forms" | "Past Forms";

type Values = Record<string, string>;

type SyncValidator = (value: string, allValues: Values) => string | null; // return error string or null

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "time";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  maxLength?: number;
  pattern?: string; // optional regex
  helper?: string;
  validators?: SyncValidator[]; // custom validators per field
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
};

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

  // Custom validators
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

export default function FormsPage() {
  const [tab, setTab] = useState<TabKey>("Forms Autofill");

  const [autofill, setAutofill] = useState<Values>({});
  const [autofillErrors, setAutofillErrors] = useState<Record<string, string>>(
    {}
  );
  const autofillComplete = useMemo(
    () => isComplete(AUTOFILL_SCHEMA, autofill),
    [autofill]
  );

  // Past forms
  const [pastForms, setPastForms] = useState<PastForm[]>([
    {
      id: "pf-1",
      name: "Student MOA",
      company: "Ardent World Inc.",
      createdAt: "2025-09-24",
    },
    {
      id: "pf-2",
      name: "Endorsement Letter",
      company: "URC",
      createdAt: "2025-09-18",
    },
  ]);

  const availableForms = FORM_TEMPLATES;

  // Generate modal state
  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [custom, setCustom] = useState<Values>({});
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});

  const selectedForm = useMemo(
    () => availableForms.find((f) => f.id === selectedFormId) || null,
    [selectedFormId, availableForms]
  );

  function openGenerate(formId: string) {
    setSelectedFormId(formId);
    setSelectedCompanyId("");

    const defs =
      FORM_TEMPLATES.find((t) => t.id === formId)?.customFields ?? [];
    const next: Values = {};
    defs.forEach((d) => (next[d.key] = ""));
    setCustom(next);
    setCustomErrors({});

    openGlobalModal(
      "generate-form",
      <GenerateFormModal
        title={FORM_TEMPLATES.find((t) => t.id === formId)?.name ?? "Form"}
        description={FORM_TEMPLATES.find((t) => t.id === formId)?.description}
        companies={COMPANIES}
        selectedCompanyId={selectedCompanyId}
        setSelectedCompanyId={setSelectedCompanyId}
        customDefs={defs}
        custom={
          next /* initial snapshot; the component reads current state from closures */
        }
        setCustomField={setCustomField}
        customErrors={customErrors}
        canGenerate={!!selectedCompanyId && isComplete(defs, custom)}
        onCancel={() => closeGlobalModal("generate-form")}
        onGenerate={() => {
          // run the same confirm flow, then close
          const errs = validateMany(defs, custom);
          setCustomErrors(errs);
          if (Object.keys(errs).length > 0 || !selectedCompanyId) return;

          const payload = {
            templateId: formId,
            companyId: selectedCompanyId,
            autofill,
            custom,
          };
          console.log("Generate payload:", payload);

          const companyName =
            COMPANIES.find((c) => c.id === selectedCompanyId)?.name ??
            "Company";
          const formName =
            FORM_TEMPLATES.find((f) => f.id === formId)?.name ?? "Form";
          setPastForms((prev) => [
            {
              id: `pf-${Math.random().toString(36).slice(2, 8)}`,
              name: formName,
              company: companyName,
              createdAt: new Date().toISOString().slice(0, 10),
            },
            ...prev,
          ]);

          closeGlobalModal("generate-form");
        }}
      />,
      {
        allowBackdropClick: false,
        closeOnEsc: true,
        panelClassName: "w-[min(92vw,680px)]",
      }
    );
  }

  const customDefs: FieldDef[] = selectedForm?.customFields ?? [];
  const customValid = useMemo(
    () => isComplete(customDefs, custom),
    [customDefs, custom]
  );
  const canGenerate = !!selectedCompanyId && customValid;

  function confirmGenerate() {
    const errs = validateMany(customDefs, custom);
    setCustomErrors(errs);
    if (Object.keys(errs).length > 0 || !selectedCompanyId) return;

    // Payload ready for backend
    const payload = {
      templateId: selectedFormId!,
      companyId: selectedCompanyId,
      autofill, // snapshot of user autofill fields
      custom, // per-template extra fields
    };
    console.log("Generate payload:", payload);

    const companyName =
      COMPANIES.find((c) => c.id === selectedCompanyId)?.name ?? "Company";
    const formName =
      FORM_TEMPLATES.find((f) => f.id === selectedFormId)?.name ?? "Form";
    setPastForms((prev) => [
      {
        id: `pf-${Math.random().toString(36).slice(2, 8)}`,
        name: formName,
        company: companyName,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  }

  function saveAutofill() {
    const errs = validateMany(AUTOFILL_SCHEMA, autofill);
    setAutofillErrors(errs);
    if (Object.keys(errs).length > 0) return;
    console.log("Saved Forms Autofill:", autofill);
  }

  function setAutofillField(key: string, val: string) {
    setAutofill((prev) => {
      const next = { ...prev, [key]: val };
      const def = AUTOFILL_SCHEMA.find((d) => d.key === key);
      if (def) {
        const e = validateField(def, val ?? "", next);
        setAutofillErrors((prevErr) => ({ ...prevErr, [key]: e }));
      }
      return next;
    });
  }

  function setCustomField(key: string, val: string) {
    setCustom((prev) => {
      const next = { ...prev, [key]: val };
      const def = (selectedForm?.customFields ?? []).find((d) => d.key === key);
      if (def) {
        const e = validateField(def, val ?? "", next);
        setCustomErrors((prevErr) => ({ ...prevErr, [key]: e }));
      }
      return next;
    });
  }

  const gateMyAndPast = !autofillComplete;

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

        {/* Warning: show if not complete */}
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
            onAction={() => setTab("Forms Autofill")}
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
              {AUTOFILL_SCHEMA.map((def) => (
                <FieldRenderer
                  key={def.key}
                  def={def}
                  value={autofill[def.key] ?? ""}
                  onChange={(v) => setAutofillField(def.key, v)}
                  error={autofillErrors[def.key]}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {autofillComplete ? (
                  <span className="text-emerald-600">
                    Ready — Autofill complete.
                  </span>
                ) : (
                  <>Complete all required fields to unlock generation.</>
                )}
              </div>
              <Button size="sm" onClick={saveAutofill}>
                Save
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
                        <Badge variant="outline" className="text-xs">
                          PDF
                        </Badge>{" "}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => console.log("Download", p)}
                        >
                          Download
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

function GenerateFormModal({
  title,
  description,
  companies,
  selectedCompanyId,
  setSelectedCompanyId,
  customDefs,
  custom,
  setCustomField,
  customErrors,
  canGenerate,
  onCancel,
  onGenerate,
}: {
  title: string;
  description?: string;
  companies: { id: string; name: string }[];
  selectedCompanyId: string;
  setSelectedCompanyId: (v: string) => void;
  customDefs: FieldDef[];
  custom: Values;
  setCustomField: (key: string, val: string) => void;
  customErrors: Record<string, string>;
  canGenerate: boolean;
  onCancel: () => void;
  onGenerate: () => void;
}) {
  return (
    <div className="w-[100svw] h-[100svh] sm:w-auto sm:h-auto overflow-auto">
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
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Company</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
          >
            <option value="" disabled>
              Select a company…
            </option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Custom fields */}
        {customDefs.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {customDefs.map((def) => (
              <FieldRenderer
                key={def.key}
                def={def}
                value={custom[def.key] ?? ""}
                onChange={(v) => setCustomField(def.key, v)}
                error={customErrors[def.key]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={!canGenerate ? "opacity-60" : ""}
        >
          Generate
        </Button>
      </div>
    </div>
  );
}

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

  // SELECT -> use FormDropdown (expects {id,name})
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

  // DATE -> use FormDatePicker (works with ms, so adapt)
  if (def.type === "date") {
    const ms = dateStrToMs(value);

    return (
      <div className="space-y-1.5">
        <FormDatePicker
          label={def.label}
          date={ms}
          setter={(nextMs) => onChange(msToDateStr(nextMs))}
          className="w-full"
          placeholder="Select date"
          autoClose
          // optional: format button text nicely
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

  // TIME / TEXT / NUMBER -> use FormInput (lets native time picker render on mobile)
  const inputType =
    def.type === "number" ? "text" : def.type === "time" ? "time" : "text";
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

// Warning card
function WarningCard({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
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

// Helpers
// utils to convert between "YYYY-MM-DD" <-> ms (local)
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

const AUTOFILL_SCHEMA: FieldDef[] = [
  {
    key: "student_id",
    label: "Student ID",
    type: "text",
    required: true,
    maxLength: 64,
  },
  { key: "guardian_name", label: "Guardian Name", type: "text" },
  {
    key: "address",
    label: "Address",
    type: "text",
    required: true,
  },
  {
    key: "college",
    label: "College",
    type: "text",
    required: true,
  },
];

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
        key: "hte_location",
        label: "HTE Location",
        type: "text",
        required: true,
        placeholder: "Host Training Establishment location",
      },
      {
        key: "office_location",
        label: "Office Location",
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
        helper: "Use HH:MM (24-hour)",
      },
      {
        key: "internship_clock_out_time",
        label: "Internship Clock Out Time",
        type: "time",
        required: true,
        helper: "Use HH:MM (24-hour)",
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

const COMPANIES = [
  { id: "ent-ardent", name: "Ardent World Inc." },
  { id: "ent-urc", name: "URC" },
  { id: "ent-factset", name: "FactSet" },
  { id: "ent-accenture", name: "Accenture" },
];
