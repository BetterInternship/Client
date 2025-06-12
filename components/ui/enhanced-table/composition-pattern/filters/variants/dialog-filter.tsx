"use client"

import { Button } from "@/components/ui/button"
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger, Dialog as UiDialog } from "@/components/ui/dialog"
import { MessageCircle } from "lucide-react"
import React from "react"
import { useTableContext } from "../../../table-context"
import { useDialogs } from "../hooks/use-advanced-filter"
import { RenderFilters } from "../render-fields"

export function Dialog() {
  const [open, setOpen] = React.useState(false)

  const { table } = useTableContext()
  const { filters, setFilters, applyFilters, resetFilters, updateFilterValue } = useDialogs({ table })

  return (
    <UiDialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageCircle className="w-4 h-4 mr-2" />
          Dialog Filter
        </Button>
      </DialogTrigger>

      <DialogContent className="!max-w-fit">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>

        <RenderFilters table={table} filters={filters} setFilters={setFilters} updateFilterValue={updateFilterValue} />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>

          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </DialogContent>
    </UiDialog>
  )
}
