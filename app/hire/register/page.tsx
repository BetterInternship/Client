"use client";

import { useEffect, useState } from "react";
import { useDbRefs } from "@/lib/db/use-refs";
import { useAuthContext } from "../authctx";
import { useRouter } from "next/navigation";
import { isValidRequiredURL, toURL } from "@/lib/utils/url-utils";
import { Employer } from "@/lib/db/db.types";
import {
  createEditForm,
  FormCheckbox,
  FormDatePicker,
  FormDropdown,
  FormInput,
} from "@/components/EditForm";
import { Card } from "@/components/ui/our-card";
import { ErrorLabel } from "@/components/ui/labels";
import { StoryBook } from "@/components/ui/storybook";
import { Button } from "@/components/ui/button";
import { isValidEmail, isValidPHNumber } from "@/lib/utils";
import { MultipartFormBuilder } from "@/lib/multipart-form";

const [EmployerRegisterForm, useEmployerRegisterForm] =
  createEditForm<Employer>();

export default function RegisterPage() {
  const { register } = useAuthContext();

  return (
    <div className="flex-1 flex justify-center px-6 py-12 pt-12 overflow-y-auto">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl tracking-tighter font-bold text-gray-700 mb-4">
            Employer Registration
          </h2>
        </div>

        <EmployerRegisterForm data={{}}>
          <EmployerEditor registerProfile={register} />
        </EmployerRegisterForm>
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

const EmployerEditor = ({
  registerProfile,
}: {
  registerProfile: (newProfile: Partial<Employer>) => Promise<any>;
}) => {
  const {
    formData,
    formErrors,
    setField,
    fieldSetter,
    addValidator,
    validateFormData,
    cleanFormData,
  } = useEmployerRegisterForm();
  interface AdditionalFields {
    contact_name: string;
    has_moa_with_dlsu: boolean;
    moa_start_date: number;
    moa_expires_at: number;
    terms_accepted: boolean;
  }
  const router = useRouter();
  const { industries, universities, get_university_by_name } = useDbRefs();
  const [isRegistering, setIsRegistering] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<AdditionalFields>(
    {} as AdditionalFields
  );
  const [moaValidationError, setMoaValidationError] = useState<string>("");

  // Function to validate MOA dates
  const validateMoaDates = () => {
    if (additionalFields.has_moa_with_dlsu) {
      const startDate = additionalFields.moa_start_date;
      const endDate = additionalFields.moa_expires_at;

      if (!startDate || !endDate) {
        setMoaValidationError("Both MOA start and end dates are required.");
        return false;
      }

      if (startDate === endDate) {
        setMoaValidationError("MOA start and end dates cannot be the same.");
        return false;
      }

      if (endDate < startDate) {
        setMoaValidationError(
          "MOA end date cannot be earlier than the start date."
        );
        return false;
      }
    }
    setMoaValidationError("");
    return true;
  };

  const register = async () => {
    // Validate MOA dates if MOA is enabled
    if (additionalFields.has_moa_with_dlsu && !validateMoaDates()) {
      alert(moaValidationError);
      return;
    }

    // Validate required fields before submitting
    const missingFields = [];

    if (!formData.name || formData.name.trim().length < 3) {
      missingFields.push("Company Name (Doing Business As)");
    }
    if (
      !formData.legal_entity_name ||
      formData.legal_entity_name.trim().length < 3
    ) {
      missingFields.push("Legal Entity Name");
    }
    if (!formData.website || !isValidRequiredURL(formData.website)) {
      missingFields.push("Valid Website URL");
    }
    if (!formData.industry) {
      missingFields.push("Industry");
    }
    if (!formData.description || formData.description.trim().length < 10) {
      missingFields.push("Company Description (minimum 10 characters)");
    }
    if (
      !additionalFields.contact_name ||
      additionalFields.contact_name.trim().length === 0
    ) {
      missingFields.push("Contact Name");
    }
    if (!formData.phone_number || !isValidPHNumber(formData.phone_number)) {
      missingFields.push("Valid Philippine Phone Number");
    }
    if (!formData.email || !isValidEmail(formData.email)) {
      missingFields.push("Valid Contact Email");
    }
    if (!additionalFields.terms_accepted) {
      missingFields.push("Terms & Conditions and Privacy Policy acceptance");
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
      website: toURL(formData.website)?.toString(),
      accepts_non_university: formData.accepts_non_university ?? true, // default to true
      accepted_universities: `[${universities
        .map((u) => `"${u.id}"`)
        .join(",")}]`,
      contact_name: additionalFields.contact_name,
      ...(additionalFields.has_moa_with_dlsu
        ? {
            moa: JSON.stringify([
              {
                // ! change when unis update
                university_id: get_university_by_name("DLSU - Manila")?.id,
                start_date: additionalFields.moa_start_date ?? 0,
                expires_at: additionalFields.moa_expires_at ?? 0,
              },
            ]),
          }
        : {}),
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

    alert("Email has been sent with password!");
    router.push("/login");
    setIsRegistering(false);
  };

  // Update dropdown options
  useEffect(() => {
    const debouncedValidation = setTimeout(() => validateFormData(), 500);
    return () => clearTimeout(debouncedValidation);
  }, [formData]);

  // Validate MOA dates when they change
  useEffect(() => {
    validateMoaDates();
  }, [
    additionalFields.has_moa_with_dlsu,
    additionalFields.moa_start_date,
    additionalFields.moa_expires_at,
  ]);

  // Data validators
  useEffect(() => {
    addValidator(
      "name",
      (name: string) => name && name.length < 3 && `Company Name is not valid.`
    );
    addValidator(
      "industry",
      (industry: string) => !industry && `Industry is required.`
    );
    addValidator(
      "description",
      (description: string) =>
        description && description.length < 10 && `Description is too short.`
    );
    addValidator(
      "legal_entity_name",
      (name: string) =>
        name && name.length < 3 && `Legal Entity Name is not valid.`
    );
    addValidator(
      "website",
      (link: string) =>
        link && !isValidRequiredURL(link) && "Invalid website link."
    );
    addValidator(
      "phone_number",
      (number: string) =>
        number && !isValidPHNumber(number) && "Invalid PH number."
    );
    addValidator(
      "email",
      (email: string) => email && !isValidEmail(email) && "Invalid email."
    );
  }, []);

  return (
    <>
      <StoryBook>
        <Card>
          <div className="text-2xl tracking-tight font-bold text-gray-700 mb-4">
            General Information
            <div className="text-lg opacity-50 font-normal">Step 1 of 3</div>
          </div>
          <div className="mb-4 flex flex-col space-y-3">
            <div>
              <ErrorLabel value={formErrors.name} />
              <FormInput
                label="Doing Business As"
                value={formData.name ?? ""}
                setter={fieldSetter("name")}
                maxLength={100}
              />
            </div>
            <div>
              <ErrorLabel value={formErrors.legal_entity_name} />
              <FormInput
                label="Legal Entity Name"
                value={formData.legal_entity_name ?? ""}
                setter={fieldSetter("legal_entity_name")}
                maxLength={100}
              />
            </div>
            <FormInput
              label="General Office Location"
              value={formData.location ?? ""}
              setter={fieldSetter("location")}
              maxLength={100}
            />
            <div>
              <ErrorLabel value={formErrors.website} />
              <FormInput
                label="Website"
                value={formData.website ?? ""}
                setter={fieldSetter("website")}
                maxLength={100}
              />
            </div>
            <FormDropdown
              label="Industry"
              options={industries}
              value={formData.industry ?? ""}
              setter={fieldSetter("industry")}
            />
          </div>
          <label className="text-xs text-gray-400 italic mb-1 block">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Let students know what you're all about..."
            className="w-full border border-gray-200 rounded-[0.25em] p-3 px-5 text-sm min-h-24 resize-none focus:border-opacity-70 focus:ring-transparent"
            maxLength={750}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.description || "").length}/750 characters
          </p>
        </Card>
        <Card>
          <div className="text-2xl tracking-tight font-bold text-gray-700 mb-4">
            Contact Person Information
            <div className="text-lg opacity-50 font-normal">Step 2 of 3</div>
          </div>
          <div className="mb-4 flex flex-col space-y-3">
            <FormInput
              label="Contact Name"
              value={additionalFields.contact_name ?? ""}
              maxLength={40}
              setter={(value) =>
                setAdditionalFields({
                  ...additionalFields,
                  contact_name: value,
                })
              }
            />
            <div>
              <ErrorLabel value={formErrors.phone_number} />
              <FormInput
                label="Contact Phone Number"
                value={formData.phone_number ?? ""}
                setter={fieldSetter("phone_number")}
              />
            </div>
            <div>
              <ErrorLabel value={formErrors.email} />
              <FormInput
                label="Contact Email"
                value={formData.email ?? ""}
                setter={fieldSetter("email")}
              />
            </div>
          </div>
          <Card className="border-warning p-4">
            <p className="font-normal opacity-80 text-sm italic text-warning">
              Login details will be sent to the contact's email address upon
              registration. Additional users can be added later if multiple
              people plan to be manage this employer account.
            </p>
          </Card>
          <div className="mt-3 text-xs text-gray-500 italic">
            Note: You can update all company information later in the Edit
            Company Profile page.
          </div>
        </Card>
        <Card>
          <div className="text-2xl tracking-tight font-bold text-gray-700 mb-4">
            Profile Agreements
            <div className="text-lg opacity-50 font-normal">Step 3 of 3</div>
          </div>
          <div className="flex flex-col space-y-1 mb-2">
            <ErrorLabel value={formErrors.accepts_non_university} />
            <ErrorLabel value={formErrors.email} />
          </div>
          <div className="mb-4 flex flex-col space-y-3">
            <Card className="p-3">
              <div className="flex flex-row items-center justify-start">
                <FormCheckbox
                  checked={formData.accepts_non_university ?? true}
                  setter={fieldSetter("accepts_non_university")}
                />
                <div className="text-sm text-gray-500 ml-3">
                  Accept Non-University Interns?
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex flex-row items-center justify-start">
                <FormCheckbox
                  checked={additionalFields.has_moa_with_dlsu}
                  setter={(checked) =>
                    setAdditionalFields({
                      ...additionalFields,
                      has_moa_with_dlsu: checked,
                    })
                  }
                />
                <div className="text-sm text-gray-500 ml-3">
                  Ongoing MOA with DLSU?
                </div>
              </div>
              {additionalFields.has_moa_with_dlsu && (
                <div className="mt-4">
                  {moaValidationError && (
                    <ErrorLabel value={moaValidationError} />
                  )}
                  <div className="flex flex-row space-x-2">
                    <FormDatePicker
                      label={"MOA Start Date"}
                      date={additionalFields.moa_start_date}
                      setter={(date) =>
                        setAdditionalFields({
                          ...additionalFields,
                          moa_start_date: date ?? 0,
                        })
                      }
                    />
                    <FormDatePicker
                      label={"MOA Expiry Date"}
                      date={additionalFields.moa_expires_at}
                      setter={(date) =>
                        setAdditionalFields({
                          ...additionalFields,
                          moa_expires_at: date ?? 0,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-3">
              <div className="flex items-start gap-3">
                <FormCheckbox
                  id="accept-terms"
                  checked={additionalFields.terms_accepted}
                  setter={(checked) =>
                    setAdditionalFields({
                      ...additionalFields,
                      terms_accepted: checked,
                    })
                  }
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
              disabled={!additionalFields.terms_accepted || isRegistering}
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
