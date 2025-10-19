"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { OutsideTabPanel, OutsideTabs } from "@/components/ui/outside-tabs";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper } from "lucide-react";
import {
  fetchForms,
  fetchAllUserForms,
  fetchSignedDocument,
  fetchPendingDocument,
  fetchTemplateDocument,
} from "@/lib/db/use-moa-backend";
import FormGenerateCard from "@/components/features/student/forms/FormGenerateCard";
import MyFormCard from "@/components/features/student/forms/MyFormCard";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { FormFlowRouter } from "@/components/features/student/forms/FormFlowRouter";
import { useProfileData } from "@/lib/api/student.data.api";
import { useRouter } from "next/navigation";
import ComingSoonCard from "@/components/features/student/forms/ComingSoonCard";

/**
 * The forms page component
 *
 * @component
 */
type TabKey = "Form Generator" | "My Forms";

export default function FormsPage() {
  const queryClient = useQueryClient();
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

  const norm = (s?: string) => (s ?? "").trim().toLowerCase();

  const generatorForms = useMemo(() => {
    const list = (formList ?? []).filter((f) => {
      const name = norm(f.name);
      return !/-\s*(invite|manual)$/.test(name); // hide variants
    });

    return list.slice().sort((a, b) => {
      const aa = norm(a.label ?? a.name);
      const bb = norm(b.label ?? b.name);
      if (aa < bb) return -1;
      if (aa > bb) return 1;
      return 0;
    });
  }, [formList]);

  const formNameSet = useMemo(() => {
    const s = new Set<string>();
    for (const f of formList ?? []) {
      if (!f?.name) continue;
      s.add(norm(f.name));
    }
    return s;
  }, [formList]);

  const hasVariant = useCallback(
    (base: string, suffix: "invite" | "manual") => {
      const key = `${norm(base)}-${suffix}`;
      return formNameSet.has(key);
    },
    [formNameSet],
  );

  const comingSoon = useMemo(() => {
    const available = new Set(
      (generatorForms ?? [])
        .map((f) => norm(f.label ?? f.name))
        .filter(Boolean),
    );
    return UPCOMING_FORMS.filter((f) => !available.has(norm(f.label)));
  }, [generatorForms]);

  const openFormModal = (formName: string, formLabel: string) => {
    const supportsInvite = hasVariant(formName, "invite");
    const supportsManual = hasVariant(formName, "manual");
    console.log("supportsInvite", supportsInvite);
    console.log("supportsManual", supportsManual);
    openGlobalModal(
      "form-generator-form",
      <FormFlowRouter
        baseForm={formName}
        supportsInvite={supportsInvite}
        supportsManual={supportsManual}
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

  const myFormsSorted = useMemo(
    () =>
      (myForms ?? [])
        .slice()
        .sort((a, b) => parseTsToMs(b.timestamp) - parseTsToMs(a.timestamp)),
    [myForms],
  );

  if (!profile.data?.department && !profile.isPending) {
    alert("Profile not yet complete.");
    router.push("/profile");
  }

  // refresh on my forms
  useEffect(() => {
    if (tab === "My Forms" && userId) {
      queryClient.invalidateQueries({ queryKey: ["my_forms", userId] });
    }
  }, [tab, userId, queryClient]);

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
                      openFormModal(form.name, form.label ?? "")
                    }
                  />
                ))}

              {/* coming soon, hard coded for now */}
              {!error &&
                !(isLoading || isPending || isFetching) &&
                (comingSoon?.length ?? 0) > 0 && (
                  <div className="mt-6 space-y-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Coming Soon
                    </div>
                    <div className="space-y-3">
                      {comingSoon.map((f) => (
                        <ComingSoonCard key={f.label} title={f.label} />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Want early access or have a suggestion? Email{" "}
                      <a
                        href="mailto:hello@betterinternship.com"
                        className="underline underline-offset-4"
                      >
                        hello@betterinternship.com
                      </a>
                      .
                    </p>
                  </div>
                )}
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
                myFormsSorted.map((row, i) => {
                  const formName = row.form_name;
                  const title = `${formName}`;
                  const status = row.signed_document_id
                    ? "Signed"
                    : "Needs signature/s";
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

                          const url = signedDocument.data?.verification_code
                            ? `https://storage.googleapis.com/better-internship-public-bucket/${signedDocument.data.verification_code}.pdf`
                            : null;

                          if (url) return url;
                        }

                        if (row.pending_document_id) {
                          const pendingDocument = await fetchPendingDocument(
                            row.pending_document_id,
                          );

                          const url = pendingDocument.data?.latest_document_url;
                          if (url) return url;
                        }

                        alert("No document associated with request.");
                        throw new Error("No document URL available");
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

/* Coming Soon config ───────────────────────── */
const UPCOMING_FORMS: Array<{ label: string }> = [
  {
    label: "Student MOA",
  },
  {
    label: "Company Evaluation Form",
  },
  {
    label: "Company and Project Info",
  },
  {
    label: "Progress Report",
  },
  {
    label: "Annex A Internship Plan",
  },
];
/* ──────────────────────────────────────────────────────────────────────────────── */

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
