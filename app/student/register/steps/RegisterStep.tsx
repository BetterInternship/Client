import { FormDropdown } from "@/components/EditForm";
import { IRefsContext } from "@/lib/db/db.types";
import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FormInputs } from "../page";
import { Autocomplete } from "@/components/ui/autocomplete";
import { DEGREES } from "./tempDegrees";

/**
 * The first step to registering where the user puts their personal information in.
 * @param regForm The form data.
 * @param refs Reference table hook.
 * @returns Form for inputting personal information for student registration.
 */
export function RegisterStep({
  regForm,
  refs,
  onSubmit,
  submitting,
}: {
  regForm: UseFormReturn<FormInputs>;
  refs: IRefsContext;
  onSubmit: (values: FormInputs) => void;
  submitting: boolean;
}) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl tracking-tight font-bold text-gray-700">
          Let's get started
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-3 w-full">
        <FormInput
          label="First name"
          value={regForm.watch("first_name") || ""}
          maxLength={40}
          setter={(val) => {
            regForm.setValue("first_name", val);
          }}
          placeholder="First name"
        />

        <FormInput
          label="Last name"
          value={regForm.watch("last_name") || ""}
          maxLength={40}
          setter={(val) => {
            regForm.setValue("last_name", val);
          }}
          className="col-span-1 sm:col-span-2"
          placeholder="Last name"
        />
      </div>

      <Autocomplete
        label="University"
        placeholder="University"
        setter={(val) => {
          regForm.setValue("university", String(val));
        }}
        options={refs.universities}
        value={regForm.watch("university")! || ""}
        required={true}
      />

      <Autocomplete
        label="Degree program"
        placeholder="Degree program"
        options={DEGREES}
        setter={(val) => {
          regForm.setValue("degree", val === null ? "" : String(val));
        }}
        value={regForm.watch("degree") || ""}
        required={true}
        allowCustomValue={true}
      />

      {/* create account */}
      <div className="flex gap-2 justify-end mt-4">
        <Button
          className="w-full sm:w-auto"
          type="button"
          disabled={submitting}
          onClick={(e) =>
            void regForm.handleSubmit(() => onSubmit(regForm.getValues()))(e)
          }
        >
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </div>
    </>
  );
}
