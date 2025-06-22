"use client";

import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Edit2,
  Upload,
  User,
  Phone,
  ExternalLink,
  FileText,
  Eye,
  Calendar,
  Award,
  Github,
  Hash,
  Camera,
  GraduationCap,
} from "lucide-react";
import { useProfile } from "@/hooks/use-api";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../../lib/ctx-auth";
import { useModal } from "@/hooks/use-modal";
import { useRefs } from "@/lib/db/use-refs";
import { useAppContext } from "@/lib/ctx-app";
import { PublicUser } from "@/lib/db/db.types";
import { useFormData } from "@/lib/form-data";
import {
  EditableGroupableRadioDropdown,
  EditableInput,
} from "@/components/ui/editable";
import { UserPropertyLabel, UserLinkLabel } from "@/components/ui/labels";
import { DropdownGroup } from "@/components/ui/dropdown";
import { user_service } from "@/lib/api";
import { useClientDimensions } from "@/hooks/use-dimensions";
import { FileUploadFormBuilder } from "@/lib/multipart-form";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { Button } from "@/components/ui/button";
import { useFile } from "@/hooks/use-file";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { is_authenticated } = useAuthContext();
  const { profile, error, updateProfile } = useProfile();
  const { client_width, client_height } = useClientDimensions();
  const {
    colleges,
    levels,
    to_college_name,
    to_level_name,
    get_college_by_name,
    get_level_by_name,
  } = useRefs();
  const [isEditing, setIsEditing] = useState(false);
  const { url: resume_url, sync: sync_resume_url } = useFile({
    fetch: user_service.get_my_resume_url,
    route: "/users/me/resume",
  });
  const { url: pfp_url, sync: sync_pfp_url } = useFile({
    fetch: user_service.get_my_pfp_url,
    route: "/users/me/pic",
  });
  const { form_data, set_field, set_fields, field_setter } = useFormData<
    PublicUser & {
      college_name: string | null;
      year_level_name: string | null;
    }
  >();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const {
    open: open_employer_modal,
    close: close_employer_modal,
    Modal: EmployerModal,
  } = useModal("employer-modal");
  const {
    open: open_resume_modal,
    close: close_resume_modal,
    Modal: ResumeModal,
  } = useModal("resume-modal");

  const { is_mobile } = useAppContext();
  const router = useRouter();

  // File input refs
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const profilePictureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sync_pfp_url();
  }, []);

  // File upload handlers
  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF document");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("File size must be less than 3MB");
      return;
    }

    try {
      setUploading(true);
      const form = FileUploadFormBuilder.new("resume");
      form.file(file);
      // @ts-ignore
      const result = await user_service.update_my_resume(form.build());
      alert("Resume uploaded successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to upload resume");
    } finally {
      setUploading(false);
      if (resumeInputRef.current) {
        resumeInputRef.current.value = "";
      }
    }
  };

  const handlePreviewResume = async () => {
    await sync_resume_url();
    open_resume_modal();
  };

  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPEG, PNG, GIF, or WebP image");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    try {
      setUploading(true);
      const form = FileUploadFormBuilder.new("pfp");
      form.file(file);
      // @ts-ignore
      const result = await user_service.update_my_pfp(form.build());
      if (!result.success) {
        alert("Could not upload profile picture.");
        return;
      }
      await sync_pfp_url();
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

  useEffect(() => {
    if (!is_authenticated()) {
      router.push("/login");
    }
  }, [is_authenticated(), router]);

  useEffect(() => {
    if (profile)
      set_fields({
        ...(profile as PublicUser),
        college_name: to_college_name(profile.college),
        year_level_name: to_level_name(profile.year_level),
      });
  }, [profile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const dataToSend = {
        full_name: form_data.full_name ?? "",
        phone_number: form_data.phone_number ?? "",
        college: get_college_by_name(form_data.college_name)?.id ?? undefined,
        year_level:
          get_level_by_name(form_data.year_level_name)?.id ?? undefined,
        portfolio_link: form_data.portfolio_link ?? "",
        github_link: form_data.github_link ?? "",
        linkedin_link: form_data.linkedin_link ?? "",
        calendly_link: form_data.calendly_link ?? "",
        bio: form_data.bio ?? "",
        taking_for_credit: form_data.taking_for_credit,
        linkage_officer: form_data.linkage_officer ?? "",
      };
      await updateProfile(dataToSend);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) set_fields({ ...profile });
    setIsEditing(false);
  };

  if (!is_authenticated()) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load profile: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl py-6">
          {/* Compact Header with Avatar, Name and Actions */}
          <div className="flex items-start gap-6 mb-8">
            <div className="relative flex-shrink-0">
              <Avatar className="h-20 w-20">
                {profile.profile_picture && pfp_url ? (
                  <AvatarImage src={pfp_url} alt="Profile picture" />
                ) : (
                  <AvatarFallback className="text-lg font-semibold">
                    {profile.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
                onClick={() => profilePictureInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold font-heading mb-1">{profile.full_name}</h1>
              <p className="text-muted-foreground text-sm">
                {profile.college && to_college_name(profile.college)} 
                {profile.college && profile.year_level && " • "} 
                {profile.year_level && to_level_name(profile.year_level)}
              </p>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => open_employer_modal()}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => (
                    setIsEditing(true),
                    set_fields({
                      ...profile,
                      college_name: to_college_name(profile.college),
                      year_level_name: to_level_name(profile.year_level),
                    })
                  )}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content - Personal Info and Links */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  {/* Personal Information Section */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Personal Information
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                        <EditableInput
                          is_editing={isEditing}
                          value={form_data.full_name}
                          setter={field_setter("full_name")}
                        >
                          <UserPropertyLabel />
                        </EditableInput>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                        <EditableInput
                          is_editing={isEditing}
                          value={form_data.phone_number}
                          setter={field_setter("phone_number")}
                        >
                          <UserPropertyLabel />
                        </EditableInput>
                      </div>

                      <DropdownGroup>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">College</label>
                          <EditableGroupableRadioDropdown
                            is_editing={isEditing}
                            name="college"
                            value={form_data.college_name}
                            setter={field_setter("college_name")}
                            options={["Not specified", ...colleges.map((c) => c.name)]}
                          >
                            <UserPropertyLabel />
                          </EditableGroupableRadioDropdown>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Year Level</label>
                          <EditableGroupableRadioDropdown
                            is_editing={isEditing}
                            name="year_level"
                            value={form_data.year_level_name}
                            setter={field_setter("year_level_name")}
                            options={["Not specified", ...levels.map((l) => l.name)]}
                          >
                            <UserPropertyLabel />
                          </EditableGroupableRadioDropdown>
                        </div>
                      </DropdownGroup>

                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Internship for Credit</label>
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={form_data.taking_for_credit ?? false}
                                onCheckedChange={(value) => {
                                  set_fields({
                                    taking_for_credit: !!value,
                                    linkage_officer: !!value ? form_data.linkage_officer : "",
                                  });
                                }}
                              />
                              <span className="text-sm">Taking for credit</span>
                            </div>
                            {form_data.taking_for_credit && (
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Linkage Officer</label>
                                <EditableInput
                                  is_editing={isEditing}
                                  value={form_data.linkage_officer}
                                  setter={field_setter("linkage_officer")}
                                >
                                  <UserPropertyLabel />
                                </EditableInput>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            {profile.taking_for_credit ? (
                              <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 text-green-700">
                                  <Award className="h-4 w-4" />
                                  <span className="text-sm font-medium">Taking for credit</span>
                                </div>
                                {profile.linkage_officer && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Linkage Officer</label>
                                    <UserPropertyLabel value={profile.linkage_officer} />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic text-sm">Not taking for credit</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Professional Links Section */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-green-600" />
                      Professional Links
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Portfolio Website</label>
                        <EditableInput
                          is_editing={isEditing}
                          value={form_data.portfolio_link}
                          setter={field_setter("portfolio_link")}
                          placeholder="https://yourportfolio.com"
                        >
                          <UserLinkLabel />
                        </EditableInput>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">GitHub Profile</label>
                        <EditableInput
                          is_editing={isEditing}
                          value={form_data.github_link}
                          setter={field_setter("github_link")}
                          placeholder="https://github.com/yourusername"
                        >
                          <UserLinkLabel />
                        </EditableInput>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">LinkedIn Profile</label>
                        <EditableInput
                          is_editing={isEditing}
                          value={form_data.linkedin_link}
                          setter={field_setter("linkedin_link")}
                          placeholder="https://linkedin.com/in/yourusername"
                        >
                          <UserLinkLabel />
                        </EditableInput>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Calendly Link</label>
                        <EditableInput
                          is_editing={isEditing}
                          value={form_data.calendly_link}
                          setter={field_setter("calendly_link")}
                          placeholder="https://calendly.com/yourusername"
                        >
                          <UserLinkLabel />
                        </EditableInput>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Resume and About */}
            <div className="space-y-6">
              {/* Resume Section */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-600" />
                    Resume
                  </h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={handleResumeUpload}
                    accept=".pdf"
                    style={{ display: "none" }}
                  />
                  <input
                    type="file"
                    ref={profilePictureInputRef}
                    onChange={handleProfilePictureUpload}
                    accept="image/*"
                    style={{ display: "none" }}
                  />

                  {profile.resume ? (
                    <div className="border border-green-200 bg-green-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Uploaded</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviewResume}
                            className="h-7 px-2 text-green-600 border-green-600 hover:bg-green-100"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resumeInputRef.current?.click()}
                            disabled={uploading}
                            className="h-7 px-2 text-blue-600 border-blue-600 hover:bg-blue-100"
                          >
                            <Upload className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <FileText className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {uploading ? "Uploading..." : "No resume uploaded"}
                      </p>
                      <Button
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={uploading}
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {uploading ? "Uploading..." : "Upload"}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">PDF up to 3MB</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* About Section */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    About
                  </h3>
                </CardHeader>
                <CardContent className="pt-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={form_data.bio || ""}
                        onChange={(e) => set_field("bio", e.target.value)}
                        placeholder="Tell us about yourself, your interests, goals, and what makes you unique..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-24 resize-none focus:border-blue-500 focus:ring-blue-500"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {(form_data.bio || "").length}/500 characters
                      </p>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm leading-relaxed">
                        {profile.bio || (
                          <span className="text-muted-foreground italic">
                            No bio provided. Click "Edit" to add information about yourself.
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {resume_url.length && (
        <ResumeModal>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold px-6 pt-2">Resume Preview</h1>
            <div className="px-6 pb-6">
              <iframe
                allowTransparency={true}
                className="w-full border border-gray-200 rounded-lg"
                style={{
                  width: "100%",
                  height: client_height * 0.75,
                  minHeight: "600px",
                  maxHeight: "800px",
                  background: "#FFFFFF",
                }}
                src={resume_url + "#toolbar=0&navpanes=0&scrollbar=0"}
              >
                Resume could not be loaded.
              </iframe>
            </div>
          </div>
        </ResumeModal>
      )}

      <EmployerModal>
        <ApplicantModalContent 
          applicant={profile} 
          open_resume_modal={async () => {
            close_employer_modal();
            await sync_resume_url();
            open_resume_modal();
          }}
        />
      </EmployerModal>
    </>
  );
}