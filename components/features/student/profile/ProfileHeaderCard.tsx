"use client";

import type { ReactNode, RefObject } from "react";
import { Camera, CheckCircle2, Edit2, Mail } from "lucide-react";

import type { IFileUploadRef } from "@/hooks/use-file";
import { FileUploadInput } from "@/hooks/use-file";
import { PublicUser } from "@/lib/db/db.types";
import { Button } from "@/components/ui/button";
import { MyUserPfp } from "@/components/shared/pfp";
import { getFullName } from "@/lib/profile";

export function ProfileHeaderCard({
  profile,
  fileInputRef,
  isUploading,
  saveError,
  showEdit = true,
  actionSlot,
  onEdit,
  onPhotoSelect,
}: {
  profile: PublicUser;
  fileInputRef: RefObject<IFileUploadRef | null>;
  isUploading: boolean;
  saveError?: string | null;
  showEdit?: boolean;
  actionSlot?: ReactNode;
  onEdit: () => void;
  onPhotoSelect: (file?: File | null) => void;
}) {
  return (
    <section className="rounded-[0.33em] border border-blue-100 bg-white px-5 py-6 shadow-sm sm:px-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
        <div className="relative shrink-0">
          <MyUserPfp size="28" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full border-blue-100 bg-white text-primary shadow-sm hover:bg-blue-50"
            onClick={() => fileInputRef.current?.open()}
            disabled={isUploading}
            aria-label="Change profile photo"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <FileUploadInput
            ref={fileInputRef}
            allowedTypes={["image/jpeg", "image/png", "image/webp"]}
            maxSize={1}
            onSelect={onPhotoSelect}
          />
        </div>

        <div className="w-full min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-[#061858] sm:text-3xl">
            {getFullName(profile)}
          </h1>
          {(profile.email || profile.edu_verification_email) && (
            <ul className="mt-2 space-y-1 text-sm text-slate-500">
              {profile.email && (
                <li className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="shrink-0 font-medium text-slate-400">
                    Email:
                  </span>
                  <span className="min-w-0 break-all sm:truncate">
                    {profile.email}
                  </span>
                </li>
              )}
              {profile.edu_verification_email && (
                <li className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="shrink-0 font-medium text-slate-400">
                    School email:
                  </span>
                  <span className="min-w-0 break-all sm:truncate">
                    {profile.edu_verification_email}
                  </span>
                  {profile.is_verified && (
                    <span className="inline-flex shrink-0 items-center gap-1 font-medium text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </li>
              )}
            </ul>
          )}
          {actionSlot ? (
            <div className="mt-3 w-full">{actionSlot}</div>
          ) : showEdit ? (
            <Button
              type="button"
              className="sm:w-fit mt-3 h-9 w-full px-4 text-xs"
              onClick={onEdit}
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          ) : null}
          {saveError && (
            <p className="mt-2 text-xs text-amber-600">{saveError}</p>
          )}
        </div>
      </div>
    </section>
  );
}
