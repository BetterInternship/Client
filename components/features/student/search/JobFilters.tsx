"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
} from "react";
import { Filter as FilterIcon, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AnimatedCount,
  Badge,
  Button,
} from "@betterinternship/components";
import { cn } from "@betterinternship/components";
import { FormCheckbox, FormCheckBoxGroup } from "@/components/EditForm";
import { useDbRefs } from "@/lib/db/use-refs";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useBlurTransition } from "@/components/animata/blur";

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

/* ================= UI primitives ================= */

/**
 * Selection count badge, for sitting beside a title so it never inserts its
 * own row — appearing/disappearing there would push everything below it up
 * or down. Used on both filter tabs' section headers.
 */
function SelectionBadge({ count }: { count: number }) {
  const blurTransition = useBlurTransition();
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div {...blurTransition}>
          <Badge
            variant="solid"
            type="accent"
            size="xs"
            className="py-0 text-muted-foreground"
          >
            <AnimatedCount value={count} />
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
      <FormCheckbox checked={checked} setter={onChange} />
    </button>
  );
}

/* ================= Category tree ================= */

// IDs of categories that should be hidden from direct display
// (Full Stack, Backend, Frontend, QA will only appear under Software Engineering)
const SOFTWARE_ENGINEERING_ID = "fc5ba110-e6df-440c-878f-b5f29be54ba9";
const SOFTWARE_ENGINEERING_PARENT_ID = "1e3b7585-293b-430a-a5cb-c773e0639bb0";
const ENGINEERING_ID = "ab93abaf-c117-4482-9594-8bfecec44f69";
const SOFTWARE_ENGINEERING_HIDDEN_IDS = [
  "381239bf-7c82-4f87-a1b8-39d952f8876b", // Full Stack
  "e5a73819-ee90-43fb-b71b-7ba12f0a4dbf", // Backend
  "8b323584-9340-41e8-928e-f9345f1ad59e", // Frontend
  "91b180be-3d23-4f0a-bd64-c82cef9d3ae5", // QA
];
const HIDDEN_CATEGORIES = new Set(SOFTWARE_ENGINEERING_HIDDEN_IDS);
// Categories that should not appear at top level
const MOVE_TO_OTHERS = new Set([ENGINEERING_ID]); // Engineering (will be under Others)
const OTHERS_ID = "0debeda8-f257-49a6-881f-11a6b8eb560b";

/**
 * The job-category tree behind the Category tab: top-level categories, each
 * one's visible children, and the id-group a child actually toggles.
 *
 * Two children — Software Engineering and Engineering — are each a single
 * visible row standing in for several ids at once (SE for itself + 4 hidden
 * sibling categories; Engineering for itself + its 6 subcategories).
 * `idsForChild` is the one place that resolves a row to its id-group, so
 * every consumer — a row's own checkmark, a category's selection badge, and
 * the tab's total count — agrees on what "selected" means for that row.
 */
