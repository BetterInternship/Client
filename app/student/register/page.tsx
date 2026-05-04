"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDbRefs } from "@/lib/db/use-refs";
import { useAuthContext } from "@/lib/ctx-auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DropdownGroup } from "@/components/ui/dropdown";
import { RegisterStep } from "./steps/RegisterStep";
import { OTPEmailStep } from "./steps/OTPEmailStep";
import { OTPEnterStep } from "./steps/OTPEnterStep";
import { RegisterCarousel } from "@/components/features/student/register/RegisterCarousel";
import { NO_UNIVERSITY_ID } from "@/lib/student-forms-access";

export interface FormInputs {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  university?: string;
  degree?: string;
}

const NEXT_URL = "/search";

export function RegisterPageContent() {
  const refs = useDbRefs();
  const auth = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [submitting, setSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [step, setStep] = useState(
    searchParams.get("step") === "verify" ? 2 : 1,
  );

  const skipOtpStep = searchParams.get("edu-email") === "true";

  // modify url params based on current step.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (step === 2 || step === 3) {
      params.set("step", "verify");
    } else {
      params.delete("step");
    }

    const search = params.toString();
    const query = search ? `?${search}` : "";
    console.log(`register skip: ${pathname}${query}`);
    // router.replace(`${pathname}${query}`, { scroll: false });
  }, [step, pathname, router, searchParams]);

  // skip main register page if the user is already registered.
  useEffect(() => {
    if (step === 1 && auth.isAuthenticated()) {
      if (skipOtpStep) {
        router.replace(NEXT_URL);
      } else {
        setStep(2);
      }
    }
  }, [step, auth, router, skipOtpStep]);

  const regForm = useForm<FormInputs>({
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      university: "",
      degree: "",
    },
  });

  /**
   * Handle form submit
   *
   * @param values
   */
  const handleSubmit = (values: FormInputs) => {
    setSubmitting(true);
    const shouldSkipOtp = skipOtpStep || values.university === NO_UNIVERSITY_ID;

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

    if (!values.degree?.trim()) {
      alert("Your degree program is required.");
      setSubmitting(false);
      return;
    }

    // Extract fields
    const { university, first_name, middle_name, last_name, degree } = values;

    auth
      .register({
        university,
        first_name,
        middle_name,
        last_name,
        degree,
      })
      .then((response) => {
        if (response?.message) {
          setSubmitting(false);
          alert(response.message);
          return;
        }

        setSubmitting(false);

        if (shouldSkipOtp) {
          router.replace(NEXT_URL);
          return;
        }

        setStep(step + 1);
      })
      .catch((error) => {
        setSubmitting(false);
        console.log(error);
        toast.error("Something went wrong... Try again later.");
      });
  };

  return (
    <div className="w-full min-h-screen p-3 bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full min-h-[calc(100vh-1.5rem)]">
        {/* Decorative area */}
        <div className="hidden lg:block lg:col-span-3 min-h-full rounded-[0.33em] overflow-hidden">
          <RegisterCarousel />
        </div>

        {/* Form area */}
        <div className="col-span-1 lg:col-span-2 w-full bg-muted border-l border-l-gray-300 px-5">
          <div className="flex flex-col justify-between h-full w-full p-3">
            {/* Header - DONT DELETE!!!!!!!!!!!!!! Otherwise layout will change */}
            <div></div>

            <div className="space-y-6">
              {step === 1 && !auth.isAuthenticated() && (
                <DropdownGroup>
                  <RegisterStep
                    regForm={regForm}
                    refs={refs}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                  />
                </DropdownGroup>
              )}
              {step === 2 && (
                <OTPEmailStep
                  onNextAction={(email) => {
                    setVerificationEmail(email);
                    setStep(step + 1);
                  }}
                  onSkipAction={() => {
                    router.replace(NEXT_URL);
                  }}
                />
              )}
              {step === 3 && (
                <OTPEnterStep
                  eduEmail={verificationEmail}
                  onFinishAction={() => {
                    router.replace(NEXT_URL);
                  }}
                  onBackAction={() => setStep(step - 1)}
                />
              )}
            </div>

            {/* Contact us */}
            <div className="space-y-3">
              <a
                className="text-sm hover:underline"
                href="https://www.facebook.com/betterinternship.sherwin"
                target="_blank"
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div />}>
      <RegisterPageContent />
    </Suspense>
  );
}
