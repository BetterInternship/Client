"use client";

import TabsNav from "@/components/features/hire/god/TabsNav";
import { ReactNode } from "react";

export default function GodLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TabsNav />
      {children}
    </div>
  );
}