function usePositionCategoryTree() {
  const { job_categories } = useDbRefs();

  const getChildrenIds = (parentId: string): string[] =>
    job_categories
      .filter(
        (category) =>
          category.parent_id === parentId &&
          !HIDDEN_CATEGORIES.has(category.id),
      )
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c) => c.id);

  // Visible children of a category, as rendered.
  const getChildren = (parentId: string): SubOption[] => {
    const baseChildren = job_categories
      .filter(
        (category) =>
          category.parent_id === parentId &&
          !HIDDEN_CATEGORIES.has(category.id),
      )
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c) => ({ name: c.name, value: c.id }));

    // !! TEMP: Software Engineering should show the hidden categories (Full Stack, Backend, Frontend, QA)
    if (parentId === SOFTWARE_ENGINEERING_ID) {
      return job_categories
        .filter((category) => HIDDEN_CATEGORIES.has(category.id))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((c) => ({ name: c.name, value: c.id }));
    }

    // !! TEMP: If this is Others, show Engineering as a single item (not individual engineering types)
    if (parentId === OTHERS_ID) {
      return [...baseChildren, { name: "Engineering", value: ENGINEERING_ID }];
    }

    return baseChildren;
  };

  // The full flattened id set a category's "All <Category>" toggle affects.
  const mapChildren = (parentId: string): string[] => {
    const baseIds = getChildrenIds(parentId);

    // !! TEMP: If Others, include Engineering + all 6 engineering subcategories (Civil, Industrial, Electronics, Aerospace, Chemical, Electrical)
    if (parentId === OTHERS_ID) {
      const engineeringChildIds = job_categories
        .filter((category) => category.parent_id === ENGINEERING_ID)
        .map((c) => c.id);
      return [...baseIds, ENGINEERING_ID, ...engineeringChildIds];
    }

    // !! TEMP: Software Engineering includes all 4 hidden categories when selected
    if (parentId === SOFTWARE_ENGINEERING_ID) {
      return SOFTWARE_ENGINEERING_HIDDEN_IDS;
    }

    // Special case: Parent of Software Engineering - include SE + its mapped items
    if (parentId === SOFTWARE_ENGINEERING_PARENT_ID) {
      const mappedIds = [
        SOFTWARE_ENGINEERING_ID,
        ...SOFTWARE_ENGINEERING_HIDDEN_IDS,
      ];
      // Keep all non-SE children + add SE + its mapped items
      const nonSE = baseIds.filter((id) => id !== SOFTWARE_ENGINEERING_ID);
      return [...nonSE, ...mappedIds];
    }

    return baseIds;
  };

  /**
   * The id(s) one visible child row represents — see the file-level note
   * above. Almost always just its own id.
   */
  const idsForChild = (child: SubOption): string[] => {
    if (child.value === SOFTWARE_ENGINEERING_ID) {
      return [SOFTWARE_ENGINEERING_ID, ...SOFTWARE_ENGINEERING_HIDDEN_IDS];
    }
    if (child.value === ENGINEERING_ID) {
      return [
        child.value,
        ...job_categories
          .filter((category) => category.parent_id === child.value)
          .map((category) => category.id),
      ];
    }
    return [child.value];
  };

  // Top-level categories, excluding those moved under "Others".
  const categories: PositionCategory[] = job_categories
    .filter(
      (category) =>
        category.parent_id === null && !MOVE_TO_OTHERS.has(category.id),
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((category) => ({ name: category.name, value: category.id }));

  return { categories, getChildren, mapChildren, idsForChild };
}

/* ================= Panels ================= */

