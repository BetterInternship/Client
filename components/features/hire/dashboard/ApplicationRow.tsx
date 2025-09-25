// Single row component for the applications table
// Props in (application data), events out (onView, onNotes, etc.)
// No business logic - just presentation and event emission
import { StatusDropdown } from "@/components/common/StatusDropdown";
import { UserPfp } from "@/components/shared/pfp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConversations } from "@/hooks/use-conversation";
import { EmployerApplication } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { cn } from "@/lib/utils";
import { fmtISO } from "@/lib/utils/date-utils";
import { getFullName } from "@/lib/utils/user-utils";
import { CalendarClock, MessageCircle } from "lucide-react";

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
  const { to_university_name, to_level_name, to_app_status_name } = useDbRefs();
  const conversations = useConversations();

  return (
    <tr
      className="w-full hover:bg-primary/25 odd:bg-gray-100 hover:cursor-pointer transition-colors flex flex-row items-center justify-between p-1"
      onClick={onView}
    >
      <td className="w-full px-4 p-1">
        <div className="flex items-center gap-3">
          {application.user?.id && <UserPfp user_id={application.user.id} />}
          <div>
            <p className="font-medium text-gray-900">
              {getFullName(application.user)}{" "}
              <span className="opacity-70 text-sm">
                — {to_level_name(application.user?.year_level) || ""}
                {/* {to_university_name(application.user?.university) || ""} •{" "} */}
              </span>
            </p>
            <p className="text-xs text-gray-500 space-x-1">
              <Badge strength="medium" className="bg-white">
                {/* {application.job?.title} */}
                {to_university_name(application.user?.university) || ""}
              </Badge>
              <Badge strength="medium" className="bg-white">
                {application.user?.taking_for_credit ? "For Credit" : "Voluntary"}
              </Badge> 
              {application.user?.expected_start_date || application.user?.expected_end_date ? (
                <> • {fmtISO(application.user?.expected_start_date)} — {fmtISO(application.user?.expected_end_date)}</>
              ) : <> • No dates provided</>}
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
            <MessageCircle
            className="h-6 w-6"
            />
          </Button>
          {/* // ! uncomment when calendar back */}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // onSchedule();
            }}
          >
            <CalendarClock
            className="h-6 w-6"
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // onNotes();
            }}
          >
            Send Survey
          </Button>
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
