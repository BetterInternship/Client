import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/landingStudent/ui/select";
import {
  cn,
  Button,
  Checkbox,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  AnimatedCount,
} from "@betterinternship/components";
import { Calendar } from "@/components/ui/calendar";
import {
  IFormData,
  IFormErrors,
  useFormData,
  useFormErrors,
} from "@/lib/form-data";
import * as RadioGroup from "@radix-ui/react-radio-group";
import {
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircleQuestion,
  Minus,
} from "lucide-react";
import * as React from "react";
import { createContext, useContext, useEffect, useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { GroupableRadioDropdown } from "./ui/dropdown";
import { Input } from "@betterinternship/components";
import { Tooltip } from "react-tooltip";
import { Textarea } from "./ui/textarea";
import { Matcher } from "react-day-picker";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useBlurTransition } from "./animata/blur";

interface EditFormContext<T extends IFormData> {
  formData: T;
  formErrors: IFormErrors<T>;
  setField: (k: keyof T, v: any) => void;
  fieldSetter: (k: keyof T) => (v: any) => void;
  addValidator: (k: keyof T, c: (v: any) => string | false) => void;
  validateFormData: () => boolean;
  cleanFormData: () => T;
}

/**
 * Creates an edit form context and provider.
 *
 * @returns
 */
export const createEditForm = <T extends IFormData>(): [
  React.ComponentType<{
    data: Partial<T>;
    children: React.ReactNode;
  }>,
  () => EditFormContext<T>,
] => {
  // Provides us with funcs to manipulate form
  const EditFormContext = createContext<EditFormContext<T>>(
    {} as EditFormContext<T>,
  );

  // The use hook
  const useEditForm = () => useContext(EditFormContext);

  // Create the component
  const EditForm = ({
    data,
    children,
  }: {
    data: Partial<T>;
    children: React.ReactNode;
  }) => {
    const { formData, setField } = useFormData<T>(data);
    const { formErrors, setError, setErrors } = useFormErrors<T>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const validators = useRef<Function[]>([]);
    const errs = useRef<IFormErrors<T>>({} as IFormErrors<T>);

    // Validates a field; callback returns false when nothing is wrong.
    const addValidator = (
      field: keyof T,
      hasError: (value: any) => string | false,
    ) => {
      validators.current.push((data: T) => {
        const error = hasError(data[field]);
        if (typeof error === "boolean") {
          errs.current[field] = null;
          return false; // NO ERROR OCCURED
        } else errs.current[field] = error;
        return true; // AN ERROR OCCURED
      });
    };

    // Validates all fields with validators
    // Run map first to execute all validations
    // Returns true if good to go!
    const validateFormData = () => {
      errs.current = {} as IFormErrors<T>;
      const result = !validators.current
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        .map((validator) => validator(formData))
        .some((r) => r);
      setErrors(errs.current);
      return result;
    };

    // Cleans the data and providses undefined defaults
    const cleanFormData = () => {
      const result: { [k in keyof T]: any } = {} as T;
      for (const field in formData) {
        result[field] = formData[field] ?? undefined;
        if (typeof result[field] === "string")
          result[field] = result[field].trim();
      }
      return result;
    };

    return (
      <EditFormContext.Provider
        value={{
          formData,
          formErrors,
          setField: (k, v) => (setError(k, null), setField(k, v)),
          fieldSetter: (k) => (v) => (setError(k, null), setField(k, v)),
          addValidator,
          validateFormData,
          cleanFormData,
        }}
      >
        {children}
      </EditFormContext.Provider>
    );
  };

  return [EditForm, useEditForm];
};

/**
 * A utility to create form input fields easily.
 *
 * @component
 */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  setter?: (value: string) => void;
  required?: boolean;
  className?: string;
  tooltip?: string;
  tooltipId?: string;
  labelAddon?: React.ReactNode;
}

