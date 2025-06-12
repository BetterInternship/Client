import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Column, Table } from "@tanstack/react-table"
import type React from "react"
import { type ColumnFilter, type FilterType, filterTypes } from "./types"
import { detectValueType, getColumnFilterTypesByValue } from "./utils"

type UpdateFilterValueFn = (columnId: string, value: any) => void

function renderFilterInput(
  table: Table<any>,
  column: Column<any, unknown>,
  filter: ColumnFilter,
  updateFilterValue: UpdateFilterValueFn,
) {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id)
  const type = detectValueType(firstValue)

  console.log("type", type, firstValue)

  switch (type) {
    case "number":
      if (filter.type === "between") {
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              value={(filter.value as [number, number])?.[0] ?? ""}
              onChange={(e) =>
                updateFilterValue(column.id, [
                  e.target.value === "" ? null : Number(e.target.value),
                  (filter.value as [number, number])?.[1],
                ])
              }
              className="w-[100px]"
            />

            <Input
              type="number"
              value={(filter.value as [number, number])?.[1] ?? ""}
              onChange={(e) =>
                updateFilterValue(column.id, [
                  (filter.value as [number, number])?.[0],
                  e.target.value === "" ? null : Number(e.target.value),
                ])
              }
              className="w-[100px]"
            />
          </div>
        )
      }
      return (
        <Input
          type="number"
          value={(filter.value as number) ?? undefined}
          onChange={(e) => updateFilterValue(column.id, e.target.value === "" ? null : Number(e.target.value))}
          className="w-[200px]"
        />
      )

    case "date":
      if (filter.type === "dateBetween") {
        return (
          <div className="flex gap-2">
            <DatePicker
              date={(filter.value as [Date, Date])?.[0]}
              setDate={(date) => updateFilterValue(column.id, [date, (filter.value as [Date, Date])?.[1]])}
            />

            <DatePicker
              date={(filter.value as [Date, Date])?.[1]}
              setDate={(date) => updateFilterValue(column.id, [(filter.value as [Date, Date])?.[0], date])}
            />
          </div>
        )
      }
      return <DatePicker date={filter.value as Date} setDate={(date) => updateFilterValue(column.id, date)} />

    default:
      return (
        <Input
          value={(filter.value as string) ?? ""}
          onChange={(e) => updateFilterValue(column.id, e.target.value)}
          className="w-[200px]"
        />
      )
  }
}

interface RenderFiltersProps {
  table: Table<any>
  filters: ColumnFilter[]
  setFilters: React.Dispatch<React.SetStateAction<ColumnFilter[]>>
  updateFilterValue: UpdateFilterValueFn
}

export function RenderFilters({ table, filters, setFilters, updateFilterValue }: RenderFiltersProps) {
  const firstRow = table.getPrePaginationRowModel().rows?.[0]

  return (
    <div className="grid gap-4 py-4">
      {table
        .getAllColumns()
        .filter((column) => column.getCanFilter())
        .map((column) => {
          const sampleValue = firstRow ? firstRow.getValue(column.id) : null
          const filter = filters.find((f) => f.id === column.id)

          const availableFilterTypes = getColumnFilterTypesByValue(sampleValue, filter?.type)

          const currentFilter = filters.find((f) => f.id === column.id) || {
            id: column.id,
            value: "",
            type: availableFilterTypes[0] ?? "contains",
          }

          return (
            <div key={column.id} className="grid gap-2">
              <Label htmlFor={column.id}>{column.id}</Label>

              <div className="flex gap-2">
                <Select
                  value={currentFilter.type}
                  onValueChange={(value: FilterType) => {
                    setFilters((prev) => {
                      const filterIndex = prev.findIndex((f) => f.id === column.id)
                      const newFilter = { id: column.id, value: "", type: value }

                      return filterIndex >= 0
                        ? [...prev.slice(0, filterIndex), newFilter, ...prev.slice(filterIndex + 1)]
                        : [...prev, newFilter]
                    })
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter type" />
                  </SelectTrigger>

                  <SelectContent>
                    {availableFilterTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {filterTypes.find((f) => f.value === type)?.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {renderFilterInput(table, column, currentFilter, updateFilterValue)}
              </div>
            </div>
          )
        })}
    </div>
  )
}
