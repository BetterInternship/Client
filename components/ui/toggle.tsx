import { cn } from "@betterinternship/components";

export const Toggle = ({
  state,
  onClick,
  loading,
}: {
  state: boolean | null | undefined;
  onClick: () => void;
  loading?: boolean;
}) => {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation();
        if (loading) return;
        onClick();
      }}
      className={cn(
        "relative z-30 flex h-5 w-9 items-center rounded-full transition-colors focus:ring-transparent",
        state ? "bg-primary" : "bg-gray-300",
        loading ? "cursor-wait opacity-60" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
          state ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
};
