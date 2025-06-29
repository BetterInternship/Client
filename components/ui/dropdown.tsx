/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-14 23:30:09
 * @ Modified time: 2025-06-28 04:39:08
 * @ Description:
 *
 * Stateful dropdown group component.
 */

import React, {
  useEffect,
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  Children,
} from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/ctx-app";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

/**
 * The group context interface.
 * What's available in the group context to other components.
 */
interface IDropdownGroupContext {
  active_dropdown: string;
  set_active_dropdown: (dropdown: string) => void;
}
const DropdownGroupContext = createContext<IDropdownGroupContext>(
  {} as IDropdownGroupContext
);

/**
 * A wrapper around the contents of a dropdown option.
 *
 * @component
 */
type IDropdownOptionProps = {
  children?: React.ReactNode;
  highlighted?: boolean;
  disabled?: boolean;
  href?: string;
  on_click?: () => void;
};
export const DropdownOption = ({ children }: IDropdownOptionProps) => {
  return <>{children}</>;
};

/**
 * Creates a standard button dropdowns must use with mobile optimization.
 * Not meant to be used elsewhere.
 *
 * @component
 */
const DropdownOptionButton = ({
  children,
  set_is_open,
}: {
  children: React.ReactElement<IDropdownOptionProps>;
  set_is_open: (is_open: boolean) => void;
}) => {
  const router = useRouter();
  const { is_mobile } = useAppContext();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      set_is_open(false);
      children.props.on_click && children.props.on_click();
      children.props.href && router.push(children.props.href);
    },
    [children.props, router, set_is_open]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      set_is_open(false);
      children.props.on_click && children.props.on_click();
      children.props.href && router.push(children.props.href);
    },
    [children.props, router, set_is_open]
  );

  return (
    <button
      className={cn(
        "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2",
        is_mobile ? "py-3 active:bg-gray-200 touch-manipulation" : "", // Larger touch targets on mobile
        children.props.highlighted ? "text-blue-500" : ""
      )}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="w-full">{children}</div>
    </button>
  );
};

/**
 * This component creates a context provider for dropdowns inside it to use.
 * The dropdowns inside can modify the active dropdown when they're clicked.
 * This way, only one dropdown in the group is active at a time.
 *
 * @component
 */
export const DropdownGroup = ({ children }: { children: React.ReactNode }) => {
  const [active_dropdown, set_active_dropdown] = useState("");
  const group_dropdown_context: IDropdownGroupContext = {
    active_dropdown,
    set_active_dropdown,
  };

  return (
    <DropdownGroupContext value={group_dropdown_context}>
      {children}
    </DropdownGroupContext>
  );
};

/**
 * This represents a single dropdown inside the group with mobile optimization.
 * Inherits the provided context (if there is none, that's fine).
 *
 * @component
 */
