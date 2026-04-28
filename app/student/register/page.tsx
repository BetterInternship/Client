"use client";

import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useDbRefs } from "@/lib/db/use-refs";
import { FormDropdown, FormInput } from "@/components/EditForm";
import { useAuthContext } from "@/lib/ctx-auth";
import { useProfileData } from "@/lib/api/student.data.api";
import { useRouter } from "next/navigation";
import { IRefsContext } from "@/lib/db/use-refs-backend";

interface FormInputs {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  university?: string;
  degree_program?: string;
}

export function RegisterStep({
  regForm,
  refs,
}: {
  regForm: UseFormReturn<FormInputs>;
  refs: IRefsContext;
}) {
  return (
    <>
      <div className="flex items-center gap-3 text-3xl tracking-tight font-bold text-gray-700">
        Let's get started
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-3 w-full">
        <FormInput
          label="First name"
          value={regForm.watch("first_name") || ""}
          maxLength={40}
          setter={(val) => {
            regForm.setValue("first_name", val);
          }}
        />

        <FormInput
          label="Middle name"
          value={regForm.watch("middle_name") || ""}
          setter={(val) => {
            regForm.setValue("middle_name", val);
          }}
        />

        <FormInput
          label="Last name"
          value={regForm.watch("last_name") || ""}
          maxLength={40}
          setter={(val) => {
            regForm.setValue("last_name", val);
          }}
        />
      </div>

      <FormDropdown
        label="University"
        maxLength={40}
        setter={(val) => {
          regForm.setValue("university", val);
        }}
        options={refs.universities}
        tooltip="If your university is not in the list, please contact us at the 'Need help' link."
      />

      <FormDropdown
        label="Degree program"
        maxLength={40}
        setter={(val) => {
          regForm.setValue("degree_program", val);
        }}
        options={[]}
      />
    </>
  );
}

export default function RegisterPage() {
  const refs = useDbRefs();
  const auth = useAuthContext();
  const [submitting, setSubmitting] = useState(false);
  const profile = useProfileData();
  const router = useRouter();

  const nextUrl = "/search";
  const deciding = profile.data === undefined;

  // Redirect only after we know the profile state
  useEffect(() => {
    if (deciding) return;
    if (profile.data?.is_verified) router.replace(nextUrl);
  }, [deciding, profile.data?.is_verified, router]);

  // Prevent any flash
  if (deciding || profile.data?.is_verified) return null;

  const regForm = useForm<FormInputs>({
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      university: "",
      degree_program: "",
    },
  });

  // track what registration step we're on
  const [step, setStep] = useState(1);

  /**
   * Handle form submit
   *
   * @param values
   */
  const handleSubmit = (values: FormInputs) => {
    setSubmitting(true);

    // Check for missing fields
    if (!values.first_name?.trim()) {
      alert("Your first name is required.");
      setSubmitting(false);
      return;
    }

    if (!values.last_name?.trim()) {
      alert("Your last name is required.");
      setSubmitting(false);
      return;
    }

    if (!values.university?.trim()) {
      alert("Your university is required.");
      setSubmitting(false);
      return;
    }

    if (!values.degree_program?.trim()) {
      alert("Your degree program is required.");
      setSubmitting(false);
      return;
    }

    // Extract fields
    const { university, first_name, middle_name, last_name, degree_program } =
      values;

    auth
      .register({
        university,
      })
      .then((response) => {
        if (response?.message) {
          setSubmitting(false);
          alert(response.message);
          return;
        }

        location.href = "/search";
      })
      .catch((error) => {
        setSubmitting(false);
        console.log(error);
        alert("Something went wrong... Try again later.");
      });
  };

  return (
    <div className="w-full min-h-screen p-3 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full min-h-[calc(100vh-1.5rem)]">
        {/* Decorative area */}
        <div className="hidden md:block md:col-span-3 min-h-full rounded-[0.33em] overflow-hidden bg-black" />

        {/* Form area */}
        <div className="col-span-1 md:col-span-2 w-full p-6">
          <div className="flex flex-col justify-between h-full w-full">
            {/* Header */}
            <div className="flex gap-2 items-center">
              <img
                src="/BetterInternshipLogo.png"
                className="w-8 aspect-square"
                alt="BetterInternship"
              />
              <h1 className="text-2xl font-bold tracking-tighter">
                BetterInternship
              </h1>
            </div>

            <div className="space-y-6">
              {step === 1 && <RegisterStep regForm={regForm} refs={refs} />}
              {/* Submit button*/}
              <div className="flex gap-2 justify-end">
                {step !== 1 && (
                  <Button
                    className="w-full sm:w-auto"
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  className="w-full sm:w-auto"
                  type="button"
                  disabled={submitting}
                  onClick={() => setStep(step + 1)}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Contact us */}
            <div className="space-y-3">
              <a
                className="text-sm hover:underline"
                href="mailto:hello@betterinternship.com"
              >
                Need help?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
