"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import {
  compareResumesByUploadedAtDesc,
  formatResumeUploadedAt,
} from "./profile-display-utils";
import type { ProfileResumeManager } from "./profile-types";

export function ResumeSection({ manager }: { manager: ProfileResumeManager }) {
  const { resumes, loading, maxAllowed, isRenaming, actions } = manager;
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const sortedResumes = useMemo(
    () => [...resumes].sort(compareResumesByUploadedAtDesc),
    [resumes],
  );
  const atResumeLimit = resumes.length >= maxAllowed;

  const startEditing = (resume: Resume) => {
    if (!resume.id) {
      toast.error("Resume not found.");
      return;
    }
    setEditingResumeId(resume.id);
    setEditingLabel(resume.label ?? "");
  };

  const cancelEditing = () => {
    setEditingResumeId(null);
    setEditingLabel("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {loading && (
          <div className="rounded-[0.33em] border border-blue-100 p-4 text-sm text-muted-foreground">
            Loading resumes...
          </div>
        )}

        {!loading && sortedResumes.length === 0 && (
          <div className="rounded-[0.33em] border border-dashed border-blue-100 p-4 text-sm text-muted-foreground">
            No resumes uploaded yet.
          </div>
        )}

        {!loading &&
          sortedResumes.map((resume) => {
            const isEditing = editingResumeId === resume.id;
            const currentLabel = resume.label ?? "";

            const handleSave = () => {
              if (!resume.id) {
                toast.error("Resume not found.");
                return;
              }

              const nextLabel = editingLabel.trim();
              if (!nextLabel) {
                toast.error("Resume label is required.");
                return;
              }

              if (nextLabel === currentLabel) {
                cancelEditing();
                return;
              }

              void (async () => {
                const success = await actions.rename(resume.id, nextLabel);
                if (success) cancelEditing();
              })();
            };

            return (
              <div
                key={resume.id}
                className="flex flex-col gap-3 rounded-[0.33em] border border-blue-100 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <FormInput
                        value={editingLabel}
                        setter={setEditingLabel}
                        required={false}
                        placeholder="Resume label"
                        aria-label="Resume label"
                        className="w-full"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleSave();
                          } else if (event.key === "Escape") {
                            event.preventDefault();
                            cancelEditing();
                          }
                        }}
                        disabled={isRenaming}
                      />
                    ) : (
                      <div className="truncate text-sm font-semibold text-[#061858]">
                        {resume.label || resume.filename || "Untitled resume"}
                      </div>
                    )}
                    <div className="text-xs text-slate-500">
                      Uploaded {formatResumeUploadedAt(resume.uploaded_at)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSave}
                        aria-label="Save resume label"
                        disabled={isRenaming}
                      >
                        {isRenaming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={cancelEditing}
                        aria-label="Cancel rename"
                        disabled={isRenaming}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => void actions.view(resume.id)}
                        aria-label={`View ${resume.label || "resume"}`}
                        disabled={isRenaming}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => startEditing(resume)}
                        aria-label={`Rename ${resume.label || "resume"}`}
                        disabled={isRenaming}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        scheme="destructive"
                        variant="outline"
                        size="icon"
                        onClick={() => void actions.delete(resume)}
                        aria-label={`Delete ${resume.label || "resume"}`}
                        disabled={isRenaming}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-slate-500">
          You can have up to {maxAllowed} resumes.
        </span>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={actions.add}
          disabled={atResumeLimit}
        >
          <Upload className="h-4 w-4" />
          Add resume
        </Button>
      </div>
    </div>
  );
}
