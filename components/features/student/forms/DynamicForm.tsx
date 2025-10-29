"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/lib/api/services";
import { FieldRenderer } from "@/components/features/student/forms/FieldRenderer";
import { Loader2 } from "lucide-react";
import { ClientField, FormMetadata } from "@betterinternship/core/forms";
import { Loader } from "@/components/ui/loader";
import { coerceAnyDate } from "@/lib/utils";

export function DynamicForm({
  form,
  values,
  setValues,
  autofillValues,
  onChange,
  errors = {},
  showErrors = false,
  overrideFields,
}: {
  form: string;
  values: Record<string, any>;
  autofillValues: Record<string, string>;
  errors?: Record<string, string>;
  showErrors?: boolean;
  overrideFields?: ClientField<[]>[];
  setValues: (values: Record<string, string>) => void;
  onChange: (key: string, value: any) => void;
}) {
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

  const showInitialLoader = isLoading;

  // Seed from saved autofill
  useEffect(() => {
    if (!autofillValues) return;

    const newValues = { ...values };
    for (const field of fields) {
      const autofillValue = autofillValues[field.field];

      // Don't autofill if not empty or if nothing to autofill
      if (autofillValue === undefined) continue;
      if (!isEmptyFor(field, values[field.field])) continue;

      // Coerce autofill before putting it in
      const coercedAutofillValue = coerceForField(field, autofillValue);
      if (coercedAutofillValue !== undefined)
        newValues[field.field] = coercedAutofillValue.toString();
    }

    setValues(newValues);
  }, []);

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
    </div>
  );
}

const FormSection = function FormSection({
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
};

/**
 * Checks if field is empty, based on field type.
 *
 * @param field
 * @param value
 * @returns
 */
function isEmptyFor(field: ClientField<[]>, value: unknown) {
  switch (field.type) {
    case "date":
      return !(typeof value === "number" && value > 0); // 0/undefined = empty
    case "signature":
      return value !== true;
    case "number":
      return value === undefined || value === "";
    default:
      return value === undefined || value === "";
  }
}

/**
 * Coerces the value into the type needed by the field.
 * Useful, used outside zod schemas.
 *
 * @param field
 * @param value
 * @returns
 */
const coerceForField = (field: ClientField<[]>, value: unknown) => {
  switch (field.type) {
    case "number":
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value == null ? "" : String(value);
    case "date":
      return coerceAnyDate(value);
    case "time":
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value == null ? "" : String(value);
    case "signature":
      return value === true;
    case "text":
    default:
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value == null ? "" : String(value);
  }
};
