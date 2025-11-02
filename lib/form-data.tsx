/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-15 00:52:43
 * @ Modified time: 2025-10-31 18:13:19
 * @ Description:
 *
 * Form data utility so we don't pollute our components with too much logic.
 */

import { useState } from "react";

export interface IFormData {
  [field: string]: any;
}

export type IFormErrors<T extends IFormData> = {
  [K in keyof T]: string | null;
};

/**
 * The useFilter hook.
 * Check the returned interface for more info.
 *
 * @hook
 */
export const useFormData = <T extends IFormData>(initialValue?: Partial<T>) => {
  const [formData, setFormData] = useState<T>((initialValue as T) ?? ({} as T));

  // Sets and individual filter
  const setField = (field: keyof T, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Sets multiple fields at once
  const setFields = (partialValue: Partial<T>) => {
    setFormData({
      ...formData,
      ...partialValue,
    });
  };

  // Creates a function that sets the filter
  const fieldSetter = (field: keyof T) => (value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return {
    formData,
    setField,
    setFields,
    fieldSetter,
  };
};

/**
 * Good for dealing with form errors.
 *
 * @hook
 */
export const useFormErrors = <T extends IFormData>() => {
  const [formErrors, setFormErrors] = useState<IFormErrors<T>>(
    {} as IFormErrors<T>,
  );

  // Sets and individual filter
  const setError = (field: keyof T, value: string | null) => {
    setFormErrors({
      ...formErrors,
      [field]: value,
    });
  };

  // Sets multiple errors
  const setErrors = (partialErrors: Partial<IFormErrors<T>>) => {
    setFormErrors({
      ...formErrors,
      ...partialErrors,
    });
  };

  return {
    formErrors,
    setErrors,
    setError,
  };
};
