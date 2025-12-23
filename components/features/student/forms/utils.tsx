/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-12-23 20:41:54
 * @ Modified time: 2025-12-23 20:52:43
 * @ Description:
 *
 * Move some of these utils to the core package maybe.
 */

import { coerceAnyDate } from "@/lib/utils";
import {
  ClientBlock,
  ClientField,
  ClientPhantomField,
} from "@betterinternship/core/forms";

/**
 * Filter blocks to be rendered by the form for a party.
 *
 * @param blocks
 * @param signingPartyId
 */
export const filterBlocks = (
  blocks: ClientBlock<[]>[],
  signingPartyId?: string,
) => {
  return blocks
    .filter((block) => block.signing_party_id === signingPartyId)
    .filter(
      (block) =>
        block.field_schema?.source === "manual" ||
        block.phantom_field_schema?.source === "manual",
    );
};

/**
 * Checks if a block is a field.
 *
 * @param block
 * @returns
 */
export const isBlockField = (block: ClientBlock<[]>) => {
  return !!block.field_schema || !!block.phantom_field_schema;
};

/**
 * Returns the field associated with a block.
 *
 * @param block
 * @returns
 */
export const getBlockField = (
  block: ClientBlock<[]>,
): ClientField<[]> | ClientPhantomField<[]> => {
  if (!isBlockField(block)) throw new Error("Block is not a field!");
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
export const coerceForField = (field: ClientField<[]>, value: unknown) => {
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
export function isEmptyFor(field: ClientField<[]>, value: unknown) {
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
}
