"use client";

import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal } from "lucide-react";

/** Page section with a top toolbar and a bordered list container */
export function ListShell({
  toolbar,
  children,
  fullWidth = false,
}: {
  toolbar: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const container = fullWidth ? "w-full" : "max-w-7xl";
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-slate-50">
      <div className="border-b bg-white">
        <div className={`mx-auto w-full px-4 py-3`}>{toolbar}</div>
      </div>
      <div className={`mx-auto ${container} flex-1 overflow-auto px-4 py-4`}>
        <div className="rounded-md border bg-white shadow-sm">
          <ul className="divide-y">{children}</ul>
        </div>
      </div>
    </div>
  );
}

/** Compact text chip for secondary information */
export function Meta({ children }: { children?: React.ReactNode }) {
  const empty =
    children == null ||
    (typeof children === "string" && children.trim() === "") ||
    children == "Not specified";

  if (empty) return null;

  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-slate-600">
      {children}
    </span>
  );
}

export function LastLogin({ ts }: { ts?: number }) {
  if (!ts) return <Meta>last login: Never</Meta>;
  const d = new Date(ts);
  return (
    <Meta>
      last login:
      <time className="ml-1" dateTime={d.toISOString()}>
        {d.toLocaleDateString()}, {d.toLocaleTimeString()}
      </time>
    </Meta>
  );
}

/** Calm row card with hover actions and optional footer (e.g., editable tags) */
export function RowCard(props: {
  title: ReactNode;
  subtitle?: ReactNode;
  metas?: ReactNode;
  footer?: ReactNode;
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  more?: ReactNode;
  onClick?: () => void;
}) {
  const {
    title,
    subtitle,
    metas,
    footer,
    leftActions,
    rightActions,
    more,
    onClick,
  } = props;

  return (
    <li onClick={onClick} className="group px-4 py-3 hover:bg-slate-50">
      <div className="flex gap-3">
        <div className="">{leftActions}</div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-medium text-slate-800">{title}</div>
            {subtitle ? (
              <div className="truncate text-sm text-slate-500">{subtitle}</div>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {metas}
          </div>
          {footer ? <div className="mt-2">{footer}</div> : null}
        </div>

        <div className="hidden sm:flex items-center gap-1">
          {rightActions}
          {more ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                {more}
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/** Compact summary chip: "Students · 42 (showing 17)" + extras */
export function ListSummary({
  label,
  total,
  visible,
  extras,
}: {
  label: string;
  total: number;
  visible: number;
  extras?: React.ReactNode;
}) {
  const filtered = visible !== total;
  return (
    <span className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs text-slate-700 bg-white">
      <span className="font-medium">{label}</span>
      <span className="tabular-nums">
        {filtered ? (
          <>
            <span className="text-slate-500">·</span> {visible}{" "}
            <span className="text-slate-400">(of {total})</span>
          </>
        ) : (
          <>
            <span className="text-slate-500">·</span> {total}
          </>
        )}
      </span>
      {extras ? (
        <>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">{extras}</span>
        </>
      ) : null}
    </span>
  );
}
