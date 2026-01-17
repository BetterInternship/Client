import { cn } from "@/lib/utils";
import React from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  preset?: "default" | "warning" | "success" | "info";
  showIcon?: boolean;
}

const presetStyles = {
  default: {
    container:
      "p-[1.5em] border rounded-[0.33em] transition-colors bg-white border-gray-300",
    icon: null,
    text: "",
  },
  warning: {
    container: "flex items-start gap-3 bg-warning px-4 py-3 rounded-[0.33em]",
    icon: (
      <AlertTriangle className="h-5 w-5 text-warning-foreground/90 flex-shrink-0 mt-0.5" />
    ),
    text: "text-sm text-warning-foreground/90 leading-relaxed",
  },
  success: {
    container:
      "flex items-start gap-3 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-[0.33em]",
    icon: (
      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
    ),
    text: "text-sm text-emerald-900 leading-relaxed",
  },
  info: {
    container:
      "flex items-start gap-3 bg-blue-50 border border-blue-200 px-4 py-3 rounded-[0.33em]",
    icon: <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />,
    text: "text-sm text-blue-900 leading-relaxed",
  },
};

export const Card = ({
  className,
  children,
  preset = "default",
  showIcon = true,
  ...props
}: CardProps) => {
  const style = presetStyles[preset];
  const hasIcon = preset !== "default" && showIcon;

  return (
    <div
      className={cn(style.container, !hasIcon && "gap-0", className)}
      {...props}
    >
      {hasIcon && style.icon}
      {preset !== "default" ? (
        <div className={style.text}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
};
Card.displayName = "Card";

// Backwards compatibility aliases
export const WarningCard = ({
  children,
  className,
  showIcon = true,
}: Omit<CardProps, "preset">) => (
  <Card preset="warning" showIcon={showIcon} className={className}>
    {children}
  </Card>
);
WarningCard.displayName = "WarningCard";

export const SuccessCard = ({
  children,
  className,
  showIcon = true,
}: Omit<CardProps, "preset">) => (
  <Card preset="success" showIcon={showIcon} className={className}>
    {children}
  </Card>
);
SuccessCard.displayName = "SuccessCard";

export const InfoCard = ({
  children,
  className,
  showIcon = true,
}: Omit<CardProps, "preset">) => (
  <Card preset="info" showIcon={showIcon} className={className}>
    {children}
  </Card>
);
InfoCard.displayName = "InfoCard";
