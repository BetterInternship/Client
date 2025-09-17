import { AuthService } from "@/lib/api/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFileUpload } from "./use-file";

export const useAnalyzeResume = (file: File | null) => {
  const queryClient = useQueryClient();
  const { fileInputRef, isUploading, upload, response } = useFileUpload({
    uploader: AuthService.parseResume,
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
