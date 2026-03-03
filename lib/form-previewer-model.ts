import { type IFormBlock } from "@betterinternship/core/forms";

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
  type?: PreviewFieldType;
  signing_party_id?: string;
}

export type PreviewFieldLike =
  | PreviewField
  | IFormBlock
  | {
      _id?: string;
      field?: string;
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
      type?: PreviewFieldType;
      signing_party_id?: string;
      field_schema?: {
        field?: string;
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
        type?: PreviewFieldType;
      };
      phantom_field_schema?: {
        field?: string;
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
        type?: PreviewFieldType;
      };
    };

function asFieldLike(input: PreviewFieldLike) {
  return input as {
    _id?: string;
    field?: string;
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
    type?: PreviewFieldType;
    signing_party_id?: string;
    field_schema?: {
      field?: string;
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
      type?: PreviewFieldType;
    };
    phantom_field_schema?: {
      field?: string;
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
      type?: PreviewFieldType;
    };
  };
}

export function normalizePreviewFields(
  inputs: PreviewFieldLike[],
): PreviewField[] {
  const normalized: PreviewField[] = [];

  for (const input of inputs) {
    const source = asFieldLike(input);
    const schema = source.field_schema ?? source.phantom_field_schema;

    const field = schema?.field ?? source.field;
    if (!field) continue;

    const type = schema?.type ?? source.type;
    if (type === "image") continue;

    const page = schema?.page ?? source.page ?? 1;
    const x = schema?.x ?? source.x ?? 0;
    const y = schema?.y ?? source.y ?? 0;
    const w = schema?.w ?? source.w ?? 0;
    const h = schema?.h ?? source.h ?? 0;

    normalized.push({
      id: source._id || `${field}:${page}:${x}:${y}:${normalized.length}`,
      field,
      label: schema?.label ?? source.label ?? field,
      page,
      x,
      y,
      w,
      h,
      size: schema?.size ?? source.size,
      wrap: schema?.wrap ?? source.wrap,
      align_h: schema?.align_h ?? source.align_h,
      align_v: schema?.align_v ?? source.align_v,
      type,
      signing_party_id: source.signing_party_id,
    });
  }

  return normalized;
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
