import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface Step {
  title?: string;
  subtitle?: string;
  hideNext?: true;
  nextLabel?: string;
  prevLabel?: string;
  canNext?: () => boolean;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ReactNode;
}

/**
 * Represents the header of the stepper.
 *
 * @param
 * @returns
 */
function StepperHeader({ step, steps }: { step: number; steps: Step[] }) {
  return (
    <div
      className={cn(
        // mobile: one per row
        "grid grid-cols-1 gap-2 sm:gap-3",
        // desktop+: each child becomes a column with equal width
        "md:grid-flow-col md:auto-cols-fr",
      )}
    >
      {steps.map((s, idx) => {
        const Icon = s.icon;
        const active = idx === step;
        const done = idx < step;

        return (
          <motion.div
            layout
            key={idx}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 rounded-[0.33em] border p-2.5 sm:p-3 min-w-0",
              active
                ? "border-primary/60 bg-primary/5"
                : done
                  ? "border-supportive/40 bg-supportive/5"
                  : "border-border/60",
            )}
            aria-current={active ? "step" : undefined}
          >
            <div
              className={cn(
                "flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full p-2 shrink-0 ",
                active ? "bg-primary/10" : "bg-gray-100",
              )}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-supportive" />
              ) : (
                <Icon
                  className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 border-none",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
              )}
            </div>

            <div className="text-xs sm:text-sm font-medium leading-tight min-w-0">
              <div className="text-[10px] sm:text-xs text-gray-400">
                Step {idx + 1}
              </div>
              <div className="truncate">{s.title ?? ""}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 *
 * @param param0
 * @returns
 */
export const Stepper = ({
  step,
  steps,
  onNext,
  onBack,
}: {
  step: number;
  steps: Step[];
  onNext?: (newStep: number) => void;
  onBack?: (newStep: number) => void;
}) => {
  const currentStep = steps[step];

  if (!currentStep) return <></>;

  return (
    <div className="w-full mx-auto">
      {step < steps.length && steps.length > 1 && (
        <StepperHeader step={step} steps={steps} />
      )}

      {step < steps.length && currentStep.subtitle && (
        <div className="mt-6 flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {currentStep.subtitle}
            </p>
          </div>
        </div>
      )}

      <div className="mt-3">{currentStep.component}</div>

      {step < steps.length && (
        <div className="mt-4 flex items-center justify-between">
          <div />
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                type="button"
                scheme="secondary"
                onClick={() => {
                  onBack?.(step - 1);
                }}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {currentStep.prevLabel ?? "Back"}
              </Button>
            )}
            {step < steps.length && !currentStep.hideNext && (
              <Button
                type="button"
                onClick={() => {
                  onNext?.(step + 1);
                }}
                disabled={!(currentStep.canNext?.() ?? true)}
              >
                {currentStep.nextLabel ?? "Next"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
