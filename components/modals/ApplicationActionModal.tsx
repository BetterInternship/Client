import { ApplicationAction } from "@/hooks/use-application-actions";
import { EmployerApplication } from "@/lib/db/db.types";
import {
  Archive,
  Check,
  FileQuestion,
  List,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { HeaderIcon } from "../ui/text";
import { Button } from "../ui/button";

interface ApplicationActionModalProps {
  type: ApplicationAction;
  applicants: EmployerApplication[];
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const getApplicantName = (app?: EmployerApplication) => {
  if (!app?.user) return "this applicant";

  return (
    `${app.user.first_name || ""} ${app.user.last_name || ""}`.trim() ||
    "this applicant"
  );
};

export default function ApplicationActionModal({
  type,
  applicants,
  isProcessing,
  onConfirm,
  onCancel,
}: ApplicationActionModalProps) {
  if (applicants.length === 0) return null;

  const firstApplicant = applicants[0];
  const name = getApplicantName(firstApplicant);
  const isMassAction = applicants.length > 1;

  const uiConfig: Record<
    ApplicationAction,
    {
      icon: React.ComponentType<{
        className: string;
      }>;
      color: string;
      title: string;
      description: string;
      buttonLabel: string;
      buttonScheme: "default" | "primary" | "destructive";
    }
  > = {
    ACCEPT: {
      icon: Check,
      color: "bg-text-supportive",
      title: `Accept ${name}?`,
      description:
        "This action is irreversible and will notify them of their acceptance.",
      buttonLabel: "Accept",
      buttonScheme: "primary",
    },
    REJECT: {
      icon: X,
      color: "bg-text-destructive",
      title: `Reject ${name}?`,
      description:
        "This action is irreversible and will notify them of their rejection.",
      buttonLabel: "Reject",
      buttonScheme: "destructive",
    },
    SHORTLIST: {
      icon: Star,
      color: "bg-text-primary",
      title: `Shortlist ${name}?`,
      description:
        "The applicant will be shortlisted. You can change their status later.",
      buttonLabel: "Shortlist",
      buttonScheme: "primary",
    },
    ARCHIVE: {
      icon: Archive,
      color: "bg-text-muted",
      title: `Archive ${name}?`,
      description:
        "This applicant will be moved to the 'Archived' section. You can change their status later.",
      buttonLabel: "Accept",
      buttonScheme: "primary",
    },
    DELETE: {
      icon: Trash2,
      color: "bg-text-destructive",
      title: `Delete ${name}?`,
      description:
        "Are you sure you want to permanently delete this application? This cannot be undone.",
      buttonLabel: "Delete",
      buttonScheme: "destructive",
    },
    CHANGE_STATUS: {
      icon: List,
      color: "bg-text-muted",
      title: `Change status for ${applicants.length} applicant${applicants.length === 1 ? "" : "s"}?`,
      description:
        "This will immediately update the status for all selected applicants.",
      buttonLabel: "Accept",
      buttonScheme: "primary",
    },
    NONE: {
      icon: FileQuestion,
      color: "bg-text-muted",
      title: "Unknown error",
      description: "An unknown error has occurred.",
      buttonLabel: "Continue",
      buttonScheme: "default",
    },
  };

  const config = uiConfig[type];

  return (
    <div className="flex flex-col gap-3 h-full w-full">
      <div className="flex items-center gap-3 pt-4">
        <HeaderIcon icon={config.icon} />
        <h4>{config.title}</h4>
      </div>
      <span>{config.description}</span>

      {/* list applicants if mass action is performed. */}
      {isMassAction && type === "CHANGE_STATUS" && (
        <div className="bg-muted text-muted-foreground rounded-[0.33em] border p-3">
          <span>Selected applicants:</span>
          <ul className="list-disc list-inside text-sm max-h-32 overflow-y-auto">
            {applicants.map((app) => (
              <li key={app.id} className="truncate">
                {getApplicantName(app)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* action buttons */}
      <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          scheme={config.buttonScheme}
          onClick={onConfirm}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          {isProcessing ? "Changing status..." : config.buttonLabel}
        </Button>
      </div>
    </div>
  );
}
