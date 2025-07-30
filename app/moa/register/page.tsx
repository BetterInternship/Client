"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// ! unimplemented
export const Page = () => {
  const router = useRouter();
  return (
    <div>
      Register page
      <Button
        onClick={() => {
          router.push("/otp");
        }}
      >
        Submit
      </Button>
    </div>
  );
};

export default Page;
