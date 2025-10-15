"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OutsideTabPanel, OutsideTabs } from "@/components/ui/outside-tabs";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper, Rows2 } from "lucide-react";
import {
  fetchForms,
  fetchAllUserForms,
  fetchSignedDocument,
  fetchPendingDocument,
} from "@/lib/db/use-moa-backend";
import FormGenerateCard from "@/components/features/student/forms/FormGenerateCard";
import MyFormCard from "@/components/features/student/forms/MyFormCard";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { FormFlowRouter } from "@/components/features/student/forms/FormFlowRouter";
import { useProfileData } from "@/lib/api/student.data.api";
import { UserService } from "@/lib/api/services";
import { useRouter } from "next/navigation";

/**
 * The forms page component
 *
 * @component
 */
type TabKey = "Form Generator" | "My Forms";

export default function FormsPage() {
  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();
  const profile = useProfileData();
  const router = useRouter();
  const userId = profile.data?.id;
  const [tab, setTab] = useState<TabKey>("Form Generator");

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
  const openFormModal = (formName: string, formLabel: string) => {
    openGlobalModal(
      "form-generator-form",
      <FormFlowRouter
        baseForm={formName}
        // ! remove hard code,
        allowInvite={true}
        onGoToMyForms={() => {
          setTab("My Forms");
          closeGlobalModal("form-generator-form");
        }}
      />,
      {
        title: `Generate ${formLabel}`,
        hasClose: true,
        onClose: () => closeGlobalModal("form-generator-form"),
        allowBackdropClick: true,
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

  const { data: employersData } = useQuery({
    queryKey: ["companies:list"],
    queryFn: async () => await UserService.getEntityList(),
    staleTime: 60_000,
  });

  const companyMap: Record<string, string> = useMemo(
    () =>
      Object.fromEntries(
        (employersData?.employers ?? []).map((e) => [
          String(e.id),
          e.legal_entity_name,
        ]),
      ),
    [employersData],
  );

  if (!profile.data?.department && !profile.isPending) {
    alert("Profile not yet complete.");
    router.push("/profile");
  }

  return (
    <div className="container max-w-6xl px-4 sm:px-10 pt-6 sm:pt-16 mx-auto">
      <div className="mb-6 sm:mb-8 animate-fade-in space-y-5">
        <div>
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={Newspaper} />
            <HeaderText>Forms</HeaderText>
          </div>
          <div className="flex-1 flex-row">
            <p className="text-gray-600 text-sm sm:text-base mb-2">
              Automatically generate the internship forms you need using your
              saved details.
            </p>
          </div>
        </div>

        <OutsideTabs
          value={tab}
          onChange={(v) => setTab(v as TabKey)}
          tabs={[
            { key: "Form Generator", label: "Form Generator" },
            { key: "My Forms", label: "My Forms" },
          ]}
        >
          <OutsideTabPanel when="Form Generator" activeKey={tab}>
            <div className="space-y-3">
              {(isLoading || isPending || isFetching) && <div>Loading...</div>}
              {error && <p className="text-red-600">Failed to load forms</p>}
              {!error &&
                !(isLoading || isPending || isFetching) &&
                (generatorForms?.length ?? 0) === 0 && (
                  <div className="text-sm text-gray-600">
                    <p>There are no forms available yet for your department.</p>
                    <p className="mt-1 text-muted-foreground">
                      Need help? Email{" "}
                      <a
                        href="mailto:hello@betterinternship.com"
                        className="underline"
                      >
                        hello@betterinternship.com
                      </a>
                      .
                    </p>
                  </div>
                )}
              {!isLoading &&
                !error &&
                generatorForms?.length !== 0 &&
                generatorForms.map((form) => (
                  <FormGenerateCard
                    key={form.id}
                    formTitle={form.label ?? ""}
                    onGenerate={() =>
                      openFormModal(form.name, form.label ?? "")
                    }
                  />
                ))}
            </div>
          </OutsideTabPanel>

          <OutsideTabPanel when="My Forms" activeKey={tab}>
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
                    You haven’t generated any forms yet.
                  </p>
                )}

              {userId &&
                !loadingMyForms &&
                !myFormsError &&
                myForms.map((row, i) => {
                  const formName = row.form_name;
                  const companyName = companyMap[row.employer_id];
                  const title = `${formName} | ${companyName}`;
                  const status: "Pending" | "Signed" = row.signed_document_id
                    ? "Signed"
                    : "Waiting for signature/s";
                  return (
                    <MyFormCard
                      key={i}
                      title={title}
                      requestedAt={row.timestamp}
                      status={status}
                      getDownloadUrl={async () => {
                        if (row.signed_document_id) {
                          const signedDocument = await fetchSignedDocument(
                            row.signed_document_id,
                          );

                          return `https://storage.googleapis.com/better-internship-public-bucket/${signedDocument.data?.verification_code}.pdf`;
                        }

                        if (row.pending_document_id) {
                          const pendingDocument = await fetchPendingDocument(
                            row.pending_document_id,
                          );

                          return `https://storage.googleapis.com/better-internship-public-bucket/${pendingDocument.data?.verification_code}.pdf`;
                        }

                        alert("No document associated with request.");
                      }}
                      downloading={false}
                    />
                  );
                })}
            </div>
          </OutsideTabPanel>
        </OutsideTabs>
      </div>
    </div>
  );
}
