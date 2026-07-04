"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ListShell,
  RowCard,
  Meta,
  LastLogin,
  ListSummary,
} from "@/components/features/hire/god/ui";
import {
  GenerateMagicLinkButton,
  GenerateMagicLinkModal,
  RegisterEmployerButton,
  RegisterEmployerModal,
} from "@/components/features/hire/god/RegisterEmployerModal";
import { BoolBadge } from "@/components/ui/badge";
import {
  useGodEmployers,
  useVerifyEmployer,
  useUnverifyEmployer,
  useCreateListing,
  useRegisterAndList,
  useImportCsv,
} from "@/lib/api/god.api";
import { Paginator } from "@/components/ui/paginator";
import { useModal } from "@/hooks/use-modal";
import { useAuthContext } from "@/app/hire/authctx";
import { FormInput } from "@/components/EditForm";

const PAGE_SIZE = 20;

function ModalShell({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function GodEmployersPage() {
  const router = useRouter();
  const { loginAs: login_as } = useAuthContext();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isVerified, setIsVerified] = useState<string | undefined>(undefined);
  const [authorizingId, setAuthorizingId] = useState<string | null>(null);

  const { data, isFetching } = useGodEmployers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    is_verified: isVerified,
    sort_by: "name",
    sort_dir: "asc",
  });

  const verifyEmployer = useVerifyEmployer();
  const unverifyEmployer = useUnverifyEmployer();
  const createListing = useCreateListing();
  const registerAndList = useRegisterAndList();
  const importCsv = useImportCsv();

  const {
    Modal: RegisterModal,
    open: openRegister,
    close: closeRegister,
  } = useModal("register-modal");

  const {
    Modal: MagicLinkModal,
    open: openMagicLink,
    close: closeMagicLink,
  } = useModal("magic-link-modal");

  const employers = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setPage(1);
      setSearch(searchInput);
    },
    [searchInput],
  );

  const handleVerifiedFilter = useCallback((value: string) => {
    setPage(1);
    setIsVerified(value || undefined);
  }, []);

  const authorizeAs = async (employer_id: string) => {
    try {
      setAuthorizingId(employer_id);
      await login_as(employer_id);
      router.push("/dashboard");
    } catch (err) {
      console.error("[authorizeAs] failed:", err);
    } finally {
      setAuthorizingId(null);
    }
  };

  const [listingEmployer, setListingEmployer] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [listingTitle, setListingTitle] = useState("");
  const [listingDesc, setListingDesc] = useState("");
  const [listingLocation, setListingLocation] = useState("");
  const [listingRequirements, setListingRequirements] = useState("");
  const [listingSalary, setListingSalary] = useState("");

  const handleCreateListing = async () => {
    if (!listingEmployer) return;
    try {
      await createListing.mutateAsync({
        employerId: listingEmployer.id,
        data: {
          title: listingTitle,
          description: listingDesc,
          location: listingLocation || undefined,
          requirements: listingRequirements || undefined,
          salary: listingSalary || undefined,
        },
      });
      toast.success(`Listing "${listingTitle}" created for ${listingEmployer.name}.`);
      setListingEmployer(null);
      setListingTitle("");
      setListingDesc("");
      setListingLocation("");
      setListingRequirements("");
      setListingSalary("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create listing.");
    }
  };

  const [showRegisterAndList, setShowRegisterAndList] = useState(false);
  const [ralName, setRalName] = useState("");
  const [ralEmail, setRalEmail] = useState("");
  const [ralTitle, setRalTitle] = useState("");
  const [ralDesc, setRalDesc] = useState("");
  const [ralLocation, setRalLocation] = useState("");
  const [ralRequirements, setRalRequirements] = useState("");
  const [ralSalary, setRalSalary] = useState("");

  const handleRegisterAndList = async () => {
    try {
      const result = await registerAndList.mutateAsync({
        name: ralName,
        email: ralEmail,
        title: ralTitle,
        description: ralDesc,
        location: ralLocation || undefined,
        requirements: ralRequirements || undefined,
        salary: ralSalary || undefined,
      });
      const prefix = (result as any)?.isNewEmployer !== false ? "Created" : "Found existing";
      toast.success(`${prefix} "${ralName}" and listing "${ralTitle}".`);
      setShowRegisterAndList(false);
      setRalName("");
      setRalEmail("");
      setRalTitle("");
      setRalDesc("");
      setRalLocation("");
      setRalRequirements("");
      setRalSalary("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to register employer and create listing.");
    }
  };

  const [showImportCsv, setShowImportCsv] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleImportCsv = async () => {
    const file = csvInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a CSV file first.");
      return;
    }
    try {
      const text = await file.text();
      const result = await importCsv.mutateAsync(text);
      const count = (result as any)?.count ?? 0;
      toast.success(`Imported ${count} listings successfully.`);
      setShowImportCsv(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to import CSV.");
    }
  };

  const rows = employers.map((e: any) => {
    const lastTs = e?.last_session?.timestamp
      ? new Date(e.last_session.timestamp).getTime()
      : undefined;

    return (
      <RowCard
        key={e.id}
        title={e.name}
        metas={
          <>
            <BoolBadge
              state={e.is_verified}
              onValue="verified"
              offValue="unverified"
            />
            <Meta>{e.application_count ?? 0} applications</Meta>
            <Meta>{e.job_count ?? 0} jobs</Meta>
            <LastLogin ts={lastTs} />
          </>
        }
        leftActions={
          <>
            <Button
              scheme="primary"
              size="xs"
              onClick={(ev) => {
                ev.stopPropagation();
                authorizeAs(e.id ?? "");
              }}
              disabled={authorizingId === (e.id ?? "")}
            >
              {authorizingId === (e.id ?? "") ? "Opening..." : "View"}
            </Button>
            <Button
              scheme="supportive"
              size="xs"
              onClick={(ev) => {
                ev.stopPropagation();
                setListingEmployer({ id: e.id, name: e.name });
              }}
            >
              + Listing
            </Button>
          </>
        }
        more={
          <div className="space-y-2 text-sm">
            <div>
              Employer ID: <code className="text-slate-500">{e.id}</code>
            </div>
            <div>Email: {e.email || "—"}</div>
            <div>
              Created:{" "}
              {e.created_at ? new Date(e.created_at).toLocaleString() : "—"}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="xs"
                scheme={e.is_verified ? "warning" : "supportive"}
                onClick={async () => {
                  try {
                    if (e.is_verified) {
                      await unverifyEmployer.mutateAsync(e.id);
                      toast.success(`"${e.name}" unverified.`);
                    } else {
                      await verifyEmployer.mutateAsync(e.id);
                      toast.success(`"${e.name}" verified.`);
                    }
                  } catch (err: any) {
                    toast.error(err?.message ?? "Failed to update employer.");
                  }
                }}
                disabled={
                  verifyEmployer.isPending || unverifyEmployer.isPending
                }
              >
                {e.is_verified ? "Unverify" : "Verify"}
              </Button>
            </div>
          </div>
        }
      />
    );
  });

  const toolbar = (
    <div className="flex justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <ListSummary
          label="Employers"
          total={total}
          visible={employers.length}
        />

        <form onSubmit={handleSearch} className="flex gap-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name or email..."
            className="rounded-md border px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <Button type="submit" size="xs" variant="outline">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </form>

        <select
          value={isVerified ?? ""}
          onChange={(e) => handleVerifiedFilter(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>

        <RegisterEmployerButton onOpen={openRegister} />
        <GenerateMagicLinkButton onOpen={openMagicLink} />
        <Button
          scheme="supportive"
          size="xs"
          onClick={() => setShowRegisterAndList(true)}
        >
          Register &amp; List
        </Button>
        <Button
          scheme="supportive"
          size="xs"
          onClick={() => setShowImportCsv(true)}
        >
          Import CSV
        </Button>
      </div>
      <div className="px-2 text-sm text-slate-500 self-center">
        {isFetching ? "Loading..." : null}
      </div>
    </div>
  );

  const employerOptions = employers
    .filter((e: any) => e.id && e.name)
    .map((e: any) => ({ id: e.id!, name: e.name! }));

  return (
    <>
      <ListShell toolbar={toolbar} fullWidth>
        {rows}
        <div className="p-4">
          <Paginator
            totalItems={total}
            itemsPerPage={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </ListShell>

      <RegisterEmployerModal Modal={RegisterModal} onClose={closeRegister} />
      <GenerateMagicLinkModal
        Modal={MagicLinkModal}
        onClose={closeMagicLink}
        employers={employerOptions}
      />

      <ModalShell
        open={!!listingEmployer}
        onClose={() => setListingEmployer(null)}
        title={`Create Listing — ${listingEmployer?.name ?? ""}`}
      >
        <div className="flex flex-col gap-3">
          <FormInput
            label="Job Title"
            value={listingTitle}
            setter={setListingTitle}
            required
          />
          <FormInput
            label="Description"
            value={listingDesc}
            setter={setListingDesc}
            required
          />
          <FormInput
            label="Location"
            value={listingLocation}
            setter={setListingLocation}
          />
          <FormInput
            label="Requirements"
            value={listingRequirements}
            setter={setListingRequirements}
          />
          <FormInput
            label="Salary"
            value={listingSalary}
            setter={setListingSalary}
          />
          <div className="flex gap-2 pt-2">
            <Button
              scheme="supportive"
              disabled={
                !listingTitle || !listingDesc || createListing.isPending
              }
              onClick={() => void handleCreateListing()}
            >
              {createListing.isPending ? "Creating..." : "Create Listing"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setListingEmployer(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={showRegisterAndList}
        onClose={() => setShowRegisterAndList(false)}
        title="Register Employer & Create Listing"
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-500 border-b pb-2">
            Employer account
          </p>
          <FormInput
            label="Company Name"
            value={ralName}
            setter={setRalName}
            required
          />
          <FormInput
            label="Email"
            value={ralEmail}
            setter={setRalEmail}
            required
          />
          <p className="text-sm text-slate-500 border-b pb-2 pt-1">
            Job listing
          </p>
          <FormInput
            label="Job Title"
            value={ralTitle}
            setter={setRalTitle}
            required
          />
          <FormInput
            label="Description"
            value={ralDesc}
            setter={setRalDesc}
            required
          />
          <FormInput
            label="Location"
            value={ralLocation}
            setter={setRalLocation}
          />
          <FormInput
            label="Requirements"
            value={ralRequirements}
            setter={setRalRequirements}
          />
          <FormInput
            label="Salary"
            value={ralSalary}
            setter={setRalSalary}
          />
          <div className="flex gap-2 pt-2">
            <Button
              scheme="supportive"
              disabled={
                !ralName ||
                !ralEmail ||
                !ralTitle ||
                !ralDesc ||
                registerAndList.isPending
              }
              onClick={() => void handleRegisterAndList()}
            >
              {registerAndList.isPending
                ? "Creating..."
                : "Register & Create Listing"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRegisterAndList(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={showImportCsv}
        onClose={() => setShowImportCsv(false)}
        title="Import CSV (Employer + Listings)"
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-500">
            Upload a CSV file with columns:{" "}
            <code className="text-xs bg-slate-100 px-1 rounded">
              employer_name, employer_email, job_title, job_description
            </code>
            .
            <br />
            Optional: job_location, job_requirements, job_salary.
            <br />
            If an employer with the same name exists, the listing is added to
            the existing account.
          </p>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="text-sm"
          />
          <div className="flex gap-2 pt-2">
            <Button
              scheme="supportive"
              disabled={importCsv.isPending}
              onClick={() => void handleImportCsv()}
            >
              {importCsv.isPending ? "Importing..." : "Import"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowImportCsv(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </ModalShell>
    </>
  );
}
