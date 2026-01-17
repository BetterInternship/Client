import z from "zod";
import { createContext, useContext, useState } from "react";
import { PublicUser } from "@/lib/db/db.types";

import {
  ClientField,
  ClientPhantomField,
  FormErrors,
  FormValues,
} from "@betterinternship/core/forms";

export interface IFormFiller {
  getFinalValues: (autofillValues?: FormValues) => FormValues;
  setValue: (field: string, value: any) => void;
  setValues: (values: Record<string, any>) => void;
  initializeValues: (defaultValues: Record<string, any>) => void;
  resetErrors: () => void;
  validateField: (
    fieldKey: string,
    field: ClientField<any> | ClientPhantomField<any>,
    autofillValues?: FormValues,
  ) => void;

  errors: FormErrors;
  validate: (
    fields: (ClientField<[PublicUser]> | ClientPhantomField<[PublicUser]>)[],
    autofillValues?: FormValues,
  ) => FormErrors;
}

const FormFillerContext = createContext({} as IFormFiller);

export const useFormFiller = () => useContext(FormFillerContext);

export const FormFillerContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [values, _setValues] = useState({});
  const [errors, _setErrors] = useState({});

  const getFinalValues = (additionalValues?: FormValues) => {
    return { ...additionalValues, ...values };
  };

  const setValue = (field: string, value: any) => {
    // Convert all values to strings for consistency
    const stringValue =
      value === null || value === undefined ? "" : String(value);
    _setValues({ ...values, [field]: stringValue });
  };

  const setValues = (newValues: Record<string, any>) => {
    // Convert all values to strings for consistency
    const stringifiedValues = Object.entries(newValues).reduce(
      (acc, [key, val]) => {
        acc[key] = val === null || val === undefined ? "" : String(val);
        return acc;
      },
      {} as Record<string, string>,
    );
    _setValues({ ...values, ...stringifiedValues });
  };

  const initializeValues = (defaultValues: Record<string, any>) => {
    // Initialize form with default values
    // Only set fields that don't already have user-entered values
    const stringifiedValues = Object.entries(defaultValues).reduce(
      (acc, [key, val]) => {
        const currentValue = values[key];
        // Don't overwrite if user already has a value
        const hasExistingValue =
          currentValue !== null &&
          currentValue !== undefined &&
          String(currentValue).trim().length > 0;

        if (!hasExistingValue) {
          acc[key] = val === null || val === undefined ? "" : String(val);
        } else {
          // Keep existing user value
          acc[key] = currentValue;
        }
        return acc;
      },
      {} as Record<string, string>,
    );
    _setValues({ ...values, ...stringifiedValues });
  };
  const resetErrors = () => {
    _setErrors({});
  };
  const validate = (
    fields: (ClientField<[PublicUser]> | ClientPhantomField<[PublicUser]>)[],
    autofillValues?: FormValues,
  ) => {
    const finalValues = { ...autofillValues, ...values };
    const errors: Record<string, string> = {};
    for (const field of fields) {
      const error = validateFieldHelper(
        field,
        values,
        autofillValues ?? {},
        finalValues,
      );
      console.log("err", error, field);
      if (error) errors[field.field] = error;
    }

    // If any errors, disallow proceed
    _setErrors(errors);
    return errors;
  };

  const validateField = (
    fieldKey: string,
    field: ClientField<any> | ClientPhantomField<any>,
    autofillValues?: FormValues,
  ) => {
    _setValues((currentValues) => {
      const finalValues = { ...autofillValues, ...currentValues };
      const error = validateFieldHelper(
        field,
        currentValues,
        autofillValues ?? {},
        finalValues,
      );
      if (error) {
        _setErrors((prev) => ({ ...prev, [fieldKey]: error }));
      } else {
        _setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldKey];
          return newErrors;
        });
      }
      return currentValues;
    });
  };

  return (
    <FormFillerContext.Provider
      value={{
        getFinalValues,
        setValue,
        setValues,
        initializeValues,
        resetErrors,
        validateField,

        validate,
        errors,
      }}
    >
      {children}
    </FormFillerContext.Provider>
  );
};

/**
 * Validates a specific field, given the specified values.
 *
 * The validator was created with initial params. When validating cross-field validators,
 * ensure that validators reference field values via the params system.
 * The field params should be updated by the form context before validation.
 *
 * @param field
 * @param values
 * @param autofillValues
 * @param finalValues - All form values for context
 * @returns
 */
const validateFieldHelper = <T extends any[]>(
  field: ClientField<T>,
  values: FormValues,
  autofillValues: FormValues,
  finalValues?: FormValues,
) => {
  const allValues = finalValues || { ...autofillValues, ...values };
  if (field.signing_party_id !== "initiator" || field.source !== "manual")
    return;

  const value = allValues[field.field];
  const coerced = field.coerce(value);

  const result = field.validator?.safeParse(coerced);

  if (result?.error) {
    const errorString = z
      .treeifyError(result.error)
      .errors.map((e) => e.split(" ").slice(0).join(" "))
      .join("\n");
    return `${field.label}: ${errorString}`;
  }

  return null;
};
