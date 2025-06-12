import dynamic from "next/dynamic"

const Simple = dynamic(() => import("./variants/simple-filter").then((mod) => mod.Simple), { ssr: false })
const Sheet = dynamic(() => import("./variants/sheet-filter").then((mod) => mod.Sheet), { ssr: false })
const Dialog = dynamic(() => import("./variants/dialog-filter").then((mod) => mod.Dialog), { ssr: false })
const Clear = dynamic(() => import("./clear").then((mod) => mod.Clear), { ssr: false })

export const TableFilters = {
  Simple,
  Sheet,
  Dialog,
  Clear,
}
