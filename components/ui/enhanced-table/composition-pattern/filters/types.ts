export type FilterType =
  | "contains"
  | "equals"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "between"
  | "dateEquals"
  | "dateBefore"
  | "dateAfter"
  | "dateBetween"

export interface ColumnFilter {
  id: string
  value: string | number | [string, string] | [number, number] | Date | [Date, Date]
  type: FilterType
}

export const filterTypes: { value: FilterType; label: string }[] = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "greaterThan", label: "Greater than" },
  { value: "lessThan", label: "Less than" },
  { value: "greaterThanOrEqual", label: "Greater than or equal to" },
  { value: "lessThanOrEqual", label: "Less than or equal to" },
  { value: "between", label: "Between" },
  { value: "dateEquals", label: "Date equals" },
  { value: "dateBefore", label: "Date before" },
  { value: "dateAfter", label: "Date after" },
  { value: "dateBetween", label: "Date between" },
]
