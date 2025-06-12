import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableCell } from "@/components/ui/table"
import type { Row } from "@tanstack/react-table"
import { useState } from "react"
import { isSpecialId } from "../utils"

interface TableRowEditorProps<TData> {
  row: Row<TData>
  onSave: (rowIndex: number, updatedData: TData) => void
  onCancel: () => void
}

export function TableRowEditor<TData>({ row, onSave, onCancel }: TableRowEditorProps<TData>) {
  const [editedData, setEditedData] = useState<Partial<TData>>({})

  const handleInputChange = (columnId: string, value: any) => {
    setEditedData((prev) => ({ ...prev, [columnId]: value }))
  }

  const handleSave = () => {
    onSave(row.index, { ...row.original, ...editedData } as TData)
  }

  return (
    <>
      {row.getVisibleCells().map((cell) => {
        const column = cell.column
        if (isSpecialId(column.id)) return <TableCell key={cell.id} />

        return (
          <TableCell key={cell.id} className="py-2 px-4">
            <Input
              value={String(editedData[column.id as keyof TData] ?? cell.getValue())}
              onChange={(e) => handleInputChange(column.id, e.target.value)}
              className="h-8 text-sm"
            />
          </TableCell>
        )
      })}

      <TableCell className="py-2 px-4">
        <div className="flex space-x-2">
          <Button onClick={handleSave} variant="outline" size="sm" className="h-8 px-3 text-xs">
            Save
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm" className="h-8 px-3 text-xs">
            Cancel
          </Button>
        </div>
      </TableCell>
    </>
  )
}
