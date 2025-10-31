"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Props = {
  formKey: string;
  handleSubmit: (withEsign?: boolean) => Promise<void> | void;
  busy?: boolean;
  disabled?: boolean;
};

export function GenerateButtons({
  formKey,
  handleSubmit,
  busy = false,
  disabled,
}: Props) {
  const withEsignLabel = "Generate & Initiate E-sign";
  const withoutEsignLabel = "Generate Form (no e-sign)";

  const withEsignLoading = "Requesting e-sign...";
  const withoutEsignLoading = "Generating...";
  const isDisabled = disabled ?? busy;

  const onWithoutEsignClick = () => void handleSubmit(false);
  const onWithEsignClick = () => void handleSubmit(true);

  return (
    <div className="pt-2 flex justify-end gap-2 flex-wrap">
      {/* Secondary: WITHOUT e-sign */}
      <Button
        onClick={onWithoutEsignClick}
        variant="outline"
        className="w-full sm:w-auto"
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

      {/* Primary: WITH e-sign */}
      <Button
        onClick={onWithEsignClick}
        className="w-full sm:w-auto"
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
    </div>
  );
}
