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
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";
import Link from "next/link";
import { TriangleAlert, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { HeaderIcon, HeaderText } from "@/components/ui/text";

const [EmployerRegisterForm, useEmployerRegisterForm] =
  createEditForm<Employer>();

export default function RegisterPage() {
  const { register, isAuthenticated, redirectIfLoggedIn, loading } =
    useAuthContext();

  redirectIfLoggedIn();

  if (loading || isAuthenticated())
    return <Loader>Loading registration...</Loader>;

  const { isMobile } = useAppContext();

  return (
    <div className={cn(
      "flex-1 flex justify-center py-12 pt-12 overflow-y-auto",
      isMobile
        ? "px-2"
        : "px-6"
    )}>
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
  const { isMobile } = useAppContext();
  const router = useRouter();
  const { industries, universities, get_university_by_name } = useDbRefs();
  const [isRegistering, setIsRegistering] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<AdditionalFields>(
    {} as AdditionalFields
  );
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const register = async () => {
    // Validate required fields before submitting
    const newMissing: string[] = [];

    if (!formData.legal_entity_name || formData.legal_entity_name.trim().length < 3) {
      newMissing.push("Legal entity name");
    }
    if (
      !additionalFields.contact_name ||
      additionalFields.contact_name.trim().length === 0
    ) {
      newMissing.push("Contact name");
    }
    if (!formData.phone_number || !isValidPHNumber(formData.phone_number)) {
      newMissing.push("Phone number");
    }
    if (!formData.email || !isValidEmail(formData.email)) {
      newMissing.push("Contact email");
    }
    if (!formData.website) {
      newMissing.push("Company website");
    }
    if (!formData.location) {
      newMissing.push("Main office city");
    }
    if (!additionalFields.terms_accepted) {
      newMissing.push("Terms");
    }

    setMissingFields(newMissing);

    if (newMissing.length > 0) {
      return;
    }

    const multipartForm = MultipartFormBuilder.new();
    const newProfile = {
      ...cleanFormData(),
      website: toURL(formData.website)?.toString() ?? null,
      accepts_non_university: formData.accepts_non_university ?? true, // default to true
      name: formData.name ?? formData.legal_entity_name,
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

    router.push("/login?status=success");
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
    addValidator(
      "location",
      (location: string) => !location && `Provide your main office's location.`
    );
  }, []);

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
          animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full"
        >
          <Card>
            <div className="flex flex-row items-center gap-3 mb-2">
              <HeaderIcon icon={User} />
              <HeaderText>Register</HeaderText>
            </div>
            {missingFields.length > 0 && (
              <div className={cn(
                "flex gap-2 items-center mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/50 rounded-[0.33em]",
                isMobile ? "flex-col items-start" : ""
              )}>
                <TriangleAlert size={isMobile ? 24 : 20} />
                <span className="text-sm justify-center">
                  You need to provide values for these fields:
                  <ul>
                    {missingFields.map((field) => (
                      <li className="text-sm list-disc list-inside">
                        {field}
                      </li>
                    ))}
                  </ul>
                </span>
              </div>
            )}
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
                className={cn(
                  missingFields.find((field) => field === "Contact name") ? "border-destructive" : ""
                )}
              />
              <div>
                <FormInput
                  label="Phone Number"
                  value={formData.phone_number ?? ""}
                  setter={fieldSetter("phone_number")}
                  className={cn(
                    missingFields.find((field) => field === "Phone number") ? "border-destructive" : ""
                  )}
                />
                <ErrorLabel value={formErrors.phone_number} />
              </div>
              <div>
                <FormInput
                  label="Email"
                  value={formData.email ?? ""}
                  setter={fieldSetter("email")}
                  className={cn(
                    missingFields.find((field) => field === "Contact email") ? "border-destructive" : ""
                  )}
                />
                <ErrorLabel value={formErrors.email} />
              </div>
              <div>
                <FormInput
                  label="Company website/LinkedIn"
                  value={formData.website ?? ""}
                  setter={fieldSetter("website")} // invalid type
                  className={cn(
                    missingFields.find((field) => field === "Company website") ? "border-destructive" : ""
                  )}
                />
              </div>
            </div>
            <div className="mb-2 text-xl tracking-tight font-bold text-gray-700">
              Company Info
            </div>
            <div className="mb-4 flex flex-col space-y-3">
              <div>
                <FormInput
                  label="Legal Entity Name"
                  value={formData.legal_entity_name ?? ""}
                  setter={fieldSetter("legal_entity_name")}
                  required={true}
                  maxLength={100}
                  className={cn(
                    missingFields.find((field) => field === "Legal entity name") ? "border-destructive" : ""
                  )}
                />
                <ErrorLabel value={formErrors.legal_entity_name} />
              </div>
              <div>
                <FormInput
                  label="Company Name (optional)"
                  value={formData.name ?? ""}
                  setter={fieldSetter("name")}
                  required={false}
                  maxLength={100}
                />
              </div>
              <FormInput
                label="Office City"
                value={formData.location ?? ""}
                setter={fieldSetter("location")}
                maxLength={100}
                className={cn(
                  missingFields.find((field) => field === "Main office city") ? "border-destructive" : ""
                )}
              />
            </div>
            <div className="flex items-start gap-3 mb-8">
              <FormCheckbox
                id="accept-terms"
                checked={additionalFields.terms_accepted}
                setter={(checked: boolean) =>
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
            <div className="flex justify-between items-center w-full pb-2">
              <span className="text-sm text-gray-500">
                Already have an account? <a className="text-blue-600 hover:text-blue-800 underline font-medium" href="/login">Log in here.</a>
              </span>
              <Button
                onClick={register}
                disabled={!additionalFields.terms_accepted || isRegistering}
              >
                {isRegistering ? "Registering..." : "Register"}
              </Button>
            </div>
            <span className="text-muted-foreground text-sm">
              Need help? Contact us at <a href="tel://09276604999" className="text-blue-600 hover:text-blue-800 underline font-medium">0927 660 4999</a> or on <a href="viber://add?number=639276604999" className="text-blue-600 hover:text-blue-800 underline font-medium">Viber</a>.
            </span>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
