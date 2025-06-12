"use client";
import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/admin-panel/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <div className="relative flex items-center justify-center">
            <MenuIcon size={20} />
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col px-3 sm:w-72" side="left">
        <SheetHeader>
          <Button
            className="flex items-center justify-center pb-2 pt-1"
            variant="link"
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
              <Image
                key={"/misfits.png"}
                src={"/misfits.png"}
                alt="logo"
                width={30}
                height={30}
              />
              <SheetTitle
                className={cn(
                  "flex flex-col gap-0 font-bold text-black dark:text-white",
                  "max-w-[250px] whitespace-pre-wrap text-sm sm:text-base",
                )}
              >
                {process.env.NEXT_PUBLIC_DASHBOARD_TITLE ||
                  "BetterInternship Dashboard"}
              </SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
