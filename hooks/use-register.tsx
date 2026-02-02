import { UserService } from "@/lib/api/services";
import { useFileUpload } from "./use-file";

export const useAnalyzeResume = () => {
  const { fileInputRef, isUploading, upload, response } = useFileUpload({
    uploader: (form) => UserService.parseResume(form),
    filename: "resume",
    silent: true,
  });

  return {
    upload,
    isUploading,
    fileInputRef,
    response,
  };
};
