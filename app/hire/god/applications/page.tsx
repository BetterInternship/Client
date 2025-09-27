"use client";

import { useMemo, useState } from "react";
import { Autocomplete } from "@/components/ui/autocomplete";
import {
  ListShell,
  RowCard,
  Meta,
  ListSummary,
} from "@/components/features/hire/god/ui";
import { useEmployers } from "@/lib/api/god.api";
import { getFullName } from "@/lib/profile";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useDbRefs } from "@/lib/db/use-refs";

export default function ApplicationsPage() {
  const employers = useEmployers();
  const [search, setSearch] = useState<string | null>(null);
  const { to_app_status_name } = useDbRefs();

  const setSearchQuery = (id?: number | string | null) =>
    setSearch(id?.toString() ?? null);

  const applications = useMemo(() => {
    const apps: any[] = [];
    // @ts-ignore
    employers.data.forEach((e: any) =>
      e?.applications?.map((a: any) => apps.push(a))
    );
    return apps;
  }, [employers.data]);

  const options = useMemo(
    () =>
      applications.map((a: any) => ({
        id: a.id ?? "",
        name: `${
          a.job?.employers?.name || a.jobs?.employers?.name
        } ${getFullName(a.users)} ${a.jobs?.title || a.job?.title || ""}`,
      })),
    [applications]
  );

  const filtered = applications
    .filter((a: any) => {
      if (!search) return true;
      const hay = `${a.job?.employers?.name} ${getFullName(a.users)} ${
        a.jobs?.employers?.name
      } ${a.jobs?.title} ${a.job?.title}`.toLowerCase();
      return hay.includes(search.toLowerCase()) || a.id === search;
    })
    .toSorted(
      (a: any, b: any) =>
        new Date(b.applied_at ?? "").getTime() -
        new Date(a.applied_at ?? "").getTime()
    );

  const rows = filtered.map((a: any) => (
    <RowCard
      key={a.id}
      title={
        <span className="flex items-center gap-2">
          <Badge strength="medium">{to_app_status_name(a.status)}</Badge>
          <span className="font-medium">{a.jobs?.title || a.job?.title}</span>
        </span>
      }
      subtitle={
        <span className="text-xs text-slate-500">
          {a.jobs?.employers?.name || a.job?.employers?.name}
        </span>
      }
      metas={
        <>
          <Meta>applicant: {getFullName(a.users)}</Meta>
          <Meta>applied: {formatDate(a.applied_at ?? "")}</Meta>
        </>
      }
      more={
        <div className="space-y-2 text-sm">
          <div>
            Application ID: <code className="text-slate-500">{a.id}</code>
          </div>
          <div>
            Job ID: <code className="text-slate-500">{a.job_id}</code>
          </div>
          <div>
            User ID: <code className="text-slate-500">{a.user_id}</code>
          </div>
        </div>
      }
    />
  ));

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <ListSummary
        label="Applications"
        total={applications.length}
        visible={filtered.length}
      />
      <Autocomplete
        setter={setSearchQuery}
        options={options}
        className="w-96"
        placeholder="Search applications..."
      />
    </div>
  );

  return (
    <ListShell toolbar={toolbar} fullWidth>
      {rows}
    </ListShell>
  );
}
