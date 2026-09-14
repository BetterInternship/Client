"use client";

import { Suspense, useState, useMemo } from "react";
import { toast } from "sonner";
import { Button, Badge } from "@betterinternship/components";
import {
  ListShell,
  RowCard,
  Meta,
  ListSummary,
} from "@/components/features/hire/god/ui";
import {
  useGodMoaUploads,
  useApproveMoaUpload,
  useRejectMoaUpload,
  useGodUniversities,
  MoaUpload,
} from "@/lib/api/god.api";
import { Paginator } from "@/components/ui/paginator";

const PAGE_SIZE = 20;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-[0.33em] border w-full max-w-xl mx-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  switch (status) {
    case "approved":
      return <Badge type="success">approved</Badge>;
    case "rejected":
      return <Badge type="destructive">rejected</Badge>;
    case "pending":
    default:
      return <Badge type="warning">pending</Badge>;
  }
}

function GodMoaUploadsPageContent() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );

  const { data, isFetching } = useGodMoaUploads({
    page,
    limit: PAGE_SIZE,
    status: statusFilter,
  });

  const approveMoa = useApproveMoaUpload();
  const rejectMoa = useRejectMoaUpload();
  const { data: uniData } = useGodUniversities();

  const uploads = data?.data ?? [];
  const total = data?.total ?? 0;

  const [approveTarget, setApproveTarget] = useState<MoaUpload | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const defaultExpiry = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const [expiresAt, setExpiresAt] = useState(defaultExpiry);

  const handleApprove = async () => {
    if (!approveTarget || !selectedUniversity) {
      toast.error("Please select a university.");
      return;
    }
    try {
      const result: any = await approveMoa.mutateAsync({
        moaId: approveTarget.id,
        universityId: selectedUniversity,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      if (result?.error) {
        toast.error(`Failed: ${result.error}`);
        return;
      }
      toast.success("MOA approved.");
      setApproveTarget(null);
      setSelectedUniversity("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to approve MOA.");
    }
  };

  const handleReject = async (upload: MoaUpload) => {
    try {
      const result: any = await rejectMoa.mutateAsync(upload.id);
      if (result?.error) {
        toast.error(`Failed: ${result.error}`);
        return;
      }
      toast.success("MOA rejected.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to reject MOA.");
    }
  };

  const rows = uploads.map((u: MoaUpload) => {
    const fileUrl = u.document_link
      ? `${API_BASE_URL}/god/moa-documents/${u.id}/file`
      : null;

    return (
      <RowCard
        key={u.id}
        title={u.employer_name ?? u.employer_id}
        subtitle={
          u.university_name ? (
            <span>University: {u.university_name}</span>
          ) : (
            <span className="text-warning">No university assigned</span>
          )
        }
        leftActions={
          <>
            {fileUrl && (
              <Button
                scheme="primary"
                size="xs"
                onClick={(ev) => {
                  ev.stopPropagation();
                  window.open(fileUrl, "_blank");
                }}
              >
                View PDF
              </Button>
            )}
          </>
        }
        more={
          <div className="space-y-2 text-sm">
            <div>
              MOA ID: <code className="text-muted-foreground">{u.id}</code>
            </div>
            <div>
              Employer ID:{" "}
              <code className="text-muted-foreground">{u.employer_id}</code>
            </div>
            {u.status !== "approved" && (
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="xs"
                  scheme="supportive"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setApproveTarget(u);
                    setSelectedUniversity("");
                  }}
                  disabled={approveMoa.isPending}
                >
                  Approve
                </Button>
                <Button
                  size="xs"
                  scheme="warning"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    void handleReject(u);
                  }}
                  disabled={rejectMoa.isPending}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        }
      />
    );
  });

  const toolbar = (
    <div className="flex justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <ListSummary
          label="MOA Uploads"
          total={total}
          visible={uploads.length}
        />

        <select
          value={statusFilter ?? ""}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value || undefined);
          }}
          className="rounded-[0.33em] border px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="px-2 text-sm text-muted-foreground self-center">
        {isFetching ? "Loading..." : null}
      </div>
    </div>
  );

  return (
    <>
      <ListShell toolbar={toolbar} fullWidth>
        {rows.length === 0 && !isFetching ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            No MOA uploads found.
          </li>
        ) : (
          rows
        )}
        <div className="p-4">
          <Paginator
            totalItems={total}
            itemsPerPage={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </ListShell>

      <ModalShell
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        title={`Approve MOA — ${approveTarget?.employer_name ?? ""}`}
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Select the university to associate with this MOA.
          </p>
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="rounded-md border px-3 py-1.5 text-sm w-full"
          >
            <option value="">— Select University —</option>
            {(uniData?.universities ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">
              Expires on
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="rounded-md border px-3 py-1.5 text-sm w-full"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              scheme="supportive"
              disabled={!selectedUniversity || approveMoa.isPending}
              onClick={() => void handleApprove()}
            >
              {approveMoa.isPending ? "Approving..." : "Approve"}
            </Button>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </ModalShell>
    </>
  );
}

export default function GodMoaUploadsPage() {
  return (
    <Suspense>
      <GodMoaUploadsPageContent />
    </Suspense>
  );
}
