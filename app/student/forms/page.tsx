"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OutsideTabPanel, OutsideTabs } from "@/components/ui/outside-tabs";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper } from "lucide-react";
import { fetchForms } from "@/lib/db/use-moa-backend";
import { DynamicForm } from "@/components/features/student/forms/DynamicForm";
import FormGenerateCard from "@/components/features/student/forms/FormGenerateCard";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { FormFlowRouter } from "@/components/features/student/forms/FormFlowRouter";

/**
 * The forms page component
 *
 * @component
 */
type TabKey = "Form Generator" | "My Forms";
export default function FormsPage() {
  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();

  const [tab, setTab] = useState<TabKey>("Form Generator");
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

  const openFormModal = (formName: string, formLabel: string) => {
    openGlobalModal(
      "form-generator-form",
      <FormFlowRouter baseForm={formName} />,
      {
        title: `Generate ${formLabel}`,
        hasClose: true,
        onClose: () => closeGlobalModal("form-generator-form"),
        allowBackdropClick: true,
        panelClassName: "sm:w-full sm:max-w-2xl",
      },
    );
  };

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

        {/* Tabs */}
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
            <div>Panel 2</div>
          </OutsideTabPanel>
        </OutsideTabs>
      </div>
    </div>
  );
}
