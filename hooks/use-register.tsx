import { UserService } from "@/lib/api/services";
import { useFileUpload } from "./use-file";

export const useAnalyzeResume = (file: File | null) => {
  const { fileInputRef, isUploading, upload, response } = useFileUpload({
    uploader: UserService.updateMyResume, // TODO: make this parseResume with gemini isnt a bitch anymore
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
