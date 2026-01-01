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

  const getFinalValues = (autofillValues?: FormValues) => {
    return { ...autofillValues, ...values };
  };

  const setValue = (field: string, value: any) => {
    // Convert all values to strings for consistency
    const stringValue = value === null || value === undefined ? "" : String(value);
    _setValues({ ...values, [field]: stringValue });
  };

  const setValues = (newValues: Record<string, any>) => {
    // Convert all values to strings for consistency
    const stringifiedValues = Object.entries(newValues).reduce(
      (acc, [key, val]) => {
        acc[key] = val === null || val === undefined ? "" : String(val);
        return acc;
      },
      {} as Record<string, string>
    );
    _setValues({ ...values, ...stringifiedValues });
  };

  const validate = (
    fields: (ClientField<[PublicUser]> | ClientPhantomField<[PublicUser]>)[],
    autofillValues?: FormValues,
  ) => {
    const errors: Record<string, string> = {};
    for (const field of fields) {
      const error = validateField(field, values, autofillValues ?? {});
      console.log("err", error, field);
      if (error) errors[field.field] = error;
    }

    // If any errors, disallow proceed
    _setErrors(errors);
    return errors;
  };

  return (
    <FormFillerContext.Provider
      value={{
        getFinalValues,
        setValue,
        setValues,

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
 * @param field
 * @param values
 * @param autofillValues
 * @returns
 */
const validateField = <T extends any[]>(
  field: ClientField<T>,
  values: FormValues,
  autofillValues: FormValues,
) => {
  const finalValues = { ...autofillValues, ...values };
  if (field.signing_party_id !== "initiator" || field.source !== "manual")
    return;

  const value = finalValues[field.field];
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
