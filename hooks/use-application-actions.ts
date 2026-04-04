import { useEffect, useState } from "react";
import { useEmployerApplications } from "./use-employer-api";
import { EmployerApplication } from "@/lib/db/db.types";
import { useModalRegistry } from "@/components/modals/modal-registry";

// Types of actions that users can do with applications.
export type ApplicationAction =
  | "ACCEPT"
  | "REJECT"
  | "ARCHIVE"
  | "SHORTLIST"
  | "DELETE"
  | "CHANGE_STATUS"
  | "NONE";

export function useApplicationActions(
  review: (app_id: string, options: any) => Promise<any>,
  onSuccess?: () => void,
) {
  const modalRegistry = useModalRegistry();

  const [isProcessing, setIsProcessing] = useState(false);

  // ensure single action is performed at once.
  const [applicationAction, setApplicationAction] = useState<{
    type: ApplicationAction;
    applicants: EmployerApplication[];
    targetStatus?: number;
  }>({ type: "NONE", applicants: [] });

  useEffect(() => {
    if (applicationAction.type !== "NONE") {
      modalRegistry.applicationAction.open({
        type: applicationAction.type,
        applicants: applicationAction.applicants,
        isProcessing,
        onConfirm: confirmAction,
      });
    } else {
      modalRegistry.applicationAction.close();
    }
  }, [applicationAction, isProcessing]);

  // handle requests for application actions.
  const triggerAction = (
    type: ApplicationAction,
    applicants: EmployerApplication[],
    status?: number,
  ) => {
    setApplicationAction({ type, applicants, targetStatus: status });
  };

  const confirmAction = async () => {
    if (
      applicationAction.type === "NONE" ||
      applicationAction.applicants.length === 0
    )
      return;

    setIsProcessing(true);

    try {
      let statusToSet: number = 0;

      // map action type to status number in database.
      switch (applicationAction.type) {
        case "ACCEPT":
          statusToSet = 4;
          break;
        case "REJECT":
          statusToSet = 6;
          break;
        case "ARCHIVE":
          statusToSet = 7;
          break;
        case "SHORTLIST":
          statusToSet = 1;
          break;
        case "DELETE":
          statusToSet = 5;
          break;
        case "CHANGE_STATUS":
          statusToSet = applicationAction.targetStatus!;
          break;
        default:
          return;
      }

      // execute all updates.
      await Promise.all(
        applicationAction.applicants.map((app) =>
          review(app.id ?? "", { status: statusToSet }),
        ),
      );

      // cleanup + callback.
      setApplicationAction({ type: "NONE", applicants: [] });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to execute application action:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    triggerAccept: (app: EmployerApplication) => triggerAction("ACCEPT", [app]),
    triggerShortlist: (app: EmployerApplication) =>
      triggerAction("SHORTLIST", [app]),
    triggerReject: (app: EmployerApplication) => triggerAction("REJECT", [app]),
    triggerArchive: (app: EmployerApplication) =>
      triggerAction("ARCHIVE", [app]),
    triggerDelete: (app: EmployerApplication) => triggerAction("DELETE", [app]),
    triggerMassStatusChange: (apps: EmployerApplication[]) =>
      triggerAction("CHANGE_STATUS", apps, status),
  };
}

export default useApplicationActions;