function PositionPanel() {
  const { state, dispatch } = useJobFilter();
  const selected = new Set(state.position);
  const { categories, getChildren, mapChildren, idsForChild } =
    usePositionCategoryTree();

  const toggle = (value: string, on?: boolean) =>
    dispatch({ type: "TOGGLE", key: "position", value, on });

  /** Selects or clears a whole category - parent plus everything mapped under it. */
  const setWholeCategory = (cat: PositionCategory, on: boolean) =>
    dispatch({
      type: "BULK_SET",
      key: "position",
      values: [cat.value, ...mapChildren(cat.value)],
      on,
    });

  return (
    // pb-3 lives on the scrolled content (not the scroll container): bottom
    // padding on an overflow-auto container is excluded from the scrollable
    // overflow area, clipping the last card's border flush to the edge.
    <Accordion type="multiple" className="space-y-2 pb-3">
      {categories.map((cat) => {
        const children = getChildren(cat.value);
        const childIds = mapChildren(cat.value);
        const hasChildren = childIds.length > 0;

        // Counts checked rows, not raw ids — see idsForChild above.
        const selectedCount = children.filter((c) =>
          idsForChild(c).every((id) => selected.has(id)),
        ).length;

        // A category with nothing under it is a plain choice, not a section.
        if (!hasChildren) {
          return (
            <div
              key={cat.value}
              className="border rounded-md overflow-hidden bg-white px-1"
            >
              <CheckboxRow
                checked={selected.has(cat.value)}
                onChange={(on) => toggle(cat.value, on)}
                label={<span className="font-medium">{cat.name}</span>}
              />
            </div>
          );
        }

        const allSelected =
          selected.has(cat.value) && childIds.every((id) => selected.has(id));

        return (
          <AccordionItem
            key={cat.value}
            value={cat.value}
            className="border rounded-md overflow-hidden bg-white"
          >
            <AccordionTrigger className="px-3 py-2 hover:no-underline">
              <span className="flex items-center gap-2">
                <span className="font-medium text-sm">{cat.name}</span>
                <SelectionBadge count={selectedCount} />
              </span>
            </AccordionTrigger>

            <AccordionContent className="border-t px-2 py-1">
              <CheckboxRow
                checked={allSelected}
                onChange={(on) => setWholeCategory(cat, on)}
                label={<span className="font-medium">All {cat.name}</span>}
              />

              {children.map((c) => {
                const ids = idsForChild(c);
                const checked = ids.every((id) => selected.has(id));
                return (
                  <CheckboxRow
                    key={c.value}
                    checked={checked}
                    onChange={(on) =>
                      dispatch({
                        type: "BULK_SET",
                        key: "position",
                        values: ids,
                        on,
                      })
                    }
                    label={c.name}
                  />
                );
              })}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

/**
 * One labelled group of the shared form checkbox grid. Hoisted out of
 * DetailsPanel so it isn't redefined (and its subtree remounted) on every
 * render.
 */
function DetailsGroup({
  title,
  keyName,
  options,
}: {
  title: string;
  keyName: keyof JobFilter;
  options: SubOption[];
}) {
  const { state, dispatch } = useJobFilter();

  return (
    <FormCheckBoxGroup
      label={title}
      labelAddon={<SelectionBadge count={state[keyName].length} />}
      hint={null}
      showSelectedCount={false}
      columns={2}
      className="[&>div.grid]:gap-2! [&>div.grid>div]:gap-2! [&>div.grid>div]:p-2!"
      values={state[keyName]}
      setter={(values) =>
        dispatch({
          type: "SET_ALL",
          payload: { [keyName]: values as string[] },
        })
      }
      options={options.map((o) => ({ value: o.value, label: o.name }))}
    />
  );
}

function DetailsPanel() {
  return (
    // pb-3 here for the same scroll-container bottom-padding reason as above.
    <div className="space-y-4 pb-3">
      <DetailsGroup
        title="Internship Workload"
        keyName="jobWorkload"
        options={WORKLOAD_OPTIONS}
      />
      <DetailsGroup
        title="Internship Mode"
        keyName="jobMode"
        options={MODE_OPTIONS}
      />
      <DetailsGroup
        title="Internship Allowance"
        keyName="jobAllowance"
        options={ALLOWANCE_OPTIONS}
      />
    </div>
  );
}

/** A pill tab carrying the number of selections made under it. */
function TabPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-sm px-3 py-1 rounded-full transition",
        active ? "bg-gray-900 text-white" : "bg-gray-100",
      )}
    >
      {label}{" "}
      {count > 0 && (
        <span>
          {" "}
          (<AnimatedCount value={count} />){" "}
        </span>
      )}
    </button>
  );
}

/**
 * The filter tabs + active panel, with no trigger button or sheet chrome —
 * for embedding directly in a larger surface (e.g. the mobile search
 * overlay). Must be rendered inside a {@link JobFilterProvider}.
 *
 * @component
 */
export function JobFilterPanels() {
  const { state } = useJobFilter();
  const [tab, setTab] = useState<"category" | "details">("category");
  const { categories, getChildren, idsForChild } = usePositionCategoryTree();

  // Counts on the tabs so the split never hides what's already selected.
  // Clearing lives with the surface that embeds this (the mobile overlay's
  // footer), so there's exactly one clear action on screen.
  //
  // categoryCount sums the same "checked rows" PositionPanel's own badges
  // show (see idsForChild's doc comment) rather than state.position.length —
  // that would double-count Software Engineering / Engineering's hidden ids,
  // and the tab total would read higher than its categories' badges added up.
  const selectedPosition = new Set(state.position);
  const categoryCount = categories.reduce((sum, cat) => {
    const children = getChildren(cat.value);
    if (children.length === 0) {
      return sum + (selectedPosition.has(cat.value) ? 1 : 0);
    }
    return (
      sum +
      children.filter((c) =>
        idsForChild(c).every((id) => selectedPosition.has(id)),
      ).length
    );
  }, 0);
  const detailsCount =
    state.jobWorkload.length + state.jobMode.length + state.jobAllowance.length;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 pb-2">
        <TabPill
          label="Category"
          count={categoryCount}
          active={tab === "category"}
          onClick={() => setTab("category")}
        />
        <TabPill
          label="Details"
          count={detailsCount}
          active={tab === "details"}
          onClick={() => setTab("details")}
        />
      </div>

      {tab === "category" ? <PositionPanel /> : <DetailsPanel />}
    </div>
  );
}

export function JobFilters({
  onApply,
}: {
  onApply: (state: JobFilter) => void;
}) {
  const { state, dispatch } = useJobFilter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"category" | "details">("category");

  const apply = () => {
    onApply(state);
    setOpen(false);
    toast.success("Filters applied", {
      ...toastPresets.success,
      duration: 1000,
    });
  };
  const clearAll = () => dispatch({ type: "CLEAR" });

  const blurTransition = useBlurTransition();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
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

          <AnimatePresence>
            {open && (
              <motion.div
                className="absolute right-0 z-[260] mt-2 w-[35vw] max-h-[72vh] bg-white border rounded-[0.33em] shadow-xl
                     flex flex-col"
                {...blurTransition}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TooltipTrigger>
      <TooltipContent>Search filters</TooltipContent>
    </Tooltip>
  );
}
