"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from "react";

const Context = createContext({ hidden: false, offset: 0, reveal: () => {} });
export const useNavigationBehavior = () => useContext(Context);

/** In charge of observing the actual shell scroller;
 * only publish threshold/direction changes. */
export function NavigationBehaviorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [hidden, setHidden] = useState(false);
  const [offset, setOffset] = useState(0);
  const previous = useRef(0);
  const anchor = useRef(0);
  const direction = useRef(0);
  const scroller = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") setHidden(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  const reveal = () => {
    setHidden(false);
    anchor.current = previous.current;
  };
  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const element = event.target;
    if (
      !(element instanceof HTMLElement) ||
      !element.closest("[data-student-scroll]") ||
      element.closest(
        '[role="dialog"], [role="menu"], [role="listbox"], [data-student-navigation]',
      )
    )
      return;
    if (element.scrollHeight <= element.clientHeight) return;
    if (scroller.current !== element) {
      scroller.current = element;
      previous.current = 0;
      anchor.current = 0;
      direction.current = 0;
    }
    const y = Math.max(
      0,
      Math.min(element.scrollTop, element.scrollHeight - element.clientHeight),
    );
    // Surface changes use a coarse offset, never a render on every scroll pixel.
    const bucket = Math.floor(y / 40) * 40;
    setOffset((old) => (old === bucket ? old : bucket));
    const nextDirection = Math.sign(y - previous.current);
    if (nextDirection && nextDirection !== direction.current) {
      anchor.current = previous.current;
      direction.current = nextDirection;
    }
    previous.current = y;
    const interacting =
      document.querySelector('[data-student-menu][data-state="open"]') ||
      (document.activeElement?.matches(":focus-visible") &&
        document.activeElement.closest("[data-student-navigation]"));
    if (y < 32 || interacting) {
      setHidden(false);
      return;
    }
    if (Math.abs(y - anchor.current) >= 16) setHidden(nextDirection > 0);
  };
  return (
    <Context.Provider value={{ hidden, offset, reveal }}>
      <div
        className="contents"
        onScrollCapture={onScroll}
        onFocusCapture={(event) => {
          if (
            (event.target as HTMLElement).closest("[data-student-navigation]")
          )
            reveal();
        }}
      >
        {children}
      </div>
    </Context.Provider>
  );
}
