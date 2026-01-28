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
import { getFullName } from "@/lib/profile";
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
import { useModalRegistry } from "@/components/modals/modal-registry";
import { useFile } from "@/hooks/use-file";
import {
  FileText,
  Filter as FilterIcon,
  ChevronDown,
  Check,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
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
import { useQueryClient } from "@tanstack/react-query";
import { useJobsData } from "@/lib/api/student.data.api";

const STUDENT_ORIGIN =
  process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
const STUDENT_HOME = process.env.NEXT_PUBLIC_STUDENT_HOME || "/search";

/* ---------- Small helpers for the Filters UI ---------- */

const RowCheck = ({ visible }: { visible: boolean }) => (
  <span
    className={cn(
      "ml-auto inline-flex h-4 w-4 items-center justify-center rounded-sm border",
      visible ? "bg-blue-600 text-white border-blue-600" : "opacity-0",
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
        : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100",
    )}
  >
    {children}
  </button>
);

/* ---------- Page ---------- */

export default function StudentsPage() {
  const { users, isFetching } = useUsers();
  const queryClient = useQueryClient();
  const employers = useEmployers();
  const refs = useDbRefs();
  const modalRegistry = useModalRegistry();

  // local tags (by user.id)
  const { tagMap, addTag, removeTag, allTags } =
    useLocalTagMap("god-tags:students");

  // Mass apply selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set(),
  );
  const [massApplyMode, setMassApplyMode] = useState(false);

  // filter states
  const [filterApplyForMe, setFilterApplyForMe] = useState<boolean | null>(
    null,
  );
  const [filterCreditedInternship, setFilterCreditedInternship] = useState<
    boolean | null
  >(null);
  const [activeColleges, setActiveColleges] = useState<string[]>([]);
  const [activeWorkModes, setActiveWorkModes] = useState<(string | number)[]>(
    [],
  );
  const [activeWorkTypes, setActiveWorkTypes] = useState<(string | number)[]>(
    [],
  );

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
      [selectedUser],
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

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  };

  const clearSelection = () => setSelectedStudentIds(new Set());

  const selectAllFiltered = () => {
    const next = new Set(selectedStudentIds);
    filtered.forEach((u: any) => u.id && next.add(u.id));
    setSelectedStudentIds(next);
  };

  const unselectAllFiltered = () => {
    const next = new Set(selectedStudentIds);
    filtered.forEach((u: any) => u.id && next.delete(u.id));
    setSelectedStudentIds(next);
  };

  const applications = useMemo(() => {
    const apps: any[] = [];
    employers.data.forEach((e: any) =>
      e?.applications?.map((a: any) => apps.push(a)),
    );
    return apps;
  }, [employers.data]);

  /* ---------- Options for dropdowns ---------- */

  const positionOptions = useMemo(
    () => refs.job_categories.map((c) => ({ id: c.id, label: c.name })),
    [refs.job_categories],
  );

  /* ---------- Filter helpers ---------- */

  const matchesCollege = (u: any) => {
    if (activeColleges.length === 0) return true;
    return activeColleges.includes(u.college);
  };

  const matchesApplyForMe = (u: any) => {
    if (filterApplyForMe === null) return true;
    return u.apply_for_me === filterApplyForMe;
  };

  const matchesWorkModes = (u: any) => {
    if (activeWorkModes.length === 0) return true;
    const modes = u.internship_preferences?.job_setup_ids ?? [];
    return activeWorkModes.some((mode) => modes.includes(String(mode) as any));
  };

  const matchesWorkTypes = (u: any) => {
    if (activeWorkTypes.length === 0) return true;
    const types = u.internship_preferences?.job_commitment_ids ?? [];
    return activeWorkTypes.some((type) => types.includes(String(type) as any));
  };
  const matchesCreditedInternship = (u: any) => {
    if (filterCreditedInternship === null) return true;
    const isCredited = u.internship_preferences?.internship_type === "credited";
    return isCredited === filterCreditedInternship;
  };

  /* ---------- Main filtered list ---------- */
  const filtered = users
    .filter(
      (u: any) =>
        !hideNoApps ||
        applications.some((a) => a.user_id === u.id) ||
        u.id === search,
    )
    .filter((u: any) =>
      `${getFullName(u)} ${u.email} ${refs.to_college_name(u.college)} ${
        u.degree
      }`
        ?.toLowerCase()
        .includes(search?.toLowerCase() ?? ""),
    )
    .filter(matchesCollege)
    .filter(matchesApplyForMe)
    .filter(matchesWorkModes)
    .filter(matchesWorkTypes)
    .filter(matchesCreditedInternship)
    .toSorted(
      (a: any, b: any) =>
        new Date(b.created_at ?? "").getTime() -
        new Date(a.created_at ?? "").getTime(),
    );

  /* ---------- ID(s) → text helpers ---------- */

  const toSepText = <ID extends string | number>(
    idsOrId: ID[] | ID | null | undefined,
    toName: (id: ID) => string | null,
    sep = ", ",
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
    const isSelected = selectedStudentIds.has(u.id);
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
      " · ",
    );
    const typeTxt = toSepText<number>(
      u.job_type_ids ?? u.job_type,
      typeName,
      " · ",
    );
    const posTxt = toSepText<string>(u.job_category_ids, categoryName, " · ");

    return (
      <RowCard
        key={u.id}
        title={getFullName(u)}
        subtitle={<span className="text-xs text-slate-500">{u.email}</span>}
        metas={
          <div className="space-y-1">
            <div className="flex items-center gap-1">
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
              <BoolBadge
                state={u.resume}
                onValue="Profile: Complete"
                offValue="Profile: Incomplete"
              />
              <LastLogin ts={lastTs} />
              <Meta>created: {formatDate(u.created_at ?? "")}</Meta>
              <Meta>{userApplications.length ?? 0} applications</Meta>
            </div>

            <div className="flex items-center gap-1">
              <Meta>{refs.to_college_name(u.college)}</Meta>
              <Meta>{u.degree}</Meta>
            </div>
          </div>
        }
        leftActions={
          massApplyMode ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStudentSelection(u.id);
              }}
              className="p-1 hover:bg-blue-50 rounded transition !opacity-100 !pointer-events-auto"
            >
              {isSelected ? (
                <CheckSquare className="h-5 w-5 text-blue-600" />
              ) : (
                <Square className="h-5 w-5 text-gray-400" />
              )}
            </button>
          ) : (
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
          )
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
          if (massApplyMode) {
            toggleStudentSelection(u.id);
          } else {
            setSelectedUser(u);
            openApplicantModal();
          }
        }}
        className={cn(
          "transition-colors",
          massApplyMode && isSelected && "bg-blue-50 border-blue-200",
        )}
      />
    );
  });

  /* ---------- Filters popover ---------- */

  const filtersActiveCount =
    (hideNoApps ? 1 : 0) +
    (filterApplyForMe !== null ? 1 : 0) +
    (filterCreditedInternship !== null ? 1 : 0) +
    activeColleges.length +
    activeWorkModes.length +
    activeWorkTypes.length;

  // Get unique colleges for filter
  const collegeOptions = useMemo(() => {
    const colleges = new Set<string>();
    users.forEach((u: any) => {
      if (u.college) colleges.add(u.college);
    });
    return Array.from(colleges).sort((a, b) =>
      refs.to_college_name(a).localeCompare(refs.to_college_name(b)),
    );
  }, [users, refs]);

  const toolbar = (
    <div className="flex justify-between">
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

        <Button
          variant={massApplyMode ? "default" : "outline"}
          onClick={() => {
            setMassApplyMode(!massApplyMode);
            if (!massApplyMode) {
              clearSelection();
            }
          }}
        >
          {massApplyMode ? "Cancel Selection" : "Mass Apply"}
        </Button>

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

          <PopoverContent
            align="start"
            className="w-[28rem] p-0  max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <div className="font-medium">Filters</div>
              {filtersActiveCount > 0 && (
                <button
                  className="text-xs text-blue-700 hover:underline"
                  onClick={() => {
                    setHideNoApps(false);
                    setFilterApplyForMe(null);
                    setFilterCreditedInternship(null);
                    setActiveColleges([]);
                    setActiveWorkModes([]);
                    setActiveWorkTypes([]);
                    setActivePositions([]);
                  }}
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Hide without applications */}
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

              {/* Apply For Me */}
              <div className="px-4 py-3 border-b">
                <div className="text-sm font-medium mb-2">Apply For Me</div>
                <div className="flex gap-2">
                  <Button
                    variant={filterApplyForMe === true ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setFilterApplyForMe(
                        filterApplyForMe === true ? null : true,
                      )
                    }
                  >
                    Enabled
                  </Button>
                  <Button
                    variant={filterApplyForMe === false ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setFilterApplyForMe(
                        filterApplyForMe === false ? null : false,
                      )
                    }
                  >
                    Disabled
                  </Button>
                </div>
              </div>

              {/* College */}
              <div className="px-4 py-3 border-b">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">College</div>
                  {activeColleges.length > 0 && (
                    <button
                      className="text-xs text-blue-700 hover:underline"
                      onClick={() => setActiveColleges([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {collegeOptions.length === 0 ? (
                    <div className="px-2 py-1 text-xs text-slate-400">
                      No colleges
                    </div>
                  ) : (
                    collegeOptions.map((college) => {
                      const on = activeColleges.includes(college);
                      return (
                        <button
                          key={college}
                          onClick={() =>
                            setActiveColleges((prev) =>
                              on
                                ? prev.filter((x) => x !== college)
                                : [...prev, college],
                            )
                          }
                          className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-left hover:bg-gray-50 rounded transition cursor-pointer"
                        >
                          <span className="truncate">
                            {refs.to_college_name(college)}
                          </span>
                          <RowCheck visible={on} />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Work Modes */}
              <div className="px-4 py-3 border-b">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">Work Modes</div>
                  {activeWorkModes.length > 0 && (
                    <button
                      className="text-xs text-blue-700 hover:underline"
                      onClick={() => setActiveWorkModes([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {refs.job_modes.length === 0 ? (
                    <div className="px-2 py-1 text-xs text-slate-400">
                      No work modes
                    </div>
                  ) : (
                    refs.job_modes.map((mode) => {
                      const on = activeWorkModes.includes(mode.id);
                      return (
                        <button
                          key={mode.id}
                          onClick={() =>
                            setActiveWorkModes((prev) =>
                              on
                                ? prev.filter((x) => x !== mode.id)
                                : [...prev, mode.id],
                            )
                          }
                          className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-left hover:bg-gray-50 rounded transition cursor-pointer"
                        >
                          <span className="truncate">{mode.name}</span>
                          <RowCheck visible={on} />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Work Types */}
              <div className="px-4 py-3 border-b">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">Work Types</div>
                  {activeWorkTypes.length > 0 && (
                    <button
                      className="text-xs text-blue-700 hover:underline"
                      onClick={() => setActiveWorkTypes([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {refs.job_types.length === 0 ? (
                    <div className="px-2 py-1 text-xs text-slate-400">
                      No work types
                    </div>
                  ) : (
                    refs.job_types.map((type) => {
                      const on = activeWorkTypes.includes(type.id);
                      return (
                        <button
                          key={type.id}
                          onClick={() =>
                            setActiveWorkTypes((prev) =>
                              on
                                ? prev.filter((x) => x !== type.id)
                                : [...prev, type.id],
                            )
                          }
                          className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-left hover:bg-gray-50 rounded transition cursor-pointer"
                        >
                          <span className="truncate">{type.name}</span>
                          <RowCheck visible={on} />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Credited Internship */}
              <div className="px-4 py-3 border-b">
                <div className="text-sm font-medium mb-2">Internship Type</div>
                <div className="flex gap-2">
                  <Button
                    variant={
                      filterCreditedInternship === true ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setFilterCreditedInternship(
                        filterCreditedInternship === true ? null : true,
                      )
                    }
                  >
                    Credited
                  </Button>
                  <Button
                    variant={
                      filterCreditedInternship === false ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setFilterCreditedInternship(
                        filterCreditedInternship === false ? null : false,
                      )
                    }
                  >
                    Non-Credited
                  </Button>
                </div>
              </div>
            </div>

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
                      setFilterApplyForMe(null);
                      setFilterCreditedInternship(null);
                      setActiveColleges([]);
                      setActiveWorkModes([]);
                      setActiveWorkTypes([]);
                      setActivePositions([]);
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
      <div className="px-2">
        <Button
          className="bg-warning hover:bg-warning/80"
          disabled={isFetching}
          onClick={() =>
            void queryClient.invalidateQueries({ queryKey: ["god-students"] })
          }
        >
          {isFetching ? "Refreshing Cache..." : "Refresh Cache"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <ListShell toolbar={toolbar} fullWidth>
        {rows}
      </ListShell>

      {/* Floating toolbar when students are selected */}
      {massApplyMode && selectedStudentIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg px-6 py-4 flex items-center gap-4 z-50">
          <span className="font-semibold text-gray-900">
            {selectedStudentIds.size} student
            {selectedStudentIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                unselectAllFiltered();
              }}
            >
              Deselect All on Page
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                selectAllFiltered();
              }}
            >
              Select All on Page
            </Button>
            <Button
              size="sm"
              onClick={() => {
                modalRegistry.massApplyJobSelector.open({
                  selectedStudentIds,
                  onClose: () => {
                    setMassApplyMode(false);
                    clearSelection();
                  },
                  panelClassName:
                    "w-[85vw] h-[85vh] sm:max-w-[85vw] sm:max-h-[85vh]",
                });
              }}
            >
              Apply to Job
            </Button>
          </div>
        </div>
      )}

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
