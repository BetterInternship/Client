"use client";

import { useMemo, useState } from "react";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import {
  ListShell,
  RowCard,
  Meta,
  LastLogin,
  ListSummary,
} from "@/components/features/hire/god/ui";
import { BoolBadge, Badge } from "@/components/ui/badge";
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
import { UserService } from "@/lib/api/services";
import { useModalRegistry } from "@/components/modals/modal-registry";
import {
  Filter as FilterIcon,
  ChevronDown,
  Check,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Employer, EmployerApplication, PublicUser } from "@/lib/db/db.types";

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

export default function StudentsPage() {
  const { users, isFetching } = useUsers();
  const queryClient = useQueryClient();
  const employers = useEmployers();
  const refs = useDbRefs();
  const modalRegistry = useModalRegistry();

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
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const {
    open: openApplicantModal,
    close: closeApplicantModal,
    Modal: ApplicantModal,
  } = useModal("applicant-modal");

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
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const clearSelection = () => setSelectedStudentIds(new Set());

  const selectAllFiltered = () => {
    const next = new Set(selectedStudentIds);
    filtered.forEach((u: PublicUser) => u.id && next.add(u.id));
    setSelectedStudentIds(next);
  };

  const unselectAllFiltered = () => {
    const next = new Set(selectedStudentIds);
    filtered.forEach((u: PublicUser) => u.id && next.delete(u.id));
    setSelectedStudentIds(next);
  };

  const applications = useMemo(() => {
    const apps: EmployerApplication[] = [];
    const employersWithApplications = employers.data as (Employer & {
      applications: EmployerApplication[];
    })[];

    employersWithApplications?.forEach(
      (e: Employer & { applications: EmployerApplication[] }) =>
        e?.applications?.map((a: EmployerApplication) => apps.push(a)),
    );
    return apps;
  }, [employers.data]);

  /* ---------- Filter helpers ---------- */
  const matchesCollege = (u: PublicUser) => {
    if (activeColleges.length === 0) return true;
    return activeColleges.includes(u.college);
  };

  const matchesApplyForMe = (u: PublicUser) => {
    if (filterApplyForMe === null) return true;
    return u.apply_for_me === filterApplyForMe;
  };

  const matchesWorkModes = (u: PublicUser) => {
    if (activeWorkModes.length === 0) return true;
    const modes = u.internship_preferences?.job_setup_ids ?? [];
    return activeWorkModes.some((mode) => modes.includes(String(mode)));
  };

  const matchesWorkTypes = (u: PublicUser) => {
    if (activeWorkTypes.length === 0) return true;
    const types = u.internship_preferences?.job_commitment_ids ?? [];
    return activeWorkTypes.some((type) => types.includes(String(type)));
  };
  const matchesCreditedInternship = (u: PublicUser) => {
    if (filterCreditedInternship === null) return true;
    const isCredited = u.internship_preferences?.internship_type === "credited";
    return isCredited === filterCreditedInternship;
  };

  /* ---------- Main filtered list ---------- */
  const filtered = users
    .filter(
      (u: PublicUser) =>
        !hideNoApps ||
        applications.some((a) => a.user_id === u.id) ||
        u.id === search,
    )
    .filter((u) =>
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
      (a, b) =>
        new Date(b.created_at ?? "").getTime() -
        new Date(a.created_at ?? "").getTime(),
    );

  /* ---------- Rows ---------- */
  const rows = filtered.map((u, index) => {
    const userApplications = applications.filter((a) => a.user_id === u.id);
    const isRowPending = impersonate.isPending && impUserId === u.id;
    const isSelected = selectedStudentIds.has(u.id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const lastTs = u?.last_session?.timestamp
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        new Date(u.last_session.timestamp).getTime()
      : undefined;

    return (
      <RowCard
        key={u.id}
        title={
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm font-medium min-w-[1rem]">
              {index + 1}
            </span>
            <span>{getFullName(u)}</span>
          </div>
        }
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

            {/* Internship Preferences */}

            <div className="space-y-2">
              {/* Start Date & Duration */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                <Meta>
                  📅 Start:{" "}
                  {u.internship_preferences?.expected_start_date
                    ? formatDate(u.internship_preferences.expected_start_date)
                    : "—"}
                </Meta>
                <Meta>
                  ⌛ Duration:{" "}
                  {u.internship_preferences?.expected_duration_hours
                    ? `${u.internship_preferences.expected_duration_hours}h`
                    : "—"}
                </Meta>
                <Meta>
                  🎓{" "}
                  {u.internship_preferences?.internship_type
                    ? u.internship_preferences.internship_type === "credited"
                      ? "Credited"
                      : "Voluntary"
                    : "—"}
                </Meta>
              </div>
              {/* Work Modes */}
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 font-medium mb-1.5">
                  💼 Work Modes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const ids = (u.internship_preferences?.job_setup_ids ??
                      []) as (string | number)[];
                    const items = ids
                      .map((id) => {
                        const m = refs.job_modes.find(
                          (x) => String(x.id) === String(id),
                        );
                        return m ? { id: String(m.id), name: m.name } : null;
                      })
                      .filter(Boolean) as { id: string; name: string }[];

                    return items.length ? (
                      items.map((it) => <Badge key={it.id}>{it.name}</Badge>)
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    );
                  })()}
                </div>
              </div>

              {/* Workload Types */}
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 font-medium mb-1.5">
                  📋 Workload Types
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const ids = (u.internship_preferences?.job_commitment_ids ??
                      []) as (string | number)[];
                    const items = ids
                      .map((id) => {
                        const t = refs.job_types.find(
                          (x) => String(x.id) === String(id),
                        );
                        return t ? { id: String(t.id), name: t.name } : null;
                      })
                      .filter(Boolean) as { id: string; name: string }[];

                    return items.length ? (
                      items.map((it) => <Badge key={it.id}>{it.name}</Badge>)
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    );
                  })()}
                </div>
              </div>

              {/* Position Categories */}
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 font-medium mb-1.5">
                  📍 Positions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const ids: string[] =
                      u.internship_preferences?.job_category_ids ?? [];
                    const items = ids
                      .map((id) => {
                        const c = refs.job_categories.find((x) => x.id === id);
                        return c ? { id: c.id, name: c.name } : null;
                      })
                      .filter(Boolean) as { id: string; name: string }[];

                    return items.length ? (
                      items.map((it) => <Badge key={it.id}>{it.name}</Badge>)
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    );
                  })()}
                </div>
              </div>
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
                void viewAsStudent(u.id);
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
    users.forEach((u: PublicUser) => {
      if (u.college) colleges.add(u.college);
    });
    return Array.from(colleges).sort(
      (a, b) =>
        refs.to_college_name(a)?.localeCompare(refs.to_college_name(b) ?? "") ??
        0,
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
          options={users.map((u) => ({
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
          open_calendar={() => {
            closeApplicantModal();
            window?.open(selectedUser?.calendar_link ?? "", "_blank")?.focus();
          }}
          open_resume={() => {
            closeApplicantModal();
          }}
          job={{}}
        />
      </ApplicantModal>
    </>
  );
}
