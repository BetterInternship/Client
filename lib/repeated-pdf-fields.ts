import type { IFormBlock } from "@betterinternship/core/forms";

type RepeatedPdfField = {
  count: number;
  offset_x?: number;
  offset_y?: number;
  start_index?: number;
  visible_count_field?: string;
};

type FieldWithRepeat = NonNullable<IFormBlock["field_schema"]> & {
  repeat?: RepeatedPdfField;
};

const getVisibleCount = (
  repeat: RepeatedPdfField,
  values: Record<string, string>,
) => {
  const capacity = Math.max(0, Math.floor(repeat.count));
  if (!repeat.visible_count_field) return capacity;

  const total = Number(values[repeat.visible_count_field]);
  if (!Number.isFinite(total)) return 0;
  return Math.max(
    0,
    Math.min(capacity, Math.floor(total) - (repeat.start_index ?? 0)),
  );
};

export function expandRepeatedPreviewBlocks(
  blocks: IFormBlock[],
  values: Record<string, string>,
): IFormBlock[] {
  return blocks.flatMap((block) => {
    const field = block.field_schema as FieldWithRepeat | undefined;
    const repeat = field?.repeat;
    if (!field || !repeat) return [block];

    const visibleCount = getVisibleCount(repeat, values);
    return Array.from({ length: visibleCount }, (_, index) => {
      const { repeat: _repeat, ...fieldWithoutRepeat } = field;
      return {
        ...block,
        _id: `${block._id}:repeat:${index}`,
        field_schema: {
          ...fieldWithoutRepeat,
          x: field.x + (repeat.offset_x ?? 0) * index,
          y: field.y + (repeat.offset_y ?? 0) * index,
        },
      };
    });
  });
}
