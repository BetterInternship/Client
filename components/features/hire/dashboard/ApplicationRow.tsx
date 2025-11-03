// Single row component for the applications table
// Props in (application data), events out (onView, onNotes, etc.)
// No business logic - just presentation and event emission
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useConversations } from "@/hooks/use-conversation";
import { EmployerApplication } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { getFullName } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { fmtISO } from "@/lib/utils/date-utils";
import {
  Calendar,
  CalendarClock,
  ContactRound,
  GraduationCap,
  MessageCircle,
  School,
} from "lucide-react";
import { useAppContext } from "@/lib/ctx-app";
import { Card } from "@/components/ui/card";

interface ApplicationRowProps {
  application: EmployerApplication;
  onView: () => void;
  onNotes: () => void;
  onSchedule: () => void;
  onStatusChange: (status: number) => void;
  openChatModal: () => void;
  updateConversationId: (conversationId: string) => void;
  setSelectedApplication: (application: EmployerApplication) => void;
  checkboxSelected?: boolean;
  onToggleSelect?: (next: boolean) => void;
}

export function ApplicationRow({
  application,
  onView,
  onSchedule,
  openChatModal,
  updateConversationId,
  setSelectedApplication,
  checkboxSelected = false,
  onToggleSelect,
}: ApplicationRowProps) {
  const { to_university_name } = useDbRefs();
  const conversations = useConversations();
  const { isMobile } = useAppContext();

  return isMobile ? (
    <>
      <Card
        className="flex flex-col gap-4 hover:cursor-pointer hover:bg-primary/25 transition-colors"
        onClick={onView}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex justify-between"
        >
          <Checkbox
            checked={checkboxSelected}
            onCheckedChange={(v) => onToggleSelect?.(!!v)}
          />

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
            <MessageCircle className="h-6 w-6" />
            Chat
          </Button>
        </div>
        <div className="flex flex-col text-gray-500">
          <h4 className="text-gray-900">{getFullName(application.user)}</h4>
          <div className="flex items-center gap-2">
            <School size={20} />
            <span>
              {to_university_name(application.user?.university) || ""}{" "}
              {application.user?.expected_start_date &&
                "• " + application.user?.year_level}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap size={20} />
            <span>{application.user?.degree}</span>
          </div>
          <div className="flex items-center gap-2">
            <ContactRound size={20} />
            <span>
              {application.user?.taking_for_credit ? "For Credit" : "Voluntary"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <span>
              {application.user?.expected_start_date ||
              application.user?.expected_end_date ? (
                <>
                  {" "}
                  {fmtISO(application.user?.expected_start_date)} —{" "}
                  {fmtISO(application.user?.expected_end_date)}
                </>
              ) : (
                <span> No preferred dates provided</span>
              )}
            </span>
          </div>
        </div>
      </Card>
    </>
  ) : (
    <tr
      className="hover:bg-primary/25 odd:bg-white even:bg-gray-50 hover:cursor-pointer transition-colors"
      onClick={onView}
    >
      <td className="px-4 py-2">
        <Checkbox
          checked={checkboxSelected}
          onCheckedChange={(v) => onToggleSelect?.(!!v)}
        />
      </td>
      <td className="px-4 py-2">{getFullName(application.user)} </td>
      <td className="px-4 py-2 flex flex-col">
        <span>
          {to_university_name(application.user?.university) || ""}{" "}
          {application.user?.expected_start_date &&
            "• " + application.user?.year_level}
        </span>
        <span className="text-gray-500">{application.user?.degree}</span>
      </td>
      <td className="px-4 py-2">
        {application.user?.taking_for_credit ? "For Credit" : "Voluntary"}
      </td>
      <td className="px-4 py-2">
        {application.user?.expected_start_date ||
        application.user?.expected_end_date ? (
          <>
            {" "}
            {fmtISO(application.user?.expected_start_date)} —{" "}
            {fmtISO(application.user?.expected_end_date)}
          </>
        ) : (
          <span className="text-gray-500"> No dates provided</span>
        )}
      </td>
      <td>
        <div className="flex items-center gap-2 pr-2 flex-row justify-end">
          <Badge
            type="warning"
            className={cn(
              conversations.unreads.some((unread) =>
                unread.subscribers.includes(application.user_id),
              )
                ? "block"
                : "hidden",
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
            <MessageCircle className="h-6 w-6" />
            Chat
          </Button>
        </div>
      </td>
    </tr>
  );
}
