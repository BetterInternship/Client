"use client";

import { useEffect, useMemo, useRef, useState, memo } from "react";
import { useDynamicFormSchema } from "@/lib/db/use-moa-backend";
import {
  FieldRenderer,
  type FieldDef as RendererFieldDef,
  type Section,
} from "@/components/features/student/forms/FieldRenderer";
import { Loader2 } from "lucide-react";

type Mode = "select" | "invite" | "manual";

export function DynamicForm({
  form,
  values,
  onChange,
  onSchema,
  errors = {},
  showErrors = false,
  entityMode,
  onEntityModeChange,
  entityModeSupport,
}: {
  form: string;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onSchema: (defs: RendererFieldDef[]) => void;
  errors?: Record<string, string>;
  showErrors?: boolean;
  entityMode: Mode;
  onEntityModeChange: (m: Mode) => void;
  entityModeSupport: { invite: boolean; manual: boolean };
}) {
  const {
    fields: rawFields,
    error: loadError,
    isLoading,
  } = useDynamicFormSchema(form);

  const defs: RendererFieldDef[] = useMemo(
    () =>
      (rawFields ?? []).map((f) => ({
        id: f.id,
        key: f.name,
        value: f?.value ?? undefined,
        label: f.label ?? f.name,
        type: f.type ?? "text",
        helper: f.helper ?? undefined,
        validators: f.validators ?? [],
        section: f.section as Section,
        options: f.options as { value: string; label: string }[],
        params: f.params ?? undefined,
      })),
    [rawFields],
  );

  console.log("DynamicForm defs:", defs);

  const lastSigRef = useRef("");
  useEffect(() => {
    const sig = JSON.stringify(
      defs.map((d) => [d.section, String(d.id), d.key, d.type]),
    );
    if (sig !== lastSigRef.current) {
      lastSigRef.current = sig;
      onSchema(defs);
    }
  }, [defs, onSchema]);

  const [bootstrapped, setBootstrapped] = useState(false);
  useEffect(() => {
    if (!bootstrapped && defs.length > 0) setBootstrapped(true);
  }, [bootstrapped, defs.length]);

  // seed initial values from defs
  useEffect(() => {
    if (!bootstrapped || !defs.length) return;

    const toInit = defs.filter(
      (d) =>
        values[d.key] === undefined &&
        d.value !== undefined &&
        d.value !== null,
    );

    if (!toInit.length) return;

    for (const d of toInit) {
      // default to not changing anything
      let shouldSet = true;
      let v: any = d.value;

      switch (d.type) {
        case "number":
          v = String(d.value);
          break;

        case "date":
          if (typeof d.value === "string") {
            const ms = Date.parse(d.value);
            v = Number.isFinite(ms) ? ms : undefined;
          } else if (typeof d.value === "number") {
            v = d.value;
          } else {
            // ⛔️ don’t seed 0 – leave it undefined so autofill can win
            shouldSet = false;
          }
          break;

        case "time":
          if (d.value == null) {
            shouldSet = false; // let autofill win
          } else {
            v = String(d.value ?? "");
          }
          break;

        case "signature":
          v = Boolean(d.value);
          break;

        case "select":
          v = String(d.value);
          break;

        default:
          v = String(d.value ?? "");
      }

      if (shouldSet) onChange(d.key, v);
    }
  }, [bootstrapped, defs]);

  const companyDefs: RendererFieldDef[] = useMemo(
    () => defs.filter((d) => d.section === "entity"),
    [defs],
  );
  const studentDefs: RendererFieldDef[] = useMemo(
    () => defs.filter((d) => d.section === "student"),
    [defs],
  );
  const internshipDefs: RendererFieldDef[] = useMemo(
    () => defs.filter((d) => d.section === "internship"),
    [defs],
  );
  const universityDefs: RendererFieldDef[] = useMemo(
    () => defs.filter((d) => d.section === "university"),
    [defs],
  );

  const showInitialLoader = isLoading && !bootstrapped;

  return (
    <div className="space-y-4" aria-busy={isLoading}>
      {showInitialLoader && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading form…</span>
        </div>
      )}

      {loadError && (
        <p className="text-sm text-red-600">
          Failed to load form:{" "}
          {loadError instanceof Error
            ? loadError.message
            : JSON.stringify(loadError)}
        </p>
      )}

      {bootstrapped && (
        <>
          <CompanySectionWithEntityMode
            formKey={form}
            defs={companyDefs}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
            entityMode={entityMode}
            onEntityModeChange={onEntityModeChange}
            entityModeSupport={entityModeSupport}
          />

          <FormSection
            formKey={form}
            title="Internship Information"
            defs={internshipDefs}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
          />

          <FormSection
            formKey={form}
            title="University Information"
            defs={universityDefs}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
          />

          <FormSection
            formKey={form}
            title="Student Information"
            defs={studentDefs}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
          />
        </>
      )}
    </div>
  );
}

