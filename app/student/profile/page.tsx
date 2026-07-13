"use client";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { useProfileData } from "@/lib/api/student.data.api";
import { useAuthContext } from "../../../lib/ctx-auth";
import { useModal } from "@/hooks/use-modal";
import { PublicUser, Resume } from "@/lib/db/db.types";
import { UserService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { useFile, useFileUpload } from "@/hooks/use-file";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { PFP_UPDATED_EVENT } from "@/components/shared/pfp";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";
import { useBlockPageRefreshEffect } from "@/hooks/use-refresh-block";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { ProfileAccordion } from "@/components/features/student/profile/ProfileAccordion";
import {
  ProfileEditForm,
  ProfileEditor,
} from "@/components/features/student/profile/ProfileEditor";
import { ProfileHeaderCard } from "@/components/features/student/profile/ProfileHeaderCard";
import type {
  ProfileResumeManager,
  ProfileSectionKey,
} from "@/components/features/student/profile/profile-types";
import useModalRegistry from "@/components/modals/modal-registry";
import bg2 from "../../../public/bg2.png";

export default function ProfilePage() {
  const { redirectIfNotLoggedIn } = useAuthContext();
  const profile = useProfileData();
  const profileActions = useProfileActions();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  const [isRenamingResume, setIsRenamingResume] = useState(false);
  const [isSettingDefaultResume, setIsSettingDefaultResume] = useState(false);
  const [openProfileSections, setOpenProfileSections] = useState<
    ProfileSectionKey[]
  >(["resume"]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: (resumeId: string) => UserService.getMyResumeURL(resumeId),
    route: (resumeId: string) => `/users/me/resume/${resumeId}`,
  });
  const resumes = useQuery({
    queryKey: ["my-resumes"],
    queryFn: () => UserService.getMyResumes(),
  });

  const maxResumesEnv = Number(process.env.NEXT_PUBLIC_MAX_RESUMES_ALLOWED);
  const maxResumesAllowed = Number.isFinite(maxResumesEnv) ? maxResumesEnv : 5;
  const resumeCount = resumes.data?.resumes?.length ?? 0;
  const atResumeLimit = resumeCount >= maxResumesAllowed;

  // Modals
  const { open: openResumeModal, Modal: ResumeModal } =
    useModal("resume-modal");

  const profileEditorRef = useRef<{ save: () => Promise<boolean> }>(null);
  const queryClient = useQueryClient();
  const modalRegistry = useModalRegistry();

  const openResumePreview = async (resumeId: string) => {
    await syncResumeURL(resumeId);
    openResumeModal();
  };

  const onRenameResume = async (resumeId: string, label: string) => {
    if (!resumeId) {
      toast.error("Resume not found.");
      return false;
    }

    const nextLabel = label.trim();
    if (!nextLabel) {
      toast.error("Resume label is required.");
      return false;
    }

    setIsRenamingResume(true);
    try {
      const result = await UserService.updateMyResume(resumeId, nextLabel);
      if (!result?.success) {
        const errorMessage =
          (result as { error?: string })?.error ||
          result?.message ||
          "Failed to rename resume.";
        toast.error(errorMessage, toastPresets.destructive);
        return false;
      }

      toast.success("Resume renamed successfully.", toastPresets.success);
      void resumes.refetch();
      void queryClient.invalidateQueries({
        queryKey: ["my-profile"],
      });
      return true;
    } catch (error) {
      toast.error("Resume could not be renamed. Try again.");
      return false;
    } finally {
      setIsRenamingResume(false);
    }
  };

  const onSetDefaultResume = async (
    resumeId: string,
    options: { silent?: boolean } = {},
  ) => {
    if (!resumeId) return false;

    setIsSettingDefaultResume(true);
    try {
      const result = await UserService.setDefaultResume(resumeId);
      if (!result?.success) {
        if (!options.silent) {
          toast.error(
            (result as { error?: string })?.error ||
              result?.message ||
              "Failed to set default resume.",
            toastPresets.destructive,
          );
        }
        return false;
      }

      await resumes.refetch();
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      if (!options.silent) {
        toast.success("Default resume updated.", toastPresets.success);
      }
      return true;
    } catch {
      if (!options.silent) toast.error("Default resume could not be updated.");
      return false;
    } finally {
      setIsSettingDefaultResume(false);
    }
  };

  const onDeleteResume = (resume: Resume) => {
    if (!resume.id) {
      toast.error("Resume not found.");
      return;
    }

    modalRegistry.deleteResume.open({
      resume,
      isProcessing: isDeletingResume,
      onConfirm: () => {
        void (async () => {
          setIsDeletingResume(true);
          try {
            const result = await UserService.deleteMyResume(resume.id);
            if (!result?.success) {
              const errorMessage =
                (result as { error?: string })?.error ||
                result?.message ||
                "Failed to delete resume.";
              toast.error(errorMessage, toastPresets.destructive);
              return;
            }

            modalRegistry.deleteResume.close();
            toast.success("Resume deleted successfully.", toastPresets.success);
            void resumes.refetch();
            void queryClient.invalidateQueries({
              queryKey: ["my-profile"],
            });
          } catch (error) {
            toast.error("Resume could not be deleted. Try again.");
          } finally {
            setIsDeletingResume(false);
          }
        })();
      },
    });
  };

  redirectIfNotLoggedIn();

  const {
    fileInputRef: pfpFileInputRef,
    upload: pfpUpload,
    isUploading: pfpIsUploading,
  } = useFileUpload({
    uploader: (file: FormData) => UserService.updateMyPfp(file),
    filename: "pfp",
    silent: true,
  });

  const data = profile.data as PublicUser | undefined;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("edit") === "true") setIsEditing(true);

    if (searchParams.has("discord")) {
      void queryClient.invalidateQueries({ queryKey: ["discord-link"] });
      setOpenProfileSections((sections) =>
        sections.includes("connected-accounts")
          ? sections
          : [...sections, "connected-accounts"],
      );
    }
  }, [queryClient]);

  const handleCancelEditing = () => {
    setSaveError(null);
    setSaving(false);
    setIsEditing(false);
  };

  const handleSaveEditing = async () => {
    setSaving(true);
    setSaveError(null);
    const success = await profileEditorRef.current?.save();
    setSaving(false);
    if (success) {
      setIsEditing(false);
      toast.success("Profile saved successfully.", toastPresets.success);
    } else {
      setSaveError("Please fix the errors in the form before saving.");
    }
  };

  const editActions = (
    <div className="flex w-full gap-2 sm:w-fit">
      <Button
        type="button"
        variant="outline"
        className="sm:w-fit w-full text-xs"
        onClick={handleCancelEditing}
        disabled={saving}
      >
        <X className="h-4 w-4 mr-1" />
        Cancel
      </Button>
      <Button
        type="button"
        className="sm:w-fit w-full text-xs"
        onClick={() => void handleSaveEditing()}
        disabled={saving}
      >
        <CheckCircle2 className="h-4 w-4 mr-1" />
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Save</>}
      </Button>
    </div>
  );

  const resumeManager: ProfileResumeManager = {
    resumes: resumes.data?.resumes ?? [],
    defaultResume: resumes.data?.default_resume ?? null,
    loading: resumes.isPending,
    maxAllowed: maxResumesAllowed,
    isRenaming: isRenamingResume,
    isSettingDefault: isSettingDefaultResume,
    actions: {
      view: openResumePreview,
      add: () =>
        modalRegistry.addResume.open({
          isAtResumeLimit: atResumeLimit,
          onComplete: () => {
            void resumes.refetch();
            void queryClient.invalidateQueries({
              queryKey: ["my-profile"],
            });
          },
        }),
      setDefault: onSetDefaultResume,
      rename: onRenameResume,
      delete: onDeleteResume,
    },
  };

  useBlockPageRefreshEffect(isEditing);

  if (profile.isPending) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader>Loading profile...</Loader>
      </div>
    );
  }

  if (profile.error) {
    return (
      <Card className="flex flex-col items-center justify-center max-w-md m-auto p-6 gap-4">
        <p className="text-red-600 text-base sm:text-lg text-center">
          Failed to load profile: {profile.error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </Card>
    );
  }

  return (
    data && (
      <div className="relative isolate min-h-0 flex-1 overflow-y-auto bg-slate-50/70">
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: `url(${bg2.src})` }}
        />
        <main className="relative z-10 mx-auto flex w-full max-w-[960px] flex-col gap-4 px-4 py-6 sm:gap-5 sm:px-6 sm:py-8">
          <ProfileHeaderCard
            profile={data}
            fileInputRef={pfpFileInputRef}
            isUploading={pfpIsUploading}
            saveError={saveError}
            showEdit={!isEditing}
            actionSlot={isEditing ? editActions : undefined}
            onEdit={() => setIsEditing(true)}
            onPhotoSelect={(file) => {
              if (!file) return;

              const uploadToastId = toast(
                "Uploading profile photo...",
                toastPresets.loading,
              );

              void pfpUpload(file).then((success) => {
                if (success) {
                  void queryClient.invalidateQueries({
                    queryKey: ["my-profile"],
                  });
                  window.dispatchEvent(new Event(PFP_UPDATED_EVENT));
                  toast.success("Profile photo uploaded successfully.", {
                    ...toastPresets.success,
                    id: uploadToastId,
                  });
                  return;
                }

                toast.error(
                  "Could not upload profile photo. Please try again.",
                  {
                    ...toastPresets.destructive,
                    id: uploadToastId,
                  },
                );
              });
            }}
          />

          <div className="flex flex-col gap-6">
            {!isEditing && (
              <ProfileAccordion
                profile={data}
                resumeManager={resumeManager}
                openSections={openProfileSections}
                onOpenSectionsChange={setOpenProfileSections}
              />
            )}
            {isEditing && (
              <ProfileEditForm data={data}>
                <ProfileEditor
                  updateProfile={profileActions.update.mutateAsync}
                  ref={profileEditorRef}
                  initialTab="Student Profile"
                  initialOpenSections={openProfileSections}
                  actionSlot={editActions}
                  resumeManager={resumeManager}
                />
              </ProfileEditForm>
            )}
          </div>
        </main>

        <ResumeModal className="mt-16 max-h-[calc(100svh-5rem)] max-w-[80vw] sm:mt-20">
          <PDFPreview url={resumeURL} />
        </ResumeModal>
      </div>
    )
  );
}
