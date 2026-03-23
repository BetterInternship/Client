import { Button } from "@/components/ui/button";
import { FormService } from "@/lib/api/services";
import useModalRegistry from "../modal-registry";
import { useState } from "react";
import { TextLoader } from "@/components/ui/loader";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";
import { RefreshCwIcon } from "lucide-react";

export const FollowUpFormModal = ({
  formProcessId,
}: {
  formProcessId: string;
}) => {
  const modalRegistry = useModalRegistry();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col w-full gap-3 mt-2 text-sm text-gray-600 leading-relaxed text-justify">
      This will resend an email to the latest signatory.
      <span className="text-destructive font-semibold">
        Only do this if you are sure they have not recieved it, or enough time
        has passed since the last follow-up.
      </span>
      <div className="flex flex-row gap-2 self-end">
        <Button
          disabled={loading}
          variant="outline"
          onClick={() => modalRegistry.followUpFormRequest.close()}
        >
          <TextLoader loading={loading}>Close</TextLoader>
        </Button>
        <Button
          disabled={loading}
          scheme="primary"
          onClick={() => {
            setLoading(true);
            void FormService.resendForm(formProcessId)
              .then((r) => {
                if (r.success) {
                  toast.success(
                    "Successfully Resent Form",
                    toastPresets.success,
                  );

                  modalRegistry.followUpFormRequest.close();
                } else {
                  toast.error(
                    "Could not resend form: " + r.message,
                    toastPresets.destructive,
                  );
                }
              })
              .then(() => setLoading(false))
              .catch(
                (e) => (
                  toast.error(e, toastPresets.destructive),
                  setLoading(false)
                ),
              );
          }}
        >
          <RefreshCwIcon />
          <TextLoader loading={loading}>Send Follow-Up Email</TextLoader>
        </Button>
      </div>
    </div>
  );
};
