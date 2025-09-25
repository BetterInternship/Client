// Single row component for the applications table
// Props in (application data), events out (onView, onNotes, etc.)
// No business logic - just presentation and event emission
import { EmployerApplication } from "@/lib/db/db.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFullName } from "@/lib/utils/user-utils";
import { UserPfp } from "@/components/shared/pfp";
import { StatusDropdown } from "@/components/common/StatusDropdown";
import { useDbRefs } from "@/lib/db/use-refs";
import { useConversations } from "@/hooks/use-conversation";
import { cn } from "@/lib/utils";

interface ApplicationRowProps {
  application: EmployerApplication;
  onView: () => void;
  onNotes: () => void;
  onSchedule: () => void;
  onStatusChange: (status: number) => void;
  openChatModal: () => void;
  updateConversationId: (conversationId: string) => void;
  setSelectedApplication: (application: EmployerApplication) => void;
}

export function ApplicationRow({
  application,
  onView,
  onNotes,
  onSchedule,
  onStatusChange,
  openChatModal,
  updateConversationId,
  setSelectedApplication,
}: ApplicationRowProps) {
  const { to_university_name, to_app_status_name } = useDbRefs();
  const conversations = useConversations();

  return (
    <tr
      className="w-full hover:bg-primary/25 even:bg-gray-100 hover:cursor-pointer transition-colors flex flex-row items-center justify-between"
      onClick={onView}
    >
      <td className="w-full px-4 p-1">
        <div className="flex items-center gap-3">
          {application.user?.id && <UserPfp user_id={application.user.id} />}
          <div>
            <p className="font-medium text-gray-900">
              {getFullName(application.user)}{" "}
              <span className="opacity-70">
                — {to_university_name(application.user?.university) || ""} •{" "}
                {application.user.expected_graduation_date || ""}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              <Badge strength="medium" className="bg-white">
                {application.job?.title}
              </Badge>
            </p>
          </div>
        </div>
      </td>
      <td className="text-center px-6">
        <div className="flex items-center space-x-2 flex-row justify-end">
          <Badge
            type="warning"
            className={cn(
              conversations.unreads.some((unread) =>
                unread.subscribers.includes(application.user_id)
              )
                ? "block"
                : "hidden"
            )}
          >
            New Unreads
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openChatModal();
              setSelectedApplication(application);
              updateConversationId(application.user_id ?? "");
            }}
            className="relative"
          >
            Message
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onNotes();
            }}
          >
            Notes
          </Button>
          {/* // ! uncomment when calendar back */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSchedule();
            }}
          >
            Schedule
          </Button> */}
          <div>
            <StatusDropdown
              value={application.status ?? 0}
              disabled={to_app_status_name(application.status) === "Withdrawn"}
              onChange={onStatusChange}
              className="w-36"
            />
          </div>
        </div>
      </td>
    </tr>
  );
}
