"use client";

import { Badge } from "@/components/ui/badge";
import { PublicUser } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { formatOptionalStartMonth } from "@/lib/utils/date-utils";
import { displayValue } from "./profile-display-utils";

export function InternshipDetailsSection({ profile }: { profile: PublicUser }) {
  const { job_modes, job_types, job_categories } = useDbRefs();
  const preferences = profile.internship_preferences;

  const workModes = mapRefNames(preferences?.job_setup_ids, job_modes);
  const workloadTypes = mapRefNames(preferences?.job_commitment_ids, job_types);
  const categories = mapRefNames(preferences?.job_category_ids, job_categories);

  return (
    <dl className="space-y-2">
      <InfoRow
        label="Type of internship"
        value={formatInternshipType(preferences?.internship_type)}
      />
      <InfoRow
        label="Ideal internship start"
        value={formatOptionalStartMonth(preferences?.expected_start_date)}
      />
      <InfoRow
        label="Expected Duration (hours)"
        value={
          typeof preferences?.expected_duration_hours === "number"
            ? String(preferences.expected_duration_hours)
            : "\u2014"
        }
      />
      <PillRow label="Work Modes" values={workModes} />
      <PillRow label="Workload Types" values={workloadTypes} />
      <PillRow label="Positions / Categories" values={categories} />
    </dl>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-1 py-1.5 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-[#061858]">
        {displayValue(value)}
      </dd>
    </div>
  );
}

function PillRow({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="grid gap-1 py-1.5 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd>
        {values.length ? (
          <div className="flex flex-wrap gap-1.5">
            {values.map((value) => (
              <Badge key={value}>{value}</Badge>
            ))}
          </div>
        ) : (
          <span className="text-sm font-medium text-[#061858]">{"\u2014"}</span>
        )}
      </dd>
    </div>
  );
}

function formatInternshipType(type?: string | null) {
  if (type === "credited") return "Credited";
  if (type === "voluntary") return "Voluntary";
  return "\u2014";
}

function mapRefNames(
  ids: (string | number)[] | undefined,
  refs: { id: string | number; name: string }[],
) {
  if (!ids?.length) return [];
  return ids
    .map((id) => refs.find((ref) => String(ref.id) === String(id))?.name)
    .filter(Boolean) as string[];
}
