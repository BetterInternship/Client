"use client";

import { useEffect, useState } from "react";
import { OutsideTabPanel, OutsideTabs } from "@/components/ui/outside-tabs";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper } from "lucide-react";
import { ZodSafeParseResult } from "zod";
import { useDynamicFormSchema } from "@/lib/db/use-moa-backend";
import { useFormData } from "@/lib/form-data";
import { FormInput } from "@/components/EditForm";
import { ErrorLabel } from "@/components/ui/labels";

/**
 * The form builder.
 * Changes based on field inputs.
 *
 * @component
 */
const DynamicForm = ({ form }: { form: string }) => {
  const dynamicForm = useDynamicFormSchema(form);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validators, setValidators] = useState<
    Record<string, ((value: any) => ZodSafeParseResult<unknown>)[]>
  >({});
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { formData, setField } = useFormData<any>({});

  // Reset all fields first
  useEffect(() => {
    const validators: Record<
      string,
      ((value: any) => ZodSafeParseResult<unknown>)[]
    > = {};

    // Save the fields
    for (const field of dynamicForm.fields) {
      setField(field.name, "");
      validators[field.name] = [];

      // Push the validators per field
      for (const validator of field.validators)
        validators[field.name].push((value) => validator.safeParse(value));
    }

    // Save the validators
    setValidators(validators);
  }, [dynamicForm.fields]);

  // Debounced validation
  useEffect(() => {
    console.log(validators);
    const debouncedValidation = setTimeout(() => {
      const newErrors: Record<string, string> = {};
      for (const field of dynamicForm.fields) {
        for (const validator of validators[field.name]) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const result = validator(formData[field.name]);
          if (result.success) {
            newErrors[field.name] = "";
            continue;
          }

          const error = JSON.parse(result.error.message) as {
            message: string;
          }[];
          const message = error.map((e) => e.message).join("\n");
          newErrors[field.name] = message;
        }
      }
      setErrors(newErrors);
    }, 500);
    return () => clearTimeout(debouncedValidation);
  }, [formData]);

  return (
    <div>
      {dynamicForm.fields.map((field) => (
        <>
          <ErrorLabel value={errors[field.name]}></ErrorLabel>
          <FormInput
            // ! create a display_name row in the database
            label={field.name}
            required
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            value={formData[field.name] as string}
            setter={(v) => {
              setField(field.name, v);
            }}
            className="w-full"
          />
        </>
      ))}
    </div>
  );
};

/**
 * The forms page component
 *
 * @component
 */
type TabKey = "Form Generator" | "My Forms";
export default function FormsPage() {
  const [tab, setTab] = useState<TabKey>("Form Generator");
  const form = "new-form";

  return (
    <div className="container max-w-6xl px-4 sm:px-10 pt-6 sm:pt-16 mx-auto">
      <div className="mb-6 sm:mb-8 animate-fade-in space-y-5">
        {/* Header */}
        <div>
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={Newspaper} />
            <HeaderText>{form}</HeaderText>
          </div>
          <div className="flex-1 flex-row">
            <p className="text-gray-600 text-sm sm:text-base mb-2">Yes</p>
          </div>
          <DynamicForm form={form} />
        </div>
      </div>
    </div>
  );
}
