import {
  FormDropdown,
  FormDatePicker,
  TimeInputNative,
  FormInput,
} from "@/components/EditForm";

type FieldType = "text" | "number" | "select" | "date" | "time";
export type FilledBy = "student" | "entity" | "university" | null;

type Option = { value: string; label: string };

export type FieldDef = {
  id: string;
  key: string; // db key (used to store in formData)
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  maxLength?: number;
  options?: Option[]; // for select
  validators: z.ZodTypeAny[];
  filledBy?: FilledBy;
};

export function FieldRenderer({
  def,
  value,
  onChange,
  error,
  showError,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string | number) => void;
  error?: string;
  showError?: boolean;
}) {
  const Note = () => {
    if (showError && !!error) {
      return <p className="text-xs text-rose-600 mt-1">{error}</p>;
    }
    if (def.helper) {
      return <p className="text-xs text-muted-foreground mt-1">{def.helper}</p>;
    }
    return null;
  };

  if (def.type === "select") {
    const options = (def.options ?? []).map((o) => ({
      id: o.value,
      name: o.label,
    }));
    return (
      <div className="space-y-1.5">
        <FormDropdown
          label={def.label}
          required
          value={value}
          options={options}
          setter={(v) => onChange(String(v ?? ""))}
          className="w-full"
        />
        <Note />
      </div>
    );
  }

  if (def.type === "date") {
    // Example: disable dates before today+7 for specific keys
    let disabledDays: any | undefined;
    if (
      def.key === "internship_start_date" ||
      def.key === "internship_end_date"
    ) {
      const t = new Date();
      const min = new Date(t.getFullYear(), t.getMonth(), t.getDate());
      min.setDate(min.getDate() + 7);
      disabledDays = { before: min };
    }

    return (
      <div className="space-y-1.5">
        <FormDatePicker
          label={def.label}
          required
          date={Number.isFinite(+value) ? parseInt(value) : undefined}
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
        <Note />
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
          required
          helper={def.helper}
        />
        <Note />
      </div>
    );
  }

  // Text & Number (sanitize number but keep type="text" to avoid 'e', '-', etc.)
  const inputMode = def.type === "number" ? "numeric" : undefined;
  const sanitizeNumber = (s: string) =>
    s
      .replace(/[^\d.]/g, "") // keep digits and dot
      .replace(/(\..*)\./g, "$1"); // single dot only

  return (
    <div className="space-y-1.5">
      <FormInput
        label={def.label}
        required
        value={value ?? ""}
        setter={(v) => {
          if (def.type === "number") {
            const next = sanitizeNumber(String(v ?? ""));
            onChange(next);
          } else {
            onChange(String(v ?? ""));
          }
        }}
        type="text"
        inputMode={inputMode as any}
        placeholder={def.placeholder}
        maxLength={def.maxLength}
        className="w-full"
      />
      <Note />
    </div>
  );
}
