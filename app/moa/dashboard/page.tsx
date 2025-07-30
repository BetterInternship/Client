"use client";

import { useRouter } from "next/navigation";
import { Card } from "../components/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="w-[100vw] min-h-screen flex flex-col justify-left items-start p-24 py-32 gap-8">
      <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
        Welcome to your dashboard
      </div>
      <div className="text-gray-700 text-xl">
        Choose the type of MOA you'd like to request.
      </div>
      <div className="flex flex-row items-start gap-8">
        <Button variant="outline" className="w-fit h-fit p-0">
          <Card className="p-8 w-prose max-w-prose">
            <div className="flex flex-col gap-4 justify-start">
              <Badge type="supportive" className="w-fit">
                RECOMMENDED
              </Badge>
              <div className="text-4xl text-gray-700 tracking-tighter text-left">
                Standard MOA
              </div>
              <div className="max-w-prose text-left">
                Use our pre-approved template for most <br />
                common partnership agreements.
              </div>
              <Badge type="supportive" className="w-fit">
                Processing time: 1-2 Business Days
              </Badge>
              <br />
              <Button
                scheme="primary"
                variant="outline"
                size="lg"
                onClick={() => router.push("/standard")}
              >
                Get Started
              </Button>
            </div>
          </Card>
        </Button>
        <Button variant="outline" className="w-fit h-fit p-0">
          <Card className="p-8 w-prose max-w-prose">
            <div className="flex flex-col gap-4 justify-start">
              <Badge type="supportive" className="w-fit invisible">
                RECOMMENDED
              </Badge>

              <div className="text-4xl text-gray-700 tracking-tighter text-left">
                Negotiated MOA
              </div>
              <div className="max-w-prose text-wrap text-left">
                Submit your own custom terms for specialized partnerships <br />
                requiring unique conditions.
              </div>
              <Badge type="warning" className="w-fit">
                Processing time: 2-4 weeks
              </Badge>
              <br />
              <Button
                scheme="primary"
                variant="outline"
                size="lg"
                onClick={() => router.push("/negotiated")}
              >
                Get Started
              </Button>
            </div>
          </Card>
        </Button>
      </div>
    </div>
  );
}
