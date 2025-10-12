"use client";

import { useEffect, useState } from "react";
import { OutsideTabPanel, OutsideTabs } from "@/components/ui/outside-tabs";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper } from "lucide-react";
import { safeParse, z, ZodSafeParseResult } from "zod";
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
    const debouncedValidation = setTimeout(() => {
      for (const field of dynamicForm.fields) {
        for (const validator of validators[field.name]) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const result = validator(formData[field.name]);
          if (result.success) {
            setErrors({
              ...errors,
              [field.name]: "",
            });
            continue;
          }

          const error = JSON.parse(result.error.message) as {
            message: string;
          }[];
          const message = error.map((e) => e.message).join("\n");
          setErrors({
            ...errors,
            [field.name]: message,
          });
        }
      }
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

  return (
    <div className="container max-w-6xl px-4 sm:px-10 pt-6 sm:pt-16 mx-auto">
      <div className="mb-6 sm:mb-8 animate-fade-in space-y-5">
        {/* Header */}
        <DynamicForm form="student-moa" />
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

        {/* Tabs */}
        <OutsideTabs
          value={tab}
          onChange={(v) => setTab(v as TabKey)}
          tabs={[
            { key: "Form Generator", label: "Form Generator" },
            { key: "My Forms", label: "My Forms" },
          ]}
        >
          {/* Form Generator */}
          <OutsideTabPanel when="Form Generator" activeKey={tab}>
            <div>Panel 1</div>
          </OutsideTabPanel>

          {/* Past Forms */}
          <OutsideTabPanel when="My Forms" activeKey={tab}>
            <div>Panel 2</div>
          </OutsideTabPanel>
        </OutsideTabs>
      </div>
    </div>
  );
}
