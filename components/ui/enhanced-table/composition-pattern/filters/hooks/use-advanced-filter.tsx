"use client"

import type { Table } from "@tanstack/react-table"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import type { ColumnFilter, FilterType } from "../types"
import { getColumnFilterTypesByValue } from "../utils"

interface UseDialogsProps<TData> {
  table: Table<TData>
}

export function useDialogs<TData>({ table }: UseDialogsProps<TData>) {
  const [filters, setFilters] = React.useState<ColumnFilter[]>([])

  const searchParams = useSearchParams()

  React.useEffect(() => {
    const urlFilters = JSON.parse(searchParams.get("filters") || "[]")
    setFilters(urlFilters)
  }, [searchParams])

  const handleChangeSearchParams = React.useCallback(
    (filters: ColumnFilter[]) => {
      const queryString = new URLSearchParams(searchParams)
      queryString.set("filters", JSON.stringify(filters))
      window.history.replaceState({}, "", `${window.location.pathname}?${queryString}`)
    },
    [searchParams],
  )

  const applyFilters = React.useCallback(() => {
    for (const filter of filters) {
      const column = table.getColumn(filter.id)
      if (column) {
        column.setFilterValue({ value: filter.value, type: filter.type })
      }
    }
    handleChangeSearchParams(filters)
  }, [filters, handleChangeSearchParams, table])

  const resetFilters = React.useCallback(() => {
    table.resetColumnFilters()
    setFilters([])
    handleChangeSearchParams([])
  }, [table, handleChangeSearchParams])

  const updateFilterValue = React.useCallback(
    (columnId: string, value: any) => {
      setFilters((prev) => {
        const existingFilter = prev.find((f) => f.id === columnId)
        if (existingFilter) return prev.map((f) => (f.id === columnId ? { ...f, value } : f))

        const sampleValue = table.getPrePaginationRowModel().rows?.[0]?.getValue(columnId)
        const availableFilterTypes = getColumnFilterTypesByValue(sampleValue)
        const defaultType = availableFilterTypes[0]

        return [...prev, { id: columnId, type: defaultType, value }]
      })
    },
    [table],
  )

  const updateFilterType = React.useCallback((columnId: string, type: FilterType) => {
    setFilters((prev) => {
      const existingFilter = prev.find((f) => f.id === columnId)
      if (existingFilter) {
        return prev.map((f) => (f.id === columnId ? { ...f, type, value: "" } : f))
      }

      return [...prev, { id: columnId, type, value: "" }]
    })
  }, [])

  const getCurrentFilter = React.useCallback(
    (columnId: string, defaultType: FilterType) => {
      const foundFilter = filters.find((f) => f.id === columnId)
      if (foundFilter) return foundFilter
      return { id: columnId, value: "", type: defaultType }
    },
    [filters],
  )

  return {
    filters,
    setFilters,
    applyFilters,
    resetFilters,
    updateFilterValue,
    updateFilterType,
    getCurrentFilter,
  }
}
