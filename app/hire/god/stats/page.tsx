"use client";

import { useWeeklyStats } from "@/lib/api/god.api";

export default function GodStatsPage() {
  const { data, isFetching } = useWeeklyStats();

  const stats = data?.stats ?? [];

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
              {stats.map((row: any, i: number) => (
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
      )}
    </div>
  );
}
