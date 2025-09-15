import {
  useFormData,
  IFormData,
  IFormErrors,
  useFormErrors,
} from "@/lib/form-data";
import { createContext, useContext, useRef } from "react";
import { Input } from "./ui/input";
import { GroupableRadioDropdown } from "./ui/dropdown";
import { Checkbox } from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

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
  () => EditFormContext<T>
] => {
  // Provides us with funcs to manipulate form
  const EditFormContext = createContext<EditFormContext<T>>(
    {} as EditFormContext<T>
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
    const validators = useRef<Function[]>([]);
    const errs = useRef<IFormErrors<T>>({} as IFormErrors<T>);

    // Validates a field; callback returns false when nothing is wrong.
    const addValidator = (
      field: keyof T,
      hasError: (value: any) => string | false
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
  setter?: (value: any) => void;
  required?: boolean;
  className?: string;
}

export const FormInput = ({
  label,
  value,
  setter,
  required = true,
  className,
  ...props
}: FormInputProps) => {
  return (
    <div>
      {label && (
        <label className="text-xs text-gray-400 italic mb-1 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Input
        value={value ?? ""}
        onChange={(e) => setter && setter(e.target.value)}
        className={className}
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
interface FormDropdownProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  options: { id: number | string; name: string }[];
  label?: string;
  value?: string | number;
  required?: boolean;
  setter?: (value: any) => void;
  className?: string;
}

export const FormDropdown = ({
  label,
  value,
  options,
  setter,
  required = true,
  className,
  ...props
}: FormDropdownProps) => {
  return (
    <div>
      {label && (
        <label className="text-xs text-gray-400 italic mb-1 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <GroupableRadioDropdown
        name={label ?? ""}
        defaultValue={value}
        options={options}
        onChange={(id) => setter && setter(id)}
      />
    </div>
  );
};

/**
 * A utility to create form dropdown fields easily.
 *
 * @component
 */
interface FormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  label?: string;
  setter?: (value: any) => void;
  className?: string;
}

export const FormCheckbox = ({
  label,
  checked,
  setter,
  className,
  ...props
}: FormCheckboxProps) => {
  return (
    <div>
      {label && (
        <label className="text-xs text-gray-400 italic mb-1 block">
          {label}
        </label>
      )}
      <Checkbox
        name={label ?? ""}
        checked={checked}
        className={cn(
          "flex flex-row items-center justify-center border rounded-[0.2em] w-4 h-4",
          checked
            ? "border-primary border-opacity-85 bg-blue-200"
            : "border-gray-300 bg-gray-50"
        )}
        onCheckedChange={(checked) => setter && setter(checked)}
      >
        {checked && <Check className="text-primary opacity-75" />}
      </Checkbox>
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
interface FormDatePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  date?: number;
  setter?: (value?: number) => void;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  contentClassName?: string;
  captionLayout?: "buttons" | "dropdown";

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
  ...props
}: FormDatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const selected = date != null ? new Date(date) : undefined;

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <label
          htmlFor={props.id ?? "date"}
          className="text-xs text-gray-400 italic mb-1 block"
        >
          {label}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={props.id ?? "date"}
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
          className={cn("w-auto overflow-hidden p-0", contentClassName)}
        >
          <Calendar
            mode="single"
            selected={selected}
            captionLayout={captionLayout}
            disabled={disabledDays as any}
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
