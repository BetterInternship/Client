"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card } from "../../components/card";
import { Badge } from "@/components/ui/badge";
import { Download, Edit, Redo } from "lucide-react";

// ! unimplemented
export const Page = () => {
  const router = useRouter();
  return (
    <div className="w-[100vw] max-h-screen flex flex-col justify-left items-center overflow-auto">
      <div className="w-fit flex flex-col justify-left items-start p-24 py-32 gap-8">
        <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
          MOA Dashboard
        </div>
        <Card className="w-full">
          <div className="font-bold text-2xl mb-4">DLSU MOA Details</div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <div className="w-64 max-w-64">MOA Status:</div>
              <div className="w-64 max-w-64">Active</div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-64 max-w-64">Valid Until:</div>
              <div className="w-64 max-w-64">02/15/26</div>
            </div>
          </div>
          <a
            href="https://api.dev.betterinternship.com/api/services/sample-signed"
            className="underline"
            target="_blank"
          >
            <Button variant="outline" scheme="primary" className="w-fit mt-4">
              Download MOA
              <Download />
            </Button>
          </a>
        </Card>
        <div className="text-3xl tracking-tighter text-gray-700 text-left min-w-[600px] mt-4">
          Available Actions
        </div>

        <div className="flex flex-row items-start gap-8">
          <Button variant="outline" className="w-fit h-fit p-0">
            <Card className="p-8 w-prose max-w-prose">
              <div className="flex flex-col gap-4 justify-start">
                <Redo className="!w-24 !h-24" />
                <div className="text-4xl text-gray-700 tracking-tighter text-left">
                  Renew MOA
                </div>
                <div className="max-w-prose text-left">
                  Extend your current agreement for another term.
                </div>
                <br />
                <Button
                  scheme="primary"
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/standard")}
                >
                  Renew MOA
                </Button>
              </div>
            </Card>
          </Button>
          <Button variant="outline" className="w-fit h-fit p-0">
            <Card className="p-8 w-prose max-w-prose">
              <div className="flex flex-col gap-4 justify-start">
                <Edit className="!w-24 !h-24" />
                <div className="text-4xl text-gray-700 tracking-tighter text-left">
                  Request Ammendment
                </div>
                <div className="max-w-prose text-wrap text-left">
                  Modify the terms of your existing MOA contract.
                </div>
                <br />
                <Button
                  scheme="primary"
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/negotiated")}
                >
                  Request Ammendment
                </Button>
              </div>
            </Card>
          </Button>
        </div>
        <div className="text-3xl tracking-tighter text-gray-700 text-left min-w-[600px] mt-4">
          Activity Log
        </div>
        <Card className="w-full">
          <pre>
            [08/21/2024] MOA Renewed <br />
            [01/20/2023] MOA Renewed <br />
            [12/10/2022] MOA Requested <br />
            [12/01/2022] Company Registered <br />
          </pre>
        </Card>
      </div>
    </div>
  );
};

export default Page;
