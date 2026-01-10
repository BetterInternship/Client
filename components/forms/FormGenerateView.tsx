"use client";

import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper, MessageSquare } from "lucide-react";
import FormTemplateCard from "@/components/features/student/forms/FormGenerateCard";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
    <div className="container max-w-5xl pt-8 mx-auto overflow-y-auto h-full">
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <div className="flex flex-row items-center gap-3 mb-2">
          <HeaderIcon icon={Newspaper}></HeaderIcon>
          <HeaderText>Internship Forms</HeaderText>
        </div>
        <div className="flex-1 flex-row mt-4">
          <div className="text-gray-600 text-sm space-y-2">
            <div>
              <span className="text-primary font-semibold">
                Print for Wet Signatures
              </span>
              <span className="text-gray-600">
                : You'll complete the form and sign it by hand after printing.
              </span>
            </div>
            <div>
              <span className="text-primary font-semibold">
                Sign via BetterInternship
              </span>
              <span className="text-gray-600">
                : Start an online signing process through BetterInternship.
                We'll email all required parties and let you track progress —
                10× faster.
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm text-gray-700">
                Run into issues?{" "}
                <a
                  href="https://www.facebook.com/profile.php?id=61579853068043"
                  className="text-primary font-medium underline"
                >
                  Contact us via Facebook
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Separator className="" />

      <div className="mb-6 sm:mb-8 animate-fade-in space-y-10">
        {isLoading && <Loader>Loading latest forms...</Loader>}
        <div className="space-y-3">
          {!isLoading && (formTemplates?.length ?? 0) === 0 && (
            <div className="text-sm text-gray-600">
              <p>There are no forms available yet for your department.</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Need help? Email{" "}
                <a
                  href="mailto:hello@betterinternship.com"
                  className="underline"
                >
                  hello@betterinternship.com
                </a>{" "}
                or contact us via{" "}
                <a
                  href="https://www.facebook.com/profile.php?id=61579853068043"
                  className="underline"
                >
                  Facebook
                </a>
                .
              </p>
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
  );
}
