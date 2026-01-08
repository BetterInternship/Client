import { Button } from "@/components/ui/button";
import { FormService } from "@/lib/api/services";
import useModalRegistry from "../modal-registry";
import { useState } from "react";
import { TextLoader } from "@/components/ui/loader";

export const ResendFormModal = ({
  formProcessId,
}: {
  formProcessId: string;
}) => {
  const modalRegistry = useModalRegistry();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col w-full gap-5">
      This will resend an email to the latest signatory. Only do this if you are
      sure they have not recevied it, or enough time has passed since the last
      follow-up.
      <div className="flex flex-row gap-2 self-end">
        <Button
          disabled={loading}
          scheme="secondary"
          onClick={() => modalRegistry.resendFormRequest.close()}
        >
          <TextLoader loading={loading}>Close</TextLoader>
        </Button>
        <Button
          disabled={loading}
          scheme="destructive"
          onClick={() => {
            setLoading(true);
            void FormService.resendForm(formProcessId)
              .then((r) => {
                if (r.success) {
                  alert("Successfully Resent Form");
                  modalRegistry.resendFormRequest.close();
                } else {
                  alert("Could not resend form: " + r.message);
                }
              })
              .then(() => setLoading(false))
              .catch((e) => (alert(e), setLoading(false)));
          }}
        >
          <TextLoader loading={loading}>Resend Form</TextLoader>
        </Button>
      </div>
    </div>
  );
};
