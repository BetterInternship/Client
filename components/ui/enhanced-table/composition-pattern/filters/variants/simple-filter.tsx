import { useTableContext } from "@/components/ui/enhanced-table/table-context"
import { Input } from "@/components/ui/input"

export function Simple() {
  const { table } = useTableContext()

  return (
    <div className="flex flex-wrap gap-2">
      {table
        .getAllColumns()
        .filter((column) => column.getCanFilter())
        .map((column) => (
          <Input
            key={column.id}
            placeholder={`Filter ${column.id}`}
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        ))}
    </div>
  )
}
