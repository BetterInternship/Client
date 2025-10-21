"use client";

import { Loader } from "@/components/ui/loader";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const InternalSetupPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      await queryClient.invalidateQueries({ queryKey: ["my-saved-jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      router.push("/search");
    })();
  });

  return (
    <div>
      <Loader>Loading...</Loader>
    </div>
  );
};

export default InternalSetupPage;
