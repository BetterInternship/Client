import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GrabIcon, XCircleIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatBytes, truncateFileName } from "@/lib/utils";
import { SortableKnob } from "react-easy-sort";

interface FileCardProps {
  file: File;
  onRemove: () => void;
  progress?: number;
  isSortable?: boolean;
}

export const FileCard = React.forwardRef<HTMLDivElement, FileCardProps>(
  ({ file, progress, onRemove, isSortable }, ref) => {
    // Ensure the file has a preview URL (only for image files)
    const fileWithPreview = ensureFileHasPreview(file);

    return (
      <div ref={ref} className="relative flex items-center space-x-4">
        <div className="flex flex-1 space-x-4">
          {isFileWithPreview(fileWithPreview) ? (
            <Image
              src={fileWithPreview.preview}
              alt={fileWithPreview.name}
              width={48}
              draggable={false}
              height={48}
              loading="lazy"
              className="aspect-square shrink-0 rounded-md object-cover"
            />
          ) : null}
          <div className="flex w-full flex-col gap-2">
            <div className="space-y-px">
              <p className="line-clamp-1 text-sm font-medium text-foreground/80">
                {truncateFileName(fileWithPreview.name)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(fileWithPreview.size)}
              </p>
            </div>
            {progress ? <Progress value={progress} /> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSortable && (
            <SortableKnob>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7"
              >
                <GrabIcon className="size-4" aria-hidden="true" />
                <span className="sr-only">Drag</span>
              </Button>
            </SortableKnob>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7"
            onClick={onRemove}
          >
            <XCircleIcon
              className="size-4 text-destructive"
              aria-hidden="true"
            />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      </div>
    );
  },
);

FileCard.displayName = "FileCard";

export function isFileWithPreview(
  file: File,
): file is File & { preview: string } {
  return "preview" in file && typeof file.preview === "string";
}

export function ensureFileHasPreview(file: File): File & { preview?: string } {
  if (!isFileWithPreview(file) && file.type.startsWith("image/")) {
    (file as any).preview = URL.createObjectURL(file);
  }
  return file as File & { preview?: string };
}
