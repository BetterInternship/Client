import { cn } from "@/lib/utils";

export const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn("border border-gray-200 rounded-[0.33em] p-4", className)}
    >
      {children}
    </div>
  );
};
