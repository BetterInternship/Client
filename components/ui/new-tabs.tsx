/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-11-15 13:23:26
 * @ Modified time: 2025-11-15 14:01:07
 * @ Description:
 *
 * These will be the official tabs we will be using across the site.
 * ! The other tabs.tsx will be deprecated soon.
 */

"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";
import { Badge } from "./badge";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "text-muted-foreground inline-flex h-9 items-center justify-center border border-gray-300 bg-white rounded-[0.33em] overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group data-[state=active]:opacity-100 data-[state=active]:bg-white dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:hover:opacity-90",
        "bg-gray-200 opacity-70 inline-flex h-9 flex-1 items-center justify-center rounded-none! border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]",
        "focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:cursor-pointer hover:opacity-100 hover:bg-gray-200 transition-all",
        "w-fit px-8 z-50",
        className,
      )}
      {...props}
    >
      <Badge className="px-4 group-data-[state=active]:bg-blue-700/5 rounded-[1em] group-data-[state=active]:text-primary dark:group-data-[state=active]:text-primary-foreground bg-none border-none text-foreground dark:text-muted-foreground hover:cursor-pointer text-md">
        {props.children}
      </Badge>
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
