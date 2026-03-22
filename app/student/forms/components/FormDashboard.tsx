"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileSearch, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FormTemplate } from "@/lib/db/use-moa-backend";
import { Loader } from "@/components/ui/loader";
import {
  FormRendererContextBridge,
  useFormRendererContext,
} from "@/components/features/student/forms/form-renderer.ctx";
import {
  FormFillerContextBridge,
  useFormFiller,
} from "@/components/features/student/forms/form-filler.ctx";
import {
  SignContextBridge,
  useSignContext,
} from "@/components/providers/sign.ctx";
import { FormSigningLayout } from "./FormSigningLayout";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { FormHistoryView } from "@/components/forms/FormHistoryView";
import { FormTemplatesList } from "./FormTemplatesList";
import { FormActionButtons } from "./FormActionButtons";
import { FormActionAccordion } from "./FormActionAccordion";
import { FormSigningPartyTimeline } from "./FormSigningPartyTimeline";
import { FormMobileCloseConfirmation } from "./FormMobileCloseConfirmation";
import { useMobile } from "@/hooks/use-mobile";
import useModalRegistry from "@/components/modals/modal-registry";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useHeaderContext } from "@/lib/ctx-header";
import {
  FRESH_FORMS_QUERY_PARAM,
  clearFreshHistoryCutoffMsInStorage,
  getFreshHistoryCutoffMsFromStorage,
  setFreshHistoryCutoffMsInStorage,
} from "../fresh-history";

type GeneratedFormItem = {
  form_process_id?: string;
  label: string;
  prefilled_document_id?: string | null;
  pending_document_id?: string | null;
  signed_document_id?: string | null;
  latest_document_url?: string | null;
  timestamp: string;
  signing_parties?: IFormSigningParty[];
  status?: string | null;
  rejection_reason?: string;
  pending?: boolean;
};

const getTimestampMs = (timestamp?: string) => {
  const parsed = Date.parse(timestamp ?? "");
  return Number.isNaN(parsed) ? null : parsed;
};

