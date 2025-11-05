/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-14 23:30:09
 * @ Modified time: 2025-10-31 18:13:16
 * @ Description:
 *
 * Stateful dropdown group component.
 */

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/ctx-app";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import React, {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDetectClickOutside } from "react-detect-click-outside";

/**
 * The group context interface.
 * What's available in the group context to other components.
 */
interface IDropdownGroupContext {
  activeDropdown: string;
  setActiveDropdown: (dropdown: string) => void;
}
const DropdownGroupContext = createContext<IDropdownGroupContext>(
  {} as IDropdownGroupContext,
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
  size = "xs",
}: {
  children: React.ReactElement<IDropdownOptionProps>;
  set_is_open: (is_open: boolean) => void;
  size?: "xs" | "sm" | "md" | "lg";
}) => {
  const router = useRouter();
  const { isMobile: is_mobile } = useAppContext();
  const [scrolling, setScrolling] = useState(false);
  const dropdown_button_ref = useRef<HTMLInputElement>({} as HTMLInputElement);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      set_is_open(false);
      children.props.on_click && children.props.on_click();
      children.props.href && router.push(children.props.href);
    },
    [children.props, router, set_is_open],
  );

  const onTouchStart = (e: any) => {
    e.stopPropagation();
    setScrolling(true);
  };

  const onTouchEnd = (e: any) => {
    e.stopPropagation();
    setScrolling(false);
  };

  useEffect(() => {
    const dropdown_button = dropdown_button_ref.current;
    if (!dropdown_button) return;

    // Attach passive touchstart handler
    dropdown_button.addEventListener("touchstart", onTouchStart, {
      passive: true,
    });

    dropdown_button.addEventListener("touchend", onTouchEnd, {
      passive: true,
    });

    // Cleanup on unmount
    return () => {
      dropdown_button.removeEventListener("touchstart", onTouchStart);
      dropdown_button.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchStart]);

  return (
    <button
      // @ts-ignore
      ref={dropdown_button_ref}
      className={cn(
        "w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2",
        is_mobile ? "py-3 active:bg-gray-200 touch-manipulation" : "",
        `text-${size}`,
        children.props.highlighted ? "text-blue-500" : "",
      )}
      onClick={(e) => !scrolling && handleClick(e)}
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
  const [activeDropdown, setActiveDropdown] = useState("");
  const group_dropdown_context: IDropdownGroupContext = {
    activeDropdown,
    setActiveDropdown,
  };

  return (
    <DropdownGroupContext value={group_dropdown_context}>
      {children}
    </DropdownGroupContext>
  );
};

interface IRadioDropdownOption<ID> {
  id: ID;
  name: string;
}

/**
 * This represents a single dropdown inside the group with mobile optimization.
 * Inherits the provided context (if there is none, that's fine).
 *
 * @component
 */
export const GroupableRadioDropdown = <ID extends number | string>({
  name,
  options,
  onChange,
  disabled,
  defaultValue = null,
  size = "sm",
  className = "",
  fallback = "Select option",
}: {
  name: string;
  options: IRadioDropdownOption<ID>[];
  onChange: (option: ID) => void;
  defaultValue?: ID | ID[] | null;
  disabled?: boolean | undefined;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  fallback?: string;
}) => {
  const { isMobile } = useAppContext();
  const { activeDropdown, setActiveDropdown } =
    useContext(DropdownGroupContext);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const ref = useDetectClickOutside({ onTriggered: () => setIsOpen(false) });

  // Just so it's not stuck at the first default when the default changes
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  /**
   * Activates dropdown
   */
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
      setActiveDropdown(name);
    },
    [isOpen, name, setActiveDropdown],
  );

  /**
   * Changes dropdown value
   */
  const handleChange = useCallback(
    (option: ID) => {
      setValue(option);
      onChange(option);
      setIsOpen(false);
    },
    [onChange],
  );

  // Check if it's still the active dropdown
  useEffect(() => {
    if (activeDropdown !== name) setIsOpen(false);
  }, [activeDropdown, name]);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        size={size}
        onClick={handleClick}
        onTouchEnd={(e) => e.stopPropagation()}
        className="w-full flex flex-row justify-between"
      >
        {(value || value === 0) && options.filter((o) => o.id === value)[0] ? (
          <span className="text-ellipsis overflow-hidden">
            {options.filter((o) => o.id === value)[0]?.name}
          </span>
        ) : (
          <span className="text-gray-500 font-normal">{fallback}</span>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-600 transition-transform",
            isOpen ? "rotate-180" : "",
          )}
        />
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute bg-white rounded-md shadow-xl overflow-hidden border border-gray-100",
            "z-[9999] duration-200 ease-out transition-all", // Add smooth animation
            isMobile ? "min-w-full" : "min-w-[200px]",
            className,
          )}
        >
          <div
            className={cn(
              "relative z-[100] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-64",
            )}
          >
            {options.map((option, index) => (
              <DropdownOptionButton
                key={index}
                set_is_open={setIsOpen}
                size={size}
              >
                <DropdownOption
                  highlighted={value === option.id}
                  on_click={() => handleChange(option.id)}
                >
                  {option.name}
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
  const { isMobile: is_mobile } = useAppContext();
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
    [is_mobile, is_open],
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
    [is_mobile, is_open, closeDropdown],
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
    [],
  );

  // Toggle dropdown
  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      set_is_open(!is_open);
    },
    [is_open],
  );

  return (
    <div className={cn("relative z-[100]", className)} ref={dropdownRef}>
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        className="relative flex items-center gap-2 h-12 px-3 z-[1000]"
        onClick={handleButtonClick}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {display}
        {showArrow && (
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-600 transition-transform",
              is_open ? "rotate-180" : "",
            )}
          />
        )}
      </Button>

      {is_open && (
        <div
          className={cn(
            "absolute right-0 mt-2 bg-white border border-gray-200 rounded-[0.33em] shadow-lg z-[1000]",
            is_mobile ? "w-56" : "w-48", // Slightly wider on mobile for better touch targets
            className,
          )}
          onClick={handleDropdownInteraction}
          onTouchStart={handleDropdownInteraction}
          onTouchEnd={handleDropdownInteraction}
        >
          <div
            className={cn(
              "relative py-1 z-[1000] max-h-64 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
              is_mobile ? "max-h-80" : "max-h-64",
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
