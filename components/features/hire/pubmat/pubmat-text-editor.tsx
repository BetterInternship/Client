"use client";

import { useId } from "react";
import { LoaderCircle, PencilLine, RotateCcw } from "lucide-react";
import { Button, Input, Label } from "@betterinternship/components";
import { Textarea } from "@/components/ui/textarea";
import type { PosterCopy } from "@/lib/pubmat/core";

const FIELDS = [
  "title",
  "company",
  "description",
  "location",
  "setup",
  "pay",
] as const;

/**
 * Live text tweaks for a themed pubmat. Edits reach the poster on their own
 * (debounced by the creator), so there is no apply step — only a way back to
 * the listing's own wording.
 */
export function PubmatTextEditor({
  base,
  draft,
  onChange,
  onReset,
  rendering,
  showDescription = true,
  backgroundImage,
  onBackgroundImageChange,
  backgroundOptions = [],
  backgroundPosition,
  onBackgroundPositionChange,
}: {
  base: PosterCopy;
  draft: PosterCopy;
  onChange: (copy: PosterCopy) => void;
  onReset: () => void;
  rendering: boolean;
  showDescription?: boolean;
  backgroundImage?: string;
  onBackgroundImageChange?: (value: string) => void;
  backgroundOptions?: ReadonlyArray<{
    id: string;
    label: string;
    src?: string;
  }>;
  backgroundPosition?: { x: number; y: number; scale: number };
  onBackgroundPositionChange?: (value: {
    x: number;
    y: number;
    scale: number;
  }) => void;
}) {
  const id = useId();
  const value = (field: keyof PosterCopy) => draft[field] ?? base[field] ?? "";
  const customized = FIELDS.some(
    (field) =>
      (showDescription || field !== "description") &&
      value(field) !== (base[field] ?? ""),
  );

  function input(
    field: Exclude<keyof PosterCopy, "description">,
    label: string,
    placeholder?: string,
  ) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-${field}`} className="text-xs text-gray-700">
          {label}
        </Label>
        <Input
          id={`${id}-${field}`}
          value={value(field)}
          placeholder={placeholder}
          onChange={(event) =>
            onChange({ ...draft, [field]: event.target.value })
          }
        />
      </div>
    );
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="flex w-full flex-col space-y-4"
    >
      <header className="order-1 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          <PencilLine className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            id={`${id}-heading`}
            className="flex items-center gap-2 text-sm font-semibold text-gray-900"
          >
            Adjust poster text
            {customized && (
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                Edited
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
            Changes show on the poster as you type. Your listing stays the same.
          </p>
        </div>
      </header>

      <fieldset className="order-3 space-y-4">
        <legend className="sr-only">Poster text</legend>
        {input("title", "Job title")}
        {input("company", "Company name")}
        {showDescription && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor={`${id}-description`}
                className="text-xs text-gray-700"
              >
                Short description
              </Label>
              <span className="text-[11px] tabular-nums text-gray-500">
                {value("description").length} characters
              </span>
            </div>
            <Textarea
              id={`${id}-description`}
              rows={3}
              className="min-h-24 resize-y text-sm leading-relaxed"
              value={value("description")}
              placeholder="A short sentence about what they’ll do."
              onChange={(event) =>
                onChange({ ...draft, description: event.target.value })
              }
            />
            <p className="text-[11px] leading-relaxed text-gray-600">
              Keep it brief so it fits into two lines on the poster.
            </p>
          </div>
        )}
      </fieldset>

      {onBackgroundImageChange && (
        <fieldset className="order-2 space-y-2 border-t border-gray-100 pt-4">
          <legend className="text-xs font-semibold text-gray-900">
            Background image
          </legend>
          <div className="grid grid-cols-4 gap-1.5">
            {backgroundOptions
              .filter((item) => item.src)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={backgroundImage === item.id}
                  onClick={() => onBackgroundImageChange(item.id)}
                  className={`overflow-hidden rounded-lg border-2 text-left text-[10px] ${backgroundImage === item.id ? "border-primary" : "border-transparent"}`}
                >
                  <img
                    src={item.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-cover"
                  />
                  <span className="block px-1.5 py-1">{item.label}</span>
                </button>
              ))}
            <label
              className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-2 text-center text-[10px] ${backgroundImage === "upload" || backgroundImage?.startsWith("data:") ? "border-primary text-primary" : "border-gray-300 text-gray-600"}`}
            >
              Upload image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    onBackgroundImageChange(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>

          {backgroundImage?.startsWith("data:") &&
            onBackgroundPositionChange && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                {(["scale", "x", "y"] as const).map((key) => (
                  <label
                    key={key}
                    className="text-[11px] capitalize text-gray-600"
                  >
                    {key === "scale"
                      ? "Zoom"
                      : key === "x"
                        ? "Horizontal"
                        : "Vertical"}
                    <input
                      type="range"
                      min={key === "scale" ? 1 : 0}
                      max={key === "scale" ? 2.5 : 1}
                      step="0.01"
                      value={
                        backgroundPosition?.[key] ?? (key === "scale" ? 1 : 0.5)
                      }
                      onChange={(event) =>
                        onBackgroundPositionChange({
                          ...(backgroundPosition ?? {
                            x: 0.5,
                            y: 0.5,
                            scale: 1,
                          }),
                          [key]: Number(event.target.value),
                        })
                      }
                      className="mt-1 block w-full"
                    />
                  </label>
                ))}
              </div>
            )}
        </fieldset>
      )}

      <fieldset className="order-4 space-y-3 border-t border-gray-100 pt-4">
        <legend className="mb-1 text-xs font-semibold text-gray-900">
          Role details{" "}
          <span className="font-normal text-gray-500">· optional</span>
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {input("location", "Location", "e.g. Makati City")}
          {input("setup", "Work setup", "e.g. Hybrid")}
        </div>
        {input("pay", "Compensation", "e.g. ₱8,000 / month")}
      </fieldset>

      <div className="order-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!customized}
          onClick={onReset}
          className="text-gray-600"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset to listing
        </Button>
        <span
          className="flex items-center gap-1.5 text-[11px] text-gray-500"
          role="status"
          aria-live="polite"
        >
          {rendering && (
            <LoaderCircle
              className="size-3 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {rendering ? "Updating preview…" : "Live preview"}
        </span>
      </div>
    </section>
  );
}
