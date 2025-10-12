/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-17 21:37:03
 * @ Modified time: 2025-07-09 18:33:19
 * @ Description:
 *
 * Editable utils for forms and stuff
 */

import { cn } from "@/lib/utils";
import { Checkbox } from "@radix-ui/react-checkbox";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Check } from "lucide-react";
import React, { Children } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GroupableRadioDropdown } from "./dropdown";
import { Input } from "./input";
import { Label } from "./label";

type Value = string | null | undefined;

/**
 * A text display that can be toggled to become editable.
 *
 * @component
 */
export const EditableInput = ({
  is_editing,
  value,
  setter,
  placeholder,
  maxLength,
  children,
  className,
}: {
  is_editing: boolean;
  value: Value;
  setter: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  children?: React.ReactElement<{ value?: Value }>;
  className?: string;
}) => {
  return is_editing ? (
    <Input
      value={value ?? ""}
      onChange={(e) => setter(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={cn(
        " border-gray-200 ring-0 focus:ring-transparent text-sm relative z-10 pointer-events-auto",
        className
      )}
    />
  ) : (
    Children.map(children, (child) => {
      if (React.isValidElement(child))
        return React.cloneElement(child, { value });
      return <></>;
    })
  );
};

interface IDropdownOption<ID> {
  id: ID;
  name: string;
}

/**
 * A dropdown display that can be toggle to become editable.
 *
 * @component
 */
export const EditableGroupableRadioDropdown = <ID extends number | string>({
  is_editing,
  name,
  value,
  setter,
  options = [],
  children,
}: {
  is_editing: boolean;
  name: string;
  value: ID;
  setter: (value: ID) => void;
  options: IDropdownOption<ID>[];
  children?: React.ReactElement<{ value?: Value }>;
}) => {
  return is_editing ? (
    <GroupableRadioDropdown
      name={name}
      defaultValue={value}
      options={options}
      onChange={setter}
    ></GroupableRadioDropdown>
  ) : (
    Children.map(children, (child) => {
      if (React.isValidElement(child))
        return React.cloneElement(child, {
          value: options.filter((o) => o.id === value)[0]?.name,
        });
      return <></>;
    })
  );
};

export const EditableCheckbox = ({
  is_editing,
  value,
  setter,
  children,
}: {
  is_editing: boolean;
  value: boolean | null | undefined;
  setter: (value: string) => void;
  children?: React.ReactElement<{ value?: Value }>;
}) => {
  return is_editing ? (
    <div className="relative flex items-center space-x-2">
      <Checkbox
        checked={value ?? false}
        className={cn(
          "flex flex-row items-center justify-center border rounded-full w-5 h-5",
          value
            ? "border-blue-500 border-opacity-85 bg-blue-200"
            : "border-gray-300 bg-gray-50"
        )}
        // @ts-ignore
        onCheckedChange={(value) => setter(value)}
      >
        {value && <Check className="absolute w-3 h-3 text-blue-600"></Check>}
      </Checkbox>
    </div>
  ) : (
    <p className="text-gray-900 font-medium text-sm">
      {
        <span className="inline-flex items-center gap-2 text-green-700">
          {
            (Children.map(children, (child) => {
              if (React.isValidElement(child))
                return React.cloneElement(child, { value: value?.toString() });
              return <></>;
            }) ?? [<></>])[0]
          }
        </span>
      }
    </p>
  );
};

export const EditableCheckboxGroup = ({
  is_editing,
  values,
  setter,
  options,
  required = false,
  className,
  label,
} : {
  is_editing:boolean;
  options: { id: number | string; name: string;}[];
  values: (string | number)[];
  setter: (value: any) => void;
  required?: boolean;
  className?: string;
  label?: string;

}) => {
  const handleValueChange = (optionValue: string | number) => {
    console.log('checkbox changed:', optionValue, 'current values:', values);
    if (values.includes(optionValue)) {
      setter(values.filter(v => v !== optionValue));
    } else {
      setter([...values, optionValue]);
    }
  };

  return(
    <div className="space-y-3">
      {label && (
        <label className="text-lg tracking-tight font-medium text-gray-700 mb-1 block">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option) => {
          const isChecked = values.includes(option.id);
          
          return ( is_editing ? (
            <div
              key={option.id}
              onClick={() => handleValueChange(option.id)}
              className={`flex items-start gap-4 p-3 border rounded-[0.33em] transition-colors cursor-pointer h-fit
                ${isChecked ? 'border-primary border-opacity-85' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <EditableCheckbox
                is_editing = {true}
                value = {isChecked ?? false}
                setter = {() => {}}
              />
              <div className="grid grid-rows-1 md:grid-rows-2">
                <Label className="text-xs font-medium text-gray-900">
                  {option.name}
                </Label>
              </div>
            </div>) : (<></>)
          );
        })}
      </div>
    </div>
  );
};

export const EditableRadioSelect = <T extends string | boolean = string>({
  is_editing,
  label,
  value,
  options,
  setter,
  name,
  className,
  children
} : {
  is_editing: boolean;
  options: { id: number | string; name: string }[];
  value?: number | string;
  setter?: (value: any) => void;
  label?: string;
  name?: string;
  className?: string;
  children?: React.ReactElement<{ value?: Value }>;
}) => {
  const stringValue = value?.toString() || "";
  
    const handleValueChange = (stringValue: string) => {
      if (!setter) return;
      const selectedOption = options.find(option => option.id.toString() === stringValue);
      if (selectedOption) {
        setter(selectedOption.id);
      }
    };
  
    return ( is_editing ? (
      <div className={cn("space-y-3", className)}>
        {label && (
          <label className="text-xs text-gray-600 mb-1 block">
            {label}
          </label>
        )}
        
        <RadioGroup.Root
          value={stringValue}
          onValueChange={handleValueChange}
          className="space-y-2"
          name={name}
        >
          {options.map((option) => (
            <div key={option.id.toString()} className="flex items-center space-x-3">
              <RadioGroup.Item
                value={option.id.toString()}
                id={`${name}-${option.id.toString()}`}
                className={cn(
                  "w-4 h-4 rounded-full border-2 border-gray-300",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
                  "transition-colors duration-200"
                )}
              >
                <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </RadioGroup.Indicator>
              </RadioGroup.Item>
              
              <label 
                htmlFor={`${name}-${option.id.toString()}`}
                className="text-sm font-medium cursor-pointer flex-1"
              >
                {option.name}
              </label>
            </div>
          ))}
        </RadioGroup.Root>
      </div>) : (
            Children.map(children, (child) => {
          if (React.isValidElement(child))
            return React.cloneElement(child, { value: stringValue });
          return <></>;
        })
      )
    );
}

export const EditableDatePicker = ({
  is_editing,
  value,
  setter,
  children,
}: {
  is_editing: boolean;
  value: Date | null | undefined;
  setter: (value: number | null | undefined) => void;
  children?: React.ReactElement<{ value?: Value }>;
}) => {
  return is_editing ? (
    <div className="relative flex items-center space-x-2">
      <DatePicker
        id=""
        selected={value ? new Date(value) : new Date()}
        className="input-box"
        onChange={(date) => setter(date?.getTime())}
      ></DatePicker>
    </div>
  ) : (
    <p className="text-gray-900 font-medium text-sm">
      {
        <span className="inline-flex items-center gap-2 text-green-700">
          {
            (Children.map(children, (child) => {
              if (React.isValidElement(child))
                return React.cloneElement(child, {
                  value: value?.toLocaleDateString() ?? "",
                });
              return <></>;
            }) ?? [<></>])[0]
          }
        </span>
      }
    </p>
  );
};
