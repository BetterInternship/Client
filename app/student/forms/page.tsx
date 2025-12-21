"use client";

import { useState, useEffect } from "react";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper } from "lucide-react";
import { fetchForms, FormTemplate } from "@/lib/db/use-moa-backend";
import FormGenerateCard from "@/components/features/student/forms/FormGenerateCard";
import { useProfileData } from "@/lib/api/student.data.api";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

/**
 * The forms page component
 *
 * @component
 */
export default function FormsPage() {
  const profile = useProfileData();
  const router = useRouter();
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);

  // All form templates
  useEffect(() => {
    if (!profile.data) return;
    setFormLoading(true);
    void fetchForms(profile.data)
      .then((formTemplates) =>
        setFormTemplates([
          // ! remove this after testing lol
          ...formTemplates,
          ...formTemplates,
          ...formTemplates,
          ...formTemplates,
          ...formTemplates,
          ...formTemplates,
          ...formTemplates,
          ...formTemplates,
          ...formTemplates,
        ]),
      )
      .then(() => setFormLoading(false))
      .catch(() => setFormLoading(false));
  }, [profile.data]);

  if (!profile.data?.department && !profile.isPending) router.push("/profile");

  return (
    <div className="container max-w-5xl p-10 pt-16 mx-auto">
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
              : creates the form and starts the electronic signing workflow for
              all parties.
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
      <Separator className="mt-4 mb-8" />

      <div className="mb-6 sm:mb-8 animate-fade-in space-y-10">
        {formLoading && <Loader>Loading latest forms...</Loader>}
        <div className="space-y-3">
          {!formLoading && (formTemplates?.length ?? 0) === 0 && (
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
              formLoading ? "opacity-50 pointer-events-none" : "",
              "grid sm:grid-cols-4 grid-cols-2 gap-5",
            )}
          >
            {formTemplates?.length !== 0 &&
              formTemplates.map((form, i) => (
                <FormGenerateCard
                  key={form.formName + i}
                  formLabel={form.formLabel}
                  onGenerate={() => router.push(`/forms/${form.formName}`)}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
