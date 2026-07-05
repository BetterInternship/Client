"use client";

import { useWeeklyStats } from "@/lib/api/god.api";
import { useMemo } from "react";

function WeeklyChart({ data }: { data: { week_start: string; applications: number }[] }) {
  const W = 700;
  const H = 200;
  const PAD = { top: 20, right: 16, bottom: 30, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const points = useMemo(() => {
    if (data.length === 0) return { line: "", area: "", ticks: [] as { x: number; label: string }[] };
    const max = Math.max(...data.map((d) => d.applications), 1);
    const xStep = innerW / (data.length - 1 || 1);
    const scaleY = (v: number) => PAD.top + innerH - (v / max) * innerH;
    const scaleX = (i: number) => PAD.left + i * xStep;

    const pts = data.map((d, i) => `${scaleX(i)},${scaleY(d.applications)}`);
    const line = pts.map((p, i) => (i === 0 ? `M${p}` : `L${p}`)).join(" ");
    const area = `${line} L${scaleX(data.length - 1)},${PAD.top + innerH} L${scaleX(0)},${PAD.top + innerH} Z`;

    const ticks = data
      .filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0 || i === data.length - 1)
      .map((d, _, filtered) => {
        const i = data.indexOf(d);
        return { x: scaleX(i), label: new Date(d.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
      });

    return { line, area, ticks };
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="rounded-md border bg-white shadow-sm p-4 overflow-x-auto">
      <h2 className="text-sm font-medium text-slate-600 mb-3">Applications Over Time</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 500 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <path d={points.area} fill="url(#areaGrad)" />
        <path d={points.line} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.ticks.map((t) => (
          <text key={t.label} x={t.x} y={H - 6} textAnchor="middle" className="fill-slate-400 text-[8px] font-mono">
            {t.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function GodStatsPage() {
  const { data, isFetching } = useWeeklyStats();

  const stats = data?.stats ?? [];
  const tableStats = useMemo(() => [...stats].reverse(), [stats]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-lg font-semibold text-slate-800 mb-4">
        Weekly Application Stats
      </h1>

      {isFetching && !stats.length && (
        <p className="text-sm text-slate-500">Loading...</p>
      )}

      {!isFetching && stats.length === 0 && (
        <p className="text-sm text-slate-500">No application data yet.</p>
      )}

      {stats.length > 0 && (
        <>
          <div className="rounded-md border bg-white shadow-sm overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-600">Week</th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Applications
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Applicants
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Apps WoW
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Applicants WoW
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tableStats.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono text-slate-700">
                      {new Date(row.week_start).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-600">
                      {row.applications}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-600">
                      {row.applicants}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {row.applications_wow_growth != null ? (
                        <span
                          className={
                            row.applications_wow_growth >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {row.applications_wow_growth >= 0 ? "+" : ""}
                          {row.applications_wow_growth}%
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {row.applicants_wow_growth != null ? (
                        <span
                          className={
                            row.applicants_wow_growth >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {row.applicants_wow_growth >= 0 ? "+" : ""}
                          {row.applicants_wow_growth}%
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <WeeklyChart data={stats} />
          </div>
        </>
      )}
    </div>
  );
}
