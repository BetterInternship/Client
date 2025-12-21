"use client";

import { FormFlowRouter } from "@/components/features/student/forms/FormFlowRouter";
import { GenerateButtons } from "@/components/features/student/forms/GenerateFormButtons";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * The individual form page.
 * Allows viewing an individual form.
 */
export default function FormPage() {
  const [formName, setFormName] = useState<string>("");
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const { name } = params;
    setFormName(name as string);
  }, [params]);

  return (
    <div className="w-full flex flex-col h-full bg-gray-50">
      {/* // ! factor out this header in the future */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto py-4">
          <div className="flex sm:items-center items-start justify-between flex-col sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              <GenerateButtons
                handleSubmit={function (
                  withEsign?: boolean,
                ): Promise<void> | void {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <FormFlowRouter formName={formName} />
    </div>
  );
}
