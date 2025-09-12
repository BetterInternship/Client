"use client";

import { useCallback, useMemo, useState } from "react";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import { Badge, BoolBadge } from "@/components/ui/badge";
import { ListShell, RowCard, Meta, LastLogin } from "@/components/features/hire/god/ui";
import { getFullName } from "@/lib/utils/user-utils";
import { formatDate } from "@/lib/utils";
import {
  useUsers,
  useEmployers,
  useStudentImpersonation,
} from "@/lib/api/god.api";
import { useDbRefs } from "@/lib/db/use-refs";
import { useModal } from "@/hooks/use-modal";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { UserService } from "@/lib/api/services";
import { useFile } from "@/hooks/use-file";
import { FileText } from "lucide-react";

const STUDENT_ORIGIN =
  process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
const STUDENT_HOME = process.env.NEXT_PUBLIC_STUDENT_HOME || "/search";
const EMPLOYER_ORIGIN =
  process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

export default function StudentsPage() {
  const { users } = useUsers();
  const employers = useEmployers(); // for applications aggregation
  const refs = useDbRefs();

  const [search, setSearch] = useState<string | null>(null);
  const [hideNoApps, setHideNoApps] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const setSearchQuery = (id?: number | string | null) =>
    setSearch(id?.toString() ?? null);

  const applications = useMemo(() => {
    const apps: any[] = [];
    // @ts-ignore
    employers.data.forEach((e: any) =>
      e?.applications?.map((a: any) => apps.push(a))
    );
    return apps;
  }, [employers.data]);

  // Modals
  const {
    open: openApplicantModal,
    close: closeApplicantModal,
    Modal: ApplicantModal,
  } = useModal("applicant-modal");

  const {
    open: openResumeModal,
    close: closeResumeModal,
    Modal: ResumeModal,
  } = useModal("resume-modal");

  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: useCallback(
      async () => await UserService.getUserResumeURL(selectedUser?.id ?? ""),
      [selectedUser]
    ),
    route: selectedUser ? `/users/${selectedUser?.id}/resume` : "",
  });

  // Student impersonation
  const { impersonate, stop } = useStudentImpersonation();
  const [impUserId, setImpUserId] = useState<string | null>(null);

  const goToStudentHome = () => {
    const dest = new URL(STUDENT_HOME, STUDENT_ORIGIN).toString();
    window.location.assign(dest);
  };

  const viewAsStudent = async (studentId: string) => {
    try {
      setImpUserId(studentId);
      await impersonate.mutateAsync({ studentId });
      goToStudentHome();
    } catch (e) {
      console.error(e);
      alert("Failed to start student mode. Check network tab.");
    } finally {
      setImpUserId(null);
    }
  };

  const exitStudentMode = async () => {
    try {
      await stop.mutateAsync();
      const dest = new URL("/god", EMPLOYER_ORIGIN).toString();
      window.location.assign(dest);
    } catch (e) {
      console.error(e);
      alert("Failed to stop student mode. Check network tab.");
    }
  };

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <Autocomplete
        setter={setSearchQuery}
        options={users.map((u: any) => ({
          id: u.id,
          name: getFullName(u) ?? "",
        }))}
        className="w-80"
        placeholder="Search student..."
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={hideNoApps}
          onChange={(e) => setHideNoApps(e.target.checked)}
        />
        Hide without applications
      </label>
      <Button
        variant="outline"
        size="xs"
        onClick={exitStudentMode}
        disabled={stop.isPending}
      >
        {stop.isPending ? "Exiting..." : "Exit student mode"}
      </Button>
    </div>
  );

  const rows = users
    .filter(
      (u: any) =>
        !hideNoApps ||
        applications.filter((a) => a.user_id === u.id).length ||
        u.id === search
    )
    .filter((u: any) =>
      `${getFullName(u)} ${u.email} ${refs.to_college_name(
        u.college
      )} ${refs.to_degree_full_name(u.degree)}`
        ?.toLowerCase()
        .includes(search?.toLowerCase() ?? "")
    )
    .toSorted(
      (a: any, b: any) =>
        new Date(b.created_at ?? "").getTime() -
        new Date(a.created_at ?? "").getTime()
    )
    .map((u: any) => {
      const userApplications = applications.filter((a) => a.user_id === u.id);
      const isRowPending = impersonate.isPending && impUserId === u.id;
      const lastTs = u?.last_session?.timestamp
        ? new Date(u.last_session.timestamp).getTime()
        : undefined;

      return (
        <RowCard
          key={u.id}
          title={getFullName(u)}
          subtitle={<span className="text-xs text-slate-500">{u.email}</span>}
          metas={
            <>
              <Meta>{refs.to_college_name(u.college)}</Meta>
              <Meta>{refs.to_degree_full_name(u.degree)}</Meta>
              <Meta>{userApplications.length ?? 0} applications</Meta>
              <BoolBadge
                state={u.is_verified}
                onValue="verified"
                offValue="not verified"
              />
              <LastLogin ts={lastTs} />
              <Meta>created: {formatDate(u.created_at ?? "")}</Meta>
            </>
          }
          leftActions={
            <Button
              scheme="primary"
              size="xs"
              disabled={isRowPending}
              onClick={(ev) => {
                ev.stopPropagation();
                viewAsStudent(u.id);
              }}
            >
              {isRowPending ? "Starting..." : "View"}
            </Button>
          }
          more={
            <div className="space-y-2 text-sm">
              <div>
                Student ID: <code className="text-slate-500">{u.id}</code>
              </div>
              <div>
                Calendar:{" "}
                {u.calendar_link ? (
                  <a
                    className="text-blue-600 underline"
                    href={u.calendar_link}
                    target="_blank"
                  >
                    Open
                  </a>
                ) : (
                  "—"
                )}
              </div>
            </div>
          }
          onClick={() => {
            setSelectedUser(u);
            openApplicantModal();
          }}
        />
      );
    });

  return (
    <>
      <ListShell toolbar={toolbar} fullWidth>{rows}</ListShell>

      <ApplicantModal>
        <ApplicantModalContent
          is_employer={true}
          clickable={true}
          pfp_fetcher={async () =>
            UserService.getUserPfpURL(selectedUser?.id ?? "")
          }
          pfp_route={`/users/${selectedUser?.id}/pic`}
          applicant={selectedUser ?? undefined}
          open_calendar={async () => {
            closeApplicantModal();
            window?.open(selectedUser?.calendar_link ?? "", "_blank")?.focus();
          }}
          open_resume={async () => {
            closeApplicantModal();
            await syncResumeURL();
            openResumeModal();
          }}
          job={{}}
        />
      </ApplicantModal>

      <ResumeModal>
        {selectedUser?.resume ? (
          <div className="h-full flex flex-col">
            <h1 className="font-bold font-heading text-2xl px-6 py-4 text-gray-900">
              {getFullName(selectedUser)} - Resume
            </h1>
            <PDFPreview url={resumeURL} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 px-8">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="font-heading font-bold text-2xl mb-4 text-gray-700">
                No Resume Available
              </h1>
              <div className="max-w-md text-center border border-red-200 text-red-600 bg-red-50 rounded-[0.33em] p-4">
                This applicant has not uploaded a resume yet.
              </div>
            </div>
          </div>
        )}
      </ResumeModal>
    </>
  );
}
