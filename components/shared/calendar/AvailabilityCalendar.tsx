// AvailabilityGrid.tsx
// Sleek When2Meet‑style availability painter (no heavy calendar lib)
// UI mirrors the screenshot: soft green heatmap tiles, crisp grid, day headers, time gutter.
// Requirements implemented:
//  - Click/tap a cell toggles availability (empty -> available; available -> empty)
//  - Accept & edit "ranges" via props (controlled) OR manage internally (uncontrolled)
//  - Optional drag paint/erase with pointer events
//  - Optional heatmap intensity per cell (group availability)
//  - Tailwind-based, responsive, touch-friendly

"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ========================= Types =========================

type IsoKey = string; // ISO of slot start time

type Range = { start: string | Date; end: string | Date };

type Heatmap = Record<IsoKey, number>;

interface AvailabilityGridProps {
  /** Start of the week (defaults to Monday of current week at 00:00 local) */
  weekStart?: Date;
  /** Number of days to show. Default 5 to match common work week (change to 7 if you want full week). */
  days?: number;
  /** Window of hours (local). */
  startHour?: number; // default 9
  endHour?: number; // default 17
  /** Slot size in minutes. Default 30. */
  slotMins?: number;
  /** Controlled selected ranges. If provided, component is controlled. */
  ranges?: Range[];
  /** Callback when ranges change (only fired in uncontrolled mode if provided, or always in controlled). */
  onRangesChange?: (ranges: { start: string; end: string }[]) => void;
  /** Group heatmap counts per slot start ISO. */
  heatmap?: Heatmap;
  /** Max heat for normalization (otherwise computed from heatmap). */
  maxHeat?: number;
  /** Disable interaction (read-only). */
  readOnly?: boolean;
  className?: string;
}

// ========================= Utilities =========================

const MS = 60 * 1000;

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeekMonday(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day; // make Monday index 0
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function floorToSlot(d: Date, mins: number) {
  const t = new Date(d);
  t.setSeconds(0, 0);
  const m = t.getMinutes();
  t.setMinutes(m - (m % mins));
  return t;
}

function ceilToSlot(d: Date, mins: number) {
  const t = floorToSlot(d, mins);
  if (+t < +d) t.setMinutes(t.getMinutes() + mins);
  return t;
}

function* iterSlots(start: Date, end: Date, mins: number) {
  let s = floorToSlot(start, mins);
  const e = ceilToSlot(end, mins);
  while (+s < +e) {
    yield new Date(s);
    s.setMinutes(s.getMinutes() + mins);
  }
}

function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * MS);
}

function isoKey(date: Date) {
  return date.toISOString(); // Note: uses local time -> UTC conversion; align all users to one TZ in backend
}

function rangesToSet(ranges: Range[], slotMins: number) {
  const out = new Set<IsoKey>();
  for (const r of ranges) {
    const s = new Date(r.start);
    const e = new Date(r.end);
    for (const slot of iterSlots(s, e, slotMins)) out.add(isoKey(slot));
  }
  return out;
}

