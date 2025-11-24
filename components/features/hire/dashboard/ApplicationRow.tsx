// Single row component for the applications table
// Props in (application data), events out (onView, onNotes, etc.)
// No business logic - just presentation and event emission
import { useMemo } from "react";
import { ActionItem } from "@/components/ui/action-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CommandMenu } from "@/components/ui/command-menu";
import { useConversations } from "@/hooks/use-conversation";
import { useAppContext } from "@/lib/ctx-app";
import { EmployerApplication } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { getFullName } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { fmtISO } from "@/lib/utils/date-utils";
import { statusMap } from "@/components/common/status-icon-map";
import {
  Ban,
  Calendar,
  Check,
  CheckCircle2,
  ContactRound,
  GraduationCap,
  MessageCircle,
  School,
  Star,
  Trash,
  XCircle,
} from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { FormCheckbox } from "@/components/EditForm";

interface ApplicationRowProps {
  application: EmployerApplication;
  onView: () => void;
  onNotes: () => void;
  onSchedule: () => void;
  onStatusChange: (status: number) => void;
  onStatusButtonClick: (id: string, status: number) => void;
  openChatModal: () => void;
  updateConversationId: (conversationId: string) => void;
  setSelectedApplication: (application: EmployerApplication) => void;
  checkboxSelected?: boolean;
  onToggleSelect?: (next: boolean) => void;
}

interface InternshipPreferences {
  expected_duration_hours?: number,
  expected_start_date?: number,
  internship_type?: string,
  job_category_ids?: string[],
  job_commitment_ids?: string[],
  job_setup_ids?: string[],
}

export function ApplicationRow({
  application,
  onView,
  openChatModal,
  updateConversationId,
  setSelectedApplication,
  checkboxSelected = false,
  onToggleSelect,
  onStatusButtonClick,
}: ApplicationRowProps) {
  const { to_university_name } = useDbRefs();
  const conversations = useConversations();
  const { isMobile } = useAppContext();

  const preferences = (application.user?.internship_preferences || {}) as InternshipPreferences;

  const statuses = useMemo<ActionItem[]>(() => [
    {
      "id": "accept",
      "label": "Accepted",
      "icon": Check,
      "active": true,
      "onClick": () => onStatusButtonClick(application.id!, 4),
      "highlighted": application.status! === 4,
      "highlightColor": `${statusMap.get(4)?.bgColor} ${statusMap.get(4)?.fgColor}`
    },
    {
      "id": "shortlist",
      "label": "Shortlisted",
      "icon": Star,
      "active": true,
      "onClick": () => onStatusButtonClick(application.id!, 2),
      "highlighted": application.status! === 2,
      "highlightColor": `${statusMap.get(2)?.bgColor} ${statusMap.get(2)?.fgColor}`
    },
    {
      "id": "reject",
      "label": "Rejected",
      "icon": Ban,
      "active": true,
      "onClick": () => onStatusButtonClick(application.id!, 6),
      "highlighted": application.status! === 6,
      "highlightColor": `${statusMap.get(6)?.bgColor} ${statusMap.get(6)?.fgColor}`
    },
  ], [application.id, onStatusButtonClick]);

  return isMobile ? (
    <>
      <Card
        className="flex flex-col hover:cursor-pointer hover:bg-primary/25 transition-colors"
        onClick={onView}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex justify-between"
        >
          <FormCheckbox
            checked={checkboxSelected}
            setter={(v) => onToggleSelect?.(!!v)}
            className="w-6 h-6"
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
          <div className="flex flex-col gap-1 pb-2">
            <h4 className="text-gray-900 text-base">{getFullName(application.user)}</h4>
          </div>
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
          <div className="flex items-center gap-2">
            <ContactRound size={16} />
            <span className="text-sm">
              {preferences.internship_type ? "For Credit" : "Voluntary"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span className="text-sm">
              {preferences.expected_start_date ? (
                <>
                  {fmtISO(preferences.expected_start_date.toString())}
                </>
              ) : (
                <span className="text-gray-500"> No start date provided</span>
              )}
            </span>
          </div>
        </div>
        <div className="pt-2">
          <CommandMenu
            items={statuses}
            isVisible={true}
            defaultVisible={true}
          />
        </div>
      </Card>
    </>
  ) : (
    // desktop
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
          {to_university_name(application.user?.university) || ""}
        </span>
        <span className="text-gray-500">{application.user?.degree}</span>
      </td>
      <td className="px-4 py-2">
        {preferences.internship_type ? "For Credit" : "Voluntary"}
      </td>
      <td className="px-4 py-2">
        {preferences.expected_start_date ? (
          <>
            {fmtISO(preferences.expected_start_date.toString())}
          </>
        ) : (
          <span> Not provided</span>
        )}
      </td>
      <td className="px-4 py-2">
        <CommandMenu
          items={statuses}
          isVisible={true}
          defaultVisible={true}
        />
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

          <ActionButton
            icon={MessageCircle}
            onClick={(e) => {
              e.stopPropagation();
              openChatModal();
              setSelectedApplication(application);
              updateConversationId(application.user_id ?? "");
            }}
          />
          <ActionButton
            icon={Trash}
            onClick={(e) => {
              e.stopPropagation();
              onStatusButtonClick(application.id!, 7)
            }}
            destructive={true}
            enabled={application.status! !== 7}
          />
        </div>
      </td>
    </tr>
  );
}
