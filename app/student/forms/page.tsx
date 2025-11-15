"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper } from "lucide-react";
import {
  fetchForms,
  fetchAllUserForms,
  fetchSignedDocument,
  fetchPendingDocument,
  fetchTemplateDocument,
  fetchPrefilledDocument,
} from "@/lib/db/use-moa-backend";
import FormGenerateCard from "@/components/features/student/forms/FormGenerateCard";
import MyFormCard from "@/components/features/student/forms/MyFormCard";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { FormFlowRouter } from "@/components/features/student/forms/FormFlowRouter";
import { useProfileData } from "@/lib/api/student.data.api";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/new-tabs";

/**
 * The forms page component
 *
 * @component
 */
export default function FormsPage() {
  const queryClient = useQueryClient();
  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();
  const profile = useProfileData();
  const router = useRouter();
  const userId = profile.data?.id;
  const [pendingDocs, setPendingDocs] = useState<Record<string, string[]>>({});
  const [tab, setTab] = useState<string>("");

  // All form templates
  const {
    data: formList = [],
    isLoading,
    isPending,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["forms:list"],
    queryFn: async () => (profile.data ? await fetchForms(profile.data) : []),
    staleTime: 10_000,
    gcTime: 10_000,
  });

  const generatorForms = formList;

  const openFormModal = (
    formName: string,
    formVersion: number,
    formLabel: string,
  ) => {
    openGlobalModal(
      "form-generator-form",
      <FormFlowRouter
        formName={formName}
        formVersion={formVersion}
        onGoToMyForms={() => {
          setTab("forms");
          closeGlobalModal("form-generator-form");
        }}
      />,
      {
        title: `Generate ${formLabel}`,
        hasClose: true,
        onClose: () => closeGlobalModal("form-generator-form"),
        allowBackdropClick: false,
        panelClassName: "sm:w-full sm:max-w-2xl",
      },
    );
  };

  const {
    data: myForms,
    isLoading: loadingMyForms,
    error: myFormsError,
  } = useQuery({
    queryKey: ["my_forms", userId],
    enabled: !!userId,
    queryFn: () => (userId ? fetchAllUserForms(userId) : []),
    staleTime: 10_000,
    gcTime: 10_000,
  });

  const myFormsSorted = useMemo(
    () =>
      (myForms ?? [])
        .slice()
        .sort((a, b) => parseTsToMs(b.timestamp) - parseTsToMs(a.timestamp)),
    [myForms],
  );

  // prefetch pending documents for rows that have pending_document_id
  useEffect(() => {
    if (!myForms?.length) return;

    const ids = Array.from(
      new Set(
        myForms.map((r) => r.pending_document_id).filter(Boolean) as string[],
      ),
    );

    let cancelled = false;
    void (async () => {
      for (const id of ids) {
        if (!id || pendingDocs[id]) continue;
        try {
          const resp = await fetchPendingDocument(id);
          if (cancelled) return;

          const parties = (resp?.data?.pending_parties ?? []).map(String);

          if (!cancelled) {
            setPendingDocs((prev) => ({
              ...prev,
              [id]: parties,
            }));
          }
        } catch {
          // ignore; don't block UI
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [myForms, pendingDocs]);

  if (!profile.data?.department && !profile.isPending) {
    alert("Profile not yet complete.");
    router.push("/profile");
  }

  // ! todo: make this more efficient
  useEffect(() => {
    if (tab === "My Forms" && userId) {
      void queryClient.invalidateQueries({ queryKey: ["my_forms", userId] });
    }
  }, [tab, userId, queryClient]);

  return (
    <div className="container max-w-6xl px-4 sm:px-10 pt-6 sm:pt-16 mx-auto">
      <div className="mb-6 sm:mb-8 animate-fade-in space-y-10">
        <div>
          <div className="flex flex-row items-center gap-3 mb-4">
            <HeaderIcon icon={Newspaper} />
            <HeaderText>Forms</HeaderText>
          </div>
          <div className="flex-1 flex-row">
            <p className="text-gray-600 text-sm sm:text-base mb-2 space-y-1">
              Generate internship documents using your saved details.
              <div className="flex gap-1">
                <div className="text-primary font-semibold">
                  • Generate for Manual Signing
                </div>{" "}
                fills the form without digital signatures (use this if you
                prefer wet/offline signatures).
              </div>
              <div className="flex gap-1">
                <div className="text-primary font-semibold">
                  • Generate & Initiate E-Sign
                </div>{" "}
                creates the form and starts the electronic signing workflow for
                all parties.
              </div>
            </p>
          </div>
        </div>

        <Tabs
          className="gap-0"
          value={tab || "form-generator"}
          defaultValue={"form-generator"}
          onValueChange={setTab}
        >
          <TabsList className="rounded-b-none border-b-0">
            <TabsTrigger value="form-generator">Form Generator</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
          </TabsList>
          <div className="bg-white border border-gray-300 border-t-0 p-8">
            <TabsContent value={"form-generator"}>
              {(isLoading || isPending || isFetching) && (
                <Loader>Loading latest forms...</Loader>
              )}
              <div className="space-y-3">
                {error && <p className="text-red-600">Failed to load forms</p>}
                {!error &&
                  !(isLoading || isPending || isFetching) &&
                  (generatorForms?.length ?? 0) === 0 && (
                    <div className="text-sm text-gray-600">
                      <p>
                        There are no forms available yet for your department.
                      </p>
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
                    isLoading || isPending || isFetching
                      ? "opacity-50 pointer-events-none"
                      : "",
                    "flex flex-col gap-2",
                  )}
                >
                  {!error &&
                    generatorForms?.length !== 0 &&
                    generatorForms.map((form, i) => (
                      <FormGenerateCard
                        key={form.name + i}
                        formName={form.name}
                        onViewTemplate={() => {
                          if (!form.base_document_id) {
                            alert("No template available for this form.");
                            return;
                          }

                          fetchTemplateDocument(form.base_document_id)
                            .then((res) => {
                              const link = res?.data?.url;
                              if (link) {
                                window.open(link, "noopener,noreferrer");
                              } else {
                                alert("Template not available.");
                              }
                            })
                            .catch((e) => {
                              console.error(e);
                              window.close();
                              alert("Failed to load template.");
                            });
                        }}
                        onGenerate={() =>
                          openFormModal(
                            form.name,
                            form.version,
                            form.label ?? "",
                          )
                        }
                      />
                    ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="forms">
              <div className="space-y-3">
                {!userId && <div>Loading profile…</div>}
                {userId && loadingMyForms && <div>Loading…</div>}
                {userId && myFormsError && (
                  <p className="text-red-600">Failed to load your forms</p>
                )}
                {userId &&
                  !loadingMyForms &&
                  !myFormsError &&
                  !myForms?.length && (
                    <p className="text-muted-foreground text-sm">
                      You haven't generated any forms yet.
                    </p>
                  )}

                {userId &&
                  !loadingMyForms &&
                  !myFormsError &&
                  myFormsSorted.map((row, i) => {
                    const title = `${row.label ?? row.form_name}`;
                    const status =
                      row.signed_document_id || row.prefilled_document_id
                        ? "Complete"
                        : "Pending ";
                    const waitingFor: string[] = row.pending_document_id
                      ? (pendingDocs[row.pending_document_id] ?? [])
                      : [];

                    return (
                      <MyFormCard
                        key={i}
                        title={title}
                        requestedAt={row.timestamp}
                        status={status}
                        waitingFor={waitingFor}
                        getDownloadUrl={async () => {
                          // 1) signed document (highest priority)
                          if (row.signed_document_id) {
                            console.log(row.signed_document_id);
                            const signedDocument = await fetchSignedDocument(
                              row.signed_document_id,
                            );

                            const url = signedDocument.data?.verification_code
                              ? `https://storage.googleapis.com/better-internship-public-bucket/${signedDocument.data.verification_code}.pdf`
                              : null;

                            if (url) return url;
                          }

                          // 2) prefilled document
                          if (row.prefilled_document_id) {
                            const prefilledDocument =
                              await fetchPrefilledDocument(
                                row.prefilled_document_id,
                              );
                            const url = prefilledDocument.data?.url;
                            if (url) return url;
                          }
                        }}
                      />
                    );
                  })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function parseTsToMs(ts?: string | Date) {
  if (!ts) return 0;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "string") {
    // keep only the first 3 fractional digits (ms) so Date can parse it
    const normalized = ts.replace(/\.(\d{3})\d+/, ".$1");
    const t = new Date(normalized).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
}
