"use client";

import Link from "next/link";
import { LogOutIcon, MinusIcon, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn, isPathNameSame } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Group } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/ui/admin-panel/collapse-menu-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const [menuList, setMenuList] = useState<Group[]>(getMenuList());
  const currentPath = usePathname();
  const router = useRouter();
  const HandleLogout = async () => {
    toast.info("Logged out!");
    router.push("/");
  };
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Profile section
  const ProfileSection = (
    <>
      {isOpen ? (
        <div className="flex w-full items-center">
          <DropdownMenu
            open={profileDropdownOpen}
            onOpenChange={setProfileDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <div
                className="flex w-full cursor-pointer items-center rounded-md px-3 py-2 transition hover:bg-muted"
                tabIndex={0}
                onClick={(e) => {
                  // Only open dropdown if not clicking on settings icon
                  if (
                    (e.target as HTMLElement).closest(
                      ".profile-settings-icon",
                    ) ||
                    (e.target as HTMLElement).closest(
                      ".profile-dropdown-trigger",
                    )
                  ) {
                    return;
                  }
                  setProfileDropdownOpen((open) => !open);
                }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={undefined} alt={"Admin"} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="ml-3 min-w-0 flex-1">
                  <div className="flex flex-col space-y-1">
                    <span
                      className={"truncate text-sm font-medium text-foreground"}
                    >
                      John Doe
                    </span>
                    <span className={"text-xs text-muted-foreground"}>
                      School Admin
                    </span>
                  </div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={HandleLogout}
                className="flex items-center gap-2"
              >
                <LogOutIcon className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size={"icon"}
            className="profile-settings-icon ml-2"
            tabIndex={-1}
            type="button"
            aria-label="Settings"
            onClick={(e) => {
              e.stopPropagation();
              toast.info("Settings!");
            }}
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        // Collapsed: show avatar, clicking opens dropdown with options and logout
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="profile-dropdown-trigger flex w-full cursor-pointer justify-center py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} alt={"Admin"} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={() => toast.info("Settings!")}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={HandleLogout}
              className="flex items-center gap-2"
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="h-full w-full">
        <ul className="flex min-h-[calc(100vh-48px-36px-16px-32px)] flex-col items-start space-y-1 px-2 lg:min-h-[calc(100vh-32px-40px-32px)]">
          {menuList.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="max-w-[248px] truncate px-4 pb-2 text-sm font-medium text-muted-foreground">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <div className="flex w-full items-center justify-center">
                  <MinusIcon className="h-5 w-5" />
                </div>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map(
                (
                  {
                    href,
                    label,
                    icon: Icon,
                    active,
                    submenus,
                    has_notifications,
                    should_show,
                  },
                  index,
                ) =>
                  !submenus || submenus.length === 0
                    ? should_show && (
                        <div className="w-full" key={index}>
                          <TooltipProvider disableHoverableContent>
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={
                                    (active === undefined &&
                                      isPathNameSame(currentPath, href)) ||
                                    active
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  className="relative mb-1 h-10 w-full justify-start"
                                  asChild
                                >
                                  <Link
                                    href={href}
                                    className="relative flex w-full items-center"
                                  >
                                    <span
                                      className={cn(
                                        isOpen === false ? "" : "mr-4",
                                      )}
                                    >
                                      <Icon size={18} />
                                    </span>
                                    <p
                                      className={cn(
                                        "max-w-[200px] truncate",
                                        isOpen === false
                                          ? "-translate-x-96 opacity-0"
                                          : "translate-x-0 opacity-100",
                                      )}
                                    >
                                      {label}
                                    </p>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              {isOpen === false && (
                                <TooltipContent side="right">
                                  {label}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )
                    : should_show && (
                        <div className="w-full" key={index}>
                          <CollapseMenuButton
                            icon={Icon}
                            label={label}
                            active={
                              active === undefined
                                ? isPathNameSame(currentPath, href)
                                : active
                            }
                            submenus={submenus}
                            isOpen={isOpen}
                          />
                        </div>
                      ),
              )}
            </li>
          ))}
          <li className="flex w-full grow items-end">
            <div className="w-full">{ProfileSection}</div>
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}
