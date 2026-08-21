import { cn } from "@betterinternship/components";

/**
 * Looks like a small rectangular tag
 *
 * @component
 */
export const BasicRectangularTag = ({
  children,
  size = "sm",
  className,
}: {
  children: React.ReactNode;
  className?: string;
  size?: string;
}) => {
  return (
    <div
      className={cn(
        "flex-shrink-0 border rounded-md px-3 py-2 bg-white text-gray-600 whitespace-nowrap",
        "text-" + size,
        className,
      )}
    >
      {children}
    </div>
  );
};
