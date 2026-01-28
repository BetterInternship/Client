"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
  useEffect,
} from "react";
import { Filter as FilterIcon, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDbRefs } from "@/lib/db/use-refs";

/* ================= Types & Reducer ================= */

export type JobFilter = {
  position: string[];
  jobMode: string[];
  jobMoa: string[];
  jobWorkload: string[];
  jobAllowance: string[];
};

export const initialFilter: JobFilter = {
  position: [],
  jobMode: [],
  jobMoa: [],
  jobWorkload: [],
  jobAllowance: [],
};

type Action =
  | { type: "SET_ALL"; payload: Partial<JobFilter> }
  | { type: "TOGGLE"; key: keyof JobFilter; value: string; on?: boolean }
  | { type: "BULK_SET"; key: keyof JobFilter; values: string[]; on: boolean }
  | { type: "CLEAR" };

function jobFilterReducer(state: JobFilter, action: Action): JobFilter {
  switch (action.type) {
    case "SET_ALL":
      return {
        position: action.payload.position ?? state.position,
        jobMode: action.payload.jobMode ?? state.jobMode,
        jobMoa: action.payload.jobMoa ?? state.jobMoa,
        jobWorkload: action.payload.jobWorkload ?? state.jobWorkload,
        jobAllowance: action.payload.jobAllowance ?? state.jobAllowance,
      };
    case "TOGGLE": {
      const set = new Set(state[action.key]);
      const shouldAdd = action.on ?? !set.has(action.value);
      if (shouldAdd) set.add(action.value);
      else set.delete(action.value);
      return { ...state, [action.key]: Array.from(set) } as JobFilter;
    }
    case "BULK_SET": {
      const set = new Set(state[action.key]);
      if (action.on) {
        action.values.forEach((v) => set.add(v));
      } else {
        action.values.forEach((v) => set.delete(v));
      }
      return { ...state, [action.key]: Array.from(set) } as JobFilter;
    }
    case "CLEAR":
      return initialFilter;
    default:
      return state;
  }
}

/* ================= Context ================= */

const JobFilterContext = createContext<{
  state: JobFilter;
  dispatch: React.Dispatch<Action>;
}>({ state: initialFilter, dispatch: () => {} });

export const useJobFilter = () => useContext(JobFilterContext);

export function JobFilterProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: Partial<JobFilter>;
}) {
  const [state, dispatch] = useReducer(jobFilterReducer, {
    ...initialFilter,
    ...initial,
  });

  // Rehydrate when URL changes
  useEffect(() => {
    if (initial) dispatch({ type: "SET_ALL", payload: initial });
  }, [
    initial?.position?.join(","),
    initial?.jobMode?.join(","),
    initial?.jobMoa?.join(","),
    initial?.jobWorkload?.join(","),
    initial?.jobAllowance?.join(","),
  ]);

  return (
    <JobFilterContext.Provider value={{ state, dispatch }}>
      {children}
    </JobFilterContext.Provider>
  );
}

/* ================= Static Options ================= */

type SubOption = { name: string; value: string };
type PositionCategory = { name: string; value: string; children?: SubOption[] };

const WORKLOAD_OPTIONS: SubOption[] = [
  { name: "Part-time", value: "1" },
  { name: "Full-time", value: "2" },
  { name: "Project-based", value: "3" },
  { name: "Flexible", value: "4" },
];

const MODE_OPTIONS: SubOption[] = [
  { name: "Onsite", value: "0" },
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

/* ================= UI primitives ================= */

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center justify-between w-full text-left px-2 py-2 rounded hover:bg-gray-50 border border-transparent",
      )}
    >
      <span className="text-sm">{label}</span>
      <span
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 rounded border",
          checked ? "border-blue-500 bg-blue-100" : "border-gray-300",
        )}
      >
        {checked ? <Check className="w-3.5 h-3.5 text-blue-600" /> : null}
      </span>
    </button>
  );
}

/* ================= Panels ================= */

