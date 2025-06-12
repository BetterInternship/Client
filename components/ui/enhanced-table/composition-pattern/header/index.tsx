import { Button } from "@/components/ui/button"
import { TableHead, TableRow, TableHeader as UiTableHeader } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { type Header, flexRender } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpDown, ArrowUpIcon, GripHorizontal } from "lucide-react";
import type { CSSProperties } from "react"
import { useTableContext } from "../../table-context"
import { getAlignment, isSpecialId } from "../utils"
import { HeaderDropdown } from "./dropdown"

interface TableHeaderProps {
  variant?: "dropdown" | "default"
}

export function TableHeader({ variant = "default" }: TableHeaderProps) {
  const { table, enableColumnReorder, columnOrder } = useTableContext()

  return (
    <UiTableHeader className="bg-muted/50 sticky top-0 z-10">
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className="hover:bg-muted/60 transition-colors">
          {enableColumnReorder && columnOrder ? (
            <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
              {headerGroup.headers.map((header) => (
                <DraggableTableHeader key={header.id} header={header} variant={variant} />
              ))}
            </SortableContext>
          ) : (
            headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                style={{ width: header.getSize() }}
                className={cn(
                  getAlignment((header.column.columnDef.meta as { align?: string })?.align),
                  "py-3 px-4 font-semibold text-sm text-muted-foreground",
                  (header.column.columnDef.meta as { headerClassName?: string })?.headerClassName,
                )}
              >
                {header.isPlaceholder ? null : (
                  <div className={cn("flex items-center", (header.column.columnDef.meta as { headerClassName?: string })?.headerClassName)}>
                    {header.column.getCanSort() ? (
                      variant === "dropdown" ? (
                        <HeaderDropdown
                          column={header.column}
                          title={header.column.columnDef.header as string}
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => header.column.toggleSorting()}
                          className="-ml-4 h-4 data-[state=open]:bg-accent"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUpIcon className="ml-2 h-4 w-4" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDownIcon className="ml-2 h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      )
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </div>
                )}
              </TableHead>
            ))
          )}
        </TableRow>
      ))}
    </UiTableHeader>
  )
}

function DraggableTableHeader({
                                header,
                                variant,
                              }: {
  header: Header<unknown, unknown>
  variant?: "dropdown" | "default"
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
    id: header.column.id,
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition: "width transform 0.2s ease-in-out",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
    whiteSpace: "nowrap",
  }

  return (
    <TableHead
      ref={setNodeRef}
      colSpan={header.colSpan}
      style={style}
      {...attributes}
      className={cn(
        (header.column.columnDef.meta as { headerClassName?: string })?.headerClassName,
        getAlignment((header.column.columnDef.meta as { align?: string })?.align),
        "py-3 px-4 font-semibold text-sm text-muted-foreground"
      )}
    >
      <div className="flex items-center">
        {header.column.getCanSort() ? (
          variant === "dropdown" ? (
            <HeaderDropdown column={header.column} title={header.column.columnDef.header} />
          ) : (
            <Button
              variant="ghost"
              onClick={() => header.column.toggleSorting()}
              className="-ml-4 h-8 data-[state=open]:bg-accent"
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              <ArrowUpDown className="ml-2 h-4 w-4" />

              {!isSpecialId(header.column.id) && (
                <Button
                  variant="ghost"
                  className={cn("p-0 ml-2", isDragging ? "cursor-grabbing" : "cursor-grab")}
                  {...listeners}
                >
                  <GripHorizontal className="h-4 w-4" />
                </Button>
              )}
            </Button>
          )
        ) : (
          flexRender(header.column.columnDef.header, header.getContext())
        )}
      </div>
    </TableHead>
  )
}