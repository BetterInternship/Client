"use client";

import { useEffect, useState } from "react";
import { useDbRefs } from "@/lib/db/use-refs";
import { useRouter, useSearchParams } from "next/navigation";
import { isValidRequiredURL, toURL } from "@/lib/utils/url-utils";
import { Employer, PublicUser } from "@/lib/db/db.types";
import {
  createEditForm,
  FormCheckbox,
  FormDatePicker,
  FormDropdown,
  FormInput,
} from "@/components/EditForm";
import { Card } from "@/components/ui/card";
import { ErrorLabel } from "@/components/ui/labels";
import { StoryBook } from "@/components/ui/storybook";
import { Button } from "@/components/ui/button";
import { isValidEmail, isValidPHNumber } from "@/lib/utils";
import { MultipartFormBuilder } from "@/lib/multipart-form";
import { useAuthContext } from "@/lib/ctx-auth";
import { Checkbox } from "@/components/ui/checkbox";

const [UserRegisterForm, useUserRegisterForm] = createEditForm<PublicUser>();

export default function RegisterPage() {
  const { register } = useAuthContext();
  const [email, setEmail] = useState("");
  const searchParams = useSearchParams();
  const dbRefs = useDbRefs();
  const router = useRouter();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam && !dbRefs.ref_loading) return router.push("/login");
    if (!emailParam) return;

    setEmail(emailParam);
    if (!dbRefs.universities.length) return;

    const domain = emailParam.split("@")[1];
    const unis = dbRefs.getUniversityFromDomain(domain);
    if (!unis.length && !dbRefs.ref_loading) return router.push("/login");
  }, [searchParams, dbRefs, router]);

  return (
    <div className="flex-1 flex justify-center px-6 py-12 pt-12 overflow-y-auto">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl tracking-tighter font-bold text-gray-700 mb-4">
            Welcome to BetterInternship!
          </h2>
        </div>

        <UserRegisterForm data={{}}>
          <UserEditor registerProfile={register} email={email} />
        </UserRegisterForm>
      </div>
      <div className="fixed bottom-0 bg-gray-50 z-[100] h-10 w-full flex flex-row justify-center">
        <div className="opacity-80 text-sm">
          Need help? Contact us at{" "}
          <a href="mailto:hello@betterinternship.com">
            hello@betterinternship.com
          </a>
        </div>
      </div>
    </div>
  );
}

