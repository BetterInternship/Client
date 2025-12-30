"use client";

import useModalRegistry from "@/components/modals/useModalRegistry";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormRendererContext } from "./form-renderer.ctx";

type Props = {
  handleSubmit: (withEsign?: boolean) => Promise<void> | void;
  busy?: boolean;
  noEsign?: boolean;
  disabled?: boolean;
};

export function FormActionButtons({
  handleSubmit,
  busy = false,
  noEsign,
  disabled,
}: Props) {
  const form = useFormRendererContext();
  const modalRegistry = useModalRegistry();
  const withEsignLabel = "Generate & Initiate E-sign";
  const withoutEsignLabel = !noEsign
    ? "Generate for Manual Signing"
    : "Generate Form";

  const withEsignLoading = "Requesting e-sign...";
  const withoutEsignLoading = "Generating...";
  const isDisabled = disabled ?? busy;

  const onWithoutEsignClick = () => void handleSubmit(false);
  const onWithEsignClick = () => void handleSubmit(true);

  return (
    <div className="pt-2 flex items-start justify-end gap-2">
      <Button
        onClick={noEsign ? onWithEsignClick : onWithoutEsignClick}
        variant={noEsign ? "default" : "outline"}
        className="w-full sm:w-auto text-xs"
        disabled={isDisabled}
        aria-busy={busy}
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {withoutEsignLoading}
          </span>
        ) : (
          withoutEsignLabel
        )}
      </Button>

      {!noEsign && (
        <Button
          onClick={() => {
            const signingPartyBlocks =
              form.formMetadata.getSigningPartyBlocks("initiator");
            if (signingPartyBlocks.length)
              modalRegistry.specifySigningParties.open(
                signingPartyBlocks,
                onWithEsignClick,
              );
            else onWithEsignClick();
          }}
          className="w-full sm:w-auto text-xs"
          disabled={isDisabled}
          aria-busy={busy}
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {withEsignLoading}
            </span>
          ) : (
            withEsignLabel
          )}
        </Button>
      )}
    </div>
  );
}
