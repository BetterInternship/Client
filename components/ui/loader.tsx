import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * A reusable loader.
 *
 * @component
 */
export const Loader = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex w-full h-full items-center justify-center py-16">
      <div className="text-center animate-scale-in">
        <div
          className={cn(
            "animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto",
            children ? "mb-4" : "",
          )}
        ></div>
        {children}
      </div>
    </div>
  );
};

/**
 * Usable for buttons or other actions items that need a loading variant.
 *
 * @param param0
 * @returns
 */
export const TextLoader = ({
  children,
  loading,
}: {
  children?: React.ReactNode;
  loading: boolean;
}) => {
  return loading ? (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {children}
    </span>
  ) : (
    <>{children}</>
  );
};
