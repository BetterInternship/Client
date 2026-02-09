"use client";

import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper, MessageSquare } from "lucide-react";
import FormTemplateCard from "@/components/features/student/forms/FormGenerateCard";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { HorizontalCollapsible } from "@/components/ui/horizontal-collapse";

/**
 * Generate Forms View
 */
export function FormGenerateView({
  formTemplates,
  isLoading,
}: {
  formTemplates: any[] | undefined;
  isLoading: boolean;
}) {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto px-4">
      <div className="max-w-5xl pt-8 mx-auto">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={Newspaper}></HeaderIcon>
            <HeaderText>Internship Forms</HeaderText>
          </div>

          <div className="text-gray-600 text-sm space-y-3">
            <div className="flex gap-2 items-center">
              <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className=" text-gray-700">
                Need help? Contact us via{" "}
                <a
                  href="https://www.facebook.com/profile.php?id=61579853068043"
                  className="text-primary font-medium underline"
                >
                  Facebook
                </a>{" "}
                or{" "}
                <a
                  href="mailto:hello@betterinternship.com"
                  className="text-primary font-medium underline"
                >
                  email
                </a>
              </p>
            </div>
            <HorizontalCollapsible
              title="How to generate a form"
              className="bg-transparent"
            >
              <div className="aspect-video rounded-[0.33em] overflow-hidden border border-gray-200 bg-gray-100 ">
                <iframe
                  loading="lazy"
                  src="https://www.canva.com/design/DAG2Z5YJXgA/gS-WRa6O-bFzg77gnzBeyA/view?embed"
                  className="w-full h-full"
                ></iframe>
              </div>
            </HorizontalCollapsible>
          </div>
        </div>

        <Separator className="" />

        <div className="mb-6 sm:mb-8 animate-fade-in space-y-6">
          {isLoading && <Loader>Loading latest forms...</Loader>}
          <div className="space-y-3">
            {!isLoading && (formTemplates?.length ?? 0) === 0 && (
              <div className="text-sm text-gray-600">
                <p>There are no forms available yet for your department.</p>
              </div>
            )}
            <div
              className={cn(
                isLoading ? "opacity-50 pointer-events-none" : "",
                "flex flex-col",
              )}
            >
              {formTemplates?.length &&
                formTemplates
                  .sort((a, b) => a.formName.localeCompare(b.formName))
                  .map((form, i) => (
                    <FormTemplateCard
                      key={form.formName + i}
                      formLabel={form.formLabel}
                      formName={form.formName}
                      onGenerate={() => router.push(`/forms/${form.formName}`)}
                    />
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
