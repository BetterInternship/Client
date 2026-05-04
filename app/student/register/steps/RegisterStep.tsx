import { IRefsContext, University } from "@/lib/db/db.types";
import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FormInputs } from "../page";
import { Autocomplete } from "@/components/ui/autocomplete";
import { DEGREES } from "./tempDegrees";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NO_UNIVERSITY_ID } from "@/lib/student-forms-access";

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
  const firstName = regForm.watch("first_name") || "";
  const lastName = regForm.watch("last_name") || "";
  const university = regForm.watch("university") || "";
  const degree = regForm.watch("degree") || "";
  const hasValidUniversity = refs.universities.some(
    (option) => option.id === university,
  );
  const universityOptions = refs.universities
    .toSorted((a, b) => (a.name as string).localeCompare(b.name as string))
    .toSorted((a, b) => {
      if (a.id === NO_UNIVERSITY_ID) return -1;
      if (b.id === NO_UNIVERSITY_ID) return 1;
      return 0;
    });
  const canCreateAccount =
    firstName.trim() && lastName.trim() && hasValidUniversity && degree.trim();

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
          value={firstName}
          maxLength={40}
          setter={(val) => {
            regForm.setValue("first_name", val);
          }}
          placeholder="First name"
        />

        <FormInput
          label="Last name"
          value={lastName}
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
          regForm.setValue("university", val === null ? "" : String(val));
        }}
        options={universityOptions as { id: string; name: string }[]}
        value={university}
        required={true}
        preserveOptionOrder={true}
      />

      <Accordion type="single" collapsible className="-mt-3">
        <AccordionItem value="missing-university" className="border-b-0">
          <AccordionTrigger className="w-fit flex-none justify-start gap-1 py-0 text-sm font-normal text-primary underline underline-offset-4 hover:text-primary/80 hover:no-underline [&>svg]:hidden">
            Don't see your university? Let us know!
          </AccordionTrigger>
          <AccordionContent className="pb-0 py-3 px-5 text-xs leading-6 text-muted-foreground border-b bg-gray-200">
            Want to see your university on our site? <br />
            <a
              href="https://www.facebook.com/betterinternship.sherwin"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline hover:text-primary/80"
            >
              Talk to us now
            </a>{" "}
            and become an ambassador for BetterInternship!
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Autocomplete
        label="Degree program"
        placeholder="Degree program"
        options={DEGREES}
        setter={(val) => {
          regForm.setValue("degree", val === null ? "" : String(val));
        }}
        value={degree}
        required={true}
        allowCustomValue={true}
      />

      {/* create account */}
      <div className="flex gap-2 justify-end mt-4">
        <Button
          className="w-full sm:w-auto"
          type="button"
          disabled={submitting || !canCreateAccount}
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
