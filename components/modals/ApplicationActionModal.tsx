import { ApplicationAction } from "@/lib/consts/application";
import { EmployerApplication } from "@/lib/db/db.types";
import {
  Archive,
  ArchiveRestore,
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

/**
 * Retrieve an applicant's name from a given application.
 * @param app EmployerApplication object to retrieve name from.
 * @returns Applicant's name.
 */
const getApplicantName = (app?: EmployerApplication) => {
  if (!app?.user) return "this applicant";

  return (
    `${app.user.first_name || ""} ${app.user.last_name || ""}`.trim() ||
    "this applicant"
  );
};

const getUIConfig = (
  type: ApplicationAction,
  name: string,
  numApplicants: number,
) => {
  const isMassAction = numApplicants > 1;

  const config: Record<
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
      title: isMassAction
        ? `Accept ${numApplicants} applicants?`
        : `Accept ${name}?`,
      description: isMassAction
        ? "This action is irreversible and will notify the applicants of their acceptance."
        : "This action is irreversible and will notify the applicant of their acceptance.",
      buttonLabel: "Accept",
      buttonScheme: "primary",
    },
    REJECT: {
      icon: X,
      color: "bg-text-destructive",
      title: isMassAction
        ? `Reject ${numApplicants} applicants?`
        : `Reject ${name}?`,
      description: isMassAction
        ? "This action is irreversible and will notify the applicants of their rejection."
        : "This action is irreversible and will notify the applicant of their rejection.",
      buttonLabel: "Reject",
      buttonScheme: "destructive",
    },
    SHORTLIST: {
      icon: Star,
      color: "bg-text-primary",
      title: isMassAction
        ? `Shortlist ${numApplicants} applicants?`
        : `Shortlist ${name}?`,
      description: isMassAction
        ? "The applications will be shortlisted. You can change their status later."
        : "The application will be shortlisted. You can change its status later.",
      buttonLabel: "Shortlist",
      buttonScheme: "primary",
    },
    ARCHIVE: {
      icon: Archive,
      color: "bg-text-muted",
      title: isMassAction
        ? `Archive ${numApplicants} applicants?`
        : `Archive ${name}?`,
      description: isMassAction
        ? "These applications will be moved to the 'Archived' section. You can change their status later."
        : "This application will be moved to the 'Archived' section. You can change its status later.",
      buttonLabel: "Archive",
      buttonScheme: "primary",
    },
    UNARCHIVE: {
      icon: ArchiveRestore,
      color: "bg-text-muted",
      title: isMassAction
        ? `Unarchive ${numApplicants} applicants?`
        : `Unarchive ${name}?`,
      description: isMassAction
        ? "These applications will be unarchived. They will be visible in the other sections."
        : "This application will be unarchived. It will be visible in the other sections.",
      buttonLabel: "Unarchive",
      buttonScheme: "primary",
    },
    DELETE: {
      icon: Trash2,
      color: "bg-text-destructive",
      title: isMassAction
        ? `Delete ${numApplicants} applicants?`
        : `Delete ${name}?`,
      description: isMassAction
        ? "Are you sure you want to permanently delete these applications? This cannot be undone."
        : "Are you sure you want to permanently delete this application? This cannot be undone.",
      buttonLabel: "Delete",
      buttonScheme: "destructive",
    },
    CHANGE_STATUS: {
      icon: List,
      color: "bg-text-muted",
      title: `Change status for ${numApplicants} applicant${isMassAction ? "" : "s"}?`,
      description:
        "This will immediately update the status for all selected applicants.",
      buttonLabel: "Update",
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

  return config[type];
};

/**
 * The frontend of the modal for application actions such as accepting, rejecting, and archiving.
 * @param type Type of action performed (accept, reject, etc.). The type of actions that can be performed can be modified in the `uiConfig` record within this component.
 * @param applicants Applicant/s affected by the action.
 * @param isProcessing Boolean state that tracks whether the action is being processed. Used to disable the buttons while waiting for db response.
 * @param onConfirm Function to run when confirming the action.
 * @param onCancel Function to run when cancelling the action.
 * @returns The frontend for the application action modal.
 */
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

  const config = getUIConfig(type, name, applicants.length);

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
