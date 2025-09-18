"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Settings,
  BookA,
  Heart,
  LogOut,
  HelpCircle,
  MessageCircleMore,
  Search,
  ChevronRight,
  X as XIcon,
  Filter as FilterIcon,
  ChevronDown,
  Menu,
  Check as CheckIcon,
} from "lucide-react";
import { Checkbox } from "@radix-ui/react-checkbox";
import { useDetectClickOutside } from "react-detect-click-outside";

import { Button } from "@/components/ui/button";
import { GroupableNavDropdown, DropdownOption } from "@/components/ui/dropdown";
import { Separator } from "@/components/ui/separator";
import { HeaderTitle } from "@/components/shared/header";
import { MyUserPfp } from "@/components/shared/pfp";
import CompleteAccBanner from "@/components/features/student/CompleteAccBanner";

import { useMobile } from "@/hooks/use-mobile";
import { useRoute } from "@/hooks/use-route";
import { useConversations } from "@/hooks/use-conversation";

import { useAuthContext } from "@/lib/ctx-auth";
import { useProfile } from "@/lib/api/student.api";
import { cn } from "@/lib/utils";
import { getFullName, getMissingProfileFields } from "@/lib/utils/user-utils";

/* =======================================================================================
   Filter State (immutable + typed) 
======================================================================================= */
export type JobFilter = {
  position: string[];
  jobMode: string[];
  jobMoa: string[];
  jobWorkload: string[];
  jobAllowance: string[];
};

const initialFilter: JobFilter = {
  position: [],
  jobMode: [],
  jobMoa: [],
  jobWorkload: [],
  jobAllowance: [],
};

type Action =
  | { type: "SET_ALL"; payload: Partial<JobFilter> }
  | { type: "TOGGLE"; key: keyof JobFilter; value: string; on?: boolean }
  | { type: "CLEAR" };

function jobFilterReducer(state: JobFilter, action: Action): JobFilter {
  switch (action.type) {
    case "SET_ALL": {
      return {
        position: action.payload.position ?? state.position,
        jobMode: action.payload.jobMode ?? state.jobMode,
        jobMoa: action.payload.jobMoa ?? state.jobMoa,
        jobWorkload: action.payload.jobWorkload ?? state.jobWorkload,
        jobAllowance: action.payload.jobAllowance ?? state.jobAllowance,
      };
    }
    case "TOGGLE": {
      const set = new Set(state[action.key]);
      const shouldAdd = action.on ?? !set.has(action.value);
      if (shouldAdd) set.add(action.value);
      else set.delete(action.value);
      return { ...state, [action.key]: Array.from(set) } as JobFilter;
    }
    case "CLEAR":
      return initialFilter;
    default:
      return state;
  }
}

const JobFilterContext = createContext<{
  state: JobFilter;
  dispatch: React.Dispatch<Action>;
}>({ state: initialFilter, dispatch: () => {} });

const useJobFilter = () => useContext(JobFilterContext);

/* =======================================================================================
   Static Option Data (DRY)
======================================================================================= */
type SubOption = { name: string; value: string };

type PositionCategory = { name: string; value: string; children?: SubOption[] };

const POSITION_TREE: PositionCategory[] = [
  {
    name: "Computer Science",
    value: "1e3b7585-293b-430a-a5cb-c773e0639bb0",
    children: [
      {
        name: "Data Science/AI",
        value: "dc3780b4-b9c0-4294-a035-faa4e2086611",
      },
      { name: "Cybersecurity", value: "ca8ae32d-55a8-4ded-9cfe-1582d72cbaf1" },
      { name: "Full Stack", value: "381239bf-7c82-4f87-a1b8-39d952f8876b" },
      { name: "Backend", value: "e5a73819-ee90-43fb-b71b-7ba12f0a4dbf" },
      { name: "Frontend", value: "8b323584-9340-41e8-928e-f9345f1ad59e" },
      { name: "QA", value: "91b180be-3d23-4f0a-bd64-c82cef9d3ae5" },
    ],
  },
  {
    name: "Business",
    value: "0fb4328b-4163-458b-8ac7-8ab3861e1ad6",
    children: [
      {
        name: "Accounting/Finance",
        value: "6506ab1d-f1a6-4c6f-a917-474a96e6d2bb",
      },
      {
        name: "HR/Administrative",
        value: "976d7433-8297-4f8d-950d-3392682dadbb",
      },
      {
        name: "Marketing/Sales",
        value: "1f6ab152-9754-4082-9fc2-4b276f5a9ef9",
      },
      {
        name: "Business Development",
        value: "25bce220-1927-48c0-8e81-6be4af64d9b9",
      },
      { name: "Operations", value: "61727f3b-dc36-458c-a487-5c44b5cd83a5" },
    ],
  },
  { name: "Engineering", value: "ab93abaf-c117-4482-9594-8bfecec44f69" },
  {
    name: "Others",
    value: "0debeda8-f257-49a6-881f-11a6b8eb560b",
    children: [
      { name: "Legal", value: "79161041-5009-4e66-84d2-a88357301427" },
      { name: "Research", value: "31a39059-1050-4f22-8875-5b903b7db3bf" },
      { name: "Graphic Design", value: "f50b009d-5ed7-4ef1-851a-3fcf5d6572aa" },
    ],
  },
];

