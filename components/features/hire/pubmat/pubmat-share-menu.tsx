"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Loader2, Share2 } from "lucide-react";
import { Button, cn } from "@betterinternship/components";

export interface ShareMenuItem {
  id: string;
  label: string;
  /** One short line under the label, when the action needs explaining. */
  hint?: string;
  icon: ReactNode;
  /** The lead action, tinted to stand out from the rest. */
  primary?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

/** Wide enough for a label and its hint, narrow enough for a phone. */
const PANEL_WIDTH = 288;
const GAP = 8;
/** Long enough to cross the gap between the button and the panel. */
const CLOSE_DELAY = 160;

/**
 * A big Share button whose options appear on hover (and on click, for touch
 * and keyboard). The panel is portalled and anchored to the button, so it
 * isn't clipped by the dashboard card or the modal's scroll area, and it flips
 * above the button when there isn't room below.
 */
export function ShareMenu({
  items,
  busy = false,
  disabled = false,
}: {
  items: ShareMenuItem[];
  busy?: boolean;
  disabled?: boolean;
}) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
  }>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  /** Whether opening should pull focus into the panel — a click, not a hover. */
  const focusPanel = useRef(false);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const cancelClose = useCallback(() => {
    if (timer.current === undefined) return;
    window.clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  // Moving from the button to the panel crosses a gap, so closing waits a beat
  // and the panel cancels it on the way in.
  const scheduleClose = useCallback(() => {
    cancelClose();
    timer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(PANEL_WIDTH, window.innerWidth - 24);
    const height = panelRef.current?.offsetHeight ?? 240;
    const roomBelow = window.innerHeight - rect.bottom;
    const roomAbove = rect.top;
    // Below unless that would clip and there's more room above.
    const below = roomBelow >= height + GAP || roomBelow >= roomAbove;
    const centred = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(
      Math.max(12, centred),
      window.innerWidth - width - 12,
    );
    setPos(
      below
        ? { left, width, top: rect.bottom + GAP }
        : { left, width, bottom: window.innerHeight - rect.top + GAP },
    );
  }, []);

  // The panel renders hidden first, so it can be measured before it shows.
  useEffect(() => {
    if (!open) {
      focusPanel.current = false;
      setPos(undefined);
      return;
    }
    const frame = requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
      // Escape closes the menu only, not the modal it sits in.
      event.preventDefault();
      event.stopPropagation();
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (!openRef.current) return;
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      // Swallow the click rather than let it land on what's behind the menu.
      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("click", onDocumentClick, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !focusPanel.current) return;
    focusPanel.current = false;
    panelRef.current?.focus();
  }, [open]);

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>(
        "[role='menuitem']:not(:disabled)",
      ) ?? [],
    );
    if (!buttons.length) return;
    event.preventDefault();
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : event.key === "ArrowDown"
            ? (at + 1 + buttons.length) % buttons.length
            : (at - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        size="lg"
        disabled={disabled || busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onMouseEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
        onBlur={(event) => {
          if (panelRef.current?.contains(event.relatedTarget)) return;
          scheduleClose();
        }}
        onClick={() => {
          focusPanel.current = true;
          setOpen(true);
        }}
        className="min-w-[10rem] gap-2"
      >
        {busy ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <Share2 aria-hidden="true" />
        )}
        <span>Share</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "transition-transform duration-150 motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </Button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-label="Share options"
            tabIndex={-1}
            onKeyDown={moveFocus}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            style={{
              position: "fixed",
              left: pos?.left ?? 0,
              top: pos?.top,
              bottom: pos?.bottom,
              width: pos?.width ?? PANEL_WIDTH,
              maxHeight: "min(22rem, calc(100dvh - 2rem))",
              visibility: pos ? "visible" : "hidden",
            }}
            className="z-[1100] overflow-y-auto rounded-[0.33em] border border-gray-200 bg-white p-1 shadow-xl outline-none"
          >
            {/* Listed bottom-up, so the lead action sits nearest the button. */}
            {[...items].reverse().map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-[0.33em] px-2.5 py-2 text-left transition-colors disabled:pointer-events-none disabled:opacity-40",
                  item.primary
                    ? "bg-primary/[0.06] text-primary hover:bg-primary/10"
                    : "text-gray-700 hover:bg-accent",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 [&_svg]:size-4",
                    item.primary ? "text-primary" : "text-gray-500",
                  )}
                >
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug">
                    {item.label}
                  </span>
                  {item.hint && (
                    <span
                      className={cn(
                        "mt-0.5 block text-xs leading-snug",
                        item.primary ? "text-primary/70" : "text-gray-500",
                      )}
                    >
                      {item.hint}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
