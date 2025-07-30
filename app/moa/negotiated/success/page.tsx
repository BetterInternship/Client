"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SquareCheckBig } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="w-[100vw] min-h-screen flex flex-col justify-left items-start p-24 py-32 gap-8">
      <SquareCheckBig className="!w-24 !h-24 text-supportive" />
      <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
        Request Submitted Successfully!
      </div>
      <div className="text-gray-700 text-xl max-w-prose">
        Your Custom MOA request has been submitted to DLSU for review.
        <br />
        <br />
        <div className="flex flex-col gap-2">
          <Badge type="primary" className="w-fit">
            Reference Number: #MOA-2024-001234
          </Badge>
          <Badge type="warning" className="w-fit">
            Expected processing time: 2-4 weeks
          </Badge>
        </div>
        <br />
        You will receive email updates on the status of your request.
      </div>
      <div className="flex flex-row gap-2">
        <Button
          size="lg"
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Go To Dashboard
        </Button>
        <Button size="lg" onClick={() => router.push("/tracker")}>
          Track Request
        </Button>
      </div>
    </div>
  );
}
