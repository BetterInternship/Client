export type PreviewFieldType = "text" | "signature" | "image";

export interface PreviewField {
  id: string;
  field: string;
  label: string;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  size?: number;
  wrap?: boolean;
  align_h?: "left" | "center" | "right";
  align_v?: "top" | "middle" | "bottom";
  font?: string;
  type?: PreviewFieldType;
  signing_party_id?: string;
  source?: string;
  prefiller?: unknown;
}

// Incoming student preview payload shape.
export type PreviewFieldInput = {
  _id?: string;
  id?: string;
  field: string;
  label?: string;
  page?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  size?: number;
  wrap?: boolean;
  align_h?: "left" | "center" | "right";
  align_v?: "top" | "middle" | "bottom";
  font?: string;
  type?: PreviewFieldType;
  signing_party_id?: string;
  source?: string;
  prefiller?: unknown;
};

export function toPreviewFields(inputs: PreviewFieldInput[]): PreviewField[] {
  return (inputs ?? [])
    .filter((input) => input?.field && input.type !== "image")
    .map((input, idx) => {
      const page = typeof input.page === "number" ? input.page : 1;
      const x = typeof input.x === "number" ? input.x : 0;
      const y = typeof input.y === "number" ? input.y : 0;
      const w = typeof input.w === "number" ? input.w : 0;
      const h = typeof input.h === "number" ? input.h : 0;
      const id =
        (typeof input.id === "string" && input.id) ||
        (typeof input._id === "string" && input._id) ||
        `${input.field}:${page}:${x}:${y}:${idx}`;

      return {
        id,
        field: input.field,
        label: input.label || input.field,
        page,
        x,
        y,
        w,
        h,
        size: input.size,
        wrap: input.wrap,
        align_h: input.align_h,
        align_v: input.align_v,
        font: input.font,
        type: input.type,
        signing_party_id: input.signing_party_id,
        source: input.source,
        prefiller: input.prefiller,
      };
    });
}

export function groupFieldsByPage(fields: PreviewField[]) {
  const byPage = new Map<number, PreviewField[]>();

  for (const field of fields) {
    const list = byPage.get(field.page) || [];
    list.push(field);
    byPage.set(field.page, list);
  }

  return byPage;
}
type PreviewRefRecord = { name?: string } | null;

export interface PreviewValueRefs {
  get_college?: (id: string | null | undefined) => PreviewRefRecord;
  get_department?: (id: string | null | undefined) => PreviewRefRecord;
  get_university?: (id: string | null | undefined) => PreviewRefRecord;
  to_college_name?: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  to_department_name?: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  to_university_name?: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
}

export const normalizePreviewFieldKey = (fieldKey: string): string =>
  String(fieldKey ?? "")
    .trim()
    .replace(/:default$/i, "");

export const resolveAutoPreviewValue = (
  fieldKey: string,
  now = new Date(),
): string => {
  const normalized = normalizePreviewFieldKey(fieldKey).toLowerCase();
  if (normalized === "auto.current-date") return now.getTime().toString();
  if (normalized === "auto.current-day") return now.getDate().toString();
  if (normalized === "auto.current-month")
    return (now.getMonth() + 1).toString();
  if (normalized === "auto.current-year") return now.getFullYear().toString();
  return "";
};