export default function FormDashboard({
  generatedForms,
  formTemplates,
  isLoading,
}: {
  generatedForms: GeneratedFormItem[];
  formTemplates: FormTemplate[];
  isLoading: boolean;
}) {
  const { isMobile } = useMobile();
  const { setDesktopHeaderHidden } = useHeaderContext();
  const searchParams = useSearchParams();
  const modalRegistry = useModalRegistry();
  const headerTapStateRef = useRef<{
    count: number;
    timer: ReturnType<typeof setTimeout> | null;
  }>({ count: 0, timer: null });
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate>();
  const [isMobileSigningFlow, setIsMobileSigningFlow] = useState(false);
  const [isMobileExitConfirmationOpen, setIsMobileExitConfirmationOpen] =
    useState(false);
  const [noEsign, setNoEsign] = useState(false);
  const [isSigningFlow, setIsSigningFlow] = useState(false);
  const [freshHistoryCutoffMs, setFreshHistoryCutoffMs] = useState<
    number | null
  >(null);
  const form = useFormRendererContext();
  const formFiller = useFormFiller();
  const signContext = useSignContext();
  const recipients = form.formMetadata.getSigningParties();
  const filteredGeneratedForms = useMemo(() => {
    if (!freshHistoryCutoffMs) return generatedForms ?? [];

    return (generatedForms ?? []).filter((entry) => {
      const timestampMs = getTimestampMs(entry.timestamp);
      if (timestampMs === null) return true;
      return timestampMs >= freshHistoryCutoffMs;
    });
  }, [generatedForms, freshHistoryCutoffMs]);
  const sortedTemplates = useMemo(
    () =>
      formTemplates?.toSorted((a, b) => {
        const aLabel = a.formLabel.replaceAll(/[()[\]\-,]/g, "");
        const bLabel = b.formLabel.replaceAll(/[()[\]\-,]/g, "");
        return aLabel.localeCompare(bLabel);
      }) ?? [],
    [formTemplates],
  );
  const hasHistoryLogs = useMemo(
    () =>
      filteredGeneratedForms.some(
        (entry) => entry.label === form.formLabel || !form.formLabel,
      ),
    [filteredGeneratedForms, form.formLabel],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mode = searchParams.get(FRESH_FORMS_QUERY_PARAM);

    if (mode === "0" || mode === "off") {
      clearFreshHistoryCutoffMsInStorage();
      setFreshHistoryCutoffMs(null);
      return;
    }

    if (mode === "reset") {
      const cutoff = Date.now();
      setFreshHistoryCutoffMsInStorage(cutoff);
      setFreshHistoryCutoffMs(cutoff);
      return;
    }

    if (mode === "1") {
      const existing = getFreshHistoryCutoffMsFromStorage();
      if (existing) {
        setFreshHistoryCutoffMs(existing);
        return;
      }

      const cutoff = Date.now();
      setFreshHistoryCutoffMsInStorage(cutoff);
      setFreshHistoryCutoffMs(cutoff);
      return;
    }

    setFreshHistoryCutoffMs(getFreshHistoryCutoffMsFromStorage());
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (headerTapStateRef.current.timer) {
        clearTimeout(headerTapStateRef.current.timer);
      }
    };
  }, []);

  useEffect(() => {
    setDesktopHeaderHidden(!isMobile && isSigningFlow);
    return () => setDesktopHeaderHidden(false);
  }, [isMobile, isSigningFlow, setDesktopHeaderHidden]);

  const handleHeaderSecretTap = useCallback(() => {
    const tapState = headerTapStateRef.current;
    tapState.count += 1;

    if (tapState.timer) clearTimeout(tapState.timer);

    if (tapState.count >= 5) {
      const cutoff = Date.now();
      setFreshHistoryCutoffMsInStorage(cutoff);
      setFreshHistoryCutoffMs(cutoff);
      tapState.count = 0;
      tapState.timer = null;
      toast.success(
        "Fresh testing mode enabled. Old history is hidden until new forms are created.",
      );
      return;
    }

    tapState.timer = setTimeout(() => {
      tapState.count = 0;
      tapState.timer = null;
    }, 2000);
  }, []);

  const handleSignViaBetterInternship = () => {
    setIsSigningFlow(true);
    setNoEsign(false);
  };

  const handlePrintForWetSignature = () => {
    setIsSigningFlow(true);
    setNoEsign(true);
  };

  const handleTemplateSelect = useCallback(
    (template: FormTemplate) => {
      setSelectedTemplate(template);
      form.updateFormName(template.formName);
    },
    [form],
  );

  useEffect(() => {
    if (!isMobile) {
      modalRegistry.formTemplateDetails.close();
      setIsMobileSigningFlow(false);
      return;
    }

    if (!selectedTemplate) {
      modalRegistry.formTemplateDetails.close();
      setIsMobileSigningFlow(false);
      return;
    }

    modalRegistry.formTemplateDetails.open({
      title: selectedTemplate.formLabel,
      content: (
        <FormRendererContextBridge value={form}>
          <SignContextBridge value={signContext}>
            <FormFillerContextBridge value={formFiller}>
              <MobileFormTemplateDetailsContent
                selectedTemplate={selectedTemplate}
                generatedForms={filteredGeneratedForms}
                isSigningFlow={isMobileSigningFlow}
                setIsSigningFlow={setIsMobileSigningFlow}
                showExitConfirmation={isMobileExitConfirmationOpen}
                setShowExitConfirmation={setIsMobileExitConfirmationOpen}
              />
            </FormFillerContextBridge>
          </SignContextBridge>
        </FormRendererContextBridge>
      ),
      onRequestClose: () => {
        if (isMobileSigningFlow) {
          setIsMobileExitConfirmationOpen(true);
          return;
        }
        setSelectedTemplate(undefined);
      },
      closeOnBackdropClick: !isMobileSigningFlow,
      closeOnEscapeKey: !isMobileSigningFlow,
      mobileFullscreen: isMobileSigningFlow,
      onClose: () => {
        setSelectedTemplate(undefined);
        setIsMobileSigningFlow(false);
        setIsMobileExitConfirmationOpen(false);
      },
    });
  }, [
    isMobile,
    selectedTemplate,
    filteredGeneratedForms,
    isMobileSigningFlow,
    isMobileExitConfirmationOpen,
    form,
    formFiller,
    signContext,
    form.loading,
    form.document.name,
    form.document.url,
    form.formLabel,
  ]);

  useEffect(() => {
    if (!isMobile) return;

    const handlePopState = () => {
      setIsMobileSigningFlow(false);
      setIsMobileExitConfirmationOpen(false);
      setSelectedTemplate(undefined);
      modalRegistry.formTemplateDetails.close();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMobile, modalRegistry]);

  if (isLoading) return <Loader>Loading form templates...</Loader>;

  return (
    <div className="h-full min-h-0 w-full bg-gray-50">
      <div
        className={cn(
          "grid h-[calc(100%-2px)] min-h-0 transition-[grid-template-columns] duration-500 ease-in-out",
          "grid-cols-1",
          isSigningFlow
            ? "md:grid-cols-[0px_minmax(0,1fr)]"
            : "md:grid-cols-[clamp(260px,32vw,460px)_minmax(0,1fr)]",
        )}
      >
        <aside
          className={cn(
            "flex min-h-0 flex-col overflow-hidden border-gray-200 md:border-r  transition-all duration-500 ease-in-out",
            isSigningFlow
              ? "-translate-x-8 opacity-0 pointer-events-none"
              : "translate-x-0 opacity-100",
          )}
        >
          <div className="  p-4 sm:px-4 md:px-6">
            <div className="flex w-full flex-col py-2 animate-fade-in">
              <div className="flex flex-row items-center gap-3 mb-2">
                <HeaderIcon icon={FileText} />
                <div onClick={handleHeaderSecretTap}>
                  <HeaderText>Form Templates</HeaderText>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Select a form to preview and start the signing flow.
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto md:pt-0 p-3 sm:p-4 md:p-5">
            {sortedTemplates.length ? (
              <FormTemplatesList
                templates={sortedTemplates}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={handleTemplateSelect}
              />
            ) : (
              <div className="rounded-[0.33em] border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-700">
                We currently don't automate forms for your department. <br />
                <br />
                Have a copy of your department's form templates? <br />
                <a
                  href="https://facebook.com/shi.sherwin"
                  className="text-primary underline"
                  target="_blank"
                >
                  Message us so we can help you out!
                </a>
              </div>
            )}
          </div>
        </aside>

        <section
          className={cn(
            "hidden min-h-0 flex-col overflow-hidden transition-[transform,opacity] duration-500 ease-in-out will-change-transform w-full md:flex",
            isSigningFlow
              ? "md:-translate-x-2 opacity-100"
              : "md:translate-x-0 opacity-100",
          )}
        >
          {selectedTemplate ? (
            <div
              className={cn(
                "relative min-h-0 flex-1  transition-[padding] duration-500 ease-in-out",
                isSigningFlow ? "px-2 sm:px-4" : "px-4",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 min-h-0 overflow-y-auto transition-[opacity,transform] duration-300 ease-out",
                  isSigningFlow
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-1 pointer-events-none",
                )}
              >
                <FormSigningLayout
                  formLabel={selectedTemplate?.formLabel}
                  documentUrl={form.document.url}
                  recipients={recipients}
                  noEsign={noEsign}
                  onBack={() => setIsSigningFlow(false)}
                />
              </div>

              <div
                className={cn(
                  "absolute inset-0 min-h-0 overflow-y-auto transition-[opacity,transform] duration-300 ease-out [scrollbar-gutter:stable]",
                  isSigningFlow
                    ? "opacity-0 -translate-y-1 pointer-events-none"
                    : "opacity-100 translate-y-0 pointer-events-auto",
                )}
              >
                {form.loading ||
                form.document.name !== selectedTemplate.formName ? (
                  <Loader>Loading form template...</Loader>
                ) : (
                  <div className="flex min-h-full w-full flex-col gap-8 p-6 lg:p-8 xl:mx-auto xl:max-w-6xl">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold text-primary sm:text-3xl">
                        {selectedTemplate?.formLabel}
                      </h3>
                    </div>
                    {hasHistoryLogs ? (
                      <FormActionAccordion
                        handleSignViaBetterInternship={
                          handleSignViaBetterInternship
                        }
                        handlePrintForWetSignature={handlePrintForWetSignature}
                      />
                    ) : (
                      <>
                        <div className="text-xl mt-4 text-gray-700 font-bold">
                          {recipients.length > 1
                            ? "These people will receive this form, in this order:"
                            : "This form does not require any signatures."}
                        </div>

                        <FormSigningPartyTimeline />
                        <div className="mt-8 flex w-full flex-col items-start gap-3 pt-2">
                          <FormActionButtons
                            handleSignViaBetterInternship={
                              handleSignViaBetterInternship
                            }
                            handlePrintForWetSignature={
                              handlePrintForWetSignature
                            }
                            align="end"
                          />
                        </div>
                      </>
                    )}
                    {hasHistoryLogs && (
                      <>
                        <div className="space-y-1 pt-2">
                          <h4 className="text-xl font-semibold text-gray-900">
                            History
                          </h4>
                          <p className="text-sm text-gray-600">
                            Previously generated versions of this form.
                          </p>
                        </div>
                        <FormHistoryView
                          forms={filteredGeneratedForms}
                          formLabel={form.formLabel}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto my-auto flex flex-col items-center gap-7">
              <FileSearch className="w-20 h-20 opacity-40" />
              {sortedTemplates.length ? (
                <div className="opacity-50">
                  Click on a form template to view.
                </div>
              ) : (
                <div className="opacity-50">
                  We don't have form templates for your department.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MobileFormTemplateDetailsContent({
  selectedTemplate,
  generatedForms,
  isSigningFlow,
  setIsSigningFlow,
  showExitConfirmation,
  setShowExitConfirmation,
}: {
  selectedTemplate: FormTemplate;
  generatedForms: GeneratedFormItem[];
  isSigningFlow: boolean;
  setIsSigningFlow: (value: boolean | ((prev: boolean) => boolean)) => void;
  showExitConfirmation: boolean;
  setShowExitConfirmation: (value: boolean) => void;
}) {
  const form = useFormRendererContext();
  const [noEsign, setNoEsign] = useState(false);
  const recipients = form.formMetadata.getSigningParties();
  const hasHistoryLogs = useMemo(
    () =>
      (generatedForms ?? []).some(
        (entry) => entry.label === form.formLabel || !form.formLabel,
      ),
    [generatedForms, form.formLabel],
  );

  const handleSignViaBetterInternship = () => {
    setIsSigningFlow(true);
    setNoEsign(false);
  };

  const handlePrintForWetSignature = () => {
    setIsSigningFlow(true);
    setNoEsign(true);
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-white">
      <AnimatePresence initial={false} mode="wait">
        {isSigningFlow ? (
          <motion.div
            key="mobile-signing-flow"
            className="absolute inset-0 h-full min-h-0 bg-gray-100"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 32,
              mass: 0.9,
            }}
          >
            <FormSigningLayout
              formLabel={selectedTemplate?.formLabel}
              documentUrl={form.document.url}
              recipients={recipients}
              noEsign={noEsign}
              onBack={() => setIsSigningFlow(false)}
            />
            <FormMobileCloseConfirmation
              open={showExitConfirmation}
              onCancel={() => setShowExitConfirmation(false)}
              onConfirm={() => {
                setShowExitConfirmation(false);
                setIsSigningFlow(false);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="mobile-template-details"
            className="absolute inset-0 h-full min-h-0 overflow-y-auto bg-white [scrollbar-gutter:stable]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {form.loading ||
            form.document.name !== selectedTemplate.formName ? (
              <Loader>Loading form template...</Loader>
            ) : (
              <div className="mx-auto flex min-h-full max-w-4xl flex-col gap-6 bg-white px-4 py-6 sm:px-8 sm:py-10">
                {hasHistoryLogs ? (
                  <FormActionAccordion
                    handleSignViaBetterInternship={
                      handleSignViaBetterInternship
                    }
                    handlePrintForWetSignature={handlePrintForWetSignature}
                  />
                ) : (
                  <>
                    <div className="text-xl mt-4 text-gray-700 font-bold">
                      {recipients.length > 1
                        ? "These people will receive this form, in this order:"
                        : "This form does not require any signatures."}
                    </div>

                    <FormSigningPartyTimeline />
                    <div className="mt-8 flex w-full flex-col items-start gap-3 pt-2">
                      <FormActionButtons
                        handleSignViaBetterInternship={
                          handleSignViaBetterInternship
                        }
                        handlePrintForWetSignature={handlePrintForWetSignature}
                        align="end"
                      />
                    </div>
                  </>
                )}
                {hasHistoryLogs && (
                  <>
                    <div className="space-y-1 pt-2">
                      <h4 className="text-xl font-semibold text-gray-900">
                        History
                      </h4>
                      <p className="text-sm text-gray-600">
                        Previously generated versions of this form.
                      </p>
                    </div>
                    <FormHistoryView
                      forms={generatedForms}
                      formLabel={form.formLabel}
                    />
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
