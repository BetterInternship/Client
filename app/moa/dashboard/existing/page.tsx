"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// ! unimplemented
export const Page = () => {
  const router = useRouter();
  return (
    <div>
      <div>Your MOA Dashboard</div>

      <div>Standard MOA Agreement</div>
      <div>Available Actions</div>
      <div className="flex flex-row">
        <Button className="" onClick={() => router.push("/standard")}>
          <div>Renew MOA</div>
        </Button>
        <Button className="" onClick={() => router.push("/negotiated")}>
          <div>Request Ammendments</div>
        </Button>
      </div>
    </div>
  );
};

export default Page;