function PositionPanel() {
  const { state, dispatch } = useJobFilter();
  const selected = new Set(state.position);

  const toggle = (value: string, on?: boolean) =>
    dispatch({ type: "TOGGLE", key: "position", value, on });

  const { job_categories } = useDbRefs();

  const categories: PositionCategory[] = job_categories
    .filter((category) => {
      if (category.parent_id === null) return category;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((category) => {
      return {
        name: category.name,
        value: category.id,
        children: [],
      };
    });

  const getChildren = (parentId: string) =>
    job_categories
      .filter((category) => category.parent_id === parentId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c) => ({
        name: c.name,
        value: c.id,
      }));

  const mapChildren = (parentId: string) => {
    return getChildren(parentId).map((c) => c.value);
  };

  const MasterCheckbox = ({
    checked,
    indeterminate,
  }: {
    checked: boolean;
    indeterminate?: boolean;
  }) => (
    <span
      className={cn(
        "inline-flex items-center justify-center w-4.5 h-4.5 rounded border text-[10px]",
        checked ? "border-blue-500 bg-blue-100" : "border-gray-300 bg-white",
      )}
      aria-hidden="true"
    >
      {indeterminate ? (
        <span className="w-2.5 h-0.5 bg-blue-600 rounded-sm" />
      ) : checked ? (
        <Check className="w-3 h-3 text-blue-600" />
      ) : null}
    </span>
  );

  return (
    <div className="space-y-2">
      {categories.map((cat) => {
        const children = getChildren(cat.value);
        const childIds = mapChildren(cat.value);
        const hasChildren = childIds.length > 0;

        const catChecked = selected.has(cat.value);
        const selectedChildren = childIds.filter((id) => selected.has(id));
        const allChildrenChecked =
          hasChildren && selectedChildren.length === childIds.length;
        const headerChecked =
          catChecked && (allChildrenChecked || !hasChildren);
        const headerIndeterminate =
          (catChecked && hasChildren && !allChildrenChecked) ||
          (!catChecked && selectedChildren.length > 0);

        const expanded = headerChecked || headerIndeterminate || hasChildren;

        const handleHeaderToggle = () => {
          const turnOn = !(headerChecked || headerIndeterminate);
          // toggle parent + all children
          dispatch({
            type: "BULK_SET",
            key: "position",
            values: [cat.value, ...childIds],
            on: turnOn,
          });
        };

        return (
          <div key={cat.value} className="border rounded-md overflow-hidden">
            {/* Header row is clickable */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={headerChecked}
              aria-expanded={expanded}
              aria-checked={headerIndeterminate ? "mixed" : headerChecked}
              className={cn(
                "flex items-center justify-between px-3 py-2 gap-2 cursor-pointer",
                "bg-white hover:bg-gray-50 active:bg-gray-100",
              )}
              onClick={handleHeaderToggle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleHeaderToggle();
                }
              }}
            >
              <div className="flex items-center gap-2">
                <MasterCheckbox
                  checked={headerChecked}
                  indeterminate={headerIndeterminate}
                />
                <span className="font-medium text-sm">{cat.name}</span>
                {hasChildren && selectedChildren.length > 0 && (
                  <span className="text-[11px] text-gray-500">
                    ({selectedChildren.length} selected)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {hasChildren && (
                  <button
                    type="button"
                    className="text-sm hover:underline transition-all text-gray-600 hover:text-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      const turnOn = !(headerChecked || headerIndeterminate);
                      dispatch({
                        type: "BULK_SET",
                        key: "position",
                        values: [cat.value, ...childIds],
                        on: turnOn,
                      });
                    }}
                  >
                    {headerChecked || headerIndeterminate
                      ? "Clear"
                      : "Select all"}
                  </button>
                )}
              </div>
            </div>

            {/* Children */}
            {expanded && hasChildren && (
              <div className="border-t px-2 py-1 bg-white">
                {children.map((c) => (
                  <CheckboxRow
                    key={c.value}
                    checked={selected.has(c.value)}
                    onChange={(v) => toggle(c.value, v)}
                    label={c.name}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailsPanel() {
  const { state, dispatch } = useJobFilter();

  const Group = ({
    title,
    keyName,
    options,
  }: {
    title: string;
    keyName: keyof JobFilter;
    options: SubOption[];
  }) => {
    const selected = new Set(state[keyName] as string[]);
    const allIds = options.map((o) => o.value);
    const selectedCount = allIds.filter((id) => selected.has(id)).length;

    const checked = selectedCount === allIds.length && allIds.length > 0;
    const indeterminate = selectedCount > 0 && selectedCount < allIds.length;

    const toggleOne = (id: string, on?: boolean) =>
      dispatch({ type: "TOGGLE", key: keyName, value: id, on });

    const toggleAll = (on: boolean) =>
      dispatch({ type: "BULK_SET", key: keyName, values: allIds, on });

    return (
      <div className="border rounded-md overflow-hidden">
        {/* Group header with master checkbox */}
        <div
          role="button"
          tabIndex={0}
          aria-checked={indeterminate ? "mixed" : checked}
          className="flex items-center justify-between px-3 py-2 cursor-pointer bg-white hover:bg-gray-50 active:bg-gray-100"
          onClick={() => toggleAll(!(checked || indeterminate))}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleAll(!(checked || indeterminate));
            }
          }}
        >
          <div className="flex items-center gap-2">
            {/* master checkbox visual */}
            <span
              className={cn(
                "inline-flex items-center justify-center w-4.5 h-4.5 rounded border text-[10px]",
                checked
                  ? "border-blue-500 bg-blue-100"
                  : "border-gray-300 bg-white",
              )}
              aria-hidden="true"
            >
              {indeterminate ? (
                <span className="w-2.5 h-0.5 bg-blue-600 rounded-sm" />
              ) : checked ? (
                <Check className="w-3 h-3 text-blue-600" />
              ) : null}
            </span>
            <span className="font-medium text-sm">{title}</span>
            {selectedCount > 0 && (
              <span className="text-[11px] text-gray-500">
                ({selectedCount})
              </span>
            )}
          </div>

          <button
            type="button"
            className="text-[11px] underline text-gray-600 hover:text-gray-800"
            onClick={(e) => {
              e.stopPropagation();
              toggleAll(!(checked || indeterminate));
            }}
          >
            {checked || indeterminate ? "Clear" : "Select all"}
          </button>
        </div>

        {/* Options */}
        <div className="border-t px-2 py-1">
          {options.map((o) => (
            <CheckboxRow
              key={o.value}
              checked={selected.has(o.value)}
              onChange={(v) => toggleOne(o.value, v)}
              label={o.name}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <Group
        title="Internship Workload"
        keyName="jobWorkload"
        options={WORKLOAD_OPTIONS}
      />
      <Group title="Internship Mode" keyName="jobMode" options={MODE_OPTIONS} />
      <Group
        title="Internship Allowance"
        keyName="jobAllowance"
        options={ALLOWANCE_OPTIONS}
      />
    </div>
  );
}

export function JobFilters({
  onApply,
  isDesktop = false,
}: {
  onApply: (state: JobFilter) => void;
  isDesktop?: boolean;
}) {
  const { state, dispatch } = useJobFilter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"category" | "details">("category");

  const apply = () => {
    onApply(state);
    setOpen(false);
  };
  const clearAll = () => dispatch({ type: "CLEAR" });

  /* ----- Desktop: compact single button in the bar ----- */
  if (isDesktop) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="md"
          onClick={() => setOpen((p) => !p)}
          className="justify-between p-2 px-3"
        >
          <span className="inline-flex items-center gap-2">
            <FilterIcon className="w-4 h-4" />
          </span>
        </Button>

        {open && (
          <div
            className="absolute z-[60] mt-2 w-[35vw] max-h-[72vh] bg-white border rounded-md shadow-lg
                     flex flex-col"
          >
            {/* Tabs Header */}
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  className={cn(
                    "text-sm px-3 py-1 rounded-full",
                    tab === "category"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100",
                  )}
                  onClick={() => setTab("category")}
                >
                  Category
                </button>
                <button
                  className={cn(
                    "text-sm  px-3 py-1 rounded-full",
                    tab === "details"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100",
                  )}
                  onClick={() => setTab("details")}
                >
                  Details
                </button>
              </div>
              <button
                onClick={clearAll}
                className="text-sm hover:underline transition-all text-gray-600"
              >
                Clear all
              </button>
            </div>

            {/* Scrollable content */}
            <div className="p-3 overflow-auto flex-1">
              {tab === "category" ? <PositionPanel /> : <DetailsPanel />}
            </div>

            {/* Non-scrollable footer */}
            <div className="p-3 border-t">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={apply}>Apply</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ----- Mobile: bottom sheet ----- */
  return (
    <>
      <Button
        variant="outline"
        size="md"
        className="w-full min-w-0 sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <FilterIcon className="mr-2" />
        Filters
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <aside
            className="fixed bottom-0 inset-x-0 z-[101] bg-white rounded-t-xl shadow-xl max-h-[88svh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 pt-3 pb-2 border-b flex items-center justify-between">
              <div className="font-semibold">Filters</div>
              <button
                className="text-sm hover:underline transition-all text-gray-600"
                onClick={clearAll}
              >
                Clear all
              </button>
            </div>

            {/* Tabs */}
            <div className="px-4 py-2 flex gap-2">
              <button
                className={cn(
                  "text-sm px-3 py-1 rounded-full",
                  tab === "category" ? "bg-gray-900 text-white" : "bg-gray-100",
                )}
                onClick={() => setTab("category")}
              >
                Category
              </button>
              <button
                className={cn(
                  "text-sm px-3 py-1 rounded-full",
                  tab === "details" ? "bg-gray-900 text-white" : "bg-gray-100",
                )}
                onClick={() => setTab("details")}
              >
                Details
              </button>
            </div>

            {/* Content */}
            <div
              className="px-4 overflow-y-auto"
              style={{ maxHeight: "60svh" }}
            >
              {tab === "category" ? <PositionPanel /> : <DetailsPanel />}
            </div>

            {/* Sticky footer */}
            <div className="p-3 border-t flex gap-2">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button className="w-1/2" onClick={apply}>
                Apply
              </Button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