export function LabelWithTooltip({
  label,
  required,
  tooltip,
  tooltipId,
  labelAddon,
}: {
  label: React.ReactNode;
  required?: boolean;
  tooltip?: string | undefined;
  tooltipId?: string | undefined;
  labelAddon?: React.ReactNode;
}) {
  const id =
    tooltipId ??
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    `${label?.toString().replace(/\s+/g, "-").toLowerCase()}-tooltip`;
  return (
    <div className="mb-1 flex w-full justify-between gap-2 md:items-center">
      <div className="flex gap-2 md:items-center">
        <span className="text-xs text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        <div className="hover:cursor-help">
          <MessageCircleQuestion
            data-tooltip-id={id}
            data-tooltip-content={tooltip ?? ""}
            data-tooltip-place="bottom"
            className={cn(
              "text-primary h-3.5 w-3.5",
              tooltip?.trim() ? "" : "invisible",
            )}
          />
        </div>
      </div>
      {labelAddon && <div>{labelAddon}</div>}
      {tooltip && (
        <Tooltip
          id={id}
          positionStrategy="fixed"
          className="!max-w-[80vw] p-[0.05em] !text-[10px]"
          style={{ zIndex: 1400 }}
        />
      )}
    </div>
  );
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(
    {
      label,
      value,
      setter,
      required = true,
      className,
      tooltip,
      tooltipId,
      labelAddon,
      ...props
    },
    ref,
  ) {
    return (
      <div>
        {label && (
          <LabelWithTooltip
            label={label}
            required={required}
            tooltip={tooltip}
            tooltipId={tooltipId}
            labelAddon={labelAddon}
          />
        )}
        <Input
          ref={ref}
          value={value ?? ""}
          onChange={(e) => setter && setter(e.target.value)}
          className={cn(
            className,
            "placeholder:text-gray-400 placeholder:italic focus:placeholder:text-primary/70",
          )}
          {...props}
        />
      </div>
    );
  },
);

/**
 * Big input
 */
interface FormTextareaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  setter?: (value: string) => void;
  required?: boolean;
  className?: string;
  tooltip?: string;
  tooltipId?: string;
  labelAddon?: React.ReactNode;
}

export const FormTextarea = ({
  label,
  value,
  setter,
  required = true,
  className,
  tooltip,
  tooltipId,
  labelAddon,
  ...props
}: FormTextareaProps) => {
  return (
    <div>
      {label && (
        <LabelWithTooltip
          label={label}
          required={required}
          tooltip={tooltip}
          tooltipId={tooltipId}
          labelAddon={labelAddon}
        />
      )}
      <Textarea
        value={value ?? ""}
        onChange={(e) => setter && setter(e.target.value)}
        className={cn(
          className,
          "rounded-[0.33em] outline-none focus-visible:ring-0",
        )}
        {...props}
      />
    </div>
  );
};

/**
 * A utility to create form dropdown fields easily.
 *
 * @component
 */
interface FormDropdownProps extends React.InputHTMLAttributes<HTMLInputElement> {
  options: { id: number | string; name: string }[];
  label?: string;
  value?: string | number | string[];
  required?: boolean;
  setter?: (value: string | number) => void;
  className?: string;
  tooltip?: string;
  tooltipId?: string;
  labelAddon?: React.ReactNode;
}

export const FormDropdown = ({
  label,
  value,
  options,
  setter,
  required = true,
  className,
  tooltip,
  tooltipId,
  labelAddon,
  ...props
}: FormDropdownProps) => {
  return (
    <div>
      {label && (
        <LabelWithTooltip
          label={label}
          required={required}
          tooltip={tooltip}
          tooltipId={tooltipId}
          labelAddon={labelAddon}
        />
      )}
      <GroupableRadioDropdown
        name={label ?? ""}
        defaultValue={value}
        options={options}
        onChange={(id) => setter && setter(id)}
        className={className}
        {...(props as any)}
      />
    </div>
  );
};

/**
 * A utility to create form dropdown fields easily.
 *
 * @component
 */
interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  indeterminate?: boolean;
  label?: string;
  setter?: ((value: boolean) => void) | ((e: any, value: boolean) => void);
  className?: string;
  sentence?: React.ReactNode;
  required?: boolean;
  tooltip?: string;
  tooltipId?: string;
  labelAddon?: React.ReactNode;
}

export const FormCheckbox = ({
  label,
  checked,
  indeterminate,
  setter,
  className,
  sentence,
  required,
  tooltip,
  tooltipId,
  labelAddon,
  ...props
}: FormCheckboxProps) => {
  const blurTransition = useBlurTransition({
    scale: 0.5,
    blurPx: 2,
    duration: 0.15,
  });

  return (
    <div className={className}>
      {label && (
        <LabelWithTooltip
          label={label}
          required={required}
          tooltip={tooltip}
          tooltipId={tooltipId}
          labelAddon={labelAddon}
        />
      )}
      <div className="flex gap-2 sm:items-center">
        <Checkbox
          name={label ?? ""}
          checked={indeterminate ? "indeterminate" : checked}
          className={cn(
            "inline-flex items-center justify-center rounded-[0.33em] border aspect-square w-6 h-6 sm:w-5 sm:h-5",
            checked
              ? "border-primary border-opacity-85 bg-blue-200"
              : "border-gray-300 bg-gray-50",
          )}
          onCheckedChange={(checked) => setter && setter(!!checked)}
        >
          {indeterminate ? (
            <motion.div key="checkIcon" {...blurTransition}>
              <Minus className="text-primary opacity-75 h-4 w-4" />
            </motion.div>
          ) : checked ? (
            <AnimatePresence>
              <motion.div key="checkIcon" {...blurTransition}>
                <Check className="text-primary opacity-75 h-4 w-4" />
              </motion.div>
            </AnimatePresence>
          ) : null}
        </Checkbox>
        {sentence && (
          <div
            className="text-xs text-gray-500 cursor-pointer select-none"
            onClick={() => setter?.(!checked)}
            role="button"
          >
            {sentence}
          </div>
        )}
      </div>
    </div>
  );
};

