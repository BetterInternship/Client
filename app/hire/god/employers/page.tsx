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
  ListingData,
} from "@/lib/api/god.api";
import { Paginator } from "@/components/ui/paginator";
import { useModal } from "@/hooks/use-modal";
import { useAuthContext } from "@/app/hire/authctx";
import { FormInput } from "@/components/EditForm";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-auto">
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

const emptyListingForm: ListingData = {
  title: "",
  description: "",
};

function ListingFormFields({
  form,
  setForm,
}: {
  form: ListingData;
  setForm: React.Dispatch<React.SetStateAction<ListingData>>;
}) {
  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const prefs = (form.internship_preferences ?? {}) as Record<string, unknown>;

  const setPref = (key: string, value: unknown) =>
    setForm((prev) => ({
      ...prev,
      internship_preferences: { ...(prev.internship_preferences as Record<string, unknown> ?? {}), [key]: value },
    }));

  const togglePrefArray = (key: string, val: unknown) => {
    const current = (prefs[key] as unknown[]) ?? [];
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    setPref(key, next);
  };

  return (
    <div className="flex flex-col gap-3">
      <FormInput
        label="Job Title"
        value={form.title}
        setter={(v) => set("title", v)}
        required
      />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description *
        </label>
        <Textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
        />
      </div>

      <FormInput
        label="Location"
        value={form.location ?? ""}
        setter={(v) => set("location", v || undefined)}
      />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Requirements
        </label>
        <Textarea
          value={form.requirements ?? ""}
          onChange={(e) => set("requirements", e.target.value || undefined)}
          rows={3}
        />
      </div>
      <FormInput
        label="Salary"
        value={form.salary ?? ""}
        setter={(v) => set("salary", v || undefined)}
      />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Paid / Unpaid
        </label>
        <select
          value={form.allowance?.toString() ?? ""}
          onChange={(e) =>
            set("allowance", e.target.value ? Number(e.target.value) : undefined)
          }
          className="rounded-md border px-3 py-1.5 text-sm w-full"
        >
          <option value="">—</option>
          <option value="0">Paid</option>
          <option value="1">Unpaid</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Pay Frequency
        </label>
        <select
          value={form.salary_freq?.toString() ?? ""}
          onChange={(e) =>
            set(
              "salary_freq",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          className="rounded-md border px-3 py-1.5 text-sm w-full"
        >
          <option value="">—</option>
          <option value="1">Hourly</option>
          <option value="2">Daily</option>
          <option value="3">Weekly</option>
          <option value="4">Bi-weekly</option>
          <option value="5">Monthly</option>
          <option value="6">Yearly</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Start Date
        </label>
        <Input
          type="date"
          value={
            form.start_date
              ? new Date(form.start_date * 1000).toISOString().slice(0, 10)
              : ""
          }
          onChange={(e) =>
            set(
              "start_date",
              e.target.value
                ? Math.floor(new Date(e.target.value).getTime() / 1000)
                : undefined,
            )
          }
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          End Date
        </label>
        <Input
          type="date"
          value={
            form.end_date
              ? new Date(form.end_date * 1000).toISOString().slice(0, 10)
              : ""
          }
          onChange={(e) =>
            set(
              "end_date",
              e.target.value
                ? Math.floor(new Date(e.target.value).getTime() / 1000)
                : undefined,
            )
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Internship Types
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={(prefs.internship_types as string[] ?? []).includes("credited")}
              onChange={() => togglePrefArray("internship_types", "credited")}
            />
            Credited
          </label>
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={(prefs.internship_types as string[] ?? []).includes("voluntary")}
              onChange={() => togglePrefArray("internship_types", "voluntary")}
            />
            Voluntary
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Work Setup
        </label>
        <div className="flex gap-4">
          {[
            [0, "On-site"],
            [1, "Hybrid"],
            [2, "Remote"],
          ].map(([id, label]) => (
            <label key={id as number} className="flex items-center gap-1.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={(prefs.job_setup_ids as number[] ?? []).includes(id as number)}
                onChange={() => togglePrefArray("job_setup_ids", id as number)}
              />
              {label as string}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Work Load
        </label>
        <div className="flex gap-4">
          {[
            [1, "Part-time"],
            [2, "Full-time"],
            [3, "Flexible"],
          ].map(([id, label]) => (
            <label key={id as number} className="flex items-center gap-1.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={(prefs.job_commitment_ids as number[] ?? []).includes(id as number)}
                onChange={() => togglePrefArray("job_commitment_ids", id as number)}
              />
              {label as string}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Expected Start Date
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="radio"
              name="expected_start"
              checked={(prefs.expected_start_date ?? null) === null}
              onChange={() => setPref("expected_start_date", null)}
            />
            As soon as possible
          </label>
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="radio"
              name="expected_start"
              checked={(prefs.expected_start_date ?? null) !== null}
              onChange={() => {
                const d = new Date();
                d.setDate(d.getDate() + 14);
                setPref("expected_start_date", Math.floor(d.getTime() / 1000));
              }}
            />
            Future date
          </label>
        </div>
        {(prefs.expected_start_date ?? null) !== null && (
          <Input
            type="date"
            className="mt-1"
            value={
              new Date((prefs.expected_start_date as number) * 1000)
                .toISOString()
                .slice(0, 10)
            }
            onChange={(e) =>
              setPref(
                "expected_start_date",
                e.target.value
                  ? Math.floor(new Date(e.target.value).getTime() / 1000)
                  : null,
              )
            }
          />
        )}
      </div>
      <div className="pt-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Other Requirements
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={!!(prefs.require_github as boolean)}
            onChange={(e) =>
              setPref("require_github", e.target.checked || undefined)
            }
          />
          Require GitHub
        </label>
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={!!(prefs.require_portfolio as boolean)}
            onChange={(e) =>
              setPref("require_portfolio", e.target.checked || undefined)
            }
          />
          Require Portfolio
        </label>
      </div>
      </div>

      <div className="pt-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Visibility
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) => set("is_active", e.target.checked || undefined)}
            />
            Active
          </label>
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={!!form.is_unlisted}
              onChange={(e) => set("is_unlisted", e.target.checked || undefined)}
            />
            Unlisted
          </label>
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={!!form.is_year_round}
              onChange={(e) => set("is_year_round", e.target.checked || undefined)}
            />
            Year Round
          </label>
        </div>
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
  const [listingForm, setListingForm] = useState<ListingData>(emptyListingForm);

  const handleCreateListing = async () => {
    if (!listingEmployer) return;
    try {
      await createListing.mutateAsync({
        employerId: listingEmployer.id,
        data: listingForm,
      });
      toast.success(
        `Listing "${listingForm.title}" created for ${listingEmployer.name}.`,
      );
      setListingEmployer(null);
      setListingForm(emptyListingForm);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create listing.");
    }
  };

  const [showRegisterAndList, setShowRegisterAndList] = useState(false);
  const [ralName, setRalName] = useState("");
  const [ralEmail, setRalEmail] = useState("");
  const [ralForm, setRalForm] = useState<ListingData>(emptyListingForm);

  const handleRegisterAndList = async () => {
    try {
      const result = await registerAndList.mutateAsync({
        name: ralName,
        email: ralEmail,
        ...ralForm,
      });
      const prefix =
        (result as any)?.isNewEmployer !== false
          ? "Created"
          : "Found existing";
      toast.success(`${prefix} "${ralName}" and listing "${ralForm.title}".`);
      setShowRegisterAndList(false);
      setRalName("");
      setRalEmail("");
      setRalForm(emptyListingForm);
    } catch (err: any) {
      toast.error(
        err?.message ?? "Failed to register employer and create listing.",
      );
    }
  };

  const [showImportCsv, setShowImportCsv] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const parseCsv = (text: string): Record<string, string>[] => {
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
          if (ch === '"') {
            if (i + 1 < line.length && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            current += ch;
          }
        } else if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    };

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row.');
    }
    const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const values = parseLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ?? '';
      });
      return row;
    });
  };

  const handleImportCsv = async () => {
    const file = csvInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a CSV file first.");
      return;
    }
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      const result = await importCsv.mutateAsync(rows);
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
                setListingForm(emptyListingForm);
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
        <ListingFormFields form={listingForm} setForm={setListingForm} />
        <div className="flex gap-2 pt-4">
          <Button
            scheme="supportive"
            disabled={
              !listingForm.title ||
              !listingForm.description ||
              createListing.isPending
            }
            onClick={() => void handleCreateListing()}
          >
            {createListing.isPending ? "Creating..." : "Create Listing"}
          </Button>
          <Button variant="outline" onClick={() => setListingEmployer(null)}>
            Cancel
          </Button>
        </div>
      </ModalShell>

      <ModalShell
        open={showRegisterAndList}
        onClose={() => setShowRegisterAndList(false)}
        title="Register Employer & Create Listing"
      >
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Employer Account
          </h2>
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
          <h2 className="text-xl font-bold text-slate-800 mb-2 pt-2">
            Job Listing
          </h2>
          <ListingFormFields form={ralForm} setForm={setRalForm} />
          <div className="flex gap-2 pt-4">
            <Button
              scheme="supportive"
              disabled={
                !ralName ||
                !ralEmail ||
                !ralForm.title ||
                !ralForm.description ||
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
            </code>{" "}
            (required).
            <br />
            Optional: job_location, job_requirements, job_salary,
            job_allowance, job_salary_freq, job_is_active, job_is_unlisted,
            job_is_year_round, job_start_date, job_end_date.
            <br />
            Internship preferences: job_internship_types, job_setup_ids,
            job_workload_ids, job_expected_start_date, job_require_github,
            job_require_portfolio
            (use commas for multi-value, e.g. `credited,voluntary`).
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
            <Button variant="outline" onClick={() => setShowImportCsv(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </ModalShell>
    </>
  );
}