const CompanySectionWithEntityMode = memo(
  function CompanySectionWithEntityMode({
    formKey,
    defs,
    values,
    onChange,
    errors,
    showErrors,
    entityMode,
    onEntityModeChange,
    entityModeSupport,
  }: {
    formKey: string;
    defs: RendererFieldDef[];
    values: Record<string, any>;
    onChange: (key: string, value: any) => void;
    errors: Record<string, string>;
    showErrors: boolean;
    entityMode: Mode;
    onEntityModeChange: (m: Mode) => void;
    entityModeSupport: { invite: boolean; manual: boolean };
  }) {
    if (!defs.length) return null;

    return (
      <div className="space-y-3">
        <div className="pt-2 pb-1">
          <h3 className="text-sm font-semibold text-gray-700">
            Company Information
          </h3>
        </div>

        {defs.map((def) => {
          const isEntityId = def.key === "entity-id";
          if (!isEntityId) {
            return (
              <div key={`${formKey}:${def.section}:${String(def.id)}`}>
                <FieldRenderer
                  def={def}
                  value={values[def.key]}
                  onChange={(v) => onChange(def.key, v)}
                  error={errors[def.key]}
                  showError={showErrors}
                  allValues={values}
                />
              </div>
            );
          }

          const canInvite = entityModeSupport.invite;
          const canManual = entityModeSupport.manual;
          const showFriendlyHelper = canInvite || canManual;

          return (
            <div
              key={`${formKey}:${def.section}:${String(def.id)}`}
              className="space-y-2"
            >
              <FieldRenderer
                def={def}
                value={values[def.key]}
                onChange={(v) => onChange(def.key, v)}
                error={errors[def.key]}
                showError={showErrors}
                allValues={values}
              />

              {showFriendlyHelper && (
                <EntityModeHelper
                  value={entityMode}
                  onChange={onEntityModeChange}
                  allowInvite={canInvite}
                  allowManual={canManual}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  },
);

const EntityModeHelper = ({
  onChange,
  allowInvite,
  allowManual,
}: {
  onChange: (m: Mode) => void;
  allowInvite: boolean;
  allowManual: boolean;
}) => {
  // minimal, sentence-only, link-like buttons
  const LinkBtn = ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="link"
      className={[
        "underline underline-offset-4",
        "text-primary",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-80",
      ].join(" ")}
    >
      {children}
    </button>
  );

  return (
    <p className="text-xs text-muted-foreground">
      Can’t find the company?{" "}
      <LinkBtn onClick={() => onChange("invite")} disabled={!allowInvite}>
        Invite them
      </LinkBtn>{" "}
      or{" "}
      <LinkBtn onClick={() => onChange("manual")} disabled={!allowManual}>
        fill in manually
      </LinkBtn>
      .
    </p>
  );
};

const FormSection = memo(function FormSection({
  formKey,
  title,
  defs,
  values,
  onChange,
  errors,
  showErrors,
}: {
  formKey: string;
  title: string;
  defs: RendererFieldDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors: Record<string, string>;
  showErrors: boolean;
}) {
  if (!defs.length) return null;

  return (
    <div className="space-y-3">
      <div className="pt-2 pb-1">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>

      {defs.map((def) => (
        <div key={`${formKey}:${def.section}:${String(def.id)}`}>
          <FieldRenderer
            def={def}
            value={values[def.key]}
            onChange={(v) => onChange(def.key, v)}
            error={errors[def.key]}
            showError={showErrors}
            allValues={values}
          />
        </div>
      ))}
    </div>
  );
});
