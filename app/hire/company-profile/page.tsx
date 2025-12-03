"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Camera, Edit2 } from "lucide-react";
import ContentLayout from "@/components/features/hire/content-layout";
import { useProfile } from "@/hooks/use-employer-api";
import { Button } from "@/components/ui/button";
import { useDbMoa } from "@/lib/db/use-bi-moa";
import { useDbRefs } from "@/lib/db/use-refs";
import { Badge, BoolBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Employer } from "@/lib/db/db.types";
import { cn, isValidEmail, isValidPHNumber, isValidUUID } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";
import { Divider } from "@/components/ui/divider";
import { isValidOptionalURL, openURL, toURL } from "@/lib/utils/url-utils";
import { ErrorLabel, LabeledProperty } from "@/components/ui/labels";
import {
  createEditForm,
  FormCheckbox,
  FormDropdown,
  FormInput,
} from "@/components/EditForm";
import { MyEmployerPfp } from "@/components/shared/pfp";
import { FileUploadFormBuilder } from "@/lib/multipart-form";
import { EmployerService } from "@/lib/api/services";

const [ProfileEditForm, useProfileEditForm] = createEditForm<Employer>();

export default function CompanyProfile() {
  const { loading, error, data: profile, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { check } = useDbMoa();
  const { get_university_by_name } = useDbRefs();
  const { to_industry_name } = useDbRefs();
  const profileEditorRef = useRef<{ save: () => Promise<boolean> }>(null);
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = async () => {
      if (img.width !== img.height) {
        alert("Image must be square!");
        return;
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a JPEG, PNG, or WebP image");
        return;
      }
      if (file.size > (1024 * 1024) / 4) {
        alert("Image size must be less than 0.25MB");
        return;
      }
      try {
        setUploading(true);
        const form = FileUploadFormBuilder.new("logo");
        form.file(file);
        // @ts-ignore
        const result = await EmployerService.updateMyPfp(form.build());
        if (!result.success) {
          alert("Could not upload profile picture.");
          return;
        }
        alert("Profile picture uploaded successfully!");
      } catch (error: any) {
        alert(error.message || "Failed to upload profile picture");
      } finally {
        setUploading(false);
        if (profilePictureInputRef.current) {
          profilePictureInputRef.current.value = "";
        }
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const { isMobile } = useAppContext();
  return (
    profile && (
      <ContentLayout>
        <div className={cn(
          "max-w-[600px] bg-background py-4 rounded-lg border-gray-300 border",
          isMobile
            ? "px-2"
            : "px-8"
        )}>
          <header className="flex flex-col items-start gap-2 flex-1 w-full m-auto ">
            <div className="relative flex-shrink-0">
              <MyEmployerPfp size={isMobile
                ? "20"
                : "28"
              } />
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-[0.5em] right-[0.5em] h-6 w-6 sm:h-7 sm:w-7 rounded-full"
                onClick={() => profilePictureInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="h-3 w-3" />
              </Button>
              <input
                type="file"
                ref={profilePictureInputRef}
                onChange={handleProfilePictureUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <h1 className="text-2xl font-bold font-heading">
                  {profile.name}
                </h1>
                <h2 className="text-sm font-normal text-gray-400">
                  Legal Name: {profile.legal_entity_name}
                </h2>
              </div>
              <div className="text-muted-foreground text-sm">
                <div className="flex flex-row gap-1">
                  <BoolBadge
                    state={check(
                      profile?.id ?? "",
                      get_university_by_name("DLSU - Manila")?.id ?? "",
                    )}
                    onValue="Active DLSU MOA"
                    offValue="No DLSU MOA"
                  />
                  <BoolBadge
                    state={profile.is_verified}
                    onValue="Verified"
                    offValue="Not Verified"
                  />
                  {to_industry_name(profile.industry, null) && (
                    <Badge>{to_industry_name(profile.industry)}</Badge>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-row flex-wrap gap-2 flex-shrink-0 mt-4">
                {isEditing ? (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        setSaving(true);
                        setSaveError(null);
                        const success = await profileEditorRef.current?.save();
                        setSaving(false);
                        if (success) {
                          setIsEditing(false);
                        } else {
                          setSaveError(
                            "Please fix the errors in the form before saving.",
                          );
                        }
                      }}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </header>

          <div className="w-full max-w-[600px] m-auto space-y-2 mt-8 ">
            {!isEditing && <ProfileDetails profile={profile} />}
            {isEditing && (
              <ProfileEditForm data={profile}>
                <ProfileEditor
                  updateProfile={updateProfile}
                  ref={profileEditorRef}
                />
                {saveError && (
                  <p className="text-red-600 text-sm mt-4 mb-2 text-center">
                    {saveError}
                  </p>
                )}
              </ProfileEditForm>
            )}
          </div>
        </div>
      </ContentLayout>
    )
  );
}

const ProfileDetails = ({ profile }: { profile: Employer }) => {
  const { isMobile } = useAppContext();

  return (
    <>
      <Card className="bg-muted/50 p-3 px-5 overflow-hidden text-wrap">
        <p className="text-sm leading-relaxed">
          {profile.description || (
            <span className="text-muted-foreground italic">
              No description provided. Click "Edit" to add information about the
              company.
            </span>
          )}
        </p>
      </Card>

      <Card className="px-5">
        <div
          className={cn(
            isMobile
              ? "grid grid-cols-1 space-y-5 mb-8"
              : "grid grid-cols-2 gap-y-5",
          )}
        >
          <LabeledProperty label="Email" value={profile.email} />
          <LabeledProperty label="Phone Number" value={profile.phone_number} />
          <LabeledProperty label="Location" value={profile.location} />
          <LabeledProperty label="Website" value={profile.website} />
        </div>
        <Divider />
        <div
          className={cn(
            "flex flex-row gap-2 flex-wrap"
          )}
        >
          <ProfileLinkBadge title="Company Email" link={profile.email} />
          <ProfileLinkBadge title="Company Website" link={profile.website} />
          <ProfileLinkBadge
            title="Company Number"
            link={profile.phone_number}
          />
        </div>
      </Card>
      <br />
    </>
  );
};

const ProfileLinkBadge = ({
  title,
  link,
}: {
  title: string;
  link?: string | null;
}) => {
  return (
    <Button
      variant="ghost"
      className="p-0 h-6 w-fit"
      disabled={!link}
      onClick={() => openURL(link)}
    >
      <BoolBadge state={!!link} onValue={title} offValue={title} />
    </Button>
  );
};

const ProfileEditor = forwardRef<
  { save: () => Promise<boolean> },
  {
    updateProfile: (
      updatedProfile: Partial<Employer>,
    ) => Promise<Partial<Employer>>;
  }
>(({ updateProfile }, ref) => {
  const {
    formData,
    formErrors,
    setField,
    fieldSetter,
    addValidator,
    validateFormData,
    cleanFormData,
  } = useProfileEditForm();
  const { industries } = useDbRefs();

  useImperativeHandle(ref, () => ({
    save: async () => {
      validateFormData();
      const hasErrors = Object.values(formErrors).some((err) => !!err);
      if (hasErrors) {
        return false;
      }
      try {
        const updatedProfile = {
          ...cleanFormData(),
          website: toURL(formData.website)?.toString(),
          industry: isValidUUID(formData.industry ?? "")
            ? formData.industry
            : undefined,
        };
        await updateProfile(updatedProfile);
        return true;
      } catch (error) {
        console.error("Failed to update profile:", error);
        alert("Failed to update profile. Please try again.");
        return false;
      }
    },
  }));

  // Update dropdown options
  useEffect(() => {
    const debouncedValidation = setTimeout(() => validateFormData(), 500);
    return () => clearTimeout(debouncedValidation);
  }, [formData]);

  // Data validators
  useEffect(() => {
    addValidator(
      "name",
      (name: string) => !name.trim() && "Invalid business name.",
    );
    addValidator(
      "legal_entity_name",
      (name: string) => !name.trim() && "Invalid legal entity name.",
    );
    addValidator(
      "email",
      (email: string) => !isValidEmail(email) && "Invalid Philippine number.",
    );
    addValidator(
      "website",
      (link: string) => !isValidOptionalURL(link) && "Invalid website link.",
    );
  }, []);

  return (
    <>
      <Card>
        <div className="text-xl tracking-tight font-medium text-gray-700 mb-4">
          About
        </div>
        <div className="flex flex-col space-y-1 mb-2">
          <ErrorLabel value={formErrors.name} />
        </div>
        <div className={"mb-4 flex flex-col space-y-3"}>
          <FormInput
            label="Company Name"
            value={formData.name ?? ""}
            setter={fieldSetter("name")}
            maxLength={100}
          />
          <FormInput
            label="Legal Entity Name"
            value={formData.legal_entity_name ?? ""}
            setter={fieldSetter("legal_entity_name")}
            maxLength={100}
          />
          <FormInput
            label="Location"
            value={formData.location ?? ""}
            setter={fieldSetter("location")}
            maxLength={100}
            required={false}
          />
          <FormDropdown
            label="Industry"
            value={formData.industry ?? ""}
            options={industries.sort((a, b) => a.name.localeCompare(b.name))}
            setter={fieldSetter("industry")}
            required={false}
          />
        </div>
        <label className="text-xs text-gray-400 italic mb-1 block">
          Description
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Let applicants know what they're in for..."
          className="w-full border border-gray-200 rounded-[0.25em] p-3 px-5 text-sm min-h-24 resize-none focus:border-opacity-70 focus:ring-transparent"
          required={false}
          maxLength={750}
        />
        <p className="text-xs text-muted-foreground text-right">
          {(formData.description || "").length}/750 characters
        </p>
        <div className="text-xl tracking-tight font-medium text-gray-700 mb-4">
          Contact Information
        </div>
        <div className="mb-3">
          <ErrorLabel value={formErrors.email} />
          <FormInput
            label="Company Email"
            value={formData.email ?? ""}
            setter={fieldSetter("email")}
          />
        </div>
        <div className="mb-3">
          <ErrorLabel value={formErrors.phone_number} />
          <FormInput
            label="Phone Number"
            value={formData.phone_number ?? ""}
            setter={fieldSetter("phone_number")}
            required={false}
          />
        </div>
        <div className="mb-3">
          <ErrorLabel value={formErrors.website} />
          <FormInput
            label="Website"
            value={formData.website ?? ""}
            setter={fieldSetter("website")}
            required={false}
          />
        </div>
        {/* <div className="text-xl tracking-tight font-medium text-gray-700 mt-8">
          Miscellaneous
        </div>
        <div className="mb-3">
          <ErrorLabel value={formErrors.website} />
          <div className="flex flex-row items-center justify-start my-4">
            <FormCheckbox
              checked={formData.accepts_non_university}
              setter={fieldSetter("accepts_non_university")}
            />
            <div className="text-sm text-gray-500 ml-3">
              Accept students outside of DLSU?
            </div>
          </div>
        </div> */}
      </Card>
      <br />
      <br />
    </>
  );
});
