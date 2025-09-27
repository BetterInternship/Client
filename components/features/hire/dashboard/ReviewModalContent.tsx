// Modal content for editing private notes/reviews on applications
// Handles the MDX editor and save/cancel actions
"use client";

import { useState, useEffect } from "react";
import { EmployerApplication } from "@/lib/db/db.types";
import { Button } from "@/components/ui/button";
import { getFullName } from "@/lib/profile";
import { MDXEditor } from "@/components/MDXEditor";
import { useQueryClient } from "@tanstack/react-query";

interface ReviewModalContentProps {
  application: EmployerApplication;
  reviewApp: (
    id: string,
    reviewOptions: { review?: string; notes?: string; status?: number }
  ) => void;
  onClose: () => void;
}

export function ReviewModalContent({
  application,
  reviewApp,
  onClose,
}: ReviewModalContentProps) {
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!application.id) return;
    setSaving(true);
    await reviewApp(application.id, {
      // review,
      notes: review,
      status: application.status,
    });
    location.reload();
    setSaving(false);
    onClose();
  };

  useEffect(() => {
    setReview(application.notes ?? "");
  }, [application]);

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <h1 className="font-bold font-heading text-4xl px-8 pb-4">
          {getFullName(application.user)} - Private Notes
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center">
        <MDXEditor
          className="min-h-[300px] px-8 w-full rounded-lg overflow-y-auto"
          markdown={application.review ?? ""}
          onChange={(value) => setReview(value)}
        />
      </div>
      <div className="flex flex-row items-center justify-center w-full px-5 py-3 gap-2">
        <Button disabled={saving} onClick={handleSave} className="w-1/4">
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="outline"
          disabled={saving}
          className="w-1/4"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </>
  );
}
