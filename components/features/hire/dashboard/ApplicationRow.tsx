// Single row component for the applications table
// Props in (application data), events out (onView, onNotes, etc.)
// No business logic - just presentation and event emission
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/lib/ctx-app";
import { EmployerApplication } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { getFullName } from "@/lib/profile";
import {
  formatDateWithoutTime,
  formatTimestampDateWithoutTime,
} from "@/lib/utils/date-utils";
import { ApplicationAction } from "@/lib/consts/application";
import {
  Archive,
  ArchiveRestore,
  Award,
  Calendar,
  GraduationCap,
  HandHelping,
  School,
  Trash2,
} from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { FormCheckbox } from "@/components/EditForm";
import {
  DropdownMenu,
  type DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@betterinternship/components";

interface ApplicationRowProps {
  index?: number;
  application: EmployerApplication;
  isSuperListing?: boolean;
  onView: (v: any) => void;
  onAction: (action: ApplicationAction, app: EmployerApplication[]) => void;
  setSelectedApplication: (app: EmployerApplication) => void;
  checkboxSelected?: boolean;
  onToggleSelect?: (next: boolean) => void;
  statuses: DropdownMenuItem[];
}

interface InternshipPreferences {
  expected_duration_hours?: number;
  expected_start_date?: number;
  internship_type?: string;
  job_category_ids?: string[];
  job_commitment_ids?: string[];
  job_setup_ids?: string[];
}

export function ApplicationRow({
  index = 0,
  application,
  isSuperListing = false,
  onView,
  checkboxSelected = false,
  onToggleSelect,
  onAction,
  statuses,
}: ApplicationRowProps) {
  const { to_university_name } = useDbRefs();
  const { isMobile } = useAppContext();
  const preferences = (application.user?.internship_preferences ||
    {}) as InternshipPreferences;

  const currentStatusId = application.status?.toString() ?? "0";
  const defaultStatus: DropdownMenuItem = {
    id: currentStatusId,
  };
  const internshipType =
    preferences.internship_type === "credited" ? (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
        <Award className="h-3.5 w-3.5" />
        Credited
      </span>
    ) : preferences.internship_type === "voluntary" ? (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-sky-700">
        <HandHelping className="h-3.5 w-3.5" />
        Voluntary
      </span>
    ) : (
      <span className="text-sm text-gray-500">Not specified</span>
    );
  const challengeSubmission = application.challenge_submission?.trim() ?? "";
  const hasChallengeSubmission = challengeSubmission.length > 0;

  // An unfinalized applicant (pending/shortlisted) can't be archived — they'd
  // vanish from the employer's own view while the student keeps waiting, and
  // no notification can fix that (plan D3/D4). Unarchiving is never gated.
  const isArchived = application.visibility === "archived";
  const isFinalized = application.status === 4 || application.status === 6;
  const canArchive = isArchived || isFinalized;
  const ARCHIVE_DISABLED_LABEL =
    "Accept or reject this applicant before archiving them.";

  return isMobile ? (
    <div key={application.id}>
      <Card
        className={`flex flex-col hover:cursor-pointer transition-colors ${
          isSuperListing
            ? "border-amber-300 bg-amber-50/40 hover:bg-amber-100/50"
            : "hover:bg-primary/25"
        }`}
        onClick={onView}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between gap-2 pb-2"
        >
          <div className="flex items-center gap-2">
            <FormCheckbox
              checked={checkboxSelected}
              setter={(v: boolean) => onToggleSelect?.(!!v)}
            />
            <h4 className="text-gray-900 text-base">
              {getFullName(application.user)}
            </h4>
          </div>
          {isSuperListing && (
            <DropdownMenu
              items={statuses}
              defaultItem={defaultStatus}
              withDescriptions
            />
          )}
        </div>
        {isSuperListing ? (
          <div className="rounded-[0.33em] border border-amber-200 bg-amber-50/70 p-3">
            <p className="text-xs font-medium text-amber-700">Submission</p>
            <p
              className={`mt-1 text-sm whitespace-pre-wrap wrap-break-word ${
                hasChallengeSubmission
                  ? "text-gray-700 line-clamp-3"
                  : "text-muted-foreground"
              }`}
            >
              {hasChallengeSubmission
                ? challengeSubmission
                : "No challenge submission provided."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col text-gray-500">
            <div className="flex items-center gap-2">
              <School size={16} />
              <span className="text-sm">
                {to_university_name(application.user?.university) || ""}{" "}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap size={16} />
              <span className="text-sm">{application.user?.degree}</span>
            </div>
            <div>{internshipType}</div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="text-sm">
                {formatTimestampDateWithoutTime(
                  preferences.expected_start_date,
                )}
              </span>
            </div>
          </div>
        )}
        {!isSuperListing && (
          <div className="flex items-center justify-end gap-2 pt-2">
            <DropdownMenu
              items={statuses}
              defaultItem={defaultStatus}
              withDescriptions
            />
          </div>
        )}
      </Card>
    </div>
  ) : isSuperListing ? (
    <>
      <TableRow
        key={application.id}
        className="group hover:cursor-pointer odd:bg-white even:bg-gray-50 hover:bg-amber-100/50"
        onClick={onView}
      >
        <TableCell
          className="px-4 py-2"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(!checkboxSelected);
          }}
        >
          <FormCheckbox
            checked={checkboxSelected}
            setter={(v: boolean) => onToggleSelect?.(!!v)}
          />
        </TableCell>
        <TableCell className="px-4 py-2">
          {getFullName(application.user)}{" "}
        </TableCell>
        <TableCell className="px-4 py-2">
          {application.applied_at?.toLocaleDateString()}
        </TableCell>
        <TableCell className="px-4 py-2 w-40">
          <DropdownMenu
            className="w-full"
            items={statuses}
            defaultItem={defaultStatus}
            withDescriptions
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2 pr-2 flex-row justify-end">
            {application.visibility === "visible" && (
              <ActionButton
                icon={Archive}
                label="Archive"
                className="text-gray-500 enabled:data-[destructive=false]:hover:bg-gray-100 enabled:hover:text-gray-800"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  if (application.visibility === "archived") {
                    onAction("UNARCHIVE", [application]);
                  } else {
                    onAction("ARCHIVE", [application]);
                  }
                }}
                enabled={canArchive}
                label="Archive"
                disabledLabel={ARCHIVE_DISABLED_LABEL}
              />
            )}
            {application.visibility === "archived" && (
              <ActionButton
                icon={Trash2}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onAction("DELETE", [application]);
                }}
                enabled={application.visibility === "archived"}
              />
            )}
          </div>
        </TableCell>
      </TableRow>
      <TableRow
        className="bg-amber-50/40 hover:bg-amber-100/50 hover:cursor-pointer"
        onClick={onView}
      >
        <TableCell className="px-4 pb-3 pt-0" />
        <TableCell colSpan={4} className="pr-4 pb-3 pt-0">
          <div className="rounded-[0.33em] border border-amber-200 bg-amber-50/70 p-3">
            <p className="text-xs font-medium text-amber-700">Submission</p>
            <p
              className={`mt-1 text-sm whitespace-pre-wrap break-words ${
                hasChallengeSubmission
                  ? "text-gray-700 line-clamp-4"
                  : "text-muted-foreground"
              }`}
            >
              {hasChallengeSubmission
                ? challengeSubmission
                : "No challenge submission provided."}
            </p>
          </div>
        </TableCell>
      </TableRow>
    </>
  ) : (
    // desktop
    <TableRow
      key={application.id}
      className="group hover:cursor-pointer hover:bg-primary/[0.035]"
      onClick={onView}
    >
      <TableCell
        className="px-4 py-2 border-t"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect?.(!checkboxSelected);
        }}
      >
        <FormCheckbox
          checked={checkboxSelected}
          setter={(v: boolean) => onToggleSelect?.(!!v)}
        />
      </TableCell>
      <TableCell className="px-4 py-2 border-t">
        {getFullName(application.user)}{" "}
      </TableCell>
      <TableCell className="px-4 py-2 border-t">
        <div className="flex flex-col">
          <span>{to_university_name(application.user?.university) || ""}</span>
          <span className="text-gray-500">{application.user?.degree}</span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-2 not-last:border-t">
        {internshipType}
      </TableCell>
      <TableCell className="px-4 py-2 border-t">
        {formatTimestampDateWithoutTime(preferences.expected_start_date)}
      </TableCell>
      <TableCell className="px-4 py-2 border-t">
        {/* man why is the applied at date a string but the expected start date is a number */}
        {formatDateWithoutTime(application.applied_at)}
      </TableCell>
      <TableCell className="px-4 py-2 w-40 not-last:border-t">
        <DropdownMenu
          className="w-full"
          items={statuses}
          defaultItem={defaultStatus}
          withDescriptions
        />
      </TableCell>
      <TableCell className="border-t">
        <div className="flex items-center gap-2 pr-2 flex-row justify-end">
          {application.visibility !== "deleted" && (
            <ActionButton
              icon={
                application.visibility === "archived" ? ArchiveRestore : Archive
              }
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                if (application.visibility === "archived") {
                  onAction("UNARCHIVE", [application]);
                } else {
                  onAction("ARCHIVE", [application]);
                }
              }}
              enabled={canArchive}
              label={
                application.visibility === "archived" ? "Unarchive" : "Archive"
              }
            />
          )}
          {application.visibility === "archived" && (
            <ActionButton
              icon={Trash2}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onAction("DELETE", [application]);
              }}
              enabled={application.visibility === "archived"}
              destructive={true}
              label="Delete"
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
