import { cn } from "@/lib/utils";

export const Toggle = ({
  state,
  onClick,
}: {
  state: boolean | null | undefined;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "relative flex h-4 w-7 items-center rounded-full transition-colors focus:ring-transparent z-30",
        state ? "bg-primary" : "bg-gray-300"
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
