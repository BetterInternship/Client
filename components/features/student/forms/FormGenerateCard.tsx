"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import useModalRegistry from "@/components/modals/modal-registry";
import { useMyForms } from "@/app/student/forms/myforms.ctx";

export default function FormTemplateCard({
  formLabel,
  onGenerate,
}: {
  formLabel: string;
  onGenerate: () => void;
}) {
  const modalRegistry = useModalRegistry();
  const { shouldShowDuplicateWarning } = useMyForms();

  const handleClick = () => {
    const warningResult = shouldShowDuplicateWarning(formLabel);

    // If no warning needed, proceed
    if (!warningResult.show) {
      onGenerate();
      return;
    }

    // Show warning modal
    if (modalRegistry?.duplicateFormWarning) {
      modalRegistry.duplicateFormWarning.open({
        formLabel,
        hasPendingInstance: warningResult.hasPending,
        hasCompletedInstance: warningResult.hasCompleted,
        onGenerateAnother: onGenerate,
        onGoBack: () => {
          // Modal closes automatically
        },
      });
    } else {
      // Fallback if modal not available
      onGenerate();
    }
  };

  return (
    <div className="border-b hover:bg-gray-100 duration-150 transition-all">
      <Card className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-0 py-2 sm:p-3 rounded-none border-none bg-transparent ">
        <div className="flex gap-0 w-full overflow-hidden">
          <div className=" sm:px-3 py-1 text-gray-700 text-xs sm:text-sm break-words sm:text-ellipsis sm:text-nowrap sm:line-clamp-1">
            {formLabel}
          </div>
        </div>

        <Button
          onClick={handleClick}
          variant="outline"
          scheme="primary"
          className="flex flex-row justify-between gap-1 sm:gap-2 bg-primary/10 border-none flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto"
        >
          Open
          <SquareArrowOutUpRight className="w-4 h-4" />
        </Button>
      </Card>
    </div>
  );
}
