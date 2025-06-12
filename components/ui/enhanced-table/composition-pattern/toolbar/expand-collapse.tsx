import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useTableContext } from "../../table-context"

export function ExpandCollapse() {
  const { table } = useTableContext()

  return (
    <Button onClick={() => table.toggleAllRowsExpanded()}>
      {table.getIsAllRowsExpanded() ? (
        <>
          <ChevronUp className="mr-2 h-4 w-4" />
          Collapse All
        </>
      ) : (
        <>
          <ChevronDown className="mr-2 h-4 w-4" />
          Expand All
        </>
      )}
    </Button>
  )
}
