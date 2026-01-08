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
} from "@betterinternship/core/forms";
import { PublicUser } from "@/lib/db/db.types";
import { TextLoader } from "@/components/ui/loader";
import { IFormFiller } from "@/components/features/student/forms/form-filler.ctx";
import { useQueryClient } from "@tanstack/react-query";
import useModalRegistry from "../modal-registry";

export const SpecifySigningPartiesModal = ({
  fields,
  formFiller,
  autofillValues,
  signingPartyBlocks,
  handleSubmit,
  close,
}: {
  fields: (ClientField<[PublicUser]> | ClientPhantomField<[PublicUser]>)[];
  formFiller: IFormFiller;
  autofillValues?: FormValues;
  signingPartyBlocks: ClientBlock<[PublicUser]>[];
  handleSubmit: (
    signingPartyValues: FormValues,
  ) => Promise<{ success?: boolean; message?: string }>;
  close: () => void;
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