const WORKLOAD_OPTIONS: SubOption[] = [
  { name: "Part-time", value: "1" },
  { name: "Full-time", value: "2" },
  { name: "Project-based", value: "3" },
  { name: "Flexible", value: "4" },
];

const MODE_OPTIONS: SubOption[] = [
  { name: "Face-to-face", value: "0" },
  { name: "Hybrid", value: "1" },
  { name: "Remote", value: "2" },
];

const ALLOWANCE_OPTIONS: SubOption[] = [
  { name: "Paid", value: "0" },
  { name: "Non-paid", value: "1" },
];

const MOA_OPTIONS: SubOption[] = [
  { name: "Has MOA", value: "Has MOA" },
  { name: "No MOA", value: "No MOA" },
];

/* =======================================================================================
   Small UI Primitives
======================================================================================= */
const SearchInput = ({
  value,
  onChange,
  onEnter,
  placeholder = "Search Internship Listings",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  className?: string;
}) => (
  <div
    className={cn(
      "relative w-full border border-gray-300 rounded-[0.33em]",
      className
    )}
  >
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    <input
      type="text"
      value={value}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 pl-12 pr-4 bg-transparent border-0 outline-none focus:ring-0 text-gray-900 text-sm hover:bg-gray-100 focus:bg-gray-100 duration-150 placeholder:text-gray-500"
    />
  </div>
);

const CheckboxRow = ({
  checked,
  onChange,
  label,
  expandable,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  expandable?: boolean;
}) => (
  <div className="flex items-center gap-1 w-fit select-none">
    <Checkbox
      checked={!!checked}
      className={cn(
        "flex items-center justify-center w-5 h-5 hover:cursor-pointer rounded border",
        checked ? "border-blue-500 bg-blue-200" : "border-gray-300 bg-gray-200"
      )}
      onCheckedChange={(v) => onChange(!!v)}
    >
      {checked ? (
        <CheckIcon className="text-blue-500 pointer-events-none w-4 h-4" />
      ) : (
        <XIcon className="text-gray-400 pointer-events-none w-4 h-4" />
      )}
    </Checkbox>
    <span className="text-sm text-gray-700">{label}</span>
    {expandable && <ChevronRight className="ml-1 h-4 w-4 text-gray-300" />}
  </div>
);

