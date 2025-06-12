import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ChevronDown, Download, File, FileText } from "lucide-react";
import { useTableContext } from "../../table-context";
import { isSpecialId } from "../utils";
import { parseDate } from "@/lib/utils";

interface Props {
  className?: string;
  fileNamePrefix?: string;
}

export function ExportTable({ className, fileNamePrefix }: Props) {
  const { table } = useTableContext();

  const exportData = (format: "pdf" | "csv", dataType: "visible" | "all") => {
    const columns = table.getAllColumns().filter((column) => {
      if (isSpecialId(column.id)) return false;
      const metaExport = (column.columnDef.meta as { export?: any })?.export;
      if (metaExport === false) return false;
      if (metaExport && typeof metaExport === "object") {
        if (format === "pdf" && metaExport.pdf === false) return false;
        if (format === "csv" && metaExport.csv === false) return false;
      }
      return true;
    });

    const headers = columns.map((column) => {
      const metaExport = (column.columnDef.meta as { export?: any })?.export;
      if (metaExport && typeof metaExport === "object") {
        if (format === "pdf" && metaExport.pdf?.header)
          return metaExport.pdf.header;
        if (format === "csv" && metaExport.csv?.header)
          return metaExport.csv.header;
      }
      const headerContent = column.columnDef.header;
      return typeof headerContent === "function"
        ? column.id
        : String(headerContent || column.id);
    });

    const rows = (
      dataType === "visible"
        ? table.getRowModel().rows
        : table.getCoreRowModel().rows
    ).map((row) => {
      return columns.map((column) => {
        const raw = row.getValue(column.id);
        const metaExport = (column.columnDef.meta as { export?: any })?.export;
        const formatStr = metaExport?.format;
        if (raw == null) return "";
        if (formatStr) {
          const date = new Date(raw as string);
          return isNaN(date.getTime())
            ? String(raw)
            : parseDate(date, formatStr);
        }
        return typeof raw === "object" ? JSON.stringify(raw) : String(raw);
      });
    });

    if (format === "pdf") exportToPDF(headers, rows);
    else exportToCSV(headers, rows);
  };

  const exportToPDF = (headers: string[], rows: string[][]) => {
    try {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [headers],
        body: rows,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185] },
        margin: { top: 20 },
      });
      doc.save(
        fileNamePrefix ? `${fileNamePrefix}_table_data.pdf` : "table_data.pdf",
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const exportToCSV = (headers: string[], rows: string[][]) => {
    try {
      const csvContent = [
        headers.join(","),
        ...rows.map((r) => r.join(",")),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          fileNamePrefix
            ? `${fileNamePrefix}_table_data.csv`
            : "table_data.csv",
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error generating CSV:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className}>
          <Download className="mr-2 h-4 w-4" />
          Export
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => exportData("pdf", "visible")}>
          <File className="mr-2 h-4 w-4" />
          Export Visible to PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportData("pdf", "all")}>
          <FileText className="mr-2 h-4 w-4" />
          Export All to PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => exportData("csv", "visible")}>
          <File className="mr-2 h-4 w-4" />
          Export Visible to CSV
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportData("csv", "all")}>
          <FileText className="mr-2 h-4 w-4" />
          Export All to CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
