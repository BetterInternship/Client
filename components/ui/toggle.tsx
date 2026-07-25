import { cn } from "@/lib/utils";

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
        "relative flex h-4 w-7 items-center rounded-full transition-colors focus:ring-transparent z-30",
        state ? "bg-primary" : "bg-gray-300",
        loading ? "cursor-wait opacity-60" : "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "inline-block h-2 w-2 transform rounded-full bg-white transition-transform",
          state ? "translate-x-4" : "translate-x-1"
        )}
      />
    </button>
  );
};
