import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/features/student/forms/FieldRenderer";
import { getBlockField } from "@/components/features/student/forms/utils";
import { ClientBlock } from "@betterinternship/core/forms";
import { PublicUser } from "@/lib/db/db.types";

export const SpecifySigningPartiesModal = ({
  signingPartyBlocks,
  handleSubmit,
}: {
  signingPartyBlocks: ClientBlock<[PublicUser]>[];
  handleSubmit: () => void;
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
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
            value={values[field.field]}
            onChange={(value: string) =>
              setValues({ ...values, [field.field]: value })
            }
          ></FieldRenderer>
        );
      })}

      <Button className="mt-4 self-end" onClick={handleSubmit}>
        Sign and Send Form
      </Button>
    </div>
  );
};
