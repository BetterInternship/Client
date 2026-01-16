import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/features/student/forms/FieldRenderer";
import { getBlockField } from "@/components/features/student/forms/utils";
import {
  ClientBlock,
  ClientField,
  ClientPhantomField,
  FormErrors,
  FormValues,
  IFormSigningParty,
} from "@betterinternship/core/forms";
import { PublicUser } from "@/lib/db/db.types";
import { TextLoader } from "@/components/ui/loader";
import { IFormFiller } from "@/components/features/student/forms/form-filler.ctx";
import { useQueryClient } from "@tanstack/react-query";
import useModalRegistry from "../modal-registry";
import { CheckCircle, Divider } from "lucide-react";

export const SpecifySigningPartiesModal = ({
  fields,
  formFiller,
  autofillValues,
  signingPartyBlocks,
  handleSubmit,
  close,
  signingParties,
}: {
  fields: (ClientField<[PublicUser]> | ClientPhantomField<[PublicUser]>)[];
  formFiller: IFormFiller;
  autofillValues?: FormValues;
  signingPartyBlocks: ClientBlock<[PublicUser]>[];
  handleSubmit: (
    signingPartyValues: FormValues,
  ) => Promise<{ success?: boolean; message?: string }>;
  close: () => void;
  signingParties?: IFormSigningParty[];
}) => {
  const queryClient = useQueryClient();
  const modalRegistry = useModalRegistry();
  const [errors, setErrors] = useState<FormErrors>({});
  const [signingPartyValues, setSigningPartyValues] = useState<FormValues>({});
  const [busy, setBusy] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const handleClick = async () => {
    setBusy(true);

    // Derive stuff we need
    const signingPartyFields = signingPartyBlocks
      .map((block) => getBlockField(block))
      .filter((field) => !!field);
    const additionalValues = {
      ...autofillValues,
      ...signingPartyValues,
    };

    // Try to validate the emails
    const errors = formFiller.validate(
      [...fields, ...signingPartyFields],
      additionalValues,
    );
    setErrors(errors);

    if (Object.keys(errors).length) {
      setBusy(false);
      return;
    }

    const response = await handleSubmit(
      formFiller.getFinalValues(additionalValues),
    );

    if (!response.success) {
      setBusy(false);
      alert("Something went wrong, please try again.");
      console.error(response.message);
      return;
    }

    // Invalidate queries
    await queryClient.invalidateQueries({ queryKey: ["my-forms"] });
    setSubmitted(true);
    setBusy(false);
    close();
    modalRegistry.formSubmissionSuccess.open("esign");
  };

  return (
    <div className="flex flex-col space-y-2 max-w-prose min-w-[100%]">
      <div className="py-4 text-warning text-sm">
        This form also requires the signature of other parties. <br />
        Specify their emails below so we can send them this form on your behalf.
      </div>

      {signingPartyBlocks.map((block) => {
        const field = getBlockField(block);
        if (!field) return <></>;
        return (
          <FieldRenderer
            field={field}
            value={signingPartyValues[field.field]}
            error={errors[field.field]}
            onChange={(value: string) =>
              setSigningPartyValues({
                ...signingPartyValues,
                [field.field]: value,
              })
            }
          ></FieldRenderer>
        );
      })}

      {/* Process Story */}
      <div className="mt-4 py-4 border-t border-b border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-3">
          Signing order
        </div>
        <div className="space-y-3">
          {signingParties?.map((party, index) => {
            // Find the source party's title if signatory_source exists
            let sourceTitle = "";
            if (party.signatory_source?._id) {
              const sourceParty = signingParties?.find(
                (p) => p._id === party.signatory_source?._id,
              );
              sourceTitle = sourceParty?.signatory_title.trim() || "";
            }

            const displayTitle = party.signatory_title
              .trim()
              .includes("Student")
              ? `${party.signatory_title.trim()} (You)`
              : party.signatory_title.trim();

            const displaySourceTitle =
              sourceTitle && sourceTitle.includes("Student")
                ? `${sourceTitle} (You)`
                : sourceTitle;

            return (
              <div key={party._id} className="border-l-4 border-primary pl-3">
                <div className="text-xs font-medium text-gray-900">
                  <span className="text-gray-500 mr-1">
                    Signatory {party.order}:
                  </span>
                  {displayTitle}
                </div>
                {displaySourceTitle && (
                  <div className="text-xs text-gray-500">
                    email from{" "}
                    <span className="font-semibold">{displaySourceTitle}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>All signatures collected → Form complete</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2 self-end">
        {!busy && !submitted && (
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
        )}
        <Button disabled={busy} onClick={() => void handleClick()}>
          <TextLoader loading={busy}>Sign and send form</TextLoader>
        </Button>
      </div>
    </div>
  );
};
