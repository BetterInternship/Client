"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import React from "react";
import { TableProvider } from "../table-context";
import { filterRows } from "./filters/utils";
import type { TableRootProps } from "./types";
import { isSpecialId } from "./utils";

export function TableRoot<TData, TValue>(
  props: TableRootProps<TData, TValue>
) {
  const {
    data: propsData, // Renamed to avoid conflict with internal state
    columns,
    children,
    enableSelection,
    enableExpansion,
    enableEditing,
    enableColumnReorder,
    enableRowReorder,
    rowReorderKey,
  } = props;

  const isServerSide = props?.serverSide === true;
  const [internalTableData, setInternalTableData] = React.useState<TData[]>(propsData);

  React.useEffect(() => {
    setInternalTableData(propsData);
  }, [propsData]);


  // Pagination
  const [clientPaginationState, setClientPaginationState] = React.useState<PaginationState>(
    () => props.serverSide === false ? (props.initialData?.pagination || { pageIndex: 0, pageSize: 10 }) : { pageIndex: 0, pageSize: 10 }
  );
  const paginationState = isServerSide ? props?.initialData?.pagination : clientPaginationState;
  const onPaginationChangeHandler = isServerSide ? props?.initialData?.onPaginationChange : setClientPaginationState;

  // Sorting
  const [clientSortingState, setClientSortingState] = React.useState<SortingState>(
    () => props.serverSide === false ? (props.initialData?.sorting || []) : []
  );
  const sortingState = isServerSide ? (props?.initialData?.sorting || []) : clientSortingState;
  const onSortingChangeHandler = isServerSide ? (props?.initialData?.onSortingChange || (() => {})) : setClientSortingState;

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const dataForReactTable = (isServerSide && !enableRowReorder) ? propsData : internalTableData;

  const updateData = (rowIndex: number, updatedData: TData) => {
    setInternalTableData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = updatedData;
      return newData;
    });
    if (isServerSide) {
      console.warn("updateData called in serverSide mode. This updates local page data only. Implement mutation for persistence.");
    }
  };

  const dataIds = React.useMemo(
    () => internalTableData.map((item) => (item as any)[rowReorderKey!]), // Used for DND, always based on internalTableData
    [internalTableData, rowReorderKey]
  );

  const memoColumns = React.useMemo(() => {
    let newColumns = [...columns]

    if (enableSelection && enableExpansion) {
      newColumns = [
        {
          id: "select-expand",
          header: ({ table }) => (
            <div className="flex items-center">
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
              />
              <Button variant="ghost" size="sm" onClick={() => table.toggleAllRowsExpanded()}>
                {table.getIsAllRowsExpanded() ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
              {row.getCanExpand() && (
                <Button variant="ghost" size="sm" onClick={() => row.toggleExpanded()}>
                  {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        } as ColumnDef<TData, unknown>,
        ...newColumns,
      ]
    } else if (enableSelection && !enableExpansion) {
      newColumns = [
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        } as ColumnDef<TData, unknown>,
        ...newColumns,
      ]
    } else if (enableExpansion && !enableSelection) {
      newColumns = [
        {
          id: "expand",
          header: ({ table }) => (
            <Button variant="ghost" onClick={() => table.toggleAllRowsExpanded()}>
              {table.getIsAllRowsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ),
          cell: ({ row }) =>
            row.getCanExpand() ? (
              <Button variant="ghost" onClick={() => row.toggleExpanded()}>
                {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            ) : null,
          enableSorting: false,
          enableHiding: false,
        } as ColumnDef<TData, unknown>,
        ...newColumns,
      ]
    }

    if (enableRowReorder) {
      newColumns = [
        ...newColumns,
        {
          id: "reorder",
          header: () => null,
          cell: ({ row, table }) => !table.getIsSomeRowsExpanded() && <RowDragHandleCell rowId={row.id} />,
          enableSorting: false,
          enableHiding: false,
        } as ColumnDef<TData, unknown>,
      ]
    }

    return newColumns
  }, [columns, enableExpansion, enableSelection, enableRowReorder])

  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    memoColumns.map((column) => (enableColumnReorder && column.id && !enableRowReorder ? column.id! : "")).filter(Boolean)
  );

  const table = useReactTable({
    data: dataForReactTable,
    columns: memoColumns,
    getCoreRowModel: getCoreRowModel(),

    manualPagination: isServerSide,
    manualSorting: isServerSide,
    manualFiltering: isServerSide,

    pageCount: isServerSide ? props.initialData?.pageCount : undefined,

    onPaginationChange: onPaginationChangeHandler,
    onSortingChange: onSortingChangeHandler,

    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters, // For client-side filters
    onExpandedChange: setExpanded,
    onColumnOrderChange: setColumnOrder,

    getSortedRowModel: getSortedRowModel(), // Keep for client-side sorting
    getFilteredRowModel: getFilteredRowModel(), // Keep for client-side filtering
    getPaginationRowModel: getPaginationRowModel(), // Keep for client-side pagination
    getExpandedRowModel: getExpandedRowModel(),

    getSubRows: (row: any) => row.subRows,
    getRowId: rowReorderKey ? (row: any) => (row as any)[rowReorderKey!] : undefined,


    state: {
      pagination: paginationState,
      sorting: sortingState,
      rowSelection,
      columnFilters,
      expanded,
      columnOrder,
    },
    filterFns: {
      filterRows: filterRows,
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (isSpecialId(activeId) || isSpecialId(overId)) return;

    if (enableColumnReorder) {
      setColumnOrder((current) => {
        const oldIndex = current.indexOf(activeId);
        const newIndex = current.indexOf(overId);
        return arrayMove(current, oldIndex, newIndex);
      });
    }

    if (enableRowReorder) {
      setInternalTableData((prevData) => {
        const oldIndex = prevData.findIndex(item => (item as any)[rowReorderKey!] === activeId);
        const newIndex = prevData.findIndex(item => (item as any)[rowReorderKey!] === overId);
        if (oldIndex === -1 || newIndex === -1) {
          console.warn("Could not find items for reordering. Check rowReorderKey and data integrity.");
          return prevData;
        }
        return arrayMove(prevData, oldIndex, newIndex);
      });
      if (isServerSide) {
        console.warn("Row reorder in serverSide mode is local to the current page. Implement mutation for persistence.");
      }
    }
  }

  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

  const dndContextProps = {
    collisionDetection: closestCenter,
    onDragEnd: handleDragEnd,
    sensors: sensors,
  };

  let tableContent = (
    <TableProvider
      table={table}
      updateData={updateData}
      columnOrder={columnOrder}
      enableEditing={enableEditing}
      enableColumnReorder={!!enableColumnReorder}
      enableRowReorder={!!enableRowReorder}
      dataIds={enableRowReorder ? dataIds : undefined}
    >
      <div className="space-y-4">{children}</div>
    </TableProvider>
  );

  if (enableColumnReorder || enableRowReorder) {
    tableContent = (
      <DndContext
        {...dndContextProps}
        modifiers={enableColumnReorder && !enableRowReorder ? [restrictToHorizontalAxis] : (enableRowReorder ? [restrictToVerticalAxis] : undefined)}
      >
        {tableContent}
      </DndContext>
    );
  }

  return tableContent;
}

const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rowId,
  });
  const style = {
    transform: transform ? `translateY(${transform.y}px)` : undefined,
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as 'relative',
  };

  return (
    <Button
      ref={setNodeRef}
      style={style}
      variant="ghost"
      className={cn("p-0 touch-none", isDragging ? "cursor-grabbing" : "cursor-grab")}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </Button>
  );
};