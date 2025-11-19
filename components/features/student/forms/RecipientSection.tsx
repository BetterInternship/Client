import { FieldRenderer } from "@/components/features/student/forms/FieldRenderer";
import { Card } from "@/components/ui/card";

export function RecipientSection({
  formKey,
  title,
  subtitle,
  fields,
  values,
  onChange,
  errors,
  showErrors,
}: {
  formKey: string;
  title: string;
  subtitle?: string;
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
    // TODO: Change this to warning color when warning works na
    <Card className="space-y-3 border-2 border-yellow-500 bg-yellow-50 p-4 rounded-[0.33em]">
      <div className="">
        <h3 className="text-sm font-bold text-yellow-800">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-yellow-700">{subtitle}</p>}
      </div>

      {reducedFields.map((field) => (
        <div
          className="flex flex-row space-between"
          key={`${formKey}:${field.section}:${field.field}`}
        >
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
    </Card>
  );
}
