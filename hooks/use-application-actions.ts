import { useEffect, useState } from "react";
import { EmployerApplication } from "@/lib/db/db.types";
import { toast } from "sonner";
import { useModalRegistry } from "@/components/modals/modal-registry";
import { ApplicationAction } from "@/lib/consts/application";

/**
 * Hook to modify application state.
 * @param review Function that takes in an application ID and options (such as new status) and performs the necessary API call to update the application in the database. This is passed in as a parameter to allow for flexibility in how the review action is performed, such as allowing for different implementations for different pages or contexts.
 * @param onSuccess Function that runs after the state is successfully modified.
 * @returns Function to trigger different application actions.
 */
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
        onConfirm: () => {
          void confirmAction();
        },
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
      // this object must match the structure of the updates requested in API-Server-V2\src\applications\applications.service.ts
      let updatePayload: { status?: number; visibility?: string } = {};

      let toastMessage: string;

      // map action type to status number in database.
      switch (applicationAction.type) {
        case "SHORTLIST":
          updatePayload = { status: 1 };
          toastMessage =
            applicationAction.applicants.length > 1
              ? `${applicationAction.applicants.length} applications were shortlisted.`
              : `${applicationAction.applicants[0].user?.first_name || ""} ${applicationAction.applicants[0].user?.last_name || ""}'s application was shortlisted.`;
          break;
        case "ACCEPT":
          updatePayload = { status: 4 };
          toastMessage =
            applicationAction.applicants.length > 1
              ? `${applicationAction.applicants.length} applications were accepted.`
              : `${applicationAction.applicants[0].user?.first_name || ""} ${applicationAction.applicants[0].user?.last_name || ""}'s application was accepted.`;
          break;
        case "REJECT":
          updatePayload = { status: 6 };
          toastMessage =
            applicationAction.applicants.length > 1
              ? `${applicationAction.applicants.length} applications were rejected.`
              : `${applicationAction.applicants[0].user?.first_name || ""} ${applicationAction.applicants[0].user?.last_name || ""}'s application was rejected.`;
          break;
        case "CHANGE_STATUS":
          updatePayload = { status: applicationAction.targetStatus };
          toastMessage = `${applicationAction.applicants.length} application${applicationAction.applicants.length === 1 ? "" : "s"} were updated.`;
          break;
        case "ARCHIVE":
          updatePayload = { visibility: "archived" };
          toastMessage =
            applicationAction.applicants.length > 1
              ? `${applicationAction.applicants.length} applications were archived.`
              : `${applicationAction.applicants[0].user?.first_name || ""} ${applicationAction.applicants[0].user?.last_name || ""}'s application was archived.`;
          break;
        case "UNARCHIVE":
          updatePayload = { visibility: "visible" };
          toastMessage =
            applicationAction.applicants.length > 1
              ? `${applicationAction.applicants.length} applications were unarchived.`
              : `${applicationAction.applicants[0].user?.first_name || ""} ${applicationAction.applicants[0].user?.last_name || ""}'s application was unarchived.`;
          break;
        case "DELETE":
          updatePayload = { visibility: "deleted" };
          toastMessage =
            applicationAction.applicants.length > 1
              ? `${applicationAction.applicants.length} applications were deleted.`
              : `${applicationAction.applicants[0].user?.first_name || ""} ${applicationAction.applicants[0].user?.last_name || ""}'s application was deleted.`;
          break;
        default:
          return;
      }

      // execute all updates.
      await Promise.all(
        applicationAction.applicants.map((app) =>
          review(app.id ?? "", updatePayload),
        ),
      );

      toast.success(toastMessage);

      // cleanup + callback.
      setApplicationAction({ type: "NONE", applicants: [] });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(`${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    triggerAction,
    triggerAccept: (app: EmployerApplication) => triggerAction("ACCEPT", [app]),
    triggerShortlist: (app: EmployerApplication) =>
      triggerAction("SHORTLIST", [app]),
    triggerReject: (app: EmployerApplication) => triggerAction("REJECT", [app]),
    triggerArchive: (app: EmployerApplication) =>
      triggerAction("ARCHIVE", [app]),
    triggerDelete: (app: EmployerApplication) => triggerAction("DELETE", [app]),
    triggerMassStatusChange: (apps: EmployerApplication[], status: number) =>
      triggerAction("CHANGE_STATUS", apps, status),
  };
}

export default useApplicationActions;
