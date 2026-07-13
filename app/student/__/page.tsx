"use client";

import { Loader } from "@/components/ui/loader";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  consumePostLoginRedirect,
  getPostLoginRedirect,
  isDiscordSetupRedirect,
} from "@/lib/post-login-redirect";
import { UserService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";

const InternalSetupPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
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

      const redirectPath = getPostLoginRedirect();
      if (isDiscordSetupRedirect(redirectPath)) {
        try {
          const profile = await UserService.getMyProfile();
          if (!profile.user) {
            setProfileError(true);
            return;
          }
          if (!profile.user.is_verified) {
            router.replace("/register/verify");
            return;
          }
        } catch {
          setProfileError(true);
          return;
        }
      }

      router.replace(consumePostLoginRedirect());
    })();
  }, [queryClient, router]);

  if (profileError) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <p>Could not load your student profile.</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <div>
      <Loader>Loading...</Loader>
    </div>
  );
};

export default InternalSetupPage;
