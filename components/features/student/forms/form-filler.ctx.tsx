import z from "zod";
import { createContext, useContext, useRef, useState } from "react";
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
    nextValue?: unknown,
  ) => void;

  errors: FormErrors;
  validate: (
    fields: (ClientField<[PublicUser]> | ClientPhantomField<[PublicUser]>)[],
    autofillValues?: FormValues,
  ) => FormErrors;
}

const FormFillerContext = createContext({} as IFormFiller);

export const useFormFiller = () => useContext(FormFillerContext);

export const FormFillerContextBridge = ({
  value,
  children,
}: {
  value: IFormFiller;
  children: React.ReactNode;
}) => {
  return (
    <FormFillerContext.Provider value={value}>
      {children}
    </FormFillerContext.Provider>
  );
};

export const FormFillerContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [, _setValues] = useState<Record<string, string>>({});
  const [errors, _setErrors] = useState<FormErrors>({});
  const valuesRef = useRef<Record<string, string>>({});

  const getFinalValues = (additionalValues?: FormValues) => {
    return { ...additionalValues, ...valuesRef.current };
  };

  const setValue = (field: string, value: any) => {
    // Convert all values to strings for consistency
    const stringValue =
      value === null || value === undefined ? "" : String(value);
    const next = { ...valuesRef.current, [field]: stringValue };
    valuesRef.current = next;
    _setValues(next);
    _setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
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
    const next = { ...valuesRef.current, ...stringifiedValues };
    valuesRef.current = next;
    _setValues(next);
  };

  const initializeValues = (defaultValues: Record<string, any>) => {
    // Initialize form with default values
    // Only set fields that don't already have user-entered values
    const prev = valuesRef.current;
    const stringifiedValues = Object.entries(defaultValues).reduce(
      (acc, [key, val]) => {
        const currentValue = prev[key];
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

    const next = { ...prev, ...stringifiedValues };
    valuesRef.current = next;
    _setValues(next);
  };
  const resetErrors = () => {
    _setErrors({});
  };
  const validate = (
    fields: (ClientField<[PublicUser]> | ClientPhantomField<[PublicUser]>)[],
    autofillValues?: FormValues,
  ) => {
    const errors: Record<string, string> = {};
    for (const field of fields) {
      const error = validateFieldHelper(
        field,
        valuesRef.current,
        autofillValues ?? {},
      );
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
    nextValue?: unknown,
  ) => {
    const valuesForValidation =
      nextValue === undefined
        ? valuesRef.current
        : {
            ...valuesRef.current,
            [fieldKey]:
              nextValue === null || nextValue === undefined
                ? ""
                : String(nextValue),
          };

    const error = validateFieldHelper(
      field,
      valuesForValidation,
      autofillValues ?? {},
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

const getFieldValue = (allValues: FormValues, fieldKey: string) => {
  const valuesRecord = allValues as Record<string, string | undefined>;

  if (Object.prototype.hasOwnProperty.call(allValues, fieldKey)) {
    return valuesRecord[fieldKey];
  }

  const defaultKey = `${fieldKey}:default`;
  if (Object.prototype.hasOwnProperty.call(allValues, defaultKey)) {
    return valuesRecord[defaultKey];
  }

  // if (fieldKey.endsWith(":default")) {
  //   const baseKey = fieldKey.slice(0, -8);
  //   if (Object.prototype.hasOwnProperty.call(allValues, baseKey)) {
  //     return valuesRecord[baseKey];
  //   }
  // }

  return undefined;
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
) => {
  const allValues = { ...autofillValues, ...values };
  if (field.signing_party_id !== "initiator" || field.source !== "manual")
    return;

  const value = getFieldValue(allValues, field.field);
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