/* =======================================================================================
   Filter Panels
======================================================================================= */
const JobPositionPanel: React.FC = () => {
  const { state, dispatch } = useJobFilter();
  const selected = new Set(state.position);

  const toggle = (value: string, on?: boolean) =>
    dispatch({ type: "TOGGLE", key: "position", value, on });

  return (
    <div className="flex flex-col gap-2">
      {POSITION_TREE.map((cat) => {
        const catSelected = selected.has(cat.value);
        const childSelectedCount =
          cat.children?.filter((c) => selected.has(c.value)).length ?? 0;
        const isExpanded = catSelected || childSelectedCount > 0; // auto-show when any child selected
        return (
          <div key={cat.value} className="">
            <div className="flex items-center gap-2">
              <CheckboxRow
                checked={catSelected}
                onChange={(v) => toggle(cat.value, v)}
                label={<span className="font-medium">{cat.name}</span>}
              />
              {cat.children?.length ? (
                <span className="text-xs text-gray-500">
                  {childSelectedCount
                    ? `(${childSelectedCount} selected)`
                    : null}
                </span>
              ) : null}
            </div>
            {isExpanded && cat.children?.length ? (
              <div className="mt-1 ml-6 flex flex-col gap-1 border-l border-gray-200 pl-3">
                {cat.children.map((child) => (
                  <CheckboxRow
                    key={child.value}
                    checked={selected.has(child.value)}
                    onChange={(v) => toggle(child.value, v)}
                    label={child.name}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const JobDetailPanel: React.FC = () => {
  const { state, dispatch } = useJobFilter();
  const togglers = {
    jobWorkload: (v: string, on?: boolean) =>
      dispatch({ type: "TOGGLE", key: "jobWorkload", value: v, on }),
    jobMode: (v: string, on?: boolean) =>
      dispatch({ type: "TOGGLE", key: "jobMode", value: v, on }),
    jobAllowance: (v: string, on?: boolean) =>
      dispatch({ type: "TOGGLE", key: "jobAllowance", value: v, on }),
    jobMoa: (v: string, on?: boolean) =>
      dispatch({ type: "TOGGLE", key: "jobMoa", value: v, on }),
  } as const;

  const has = {
    jobWorkload: (v: string) => state.jobWorkload.includes(v),
    jobMode: (v: string) => state.jobMode.includes(v),
    jobAllowance: (v: string) => state.jobAllowance.includes(v),
    jobMoa: (v: string) => state.jobMoa.includes(v),
  } as const;

  const Group = ({
    title,
    options,
    check,
    toggle,
  }: {
    title: string;
    options: SubOption[];
    check: (v: string) => boolean;
    toggle: (v: string, on?: boolean) => void;
  }) => (
    <div>
      <div className="font-bold tracking-tight mt-2 mb-1">{title}</div>
      <div className="flex flex-col gap-1">
        {options.map((o) => (
          <CheckboxRow
            key={o.value}
            checked={check(o.value)}
            onChange={(v) => toggle(o.value, v)}
            label={o.name}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <Group
        title="Internship Workload"
        options={WORKLOAD_OPTIONS}
        check={has.jobWorkload}
        toggle={togglers.jobWorkload}
      />
      <Group
        title="Internship Mode"
        options={MODE_OPTIONS}
        check={has.jobMode}
        toggle={togglers.jobMode}
      />
      <Group
        title="Internship Allowance"
        options={ALLOWANCE_OPTIONS}
        check={has.jobAllowance}
        toggle={togglers.jobAllowance}
      />
      <Group
        title="Internship MOA"
        options={MOA_OPTIONS}
        check={has.jobMoa}
        toggle={togglers.jobMoa}
      />
    </div>
  );
};

/* =======================================================================================
   Filter Overlay (shared for desktop & mobile)
======================================================================================= */
const FilterOverlay = ({
  visible,
  onClose,
  children,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  children: React.ReactNode;
}) => {
  const outsideClickRef = useDetectClickOutside({ onTriggered: onClose });
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-sm flex items0start justify-center p-4 sm:p-5"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="max-w-2xl w-full mt-6 sm:mt-10 h-fit bg-white rounded-[0.33em] px-5 py-4 shadow-lg max-h-[min(84dvh,720px)] overflow-y-auto"
        ref={outsideClickRef}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <div className="mt-4 flex gap-2 justify-between sm:justify-end w-full sm:w-auto">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            scheme="secondary"
            size="md"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button size="md" onClick={onApply} className="w-full sm:w-auto ">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

/* =======================================================================================
   Mobile Drawer (account on top → chats → links → bottom sign out)
======================================================================================= */
function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const profile = useProfile();
  const { isAuthenticated, logout } = useAuthContext();
  const conversations = useConversations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const handleLogout = () => logout().then(() => router.push("/"));
  useEffect(() => {
    if (open) onClose();
  }, [pathname, params?.toString()]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[120] bg-black/30 backdrop-blur-[2px] transition-opacity duration-200",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-[121] h-[100svh] w-full max-w-[92%] sm:max-w-[420px] bg-white shadow-xl border-l border-gray-200",
          "transition-transform duration-250 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        {/* Shell uses column layout so footer can pin to bottom */}
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+8px)] pb-3 border-b">
            <div className="font-semibold">Menu</div>
            <button
              type="button"
              aria-label="Close menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100"
              onClick={onClose}
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Account (always on top) */}
            {isAuthenticated() ? (
              <div className="flex items-center gap-3">
                <div className="overflow-hidden rounded-full flex items-center justify-center">
                  <MyUserPfp size="9" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-medium">
                    {getFullName(profile.data)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {profile.data?.email}
                  </span>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
                }
              >
                Sign in
              </Button>
            )}

            <Separator className="my-4" />

            {/* Navigation (Chats second, styled as list items) */}
            <nav>
              <ul className="grid gap-1">
                {isAuthenticated() && (
                  <li>
                    <Link href="/conversations" className="block w-full">
                      <button className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200">
                        <span className="inline-flex items-center gap-2 text-sm">
                          <MessageCircleMore className="w-4 h-4" /> Chats
                        </span>
                        {conversations?.unreads?.length ? (
                          <span className="text-[10px] leading-none bg-warning/80 px-2 py-1 rounded-full">
                            {conversations.unreads.length}
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/search" className="block w-full">
                    <button className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm">
                      <span>Browse</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/saved" className="block w-full">
                    <button className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm">
                      <span>Saved Jobs</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/applications" className="block w-full">
                    <button className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm">
                      <span>Applications</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="block w-full">
                    <button className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm">
                      <span>Help Center</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Footer pinned to bottom */}
          {isAuthenticated() && (
            <div className="mt-auto border-t px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-red-600 font-medium py-2 rounded-md hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* =======================================================================================
   Profile Button (desktop)
======================================================================================= */
export const ProfileButton: React.FC = () => {
  const profile = useProfile();
  const conversations = useConversations();
  const { isAuthenticated, logout } = useAuthContext();
  const router = useRouter();

  const handleLogout = () => logout().then(() => router.push("/"));

  if (!isAuthenticated()) {
    return (
      <Button
        type="button"
        variant="outline"
        size="md"
        className="h-10 border-gray-300 hover:bg-gray-50"
        onClick={() =>
          router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
        }
      >
        Sign in
      </Button>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      <Link href="/conversations">
        <Button variant="outline" className="relative">
          <span className="text-xs">Chats</span>{" "}
          <MessageCircleMore className="w-6 h-6" />
          {conversations?.unreads?.length ? (
            <div className="absolute w-3 h-3 top-[-0.33em] right-[-0.4em] rounded-full bg-warning opacity-70" />
          ) : null}
        </Button>
      </Link>
      <GroupableNavDropdown
        display={
          <>
            <div className="overflow-hidden rounded-full flex items-center justify-center">
              <MyUserPfp size="7" />
            </div>
            {getFullName(profile.data)}
          </>
        }
        content={
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-xs text-gray-500 text-ellipsis overflow-hidden">
              {profile.data?.email}
            </p>
          </div>
        }
        className="z-[200]"
      >
        <DropdownOption href="/profile">
          <Settings className="w-4 h-4 inline-block m-1 mr-2" />
          Profile Settings
        </DropdownOption>
        <DropdownOption href="/applications">
          <BookA className="w-4 h-4 inline-block m-1 mr-2" />
          Applications
        </DropdownOption>
        <DropdownOption href="/saved">
          <Heart className="w-4 h-4 inline-block m-1 mr-2" />
          Saved Jobs
        </DropdownOption>
        <DropdownOption href="/help">
          <HelpCircle className="w-4 h-4 inline-block m-1 mr-2" />
          Help Center
        </DropdownOption>
        <DropdownOption href="/" on_click={handleLogout}>
          <LogOut className="text-red-500 w-4 h-4 inline-block m-1 mr-2" />
          <span className="text-red-500">Sign Out</span>
        </DropdownOption>
      </GroupableNavDropdown>
    </div>
  );
};

/* =======================================================================================
   Header (top bar + search + filters + mobile drawer)
======================================================================================= */
export const Header: React.FC = () => {
  const { isMobile } = useMobile();
  const { routeExcluded } = useRoute();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const profile = useProfile();

  const [state, dispatch] = useReducer(jobFilterReducer, initialFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMissing, setHasMissing] = useState(false);

  const [showPositions, setShowPositions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const noProfileRoutes = ["/register"];
  const noHeaderRoutes = ["/register"];
  const showProfileButton = routeExcluded(noProfileRoutes);

  // only show filters on /search (allow subpaths like /search/results)
  const showFilters = pathname?.startsWith("/search") === true;

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!showFilters) return;
    const q = searchParams.get("query") || "";
    const fromCSV = (key: string) =>
      searchParams.get(key)?.split(",").filter(Boolean) || [];
    dispatch({
      type: "SET_ALL",
      payload: {
        position: fromCSV("position"),
        jobAllowance: fromCSV("allowance"),
        jobWorkload: fromCSV("workload"),
        jobMode: fromCSV("mode"),
        jobMoa: fromCSV("moa"),
      },
    });
    setSearchTerm(q);
  }, [searchParams, showFilters]);

  // profile completeness banner
  useEffect(() => {
    if (profile.data) {
      const { missing } = getMissingProfileFields(profile.data);
      setHasMissing(Array.isArray(missing) && missing.length > 0);
    }
  }, [profile.data]);

  const doSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("query", searchTerm);
    if (state.position.length) params.set("position", state.position.join(","));
    if (state.jobMode.length) params.set("mode", state.jobMode.join(","));
    if (state.jobWorkload.length)
      params.set("workload", state.jobWorkload.join(","));
    if (state.jobAllowance.length)
      params.set("allowance", state.jobAllowance.join(","));
    if (state.jobMoa.length) params.set("moa", state.jobMoa.join(","));
    router.push(`/search/?${params.toString()}`);
  };

  const FilterButtons = (
    <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
      <Button
        scheme="primary"
        variant="outline"
        size="md"
        className="w-full min-w-0 sm:w-auto"
        onClick={() => {
          setShowPositions(true);
          setShowDetails(false);
        }}
      >
        <FilterIcon /> Category <ChevronDown />
      </Button>
      <Button
        scheme="primary"
        variant="outline"
        size="md"
        className="w-full min-w-0 sm:w-auto"
        onClick={() => {
          setShowDetails(true);
          setShowPositions(false);
        }}
      >
        <FilterIcon /> Details <ChevronDown />
      </Button>
    </div>
  );

  return (
    <JobFilterContext.Provider value={{ state, dispatch }}>
      {routeExcluded(noHeaderRoutes) ? (
        <div className="flex flex-col">
          {/* Top Bar */}
          <div
            className={cn(
              "flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100 z-[90]",
              isMobile ? "px-4 py-3" : "py-4 px-8"
            )}
            style={{ overflow: "visible", position: "relative", zIndex: 100 }}
          >
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <HeaderTitle />
            </div>

            {/* Center: Desktop search + filters (filters only on /search) */}
            {!isMobile && showProfileButton && (
              <div className="flex items-center gap-4 w-full max-w-2xl">
                {showFilters && (
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onEnter={doSearch}
                  />
                )}
                {showFilters && FilterButtons}
              </div>
            )}

            {/* Right: Desktop profile / Mobile burger */}
            {showProfileButton ? (
              isMobile ? (
                <button
                  type="button"
                  aria-label="Open menu"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-300 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
              ) : (
                <div className="flex items-center gap-6">
                  {pathname === "/search" && hasMissing && (
                    <button
                      className="text-base ml-4 text-blue-700 font-medium hover:underline focus:outline-none"
                      onClick={() => router.push("/profile?edit=true")}
                    >
                      Finish your profile to start applying!
                    </button>
                  )}
                  <ProfileButton />
                </div>
              )
            ) : (
              <div className="w-1 h-10 bg-transparent" />
            )}
          </div>

          {/* Mobile banner under bar */}
          {isMobile && pathname === "/search" && <CompleteAccBanner />}

          {/* Mobile: search + (filters only on /search) */}
          {isMobile && showProfileButton && showFilters && (
            <div className="flex flex-col max-w-2xl w-full gap-2 items-center px-4 pt-3">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                onEnter={doSearch}
                className="h-12"
              />
              {showFilters && FilterButtons}
            </div>
          )}

          {/* Mount filter overlays ONLY on /search */}
          {showFilters && (
            <>
              <FilterOverlay
                visible={showPositions}
                onClose={() => setShowPositions(false)}
                onApply={() => {
                  setShowPositions(false);
                  doSearch();
                }}
              >
                <JobPositionPanel />
              </FilterOverlay>

              <FilterOverlay
                visible={showDetails}
                onClose={() => setShowDetails(false)}
                onApply={() => {
                  setShowDetails(false);
                  doSearch();
                }}
              >
                <JobDetailPanel />
              </FilterOverlay>
            </>
          )}

          {/* Mobile drawer */}
          {isMobile && showProfileButton && (
            <MobileDrawer
              open={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
            />
          )}
        </div>
      ) : (
        <></>
      )}
    </JobFilterContext.Provider>
  );
};

export default Header;
