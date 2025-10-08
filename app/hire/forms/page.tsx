"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormDropdown } from "@/components/EditForm";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { CheckCircle, FileSignature, ShieldCheck } from "lucide-react";
import { EmployerService } from "@/lib/api/services";

// ──────────────────────────────────────────────
// Replace with your real service calls
// ──────────────────────────────────────────────
const CompanyService = {
  submitCompanyDetails: async (payload: any) => {
    // TODO: call your API to save details (no e-sign)
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true };
  },
};

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type Values = {
  legalName: string;
  companyAddress: string;
  contactPerson: string;
  contactPosition: string;
  companyType: "partnership" | "corporation" | "government-agency" | "";
};

const defaultValues: Values = {
  legalName: "",
  companyAddress: "",
  contactPerson: "",
  contactPosition: "",
  companyType: "",
};

export default function CompanyMoaRequestPage() {
  return <Suspense>
    <CompanyMoaRequestPageContent />
  </Suspense>
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────
function CompanyMoaRequestPageContent() {
  const router = useRouter();
  const params = useSearchParams();

  // TODO: On mount, fetch the details of student in body, then generate PDF. Append to the hyperlink or button

  // From URL (you can pass these via invite link): ?student=Juan%20Dela%20Cruz&template=/Student_MOA.pdf
  const studentName = params.get("student") || "The student";
  const templateHref = params.get("template") || "/Student_MOA.pdf";
  const moaFieldsId = params.get("moaFieldsId") || "f41d1354-cf00-4abc-bc1b-3b0eeb6001cc";

  // Form state
  const [v, setV] = useState<Values>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"plain" | "esign" | null>(null);

  const setField = <K extends keyof Values>(k: K, val: Values[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const requiredFields: (keyof Values)[] = [
    "legalName",
    "companyAddress",
    "contactPerson",
    "contactPosition",
    "companyType",
  ];

  const valid = useMemo(() => {
    for (const k of requiredFields) {
      if (!String(v[k] ?? "").trim()) return false;
    }
    return true;
  }, [v]);

  const validate = () => {
    const e: Record<string, string> = {};
    for (const k of requiredFields) {
      if (!String(v[k] ?? "").trim()) e[k] = "This field is required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Modals
  const { open: openModal, close: closeModal } = useGlobalModal();

  // Success Modal
  function openSuccessModal(signedPdfUrl?: string, dashboardUrl?: string) {
    openModal(
      "company-success",
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
            <CheckCircle className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold">You’re good to go!</h3>
            <p className="text-sm text-gray-600 mt-1">
              We’ve recorded your details
              {signedPdfUrl ? " and signed the document" : ""}.{` `}
              {true &&
                "We also created an account for you in BetterInternship."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => {
              closeModal("company-success");
              if (dashboardUrl) router.push(dashboardUrl);
            }}
          >
            Go to dashboard
          </Button>
          {signedPdfUrl && (
            <Button
              onClick={() => {
                window.open(signedPdfUrl, "_blank", "noopener,noreferrer");
              }}
            >
              View signed PDF
            </Button>
          )}
        </div>
      </div>,
      {
        title: "Success",
        allowBackdropClick: false,
        closeOnEsc: true,
      }
    );
  }

  // E-Sign Authorization Modal
  function openEsignModal() {
    let auth = false;
    let auto = false;

    const EsignBody = () => {
      const [a, setA] = useState(false);
      const [b, setB] = useState(false);
      auth = a;
      auto = b;

      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Before we proceed with e-signature, please confirm:
          </p>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={a}
              onChange={(e) => setA(e.target.checked)}
            />
            <span>
              I am authorized to sign the{" "}
              <span className="font-medium">
                standard template student internship
              </span>{" "}
              document requested by the school.
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={b}
              onChange={(e) => setB(e.target.checked)}
            />
            <span>
              Auto-sign other school-templated internship documents in the
              future. I’ll be sent a copy anytime a templated document is
              signed.
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => closeModal("esign-confirm")}
            >
              Back
            </Button>
            <Button
              onClick={async () => {
                if (!auth) return; // require authorization checkbox
                closeModal("esign-confirm");
                await handleSubmitEsign({ autoOptIn: auto });
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      );
    };

    openModal("esign-confirm", <EsignBody />, {
      title: "Confirm e-signature",
      allowBackdropClick: false,
      closeOnEsc: true,
      panelClassName: "sm:min-w-[520px]",
    });
  }

  // Actions
  async function handleSubmitPlain() {
    if (!validate()) return;
    try {
      setBusy("plain");
      const res = await CompanyService.submitCompanyDetails({
        ...v,
        // You can pass the requestId, invitedByStudentId, etc. here
      });
      if (res.ok) {
        openSuccessModal(undefined, "/employer");
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleSubmitEsign(opts: { autoOptIn: boolean }) {
    if (!validate()) return;
    try {
      setBusy("esign");
      const payload = {
        moaFieldsId: moaFieldsId,
        companyLegalName: v.legalName,
        companyAddress: v.companyAddress,
        companyRepresentative: v.contactPerson,
        companyRepresentativePosition: v.contactPosition,
        companyType: v.companyType,
      };

      const res = await EmployerService.signMoaWithSignature(payload);

      const ok = Boolean(
        res?.success ??
        res?.result
      );

      const signedPdfUrl =
        (res?.verificationCode
          ? `https://storage.googleapis.com/better-internship-public-bucket/${res.verificationCode}.pdf`
          : undefined);

      if (ok) {
        openSuccessModal(signedPdfUrl, `${process.env.NEXT_PUBLIC_CLIENT_HIRE_URL}/login`);
      } else {
        console.error("signMoaWithSignature returned non-ok:", res);
        alert("Could not e-sign. Please try again.");
      }
    } catch (err) {
      console.error("signMoaWithSignature threw:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="container max-w-3xl px-4 sm:px-10 pt-8 sm:pt-16 mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-justify">
            {studentName} is requesting the following details for{" "}
            <Link
              href={templateHref}
              className="underline underline-offset-2 hover:text-primary"
              target="_blank"
            >
              DLSU’s Internship Student MOA Submission
            </Link>
          </h1>
          <p className="text-gray-600 text-sm">
            Please provide the basic company details below.
          </p>
        </div>

        <Card className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label="Company Legal Name"
              value={v.legalName}
              setter={(val) => setField("legalName", val)}
              required
            />
            {!!errors.legalName && (
              <p className="text-xs text-red-600">{errors.legalName}</p>
            )}

            <FormInput
              label="Company Address"
              value={v.companyAddress}
              setter={(val) => setField("companyAddress", val)}
              required
            />
            {!!errors.companyAddress && (
              <p className="text-xs text-red-600">{errors.companyAddress}</p>
            )}

            <FormInput
              label="Company Representative"
              value={v.contactPerson}
              setter={(val) => setField("contactPerson", val)}
              required
            />
            {!!errors.contactPerson && (
              <p className="text-xs text-red-600">{errors.contactPerson}</p>
            )}

            <FormInput
              label="Company Representative's Position"
              value={v.contactPosition}
              setter={(val) => setField("contactPosition", val)}
              required
            />
            {!!errors.contactPosition && (
              <p className="text-xs text-red-600">{errors.contactPosition}</p>
            )}

            <FormDropdown
              label="Company Type"
              value={v.companyType}
              options={[
                { id: "partnership", name: "Partnership" },
                { id: "corporation", name: "Corporation" },
                { id: "government-agency", name: "Government Agency" },
              ]}
              setter={(val) =>
                setField("companyType", (val as Values["companyType"]) || "")
              }
              required
            />
            {!!errors.companyType && (
              <p className="text-xs text-red-600">{errors.companyType}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
            {/* <Button
              variant="outline"
              onClick={handleSubmitPlain}
              disabled={!valid || busy === "plain" || busy === "esign"}
            >
              {busy === "plain" ? "Submitting…" : "Submit without e-sign"}
            </Button> */}

            <Button
              onClick={openEsignModal}
              disabled={!valid || busy === "plain" || busy === "esign"}
              className="inline-flex items-center gap-2"
            >
              <FileSignature className="size-4" />
              {busy === "esign" ? "Submitting…" : "Submit & e-sign"}
            </Button>
          </div>
        </Card>

        {/* Tiny reassurance / trust hint (optional) */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="size-4" />
          Your information is used only for internship documentation.
        </div>
      </div>
    </div>
  );
}