const UserEditor = ({
  email,
  registerProfile,
}: {
  email: string;
  registerProfile: (newProfile: Partial<PublicUser>) => Promise<any>;
}) => {
  const {
    formData,
    formErrors,
    setField,
    fieldSetter,
    addValidator,
    validateFormData,
    cleanFormData,
  } = useUserRegisterForm();
  const router = useRouter();
  const dbRefs = useDbRefs();
  const [isRegistering, setIsRegistering] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    setField("email", email);
  }, [email]);

  const register = async () => {
    // Validate required fields before submitting
    const missingFields = [];

    if (!formData.first_name) {
      missingFields.push("First Name");
    }
    if (!formData.last_name) {
      missingFields.push("Last Name");
    }
    if (!formData.phone_number || !isValidPHNumber(formData.phone_number)) {
      missingFields.push("Valid Philippine Phone Number");
    }
    if (!dbRefs.isNotNull(formData.university)) {
      missingFields.push("University");
    }
    if (!dbRefs.isNotNull(formData.year_level)) {
      missingFields.push("Year Level");
    }

    if (missingFields.length > 0) {
      const errorMessage = `Please complete the following required fields:\n\n• ${missingFields.join(
        "\n• "
      )}`;
      alert(errorMessage);
      return;
    }

    const multipartForm = MultipartFormBuilder.new();
    const newProfile = {
      ...cleanFormData(),
      email,
    };
    multipartForm.from(newProfile);
    setIsRegistering(true);
    // @ts-ignore
    const result = await registerProfile(multipartForm.build());
    // @ts-ignore
    if (!result?.success) {
      const errorMsg =
        result?.error ||
        result?.message ||
        "Registration failed. Please check your information and try again.";
      alert(`Registration Error: ${errorMsg}`);
      setIsRegistering(false);
      return;
    }

    router.push("/verify");
    setIsRegistering(false);
  };

  // Update dropdown options
  useEffect(() => {
    const debouncedValidation = setTimeout(() => validateFormData(), 500);
    return () => clearTimeout(debouncedValidation);
  }, [formData]);

  // Data validators
  useEffect(() => {
    addValidator(
      "first_name",
      (name: string) => !name.trim() && `First name is not valid.`
    );
    addValidator(
      "last_name",
      (name: string) => !name.trim() && `Last name is not valid.`
    );
    addValidator(
      "email",
      (email: string) => email && !isValidEmail(email) && "Invalid email."
    );
    addValidator(
      "phone_number",
      (phone: string) =>
        phone &&
        !isValidPHNumber(phone) &&
        "Invalid PH number."
    );
    addValidator(
      "university",
      (university: string) =>
        dbRefs.isNotNull(university) &&
        !!dbRefs.get_university(university) &&
        "Invalid university."
    );
    addValidator(
      "year_level",
      (level: number) =>
        dbRefs.isNotNull(level) &&
        !!dbRefs.to_level_name(level) &&
        "Invalid year level."
    );
  }, []);

  return (
    <>
      <StoryBook>
        <Card>
          <div className="text-2xl tracking-tight font-bold text-gray-700 mb-4">
            Student Registration Form
          </div>
          <div className="mb-4 flex flex-col space-y-3">
            <div>
              <ErrorLabel value={formErrors.first_name} />
              <FormInput
                label="First Name"
                value={formData.first_name ?? ""}
                setter={fieldSetter("first_name")}
                maxLength={100}
              />
            </div>
            <div>
              <ErrorLabel value={formErrors.last_name} />
              <FormInput
                label="Last Name"
                value={formData.last_name ?? ""}
                setter={fieldSetter("last_name")}
                maxLength={100}
              />
            </div>
            <div>
              <ErrorLabel value={formErrors.phone_number} />
              <FormInput
                label="Phone Number"
                value={formData.phone_number ?? ""}
                setter={fieldSetter("phone_number")}
                maxLength={100}
              />
            </div>
            <FormDropdown
              label="University"
              options={dbRefs.universities.filter((u) =>
                dbRefs
                  .getUniversityFromDomain(email?.split("@")[1])
                  .includes(u.id)
              )}
              value={formData.university ?? ""}
              setter={fieldSetter("university")}
            />
            <FormDropdown
              label="Year Level"
              options={dbRefs.levels}
              value={formData.year_level ?? ""}
              setter={fieldSetter("year_level")}
            />
          </div>
          <div className="flex flex-col space-y-1 mb-2">
            <ErrorLabel value={formErrors.taking_for_credit} />
            <ErrorLabel value={formErrors.email} />
          </div>
          <div className="mb-4 flex flex-col space-y-3">
            <Card className="p-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="taking-for-credit"
                  checked={formData.taking_for_credit}
                  onCheckedChange={(checked) =>
                    setField("taking_for_credit", checked)
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="taking-for-credit"
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer flex-1"
                >
                  I am taking internships for school credit.
                </label>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) =>
                    setTermsAccepted(checked as boolean)
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="accept-terms"
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer flex-1"
                >
                  I have read and agree to the{" "}
                  <a
                    href="/TermsConditions.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/PrivacyPolicy.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>
            </Card>

            <Button
              onClick={register}
              disabled={!termsAccepted || isRegistering}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isRegistering ? "Registering..." : "Register"}
            </Button>
          </div>
        </Card>
      </StoryBook>
      <br />
      <br />
    </>
  );
};