export const createPreviewDisplayValueResolver = ({
  refs,
  user,
  nowFactory = () => new Date(),
}: {
  refs: PreviewValueRefs;
  user: Record<string, unknown> | null | undefined;
  nowFactory?: () => Date;
}) => {
  const getUserString = (key: string): string => {
    const value = user?.[key];
    return value == null ? "" : String(value).trim();
  };

  const resolvePrefillValue = (field: PreviewField): string => {
    if (!user) return "";

    const firstName = getUserString("first_name");
    const middleName = getUserString("middle_name");
    const lastName = getUserString("last_name");
    const fullName = [firstName, middleName, lastName]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    const normalizedField = normalizePreviewFieldKey(field.field).toLowerCase();
    const directMap: Record<string, string> = {
      "student.school": getUserString("college"),
      "student.college": getUserString("college"),
      "student.department": getUserString("department"),
      "student.university": getUserString("university"),
      "student.first-name": firstName,
      "student.middle-name": middleName,
      "student.last-name": lastName,
      "student.full-name": fullName,
      "student-signature": fullName,
      "student.phone-number": getUserString("phone_number"),
      "student.email": getUserString("email"),
    };
    const mapped = directMap[normalizedField];
    if (mapped) return mapped;

    if (typeof field.prefiller === "function") {
      try {
        const prefiller = field.prefiller as (params: {
          user: Record<string, unknown> | null | undefined;
        }) => unknown;
        const value = prefiller({ user });
        return value == null ? "" : String(value).trim();
      } catch {
        return "";
      }
    }

    if (typeof field.prefiller === "string") {
      const match = field.prefiller.match(/user\.([a-zA-Z0-9_]+)/);
      if (match?.[1]) return getUserString(match[1]);
    }

    return "";
  };

  const resolveInitiatorFallbackValue = (field: PreviewField): string => {
    const owner = String(field.signing_party_id ?? "").toLowerCase();
    const isInitiatorOwned = owner === "initiator" || owner === "student";
    if (!isInitiatorOwned) return "";

    const source = String(field.source ?? "").toLowerCase();
    const normalizedField = normalizePreviewFieldKey(field.field).toLowerCase();
    const shouldUseAuto =
      source === "auto" || normalizedField.startsWith("auto.current-");
    const shouldUsePrefill =
      source === "prefill" ||
      normalizedField === "student.school" ||
      normalizedField === "student.college" ||
      normalizedField === "student.department" ||
      normalizedField === "student.university" ||
      normalizedField === "student.first-name" ||
      normalizedField === "student.middle-name" ||
      normalizedField === "student.last-name" ||
      normalizedField === "student.full-name" ||
      normalizedField === "student-signature" ||
      normalizedField === "student.phone-number" ||
      normalizedField === "student.email";

    if (shouldUseAuto)
      return resolveAutoPreviewValue(field.field, nowFactory());
    if (shouldUsePrefill) return resolvePrefillValue(field);
    return "";
  };

  const tryResolveRefName = (candidate: string): string | null => {
    const college = refs.get_college?.(candidate)?.name;
    if (college) return college;
    const department = refs.get_department?.(candidate)?.name;
    if (department) return department;
    const university = refs.get_university?.(candidate)?.name;
    if (university) return university;
    return null;
  };

  return (field: PreviewField, rawValue: unknown): string => {
    const rawString = Array.isArray(rawValue)
      ? rawValue.join(", ")
      : typeof rawValue === "string"
        ? rawValue
        : "";
    const fallbackValue = rawString.trim()
      ? ""
      : resolveInitiatorFallbackValue(field);
    const value = rawString || fallbackValue;
    if (!value) return "";

    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    const loweredFieldName = field.field.toLowerCase();
    if (
      loweredFieldName.includes("college") &&
      typeof refs.to_college_name === "function"
    ) {
      return refs.to_college_name(trimmedValue, trimmedValue) ?? trimmedValue;
    }
    if (
      loweredFieldName.includes("department") &&
      typeof refs.to_department_name === "function"
    ) {
      return (
        refs.to_department_name(trimmedValue, trimmedValue) ?? trimmedValue
      );
    }
    if (
      loweredFieldName.includes("university") &&
      typeof refs.to_university_name === "function"
    ) {
      return (
        refs.to_university_name(trimmedValue, trimmedValue) ?? trimmedValue
      );
    }

    const directRefMatch = tryResolveRefName(trimmedValue);
    if (directRefMatch) return directRefMatch;

    return value;
  };
};

