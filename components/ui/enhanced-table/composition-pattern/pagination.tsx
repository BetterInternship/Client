import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { useTableContext } from "../table-context"
import {cn} from "@/lib/utils";

interface TablePaginationProps {
  options?: number[]
  enableGoToPage?: boolean
  hideSelected?: boolean
  removeSelected?: boolean
  disabled?: boolean
}

export function TablePagination({ options = [10, 20, 30, 40, 50], enableGoToPage = true, hideSelected = true, removeSelected = false, disabled }: TablePaginationProps) {
  const { table } = useTableContext()
  const [pageInput, setPageInput] = useState("")

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value)
  }

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const pageNumber = Number.parseInt(pageInput, 10)
      if (!Number.isNaN(pageNumber) && pageNumber > 0 && pageNumber <= table.getPageCount()) {
        table.setPageIndex(pageNumber - 1)
        setPageInput("")
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-y-4 px-2 py-3 md:flex-row md:items-center md:justify-between md:gap-y-0">
      <div
        className={cn(
          "text-sm text-muted-foreground text-center md:text-left",
          "md:flex-1",
          hideSelected && "invisible",
          removeSelected && "hidden"
        )}
      >
        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>

      {/* Pagination Controls Wrapper */}
      <div className="flex flex-col items-center gap-y-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 md:items-center md:justify-end md:flex-nowrap md:gap-x-6 lg:gap-x-8">
        {/* Rows per page */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {options.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Go to page */}
        {enableGoToPage && (
          <div className="flex items-center space-x-2">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Input
              type="number"
              min={1}
              max={table.getPageCount()}
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputKeyDown}
              placeholder="Go to page"
              className="h-8 w-[120px]"
              disabled={disabled}
            />
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || disabled}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || disabled}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
