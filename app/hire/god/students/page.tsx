"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import {
  ListShell,
  RowCard,
  Meta,
  LastLogin,
  useLocalTagMap,
  EditableTags,
  TagFilterBar,
  ListSummary,
} from "@/components/features/hire/god/ui";
import { BoolBadge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";

const STUDENT_ORIGIN =
  process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
const STUDENT_HOME = process.env.NEXT_PUBLIC_STUDENT_HOME || "/search";

export default function StudentsPage() {
  const { users } = useUsers();
  const employers = useEmployers();
  const refs = useDbRefs();

  // tags for students (by user.id)
  const { tagMap, addTag, removeTag, allTags } =
    useLocalTagMap("god-tags:students");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [mode, setMode] = useState<"any" | "all">("any");
  const toggleActive = (t: string) =>
    setActiveTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  const clearActive = () => setActiveTags([]);

  const [search, setSearch] = useState<string | null>(null);
  const [hideNoApps, setHideNoApps] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const setSearchQuery = (id?: number | string | null) =>
    setSearch(id?.toString() ?? null);

  const applications = useMemo(() => {
    const apps: any[] = [];
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

  // Signed resume URL for the currently selected user
  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: useCallback(
      async () => await UserService.getUserResumeURL(selectedUser?.id ?? ""),
      [selectedUser]
    ),
    route: selectedUser ? `/users/${selectedUser?.id}/resume` : "",
  });

  // Prefetch signed URL whenever a new student is selected
  useEffect(() => {
    if (selectedUser?.id) {
      syncResumeURL();
    }
  }, [selectedUser?.id, syncResumeURL]);

  // Student impersonation
  const { impersonate } = useStudentImpersonation();
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

  const matchesTagFilter = (id: string) => {
    if (activeTags.length === 0) return true;
    const tags = tagMap[id] ?? [];
    return mode === "any"
      ? activeTags.some((t) => tags.includes(t))
      : activeTags.every((t) => tags.includes(t));
  };

  const filtered = users
    .filter(
      (u: any) =>
        !hideNoApps ||
        applications.some((a) => a.user_id === u.id) ||
        u.id === search
    )
    .filter((u: any) =>
      `${getFullName(u)} ${u.email} ${refs.to_college_name(
        u.college
      )} ${refs.to_degree_full_name(u.degree)}`
        ?.toLowerCase()
        .includes(search?.toLowerCase() ?? "")
    )
    .filter((u: any) => matchesTagFilter(u.id))
    .toSorted(
      (a: any, b: any) =>
        new Date(b.created_at ?? "").getTime() -
        new Date(a.created_at ?? "").getTime()
    );

  // join one or many IDs into a separated string via a name mapper
  const toSepText = <ID extends string | number>(
    idsOrId: ID[] | ID | null | undefined,
    toName: (id: ID) => string | null,
    sep = ", "
  ) => {
    const ids: ID[] = Array.isArray(idsOrId)
      ? idsOrId
      : idsOrId != null
      ? [idsOrId]
      : [];
    return ids
      .map((x) => toName(x) ?? "")
      .filter(Boolean)
      .join(sep);
  };

  const rows = filtered.map((u: any) => {
    const userApplications = applications.filter((a) => a.user_id === u.id);
    const isRowPending = impersonate.isPending && impUserId === u.id;
    const lastTs = u?.last_session?.timestamp
      ? new Date(u.last_session.timestamp).getTime()
      : undefined;
    const rowTags = tagMap[u.id] ?? [];

    const modeName = (id: number) => refs.to_job_mode_name(id);
    const typeName = (id: number) => refs.to_job_type_name(id);
    const categoryName = (id: string) => refs.to_job_category_name(id, "");

    const modeTxt = toSepText<number>(
      u.job_mode_ids ?? u.job_mode,
      modeName,
      " · "
    );
    const typeTxt = toSepText<number>(
      u.job_type_ids ?? u.job_type,
      typeName,
      " · "
    );
    const posTxt = toSepText<string>(u.job_category_ids, categoryName, " · ");

    return (
      <RowCard
        key={u.id}
        title={getFullName(u)}
        subtitle={<span className="text-xs text-slate-500">{u.email}</span>}
        metas={
          <>
            <BoolBadge
              state={u.is_verified}
              onValue="verified"
              offValue="not verified"
            />
            <LastLogin ts={lastTs} />
            <Meta>created: {formatDate(u.created_at ?? "")}</Meta>

            <Separator orientation="vertical" className="h-6" />
            {/* <Meta>{refs.to_college_name(u.college)}</Meta> */}
            <Meta>{refs.to_degree_full_name(u.degree)}</Meta>
            <Meta>{userApplications.length ?? 0} applications</Meta>

            {(modeTxt || typeTxt || posTxt) && (
              <Separator orientation="vertical" className="h-6" />
            )}
            {modeTxt && <Meta>{modeTxt}</Meta>}
            {typeTxt && <Meta>{typeTxt}</Meta>}
            {posTxt && <Meta>{posTxt}</Meta>}
          </>
        }
        footer={
          <EditableTags
            id={u.id}
            tags={rowTags}
            onAdd={addTag}
            onRemove={removeTag}
            suggestions={allTags}
            placeholder="tag student…"
          />
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

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <ListSummary
        label="Students"
        total={users.length}
        visible={filtered.length}
        extras={
          activeTags.length > 0 ? (
            <span>
              {mode.toUpperCase()} · {activeTags.length} tag
              {activeTags.length > 1 ? "s" : ""}
            </span>
          ) : null
        }
      />
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

      <Separator orientation="vertical" className="h-6" />

      <TagFilterBar
        allTags={allTags}
        active={activeTags}
        onToggle={toggleActive}
        onClear={clearActive}
        mode={mode}
        setMode={setMode}
      />
    </div>
  );

  return (
    <>
      <ListShell toolbar={toolbar} fullWidth>
        {rows}
      </ListShell>

      <ApplicantModal className="!w-3/4 !max-w-8xl">
        <ApplicantModalContent
          is_employer={true}
          clickable={true}
          pfp_fetcher={async () =>
            UserService.getUserPfpURL(selectedUser?.id ?? "")
          }
          pfp_route={`/users/${selectedUser?.id}/pic`}
          applicant={selectedUser ?? undefined}
          resume_url={resumeURL}
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
        {resumeURL ? (
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
