import { ModalComponent, ModalHandle } from "@/hooks/use-modal";
import { Button } from "../ui/button";
import { RefObject } from "react";

export const MassApplyModal = ({
  ref,
  disabled,
  onCancel,
  onSubmit,
}: {
  ref?: RefObject<ModalHandle | null>;
  disabled?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) => {
  return (
    <ModalComponent ref={ref}>
      <div className="max-w-lg mx-auto p-6 space-y-4">
        <h2 className="text-xl font-semibold">Apply to selected jobs</h2>
        <p className="text-sm text-gray-600">
          We&rsquo;ll skip any postings that require info your profile
          doesn&rsquo;t have.
        </p>

        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={disabled}>
            {disabled ? "Submitting..." : "Submit applications"}
          </Button>
        </div>
      </div>
    </ModalComponent>
  );
};
