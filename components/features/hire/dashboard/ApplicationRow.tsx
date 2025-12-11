// Single row component for the applications table
// Props in (application data), events out (onView, onNotes, etc.)
// No business logic - just presentation and event emission
import { ActionItem } from "@/components/ui/action-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConversations } from "@/hooks/use-conversation";
import { useAppContext } from "@/lib/ctx-app";
import { EmployerApplication } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { getFullName } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { formatDateWithoutTime, formatTimestampDateWithoutTime } from "@/lib/utils/date-utils";
import { statusMap } from "@/components/common/status-icon-map";
import { motion } from "framer-motion";
import {
  Archive,
  Calendar,
  ContactRound,
  GraduationCap,
  MessageCircle,
  School,
  Trash,
} from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { FormCheckbox } from "@/components/EditForm";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

interface ApplicationRowProps {
  index?: number;
  application: EmployerApplication;
  onView: (v: any) => void;
  onNotes: () => void;
  onSchedule: () => void;
  onStatusChange: (status: number) => void;
  onDeleteButtonClick: (application: EmployerApplication) => void;
  openChatModal: () => void;
  updateConversationId: (conversationId: string) => void;
  setSelectedApplication: (application: EmployerApplication) => void;
  checkboxSelected?: boolean;
  onToggleSelect?: (next: boolean) => void;
  statuses: ActionItem[];
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
  index = 0,
  application,
  onView,
  openChatModal,
  updateConversationId,
  setSelectedApplication,
  checkboxSelected = false,
  onToggleSelect,
  onDeleteButtonClick: onArchiveButtonClick,
  statuses,
}: ApplicationRowProps) {
  const { to_university_name, get_app_status } = useDbRefs();
  const conversations = useConversations();
  const { isMobile } = useAppContext();
  const preferences = (application.user?.internship_preferences || {}) as InternshipPreferences;

  // limit row animation to first 50.
  const MAX_STAGGER_ROWS = 50;
  const staggerDelay = index < MAX_STAGGER_ROWS ? index * 0.05 : 0;

  const currentStatusId = application.status?.toString() ?? "0";
  const defaultStatus: ActionItem = {
    id: currentStatusId,
    label: get_app_status(application.status!)?.name,
    active: true,
    disabled: false,
    destructive: false,
    highlighted: true,
    highlightColor: statusMap.get(application.status!)?.bgColor,
  };

  return isMobile ? (
      <motion.div
        key={application.id}
        initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
        animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
        exit={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
        transition={{ duration: 0.3, delay: staggerDelay, ease: "easeOut" }}
      >
        <Card
          className="flex flex-col hover:cursor-pointer hover:bg-primary/25 transition-colors"
          onClick={onView}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 pb-2"
          >
            <FormCheckbox
              checked={checkboxSelected}
              setter={(v: boolean) => onToggleSelect?.(!!v)}
            />
            <h4 className="text-gray-900 text-base">{getFullName(application.user)}</h4>
          </div>
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
            <div className="flex items-center gap-2">
              <ContactRound size={16} />
              <span className="text-sm">
                {preferences.internship_type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="text-sm">
                {formatTimestampDateWithoutTime(preferences.expected_start_date)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <DropdownMenu
              items={statuses}
              defaultItem={defaultStatus}
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
            >
              <MessageCircle className="h-6 w-6" />
              Chat
            </Button>
          </div>
        </Card>
      </motion.div>
  ) : (
    // desktop
    <motion.tr
      key={application.id}
      initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
      animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
      exit={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: staggerDelay, 
        ease: "easeOut", 
      }}
      className="hover:bg-primary/25 odd:bg-white even:bg-gray-50 hover:cursor-pointer transition-colors"
      onClick={onView}
    >
      <td 
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
      </td>
      <td className="px-4 py-2">{getFullName(application.user)} </td>
      <td className="px-4 py-2 flex flex-col">
        <span>
          {to_university_name(application.user?.university) || ""}
        </span>
        <span className="text-gray-500">{application.user?.degree}</span>
      </td>
      <td className="px-4 py-2">
        {preferences.internship_type}
      </td>
      <td className="px-4 py-2">
        {formatTimestampDateWithoutTime(preferences.expected_start_date)}
      </td>
      <td className="px-4 py-2">
        {/* man why is the applied at date a string but the expected start date is a number */}
        {formatDateWithoutTime(application.applied_at)}
      </td>
      <td className="px-4 py-2 overflow-visible">
        <DropdownMenu
          items={statuses}
          defaultItem={defaultStatus}
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
            icon={Archive}
            onClick={(e) => {
              e.stopPropagation();
              onArchiveButtonClick(application);
            }}
            enabled={application.status! !== 7}
          />
        </div>
      </td>
    </motion.tr>
  );
}
