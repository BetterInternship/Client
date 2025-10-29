"use client";

import { useEffect, useMemo, useRef, useState, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/lib/api/services";
import { FieldRenderer } from "@/components/features/student/forms/FieldRenderer";
import { Loader2 } from "lucide-react";
import { ClientField, FormMetadata } from "@betterinternship/core/forms";
import { Loader } from "@/components/ui/loader";

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
  overrideFields,
}: {
  form: string;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onSchema: (fields: ClientField<[]>[]) => void;
  errors?: Record<string, string>;
  showErrors?: boolean;
  entityMode: Mode;
  onEntityModeChange: (m: Mode) => void;
  entityModeSupport: { invite: boolean; manual: boolean };
  overrideFields?: ClientField<[]>[];
}) {
  /**
   * Fetch raw form document + metadata.
   * We will mold the client schema using FormMetadata.getFieldsForClient().
   *
   * This supports either of these shapes:
   * A) { formDocument, formMetadata }    // raw from server
   * B) { formFields: { formMetadata: { schema: ... } } } // already molded; we’ll still normalize
   */
  const {
    data,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ["forms", form],
    queryFn: () => UserService.getForm(form),
    enabled: !!form && !overrideFields, // skip fetch when caller forces overrideFields
    staleTime: 60_000,
  });

  // Loading form
  if (!data?.formMetadata) return <Loader>Loading form...</Loader>;

  // Extract data from the schema
  const formMetadata = new FormMetadata(data?.formMetadata);
  const fields = formMetadata.getFieldsForClient();

  // bootstrap state once on first load
  const [bootstrapped, setBootstrapped] = useState(false);
  useEffect(() => {
    if (!bootstrapped && fields.length > 0) setBootstrapped(true);
  }, [bootstrapped, fields.length]);

  // Group by section
  const entitySectionFields: ClientField<[]>[] = fields.filter(
    (d) => d.section === "entity",
  );
  const studentSectionFields: ClientField<[]>[] = fields.filter(
    (d) => d.section === "student",
  );
  const internshipSectionFields: ClientField<[]>[] = fields.filter(
    (d) => d.section === "internship",
  );
  const universitySectionFields: ClientField<[]>[] = fields.filter(
    (d) => d.section === "university",
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

      {loadError && !overrideFields && (
        <p className="text-sm text-red-600">
          Failed to load form:{" "}
          {loadError instanceof Error
            ? loadError.message
            : JSON.stringify(loadError)}
        </p>
      )}

      {bootstrapped && (
        <>
          {/* Usually empty since we filtered to source==="student", but retained to preserve API */}
          <FormSection
            formKey={form}
            title="Entity Information"
            fields={entitySectionFields}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
          />

          <FormSection
            formKey={form}
            title="Internship Information"
            fields={internshipSectionFields}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
          />

          <FormSection
            formKey={form}
            title="University Information"
            fields={universitySectionFields}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
          />

          <FormSection
            formKey={form}
            title="Student Information"
            fields={studentSectionFields}
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

const FormSection = memo(function FormSection({
  formKey,
  title,
  fields,
  values,
  onChange,
  errors,
  showErrors,
}: {
  formKey: string;
  title: string;
  fields: ClientField<[]>[];
  values: Record<string, string>;
  onChange: (key: string, value: any) => void;
  errors: Record<string, string>;
  showErrors: boolean;
}) {
  if (!fields.length) return null;

  return (
    <div className="space-y-3">
      <div className="pt-2 pb-1">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>

      {fields.map((field) => (
        <div key={`${formKey}:${field.section}:${field.field}`}>
          <FieldRenderer
            field={field}
            value={values[field.field]}
            onChange={(v) => onChange(field.field, v)}
            error={errors[field.field]}
            showError={showErrors}
            allValues={values}
          />
        </div>
      ))}
    </div>
  );
});
