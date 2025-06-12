import { Button } from "@/components/ui/button"
import { TableCell, TableRow, TableBody as UiTableBody } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { type Cell, type Row, flexRender } from "@tanstack/react-table"
import { Edit2 } from "lucide-react"
import React, { type CSSProperties, useState } from "react"
import { useTableContext } from "../../table-context"
import { getAlignment } from "../utils"
import { TableRowEditor } from "./row-editor"

interface TableBodyProps {
  customRowStyles?: (row: Row<any>) => string
  emptyStateMessage?: string
}

export function TableBody({ customRowStyles, emptyStateMessage }: TableBodyProps) {
  const [editingRowId, setEditingRowId] = useState<string | null>(null)

  const { table, updateData, enableEditing, columnOrder, enableColumnReorder, enableRowReorder, dataIds } =
    useTableContext()

  const handleEdit = (row: Row<any>) => {
    setEditingRowId(row.id)
  }

  const handleSave = (rowIndex: number, updatedData: any) => {
    updateData(rowIndex, updatedData)
    setEditingRowId(null)
  }

  const handleCancel = () => {
    setEditingRowId(null)
  }

  const renderRow = (row: Row<any>) => {
    const rowStyle = customRowStyles ? customRowStyles(row) : ""
    const depth = row.depth || 0

    if (editingRowId === row.id) {
      return (
        <TableRow key={row.id} className="bg-muted/50">
          <TableRowEditor row={row} onSave={handleSave} onCancel={handleCancel} />
        </TableRow>
      )
    }

    // @ts-ignore
    return (
      <React.Fragment key={row.id}>
        <TableRow
          data-state={row.getIsSelected() && "selected"}
          className={cn(rowStyle, "hover:bg-muted/50 transition-colors")}
        >
          {enableColumnReorder && columnOrder ? (
            <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
              {row.getVisibleCells().map((cell, cellIndex) => (
                <DraggableTableCell
                  key={cell.id}
                  cell={cell}
                  cellIndex={cellIndex}
                  depth={depth}
                  handleEdit={handleEdit}
                  enableEditing={enableEditing}
                  row={row}
                />
              ))}
            </SortableContext>
          ) : enableRowReorder && dataIds ? (
            <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
              {row.getVisibleCells().map((cell, cellIndex) => (
                <DraggableRow
                  key={cell.id}
                  cell={cell}
                  id={dataIds[row.index]}
                  cellIndex={cellIndex}
                  depth={depth}
                  handleEdit={handleEdit}
                  enableEditing={enableEditing}
                  row={row}
                />
              ))}
            </SortableContext>
          ) : (
            row.getVisibleCells().map((cell, cellIndex) => (
              <TableCell
                key={cell.id}
                className={cn(
                  getAlignment((cell.column.columnDef.meta as { align?: string })?.align),
                  "py-3 px-4",
                  (cell.column.columnDef.meta as { cellClassName?: string })?.cellClassName
                )}
              >
                <DefaultTableCell
                  cell={cell}
                  cellIndex={cellIndex}
                  depth={depth}
                  handleEdit={handleEdit}
                  enableEditing={enableEditing}
                  row={row}
                />
              </TableCell>
            ))
          )}
        </TableRow>
      </React.Fragment>
    )
  }

  return (
    <UiTableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => renderRow(row))
      ) : (
        <TableRow>
          <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
            {emptyStateMessage || "No data available"}
          </TableCell>
        </TableRow>
      )}
    </UiTableBody>
  )
}

interface DraggableTableCellProps {
  cell: Cell<any, any>
  cellIndex: number
  depth: number
  handleEdit: (row: Row<any>) => void
  enableEditing: boolean | undefined
  row: Row<any>
}

function DraggableTableCell({ cell, cellIndex, depth, handleEdit, enableEditing, row }: DraggableTableCellProps) {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    transition: "width transform 0.2s ease-in-out",
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <TableCell
      key={cell.id}
      style={style}
      ref={setNodeRef}
      className={cn(getAlignment(((cell.column.columnDef.meta as { align?: string })?.align)))}
    >
      <DefaultTableCell
        cell={cell}
        cellIndex={cellIndex}
        depth={depth}
        handleEdit={handleEdit}
        enableEditing={enableEditing}
        row={row}
      />
    </TableCell>
  )
}

interface DraggableRowProps {
  cell: Cell<any, any>
  id: string
  cellIndex: number
  depth: number
  handleEdit: (row: Row<any>) => void
  enableEditing: boolean | undefined
  row: Row<any>
}

function DraggableRow({ cell, id, cellIndex, depth, enableEditing, handleEdit, row }: DraggableRowProps) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
    width: cell.column.getSize(),
  }

  return (
    <TableCell
      key={cell.id}
      ref={setNodeRef}
      style={style}
      className={cn(getAlignment(((cell.column.columnDef.meta as { align?: string })?.align)))}    >
      <DefaultTableCell
        cell={cell}
        cellIndex={cellIndex}
        depth={depth}
        handleEdit={handleEdit}
        enableEditing={enableEditing}
        row={row}
      />
    </TableCell>
  )
}

interface DefaultTableCellProps {
  cell: Cell<any, any>
  cellIndex: number
  depth: number
  handleEdit: (row: Row<any>) => void
  enableEditing: boolean | undefined
  row: Row<any>
}

export function DefaultTableCell({ cell, cellIndex, depth, handleEdit, enableEditing, row }: DefaultTableCellProps) {
  return (
    <>
      {cellIndex === 0 ? (
        <div className="flex items-center" style={{ paddingLeft: `${depth * 2}rem` }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}

          {enableEditing && (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        flexRender(cell.column.columnDef.cell, cell.getContext())
      )}
    </>
  )
}
