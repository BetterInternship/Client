import { Resume } from "@/lib/db/db.types";

export function displayValue(value?: string | number | null) {
  if (value === null || value === undefined) return "\u2014";
  const text = String(value).trim();
  return text.length ? text : "\u2014";
}

export function compareResumesByUploadedAtDesc(first: Resume, second: Resume) {
  const firstUploadedAt = new Date(first.uploaded_at).getTime();
  const secondUploadedAt = new Date(second.uploaded_at).getTime();
  const firstTime = Number.isNaN(firstUploadedAt) ? 0 : firstUploadedAt;
  const secondTime = Number.isNaN(secondUploadedAt) ? 0 : secondUploadedAt;

  return secondTime - firstTime;
}

export function formatResumeUploadedAt(uploadedAt: string) {
  const date = new Date(uploadedAt);
  if (Number.isNaN(date.getTime())) return "unknown date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
