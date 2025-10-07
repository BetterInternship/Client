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
import { DropdownGroup } from "@/components/ui/dropdown";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

type TabKey = "Forms Autofill" | "Form Generator" | "My Forms";
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
  fileUrl: any;
  id: string;
  name: string;
  company: string;
  createdAt: string;
  status?: "pending" | "ready";
};

/* ──────────────────────────────────────────────
   Validation helpers
   ────────────────────────────────────────────── */

function validateField(
  def: FieldDef,
  value: string | number,
  all: Values
): string {
  const valueStringified = value.toString();
  if (def.required && (!valueStringified || valueStringified.trim() === ""))
    return "This field is required.";
  if (
    def.maxLength &&
    valueStringified &&
    valueStringified.length > def.maxLength
  )
    return `Max ${def.maxLength} characters.`;
  if (
    def.type === "number" &&
    valueStringified &&
    !/^-?\d+(\.\d+)?$/.test(valueStringified)
  )
    return "Enter a valid number.";
  if (
    def.type === "date" &&
    typeof value === "number" &&
    !/^\d{4}-\d{2}-\d{2}$/.test(msToDateStr(value))
  )
    return "Use YYYY-MM-DD.";
  if (
    def.type === "time" &&
    typeof value === "number" &&
    !/^\d{2}:\d{2}$/.test(msToDateStr(value))
  )
    return "Use HH:MM (24-hour).";
  if (def.pattern) {
    try {
      const re = new RegExp(def.pattern);
      if (valueStringified && !re.test(valueStringified))
        return "Invalid format.";
    } catch {}
  }
  for (const fn of def.validators ?? []) {
    const err = fn(valueStringified ?? "", all);
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
  const [entities, setEntities] = useState<
    { id: string; display_name: string }[]
  >([]);

  useEffect(() => {
    UserService.getEntityList().then((response) => {
      // @ts-ignore
      setEntities(response.entities);
    });
  }, []);

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
  const refs = useDbRefs();

  // Demo: global banner while generating (adds realism)
  const [isGeneratingGlobal, setIsGeneratingGlobal] = useState(false);

  function openGenerate(formId: string) {
    setSelectedFormId(formId);

    const defs =
      FORM_TEMPLATES.find((t) => t.id === formId)?.customFields ?? [];
    const initialCustom: Values = {};
    defs.forEach((d) => (initialCustom[d.key] = ""));
    initialCustom["internship_clock_in_time"] = "08:00";
    initialCustom["internship_clock_out_time"] = "17:00";

    openGlobalModal(
      "generate-form",
      <GenerateMoaFlowModal
        description={FORM_TEMPLATES.find((t) => t.id === formId)?.description}
        entities={entities}
        customDefs={defs}
        onInviteEmployer={async (_invite) => {
          // fake
          const formName =
            FORM_TEMPLATES.find((f) => f.id === formId)?.name ?? "Form";

          setPastForms((prev) => [
            {
              id: `pf-${Math.random().toString(36).slice(2, 8)}`,
              name: formName,
              company: _invite.legalName || "Company",
              createdAt: new Date().toISOString().slice(0, 10),
              status: "pending",
              fileUrl: "",
            },
            ...prev,
          ]);
        }}
        initialEntityId={""}
        onGeneratePdf={async (entity, customValues) => {
          const errs = validateMany(defs, customValues);
          if (Object.keys(errs).length > 0 || !entity) return;
          if (!profile.data?.id) return alert("Not logged in.");

          try {
            setIsGeneratingGlobal(true);
            const payload = {
              employer_id: entity.companyId,
              user_id: profile.data?.id,
              user_address: autofill.address,
              // ! remove hardcodes for degree and college
              user_degree: profile.data.degree ?? "BSCS Software Technology",
              user_college: autofill.college
                ? refs.to_college_name(autofill.college!) ??
                  "College of Computer Studies"
                : "College of Computer Studies",
              user_full_name: `${profile.data?.first_name} ${profile.data?.last_name}`,
              user_id_number: autofill.student_id,
              student_guardian_name: autofill.guardian_name,
              internship_hours: parseInt(customValues.internship_total_hours),
              internship_start_date: parseInt(
                customValues.internship_start_date
              ),
              internship_start_time: customValues.internship_clock_in_time,
              internship_end_date: parseInt(customValues.internship_end_date),
              internship_end_time: customValues.internship_clock_out_time,
              internship_coordinator_name: customValues.dlsu_coordinator_name,
            };

            const response = await UserService.generateStudentMoa(payload);
            const fileUrl = `https://storage.googleapis.com/better-internship-public-bucket/${response.verificationCode}.pdf`;
            const entityName =
              entities?.find((c) => c.id === entity.companyId)?.display_name ??
              "Company";
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

            window.open(fileUrl, "_blank", "noopener,noreferrer");
            closeGlobalModal("generate-form");
          } finally {
            setIsGeneratingGlobal(false);
          }
        }}
        initialCustom={{
          internship_clock_in_time: "08:00",
          internship_clock_out_time: "17:00",
        }}
        onCancel={() => closeGlobalModal("generate-form")}
      />,
      {
        allowBackdropClick: false,
        closeOnEsc: true,
        panelClassName: "w-[98vw] sm:min-w-[50svw]",
        title:
          "Generate " +
          (FORM_TEMPLATES.find((t) => t.id === formId)?.name ?? "Form"),
      }
    );
  }

  async function saveAutofill() {
    // client-side validation first
    const nextErrors: Record<string, string> = {};
    requiredAutofillKeys.forEach((k) => {
      if (!autofill[k] || !autofill[k].trim())
        nextErrors[k] = "This field is required.";

      if (k === "student_id" && autofill[k]?.trim()) {
        nextErrors[k] = validateDlsuId(autofill[k]) ?? "";
      }
    });
    setAutofillErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    // nothing to save
    if (!isAutofillDirty) return;

    if (!nextErrors.student_id) {
      const msg = validateDlsuId(autofill.student_id ?? "");
      if (msg) nextErrors.student_id = msg;
    }

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
    if (key === "student_id") {
      val = normalizeDlsuId(val);
    }

    setAutofill((prev) => ({ ...prev, [key]: val }));

    if (requiredAutofillKeys.includes(key as any)) {
      setAutofillErrors((e) => {
        const trimmed = val?.trim() ?? "";
        let msg = trimmed ? "" : "This field is required.";
        if (!msg && key === "student_id") {
          msg = validateDlsuId(trimmed) ?? "";
        }
        return { ...e, [key]: msg };
      });
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
            { key: "Form Generator", label: "Form Generator" },
            { key: "My Forms", label: "My Forms" },
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
                  maxLength={8}
                  placeholder="e.g., 12141380"
                />
                {!!autofillErrors.student_id && (
                  <p className="text-xs text-red-600">
                    {autofillErrors.student_id}
                  </p>
                )}
                {!autofillErrors.student_id && (
                  <p className="text-xs text-gray-500">
                    Format: 8 digits + optional letter (e.g., 12141380)
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

          {/* Form Generator */}
          <OutsideTabPanel when="Form Generator" activeKey={tab}>
            <div
              className={cn(
                gateMyAndPast && "opacity-60 pointer-events-none select-none"
              )}
            >
              <ul className="grid grid-cols-1 gap-3">
                {availableForms.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-[0.33em] border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{f.name}</div>
                      {f.description && (
                        <div className="text-sm text-gray-500 mt-0.5">
                          {f.description}
                        </div>
                      )}
                    </div>
                    <div className="sm:space-x-2">
                      <Button
                        size="sm"
                        className="w-full sm:w-auto"
                        variant="outline"
                        asChild
                      >
                        <a href="Student_MOA.pdf" download>
                          View Template
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => openGenerate(f.id)}
                      >
                        Generate
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </OutsideTabPanel>

          {/* Past Forms */}
          <OutsideTabPanel when="My Forms" activeKey={tab}>
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

                      {/* Right side */}
                      <div className="flex items-center gap-2 justify-between sm:justify-end">
                        <Badge
                          type={p.status === "pending" ? "warning" : "primary"}
                          className={cn(
                            "text-xs",
                            p.status === "pending"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : ""
                          )}
                        >
                          {p.status === "pending" ? "Pending" : "Ready"}
                        </Badge>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => handleDownload(p)}
                          disabled={p.status === "pending" || !p.fileUrl}
                        >
                          {p.status === "pending"
                            ? "Waiting…"
                            : p.fileUrl
                            ? "Download"
                            : "Processing…"}
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
function GenerateMoaFlowModal({
  description,
  entities,
  customDefs,
  initialEntityId,
  initialCustom,
  onCancel,
  onGeneratePdf,
  onInviteEmployer,
}: {
  description?: string;
  entities: { id: string; display_name: string }[];
  customDefs: FieldDef[];
  initialEntityId: string;
  initialCustom: Values;
  onCancel: () => void;
  onGeneratePdf: (
    manualCompanyValues: Values,
    formValues: Values
  ) => Promise<void>;
  onInviteEmployer: (invite: {
    legalName: string;
    contactPerson: string;
    contactNumber: string;
    contactEmail: string;
  }) => Promise<void>;
}) {
  type Step = "formFields" | "companySelect" | "generating" | "done";

  const [step, setStep] = useState<Step>("formFields");
  const [busy, setBusy] = useState(false);
  const [entityId, setEntityId] = useState<string>(initialEntityId);
  const [custom, setCustom] = useState<Values>(initialCustom);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doneKind, setDoneKind] = useState<"assist" | "generated">("generated"); // ← drives success copy

  // Keep original template order
  const orderedDefs = customDefs;

  const [formValues, setFormValues] = useState<Values>(initialCustom);

  const setFormField = (k: string, v: string) => {
    setFormValues((prev) => {
      const next = { ...prev, [k]: v };
      const def = orderedDefs.find((d) => d.key === k);
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

  const formValid =
    orderedDefs.length > 0 &&
    orderedDefs.every(
      (d) => !validateField(d, formValues[d.key] ?? "", formValues)
    ) &&
    Object.values(errors).length === 0;

  // Company select
  const [companyId, setCompanyId] = useState<string>("");

  // Inline toggles (only show sections when clicked)
  const [showAssist, setShowAssist] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Employer assist
  const [invite, setInvite] = useState({
    legalName: "",
    contactPerson: "",
    contactNumber: "",
    contactEmail: "",
  });
  const setInviteField = (k: keyof typeof invite, v: string) =>
    setInvite((p) => ({ ...p, [k]: v }));

  // Manual details
  const [manualCompany, setManualCompany] = useState({
    legalName: "",
    companyAddress: "",
    contactPerson: "",
    contactPosition: "",
    companyType: "",
  });
  const setManualField = (k: keyof typeof manualCompany, v: string) =>
    setManualCompany((p) => ({ ...p, [k]: v }));

  // validators
  const require = (val: string) =>
    !!val?.trim() ? "" : "This field is required.";

  const validateInvite = () => {
    const e: Record<string, string> = {};
    if (require(invite.legalName)) e.legalName = "This field is required.";
    if (require(invite.contactPerson))
      e.contactPerson = "This field is required.";
    if (require(invite.contactNumber))
      e.contactNumber = "This field is required.";
    if (!/\S+@\S+\.\S+/.test(invite.contactEmail))
      e.contactEmail = "Enter a valid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateManual = () => {
    const e: Record<string, string> = {};
    if (require(manualCompany.companyAddress))
      e.companyAddress = "This field is required.";
    if (require(manualCompany.contactPosition))
      e.contactPosition = "This field is required.";
    if (require(manualCompany.companyType))
      e.companyType = "This field is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // actions
  const goFromFormToCompany = () => {
    if (!formValid) {
      const e: Record<string, string> = {};
      for (const d of orderedDefs) {
        const msg = validateField(d, formValues[d.key] ?? "", formValues);
        if (msg) e[d.key] = msg;
      }
      setErrors(e);
      return;
    }
    setStep("companySelect");
  };

  const tryGenerateWithPickedCompany = async () => {
    if (!companyId) return;
    try {
      setBusy(true);
      setStep("generating");
      await onGeneratePdf({ companyId }, formValues);
      setDoneKind("generated");
      setStep("done");
    } finally {
      setBusy(false);
    }
  };

  const submitEmployerAssist = async () => {
    if (!validateInvite()) return;
    try {
      setBusy(true);
      await onInviteEmployer(invite); // parent fakes pending Past Form
      setDoneKind("assist");
      setStep("done");
    } finally {
      setBusy(false);
    }
  };

  const submitManualDetails = async () => {
    if (!validateManual()) return;
    try {
      setBusy(true);
      setStep("generating");

      // TODO: i am the one
      // await onGeneratePdf(
      //   {
      //     companyId,
      //     companyAddress: manualCompany.companyAddress,
      //     contactPosition: manualCompany.contactPosition,
      //     companyType: manualCompany.companyType,
      //   },
      //   formValues
      // );
      // TODO: for realsies comment this out
      const { fileUrl } = mockGenerateFormAPI();

      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      }
      // TODO: till this

      setDoneKind("generated");
      setStep("done");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overflow-auto space-y-4">
      {/* title */}
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">
          {step === "formFields" && "Fill in your details"}
          {step === "companySelect" && "Find your company"}
          {step === "generating" && "Preparing your Student MOA"}
          {step === "done" &&
            (doneKind === "assist"
              ? "Request sent to your company"
              : "Your Student MOA is ready")}
        </h3>
      </div>

      {/* subtitle */}
      <p className="text-sm text-gray-600">
        {step === "formFields" &&
          (description ?? "Fill in the details below to generate your MOA.")}
        {step === "companySelect" &&
          "Select your company. If it’s not listed, we can reach out on your behalf or you can enter details manually."}
        {step === "generating" &&
          "We’re generating your PDF. The download will start automatically."}
        {step === "done" &&
          (doneKind === "assist"
            ? "We sent the MOA to your company. You can track the status in Past Forms."
            : "Download started. You can also find the document under My Forms.")}
      </p>

      {/* Step 1: Internship Fields */}
      {step === "formFields" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {orderedDefs.map((def) => (
              <FieldRenderer
                key={def.key}
                def={def}
                value={formValues[def.key] ?? ""}
                onChange={(v) => setFormField(def.key, v.toString())}
                error={errors[def.key]}
              />
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={goFromFormToCompany} disabled={!formValid}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Company Select */}
      {step === "companySelect" && (
        <div className="space-y-4 min-h-[35vh] overflow-auto">
          <DropdownGroup>
            <FormDropdown
              label="Company"
              value={companyId}
              options={entities.map((c) => ({
                id: c.id,
                name: c.display_name,
              }))}
              setter={(v) => setCompanyId(String(v ?? ""))}
            />
          </DropdownGroup>

          {/* toggles */}
          <div className="text-xs text-gray-500">
            Can’t find your company?{" "}
            <button
              className="underline hover:text-primary transition-all"
              onClick={() => {
                setShowAssist((s) => !s);
                if (!showAssist) setShowManual(false);
              }}
            >
              Let your employer fill it out for you
            </button>{" "}
            or{" "}
            <button
              className="underline hover:text-primary transition-all"
              onClick={() => {
                setShowManual((s) => !s);
                if (!showManual) setShowAssist(false);
              }}
            >
              fill out details manually
            </button>
            .
          </div>

          {/* Inline Employer Assist */}
          {showAssist && (
            <div className="rounded-md border p-3 space-y-3">
              <FormInput
                label="Company Legal Name"
                value={invite.legalName}
                setter={(v) => setInviteField("legalName", v)}
              />
              {!!errors.legalName && (
                <p className="text-xs text-red-600">{errors.legalName}</p>
              )}

              <FormInput
                label="Company Representative / Contact Person"
                value={invite.contactPerson}
                setter={(v) => setInviteField("contactPerson", v)}
              />
              {!!errors.contactPerson && (
                <p className="text-xs text-red-600">{errors.contactPerson}</p>
              )}

              <FormInput
                label="Contact Number"
                value={invite.contactNumber}
                setter={(v) => setInviteField("contactNumber", v)}
              />
              {!!errors.contactNumber && (
                <p className="text-xs text-red-600">{errors.contactNumber}</p>
              )}

              <FormInput
                label="Contact Email"
                value={invite.contactEmail}
                setter={(v) => setInviteField("contactEmail", v)}
              />
              {!!errors.contactEmail && (
                <p className="text-xs text-red-600">{errors.contactEmail}</p>
              )}

              <div className="flex justify-end">
                <Button onClick={submitEmployerAssist} disabled={busy}>
                  {busy ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Sending…
                    </span>
                  ) : (
                    "Send request"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Inline Manual Details */}
          {showManual && (
            <div className="rounded-md border p-3 space-y-3">
              <FormInput
                label="Company Legal Name"
                value={manualCompany.legalName}
                setter={(v) => setManualField("legalName", v)}
              />
              {!!errors.legalName && (
                <p className="text-xs text-red-600">{errors.legalName}</p>
              )}

              <FormInput
                label="Company Address"
                value={manualCompany.companyAddress}
                setter={(v) => setManualField("companyAddress", v)}
              />
              {!!errors.companyAddress && (
                <p className="text-xs text-red-600">{errors.companyAddress}</p>
              )}

              <FormInput
                label="Company Representative / Contact Person"
                value={manualCompany.contactPerson}
                setter={(v) => setManualField("contactPerson", v)}
              />
              {!!errors.contactPerson && (
                <p className="text-xs text-red-600">{errors.contactPerson}</p>
              )}

              <FormInput
                label="Contact Position"
                value={manualCompany.contactPosition}
                setter={(v) => setManualField("contactPosition", v)}
              />
              {!!errors.contactPosition && (
                <p className="text-xs text-red-600">{errors.contactPosition}</p>
              )}

              <FormDropdown
                label="Company Type"
                value={manualCompany.companyType}
                options={[
                  { id: "partnership", name: "Partnership" },
                  { id: "corporation", name: "Corporation" },
                  { id: "government-agency", name: "Government Agency" },
                ]}
                setter={(v) => setManualField("companyType", String(v ?? ""))}
              />
              {!!errors.companyType && (
                <p className="text-xs text-red-600">{errors.companyType}</p>
              )}

              <div className="flex justify-end">
                <Button onClick={submitManualDetails} disabled={busy}>
                  {busy ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Generating…
                    </span>
                  ) : (
                    "Generate with manual details"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button variant="outline" onClick={() => setStep("formFields")}>
              Back
            </Button>
            <Button
              onClick={tryGenerateWithPickedCompany}
              disabled={!companyId || busy}
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Generating…
                </span>
              ) : (
                "Generate with selected company"
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "generating" && (
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            We’re generating your PDF. The download will start automatically.
          </span>
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      )}

      {step === "done" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">
              {doneKind === "assist"
                ? "Request sent! Track it under My Forms → Pending."
                : "All set! Your download should have started."}
            </span>
          </div>

          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
}

function mockGenerateFormAPI() {
  // In a real API, fileUrl would be returned by the server after rendering.
  const fileUrl = "../YAUN_Student_MOA.pdf";

  return { fileUrl };
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
  onChange: (v: string | number) => void;
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
    // Disable dates before today+7
    let disabledDays: any | undefined;
    if (
      def.key === "internship_start_date" ||
      def.key === "internship_end_date"
    ) {
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
          date={parseInt(value)}
          setter={(nextMs) => onChange(nextMs ?? 0)}
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
        validators: [
          (value) => {
            if (value === null || value === undefined || value === "")
              return null;

            const n = typeof value === "string" ? Number(value) : value;
            if (Number.isNaN(n)) return "Enter a valid number.";
            if (n < 0) return "Total hours must be positive.";
            if (n > 2000) return "Maximum allowed is 2000 hours.";
            return null;
          },
        ],
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

/* ──────────────────────────────────────────────
   DLSU ID helpers
   ────────────────────────────────────────────── */
const DLSU_ID_RE = /^(?:0[0-9]|1[0-9]|2[0-9])\d{6}[A-Z]?$/;

function normalizeDlsuId(raw: string) {
  return (raw || "").replace(/[\s-]/g, "").toUpperCase();
}

function validateDlsuId(id: string): string | null {
  if (!id) return "This field is required.";
  const v = normalizeDlsuId(id);
  return DLSU_ID_RE.test(v) ? null : "Invalid DLSU ID (e.g., 12141380).";
}
