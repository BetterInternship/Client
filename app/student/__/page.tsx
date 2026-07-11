"use client";

import { Loader } from "@/components/ui/loader";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const InternalSetupPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const redirectPath = window.sessionStorage.getItem("post_login_redirect");
    if (redirectPath) {
      window.sessionStorage.removeItem("post_login_redirect");
    }

    void (async () => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      await queryClient.invalidateQueries({ queryKey: ["my-saved-jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      await queryClient.invalidateQueries({ queryKey: ["my-forms"] });
      await queryClient.invalidateQueries({ queryKey: ["my-form-templates"] });
      await queryClient.invalidateQueries({ queryKey: ["my-form-template"] });
      await queryClient.invalidateQueries({ queryKey: ["my-resumes"] });
      router.replace(redirectPath || "/search");
    })();
  }, [queryClient, router]);

  return (
    <div>
      <Loader>Loading...</Loader>
    </div>
  );
};

export default InternalSetupPage;
