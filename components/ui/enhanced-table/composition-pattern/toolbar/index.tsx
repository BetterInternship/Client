import dynamic from "next/dynamic"

const ExpandCollapse = dynamic(() => import("./expand-collapse").then((mod) => mod.ExpandCollapse), { ssr: false })
const ExportTable = dynamic(() => import("./export-pdf").then((mod) => mod.ExportTable), { ssr: false })
const ViewOptions = dynamic(() => import("./view-options").then((mod) => mod.ViewOptions), { ssr: false })

export const TableToolbar = {
  ExpandCollapse,
  ExportTable,
  ViewOptions,
}
