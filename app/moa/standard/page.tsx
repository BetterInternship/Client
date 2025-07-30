"use client";

import { useRouter } from "next/navigation";
import { Card } from "../components/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormCheckbox, FormInput } from "@/components/EditForm";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");

  return (
    <div className="w-[100vw] min-h-screen flex flex-col justify-left items-start p-24 py-32 gap-8">
      <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
        Standard MOA Request
      </div>
      <div className="text-gray-700 text-xl">
        Please provide the signatory information and digital signature
        authorization.
      </div>
      <div className="flex flex-row items-start gap-8">
        <FormInput
          value={name}
          setter={(value) => setName(value)}
          label="Authorized Signatory Name"
          className="border-gray-400 placeholder-gray-200"
        ></FormInput>
        <FormInput
          value={title}
          setter={(value) => setTitle(value)}
          label="Signatory Title/Position"
          className="border-gray-400 placeholder-gray-200"
        ></FormInput>
      </div>
      <Card>
        <div className="flex flex-row items-center gap-4">
          <FormCheckbox
            checked={consent}
            setter={(value) => setConsent(value)}
          />
          <div className="flex flex-col items-start gap-4">
            <div className="text-gray-700 italic max-w-prose">
              I hereby declare that I am authorized to sign on behalf of the
              company and accept the terms of the Standard MOA template. I
              understand that this agreement will be legally binding once
              executed by both parties.
            </div>
            <a href="#" className="underline">
              Download Standard MOA Template
            </a>
          </div>
        </div>
      </Card>
      <Button
        disabled={!consent || !name.trim() || !title.trim()}
        scheme="primary"
        size="lg"
        onClick={() => router.push("/standard/success")}
      >
        Submit MOA Request
      </Button>
    </div>
  );
}
