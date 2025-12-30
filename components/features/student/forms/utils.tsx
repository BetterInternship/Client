/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-12-23 20:41:54
 * @ Modified time: 2025-12-30 12:42:38
 * @ Description:
 *
 * Move some of these utils to the core package maybe.
 */

import { coerceAnyDate } from "@/lib/utils";
import {
  ClientBlock,
  ClientField,
  ClientPhantomField,
  FormValues,
} from "@betterinternship/core/forms";
import z from "zod";

/**
 * Checks if a block is a field.
 *
 * @param block
 * @returns
 */
export const isBlockField = <T extends any[]>(block: ClientBlock<T>) => {
  return !!block.field_schema || !!block.phantom_field_schema;
};

/**
 * Returns the field associated with a block.
 *
 * @param block
 * @returns
 */
export const getBlockField = <T extends any[]>(
  block: ClientBlock<T>,
): ClientField<T> | ClientPhantomField<T> | undefined => {
  if (!isBlockField(block)) {
    console.warn(
      "Block is not a field!",
      block.text_content ?? block.block_type,
    );
    return;
  }
  return block.field_schema ?? block.phantom_field_schema!;
};

/**
 * Coerces the value into the type needed by the field.
 * Useful, used outside zod schemas.
 * // ! move this probably into the formMetadata core package
 *
 * @param field
 * @param value
 * @returns
 */
export const coerceForField = <T extends any[]>(
  field: ClientField<T>,
  value: unknown,
) => {
  switch (field.type) {
    case "number":
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value == null ? "" : String(value);
    case "date":
      return coerceAnyDate(value);
    case "time":
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value == null ? "" : String(value);
    case "signature":
      return value === true;
    case "text":
    default:
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value == null ? "" : String(value);
  }
};

/**
 * Checks if field is empty, based on field type.
 *
 * @param field
 * @param value
 * @returns
 */
export const isEmptyFor = <T extends any[]>(
  field: ClientField<T>,
  value: unknown,
) => {
  switch (field.type) {
    case "date":
      return !(typeof value === "number" && value > 0); // 0/undefined = empty
    case "signature":
      return value !== true;
    case "number":
      return value === undefined || value === "";
    default:
      return value === undefined || value === "";
  }
};

/**
 * Validates a specific field, given the specified values.
 *
 * @param field
 * @param values
 * @param autofillValues
 * @returns
 */
export const validateField = <T extends any[]>(
  field: ClientField<T>,
  values: FormValues,
  autofillValues: FormValues,
) => {
  const finalValues = { ...values, ...autofillValues };
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

/**
 * Given a set of values, it seeds them with the autofill values provided.
 *
 * @param blocks
 * @param values
 * @param autofillValues
 * @returns
 */
export const seedValuesWithAutofill = <T extends any[]>(
  blocks: ClientBlock<T>[],
  values: FormValues,
  autofillValues: FormValues,
) => {
  // Initialize with values dict
  const seededValues = { ...values };

  // Iterate over the blocks we have
  for (const block of blocks) {
    if (!isBlockField(block)) continue;
    const field = getBlockField(block)!;
    const autofillValue = autofillValues[field.field];

    // Don't autofill if not empty or if nothing to autofill
    if (autofillValue === undefined) continue;
    if (!isEmptyFor(field, values[field.field])) continue;

    // Coerce autofill before putting it in
    const coercedAutofillValue = coerceForField(field, autofillValue);
    if (coercedAutofillValue !== undefined)
      seededValues[field.field] = coercedAutofillValue.toString();
  }

  return seededValues;
};
