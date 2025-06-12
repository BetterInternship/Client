"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn, getImageDimensions, resizeImage } from "@/lib/utils";

import ImageCropper from "./image-cropper";

export interface FileWithPreview {
  file: File;
  preview: string;
}

interface ResizeOptions {
  quality: number; // 0-100
  format?: "JPEG" | "PNG" | "WEBP";
  maxWidth?: number;
  maxHeight?: number;
}

interface ImageUploadProps {
  label?: string;
  value?: File | null;
  onValueChange?: (file: File | null) => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  resize?: boolean;
  required?: boolean;
  resizeOptions?: ResizeOptions;
  accept?: { [key: string]: string[] };
  maxSize?: number;
  onUpload?: (file: File) => Promise<void>;
  previewClassName?: string;
  placeholderClassName?: string;
  // New props for cropping:
  cropEnabled?: boolean;
  // recommendedDimensions can be used to enforce a specific aspect ratio (e.g. for an icon or header)
  recommendedDimensions?: {
    width: number;
    height: number;
  };
}

export default function ImageUpload({
  label,
  value: valueProp,
  onValueChange,
  className,
  children,
  disabled = false,
  resize = false,
  required = true,
  resizeOptions = { quality: 75, format: "JPEG" },
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
  maxSize = 1024 * 1024 * 2,
  onUpload,
  previewClassName,
  placeholderClassName,
  cropEnabled = false,
  recommendedDimensions,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // State to manage the file selected for cropping
  const [selectedFileForCrop, setSelectedFileForCrop] =
    useState<FileWithPreview | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);

  // --- Client-side File Type Validation ---
  const isAccepted = useCallback(
    (file: File) => {
      if (!accept) return true;
      for (const mimeType in accept) {
        if (accept.hasOwnProperty(mimeType)) {
          const extensions = accept[mimeType];
          if (file.type === mimeType) return true;
          if (extensions.length > 0) {
            const fileName = file.name.toLowerCase();
            for (const ext of extensions) {
              if (fileName.endsWith(ext.toLowerCase())) return true;
            }
          }
        }
      }
      return false;
    },
    [accept],
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      if (!isAccepted(file)) {
        toast.error(
          `Invalid file type: ${file.name} is not an accepted file type.`,
        );
        return;
      }

      if (file.size > maxSize) {
        toast.error(
          `File too large: ${file.name} exceeds the maximum size of ${maxSize / (1024 * 1024)}MB`,
        );
        return;
      }

      setIsUploading(true);

      // If cropping is enabled and the file is an image, pass it to the cropper instead of processing immediately.
      if (cropEnabled && file.type.startsWith("image/")) {
        const fileWithPreview: FileWithPreview = {
          file,
          preview: URL.createObjectURL(file),
        };
        setSelectedFileForCrop(fileWithPreview);
        setCropDialogOpen(true);
        setIsUploading(false);
        return;
      }

      // Otherwise, process the image as before.
      let processedFile = file;
      if (resize && file.type.startsWith("image/")) {
        try {
          const dimensions = await getImageDimensions(file);
          const resizeSize = {
            width: resizeOptions?.maxWidth ?? dimensions.width,
            height: resizeOptions?.maxHeight ?? dimensions.height,
          };
          processedFile = (await resizeImage(
            file,
            resizeOptions.quality,
            resizeOptions.format,
            resizeSize,
            "file",
          )) as File;
          // @ts-ignore
          processedFile.dimensions = {
            width: resizeSize.width,
            height: resizeSize.height,
          };
        } catch (error) {
          console.error("Error resizing image:", error);
          toast.error(`Failed to resize image: ${file.name}`);
          setIsUploading(false);
          return;
        }
      } else if (file.type.startsWith("image/")) {
        try {
          // @ts-ignore
          file.dimensions = await getImageDimensions(file);
        } catch (error) {
          console.error("Error getting image dimensions:", error);
        }
      }

      const newPreviewUrl = URL.createObjectURL(processedFile);
      setPreviewUrl(newPreviewUrl);
      onValueChange?.(processedFile);

      if (onUpload) {
        toast.promise(onUpload(processedFile), {
          loading: "Uploading file...",
          success: "File uploaded",
          error: "Failed to upload file",
        });
      } else {
        toast.success("Image uploaded successfully");
      }
      setIsUploading(false);
    },
    [
      onValueChange,
      disabled,
      resize,
      resizeOptions,
      accept,
      maxSize,
      onUpload,
      cropEnabled,
      isAccepted,
    ],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled,
  });

  const handleRemove = useCallback(() => {
    onValueChange?.(null);
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [onValueChange, previewUrl]);

  useEffect(() => {
    if (valueProp) {
      const newPreviewUrl = URL.createObjectURL(valueProp);
      setPreviewUrl(newPreviewUrl);
      return () => {
        URL.revokeObjectURL(newPreviewUrl);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [valueProp]);

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
      )}
      <div
        {...getRootProps()}
        className={cn(
          `relative overflow-hidden rounded-lg`,
          disabled && "cursor-not-allowed opacity-50",
          !previewUrl &&
            "border-2 border-dashed border-muted-foreground/25 bg-muted/50",
          "cursor-pointer",
          className,
        )}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt="Uploaded image"
              fill
              className={cn("object-cover", previewClassName)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div
            className={cn(
              "flex h-full flex-col items-center justify-center",
              placeholderClassName,
            )}
          >
            {children || (
              <>
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-center text-xs text-muted-foreground sm:text-sm">
                  {isDragActive
                    ? "Drop the image here"
                    : "Drag & drop or click to upload"}
                </p>
              </>
            )}
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="animate-spin text-primary">◌</span>
          </div>
        )}
      </div>

      {/* Render the cropping dialog when enabled and a file is selected */}
      {cropEnabled && selectedFileForCrop && (
        <ImageCropper
          dialogOpen={cropDialogOpen}
          setDialogOpen={setCropDialogOpen}
          selectedFile={selectedFileForCrop}
          setSelectedFile={setSelectedFileForCrop}
          recommendedDimensions={recommendedDimensions}
          onCropDone={(croppedFile, croppedDataUrl) => {
            setPreviewUrl(croppedDataUrl);
            onValueChange?.(croppedFile);
            if (onUpload) {
              toast.promise(onUpload(croppedFile), {
                loading: "Uploading file...",
                success: "File uploaded",
                error: "Failed to upload file",
              });
            } else {
              toast.success("Image uploaded successfully");
            }
            setIsUploading(false);
            // Clean up the cropping state.
            setSelectedFileForCrop(null);
          }}
        />
      )}
    </div>
  );
}
