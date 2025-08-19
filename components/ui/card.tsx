import { cn } from "@/lib/utils";

export const Card = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "p-[1.5em] border rounded-[0.33em] transition-colors bg-white border-gray-300",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
Card.displayName = "Card";
