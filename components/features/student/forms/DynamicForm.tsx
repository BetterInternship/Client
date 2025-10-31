"use client";

import { useEffect } from "react";
import { FieldRenderer } from "@/components/features/student/forms/FieldRenderer";
import { ClientField } from "@betterinternship/core/forms";
import { cn, coerceAnyDate } from "@/lib/utils";
import { Info } from "lucide-react";
import { Tooltip } from "react-tooltip";

export function DynamicForm({
  formName,
  fields,
  values,
  setValues,
  autofillValues,
  onChange,
  errors = {},
  showErrors = false,
}: {
  formName: string;
  fields: ClientField<[]>[];
  values: Record<string, any>;
  autofillValues: Record<string, string>;
  errors?: Record<string, string>;
  showErrors?: boolean;
  setValues: (values: Record<string, string>) => void;
  onChange: (key: string, value: any) => void;
}) {
  const filteredFields = fields.filter((field) => field.source === "student");

  // Group by section
  const entitySectionFields: ClientField<[]>[] = filteredFields.filter(
    (d) => d.section === "entity",
  );
  const studentSectionFields: ClientField<[]>[] = filteredFields.filter(
    (d) => d.section === "student",
  );
  const internshipSectionFields: ClientField<[]>[] = filteredFields.filter(
    (d) => d.section === "internship",
  );
  const universitySectionFields: ClientField<[]>[] = filteredFields.filter(
    (d) => d.section === "university",
  );

  // Seed from saved autofill
  useEffect(() => {
    if (!autofillValues) return;

    const newValues = { ...values };
    for (const field of filteredFields) {
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
    <div className="space-y-4">
      <FormSection
        formKey={formName}
        title="Entity Information"
        fields={entitySectionFields}
        values={values}
        onChange={onChange}
        errors={errors}
        showErrors={showErrors}
      />

      <FormSection
        formKey={formName}
        title="Internship Information"
        fields={internshipSectionFields}
        values={values}
        onChange={onChange}
        errors={errors}
        showErrors={showErrors}
      />

      <FormSection
        formKey={formName}
        title="University Information"
        fields={universitySectionFields}
        values={values}
        onChange={onChange}
        errors={errors}
        showErrors={showErrors}
      />

      <FormSection
        formKey={formName}
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
  const reducedFields = fields.reduce(
    (acc, cur) =>
      acc.map((f) => f.field).includes(cur.field) ? acc : [...acc, cur],
    [] as ClientField<[]>[],
  );

  return (
    <div className="space-y-3">
      <div className="pt-2 pb-1">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>

      {reducedFields.map((field) => (
        <div
          className="flex flex-row space-between"
          key={`${formKey}:${field.section}:${field.field}`}
        >
          <div>
            <div className="opacity-50 hover:cursor-help">
              <Info
                data-tooltip-id={`${formKey}:${field.section}:${field.field}-tooltip`}
                data-tooltip-content={field.tooltip_label}
                data-tooltip-place="bottom"
                className={cn(
                  "w-9 h-9 p-3 text-primary translate-x-[-10px] translate-y-[-10px]",
                  field.tooltip_label.trim() ? "" : "invisible",
                )}
              ></Info>
            </div>
            <Tooltip
              className="z-[99] !text-[10px] p-[0.05em] !max-w-[80vw]"
              id={`${formKey}:${field.section}:${field.field}-tooltip`}
            />
          </div>
          <div className="flex-1">
            <FieldRenderer
              field={field}
              value={values[field.field]}
              onChange={(v) => onChange(field.field, v)}
              error={errors[field.field]}
              showError={showErrors}
              allValues={values}
            />
          </div>
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
