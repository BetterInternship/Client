"use client";

import {
  FormCheckbox,
  FormInput,
  LabelWithTooltip,
} from "@/components/EditForm";
import { useSignContext } from "@/components/providers/sign.ctx";
import { removeSignatureImageBackground } from "@/lib/signature-image-cleanup";
import {
  createSignatureImageValue,
  getSignatureImageFieldKey,
  parseSignatureImageValue,
  serializeSignatureImageValue,
  type ClientField,
  type SignatureImageValue,
} from "@betterinternship/core/forms";
import { ImageUp, PenLine, Trash2, Type, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const MAX_SIGNATURE_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_SIGNATURE_UPLOAD_LABEL = "10 MB";

type SignatureMode = "type" | "upload" | "draw";

type SignatureFieldRendererProps<T extends any[]> = {
  field: ClientField<T>;
  value: string;
  onChange: (v: string | number) => void;
  onAuxValueChange?: (key: string, value: any) => void;
  onBlur?: (nextValue?: unknown) => void;
  allValues?: Record<string, string>;
  TooltipContent: () => React.ReactNode;
};

export const SignatureFieldRenderer = <T extends any[]>({
  field,
  value,
  onChange,
  onAuxValueChange,
  onBlur,
  allValues = {},
  TooltipContent,
}: SignatureFieldRendererProps<T>) => {
  const { setHasAgreedForSignature } = useSignContext();
  const [checked, setChecked] = useState(false);
  const imageFieldKey = getSignatureImageFieldKey(field.field);
  const rawSignatureImageValue = allValues[imageFieldKey] ?? "";
  const signatureImage = useMemo(
    () => parseSignatureImageValue(rawSignatureImageValue),
    [rawSignatureImageValue],
  );
  const [mode, setMode] = useState<SignatureMode>(
    signatureImage?.source === "draw"
      ? "draw"
      : signatureImage?.source === "upload"
        ? "upload"
        : "type",
  );
  const [typedName, setTypedName] = useState(value || "");
  const [uploadError, setUploadError] = useState("");
  const [isUploadDragging, setIsUploadDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const hasValue = !!value?.trim();
    setHasAgreedForSignature(
      field.field,
      value,
      hasValue && checked,
    );
  }, [checked, field.field, setHasAgreedForSignature, value]);

  useEffect(() => {
    setTypedName(value || "");
  }, [value]);

  useEffect(() => {
    if (signatureImage) setMode(signatureImage.source);
  }, [signatureImage]);

  const emitSignatureImage = (nextImage: SignatureImageValue) => {
    onAuxValueChange?.(imageFieldKey, serializeSignatureImageValue(nextImage));
  };

  const getSignatureImageSrc = (signature: SignatureImageValue | null) => {
    if (!signature) return "";
    if (signature.image.storage === "bucket") {
      return signature.image.signedUrl || signature.image.publicUrl || "";
    }
    return signature.image.dataUrl;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawImageOnCanvas = (dataUrl: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const image = new Image();
    image.onload = () => {
      clearCanvas();
      const scale = Math.min(
        canvas.width / image.width,
        canvas.height / image.height,
      );
      const width = image.width * scale;
      const height = image.height * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;
      ctx.drawImage(image, x, y, width, height);
    };
    image.src = dataUrl;
  };

  useEffect(() => {
    if (mode !== "draw") return;
    window.requestAnimationFrame(() => {
      if (signatureImage?.source === "draw") {
        const src = getSignatureImageSrc(signatureImage);
        if (!src) {
          clearCanvas();
          return;
        }
        drawImageOnCanvas(src);
        return;
      }
      clearCanvas();
    });
  }, [mode, signatureImage]);

  const handleTypedNameChange = (nextName: string) => {
    setTypedName(nextName);
    onChange(nextName);
  };

  const clearSignatureImage = () => {
    setUploadError("");
    clearCanvas();
    onAuxValueChange?.(imageFieldKey, "");
  };

  const changeSignatureMode = (nextMode: SignatureMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setUploadError("");
    clearSignatureImage();
  };

  const handleUpload = (file: File | undefined) => {
    if (!file) return;

    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      setUploadError("Please upload a PNG or JPEG signature image.");
      return;
    }
    if (file.size > MAX_SIGNATURE_UPLOAD_BYTES) {
      setUploadError(
        `Signature image must be ${MAX_SIGNATURE_UPLOAD_LABEL} or smaller.`,
      );
      return;
    }

    setUploadError("");
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      const normalizedDataUrl = await removeSignatureImageBackground(dataUrl);
      emitSignatureImage(
        createSignatureImageValue({
          source: "upload",
          dataUrl: normalizedDataUrl,
          mimeType: "image/png",
        }),
      );
      setMode("upload");
    };
    reader.onerror = () => {
      setUploadError("Unable to read signature image.");
    };
    reader.readAsDataURL(file);
  };

  const exportCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    emitSignatureImage(
      createSignatureImageValue({
        source: "draw",
        dataUrl: canvas.toDataURL("image/png"),
        mimeType: "image/png",
      }),
    );
  };

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handleDrawStart = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const point = getCanvasPoint(event);
    if (!canvas || !ctx || !point) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const handleDrawMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const point = getCanvasPoint(event);
    if (!ctx || !point) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handleDrawEnd = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    exportCanvasSignature();
  };

  const signatureModeOptions = [
    {
      id: "type" as const,
      title: "Type",
      icon: Type,
      onSelect: () => changeSignatureMode("type"),
    },
    {
      id: "upload" as const,
      title: "Upload",
      icon: ImageUp,
      onSelect: () => changeSignatureMode("upload"),
    },
    {
      id: "draw" as const,
      title: "Draw",
      icon: PenLine,
      onSelect: () => changeSignatureMode("draw"),
    },
  ];

  const SignatureModeCard = ({
    option,
  }: {
    option: (typeof signatureModeOptions)[number];
  }) => {
    const active = mode === option.id;
    const Icon = option.icon;

    return (
      <button
        type="button"
        role="radio"
        aria-checked={active}
        className={`group focus-visible:ring-primary/35 flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-[0.33em] border px-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none ${
          active
            ? "border-primary bg-primary/5 text-slate-950 hover:bg-primary/10"
            : "border-slate-200 bg-white text-slate-700 hover:border-primary/45 hover:bg-primary/[0.03] hover:text-slate-950"
        }`}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          option.onSelect();
        }}
        onClick={(event) => {
          event.stopPropagation();
          option.onSelect();
        }}
      >
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
            active
              ? "border-primary"
              : "border-slate-300 group-hover:border-primary/60"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${active ? "bg-primary" : "bg-transparent"}`}
          />
        </span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center transition-colors ${
            active ? "text-primary" : "text-slate-600 group-hover:text-primary"
          }`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="truncate text-sm font-semibold text-slate-950">
          {option.title}
        </span>
      </button>
    );
  };

  const signatureImageSrc = getSignatureImageSrc(signatureImage);

  return (
    <div className="space-y-1.5">
      <LabelWithTooltip
        label={`${field.label} (Signatory Full Name)`}
        required={true}
        tooltip={field.tooltip_label}
      />
      <div className="space-y-4 rounded-[0.33em] border border-gray-300 p-4 px-5">
        <div className="space-y-1.5">
          <p className="text-xs text-slate-500">
            Enter your full legal name, then choose one signature method.
          </p>
          <FormInput
            value={typedName ?? ""}
            setter={handleTypedNameChange}
            className="w-full"
            placeholder="Enter full legal name"
            onBlur={() => onBlur?.(value)}
          />
        </div>
        <div className="space-y-2">
          <LabelWithTooltip label="Signature method" />
          <div
            className="grid gap-2 sm:grid-cols-3"
            role="radiogroup"
            aria-label="Signature method"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {signatureModeOptions.map((option) => (
              <SignatureModeCard key={option.id} option={option} />
            ))}
          </div>
        </div>
        {mode === "type" ? (
          <p className="text-xs leading-relaxed text-slate-500">
            Your typed name will be used as your electronic signature.
          </p>
        ) : null}
        {uploadError ? (
          <p className="mt-2 text-xs text-red-600">{uploadError}</p>
        ) : null}
        {mode === "upload" ? (
          <div className="space-y-2">
            <label
              className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-[0.33em] border border-dashed p-3 text-center transition-colors ${
                uploadError
                  ? "border-red-300 bg-red-50/60"
                  : isUploadDragging
                    ? "border-slate-900 bg-slate-100"
                    : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
              }`}
              onDragEnter={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsUploadDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsUploadDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget as Node | null,
                  )
                ) {
                  setIsUploadDragging(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsUploadDragging(false);
                handleUpload(event.dataTransfer.files?.[0]);
              }}
            >
              {signatureImageSrc ? (
                <img
                  src={signatureImageSrc}
                  alt="Uploaded signature"
                  className="max-h-28 w-full object-contain"
                />
              ) : (
                <>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                    <UploadCloud className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    Choose a signature image
                  </span>
                  <span className="text-xs text-slate-500">
                    PNG or JPEG, {MAX_SIGNATURE_UPLOAD_LABEL} maximum
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(event) => {
                  handleUpload(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
            {signatureImage ? (
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1.5 rounded-[0.33em] border border-red-200 bg-white px-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                onClick={clearSignatureImage}
                title="Clear signature image"
                aria-label="Clear signature image"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear upload
              </button>
            ) : null}
          </div>
        ) : null}
        {mode === "draw" ? (
          <div className="space-y-2">
            <canvas
              ref={canvasRef}
              width={720}
              height={220}
              className="h-36 w-full touch-none rounded-[0.33em] border border-slate-300 bg-white"
              onPointerDown={handleDrawStart}
              onPointerMove={handleDrawMove}
              onPointerUp={handleDrawEnd}
              onPointerCancel={() => {
                isDrawingRef.current = false;
              }}
            />
            <button
              type="button"
              className="rounded-[0.33em] border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => {
                clearCanvas();
                clearSignatureImage();
              }}
            >
              Clear drawing
            </button>
          </div>
        ) : null}
        <div
          className="flex cursor-pointer items-start gap-3 border-t border-slate-200 pt-3"
          onClick={() => setChecked(!checked)}
        >
          <div className="mt-0.5 shrink-0">
            <FormCheckbox checked={checked} setter={setChecked}></FormCheckbox>
          </div>
          <span className="text-sm leading-relaxed text-gray-700 italic">
            I agree to use electronic representation of my signature for all
            purposes when I (or my agent) use them on documents, including
            legally binding contracts.
          </span>
        </div>
        <TooltipContent />
      </div>
    </div>
  );
};
