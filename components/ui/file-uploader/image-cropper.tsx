"use client";

import React, { type SyntheticEvent } from "react";
import ReactCrop, {
  centerCrop,
  type Crop,
  makeAspectCrop,
  type PixelCrop,
} from "react-image-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import "react-image-crop/dist/ReactCrop.css";
import { FileWithPreview } from "./image-uploader";
import { CropIcon, Trash2Icon } from "lucide-react";

interface ImageCropperProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFile: FileWithPreview | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  onCropDone: (croppedFile: File, croppedDataUrl: string) => void;
  // Optional recommended dimensions to enforce a specific aspect ratio
  recommendedDimensions?: {
    width: number;
    height: number;
  };
}

export default function ImageCropper({
  dialogOpen,
  setDialogOpen,
  selectedFile,
  setSelectedFile,
  onCropDone,
  recommendedDimensions,
}: ImageCropperProps) {
  // Determine aspect ratio – if recommendedDimensions is provided, use it; otherwise default to 1:1.
  const aspect = recommendedDimensions
    ? recommendedDimensions.width / recommendedDimensions.height
    : 1;

  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = React.useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>("");

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    if (aspect && e.currentTarget) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  function onCropComplete(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      const croppedUrl = getCroppedImg(imgRef.current, crop);
      setCroppedImageUrl(croppedUrl);
    }
  }

  // Helper to get cropped image as a data URL
  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY,
      );
    }
    return canvas.toDataURL("image/png", 1.0);
  }

  // Helper to convert a data URL to a File object
  function dataURLtoFile(dataurl: string, filename: string) {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  async function onCrop() {
    try {
      // Ensure we have a cropped image URL and a selected file
      if (!croppedImageUrl || !selectedFile) return;
      // Create a File object from the cropped image
      const fileName = selectedFile.file.name || "cropped.png";
      const croppedFile = dataURLtoFile(croppedImageUrl, fileName);
      // Call the callback with the new file and its data URL
      onCropDone(croppedFile, croppedImageUrl);
      setDialogOpen(false);
    } catch (error) {
      alert("Something went wrong during cropping!");
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="gap-0 p-0">
        <DialogTitle className="hidden" />
        <div className="mx-auto max-h-[90vh] max-w-[90vw] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => onCropComplete(c)}
            aspect={aspect}
            className="w-full"
          >
            <img
              ref={imgRef}
              src={selectedFile?.preview}
              onLoad={onImageLoad}
              alt="Crop preview"
              className="block max-h-full max-w-full"
            />
          </ReactCrop>
        </div>
        <DialogFooter className="justify-center p-6 pt-0">
          <DialogClose asChild>
            <Button
              size="sm"
              type="reset"
              className="w-fit"
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
              }}
            >
              <Trash2Icon className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" size="sm" className="w-fit" onClick={onCrop}>
            <CropIcon className="mr-1.5 h-4 w-4" />
            Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to compute a centered crop with the correct aspect ratio
export function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 50,
        height: 50,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}
