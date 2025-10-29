/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-10-29 16:46:51
 * @ Modified time: 2025-10-29 16:50:09
 * @ Description:
 *
 * Field related helpers go here.
 */

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "date"
  | "time"
  | "signature"
  | "reference";

export type Section =
  | "student"
  | "entity"
  | "university"
  | "internship"
  | "student-guardian";

/**
 * Get section from field name
 * examples: "student.full-name:default" -> "student"
 *           "internship.hours:default" -> "internship"
 *
 * @param fieldName
 * @returns
 */
export const extractFieldSection = (fieldName: string): Section | undefined => {
  const clean = String(fieldName || "");
  const beforeColon = clean.split(":")[0] ?? clean;
  const first = beforeColon.split(".")[0] ?? beforeColon;
  const s = first.toLowerCase();
  if (
    s === "student" ||
    s === "entity" ||
    s === "university" ||
    s === "internship"
  ) {
    return s as Section;
  }
  return undefined;
};