function setToRanges(sel: Set<IsoKey>, slotMins: number) {
  const xs = Array.from(sel)
    .map((s) => new Date(s))
    .sort((a, b) => +a - +b);
  const out: { start: string; end: string }[] = [];
  let i = 0;
  while (i < xs.length) {
    const start = xs[i];
    let j = i + 1;
    while (j < xs.length && +xs[j] === +addMinutes(xs[j - 1], slotMins)) j++;
    const end = addMinutes(xs[j - 1], slotMins);
    out.push({ start: start.toISOString(), end: end.toISOString() });
    i = j;
  }
  return out;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// ========================= Component =========================

export default function AvailabilityGrid({
  weekStart,
  days = 5,
  startHour = 9,
  endHour = 17,
  slotMins = 30,
  ranges,
  onRangesChange,
  heatmap,
  maxHeat,
  readOnly,
  className,
}: AvailabilityGridProps) {
  const base = useMemo(() => {
    const ws = weekStart ? new Date(weekStart) : startOfWeekMonday();
    ws.setHours(0, 0, 0, 0);
    return ws;
  }, [weekStart]);

  // Controlled vs uncontrolled
  const controlled = Array.isArray(ranges);
  const [internalRanges, setInternalRanges] = useState<Range[]>(ranges ?? []);
  useEffect(() => {
    if (controlled) setInternalRanges(ranges!);
  }, [controlled, ranges]);

  const sel = useMemo(
    () => rangesToSet(internalRanges, slotMins),
    [internalRanges, slotMins]
  );

  // Grid model
  const dayStarts = useMemo(
    () =>
      Array.from({ length: days }, (_, i) => {
        const d = new Date(base);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [base, days]
  );

  const slotStarts = useMemo(() => {
    const out: Date[] = [];
    const d0 = new Date(base);
    d0.setHours(startHour, 0, 0, 0);
    const d1 = new Date(base);
    d1.setHours(endHour, 0, 0, 0);
    for (const s of iterSlots(d0, d1, slotMins)) out.push(s);
    return out;
  }, [base, startHour, endHour, slotMins]);

  const totalCols = days + 1; // +1 for time gutter

  // Heat normalization
  const computedMaxHeat = useMemo(() => {
    if (!heatmap) return 0;
    return maxHeat ?? Math.max(0, ...Object.values(heatmap));
  }, [heatmap, maxHeat]);

  // Interaction state (for drag paint; click toggle also supported)
  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<"add" | "erase">("add");

  const updateSelection = useCallback(
    (updater: (prev: Set<IsoKey>) => Set<IsoKey>) => {
      const nextSet = updater(sel);
      const nextRanges = setToRanges(nextSet, slotMins);
      if (controlled) onRangesChange?.(nextRanges);
      else setInternalRanges(nextRanges);
    },
    [sel, slotMins, controlled, onRangesChange]
  );

  const toggleKey = useCallback(
    (key: IsoKey) => {
      updateSelection((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [updateSelection]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, key: IsoKey, selected: boolean) => {
      if (readOnly) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      isDraggingRef.current = true;
      dragModeRef.current = selected ? "erase" : "add";
      updateSelection((prev) => {
        const next = new Set(prev);
        if (dragModeRef.current === "erase") next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [readOnly, updateSelection]
  );

  const handlePointerEnter = useCallback(
    (key: IsoKey) => {
      if (!isDraggingRef.current || readOnly) return;
      updateSelection((prev) => {
        const next = new Set(prev);
        if (dragModeRef.current === "erase") next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [readOnly, updateSelection]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      isDraggingRef.current = false;
    },
    []
  );

  useEffect(() => {
    const up = () => (isDraggingRef.current = false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  // Helpers
  const daySlotKey = useCallback(
    (dayIndex: number, baseTime: Date) => {
      const d = new Date(base);
      d.setDate(d.getDate() + dayIndex);
      d.setHours(baseTime.getHours(), baseTime.getMinutes(), 0, 0);
      return isoKey(d);
    },
    [base]
  );

  // ========================= Render =========================

  return (
    <div className={classNames("w-full", className)}>
      {/* Grid container */}
      <div
        className={classNames(
          "grid rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white"
        )}
        style={{ gridTemplateColumns: `max-content repeat(${days}, 1fr)` }}
      >
        {/* Header row */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200">
          Time
        </div>
        {dayStarts.map((d, i) => (
          <div
            key={`h-${i}`}
            className="sticky top-0 z-10 bg-white/90 backdrop-blur px-3 py-2 border-b border-gray-200"
          >
            <div className="text-sm font-semibold text-gray-800">
              {dayNames[d.getDay()]}
            </div>
            <div className="text-xs text-gray-500">{fmtDate(d)}</div>
          </div>
        ))}

        {/* Body */}
        <div className="contents">
          {slotStarts.map((t, row) => (
            <React.Fragment key={`r-${row}`}>
              {/* Time gutter */}
              <div
                className={classNames(
                  "px-2 py-2 text-xs text-gray-500 border-r border-gray-200 bg-gray-50",
                  row % (60 / slotMins) === 0 ? "font-medium" : ""
                )}
              >
                {fmtTime(t)}
              </div>

              {/* Day columns */}
              {dayStarts.map((d, col) => {
                const key = daySlotKey(col, t);
                const selected = sel.has(key);
                const heat = heatmap?.[key] ?? 0;
                const max = computedMaxHeat;
                const intensity = max > 0 ? Math.min(1, heat / max) : 0; // 0..1

                // Style: heatmap base (light greens), selected overlay (darker green)
                const heatBg =
                  intensity > 0
                    ? `rgba(16,185,129,${0.1 + 0.25 * intensity})` // emerald-500 @ 10%..35%
                    : "transparent";

                return (
                  <div
                    key={`c-${row}-${col}`}
                    data-key={key}
                    role="button"
                    aria-pressed={selected}
                    onPointerDown={(e) => handlePointerDown(e, key, selected)}
                    onPointerEnter={() => handlePointerEnter(key)}
                    onPointerUp={handlePointerUp}
                    onClick={() => toggleKey(key)}
                    className={classNames(
                      "relative h-8 select-none border-b border-r border-gray-100 outline-none",
                      readOnly ? "cursor-default" : "cursor-pointer",
                      selected
                        ? "bg-emerald-500/35 hover:bg-emerald-500/45"
                        : "hover:bg-emerald-500/15"
                    )}
                    style={{ backgroundColor: selected ? undefined : heatBg }}
                  >
                    {/* Hour gridline accent */}
                    {row % (60 / slotMins) === 0 && (
                      <div className="absolute inset-x-0 top-0 h-px bg-gray-200" />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Legend (optional) */}
      {heatmap && (
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>Availability</span>
          <span
            className="h-3 w-8 rounded"
            style={{ background: "rgba(16,185,129,0.10)" }}
          />
          <span
            className="h-3 w-8 rounded"
            style={{ background: "rgba(16,185,129,0.22)" }}
          />
          <span
            className="h-3 w-8 rounded"
            style={{ background: "rgba(16,185,129,0.35)" }}
          />
        </div>
      )}
    </div>
  );
}

// ========================= Demo wrapper =========================
// Demonstrates controlled usage with editable ranges

export function DemoMeetingPoll() {
  const [ranges, setRanges] = useState<Range[]>([
    // example prefill
    // { start: new Date().toISOString(), end: new Date(Date.now() + 60*60*1000).toISOString() },
  ]);

  // Fake group heatmap: mark noon slots hotter on Wed/Fri
  const week = startOfWeekMonday(new Date());
  const heat: Heatmap = {};
  const noon = new Date(week);
  noon.setDate(noon.getDate() + 2);
  noon.setHours(12, 0, 0, 0);
  heat[noon.toISOString()] = 5;
  const fri = new Date(week);
  fri.setDate(fri.getDate() + 4);
  fri.setHours(12, 0, 0, 0);
  heat[fri.toISOString()] = 8;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">Group meeting</h2>
      <p className="text-sm text-gray-500 mb-3">
        Click to toggle availability. Drag to paint.
      </p>

      <AvailabilityGrid
        weekStart={week}
        days={5}
        startHour={9}
        endHour={16}
        slotMins={30}
        ranges={ranges}
        onRangesChange={(xs) => setRanges(xs)}
        heatmap={heat}
      />

      <div className="mt-3 text-xs">
        <div className="text-gray-500 mb-1">Current ranges (ISO):</div>
        <pre className="bg-gray-900 text-gray-100 p-3 rounded-xl overflow-auto">
          {JSON.stringify(ranges, null, 2)}
        </pre>
      </div>
    </div>
  );
}
