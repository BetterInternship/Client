"use client";

import { useState, useEffect } from "react";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { ChevronRight, Newspaper } from "lucide-react";
import { FormTemplate } from "@/lib/db/use-moa-backend";
import FormTemplateCard from "@/components/features/student/forms/FormGenerateCard";
import { FormsNavigation } from "@/components/features/student/forms/FormsNavigation";
import { useProfileData } from "@/lib/api/student.data.api";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { FormService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

/**
 * The forms page component
 *
 * @component
 */
export default function FormsPage() {
  const profile = useProfileData();
  const router = useRouter();

  // ! refactor into a hook
  const { data: formTemplates, isLoading } = useQuery({
    queryKey: ["my-form-templates"],
    queryFn: () => FormService.getMyFormTemplates(),
    staleTime: 60 * 60 * 1000 * 24,
    gcTime: 60 * 60 * 1000 * 24,
  });

  if (!profile.data?.department && !profile.isPending) router.push("/profile");

  return (
    <>
      <FormsNavigation />
      <div className="container max-w-5xl pt-8 mx-auto">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={Newspaper}></HeaderIcon>
            <HeaderText>Internship Forms</HeaderText>
          </div>
          <div className="flex-1 flex-row mt-4">
            <div className="text-gray-600 text-sm sm:text-base mb-2 space-y-1">
              <div className="md:flex gap-1">
                <div className="text-primary font-semibold">
                  Generate for Manual Signing
                </div>
                : fills the form without digital signatures (use this if you
                prefer wet/offline signatures).
              </div>
              <div className="md:flex gap-1">
                <div className="text-primary font-semibold">
                  Generate & Initiate E-Sign
                </div>
                : creates the form and starts the electronic signing workflow
                for all parties.
              </div>
              <div className="mt-2">
                If you run into any issues, contact us via{" "}
                <a
                  href="https://www.facebook.com/profile.php?id=61579853068043"
                  className="underline"
                >
                  Facebook
                </a>
                .
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
                formTemplates.map((form, i) => (
                  <FormTemplateCard
                    key={form.formName + i}
                    formLabel={form.formLabel}
                    onGenerate={() => router.push(`/forms/${form.formName}`)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
