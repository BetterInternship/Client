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
      className={cn("border border-gray-400 rounded-[0.33em] p-6", className)}
    >
      {children}
    </div>
  );
};
