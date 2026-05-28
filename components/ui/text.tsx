import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const HeaderText = ({ children }: { children: ReactNode }) => {
  return <h1 className="text-4xl font-bold tracking-tight">{children}</h1>;
};

export const HeaderIcon = (props: {
  className?: string;
  icon: ComponentType<{ className: string }>;
}) => {
  return (
    <div
      className={cn(
        "w-8 h-8 bg-primary rounded-[0.25em] flex items-center justify-center flex-shrink-0",
        props.className ?? "",
      )}
    >
      <props.icon className="w-4 h-4 text-white" />
    </div>
  );
};

export const HeaderTitle = ({
  children,
  className,
  icon: Icon,
  iconClassName,
  ...props
}: ComponentPropsWithoutRef<"div"> & {
  icon: ComponentType<{ className: string }>;
  iconClassName?: string;
}) => {
  return (
    <div
      className={cn("flex flex-row items-start gap-3 mb-2", className)}
      {...props}
    >
      <HeaderIcon icon={Icon} className={cn("mt-1", iconClassName)} />
      <HeaderText>{children}</HeaderText>
    </div>
  );
};
