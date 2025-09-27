"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import {
  ListShell,
  RowCard,
  Meta,
  LastLogin,
  useLocalTagMap,
  EditableTags,
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
import { FileText, Filter as FilterIcon, ChevronDown, Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandInput,
  CommandEmpty,
} from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const STUDENT_ORIGIN =
  process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
const STUDENT_HOME = process.env.NEXT_PUBLIC_STUDENT_HOME || "/search";

/* ---------- Small helpers for the Filters UI ---------- */

const RowCheck = ({ visible }: { visible: boolean }) => (
  <span
    className={cn(
      "ml-auto inline-flex h-4 w-4 items-center justify-center rounded-sm border",
      visible ? "bg-blue-600 text-white border-blue-600" : "opacity-0"
    )}
  >
    <Check className="h-3 w-3" />
  </span>
);

const Chip = ({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-2.5 py-1 rounded-full border text-xs transition-colors",
      active
        ? "bg-blue-50 border-blue-300 text-blue-700"
        : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
    )}
  >
    {children}
  </button>
);

/* ---------- Page ---------- */

export default function StudentsPage() {
  const { users } = useUsers();
  const employers = useEmployers();
  const refs = useDbRefs();

  // local tags (by user.id)
  const { tagMap, addTag, removeTag, allTags } =
    useLocalTagMap("god-tags:students");

  // filter states
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [mode, setMode] = useState<"any" | "all">("any"); // tag matching
  const [activeCourses, setActiveCourses] = useState<string[]>([]);
  const [activePositions, setActivePositions] = useState<string[]>([]);

  // quick filters / search
  const [search, setSearch] = useState<string | null>(null);
  const [hideNoApps, setHideNoApps] = useState(false);

  // selection / modals
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
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

  // Prefetch signed URL whenever a new student is selected (simple + effective)
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

  const setSearchQuery = (id?: number | string | null) =>
    setSearch(id?.toString() ?? null);

  const applications = useMemo(() => {
    const apps: any[] = [];
    employers.data.forEach((e: any) =>
      e?.applications?.map((a: any) => apps.push(a))
    );
    return apps;
  }, [employers.data]);

  /* ---------- Options for dropdowns ---------- */

  const positionOptions = useMemo(
    () => refs.job_categories.map((c) => ({ id: c.id, label: c.name })),
    [refs.job_categories]
  );

  /* ---------- Filter helpers ---------- */

  const matchesTagFilter = (id: string) => {
    if (activeTags.length === 0) return true;
    const tags = tagMap[id] ?? [];
    return mode === "any"
      ? activeTags.some((t) => tags.includes(t))
      : activeTags.every((t) => tags.includes(t));
  };

  const matchesPosition = (u: any) => {
    if (activePositions.length === 0) return true;
    const arr: string[] = Array.isArray(u.job_category_ids)
      ? u.job_category_ids
      : Array.isArray(u.job_position_ids)
      ? u.job_position_ids
      : [];
    return arr.some((id) => activePositions.includes(id));
  };

  /* ---------- Main filtered list ---------- */

  const filtered = users
    .filter(
      (u: any) =>
        !hideNoApps ||
        applications.some((a) => a.user_id === u.id) ||
        u.id === search
    )
    .filter((u: any) =>
      `${getFullName(u)} ${u.email} ${refs.to_college_name(u.college)} ${
        u.degree
      }`
        ?.toLowerCase()
        .includes(search?.toLowerCase() ?? "")
    )
    .filter((u: any) => matchesTagFilter(u.id))
    .filter(matchesPosition)
    .toSorted(
      (a: any, b: any) =>
        new Date(b.created_at ?? "").getTime() -
        new Date(a.created_at ?? "").getTime()
    );

  /* ---------- ID(s) → text helpers ---------- */

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

  /* ---------- Rows ---------- */

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
              state={u.apply_for_me}
              onValue="Apply for me: ON"
              offValue="Apply for me: OFF"
              offScheme="destructive"
            />
            <BoolBadge
              state={u.is_verified}
              onValue="verified"
              offValue="not verified"
            />
            <LastLogin ts={lastTs} />
            <Meta>created: {formatDate(u.created_at ?? "")}</Meta>

            <Separator orientation="vertical" className="h-6" />
            <Meta>{u.degree}</Meta>
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

  /* ---------- Filters popover ---------- */

  const filtersActiveCount =
    (hideNoApps ? 1 : 0) +
    activeCourses.length +
    activePositions.length +
    activeTags.length;

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <ListSummary
        label="Students"
        total={users.length}
        visible={filtered.length}
        extras={
          filtersActiveCount > 0 ? (
            <span>
              {filtersActiveCount} filter{filtersActiveCount > 1 ? "s" : ""}
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

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FilterIcon className="h-4 w-4" />
            Filters
            {filtersActiveCount > 0 && (
              <span className="ml-1 rounded-full bg-blue-600 text-white text-xs px-2 py-0.5">
                {filtersActiveCount}
              </span>
            )}
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-[28rem] p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div className="font-medium">Filters</div>
            {filtersActiveCount > 0 && (
              <button
                className="text-xs text-blue-700 hover:underline"
                onClick={() => {
                  setHideNoApps(false);
                  setActiveCourses([]);
                  setActivePositions([]);
                  setActiveTags([]);
                  setMode("any");
                }}
              >
                Reset all
              </button>
            )}
          </div>

          {/* Quick */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">
                Hide without applications
              </span>
              <Switch
                checked={hideNoApps}
                onCheckedChange={(v) => setHideNoApps(Boolean(v))}
              />
            </div>
          </div>

          {/* Course */}
          <div className="px-4 py-3 border-b">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Course</div>
              {activeCourses.length > 0 && (
                <button
                  className="text-xs text-blue-700 hover:underline"
                  onClick={() => setActiveCourses([])}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Position */}
          <div className="px-4 py-3 border-b">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Position</div>
              {activePositions.length > 0 && (
                <button
                  className="text-xs text-blue-700 hover:underline"
                  onClick={() => setActivePositions([])}
                >
                  Clear
                </button>
              )}
            </div>

            <Command>
              <CommandInput placeholder="Search position..." />
              <CommandList className="max-h-40 overflow-auto">
                <CommandEmpty className="px-2 py-1 text-xs text-slate-400">
                  No matches
                </CommandEmpty>
                <CommandGroup>
                  {positionOptions.map((p) => {
                    const on = activePositions.includes(p.id);
                    return (
                      <CommandItem
                        key={p.id}
                        onSelect={() =>
                          setActivePositions((prev) =>
                            on
                              ? prev.filter((x) => x !== p.id)
                              : [...prev, p.id]
                          )
                        }
                        className="cursor-pointer"
                      >
                        <span className="truncate">{p.label}</span>
                        <RowCheck visible={on} />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>;

          {
            /* Tags */
          }
          <div className="px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Tags</div>
              <div className="flex items-center gap-3">
                <button
                  className="text-xs text-slate-600 underline"
                  onClick={() => setMode((m) => (m === "any" ? "all" : "any"))}
                  title="Toggle ANY/ALL"
                >
                  Match: {mode.toUpperCase()}
                </button>
                {activeTags.length > 0 && (
                  <button
                    className="text-xs text-blue-700 hover:underline"
                    onClick={() => setActiveTags([])}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-auto pr-1">
              {allTags.length === 0 ? (
                <span className="text-xs text-slate-400">No tags</span>
              ) : (
                allTags.map((t) => {
                  const on = activeTags.includes(t);
                  return (
                    <Chip
                      key={t}
                      active={on}
                      onClick={() =>
                        setActiveTags((prev) =>
                          on ? prev.filter((x) => x !== t) : [...prev, t]
                        )
                      }
                    >
                      {t}
                    </Chip>
                  );
                })
              )}
            </div>
          </div>;

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {filtersActiveCount > 0
                ? `${filtersActiveCount} active`
                : "No filters applied"}
            </div>
            <div className="flex items-center gap-2">
              {filtersActiveCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => {
                    setHideNoApps(false);
                    setActiveCourses([]);
                    setActivePositions([]);
                    setActiveTags([]);
                    setMode("any");
                  }}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <>
      <ListShell toolbar={toolbar} fullWidth>
        {rows}
      </ListShell>

      {/* Wider modal for resume preview on desktop */}
      <ApplicantModal className="!w-[1200px] max-w-[95vw]">
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
