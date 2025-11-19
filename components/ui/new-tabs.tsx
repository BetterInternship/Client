/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-11-15 13:23:26
 * @ Modified time: 2025-11-15 18:57:51
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

function VerticalTabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-row gap-2", className)}
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
        "text-muted-foreground inline-flex h-9 items-center justify-center overflow-hidden rounded-[0.33em] border border-gray-300 bg-gray-100 bg-white",
        className,
      )}
      {...props}
    />
  );
}

function VerticalTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-orientation="vertical"
      className={cn(
        "text-muted-foreground items-left justify-top inline-flex flex-col overflow-hidden rounded-[0.33em] border border-gray-300 bg-gray-100",
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
        "group dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:bg-white data-[state=active]:opacity-100 data-[state=active]:hover:opacity-90",
        "inline-flex h-9 flex-1 items-center justify-center rounded-none! border border-transparent bg-gray-100 px-2 py-1 text-sm font-medium whitespace-nowrap opacity-70 transition-[color,box-shadow]",
        "transition-all hover:cursor-pointer hover:bg-gray-200 hover:opacity-100 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "z-50 w-fit px-8",
        className,
      )}
      {...props}
    >
      <Badge className="group-data-[state=active]:text-primary dark:group-data-[state=active]:text-primary-foreground text-foreground dark:text-muted-foreground text-md rounded-[1em] border-none bg-none px-4 py-[0.1em] group-data-[state=active]:bg-blue-700/5 hover:cursor-pointer">
        {props.children}
      </Badge>
    </TabsPrimitive.Trigger>
  );
}

function VerticalTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:bg-white data-[state=active]:opacity-100 data-[state=active]:hover:opacity-90",
        "justify-left inline-flex h-9 flex-1 items-center rounded-none! border border-transparent bg-gray-100 px-2 py-1 text-sm font-medium whitespace-nowrap opacity-70 transition-[color,box-shadow]",
        "transition-all hover:cursor-pointer hover:bg-gray-200 hover:opacity-100 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "px z-50 max-h-10 w-full",
        className,
      )}
      {...props}
    >
      <Badge className="group-data-[state=active]:text-primary dark:group-data-[state=active]:text-primary-foreground text-foreground dark:text-muted-foreground text-md rounded-[1em] border-none bg-none px-4 py-[0.1em] group-data-[state=active]:bg-blue-700/5 hover:cursor-pointer">
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

export {
  Tabs,
  VerticalTabs,
  TabsList,
  VerticalTabsList,
  TabsTrigger,
  VerticalTabsTrigger,
  TabsContent,
};
