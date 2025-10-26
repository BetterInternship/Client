// Single row component for the applications table
// Props in (application data), events out (onView, onNotes, etc.)
// No business logic - just presentation and event emission
import { StatusDropdown } from "@/components/common/StatusDropdown";
import { UserPfp } from "@/components/shared/pfp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useConversations } from "@/hooks/use-conversation";
import { EmployerApplication } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { getFullName } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { fmtISO } from "@/lib/utils/date-utils";
import { CalendarClock, MessageCircle } from "lucide-react";

const approximateYearLevel = (timestamp: number) => {
  const now = Date.now();
  const year = 31_556_952_000;
  const delta = timestamp - now;
  if (delta > 0 && delta < year * 2) return "3rd Year/Above";
  else return "Freshman/Sophomore";
};

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
      className="hover:bg-primary/25 odd:bg-white even:bg-gray-50 hover:cursor-pointer transition-colors"
      onClick={onView}
    >
      <td className="p-2">
        {getFullName(application.user)}{" "}
      </td>
      <td className="p-2">
        <span>
          {to_university_name(application.user?.university) || ""}{" "}
          {application.user?.expected_start_date &&
            "• " +
            application.user?.year_level}
        </span>
        <span className="text-gray-500">{application.user?.degree}</span>
      </td>
      <td className="p-2">
        {application.user?.taking_for_credit ? "For Credit" : "Voluntary"}
      </td>
      <td className="p-2">
        {application.user?.expected_start_date || application.user?.expected_end_date ? (
          <> {fmtISO(application.user?.expected_start_date)} — {fmtISO(application.user?.expected_end_date)}</>
        ) : <p className="text-gray-500"> No dates provided</p>}
      </td>
      <td>
        <div className="flex items-center gap-2 pr-2 flex-row justify-end">
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
