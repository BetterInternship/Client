"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OutsideTabPanel, OutsideTabs } from "@/components/ui/outside-tabs";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper } from "lucide-react";
import {
  fetchForms,
  fetchAllUserForms,
  type IUserForm,
} from "@/lib/db/use-moa-backend";
import FormGenerateCard from "@/components/features/student/forms/FormGenerateCard";
import MyFormCard from "@/components/features/student/forms/MyFormCard";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { FormFlowRouter } from "@/components/features/student/forms/FormFlowRouter";
import { useProfileData } from "@/lib/api/student.data.api";
import { UserService } from "@/lib/api/services";

/**
 * The forms page component
 *
 * @component
 */
type TabKey = "Form Generator" | "My Forms";

export default function FormsPage() {
  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();
  const { data: profile } = useProfileData();
  const userId = profile?.id;

  const [tab, setTab] = useState<TabKey>("Form Generator");

  // All form templates
  const {
    data: formList = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["forms:list"],
    queryFn: fetchForms,
    staleTime: 10_000,
    gcTime: 10_000,
  });

  const generatorForms = (formList ?? []).filter(
    (f) => !/-invite$|-manual$/i.test(f.name),
  );
  const formNameSet = new Set(formList.map((f) => f.name)); // maps if there is invite or manual forms of a form

  const openFormModal = (formName: string, formLabel: string) => {
    const hasInvite = formNameSet.has(`${formName}-invite`);
    const hasManual = formNameSet.has(`${formName}-manual`);
    openGlobalModal(
      "form-generator-form",
      <FormFlowRouter
        baseForm={formName}
        allowInvite={hasInvite}
        allowManual={hasManual}
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
    data: myForms = [],
    isLoading: loadingMyForms,
    error: myFormsError,
  } = useQuery({
    queryKey: ["my_forms", userId],
    enabled: !!userId,
    queryFn: () => fetchAllUserForms(userId!),
    staleTime: 10_000,
    gcTime: 10_000,
  });

  const { data: employersData } = useQuery({
    queryKey: ["companies:list"],
    queryFn: UserService.getEntityList,
    staleTime: 60_000,
  });

  const companyMap: Record<string, string> = useMemo(
    () =>
      Object.fromEntries(
        (employersData?.employers ?? []).map((e: any) => [
          String(e.id),
          e.legal_entity_name,
        ]),
      ),
    [employersData],
  );

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
              {isLoading && <div>Loading...</div>}
              {error && <p className="text-red-600">Failed to load forms</p>}
              {!isLoading &&
                !error &&
                generatorForms.map((form) => (
                  <FormGenerateCard
                    key={form.id}
                    formTitle={form.label}
                    onGenerate={() => openFormModal(form.name, form.label)}
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
                myForms.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    You haven’t generated any forms yet.
                  </p>
                )}

              {userId &&
                !loadingMyForms &&
                !myFormsError &&
                myForms.map((row) => {
                  const formName = row.form_name;
                  const companyName = companyMap[row.entity_id];
                  const title = `${formName} | ${companyName}`;
                  const status: "Pending" | "Signed" = row.signed_document_id
                    ? "Signed"
                    : "Waiting for signature/s";
                  return (
                    <MyFormCard
                      title={title}
                      requestedAt={row.timestamp}
                      status={status}
                      onDownload={() => {}}
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
