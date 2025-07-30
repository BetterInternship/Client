"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SquareCheckBig } from "lucide-react";
import { Card } from "../../components/card";

export default function TrackerPage() {
  const router = useRouter();

  return (
    <div className="w-[100vw] min-h-screen flex flex-col justify-left items-start p-24 py-32 gap-8">
      <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
        MOA Request Rewiew
      </div>
      <Card>
        <div className="flex flex-col gap-2">
          <Badge type="warning" className="w-fit mb-8">
            Under Review
          </Badge>
          <div className="text-4xl text-gray-700 tracking-tighter">
            ABC Corporation
          </div>
          <div className="flex flex-row gap-2">
            <Badge className="w-fit">Request ID: #MOA-2024-001234</Badge>
            <Badge className="w-fit">Submitted: Jan 20, 2024</Badge>
          </div>
          <a
            href="https://api.dev.betterinternship.com/api/services/sample-signed"
            className="underline mt-4"
            target="_blank"
          >
            <Button variant="outline" scheme="primary" className="w-full">
              View MOA Document
            </Button>
          </a>
          <br />
          <hr />
          <br />
          <div className="text-xl font-bold text-gray-700 tracking-tighter">
            Company Details
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <div className="w-64 max-w-64">Company Name:</div>
              <div className="w-64 max-w-64">ABC Corporation</div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-64 max-w-64">Business Address:</div>
              <div className="w-64 max-w-64">
                123 Business District, Makati City
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-64 max-w-64">Contact Person:</div>
              <div className="w-64 max-w-64">John Smith, CEO</div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-64 max-w-64">Email Address:</div>
              <div className="w-64 max-w-64">john.smith@abc.com</div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-64 max-w-64">TIN Number:</div>
              <div className="w-64 max-w-64">123-456-789-000</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
