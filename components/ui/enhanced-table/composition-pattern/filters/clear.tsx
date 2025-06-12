import { Button } from "@/components/ui/button"
import { SearchX } from "lucide-react"
import { useTableContext } from "../../table-context"
import { useDialogs } from "./hooks/use-advanced-filter"

export function Clear() {
  const { table } = useTableContext()
  const { resetFilters } = useDialogs({ table })

  const isFiltered = table.getState().columnFilters.length > 0
  if (!isFiltered) return null

  return (
    <Button variant="outline" onClick={resetFilters}>
      <SearchX className="w-4 h-4 mr-2" />
      Reset
    </Button>
  )
}
