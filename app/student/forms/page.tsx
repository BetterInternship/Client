"use client";

import { useMemo, useState } from "react";
import { OutsideTabPanel, OutsideTabs } from "@/components/ui/outside-tabs";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/landingHire/ui/alert-dialog";
import { Newspaper, AlertTriangle } from "lucide-react";

type TabKey = "Forms Autofill" | "My Forms" | "Past Forms";

type Values = Record<string, string>;

type SyncValidator = (value: string, allValues: Values) => string | null; // return error string or null

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select";
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
  if (def.pattern) {
    try {
      const re = new RegExp(def.pattern);
      if (value && !re.test(value)) return "Invalid format.";
    } catch {
      /* ignore bad patterns */
    }
  }

  // custom
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
  const [modalOpen, setModalOpen] = useState(false);
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
    setModalOpen(true);
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

    setModalOpen(false);
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
    <div className="container max-w-5xl sm:p-10 pt-8 sm:pt-16 mx-auto">
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
              <ul className="space-y-3">
                {availableForms.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div>
                      <div className="font-medium">{f.name}</div>
                      {f.description && (
                        <div className="text-sm text-gray-500">
                          {f.description}
                        </div>
                      )}
                    </div>
                    <Button size="sm" onClick={() => openGenerate(f.id)}>
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
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
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
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          PDF
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
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

      {/* Generate: per-template custom fields + company */}
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-gray-400" />
              Generate {selectedForm ? selectedForm.name : "Form"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Choose a company and fill any additional details for this
              template.
            </AlertDialogDescription>
          </AlertDialogHeader>

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
                {COMPANIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom fields */}
            {customDefs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!canGenerate}
              onClick={confirmGenerate}
              className={cn(!canGenerate && "opacity-60")}
            >
              Generate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  const base =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200";
  const label = (
    <label className="text-sm font-medium">
      {def.label}
      {def.required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );

  return (
    <div className="space-y-1.5">
      {label}
      {def.type === "select" ? (
        <select
          className={base}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{def.placeholder ?? "Select an option…"}</option>
          {(def.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={def.type === "number" ? "text" : def.type}
          inputMode={def.type === "number" ? "numeric" : undefined}
          className={base}
          placeholder={def.placeholder}
          maxLength={def.maxLength}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
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
  {
    key: "birthdate",
    label: "Birthdate",
    type: "date",
    required: true,
    helper: "YYYY-MM-DD",
  },
  { key: "guardian_name", label: "Guardian Name", type: "text" },
  {
    key: "guardian_phone",
    label: "Guardian Phone",
    type: "text",
    pattern: "^\\+?63\\s?9\\d{2}\\s?\\d{3}\\s?\\d{4}$",
    placeholder: "+63 9xx xxx xxxx",
    helper: "Format: +63 9xx xxx xxxx",
  },
  {
    key: "address_line1",
    label: "Address Line 1",
    type: "text",
    required: true,
  },
  { key: "address_line2", label: "Address Line 2", type: "text" },
  { key: "city", label: "City/Municipality", type: "text", required: true },
  { key: "province", label: "Province", type: "text", required: true },
  {
    key: "postal_code",
    label: "Postal Code",
    type: "text",
    required: true,
    pattern: "^\\d{4}$",
  },
];

const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "student-moa",
    name: "Student MOA",
    description: "Standard student-company MOA",
    customFields: [
      {
        key: "program",
        label: "Program",
        type: "select",
        required: true,
        options: [
          { value: "bs-ece", label: "BS ECE" },
          { value: "bs-cs", label: "BS CS" },
          { value: "bs-it", label: "BS IT" },
        ],
      },
      {
        key: "hours",
        label: "Required Hours",
        type: "number",
        required: true,
        placeholder: "e.g. 320",
      },
    ],
  },
  {
    id: "endorsement",
    name: "Endorsement Letter",
    customFields: [
      {
        key: "contact_person",
        label: "Contact Person",
        type: "text",
        required: true,
      },
      {
        key: "department",
        label: "Department",
        type: "select",
        options: [
          { value: "hr", label: "Human Resources" },
          { value: "it", label: "IT" },
          { value: "ops", label: "Operations" },
        ],
        required: true,
      },
    ],
  },
  {
    id: "timesheet",
    name: "Daily Timesheet",
    customFields: [
      { key: "week_start", label: "Week Start", type: "date", required: true },
    ],
  },
];

const COMPANIES = [
  { id: "ent-ardent", name: "Ardent World Inc." },
  { id: "ent-urc", name: "URC" },
  { id: "ent-factset", name: "FactSet" },
  { id: "ent-accenture", name: "Accenture" },
];
