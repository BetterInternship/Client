import { UserService } from "@/lib/api/services";
import { useFileUpload } from "./use-file";

export const useAnalyzeResume = (file: File | null) => {
  const { fileInputRef, isUploading, uploadSuccess, upload, response } = useFileUpload({
    uploader: UserService.parseResume,
    filename: "resume",
    silent: true,
  });

  return {
    upload,
    isUploading,
    uploadSuccess,
    fileInputRef,
    response,
  };
};
