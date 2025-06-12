"use client"

import { useTableContext } from "@/components/ui/enhanced-table/table-context"
import { Button } from "@/components/ui/button"
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger, Sheet as UiSheet } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { FileSpreadsheet } from "lucide-react"
import { useDialogs } from "../hooks/use-advanced-filter"
import { RenderFilters } from "../render-fields"

export function Sheet() {
  const { table } = useTableContext()
  const { filters, setFilters, applyFilters, resetFilters, updateFilterValue } = useDialogs({ table })

  const isDesktop = useMediaQuery("(min-width: 768px)")
  const columns = table.getAllColumns()?.filter((column) => column.getCanFilter() && column.getIsVisible())

  if (columns.length === 0) return null

  return (
    <UiSheet modal={false}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Sheet Filter
        </Button>
      </SheetTrigger>

      <SheetContent side={isDesktop ? "left" : "bottom"} className={cn("space-y-4 !max-w-fit")}>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <RenderFilters table={table} filters={filters} setFilters={setFilters} updateFilterValue={updateFilterValue} />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>

          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </SheetContent>
    </UiSheet>
  )
}
