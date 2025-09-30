"use client";

import { useMemo, useState } from "react";
import { OutsideTabPanel, OutsideTabs } from "@/components/ui/outside-tabs";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/landingHire/ui/alert-dialog";
import { Newspaper, AlertTriangle } from "lucide-react";

// ──────────────────────────────────────────────
// Minimal page: tabs + blocking warning + generate modal
// ──────────────────────────────────────────────

type TabKey = "My Forms" | "Past Forms";

type FormTemplate = { id: string; name: string; description?: string };
type PastForm = {
  id: string;
  name: string;
  company: string;
  createdAt: string;
};

export default function FormsPage() {
  // TODO: Wire this to your real profile state (e.g., from useProfile())
  // const { data: profile } = useProfile();
  // const profileComplete = !!profile?.autofillComplete;
  const [profileComplete, setProfileComplete] = useState<boolean>(false); // <— demo toggle only

  const [tab, setTab] = useState<TabKey>("My Forms");

  // Mock data (replace with your real lists)
  const availableForms: FormTemplate[] = [
    {
      id: "student-moa",
      name: "Student MOA",
      description: "Standard student-company MOA",
    },
    { id: "endorsement", name: "Endorsement Letter" },
    { id: "timesheet", name: "Daily Timesheet" },
  ];

  const pastForms: PastForm[] = [
    {
      id: "pf-1",
      name: "Student MOA",
      company: "Ardent World Inc.",
      createdAt: "2025-09-24",
    },
    {
      id: "pf-2",
      name: "Endorsement Letter",
      company: "URC",
      createdAt: "2025-09-18",
    },
  ];

  // Company picker (replace with your real entities)
  const companies = ["Ardent World Inc.", "URC", "FactSet", "Accenture"];

  // Generate modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  const selectedForm = useMemo(
    () => availableForms.find((f) => f.id === selectedFormId) || null,
    [selectedFormId, availableForms]
  );

  function openGenerate(formId: string) {
    setSelectedFormId(formId);
    setSelectedCompany("");
    setModalOpen(true);
  }

  function confirmGenerate() {
    // TODO: route to your generation endpoint / trigger preview flow
    console.log("Generate form", {
      formId: selectedFormId,
      company: selectedCompany,
    });
    setModalOpen(false);
  }

  const tabsBlocked = !profileComplete;

  return (
    <div className="container max-w-5xl p-10 pt-16 mx-auto">
      <div className="mb-6 sm:mb-8 animate-fade-in space-y-5">
        {/* Header */}
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

        {/* Warning (looks like the Apply-for-Me OFF card) */}
        {tabsBlocked && (
          <WarningCard
            title="Action needed"
            message={
              <>
                Please complete your{" "}
                <span className="font-medium">Autofill profile</span> in{" "}
                <span className="font-medium">Profiles</span> in order to
                generate forms.
              </>
            }
            actionLabel="Go to Profiles"
            onAction={() => {
              // TODO: push("/profile/autofill") or open modal
              console.log("Navigate to Profiles → Autofill");
            }}
          />
        )}

        {/* Tabs (greys out + blocks interaction when profile is incomplete) */}
        <div
          className={cn(
            tabsBlocked && "opacity-60 pointer-events-none select-none"
          )}
        >
          <OutsideTabs
            value={tab}
            onChange={(v) => setTab(v as TabKey)}
            tabs={[
              { key: "My Forms", label: "My Forms" },
              { key: "Past Forms", label: "Past Forms" },
            ]}
          >
            {/* My Forms */}
            <OutsideTabPanel when="My Forms" activeKey={tab}>
              <ul className="space-y-3">
                {availableForms.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div>
                      <div className="font-medium">{f.name}</div>
                      {f.description && (
                        <div className="text-sm text-gray-500">
                          {f.description}
                        </div>
                      )}
                    </div>
                    <Button size="sm" onClick={() => openGenerate(f.id)}>
                      Generate
                    </Button>
                  </li>
                ))}
              </ul>
            </OutsideTabPanel>

            {/* Past Forms */}
            <OutsideTabPanel when="Past Forms" activeKey={tab}>
              {pastForms.length === 0 ? (
                <p className="text-sm text-gray-600">No past forms yet.</p>
              ) : (
                <ul className="space-y-3">
                  {pastForms.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {p.name} ·{" "}
                          <span className="text-gray-600">{p.company}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Generated on {p.createdAt}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          PDF
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log("Open", p)}
                        >
                          Download
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </OutsideTabPanel>
          </OutsideTabs>
        </div>
      </div>

      {/* Generate: choose company */}
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-gray-400" />
              Generate {selectedForm ? selectedForm.name : "Form"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Which company should we generate this form for?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Company</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="" disabled>
                Select a company…
              </option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!selectedCompany}
              onClick={confirmGenerate}
              className={cn(!selectedCompany && "opacity-60")}
            >
              Generate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Demo only: toggle to see blocked/active states */}
      <div className="mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setProfileComplete((s) => !s)}
          className="text-xs"
        >
          Demo toggle: Autofill {profileComplete ? "Complete" : "Incomplete"}
        </Button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Warning card (styled like Apply-for-Me OFF)
// ──────────────────────────────────────────────
function WarningCard({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const tone = {
    card: "bg-red-50 border-red-200",
    heading: "text-red-900",
    subtext: "text-red-700",
    pill: "bg-transparent border-red-700 text-red-700",
  };

  return (
    <Card
      className={cn(
        "p-4 space-y-3 border transition-colors duration-300 ease-out",
        tone.card
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className={cn("text-base font-semibold", tone.heading)}>
            {title}
          </h3>
          <Badge className={cn("text-xs", tone.pill)}>Required</Badge>
        </div>
        {actionLabel && (
          <Button size="sm" variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>

      <div className={cn("text-xs sm:text-sm leading-relaxed", tone.subtext)}>
        {message}
      </div>
      <p className="text-sm text-red-800">
        Form generation is currently disabled.
      </p>
    </Card>
  );
}
