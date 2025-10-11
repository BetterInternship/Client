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
  FormInput,
} from "@/components/EditForm";
import { Card } from "@/components/ui/card";
import { ErrorLabel } from "@/components/ui/labels";
import { Button } from "@/components/ui/button";
import { isValidEmail, isValidPHNumber } from "@/lib/utils";
import { MultipartFormBuilder } from "@/lib/multipart-form";
import { Loader } from "@/components/ui/loader";

const [EmployerRegisterForm, useEmployerRegisterForm] =
  createEditForm<Employer>();

export default function RegisterPage() {
  const { register, isAuthenticated, redirectIfLoggedIn, loading } =
    useAuthContext();

  redirectIfLoggedIn();

  if (loading || isAuthenticated())
    return <Loader>Loading registration...</Loader>;

  return (
    <div className="flex-1 flex justify-center px-6 py-12 pt-12 overflow-y-auto">
      <div className="w-full max-w-2xl h-full">
        <EmployerRegisterForm data={{}}>
          <EmployerEditor registerProfile={register} />
        </EmployerRegisterForm>
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

  const register = async () => {
    // Validate required fields before submitting
    const missingFields = [];

    if (!formData.name || formData.name.trim().length < 3) {
      missingFields.push("Company name");
    }
    if (
      !additionalFields.contact_name ||
      additionalFields.contact_name.trim().length === 0
    ) {
      missingFields.push("Contact name");
    }
    if (!formData.phone_number || !isValidPHNumber(formData.phone_number)) {
      missingFields.push("Valid contact Philippine phone number");
    }
    if (!formData.email || !isValidEmail(formData.email)) {
      missingFields.push("Valid contact email");
    }
    if (!formData.website) {
      missingFields.push("Company website/LinkedIn");
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
      website: toURL(formData.website)?.toString() ?? null,
      accepts_non_university: formData.accepts_non_university ?? true, // default to true
      legal_entity_name: formData.legal_entity_name ?? formData.name,
      accepted_universities: `[${universities
        .map((u) => `"${u.id}"`)
        .join(",")}]`,
      contact_name: additionalFields.contact_name,
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
        "Please check your information and try again.";
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
      <Card>
        <div className="mb-4">
          <h2 className="text-3xl tracking-tighter font-bold text-gray-700">
            Employer Registration
          </h2>
        </div>
        <div className="mb-4 flex flex-col space-y-3">
          <div className="text-xl tracking-tight font-bold text-gray-700">
            Contact Person Information
          </div>
          <FormInput
            label="Name"
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
              label="Phone Number"
              value={formData.phone_number ?? ""}
              setter={fieldSetter("phone_number")}
            />
          </div>
          <div>
            <ErrorLabel value={formErrors.email} />
            <FormInput
              label="Email"
              value={formData.email ?? ""}
              setter={fieldSetter("email")}
            />
          </div>
          <div>
            <FormInput
              label="Company website/LinkedIn"
              value={formData.website ?? ""}
              setter={fieldSetter("website")} // invalid type
            />
          </div>
        </div>
        <div className="mb-2 text-xl tracking-tight font-bold text-gray-700">
          Company Info
        </div>
        <div className="mb-4 flex flex-col space-y-3">
          <div>
            <ErrorLabel value={formErrors.name} />
            <FormInput
              label="Company Name"
              value={formData.name ?? ""}
              setter={fieldSetter("name")}
              maxLength={100}
            />
          </div>
          <div>
            <FormInput
              label="Legal Entity Name (optional)"
              value={formData.legal_entity_name ?? ""}
              setter={fieldSetter("legal_entity_name")}
              required={false}
              maxLength={100}
            />
          </div>
          <FormInput
            label="Office City"
            value={formData.location ?? ""}
            setter={fieldSetter("location")}
            maxLength={100}
          />
        </div>
        <div className="flex items-start gap-3 mb-8">
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
        <div className="flex justify-between items-center w-full">
          <p className="text-sm text-gray-500">
            Already have an account? <a className="text-blue-600 hover:text-blue-800 underline font-medium" href="/login">Login here.</a>
          </p>
          <Button
            onClick={register}
            disabled={!additionalFields.terms_accepted || isRegistering}
          >
            {isRegistering ? "Registering..." : "Register"}
          </Button>
        </div>
      </Card>
    </>
  );
};
