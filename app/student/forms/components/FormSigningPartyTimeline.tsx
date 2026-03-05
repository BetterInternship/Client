import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { Timeline, TimelineItem } from "@/components/ui/timeline";

export const FormSigningPartyTimeline = () => {
  const form = useFormRendererContext();
  const recipients = form.formMetadata.getSigningParties();

  return (
    recipients.length > 1 && (
      <Timeline>
        {recipients.map((recipient, index) => {
          const fromMe = recipient.signatory_source?._id === "initiator";
          return (
            <TimelineItem
              key={recipient.signatory_title}
              number={index + 1}
              title={
                <span className="text-base text-gray-700 sm:text-lg">
                  {recipient.signatory_title}
                </span>
              }
              subtitle={
                fromMe && (
                  <span className="text-warning font-bold text-sm">
                    {"you will specify this email"}
                  </span>
                )
              }
              isLast={index === recipients.length - 1}
            />
          );
        })}
      </Timeline>
    )
  );
};
