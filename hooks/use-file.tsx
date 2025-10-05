/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-19 06:01:21
 * @ Modified time: 2025-10-05 11:54:22
 * @ Description:
 *
 * Properly handles dealing with files stored in GCS and their local state.
 * Synchronizes the hash for caching and shit.
 */

import { FileUploadFormBuilder } from "@/lib/multipart-form";
import { useCallback, useImperativeHandle, useRef, useState } from "react";

interface IUseFile {
  url: string;
  loading: boolean;
  sync: () => Promise<void>;
}

// Valid MimeTypes
type MimeType =
  | "text/plain"
  | "text/html"
  | "application/json"
  | "application/pdf"
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/webp"
  | "video/mp4"
  | "audio/mpeg";

/**
 * Synchronizes a gcs-stored file's state with the server's.
 *
 * @hook
 */
export const useFile = ({
  route,
  fetcher,
  defaultURL = "",
}: {
  route: string;
  fetcher: () => Promise<any>;
  defaultURL?: string;
}): IUseFile => {
  const [url, setURL] = useState(defaultURL);
  const [loading, setLoading] = useState(true);

  /**
   * Performs a sync by requesting for the hash of the file from the server.
   * It will then use this hash to request the file each time.
   *
   * @returns
   */
  const synchronize = useCallback(async () => {
    const { success, empty, hash } = await fetcher();

    // Something went wrong
    if (!success) {
      console.error("Could not fetch file.");
      setLoading(false);
      return;
    }

    // File has not been uploaded by host / source
    if (empty) {
      setLoading(false);
      return;
    }

    // Update url
    setURL(`${process.env.NEXT_PUBLIC_API_URL}${route}?hash=${hash}`);
    setLoading(false);
  }, [route]);

  return {
    url,
    loading,
    sync: synchronize,
  };
};

export interface IFileUploadRef {
  open: () => void;
  getFile: () => File | null;
}

/**
 * Handles file uploads.
 * Creates an invisible input component for the file upload.
 * Note that if allowedTypes is not provided, any file is accepted by default.
 * An empty array means nothing is accepted.
 * maxSize is the max file size in MB.
 *
 * @component
 */
export const FileUploadInput = ({
  allowedTypes,
  maxSize = 1,
  onSelect,
  ref,
}: {
  allowedTypes?: MimeType[];
  maxSize?: number;
  onSelect?: (file?: File | null) => void;
  ref: React.Ref<IFileUploadRef>;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const accept = allowedTypes?.join(", ");

  // Expose the API of the FileUpload component
  useImperativeHandle(
    ref,
    () => ({
      open: () => fileInputRef.current?.click(),
      getFile: () => file,
    }),
    []
  );

  /**
   * When a file is selected, the state is updated.
   * Upload is handled separately in case we don't want those to execute at the same time.
   *
   * @param event
   * @returns
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check valid file types
    if (allowedTypes && !allowedTypes.includes(file.type as MimeType)) {
      alert("Please upload the correct file type.");
      return;
    }

    // Check file size
    if (file.size > Math.floor(maxSize * 1024 * 1024)) {
      alert("File size must be less than " + maxSize + "MB.");
      return;
    }

    // Call the callback after a delay to account for state change
    setFile(file);
    setTimeout(() => onSelect && onSelect(file));
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        style={{ display: "none" }}
      />
    </>
  );
};

/**
 * A hook for all the infra for uploading a file.
 *
 * @hook
 */
export const useFileUpload = ({
  uploader,
  filename,
  silent,
}: {
  uploader: (formData: FormData) => Promise<any>;
  filename: string;
  silent?: boolean;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [response, setResponse] = useState<Promise<any>>();
  const fileInputRef = useRef<IFileUploadRef>(null);

  /**
   * Upload the file.
   *
   * @param file
   * @returns
   */
  const upload = async (file?: File | null) => {
    if (!file) return;

    // Perform the file upload
    setIsUploading(true);
    const form = FileUploadFormBuilder.new(filename);
    form.file(file);

    // Check for success
    let result = uploader(form.build());
    setResponse(result);
    result = await result;
    console.log(result);

    if (!result.success) {
      alert("Could not upload file.");
      return;
    }

    if (!silent) alert("File uploaded successfully!");
    setIsUploading(false);
  };

  return {
    upload,
    response,
    isUploading,
    fileInputRef,
  };
};
