"use client";

import { useState, useMemo } from "react";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import {
  ListShell,
  RowCard,
  Meta,
  LastLogin,
  ListSummary,
} from "@/components/features/hire/god/ui";
import { BoolBadge } from "@/components/ui/badge";
import { useEmployers } from "@/lib/api/god.api";

export default function UnverifiedEmployersPage() {
  const employers = useEmployers();
  const [search, setSearch] = useState<string | null>(null);
  const [hideNoApps, setHideNoApps] = useState(false);
  const [selected, setSelected] = useState("");

  const setSearchQuery = (id?: number | string | null) =>
    setSearch(id?.toString() ?? null);

  const options = useMemo(
    () =>
      employers.data.map((e: any) => ({
        id: e.id ?? "",
        name: e.name ?? "",
      })),
    [employers.data]
  );

  const totalUnverified = useMemo(
    () => employers.data.filter((x: any) => !x.is_verified).length,
    [employers.data]
  );

  const filtered = employers.data
    .filter((e: any) => !hideNoApps || e?.applications?.length)
    .filter((e: any) => !e.is_verified)
    .filter((e: any) => {
      if (!search) return true;
      return (
        e.name?.toLowerCase().includes(search.toLowerCase()) || e.id === search
      );
    })
    .toSorted((a: any, b: any) => a.name?.localeCompare(b.name ?? "") ?? 0);

  const rows = filtered.map((e: any) => {
    const isRowVerifying = employers.isVerifying && e.id === selected;
    const lastTs = e?.last_session?.timestamp
      ? new Date(e.last_session.timestamp).getTime()
      : undefined;

    return (
      <RowCard
        key={e.id}
        title={e.name}
        metas={
          <>
            <BoolBadge
              state={e.is_verified}
              onValue="verified"
              offValue="unverified"
            />
            <Meta>{e.applications?.length ?? 0} applications</Meta>
            <LastLogin ts={lastTs} />
          </>
        }
        rightActions={
          <Button
            variant="outline"
            size="xs"
            scheme="supportive"
            disabled={isRowVerifying}
            onClick={(ev) => {
              ev.stopPropagation();
              setSelected(e.id ?? "");
              employers.verify(e.id ?? {});
            }}
          >
            {isRowVerifying ? "Verifying..." : "Verify"}
          </Button>
        }
        more={
          <div className="space-y-2 text-sm">
            <div>
              Employer ID: <code className="text-slate-500">{e.id}</code>
            </div>
            <div>
              Created:{" "}
              {e.created_at ? new Date(e.created_at).toLocaleString() : "—"}
            </div>
            <div>Contact: {e.contact_email || "—"}</div>
          </div>
        }
      />
    );
  });

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <ListSummary
        label="Unverified employers"
        total={totalUnverified}
        visible={filtered.length}
      />
      <Autocomplete
        setter={setSearchQuery}
        options={options}
        className="w-80"
        placeholder="Search employer..."
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={hideNoApps}
          onChange={(e) => setHideNoApps(e.target.checked)}
        />
        Hide without applications
      </label>
    </div>
  );

  return (
    <ListShell toolbar={toolbar} fullWidth>
      {rows}
    </ListShell>
  );
}
