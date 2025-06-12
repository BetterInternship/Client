"use client";

import * as React from "react";
import Dropzone, {
  type DropzoneProps,
  type FileRejection,
} from "react-dropzone";
import { toast } from "sonner";

import { cn, formatBytes, getImageDimensions, resizeImage } from "@/lib/utils";
import { useControllableState } from "@/hooks/use-controllable-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload } from "lucide-react";
import {
  FileCard,
  isFileWithPreview,
} from "@/components/ui/file-uploader/file-card";
import { useLoadingContext } from "@/components/school/providers/loader-spinner-provider";

interface ResizeOptions {
  quality: number; // 0-100
  format?: "JPEG" | "PNG" | "WEBP";
  maxWidth?: number;
  maxHeight?: number;
}

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   * @type React.Dispatch<React.SetStateAction<File[]>>
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: React.Dispatch<React.SetStateAction<File[]>>;

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (files: File[]) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @type Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>;

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]}
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image/png", "image/jpeg"]}
   */
  accept?: DropzoneProps["accept"];

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 2 // 2MB
   * @example maxSize={1024 * 1024 * 2} // 2MB
   */
  maxSize?: DropzoneProps["maxSize"];

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFiles={5}
   */
  maxFiles?: DropzoneProps["maxFiles"];

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean;

  hideFiles?: boolean;

  resize?: boolean; // Add resize prop
  resizeOptions?: ResizeOptions; // Add resizeOptions prop
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = { "*/*": [] },
    maxSize = 1024 * 1024 * 2,
    maxFiles = 1,
    multiple = false,
    disabled = false,
    hideFiles = false,
    resize = false,
    resizeOptions = { quality: 75, format: "JPEG" },
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });
  const { setLoading, setText } = useLoadingContext();

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time");
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
        toast.error(`Cannot upload more than ${maxFiles} files`);
        return;
      }
      setLoading(true);
      setText("Uploading files");

      // --- Client-side File Type Validation (using accept) ---
      const validFiles: File[] = [];
      const invalidFiles: File[] = [];

      // Helper function to check if a file type is accepted
      const isAccepted = (file: File) => {
        if (!accept) {
          return true; // If no accept prop, accept all files
        }
        for (const mimeType in accept) {
          if (accept.hasOwnProperty(mimeType)) {
            const extensions = accept[mimeType];
            // Check MIME type directly
            if (file.type === mimeType) {
              return true;
            }
            // Check file extension (less reliable, but a good fallback)
            if (extensions.length > 0) {
              const fileName = file.name.toLowerCase();
              for (const ext of extensions) {
                if (fileName.endsWith(ext.toLowerCase())) {
                  return true;
                }
              }
            }
          }
        }
        return false;
      };

      for (const file of acceptedFiles) {
        if (isAccepted(file)) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file);
          toast.error(
            `Invalid file type: ${file.name} is not an accepted file type.`,
          );
        }
      }

      if (invalidFiles.length > 0) {
        setLoading(false);
        setText("");
        return; // Stop processing if there are invalid files
      }

      // --- Processing Valid Files ---
      const processedFiles = await Promise.all(
        validFiles.map(async (file) => {
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
              }; // Keep dimensions after resizing
            } catch (error) {
              console.error("Error resizing image:", error);
              toast.error(`Failed to resize image: ${file.name}`);
            }
          } else if (file.type.startsWith("image/")) {
            try {
              const dimensions = await getImageDimensions(file);
              // @ts-ignore
              file.dimensions = dimensions;
              console.log(`File ${file.name} dimensions:`, dimensions);
            } catch (error) {
              console.error("Error getting image dimensions:", error);
            }
          }

          return Object.assign(processedFile, {
            preview: URL.createObjectURL(processedFile),
          });
        }),
      );

      // Filter out any null values (from failed resizes)

      const updatedFiles = files
        ? [...files, ...processedFiles]
        : processedFiles;
      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        setLoading(false);
        setText("");
        rejectedFiles.forEach(({ file, errors }) => {
          const errorMessages = errors
            .map((e: { message: any }) => e.message)
            .join(", ");
          toast.error(
            `File ${file.name} was rejected. Errors: ${errorMessages}`,
          );
        });
      }

      if (
        onUpload &&
        updatedFiles.length > 0 &&
        updatedFiles.length <= maxFiles
      ) {
        const target =
          updatedFiles.length > 0 ? `${updatedFiles.length} files` : `file`;

        toast.promise(onUpload(updatedFiles), {
          loading: `Uploading ${target}...`,
          success: () => {
            setFiles([]);
            return `${target} uploaded`;
          },
          error: `Failed to upload ${target}`,
        });
      }
      setLoading(false);
      setText("");
    },
    [
      files,
      maxFiles,
      multiple,
      onUpload,
      setFiles,
      accept,
      resize,
      resizeOptions,
    ], // Include accept, resize and resize options in the dependency
  );

  function onRemove(index: number) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  }

  // Revoke preview url when component unmounts
  React.useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDisabled = disabled || (files?.length ?? 0) >= maxFiles;

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFiles}
        multiple={maxFiles > 1 || multiple}
        disabled={isDisabled}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isDragActive && "border-muted-foreground/50",
              isDisabled && "pointer-events-none opacity-60",
              className,
            )}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="font-medium text-muted-foreground">
                  Drop the files here
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col gap-px">
                  <p className="font-medium text-muted-foreground">
                    Drag {`'n'`} drop files here, or click to select files
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    You can upload
                    {maxFiles > 1
                      ? ` ${maxFiles === Infinity ? "multiple" : maxFiles}
                      files (up to ${formatBytes(maxSize)} each)`
                      : ` a file with ${formatBytes(maxSize)}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>
      {files?.length && !hideFiles ? (
        <ScrollArea className="h-fit w-full px-3">
          <div className="max-h-48 space-y-4">
            {files?.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => onRemove(index)}
                progress={progresses?.[file.name]}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}