interface FormCheckBoxGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  options: { value: string | number; label: string; description?: string }[];
  values: (string | number)[];
  setter: (values: (string | number)[]) => void;
  label?: string;
  required?: boolean;
  className?: string;
  tooltip?: string;
  tooltipId?: string;
  /** Multi-select hint shown above the options. Pass `null` to hide it. */
  hint?: React.ReactNode;
  /** Columns on md+ screens. Defaults to 3. */
  columns?: 1 | 2 | 3;
  /** Fired when a single option is toggled, before the setter runs. */
  onToggle?: (value: string | number, checked: boolean) => void;
}

const GRID_COLS: Record<1 | 2 | 3, string> = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

export const FormCheckBoxGroup = ({
  options,
  values,
  setter,
  label,
  required = false,
  className,
  tooltip,
  tooltipId,
  hint = "Select all that apply",
  columns = 3,
  onToggle,
  ...props
}: FormCheckBoxGroupProps) => {
  const handleValueChange = (optionValue: string | number) => {
    const willBeChecked = !values.includes(optionValue);
    onToggle?.(optionValue, willBeChecked);
    setter(
      willBeChecked
        ? [...values, optionValue]
        : values.filter((v) => v !== optionValue),
    );
  };

  const blurTransition = useBlurTransition();

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <LabelWithTooltip
          label={label}
          required={required}
          tooltip={tooltip}
          tooltipId={tooltipId}
        />
      )}

      {(hint || values.length > 0) && (
        <div className="flex items-center gap-2 text-xs">
          {hint && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
              <CheckCheck className="h-3 w-3" />
              {hint}
            </span>
          )}
          <AnimatePresence>
            {values.length > 0 && (
              <motion.span
                className="font-medium text-primary"
                {...blurTransition}
              >
                <AnimatedCount value={values.length} /> selected
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className={cn("grid grid-cols-1 gap-4", GRID_COLS[columns])}>
        {options.map((option) => {
          const isChecked = values.includes(option.value);

          return (
            <div
              key={option.value}
              role="checkbox"
              aria-checked={isChecked}
              onClick={() => handleValueChange(option.value)}
              className={cn(
                "flex items-start gap-3 p-3 border rounded-[0.33em] transition-colors cursor-pointer h-fit",
                isChecked
                  ? "border-primary border-opacity-85 bg-primary/5"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
              )}
            >
              <FormCheckbox checked={isChecked ?? false} />
              <div className="grid grid-rows-1 md:grid-rows-2">
                <Label className="text-xs font-medium text-gray-900">
                  {option.label}
                </Label>
                {option.description && (
                  <p className="text-xs text-gray-500">{option.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface FormRadioProps<T extends string | boolean = string> {
  options: { value: T; label: string }[];
  value?: T;
  setter?: (value: T) => void;
  label?: string;
  required?: boolean;
  className?: string;
  name?: string;
  tooltip?: string;
  tooltipId?: string;
}

export const FormRadio = <T extends string | boolean = string>({
  label,
  value,
  options,
  setter,
  required = false,
  className,
  tooltip,
  tooltipId,
  name,
}: FormRadioProps<T>) => {
  const stringValue = value?.toString() || "";

  const handleValueChange = (stringValue: string) => {
    if (!setter) return;

    // Find the original option to get the correct type
    const selectedOption = options.find(
      (option) => option.value.toString() === stringValue,
    );
    if (selectedOption) {
      setter(selectedOption.value);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <LabelWithTooltip
          label={label}
          required={required}
          tooltip={tooltip}
          tooltipId={tooltipId}
        />
      )}

      <RadioGroup.Root
        value={stringValue}
        onValueChange={handleValueChange}
        className="space-y-2"
        name={name}
      >
        {options.map((option) => (
          <div
            key={option.value.toString()}
            className="flex items-center space-x-3"
          >
            <RadioGroup.Item
              value={option.value.toString()}
              id={`${name}-${option.value.toString()}`}
              className={cn(
                "w-4 h-4 rounded-full border-2 border-gray-300",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
                "transition-colors duration-200",
              )}
            >
              <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative">
                <div className="w-2 h-2 rounded-full bg-white" />
              </RadioGroup.Indicator>
            </RadioGroup.Item>

            <label
              htmlFor={`${name}-${option.value.toString()}`}
              className="text-sm font-medium cursor-pointer flex-1"
            >
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroup.Root>
    </div>
  );
};

/**
 * Datepicker.
 *
 * @component
 */
/**
 * Datepicker (shadcn).
 *
 * Accepts/returns a number timestamp (ms) via `date` / `setter`.
 */
interface FormDatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  date?: number;
  setter?: (value?: number) => void;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  contentClassName?: string;
  captionLayout?: "buttons" | "dropdown";
  required?: boolean;
  tooltip?: string;
  tooltipId?: string;
  labelAddon?: React.ReactNode;

  /** Optional: disable dates (react-day-picker style) */
  disabledDays?:
    | Date
    | { before?: Date; after?: Date; from?: Date; to?: Date }
    | Date[];

  /** Close popover automatically on select (default true) */
  autoClose?: boolean;

  /** Placeholder text when no date selected */
  placeholder?: string;

  /** Format the button text */
  format?: (d: Date) => string;
}

export const FormDatePicker = ({
  label,
  date,
  setter,
  className,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  contentClassName,
  captionLayout = "dropdown",
  disabledDays,
  autoClose = true,
  placeholder = "Select date",
  format = (d) => d.toLocaleDateString(),
  required = false,
  tooltip,
  tooltipId,
  labelAddon,
  ...props
}: FormDatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const selected = date != null && date > 86400000 ? new Date(date) : undefined;

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <LabelWithTooltip
          label={label}
          required={required}
          tooltip={tooltip}
          tooltipId={tooltipId}
          labelAddon={labelAddon}
        />
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={props.id ?? "date"}
            className="justify-between font-normal"
          >
            {selected ? format(selected) : placeholder}
            <CalendarDays className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          side={side}
          sideOffset={sideOffset}
          className={cn("w-auto overflow-hidden p-0", contentClassName)}
        >
          <Calendar
            mode="single"
            selected={selected}
            captionLayout={captionLayout}
            disabled={disabledDays as Matcher[]}
            onSelect={(d) => {
              setter?.(d ? d.getTime() : undefined);
              if (autoClose) setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface FormDateMultiPickerProps {
  label?: string;
  dates?: number[];
  setter?: (value: number[]) => void;
  className?: string;
  contentClassName?: string;
  required?: boolean;
  tooltip?: string;
  labelAddon?: React.ReactNode;
}

export const FormDateMultiPicker = ({
  label,
  dates = [],
  setter,
  className,
  contentClassName,
  required = false,
  tooltip,
  labelAddon,
}: FormDateMultiPickerProps) => {
  const [open, setOpen] = React.useState(false);
  const selected = dates
    .filter((value) => Number.isFinite(value))
    .map((value) => {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).formatToParts(new Date(value));
      const get = (type: string) =>
        Number(parts.find((part) => part.type === type)?.value);
      return new Date(get("year"), get("month") - 1, get("day"));
    });
  const toManilaTimestamp = (date: Date) =>
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
    8 * 60 * 60 * 1000;

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <LabelWithTooltip
          label={label}
          required={required}
          tooltip={tooltip}
          labelAddon={labelAddon}
        />
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-h-9 justify-between font-normal"
          >
            {selected.length
              ? `${selected.length} date${selected.length === 1 ? "" : "s"} selected`
              : "Select dates"}
            <CalendarDays className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className={cn("w-auto overflow-hidden p-0", contentClassName)}
        >
          <Calendar
            mode="multiple"
            selected={selected}
            onSelect={(next) =>
              setter?.(
                (next ?? []).map(toManilaTimestamp).sort((a, b) => a - b),
              )
            }
          />
          <div className="text-muted-foreground border-t px-3 py-2 text-xs">
            Select scheduled dates to remove from the table.
          </div>
        </PopoverContent>
      </Popover>
      {!!selected.length && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((date) => (
            <Button
              key={date.getTime()}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() =>
                setter?.(
                  selected
                    .filter(
                      (selectedDate) =>
                        selectedDate.getTime() !== date.getTime(),
                    )
                    .map(toManilaTimestamp),
                )
              }
            >
              {date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              <X className="h-3 w-3" />
              <span className="sr-only">
                Remove {date.toLocaleDateString()}
              </span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Month picker.
 *
 * @component
 */
/**
 * Datepicker (shadcn).
 *
 * Accepts/returns a number timestamp (ms) via `date` / `setter`.
 */
interface FormMonthPickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** ms since epoch; will be normalized to the first day of the month */
  date?: number;
  /** setter receives ms since epoch (first day of month at local midnight) or undefined when cleared */
  setter?: (value?: number) => void;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  contentClassName?: string;
  tooltip?: string;
  tooltipId?: string;
  required?: boolean;

  /** Placeholder text when no month selected */
  placeholder?: string;

  /** Format the button text */
  format?: (d: Date) => string;

  /** Year bounds for navigation (inclusive) */
  fromYear?: number;
  toYear?: number;

  /** Close popover automatically on select (default true) */
  autoClose?: boolean;
}

export const FormMonthPicker = ({
  label,
  date,
  setter,
  className,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  contentClassName,
  placeholder = "Select month",
  format = (d) =>
    d.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
  fromYear = new Date().getFullYear() - 5,
  toYear = new Date().getFullYear() + 5,
  autoClose = true,
  tooltip,
  tooltipId,
  required = false,
  ...props
}: FormMonthPickerProps) => {
  const [open, setOpen] = React.useState(false);

  // normalize incoming ms -> first day of month
  const selected = React.useMemo(() => {
    if (date == null) return undefined;
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  }, [date]);

  const [viewYear, setViewYear] = React.useState<number>(
    selected?.getFullYear() ?? new Date().getFullYear(),
  );

  React.useEffect(() => {
    if (selected) setViewYear(selected.getFullYear());
  }, [selected]);

  const months = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) => ({
        m,
        label: new Date(2000, m, 1).toLocaleString(undefined, {
          month: "short",
        }),
      })),
    [],
  );

  const clampYear = (y: number) => Math.min(Math.max(y, fromYear), toYear);

  const selectMonth = (monthIndex: number) => {
    const y = clampYear(viewYear);
    const firstOfMonth = new Date(y, monthIndex, 1, 0, 0, 0, 0).getTime();
    setter?.(firstOfMonth);
    if (autoClose) setOpen(false);
  };

  const prevYear = () => setViewYear((y) => clampYear(y - 1));
  const nextYear = () => setViewYear((y) => clampYear(y + 1));

  const isYearMin = viewYear <= fromYear;
  const isYearMax = viewYear >= toYear;

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <LabelWithTooltip
          label={label}
          required={required}
          tooltip={tooltip}
          tooltipId={tooltipId}
        />
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={props.id ?? "month"}
            className="justify-between font-normal"
          >
            {selected ? format(selected) : placeholder}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          side={side}
          sideOffset={sideOffset}
          className={cn("w-72 p-3", contentClassName)}
        >
          {/* Header: year controls */}
          <div className="mb-3 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={prevYear}
              disabled={isYearMin}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Select
              value={String(viewYear)}
              onValueChange={(val) => setViewYear(clampYear(Number(val)))}
            >
              <SelectTrigger className="w-fit text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="h-fit">
                {Array.from(
                  { length: toYear - fromYear + 1 },
                  (_, i) => fromYear + i,
                ).map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={nextYear}
              disabled={isYearMax}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map(({ m, label }) => {
              const isActive =
                selected &&
                selected.getFullYear() === viewYear &&
                selected.getMonth() === m;

              return (
                <Button
                  key={m}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "h-9 justify-center rounded-[0.33em]",
                    isActive ? "" : "bg-background",
                  )}
                  onClick={() => selectMonth(m)}
                >
                  <span className="text-sm">{label}</span>
                </Button>
              );
            })}
          </div>

          {/* Clear (optional) */}
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              className="h-8 px-2 text-xs"
              onClick={() => {
                setter?.(undefined);
                setOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export function TimeInputNative({
  label,
  value, // "HH:MM"
  onChange, // (next?: string) => void
  required = true,
  helper,
  className,
  tooltip,
  tooltipId,
  labelAddon,
  ...props
}: {
  label: string;
  value?: string;
  onChange?: (v?: string) => void;
  required?: boolean;
  helper?: string;
  className?: string;
  tooltip?: string;
  tooltipId?: string;
  labelAddon?: React.ReactNode;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  return (
    <div className={className}>
      {label && (
        <LabelWithTooltip
          label={label}
          required={required}
          tooltip={tooltip}
          tooltipId={tooltipId}
          labelAddon={labelAddon}
        />
      )}
      <Input
        type="time"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value || undefined)}
        // step controls minute granularity; 300 = 5 min
        step={300}
        {...props}
      />
      {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  );
}
