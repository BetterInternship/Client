export function isSpecialId(id: any) {
  return ["select", "expand", "select-expand", "reorder"].includes(id)
}

export function getAlignment(alignment: string | undefined) {
  switch (alignment) {
    case "left":
      return "text-start"
    case "center":
      return "text-center"
    case "right":
      return "text-end"
    default:
      return ""
  }
}