export const GroupableRadioDropdown = ({
  name,
  options,
  on_change,
  default_value = options[0],
  button_class = "",
  className = "",
}: {
  name: string;
  options: string[];
  on_change: (option: string) => void;
  default_value?: string;
  button_class?: string;
  className?: string;
}) => {
  const { is_mobile } = useAppContext();
  const { active_dropdown, set_active_dropdown } =
    useContext(DropdownGroupContext);
  const [is_open, set_is_open] = useState(false);
  const [value, set_value] = useState(default_value);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    target: EventTarget | null;
  } | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUpwards: false,
  });

  // Update dropdown position when it opens or button position changes
  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current && is_open) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 160; // Estimated max dropdown height (max-h-80 = 320px)

      // Prefer opening downwards, only open upwards if insufficient space below
      const shouldOpenUpwards =
        spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;

      setDropdownPosition({
        top: shouldOpenUpwards
          ? rect.top - (is_mobile ? 12 : 8) // Extra margin on mobile
          : rect.bottom + (is_mobile ? 12 : 8),
        left: is_mobile ? Math.max(16, rect.left) : rect.left, // Ensure margin from screen edge on mobile
        width: is_mobile
          ? Math.min(rect.width, window.innerWidth - 32)
          : rect.width, // Prevent overflow on mobile
        openUpwards: shouldOpenUpwards,
      });
    }
  }, [is_open, is_mobile]);

  // Update position when dropdown opens
  useEffect(() => {
    if (is_open) {
      updateDropdownPosition();

      // Also update on scroll/resize to keep dropdown positioned correctly
      const handlePositionUpdate = () => updateDropdownPosition();
      window.addEventListener("scroll", handlePositionUpdate, true);
      window.addEventListener("resize", handlePositionUpdate);

      return () => {
        window.removeEventListener("scroll", handlePositionUpdate, true);
        window.removeEventListener("resize", handlePositionUpdate);
      };
    }
  }, [is_open, updateDropdownPosition]);

  // Just so it's not stuck at the first default when the default changes
  useEffect(() => {
    set_value(default_value);
  }, [default_value]);

  // Close dropdown handler
  const closeDropdown = useCallback(() => {
    set_is_open(false);
  }, []);

  // Handle clicks outside dropdown for desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !is_mobile &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (is_open && !is_mobile) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [is_open, is_mobile, closeDropdown]);

  // Mobile touch handlers
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!is_mobile || !is_open) return;

      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        target: e.target,
      };
    },
    [is_mobile, is_open]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!is_mobile || !is_open || !touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const startTouch = touchStartRef.current;

      // Calculate touch movement
      const deltaX = Math.abs(touch.clientX - startTouch.x);
      const deltaY = Math.abs(touch.clientY - startTouch.y);
      const isSwipe = deltaX > 10 || deltaY > 10;

      // Check if touch is outside dropdown area
      const target = e.target as Element;
      const isOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);

      // Close if touch ended outside and wasn't a swipe
      if (!isSwipe && isOutsideDropdown) {
        closeDropdown();
      }

      touchStartRef.current = null;
    },
    [is_mobile, is_open, closeDropdown]
  );

  // Set up mobile touch listeners
  useEffect(() => {
    if (is_mobile && is_open) {
      document.addEventListener("touchstart", handleTouchStart);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [is_mobile, is_open, handleTouchStart, handleTouchEnd]);

  /**
   * Activates dropdown
   */
  const handle_click = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      set_is_open(!is_open);
      set_active_dropdown(name);
    },
    [is_open, name, set_active_dropdown]
  );

  /**
   * Changes dropdown value
   */
  const handle_change = useCallback(
    (option: (typeof options)[number]) => {
      set_value(option);
      on_change(option);
      set_is_open(false);
    },
    [on_change]
  );

  // Check if it's still the active dropdown
  useEffect(() => {
    if (active_dropdown !== name) set_is_open(false);
  }, [active_dropdown, name]);

  // Prevent event propagation for dropdown content
  const handleDropdownInteraction = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
    },
    []
  );

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        onClick={handle_click}
        onTouchEnd={(e) => e.stopPropagation()}
        className={cn(
          "flex items-center input-box justify-between",
          is_mobile
            ? "h-12 px-4 gap-2 w-full text-left bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 font-medium"
            : "h-auto py-3 px-3 gap-1 bg-transparent font-normal text-sm w-full",
          button_class
        )}
      >
        <span
          className={cn(
            "whitespace-nowrap truncate",
            is_mobile ? "text-sm" : "text-sm"
          )}
        >
          {value}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-600 transition-transform",
            is_open ? "rotate-180" : ""
          )}
        />
      </Button>

      {is_open && (
        <div
          className={cn(
            "fixed bg-white rounded-md shadow-xl overflow-hidden border border-gray-100",
            "z-[9999] duration-200 ease-out transition-all", // Add smooth animation
            dropdownPosition.openUpwards
              ? "animate-in slide-in-from-bottom-2"
              : "animate-in slide-in-from-top-2",
            is_mobile ? "min-w-full" : "min-w-[200px]",
            className
          )}
          onClick={handleDropdownInteraction}
          onTouchStart={handleDropdownInteraction}
          onTouchEnd={handleDropdownInteraction}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          <div
            className={cn(
              "max-h-64 overflow-y-scroll overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
              is_mobile ? "max-h-60" : "max-h-52" // Slightly taller on mobile for better UX
            )}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#9ca3af #f3f4f6",
            }}
          >
            {options.map((option, index) => (
              <DropdownOptionButton key={index} set_is_open={set_is_open}>
                <DropdownOption
                  highlighted={value === option}
                  on_click={() => handle_change(option)}
                >
                  {option}
                </DropdownOption>
              </DropdownOptionButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * This creates a dropdown menu for navigating with improved mobile support.
 *
 * @component
 */
export const GroupableNavDropdown = ({
  display,
  content,
  children,
  className = "",
  showArrow = true,
}: {
  display?: React.ReactNode;
  content?: React.ReactNode;
  children?:
    | React.ReactElement<IDropdownOptionProps>
    | React.ReactElement<IDropdownOptionProps>[];
  className?: string;
  showArrow?: boolean;
}) => {
  const { is_mobile } = useAppContext();
  const [is_open, set_is_open] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    target: EventTarget | null;
  } | null>(null);

  // Close dropdown handler
  const closeDropdown = useCallback(() => {
    set_is_open(false);
  }, []);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !is_mobile &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (is_open && !is_mobile) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [is_open, is_mobile, closeDropdown]);

  // Mobile touch handlers
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!is_mobile || !is_open) return;

      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        target: e.target,
      };
    },
    [is_mobile, is_open]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!is_mobile || !is_open || !touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const startTouch = touchStartRef.current;

      // Calculate touch movement
      const deltaX = Math.abs(touch.clientX - startTouch.x);
      const deltaY = Math.abs(touch.clientY - startTouch.y);
      const isSwipe = deltaX > 10 || deltaY > 10;

      // Check if touch is outside dropdown area
      const target = e.target as Element;
      const isOutsideDropdown =
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target);

      // Close if touch ended outside and wasn't a swipe
      if (!isSwipe && isOutsideDropdown) {
        closeDropdown();
      }

      touchStartRef.current = null;
    },
    [is_mobile, is_open, closeDropdown]
  );

  // Set up mobile touch listeners
  useEffect(() => {
    if (is_mobile && is_open) {
      document.addEventListener("touchstart", handleTouchStart);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [is_mobile, is_open, handleTouchStart, handleTouchEnd]);

  // Prevent event propagation for dropdown content
  const handleDropdownInteraction = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
    },
    []
  );

  // Toggle dropdown
  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      set_is_open(!is_open);
    },
    [is_open]
  );

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        className="flex items-center gap-2 h-10 px-4 bg-white border-gray-300 hover:bg-gray-50"
        onClick={handleButtonClick}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {display}
        {/* Conditionally render the chevron arrow */}
        {showArrow && (
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-600 transition-transform",
              is_open ? "rotate-180" : ""
            )}
          />
        )}
      </Button>

      {is_open && (
        <div
          className={cn(
            "absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50",
            is_mobile ? "w-56" : "w-48", // Slightly wider on mobile for better touch targets
            className
          )}
          onClick={handleDropdownInteraction}
          onTouchStart={handleDropdownInteraction}
          onTouchEnd={handleDropdownInteraction}
        >
          <div
            className={cn(
              "py-1 max-h-64 overflow-y-scroll overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
              is_mobile ? "max-h-80" : "max-h-64"
            )}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#9ca3af #f3f4f6",
            }}
          >
            {content}

            {Children.map(children, (child, index) => {
              return (
                <DropdownOptionButton key={index} set_is_open={set_is_open}>
                  {child ? child : <></>}
                </DropdownOptionButton>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
