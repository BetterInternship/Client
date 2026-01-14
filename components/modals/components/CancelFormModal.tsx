import useModalRegistry from "../modal-registry";
import { Button } from "@/components/ui/button";
import { FormService } from "@/lib/api/services";
import { useState } from "react";
import { TextLoader } from "@/components/ui/loader";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";

export const CancelFormModal = ({
  formProcessId,
}: {
  formProcessId: string;
}) => {
  const modalRegistry = useModalRegistry();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col w-full gap-5">
      This will cancel the current form request and stop any further responses.{" "}
      <br />
      <br />
      If you think you need to change some of the form details you submitted,
      you can cancel this form and submit a new one.
      <div className="flex flex-row gap-2 self-end">
        <Button
          scheme="secondary"
          disabled={loading}
          onClick={() => modalRegistry.cancelFormRequest.close()}
        >
          <TextLoader loading={loading}>Close</TextLoader>
        </Button>
        <Button
          disabled={loading}
          scheme="destructive"
          onClick={() => {
            setLoading(true);
            void FormService.cancelForm(formProcessId)
              .then((r) => {
                if (r.success) {
                  toast.success(
                    "Successfully Cancelled Form Request",
                    toastPresets.success,
                  );
                  modalRegistry.cancelFormRequest.close();
                } else {
                  toast.error(
                    "Could not cancel form request: " + r.message,
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
          <TextLoader loading={loading}>Cancel Request</TextLoader>
        </Button>
      </div>
    </div>
  );
};
