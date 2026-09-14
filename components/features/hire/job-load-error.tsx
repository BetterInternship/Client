import { PageError } from "@/components/ui/error";

/**
 * Shared failure state for the three routes that load a single listing
 * through useJob — Applicants, Preview and Edit.
 *
 * A missing listing is a 404 rather than a fault, so it gets its own copy and
 * no Retry button (refetching a deleted row just fails again). The global app
 * header stays mounted either way, so there is still a way out.
 *
 * @component
 */
export const JobLoadError = ({
  error,
  notFound,
  onRetry,
}: {
  error?: Error | null;
  notFound?: boolean;
  onRetry?: () => void;
}) => {
  if (notFound)
    return (
      <PageError
        title="Listing not found"
        description="It may have been deleted, or it belongs to another account. Head back to your dashboard to pick another listing."
      />
    );

  return (
    <PageError
      title="Couldn't load this listing"
      description={error?.message || "Something went wrong. Please try again."}
      onRetry={onRetry}
    />
  );
};
